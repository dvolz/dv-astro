// ===== Depth Info — mini scene animations =====  →  DepthInfoView.swift

import { TILE_COLORS, ARCTIC_TILE_COLORS, DEPTH_META } from "../config";
import {
  drawShellPickup, drawCoralShell, drawSharkEgg,
  drawBabyShark, drawSharkOnCtx, drawFrozenFish,
} from "../renderers";
import { buildRulesHTML } from "./data";

// ── Mini canvas constants ─────────────────────────────────────────────────

export const MINI_CS = 40; // cell size — 5×5 grid = 200×200 canvas
export const MINI_N  = 5;
const MINI_TOTAL: Record<number, number> = { 1: 4800, 2: 5400, 3: 999, 4: 5000, 5: 5200, 6: 999 };

const MINI_OPEN_CAPTIONS: Record<number, string> = {
  1: "FIND THE PURPLE AMMONITE",
  2: "A SHARK EGG DRIFTS IN THE CURRENT",
  3: "DEPTH 3 IS TOXIC TERRITORY...",
  4: "ICE MAKES YOU SLIDE...",
  5: "THE CORAL SHELL BLOCKS THE PATH...",
  6: "DEPTH 6 IS UNCHARTED TERRITORY...",
};

// Pre-seeded tile grids (deterministic — no flicker)
const MINI_TILE_COLORS_D1 = (() => {
  const seed = [0,3,1,4,2, 2,0,4,1,3, 4,2,0,3,1, 1,4,2,0,3, 3,1,3,2,0];
  return seed.map(i => TILE_COLORS[i % TILE_COLORS.length]);
})();
const MINI_TILE_COLORS_D2 = (() => {
  const seed = [1,4,0,3,2, 3,0,2,4,1, 0,3,4,1,2, 2,1,3,0,4, 4,2,1,3,0];
  return seed.map(i => TILE_COLORS[i % TILE_COLORS.length]);
})();

// ── Animation state ───────────────────────────────────────────────────────

let miniRaf: number | null = null;
let miniElapsed  = 0;
let miniLastTick = 0;
let miniPlaying  = false;
let miniDone     = false;
let miniDepth    = 1;

// ── Ease in-out ───────────────────────────────────────────────────────────

function eio(t: number): number { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

// ── Mini draw helpers (same visuals as the real game) ─────────────────────

function miniBackground(ctx: CanvasRenderingContext2D, depth: number): void {
  ctx.fillStyle = "#0f5262";
  ctx.fillRect(0, 0, 200, 200);
  const tileGrid = depth === 2 ? MINI_TILE_COLORS_D2 : MINI_TILE_COLORS_D1;
  for (let r = 0; r < MINI_N; r++)
    for (let c = 0; c < MINI_N; c++) {
      ctx.fillStyle = tileGrid[r * MINI_N + c];
      ctx.fillRect(c * MINI_CS, r * MINI_CS, MINI_CS, MINI_CS);
    }
}

function miniDrawCoral(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const cx = col * MINI_CS, cy = row * MINI_CS;
  ctx.fillStyle = "#7a4a30"; ctx.fillRect(cx, cy, MINI_CS, MINI_CS);
  ctx.fillStyle = "#c8906a"; ctx.fillRect(cx + 1, cy + 1, MINI_CS - 2, MINI_CS - 2);
  ctx.fillStyle = "#e0b898";
  const dot = Math.max(2, Math.floor(MINI_CS * 0.15));
  ctx.fillRect(cx + 2, cy + 2, dot, dot);
  ctx.fillRect(cx + MINI_CS - dot - 2, cy + 2, dot, dot);
}

function miniDrawCoin(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const pad = MINI_CS * 0.2;
  const px = col * MINI_CS + pad, py = row * MINI_CS + pad, ps = MINI_CS - pad * 2;
  ctx.fillStyle = "#7a5500"; ctx.fillRect(px - 1, py - 1, ps + 2, ps + 2);
  ctx.fillStyle = "#ffd166"; ctx.fillRect(px, py, ps, ps);
}

function miniDrawAmmonite(ctx: CanvasRenderingContext2D, col: number, row: number, alpha: number): void {
  const pad = MINI_CS * 0.2;
  ctx.save(); ctx.globalAlpha = alpha;
  drawShellPickup(ctx, col * MINI_CS + pad, row * MINI_CS + pad, MINI_CS - pad * 2);
  ctx.restore();
}

function miniDrawCoralShell(ctx: CanvasRenderingContext2D, col: number, row: number, alpha: number): void {
  const pad = MINI_CS * 0.2;
  ctx.save(); ctx.globalAlpha = alpha;
  drawCoralShell(ctx, col * MINI_CS + pad, row * MINI_CS + pad, MINI_CS - pad * 2);
  ctx.restore();
}

function miniDrawEnemy(ctx: CanvasRenderingContext2D, vx: number, vy: number, alpha: number): void {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0a1824"; ctx.fillRect(vx * MINI_CS - 1, vy * MINI_CS - 1, MINI_CS + 2, MINI_CS + 2);
  ctx.fillStyle = "#162d40"; ctx.fillRect(vx * MINI_CS, vy * MINI_CS, MINI_CS, MINI_CS);
  ctx.restore();
}

function miniDrawBigEnemy(ctx: CanvasRenderingContext2D, col: number, row: number, alpha: number): void {
  const bx = col * MINI_CS, by = row * MINI_CS, bw = MINI_CS * 2;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
  ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
  ctx.restore();
}

function miniDrawShark(ctx: CanvasRenderingContext2D, vx: number, vy: number, dir: string): void {
  drawSharkOnCtx(ctx, vx, vy, MINI_CS, dir);
}

function miniDrawMoveArrow(ctx: CanvasRenderingContext2D, col: number, row: number, dir: string, alpha: number): void {
  const cx = col * MINI_CS + MINI_CS / 2, cy = row * MINI_CS + MINI_CS / 2;
  const s = MINI_CS * 0.28;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ef476f"; ctx.strokeStyle = "#162d40"; ctx.lineWidth = 1;
  ctx.beginPath();
  if      (dir === "left")  { ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s * 0.6, cy - s * 0.65); ctx.lineTo(cx + s * 0.6, cy + s * 0.65); }
  else if (dir === "right") { ctx.moveTo(cx + s, cy); ctx.lineTo(cx - s * 0.6, cy - s * 0.65); ctx.lineTo(cx - s * 0.6, cy + s * 0.65); }
  else if (dir === "up")    { ctx.moveTo(cx, cy - s); ctx.lineTo(cx - s * 0.65, cy + s * 0.6); ctx.lineTo(cx + s * 0.65, cy + s * 0.6); }
  else                      { ctx.moveTo(cx, cy + s); ctx.lineTo(cx - s * 0.65, cy - s * 0.6); ctx.lineTo(cx + s * 0.65, cy - s * 0.6); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function miniDrawLabel(ctx: CanvasRenderingContext2D, col: number, row: number, text: string, alpha: number): void {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = "bold 10px monospace"; ctx.fillStyle = "#ffd166";
  ctx.textAlign = "center";
  ctx.fillText(text, (col + 0.5) * MINI_CS, row * MINI_CS - 3);
  ctx.restore();
}

// ── Move pip updater ──────────────────────────────────────────────────────

function updateMovePips(sharkMovesDone: number): void {
  const pip1       = document.getElementById("movePip1");
  const pip2       = document.getElementById("movePip2");
  const epip1      = document.getElementById("enemyPip1");
  const youLabel   = document.getElementById("movePipLabel");
  const enemyLabel = document.getElementById("enemyPipLabel");
  if (!pip1 || !pip2 || !epip1) return;

  const turn  = sharkMovesDone % 2;
  const cycle = Math.floor(sharkMovesDone / 2);
  const enemyMoved = cycle >= 1 || (sharkMovesDone > 0 && turn === 0);

  pip1.classList.toggle("filled", sharkMovesDone >= 1);
  pip2.classList.toggle("filled", sharkMovesDone >= 2);
  epip1.classList.toggle("filled", enemyMoved);

  if (youLabel) {
    const moveInCycle = sharkMovesDone === 0 ? 0 : ((sharkMovesDone - 1) % 2) + 1;
    youLabel.textContent = sharkMovesDone === 0 ? "YOU MOVE 2" : `YOU MOVE ${moveInCycle}`;
  }
  if (enemyLabel) {
    enemyLabel.textContent = enemyMoved ? "ENEMY MOVES 1" : "ENEMY WAITS";
  }
}

// ── Caption helper ────────────────────────────────────────────────────────

function setMiniCaption(text: string): void {
  const el = document.getElementById("depthSceneCaption");
  if (el) el.textContent = text;
}

// ── Scene renderers ───────────────────────────────────────────────────────

function renderD1(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const M1 = 500, M1E = 850;
  const M2 = 900, M2E = 1250;
  const M3 = 1300, M3E = 1650;
  const FLASH = 1900;
  const BSPAWN = 2100, BSPAWN_E = 2500;
  const M4 = 2600, M4E = 2950;
  const COIN2_S = 3500, COIN2_E = 3800;
  const ENEMY2_S = 3850, ENEMY2_E = 4150;
  const DONE = MINI_TOTAL[1];
  const e = Math.min(elapsed, DONE);

  let svx = 0, svy = 2, sdir = "right";
  if      (e < M1)   { svx = 0; }
  else if (e < M1E)  { svx = eio((e - M1) / (M1E - M1)); }
  else if (e < M2)   { svx = 1; }
  else if (e < M2E)  { svx = 1 + eio((e - M2) / (M2E - M2)); }
  else if (e < M3)   { svx = 2; }
  else if (e < M3E)  { svx = 2 + eio((e - M3) / (M3E - M3)); }
  else if (e < M4)   { svx = 3; }
  else if (e < M4E)  { svy = 2 - eio((e - M4) / (M4E - M4)); svx = 3; sdir = "up"; }
  else               { svx = 3; svy = 1; sdir = "up"; }

  let evx = 4, evy = 4;
  if (e >= M2E) {
    if (e < M2E + 350) { evx = 4 - eio((e - M2E) / 350); evy = 4; }
    else { evx = 3; evy = 4; }
  }
  if (e >= M4E) {
    if (e < M4E + 350) { evx = 3; evy = 4 - eio((e - M4E) / 350); }
    else { evx = 3; evy = 3; }
  }

  const arrowAlpha2 = e >= M2E - 100 && e < M2E ? eio((e - (M2E - 100)) / 100) * 0.75
    : e >= M2E && e < M2E + 350 ? 0.75 * (1 - (e - M2E) / 350) : 0;
  const arrowAlpha4 = e >= M4E - 100 && e < M4E ? eio((e - (M4E - 100)) / 100) * 0.75
    : e >= M4E && e < M4E + 350 ? 0.75 * (1 - (e - M4E) / 350) : 0;

  const ammoniteAlpha  = e >= M3 ? Math.max(0, 1 - eio(Math.min(1, (e - M3) / (M3E - M3))) * 1.8) : 1;
  const plusAlpha      = e >= M3E && e < FLASH ? Math.sin(((e - M3E) / (FLASH - M3E)) * Math.PI) : 0;
  const bigEAlpha      = e >= BSPAWN ? eio(Math.min(1, (e - BSPAWN) / (BSPAWN_E - BSPAWN))) : 0;
  const coin43Alpha    = e < COIN2_S ? 1 : e < COIN2_E ? Math.max(0, 1 - eio((e - COIN2_S) / (COIN2_E - COIN2_S))) : 0;
  const coin2PlusAlpha = e >= COIN2_E && e < COIN2_E + 450 ? Math.sin(((e - COIN2_E) / 450) * Math.PI) : 0;
  const enemy2Alpha    = e >= ENEMY2_S ? eio(Math.min(1, (e - ENEMY2_S) / (ENEMY2_E - ENEMY2_S))) : 0;

  updateMovePips(e < M1 ? 0 : e < M2 ? 1 : e < M3 ? 2 : e < M4 ? 3 : 4);
  miniBackground(ctx, 1);
  [[0,1],[2,3],[3,4]].forEach(([c,r]) => miniDrawCoin(ctx, c, r));
  if (coin43Alpha > 0) { ctx.save(); ctx.globalAlpha = coin43Alpha; miniDrawCoin(ctx, 4, 3); ctx.restore(); }
  if (bigEAlpha > 0) miniDrawBigEnemy(ctx, 0, 0, bigEAlpha);
  if (ammoniteAlpha > 0) miniDrawAmmonite(ctx, 3, 2, ammoniteAlpha);
  if (plusAlpha > 0)     miniDrawLabel(ctx, 3, 2, "+10 PTS", plusAlpha);
  if (coin2PlusAlpha > 0) miniDrawLabel(ctx, 4, 3, "+1 PT", coin2PlusAlpha);
  if (enemy2Alpha > 0) miniDrawEnemy(ctx, 4, 1, enemy2Alpha);
  if (arrowAlpha2 > 0) miniDrawMoveArrow(ctx, 3, 4, "left", arrowAlpha2);
  if (arrowAlpha4 > 0) miniDrawMoveArrow(ctx, 3, 3, "up", arrowAlpha4);
  miniDrawEnemy(ctx, evx, evy, 1);
  miniDrawShark(ctx, svx, svy, sdir);

  if      (e < M1)        setMiniCaption("FIND THE PURPLE AMMONITE");
  else if (e < M1E)       setMiniCaption("MOVE 1 — ENEMY WAITS...");
  else if (e < M2E)       setMiniCaption("MOVE 2 — ENEMY ADVANCES!");
  else if (e < M3E)       setMiniCaption("MOVE 3 — COLLECT THE AMMONITE!");
  else if (e < FLASH)     setMiniCaption("+10 PTS — AMMONITE COLLECTED!");
  else if (e < BSPAWN_E)  setMiniCaption("A BIG 2×2 ENEMY SPAWNS!");
  else if (e < M4E)       setMiniCaption("MOVE 4 — ENEMY HUNTS AGAIN!");
  else if (e < COIN2_S)   setMiniCaption("REACH 100 PTS TO DESCEND");
  else if (e < COIN2_E)   setMiniCaption("COLLECTING A COIN...");
  else if (e < ENEMY2_E)  setMiniCaption("+1 PT — EVERY COIN SPAWNS AN ENEMY!");
  else                    setMiniCaption("BOARD FILLS FAST — PLAN YOUR ROUTE");
}

function renderD2(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const M1 = 900, M1E = 1250;
  const BOUNCE_S = 1500, BOUNCE_E = 2200;
  const TRANSFORM = 2350, SPAWN_E = 2950;
  const M3 = 3400, M3E = 3750;
  const M4 = 4150, M4E = 4500;
  const DONE = MINI_TOTAL[2];
  const e = Math.min(elapsed, DONE);

  let svx = 0, svy = 2, sdir: "right"|"left"|"up"|"down" = "right";
  if      (e < M1)        { svx = 0; }
  else if (e < M1E)       { svx = eio((e - M1) / (M1E - M1)); }
  else if (e < BOUNCE_S)  { svx = 1; }
  else if (e < BOUNCE_E)  { svx = 1 + Math.sin(((e - BOUNCE_S) / (BOUNCE_E - BOUNCE_S)) * Math.PI) * 0.45; }
  else if (e < M3)        { svx = 1; svy = 2; }
  else if (e < M3E)       { svx = 1; svy = 2 - eio((e - M3) / (M3E - M3)); sdir = "up"; }
  else if (e < M4)        { svx = 1; svy = 1; sdir = "up"; }
  else if (e < M4E)       { svx = 1 + eio((e - M4) / (M4E - M4)); svy = 1; sdir = "right"; }
  else                    { svx = 2; svy = 1; sdir = "right"; }

  let evx = 4, evy = 0;
  if (e >= BOUNCE_E) { const ee = BOUNCE_E + 380; evx = e < ee ? 4 - eio((e - BOUNCE_E) / 380) : 3; }
  if (e >= M4E)      { const ee = M4E + 380;      evx = e < ee ? 3 - eio((e - M4E) / 380) : 2; }

  const spawnedAlpha = e >= TRANSFORM ? eio(Math.min(1, (e - TRANSFORM) / (SPAWN_E - TRANSFORM))) : 0;
  let sevx = 4, sevy = 4;
  if (e >= M4E) { const ee = M4E + 380; sevy = e < ee ? 4 - eio((e - M4E) / 380) : 3; }

  const shellAlpha     = e < BOUNCE_E ? 1 : Math.max(0, 1 - eio(Math.min(1, (e - BOUNCE_E) / 250)) * 2);
  const barrierVisible = e >= BOUNCE_E;
  const barrierFlashAlpha = e >= BOUNCE_E && e < TRANSFORM
    ? Math.sin(((e - BOUNCE_E) / (TRANSFORM - BOUNCE_E)) * Math.PI) * 0.65 : 0;
  const plusAlpha      = e >= BOUNCE_E && e < BOUNCE_E + 700
    ? Math.sin(((e - BOUNCE_E) / 700) * Math.PI) : 0;
  const coralFadeAlpha = e < 700 ? eio(e / 700) : 1;

  updateMovePips(e < M1 ? 0 : e < BOUNCE_S ? 1 : e < M3 ? 2 : e < M4 ? 3 : 4);
  miniBackground(ctx, 2);
  ctx.save(); ctx.globalAlpha = coralFadeAlpha;
  miniDrawCoral(ctx, 0, 4); miniDrawCoral(ctx, 2, 4);
  ctx.restore();
  [[1,0],[4,1],[0,3],[3,4]].forEach(([c,r]) => miniDrawCoin(ctx, c, r));
  if (barrierVisible) {
    miniDrawCoral(ctx, 2, 2);
    if (barrierFlashAlpha > 0) {
      ctx.save(); ctx.globalAlpha = barrierFlashAlpha;
      ctx.fillStyle = "#daa070"; ctx.fillRect(2 * MINI_CS + 1, 2 * MINI_CS + 1, MINI_CS - 2, MINI_CS - 2);
      ctx.restore();
    }
  }
  if (shellAlpha > 0)    miniDrawCoralShell(ctx, 2, 2, shellAlpha);
  if (plusAlpha > 0)     miniDrawLabel(ctx, 2, 2, "+5 PTS", plusAlpha);
  if (spawnedAlpha > 0)  miniDrawEnemy(ctx, sevx, sevy, spawnedAlpha);
  miniDrawEnemy(ctx, evx, evy, 1);
  miniDrawShark(ctx, svx, svy, sdir);

  if      (e < BOUNCE_S)    setMiniCaption("THE CORAL SHELL BLOCKS YOUR PATH");
  else if (e < BOUNCE_E)    setMiniCaption("MOVE 2 — CAN'T BE COLLECTED!");
  else if (e < SPAWN_E)     setMiniCaption("IT HARDENS INTO A WALL — ENEMY SPAWNS");
  else if (e < M3)          setMiniCaption("THE BARRIER IS PERMANENT");
  else if (e < M4)          setMiniCaption("MOVE 3 — NAVIGATE AROUND IT");
  else if (e < M4E + 400)   setMiniCaption("MOVE 4 — ENEMY CLOSES IN");
  else                      setMiniCaption("EVERY HIT RESHAPES THE REEF FOREVER");
}

function renderD3(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const M1 = 900, M1E = 1250;
  const EGG_S = 1450, EGG_E = 1750;
  const FLASH = 1900;
  const BABY_S = 2000, BABY_E = 2300;
  const M3 = 2700, M3E = 3000;
  const EAT_S = 3500, EAT_E = 3900;
  const BLOOD_S = 3900;
  const DONE = MINI_TOTAL[3];
  const e = Math.min(elapsed, DONE);

  let svx = 2, svy = 2;
  if      (e < M1)    { svx = 2; svy = 2; }
  else if (e < M1E)   { svx = 2 + eio((e - M1) / (M1E - M1)); svy = 2; }
  else if (e < EGG_S) { svx = 3; svy = 2; }
  else if (e < EGG_E) { const t = (e - EGG_S) / (EGG_E - EGG_S); svx = 3 + eio(t); svy = 2 - eio(t); }
  else                { svx = 4; svy = 1; }
  if (e >= M3 && e < M3E) { svy = 1 - eio((e - M3) / (M3E - M3)); svx = 4; }
  else if (e >= M3E)       { svy = 0; svx = 4; }

  const babyVisible = e >= BABY_S && e < EAT_E;
  let bvx = 4, bvy = 1;
  if (e >= M3E) { bvx = 4; bvy = 1; }

  let evx = 0, evy = 4;
  if (e >= EAT_S) {
    const t2 = Math.min(1, (e - EAT_S) / (EAT_E - EAT_S));
    evx = eio(t2) * 1; evy = 4 - eio(t2) * 3;
  }
  const enemyEatsBaby = e >= EAT_E;
  const bloodAlpha = e < BLOOD_S ? 0
    : e < BLOOD_S + 400 ? eio((e - BLOOD_S) / 400)
    : Math.max(0, 1 - (e - BLOOD_S - 400) / 900);
  const plusAlpha  = e >= FLASH && e < FLASH + 600 ? Math.sin(((e - FLASH) / 600) * Math.PI) : 0;
  const minusAlpha = e >= EAT_E && e < EAT_E + 700 ? Math.sin(((e - EAT_E) / 700) * Math.PI) : 0;
  const eggVisible = e < EGG_E;
  const eggAlpha   = e > EGG_S ? Math.max(0, 1 - (e - EGG_S) / (EGG_E - EGG_S)) : 1;

  ctx.fillStyle = "#0f0812"; ctx.fillRect(0, 0, 200, 200);
  for (let r = 0; r < MINI_N; r++)
    for (let c = 0; c < MINI_N; c++) {
      ctx.fillStyle = MINI_TILE_COLORS_D1[r * MINI_N + c];
      ctx.fillRect(c * MINI_CS, r * MINI_CS, MINI_CS - 1, MINI_CS - 1);
    }

  if (bloodAlpha > 0) {
    ctx.save(); ctx.globalAlpha = bloodAlpha * 0.75;
    ctx.fillStyle = "#cc1a1a";
    ctx.fillRect(bvx * MINI_CS, bvy * MINI_CS, MINI_CS, MINI_CS);
    ctx.restore();
  }
  if (eggVisible) {
    ctx.save(); ctx.globalAlpha = eggAlpha;
    drawSharkEgg(ctx, 4 * MINI_CS + 2, 1 * MINI_CS + 2, MINI_CS - 4);
    ctx.restore();
  }
  if (!enemyEatsBaby) {
    ctx.fillStyle = "#0a1824"; ctx.fillRect(evx * MINI_CS - 1, evy * MINI_CS - 1, MINI_CS + 2, MINI_CS + 2);
    ctx.fillStyle = "#162d40"; ctx.fillRect(evx * MINI_CS, evy * MINI_CS, MINI_CS, MINI_CS);
  }
  if (babyVisible && !enemyEatsBaby) {
    const babyAlpha = e < BABY_E ? eio((e - BABY_S) / (BABY_E - BABY_S)) : 0.80;
    ctx.save(); ctx.globalAlpha = babyAlpha;
    drawBabyShark(ctx, bvx, bvy, MINI_CS, "right");
    ctx.restore();
  }
  miniDrawShark(ctx, svx, svy, "right");

  if (plusAlpha > 0) {
    ctx.save(); ctx.globalAlpha = plusAlpha;
    ctx.font = `bold ${Math.floor(MINI_CS * 0.9)}px monospace`;
    ctx.fillStyle = "#e06fa0"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("+10", (4 + 0.5) * MINI_CS, (1 - 0.8) * MINI_CS);
    ctx.restore();
  }
  if (minusAlpha > 0) {
    ctx.save(); ctx.globalAlpha = minusAlpha;
    ctx.font = `bold ${Math.floor(MINI_CS * 0.9)}px monospace`;
    ctx.fillStyle = "#ff4444"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("-5", (bvx + 0.5) * MINI_CS, (bvy - 0.8) * MINI_CS);
    ctx.restore();
  }

  updateMovePips(e < M1 ? 0 : e < EGG_S ? 1 : e < M3 ? 2 : e < EAT_S ? 3 : 4);
  if      (e < M1)              setMiniCaption("A SHARK EGG DRIFTS IN THE CURRENT");
  else if (e < EGG_S)           setMiniCaption("MOVE 1 — APPROACH THE EGG");
  else if (e < BABY_E)          setMiniCaption("MOVE 2 — COLLECT IT FOR +10 PTS!");
  else if (e < M3)              setMiniCaption("A BABY SHARK HATCHES — FOLLOWS YOU!");
  else if (e < EAT_S)           setMiniCaption("MOVE 3 — BABY TRAILS BEHIND");
  else if (e < EAT_E)           setMiniCaption("ENEMY MOVES TOWARD YOUR BABY...");
  else if (e < BLOOD_S + 1200)  setMiniCaption("BABY EATEN — LOSE 5 PTS!");
  else                          setMiniCaption("PROTECT YOUR PUPS — PLAN YOUR ROUTE");
}

// Pre-seeded Arctic tile grid (cold palette)
const MINI_TILE_COLORS_D4 = (() => {
  const seed = [0,2,4,1,3, 3,1,0,4,2, 2,4,3,0,1, 4,0,2,3,1, 1,3,1,2,0];
  return seed.map(i => ARCTIC_TILE_COLORS[i % ARCTIC_TILE_COLORS.length]);
})();

function renderD4(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const SLIDE_S = 800, SLIDE_E = 1600;
  const FISH_S  = 2000, FISH_E  = 2300;
  const SPAWN_S = 2400, SPAWN_E = 2700;
  const SLIDE2_S = 2800, SLIDE2_E = 3600;
  const DONE = MINI_TOTAL[4];
  const e = Math.min(elapsed, DONE);

  // Background — arctic cold palette
  ctx.fillStyle = "#0a1a2e"; ctx.fillRect(0, 0, 200, 200);
  for (let r = 0; r < MINI_N; r++)
    for (let c = 0; c < MINI_N; c++) {
      ctx.fillStyle = MINI_TILE_COLORS_D4[r * MINI_N + c];
      ctx.fillRect(c * MINI_CS, r * MINI_CS, MINI_CS, MINI_CS);
    }

  // Ice patch at cols 2-3, row 2
  const iceAlpha = 1;
  ctx.save(); ctx.globalAlpha = iceAlpha;
  for (const [ic, ir] of [[2,2],[3,2]] as [number,number][]) {
    const ix = ic * MINI_CS, iy = ir * MINI_CS;
    ctx.fillStyle = "#b8d4e8"; ctx.fillRect(ix, iy, MINI_CS, MINI_CS);
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2;
    ctx.strokeRect(ix + 1, iy + 1, MINI_CS - 2, MINI_CS - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ix + MINI_CS * 0.25, iy + MINI_CS * 0.12);
    ctx.lineTo(ix + MINI_CS * 0.72, iy + MINI_CS * 0.62);
    ctx.stroke();
  }
  ctx.restore();

  // Shark slides right along ice
  let svx = 0, svy = 2;
  if      (e < SLIDE_S) { svx = 0; }
  else if (e < SLIDE_E) { svx = eio((e - SLIDE_S) / (SLIDE_E - SLIDE_S)) * 3; }
  else if (e < FISH_S)  { svx = 3; }
  else if (e < FISH_E)  { svx = 3 + eio((e - FISH_S) / (FISH_E - FISH_S)); }
  else if (e < SLIDE2_S){ svx = 4; }
  else if (e < SLIDE2_E){ svx = 4; svy = 2 - eio((e - SLIDE2_S) / (SLIDE2_E - SLIDE2_S)); }
  else                  { svx = 4; svy = 0; }

  // Frozen fish at col 4, row 2
  const fishAlpha = e < FISH_S ? 1 : e < FISH_E ? Math.max(0, 1 - (e - FISH_S) / (FISH_E - FISH_S)) : 0;
  if (fishAlpha > 0) {
    ctx.save(); ctx.globalAlpha = fishAlpha;
    const pad = MINI_CS * 0.06;
    drawFrozenFish(ctx, 4 * MINI_CS + pad, 2 * MINI_CS + pad, MINI_CS - pad * 2);
    ctx.restore();
  }

  // Plus label
  const plusAlpha = e >= FISH_E && e < FISH_E + 600 ? Math.sin(((e - FISH_E) / 600) * Math.PI) : 0;
  if (plusAlpha > 0) {
    ctx.save(); ctx.globalAlpha = plusAlpha;
    ctx.font = `bold ${Math.floor(MINI_CS * 0.85)}px monospace`;
    ctx.fillStyle = "#7fd8f0"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("+5", (4 + 0.5) * MINI_CS, (2 - 0.8) * MINI_CS);
    ctx.restore();
  }

  // Spawned enemy
  const enemyAlpha = e >= SPAWN_S ? eio(Math.min(1, (e - SPAWN_S) / (SPAWN_E - SPAWN_S))) : 0;
  if (enemyAlpha > 0) miniDrawEnemy(ctx, 1, 4, enemyAlpha);

  miniDrawEnemy(ctx, 0, 4, 1);
  miniDrawShark(ctx, svx, svy, "right");

  updateMovePips(e < SLIDE_S ? 0 : e < FISH_S ? 1 : e < SLIDE2_S ? 2 : 3);
  if      (e < SLIDE_S)   setMiniCaption("ICE MAKES YOU SLIDE...");
  else if (e < SLIDE_E)   setMiniCaption("MOVE 1 — SLIDING ACROSS ICE!");
  else if (e < FISH_E)    setMiniCaption("COLLECT THE FROZEN FISH!");
  else if (e < SPAWN_E)   setMiniCaption("+5 PTS — AN ENEMY SPAWNS!");
  else if (e < SLIDE2_S)  setMiniCaption("TILE CONVERTS TO ICE...");
  else if (e < SLIDE2_E)  setMiniCaption("FISH LAUNCHES YOU — SLIDE AGAIN!");
  else                    setMiniCaption("DON'T SLIDE INTO AN ENEMY — THAT'S DEATH");
}

function renderD3Stub(ctx: CanvasRenderingContext2D, _e: number): void {
  ctx.fillStyle = "#0a1f0a"; ctx.fillRect(0, 0, 200, 200);
  for (let r = 0; r < MINI_N; r++)
    for (let c = 0; c < MINI_N; c++) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = MINI_TILE_COLORS_D1[r * MINI_N + c];
      ctx.fillRect(c * MINI_CS, r * MINI_CS, MINI_CS, MINI_CS);
    }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.font = "bold 52px monospace"; ctx.fillStyle = "rgba(106,191,58,0.4)";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("☣", 100, 100);
  ctx.restore();
  setMiniCaption("DEPTH 3 IS TOXIC TERRITORY...");
  updateMovePips(0);
}

function renderD6Stub(ctx: CanvasRenderingContext2D, _e: number): void {
  ctx.fillStyle = "#040f1a"; ctx.fillRect(0, 0, 200, 200);
  for (let r = 0; r < MINI_N; r++)
    for (let c = 0; c < MINI_N; c++) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = MINI_TILE_COLORS_D1[r * MINI_N + c];
      ctx.fillRect(c * MINI_CS, r * MINI_CS, MINI_CS, MINI_CS);
    }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.font = "bold 52px monospace"; ctx.fillStyle = "rgba(157,111,224,0.4)";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("?", 100, 100);
  ctx.restore();
  setMiniCaption("DEPTH 6 IS UNCHARTED TERRITORY...");
  updateMovePips(0);
}

function renderMiniScene(depth: number, elapsed: number): void {
  const canvas = document.getElementById("depthSceneCanvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 200, 200);
  if      (depth === 1) renderD1(ctx, elapsed);        // Shallows — ammonite
  else if (depth === 2) renderD3(ctx, elapsed);        // Nursery — shark egg (was D3 scene)
  else if (depth === 3) renderD3Stub(ctx, elapsed);    // Toxic — stub
  else if (depth === 4) renderD4(ctx, elapsed);        // Arctic — ice/fish
  else if (depth === 5) renderD2(ctx, elapsed);        // Reef — coral shell (was D2 scene)
  else                  renderD6Stub(ctx, elapsed);    // Abyss — stub
}

function syncMiniControls(): void {
  const play  = document.getElementById("depthScenePlay")!   as HTMLButtonElement;
  const pause = document.getElementById("depthScenePause")!  as HTMLButtonElement;
  const reset = document.getElementById("depthSceneReset")!  as HTMLButtonElement;
  if (miniDone) {
    play.style.display = "none"; pause.style.display = "none"; reset.style.display = "inline-flex";
  } else if (miniPlaying) {
    play.style.display = "none"; pause.style.display = "inline-flex"; reset.style.display = "none";
  } else {
    play.style.display = "inline-flex"; pause.style.display = "none";
    reset.style.display = miniElapsed > 0 ? "inline-flex" : "none";
  }
}

function miniTick(now: number): void {
  const delta = now - miniLastTick;
  miniLastTick = now;
  miniElapsed += delta;
  renderMiniScene(miniDepth, miniElapsed);
  if (miniElapsed >= MINI_TOTAL[miniDepth]) {
    miniDone = true; miniPlaying = false; miniRaf = null;
    syncMiniControls(); return;
  }
  miniRaf = requestAnimationFrame(miniTick);
}

// ── Public API ────────────────────────────────────────────────────────────

export function openDepthInfo(depth: number): void {
  miniDepth = depth;
  miniElapsed = 0; miniPlaying = false; miniDone = false;
  if (miniRaf) { cancelAnimationFrame(miniRaf); miniRaf = null; }

  const meta = DEPTH_META[depth] ?? DEPTH_META[1];
  (document.getElementById("depthInfoBadge")   as HTMLElement).textContent    = `DEPTH ${depth}`;
  (document.getElementById("depthInfoBadge")   as HTMLElement).style.color    = meta.color;
  (document.getElementById("depthInfoName")    as HTMLElement).textContent    = meta.name;
  (document.getElementById("depthInfoPanel")   as HTMLElement).style.borderColor = meta.color;
  (document.getElementById("depthInfoRules")   as HTMLElement).innerHTML      = buildRulesHTML(depth);

  ["depthScenePlay","depthScenePause","depthSceneReset"].forEach(id => {
    const el = document.getElementById(id) as HTMLElement;
    el.style.borderColor = meta.color;
    el.style.color       = meta.color;
  });

  updateMovePips(0);
  renderMiniScene(depth, 0);
  setMiniCaption(MINI_OPEN_CAPTIONS[depth] ?? "");
  syncMiniControls();
  document.getElementById("depthInfoOverlay")!.classList.add("visible");
}

export function closeDepthInfo(): void {
  if (miniRaf) { cancelAnimationFrame(miniRaf); miniRaf = null; }
  miniPlaying = false;
  document.getElementById("depthInfoOverlay")!.classList.remove("visible");
}

/** Wire up the scene playback buttons — call once on page load. */
export function initDepthInfoControls(): void {
  document.getElementById("depthScenePlay")!.addEventListener("click", () => {
    if (miniDone) return;
    miniPlaying = true; miniLastTick = performance.now();
    miniRaf = requestAnimationFrame(miniTick);
    syncMiniControls();
  });
  document.getElementById("depthScenePause")!.addEventListener("click", () => {
    if (!miniPlaying) return;
    miniPlaying = false;
    if (miniRaf) { cancelAnimationFrame(miniRaf); miniRaf = null; }
    syncMiniControls();
  });
  document.getElementById("depthSceneReset")!.addEventListener("click", () => {
    if (miniRaf) { cancelAnimationFrame(miniRaf); miniRaf = null; }
    miniElapsed = 0; miniPlaying = false; miniDone = false;
    updateMovePips(0);
    renderMiniScene(miniDepth, 0);
    setMiniCaption(MINI_OPEN_CAPTIONS[miniDepth] ?? "");
    syncMiniControls();
  });
  document.getElementById("depthInfoClose")!.addEventListener("click", closeDepthInfo);
  document.getElementById("depthInfoOverlay")!.addEventListener("click", e => {
    if (e.target === e.currentTarget) closeDepthInfo();
  });
}
