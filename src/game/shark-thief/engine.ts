// ===== GameEngine =====  →  GameEngine.swift
// Core game logic: init, moveShark, endGame, depth transitions, dying-enemy dissolve.

import { GRID, DYING_DURATION } from "./config";
import { LEVEL_CONFIG, ICE_DEPTH, type DepthConfig } from "./level-config";
import { gs } from "./state";
import { leviathanCollision } from "./collision";
import { spawnEnemy, spawnBigEnemy, spawnCoral, spawnLeviathan, spawnAmmoniteIfNeeded, spawnCoralPickupIfNeeded, spawnSharkEgg, spawnFrozenFishIfNeeded, seedIcePatches, spawnToxicBarrelIfNeeded } from "./spawn";
import { resolveSlide } from "./slide";
import { moveEnemiesAI, moveLeviathanAI } from "./ai";
import {
  getHighScore, saveHighScore, getSharkBest, saveSharkBest,
  calcSharkScore, saveGame, clearSave, updateMaxDepth,
} from "./persistence";
import { draw, initRenderer } from "./renderers";
import { startSharkAnim, startBounceAnim, tickShimmer, tickCloudPulse } from "./animation";
import { updateHudScore, getHudTimeEl, getHudLvTime, stopHudClock, startHudClock, updateHudDepth, formatClockSec } from "./hud";
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

// ── Mechanic teardown / setup helpers ────────────────────────────────────

function teardownMechanic(cfg: DepthConfig): void {
  if (cfg.coral) {
    for (let r = 0; r < GRID; r++) {
      gs.coral[r].fill(false);
      gs.coralPickups[r].fill(false);
      gs.superPickups[r].fill(false);
    }
    gs.coralMovesCounter = 0;
  }
  if (cfg.egg) {
    gs.sharkEgg = null;
    gs.babySharks = [];
    gs.bloodCells = [];
    gs.sharkPositionHistory = [];
    gs.eggMovesCounter = 0;
  }
  if (cfg.icePatches || cfg.frozenFish) {
    gs.iceCells = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
  }
  if (cfg.toxicBarrel) {
    gs.toxicClouds = [];
    gs.toxicBarrels = [];
    gs.toxicBarrelMovesCounter = 0;
    gs.toxicContamination = [];
    gs.cloudPulse.fill(0);
    gs.cloudPulseSpeed.fill(0);
    if (gs.cloudPulseRafId) { cancelAnimationFrame(gs.cloudPulseRafId); gs.cloudPulseRafId = null; }
  }
}

function setupMechanic(cfg: DepthConfig): void {
  gs.colors = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => randomColorFromPalette(cfg.tilePalette)),
  );
  if (cfg.coral) {
    spawnCoral();
    let placed = 0, attempts = 0;
    while (placed < (cfg.coral.initCount ?? 0) && attempts < 800) {
      attempts++;
      const cpx = Math.floor(Math.random() * GRID);
      const cpy = Math.floor(Math.random() * GRID);
      if (!gs.coralPickups[cpy][cpx] && !gs.pickups[cpy][cpx] && !gs.superPickups[cpy][cpx] && !gs.coral[cpy][cpx] && !(cpx === gs.shark.x && cpy === gs.shark.y)) {
        gs.coralPickups[cpy][cpx] = true; placed++;
      }
    }
  }
  if (cfg.egg) {
    if ((cfg.egg.initCount ?? 0) > 0) spawnSharkEgg();
  }
  if (cfg.icePatches) {
    gs.iceCells = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    seedIcePatches(cfg.icePatches.initialCount ?? 5);
  }
  if (cfg.frozenFish) {
    gs.frozenFish = [];
    gs.frozenFishMovesCounter = 0;
    for (let i = 0; i < (cfg.frozenFish.initCount ?? 0); i++) spawnFrozenFishIfNeeded();
  }
  if (cfg.toxicBarrel) {
    gs.toxicClouds = [];
    gs.toxicBarrels = [];
    gs.toxicBarrelMovesCounter = 0;
    gs.toxicContamination = Array.from({ length: GRID }, () => Array(GRID).fill(0));
    for (let i = 0; i < (cfg.toxicBarrel.initCount ?? 0); i++) spawnToxicBarrelIfNeeded();
    gs.cloudPulse.fill(0);
    gs.cloudPulseSpeed.fill(0);
    if (gs.cloudPulseRafId) cancelAnimationFrame(gs.cloudPulseRafId);
    gs.cloudPulseRafId = requestAnimationFrame(tickCloudPulse);
  }
  if (cfg.ammonite) {
    gs.ammoniteMovesCounter = 0;
    for (let i = 0; i < (cfg.ammonite.initCount ?? 0); i++) spawnAmmoniteIfNeeded();
  }
}

// ── Toxic contamination spread ────────────────────────────────────────────

function pseudoRandFloat(r: number, c: number, seed: number): number {
  return (((r * 1619 + c * 31337 + seed * 2053) ^ (r * 7 + c * 13)) & 0xff) / 255;
}

function spreadToxicContamination(): void {
  const contam = gs.toxicContamination;
  if (!contam.length) return;

  const cloudSet = new Set(gs.toxicClouds.map(cl => `${cl.x},${cl.y}`));

  // Decay non-cloud cells so contamination fades if clouds move away
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (!cloudSet.has(`${c},${r}`)) contam[r][c] *= 0.97;

  // Anchor cloud cells at full contamination
  for (const { x, y } of gs.toxicClouds) contam[y][x] = 1.0;

  // One diffusion pass — write into a buffer to avoid in-place race
  const buf: number[][] = Array.from({ length: GRID }, (_, r) => contam[r].slice());
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const v = contam[r][c];
      if (v < 0.01) continue;
      const spread = v * 0.09;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID) continue;
        const jitter = 0.6 + 0.8 * pseudoRandFloat(nr, nc, gs.moveCount);
        buf[nr][nc] = Math.min(1.0, buf[nr][nc] + spread * jitter);
      }
    }
  }

  for (let r = 0; r < GRID; r++) contam[r] = buf[r];
  for (const { x, y } of gs.toxicClouds) contam[y][x] = 1.0;

  // Cap spread to 3–5 tiles from nearest cloud cell; per-cell variation for organic edges
  if (gs.toxicClouds.length > 0) {
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (contam[r][c] < 0.01 || cloudSet.has(`${c},${r}`)) continue;
        let minDist = Infinity;
        for (const { x, y } of gs.toxicClouds) {
          const d = Math.sqrt((c - x) ** 2 + (r - y) ** 2);
          if (d < minDist) minDist = d;
        }
        const maxRadius = 3 + pseudoRandFloat(r, c, 77) * 2; // 3.0–5.0, fixed per cell
        if (minDist >= maxRadius) {
          contam[r][c] = 0;
        } else if (minDist > maxRadius - 1.2) {
          contam[r][c] *= (maxRadius - minDist) / 1.2; // soft fade at boundary
        }
      }
    }
  }
}

// ── Depth transition ──────────────────────────────────────────────────────

export function checkDepthTransition(): void {
  if (gs.currentDepth >= 6) return;
  if (gs.score < gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore) return;

  gs.levelTimes.push(performance.now() - gs.levelStartTime);
  gs.levelStartTime = performance.now();
  const prevDepth = gs.currentDepth;
  gs.depthEntryScore = gs.score;

  const flash = document.getElementById("depthFlash")!;
  flash.textContent = `DEPTH ${prevDepth + 1}`;
  flash.classList.remove("flashing");
  void (flash as HTMLElement).offsetWidth;
  flash.classList.add("flashing");

  const wrapper = document.getElementById("gameDepthWrapper")!;
  wrapper.className = `game-depth-wrapper depth-${prevDepth + 1}`;

  updateMaxDepth(prevDepth + 1);

  // Tear down the mechanic from the depth we're leaving
  teardownMechanic(LEVEL_CONFIG[prevDepth]);

  gs.currentDepth++;
  updateHudDepth(gs.currentDepth);

  // Depth 1 (Shallows) special exit: dissolve big enemies and clear super pickups
  if (prevDepth === 1) {
    for (const be of gs.bigEnemies) {
      gs.dyingEnemies.push({ x: be.x, y: be.y, isBig: true, startTime: performance.now() });
    }
    gs.bigEnemies = [];
    startDyingLoop();
    for (let r = 0; r < GRID; r++) gs.superPickups[r].fill(false);
    gs.ammoniteMovesCounter = 0;
  }

  clearCloseEnemies(LEVEL_CONFIG[gs.currentDepth].enemyKeep);
  while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[gs.currentDepth].enemyKeep) gs.enemies.push(spawnEnemy());

  setupMechanic(LEVEL_CONFIG[gs.currentDepth]);

  // Depth 6 always spawns the leviathan
  if (gs.currentDepth === 6) spawnLeviathan();
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
  updateHudScore(0, "none");
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
  const flash = document.getElementById("depthFlash")!;
  flash.classList.remove("flashing");
  flash.textContent = "";

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
  gs.toxicClouds              = [];
  gs.toxicBarrels             = [];
  gs.toxicBarrelMovesCounter  = 0;
  gs.toxicContamination       = [];

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

  // Reset cloud pulse
  gs.cloudPulse.fill(0);
  gs.cloudPulseSpeed.fill(0);
  if (gs.cloudPulseRafId) cancelAnimationFrame(gs.cloudPulseRafId);
  if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel) gs.cloudPulseRafId = requestAnimationFrame(tickCloudPulse);

  gs.enemies = [spawnEnemy()];
  draw();
}

// ── Mid-slide coin collection (shared by ice-slide and frozen-fish-slide) ──

function collectCoinMidSlide(cx: number, cy: number): void {
  gs.pickups[cy][cx] = false;
  gs.score++;
  gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
  updateHudScore(gs.score);
  gs.enemies.push(spawnEnemy());
  checkDepthTransition();
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
    updateHudScore(gs.score, "special");
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
      if (gs.pickups[cy][cx]) collectCoinMidSlide(cx, cy);
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
    updateHudScore(gs.score);
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
  }

  // Super pickup (ammonite → big enemy)
  if (gs.superPickups[ny][nx]) {
    gs.superPickups[ny][nx] = false;
    gs.ammoniteMovesCounter = 0;
    gs.score += LEVEL_CONFIG[gs.currentDepth].ammonite?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.bigEnemies.push(spawnBigEnemy());
    checkDepthTransition();
  }

  // Shark egg (hatches baby)
  if (gs.sharkEgg && gs.shark.x === gs.sharkEgg.x && gs.shark.y === gs.sharkEgg.y) {
    gs.sharkEgg = null;
    gs.score += LEVEL_CONFIG[gs.currentDepth].egg?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.enemies.push(spawnEnemy());
    // Capture egg interval before transition may change currentDepth
    const eggInterval = LEVEL_CONFIG[gs.currentDepth].egg?.interval ?? 0;
    checkDepthTransition();
    // Only hatch and respawn if still on a depth that has egg config (guards against transition mid-block)
    if (LEVEL_CONFIG[gs.currentDepth].egg)
      gs.babySharks.unshift({ x: gs.sharkPrevX, y: gs.sharkPrevY });
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
    updateHudScore(gs.score, "special");

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
      if (gs.pickups[cy][cx]) collectCoinMidSlide(cx, cy);
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

  // Toxic barrel (Toxic depth)
  if (!!LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel) {
    const barrelIdx = gs.toxicBarrels.findIndex(b => b.x === gs.shark.x && b.y === gs.shark.y);
    if (barrelIdx !== -1) {
      gs.score += LEVEL_CONFIG[gs.currentDepth].toxicBarrel?.points ?? 8;
      gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
      updateHudScore(gs.score, "special");
      gs.enemies.push(spawnEnemy());
      checkDepthTransition();
      const { x: bx, y: by } = gs.toxicBarrels[barrelIdx];
      gs.toxicBarrels.splice(barrelIdx, 1);
      gs.toxicBarrelMovesCounter = 0;
      // Expand cloud — cloudSize×cloudSize minus 4 corners
      const cloudSize = LEVEL_CONFIG[gs.currentDepth].toxicBarrel?.cloudSize ?? 4;
      const lo = -Math.floor((cloudSize - 1) / 2);
      const hi =  Math.ceil((cloudSize - 1) / 2);
      for (let dy = lo; dy <= hi; dy++) {
        for (let dx = lo; dx <= hi; dx++) {
          if ((dx === lo || dx === hi) && (dy === lo || dy === hi)) continue; // skip corners
          const cx = bx + dx, cy = by + dy;
          if (cx < 0 || cx >= GRID || cy < 0 || cy >= GRID) continue;
          gs.toxicClouds.push({ x: cx, y: cy });
        }
      }
    }
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
  if (depthCfg.toxicBarrel && gs.toxicBarrels.length < depthCfg.toxicBarrel.max) {
    gs.toxicBarrelMovesCounter++;
    if (gs.toxicBarrelMovesCounter >= depthCfg.toxicBarrel.interval) {
      spawnToxicBarrelIfNeeded();
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
      gs.sharkPositionHistory.splice(i, 1); // close the gap so babies behind re-form immediately
      gs.score = Math.max(0, gs.score - (LEVEL_CONFIG[gs.currentDepth].egg?.babyPenalty ?? 5));
      updateHudScore(gs.score, "penalty");
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

  if (depthCfg.toxicBarrel) spreadToxicContamination();

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
  if (gs.currentDepth >= ICE_DEPTH) {
    seedIcePatches(LEVEL_CONFIG[gs.currentDepth].icePatches?.initialCount ?? 5);
  }
  gs.frozenFish = save.frozenFish || [];
  gs.frozenFishMovesCounter = save.frozenFishMovesCounter || 0;

  gs.gameStartTime = performance.now() - (save.runElapsedMs || 0);
  gs.levelStartTime = performance.now() - (save.levelElapsedMs || 0);
  gs.levelTimes    = save.levelTimes || [];
  gs.totalTimeMs   = 0;

  updateHudScore(gs.score, "none");
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

  gs.cloudPulse.fill(0);
  gs.cloudPulseSpeed.fill(0);
  if (gs.cloudPulseRafId) cancelAnimationFrame(gs.cloudPulseRafId);
  if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel) {
    gs.toxicContamination = Array.from({ length: GRID }, () => Array(GRID).fill(0));
    gs.cloudPulseRafId = requestAnimationFrame(tickCloudPulse);
  } else {
    gs.toxicContamination = [];
  }

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
  for (let d = 2; d <= targetDepth; d++) {
    if (d > 2) teardownMechanic(LEVEL_CONFIG[d - 1]);
    // Depth 1 special exit: clear big enemies and super pickups
    if (d === 2) {
      gs.bigEnemies = [];
      for (let r = 0; r < GRID; r++) gs.superPickups[r].fill(false);
      gs.ammoniteMovesCounter = 0;
    }
    gs.currentDepth = d;
    updateHudDepth(d);
    wrapper.className = `game-depth-wrapper depth-${d}`;
    setupMechanic(LEVEL_CONFIG[d]);
    if (d === 6) spawnLeviathan();
    while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[d].enemyKeep) gs.enemies.push(spawnEnemy());
  }

  // Final reset: discard all intermediate enemies and spawn exactly what the target depth wants.
  // Avoids the dissolve animation firing at init time when intermediate blocks overshoot
  // (e.g. depth 3 fills to 10 but depth 4 only wants 5).
  const finalKeep = LEVEL_CONFIG[targetDepth].enemyKeep;
  gs.enemies    = [];
  gs.bigEnemies = [];
  while (gs.enemies.length < finalKeep) gs.enemies.push(spawnEnemy());

  draw();
}

// ── Forward declaration — set by navigation.ts on boot ───────────────────
// Avoids a circular import between engine ↔ navigation.

let showGameScreen: () => void = () => {};
export function setShowGameScreen(fn: () => void): void { showGameScreen = fn; }
