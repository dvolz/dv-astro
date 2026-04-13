# Shark Thief — Game Design & Player Guide

---

## Section 1 — What Is Shark Thief?

Shark Thief is a grid-based arcade game where you navigate a shark through a layered ocean, collecting coins and rare shell pieces while staying ahead of enemies that spawn every time you score.

The game is designed for two kinds of players at the same time. **Casual players** can dive in immediately — move around, grab coins, survive as long as possible, and chase a high score. There's no tutorial required and no hidden complexity to unlock before it's fun. **Strategic players** can go deeper: every mechanic has a rule, every level has tunable parameters, and the scoring system rewards both points *and* speed. If you understand how enemies pathfind, when shells spawn, and how the Shark Score formula works, you can make decisions that compound — turning a good run into a great one.

Both audiences are playing the same game. The depth is always there if you want it.

---

## Section 2 — How to Play

**The Grid**
The game takes place on a square grid of ocean tiles. You control a shark that moves one cell at a time — up, down, left, or right — using arrow keys or the on-screen D-pad.

**Coins**
Gold squares are scattered across the board. Collecting a coin earns **+1 point** and immediately spawns a new enemy somewhere on the board (at least 5 cells away from you). The more coins you collect, the more crowded the board becomes.

**Enemies**
Enemies are dark 1×1 creatures that hunt you. They use a shortest-path rule: each enemy finds the direction that reduces its Manhattan distance to you and takes one step. They move **once every 2 player moves** — so for every two steps you take, each enemy takes one. Touch an enemy and the game ends.

**Big Enemies**
Some interactions — like collecting the Depth 1 ammonite shell — spawn a **2×2 big enemy** instead of a regular one. Big enemies follow the same movement rule but occupy four cells, making navigation tighter.

**Shell Pieces**
Each depth has a unique shell piece with its own mechanics. The shell is worth more than a coin and has a special effect on collection or collision. Read the in-game depth info panel (tap the `[DEPTH N ?]` button) for details on each shell.

**Descending**
When your score crosses a threshold, you descend to the next depth. The board changes: the previous shell type disappears, new hazards appear, and some enemies may be cleared or reset. Thresholds:

| Depth | Score Required |
|-------|---------------|
| 1 — The Shallows | 0 |
| 2 — Reef | 100 |
| 3 — Abyss | 200 |

**Game Over**
The run ends when an enemy touches you. Your Score, Total Time, and Shark Score are recorded.

---

## Section 3 — Level Formula (Designer Reference)

Every depth is defined by filling in the following slots. If a slot isn't explicitly set, it inherits from the previous depth.

### Required Slots Per Depth

| Slot | Description |
|------|-------------|
| **Grid size** | Dimensions of the play field. Currently `25 × 25` for all depths. |
| **Shell piece** | Visual design and silhouette. Must read as a distinct shape at ~20–24px on mobile. |
| **Shell point value** | How many points collecting (or interacting with) the shell awards. |
| **Shell interaction mechanic** | What happens when the shark reaches the shell's cell: collect, block+bounce, transform, etc. |
| **Shell spawn effect** | What spawns when the shell is interacted with: regular enemy, big enemy, nothing. |
| **`PICKUP_RATE`** | Coins that grow per occupied cell per player move. Controls board density over time. |
| **`PICKUP_INIT`** | Percentage of cells seeded with coins at level start. |
| **Shell spawn rate** | How frequently new shell pieces appear during play. |
| **Shell init count** | How many shell pieces seed on level entry. |
| **Coral spawn %** | Fraction of grid cells that become impassable coral barriers on entry. Depth 2+. |
| **`MIN_ENEMY_DIST`** | Minimum Manhattan distance from the shark when a new enemy spawns. |
| **Enemy spawn trigger** | What event spawns an enemy. Currently: every coin collected, every shell interacted with. |
| **Enemy movement pattern** | How enemies navigate. Currently: Manhattan nearest-neighbor step, every 2 player moves. |
| **Board reset rule** | On transition from the previous depth: which state elements persist vs reset. |

### Enemy Movement — Current AI Rule

Each enemy independently computes the Manhattan distance to the shark from all four adjacent cells and steps into the one with the shortest distance. If two cells tie, a consistent tiebreak is applied. Enemies do **not** coordinate — they act individually. They move **once every 2 player moves** (when `moveCount % 2 === 0`). This ratio may change in future depths.

Because enemies converge from multiple directions as the board fills, the strategic implication is: **move laterally rather than directly away**. A straight retreat compresses the gap; a perpendicular escape creates angles.

### Board Reset Rule — Anatomy

When the player transitions into a new depth, each element either **persists** (carries over from the previous depth) or **resets** (changes to a new value). Document both for every new depth.

| Element | Options |
|---------|---------|
| Coins on board | Persist / Clear all / Clear some |
| Enemies on screen | Persist / Reset to N (farthest survive, closest dissolve) |
| Previous depth's shell pieces | Always cleared on transition |
| New depth's shell pieces | Seed N on entry |
| Coral barriers | None (D1) / Spawn X% of grid (D2+) / Accumulate from previous depth |

---

## Section 4 — Defined Levels

### Depth 1 — The Shallows

**Shell: Purple Ammonite** — round nautilus-spiral shape, unmistakably circular, distinct from all other pickups.

| Parameter | Value | Constant |
|-----------|-------|----------|
| Grid size | 25 × 25 | `GRID = 25` |
| Shell point value | 10 pts | — |
| Shell interaction | Collected on entry | — |
| Shell spawn effect | Spawns 1 big 2×2 enemy | — |
| Coin spawn rate | 0.00025 per cell per move | `PICKUP_RATE = 0.00025` |
| Coin init density | 5% of cells | `PICKUP_INIT = 0.05` |
| Shell spawn rate | 1.75% of new coins become ammonite | `SUPER_RATE_OF_PICKUP = 0.0175` |
| Shell init count | 1 in 40 starting coins become ammonite | `SUPER_INIT = 1/40` |
| Coral spawn % | 0% — no coral at Depth 1 | — |
| Enemy min spawn dist | 5 cells (Manhattan) from shark | `MIN_ENEMY_DIST = 5` |
| Enemy spawn trigger | Every coin collected; every ammonite collected | — |
| Enemy movement | 1 step every 2 player moves | `moveCount % 2 === 0` |
| Board on entry | Fresh start — 1 regular enemy | — |

**Board reset on exit to Depth 2:**

| Element | Behavior |
|---------|----------|
| Coins | Persist |
| Enemies | Reset to 5 (5 farthest from shark survive; rest dissolve) |
| Ammonite shells | All cleared — no ammonites at Depth 2 |
| Coral barriers | None → ~2% of grid spawns on Depth 2 entry |

---

### Depth 2 — Reef

**Shell: Coral Cone Shell** — apex-up pyramid silhouette, warm coral tones, unmistakably different from the round ammonite.

| Parameter | Value | Constant |
|-----------|-------|----------|
| Grid size | 25 × 25 | `GRID = 25` |
| Shell point value | 5 pts | — |
| Shell interaction | **Cannot be collected** — shark bounces back on contact | — |
| Shell spawn effect | Shell becomes permanent coral barrier; spawns 1 regular enemy | — |
| Coin spawn rate | 0.00025 per cell per move (inherited from Depth 1) | `PICKUP_RATE = 0.00025` |
| Coin init density | 5% of cells (inherited) | `PICKUP_INIT = 0.05` |
| Shell spawn rate | 0.00028 per cell per move | `CORAL_PICKUP_RATE = 0.00028` |
| Shell init count | 4 shells placed on entry | `CORAL_PICKUP_INIT = 4` |
| Coral spawn % | ~2% of grid cells become impassable coral on entry | — |
| Enemy min spawn dist | 5 cells (inherited) | `MIN_ENEMY_DIST = 5` |
| Enemy spawn trigger | Every coin collected; every coral shell run into | — |
| Enemy movement | 1 step every 2 player moves (inherited) | `moveCount % 2 === 0` |
| Board on entry | Enemies reset to 5 farthest; ~2% coral spawns; 4 coral shells seeded | — |

**Depth 2 mechanic note:** Coral barriers are permanent. Every coral shell interaction adds one more impassable wall to the board. Over time the reef fills with barriers and pathfinding becomes the dominant skill.

---

### Depth 3 — Abyss *(TBD)*

Depth 3 introduces the **Leviathan** — a 3×3 mega enemy. Shell piece, interaction mechanic, and exact parameters are not yet defined. Use Section 3 as the checklist when designing it. Candidate directions:

- Shell that transforms the Leviathan's behavior on collection
- A depth where enemy movement rate changes (e.g. every player move instead of every 2)
- A depth where the board geometry changes (e.g. pre-placed coral maze)

When designed, fill in the full parameter table following the same format as Depths 1 and 2.

---

## Section 5 — Scoring System

Four values are tracked per run. All four are submitted to the leaderboard.

### Score
Points accumulated in a single run. Coins = 1 pt. Shells = variable (see depth tables). Score resets to 0 at the start of every new run, including when using depth shortcuts in dev mode.

### High Score
The player's best single-run Score across all sessions. Stored locally. Submitted to the global leaderboard under the **High Score** category.

### Total Time
Wall-clock seconds from the moment `init()` fires until the game-over condition is triggered. Pausing the app (backgrounding) pauses the clock. This value is stored as milliseconds internally and displayed as `MM:SS`.

**Per-level times** are also tracked: when the player crosses a depth threshold, the time spent in that depth is recorded separately. These feed the Depth Time leaderboard categories.

### Shark Score
The composite performance metric. Formula:

```
Shark Score = floor( Score² ÷ TotalTimeSeconds )
```

**How to read the formula:**
- Doubling your Score **quadruples** your Shark Score (squared relationship).
- Cutting your time in half **doubles** your Shark Score (linear relationship).
- Score matters more than time — but both matter.
- A run of 250 pts in 90 seconds = `floor(62500 ÷ 90)` = **694**
- A run of 250 pts in 45 seconds = `floor(62500 ÷ 45)` = **1388**
- A run of 500 pts in 90 seconds = `floor(250000 ÷ 90)` = **2777**

**Tuning note:** The exponent (currently `2`) is intentionally adjustable. As we learn more about typical score ranges — especially once an endless final depth exists — we may move to `Score^1.5` or `Score^2.5` to better balance the two dimensions. The formula is documented in-game next to every Shark Score display so players always know what they're optimizing for.

---

## Section 6 — Leaderboard Categories

The leaderboard has one tab per metric. **High Score** is selected by default.

| Tab | Measures | Sorted by |
|-----|----------|-----------|
| **HIGH SCORE** | Best single-run Score | Score descending |
| **D1 TIME** | Fastest time to reach 100 pts (clear Depth 1) | Time ascending |
| **D2 TIME** | Fastest time to reach 200 pts (clear Depth 2) | Time ascending |
| **D3 TIME** | *(Future)* Fastest to clear Depth 3 | Time ascending |
| *(…)* | One tab per future depth | Time ascending |
| **SHARK SCORE** | `floor(Score² ÷ TotalTimeSeconds)` | Shark Score descending |

**All entries include:**
- Player name
- The measured value for that category
- Date and time of submission (`MMM D 'YY HH:MM`)

**Shark Score tab** includes a `[?]` button next to the column header that opens a popup explaining the formula in plain language (same popup style as the depth info panels).

**Depth time tabs** are hidden/dimmed until there is at least one submitted entry for that depth. This keeps the UI clean for new players.

---

## Section 7 — Design Philosophy

### The Level Formula Is a Contract

When designing a new depth, every slot in the Section 3 table must be filled before writing any code. Undefined parameters become bugs. The formula exists so that any contributor — or the original designer returning months later — can pick up the design from the document alone.

Each depth needs three things to feel like a distinct world:
1. **A shell piece** with a new silhouette and a mechanic that changes how you use the board
2. **A board reset rule** that gives the player a moment of adjustment and signals the transition
3. **Tuned parameters** that make the depth feel harder *and* different — not just harder

### Casual vs Strategic Play

The game is intentionally layered. The casual loop — move, collect, survive — is immediately readable without any documentation. The strategic layer — enemy pathing, coral routing, Shark Score optimization — emerges from the same rules and rewards players who choose to engage with it.

This means: never hide information that a strategic player would want, but never require it either. The depth info panel exists for players who want to understand the mechanics. Most players will never open it and will still have a good time.

### The Endless Mode Intent

The current design plans for a final depth that becomes **endless survival**: no score threshold, no descending further — just the board getting harder and harder until the player dies. This is where the Shark Score formula's tuning matters most.

In an endless depth, score ceilings are unknown. A formula that works perfectly for a 200-point max run may produce absurd numbers — or flat, undifferentiated values — at 2000+ points. Before shipping the endless depth:

- Play-test at least 10 runs and note the score distribution
- Adjust the exponent if the top 10% of Shark Scores are either clustered too tightly or too spread out
- Document the chosen exponent and the play-test data in this file

The goal: a player who scores twice as high in half the time should land meaningfully ahead on the leaderboard — but a player who grinds for a very high score at average speed should still rank well. Neither extreme (pure speed, pure score) should dominate.

### Adding a New Depth — Checklist

Use this when designing Depth 3 or beyond:

- [ ] Shell silhouette reads at 20–24px on mobile
- [ ] Shell mechanic is different from all previous depths (not just a stat change)
- [ ] All Section 3 parameter slots are filled in the design doc
- [ ] Board reset rule documented with before/after state for every element
- [ ] Depth threshold score set and added to the thresholds table
- [ ] Animation in the depth info popup updated to demo the shell mechanic
- [ ] `SHARK-THIEF-DESIGN.md` updated before the first line of code is written
