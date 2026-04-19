# Toxic Palette Visual Update — Implementation Plan

---

## 1. Current State

### Toxic tile palette (`config.ts`, lines 37–40)
The `TOXIC_TILE_COLORS` array contains 10 hex colors in the `#1d84–#248e` range. These are `~185–188°` hue, same brightness as the ocean palette at depth 1, just shifted slightly toward green. The comment says "same brightness" — they are not darker than the shallows. The difference from ocean is subtle to the point of being nearly invisible unless you're directly comparing.

Ocean palette for reference (`TILE_COLORS`, lines 14–17): `#1d7e92` through `#207a8c`. Toxic shifts G and B up by ~6–10 counts compared to ocean, landing at `#1d8488`–`#248e8e`. Visually: a barely-noticeable green-teal cast with the same overall lightness.

### How tiles are drawn (`renderers.ts`, lines 516–519)
```
for (let r = 0; r < GRID; r++)
  for (let c = 0; c < GRID; c++) {
    ctx.fillStyle = gs.colors[r][c];
    ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
  }
```
`gs.colors` is a 25×25 array of hex strings, initialized once per depth entry in `setupMechanic()` (`engine.ts`, lines 105–107) by calling `randomColorFromPalette(cfg.tilePalette)` for each cell. The color is assigned at setup time and never changes during play. There is no per-cell "discolored" override mechanism.

### How the toxic barrel is rendered (`renderers.ts`, lines 252–293)
`drawToxicBarrel()` draws: dark outline rect, a rusty brown barrel body, three dark metal bands, a highlight stripe, a green leak line at the bottom, and a single green dot on the top face. No glow, no `shadowBlur`, no `ctx.shadowColor`. The function wraps in `ctx.save()` / `ctx.restore()`.

### How toxic clouds are rendered (`renderers.ts`, lines 297–349)
`drawToxicCloud()` fills each cloud cell `#88cc20`, optionally overlays a lighter `#ccff55` flash based on `pulseIntensity`, then draws two animating dots per cell using bit-shifted grid-seeded offsets. No shadow/glow either.

### Toxic depth in `level-config.ts`
Toxic is depth 3 (`TOXIC_DEPTH = 3`). `tilePalette: "toxic"`, `canvasBase: "#0a1f0a"`. The canvas base is already very dark green-black — that is the color behind the tile grid.

---

## 2. Proposed Changes

### 2a. Darker water palette

The existing `TOXIC_TILE_COLORS` is the same brightness as the ocean. The task asks for "slightly darker than the shallows palette — barely enough to look different."

The ocean palette (`TILE_COLORS`) sits around L≈35–37 (perceptual). To go slightly darker while keeping the green-teal hue, reduce all RGB channels by approximately 10–14 counts compared to the ocean palette values (not compared to the current toxic values).

**Replace `TOXIC_TILE_COLORS` in `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/config.ts` (lines 37–40) with:**

```typescript
export const TOXIC_TILE_COLORS = [
  "#186878", "#1c7278", "#166070", "#1a6e78", "#186a72",
  "#1c7278", "#146068", "#1a6870", "#186870", "#1a6470",
];
```

Rationale: Ocean averages `~#1e7e8e`. These new values average `~#196870` — roughly 14 counts lower across all channels. Hue stays at ~185–188° (green-teal). This will read as noticeably duller/darker than the shallows without changing the palette's character. The `canvasBase` of `#0a1f0a` (very dark) will show slightly more through smaller CELL sizes, reinforcing the murky look.

### 2b. Discolored water tiles near toxic waste

**Design decision: store discolored tile positions in `gs.colors` directly at setup time, using a separate "toxic discolor" palette blended in at fixed positions seeded by a per-cell deterministic hash.**

Do not add new state to `gs`. The `gs.colors` grid is already per-cell mutable state. The right approach is: when building `gs.colors` at toxic depth entry, for ~15–20% of cells use a discolored variant color instead of the normal palette. Seeding should be deterministic per grid position so the pattern does not re-randomize on redraws. Since `gs.colors` is initialized once in `setupMechanic` (and in `init`) and never mutated mid-depth except by explicit game events, this is stable for the lifetime of a depth.

**Add a new color array to `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/config.ts` after line 40:**

```typescript
// Toxic discolor variants — sickly off-hues applied to ~15% of tiles at depth entry.
// Mixes of muted yellow-green, olive, and brackish brown to imply contamination.
export const TOXIC_DISCOLOR_COLORS = [
  "#2a6a3a",  // murky green
  "#4a6a1a",  // olive
  "#3a6030",  // dark algae
  "#5a5a18",  // sour yellow-green
  "#2e5a28",  // swamp green
  "#486020",  // bile olive
];
```

**Modify `randomColorFromPalette` — do not change it.** Instead, add a new exported function below it in `config.ts`:

```typescript
export function buildToxicColorGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      // Deterministic per-cell: if hash lands in bottom 18% → discolored tile
      const hash = ((r * 31 + c * 17) ^ (r * 7)) & 0xff;
      if (hash < 46) { // 46/255 ≈ 18%
        return TOXIC_DISCOLOR_COLORS[hash % TOXIC_DISCOLOR_COLORS.length];
      }
      return TOXIC_TILE_COLORS[hash % TOXIC_TILE_COLORS.length];
    }),
  );
}
```

Using `hash % TOXIC_TILE_COLORS.length` instead of `Math.random()` ensures the color grid is reproducible and never re-randomizes mid-depth. The pattern will look pseudo-random visually because the hash mixes row and column.

**Modify `setupMechanic` in `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/engine.ts` (lines 105–107):**

Change:
```typescript
gs.colors = Array.from({ length: GRID }, () =>
  Array.from({ length: GRID }, () => randomColorFromPalette(cfg.tilePalette)),
);
```

To:
```typescript
import { buildToxicColorGrid, TOXIC_DEPTH } from "./level-config"; // add to imports if needed
// Actually import from config.ts since buildToxicColorGrid lives there.
```

The actual import is already `import { randomColorFromPalette } from "./config"` at line 18. Add `buildToxicColorGrid` to that import, then change the assignment:

```typescript
if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel) {
  gs.colors = buildToxicColorGrid(GRID, GRID);
} else {
  gs.colors = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => randomColorFromPalette(cfg.tilePalette)),
  );
}
```

**Also change the equivalent block in `init()` in `engine.ts` (lines 227–229):**

```typescript
// Currently:
gs.colors = Array.from({ length: GRID }, () =>
  Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
);
```

Depth 1 is never the toxic depth, so this branch never hits toxic at `init()`. No change needed for `init()` itself — `setupMechanic` handles the toxic depth entry from `checkDepthTransition` and `initAtDepth`. However, if you want to be safe: wrap the same `toxicBarrel` check here too, applying `buildToxicColorGrid` if `currentDepth` has `toxicBarrel`. Because `init()` always starts at depth 1, this is a no-op in practice but adds correctness.

**`loadGame` in `engine.ts` (around line 626):** `gs.colors` is restored directly from the save object as a flat slice. This means a resumed game will restore whatever was saved. No action needed — the discolored tiles will have been saved as part of `gs.colors` on a normal game, so they persist correctly on resume.

### 2c. Cartoon glow on toxic barrels and cloud cells

Canvas shadow state (`ctx.shadowColor`, `ctx.shadowBlur`) persists until reset. The pattern used elsewhere in the codebase is shown at the leviathan render (renderers.ts lines 661–665): set `shadowColor` and `shadowBlur` before drawing, then `shadowBlur = 0` after. Follow that exact pattern.

**Modify `drawToxicBarrel` in `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/renderers.ts` (lines 252–293).**

Inside the existing `ctx.save()` block, add the glow setup immediately before the first `fillRect` call (line 262), and clear shadow before `ctx.restore()`:

```typescript
// Add after ctx.save() and before the first fillRect (after line 257, before line 262):
ctx.shadowColor = "rgba(120, 220, 20, 0.85)";
ctx.shadowBlur  = Math.max(4, ps * 0.35);

// Add before ctx.restore() at the end (before line 293):
ctx.shadowBlur = 0;
ctx.shadowColor = "transparent";
```

`ps * 0.35` scales the glow to the cell size — at a typical CELL of ~20px, `ps` (which equals `CELL * 0.88`) is ~17.6, giving a blur of ~6px. At larger CELL sizes the glow scales up proportionally. `rgba(120, 220, 20, 0.85)` is a vivid yellow-green that reads as toxic without washing out the barrel's brown/rust colors.

**Modify `drawToxicCloud` in `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/renderers.ts` (lines 297–349).**

The cloud already has `ctx.save()` / `ctx.restore()`. Add the glow before the first `fillRect` at line 307 and clear it before `ctx.restore()`:

```typescript
// Add after ctx.save() (after line 303), before ctx.globalAlpha = 1.0 at line 305:
ctx.shadowColor = "rgba(136, 220, 20, 0.60)";
ctx.shadowBlur  = Math.max(3, CELL * 0.28);

// Add before ctx.restore() (before line 349):
ctx.shadowBlur = 0;
ctx.shadowColor = "transparent";
```

Cloud glow uses a lower alpha (0.60) than the barrel because clouds cover many cells and a strong glow multiplied across 12–21 cells would create a solid bright halo that obscures the playfield more than intended. The color `rgba(136, 220, 20, 0.60)` matches the cloud fill `#88cc20` so the glow reads as emanating from the cloud itself.

**Important:** `shadowBlur` causes the browser to composite each draw call against an offscreen buffer. On a 25×25 grid this is up to 625 cells of cloud at maximum density. At small CELL sizes (< 12px) the blur will be nearly invisible anyway. There is no performance concern for the barrel (max 4 on screen). For clouds at maximum density it may cause a frame-rate dip on low-end devices — if that's a concern, cap `shadowBlur` at a low value (e.g. `Math.min(CELL * 0.28, 5)`) to reduce the compositing area. The leviathan uses `shadowBlur = 18` without guards, so the codebase has already accepted this tradeoff.

---

## 3. Files Bob Will Touch

### `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/config.ts`
- **Lines 37–40**: Replace `TOXIC_TILE_COLORS` values with the darker palette listed in 2a.
- **After line 40**: Add `TOXIC_DISCOLOR_COLORS` array.
- **After line 55** (after `randomColorFromPalette` function): Add `buildToxicColorGrid` function.
- **Line 18** (import in engine.ts): No change to config.ts itself here — the import change is in engine.ts.

### `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/engine.ts`
- **Line 18**: Add `buildToxicColorGrid` to the `import { randomColorFromPalette } from "./config"` import.
- **Lines 105–107** (inside `setupMechanic`): Replace the flat `gs.colors` assignment with the conditional that calls `buildToxicColorGrid` when `cfg.toxicBarrel` is set.

### `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/renderers.ts`
- **`drawToxicBarrel` (around lines 257–293)**: Add `shadowColor` + `shadowBlur` after `ctx.save()`, clear before `ctx.restore()`.
- **`drawToxicCloud` (around lines 303–349)**: Add `shadowColor` + `shadowBlur` after `ctx.save()`, clear before `ctx.restore()`.

---

## 4. What NOT to Change

- **`spawn.ts`** — do not touch spawn logic, `cloudBuffer`, cloud expansion, or enemy spawn guards. The discolored tiles are purely cosmetic and do not represent any game object.
- **`level-config.ts`** — do not add any new fields to `DepthConfig` or `ToxicBarrelConfig`. The discolored tile logic is self-contained in `config.ts` and `engine.ts`.
- **`state.ts`** — do not add any new arrays or flags. `gs.colors` already stores per-cell color strings; the discolored tiles live there at setup time.
- **`TILE_PALETTES` record** — do not add `TOXIC_DISCOLOR_COLORS` to `TILE_PALETTES`. It is not a full palette and should never be passed to `randomColorFromPalette`. It is only used inside `buildToxicColorGrid`.
- **`TilePalette` union type** — do not add a new palette key.
- **Cloud mechanics** — `gs.toxicClouds`, cloud expansion on barrel collection, `cloudBuffer` spawn exclusion, `cloudPulse` animation — none of these are affected.
- **Gameplay logic in `engine.ts`** (`moveShark`, `endGame`, `checkDepthTransition`) — no changes.
- **Colorblind mode branch** in `draw()` (renderers.ts lines 502–510) — no changes. It clears and draws a grid outline only; the toxic tiles are not rendered in that mode anyway.
