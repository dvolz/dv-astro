// ===== EnemyAI =====  →  EnemyAI.swift

import { GRID } from "./config";
import { gs } from "./state";
import { bigEnemyOverlaps } from "./collision";
import { resolveSlide } from "./slide";

export function moveEnemiesAI(): void {
  // Regular enemies — Manhattan-first, avoid coral and each other
  for (const e of gs.enemies) {
    const diffX = gs.shark.x - e.x;
    const diffY = gs.shark.y - e.y;
    let sdx = 0, sdy = 0;
    if (Math.abs(diffX) >= Math.abs(diffY)) sdx = Math.sign(diffX);
    else                                     sdy = Math.sign(diffY);

    let tx = Math.max(0, Math.min(GRID - 1, e.x + sdx));
    let ty = Math.max(0, Math.min(GRID - 1, e.y + sdy));
    const occupied     = gs.enemies.some(o => o !== e && o.x === tx && o.y === ty);
    const blockedCoral = !!gs.coral[ty]?.[tx];
    if (!occupied && !blockedCoral) {
      e.x = tx; e.y = ty;
      if (gs.iceCells[e.y]?.[e.x]) {
        const slid = resolveSlide(e.x, e.y, sdx, sdy);
        e.x = slid.x; e.y = slid.y;
      }
    }
  }

  // Big enemies (2×2) — clamped to GRID-2, blocked by coral, small enemies, other bigs
  for (const be of gs.bigEnemies) {
    const diffX = gs.shark.x - be.x;
    const diffY = gs.shark.y - be.y;
    let sdx = 0, sdy = 0;
    if (Math.abs(diffX) >= Math.abs(diffY)) sdx = Math.sign(diffX);
    else                                     sdy = Math.sign(diffY);

    let tx = Math.max(0, Math.min(GRID - 2, be.x + sdx));
    let ty = Math.max(0, Math.min(GRID - 2, be.y + sdy));
    const blocked = gs.bigEnemies.some(
      o => o !== be && bigEnemyOverlaps(tx, ty, o.x, o.y),
    );
    const hitsEnemy = gs.enemies.some(
      e => e.x >= tx && e.x <= tx + 1 && e.y >= ty && e.y <= ty + 1,
    );
    const hitsCoral =
      gs.coral[ty]?.[tx]     || gs.coral[ty]?.[tx + 1] ||
      gs.coral[ty + 1]?.[tx] || gs.coral[ty + 1]?.[tx + 1];
    if (!blocked && !hitsEnemy && !hitsCoral) {
      be.x = tx; be.y = ty;
      if (gs.iceCells[be.y]?.[be.x]) {
        const slid = resolveSlide(be.x, be.y, sdx, sdy);
        be.x = Math.min(slid.x, GRID - 2);
        be.y = Math.min(slid.y, GRID - 2);
      }
    }
  }
}

export function moveLeviathanAI(): void {
  if (!gs.leviathan) return;
  const diffX = gs.shark.x - gs.leviathan.x;
  const diffY = gs.shark.y - gs.leviathan.y;
  let tx = gs.leviathan.x, ty = gs.leviathan.y;
  if (Math.abs(diffX) >= Math.abs(diffY)) {
    tx += Math.sign(diffX);
  } else {
    ty += Math.sign(diffY);
  }
  tx = Math.max(0, Math.min(GRID - 3, tx));
  ty = Math.max(0, Math.min(GRID - 3, ty));
  const hitsCoral = [0, 1, 2].some(dx =>
    [0, 1, 2].some(dy => gs.coral[ty + dy]?.[tx + dx]),
  );
  if (!hitsCoral) { gs.leviathan.x = tx; gs.leviathan.y = ty; }
}
