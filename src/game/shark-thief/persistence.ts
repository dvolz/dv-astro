// ===== SaveManager / UserDefaultsService =====  →  SaveManager.swift / UserDefaultsService.swift

import { GRID } from "./config";
import { gs } from "./state";

// ── Storage keys ─────────────────────────────────────────────────────────
export const HS_KEY        = "sharkIosHighScore_v3";
export const SAVE_KEY      = "sharkIosSave_v3";
export const MAX_DEPTH_KEY = "sharkMaxDepth_v3";
export const SHARK_BEST_KEY = "sharkTotalBest_v3";

// ── High Score ───────────────────────────────────────────────────────────
export function getHighScore(): number {
  return parseInt(localStorage.getItem(HS_KEY) || "0", 10);
}
export function saveHighScore(v: number): void {
  localStorage.setItem(HS_KEY, String(v));
}

// ── Shark Score ──────────────────────────────────────────────────────────
export function getSharkBest(): number {
  return parseInt(localStorage.getItem(SHARK_BEST_KEY) || "0", 10);
}
export function saveSharkBest(v: number): void {
  localStorage.setItem(SHARK_BEST_KEY, String(v));
}

/** SCORE² ÷ time(sec) — doubles score quadruples it, halving time doubles it. */
export function calcSharkScore(score: number, totalMs: number): number {
  if (totalMs <= 0) return 0;
  return Math.floor((score * score) / (totalMs / 1000));
}

// ── Max Depth ────────────────────────────────────────────────────────────
export function getMaxDepth(): number {
  return parseInt(localStorage.getItem(MAX_DEPTH_KEY) || "1", 10);
}
export function updateMaxDepth(depth: number): void {
  if (depth > getMaxDepth()) localStorage.setItem(MAX_DEPTH_KEY, String(depth));
}

// ── Game Save ────────────────────────────────────────────────────────────

// TODO: add schema validation — raw JSON.parse of any localStorage value is unsafe.
export function getSave(): any | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGame(): void {
  const save = {
    shark:         { x: gs.shark.x, y: gs.shark.y },
    sharkDir:      gs.sharkDir,
    score:         gs.score,
    currentDepth:  gs.currentDepth,
    depthEntryScore: gs.depthEntryScore,
    moveCount:     gs.moveCount,
    pickups:       gs.pickups.flat(),
    superPickups:  gs.superPickups.flat(),
    coralPickups:  gs.coralPickups.flat(),
    coral:         gs.coral.flat(),
    colors:        gs.colors.flat(),
    enemies:       gs.enemies,
    bigEnemies:    gs.bigEnemies,
    leviathan:     gs.leviathan,
    runElapsedMs:  performance.now() - gs.gameStartTime,
    levelElapsedMs: performance.now() - gs.levelStartTime,
    levelTimes:    gs.levelTimes,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function loadGame(save: any): void {
  const emptyRow = () => Array(GRID).fill(false);
  gs.pickups      = [];
  gs.superPickups = [];
  gs.coralPickups = [];
  gs.coral        = [];
  gs.colors       = [];
  for (let r = 0; r < GRID; r++) {
    gs.pickups.push(Array.from(save.pickups.slice(r * GRID, (r + 1) * GRID)));
    gs.superPickups.push(Array.from(save.superPickups.slice(r * GRID, (r + 1) * GRID)));
    gs.coralPickups.push(Array.from(
      (save.coralPickups || []).slice(r * GRID, (r + 1) * GRID).concat(emptyRow()).slice(0, GRID),
    ));
    gs.coral.push(Array.from(save.coral.slice(r * GRID, (r + 1) * GRID)));
    gs.colors.push(Array.from(save.colors.slice(r * GRID, (r + 1) * GRID)));
  }

  gs.shark        = { ...save.shark };
  gs.sharkDir     = save.sharkDir || "right";
  gs.sharkVisualX = gs.shark.x;
  gs.sharkVisualY = gs.shark.y;
  gs.score        = save.score || 0;
  gs.currentDepth = save.currentDepth || 1;
  gs.depthEntryScore = save.depthEntryScore ?? (gs.currentDepth - 1) * 100;
  gs.moveCount    = save.moveCount || 0;
  gs.enemies      = save.enemies    || [];
  gs.bigEnemies   = save.bigEnemies || [];
  gs.leviathan    = save.leviathan  || null;
  gs.gameOver     = false;

  gs.gameStartTime  = performance.now() - (save.runElapsedMs   || 0);
  gs.levelStartTime = performance.now() - (save.levelElapsedMs || 0);
  gs.levelTimes     = save.levelTimes || [];
  gs.totalTimeMs    = 0;
}
