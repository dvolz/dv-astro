// Scale-in + golden glow spawn animation (fish-style).
// Call AFTER ctx.translate(cx, cy). Applies ctx.scale to current transform —
// caller controls whether that scale affects the entity (fish-style: yes, just draw after;
// eel-style: wrap call in save/restore so entity draw is unaffected).
export function applySpawnAnim(
  ctx:       CanvasRenderingContext2D,
  spawnTime: number,
  w:         number,
  h:         number,
  cellSize:  number,
): void {
  const elapsed = Date.now() - spawnTime;
  if (elapsed >= 2000) return;

  const growT = Math.min(1, elapsed / 500);
  const c1 = 1.70158, c3 = c1 + 1;
  const scale = growT < 1
    ? 1 + c3 * Math.pow(growT - 1, 3) + c1 * Math.pow(growT - 1, 2)
    : 1;
  ctx.scale(scale, scale);

  const fade  = Math.pow(1 - elapsed / 2000, 1.5);
  const pulse = 0.5 + 0.5 * Math.sin((elapsed / 120) * Math.PI);
  const pad   = Math.round(cellSize * 0.2);

  ctx.save();
  ctx.globalAlpha = fade * (0.35 + 0.55 * pulse);
  ctx.fillStyle = "#ffd060";
  ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2);
  ctx.globalAlpha = fade;
  ctx.strokeStyle = "#fff4aa";
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2);
  ctx.restore();
}
