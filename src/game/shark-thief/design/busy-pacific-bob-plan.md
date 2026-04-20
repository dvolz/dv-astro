# Busy Pacific — Bob's Implementation Plan

> Status: Ready for Bob
> Written by: Ray, 2026-04-19
> Based on: busy-pacific-proposal.md (all 10 questions resolved)
> Target: Depth 6 — "The Busy Pacific"

Work through these sections in order. Each section is self-contained but later sections depend on earlier ones being complete.

---

## 0. Scope Clarification Before You Start

**From the resolved proposal — kelp bulbs are OUT of scope.** The proposal's final "What to Throw Out" section explicitly removes kelp bulbs as a pickup. The original task prompt asked Ray to plan kelp bulb rendering — Ray is not including it because the design document explicitly discarded it. If Zak wants to revisit, that's a design conversation, not an implementation task.

**What is in scope:**
- Neutral fish (3 types): Mackerel, Grouper, Garibaldi
- Kelp terrain (static, visual-only, player sprite obscured when standing in kelp)
- Sunlight gradient background (lighter top, darker bottom)
- "Pacific" tile palette (similar to ocean, distinct enough to read as different)
- Depth sequence update: Leviathan/Abyss moves to Depth 7, Busy Pacific is Depth 6

---

## 1. config.ts Changes

**File:** `src/game/shark-thief/config.ts`

### 1a. New tile palette: "pacific"

The ocean palette sits at roughly hue 185-190°, blue-teal. Pacific should feel like the same ocean but slightly warmer and lighter — sunlit surface water, not deep reef. Shift hue toward 195° (more blue), increase lightness slightly, add more value variation to suggest filtered sunlight.

Add this array after `TILE_COLORS`:

```typescript
// Pacific kelp forest palette — sunlit surface water, brighter and slightly bluer than ocean (Depth 6)
// Hue ~195°, higher lightness range to suggest light filtering down through kelp.
export const PACIFIC_TILE_COLORS = [
  "#2a8faa", "#1e8aa8", "#2c94b0", "#2488a4", "#309aac",
  "#1a86a2", "#2890a8", "#228ca6", "#2e96ae", "#2084a0",
];
```

Add `"pacific"` to the `TilePalette` union type (line 42):
```typescript
export type TilePalette = "ocean" | "tropical" | "arctic" | "nursery" | "toxic" | "pacific";
```

Add to `TILE_PALETTES` record (after the `toxic` entry):
```typescript
pacific: PACIFIC_TILE_COLORS,
```

### 1b. DEPTH_META — add Depth 6 (Busy Pacific) and move Depth 7 (Abyss)

Current line 65 has `6: { color: "#9d6fe0", ..., name: "ABYSS" }`.

Replace the entire `DEPTH_META` block with:

```typescript
export const DEPTH_META: Record<number, { color: string; glow: string; name: string }> = {
  1: { color: "#48cae4", glow: "rgba(72,202,228,0.5)",   name: "THE SHALLOWS" },
  2: { color: "#e06fa0", glow: "rgba(224,111,160,0.5)",  name: "NURSERY" },
  3: { color: "#6abf3a", glow: "rgba(106,191,58,0.5)",   name: "TOXIC" },
  4: { color: "#7fd8f0", glow: "rgba(127,216,240,0.5)",  name: "ARCTIC" },
  5: { color: "#daa070", glow: "rgba(218,160,112,0.5)",  name: "REEF" },
  6: { color: "#48d4b8", glow: "rgba(72,212,184,0.5)",   name: "BUSY PACIFIC" },
  7: { color: "#9d6fe0", glow: "rgba(157,111,224,0.5)",  name: "ABYSS" },
};
```

The teal-green (#48d4b8) distinguishes Pacific from The Shallows' cyan (#48cae4) while staying in the ocean family.

---

## 2. level-config.ts Changes

**File:** `src/game/shark-thief/level-config.ts`

### 2a. New config interfaces

Add after `ToxicBarrelConfig` (around line 58) and before `DepthConfig`:

```typescript
export type NeutralFishType = "mackerel" | "grouper" | "garibaldi";

export interface NeutralFishSpecConfig {
  count:          number;  // how many of this species spawn at depth start
  speedDivisor:   number;  // fish moves once per N player moves (1 = every move, 2 = every 2 moves, etc.)
  size:           1 | 2;   // 1 = 1×1 tile, 2 = 2×2 tiles (Grouper only)
}

export interface NeutralFishConfig {
  mackerel:   NeutralFishSpecConfig;
  grouper:    NeutralFishSpecConfig;
  garibaldi:  NeutralFishSpecConfig;
}

export interface KelpConfig {
  cellCount:  number;  // total individual kelp cells to seed (not strands — raw cells)
  minHeight:  number;  // minimum cells per kelp column
  maxHeight:  number;  // maximum cells per kelp column
  swayPeriod: number;  // ms for one full sway cycle (purely visual, no gameplay effect)
}
```

Note on `speedDivisor`: This is simpler and more tuner-legible than a floating-point multiplier. `speedDivisor: 1` means moves every player turn (same as swarm speed when enemies move every 2 and shark moves every 1 — read the proposal; mackerel moves at "swarm speed" which in the engine means `moveCount % 2 === 0`. Use `speedDivisor: 2` to match that. Garibaldi moves at "shark speed" = every move = `speedDivisor: 1`. Grouper is "one slower than shark" = `speedDivisor: 2` same as mackerel or `speedDivisor: 3`). **Clarify with Zak before coding:** "same speed as swarm" means enemy speed (every 2 player moves). "Same speed as shark" means every player move. The proposal says mackerel = swarm speed, garibaldi = shark speed, grouper = one slower than shark. That means: mackerel speedDivisor 2, garibaldi speedDivisor 1, grouper speedDivisor 2 or 3. Pick 3 for grouper to make the hierarchy clear — it will visibly lag behind.

### 2b. Add to DepthConfig interface

Add to the `DepthConfig` interface (after `toxicBarrel?:`):

```typescript
neutralFish?: NeutralFishConfig;
kelp?:        KelpConfig;
```

### 2c. Add mechanic-presence constant

At the bottom of the file, add:

```typescript
export const PACIFIC_DEPTH = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].neutralFish))!;
```

### 2d. Depth 6 config block

Replace the current stub Depth 6 with:

```typescript
6: {
  // The Busy Pacific
  neutralFish: {
    mackerel:  { count: 3, speedDivisor: 2, size: 1 },
    grouper:   { count: 1, speedDivisor: 3, size: 2 },
    garibaldi: { count: 3, speedDivisor: 1, size: 1 },
  },
  kelp: {
    cellCount:  60,   // ~10% of grid; tune up/down to taste
    minHeight:  3,
    maxHeight:  10,
    swayPeriod: 3000, // 3s cycle
  },
  tilePalette:  "pacific",
  canvasBase:   "#0c4a5a",
  enemyKeep:    14,
  coinRate:     0.00025,
  coinInit:     0.05,
  descendScore: 100,
  minEnemyDist: 5,
},
```

### 2e. Depth 7 block (Leviathan/Abyss)

Add after the Depth 6 block:

```typescript
7: {
  tilePalette:  "ocean",
  canvasBase:   "#0f5262",
  enemyKeep:    5,
  coinRate:     0.00025,
  coinInit:     0.05,
  descendScore: 100,
  minEnemyDist: 5,
},
```

---

## 3. state.ts Changes

**File:** `src/game/shark-thief/state.ts`

### 3a. New interfaces

Add after the `BloodCell` interface (around line 19):

```typescript
export interface NeutralFish {
  type:      "mackerel" | "grouper" | "garibaldi";
  x:         number;
  y:         number;
  size:      1 | 2;       // 1×1 or 2×2
  moveAccum: number;      // counts player moves; fish moves when moveAccum >= speedDivisor
  dir:       "right" | "left" | "up" | "down";  // current facing, for sprite flip
}

export interface KelpCell {
  x:      number;
  y:      number;
  height: number;  // how many cells tall this kelp strand is (1 = short, maxHeight = tall)
}
```

### 3b. New gs fields

Add a new section to the `gs` object after the Toxic section (around line 84):

```typescript
// ── Depth 6 — Busy Pacific ───────────────────────────────────────────────
neutralFish:       [] as NeutralFish[],
kelpCells:         [] as KelpCell[],  // static for the run; seeded at depth start
kelpSet:           new Set<string>(), // "x,y" fast lookup — rebuilt when kelpCells changes
```

`kelpSet` is a fast lookup for collision and render checks. Rebuild it any time `kelpCells` changes (once at depth init, then never again since kelp is static).

---

## 4. spawn.ts Changes

**File:** `src/game/shark-thief/spawn.ts`

### 4a. Import additions

Add to the import from `./level-config`:
```typescript
import { LEVEL_CONFIG, PACIFIC_DEPTH } from "./level-config";
```

Add to the import from `./state`:
```typescript
import { gs, type Enemy, type BigEnemy, type NeutralFish } from "./state";
```

### 4b. Neutral fish spawn function

Add after `spawnToxicBarrelIfNeeded`:

```typescript
// ── Neutral fish (Depth 6 — Busy Pacific) ───────────────────────────────

export function seedNeutralFish(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!cfg) return;
  gs.neutralFish = [];

  const specs: Array<{ type: NeutralFish["type"]; spec: typeof cfg.mackerel }> = [
    { type: "mackerel",  spec: cfg.mackerel  },
    { type: "grouper",   spec: cfg.grouper   },
    { type: "garibaldi", spec: cfg.garibaldi },
  ];

  for (const { type, spec } of specs) {
    for (let i = 0; i < spec.count; i++) {
      let fx: number, fy: number, attempts = 0;
      do {
        fx = spec.size === 2
          ? Math.floor(Math.random() * (GRID - 1))
          : Math.floor(Math.random() * GRID);
        fy = spec.size === 2
          ? Math.floor(Math.random() * (GRID - 1))
          : Math.floor(Math.random() * GRID);
        attempts++;
        if (attempts > 1000) break;
      } while (
        Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
        gs.neutralFish.some(f => {
          if (spec.size === 2 || f.size === 2) {
            // conservative: any overlap in 2×2 footprint
            return Math.abs(f.x - fx) <= Math.max(f.size, spec.size) - 1 &&
                   Math.abs(f.y - fy) <= Math.max(f.size, spec.size) - 1;
          }
          return f.x === fx && f.y === fy;
        }) ||
        gs.pickups[fy]?.[fx] ||
        gs.coral[fy]?.[fx]   ||
        (spec.size === 2 && (gs.coral[fy]?.[fx+1] || gs.coral[fy+1]?.[fx] || gs.coral[fy+1]?.[fx+1]))
      );
      if (attempts <= 1000) {
        gs.neutralFish.push({
          type, x: fx, y: fy, size: spec.size, moveAccum: 0, dir: "right",
        });
      }
    }
  }
}
```

### 4c. Kelp seeding function

Add after `seedNeutralFish`:

```typescript
// ── Kelp terrain (Depth 6 — Busy Pacific) ───────────────────────────────

export function seedKelp(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].kelp;
  if (!cfg) return;
  gs.kelpCells = [];

  // Place kelp columns — each column is anchored at bottom of grid,
  // extends upward by a random height between minHeight and maxHeight.
  // cellCount controls the total raw cells placed; we place columns until
  // we've consumed approximately that budget.
  let placed = 0;
  let attempts = 0;
  while (placed < cfg.cellCount && attempts < 2000) {
    attempts++;
    const col = Math.floor(Math.random() * GRID);
    const height = cfg.minHeight + Math.floor(Math.random() * (cfg.maxHeight - cfg.minHeight + 1));
    // Anchor from bottom row upward
    const baseRow = GRID - 1;
    let colPlaced = 0;
    for (let h = 0; h < height && baseRow - h >= 0; h++) {
      const ky = baseRow - h;
      const kx = col;
      // Don't double-place on same cell
      if (!gs.kelpCells.some(k => k.x === kx && k.y === ky)) {
        gs.kelpCells.push({ x: kx, y: ky, height: h + 1 });
        colPlaced++;
      }
    }
    placed += colPlaced;
  }

  // Rebuild fast-lookup set
  gs.kelpSet = new Set(gs.kelpCells.map(k => `${k.x},${k.y}`));
}
```

**Gotcha with this approach:** kelp anchored at the bottom looks right visually. However, the `height` field on each `KelpCell` stores that cell's position within the strand (1 = bottom/root, maxHeight = tip). This is used by the renderer for tapering/color variation. Don't confuse it with the overall strand height.

**Alternative approach if the column-budget math gets messy:** just plant N individual columns with random heights, ignore the cellCount budget. Tune via strand count instead. Either works; the config field name would need updating to `strandCount`. Decide before coding.

### 4d. Update spawnEnemy to exclude neutral fish cells

In `spawnEnemy` (around line 190), add to the `do...while` exclusion:

```typescript
gs.neutralFish.some(f => {
  if (f.size === 2) {
    return ex >= f.x && ex <= f.x + 1 && ey >= f.y && ey <= f.y + 1;
  }
  return f.x === ex && f.y === ey;
}) ||
```

This prevents an enemy from spawning directly on top of a neutral fish.

---

## 5. engine.ts Changes

**File:** `src/game/shark-thief/engine.ts`

### 5a. Import additions

Add to the spawn imports on line 8:

```typescript
import { ..., seedNeutralFish, seedKelp } from "./spawn";
```

### 5b. teardownMechanic — add Pacific teardown

Add to `teardownMechanic` after the `toxicBarrel` block (around line 101):

```typescript
if (cfg.neutralFish || cfg.kelp) {
  gs.neutralFish = [];
  gs.kelpCells   = [];
  gs.kelpSet     = new Set();
}
```

### 5c. setupMechanic — add Pacific setup

Add to `setupMechanic` after the `ammonite` block (around line 146):

```typescript
if (cfg.neutralFish) seedNeutralFish();
if (cfg.kelp)        seedKelp();
```

### 5d. checkDepthTransition — update depth cap

**Critical:** Line 193 currently reads:

```typescript
if (gs.currentDepth >= 6) return;
```

This hard-codes the max depth as 6. With the Leviathan moving to Depth 7 and Busy Pacific at 6, you now have 7 depths. Change to:

```typescript
if (gs.currentDepth >= 7) return;
```

Also update line 235 which hard-codes Leviathan spawning at depth 6:

```typescript
if (gs.currentDepth === 6) spawnLeviathan();
```

Change to:

```typescript
if (gs.currentDepth === 7) spawnLeviathan();
```

### 5e. initAtDepth — update Leviathan spawn line

Line 761 currently reads:

```typescript
if (d === 6) spawnLeviathan();
```

Change to:

```typescript
if (d === 7) spawnLeviathan();
```

### 5f. init() — reset new gs fields

In `init()` (around line 290), add resets alongside the other per-depth resets:

```typescript
gs.neutralFish = [];
gs.kelpCells   = [];
gs.kelpSet     = new Set();
```

### 5g. Neutral fish movement — per player move

In `moveShark`, after the baby shark position update block and before the coin pickup check (roughly line 420), add:

```typescript
// Neutral fish movement (Depth 6 — Busy Pacific)
if (LEVEL_CONFIG[gs.currentDepth].neutralFish) {
  moveNeutralFish();
}
```

Then add the `moveNeutralFish` function (new private function inside engine.ts, before `moveShark`):

```typescript
function moveNeutralFish(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!cfg) return;

  const dirs: Array<[number, number]> = [[1,0],[-1,0],[0,1],[0,-1]];

  for (const fish of gs.neutralFish) {
    fish.moveAccum++;
    const spec = cfg[fish.type];
    if (fish.moveAccum < spec.speedDivisor) continue;
    fish.moveAccum = 0;

    // Shuffle directions; try each until one is valid
    const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dx, dy] of shuffled) {
      const nx = fish.x + dx;
      const ny = fish.y + dy;

      // Bounds check — fish never leave the board (proposal decision 5)
      if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) continue;
      if (fish.size === 2 && (nx + 1 >= GRID || ny + 1 >= GRID)) continue;

      // Coral barriers block fish
      if (gs.coral[ny]?.[nx]) continue;
      if (fish.size === 2 && (
        gs.coral[ny]?.[nx+1] || gs.coral[ny+1]?.[nx] || gs.coral[ny+1]?.[nx+1]
      )) continue;

      // Fish cannot pass through other neutral fish
      const fishBlocked = gs.neutralFish.some(other => {
        if (other === fish) return false;
        if (other.size === 2) {
          return nx >= other.x && nx <= other.x + 1 && ny >= other.y && ny <= other.y + 1;
        }
        if (fish.size === 2) {
          return other.x >= nx && other.x <= nx + 1 && other.y >= ny && other.y <= ny + 1;
        }
        return other.x === nx && other.y === ny;
      });
      if (fishBlocked) continue;

      // Fish can move — apply
      fish.x = nx;
      fish.y = ny;
      if (dx === 1)  fish.dir = "right";
      if (dx === -1) fish.dir = "left";
      if (dy === 1)  fish.dir = "down";
      if (dy === -1) fish.dir = "up";
      moved = true;

      // Fish eats coin — no enemy spawn, no score
      const footprint: Array<[number, number]> = fish.size === 2
        ? [[0,0],[1,0],[0,1],[1,1]]
        : [[0,0]];
      for (const [fdx, fdy] of footprint) {
        const cx = fish.x + fdx, cy = fish.y + fdy;
        if (gs.pickups[cy]?.[cx]) {
          gs.pickups[cy][cx] = false;
          // No enemy spawn, no score — that's the mechanic
        }
      }

      break;
    }
    // If no valid direction found, fish stays put this turn — that's fine
  }
}
```

**Architectural note:** Fish movement does not trigger `checkDepthTransition`, does not award score, and does not spawn enemies. That is the entire point of the mechanic. Do not add those calls here.

**Fish-on-shark collision is not needed in fish movement:** the shark collision with fish is handled as a movement block in `moveShark` (see 5h below). Fish moving into the shark's cell is a separate question — the proposal says fish are permanent obstacles that block the shark, but doesn't say fish bounce off the shark. For simplicity, allow fish to pass through the shark's current cell (enemies already walk through each other; fish can walk through the shark position without triggering death — fish are not enemies). This is the cleanest implementation and consistent with "fish are transparent to enemies."

### 5h. Shark-fish collision in moveShark

In `moveShark`, before the line that actually commits the move (before `gs.sharkPrevX = gs.shark.x`, around line 373), add:

```typescript
// Neutral fish: impassable (same rule as coral — move blocked)
if (gs.neutralFish.length > 0) {
  const blocked = gs.neutralFish.some(f => {
    if (f.size === 2) {
      return nx >= f.x && nx <= f.x + 1 && ny >= f.y && ny <= f.y + 1;
    }
    return f.x === nx && f.y === ny;
  });
  if (blocked) {
    // Update facing direction so the shark looks toward the fish
    if (dx === 1) gs.sharkDir = "right";
    else if (dx === -1) gs.sharkDir = "left";
    else if (dy === 1) gs.sharkDir = "down";
    else if (dy === -1) gs.sharkDir = "up";
    startBounceAnim(nx, ny);
    return;  // move cancelled — same as coral bump, no score, no enemy, no move counter increment
  }
}
```

This block must come **after** the coral barrier check and **after** the coral pickup (hardening) check, but **before** the position commit. Look at the existing coral checks around lines 353-371 to find the right insertion point. The fish bump intentionally does not call `saveGame()` since no state change occurred.

**Edge case:** the fish collision check uses `nx, ny` (the attempted destination) which is set at the top of `moveShark`. That's correct — same as how `gs.coral[ny][nx]` is checked.

### 5i. loadGame — reset Pacific state

In `loadGame` (around line 693), add after the ice/frozenFish resets:

```typescript
gs.neutralFish = [];
gs.kelpCells   = [];
gs.kelpSet     = new Set();
// Re-seed at depth if applicable — same pattern as ice patch re-seeding
if (gs.currentDepth === PACIFIC_DEPTH) {
  seedNeutralFish();
  seedKelp();
}
```

Import `PACIFIC_DEPTH` from `./level-config` in the engine.ts import line.

**Note:** Neutral fish positions are intentionally not saved/restored. They re-seed on load. This is the same decision made for ice patches (see the comment on line 692: "Always re-seed ice from config"). Fish positions are ephemeral within a run; re-seeding on load is acceptable and simpler than serializing fish state.

---

## 6. renderers.ts Changes

**File:** `src/game/shark-thief/renderers.ts`

### 6a. Import additions

Add to the level-config import:

```typescript
import { LEVEL_CONFIG, PACIFIC_DEPTH } from "./level-config";
```

### 6b. Sunlight gradient background

In `draw()`, inside the `else` branch (non-colorblind mode), after the canvas fill and before the tile loop (around line 539):

```typescript
// Depth 6 — sunlight gradient (lighter top, darker bottom)
if (gs.currentDepth === PACIFIC_DEPTH) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0,   "rgba(120, 220, 255, 0.18)");
  grad.addColorStop(0.5, "rgba(60,  160, 220, 0.08)");
  grad.addColorStop(1,   "rgba(0,   40,  80,  0.22)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

This draws over the `canvasBase` fill and under the tile grid. The tile grid is drawn next (the per-cell `ctx.fillRect` loop), so the gradient shows through the tile color variation subtly. If you want the gradient more visible, draw it **after** the tile loop instead.

### 6c. Kelp — draw order

Kelp draws before enemies and before the player — it is background terrain. The draw order as stated in CLAUDE.md is: background → barriers/ice → pickups → enemies → clouds → player. Kelp belongs between barriers/ice and pickups.

In `draw()`, after the ice patches block and before the blood cells block (around line 598), add:

```typescript
// Kelp (Depth 6 — Busy Pacific) — drawn before pickups/enemies/player so it's behind everything
if (gs.currentDepth === PACIFIC_DEPTH && gs.kelpCells.length > 0) {
  drawKelp(ctx, CELL);
}
```

**Important:** The proposal says "the shark is hidden from view when behind the kelp." The correct interpretation, given the draw order, is that kelp draws **over** the player's sprite to achieve the occlusion effect. This means kelp must actually be drawn in **two passes**: once before pickups (for the lower stalks), and once after the player (for the tips/tops). Otherwise the player will always appear on top.

The simpler implementation that respects the CLAUDE.md draw-order rule: draw kelp **after the player**, so kelp covers the player when they stand in a kelp cell. This is one draw pass and achieves the occlusion.

```typescript
// Kelp drawn AFTER player so it occludes the shark when standing in kelp cell
if (gs.currentDepth === PACIFIC_DEPTH && gs.kelpCells.length > 0) {
  drawKelp(ctx, CELL);
}
```

Place this after the `drawSharkOnCtx` call and before the toxic cloud block.

**Do not add a kelp draw before pickups as well** — single pass is sufficient if kelp draws over the player.

### 6d. drawKelp function

Add before the `draw()` function:

```typescript
function drawKelp(ctx: CanvasRenderingContext2D, CELL: number): void {
  const now = Date.now();
  const cfg = LEVEL_CONFIG[gs.currentDepth].kelp;
  const swayPeriod = cfg?.swayPeriod ?? 3000;

  for (const kc of gs.kelpCells) {
    const px = kc.x * CELL;
    const py = kc.y * CELL;

    // Sway: cells higher up (smaller height value = toward tip) sway more
    // kc.height is 1 at tip (tallest), maxHeight at root (bottom)
    // Wait — see the seedKelp note: height=1 is root, height=maxHeight is tip.
    // Sway amplitude increases toward the tip.
    const maxH = cfg?.maxHeight ?? 10;
    const tipFraction = kc.height / maxH;  // 0 at root, 1 at tip
    const swayAmp = tipFraction * CELL * 0.35;
    const swayOffset = Math.sin((now / swayPeriod) * Math.PI * 2 + kc.x * 0.8) * swayAmp;

    // Color: darker at root (bottom), brighter at tip — kelp forest palette
    const darkGreen  = "#1a5a1a";
    const midGreen   = "#2e8a2e";
    const brightGreen = "#3daa3d";
    const color = tipFraction < 0.33 ? darkGreen : tipFraction < 0.66 ? midGreen : brightGreen;

    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = color;
    // Slightly narrow rectangle with horizontal sway offset
    const kw = Math.max(2, CELL * 0.35);
    const kx = px + (CELL - kw) / 2 + swayOffset;
    ctx.fillRect(Math.round(kx), py, Math.round(kw), CELL);

    // Highlight edge for depth
    ctx.fillStyle = "rgba(100, 220, 100, 0.25)";
    ctx.fillRect(Math.round(kx), py, Math.max(1, Math.round(kw * 0.2)), CELL);

    ctx.restore();
  }
}
```

**Sway implementation note:** `Date.now()` is used here (same pattern as the shimmer in the tile loop at line 548). The sway updates every time `draw()` is called. There is no separate RAF for kelp sway — the existing draw loop handles it. This is correct: do not add another RAF.

**Note on height field:** Double-check the seed logic in section 4c. The plan sets `height: h + 1` where `h = 0` at the bottom (root) and `height - 1` at the tip. So height=1 is root and height=maxHeight is tip. The `tipFraction = kc.height / maxH` in the renderer assumes this. Make sure they match.

### 6e. Neutral fish sprites — placeholder approach during dev

Do not implement sprite rendering until Bob has run the `pixel-art-sprites` skill and has actual sprite data. During development, use colored placeholder rectangles:

```typescript
function drawNeutralFishPlaceholder(
  ctx: CanvasRenderingContext2D,
  fish: NeutralFish,
  CELL: number,
): void {
  const px = fish.x * CELL;
  const py = fish.y * CELL;
  const size = fish.size * CELL;

  // Placeholder colors — will be replaced by actual sprites
  const colors: Record<NeutralFish["type"], string> = {
    mackerel:  "#8ab0d8",  // silver-blue
    grouper:   "#a07848",  // earth-toned
    garibaldi: "#ff7020",  // vivid orange
  };

  ctx.save();
  ctx.fillStyle = colors[fish.type];
  ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
  // Simple direction indicator — a dot on the "head" side
  ctx.fillStyle = "#000000";
  const dotSize = Math.max(2, CELL * 0.15);
  const dotX = fish.dir === "right" ? px + size - dotSize - 2 : px + 2;
  const dotY = py + size / 2 - dotSize / 2;
  ctx.fillRect(dotX, dotY, dotSize, dotSize);
  ctx.restore();
}
```

### 6f. Neutral fish draw call — draw order

Neutral fish are solid obstacles that the player and enemies see. They should draw in the enemy layer — after pickups, before the player.

In `draw()`, after the big enemies block and before the Leviathan block (around line 691), add:

```typescript
// Neutral fish (Depth 6 — Busy Pacific)
if (gs.currentDepth === PACIFIC_DEPTH && gs.neutralFish.length > 0) {
  for (const fish of gs.neutralFish) {
    drawNeutralFishPlaceholder(ctx, fish, CELL);
  }
}
```

When real sprites are ready, replace `drawNeutralFishPlaceholder` with `drawNeutralFish`.

### 6g. Player occlusion by kelp — already handled

The kelp `drawKelp` call placed after `drawSharkOnCtx` (section 6c) handles this. No additional logic needed. The player sprite disappears under kelp cells when the shark occupies one. Enemies are drawn before the player and will also be visually covered by kelp — this is correct per the proposal ("kelp is purely visual and atmospheric").

---

## 7. What NOT to Change

Do not touch these:

- **`ai.ts` / `moveEnemiesAI`** — enemies pathfind through fish, ignore fish entirely. No changes needed. Fish are not in the enemy list; the AI only moves `gs.enemies` and `gs.bigEnemies`.
- **`collision.ts`** — no new collision types needed.
- **Coin spawn logic** — `coinRate` and `coinInit` work identically. Fish eat coins by clearing `gs.pickups[cy][cx]` in `moveNeutralFish`. No changes to coin growth in the main `moveShark` loop.
- **`slide.ts`** — no fish interaction with ice slide.
- **`persistence.ts`** — save format should not need changes since fish positions are re-seeded on load.
- **Depth CSS classes** — check `navigation.ts` or wherever `game-depth-wrapper depth-N` CSS classes are defined. If there are depth-specific CSS color rules for depths 1–6, you may need to add `depth-6` and `depth-7` classes (or renumber). Search the codebase for `.depth-6` to find this.

---

## 8. Depth Sequence Update — Hardcoded References Audit

Before shipping, search the entire codebase for hardcoded `6` references related to depth logic. Known locations:

- `engine.ts` line 193: `gs.currentDepth >= 6` — change to `>= 7` (done in 5d above)
- `engine.ts` line 235: `gs.currentDepth === 6` Leviathan spawn — change to `=== 7` (done in 5d)
- `engine.ts` line 761: `d === 6` in `initAtDepth` — change to `=== 7` (done in 5e)
- **Search for any CSS `.depth-6`** — if the HUD or wrapper uses numbered depth classes, add depth-7 styling and update depth-6 to Pacific's color
- **Search `navigation.ts`** for "Start at Depth 6" button or similar dev-jump buttons — update label and add Depth 7 if needed

Run this before marking the feature complete:
```
grep -rn "depth.*6\|=== 6\|>= 6\|<= 6" src/game/shark-thief/ --include="*.ts"
```

---

## 9. Architectural Risks and Gotchas

**Risk 1: Grouper 2×2 coin eating is incomplete without footprint check**

The `moveNeutralFish` coin-eating code uses a footprint array for size-2 fish. Verify that `gs.pickups[cy]?.[cx]` uses safe access (`?.`) since `cy` could be GRID-1+1 = 25 if the fish is at the bottom edge and size is 2. The size-2 bounds check in the movement code (`ny + 1 >= GRID`) prevents this, but double-check the math.

**Risk 2: Fish movement collides with enemies — not handled and shouldn't be**

Fish are transparent to enemies (proposal decision: "enemies move through fish"). This means `moveNeutralFish` does not check `gs.enemies` positions. Fish can occupy the same cell as an enemy. This is intentional. Do not add enemy-fish collision.

**Risk 3: `gs.kelpSet` consistency**

`kelpSet` is built once in `seedKelp` and never updated (kelp is static). If `teardownMechanic` clears `kelpCells` but doesn't clear `kelpSet`, the stale set will produce false-positive lookups on the next depth. The teardown block in section 5b clears both. Make sure no other code path clears one without the other.

**Risk 4: `checkDepthTransition` depth ceiling**

The ceiling change from `>= 6` to `>= 7` means a player can now reach Depth 7. The Depth 7 config block (Leviathan/Abyss) is currently a minimal stub. `spawnLeviathan` is now called at `d === 7`. Verify `initAtDepth` loops correctly up to `targetDepth` — it uses `for (let d = 2; d <= targetDepth; d++)`, which will naturally handle Depth 7 if a "Start at Depth 7" button is added.

**Risk 5: Fish random movement produces clustering**

With 7 fish on a 25×25 grid, pure random movement will cause fish to cluster in corners. Consider adding a bias toward the center or away from walls. This is a tuning issue, not a bug, but worth noting so Bob can flag it in playtesting.

**Risk 6: `loadGame` does not restore fish positions**

This is intentional (same as ice patches). Document it. If a player saves mid-run at Depth 6 and reloads, the fish re-seed at new positions. The mechanic still functions correctly; only the specific positions are lost. This is acceptable.

**Risk 7: `speedDivisor` accumulation across depth transitions**

`moveAccum` on each fish is reset to 0 at spawn. When transitioning away from Depth 6, `teardownMechanic` clears `gs.neutralFish = []`, which discards all fish including their accumulators. Clean.

**Risk 8: Sway uses `Date.now()` not `performance.now()`**

The existing shimmer in `draw()` uses `Date.now()` (line 548). Kelp sway uses the same. This is consistent. Do not use `performance.now()` here — it would break the pattern.

---

## 10. Sprites — Separate Task for Bob

After the mechanical implementation is complete and playing correctly with placeholders, generate sprites:

1. Use the `pixel-art-sprites` skill for all three fish
2. Target: Sega Genesis pixel art, 1×1 tile scale for Mackerel and Garibaldi, 2×2 for Grouper
3. Colors: Mackerel = silver-blue (#8ab0d8 range), Garibaldi = vivid orange (#ff7020 range), Grouper = earth-toned (#a07848 range)
4. Each sprite needs at least a right-facing and left-facing version (or implement canvas mirroring like the shark uses)
5. Once sprites exist, add a `drawNeutralFish` function and replace the placeholder call in `draw()`

The sprite work is blocked on mechanical correctness. Ship mechanics first.

---

## 11. Implementation Order

Work through in this sequence to keep the game in a runnable state at each step:

1. `config.ts` — add palette and DEPTH_META entry (no gameplay impact)
2. `level-config.ts` — add interfaces and config blocks including Depth 7 stub
3. `state.ts` — add interfaces and gs fields
4. `engine.ts` — update depth ceiling constants (lines 193, 235, 761) first, so Leviathan still spawns correctly
5. `spawn.ts` — add `seedNeutralFish` and `seedKelp`
6. `engine.ts` — add `moveNeutralFish`, teardown/setup hooks, init/loadGame resets, shark-fish collision
7. `renderers.ts` — add kelp draw, gradient, neutral fish placeholder draw
8. Playtest Depth 6 with placeholders
9. Run sprite generation, implement `drawNeutralFish`, replace placeholder
10. Audit for hardcoded `6` references (section 8)
