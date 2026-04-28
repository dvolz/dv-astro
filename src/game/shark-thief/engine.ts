// ===== GameEngine =====  →  GameEngine.swift
// Core game logic: init, moveShark, endGame, depth transitions, dying-enemy dissolve.

import { GRID, DYING_DURATION, RISING_DURATION, BUBBLE_POP_COLORS } from "./config";
import { LEVEL_CONFIG, PACIFIC_DEPTH, ELECTRIC_DEPTH, TURTLE_MIGRATION_DEPTH, ABYSS_DEPTH, type DepthConfig } from "./level-config";
import { gs, type DyingPickup } from "./state";
import { leviathanCollision } from "./collision";
import { spawnEnemy, spawnBigEnemy, spawnCoral, spawnLeviathan, spawnAmmoniteIfNeeded, spawnCoralPickupIfNeeded, spawnSharkEgg, spawnFrozenFishIfNeeded, seedIcePatches, spawnToxicBarrelIfNeeded, seedNeutralFish, seedKelp, seedSeagrass, spawnSingleNeutralFish, spawnAlgaeBallIfNeeded, seedElectricEels, spawnShrimpIfNeeded, spawnOneEel, seedTurtles, spawnTurtleFromLeft, spawnTurtleEggIfNeeded } from "./spawn";
import { resolveSlide } from "./slide";
import { moveEnemiesAI, moveLeviathanAI, moveNeutralFish, moveEels, moveTurtles, triggerShock, setEndGame } from "./ai";
import {
  getHighScore, saveHighScore, getSharkBest, saveSharkBest,
  calcSharkScore, saveGame, clearSave, updateMaxDepth,
} from "./persistence";
import { draw, initRenderer } from "./renderers";
import { startSharkAnim, startBounceAnim, tickShimmer, tickCloudPulse, startEnemyAnimLoop, startBubblePopLoop } from "./animation";
import { updateHudScore, getHudTimeEl, getHudLvTime, stopHudClock, startHudClock, updateHudDepth, formatClockSec } from "./hud";
import { randomColorFromPalette } from "./config";

// ── Dying-enemy dissolve loop ─────────────────────────────────────────────

export function startDyingLoop(): void {
  if (gs.dyingRafId) return;
  function tick() {
    const now = performance.now();
    gs.dyingEnemies  = gs.dyingEnemies.filter(de => now - de.startTime < DYING_DURATION);
    gs.dyingPickups  = gs.dyingPickups.filter(dp => now - dp.startTime < DYING_DURATION);
    gs.risingPickups = gs.risingPickups.filter(rp => now - rp.startTime < RISING_DURATION);
    draw();
    if (gs.dyingEnemies.length > 0 || gs.dyingPickups.length > 0 || gs.risingPickups.length > 0) {
      gs.dyingRafId = requestAnimationFrame(tick);
    } else {
      gs.dyingRafId = null;
    }
  }
  gs.dyingRafId = requestAnimationFrame(tick);
}

// ── Bubble pop helper ─────────────────────────────────────────────────────

function triggerBubblePop(x: number, y: number): void {
  gs.bubblePops.push({
    x, y,
    startTime: performance.now(),
    color: BUBBLE_POP_COLORS[gs.currentDepth] ?? "#ffffff",
  });
  startBubblePopLoop();
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
  if (cfg.seagrass) {
    gs.seagrassCells = [];
    gs.seagrassSet   = new Set();
  }
  if (cfg.neutralFish || cfg.kelp) {
    gs.neutralFish     = [];
    gs.kelpCells       = [];
    gs.kelpSet         = new Set();
    gs.kelpBladders    = [];
    gs.kelpBladdersSet = new Set();
  }
  if (cfg.algaeBall) {
    gs.algaeBalls = [];
    gs.algaeBallRespawnTimers = [];
  }
  if (cfg.electricEel || cfg.shrimp) {
    gs.electricEels   = [];
    gs.shrimp         = [];
    gs.sharkShocked   = false;
    gs.shockVibrateX  = 0;
    gs.shockVibrateY  = 0;
    gs.postShockGrace = 0;
    if (gs.shockRafId) { cancelAnimationFrame(gs.shockRafId); gs.shockRafId = null; }
  }
  if (cfg.turtles) {
    gs.seaTurtles         = [];
    gs.turtleSpawnQueue   = 0;
    gs.turtleSpawnCounter = 0;
  }
  if (cfg.turtleEgg) {
    gs.turtleEggMovesCounter = 0;
    for (let r = 0; r < GRID; r++) gs.superPickups[r].fill(false);
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
  if (cfg.neutralFish) seedNeutralFish();
  if (cfg.seagrass)    seedSeagrass();
  if (cfg.kelp)        seedKelp();
  if (cfg.algaeBall) {
    gs.algaeBalls = [];
    gs.algaeBallRespawnTimers = [];
    for (let i = 0; i < cfg.algaeBall.count; i++) spawnAlgaeBallIfNeeded();
  }
  if (cfg.electricEel) {
    gs.electricEels  = [];
    gs.shrimp        = [];
    gs.sharkShocked  = false;
    gs.shockVibrateX = 0;
    gs.shockVibrateY = 0;
    seedElectricEels();
  }
  if (cfg.shrimp) {
    gs.shrimpMovesCounter = 0;
    for (let i = 0; i < cfg.shrimp.initCount; i++) spawnShrimpIfNeeded();
  }
  if (cfg.turtles) {
    gs.seaTurtles         = [];
    gs.turtleSpawnQueue   = 0;
    gs.turtleSpawnCounter = 0;
    seedTurtles();
  }
  if (cfg.turtleEgg) {
    gs.turtleEggMovesCounter = 0;
    for (let i = 0; i < cfg.turtleEgg.initCount; i++) spawnTurtleEggIfNeeded();
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

// ── Pickup dissolve / seed animations ────────────────────────────────────

function dissolvePickups(): void {
  const now = performance.now();
  const collected: Array<{ x: number; y: number; dist: number }> = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (gs.pickups[r][c]) {
        const dist = Math.abs(c - gs.shark.x) + Math.abs(r - gs.shark.y);
        collected.push({ x: c, y: r, dist });
        gs.pickups[r][c] = false;
      }
    }
  }
  // Sort so coins closest to shark dissolve first (ascending dist)
  collected.sort((a, b) => a.dist - b.dist);
  const maxDist = collected.length > 0 ? (collected[collected.length - 1].dist || 1) : 1;
  // Stagger over half the dying duration so they're gone well before DYING_DURATION
  const staggerWindow = DYING_DURATION * 0.5;
  gs.dyingPickups = collected.map(({ x, y, dist }) => ({
    x, y,
    startTime: now + (dist / maxDist) * staggerWindow,
  }));
}

function seedStartingYellows(): void {
  const count = LEVEL_CONFIG[gs.currentDepth].startingYellows;
  const now = performance.now();
  // Coins pop in after dissolve finishes + small buffer
  const popInStart = now + DYING_DURATION + 50;
  const popInWindow = RISING_DURATION * 1.5;
  gs.risingPickups = [];
  let placed = 0, attempts = 0;
  while (placed < count && attempts < 2000) {
    attempts++;
    const x = Math.floor(Math.random() * GRID);
    const y = Math.floor(Math.random() * GRID);
    if (
      gs.pickups[y][x] ||
      gs.superPickups[y][x] ||
      gs.coralPickups[y][x] ||
      gs.coral[y][x] ||
      (x === gs.shark.x && y === gs.shark.y) ||
      gs.enemies.some(e => e.x === x && e.y === y) ||
      gs.neutralFish.some(f => x >= f.x && x < f.x + f.effSizeX && y >= f.y && y < f.y + f.effSizeY)
    ) continue;
    gs.pickups[y][x] = true;
    // Stagger pop-in: random delay within window for a scattered appear effect
    gs.risingPickups.push({ x, y, startTime: popInStart + Math.random() * popInWindow });
    placed++;
  }
}

// ── Depth transition ──────────────────────────────────────────────────────

export function checkDepthTransition(): void {
  if (gs.currentDepth >= ABYSS_DEPTH) return;
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

  // Dissolve existing coins before transitioning
  dissolvePickups();

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

  // Seed new coins for this depth with pop-in animation
  seedStartingYellows();
  startDyingLoop();

  // Abyss always spawns the leviathan
  if (gs.currentDepth === ABYSS_DEPTH) spawnLeviathan();
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
  gs.pickups       = Array.from({ length: GRID }, () => Array(GRID).fill(false));
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
  gs.neutralFish              = [];
  gs.algaeBalls               = [];
  gs.algaeBallRespawnTimers   = [];
  gs.seagrassCells            = [];
  gs.seagrassSet              = new Set();
  gs.kelpCells                = [];
  gs.kelpSet                  = new Set();
  gs.electricEels             = [];
  gs.shrimp                   = [];
  gs.shrimpMovesCounter       = 0;
  gs.sharkShocked             = false;
  gs.shockVibrateX            = 0;
  gs.shockVibrateY            = 0;
  gs.postShockGrace           = 0;
  if (gs.shockRafId) { cancelAnimationFrame(gs.shockRafId); gs.shockRafId = null; }
  gs.seaTurtles           = [];
  gs.turtleSpawnQueue     = 0;
  gs.turtleSpawnCounter   = 0;
  gs.turtleEggMovesCounter = 0;

  // Shark position
  gs.shark.x = Math.floor(Math.random() * GRID);
  gs.shark.y = Math.floor(Math.random() * GRID);
  gs.superPickups[gs.shark.y][gs.shark.x] = false;
  gs.sharkPrevX = gs.shark.x;
  gs.sharkPrevY = gs.shark.y;
  gs.sharkPositionHistory = [];

  const initAmmonites = LEVEL_CONFIG[gs.currentDepth].ammonite?.initCount ?? 0;
  for (let i = 0; i < initAmmonites; i++) spawnAmmoniteIfNeeded();

  seedStartingYellows();

  gs.sharkVisualX = gs.shark.x;
  gs.sharkVisualY = gs.shark.y;

  gs.highScore = getHighScore();

  // Reset dying-enemy animation
  gs.dyingEnemies  = [];
  gs.dyingPickups  = [];
  gs.risingPickups = [];
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

  gs.kelpBladders    = [];
  gs.kelpBladdersSet = new Set();

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

function collectFishMidSlide(cx: number, cy: number): void {
  const idx = gs.frozenFish.findIndex(f => f.x === cx && f.y === cy);
  if (idx === -1) return;
  gs.frozenFish.splice(idx, 1);
  gs.score += LEVEL_CONFIG[gs.currentDepth].frozenFish?.points ?? 5;
  gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
  updateHudScore(gs.score, "special");
  gs.enemies.push(spawnEnemy());
  triggerBubblePop(cx, cy);
  checkDepthTransition();
  for (const [ox, oy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = cx + ox, ny = cy + oy;
    if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) gs.iceCells[ny][nx] = true;
  }
  spawnFrozenFishIfNeeded();
}

// ── Algae ball collection helper (Depth 6) ───────────────────────────────

function collectAlgaeBall(idx: number): void {
  const algaeCfg = LEVEL_CONFIG[gs.currentDepth].algaeBall!;
  const { x: ballX, y: ballY } = gs.algaeBalls[idx];
  gs.algaeBalls.splice(idx, 1);
  gs.algaeBallRespawnTimers.push(algaeCfg.respawnInterval);
  gs.score += algaeCfg.points;
  gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
  updateHudScore(gs.score, "special");
  gs.enemies.push(spawnEnemy());
  const fishTypes: Array<"mackerel" | "garibaldi" | "oarfish"> = ["mackerel", "garibaldi", "oarfish"];
  const fishCfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (fishCfg) {
    let spawnX = 0, spawnY = 0, fAttempts = 0;
    const fType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const fSpec = fishCfg[fType];
    do {
      spawnX = Math.floor(Math.random() * (GRID - fSpec.sizeX + 1));
      spawnY = Math.floor(Math.random() * (GRID - fSpec.sizeY + 1));
      fAttempts++;
      if (fAttempts > 500) break;
    } while (
      Math.abs(spawnX - gs.shark.x) + Math.abs(spawnY - gs.shark.y) < algaeCfg.fishSpawnBuffer ||
      gs.neutralFish.some(f =>
        spawnX < f.x + f.effSizeX && spawnX + fSpec.sizeX > f.x &&
        spawnY < f.y + f.effSizeY && spawnY + fSpec.sizeY > f.y
      ) ||
      gs.pickups[spawnY]?.[spawnX] ||
      gs.coral[spawnY]?.[spawnX]
    );
    if (fAttempts <= 500) {
      gs.neutralFish.push({
        type: fType, x: spawnX, y: spawnY, sizeX: fSpec.sizeX, sizeY: fSpec.sizeY,
        effSizeX: fSpec.sizeX, effSizeY: fSpec.sizeY,
        moveAccum: 0, dir: "right", lastX: spawnX, lastY: spawnY,
        visualX: spawnX, visualY: spawnY, animFromX: spawnX, animFromY: spawnY, animStartTime: 0,
      });
      gs.neutralFish[gs.neutralFish.length - 1].spawnTime = Date.now();
    }
  }
  triggerBubblePop(ballX, ballY);
  checkDepthTransition();
}

// ── Move shark one step ───────────────────────────────────────────────────

export function moveShark(dx: number, dy: number): void {
  if (gs.gameOver) return;
  if (gs.sharkShocked) return; // paralyzed during electric shock

  const setDir = () => {
    if (dx === 1) gs.sharkDir = "right";
    else if (dx === -1) gs.sharkDir = "left";
    else if (dy === 1) gs.sharkDir = "down";
    else if (dy === -1) gs.sharkDir = "up";
  };

  const nx = gs.shark.x + dx;
  const ny = gs.shark.y + dy;

  if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) return;
  if (gs.coral[ny][nx]) return;

  // Coral shell: running into it hardens it into a barrier
  if (gs.coralPickups[ny][nx]) {
    setDir();
    gs.coralPickups[ny][nx] = false;
    gs.coral[ny][nx] = true;
    gs.score += LEVEL_CONFIG[gs.currentDepth].coral?.points ?? 5;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.enemies.push(spawnEnemy());
    checkDepthTransition();
    triggerBubblePop(nx, ny);
    startBounceAnim(nx, ny);
    saveGame();
    return;
  }

  // Neutral fish: impassable (same rule as coral — move blocked)
  if (gs.neutralFish.length > 0) {
    const blocked = gs.neutralFish.some(f =>
      nx >= f.x && nx < f.x + f.effSizeX && ny >= f.y && ny < f.y + f.effSizeY
    );
    if (blocked) {
      // Update facing direction so the shark looks toward the fish
      setDir();
      startBounceAnim(nx, ny);
      return;  // move cancelled — same as coral bump, no score, no enemy, no move counter increment
    }
  }

  // Neutral turtles: impassable — no bounce animation (shark simply can't move into them)
  if (gs.seaTurtles.length > 0) {
    const blocked = gs.seaTurtles.some(t =>
      !t.aggressive &&
      nx >= t.x && nx < t.x + t.size && ny >= t.y && ny < t.y + t.size
    );
    if (blocked) {
      setDir();
      return;
    }
  }

  gs.sharkPrevX = gs.shark.x;
  gs.sharkPrevY = gs.shark.y;
  gs.sharkPositionHistory.unshift({ x: gs.sharkPrevX, y: gs.sharkPrevY });
  if (gs.sharkPositionHistory.length > 40) gs.sharkPositionHistory.pop();

  gs.shark.x = nx;
  gs.shark.y = ny;
  gs.moveCount++;

  setDir();

  // Ice slide (Depth 4): if the shark lands on an ice cell, slide to terminal.
  // Skip if there's a frozen fish here — the fish collection block below handles the slide.
  if (gs.iceCells[gs.shark.y]?.[gs.shark.x] && !gs.frozenFish.some(f => f.x === gs.shark.x && f.y === gs.shark.y)) {
    const slide = resolveSlide(gs.shark.x, gs.shark.y, dx, dy, (cx, cy) => {
      const hitEnemy = gs.enemies.some(e => e.x === cx && e.y === cy) ||
        gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1);
      if (hitEnemy) return "stop";
      if (gs.pickups[cy][cx]) collectCoinMidSlide(cx, cy);
      if (gs.frozenFish.some(f => f.x === cx && f.y === cy)) collectFishMidSlide(cx, cy);
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

  // Neutral fish movement (Depth 6 — Busy Pacific)
  if (LEVEL_CONFIG[gs.currentDepth].neutralFish) {
    moveNeutralFish();
    startEnemyAnimLoop();
  }

  // Turtle movement (Depth 8 — Turtle Migration)
  if (LEVEL_CONFIG[gs.currentDepth].turtles) {
    moveTurtles();
    startEnemyAnimLoop();
  }

  // Electric eel movement + shock check (Depth 7 — Electric)
  if (LEVEL_CONFIG[gs.currentDepth].electricEel) {
    moveEels();
    if (!gs.sharkShocked) {
      const shockHit = gs.electricEels.some(e =>
        e.segments.some(s => s.x === gs.shark.x && s.y === gs.shark.y),
      );
      if (shockHit) triggerShock();
    }
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

  // Shrimp pickup (Depth 7 — Electric)
  if (LEVEL_CONFIG[gs.currentDepth].shrimp) {
    const shrimpIdx = gs.shrimp.findIndex(p => p.x === gs.shark.x && p.y === gs.shark.y);
    if (shrimpIdx !== -1) {
      gs.shrimp.splice(shrimpIdx, 1);
      gs.score += LEVEL_CONFIG[gs.currentDepth].shrimp!.points;
      gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
      updateHudScore(gs.score, "special");
      spawnOneEel();
      gs.shrimpMovesCounter = 0;
      triggerBubblePop(gs.shark.x, gs.shark.y);
      checkDepthTransition();
    }
  }

  // Gas bladder pickup (Depth 6)
  const bladderKey = `${nx},${ny}`;
  if (gs.kelpBladdersSet.has(bladderKey)) {
    gs.kelpBladdersSet.delete(bladderKey);
    gs.kelpBladders = gs.kelpBladders.filter(b => !(b.x === nx && b.y === ny));
    gs.score += LEVEL_CONFIG[gs.currentDepth].kelp!.bladderPoints;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.enemies.push(spawnEnemy());
    const fishTypes: Array<"mackerel" | "garibaldi" | "oarfish"> = ["mackerel", "garibaldi", "oarfish"];
    spawnSingleNeutralFish(fishTypes[Math.floor(Math.random() * fishTypes.length)]);
    gs.neutralFish[gs.neutralFish.length - 1].spawnTime = Date.now();
    triggerBubblePop(nx, ny);
    checkDepthTransition();
  }

  // Algae balls (Depth 6 — Busy Pacific)
  const algaeCfg = LEVEL_CONFIG[gs.currentDepth].algaeBall;
  if (algaeCfg) {
    // Check collection before drifting — catches the swap case where shark moves
    // onto a ball that would drift away in the same turn.
    const collectedIdx = gs.algaeBalls.findIndex(b => b.x === gs.shark.x && b.y === gs.shark.y);
    if (collectedIdx !== -1) collectAlgaeBall(collectedIdx);

    // Drift each ball one cell to the right when accumulator reaches 1
    for (const ball of gs.algaeBalls) {
      ball.driftAccum += algaeCfg.driftSpeed;
      if (ball.driftAccum >= 1) {
        ball.driftAccum -= 1;
        ball.trail.unshift({ x: ball.x, y: ball.y });
        if (ball.trail.length > 5) ball.trail.length = 5;
        ball.x++;
      }
    }

    // Check again after drifting — catches the case where a ball drifts into the shark's cell.
    const driftCollectedIdx = gs.algaeBalls.findIndex(b => b.x === gs.shark.x && b.y === gs.shark.y);
    if (driftCollectedIdx !== -1) collectAlgaeBall(driftCollectedIdx);

    // Balls that drifted off the right edge: queue a respawn timer
    const escaped = gs.algaeBalls.filter(b => b.x >= GRID);
    for (let i = 0; i < escaped.length; i++) {
      gs.algaeBallRespawnTimers.push(algaeCfg.respawnInterval);
    }
    gs.algaeBalls = gs.algaeBalls.filter(b => b.x < GRID);

    // Decrement respawn timers; spawn a new ball when one hits 0
    gs.algaeBallRespawnTimers = gs.algaeBallRespawnTimers
      .map(t => t - 1)
      .filter(t => {
        if (t <= 0) { spawnAlgaeBallIfNeeded(); return false; }
        return true;
      });
  }

  // Super pickup (ammonite → big enemy)
  if (gs.superPickups[ny][nx] && LEVEL_CONFIG[gs.currentDepth].ammonite) {
    gs.superPickups[ny][nx] = false;
    gs.ammoniteMovesCounter = 0;
    gs.score += LEVEL_CONFIG[gs.currentDepth].ammonite?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.bigEnemies.push({ ...spawnBigEnemy(), spawnTime: Date.now() });
    triggerBubblePop(nx, ny);
    checkDepthTransition();
  }

  // Turtle egg (Depth 8 — turns nearest neutral turtle aggressive)
  if (gs.superPickups[ny][nx] && LEVEL_CONFIG[gs.currentDepth].turtleEgg) {
    gs.superPickups[ny][nx] = false;
    gs.turtleEggMovesCounter = 0;
    gs.score += LEVEL_CONFIG[gs.currentDepth].turtleEgg.points;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    triggerBubblePop(nx, ny);
    // Turn the nearest on-grid neutral turtle aggressive
    const neutral = gs.seaTurtles.filter(t => !t.aggressive && t.x >= 0);
    if (neutral.length > 0) {
      const nearest = neutral.reduce((a, b) =>
        Math.abs(a.x - nx) + Math.abs(a.y - ny) <= Math.abs(b.x - nx) + Math.abs(b.y - ny) ? a : b
      );
      nearest.aggressive = true;
      nearest.moveAccum = 0;
      // Replenish the neutral pool
      gs.turtleSpawnQueue++;
      gs.turtleSpawnCounter = 0;
    }
    checkDepthTransition();
  }

  // Shark egg (hatches baby)
  if (gs.sharkEgg && gs.shark.x === gs.sharkEgg.x && gs.shark.y === gs.sharkEgg.y) {
    gs.sharkEgg = null;
    gs.score += LEVEL_CONFIG[gs.currentDepth].egg?.points ?? 10;
    gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
    updateHudScore(gs.score, "special");
    gs.enemies.push(spawnEnemy());
    triggerBubblePop(gs.shark.x, gs.shark.y);
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
    triggerBubblePop(fx, fy);
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
      if (gs.pickups[cy][cx]) collectCoinMidSlide(cx, cy);
      if (gs.frozenFish.some(f => f.x === cx && f.y === cy)) collectFishMidSlide(cx, cy);
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
  if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel) {
    const barrelIdx = gs.toxicBarrels.findIndex(b => b.x === gs.shark.x && b.y === gs.shark.y);
    if (barrelIdx !== -1) {
      gs.score += LEVEL_CONFIG[gs.currentDepth].toxicBarrel?.points ?? 8;
      gs.score = Math.min(gs.score, gs.depthEntryScore + LEVEL_CONFIG[gs.currentDepth].descendScore);
      updateHudScore(gs.score, "special");
      gs.enemies.push(spawnEnemy());
      checkDepthTransition();
      const { x: bx, y: by } = gs.toxicBarrels[barrelIdx];
      triggerBubblePop(bx, by);
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
  if (depthCfg.shrimp && gs.shrimp.length < depthCfg.shrimp.count) {
    gs.shrimpMovesCounter++;
    if (gs.shrimpMovesCounter >= depthCfg.shrimp.interval) spawnShrimpIfNeeded();
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
  if (depthCfg.turtleEgg) {
    gs.turtleEggMovesCounter++;
    if (gs.turtleEggMovesCounter >= depthCfg.turtleEgg.interval) spawnTurtleEggIfNeeded();
  }
  if (depthCfg.turtles) {
    // Queue a new turtle if neutral count is below max and none already queued
    const neutralCount = gs.seaTurtles.filter(t => !t.aggressive).length;
    if (neutralCount < depthCfg.turtles.max && gs.turtleSpawnQueue === 0) {
      gs.turtleSpawnQueue = 1;
      gs.turtleSpawnCounter = 0;
    }
    // Fire queued turtle entry after spawnDelay moves
    if (gs.turtleSpawnQueue > 0) {
      gs.turtleSpawnCounter++;
      if (gs.turtleSpawnCounter >= depthCfg.turtles.spawnDelay) {
        gs.seaTurtles.push(spawnTurtleFromLeft());
        gs.turtleSpawnQueue--;
        gs.turtleSpawnCounter = 0;
      }
    }
  }

  // Enemy AI — regular + big every 2 player moves; grace moves after shock skip enemy turn
  if (gs.postShockGrace > 0) {
    gs.postShockGrace--;
  } else if (gs.moveCount % 2 === 0) {
    moveEnemiesAI();
  }

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
  for (const t of gs.seaTurtles) {
    if (!t.aggressive) continue;
    if (gs.shark.x >= t.x && gs.shark.x < t.x + t.size &&
        gs.shark.y >= t.y && gs.shark.y < t.y + t.size) { endGame(); return; }
  }

  if (depthCfg.toxicBarrel) spreadToxicContamination();

  saveGame();
  startSharkAnim();
}

// ── End game ──────────────────────────────────────────────────────────────

export function endGame(): void {
  gs.gameOver = true;
  const now = performance.now();
  gs.totalTimeMs = now - gs.gameStartTime;
  const currentLevelElapsedMs = now - gs.levelStartTime;
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
  const diveAgainBtn = document.getElementById("diveAgainBtn")!;
  diveAgainBtn.className = diveAgainBtn.className.replace(/\bds-d\d\b/g, "").trim();
  if (gs.currentDepth > 1) diveAgainBtn.classList.add(`ds-d${gs.currentDepth}`);
}

// Wire forward declaration in ai.ts so triggerShock/startShockLoop can call endGame
setEndGame(endGame);

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
  if (LEVEL_CONFIG[gs.currentDepth]?.icePatches) {
    seedIcePatches(LEVEL_CONFIG[gs.currentDepth].icePatches!.initialCount ?? 5);
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

  gs.dyingEnemies  = [];
  gs.dyingPickups  = [];
  gs.risingPickups = [];
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

  gs.neutralFish              = [];
  gs.algaeBalls               = [];
  gs.algaeBallRespawnTimers   = [];
  gs.seagrassCells            = [];
  gs.seagrassSet     = new Set();
  gs.kelpCells       = [];
  gs.kelpSet         = new Set();
  gs.kelpBladders    = [];
  gs.kelpBladdersSet = new Set();
  gs.electricEels    = [];
  gs.shrimp          = [];
  gs.sharkShocked    = false;
  gs.shockVibrateX   = 0;
  gs.shockVibrateY   = 0;
  gs.postShockGrace  = 0;
  if (gs.shockRafId) { cancelAnimationFrame(gs.shockRafId); gs.shockRafId = null; }
  gs.seaTurtles           = [];
  gs.turtleSpawnQueue     = 0;
  gs.turtleSpawnCounter   = 0;
  gs.turtleEggMovesCounter = 0;
  // Re-seed at depth if applicable — same pattern as ice patch re-seeding
  const retryCfg = LEVEL_CONFIG[gs.currentDepth];
  if (retryCfg.neutralFish) seedNeutralFish();
  if (retryCfg.seagrass) seedSeagrass();
  if (retryCfg.kelp) {
    gs.kelpBladders    = [];
    gs.kelpBladdersSet = new Set();
    seedKelp();
  }
  if (retryCfg.algaeBall) {
    for (let i = 0; i < retryCfg.algaeBall.count; i++) spawnAlgaeBallIfNeeded();
  }
  if (retryCfg.electricEel) {
    seedElectricEels();
  }
  if (retryCfg.shrimp) {
    gs.shrimpMovesCounter = 0;
    for (let i = 0; i < retryCfg.shrimp.initCount; i++) spawnShrimpIfNeeded();
  }
  if (retryCfg.turtles) {
    seedTurtles();
  }
  if (retryCfg.turtleEgg) {
    gs.turtleEggMovesCounter = 0;
    for (let i = 0; i < retryCfg.turtleEgg.initCount; i++) spawnTurtleEggIfNeeded();
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

  // Clear any stale animation state from init()'s seedStartingYellows call
  gs.dyingPickups  = [];
  gs.risingPickups = [];

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
    if (d === ABYSS_DEPTH) spawnLeviathan();
    while (gs.enemies.length + gs.bigEnemies.length < LEVEL_CONFIG[d].enemyKeep) gs.enemies.push(spawnEnemy());
  }

  // Final reset: discard all intermediate enemies and spawn exactly what the target depth wants.
  // Avoids the dissolve animation firing at init time when intermediate blocks overshoot
  // (e.g. depth 3 fills to 10 but depth 4 only wants 5).
  const finalKeep = LEVEL_CONFIG[targetDepth].enemyKeep;
  gs.enemies    = [];
  gs.bigEnemies = [];
  while (gs.enemies.length < finalKeep) gs.enemies.push(spawnEnemy());

  // Re-seed coins for the target depth (no dissolve animation on dev jump)
  gs.pickups = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  seedStartingYellows();
  // Immediately place all coins without pop-in for dev jump
  gs.risingPickups = [];

  draw();
}

// ── Forward declaration — set by navigation.ts on boot ───────────────────
// Avoids a circular import between engine ↔ navigation.

let showGameScreen: () => void = () => {};
export function setShowGameScreen(fn: () => void): void { showGameScreen = fn; }
