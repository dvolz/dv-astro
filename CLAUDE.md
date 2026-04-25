# CLAUDE.md — dv-astro

The primary project in this repo is **Shark Thief iOS** — a pixel-art arcade game built with Astro + TypeScript. All active work lives in `src/game/shark-thief/`.

---

## Project: Shark Thief iOS

A turn-based grid game where the player pilots a shark collecting treasure while enemies accumulate. 25×25 grid, one move per turn. Every pickup spawns an enemy.

### Key Files

| File | Purpose |
|------|---------|
| `level-config.ts` | **Single source of truth** for all per-depth tuning. Edit here first. |
| `config.ts` | Global constants, tile palette arrays, `DEPTH_META`, animation durations. |
| `engine.ts` | Game loop, input, depth transitions, pickup handlers, `init()` / `initAtDepth()`. |
| `renderers.ts` | All canvas draw functions. Draw order matters — later = on top. |
| `state.ts` | `gs` object — all mutable game state lives here. |
| `spawn.ts` | Enemy and pickup spawn logic. |
| `navigation.ts` | Screen switching, menu wiring, HUD button handlers. |
| `GAME_DESIGN.md` | Living design doc. Updated by Zak agent. |

### Architecture Patterns

- **`gs`** — the global game state object (imported from `state.ts`). Everything mutable lives on it.
- **`level-config.ts` is the only file to touch for tuning.** `engine.ts` and `spawn.ts` read from it — nothing is hardcoded.
- **`canvasBase`** — per-depth canvas fill color, set in `level-config.ts`, read in `renderers.ts`.
- **`tilePalette`** — key into `TILE_PALETTES` record in `config.ts`. Add new palettes there, reference by name in `level-config.ts`.
- **Draw order in `renderers.ts`**: background → barriers/ice → pickups → enemies → clouds → player. Later = renders on top. For Depth 6, `drawPacificLighting()` (depth gradient + sun rays) runs after the tile grid but before entities, then shimmer overlays everything.
- **`initAtDepth(n)`** — dev jump that silently resets enemies (no dissolve animation). Used for "Start at Depth X" menu buttons.
- **`checkDepthTransition()`** — natural play path; calls `clearCloseEnemies()` which triggers dissolve animations.

### Depths — Current State

| Depth | Name | Signature mechanic | Status |
|-------|------|--------------------|--------|
| 1 | The Shallows | Ammonite (purple shell → big 2×2 enemy) | Complete |
| 2 | The Nursery | Shark eggs → baby shark chain | Complete |
| 3 | Toxic | Toxic barrels → expanding gas clouds | Complete |
| 4 | Electric | Electric eels + shrimp | Complete |
| 5 | The Arctic | Ice patches + frozen fish (collect = slide) | Complete |
| 6 | The Busy Pacific | Neutral fish (mackerel/garibaldi/oarfish) + kelp | In Progress |
| 7 | The Reef | Coral shells → permanent barrier walls | Complete |
| 8 | The Abyss | Leviathan (3×3 mega enemy) | Stub |

### Terminology

- **Ammonite** — purple round shell pickup (Depth 1). Spawns a big enemy.
- **Coral shell** — cone shell pickup (Depth 5). Converts to a permanent barrier block.
- **Shark egg / mermaid's purse** — Depth 2 pickup. Spawns a baby shark that follows the player.
- **Baby shark** — follows 1 cell behind player. Enemy contact = −5 pts + blood cell.
- **Frozen fish** — Depth 4 pickup. Collecting it turns the tile to ice and triggers a slide.
- **Ice patch** — slippery tile; shark and enemies slide until hitting a wall or non-ice tile.
- **Toxic barrel** — Depth 3 pickup. Collecting it spawns an enemy and expands a toxic cloud.
- **Toxic cloud** — gas cells that cover the grid. Enemies and player cannot be seen inside. Enemies cannot spawn inside or within `cloudBuffer` tiles.
- **Neutral fish** — Depth 6 ambient creatures (mackerel, garibaldi, oarfish). Impassable — moving into one cancels the move. Fish cannot walk onto the shark's cell.
- **Mackerel** — silver-blue, size 1×1, moves every 2 player turns. Rendered at 55% cell height for a sleek torpedo silhouette.
- **Garibaldi** — vivid orange, size 1×1, moves every player turn (fastest). Always reliably blocks movement.
- **Oarfish** — disc-shaped sunfish (Mola mola), size 2×2, moves every 3 player turns.
- **Kelp** — Depth 6 terrain. Columns grow from the bottom upward (~85% canvas height). Distributed evenly across the board via `strandCount`; player can stand inside kelp (drawn on top to occlude the shark).
- **Leviathan** — 3×3 mega enemy. Moves every player move. Depth 7 (stub).
- **Big enemy** — 2×2 enemy. Depth 1 only. Spawned by ammonites.
- **`enemyKeep`** — how many normal enemies carry over into a depth on transition.
- **`descendScore`** — points to earn in a depth before descending (currently 100 all depths).
- **`centerSafeZone`** — square side length at board center where a pickup won't spawn.
- **`cloudBuffer`** — Manhattan distance around cloud cells excluded from enemy spawns.
- **`cloudSize`** — full width/height of each toxic cloud expansion (corners always removed).
- **`strandCount`** — number of kelp columns to seed in Depth 6. Columns are spread evenly across the grid width with ±30% jitter per zone.
- **Shark Score** — `SCORE² ÷ TIME`. Only valid for runs starting at Depth 1.

### Agent Workflow

- **Zak** — game design. Reads/writes `GAME_DESIGN.md`. Think player-first.
- **Ray** — code reviewer. Read-only. Used before shipping features.
- **Bob** — implementer. Reads, writes, runs commands.

Typical flow: Zak designs → Ray outlines a plan → Bob builds it.

**When the user requests a level reorder or new depth:** invoke the `/level-update` skill. It contains the full checklist of files to touch, what auto-derives vs. what's hardcoded, and the Ray → Bob workflow.

### Design Rules (don't violate these)

1. `level-config.ts` is the only file a designer touches to tune a depth.
2. Each depth has exactly one signature mechanic. It disappears entirely on descent.
3. Score is capped at `descendScore` per depth — excess is discarded.
4. Clouds draw last in `renderers.ts` so they naturally cover everything underneath.
5. `initAtDepth()` must silently reset enemies (no dissolve animation) — use array reset + fresh spawn, not `clearCloseEnemies()`.
6. The game background is always `var(--ocean-abyss)` — no per-depth CSS overrides on the wrapper.

### Palette Names

| Key | Depth | Feel |
|-----|-------|------|
| `"ocean"` | 1, 8 | Blue-teal, ~190° hue |
| `"nursery"` | 2 | Ocean shifted cooler (G−10, B+8) |
| `"toxic"` | 3 | Ocean shifted slightly green (~185°), murky |
| `"electric"` | 4 | Deep navy `#0a1430`. |
| `"arctic"` | 5 | Icy light blue, ~200°, high lightness |
| `"pacific"` | 6 | Mid blue `#2a8faa` range. `drawPacificLighting()` tints the top cyan-bright and the bottom deep navy at runtime — the palette is the base layer, the lighting is on top. |
| `"tropical"` | 7 | Bright turquoise, ~178° hue |

To add a palette: add the color array + key to `TILE_PALETTES` in `config.ts`, add `"yourkey"` to the `TilePalette` union type, then use the key in `level-config.ts`.
