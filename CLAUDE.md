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
- **Draw order in `renderers.ts`**: background → barriers/ice → pickups → enemies → clouds → player. Later = renders on top.
- **`initAtDepth(n)`** — dev jump that silently resets enemies (no dissolve animation). Used for "Start at Depth X" menu buttons.
- **`checkDepthTransition()`** — natural play path; calls `clearCloseEnemies()` which triggers dissolve animations.

### Depths — Current State

| Depth | Name | Signature mechanic | Status |
|-------|------|--------------------|--------|
| 1 | The Shallows | Ammonite (purple shell → big 2×2 enemy) | Complete |
| 2 | The Reef | Coral shells → permanent barrier walls | Complete |
| 3 | The Nursery | Shark eggs → baby shark chain | Complete |
| 4 | The Arctic | Ice patches + frozen fish (collect = slide) | Complete |
| 5 | Toxic | Toxic barrels → expanding gas clouds | Complete |
| 6 | The Abyss | Leviathan (3×3 mega enemy) | Stub |

### Terminology

- **Ammonite** — purple round shell pickup (Depth 1). Spawns a big enemy.
- **Coral shell** — cone shell pickup (Depth 2). Converts to a permanent barrier block.
- **Shark egg / mermaid's purse** — Depth 3 pickup. Spawns a baby shark that follows the player.
- **Baby shark** — follows 1 cell behind player. Enemy contact = −5 pts + blood cell.
- **Frozen fish** — Depth 4 pickup. Collecting it turns the tile to ice and triggers a slide.
- **Ice patch** — slippery tile; shark and enemies slide until hitting a wall or non-ice tile.
- **Toxic barrel** — Depth 5 pickup. Collecting it spawns an enemy and expands a toxic cloud.
- **Toxic cloud** — gas cells that cover the grid. Enemies and player cannot be seen inside. Enemies cannot spawn inside or within `cloudBuffer` tiles.
- **Leviathan** — 3×3 mega enemy. Moves every player move. Depth 6.
- **Big enemy** — 2×2 enemy. Depth 1 only. Spawned by ammonites.
- **`enemyKeep`** — how many normal enemies carry over into a depth on transition.
- **`descendScore`** — points to earn in a depth before descending (currently 100 all depths).
- **`centerSafeZone`** — square side length at board center where a pickup won't spawn.
- **`cloudBuffer`** — Manhattan distance around cloud cells excluded from enemy spawns.
- **`cloudSize`** — full width/height of each toxic cloud expansion (corners always removed).
- **Shark Score** — `SCORE² ÷ TIME`. Only valid for runs starting at Depth 1.

### Agent Workflow

- **Zak** — game design. Reads/writes `GAME_DESIGN.md`. Think player-first.
- **Ray** — code reviewer. Read-only. Used before shipping features.
- **Bob** — implementer. Reads, writes, runs commands.

Typical flow: Zak designs → Ray outlines a plan → Bob builds it.

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
| `"ocean"` | 1, 6 | Blue-teal, ~190° hue |
| `"tropical"` | 2 | Bright turquoise, ~178° hue |
| `"nursery"` | 3 | Ocean shifted cooler (G−10, B+8) |
| `"arctic"` | 4 | Icy light blue, ~200°, high lightness |
| `"toxic"` | 5 | Ocean shifted slightly green (~185°), murky |

To add a palette: add the color array + key to `TILE_PALETTES` in `config.ts`, add `"yourkey"` to the `TilePalette` union type, then use the key in `level-config.ts`.
