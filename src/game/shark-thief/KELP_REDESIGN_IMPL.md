# Kelp Redesign + Gas Bladder Pickup + Level 2 Seaweed
## Implementation Brief for Bob

**Status: AWAITING APPROVAL — do not build until approved**

---

## Summary of Changes

1. **Level 6 kelp visual overhaul** — sinuous stipe, alternating curved blades (80% opacity), hue-shifted brown-green palette, darker at root / lighter at tip
2. **Gas bladder pickup (Level 6)** — brown oval pickup attached to each kelp strand; worth 5 pts; collecting spawns a random neutral fish
3. **Level 2 nursery seaweed** — shorter version of current green seaweed (stipe only, no blades, no pickup), grows 30% up the canvas (~7 cells max height)

Ray reviewed the full codebase before this plan was written. Every issue Ray flagged is addressed below.

---

## Color Palette

Define this constant in `renderers.ts` at the top of the kelp section:

```typescript
const KELP_COLORS = {
  stipe: [
    "#3a3d0e",  // [0] root — dark olive-brown
    "#4a5212",  // [1] lower
    "#566118",  // [2] mid-lower
    "#647222",  // [3] mid-upper
    "#768530",  // [4] tip — yellow-green (lightest)
  ],
  blade: [
    "#3a4a12",  // [0] root blades
    "#4d601a",  // [1] mid blades
    "#647830",  // [2] tip blades
  ],
  bladeEdge: [
    "#4a5c1a",  // [0] root midrib
    "#607828",  // [1] mid midrib
    "#7a9038",  // [2] tip midrib
  ],
  bladder:      "#8b5e3c",
  bladderSheen: "#a87550",
};

// Level 2 seaweed keeps the original green palette
const SEAWEED_COLORS = {
  stipe: [
    "#1a5a1a",  // root
    "#2e8a2e",  // mid
    "#3daa3d",  // tip
  ],
};
```

---

## 1. `level-config.ts` Changes

### `KelpConfig` interface — add `colorMode` and `bladeEnabled` flags

```typescript
export interface KelpConfig {
  strandCount:    number;
  minHeight:      number;
  maxHeight:      number;
  swayPeriod:     number;
  bladeEnabled:   boolean;        // NEW — true for Depth 6, false for Depth 2
  bladderEnabled: boolean;        // NEW — true for Depth 6, false for Depth 2
  bladderPoints:  number;         // NEW — points awarded per bladder collect (Depth 6: 5)
  colorMode: "kelp" | "seaweed"; // NEW
}
```

### Depth 2 (NURSERY) — add `kelp` config

Inside the Depth 2 config object, add:

```typescript
kelp: {
  strandCount:    6,
  minHeight:      5,
  bladderPoints:  0,    // no bladder for Depth 2
  maxHeight:      7,    // ~30% of 25-row grid
  swayPeriod:     4000,
  bladeEnabled:   false,
  bladderEnabled: false,
  colorMode:      "seaweed",
},
```

### Depth 6 (PACIFIC) — update existing `kelp` config

```typescript
kelp: {
  strandCount:    10,
  minHeight:      19,
  maxHeight:      22,
  swayPeriod:     3000,
  bladeEnabled:   true,
  bladderEnabled: true,
  bladderPoints:  5,
  colorMode:      "kelp",
},
```

---

## 2. `state.ts` Changes

Inside the `gs` object, in the Depth 6 section, add two new fields:

```typescript
kelpBladders:    [] as { x: number; y: number }[],
kelpBladdersSet: new Set<string>(),
```

---

## 3. `spawn.ts` Changes

### 3a. `seedKelp()` — add bladder seeding at the end

After the existing kelp cell loop, append:

```typescript
// Seed one bladder per strand if bladderEnabled
gs.kelpBladders    = [];
gs.kelpBladdersSet = new Set();

if (cfg.bladderEnabled) {
  const strands = new Map<number, { x: number; y: number }[]>();
  for (const kc of gs.kelpCells) {
    if (!strands.has(kc.x)) strands.set(kc.x, []);
    strands.get(kc.x)!.push(kc);
  }
  let strandIdx = 0;
  for (const [col, cells] of strands) {
    // Deterministic height pick per strand using strand index
    const frac = 0.3 + ((col * 7 + strandIdx * 13) % 7) / 10; // 0.30–0.99
    const targetH = Math.round(frac * (cfg.maxHeight - 1)) + 1;
    // Find the cell closest to targetH
    const best = cells.reduce((a, b) =>
      Math.abs(a.height - targetH) < Math.abs(b.height - targetH) ? a : b
    );
    gs.kelpBladders.push({ x: best.x, y: best.y });
    gs.kelpBladdersSet.add(`${best.x},${best.y}`);
    strandIdx++;
  }
}
```

### 3b. Add `spawnSingleNeutralFish()` — extracted from `seedNeutralFish`

Ray confirmed no standalone fish-spawn function exists. Add this exported function below `seedNeutralFish`:

```typescript
export function spawnSingleNeutralFish(type: "mackerel" | "garibaldi" | "grouper"): void {
  const fishCfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!fishCfg) return;
  const spec = fishCfg[type];
  const size = spec.size;
  let fx = 0, fy = 0, attempts = 0;
  do {
    fx = Math.floor(Math.random() * (GRID - size + 1));
    fy = Math.floor(Math.random() * (GRID - size + 1));
    attempts++;
    if (attempts > 500) return;
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < 5 ||
    gs.neutralFish.some(f => {
      const fs = fishCfg[f.type].size;
      for (let dx = 0; dx < Math.max(size, fs); dx++)
        for (let dy = 0; dy < Math.max(size, fs); dy++)
          if (f.x + dx === fx && f.y + dy === fy) return true;
      return false;
    }) ||
    gs.pickups[fy]?.[fx] ||
    gs.coral[fy]?.[fx]
  );
  gs.neutralFish.push({ type, x: fx, y: fy, movesCounter: 0 });
}
```

---

## 4. `engine.ts` Changes

### 4a. Import `spawnSingleNeutralFish`

In the spawn import at the top of `engine.ts`, add `spawnSingleNeutralFish` to the import list.

### 4b. Reset bladder state in `teardownMechanic()`

In the block that resets `gs.kelpCells` and `gs.kelpSet` (around line 103), add:

```typescript
gs.kelpBladders    = [];
gs.kelpBladdersSet = new Set();
```

### 4c. Reset bladder state in `init()`

Find the full-reset block where `gs.kelpCells = []` and `gs.kelpSet = new Set()` are set. Add the same two lines immediately after.

### 4d. Fix the retry/rewind re-seed block (around line 884)

Replace:
```typescript
if (gs.currentDepth === PACIFIC_DEPTH) {
  seedNeutralFish();
  seedKelp();
}
```

With:
```typescript
const retryCfg = LEVEL_CONFIG[gs.currentDepth];
if (retryCfg.neutralFish) seedNeutralFish();
if (retryCfg.kelp) {
  gs.kelpBladders    = [];
  gs.kelpBladdersSet = new Set();
  seedKelp();
}
```

### 4e. Bladder pickup collection — in `moveShark()`

After the coin pickup block (around line 567–574), add:

```typescript
// Gas bladder pickup (Depth 6)
const bladderKey = `${nx},${ny}`;
if (gs.kelpBladdersSet.has(bladderKey)) {
  gs.kelpBladdersSet.delete(bladderKey);
  gs.kelpBladders = gs.kelpBladders.filter(b => !(b.x === nx && b.y === ny));
  gs.score += LEVEL_CONFIG[gs.currentDepth].kelp!.bladderPoints;
  gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
  spawnEnemy(); // spawn a regular enemy
  // Spawn a random neutral fish
  const fishTypes: Array<"mackerel" | "garibaldi" | "grouper"> = ["mackerel", "garibaldi", "grouper"];
  spawnSingleNeutralFish(fishTypes[Math.floor(Math.random() * fishTypes.length)]);
}
```

**Note:** The bladder check happens AFTER the neutral fish impassability check. This means: if a neutral fish is standing on the same cell as a bladder, the player will be blocked and cannot collect the bladder. This is acceptable behavior — fish naturally clear out; the bladder remains. No special handling needed.

### 4f. Prevent fish from camping bladder cells (optional but recommended by Ray)

In `moveNeutralFish()`, in the loop where fish pick new positions, add `gs.kelpBladdersSet.has(...)` to the blocking conditions so fish preferentially avoid bladder cells. This is a quality-of-life fix — not strictly required for correctness.

---

## 5. `renderers.ts` Changes

### 5a. Replace `drawKelp()` with new implementation

Delete the current `drawKelp()` function (lines 583–619) and replace with:

```typescript
function drawKelpBlade(
  ctx: CanvasRenderingContext2D,
  attachX: number,
  attachY: number,
  isLeft: boolean,
  bladeColor: string,
  edgeColor: string,
  CELL: number,
  swayBias: number,
): void {
  const bw  = Math.round(CELL * 0.72);
  const bh  = Math.round(CELL * 0.38);
  const dir = isLeft ? -1 : 1;
  const tipX = Math.round(attachX + dir * (bw + swayBias));
  const tipY = Math.round(attachY - bh);
  const cpX  = Math.round(attachX + dir * bw * 0.55);
  const cpY  = Math.round(attachY - bh * 1.5);
  const ucpX = Math.round(attachX + dir * bw * 0.3);
  const ucpY = Math.round(attachY - bh * 0.4);

  ctx.save();
  ctx.globalAlpha = 0.80;
  ctx.fillStyle = bladeColor;
  ctx.beginPath();
  ctx.moveTo(attachX, attachY);
  ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
  ctx.quadraticCurveTo(ucpX, ucpY, attachX, attachY);
  ctx.closePath();
  ctx.fill();

  // Midrib line
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.50;
  ctx.beginPath();
  ctx.moveTo(Math.round(attachX + dir * 2), attachY);
  ctx.quadraticCurveTo(
    Math.round(cpX - dir * Math.round(CELL * 0.08)),
    Math.round(cpY + bh * 0.2),
    Math.round(tipX - dir * Math.round(CELL * 0.08)),
    tipY,
  );
  ctx.stroke();
  ctx.restore();
}

function drawKelp(ctx: CanvasRenderingContext2D, CELL: number): void {
  const now = Date.now();
  const cfg = LEVEL_CONFIG[gs.currentDepth].kelp!;
  const swayPeriod  = cfg.swayPeriod;
  const maxH        = cfg.maxHeight;
  const isKelpMode  = cfg.colorMode === "kelp";
  const bladeEnabled = cfg.bladeEnabled;

  for (const kc of gs.kelpCells) {
    const px = kc.x * CELL;
    const py = kc.y * CELL;
    const tipFrac   = kc.height / maxH;
    const phase     = (now / swayPeriod) * Math.PI * 2 + kc.x * 0.8;
    const stipeSway = Math.sin(phase) * tipFrac * CELL * 0.28;
    const bladeSway = Math.sin(phase + 0.25) * tipFrac * CELL * 0.38;

    // Stipe color
    let stipeColor: string;
    if (isKelpMode) {
      const idx = Math.min(4, Math.floor(tipFrac * 5));
      stipeColor = KELP_COLORS.stipe[idx];
    } else {
      const idx = Math.min(2, Math.floor(tipFrac * 3));
      stipeColor = SEAWEED_COLORS.stipe[idx];
    }

    // Draw stipe segment
    const sw = Math.max(2, Math.round(CELL * 0.10));
    const sx = Math.round(px + CELL / 2 + stipeSway - sw / 2);
    ctx.globalAlpha = 0.90;
    ctx.fillStyle = stipeColor;
    ctx.fillRect(sx, Math.round(py), sw, CELL);

    // Selout: 1px lighter left edge
    if (isKelpMode) {
      const lighterIdx = Math.min(4, Math.floor(tipFrac * 5) + 1);
      ctx.fillStyle = KELP_COLORS.stipe[lighterIdx];
      ctx.globalAlpha = 0.40;
      ctx.fillRect(sx, Math.round(py), 1, CELL);
    }
    ctx.globalAlpha = 1;

    // Blades — every even height step
    if (bladeEnabled && kc.height % 2 === 0 && kc.height > 1) {
      const bladeIdx = tipFrac < 0.33 ? 0 : tipFrac < 0.66 ? 1 : 2;
      const isLeft   = (kc.height / 2) % 2 === 0;
      const attachX  = Math.round(px + CELL / 2 + stipeSway);
      const attachY  = Math.round(py + CELL * 0.5);
      drawKelpBlade(
        ctx, attachX, attachY, isLeft,
        KELP_COLORS.blade[bladeIdx],
        KELP_COLORS.bladeEdge[bladeIdx],
        CELL, bladeSway,
      );
    }
  }

  // Bladders (Depth 6 only)
  if (cfg.bladderEnabled) {
    for (const b of gs.kelpBladders) {
      if (!gs.kelpBladdersSet.has(`${b.x},${b.y}`)) continue; // already collected
      // Find sway at this cell
      const kc = gs.kelpCells.find(k => k.x === b.x && k.y === b.y);
      if (!kc) continue;
      const tipFrac   = kc.height / maxH;
      const phase     = (Date.now() / swayPeriod) * Math.PI * 2 + b.x * 0.8;
      const stipeSway = Math.sin(phase) * tipFrac * CELL * 0.28;

      const cx = Math.round(b.x * CELL + CELL / 2 + stipeSway + Math.round(CELL * 0.12));
      const cy = Math.round(b.y * CELL + CELL * 0.5);
      const rx = Math.max(3, Math.round(CELL * 0.14));
      const ry = Math.max(2, Math.round(CELL * 0.11));

      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = KELP_COLORS.bladder;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // 1px highlight
      ctx.fillStyle = KELP_COLORS.bladderSheen;
      ctx.fillRect(cx - Math.round(rx * 0.4), cy - Math.round(ry * 0.5), 1, 1);
      ctx.restore();
    }
  }
}
```

### 5b. Fix the `drawKelp` call gate (line ~826)

Replace:
```typescript
if (gs.currentDepth === PACIFIC_DEPTH && gs.kelpCells.length > 0) {
  drawKelp(ctx, CELL);
}
```

With:
```typescript
if (LEVEL_CONFIG[gs.currentDepth].kelp && gs.kelpCells.length > 0) {
  drawKelp(ctx, CELL);
}
```

---

## 6. Blade Overlap Guard (Ray's flag)

Ray flagged that with `strandCount: 10` and ±30% jitter, two adjacent strands could be only 1 cell apart, causing 72% cell-width blades to overlap significantly.

In `seedKelp()` in `spawn.ts`, after placing a strand column, add a guard:

```typescript
// Ensure at least 2-cell gap from previously placed strand
let col = Math.round(centerCol + jitter);
col = Math.max(0, Math.min(GRID - 1, col));
// If a kelp strand already exists within 1 cell, shift outward
while (gs.kelpCells.some(k => Math.abs(k.x - col) <= 1) && attempts < 10) {
  col = Math.min(GRID - 1, col + 1);
  attempts++;
}
```

Alternatively (simpler): reduce blade reach from 0.72 to 0.55 of CELL width. This gives visual separation even if strands are adjacent.

**Recommendation**: reduce blade reach to `CELL * 0.58` — it still reads as proper kelp blades at 20–30px cells, and eliminates the overlap concern without changing spawn logic.

---

## 7. Enemy Spawn Exclusion (Ray's flag)

Enemies can currently spawn on kelp cells (no `kelpSet` exclusion in `spawnEnemy()`). After adding bladders, enemies can also spawn on bladder cells, visually obscuring them.

In `spawnEnemy()` in `spawn.ts`, add to the blocking conditions:

```typescript
gs.kelpBladdersSet.has(`${ex},${ey}`) ||
```

This prevents enemies from spawning directly on uncollected bladders.

---

## Testing Checklist

- [ ] Level 6: Kelp renders with blades alternating left/right, brown-green gradient root→tip
- [ ] Level 6: Bladder oval visible on each strand, warm brown color, distinct from kelp
- [ ] Level 6: Collecting bladder awards 5 pts, spawns a random neutral fish, bladder disappears
- [ ] Level 6: Bladder correctly absent after collecting, reappears on depth restart
- [ ] Level 6: Kelp continues to render AFTER player sprite (player hidden inside kelp)
- [ ] Level 6: Blades sway slightly more than stipe; sway scales with height
- [ ] Level 2: Short green seaweed visible, grows ~30% up screen, no blades, no bladder
- [ ] Level 2: Seaweed does not block player movement (same as kelp — occupiable)
- [ ] Depth transitions: No stale bladder state after descending from Depth 6
- [ ] Full game restart: Bladder state cleanly reset
- [ ] Game over + retry at Depth 6: Bladders correctly re-seeded

---

## Files Changed

| File | Change |
|------|--------|
| `level-config.ts` | Add `bladeEnabled`, `bladderEnabled`, `colorMode` to `KelpConfig`; add Depth 2 kelp config; update Depth 6 kelp config |
| `state.ts` | Add `kelpBladders`, `kelpBladdersSet` to `gs` |
| `spawn.ts` | Extend `seedKelp()` to seed bladders; add `spawnSingleNeutralFish()`; add 2-cell separation guard |
| `engine.ts` | Add bladder reset to `teardownMechanic`, `init`, retry block; fix retry re-seed to use config-presence checks; add bladder collection in `moveShark`; import `spawnSingleNeutralFish` |
| `renderers.ts` | Replace `drawKelp()` with new implementation; add `KELP_COLORS` / `SEAWEED_COLORS` constants; fix draw gate to use config-presence check |
