# Shark Thief — Game Design Document

> **Living document.** Updated by Zak as design decisions are made.
> Last updated: 2026-04-14

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

### Depth 1 — The Shallows
- Open ocean, no obstacles
- **Ammonite** (purple shell): worth 10 pts, spawns a 2×2 big enemy. Appears on a 25-move guaranteed timer (1 on board at a time)
- **Goal:** Learn the core loop. Enemy count climbs fast — players discover that greed kills.
- **On entry:** 5 closest enemies dissolved (reset to 5 farthest) when descending from nothing (first level)

### Depth 2 — The Reef
- **Coral barriers:** permanent impassable walls that reshape the board
- **Coral shells** (cone): worth 5 pts when touched, but convert *into* a barrier and spawn 1 enemy. New shell every 15 moves (max 6 on board)
- **On entry:** 5 closest enemies dissolved, 4 coral shell pickups seeded, ~2% of grid pre-coralled
- **Design intent:** Force route planning. A board filling with walls changes pathfinding for both player and enemies. Strategic players use barriers to create chokepoints; reckless ones trap themselves.

### Depth 3 — The Nursery
- Open water again (coral cleared)
- **Shark egg** (mermaid's purse): worth 10 pts, hatches a **baby shark** that follows the player in a chain
- **Baby shark:** follows 1 cell behind. If an enemy touches it — -5 pts, blood cell appears and fades over 10 moves
- **Always 1 egg on board** — respawns immediately on collection
- **On entry:** 10 farthest enemies kept, rest dissolved (thinning the herd for the nursery theme)
- **Design intent:** The baby is a liability that rewards you for collecting and punishes you if you ignore enemy positions. Emotional attachment to the chain is intentional.

### Depth 4 — The Abyss *(in progress)*
- **Leviathan:** 3×3 mega enemy, always present
- **Shell:** TBD
- **Design intent:** The final known depth. The Leviathan's move rate and interaction with regular enemies is still being tuned.

---

## Scoring

### Score
Raw points accumulated in a single run. Coins = 1 pt, ammonite = 10 pts, coral shell = 5 pts, shark egg = 10 pts. Baby shark eaten = -5 pts.

### High Score
Best single-run Score ever. Shown on the menu and leaderboard.

### Shark Score
```
SHARK SCORE = SCORE² ÷ TIME (seconds)
```
Rewards both skill (high score) and efficiency (low time). Doubling your score quadruples it; cutting time in half doubles it. Only eligible for runs starting at Depth 1 — mid-game jumps would inflate it unfairly.

**Tunable:** The exponent (currently 2) may adjust as the game grows.

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

---

## Open Questions / Active Decisions

- **Depth 4 shell:** What is the Depth 4 pickup mechanic? Should it interact with the Leviathan?
- **Leviathan move rate:** Currently moves every player move — is this too punishing given its 3×3 footprint?
- **Baby shark chain length:** Currently unbounded (you can hatch many babies). Should there be a cap?
- **Ammonite vs big enemy balance:** Does the 10 pt reward justify the 2×2 enemy risk at Depth 1? Players may skip it entirely.
- **Depth 5+:** Is there a plan beyond Depth 4?
- **Mobile feel:** D-pad repeat delay (200ms initial, 100ms interval) — does this feel right for iOS?
