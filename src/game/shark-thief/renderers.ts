// ===== Pixel-art draw functions =====  →  GameScene.swift / SharkNode.swift
// All functions take a CanvasRenderingContext2D as first arg — no global state.

import { GRID, DYING_DURATION, RISING_DURATION } from "./config";
import { LEVEL_CONFIG, PACIFIC_DEPTH, ELECTRIC_DEPTH } from "./level-config";
import { gs, type NeutralFish, type ElectricEel } from "./state";
import { drawNeutralFish, drawAlgaeBall } from "./sprites";
import { drawEelHeadV3 } from "./sprites-v2";

// ── Helpers ───────────────────────────────────────────────────────────────

function blendHex(base: string, tR: number, tG: number, tB: number, t: number): string {
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  const rr = Math.round(r + (tR - r) * t) & 0xff;
  const gg = Math.round(g + (tG - g) * t) & 0xff;
  const bb = Math.round(b + (tB - b) * t) & 0xff;
  return `#${rr.toString(16).padStart(2, "0")}${gg.toString(16).padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`;
}

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

// ── Coral barrier — variant dispatch ─────────────────────────────────────
//    The draw loop calls drawCoralBarrier(ctx, cx, cy, CELL, type) where
//    type = (r * 7 + c * 11) % CORAL_BARRIER_VARIANTS.
//    To add a new shape: implement a drawCoralBarrierN function below,
//    increment CORAL_BARRIER_VARIANTS, and add a case in the switch.

const CORAL_BARRIER_VARIANTS = 1; // bump when adding new types

export function drawCoralBarrier(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  CELL: number,
  type: number,
): void {
  ctx.save();

  const p = (f: number) => Math.round(f * CELL);
  const R = (fx: number, fy: number, fw: number, fh: number) =>
    ctx.fillRect(cx + p(fx), cy + p(fy), Math.max(1, p(fw)), Math.max(1, p(fh)));

  switch (type) {
    default:
    case 0:
      // ── Orange block (original) ───────────────────────────────────────────
      ctx.fillStyle = "#7a4a30"; R(0, 0, 1, 1);
      ctx.fillStyle = "#c8906a"; R(1/CELL, 1/CELL, 1 - 2/CELL, 1 - 2/CELL);
      if (CELL >= 8) {
        ctx.fillStyle = "#e0b898";
        const d = Math.max(2, Math.floor(CELL * 0.15)) / CELL;
        R(2/CELL, 2/CELL, d, d);
        R(1 - d - 2/CELL, 2/CELL, d, d);
      }
      break;

    // ── Add new coral variants here ───────────────────────────────────────
    // case 1: drawCoralBarrier1(ctx, cx, cy, CELL, p, R); break;
    // case 2: drawCoralBarrier2(ctx, cx, cy, CELL, p, R); break;
  }

  ctx.restore();
}

// ── Placeholder for next coral shape — copy this block to add a new one ──
// function drawCoralBarrier1(
//   ctx: CanvasRenderingContext2D,
//   cx: number, cy: number,
//   CELL: number,
//   p: (f: number) => number,
//   R: (fx: number, fy: number, fw: number, fh: number) => void,
// ): void {
//   // draw here
// }

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

  // Dark outline — silhouette first, pops against the arctic blue-gray water
  ctx.fillStyle = "#0d2233";
  ctx.beginPath();
  ctx.ellipse(cx, cy, ps * 0.42, ps * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail outline — triangle pointing left
  ctx.beginPath();
  ctx.moveTo(px + ps * 0.11, cy - ps * 0.22);
  ctx.lineTo(px + ps * 0.11, cy + ps * 0.22);
  ctx.lineTo(px + ps * 0.01, cy);
  ctx.closePath();
  ctx.fill();

  // Body — pale ice white, high contrast against blue-gray water
  ctx.fillStyle = "#dff2f8";
  ctx.beginPath();
  ctx.ellipse(cx, cy, ps * 0.36, ps * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fill — slightly cooler than body
  ctx.fillStyle = "#b8e0ee";
  ctx.beginPath();
  ctx.moveTo(px + ps * 0.13, cy - ps * 0.17);
  ctx.lineTo(px + ps * 0.13, cy + ps * 0.17);
  ctx.lineTo(px + ps * 0.04, cy);
  ctx.closePath();
  ctx.fill();

  // Ice shading — mid-tone cool blue on lower body
  ctx.fillStyle = "#a0cfe0";
  ctx.beginPath();
  ctx.ellipse(cx + ps * 0.04, cy + ps * 0.06, ps * 0.22, ps * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bright specular highlight — top left of body
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx - ps * 0.10, cy - ps * 0.07, ps * 0.10, ps * 0.06, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle — small white dot top-right
  ctx.beginPath();
  ctx.arc(cx + ps * 0.24, cy - ps * 0.14, Math.max(1, ps * 0.045), 0, Math.PI * 2);
  ctx.fill();

  // Eye — gold, warm contrast against cool palette
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(cx + ps * 0.22, cy - ps * 0.04, Math.max(1, ps * 0.065), 0, Math.PI * 2);
  ctx.fill();

  // Eye pupil
  ctx.fillStyle = "#0d2233";
  ctx.beginPath();
  ctx.arc(cx + ps * 0.23, cy - ps * 0.04, Math.max(1, ps * 0.035), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Toxic barrel — rusty drum, leaking green fluid (Depth 5) ─────────────

export function drawToxicBarrel(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, ps: number,
): void {
  ctx.save();
  const cx = px + ps / 2;
  const bw = ps * 0.62, bh = ps * 0.78;
  const bx = Math.round(cx - bw / 2), by = Math.round(py + ps * 0.12);

  ctx.shadowColor = "rgba(120, 220, 20, 0.85)";
  ctx.shadowBlur  = Math.max(4, ps * 0.35);

  ctx.fillStyle = "#1a0800";
  ctx.fillRect(bx - 1, by - 1, Math.round(bw) + 2, Math.round(bh) + 2);

  ctx.fillStyle = "#7a3010";
  ctx.fillRect(bx, by, Math.round(bw), Math.round(bh));

  ctx.fillStyle = "#a04820";
  ctx.fillRect(bx + 1, by + 1, Math.round(bw) - 2, Math.round(bh) - 2);

  ctx.fillStyle = "#3a1408";
  const bandH = Math.max(1, Math.round(ps * 0.055));
  for (const bandY of [by + Math.round(bh * 0.22), by + Math.round(bh * 0.50), by + Math.round(bh * 0.76)]) {
    ctx.fillRect(bx, bandY, Math.round(bw), bandH);
  }

  ctx.fillStyle = "#c06030";
  ctx.fillRect(bx + 2, by + 2, Math.max(1, Math.round(bw * 0.18)), Math.round(bh) - 4);

  ctx.fillStyle = "#4a9010";
  const lw = Math.max(1, Math.round(ps * 0.10));
  ctx.fillRect(Math.round(cx - lw / 2), by + Math.round(bh) - 2, lw, Math.round(ps * 0.14));

  ctx.fillStyle = "#3a7808";
  ctx.fillRect(Math.round(cx - lw), by + Math.round(bh) + Math.round(ps * 0.10), lw * 2, Math.max(1, Math.round(ps * 0.07)));

  ctx.fillStyle = "#88e030";
  const dotR = Math.max(1, ps * 0.07);
  ctx.beginPath();
  ctx.arc(cx, by + Math.round(bh * 0.12), dotR, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  ctx.restore();
}

// ── Toxic cloud — 5×5 minus-corners (21 cells), gaseous sickly green (Depth 5) ─

export function drawToxicCloud(
  ctx: CanvasRenderingContext2D,
  gridX: number, gridY: number, CELL: number,
  pulseIntensity: number = 0,
): void {
  const px = gridX * CELL, py = gridY * CELL;
  ctx.save();

  ctx.shadowColor = "rgba(136, 220, 20, 0.60)";
  ctx.shadowBlur  = Math.max(3, CELL * 0.28);

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "#88cc20";
  ctx.fillRect(px, py, CELL, CELL);

  if (pulseIntensity > 0.02) {
    ctx.globalAlpha = pulseIntensity * 0.35;
    ctx.fillStyle = "#ccff55";
    ctx.fillRect(px, py, CELL, CELL);
  }

  const seed  = (gridX * 31 + gridY * 17) & 0xff;
  const seedB = (seed ^ 0x5a) & 0xff;
  const dotSize = Math.max(1, Math.round(CELL * 0.28));
  const step = Math.round(CELL * 0.18);

  // Rest position
  const oxA = (seed  & 0x03) * step;
  const oyA = ((seed  >> 2) & 0x03) * step;
  // Shimmer-to position (different cell area)
  const oxB = (seedB & 0x03) * step;
  const oyB = ((seedB >> 2) & 0x03) * step;

  const darkAlpha  = 0.18 + (seed & 0x0f) / 0x0f * 0.14;
  const lightAlpha = 0.12 + ((seed >> 4) & 0x0f) / 0x0f * 0.10;

  // Dark dot fades out of A, fades into B during pulse
  ctx.fillStyle = "#4a8010";
  ctx.globalAlpha = darkAlpha * (1 - pulseIntensity);
  ctx.fillRect(px + oxA, py + oyA, dotSize, dotSize);
  if (pulseIntensity > 0.02) {
    ctx.globalAlpha = darkAlpha * pulseIntensity;
    ctx.fillRect(px + oxB, py + oyB, dotSize, dotSize);
  }

  // Light dot mirrors the same cross-fade
  ctx.fillStyle = "#aaee38";
  ctx.globalAlpha = lightAlpha * (1 - pulseIntensity);
  ctx.fillRect(px + (CELL - oxA - dotSize), py + (CELL - oyA - dotSize), dotSize, dotSize);
  if (pulseIntensity > 0.02) {
    ctx.globalAlpha = lightAlpha * pulseIntensity;
    ctx.fillRect(px + (CELL - oxB - dotSize), py + (CELL - oyB - dotSize), dotSize, dotSize);
  }

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  ctx.restore();
}

// ── Shrimp — red-orange pixel-art crustacean pickup (Depth 7 — Electric) ──

export function drawShrimp(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, size: number,
): void {
  ctx.save();

  const s = size;
  // Body segments — 4 horizontal rects, head at left, tail at right
  // Drawn with slight height taper toward the tail
  const segColors = ["#cc3010", "#ff6030", "#ff6030", "#ff8050"];
  const segW = [s * 0.28, s * 0.24, s * 0.20, s * 0.16];
  const segH = [s * 0.38, s * 0.32, s * 0.28, s * 0.22];
  let segX = px + s * 0.08;
  const bodyY = py + s * 0.38;

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = segColors[i];
    ctx.fillRect(
      Math.round(segX),
      Math.round(bodyY - segH[i] / 2),
      Math.round(segW[i]),
      Math.round(segH[i]),
    );
    segX += segW[i];
  }

  // Highlight stripe on top of body
  ctx.fillStyle = "#ff8050";
  ctx.fillRect(
    Math.round(px + s * 0.08),
    Math.round(bodyY - s * 0.38 / 2),
    Math.round(s * 0.68),
    Math.round(s * 0.06),
  );

  // Shadow underside
  ctx.fillStyle = "#cc3010";
  ctx.fillRect(
    Math.round(px + s * 0.08),
    Math.round(bodyY + s * 0.10),
    Math.round(s * 0.68),
    Math.round(s * 0.05),
  );

  // Fanned tail — 3 small rects fanning right
  const tailX = Math.round(px + s * 0.78);
  ctx.fillStyle = "#ff6030";
  ctx.fillRect(tailX, Math.round(bodyY - s * 0.18), Math.round(s * 0.10), Math.round(s * 0.08));
  ctx.fillRect(tailX, Math.round(bodyY - s * 0.06), Math.round(s * 0.12), Math.round(s * 0.08));
  ctx.fillRect(tailX, Math.round(bodyY + s * 0.06), Math.round(s * 0.10), Math.round(s * 0.08));
  ctx.fillStyle = "#ff8050";
  ctx.fillRect(tailX + Math.round(s * 0.02), Math.round(bodyY - s * 0.17), Math.round(s * 0.04), Math.round(s * 0.04));

  // Claw suggestion — small rect at head end
  ctx.fillStyle = "#cc3010";
  ctx.fillRect(
    Math.round(px + s * 0.02),
    Math.round(bodyY - s * 0.20),
    Math.round(s * 0.08),
    Math.round(s * 0.10),
  );
  ctx.fillStyle = "#ff6030";
  ctx.fillRect(
    Math.round(px + s * 0.02),
    Math.round(bodyY + s * 0.12),
    Math.round(s * 0.08),
    Math.round(s * 0.08),
  );

  // Antennae — 2 thin lines extending from head
  ctx.strokeStyle = "#ffaa60";
  ctx.lineWidth = Math.max(1, s * 0.04);
  ctx.beginPath();
  ctx.moveTo(Math.round(px + s * 0.08), Math.round(bodyY - s * 0.16));
  ctx.lineTo(Math.round(px - s * 0.10), Math.round(bodyY - s * 0.42));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(Math.round(px + s * 0.08), Math.round(bodyY - s * 0.12));
  ctx.lineTo(Math.round(px - s * 0.04), Math.round(bodyY - s * 0.44));
  ctx.stroke();

  ctx.restore();
}

// ── Electric eel — snake body + pixel-art head (Depth 7 — Electric) ───────

function drawEelHead(
  ctx: CanvasRenderingContext2D,
  seg: { x: number; y: number },
  dir: "right" | "left" | "up" | "down",
  CELL: number,
): void {
  const px = seg.x * CELL, py = seg.y * CELL;
  const midX = px + CELL / 2, midY = py + CELL / 2;
  ctx.save();
  ctx.translate(midX, midY);
  if      (dir === "left")  ctx.scale(-1, 1);
  else if (dir === "down")  ctx.rotate(Math.PI / 2);
  else if (dir === "up")    ctx.rotate(-Math.PI / 2);
  ctx.translate(-midX, -midY);
  drawEelHeadV3(ctx, px, py, CELL, CELL);
  ctx.restore();
}

export function drawElectricEel(
  ctx: CanvasRenderingContext2D,
  eel: ElectricEel,
  CELL: number,
): void {
  if (eel.segments.length === 0) return;

  const now = Date.now();
  // Clipped sine: fully electric for half the cycle, completely dark for the other half
  const pulse = Math.max(0, Math.sin(now / 400 * Math.PI * 2));

  const pts = eel.segments.slice().reverse().map(s => ({
    x: s.x * CELL + CELL / 2,
    y: s.y * CELL + CELL / 2,
  }));

  if (pts.length < 2) {
    ctx.save();
    drawEelHead(ctx, eel.segments[0], eel.dir, CELL);
    ctx.restore();
    return;
  }

  // Right-perpendicular at each point — dorsal side consistent with travel direction
  // Uses averaged tangent at corners for smooth bends
  const perps = pts.map((_, i) => {
    let dx: number, dy: number;
    if (i === 0) {
      dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y;
    } else if (i === pts.length - 1) {
      dx = pts[i].x - pts[i - 1].x; dy = pts[i].y - pts[i - 1].y;
    } else {
      dx = pts[i + 1].x - pts[i - 1].x; dy = pts[i + 1].y - pts[i - 1].y;
    }
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) return { x: 0, y: -1 };
    return { x: dy / len, y: -dx / len };
  });

  const dorsalW = CELL * 0.15; // narrow — straight flat back
  const bellyW  = CELL * 0.23; // wider — gently curved ventral side

  // Pointed tail tip
  const tdx = pts[0].x - pts[1].x, tdy = pts[0].y - pts[1].y;
  const tlen = Math.sqrt(tdx * tdx + tdy * tdy);
  const tipX = pts[0].x + (tdx / tlen) * CELL * 0.40;
  const tipY = pts[0].y + (tdy / tlen) * CELL * 0.40;

  // Filled blade polygon: tip → dorsal edge (tail→head) → belly edge (head→tail) → close
  const buildPoly = (pArr: typeof pts, dw: number, bw: number) => {
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    for (let i = 0; i < pArr.length; i++) {
      ctx.lineTo(pArr[i].x + perps[i].x * dw, pArr[i].y + perps[i].y * dw);
    }
    for (let i = pArr.length - 1; i >= 0; i--) {
      ctx.lineTo(pArr[i].x - perps[i].x * bw, pArr[i].y - perps[i].y * bw);
    }
    ctx.closePath();
  };

  // Glow polygon stops before head segment to keep head clean
  const glowPts = pts.slice(0, -1);

  ctx.save();

  // Electric glow — only active when pulse > 0, dead dark when pulse = 0
  if (pulse > 0.01) {
    ctx.shadowColor = "#ffee00";
    ctx.shadowBlur  = pulse * 22;
    ctx.fillStyle   = "#0a0e0c";
    buildPoly(glowPts, dorsalW + 3, bellyW + 3);
    ctx.fill();
    ctx.shadowBlur  = 0;
  }

  // Dark outline shell (full body, flows into head)
  ctx.shadowBlur = 0;
  ctx.fillStyle  = "#0a0e0c";
  buildPoly(pts, dorsalW + 2, bellyW + 2);
  ctx.fill();

  // Dark dorsal fill — covers back half, flat straight edge appearance
  ctx.fillStyle = "#1e2218";
  buildPoly(pts, dorsalW, bellyW * 0.15);
  ctx.fill();

  // Lighter belly fill — wider ventral side, suggests curved belly profile
  ctx.fillStyle = "#5a5040";
  buildPoly(pts, dorsalW * 0.15, bellyW);
  ctx.fill();

  ctx.restore();

  // Head sprite drawn on top — no shadow to avoid neck glow ring
  ctx.save();
  drawEelHead(ctx, eel.segments[0], eel.dir, CELL);
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

// ── Pacific depth lighting (Depth 6) ─────────────────────────────────────
// Drawn after the tile grid so it tints tiles. Drawn before entities so
// enemies/fish/player remain fully visible on top.

function drawPacificLighting(ctx: CanvasRenderingContext2D, w: number, h: number, now: number): void {
  // ── Depth gradient: light cyan at surface, deep navy at bottom ──────────
  const depthGrad = ctx.createLinearGradient(0, 0, 0, h);
  depthGrad.addColorStop(0,    "rgba(160, 230, 255, 0.30)"); // bright surface wash
  depthGrad.addColorStop(0.22, "rgba(100, 195, 245, 0.14)");
  depthGrad.addColorStop(0.50, "rgba(30,  110, 185, 0.03)"); // near-neutral mid
  depthGrad.addColorStop(1,    "rgba(0,    18,  52, 0.34)"); // deep dark blue
  ctx.fillStyle = depthGrad;
  ctx.fillRect(0, 0, w, h);

  // ── Sun rays: animated wedges from a point above the canvas ─────────────
  // Origin drifts very slowly so rays feel alive without being distracting.
  const drift = Math.sin(now / 11000) * w * 0.025;
  const ox = w * 0.44 + drift;
  const oy = -h * 0.07;
  const rayLen = h * 1.8; // long enough to always reach the bottom

  // [center angle from vertical (radians), peak opacity]
  const rays: Array<[number, number]> = [
    [-0.42, 0.038],
    [-0.24, 0.058],
    [-0.09, 0.072],
    [ 0.07, 0.066],
    [ 0.22, 0.052],
    [ 0.38, 0.036],
    [ 0.54, 0.028],
  ];
  const halfAngle = 0.030;

  ctx.save();
  for (const [angle, peak] of rays) {
    const farX1 = ox + Math.sin(angle - halfAngle) * rayLen;
    const farY1 = oy + Math.cos(angle - halfAngle) * rayLen;
    const farX2 = ox + Math.sin(angle + halfAngle) * rayLen;
    const farY2 = oy + Math.cos(angle + halfAngle) * rayLen;

    // Gradient runs from origin toward the far midpoint of the ray.
    // Warm pale yellow near the surface, cooler blue-white lower.
    const midX = ox + Math.sin(angle) * rayLen * 0.55;
    const midY = oy + Math.cos(angle) * rayLen * 0.55;
    const g = ctx.createLinearGradient(ox, oy, midX, midY);
    g.addColorStop(0,    `rgba(255, 244, 195, ${peak})`);       // pale gold at surface
    g.addColorStop(0.30, `rgba(230, 245, 255, ${peak * 0.65})`); // cool blue-white
    g.addColorStop(0.70, `rgba(200, 230, 255, ${peak * 0.25})`); // faint
    g.addColorStop(1,    "rgba(180, 220, 255, 0)");              // gone

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(farX1, farY1);
    ctx.lineTo(farX2, farY2);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.restore();
}

// ── Kelp terrain (Depth 6 — Busy Pacific) ────────────────────────────────

const KELP_COLORS = {
  stipe: [
    "#3a3d0e",  // [0] root — dark olive-brown
    "#4a5212",  // [1] lower
    "#566118",  // [2] mid-lower
    "#647222",  // [3] mid-upper
    "#768530",  // [4] tip — yellow-green (lightest)
  ],
  blade: [
    "#3a4a12",  // [0] root blades
    "#4d601a",  // [1] mid blades
    "#647830",  // [2] tip blades
  ],
  bladeEdge: [
    "#4a5c1a",  // [0] root midrib
    "#607828",  // [1] mid midrib
    "#7a9038",  // [2] tip midrib
  ],
  bladder:      "#462f1e",
  bladderSheen: "#543b28",
};

// Level 2 seaweed keeps the original green palette
const SEAWEED_COLORS = {
  stipe: [
    "#1a5a1a",  // root
    "#2e8a2e",  // mid
    "#3daa3d",  // tip
  ],
};

function drawKelpBlade(
  ctx: CanvasRenderingContext2D,
  attachX: number,
  attachY: number,
  isLeft: boolean,
  bladeColor: string,
  edgeColor: string,
  CELL: number,
  swayBias: number,
): void {
  const bw  = Math.round(CELL * 1.015);
  const bh  = Math.round(CELL * 0.665);
  const dir = isLeft ? -1 : 1;
  const tipX = Math.round(attachX + dir * (bw + swayBias));
  const tipY = Math.round(attachY - bh);
  const cpX  = Math.round(attachX + dir * bw * 0.55);
  const cpY  = Math.round(attachY - bh * 1.5);
  const ucpX = Math.round(attachX + dir * bw * 0.3);
  const ucpY = Math.round(attachY - bh * 0.4);

  ctx.save();
  ctx.globalAlpha = 0.80;
  ctx.fillStyle = bladeColor;
  ctx.beginPath();
  ctx.moveTo(attachX, attachY);
  ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
  ctx.quadraticCurveTo(ucpX, ucpY, attachX, attachY);
  ctx.closePath();
  ctx.fill();

  // Midrib line
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.50;
  ctx.beginPath();
  ctx.moveTo(Math.round(attachX + dir * 2), attachY);
  ctx.quadraticCurveTo(
    Math.round(cpX - dir * Math.round(CELL * 0.08)),
    Math.round(cpY + bh * 0.2),
    Math.round(tipX - dir * Math.round(CELL * 0.08)),
    tipY,
  );
  ctx.stroke();
  ctx.restore();
}

function drawSeagrass(ctx: CanvasRenderingContext2D, CELL: number): void {
  const now = Date.now();
  const cfg = LEVEL_CONFIG[gs.currentDepth].seagrass!;
  const swayPeriod = cfg.swayPeriod;
  const maxH       = cfg.maxHeight;

  for (const kc of gs.seagrassCells) {
    const px = kc.x * CELL;
    const py = kc.y * CELL;
    const tipFrac   = kc.height / maxH;
    const phase     = (now / swayPeriod) * Math.PI * 2 + kc.x * 0.8;
    const stipeSway = Math.sin(phase) * tipFrac * CELL * 0.28;

    const idx = Math.min(2, Math.floor(tipFrac * 3));
    const sw  = Math.max(2, Math.round(CELL * cfg.stipeWidthFraction));
    const sx  = Math.round(px + CELL / 2 + stipeSway - sw / 2);

    ctx.globalAlpha = 0.90;
    ctx.fillStyle   = SEAWEED_COLORS.stipe[idx];
    ctx.fillRect(sx, Math.round(py), sw, CELL);
    ctx.globalAlpha = 1;
  }
}

function drawKelp(ctx: CanvasRenderingContext2D, CELL: number): void {
  const now = Date.now();
  const cfg = LEVEL_CONFIG[gs.currentDepth].kelp!;
  const swayPeriod  = cfg.swayPeriod;
  const maxH        = cfg.maxHeight;
  const bladeEnabled = cfg.bladeEnabled;

  for (const kc of gs.kelpCells) {
    const px = kc.x * CELL;
    const py = kc.y * CELL;
    const tipFrac   = kc.height / maxH;
    const phase     = (now / swayPeriod) * Math.PI * 2 + kc.x * 0.8;
    const stipeSway = Math.sin(phase) * tipFrac * CELL * 0.28;
    const bladeSway = Math.sin(phase + 0.25) * tipFrac * CELL * 0.38;

    const idx = Math.min(4, Math.floor(tipFrac * 5));
    const sw  = Math.max(2, Math.round(CELL * 0.10));
    const sx  = Math.round(px + CELL / 2 + stipeSway - sw / 2);

    ctx.globalAlpha = 0.90;
    ctx.fillStyle   = KELP_COLORS.stipe[idx];
    ctx.fillRect(sx, Math.round(py), sw, CELL);

    // Selout: 1px lighter left edge
    const lighterIdx = Math.min(4, idx + 1);
    ctx.fillStyle = KELP_COLORS.stipe[lighterIdx];
    ctx.globalAlpha = 0.40;
    ctx.fillRect(sx, Math.round(py), 1, CELL);
    ctx.globalAlpha = 1;

    // Blades — every even height step
    if (bladeEnabled && kc.height % 2 === 0 && kc.height > 1) {
      const bladeIdx = tipFrac < 0.33 ? 0 : tipFrac < 0.66 ? 1 : 2;
      const isLeft   = (kc.height / 2) % 2 === 0;
      const attachX  = Math.round(px + CELL / 2 + stipeSway);
      const attachY  = Math.round(py + CELL * 0.5);
      drawKelpBlade(
        ctx, attachX, attachY, isLeft,
        KELP_COLORS.blade[bladeIdx],
        KELP_COLORS.bladeEdge[bladeIdx],
        CELL, bladeSway,
      );
    }
  }

  // Bladders (Depth 6 only)
  if (cfg.bladderEnabled) {
    for (const b of gs.kelpBladders) {
      if (!gs.kelpBladdersSet.has(`${b.x},${b.y}`)) continue; // already collected
      // Find sway at this cell
      const kc = gs.kelpCells.find(k => k.x === b.x && k.y === b.y);
      if (!kc) continue;
      const tipFrac   = kc.height / maxH;
      const phase     = (Date.now() / swayPeriod) * Math.PI * 2 + b.x * 0.8;
      const stipeSway = Math.sin(phase) * tipFrac * CELL * 0.28;

      const cx = Math.round(b.x * CELL + CELL / 2 + stipeSway + Math.round(CELL * 0.12));
      const cy = Math.round(b.y * CELL + CELL * 0.5);
      const rx = Math.max(3, Math.round(CELL * 0.21));
      const ry = Math.max(2, Math.round(CELL * 0.165));

      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = KELP_COLORS.bladder;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // 1px highlight
      ctx.fillStyle = KELP_COLORS.bladderSheen;
      ctx.fillRect(cx - Math.round(rx * 0.4), cy - Math.round(ry * 0.5), 1, 1);
      ctx.restore();
    }
  }
}

// Neutral fish sprites are in sprites.ts — drawNeutralFish() imported above.

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
    ctx.fillStyle = LEVEL_CONFIG[gs.currentDepth].canvasBase;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const hasContam = gs.toxicContamination.length > 0;
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) {
        let color = gs.colors[r][c];
        if (hasContam) {
          const cv = gs.toxicContamination[r][c];
          if (cv > 0.01) {
            const shimmer = 0.04 * Math.sin(now / 800 + r * 0.7 + c * 1.1);
            const t = Math.max(0, Math.min(1, cv * 0.55 + shimmer));
            color = blendHex(color, 80, 140, 20, t);
          }
        }
        ctx.fillStyle = color;
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    // Depth 6 — sunlight filtering effect drawn over tiles, under entities
    if (gs.currentDepth === PACIFIC_DEPTH) {
      drawPacificLighting(ctx, canvas.width, canvas.height, now);
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
      drawCoralBarrier(ctx, c * CELL, r * CELL, CELL, (r * 7 + c * 11) % CORAL_BARRIER_VARIANTS);
    }

  // Ice patches (Arctic depth)
  if (LEVEL_CONFIG[gs.currentDepth]?.icePatches) {
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
  // Build set of still-animating (rising) coins to skip in the base draw loop
  const risingSet = new Set(gs.risingPickups.map(rp => `${rp.x},${rp.y}`));
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (!gs.pickups[r][c]) continue;
      if (risingSet.has(`${c},${r}`)) continue; // handled by rising animation block below
      const px = c * CELL + pad, py = r * CELL + pad, ps = CELL - pad * 2;
      ctx.fillStyle = "#7a5500"; ctx.fillRect(px - 1, py - 1, ps + 2, ps + 2);
      ctx.fillStyle = "#ffd166"; ctx.fillRect(px, py, ps, ps);
    }

  // Dissolving yellows
  {
    const nowDying = performance.now();
    for (const dp of gs.dyingPickups) {
      const elapsed = nowDying - dp.startTime;
      if (elapsed < 0 || elapsed >= DYING_DURATION) continue;
      const t = elapsed / DYING_DURATION;
      const ease = 1 - t * t; // ease out
      const px = dp.x * CELL;
      const py = dp.y * CELL;
      const shrink = Math.round(CELL * 0.1 * (1 - t));
      ctx.globalAlpha = ease * 0.9;
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(px + shrink, py + shrink, CELL - shrink * 2, CELL - shrink * 2);
      ctx.globalAlpha = 1;
    }
  }

  // Rising yellows (pop-in)
  {
    const nowRising = performance.now();
    for (const rp of gs.risingPickups) {
      const elapsed = nowRising - rp.startTime;
      if (elapsed < 0) continue; // not yet
      if (elapsed >= RISING_DURATION) continue; // base loop handles it now
      const t = Math.min(1, elapsed / RISING_DURATION);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out
      const px = rp.x * CELL;
      const py = rp.y * CELL;
      const half = CELL / 2;
      const size = CELL * ease;
      ctx.globalAlpha = ease * 0.9;
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(
        Math.round(px + half - size / 2),
        Math.round(py + half - size / 2),
        Math.round(size),
        Math.round(size),
      );
      ctx.globalAlpha = 1;
    }
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
  if (gs.frozenFish.length > 0) {
    const fp = CELL * 0.06;
    for (const fish of gs.frozenFish) {
      drawFrozenFish(ctx, fish.x * CELL + fp, fish.y * CELL + fp, CELL - fp * 2);
    }
  }

  // Coral shell pickups (Reef depth)
  if (LEVEL_CONFIG[gs.currentDepth]?.coral)
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) {
        if (!gs.coralPickups[r][c]) continue;
        const cpx = c * CELL + pad, cpy = r * CELL + pad, cps = CELL - pad * 2;
        drawCoralShell(ctx, cpx, cpy, cps);
      }

  // Toxic barrels (Toxic depth)
  if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel && gs.toxicBarrels.length > 0) {
    const bp = CELL * 0.06;
    for (const barrel of gs.toxicBarrels) {
      drawToxicBarrel(ctx, barrel.x * CELL + bp, barrel.y * CELL + bp, CELL - bp * 2);
    }
  }

  // Shrimp (Electric depth)
  if (LEVEL_CONFIG[gs.currentDepth]?.shrimp && gs.shrimp.length > 0) {
    for (const s of gs.shrimp) {
      const pp = CELL * 0.08;
      const cx = s.x * CELL + CELL / 2;
      const cy = s.y * CELL + CELL / 2;
      ctx.save();
      ctx.translate(cx, cy);
      if (s.spawnTime !== undefined) {
        const elapsed = Date.now() - s.spawnTime;
        if (elapsed < 2000) {
          const growT = Math.min(1, elapsed / 500);
          const c1 = 1.70158, c3 = c1 + 1;
          const spawnScale = growT < 1
            ? 1 + c3 * Math.pow(growT - 1, 3) + c1 * Math.pow(growT - 1, 2)
            : 1;
          ctx.scale(spawnScale, spawnScale);
          const fade = Math.pow(1 - elapsed / 2000, 1.5);
          const pulse = 0.5 + 0.5 * Math.sin((elapsed / 120) * Math.PI);
          const pad = Math.round(CELL * 0.2);
          ctx.save();
          ctx.globalAlpha = fade * (0.35 + 0.55 * pulse);
          ctx.fillStyle = "#ff8040";
          ctx.fillRect(-CELL / 2 - pad, -CELL / 2 - pad, CELL + pad * 2, CELL + pad * 2);
          ctx.globalAlpha = fade;
          ctx.strokeStyle = "#ffcc80";
          ctx.lineWidth = 2;
          ctx.strokeRect(-CELL / 2 - pad, -CELL / 2 - pad, CELL + pad * 2, CELL + pad * 2);
          ctx.restore();
        }
      }
      drawShrimp(ctx, -CELL / 2 + pp, -CELL / 2 + pp, CELL - pp * 2);
      ctx.restore();
    }
  }

  // Algae ball trails (Depth 6 — Busy Pacific) — drawn before balls so balls render on top
  if (LEVEL_CONFIG[gs.currentDepth]?.algaeBall && gs.algaeBalls.length > 0) {
    const trailAlphas = [0.46, 0.31, 0.21, 0.14, 0.10];
    for (const ball of gs.algaeBalls) {
      for (let i = 0; i < ball.trail.length; i++) {
        const cell = ball.trail[i];
        ctx.save();
        ctx.globalAlpha = trailAlphas[i] ?? 0.08;
        ctx.fillStyle = "rgba(80, 160, 120, 1)";
        ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL, CELL);
        ctx.restore();
      }
    }
  }

  // Algae balls (Depth 6 — Busy Pacific)
  if (LEVEL_CONFIG[gs.currentDepth]?.algaeBall && gs.algaeBalls.length > 0) {
    for (const ball of gs.algaeBalls) {
      drawAlgaeBall(ctx, ball, CELL);
    }
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
    const ex = e.visualX * CELL, ey = e.visualY * CELL;
    ctx.fillStyle = "#0a1824"; ctx.fillRect(ex - 1, ey - 1, CELL + 2, CELL + 2);
    ctx.fillStyle = "#162d40"; ctx.fillRect(ex, ey, CELL, CELL);
  }

  // Big enemies (2×2)
  for (const be of gs.bigEnemies) {
    const bx = be.visualX * CELL, by = be.visualY * CELL, bw = CELL * 2;
    ctx.fillStyle = "#120a1e"; ctx.fillRect(bx - 1, by - 1, bw + 2, bw + 2);
    ctx.fillStyle = "#2d1a4a"; ctx.fillRect(bx, by, bw, bw);
  }

  // Electric eels (Depth 7 — Electric) — drawn before neutral fish and player
  if (gs.currentDepth === ELECTRIC_DEPTH && gs.electricEels.length > 0) {
    for (const eel of gs.electricEels) {
      drawElectricEel(ctx, eel, CELL);
    }
  }

  // Neutral fish (Depth 6 — Busy Pacific)
  if (gs.currentDepth === PACIFIC_DEPTH && gs.neutralFish.length > 0) {
    for (const fish of gs.neutralFish) {
      drawNeutralFish(ctx, fish, CELL);
    }
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

  // Player shark — with electric shock visual when stunned
  {
    const renderX = gs.sharkVisualX + gs.shockVibrateX;
    const renderY = gs.sharkVisualY + gs.shockVibrateY;
    if (gs.sharkShocked) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 55 * Math.PI * 2);
      ctx.save();
      ctx.shadowColor = "#ffee44";
      ctx.shadowBlur  = 8 + pulse * 14;
      drawSharkOnCtx(ctx, renderX, renderY, CELL, gs.sharkDir);
      ctx.restore();
      // Yellow tint overlay
      ctx.save();
      ctx.globalAlpha = 0.28 + pulse * 0.18;
      ctx.fillStyle = "#ffee44";
      ctx.fillRect(
        Math.round(renderX * CELL), Math.round(renderY * CELL), CELL, CELL,
      );
      ctx.globalAlpha = 1;
      ctx.restore();
    } else {
      drawSharkOnCtx(ctx, renderX, renderY, CELL, gs.sharkDir);
    }
  }

  // Kelp/seagrass drawn AFTER player so it occludes the shark when standing inside
  if (LEVEL_CONFIG[gs.currentDepth].seagrass && gs.seagrassCells.length > 0) {
    drawSeagrass(ctx, CELL);
  }
  if (LEVEL_CONFIG[gs.currentDepth].kelp && gs.kelpCells.length > 0) {
    drawKelp(ctx, CELL);
  }

  // Toxic clouds (Toxic depth) — drawn last so they naturally cover everything underneath
  if (LEVEL_CONFIG[gs.currentDepth]?.toxicBarrel && gs.toxicClouds.length > 0) {
    for (const cell of gs.toxicClouds) {
      drawToxicCloud(ctx, cell.x, cell.y, CELL, gs.cloudPulse[cell.y * GRID + cell.x]);
    }
  }
}
