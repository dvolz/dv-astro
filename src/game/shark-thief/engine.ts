// ===== GameEngine =====  →  GameEngine.swift
// Core game logic: init, moveShark, endGame, depth transitions, dying-enemy dissolve.

import { GRID, DYING_DURATION } from "./config";
import { LEVEL_CONFIG } from "./level-config";
import { gs } from "./state";
import { leviathanCollision } from "./collision";
import { spawnEnemy, spawnBigEnemy, spawnCoral, spawnLeviathan, spawnAmmoniteIfNeeded, spawnCoralPickupIfNeeded, spawnSharkEgg, spawnFrozenFishIfNeeded, seedIcePatches } from "./spawn";
import { resolveSlide } from "./slide";
import { moveEnemiesAI, moveLeviathanAI } from "./ai";
import {
  getHighScore, saveHighScore, getSharkBest, saveSharkBest,
  calcSharkScore, saveGame, clearSave, updateMaxDepth,
} from "./persistence";
import { draw, initRenderer } from "./renderers";
import { startSharkAnim, startBounceAnim, tickShimmer } from "./animation";
import { getHudScore, getHudTimeEl, getHudLvTime, stopHudClock, startHudClock, updateHudDepth, formatClockSec } from "./hud";
import { randomColorFromPalette } from "./config";

// ── Dying-enemy dissolve loop ─────────────────────────────────────────────

export function startDyingLoop(): void {
  if (gs.dyingRafId) return;
  function tick() {
    const now = performance.now();
    gs.dyingEnemies = gs.dyingEnemies.filter(de => now - de.startTime < DYING_DURATION);
    draw();
    if (gs.dyingEnemies.length > 0) {
      gs.dyingRafId = requestAnimationFrame(tick);
    } else {
      gs.dyingRafId = null;
    }
  }
  gs.dyingRafId = requestAnimationFrame(tick);
}

// ── Keep the N farthest enemies, dissolve the rest ───────────────────────

export function clearCloseEnemies(keepN: number): void {
  type EnemyRef = { x: number; y: number; isBig: boolean };
  const all: EnemyRef[] = [
    ...gs.enemies.map(e => ({ x: e.x, y: e.y, isBig: false })),
    ...gs.bigEnemies.map(e => ({ x: e.x, y: e.y, isBig: true })),
  ];
  if (all.length === 0) return;

  const dist = (p: EnemyRef) => Math.abs(p.x - gs.shark.x) + Math.abs(p.y - gs.shark.y);

  all.sort((a, b) => dist(b) - dist(a)); // farthest first
  const keep     = new Set(all.slice(0, keepN).map(p => `${p.x},${p.y},${p.isBig}`));
  const toRemove = all.filter(p => !keep.has(`${p.x},${p.y},${p.isBig}`));
  if (toRemove.length === 0) return;

  // Stagger: closest enemies disappear first (0 ms), farthest-removed last (200 ms)
  const maxD = Math.max(...toRemove.map(dist));
  const minD = Math.min(...toRemove.map(dist));
  const range = Math.max(1, maxD - minD);
  const now = performance.now();

  for (const p of toRemove) {
    const delay = ((dist(p) - minD) / range) * 200;
    gs.dyingEnemies.push({ x: p.x, y: p.y, isBig: p.isBig, startTime: now + delay });
  }

  gs.enemies    = gs.enemies.filter(e  => keep.has(`${e.x},${e.y},false`));
  gs.bigEnemies = gs.bigEnemies.filter(e => keep.has(`${e.x},${e.y},true`));

  startDyingLoop();
}

// ── Depth transition ──────────────────────────────────────────────────────

export function checkDepthTransition(): void {
  if (gs.currentDepth >= 5) return;
  if (gs.score < gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore) return;

  gs.levelTimes.push(performance.now() - gs.levelStartTime);
  gs.levelStartTime = performance.now();
  gs.currentDepth++;
  gs.depthEntryScore = gs.score;
  updateHudDepth(gs.currentDepth);

  const flash = document.getElementById("depthFlash")!;
  flash.textContent = `DEPTH ${gs.currentDepth}`;
  flash.classList.remove("flashing");
  void (flash as HTMLElement).offsetWidth;
  flash.classList.add("flashing");

  const wrapper = document.getElementById("gameDepthWrapper")!;
  wrapper.className = `game-depth-wrapper depth-${gs.currentDepth}`;

  updateMaxDepth(gs.currentDepth);

  if (gs.currentDepth === 2) {
    const keep2 = LEVEL_CONFIG[gs.currentDepth].enemyKeep;
    clearCloseEnemies(keep2);
    // Big enemies are a Depth 1 signature piece — dissolve any that survived
    for (const be of gs.bigEnemies) {
      gs.dyingEnemies.push({ x: be.x, y: be.y, isBig: true, startTime: performance.now() });
    }
    gs.bigEnemies = [];
    startDyingLoop();
    // Bring normal enemies back up to keep2
    while (gs.enemies.length < keep2) gs.enemies.push(spawnEnemy());
    for (let r = 0; r < GRID; r++) gs.superPickups[r].fill(false);
    gs.ammoniteMovesCounter = 0;
    gs.coralMovesCounter = 0;
    gs.colors = Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
    );
    spawnCoral();
    let placed = 0, attempts = 0;
    while (placed < (LEVEL_CONFIG[gs.currentDepth].coral?.initCount ?? 0) && attempts < 800) {
      attempts++;
      const cpx = Math.floor(Math.random() * GRID);
      const cpy = Math.floor(Math.random() * GRID);
      if (
        !gs.coralPickups[cpy][cpx] && !gs.pickups[cpy][cpx] &&
        !gs.superPickups[cpy][cpx] && !gs.coral[cpy][cpx] &&
        !(cpx === gs.shark.x && cpy === gs.shark.y)
      ) { gs.coralPickups[cpy][cpx] = true; placed++; }
    }
  } else if (gs.currentDepth === 3) {
    const keep3 = LEVEL_CONFIG[gs.currentDepth].enemyKeep;
    clearCloseEnemies(keep3);
    while (gs.enemies.length + gs.bigEnemies.length < keep3) gs.enemies.push(spawnEnemy());
    for (let r = 0; r < GRID; r++) {
      gs.coral[r].fill(false);
      gs.coralPickups[r].fill(false);
      gs.superPickups[r].fill(false);
    }
    gs.coralMovesCounter = 0;
    gs.sharkEgg = null;
    gs.eggMovesCounter = 0;
    gs.babySharks = [];
    gs.bloodCells = [];
    gs.sharkPositionHistory = [];
    if ((LEVEL_CONFIG[gs.currentDepth].egg?.initCount ?? 0) > 0) spawnSharkEgg();
  } else if (gs.currentDepth === 4) {
    const keep4 = LEVEL_CONFIG[gs.currentDepth].enemyKeep;
    clearCloseEnemies(keep4);
    // Clear Depth 3 signature pieces
    gs.sharkEgg = null;
    gs.babySharks = [];
    gs.bloodCells = [];
    gs.sharkPositionHistory = [];
    gs.eggMovesCounter = 0;
    gs.iceCells = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    seedIcePatches(LEVEL_CONFIG[gs.currentDepth].icePatches?.initialCount ?? 5);
    gs.colors = Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
    );
    // Ensure enemyKeep enemies on entry
    while (gs.enemies.length + gs.bigEnemies.length < keep4) gs.enemies.push(spawnEnemy());
    // Spawn initial frozen fish
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
    const fishInitCount = LEVEL_CONFIG[gs.currentDepth].frozenFish?.initCount ?? 0;
    for (let i = 0; i < fishInitCount; i++) spawnFrozenFishIfNeeded();
  } else {
    clearCloseEnemies(LEVEL_CONFIG[gs.currentDepth].enemyKeep);
    // Clear Depth 4 signature pieces
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
    gs.iceCells = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  }
}

// ── Init (fresh game from depth 1) ───────────────────────────────────────

export function init(): void {
  gs.score          = 0;
  gs.moveCount      = 0;
  gs.gameOver       = false;
  gs.currentDepth   = 1;
  gs.depthEntryScore = 0;
  gs.startedFromDepth1 = true;
  gs.gameStartTime  = performance.now();
  gs.levelStartTime = performance.now();
  gs.levelTimes     = [];
  gs.totalTimeMs    = 0;

  stopHudClock();
  getHudScore().textContent   = "0";
  getHudTimeEl().textContent  = "00:00";
  getHudLvTime().textContent  = "00:00";
  updateHudDepth(1);
  startHudClock(
    () => gs.gameStartTime,
    () => gs.levelStartTime,
    () => gs.gameOver,
  );
  document.getElementById("gameOverOverlay")!.classList.remove("visible");
  document.getElementById("gameDepthWrapper")!.className = "game-depth-wrapper depth-1";

  // Grid state
  gs.colors = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
  );
  gs.pickups = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => Math.random() < LEVEL_CONFIG[gs.currentDepth].coinInit),
  );
  gs.superPickups  = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  gs.coralPickups  = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  gs.coral         = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  gs.ammoniteMovesCounter = 0;
  gs.coralMovesCounter    = 0;

  // Enemy state
  gs.bigEnemies = [];
  gs.leviathan  = null;
  gs.babySharks = [];
  gs.bloodCells = [];
  gs.sharkEgg   = null;
  gs.iceCells   = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  gs.frozenFish = [];
  gs.frozenFishMovesCounter = 0;

  // Shark position
  gs.shark.x = Math.floor(Math.random() * GRID);
  gs.shark.y = Math.floor(Math.random() * GRID);
  gs.pickups[gs.shark.y][gs.shark.x]      = false;
  gs.superPickups[gs.shark.y][gs.shark.x] = false;
  gs.sharkPrevX = gs.shark.x;
  gs.sharkPrevY = gs.shark.y;
  gs.sharkPositionHistory = [];

  const initAmmonites = LEVEL_CONFIG[gs.currentDepth].ammonite?.initCount ?? 0;
  for (let i = 0; i < initAmmonites; i++) spawnAmmoniteIfNeeded();

  gs.sharkVisualX = gs.shark.x;
  gs.sharkVisualY = gs.shark.y;

  gs.highScore = getHighScore();

  // Reset dying-enemy animation
  gs.dyingEnemies = [];
  if (gs.dyingRafId) { cancelAnimationFrame(gs.dyingRafId); gs.dyingRafId = null; }
  if (gs.enemyAnimRafId) { cancelAnimationFrame(gs.enemyAnimRafId); gs.enemyAnimRafId = null; }

  // Reset shimmer
  gs.shimmerIntensity.fill(0);
  gs.shimmerSpeed.fill(0);
  if (gs.shimmerRafId) cancelAnimationFrame(gs.shimmerRafId);
  if (gs.shimmerMode) gs.shimmerRafId = requestAnimationFrame(tickShimmer);

  gs.enemies = [spawnEnemy()];
  draw();
}

// ── Move shark one step ───────────────────────────────────────────────────

export function moveShark(dx: number, dy: number): void {
  if (gs.gameOver) return;

  const nx = gs.shark.x + dx;
  const ny = gs.shark.y + dy;

  if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) return;
  if (gs.coral[ny][nx]) return;

  // Coral shell: running into it hardens it into a barrier
  if (gs.coralPickups[ny][nx]) {
    if (dx === 1) gs.sharkDir = "right";
    else if (dx === -1) gs.sharkDir = "left";
    else if (dy === 1) gs.sharkDir = "down";
    else if (dy === -1) gs.sharkDir = "up";
    gs.coralPickups[ny][nx] = false;
    gs.coral[ny][nx] = true;
    gs.score += LEVEL_CONFIG[gs.currentDepth].coral?.points ?? 5;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    getHudScore().textContent = String(gs.score);
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
    startBounceAnim(nx, ny);
    saveGame();
    return;
  }

  gs.sharkPrevX = gs.shark.x;
  gs.sharkPrevY = gs.shark.y;
  gs.sharkPositionHistory.unshift({ x: gs.sharkPrevX, y: gs.sharkPrevY });
  if (gs.sharkPositionHistory.length > 40) gs.sharkPositionHistory.pop();

  gs.shark.x = nx;
  gs.shark.y = ny;
  gs.moveCount++;

  if (dx === 1) gs.sharkDir = "right";
  else if (dx === -1) gs.sharkDir = "left";
  else if (dy === 1) gs.sharkDir = "down";
  else if (dy === -1) gs.sharkDir = "up";

  // Ice slide (Depth 4): if the shark lands on an ice cell, slide to terminal
  if (gs.iceCells[gs.shark.y]?.[gs.shark.x]) {
    const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
      const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
        gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
      if (hitEnemy) return "stop";
      // Collect coins mid-slide
      if (gs.pickups[cy][cx]) {
        gs.pickups[cy][cx] = false;
        gs.score++;
        gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
        getHudScore().textContent = String(gs.score);
        gs.enemies.push(spawnEnemy());
        checkDepthTransition();
      }
      return "continue";
    });
    gs.shark.x = slide.x;
    gs.shark.y = slide.y;
    // If the terminal cell contains an enemy, trigger death
    const termEnemyHit =
      gs.enemies.some(e => e.x === gs.shark.x && e.y === gs.shark.y) ||
      gs.bigEnemies.some(be =>
        gs.shark.x >= be.x && gs.shark.x <= be.x + 1 &&
        gs.shark.y >= be.y && gs.shark.y <= be.y + 1,
      );
    if (termEnemyHit) { endGame(); return; }
  }

  // Baby sharks follow position history chain
  for (let i = 0; i < gs.babySharks.length; i++) {
    const target = gs.sharkPositionHistory[i];
    if (!target) continue;
    const b = gs.babySharks[i];
    const diffX = target.x - b.x, diffY = target.y - b.y;
    if (diffX === 0 && diffY === 0) continue;
    if (Math.abs(diffX) >= Math.abs(diffY)) b.x += Math.sign(diffX);
    else b.y += Math.sign(diffY);
  }

  // Coin pickup
  if (gs.pickups[ny][nx]) {
    gs.pickups[ny][nx] = false;
    gs.score++;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    getHudScore().textContent = String(gs.score);
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
  }

  // Super pickup (ammonite → big enemy)
  if (gs.superPickups[ny][nx]) {
    gs.superPickups[ny][nx] = false;
    gs.ammoniteMovesCounter = 0;
    gs.score += LEVEL_CONFIG[gs.currentDepth].ammonite?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    getHudScore().textContent = String(gs.score);
    gs.bigEnemies.push(spawnBigEnemy());
    checkDepthTransition();
  }

  // Shark egg (hatches baby)
  if (gs.sharkEgg && gs.shark.x === gs.sharkEgg.x && gs.shark.y === gs.sharkEgg.y) {
    gs.sharkEgg = null;
    gs.score += LEVEL_CONFIG[gs.currentDepth].egg?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    getHudScore().textContent = String(gs.score);
    gs.enemies.push(spawnEnemy());
    // Capture egg interval before transition may change currentDepth
    const eggInterval = LEVEL_CONFIG[gs.currentDepth].egg?.interval ?? 0;
    checkDepthTransition();
    gs.babySharks.unshift({ x: gs.sharkPrevX, y: gs.sharkPrevY });
    // Only respawn egg if this depth still has egg config (guards against depth transition mid-block)
    if (LEVEL_CONFIG[gs.currentDepth].egg) {
      if (eggInterval === 0) {
        spawnSharkEgg();
      } else {
        gs.eggMovesCounter = 0;
      }
    }
  }

  // Frozen fish (Depth 4 — Arctic)
  const collectedFishIdx = gs.frozenFish.findIndex(f => f.x === gs.shark.x && f.y === gs.shark.y);
  if (collectedFishIdx !== -1) {
    // Step 1: Award points
    gs.score += LEVEL_CONFIG[gs.currentDepth].frozenFish?.points ?? 5;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    getHudScore().textContent = String(gs.score);

    // Step 2: Spawn 1 new enemy
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();

    // Step 3: Remove the fish, convert tile + cardinal neighbours to ice (+ pattern)
    const fx = gs.shark.x, fy = gs.shark.y;
    gs.frozenFish.splice(collectedFishIdx, 1);
    gs.frozenFishMovesCounter = 0;
    for (const [ox, oy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = fx + ox, ny = fy + oy;
      if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) gs.iceCells[ny][nx] = true;
    }

    // Step 4: Slide the shark in the direction of the move that landed here
    const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
      const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
        gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
      if (hitEnemy) return "stop";
      // Collect coins mid-slide
      if (gs.pickups[cy][cx]) {
        gs.pickups[cy][cx] = false;
        gs.score++;
        gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
        getHudScore().textContent = String(gs.score);
        gs.enemies.push(spawnEnemy());
        checkDepthTransition();
      }
      return "continue";
    });

    gs.shark.x = slide.x;
    gs.shark.y = slide.y;

    // Step 5: If terminal cell contains an enemy, it's death
    const termEnemyHit =
      gs.enemies.some(e => e.x === gs.shark.x && e.y === gs.shark.y) ||
      gs.bigEnemies.some(be =>
        gs.shark.x >= be.x && gs.shark.x <= be.x + 1 &&
        gs.shark.y >= be.y && gs.shark.y <= be.y + 1,
      );
    if (termEnemyHit) { endGame(); return; }

    // Step 6: Respawn fish at new valid location
    spawnFrozenFishIfNeeded();
  }

  // Coin growth (random per-cell rate)
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (!gs.pickups[r][c] && !gs.superPickups[r][c] && !gs.coralPickups[r][c] && !gs.coral[r][c] && Math.random() < LEVEL_CONFIG[gs.currentDepth].coinRate)
        gs.pickups[r][c] = true;

  // Shell spawn counters (driven by level config — active only if the section is defined)
  const depthCfg = LEVEL_CONFIG[gs.currentDepth];
  if (depthCfg.ammonite) {
    gs.ammoniteMovesCounter++;
    if (gs.ammoniteMovesCounter >= depthCfg.ammonite.interval) spawnAmmoniteIfNeeded();
  }
  if (depthCfg.coral) {
    gs.coralMovesCounter++;
    if (gs.coralMovesCounter >= depthCfg.coral.interval) spawnCoralPickupIfNeeded();
  }
  if (depthCfg.egg?.interval && gs.sharkEgg === null) {
    gs.eggMovesCounter++;
    if (gs.eggMovesCounter >= depthCfg.egg.interval) spawnSharkEgg();
  }
  if (depthCfg.frozenFish && gs.frozenFish.length < depthCfg.frozenFish.max) {
    gs.frozenFishMovesCounter++;
    if (gs.frozenFishMovesCounter >= depthCfg.frozenFish.interval) {
      spawnFrozenFishIfNeeded();
      gs.frozenFishMovesCounter = 0;
    }
  }

  // Enemy AI — regular + big every 2 player moves
  if (gs.moveCount % 2 === 0) moveEnemiesAI();

  // Leviathan moves every player move (Depth 4)
  moveLeviathanAI();

  // Depth 3: baby shark eaten by enemy?
  for (let i = gs.babySharks.length - 1; i >= 0; i--) {
    const b = gs.babySharks[i];
    const eaten =
      gs.enemies.some(e => e.x === b.x && e.y === b.y) ||
      gs.bigEnemies.some(be => b.x >= be.x && b.x <= be.x + 1 && b.y >= be.y && b.y <= be.y + 1);
    if (eaten) {
      gs.bloodCells.push({ x: b.x, y: b.y, movesRemaining: 20 });
      gs.babySharks.splice(i, 1);
      gs.score = Math.max(0, gs.score - (LEVEL_CONFIG[gs.currentDepth].egg?.babyPenalty ?? 5));
      getHudScore().textContent = String(gs.score);
    }
  }
  gs.bloodCells.forEach(bc => bc.movesRemaining--);
  gs.bloodCells = gs.bloodCells.filter(bc => bc.movesRemaining > 0);

  // Death checks
  for (const e of gs.enemies)
    if (e.x === gs.shark.x && e.y === gs.shark.y) { endGame(); return; }
  for (const be of gs.bigEnemies)
    if (gs.shark.x >= be.x && gs.shark.x <= be.x + 1 && gs.shark.y >= be.y && gs.shark.y <= be.y + 1) { endGame(); return; }
  if (leviathanCollision(gs.shark, gs.leviathan)) { endGame(); return; }

  saveGame();
  startSharkAnim();
}

// ── End game ──────────────────────────────────────────────────────────────

export function endGame(): void {
  gs.gameOver = true;
  gs.totalTimeMs = performance.now() - gs.gameStartTime;
  const currentLevelElapsedMs = performance.now() - gs.levelStartTime;
  stopHudClock();
  getHudTimeEl().textContent = formatClockSec(Math.floor(gs.totalTimeMs / 1000));
  getHudLvTime().textContent = formatClockSec(Math.floor(currentLevelElapsedMs / 1000));
  clearSave();
  gs.sharkVisualX = gs.shark.x;
  gs.sharkVisualY = gs.shark.y;
  draw();

  if (gs.score > gs.highScore) {
    gs.highScore = gs.score;
    saveHighScore(gs.highScore);
  }

  const sharkScore = gs.startedFromDepth1 ? calcSharkScore(gs.score, gs.totalTimeMs) : null;
  if (sharkScore !== null && sharkScore > getSharkBest()) saveSharkBest(sharkScore);

  document.getElementById("finalScore")!.textContent = String(gs.score);

  const sharkLineEl = document.getElementById("finalSharkScore");
  const sharkFormulaEl = document.getElementById("finalSharkScoreFormula");
  if (sharkLineEl) {
    if (sharkScore !== null) {
      sharkLineEl.textContent = `SHARK SCORE: ${sharkScore}`;
      sharkLineEl.style.opacity = "1";
      if (sharkFormulaEl) sharkFormulaEl.style.opacity = "1";
    } else {
      sharkLineEl.textContent = "SHARK SCORE: N/A (start from depth 1)";
      sharkLineEl.style.opacity = "0.45";
      if (sharkFormulaEl) sharkFormulaEl.style.opacity = "0";
    }
  }

  const submitPrompt = document.getElementById("submitPrompt")!;
  submitPrompt.style.display = gs.score > 0 ? "block" : "none";
  document.getElementById("nameInputRow")!.classList.remove("visible");
  (document.getElementById("submitScoreBtn") as HTMLButtonElement).disabled = false;
  document.getElementById("submitStatus")!.textContent = "";
  (document.getElementById("playerName") as HTMLInputElement).value =
    localStorage.getItem("sharkPlayerName") || "";
  document.getElementById("gameOverOverlay")!.classList.add("visible");
}

// ── Load saved game ───────────────────────────────────────────────────────

export function loadGame(save: any): void {
  const emptyRow = () => Array(GRID).fill(false);
  gs.pickups     = [];
  gs.superPickups = [];
  gs.coralPickups = [];
  gs.coral       = [];
  gs.colors      = [];
  for (let r = 0; r < GRID; r++) {
    gs.pickups.push(Array.from(save.pickups.slice(r * GRID, (r + 1) * GRID)));
    gs.superPickups.push(Array.from(save.superPickups.slice(r * GRID, (r + 1) * GRID)));
    gs.coralPickups.push(Array.from(
      (save.coralPickups || []).slice(r * GRID, (r + 1) * GRID).concat(emptyRow()).slice(0, GRID),
    ));
    gs.coral.push(Array.from(save.coral.slice(r * GRID, (r + 1) * GRID)));
    gs.colors.push(Array.from(save.colors.slice(r * GRID, (r + 1) * GRID)));
  }

  gs.shark         = { ...save.shark };
  gs.sharkDir      = save.sharkDir || "right";
  gs.sharkVisualX  = gs.shark.x;
  gs.sharkVisualY  = gs.shark.y;
  gs.score         = save.score || 0;
  gs.currentDepth  = save.currentDepth || 1;
  gs.depthEntryScore = save.depthEntryScore ?? (gs.currentDepth - 1) * 100;
  gs.moveCount     = save.moveCount || 0;
  gs.enemies = (save.enemies || []).map((e: any) => ({
    ...e, visualX: e.x, visualY: e.y, animFromX: e.x, animFromY: e.y, animStartTime: 0,
  }));
  gs.bigEnemies = (save.bigEnemies || []).map((e: any) => ({
    ...e, visualX: e.x, visualY: e.y, animFromX: e.x, animFromY: e.y, animStartTime: 0,
  }));
  gs.leviathan     = save.leviathan || null;
  gs.gameOver      = false;

  // Always re-seed ice from config rather than restoring from save — ensures
  // changes to icePatches.initialCount take effect without needing a fresh game.
  gs.iceCells = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  if (gs.currentDepth >= 4) {
    seedIcePatches(LEVEL_CONFIG[gs.currentDepth].icePatches?.initialCount ?? 5);
  }
  gs.frozenFish = save.frozenFish || [];
  gs.frozenFishMovesCounter = save.frozenFishMovesCounter || 0;

  gs.gameStartTime = performance.now() - (save.runElapsedMs || 0);
  gs.levelStartTime = performance.now() - (save.levelElapsedMs || 0);
  gs.levelTimes    = save.levelTimes || [];
  gs.totalTimeMs   = 0;

  getHudScore().textContent = String(gs.score);
  gs.highScore = getHighScore();
  updateHudDepth(gs.currentDepth);
  startHudClock(
    () => gs.gameStartTime,
    () => gs.levelStartTime,
    () => gs.gameOver,
  );
  document.getElementById("gameDepthWrapper")!.className = `game-depth-wrapper depth-${gs.currentDepth}`;

  gs.dyingEnemies = [];
  if (gs.dyingRafId) { cancelAnimationFrame(gs.dyingRafId); gs.dyingRafId = null; }
  if (gs.enemyAnimRafId) { cancelAnimationFrame(gs.enemyAnimRafId); gs.enemyAnimRafId = null; }

  gs.shimmerIntensity.fill(0);
  gs.shimmerSpeed.fill(0);
  if (gs.shimmerRafId) cancelAnimationFrame(gs.shimmerRafId);
  if (gs.shimmerMode) gs.shimmerRafId = requestAnimationFrame(tickShimmer);

  document.getElementById("gameOverOverlay")!.classList.remove("visible");
  draw();
}

// ── Init at a specific depth (dev jump + menu depth selection) ────────────

export function initAtDepth(targetDepth: number): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  gs.CELL = canvas.width / GRID;
  initRenderer(canvas);
  showGameScreen();
  init();
  if (targetDepth > 1) gs.startedFromDepth1 = false;

  const wrapper = document.getElementById("gameDepthWrapper")!;
  if (targetDepth >= 2) {
    gs.currentDepth = 2;
    updateHudDepth(2);
    wrapper.className = "game-depth-wrapper depth-2";
    for (let r = 0; r < GRID; r++) gs.superPickups[r].fill(false);
    gs.colors = Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
    );
    spawnCoral();
    let placed = 0, attempts = 0;
    while (placed < (LEVEL_CONFIG[gs.currentDepth].coral?.initCount ?? 0) && attempts < 800) {
      attempts++;
      const cpx = Math.floor(Math.random() * GRID);
      const cpy = Math.floor(Math.random() * GRID);
      if (!gs.coralPickups[cpy][cpx] && !gs.pickups[cpy][cpx] && !gs.coral[cpy][cpx] && !(cpx === gs.shark.x && cpy === gs.shark.y)) {
        gs.coralPickups[cpy][cpx] = true; placed++;
      }
    }
    while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[gs.currentDepth].enemyKeep) gs.enemies.push(spawnEnemy());
  }
  if (targetDepth >= 3) {
    gs.currentDepth = 3;
    updateHudDepth(3);
    wrapper.className = "game-depth-wrapper depth-3";
    for (let r = 0; r < GRID; r++) {
      gs.coral[r].fill(false);
      gs.coralPickups[r].fill(false);
      gs.superPickups[r].fill(false);
    }
    gs.babySharks = [];
    gs.bloodCells = [];
    gs.sharkPositionHistory = [];
    if ((LEVEL_CONFIG[gs.currentDepth].egg?.initCount ?? 0) > 0) spawnSharkEgg();
    while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[gs.currentDepth].enemyKeep) gs.enemies.push(spawnEnemy());
  }
  if (targetDepth >= 4) {
    gs.currentDepth = 4;
    updateHudDepth(4);
    wrapper.className = "game-depth-wrapper depth-4";
    gs.sharkEgg  = null;
    gs.iceCells  = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    seedIcePatches(LEVEL_CONFIG[gs.currentDepth].icePatches?.initialCount ?? 5);
    gs.colors = Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => randomColorFromPalette(LEVEL_CONFIG[gs.currentDepth].tilePalette)),
    );
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
    const fishInit = LEVEL_CONFIG[gs.currentDepth].frozenFish?.initCount ?? 0;
    for (let i = 0; i < fishInit; i++) spawnFrozenFishIfNeeded();
    while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[gs.currentDepth].enemyKeep) gs.enemies.push(spawnEnemy());
  }
  if (targetDepth >= 5) {
    gs.currentDepth = 5;
    updateHudDepth(5);
    wrapper.className = "game-depth-wrapper depth-5";
    gs.iceCells   = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
    spawnLeviathan();
  }

  // Final trim+fill: intermediate depth blocks may have over- or under-shot the
  // target depth's enemyKeep (e.g. depth 3 fills to 10 but depth 4 wants 5).
  const finalKeep = LEVEL_CONFIG[targetDepth].enemyKeep;
  clearCloseEnemies(finalKeep);
  while (gs.enemies.length + gs.bigEnemies.length < finalKeep) gs.enemies.push(spawnEnemy());

  draw();
}

// ── Forward declaration — set by navigation.ts on boot ───────────────────
// Avoids a circular import between engine ↔ navigation.

let showGameScreen: () => void = () => {};
export function setShowGameScreen(fn: () => void): void { showGameScreen = fn; }
