// ===== Pixel-art draw functions =====  →  GameScene.swift / SharkNode.swift
// All functions take a CanvasRenderingContext2D as first arg — no global state.

import { GRID, DYING_DURATION } from "./config";
import { gs } from "./state";

// ── Canvas management ─────────────────────────────────────────────────────

let _canvas: HTMLCanvasElement;
let _ctx: CanvasRenderingContext2D;

export function initRenderer(canvas: HTMLCanvasElement): void {
  _canvas = canvas;
  _ctx = canvas.getContext("2d")!;
}

export function getCanvas(): HTMLCanvasElement { return _canvas; }
export function getCtx(): CanvasRenderingContext2D { return _ctx; }

// ── Shell — moon-snail / ammonite, purple, round (Depth 1) ───────────────

export function drawShellPickup(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, ps: number,
): void {
  ctx.save();
  const cx = px + ps / 2, cy = py + ps / 2, r = (ps - 1) / 2;
  ctx.fillStyle = "#180530";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a28b0";
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.fill();
  const wx = cx - r * 0.18, wy = cy - r * 0.18;
  ctx.fillStyle = "#9848d8";
  ctx.beginPath(); ctx.arc(wx, wy, r * 0.52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a1888";
  ctx.beginPath(); ctx.arc(wx - r * 0.1, wy - r * 0.1, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c088e8";
  ctx.beginPath(); ctx.arc(wx - r * 0.14, wy - r * 0.14, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d8b0f8";
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.35, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.38, r * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Cone shell — apex-up pyramid (Depth 2) ───────────────────────────────

export function drawCoralShell(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, ps: number,
): void {
  ctx.save();
  const cx = px + ps / 2;
  const ROWS = 8;
  ctx.fillStyle = "#4a2010";
  for (let i = 0; i < ROWS; i++) {
    const ry = Math.round(py + (i * ps) / ROWS);
    const rh = Math.max(1, Math.round(ps / ROWS + 0.5));
    const rw = Math.round(ps * ((i + 1) / ROWS));
    const rx = Math.round(cx - rw / 2);
    ctx.fillRect(rx - 1, ry, rw + 2, rh + 1);
  }
  for (let i = 0; i < ROWS; i++) {
    const ry = Math.round(py + (i * ps) / ROWS);
    const rh = Math.max(1, Math.round(ps / ROWS));
    const rw = Math.round(ps * ((i + 1) / ROWS));
    const rx = Math.round(cx - rw / 2);
    const isStripe = i === 2 || i === 5;
    ctx.fillStyle = isStripe ? "#7a4a30" : "#c8906a";
    ctx.fillRect(rx, ry, rw, rh);
    if (!isStripe && rw >= 3) {
      ctx.fillStyle = "#e0b898";
      ctx.fillRect(rx, ry, Math.max(1, Math.round(rw * 0.22)), rh);
    }
  }
  ctx.fillStyle = "#f0c8a0";
  const tipRh = Math.max(1, Math.round((ps / ROWS) * 0.5));
  const tipRw = Math.max(1, Math.round(ps * 0.06));
  ctx.fillRect(Math.round(cx - tipRw / 2) + Math.round(tipRw * 0.3), Math.round(py + 1), tipRw, tipRh);
  ctx.restore();
}

// ── Shark egg — mermaid's purse capsule (Depth 3 pickup) ─────────────────

export function drawSharkEgg(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, ps: number,
): void {
  ctx.save();
  const cw = ps * 0.58, ch = ps * 0.84;
  const cx = px + ps / 2, cy = py + ps / 2;
  const ox = cx - cw / 2, oy = cy - ch / 2;
  const r  = cw * 0.38;

  function pill(x: number, y: number, w: number, h: number, rad: number) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y); ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  ctx.fillStyle = "#5a0800"; pill(ox - 1, oy - 1, cw + 2, ch + 2, r + 1); ctx.fill();
  ctx.fillStyle = "#c43a00"; pill(ox, oy, cw, ch, r); ctx.fill();
  ctx.fillStyle = "#e06020"; pill(ox + cw * 0.12, oy + ch * 0.08, cw * 0.62, ch * 0.48, r * 0.55); ctx.fill();
  ctx.fillStyle = "#ff9a50";
  ctx.beginPath(); ctx.arc(cx - cw * 0.17, cy - ch * 0.24, ps * 0.065, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#120000";
  ctx.beginPath(); ctx.ellipse(cx + cw * 0.03, cy + ch * 0.10, cw * 0.21, ch * 0.27, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2e0500";
  ctx.beginPath(); ctx.ellipse(cx, cy + ch * 0.08, cw * 0.10, ch * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  const tw = Math.max(1, ps * 0.042);
  ctx.strokeStyle = "#3d0700"; ctx.lineWidth = tw; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(ox + r * 0.8,       oy - tw,      ps * 0.17, Math.PI * 0.9,  Math.PI * 1.65); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox + cw - r * 0.8,  oy - tw,      ps * 0.17, -Math.PI * 0.65, Math.PI * 0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox + r * 0.8,       oy + ch + tw, ps * 0.17, Math.PI * 0.35, Math.PI * 1.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox + cw - r * 0.8,  oy + ch + tw, ps * 0.17, -Math.PI * 0.1, Math.PI * 0.65); ctx.stroke();
  ctx.restore();
}

// ── Frozen fish — icy pickup (Depth 4 — Arctic) ───────────────────────────

export function drawFrozenFish(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, ps: number,
): void {
  ctx.save();
  const cx = px + ps / 2, cy = py + ps / 2;

  // Body — icy blue oval
  ctx.fillStyle = "#5ab4d8";
  ctx.beginPath();
  ctx.ellipse(cx, cy, ps * 0.38, ps * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail — triangle pointing left
  ctx.fillStyle = "#4aa8cc";
  ctx.beginPath();
  ctx.moveTo(px + ps * 0.12, cy - ps * 0.18);
  ctx.lineTo(px + ps * 0.12, cy + ps * 0.18);
  ctx.lineTo(px + ps * 0.04, cy);
  ctx.closePath();
  ctx.fill();

  // Frosted overlay — white center highlight
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(cx - ps * 0.06, cy - ps * 0.06, ps * 0.16, ps * 0.09, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle dot (top-right)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx + ps * 0.22, cy - ps * 0.16, Math.max(1, ps * 0.05), 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#08181f";
  ctx.beginPath();
  ctx.arc(cx + ps * 0.24, cy - ps * 0.04, Math.max(1, ps * 0.04), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Blood cell — 5-layer visceral pool when baby shark is eaten (Depth 3) ─

export function drawBloodCell(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, cs: number,
  movesRemaining: number,
): void {
  ctx.save();
  const age = 20 - movesRemaining;
  const masterAlpha = movesRemaining > 10
    ? 0.80 + (movesRemaining - 10) / 10 * 0.08
    : (movesRemaining / 10) * 0.80;
  const cxp = px + cs / 2, cyp = py + cs / 2;
  const poolR = cs * 0.40;

  ctx.globalAlpha = masterAlpha * 0.75;
  ctx.fillStyle = "#3d0000";
  ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);

  ctx.globalAlpha = masterAlpha;
  ctx.fillStyle = "#991111";
  ctx.beginPath(); ctx.arc(cxp, cyp, poolR, 0, Math.PI * 2); ctx.fill();

  if (movesRemaining > 4) {
    const ca = movesRemaining > 10 ? masterAlpha : (movesRemaining / 10) * masterAlpha * 1.1;
    ctx.globalAlpha = ca;
    ctx.fillStyle = "#cc2222";
    ctx.beginPath(); ctx.arc(cxp, cyp, poolR * 0.60, 0, Math.PI * 2); ctx.fill();
  }
  if (age < 5) {
    ctx.globalAlpha = Math.min(1, (1 - age / 5) * masterAlpha * 1.1);
    ctx.fillStyle = "#ff4444";
    ctx.beginPath(); ctx.arc(cxp, cyp, poolR * 0.30, 0, Math.PI * 2); ctx.fill();
  }
  if (age < 4) {
    ctx.globalAlpha = (1 - age / 4) * masterAlpha * 0.85;
    ctx.fillStyle = "#bb1111";
    const dot = Math.max(1, Math.round(cs * 0.14));
    const margin = 2;
    const ox = ((px * 7 + py * 3) % 3) - 1;
    const oy = ((px * 5 + py * 11) % 3) - 1;
    ctx.fillRect(px + margin + ox,               py + margin,               dot, dot);
    ctx.fillRect(px + cs - margin - dot,         py + margin,               dot, dot);
    ctx.fillRect(px + margin,                    py + cs - margin - dot,    dot, dot);
    ctx.fillRect(px + cs - margin - dot + ox,    py + cs - margin - dot + oy, dot, dot);
  }
  ctx.restore();
}

// ── Baby shark — smaller companion (Depth 3) ─────────────────────────────

export function drawBabyShark(
  ctx: CanvasRenderingContext2D,
  gx: number, gy: number, cs: number, dir: string,
): void {
  const scale = 0.55;
  const offset = cs * (1 - scale) / 2;
  ctx.save();
  ctx.globalAlpha = 0.80;
  ctx.translate(gx * cs + offset, gy * cs + offset);
  ctx.scale(scale, scale);
  drawSharkOnCtx(ctx, 0, 0, cs, dir);
  ctx.restore();
}

// ── Shark — 9-pass pixel-art sprite  →  SharkNode.swift ──────────────────

export function drawSharkOnCtx(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cellSize: number,
  dir: string,
  tailWag: number = 0, // -1..1 drives tail-fin counter-oscillation
): void {
  const x = cx * cellSize, y = cy * cellSize;
  const w = cellSize,       h = cellSize;
  ctx.save();

  const midX = x + w / 2, midY = y + h / 2;
  ctx.translate(midX, midY);
  if      (dir === "left")  ctx.scale(-1, 1);
  else if (dir === "down")  ctx.rotate(Math.PI / 2);
  else if (dir === "up")    ctx.rotate(-Math.PI / 2);
  ctx.translate(-midX, -midY);

  const R = (fx: number, fy: number, fw: number, fh: number) =>
    ctx.fillRect(
      Math.round(x + fx * w), Math.round(y + fy * h),
      Math.max(1, Math.round(fw * w)), Math.max(1, Math.round(fh * h)),
    );

  const OUTLINE   = "#0a1e28";
  const BODY      = "#7aaab8";
  const DARK_FIN  = "#4a7a8a";
  const HIGHLIGHT = "#c0dae2";
  const BELLY     = "#f0f8fa";

  // 1. Outline pass
  ctx.fillStyle = OUTLINE;
  R(0.06, 0.27, 0.82, 0.46);
  R(0.0,  0.12 - tailWag * 0.07, 0.14, 0.22);
  R(0.0,  0.62 + tailWag * 0.07, 0.14, 0.22);
  ctx.beginPath();
  ctx.moveTo(Math.round(x + 0.34 * w), Math.round(y + 0.27 * h));
  ctx.lineTo(Math.round(x + 0.5  * w), Math.round(y + 0.01 * h));
  ctx.lineTo(Math.round(x + 0.67 * w), Math.round(y + 0.27 * h));
  ctx.closePath(); ctx.fill();

  // 2. Body
  ctx.fillStyle = BODY; R(0.08, 0.29, 0.78, 0.42);

  // 3. Dorsal fin
  ctx.fillStyle = DARK_FIN;
  ctx.beginPath();
  ctx.moveTo(Math.round(x + 0.36 * w), Math.round(y + 0.29 * h));
  ctx.lineTo(Math.round(x + 0.5  * w), Math.round(y + 0.05 * h));
  ctx.lineTo(Math.round(x + 0.65 * w), Math.round(y + 0.29 * h));
  ctx.closePath(); ctx.fill();

  // 4. Tail fins
  ctx.fillStyle = DARK_FIN;
  R(0.01, 0.14 - tailWag * 0.07, 0.11, 0.16);
  R(0.01, 0.64 + tailWag * 0.07, 0.11, 0.16);

  // 5. Top highlight
  ctx.fillStyle = HIGHLIGHT; R(0.14, 0.29, 0.36, 0.09);

  // 6. Belly
  ctx.fillStyle = BELLY; R(0.18, 0.52, 0.5, 0.14);

  // 7. Pectoral fin
  ctx.fillStyle = DARK_FIN; R(0.36, 0.62, 0.2, 0.09);

  // 8. Eye
  ctx.fillStyle = "#d8eef4"; R(0.69, 0.33, 0.10, 0.14);
  ctx.fillStyle = "#08181f"; R(0.71, 0.35, 0.06, 0.09);
  ctx.fillStyle = "#ffffff"; R(0.70, 0.34, 0.02, 0.03);

  // 9. Mouth notch
  ctx.fillStyle = OUTLINE; R(0.84, 0.56, 0.08, 0.08);

  ctx.restore();
}

// ── Main game render function ─────────────────────────────────────────────

export function draw(): void {
  const canvas = _canvas;
  const ctx    = _ctx;
  const CELL   = gs.CELL;

  if (gs.colorblindMode) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#48cae4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= GRID; i++) {
      const pos = i === GRID ? canvas.width - 0.5 : Math.round(i * CELL) + 0.5;
      ctx.moveTo(pos, 0); ctx.lineTo(pos, canvas.height);
      ctx.moveTo(0, pos); ctx.lineTo(canvas.width, pos);
    }
    ctx.stroke();
  } else {
    ctx.fillStyle = gs.currentDepth === 4 ? "#0a1a2e" : "#0f5262";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) {
        ctx.fillStyle = gs.colors[r][c];
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    if (gs.shimmerMode) {
      ctx.fillStyle = "#d8f4fc";
      for (let r = 0; r < GRID; r++)
        for (let c = 0; c < GRID; c++) {
          const v = gs.shimmerIntensity[r * GRID + c];
          if (v > 0.02) { ctx.globalAlpha = v * 0.18; ctx.fillRect(c * CELL, r * CELL, CELL, CELL); }
        }
      ctx.globalAlpha = 1;
    }
  }

  // Coral barriers (Depth 2)
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (!gs.coral[r][c]) continue;
      const cx = c * CELL, cy = r * CELL;
      ctx.fillStyle = "#7a4a30"; ctx.fillRect(cx, cy, CELL, CELL);
      ctx.fillStyle = "#c8906a"; ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
      if (CELL >= 8) {
        ctx.fillStyle = "#e0b898";
        const dot = Math.max(2, Math.floor(CELL * 0.15));
        ctx.fillRect(cx + 2, cy + 2, dot, dot);
        ctx.fillRect(cx + CELL - dot - 2, cy + 2, dot, dot);
      }
    }

  // Ice patches (Depth 4 — Arctic)
  if (gs.currentDepth === 4) {
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (!gs.iceCells[r][c]) continue;
        const ix = c * CELL, iy = r * CELL;
        ctx.fillStyle = "#b8d4e8";
        ctx.fillRect(ix, iy, CELL, CELL);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(ix + 1, iy + 1, CELL - 2, CELL - 2);
        if (CELL >= 8) {
          ctx.save();
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = Math.max(1, CELL * 0.08);
          ctx.beginPath();
          ctx.moveTo(ix + CELL * 0.25, iy + CELL * 0.12);
          ctx.lineTo(ix + CELL * 0.72, iy + CELL * 0.62);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // Blood cells
  for (const bc of gs.bloodCells)
    drawBloodCell(ctx, bc.x * CELL, bc.y * CELL, CELL, bc.movesRemaining);

  // Coin pickups
  const pad = CELL * 0.2;
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (!gs.pickups[r][c]) continue;
      const px = c * CELL + pad, py = r * CELL + pad, ps = CELL - pad * 2;
      ctx.fillStyle = "#7a5500"; ctx.fillRect(px - 1, py - 1, ps + 2, ps + 2);
      ctx.fillStyle = "#ffd166"; ctx.fillRect(px, py, ps, ps);
    }

  // Ammonite super pickups
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (!gs.superPickups[r][c]) continue;
      const px = c * CELL + pad, py = r * CELL + pad, ps = CELL - pad * 2;
      drawShellPickup(ctx, px, py, ps);
    }

  // Shark egg (Depth 3)
  if (gs.sharkEgg) {
    const ep = CELL * 0.06;
    drawSharkEgg(ctx, gs.sharkEgg.x * CELL + ep, gs.sharkEgg.y * CELL + ep, CELL - ep * 2);
  }

  // Frozen fish (Depth 4 — Arctic)
  if (gs.frozenFish) {
    const fp = CELL * 0.06;
    drawFrozenFish(ctx, gs.frozenFish.x * CELL + fp, gs.frozenFish.y * CELL + fp, CELL - fp * 2);
  }

  // Coral shell pickups (Depth 2)
  if (gs.currentDepth === 2)
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) {
        if (!gs.coralPickups[r][c]) continue;
        const cpx = c * CELL + pad, cpy = r * CELL + pad, cps = CELL - pad * 2;
        drawCoralShell(ctx, cpx, cpy, cps);
      }

  // Dying enemies (dissolve animation)
  if (gs.dyingEnemies.length > 0) {
    const now = performance.now();
    for (const de of gs.dyingEnemies) {
      const elapsed = now - de.startTime;
      if (elapsed < 0) continue;
      const t    = Math.min(1, elapsed / DYING_DURATION);
      const ease = 1 - t * t;
      const drift = t * CELL * 0.22;
      const inset = t * CELL * 0.3;
      ctx.save();
      ctx.globalAlpha = ease;
      if (de.isBig) {
        const bx = de.x * CELL + inset, by = de.y * CELL + inset + drift;
        const bw = Math.max(0, CELL * 2 - inset * 2);
        ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
        ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
      } else {
        const ex = de.x * CELL + inset, ey = de.y * CELL + inset + drift;
        const ew = Math.max(0, CELL - inset * 2);
        ctx.fillStyle = "#0a1824"; ctx.fillRect(ex - 1, ey - 1, ew + 2, ew + 2);
        ctx.fillStyle = "#162d40"; ctx.fillRect(ex, ey, ew, ew);
      }
      ctx.restore();
    }
  }

  // Regular enemies
  for (const e of gs.enemies) {
    ctx.fillStyle = "#0a1824"; ctx.fillRect(e.x * CELL - 1, e.y * CELL - 1, CELL + 2, CELL + 2);
    ctx.fillStyle = "#162d40"; ctx.fillRect(e.x * CELL, e.y * CELL, CELL, CELL);
  }

  // Big enemies (2×2)
  for (const be of gs.bigEnemies) {
    const bx = be.x * CELL, by = be.y * CELL, bw = CELL * 2;
    ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
    ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
  }

  // Leviathan (3×3, Depth 4)
  if (gs.leviathan) {
    const lx = gs.leviathan.x * CELL, ly = gs.leviathan.y * CELL, lw = CELL * 3;
    ctx.shadowColor = "#0d3550"; ctx.shadowBlur = 18;
    ctx.fillStyle = "#070f18"; ctx.fillRect(lx - 2, ly - 2, lw + 4, lw + 4);
    ctx.fillStyle = "#0f2035"; ctx.fillRect(lx, ly, lw, lw);
    ctx.fillStyle = "#162840"; ctx.fillRect(lx + 3, ly + 3, lw - 6, lw - 6);
    ctx.shadowBlur = 0;
  }

  // Baby sharks
  for (const b of gs.babySharks)
    drawBabyShark(ctx, b.x, b.y, CELL, gs.sharkDir);

  // Player shark
  drawSharkOnCtx(ctx, gs.sharkVisualX, gs.sharkVisualY, CELL, gs.sharkDir);
}
