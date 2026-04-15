// ===== SpawnManager =====  →  SpawnManager.swift

import { GRID, MIN_ENEMY_DIST, CORAL_MAX_ON_BOARD } from "./config";
import { gs, type Enemy, type BigEnemy } from "./state";
import { bigEnemyOverlaps } from "./collision";

// ── Ammonite (Depth 1 super pickup) ─────────────────────────────────────

function countAmmonites(): number {
  let n = 0;
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (gs.superPickups[r][c]) n++;
  return n;
}

export function spawnAmmoniteIfNeeded(): void {
  if (countAmmonites() > 0) return;
  let ax: number, ay: number, attempts = 0;
  do {
    ax = Math.floor(Math.random() * GRID);
    ay = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(ax - gs.shark.x) + Math.abs(ay - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[ay][ax] || gs.superPickups[ay][ax] ||
    gs.coral[ay]?.[ax]  || gs.coralPickups[ay][ax]
  );
  gs.superPickups[ay][ax] = true;
  gs.ammoniteMovesCounter = 0;
}

// ── Coral shell (Depth 2 pickup) ─────────────────────────────────────────

function countCoralPickups(): number {
  let n = 0;
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (gs.coralPickups[r][c]) n++;
  return n;
}

export function spawnCoralPickupIfNeeded(): void {
  if (countCoralPickups() >= CORAL_MAX_ON_BOARD) return;
  let cx: number, cy: number, attempts = 0;
  do {
    cx = Math.floor(Math.random() * GRID);
    cy = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(cx - gs.shark.x) + Math.abs(cy - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[cy][cx] || gs.superPickups[cy][cx] ||
    gs.coral[cy][cx]   || gs.coralPickups[cy][cx]
  );
  gs.coralPickups[cy][cx] = true;
  gs.coralMovesCounter = 0;
}

// ── Shark egg (Depth 3 pickup) ───────────────────────────────────────────

export function spawnSharkEgg(): void {
  let ex: number, ey: number, attempts = 0;
  do {
    ex = Math.floor(Math.random() * GRID);
    ey = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[ey][ex]        ||
    gs.superPickups[ey][ex]   ||
    gs.coral[ey]?.[ex]        ||
    gs.coralPickups[ey]?.[ex]
  );
  gs.sharkEgg = { x: ex, y: ey };
}

// ── Frozen fish (Depth 4 — Arctic) ──────────────────────────────────────

export function spawnFrozenFish(): void {
  let fx: number, fy: number, attempts = 0;
  do {
    fx = Math.floor(Math.random() * GRID);
    fy = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < MIN_ENEMY_DIST ||
    gs.pickups[fy][fx]         ||
    gs.superPickups[fy][fx]    ||
    gs.coralPickups[fy]?.[fx]  ||
    gs.iceCells[fy][fx]        ||
    gs.enemies.some(e => e.x === fx && e.y === fy) ||
    (gs.shark.x === fx && gs.shark.y === fy)
  );
  gs.frozenFish = { x: fx, y: fy };
}

// ── Ice patches (Depth 4 — Arctic) ──────────────────────────────────────

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

// ── Enemies ──────────────────────────────────────────────────────────────

export function spawnEnemy(): Enemy {
  let ex: number, ey: number, attempts = 0;
  do {
    ex = Math.floor(Math.random() * GRID);
    ey = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) break;
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
  return { x: ex, y: ey, visualX: ex, visualY: ey, animFromX: ex, animFromY: ey, animStartTime: 0 };
}

export function spawnBigEnemy(): BigEnemy {
  let ex: number, ey: number, attempts = 0;
  do {
    ex = Math.floor(Math.random() * (GRID - 1));
    ey = Math.floor(Math.random() * (GRID - 1));
    attempts++;
    if (attempts > 1000) break;
  } while (
    Math.min(
      Math.abs(ex     - gs.shark.x) + Math.abs(ey     - gs.shark.y),
      Math.abs(ex + 1 - gs.shark.x) + Math.abs(ey     - gs.shark.y),
      Math.abs(ex     - gs.shark.x) + Math.abs(ey + 1 - gs.shark.y),
      Math.abs(ex + 1 - gs.shark.x) + Math.abs(ey + 1 - gs.shark.y),
    ) < MIN_ENEMY_DIST ||
    gs.bigEnemies.some(b => bigEnemyOverlaps(ex, ey, b.x, b.y)) ||
    gs.coral[ey]?.[ex]     || gs.coral[ey]?.[ex + 1] ||
    gs.coral[ey + 1]?.[ex] || gs.coral[ey + 1]?.[ex + 1]
  );
  return { x: ex, y: ey, visualX: ex, visualY: ey, animFromX: ex, animFromY: ey, animStartTime: 0 };
}

// ── Coral barriers (Depth 2) ─────────────────────────────────────────────

export function spawnCoral(): void {
  const N = Math.max(5, Math.floor(GRID * GRID * 0.02)); // ~2% of cells
  let placed = 0, attempts = 0;
  while (placed < N && attempts < 2000) {
    attempts++;
    const cx = Math.floor(Math.random() * GRID);
    const cy = Math.floor(Math.random() * GRID);
    if (gs.coral[cy][cx]) continue;
    if (cx === gs.shark.x && cy === gs.shark.y) continue;
    if (Math.abs(cx - gs.shark.x) + Math.abs(cy - gs.shark.y) < 4) continue;
    if (gs.enemies.some(e => e.x === cx && e.y === cy)) continue;
    if (gs.bigEnemies.some(be => cx >= be.x && cx <= be.x + 1 && cy >= be.y && cy <= be.y + 1)) continue;
    if (gs.pickups[cy][cx] || gs.superPickups[cy][cx]) continue;
    gs.coral[cy][cx] = true;
    placed++;
  }
}

// ── Leviathan (Depth 4) ──────────────────────────────────────────────────

export function spawnLeviathan(): void {
  if (gs.leviathan) return; // max one at a time
  let lx: number, ly: number, attempts = 0;
  do {
    lx = Math.floor(Math.random() * (GRID - 2));
    ly = Math.floor(Math.random() * (GRID - 2));
    attempts++;
    if (attempts > 1000) break;
  } while (
    Math.min(
      Math.abs(lx     - gs.shark.x) + Math.abs(ly     - gs.shark.y),
      Math.abs(lx + 2 - gs.shark.x) + Math.abs(ly     - gs.shark.y),
      Math.abs(lx     - gs.shark.x) + Math.abs(ly + 2 - gs.shark.y),
      Math.abs(lx + 2 - gs.shark.x) + Math.abs(ly + 2 - gs.shark.y),
    ) < 7 ||
    [0, 1, 2].some(dx => [0, 1, 2].some(dy => gs.coral[ly + dy]?.[lx + dx]))
  );
  gs.leviathan = { x: lx, y: ly };
}
