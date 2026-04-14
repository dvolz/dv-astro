# Shark Thief — Game Design Document

> **Living document.** Updated by Zak as design decisions are made.
> Last updated: 2026-04-14 (score cap, HUD progress, game-over labels, Arctic frozen fish mechanic finalized)

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
- **Goal:** Learn the core loop. Enemy count climbs fast — players discover that greed kills.
- **On entry:** There is no enemies present

### Depth 2 — The Reef

- **Coral barriers:** permanent impassable walls that reshape the board
- **Coral shells** (cone): worth 5 pts when touched, but convert _into_ a barrier and spawn 1 enemy. New shell every 15 moves (max 6 on board)
- **On entry:** Exactly 5 enemies are present when the level begins. All but the 5 furthest-away enemies are dissolved; if fewer than 5 survived the transition, new enemies are spawned to reach 5. 4 coral shell pickups seeded, ~2% of grid pre-coralled
- **Design intent:** Force route planning. A board filling with walls changes pathfinding for both player and enemies. Strategic players use barriers to create chokepoints; reckless ones trap themselves.

### Depth 3 — The Nursery

- Open water again (coral cleared)
- **Shark egg** (mermaid's purse): worth 10 pts, hatches a **baby shark** that follows the player in a chain
- **Baby shark:** follows 1 cell behind. If an enemy touches it — -5 pts, blood cell appears and fades over 10 moves
- **Always 1 egg on board** — respawns immediately on collection
- **On entry:** Exactly 10 enemies are present when the level begins. The 10 farthest enemies are kept and the rest dissolved; if fewer than 10 survived the transition, new enemies are spawned to reach 10
- **Design intent:** The baby is a liability that rewards you for collecting and punishes you if you ignore enemy positions. Emotional attachment to the chain is intentional.

### Depth 4 — The Arctic _(in progress)_

- **Ice patches:** Permanent slippery zones pre-seeded on the board in readable shapes (1x2, 1x3, 1x4, 2x2). Not random scatter — placed to create deliberate corridors and decision points.
- **Frozen fish collectible:** Worth 5 pts, always 1 on board at a time, respawns immediately on collection.
- **Frozen fish collection — two-part consequence:** When the shark enters a frozen fish tile, the fish is collected (points awarded) AND that tile instantly becomes an ice patch. The shark then slides across the newly-created ice as part of the same move, continuing until it hits a wall or a non-ice tile. The player cannot interrupt the slide — they commit to the collection and its momentum simultaneously.
- **Enemy sliding:** Enemies follow the same ice rules as the shark. If an enemy steps onto an ice patch, it slides until it hits a wall or non-ice tile. This can work for or against the player.
- **Design intent:** Ice makes every move a commitment. The frozen fish mechanic layers a second commitment on top — you don't just collect, you trigger a consequence you have to plan around. Strategic players learn to collect fish from angles that end the slide safely; reckless ones slide into walls or enemies.
- **On entry:** 5 enemies present at level start.

### Depth 5 — The Abyss _(in progress)_

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

---

## Open Questions / Active Decisions

- **Depth 4 shell:** What is the Depth 4 pickup mechanic? Should it interact with the Leviathan?
- **Leviathan move rate:** Currently moves every player move — is this too punishing given its 3×3 footprint?
- **Baby shark chain length:** Currently unbounded (you can hatch many babies). Should there be a cap?
- **Ammonite vs big enemy balance:** Does the 10 pt reward justify the 2×2 enemy risk at Depth 1? Players may skip it entirely.
- **Arctic depth number:** ✅ Arctic = Depth 4. Leviathan/Abyss = Depth 5.
- **Arctic frozen fish point value:** ✅ 5 pts (lower than ammonite/egg given the forced slide risk).
- **Arctic enemy count on entry:** ✅ 5 enemies.
- **Arctic ice patch placement rules:** How many patches per board? Should patches avoid the player spawn cell and fish spawn cells?
- **Arctic slide into enemy:** ✅ Death. Consistent with all other enemy contact — you triggered it, you die.
- **Arctic slide into collectible:** If the shark slides across a coin mid-slide, is it collected? Or only at the terminal cell?
- **Mobile feel:** D-pad repeat delay (200ms initial, 100ms interval) — does this feel right for iOS?
- **Depth progress HUD format:** Progress bar vs. numeric counter (e.g., "46/100")? Needs playtesting — bar is faster to read at a glance, number is more precise and communicates the 100-point goal explicitly.
