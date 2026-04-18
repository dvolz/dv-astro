A bug has been reported: $ARGUMENTS

Before writing a single line of code, work through these steps in order.

## Step 1 — Read the design doc

Read `src/game/shark-thief/GAME_DESIGN.md` in full. Understand what the expected behavior is for the depth or mechanic the bug touches. If the bug description mentions a depth, a pickup, or a mechanic, find the relevant section and quote the rule that governs it.

## Step 2 — Read the config

Read `src/game/shark-thief/level-config.ts`. Identify which depth config is involved and note the relevant values (`enemyKeep`, `descendScore`, pickup config blocks, `cloudSize`, etc.).

## Step 3 — Read the affected code

Based on the bug description, read the most likely source files. Common starting points:
- `engine.ts` — game loop, depth transitions, pickup handlers
- `spawn.ts` — enemy and pickup spawning
- `renderers.ts` — visual draw order bugs
- `state.ts` — if state is missing or wrong
- `navigation.ts` — menu / screen transition bugs

Read only what is relevant. Do not read every file.

## Step 4 — State your understanding

Before proposing a fix, write out:
1. **Expected behavior** (from the design doc or CLAUDE.md rules)
2. **Actual behavior** (what the bug report describes)
3. **Root cause** (what in the code causes the gap)
4. **Proposed fix** (specific change, specific file and line)

If you are not confident about the root cause after reading the code, say so and ask a clarifying question rather than guessing.

## Step 5 — Fix it

Only after completing Steps 1–4, make the change. Keep it minimal — fix the bug, don't refactor surrounding code.
