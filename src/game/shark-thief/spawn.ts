// ===== SpawnManager =====  →  SpawnManager.swift

import { GRID } from "./config";
import { LEVEL_CONFIG } from "./level-config";
import { gs, type Enemy, type BigEnemy, type NeutralFish, type AlgaeBall } from "./state";
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

function isInCloudBuffer(x: number, y: number, buffer: number): boolean {
  for (const cell of gs.toxicClouds) {
    if (Math.abs(x - cell.x) + Math.abs(y - cell.y) <= buffer) return true;
  }
  return false;
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

export function spawnFrozenFishIfNeeded(): void {
  const fish = LEVEL_CONFIG[gs.currentDepth].frozenFish;
  if (!fish || gs.frozenFish.length >= fish.max) return;
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
    gs.frozenFish.some(f => f.x === fx && f.y === fy) ||
    (gs.shark.x === fx && gs.shark.y === fy) ||
    (fish.centerSafeZone ? isInCenterSafeZone(fx, fy, fish.centerSafeZone) : false)
  );
  gs.frozenFish.push({ x: fx, y: fy });
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

// ── Toxic barrel (Depth 5) ───────────────────────────────────────────────

export function spawnToxicBarrelIfNeeded(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].toxicBarrel;
  if (!cfg || gs.toxicBarrels.length >= cfg.max) return;
  let bx: number, by: number, attempts = 0;
  do {
    bx = Math.floor(Math.random() * GRID);
    by = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    Math.abs(bx - gs.shark.x) + Math.abs(by - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
    gs.pickups[by][bx]                                    ||
    gs.superPickups[by][bx]                               ||
    gs.toxicBarrels.some(b => b.x === bx && b.y === by)   ||
    isInCloudBuffer(bx, by, cfg.cloudBuffer)               ||
    (cfg.centerSafeZone ? isInCenterSafeZone(bx, by, cfg.centerSafeZone) : false)
  );
  gs.toxicBarrels.push({ x: bx, y: by });
  gs.toxicBarrelMovesCounter = 0;
}

// ── Neutral fish (Depth 6 — Busy Pacific) ───────────────────────────────

export function seedNeutralFish(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!cfg) return;
  gs.neutralFish = [];

  const specs: Array<{ type: NeutralFish["type"]; spec: typeof cfg.mackerel }> = [
    { type: "mackerel",  spec: cfg.mackerel  },
    { type: "grouper",   spec: cfg.grouper   },
    { type: "garibaldi", spec: cfg.garibaldi },
  ];

  for (const { type, spec } of specs) {
    for (let i = 0; i < spec.count; i++) {
      let fx: number, fy: number, attempts = 0;
      do {
        fx = Math.floor(Math.random() * (GRID - spec.sizeX + 1));
        fy = Math.floor(Math.random() * (GRID - spec.sizeY + 1));
        attempts++;
        if (attempts > 1000) break;
      } while (
        Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < LEVEL_CONFIG[gs.currentDepth].minEnemyDist ||
        gs.neutralFish.some(f =>
          fx < f.x + f.sizeX && fx + spec.sizeX > f.x &&
          fy < f.y + f.sizeY && fy + spec.sizeY > f.y
        ) ||
        gs.pickups[fy]?.[fx] ||
        (function() {
          for (let dy = 0; dy < spec.sizeY; dy++)
            for (let dx = 0; dx < spec.sizeX; dx++)
              if (gs.coral[fy + dy]?.[fx + dx]) return true;
          return false;
        })()
      );
      if (attempts <= 1000) {
        gs.neutralFish.push({
          type, x: fx, y: fy, sizeX: spec.sizeX, sizeY: spec.sizeY, moveAccum: 0, dir: "right",
          visualX: fx, visualY: fy, animFromX: fx, animFromY: fy, animStartTime: 0,
        });
      }
    }
  }
}

export function spawnSingleNeutralFish(type: "mackerel" | "garibaldi" | "grouper"): void {
  const fishCfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!fishCfg) return;
  const spec = fishCfg[type];
  const { sizeX, sizeY } = spec;
  let fx = 0, fy = 0, attempts = 0;
  do {
    fx = Math.floor(Math.random() * (GRID - sizeX + 1));
    fy = Math.floor(Math.random() * (GRID - sizeY + 1));
    attempts++;
    if (attempts > 500) return;
  } while (
    Math.abs(fx - gs.shark.x) + Math.abs(fy - gs.shark.y) < 5 ||
    gs.neutralFish.some(f =>
      fx < f.x + f.sizeX && fx + sizeX > f.x &&
      fy < f.y + f.sizeY && fy + sizeY > f.y
    ) ||
    gs.pickups[fy]?.[fx] ||
    gs.coral[fy]?.[fx]
  );
  gs.neutralFish.push({ type, x: fx, y: fy, sizeX, sizeY, moveAccum: 0, dir: "right", visualX: fx, visualY: fy, animFromX: fx, animFromY: fy, animStartTime: 0 });
}

// ── Kelp terrain (Depth 6 — Busy Pacific) ───────────────────────────────

export function seedKelp(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].kelp;
  if (!cfg) return;
  gs.kelpCells = [];

  // Divide the grid width into strandCount equal zones. Each strand gets one
  // zone and picks a column near the zone's centre with a small random jitter
  // (±30% of zone width) so strands feel natural but don't clump or leave gaps.
  const zoneWidth = GRID / cfg.strandCount;
  const baseRow = GRID - 1;

  for (let i = 0; i < cfg.strandCount; i++) {
    const idealCol = i * zoneWidth + zoneWidth / 2;
    const jitter = (Math.random() - 0.5) * zoneWidth * 0.6;
    let col = Math.max(0, Math.min(GRID - 1, Math.round(idealCol + jitter)));
    // Blades extend ~58% of cell width each side — enforce 2-cell gap to prevent overlap.
    // Stipe-only (no blades) strands are 2–3px wide so no separation needed.
    if (cfg.bladeEnabled) {
      let attempts = 0;
      while (gs.kelpCells.some(k => Math.abs(k.x - col) <= 1) && attempts < 10) {
        col = Math.min(GRID - 1, col + 1);
        attempts++;
      }
    }
    const height = cfg.minHeight + Math.floor(Math.random() * (cfg.maxHeight - cfg.minHeight + 1));

    for (let h = 0; h < height && baseRow - h >= 0; h++) {
      const ky = baseRow - h;
      if (!gs.kelpCells.some(k => k.x === col && k.y === ky)) {
        gs.kelpCells.push({ x: col, y: ky, height: h + 1 });
      }
    }
  }

  gs.kelpSet = new Set(gs.kelpCells.map(k => `${k.x},${k.y}`));

  // Seed one bladder per strand if bladderEnabled
  gs.kelpBladders    = [];
  gs.kelpBladdersSet = new Set();

  if (cfg.bladderEnabled) {
    const strands = new Map<number, { x: number; y: number; height: number }[]>();
    for (const kc of gs.kelpCells) {
      if (!strands.has(kc.x)) strands.set(kc.x, []);
      strands.get(kc.x)!.push(kc);
    }
    let strandIdx = 0;
    for (const [col, cells] of strands) {
      // Skip 25% of strands — deterministic so the same strands are skipped each run
      if (strandIdx % 4 === 3) { strandIdx++; continue; }
      // Deterministic height pick per strand using strand index
      const frac = 0.3 + ((col * 7 + strandIdx * 13) % 7) / 10; // 0.30–0.99
      const targetH = Math.round(frac * (cfg.maxHeight - 1)) + 1;
      // Find the cell closest to targetH
      const best = cells.reduce((a, b) =>
        Math.abs(a.height - targetH) < Math.abs(b.height - targetH) ? a : b
      );
      gs.kelpBladders.push({ x: best.x, y: best.y });
      gs.kelpBladdersSet.add(`${best.x},${best.y}`);
      strandIdx++;
    }
  }
}

// ── Algae balls (Depth 6 — Busy Pacific) ────────────────────────────────

export function spawnAlgaeBallIfNeeded(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].algaeBall;
  if (!cfg || gs.algaeBalls.length >= cfg.count) return;
  const maxX = Math.floor(GRID * 0.7);
  let ax: number, ay: number, attempts = 0;
  do {
    ax = Math.floor(Math.random() * maxX);
    ay = Math.floor(Math.random() * GRID);
    attempts++;
    if (attempts > 1000) return;
  } while (
    gs.algaeBalls.some(b => b.x === ax && b.y === ay) ||
    gs.pickups[ay]?.[ax]        ||
    gs.superPickups[ay]?.[ax]   ||
    gs.coral[ay]?.[ax]          ||
    gs.neutralFish.some(f =>
      ax >= f.x && ax < f.x + f.sizeX && ay >= f.y && ay < f.y + f.sizeY
    ) ||
    (gs.shark.x === ax && gs.shark.y === ay)
  );
  gs.algaeBalls.push({ x: ax, y: ay, driftAccum: 0, trail: [] });
}

// ── Seagrass terrain (Depth 2 — Nursery) ────────────────────────────────

export function seedSeagrass(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].seagrass;
  if (!cfg) return;
  gs.seagrassCells = [];

  const zoneWidth = GRID / cfg.strandCount;
  const baseRow = GRID - 1;

  for (let i = 0; i < cfg.strandCount; i++) {
    const idealCol = i * zoneWidth + zoneWidth / 2;
    const jitter = (Math.random() - 0.5) * zoneWidth * 0.6;
    const col = Math.max(0, Math.min(GRID - 1, Math.round(idealCol + jitter)));
    const height = cfg.minHeight + Math.floor(Math.random() * (cfg.maxHeight - cfg.minHeight + 1));

    for (let h = 0; h < height && baseRow - h >= 0; h++) {
      const ky = baseRow - h;
      if (!gs.seagrassCells.some(k => k.x === col && k.y === ky)) {
        gs.seagrassCells.push({ x: col, y: ky, height: h + 1 });
      }
    }
  }

  gs.seagrassSet = new Set(gs.seagrassCells.map(k => `${k.x},${k.y}`));
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
    gs.frozenFish.some(f => f.x === ex && f.y === ey) ||
    gs.neutralFish.some(f =>
      ex >= f.x && ex < f.x + f.sizeX && ey >= f.y && ey < f.y + f.sizeY
    ) ||
    gs.kelpBladdersSet.has(`${ex},${ey}`) ||
    (!!LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel && gs.toxicClouds.length > 0 &&
      isInCloudBuffer(ex, ey, LEVEL_CONFIG[gs.currentDepth].toxicBarrel?.cloudBuffer ?? 2))
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
  const cfg = LEVEL_CONFIG[gs.currentDepth].coral;
  if (!cfg) return;
  const { barrierCount, barrierMinDist } = cfg;
  let placed = 0, attempts = 0;
  while (placed < barrierCount && attempts < 2000) {
    attempts++;
    const cx = Math.floor(Math.random() * GRID);
    const cy = Math.floor(Math.random() * GRID);
    if (gs.coral[cy][cx]) continue;
    if (cx === gs.shark.x && cy === gs.shark.y) continue;
    if (Math.abs(cx - gs.shark.x) + Math.abs(cy - gs.shark.y) < barrierMinDist) continue;
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
