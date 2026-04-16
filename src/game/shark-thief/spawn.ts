// ===== SpawnManager =====  →  SpawnManager.swift

import { GRID } from "./config";
import { LEVEL_CONFIG } from "./level-config";
import { gs, type Enemy, type BigEnemy } from "./state";
import { bigEnemyOverlaps } from "./collision";

// ── Center safe zone ─────────────────────────────────────────────────────
// Returns true if (x, y) falls inside the center square of `size` cells.
// Used by spawn functions when a pickup config has centerSafeZone set.

function isInCenterSafeZone(x: number, y: number, size: number): boolean {
  const half   = Math.floor(size / 2);
  const startX = Math.floor(GRID / 2) - half;
  const startY = Math.floor(GRID / 2) - half;
  return x >= startX && x < startX + size && y >= startY && y < startY + size;
}

// ── Ammonite (Depth 1 super pickup) ─────────────────────────────────────

function countAmmonites(): number {
  let n = 0;
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      if (gs.superPickups[r][c]) n++;
  return n;
}

export function spawnAmmoniteIfNeeded(): void {
  const ammonite = LEVEL_CONFIG[gs.currentDepth].ammonite;
  if (!ammonite || countAmmonites() >= ammonite.max) return;
  let ax: number, ay: number, attempts = 0;
  do {
    ax = Math.floor(Math.random() * GRID);
    ay = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(ax - gs.shark.x) + Math.abs(ay - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
    gs.pickups[ay][ax] || gs.superPickups[ay][ax] ||
    gs.coral[ay]?.[ax]  || gs.coralPickups[ay][ax] ||
    (ammonite.centerSafeZone ? isInCenterSafeZone(ax, ay, ammonite.centerSafeZone) : false)
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
  const coral = LEVEL_CONFIG[gs.currentDepth].coral;
  if (!coral || countCoralPickups() >= coral.max) return;
  let cx: number, cy: number, attempts = 0;
  do {
    cx = Math.floor(Math.random() * GRID);
    cy = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(cx - gs.shark.x) + Math.abs(cy - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
    gs.pickups[cy][cx] || gs.superPickups[cy][cx] ||
    gs.coral[cy][cx]   || gs.coralPickups[cy][cx] ||
    (coral.centerSafeZone ? isInCenterSafeZone(cx, cy, coral.centerSafeZone) : false)
  );
  gs.coralPickups[cy][cx] = true;
  gs.coralMovesCounter = 0;
}

// ── Shark egg (Depth 3 pickup) ───────────────────────────────────────────

export function spawnSharkEgg(): void {
  const egg = LEVEL_CONFIG[gs.currentDepth].egg;
  let ex: number, ey: number, attempts = 0;
  do {
    ex = Math.floor(Math.random() * GRID);
    ey = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
    gs.pickups[ey][ex]        ||
    gs.superPickups[ey][ex]   ||
    gs.coral[ey]?.[ex]        ||
    gs.coralPickups[ey]?.[ex] ||
    (egg?.centerSafeZone ? isInCenterSafeZone(ex, ey, egg.centerSafeZone) : false)
  );
  gs.sharkEgg = { x: ex, y: ey };
}

// ── Frozen fish (Depth 4 — Arctic) ──────────────────────────────────────

export function spawnFrozenFish(): void {
  const fish = LEVEL_CONFIG[gs.currentDepth].frozenFish;
  let fx: number, fy: number, attempts = 0;
  do {
    fx = Math.floor(Math.random() * GRID);
    fy = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
    gs.pickups[fy][fx]         ||
    gs.superPickups[fy][fx]    ||
    gs.coralPickups[fy]?.[fx]  ||
    gs.iceCells[fy][fx]        ||
    gs.enemies.some(e => e.x === fx && e.y === fy) ||
    (gs.shark.x === fx && gs.shark.y === fy) ||
    (fish?.centerSafeZone ? isInCenterSafeZone(fx, fy, fish.centerSafeZone) : false)
  );
  gs.frozenFish = { x: fx, y: fy };
}

// ── Ice patches (Depth 4 — Arctic) ──────────────────────────────────────

// Shape library — pick one randomly per placement, orientation randomized each time.
function randomIceShape(): Array<[number, number]> {
  const horiz = Math.random() < 0.5;
  switch (Math.floor(Math.random() * 4)) {
    case 0: return horiz ? [[0,0],[1,0],[2,0],[3,0]] : [[0,0],[0,1],[0,2],[0,3]]; // 4×1
    case 1: return [[0,0],[1,0],[0,1],[1,1]];                                      // 2×2
    case 2: return horiz ? [[0,0],[1,0]] : [[0,0],[0,1]];                          // 1×2
    default: return [[0,0]];                                                        // 1×1
  }
}

export function seedIcePatches(count: number): void {
  for (let i = 0; i < count; i++) {
    const shape = randomIceShape();
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
    Math.abs(ex - gs.shark.x) + Math.abs(ey - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
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
    ) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
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
