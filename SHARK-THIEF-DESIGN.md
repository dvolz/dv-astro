# Shark Thief — Game Design Guide

## Core Loop

The shark navigates a grid, collecting coins (1 pt each) and a depth-specific shell pickup. Each coin collected spawns a new regular enemy. The board gets progressively harder until the player hits a score threshold and descends to the next depth.

---

## Level Formula

Every depth level is defined by three things:

1. **A unique shell piece** with its own visual design and interaction mechanic
2. **A board reset rule** applied when the player transitions into that level
3. **Tunable parameters** (see below)

---

## Defined Levels

### Depth 1 — Surface Reef

| Property | Value |
|---|---|
| Shell | Purple ammonite (round, nautilus spiral) |
| Shell value | 10 pts |
| Shell mechanic | Collecting it spawns a **2×2 big enemy** |
| Board on entry | Fresh start — one regular enemy |
| Coin spawn rate | `PICKUP_RATE = 0.00025` per cell per move |
| Shell spawn rate | `SUPER_INIT = 1/40` of initial pickups; `SUPER_RATE_OF_PICKUP = 0.0175` of new growth |

### Depth 2 — Reef

| Property | Value |
|---|---|
| Shell | Coral cone shell (apex-up pyramid, warm tones) |
| Shell value | 5 pts |
| Shell mechanic | Shark **cannot collect** it — running into it converts the shell into a permanent **coral barrier** tile, bouncing the shark back. Spawns one regular enemy. |
| Board on entry | Enemies reset to **5** (the 5 farthest from the shark survive; rest dissolve) |
| Depth-1 shells | All purple ammonite shells are cleared; none spawn at this depth |
| Coral barriers | ~2% of grid cells become impassable coral on entry |
| Coral shell spawn | `CORAL_PICKUP_RATE = 0.00028` per cell per move; `CORAL_PICKUP_INIT = 4` seeded on entry |
| Coin spawn rate | Same as Depth 1 (inherited) |

### Depth 3 — Abyss *(TBD)*

Depth 3 introduces the **Leviathan** — a 3×3 mega enemy that moves every player turn. Shell piece and exact parameters are not yet defined. Use the level formula above when designing it.

---

## Tunable Parameters Per Level

These are the levers available when designing a new depth:

### Shell Piece
- Visual design and silhouette
- Point value
- Interaction mechanic (collect, block, transform, etc.)
- Whether it spawns an enemy on interaction, and what type

### Spawn Rates
- `PICKUP_RATE` — how fast coins grow on the board each move
- Shell init count — how many shells seed on level entry
- Shell growth rate — how fast new shells appear per move

### Board State on Level Transition
Each of these can either **persist** (carry over from the previous depth) or **reset** (change to a new value):

| Element | Depth 1→2 behavior |
|---|---|
| Coins on board | Persist |
| Enemies on screen | Reset to 5 (farthest survive, closest dissolve) |
| Shell pieces | Previous depth's shells are cleared; new depth's shells seed |
| Coral barriers | None at Depth 1 → ~2% of grid spawned at Depth 2 |

---

## Scoring

- **Coin** — 1 pt, spawns 1 regular enemy
- **Depth-2 coral shell** — 5 pts, converts to coral barrier, spawns 1 regular enemy
- **Depth-1 purple ammonite** — 10 pts, spawns 1 big (2×2) enemy
- Starting a level via the depth shortcut begins at **0 pts** — high scores require playing through all levels in sequence

## Depth Thresholds

| Depth | Score required |
|---|---|
| 1 | 0 |
| 2 | 100 |
| 3 | 200 |
