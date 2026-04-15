# Arctic Level (Depth 4) — Player Feedback Implementation Plan

Four concrete fixes for Bob. File paths are absolute. Line numbers reference the current codebase.

---

## 1. Gold not collected mid-slide

### The Problem

In `engine.ts`, the two ice-slide blocks pass an `onCell` callback to `resolveSlide` that only checks for enemy contact. Coin/pickup collection is done separately, after the slide resolves, using the original pre-slide `ny`/`nx` coordinates — not the terminal cell, and not any intermediate cell. The result: coins on every tile the shark slides across are ignored.

The `resolveSlide` function in `slide.ts` already calls `onCell(x, y)` on every intermediate cell (lines 33–35). The callback just needs to collect coins.

### Exact Changes

**File: `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/engine.ts`**

**Block 1 — ice slide after normal movement (lines 269–286):**

Replace the `onCell` callback:

```ts
// BEFORE
const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
  const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
    gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
  if (hitEnemy) return "stop";
  return "continue";
});
```

```ts
// AFTER
const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
  const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
    gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
  if (hitEnemy) return "stop";
  // Collect coins mid-slide
  if (gs.pickups[cy][cx]) {
    gs.pickups[cy][cx] = false;
    gs.score++;
    gs.score = Math.min(gs.score, gs.depthEntryScore + 100);
    getHudScore().textContent = String(gs.score);
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
  }
  return "continue";
});
```

**Block 2 — frozen fish collection slide (lines 348–353):**

Same change to the second `resolveSlide` call:

```ts
// AFTER
const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
  const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
    gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
  if (hitEnemy) return "stop";
  // Collect coins mid-slide
  if (gs.pickups[cy][cx]) {
    gs.pickups[cy][cx] = false;
    gs.score++;
    gs.score = Math.min(gs.score, gs.depthEntryScore + 100);
    getHudScore().textContent = String(gs.score);
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
  }
  return "continue";
});
```

**Also: the existing coin pickup at line 300** checks `gs.pickups[ny][nx]` — that is the first cell the shark stepped into, before the slide resolved. After the slide, `gs.shark.x/y` is the terminal cell, but `ny/nx` still refers to the pre-slide destination. This means a coin on the step-onto cell is checked correctly, but coins on the terminal and intermediate cells need the mid-slide callback above. No change needed to the line 300 block itself — but verify that if the slide's terminal cell also has a coin, it is covered by the last `onCell` invocation inside `resolveSlide`. Looking at `slide.ts` lines 30–38: `onCell` IS called for the terminal cell (it advances x/y first, then calls onCell), so the terminal cell coin will be caught by the callback. The step-onto cell (`ny/nx`) is caught by the existing line 300 check. All cells covered.

---

## 2. More ice, fixed patch set

### The Problem

`seedIcePatches` in `spawn.ts` (lines 100–131) accepts a `count` and randomly picks from a pool of 7 shape templates on each iteration. The composition of patches is therefore random each level — you might get 5 tiny 1×2s or 5 squares. The feedback requests a fixed composition: exactly 2× 4×1, 2× 2×2, 1× 1×1, 1× 1×2 = 6 distinct patches (7 if you count each 4×1 separately), placed at random positions each time, with orientation randomized per placement.

The `ARCTIC_PATCH_COUNT` constant and the `count` parameter become irrelevant once the composition is fixed. The callers in `engine.ts` (lines 132 and 583) can keep passing the constant for now, or you can remove it — your call. The function should simply ignore `count`.

### Exact Changes

**File: `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/spawn.ts`**

Replace the entire `seedIcePatches` function body (lines 100–131) with the following:

```ts
export function seedIcePatches(_count: number): void {
  // Fixed composition: 2× 4×1, 2× 2×2, 1× 1×1, 1× 1×2
  // Orientation (H/V) is randomized independently per placement.
  const PATCH_DEFS: Array<Array<[number, number]>> = [
    // 4×1 — placed twice
    Math.random() < 0.5
      ? [[0,0],[1,0],[2,0],[3,0]]   // horizontal
      : [[0,0],[0,1],[0,2],[0,3]],  // vertical
    Math.random() < 0.5
      ? [[0,0],[1,0],[2,0],[3,0]]
      : [[0,0],[0,1],[0,2],[0,3]],
    // 2×2 — placed twice (square, no orientation needed)
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]],
    // 1×1 — single cell
    [[0,0]],
    // 1×2 — placed once
    Math.random() < 0.5
      ? [[0,0],[1,0]]   // horizontal
      : [[0,0],[0,1]],  // vertical
  ];

  for (const shape of PATCH_DEFS) {
    const maxDx = Math.max(...shape.map(([dx]) => dx));
    const maxDy = Math.max(...shape.map(([, dy]) => dy));
    let placed = false, attempts = 0;
    while (!placed && attempts < 500) {
      attempts++;
      const ax = Math.floor(Math.random() * (GRID - maxDx));
      const ay = Math.floor(Math.random() * (GRID - maxDy));
      const hitsShark = shape.some(([dx, dy]) =>
        ax + dx === gs.shark.x && ay + dy === gs.shark.y
      );
      if (hitsShark) continue;
      for (const [dx, dy] of shape) {
        gs.iceCells[ay + dy][ax + dx] = true;
      }
      placed = true;
    }
  }
}
```

Note: the orientation randomization uses `Math.random()` at the time `PATCH_DEFS` is built, which happens once per call — each patch gets its own independent coin flip. This is correct.

The `_count` parameter is prefixed with underscore to signal it is intentionally unused. If you want to clean up callers in `engine.ts` lines 132 and 583, you can pass `0` or remove the parameter entirely and update both call sites — but it is not required for the fix to work.

---

## 3. Frozen fish and gold spawning on same tile

### The Problem

**`spawnFrozenFish` in `spawn.ts` lines 80–96:**

The rejection condition checks `gs.pickups[fy][fx]` and `gs.superPickups[fy][fx]` — both present. No problem here. However, it does NOT check `gs.frozenFish` itself, so if the function is called while a fish already exists (shouldn't happen in normal flow since `gs.frozenFish = null` is always set before calling `spawnFrozenFish`, but defensive coding matters), it would overwrite silently. That is a minor issue.

**What IS actually missing:** `spawnFrozenFish` does not check `gs.coralPickups[fy][fx]`. In Depth 4 this array is never written, so it is all false — not a live bug — but it is a gap that will silently break if Arctic ever gains coral pickups.

**`spawnSharkEgg` in `spawn.ts` lines 63–76:**

Does not check `gs.pickups[ey][ex]` for coin pickups — wait, it does. Line 72: `gs.pickups[ey][ex]`. It also checks `gs.superPickups`. It does NOT check `gs.coralPickups`. Since Depth 3 has coralPickups, this is a real gap: a shark egg can spawn on top of a coral shell pickup. Fix: add `|| gs.coralPickups[ey]?.[ex]` to the rejection condition.

**`spawnEnemy` in `spawn.ts` lines 135–148:**

Does not check `gs.pickups`, `gs.superPickups`, `gs.coralPickups`, or `gs.frozenFish`. An enemy can spawn on a coin, an ammonite, a coral shell, or a frozen fish tile. None of these are lethal, but the pickup is visually buried under the enemy. This is the sloppiest of the three. Fix: add rejection guards for all four.

### Exact Changes

**File: `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/spawn.ts`**

**`spawnFrozenFish` — add `coralPickups` check:**

```ts
// BEFORE (line 88–93)
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[fy][fx]      ||
    gs.superPickups[fy][fx] ||
    gs.iceCells[fy][fx]     ||
    gs.enemies.some(e => e.x === fx && e.y === fy) ||
    (gs.shark.x === fx && gs.shark.y === fy)
  );

// AFTER
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[fy][fx]         ||
    gs.superPickups[fy][fx]    ||
    gs.coralPickups[fy]?.[fx]  ||
    gs.iceCells[fy][fx]        ||
    gs.enemies.some(e => e.x === fx && e.y === fy) ||
    (gs.shark.x === fx && gs.shark.y === fy)
  );
```

**`spawnSharkEgg` — add `coralPickups` check:**

```ts
// BEFORE (line 71–74)
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[ey][ex] || gs.superPickups[ey][ex] ||
    gs.coral[ey]?.[ex] || gs.coralPickups[ey][ex]
  );

// AFTER — no functional change at Depth 3 currently, but closes the gap
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[ey][ex]        ||
    gs.superPickups[ey][ex]   ||
    gs.coral[ey]?.[ex]        ||
    gs.coralPickups[ey]?.[ex]
  );
```

**`spawnEnemy` — add pickup overlap checks:**

```ts
// BEFORE (line 142–147)
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.enemies.some(e => e.x === ex && e.y === ey) ||
    gs.coral[ey]?.[ex] ||
    gs.iceCells[ey]?.[ex]
  );

// AFTER
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.enemies.some(e => e.x === ex && e.y === ey) ||
    gs.coral[ey]?.[ex]           ||
    gs.iceCells[ey]?.[ex]        ||
    gs.pickups[ey]?.[ex]         ||
    gs.superPickups[ey]?.[ex]    ||
    gs.coralPickups[ey]?.[ex]    ||
    (gs.frozenFish?.x === ex && gs.frozenFish?.y === ey)
  );
```

---

## 4. Enemies should visually slide

### Current State

The shark has a full interpolation system:
- `gs.sharkVisualX` / `gs.sharkVisualY` — float positions used exclusively by the renderer
- `gs.sharkFromX` / `gs.sharkFromY` — animation start positions
- `gs.animStartTime` / `gs.animRafId` — drive `tickAnim` in `animation.ts`
- `tickAnim` uses ease-out quadratic from `sharkFrom` to `gs.shark.x/y` over `ANIM_DURATION` ms
- `renderers.ts` line 490: `drawSharkOnCtx(ctx, gs.sharkVisualX, gs.sharkVisualY, ...)` — uses visual position, not logical position

Enemies in `renderers.ts` lines 462–473 render directly from `e.x * CELL` and `be.x * CELL`. There is no visual position field. In `ai.ts`, after a slide, `e.x = slid.x; e.y = slid.y` is set immediately and atomically — the enemy teleports.

### What Bob Needs to Add

**Step 1: Add visual position fields to the Enemy interface in `state.ts`**

```ts
// BEFORE (line 5)
export interface Enemy { x: number; y: number; }

// AFTER
export interface Enemy {
  x: number; y: number;
  // Visual interpolation for slide animation
  visualX: number; visualY: number;
  animFromX: number; animFromY: number;
  animStartTime: number;
}
```

Do the same for `BigEnemy`:

```ts
// BEFORE (line 6)
export interface BigEnemy { x: number; y: number; }

// AFTER
export interface BigEnemy {
  x: number; y: number;
  visualX: number; visualY: number;
  animFromX: number; animFromY: number;
  animStartTime: number;
}
```

**Step 2: Initialize visual fields wherever enemies are created**

In `spawn.ts`, `spawnEnemy()` (line 148) returns `{ x: ex, y: ey }`. Change to:

```ts
return { x: ex, y: ey, visualX: ex, visualY: ey, animFromX: ex, animFromY: ey, animStartTime: 0 };
```

Same for `spawnBigEnemy()` (line 169):

```ts
return { x: ex, y: ey, visualX: ex, visualY: ey, animFromX: ex, animFromY: ey, animStartTime: 0 };
```

**Also initialize visual fields when loading from save** in `engine.ts` `loadGame` (line 494). The save format doesn't store visual fields. After loading:

```ts
gs.enemies = (save.enemies || []).map((e: any) => ({
  ...e, visualX: e.x, visualY: e.y, animFromX: e.x, animFromY: e.y, animStartTime: 0,
}));
gs.bigEnemies = (save.bigEnemies || []).map((e: any) => ({
  ...e, visualX: e.x, visualY: e.y, animFromX: e.x, animFromY: e.y, animStartTime: 0,
}));
```

**Step 3: Add a shared enemy animation tick function in `animation.ts`**

Add after `tickAnim`:

```ts
export function startEnemyAnims(): void {
  const now = performance.now();
  for (const e of gs.enemies) {
    e.animFromX = e.visualX;
    e.animFromY = e.visualY;
    e.animStartTime = now;
  }
  for (const be of gs.bigEnemies) {
    be.animFromX = be.visualX;
    be.animFromY = be.visualY;
    be.animStartTime = now;
  }
}

function tickEnemyAnims(now: number): void {
  let anyRunning = false;
  for (const e of gs.enemies) {
    if (e.animStartTime === 0) continue;
    const t = Math.min(1, (now - e.animStartTime) / ANIM_DURATION);
    const ease = 1 - (1 - t) * (1 - t);
    e.visualX = e.animFromX + (e.x - e.animFromX) * ease;
    e.visualY = e.animFromY + (e.y - e.animFromY) * ease;
    if (t < 1) anyRunning = true;
    else e.animStartTime = 0;
  }
  for (const be of gs.bigEnemies) {
    if (be.animStartTime === 0) continue;
    const t = Math.min(1, (now - be.animStartTime) / ANIM_DURATION);
    const ease = 1 - (1 - t) * (1 - t);
    be.visualX = be.animFromX + (be.x - be.animFromX) * ease;
    be.visualY = be.animFromY + (be.y - be.animFromY) * ease;
    if (t < 1) anyRunning = true;
    else be.animStartTime = 0;
  }
  draw();
  if (anyRunning) {
    gs.enemyAnimRafId = requestAnimationFrame(tickEnemyAnims);
  } else {
    gs.enemyAnimRafId = null;
  }
}
```

**Step 4: Add `enemyAnimRafId` to `gs` in `state.ts`**

```ts
// Add alongside animRafId (line 35)
enemyAnimRafId: null as number | null,
```

Also add to the init/reset in `engine.ts` `init()` after the existing `animRafId` cancellation:

```ts
if (gs.enemyAnimRafId) { cancelAnimationFrame(gs.enemyAnimRafId); gs.enemyAnimRafId = null; }
```

**Step 5: Call `startEnemyAnims()` from `ai.ts` after enemy positions are updated**

In `ai.ts`, import `startEnemyAnims` from `./animation`. At the end of `moveEnemiesAI()` (after the big enemy loop, line 57):

```ts
import { startEnemyAnims } from "./animation";

// At the end of moveEnemiesAI():
startEnemyAnims();
if (gs.enemyAnimRafId) cancelAnimationFrame(gs.enemyAnimRafId);
gs.enemyAnimRafId = requestAnimationFrame(tickEnemyAnims);
```

Wait — `tickEnemyAnims` is not exported. Either export it, or export a `startEnemyAnimLoop()` wrapper that does both the `startEnemyAnims()` snapshot and kicks off the RAF. Cleanest shape:

```ts
// animation.ts — export this one function; tickEnemyAnims stays private
export function startEnemyAnimLoop(): void {
  const now = performance.now();
  for (const e of gs.enemies) {
    e.animFromX = e.visualX; e.animFromY = e.visualY; e.animStartTime = now;
  }
  for (const be of gs.bigEnemies) {
    be.animFromX = be.visualX; be.animFromY = be.visualY; be.animStartTime = now;
  }
  if (gs.enemyAnimRafId) cancelAnimationFrame(gs.enemyAnimRafId);
  gs.enemyAnimRafId = requestAnimationFrame(tickEnemyAnims);
}
```

Then in `ai.ts` at the end of `moveEnemiesAI()`:

```ts
import { startEnemyAnimLoop } from "./animation";
// bottom of moveEnemiesAI():
startEnemyAnimLoop();
```

**Step 6: Update `renderers.ts` to use visual positions**

Lines 462–466 (regular enemies):

```ts
// BEFORE
for (const e of gs.enemies) {
  ctx.fillStyle = "#0a1824"; ctx.fillRect(e.x * CELL - 1, e.y * CELL - 1, CELL + 2, CELL + 2);
  ctx.fillStyle = "#162d40"; ctx.fillRect(e.x * CELL, e.y * CELL, CELL, CELL);
}

// AFTER
for (const e of gs.enemies) {
  const ex = e.visualX * CELL, ey = e.visualY * CELL;
  ctx.fillStyle = "#0a1824"; ctx.fillRect(ex - 1, ey - 1, CELL + 2, CELL + 2);
  ctx.fillStyle = "#162d40"; ctx.fillRect(ex, ey, CELL, CELL);
}
```

Lines 469–473 (big enemies):

```ts
// BEFORE
for (const be of gs.bigEnemies) {
  const bx = be.x * CELL, by = be.y * CELL, bw = CELL * 2;
  ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
  ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
}

// AFTER
for (const be of gs.bigEnemies) {
  const bx = be.visualX * CELL, by = be.visualY * CELL, bw = CELL * 2;
  ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
  ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
}
```

### Collision Detection Note

The logical `e.x / e.y` fields are still used for all collision and AI decisions — only the renderer reads `visualX/visualY`. Do not touch any collision or death checks. The visual slide is cosmetic only.

Also: the `dyingEnemies` system in `renderers.ts` (lines 436–460) reads `de.x * CELL` directly since those are snapshot positions captured at moment of death — that is correct and should not change.

---

## Summary of Files Modified

- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/engine.ts` — items 1, 3 (loadGame)
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/spawn.ts` — items 2, 3
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/state.ts` — item 4 (Enemy/BigEnemy interfaces, gs.enemyAnimRafId)
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/animation.ts` — item 4 (startEnemyAnimLoop, tickEnemyAnims)
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/ai.ts` — item 4 (call startEnemyAnimLoop)
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/renderers.ts` — item 4 (visual positions in draw)
