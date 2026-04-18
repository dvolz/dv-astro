// ===== GameState =====  →  GameState.swift / GridState.swift / EnemyAI state

import { GRID } from "./config";

export interface Enemy {
  x: number; y: number;
  visualX: number; visualY: number;
  animFromX: number; animFromY: number;
  animStartTime: number;
}
export interface BigEnemy {
  x: number; y: number;
  visualX: number; visualY: number;
  animFromX: number; animFromY: number;
  animStartTime: number;
}
export interface Leviathan { x: number; y: number; }
export interface BabyShark { x: number; y: number; }
export interface BloodCell { x: number; y: number; movesRemaining: number; }
export interface DyingEnemy {
  x: number; y: number;
  isBig: boolean;      // 2×2 block if true
  startTime: number;   // performance.now() when dissolve begins
}

// Single mutable state object — imported by all modules as a singleton.
// Mutating gs.foo in any module is visible everywhere (ES modules are singletons).
export const gs = {
  // ── Canvas ──────────────────────────────────────────────────────────
  CELL: 0 as number, // pixel size of one grid cell; set after canvas is sized

  // ── Shark ────────────────────────────────────────────────────────────
  shark:    { x: 0, y: 0 },
  sharkDir: "right" as "right" | "left" | "up" | "down",
  sharkPrevX: 0,
  sharkPrevY: 0,
  sharkPositionHistory: [] as Array<{ x: number; y: number }>,

  // Smooth movement animation
  sharkVisualX: 0,
  sharkVisualY: 0,
  sharkFromX:   0,
  sharkFromY:   0,
  animStartTime: 0,
  animRafId: null as number | null,
  enemyAnimRafId: null as number | null,

  // Bounce animation (coral shell impact)
  bounceTargetX: 0,
  bounceTargetY: 0,

  // ── Core game state ──────────────────────────────────────────────────
  score:     0,
  highScore: 0,
  moveCount: 0,
  gameOver:  false,

  // ── Grid ─────────────────────────────────────────────────────────────
  colors:       [] as string[][],
  pickups:      [] as boolean[][],
  superPickups: [] as boolean[][],
  coralPickups: [] as boolean[][], // Depth 2+: cone shell (5 pts)
  coral:        [] as boolean[][],  // Depth 2: impassable barriers

  // ── Enemies ──────────────────────────────────────────────────────────
  enemies:    [] as Enemy[],
  bigEnemies: [] as BigEnemy[],
  leviathan:  null as Leviathan | null,

  // ── Depth 3 — Nursery ────────────────────────────────────────────────
  babySharks:  [] as BabyShark[],
  bloodCells:  [] as BloodCell[],
  sharkEgg:    null as { x: number; y: number } | null,

  // ── Depth 4 — Arctic ────────────────────────────────────────────────────
  iceCells:    [] as boolean[][], // 25×25 — true = ice tile
  frozenFish:  [] as Array<{ x: number; y: number }>,
  frozenFishMovesCounter: 0,

  // ── Depth 5 — Toxic ──────────────────────────────────────────────────────
  toxicClouds:             [] as Array<{ x: number; y: number }>,
  toxicBarrels:            [] as Array<{ x: number; y: number }>,
  toxicBarrelMovesCounter: 0,

  // ── Depth system ─────────────────────────────────────────────────────
  currentDepth:    1,
  depthEntryScore: 0, // score when current depth was entered

  // ── Timing ───────────────────────────────────────────────────────────
  gameStartTime:    0,  // performance.now() when run started
  totalTimeMs:      0,  // elapsed ms at game-over
  levelStartTime:   0,  // performance.now() when current depth started
  levelTimes:       [] as number[], // ms spent in each completed depth
  startedFromDepth1: true, // false when dev depth-jump is used

  // ── Dying-enemy dissolve animation ───────────────────────────────────
  dyingEnemies: [] as DyingEnemy[],
  dyingRafId:   null as number | null,

  // ── Shell counters ────────────────────────────────────────────────────
  ammoniteMovesCounter: 0,
  coralMovesCounter:    0,
  eggMovesCounter:      0, // counts up after egg collected; triggers respawn when >= egg.interval

  // ── Shimmer ───────────────────────────────────────────────────────────
  shimmerIntensity: new Float32Array(GRID * GRID),
  shimmerSpeed:     new Float32Array(GRID * GRID),
  shimmerRafId:     null as number | null,

  // ── Toxic cloud pulse (Depth 5) ───────────────────────────────────────
  cloudPulse:      new Float32Array(GRID * GRID),
  cloudPulseSpeed: new Float32Array(GRID * GRID),
  cloudPulseRafId: null as number | null,

  // ── Settings (read from localStorage at startup) ──────────────────────
  colorblindMode: false,
  shimmerMode:    false,
};
