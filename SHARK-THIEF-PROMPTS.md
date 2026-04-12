# Shark Thief — Big Update Prompt Plan

Work through these prompts **in order**. Each prompt is self-contained and picks up where the previous left off. Every prompt that touches layout or visual design uses `/ui-ux-pro-max` explicitly as instructed.

Estimated prompts: **6**. All are meaningful chunks — none are trivially small or dangerously large. Do not split further unless one runs long (the model will tell you).

---

## Prompt 1 — Game Design Doc Full Rewrite

**File touched:** `SHARK-THIEF-DESIGN.md` only. No code.

> Update `SHARK-THIEF-DESIGN.md`. Keep everything currently in the file but reorganize and expand it into a complete, readable player-and-designer document. Structure it as follows:
>
> **Section 1 — What Is Shark Thief?**
> Write a short, approachable intro paragraph explaining the game to a new player. Capture this intent: casual players can just go for high scores and enjoy the game; strategic players can use the rules to plan routes and maximize their Shark Score. Both audiences should feel welcome.
>
> **Section 2 — How to Play**
> Plain-language rules: moving on the grid, collecting coins, what enemies do, how depth levels work, what the depth threshold scores are.
>
> **Section 3 — Level Formula (designer reference)**
> Keep the existing level formula section. Clarify that every depth has exactly these tunable slots:
> - Grid size (currently 25×25 for all depths — note this)
> - Shell piece: visual, point value, interaction mechanic, what it spawns on interaction
> - Coin spawn rate (`PICKUP_RATE`) and initial density (`PICKUP_INIT`)
> - Shell spawn rate and initial count
> - Coral spawn % on level entry (depth 2+)
> - Enemy spawn rule: minimum distance from shark, trigger (every coin collected)
> - Enemy movement pattern: how they seek the player (describe the current AI rule from the code — Manhattan-distance nearest-neighbor step toward shark, moving every 2 player moves)
> - Board reset rule on transition: which elements persist vs reset
>
> **Section 4 — Defined Levels** (expand current table format)
> For each depth, add a full parameter table covering every tunable slot from Section 3. Use the actual constants from the code:
> - `PICKUP_RATE = 0.00025`, `PICKUP_INIT = 5%`, `SUPER_INIT = 1/40`, `SUPER_RATE_OF_PICKUP = 0.0175`
> - `CORAL_PICKUP_RATE = 0.00028`, `CORAL_PICKUP_INIT = 4`
> - `MIN_ENEMY_DIST = 5`
> - Enemy moves every 2 player moves (all current depths)
> - Grid: 25×25 for all current depths
>
> **Section 5 — Scoring System**
> Document these four values:
> 1. **Score** — points in a single run (coins, shells, etc.)
> 2. **High Score** — best single-run Score ever recorded
> 3. **Total Time** — wall-clock seconds from game start until death
> 4. **Shark Score** — the composite leaderboard metric. Formula: `floor(Score² / TotalTimeSeconds)`. Rewards high score AND fast play. Players should understand: doubling your score quadratically increases Shark Score; cutting your time in half doubles it. The formula is intentionally tunable — we'll adjust the exponent as we learn more about typical score ranges.
>
> **Section 6 — Leaderboard Categories**
> List the six leaderboard tabs and what each measures:
> 1. High Score — best raw Score
> 2. Depth 1 Time — fastest time to clear Depth 1 (reach 100 pts)
> 3. Depth 2 Time — fastest time to clear Depth 2 (reach 200 pts)
> 4. Depth 3 Time — (future) fastest to clear Depth 3
> 5. …one tab per future depth
> 6. Shark Score — composite metric (Score² / Time)
>
> **Section 7 — Design Philosophy**
> Short section for future level designers. Restate the formula: each new depth needs a unique shell, a board reset rule, and tuned parameters. Document the "endless mode" intent: the final depth will be an endless survival mode, which is why the Shark Score formula needs to remain fair across both depth-limited runs and endless ones — we may adjust the exponent when we know the expected score ceiling.

---

## Prompt 2 — Time Tracking + Shark Score Infrastructure

**Files touched:** `shark-thief-ios.astro` JS only. No HTML/CSS changes.

> In `src/pages/play/shark-thief-ios.astro`, add the time-tracking and Shark Score infrastructure to the game logic. Do not change any HTML or CSS yet — data layer only.
>
> **Add these state variables** (near the other `let` declarations):
> ```
> let gameStartTime = 0;        // performance.now() when current run started
> let totalTimeMs = 0;          // accumulated ms when game ends
> let levelStartTime = 0;       // performance.now() when current depth started
> let levelTimes: number[] = []; // ms spent in each depth [depth1ms, depth2ms, ...]
> ```
>
> **Wire up timing:**
> - In `init()`: set `gameStartTime = performance.now()`, `levelStartTime = performance.now()`, `levelTimes = []`
> - In `checkDepthTransition()` when a depth transition fires: push `performance.now() - levelStartTime` to `levelTimes`, then reset `levelStartTime = performance.now()`
> - In the game-over handler (wherever `gameOver = true` is set from enemy collision): set `totalTimeMs = performance.now() - gameStartTime` and push the final level time to `levelTimes`
>
> **Add Shark Score formula:**
> ```typescript
> function calcSharkScore(score: number, totalMs: number): number {
>   if (totalMs <= 0) return 0;
>   const secs = totalMs / 1000;
>   return Math.floor((score * score) / secs);
> }
> ```
>
> **Save/load:** add `totalTimeMs`, `levelTimes` to `saveGame()` and restore them in `loadGame()`.
>
> **Leaderboard submission:** update the score submission payload to include `totalTimeMs`, `levelTimes`, and `sharkScore = calcSharkScore(score, totalTimeMs)`. Keep the existing `score` field. Add a new `map` tag `shark-thief-v2` for the new leaderboard (keep the old `reef25` fetch working for backward compat — the new categories will use new API params).
>
> **LocalStorage:** add `sharkTotalBest` key to track the player's best Shark Score locally (same pattern as `sharkIosHighScore`).

---

## Prompt 3 — HUD Redesign (Two-Row Header)

**Invoke: `/ui-ux-pro-max`**

> `/ui-ux-pro-max`
>
> Redesign the in-game HUD in `src/pages/play/shark-thief-ios.astro`. The new HUD has two rows stacked vertically inside `.ios-hud`. Use the existing design tokens and pixel-button language. The aesthetic reference is the Genesis-era Ecco the Dolphin interface: clean monochrome readouts, compact terminal-style labels in VT323 font, no decorative chrome — pure information.
>
> **Row 1 (controls):** `[MENU]` button (left) — same `hud-btn` style — center gap — `[DEPTH N [?]]` button (right) colored per depth. Same as today's single-row layout, just the top half.
>
> **Row 2 (stats bar):** Three stat blocks separated by thin vertical dividers. Left block: `SCORE` label + live score value. Center block: `TIME` label + `MM:SS` running clock (updates every second via setInterval while playing, stops on game over). Right block: `LV TIME` label + time spent in current depth as `MM:SS`. All values use VT323 at a smaller size than the score (the large `2.2rem` stays for score; level time and total time use `1.6rem`).
>
> **Implementation notes:**
> - Add a `setInterval` timer that fires every 500ms while `!gameOver`, updates the two time displays from `gameStartTime` and `levelStartTime`
> - Clear the interval in the game-over handler and in `init()`
> - On `loadGame()` restore the clock offset so it continues from saved state
> - The `hud-score-group` becomes the left block of row 2 only; move BEST score display out of the HUD row entirely — BEST now lives only on the main menu (it's already there as `menuBestScore`)
> - Keep `max-width: 600px` and `box-sizing: border-box` on the HUD container
> - The dividers are `1px solid rgba(255,255,255,0.1)` and `height: 2rem`; the two rows are separated by `border-bottom: 1px solid var(--ocean-surface)` at mid-hud
> - On mobile (`pointer: coarse`) the row 2 font sizes may compress to `1.3rem` if needed to fit

---

## Prompt 4 — Leaderboard Redesign (Tabbed Categories)

**Invoke: `/ui-ux-pro-max`**

> `/ui-ux-pro-max`
>
> Redesign the leaderboard screen in `src/pages/play/shark-thief-ios.astro`. Add tabbed category switching using the existing pixel-button design language.
>
> **Tab bar** sits between the header and the table. Tabs are compact `hud-btn`-style buttons in a horizontal scrollable row. Active tab gets the filled/pressed state (background = tab color, text = ocean-abyss). Default selected tab: **HIGH SCORE**.
>
> **Tab list:**
> 1. HIGH SCORE
> 2. D1 TIME
> 3. D2 TIME
> 4. D3 TIME *(dimmed/disabled if no data yet)*
> 5. SHARK SCORE
>
> **Table columns change per tab:**
> - HIGH SCORE: Rank | Name | Score | Submitted
> - D1/D2/D3 TIME: Rank | Name | Time (MM:SS) | Submitted
> - SHARK SCORE: Rank | Name | Shark Score | Submitted (add a `[?]` icon next to the "SHARK SCORE" column header that opens the Shark Score formula popup)
>
> **Submitted column:** format as `MMM D 'YY HH:MM` using the existing `formatDate()` helper — add time-of-day to it.
>
> **Shark Score formula popup:** same visual style as the depth info overlay. Shows:
> - Formula: `SHARK SCORE = SCORE² ÷ TIME (seconds)`
> - Example: `Score 250 in 90s → 250² ÷ 90 = 694`
> - Design intent: high score matters most (quadratic); fast time is a multiplier. Both matter.
> - Note: formula is tunable as the game grows.
>
> **API:** `fetchLeaderboard(category)` now takes a category string and hits `/api/scores?map=shark-thief-v2&category=high_score` (etc). Keep the mock data fallback — extend `MOCK_SCORES` with mock `totalTimeMs`, `levelTimes[0]`, `sharkScore` fields so all tabs render in dev.
>
> **Accessibility:** tab bar is keyboard-navigable; active tab has `aria-selected="true"`.

---

## Prompt 5 — Dev Menu: Game Guide Button + Popup

**Invoke: `/ui-ux-pro-max`**

> `/ui-ux-pro-max`
>
> Add a **GAME GUIDE** button to the dev panel in Settings (inside `.dev-panel` in `src/pages/play/shark-thief-ios.astro`). It opens a popup in the exact same style as the existing depth info overlay (`.depth-info-overlay` pattern: fixed overlay, panel with depth-colored border, scrollable content, `✕ BACK` close button, close on backdrop click).
>
> **Panel border color:** `var(--gold)` (#ffd166) — distinct from the depth colors.
>
> **Content sections (all in pixel/terminal font, same as depth info panel):**
>
> **① WHAT IS SHARK THIEF?**
> Pull from the design doc — two short paragraphs: casual vs strategic play, the core loop.
>
> **② HOW TO PLAY**
> Compact rule bullets using the `depth-rule-row` grid layout:
> - MOVE: Arrow keys or D-pad — one cell per turn
> - COINS: Collect gold squares for +1 pt. Each coin spawns an enemy.
> - ENEMIES: Hunt you. Move 1 step every 2 player moves. Touch = game over.
> - DEPTH: Reach score thresholds (100, 200…) to descend. Board changes each depth.
> - SHELL: Each depth has a unique shell. Read the depth [?] button in-game for details.
>
> **③ SCORING**
> Rule rows for: SCORE, HIGH SCORE, SHARK SCORE (with the formula), TOTAL TIME.
>
> **④ TIPS (strategic layer)**
> Three tips in terminal font: coins spawn enemies so the board gets harder fast; plan routes around coral barriers; Shark Score rewards both points AND speed — being efficient beats grinding.
>
> **Implementation:** wire up a "GAME GUIDE" button inside `buildDevPanel()` alongside the depth-jump buttons. The popup uses an `id="gameGuideOverlay"` element (add to HTML just after the depth info overlay). Reuse the same `.depth-info-overlay` CSS class — the JS just adds/removes `.visible`.

---

## Prompt 6 — Depth Level Popup: Full Parameter Tables + Enhanced Animations

**Invoke: `/ui-ux-pro-max`**

> `/ui-ux-pro-max`
>
> Expand the depth level info popup and its mini-canvas animations in `src/pages/play/shark-thief-ios.astro`.
>
> **Panel content additions** (add after the existing rules section, before "HOW IT WORKS"):
>
> Add a new **► LEVEL PARAMETERS** section with a parameter table using the existing `depth-rule-row` grid. For each depth show:
>
> | Key | Value |
> |-----|-------|
> | GRID | 25 × 25 CELLS |
> | COIN RATE | 0.00025 per cell per move |
> | COIN INIT | 5% of cells on start |
> | SHELL RATE | (depth-specific) |
> | SHELL INIT | (depth-specific) |
> | CORAL TILES | 0% (D1) / ~2% of grid (D2+) |
> | ENEMY SPAWN | ≥ 5 CELLS FROM SHARK |
> | ENEMY MOVE | 1 STEP EVERY 2 PLAYER MOVES |
>
> For D1: Shell rate = 1.75% of new coins become ammonite; Shell init = 1 in 40 starting pickups.
> For D2: Coral shell rate = 0.00028 per cell per move; init = 4 on entry.
>
> Also add an **ENEMY MOVEMENT** sub-section explaining the AI: "Each enemy finds the shortest Manhattan-distance path to the shark and takes one step along it. They do this every 2nd player move. Multiple enemies move independently — they don't coordinate, but they'll converge from multiple directions as the board fills."
>
> **Animation enhancements** (update `renderD1` and `renderD2`):
>
> D1 additions:
> - Show a coin spawning a small enemy: after the ammonite collect, also show a coin getting collected mid-sequence with a new enemy appearing near the edge.
> - Enemy movement is already shown in the current animation (moves 2 and 4) — make the move indicator arrows more visible: draw a small translucent arrow on the tile the enemy is moving toward (1px `#162d40` outline triangle pointing in the move direction, fading in 100ms before the enemy arrives).
>
> D2 additions:
> - Show the coral barrier being impassable: after the barrier forms, animate the shark attempting to go right into it and bouncing back a second time (shorter bounce, just a nudge) with a flash on the barrier tile.
> - Annotate the coral % on entry: briefly show 2 more coral tiles fading in at random positions when the scene starts (pre-placed in the scene layout) to represent the ~2% spawn.
>
> **Move pip label update:** change the pill legend from `[YOU ●●] [ENEMY ●]` to:
> `YOU MOVE 2` → `ENEMY MOVES 1` — with the label text updating dynamically in the caption as moves happen.

---

## Dependency Notes

```
Prompt 1 (doc)         — no deps, do first
Prompt 2 (data layer)  — no deps, can do after or alongside 1
Prompt 3 (HUD)         — depends on Prompt 2 (reads gameStartTime, levelStartTime)
Prompt 4 (leaderboard) — depends on Prompt 2 (reads sharkScore, totalTimeMs on submit)
Prompt 5 (guide popup) — depends on Prompt 1 (content) but can be done before
Prompt 6 (depth popup) — standalone, but content aligns with Prompt 1 values
```

Safe parallel pairs (if you want to run two sessions):
- **Session A:** Prompts 1 → 2 → 3 → 4
- **Session B:** Prompts 5 → 6

Or sequentially 1 through 6.

---

## What Goes into SHARK-THIEF-DESIGN.md From This Update

After all prompts are done, the design doc should reflect:
- Shark Score formula and intent
- Level parameter tables with actual constant values
- Leaderboard category list
- Enemy AI description (Manhattan-distance, 2:1 ratio)
- Endless mode intent (final depth = survival, formula tunable)
- Casual vs strategic play philosophy
- Grid sizes per depth

The doc is the source of truth for future level design. When designing Depth 3, refer to Section 3 tunable slots and fill in every row before writing any code.
