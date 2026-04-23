# Shark Thief — Game Design Document

> **Living document.** Updated by Zak as design decisions are made.
> Last updated: 2026-04-23 (Leaderboard redesign decisions recorded)

---

## Vision

A casual-to-strategic arcade game where you pilot a shark through a grid ocean, collecting treasure while staying alive as enemies multiply. Two audiences play the same game: someone who wants to grab coins and survive, and someone who wants to min-max their Shark Score. Neither should feel excluded.

**Tone:** Pixel-art, slightly retro-ocean vibe. Tense but not punishing. Every death should feel like your fault, not the game's.

---

## Core Loop

1. **Move** — one cell per turn (arrow keys or D-pad)
2. **Collect** — grab coins (+1 pt) or special shells (+variable pts)
3. **Enemy spawns** — every coin/shell collected spawns a new enemy
4. **Survive** — enemies move 1 step every 2 player moves, converging via Manhattan pathfinding
5. **Descend** — earn 100 pts within a depth to unlock the next one

The tension comes from the accumulating enemy count. Every point you earn makes the board harder. The player is always trading efficiency against safety.

---

## Depth System

Every depth is a fresh 100-point challenge. When a player earns 100 points within a depth, they descend. If they start Depth 2 and earn 100 more, they reach Depth 3 — and so on.

**Score cap (hard rule):** A player can score at most 100 points per depth. If they sit at 96 points and collect a 10-point piece, the score clamps to exactly 100 and the depth transition triggers immediately. The excess is discarded. This keeps depth transitions predictable and eliminates score-threshold confusion.

### Depth 1 — The Shallows

- Open ocean, no obstacles
- **Ammonite** (purple shell): worth 10 pts, spawns a 2×2 big enemy. Appears on a 25-move guaranteed timer (1 on board at a time)
- **Signature piece:** Ammonite / big enemy — exclusive to this depth. Neither appears in any later depth.
- **Goal:** Learn the core loop. Enemy count climbs fast — players discover that greed kills.
- **On entry:** There is no enemies present

### Depth 2 — The Nursery

- Open water
- **Shark egg** (mermaid's purse): worth 10 pts, hatches a **baby shark** that follows the player in a chain
- **Baby shark:** follows 1 cell behind. If an enemy touches it — -5 pts, blood cell appears and fades over 10 moves
- **Always 1 egg on board** — respawns immediately on collection
- **Signature piece:** Shark egg / baby shark — exclusive to this depth. Neither appears in later depths.
- **On entry:** 5 enemies present.
- **Design intent:** The baby is a liability that rewards you for collecting and punishes you if you ignore enemy positions. Emotional attachment to the chain is intentional.

### Depth 3 — Toxic

- **Toxic barrels:** collecting one spawns an enemy and expands a toxic cloud on the grid
- **Toxic cloud:** gas cells that cover the board. Neither enemies nor the player can be seen inside. Enemies cannot spawn inside or within `cloudBuffer` tiles of a cloud
- **Signature piece:** Toxic barrel / toxic cloud — exclusive to this depth
- **On entry:** 8 enemies present.
- **Design intent:** The cloud creates zones of imperfect information. The player knows where they are but not what's inside the cloud. Enemies can still path through clouds — it's not safe cover, it's a risk you can't fully read.

### Depth 4 — The Arctic

- **Ice patches:** Permanent slippery zones pre-seeded on the board in readable shapes (1x2, 1x3, 1x4, 2x2). Not random scatter — placed to create deliberate corridors and decision points.
- **Frozen fish collectible:** Worth 5 pts, always 1 on board at a time, respawns immediately on collection.
- **Signature piece:** Frozen fish / ice patches — exclusive to this depth.
- **Frozen fish collection — two-part consequence:** When the shark enters a frozen fish tile, the fish is collected (points awarded) AND that tile instantly becomes an ice patch. The shark then slides across the newly-created ice as part of the same move, continuing until it hits a wall or a non-ice tile. The player cannot interrupt the slide — they commit to the collection and its momentum simultaneously.
- **Enemy sliding:** Enemies follow the same ice rules as the shark. If an enemy steps onto an ice patch, it slides until it hits a wall or non-ice tile. This can work for or against the player.
- **On entry:** 5 enemies present.

### Depth 5 — The Reef

- **Coral barriers:** permanent impassable walls that reshape the board
- **Coral shells** (cone): worth 5 pts when touched, but convert _into_ a barrier and spawn 1 enemy. New shell every 15 moves (max 6 on board)
- **Signature piece:** Coral shell / coral barriers — exclusive to this depth. Coral is cleared entirely on descent. Neither shells nor barriers appear in later depths.
- **On entry:** 12 enemies present. 4 coral shell pickups seeded, ~2% of grid pre-coralled.
- **Design intent:** Force route planning. A board filling with walls changes pathfinding for both player and enemies. Strategic players use barriers to create chokepoints; reckless ones trap themselves.

### Depth 6 — The Busy Pacific

- **Neutral fish:** Three species of ambient fish roam the board. They are impassable — moving into one cancels the move with a bounce animation (same rule as coral barriers). Fish cannot walk onto the shark's cell.
  - **Mackerel** (silver-blue, 1×1): 4 on board, moves every 2 player turns. Sleek torpedo silhouette — rendered at 55% cell height so it reads as a fast, narrow fish.
  - **Garibaldi** (vivid orange, 1×1): 4 on board, moves every player turn. Fastest fish; always reliably blocks movement.
  - **Grouper** (earth-toned, 2×2): 2 on board, moves every 3 player turns. Slow and large — creates significant impassable zones.
- **Kelp:** Columns of seaweed grow from the bottom of the board upward, reaching ~85% of canvas height with slight per-column height variation. Controlled by `strandCount` in `level-config.ts` — columns are distributed evenly across the grid width with a small jitter so they feel organic but never cluster or leave huge gaps. The shark can stand inside kelp cells; kelp is drawn on top of the player to create an occlusion effect.
- **Signature piece:** Neutral fish + kelp — both exclusive to this depth and cleared on descent.
- **Visual design:** `drawPacificLighting()` runs every frame after the tile grid. It applies a depth gradient (light cyan at the surface fading to deep navy at the bottom) plus 7 animated sun ray wedges that converge from a focal point above the top-center. Rays carry a pale gold color near the surface transitioning to cool blue-white lower down, simulating sunlight filtering through water. The shimmer effect layers on top of this and still functions normally.
- **On entry:** 14 enemies present.
- **Design intent:** The fish are environmental obstacles you cannot collect — they move around, creating a board that shifts shape every turn. The kelp adds visual density and a hiding mechanic. Together they make the Pacific feel alive and crowded without adding a traditional "collect this, spawn that" loop.

### Depth 7 — The Abyss _(stub)_

- **Leviathan:** 3×3 mega enemy, always present
- **Shell:** TBD
- **Design intent:** The final known depth. The Leviathan's move rate and interaction with regular enemies is still being tuned.

---

## Scoring

### Total Points (shown as "TOTAL POINTS" on the game-over screen)

Raw points accumulated in a single run. Coins = 1 pt, ammonite = 10 pts, coral shell = 5 pts, shark egg = 10 pts. Baby shark eaten = -5 pts. Subject to the 100-point depth cap — no single depth can contribute more than 100 points to this total.

### High Score

Best single-run Total Points ever. Shown on the menu and leaderboard.

### Shark Score

```
SHARK SCORE = SCORE² ÷ TIME (seconds)
```

Rewards both skill (high score) and efficiency (low time). Doubling your score quadruples it; cutting time in half doubles it. Only eligible for runs starting at Depth 1 — mid-game jumps would inflate it unfairly.

**Tunable:** The exponent (currently 2) may adjust as the game grows.

**Game-over display:** The game-over screen shows both "TOTAL POINTS" (raw score) and "SHARK SCORE" (formula result). These will always be different numbers. To prevent player confusion, they must be labeled distinctly — "TOTAL POINTS" for the raw value, and "SHARK SCORE: [value] (POINTS² ÷ TIME)" as a brief explanation inline. Players who don't care about the formula will ignore it; players who do will learn it.

---

## Enemy AI

All enemies (regular, big, leviathan) use Manhattan-distance pathfinding: find the shortest axis-aligned path to the shark and step along it. They act independently — they converge from multiple directions as count grows.

- **Regular enemy (1×1):** moves every 2 player moves
- **Big enemy (2×2):** same AI, clamped to GRID-2, cannot overlap regular enemies or coral
- **Leviathan (3×3):** moves every player move (faster pressure)

---

## Player Experience Goals

- **Casual:** Move, grab shiny things, die, try again. The depth system is discoverable but not required to have fun.
- **Strategic:** Plan routes, manage enemy density, optimize Shark Score. Each depth adds a new constraint to master.
- **Emotional beats:** The baby shark chain in Depth 3 is intentionally designed to create attachment and grief. Blood cells are visceral but brief.

---

## Design Principles

1. **Every pickup has a cost.** Coins spawn enemies. Ammonites spawn big enemies. Coral shells create permanent walls. Nothing is free.
2. **Descending should feel earned.** 100 pts per depth is a meaningful hurdle. The counter resets — you can't coast on earlier points.
3. **Enemy density is the difficulty dial.** Rather than faster enemies or tighter grids, pressure comes from numbers. More enemies = less room to maneuver.
4. **Deaths should feel legible.** The player should always understand why they died — surrounded by enemies they spawned, trapped by a wall they created, or baby eaten while distracted.
5. **The board is shared with enemies.** Coral barriers block the player AND enemies. Strategic use of the environment is rewarded.
6. **Each depth is a clean mechanical slate.** Every depth introduces exactly one signature piece. When the player descends, the previous depth's signature piece disappears entirely — it does not carry forward. Coins and regular enemies persist across depths; signature pieces do not. This keeps each depth legible and prevents mechanics from stacking into unreadable complexity. New depth, new rule to learn — not a new rule layered on top of everything before.

---

## Level Design and Depth Configuration

All depth tuning lives in one file: `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/level-config.ts`. The bottom section, `LEVEL_CONFIG`, is a numbered list of depth objects — one per depth. That is the only file a designer needs to touch to change how any depth plays.

The grid is always 25x25 (625 cells total). Every count, distance, and density number below should be read against that fixed canvas.

---

### The Knobs and What They Actually Do

**`descendScore`** — the primary pacing lever. This is how many points the player must earn before the depth ends. At 100, a player collecting only coins needs to grab 100 coins, which is a lot of enemy accumulation. Raise this to make a depth feel longer and more grind-y; lower it for a sprint. This number sets the emotional length of a depth more than any other field.

**`enemyKeep`** — how many normal enemies survive the transition into this depth. This is the opening pressure. Depth 1 starts at 0 (clean slate, learn the loop). Depth 2 gets 1 carry-over enemy — almost nothing, because coral barriers are the real challenge. Depth 3 gets 10 — the player arrives already under pressure, which is intentional: the Nursery should feel crowded from the first move. Think of this as "what does the first 10 seconds feel like?"

**`coinRate`** — probability per cell per move that a coin spawns. At 0.00025, that's roughly one coin every 6-7 moves. Lower this to make coins feel scarce and precious; raise it to create a cluttered, coin-rich board. Currently identical across all depths — adjusting this per-depth is an untested lever with significant feel implications.

**`coinInit`** — fraction of cells pre-filled with coins when the depth begins. At 0.05, that's about 31 coins waiting for you. This sets the density of the opening board before the player has earned anything. A lower value means a sparse, quiet start; a higher value means immediate temptation and immediate enemy accumulation.

**`minEnemyDist`** — minimum Manhattan distance from the player when an enemy spawns. At 5, that gives the player a small safe bubble. Increasing this gives more reaction time after every collection; decreasing it makes spawns feel more threatening and immediate.

**`tilePalette` and `canvasBase`** — these set the visual identity of a depth. The palette is the art style of the tile grid (`"ocean"`, `"tropical"`, `"nursery"`, `"arctic"`). The `canvasBase` hex color bleeds through between tiles — it's the "deep water" color and it shifts the overall mood of the whole screen. These two values together are what make each depth feel like a different place.

---

### Shell / Pickup Config Blocks

Each depth can include zero or more pickup mechanic blocks. **Omit the block entirely to disable that mechanic** — there is no "active: false" flag needed, and no zeroing out. Depth 5 currently has no shell config at all: pure coins and enemies.

All `interval` values are in **player moves, not seconds**. On a fast-moving player, 25 moves happens quickly. On a cautious one, it takes much longer. This means shell spawn rhythm is tied to player pace, which is intentional — aggressive players see more pickups.

**`ammonite`** (Depth 1 — purple shells)
- `initCount` — how many are placed on the board at game start
- `max` — ceiling on simultaneous ammonites. Prevents the board from drowning in high-value targets
- `interval` — moves between a collection and the next spawn. At 25, there's never more than one "choice moment" per minute of typical play
- `points` — currently 10 pts. High enough to matter, but each one spawns a 2x2 big enemy
- `centerSafeZone` — if set, ammonites won't spawn in that square area at the center. Keeps the middle of the board open for maneuvering

**`coral`** (Depth 2 — barrier shells)
- All the standard pickup fields (`initCount`, `max`, `interval`, `points`) work the same as ammonite
- `barrierCount` — permanent coral wall blocks placed once when the depth begins. At 12, that's about 2% of the grid. These walls reshape both player and enemy pathfinding for the entire depth
- `barrierMinDist` — how close to the player a barrier can be placed at entry. Prevents immediate trapping on arrival
- `centerSafeZone` — same function as ammonite: keeps a zone in the middle clear of pickups

**`egg`** (Depth 2 — shark eggs)
- `initCount` — eggs seeded at depth entry
- `interval` — delay (in moves) between collecting an egg and the next one spawning. At 0, the next egg appears immediately: there is always exactly 1 egg on the board
- `points` — currently 10 pts, matching the ammonite. Both are high-risk, high-reward
- `babyPenalty` — points lost when an enemy eats the baby shark. Currently -5. This is the asymmetric cost that makes the baby a real liability, not just a trail
- `centerSafeZone` — eggs won't spawn in the center area

**`frozenFish`** (Depth 4 — arctic fish)
- `initCount`, `max`, `interval`, `points` work the same as above
- The fish mechanic has an extra layer not captured here: collecting a fish also turns that tile into ice and immediately triggers a slide. The config only sets the pickup properties; the slide behavior is intrinsic to the mechanic

**`icePatches`** (Depth 4 — ice terrain)
- `initialCount` — number of ice shapes seeded at the start of the depth. These are placed as readable shapes (not random scatter), each one a 1x2 to 2x2 block. At 8 shapes, the board has meaningful ice zones without being overwhelmed. Raise this to create a more chaotic, commitment-heavy board; lower it for a cleaner feel with the slide mechanic still present

**`neutralFish`** (Depth 6 — ambient fish species)
- Contains three sub-objects: `mackerel`, `garibaldi`, `grouper`. Each has:
  - `count` — how many of this species spawn at depth start
  - `speedDivisor` — fish moves once per N player moves (1 = every move, 2 = every 2 moves, etc.)
  - `size` — 1 (1×1 tile) or 2 (2×2 tiles, grouper only)
- Fish are impassable and cannot walk onto the shark's cell. No pickup, no enemy spawn — pure obstacle.

**`kelp`** (Depth 6 — seaweed terrain)
- `strandCount` — number of kelp columns placed on the board. Columns are distributed evenly across the grid width with ±30% zone-width jitter, so strands feel organic but never cluster or leave large gaps. Tune this number to change how dense the kelp forest feels.
- `minHeight` / `maxHeight` — height range (in cells) for each column. Currently 19–22, which places kelp tips 76–88% of the way up the board for a tall, near-surface-reaching forest.
- `swayPeriod` — milliseconds per full sway cycle (visual only, no gameplay effect)

---

### How to Design a Depth

Start with two questions: **What is the opening feel?** (set `enemyKeep` and `coinInit`) and **What is the signature pressure?** (choose which shell block to include and tune its `interval` and `points`).

Then think about pacing: `descendScore` is how long the player spends in this depth. 100 pts is the current standard — all depths use it. That's a deliberate choice for predictability, but it's tunable if a depth needs to be a sprint or a slog.

The visual identity (`tilePalette`, `canvasBase`) should reinforce the mechanical mood. Arctic is cold and commitment-heavy, so the palette is pale and the canvas base is near-black. The Nursery is open and slightly warmer. These aren't decorative — they prime the player for what kind of play the depth demands.

---

## Leaderboard

The leaderboard screen has three tabs: **HIGH SCORE**, **DEPTH TIMES**, and **SHARK SCORE**.

**HIGH SCORE** — Global best single-run total points, sorted descending. Shows score, run time, and date.

**DEPTH TIMES** — Per-depth best completion times. Selecting this tab reveals an inline depth selector using the same colored depth buttons as the main menu depth select. Only depths the player has reached are unlocked; deeper depths are shown dimmed so players can see what exists beyond their current progress. Tapping a depth fetches and displays the time leaderboard for that depth. Auto-selects the player's highest reached depth on first open. All 7 depths have time categories (`d1_time` through `d7_time`).

**SHARK SCORE** — Ranked by the SCORE² ÷ TIME formula. Depth 1 starts only. Has an inline [?] help button explaining the formula.

**Medals** — The top 3 ranks display pixel art medal sprites drawn on canvas elements (16×20px logical, 2× rendered). Gold, silver, bronze. Chunky hand-crafted aesthetic matching the game's pixel-art language. No CSS gradient medals.

**Tab label language:** "DEPTH TIMES" — uses the game's own vocabulary. Not "Split Times" or "Stage Times."

---

## Open Questions / Active Decisions

- **Depth 7 (The Abyss) signature piece:** The Leviathan may itself be the signature piece (the one persistent mega-enemy replacing all special collectibles). Or Depth 7 may still need a shell/pickup exclusive to it. Needs a decision before design goes further.
- **Leviathan move rate:** Currently moves every player move — is this too punishing given its 3×3 footprint?
- **Baby shark chain length:** Currently unbounded (you can hatch many babies). Should there be a cap?
- **Ammonite vs big enemy balance:** Does the 10 pt reward justify the 2×2 enemy risk at Depth 1? Players may skip it entirely.
- **Busy Pacific — does the Grouper need a pickup?** The depth currently has no collectible mechanic — fish are pure obstacles. This is intentional for now but may feel incomplete compared to other depths.
- **Busy Pacific — kelp density:** `strandCount: 10` is a starting point. Needs playtesting to find the right balance between atmosphere and navigability.
- **Mobile feel:** D-pad repeat delay (200ms initial, 100ms interval) — does this feel right for iOS?
- **Depth progress HUD format:** Progress bar vs. numeric counter (e.g., "46/100")? Needs playtesting.
