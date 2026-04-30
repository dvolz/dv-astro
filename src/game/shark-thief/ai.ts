// ===== EnemyAI =====  →  EnemyAI.swift

import { GRID } from "./config";
import { LEVEL_CONFIG } from "./level-config";
import { gs } from "./state";
import { bigEnemyOverlaps } from "./collision";
import { resolveSlide } from "./slide";
import { startEnemyAnimLoop } from "./animation";
import { draw } from "./renderers";

// Forward declaration — set by engine.ts after endGame is defined (avoids circular import)
let endGame: () => void = () => {};
export function setEndGame(fn: () => void): void { endGame = fn; }

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
    const blockedTurtle = gs.seaTurtles.some(t =>
      !t.aggressive && tx >= t.x && tx < t.x + t.size && ty >= t.y && ty < t.y + t.size,
    );
    if (!occupied && !blockedCoral && !blockedTurtle) {
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
    const hitsTurtle = gs.seaTurtles.some(t =>
      !t.aggressive && t.x < tx + 2 && t.x + t.size > tx && t.y < ty + 2 && t.y + t.size > ty,
    );
    if (!blocked && !hitsEnemy && !hitsCoral && !hitsTurtle) {
      be.x = tx; be.y = ty;
      if (gs.iceCells[be.y]?.[be.x]) {
        const slid = resolveSlide(be.x, be.y, sdx, sdy);
        be.x = Math.min(slid.x, GRID - 2);
        be.y = Math.min(slid.y, GRID - 2);
      }
    }
  }
  startEnemyAnimLoop();
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

// ── Neutral fish movement (Depth 6 — Busy Pacific) ───────────────────────

function candidateEffSize(fish: { sizeX: number; sizeY: number }, dx: number, dy: number): [number, number] {
  return dy !== 0 ? [fish.sizeY, fish.sizeX] : [fish.sizeX, fish.sizeY];
}

export function moveNeutralFish(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].neutralFish;
  if (!cfg) return;

  const dirs: Array<[number, number]> = [[1,0],[-1,0],[0,1],[0,-1]];

  for (const fish of gs.neutralFish) {
    fish.moveAccum++;
    const spec = cfg[fish.type];
    if (fish.moveAccum < spec.speedDivisor) continue;
    fish.moveAccum = 0;

    // Shuffle directions; try each until one is valid
    const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = fish.x + dx;
      const ny = fish.y + dy;

      const [csX, csY] = candidateEffSize(fish, dx, dy);

      // Bounds check — fish never leave the board
      if (nx < 0 || ny < 0 || nx + csX > GRID || ny + csY > GRID) continue;
      if (nx === fish.lastX && ny === fish.lastY) continue;

      // Coral barriers block fish
      let coralBlocked = false;
      for (let fdy = 0; fdy < csY && !coralBlocked; fdy++)
        for (let fdx = 0; fdx < csX && !coralBlocked; fdx++)
          if (gs.coral[ny + fdy]?.[nx + fdx]) coralBlocked = true;
      if (coralBlocked) continue;

      // Fish cannot move onto the shark
      const sharkBlocked = gs.shark.x >= nx && gs.shark.x < nx + csX &&
                           gs.shark.y >= ny && gs.shark.y < ny + csY;
      if (sharkBlocked) continue;

      // Fish can move — apply
      fish.lastX = fish.x;
      fish.lastY = fish.y;
      fish.x = nx;
      fish.y = ny;
      if (dx === 1)  fish.dir = "right";
      if (dx === -1) fish.dir = "left";
      if (dy === 1)  fish.dir = "down";
      if (dy === -1) fish.dir = "up";
      fish.effSizeX = csX;
      fish.effSizeY = csY;

      // Fish eats coin — no enemy spawn, no score
      for (let fdy = 0; fdy < fish.effSizeY; fdy++) {
        for (let fdx = 0; fdx < fish.effSizeX; fdx++) {
          const cx = fish.x + fdx, cy = fish.y + fdy;
          if (gs.pickups[cy]?.[cx]) gs.pickups[cy][cx] = false;
        }
      }

      break;
    }
    // If no valid direction found, fish stays put this turn — that's fine
  }
}

// ── Sea turtle movement (Depth 8 — Turtle Migration) ─────────────────────

export function moveTurtles(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].turtles;
  if (!cfg) return;

  for (const t of gs.seaTurtles) {
    if (!t.aggressive) continue; // neutral turtles move in real-time via tickNeutralTurtles

    t.moveAccum++;
    if (t.moveAccum < cfg.speedDivisor) continue;
    t.moveAccum = 0;

    // Aggressive: Manhattan-first chase; update facing direction
    const diffX = gs.shark.x - t.x;
    const diffY = gs.shark.y - t.y;
    let sdx = 0, sdy = 0;
    if (Math.abs(diffX) >= Math.abs(diffY)) {
      sdx = Math.sign(diffX);
      t.dir = sdx > 0 ? "right" : "left";
    } else {
      sdy = Math.sign(diffY);
      t.dir = sdy > 0 ? "down" : "up";
    }

    const maxCoord = GRID - t.size;
    const tx = Math.max(0, Math.min(maxCoord, t.x + sdx));
    const ty = Math.max(0, Math.min(maxCoord, t.y + sdy));

    // Blocked by coral, swarm enemies, and other turtles
    let blocked = false;
    outer: for (let dy = 0; dy < t.size; dy++) {
      for (let dx = 0; dx < t.size; dx++) {
        if (gs.coral[ty + dy]?.[tx + dx]) { blocked = true; break outer; }
      }
    }
    if (!blocked) {
      for (const e of gs.enemies) {
        if (e.x >= tx && e.x < tx + t.size && e.y >= ty && e.y < ty + t.size) { blocked = true; break; }
      }
    }
    if (!blocked) {
      for (const other of gs.seaTurtles) {
        if (other === t) continue;
        if (other.x < tx + t.size && other.x + other.size > tx &&
            other.y < ty + t.size && other.y + other.size > ty) { blocked = true; break; }
      }
    }

    if (!blocked) { t.x = tx; t.y = ty; }
  }
}

// ── Electric eel movement (Depth 7) ──────────────────────────────────────

export function moveEels(): void {
  const cfg = LEVEL_CONFIG[gs.currentDepth].electricEel;
  if (!cfg) return;

  const dirMap: Record<string, [number, number]> = {
    right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1],
  };
  const allDirs = ["right", "left", "down", "up"] as const;

  for (const eel of gs.electricEels) {
    const head = eel.segments[0];

    const inBounds = (d: string): boolean => {
      const [dx, dy] = dirMap[d];
      const nx = head.x + dx, ny = head.y + dy;
      return nx >= 0 && nx < GRID && ny >= 0 && ny < GRID;
    };

    const tooClose = (d: string): boolean => {
      const [dx, dy] = dirMap[d];
      const nx = head.x + dx, ny = head.y + dy;
      return gs.electricEels.some(other => {
        if (other === eel) return false;
        return Math.abs(nx - other.segments[0].x) + Math.abs(ny - other.segments[0].y) < cfg.avoidRadius;
      });
    };

    let chosenDir = eel.dir;

    if (!inBounds(eel.dir) || tooClose(eel.dir)) {
      const others = allDirs.filter(d => d !== eel.dir).sort(() => Math.random() - 0.5);

      // First pass: in-bounds AND not too close
      let found = false;
      for (const d of others) {
        if (inBounds(d) && !tooClose(d)) { chosenDir = d; found = true; break; }
      }

      // Second pass: just in-bounds (ignore avoidance if necessary)
      if (!found) {
        for (const d of [eel.dir, ...others]) {
          if (inBounds(d)) { chosenDir = d; found = true; break; }
        }
      }

      if (!found) continue; // cornered — skip this turn (shouldn't happen on 25×25)
    }

    const [dx, dy] = dirMap[chosenDir];
    eel.dir = chosenDir;
    eel.segments = [
      { x: head.x + dx, y: head.y + dy },
      ...eel.segments.slice(0, -1),
    ];
  }
}

// ── Shock loop — paralysis with enemies ticking shockEnemySteps/s ──────────

function startShockLoop(): void {
  if (gs.shockRafId) return;

  let movesFired = 0;

  function tick(): void {
    const now = performance.now();
    const elapsed = now - gs.shockStartTime;
    const eelCfg  = LEVEL_CONFIG[gs.currentDepth].electricEel;
    const shockDur = eelCfg?.shockDuration   ?? 2000;
    const steps    = eelCfg?.shockEnemySteps ?? 1;

    if (elapsed >= shockDur || gs.gameOver) {
      gs.sharkShocked  = false;
      gs.shockVibrateX = 0;
      gs.shockVibrateY = 0;
      gs.shockRafId    = null;
      gs.sharkVisualX  = gs.shark.x;
      gs.sharkVisualY  = gs.shark.y;
      gs.postShockGrace = 2;
      draw();
      return;
    }

    // Fire move i when elapsed passes shockDur * i / (steps+1) — evenly spaced, all before shock ends
    const nextMove = shockDur * (movesFired + 1) / (steps + 1);
    if (elapsed >= nextMove) {
      movesFired++;
      moveEnemiesAI();
      moveEels();
      startEnemyAnimLoop();

      // Death check — enemy stepped on shark during shock
      for (const e of gs.enemies) {
        if (e.x === gs.shark.x && e.y === gs.shark.y) {
          gs.sharkShocked = false;
          gs.shockVibrateX = 0;
          gs.shockVibrateY = 0;
          cancelAnimationFrame(gs.shockRafId!);
          gs.shockRafId = null;
          endGame(); return;
        }
      }
      for (const be of gs.bigEnemies) {
        if (gs.shark.x >= be.x && gs.shark.x <= be.x + 1 &&
            gs.shark.y >= be.y && gs.shark.y <= be.y + 1) {
          gs.sharkShocked = false;
          gs.shockVibrateX = 0;
          gs.shockVibrateY = 0;
          cancelAnimationFrame(gs.shockRafId!);
          gs.shockRafId = null;
          endGame(); return;
        }
      }
    }

    // Vibrate shark visually
    const freq = 22;
    gs.shockVibrateX = Math.sin(now / 1000 * freq * Math.PI * 2) * 0.09;
    gs.shockVibrateY = Math.cos(now / 1000 * freq * 1.3 * Math.PI * 2) * 0.055;

    draw();
    gs.shockRafId = requestAnimationFrame(tick);
  }

  gs.shockRafId = requestAnimationFrame(tick);
}

export function triggerShock(): void {
  if (gs.sharkShocked) return;
  gs.sharkShocked  = true;
  gs.shockStartTime = performance.now();
  startShockLoop();
}
