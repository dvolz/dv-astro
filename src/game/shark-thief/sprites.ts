// Depth 6 neutral fish + algae ball draw calls.

import type { NeutralFish, AlgaeBall } from "./state";
import { drawMackerelV1, drawGaribaldiV2, drawOarfishV1 } from "./sprites-v2";

export function drawNeutralFish(
  ctx:   CanvasRenderingContext2D,
  fish:  NeutralFish,
  CELL:  number,
): void {
  // Natural dimensions for the rotated sprite draw
  const drawW = fish.sizeX * CELL;
  const drawH = fish.sizeY * CELL;

  // Effective dimensions for center-point placement (swapped when vertical)
  const destW = fish.effSizeX * CELL;
  const destH = fish.effSizeY * CELL;

  const px = fish.visualX * CELL;
  const py = fish.visualY * CELL;
  const cx = px + destW / 2;
  const cy = py + destH / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, cy);

  // Bladder-spawn grow effect: fish scales from 0 → full over 500ms, glow fades over 2s
  if (fish.spawnTime !== undefined) {
    const elapsed = Date.now() - fish.spawnTime;
    if (elapsed < 2000) {
      const growT = Math.min(1, elapsed / 500);
      const c1 = 1.70158, c3 = c1 + 1;
      const spawnScale = growT < 1
        ? 1 + c3 * Math.pow(growT - 1, 3) + c1 * Math.pow(growT - 1, 2)
        : 1;
      ctx.scale(spawnScale, spawnScale);

      const fade  = Math.pow(1 - elapsed / 2000, 1.5);
      const pulse = 0.5 + 0.5 * Math.sin((elapsed / 120) * Math.PI);
      const pad   = Math.round(CELL * 0.2);
      ctx.save();
      ctx.globalAlpha = fade * (0.35 + 0.55 * pulse);
      ctx.fillStyle = "#ffd060";
      ctx.fillRect(-destW / 2 - pad, -destH / 2 - pad, destW + pad * 2, destH + pad * 2);
      ctx.globalAlpha = fade;
      ctx.strokeStyle = "#fff4aa";
      ctx.lineWidth = 2;
      ctx.strokeRect(-destW / 2 - pad, -destH / 2 - pad, destW + pad * 2, destH + pad * 2);
      ctx.restore();
    }
  }

  switch (fish.dir) {
    case 'right': break;
    case 'left':  ctx.scale(-1, 1);        break;
    case 'up':    ctx.rotate(-Math.PI / 2); break;
    case 'down':  ctx.rotate( Math.PI / 2); break;
  }

  switch (fish.type) {
    case 'mackerel':  drawMackerelV1 (ctx, -drawW / 2, -drawH / 2, drawW, drawH); break;
    case 'garibaldi': drawGaribaldiV2(ctx, -drawW / 2, -drawH / 2, drawW, drawH); break;
    case 'oarfish':   drawOarfishV1  (ctx, -drawW / 2, -drawH / 2, drawW, drawH); break;
  }
  ctx.restore();
}

// ── Algae ball — drifting green organic pickup (Depth 6 — Busy Pacific) ──────

export function drawAlgaeBall(
  ctx:  CanvasRenderingContext2D,
  ball: AlgaeBall,
  CELL: number,
): void {
  const now = Date.now();
  const cx = ball.x * CELL + CELL / 2;
  const cy = ball.y * CELL + CELL / 2;
  const r  = CELL * 0.36;

  ctx.save();

  const bob = Math.sin(now / 900 + ball.x * 1.3 + ball.y * 0.7) * CELL * 0.05;
  ctx.translate(cx, cy + bob);

  ctx.fillStyle = "#546452";
  ctx.beginPath();
  ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a7a18";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3ea024";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a7a18";
  const lobeR = r * 0.28;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + now / 3000;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * r * 0.72, Math.sin(angle) * r * 0.72, lobeR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#66cc40";
  ctx.beginPath();
  ctx.arc(-r * 0.18, -r * 0.20, r * 0.38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#aaee80";
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.25, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.30, Math.max(1, r * 0.065), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
