// Procedural fish sprites — Depth 6 neutral fish (sprites-v2)
// Style matches drawSharkOnCtx in renderers.ts:
//   - fillRect, arc, moveTo/lineTo/closePath only — no gradients
//   - Outline pass first (dark, slightly oversized), body fill on top, then details
//   - All coords use fractional helpers relative to bounding box
//   - Fish face RIGHT; caller handles flipping/rotation
// Signature: drawXxxVn(ctx, x, y, w, h) where x,y = top-left, w,h = bounding box pixels

// ── Helpers ───────────────────────────────────────────────────────────────────

function R(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  bx: number, by: number, bw: number, bh: number,
): void {
  ctx.fillRect(
    Math.round(bx + x * bw),
    Math.round(by + y * bh),
    Math.max(1, Math.round(w * bw)),
    Math.max(1, Math.round(h * bh)),
  );
}

function pt(x: number, y: number, bx: number, by: number, bw: number, bh: number): [number, number] {
  return [Math.round(bx + x * bw), Math.round(by + y * bh)];
}

function tri(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  bx: number, by: number, bw: number, bh: number,
): void {
  ctx.beginPath();
  const [ax, ay] = pt(x1, y1, bx, by, bw, bh);
  const [cx2, cy2] = pt(x2, y2, bx, by, bw, bh);
  const [dx, dy] = pt(x3, y3, bx, by, bw, bh);
  ctx.moveTo(ax, ay);
  ctx.lineTo(cx2, cy2);
  ctx.lineTo(dx, dy);
  ctx.closePath();
  ctx.fill();
}

// ── Mackerel palettes ─────────────────────────────────────────────────────────
const M_OUTLINE    = "#0d1a24";
const M_DARK_BACK  = "#1a3040";
const M_MID_BLUE   = "#4888a8";
const M_LIGHT_FLNK = "#a8c8d8";
const M_BELLY      = "#e8f4f8";
const M_EYE_P      = "#08181f";
const M_EYE_S      = "#d8eef4";

// ── Mackerel V1 — classic torpedo ────────────────────────────────────────────
// 2×1 hitbox (w = 2*CELL, h = 1*CELL). Slim tapered body, small forked tail,
// single dorsal fin mid-back, tight zigzag on upper third.

export function drawMackerelV1(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline pass — tapered body + forked tail outline
  ctx.fillStyle = M_OUTLINE;
  R(ctx, 0.06, 0.28, 0.84, 0.44, bx, by, bw, bh);
  // Tail top prong
  tri(ctx, 0.0, 0.14, 0.08, 0.14, 0.06, 0.28, bx, by, bw, bh);
  // Tail bottom prong
  tri(ctx, 0.0, 0.86, 0.08, 0.86, 0.06, 0.72, bx, by, bw, bh);
  // Snout taper
  R(ctx, 0.88, 0.34, 0.06, 0.32, bx, by, bw, bh);
  R(ctx, 0.94, 0.38, 0.04, 0.24, bx, by, bw, bh);

  // Dorsal fin outline
  ctx.fillStyle = M_OUTLINE;
  tri(ctx, 0.38, 0.28, 0.50, 0.04, 0.62, 0.28, bx, by, bw, bh);

  // Body fill
  ctx.fillStyle = M_MID_BLUE;
  R(ctx, 0.08, 0.30, 0.80, 0.40, bx, by, bw, bh);
  // Tail fill
  tri(ctx, 0.01, 0.16, 0.07, 0.16, 0.06, 0.30, bx, by, bw, bh);
  tri(ctx, 0.01, 0.84, 0.07, 0.84, 0.06, 0.70, bx, by, bw, bh);

  // Dorsal fin fill
  ctx.fillStyle = M_DARK_BACK;
  tri(ctx, 0.40, 0.30, 0.50, 0.07, 0.60, 0.30, bx, by, bw, bh);

  // Dark back stripe — upper third
  ctx.fillStyle = M_DARK_BACK;
  R(ctx, 0.08, 0.30, 0.80, 0.12, bx, by, bw, bh);

  // Zigzag marks on upper back: alternating dark rects
  ctx.fillStyle = M_OUTLINE;
  for (let i = 0; i < 7; i++) {
    const zx = 0.12 + i * 0.10;
    const zy = (i % 2 === 0) ? 0.30 : 0.32;
    R(ctx, zx, zy, 0.05, 0.08, bx, by, bw, bh);
  }

  // Light flank
  ctx.fillStyle = M_LIGHT_FLNK;
  R(ctx, 0.08, 0.42, 0.76, 0.14, bx, by, bw, bh);

  // Belly
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.10, 0.54, 0.70, 0.14, bx, by, bw, bh);

  // Eye — near head
  ctx.fillStyle = M_EYE_S;
  R(ctx, 0.78, 0.34, 0.09, 0.14, bx, by, bw, bh);
  ctx.fillStyle = M_EYE_P;
  R(ctx, 0.80, 0.36, 0.06, 0.10, bx, by, bw, bh);
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.80, 0.36, 0.02, 0.03, bx, by, bw, bh);

  ctx.restore();
}

// ── Mackerel V2 — chunkier ───────────────────────────────────────────────────
// Wider body, bigger fanned tail, broader zigzag marks, visible belly stripe.

export function drawMackerelV2(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline — wider body
  ctx.fillStyle = M_OUTLINE;
  R(ctx, 0.06, 0.22, 0.84, 0.56, bx, by, bw, bh);
  // Big fanned tail prongs
  tri(ctx, 0.0, 0.08, 0.10, 0.10, 0.06, 0.28, bx, by, bw, bh);
  tri(ctx, 0.0, 0.92, 0.10, 0.90, 0.06, 0.72, bx, by, bw, bh);
  // Snout
  R(ctx, 0.89, 0.30, 0.05, 0.40, bx, by, bw, bh);
  R(ctx, 0.93, 0.34, 0.04, 0.32, bx, by, bw, bh);

  // Dorsal fin outline
  tri(ctx, 0.34, 0.22, 0.48, 0.01, 0.62, 0.22, bx, by, bw, bh);

  // Body fill
  ctx.fillStyle = M_MID_BLUE;
  R(ctx, 0.08, 0.24, 0.80, 0.52, bx, by, bw, bh);
  // Tail fill
  ctx.fillStyle = M_DARK_BACK;
  tri(ctx, 0.01, 0.10, 0.09, 0.10, 0.06, 0.28, bx, by, bw, bh);
  tri(ctx, 0.01, 0.90, 0.09, 0.90, 0.06, 0.72, bx, by, bw, bh);

  // Dorsal fin fill
  ctx.fillStyle = M_DARK_BACK;
  tri(ctx, 0.36, 0.24, 0.48, 0.04, 0.60, 0.24, bx, by, bw, bh);

  // Dark back band — broader
  ctx.fillStyle = M_DARK_BACK;
  R(ctx, 0.08, 0.24, 0.80, 0.16, bx, by, bw, bh);

  // Broader zigzag marks
  ctx.fillStyle = M_OUTLINE;
  for (let i = 0; i < 6; i++) {
    const zx = 0.10 + i * 0.12;
    const zy = (i % 2 === 0) ? 0.24 : 0.27;
    R(ctx, zx, zy, 0.07, 0.12, bx, by, bw, bh);
  }

  // Mid flank
  ctx.fillStyle = M_LIGHT_FLNK;
  R(ctx, 0.08, 0.40, 0.78, 0.16, bx, by, bw, bh);

  // Belly stripe — more visible
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.10, 0.56, 0.68, 0.18, bx, by, bw, bh);

  // Eye — slightly larger
  ctx.fillStyle = M_EYE_S;
  R(ctx, 0.76, 0.30, 0.10, 0.16, bx, by, bw, bh);
  ctx.fillStyle = M_EYE_P;
  R(ctx, 0.78, 0.32, 0.07, 0.11, bx, by, bw, bh);
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.78, 0.33, 0.02, 0.03, bx, by, bw, bh);

  ctx.restore();
}

// ── Mackerel V3 — stylized ───────────────────────────────────────────────────
// Exaggerated pointed snout, sweeping sickle tail, bold full-back stripe.

export function drawMackerelV3(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline — torpedo with pointed snout
  ctx.fillStyle = M_OUTLINE;
  R(ctx, 0.06, 0.30, 0.86, 0.40, bx, by, bw, bh);
  // Sickle tail — upper blade
  tri(ctx, 0.0, 0.06, 0.10, 0.28, 0.06, 0.30, bx, by, bw, bh);
  // Sickle tail — lower blade
  tri(ctx, 0.0, 0.94, 0.10, 0.72, 0.06, 0.70, bx, by, bw, bh);
  // Long pointed snout
  tri(ctx, 0.86, 0.30, 0.86, 0.70, 1.0, 0.50, bx, by, bw, bh);

  // Swept dorsal outline
  tri(ctx, 0.28, 0.30, 0.44, 0.02, 0.65, 0.30, bx, by, bw, bh);

  // Body fill
  ctx.fillStyle = M_MID_BLUE;
  R(ctx, 0.08, 0.32, 0.76, 0.36, bx, by, bw, bh);
  // Snout fill
  ctx.fillStyle = M_MID_BLUE;
  tri(ctx, 0.87, 0.32, 0.87, 0.68, 0.98, 0.50, bx, by, bw, bh);

  // Tail fill
  ctx.fillStyle = M_DARK_BACK;
  tri(ctx, 0.01, 0.08, 0.09, 0.28, 0.06, 0.32, bx, by, bw, bh);
  tri(ctx, 0.01, 0.92, 0.09, 0.72, 0.06, 0.68, bx, by, bw, bh);

  // Swept dorsal fill
  ctx.fillStyle = M_DARK_BACK;
  tri(ctx, 0.30, 0.32, 0.45, 0.05, 0.63, 0.32, bx, by, bw, bh);

  // Bold full-back stripe
  ctx.fillStyle = M_DARK_BACK;
  R(ctx, 0.08, 0.32, 0.76, 0.13, bx, by, bw, bh);

  // Light flank
  ctx.fillStyle = M_LIGHT_FLNK;
  R(ctx, 0.10, 0.45, 0.70, 0.11, bx, by, bw, bh);

  // Belly
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.12, 0.55, 0.58, 0.13, bx, by, bw, bh);

  // Eye
  ctx.fillStyle = M_EYE_S;
  R(ctx, 0.74, 0.34, 0.09, 0.14, bx, by, bw, bh);
  ctx.fillStyle = M_EYE_P;
  R(ctx, 0.76, 0.36, 0.06, 0.10, bx, by, bw, bh);
  ctx.fillStyle = M_BELLY;
  R(ctx, 0.76, 0.36, 0.02, 0.03, bx, by, bw, bh);

  ctx.restore();
}

// ── Garibaldi palettes ────────────────────────────────────────────────────────
const G_OUTLINE    = "#1a0800";
const G_DEEP_SHDW  = "#7a1800";
const G_ORANGE     = "#e05010";
const G_BRIGHT_ORG = "#ff7020";
const G_HIGHLIGHT  = "#ffb060";
const G_EYE_S      = "#c8d8e0";
const G_EYE_P      = "#0c1820";

// ── Garibaldi V1 — round and friendly ────────────────────────────────────────
// 1×1 hitbox. Nearly circular body, big rounded top fin, fan tail.

export function drawGaribaldiV1(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;
  const cx = bx + bw * 0.54;
  const cy = by + bh * 0.50;

  // Outline — slightly oversized circle
  ctx.fillStyle = G_OUTLINE;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.round(bw * 0.44), 0, Math.PI * 2);
  ctx.fill();

  // Tail fan outline (left side)
  ctx.fillStyle = G_OUTLINE;
  tri(ctx, 0.0, 0.30, 0.14, 0.20, 0.12, 0.50, bx, by, bw, bh);
  tri(ctx, 0.0, 0.70, 0.14, 0.80, 0.12, 0.50, bx, by, bw, bh);

  // Dorsal fin outline
  tri(ctx, 0.28, 0.08, 0.54, 0.0, 0.80, 0.08, bx, by, bw, bh);

  // Body fill — orange base
  ctx.fillStyle = G_ORANGE;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.round(bw * 0.40), 0, Math.PI * 2);
  ctx.fill();

  // Tail fill
  ctx.fillStyle = G_ORANGE;
  tri(ctx, 0.01, 0.32, 0.12, 0.22, 0.12, 0.50, bx, by, bw, bh);
  tri(ctx, 0.01, 0.68, 0.12, 0.78, 0.12, 0.50, bx, by, bw, bh);

  // Dorsal fin fill
  ctx.fillStyle = G_DEEP_SHDW;
  tri(ctx, 0.30, 0.10, 0.54, 0.02, 0.78, 0.10, bx, by, bw, bh);

  // Bright orange upper body
  ctx.fillStyle = G_BRIGHT_ORG;
  ctx.beginPath();
  ctx.arc(cx, cy - bh * 0.05, Math.round(bw * 0.30), 0, Math.PI * 2);
  ctx.fill();

  // Highlight centre
  ctx.fillStyle = G_HIGHLIGHT;
  ctx.beginPath();
  ctx.arc(cx - bw * 0.06, cy - bh * 0.08, Math.round(bw * 0.16), 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = G_EYE_S;
  R(ctx, 0.72, 0.34, 0.11, 0.14, bx, by, bw, bh);
  ctx.fillStyle = G_EYE_P;
  R(ctx, 0.74, 0.36, 0.08, 0.10, bx, by, bw, bh);

  // Small pectoral fin
  ctx.fillStyle = G_DEEP_SHDW;
  R(ctx, 0.44, 0.62, 0.16, 0.08, bx, by, bw, bh);

  ctx.restore();
}

// ── Garibaldi V2 — wider and flatter ─────────────────────────────────────────
// Oval body wider than tall, prominent pectoral fin, bold highlight stripe.

export function drawGaribaldiV2(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline — wide oval
  ctx.fillStyle = G_OUTLINE;
  R(ctx, 0.06, 0.18, 0.84, 0.64, bx, by, bw, bh);
  // Round the corners with filled triangles (subtract effect via body pass)
  tri(ctx, 0.06, 0.18, 0.06, 0.28, 0.14, 0.18, bx, by, bw, bh);
  tri(ctx, 0.06, 0.82, 0.06, 0.72, 0.14, 0.82, bx, by, bw, bh);
  tri(ctx, 0.86, 0.18, 0.86, 0.28, 0.78, 0.18, bx, by, bw, bh);
  tri(ctx, 0.86, 0.82, 0.86, 0.72, 0.78, 0.82, bx, by, bw, bh);

  // Tail fan
  ctx.fillStyle = G_OUTLINE;
  tri(ctx, 0.0, 0.26, 0.10, 0.26, 0.08, 0.50, bx, by, bw, bh);
  tri(ctx, 0.0, 0.74, 0.10, 0.74, 0.08, 0.50, bx, by, bw, bh);

  // Small dorsal bump
  tri(ctx, 0.34, 0.18, 0.54, 0.04, 0.72, 0.18, bx, by, bw, bh);

  // Body fill
  ctx.fillStyle = G_ORANGE;
  R(ctx, 0.08, 0.20, 0.80, 0.60, bx, by, bw, bh);
  // Tail fill
  ctx.fillStyle = G_ORANGE;
  tri(ctx, 0.01, 0.28, 0.09, 0.28, 0.08, 0.50, bx, by, bw, bh);
  tri(ctx, 0.01, 0.72, 0.09, 0.72, 0.08, 0.50, bx, by, bw, bh);

  // Dorsal fill
  ctx.fillStyle = G_DEEP_SHDW;
  tri(ctx, 0.36, 0.20, 0.54, 0.06, 0.70, 0.20, bx, by, bw, bh);

  // Bright upper body
  ctx.fillStyle = G_BRIGHT_ORG;
  R(ctx, 0.10, 0.22, 0.76, 0.22, bx, by, bw, bh);

  // Bold highlight stripe across middle
  ctx.fillStyle = G_HIGHLIGHT;
  R(ctx, 0.12, 0.40, 0.60, 0.10, bx, by, bw, bh);

  // Prominent pectoral fin
  ctx.fillStyle = G_DEEP_SHDW;
  tri(ctx, 0.40, 0.58, 0.62, 0.58, 0.50, 0.76, bx, by, bw, bh);

  // Eye
  ctx.fillStyle = G_EYE_S;
  R(ctx, 0.70, 0.28, 0.12, 0.16, bx, by, bw, bh);
  ctx.fillStyle = G_EYE_P;
  R(ctx, 0.72, 0.30, 0.08, 0.11, bx, by, bw, bh);

  ctx.restore();
}

// ── Garibaldi V3 — tall and dramatic ─────────────────────────────────────────
// Body taller than wide, very tall dorsal fin, deep red shadow lower half.

export function drawGaribaldiV3(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline — tall oval
  ctx.fillStyle = G_OUTLINE;
  R(ctx, 0.14, 0.08, 0.70, 0.84, bx, by, bw, bh);
  // Tail fan
  tri(ctx, 0.0, 0.30, 0.16, 0.30, 0.14, 0.50, bx, by, bw, bh);
  tri(ctx, 0.0, 0.70, 0.16, 0.70, 0.14, 0.50, bx, by, bw, bh);

  // Very tall dorsal fin — extends above bounding box visually (clipped)
  ctx.fillStyle = G_OUTLINE;
  tri(ctx, 0.26, 0.08, 0.50, -0.12, 0.74, 0.08, bx, by, bw, bh);

  // Body fill — orange upper
  ctx.fillStyle = G_BRIGHT_ORG;
  R(ctx, 0.16, 0.10, 0.66, 0.40, bx, by, bw, bh);

  // Deep red shadow lower half
  ctx.fillStyle = G_DEEP_SHDW;
  R(ctx, 0.16, 0.50, 0.66, 0.40, bx, by, bw, bh);

  // Tail fill
  ctx.fillStyle = G_ORANGE;
  tri(ctx, 0.01, 0.32, 0.14, 0.32, 0.14, 0.50, bx, by, bw, bh);
  tri(ctx, 0.01, 0.68, 0.14, 0.68, 0.14, 0.50, bx, by, bw, bh);

  // Tall dorsal fill
  ctx.fillStyle = G_DEEP_SHDW;
  tri(ctx, 0.28, 0.10, 0.50, -0.08, 0.72, 0.10, bx, by, bw, bh);

  // Highlight on upper body
  ctx.fillStyle = G_HIGHLIGHT;
  R(ctx, 0.20, 0.12, 0.44, 0.12, bx, by, bw, bh);

  // Mid orange transition band
  ctx.fillStyle = G_ORANGE;
  R(ctx, 0.16, 0.44, 0.66, 0.10, bx, by, bw, bh);

  // Eye — prominent
  ctx.fillStyle = G_EYE_S;
  R(ctx, 0.66, 0.18, 0.14, 0.16, bx, by, bw, bh);
  ctx.fillStyle = G_EYE_P;
  R(ctx, 0.68, 0.20, 0.10, 0.12, bx, by, bw, bh);

  // Small pectoral fin
  ctx.fillStyle = G_DEEP_SHDW;
  R(ctx, 0.38, 0.56, 0.20, 0.10, bx, by, bw, bh);

  ctx.restore();
}

// ── Electric eel palettes ─────────────────────────────────────────────────────
const E_OUTLINE = "#0a0e0c";
const E_DARK    = "#1e2218";  // very dark olive-grey top
const E_BODY    = "#3a3828";  // mid olive-brown body
const E_BELLY   = "#5a5040";  // lighter olive belly
const E_JAW     = "#b06828";  // orange-brown jaw accent (from reference photos)
const E_LIP     = "#cc8038";  // brighter lip highlight
const E_EYE_S   = "#8aac98";  // grey-green sclera
const E_EYE_P   = "#0a1010";  // dark pupil

// ── Electric eel head V3 — mid-width, orange lip/jaw accent, face character ───
// 1×1 hitbox. Body faces right; caller handles flip/rotation.
// Intermediate body width — neither as slim as a mackerel nor as round as garibaldi.
// Orange-tinted lower jaw is the signature detail from the reference photos.

export function drawEelHeadV3(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Tapered head polygon: narrow neck (matches body width) flaring to a wider head
  // dTop/dBot = neck dorsal/belly y; hTop/hBot = head dorsal/belly y; snR = snout arc radius
  const buildHead = (dTop: number, dBot: number, hTop: number, hBot: number, snR: number) => {
    const snCX = Math.round(bx + bw * 0.88);
    const snCY = Math.round(by + bh * 0.54);
    ctx.beginPath();
    ctx.moveTo(Math.round(bx + bw * 0.04), Math.round(by + bh * dTop)); // neck top
    ctx.lineTo(Math.round(bx + bw * 0.20), Math.round(by + bh * hTop)); // flare top
    ctx.lineTo(Math.round(bx + bw * 0.82), Math.round(by + bh * hTop)); // pre-snout top
    ctx.arc(snCX, snCY, Math.round(bw * snR), -Math.PI / 2, Math.PI / 2); // snout tip
    ctx.lineTo(Math.round(bx + bw * 0.82), Math.round(by + bh * hBot)); // pre-snout bottom
    ctx.lineTo(Math.round(bx + bw * 0.20), Math.round(by + bh * hBot)); // flare bottom
    ctx.lineTo(Math.round(bx + bw * 0.04), Math.round(by + bh * dBot)); // neck bottom
    ctx.closePath();
  };

  // Outer dark outline — neck at body width, head flares wider
  ctx.fillStyle = E_OUTLINE;
  buildHead(0.33, 0.76, 0.24, 0.82, 0.13);
  ctx.fill();

  // Clip all internal fills to the head interior
  buildHead(0.35, 0.74, 0.26, 0.80, 0.11);
  ctx.save();
  ctx.clip();

  // Base body fill
  ctx.fillStyle = E_BODY;
  R(ctx, 0.0, 0.26, 1.0, 0.54, bx, by, bw, bh);

  // Dark dorsal zone — straight flat back
  ctx.fillStyle = E_DARK;
  R(ctx, 0.0, 0.26, 1.0, 0.14, bx, by, bw, bh);

  // Belly — lighter ventral zone
  ctx.fillStyle = E_BELLY;
  R(ctx, 0.0, 0.61, 1.0, 0.19, bx, by, bw, bh);

  // Snout fill
  ctx.fillStyle = E_BODY;
  ctx.beginPath();
  ctx.arc(
    Math.round(bx + bw * 0.88), Math.round(by + bh * 0.54),
    Math.round(bw * 0.09), 0, Math.PI * 2,
  );
  ctx.fill();

  // Jaw — orange-brown lower front
  ctx.fillStyle = E_JAW;
  R(ctx, 0.62, 0.61, 0.30, 0.19, bx, by, bw, bh);
  ctx.beginPath();
  ctx.arc(
    Math.round(bx + bw * 0.88), Math.round(by + bh * 0.68),
    Math.round(bw * 0.09), 0, Math.PI * 2,
  );
  ctx.fill();

  // Lip highlight
  ctx.fillStyle = E_LIP;
  R(ctx, 0.76, 0.64, 0.14, 0.06, bx, by, bw, bh);

  // Eye sclera
  ctx.fillStyle = E_EYE_S;
  R(ctx, 0.70, 0.28, 0.12, 0.13, bx, by, bw, bh);
  // Pupil
  ctx.fillStyle = E_EYE_P;
  R(ctx, 0.72, 0.29, 0.08, 0.10, bx, by, bw, bh);
  // Shine
  ctx.fillStyle = "#c8e0d0";
  R(ctx, 0.72, 0.29, 0.02, 0.02, bx, by, bw, bh);

  // Nostrils
  ctx.fillStyle = E_OUTLINE;
  R(ctx, 0.84, 0.37, 0.03, 0.03, bx, by, bw, bh);
  R(ctx, 0.84, 0.44, 0.03, 0.03, bx, by, bw, bh);

  // Mouth line
  ctx.fillStyle = E_OUTLINE;
  R(ctx, 0.78, 0.54, 0.12, 0.02, bx, by, bw, bh);

  ctx.restore(); // release clip
  ctx.restore(); // initial save
}

// ── Oarfish / Sunfish (Mola mola) palettes ────────────────────────────────────
const O_OUTLINE    = "#0c1018";
const O_DARK_GREY  = "#2a3038";
const O_MID_GREY   = "#505868";
const O_LIGHT_GREY = "#88a0a8";
const O_BELLY      = "#c8d8d0";
const O_SPOTS      = "#d8e8e0";
const O_EYE_P      = "#1a2830";
const O_EYE_S      = "#b0c8d0";

// ── Oarfish V1 — faithful disc ────────────────────────────────────────────────
// 2×2 hitbox. Near-oval body, tall dorsal + anal fins, scalloped clavus right,
// cream belly bottom 40%, white spots, pursed mouth.

export function drawOarfishV1(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;
  const cx = bx + bw * 0.46;
  const cy = by + bh * 0.50;
  const rx = Math.round(bw * 0.36);
  const ry = Math.round(bh * 0.36);

  // Outline — slightly oversized oval
  ctx.fillStyle = O_OUTLINE;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin outline (top center)
  ctx.fillStyle = O_OUTLINE;
  tri(ctx, 0.30, 0.14, 0.46, -0.04, 0.62, 0.14, bx, by, bw, bh);

  // Anal fin outline (bottom center)
  tri(ctx, 0.30, 0.86, 0.46, 1.04, 0.62, 0.86, bx, by, bw, bh);

  // Clavus (stub tail) outline — right side, scalloped
  ctx.fillStyle = O_OUTLINE;
  R(ctx, 0.80, 0.34, 0.10, 0.32, bx, by, bw, bh);
  R(ctx, 0.88, 0.30, 0.08, 0.08, bx, by, bw, bh);
  R(ctx, 0.88, 0.62, 0.08, 0.08, bx, by, bw, bh);
  R(ctx, 0.88, 0.46, 0.08, 0.08, bx, by, bw, bh);

  // Body fill — dark grey
  ctx.fillStyle = O_DARK_GREY;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mid grey upper body
  ctx.fillStyle = O_MID_GREY;
  ctx.beginPath();
  ctx.ellipse(cx, cy - Math.round(bh * 0.04), Math.round(rx * 0.82), Math.round(ry * 0.82), 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin fill
  ctx.fillStyle = O_DARK_GREY;
  tri(ctx, 0.32, 0.16, 0.46, -0.02, 0.60, 0.16, bx, by, bw, bh);

  // Anal fin fill
  ctx.fillStyle = O_DARK_GREY;
  tri(ctx, 0.32, 0.84, 0.46, 1.02, 0.60, 0.84, bx, by, bw, bh);

  // Clavus fill
  ctx.fillStyle = O_MID_GREY;
  R(ctx, 0.81, 0.36, 0.08, 0.28, bx, by, bw, bh);
  R(ctx, 0.88, 0.32, 0.06, 0.06, bx, by, bw, bh);
  R(ctx, 0.88, 0.62, 0.06, 0.06, bx, by, bw, bh);
  R(ctx, 0.88, 0.47, 0.06, 0.06, bx, by, bw, bh);

  // Cream belly — bottom 40%
  ctx.fillStyle = O_BELLY;
  ctx.beginPath();
  ctx.ellipse(cx, cy + Math.round(bh * 0.10), Math.round(rx * 0.78), Math.round(ry * 0.52), 0, 0, Math.PI * 2);
  ctx.fill();

  // Light grey upper highlight
  ctx.fillStyle = O_LIGHT_GREY;
  R(ctx, 0.20, 0.18, 0.44, 0.16, bx, by, bw, bh);

  // White spots on upper body (5–6 irregular)
  ctx.fillStyle = O_SPOTS;
  const spotPositions: Array<[number, number, number, number]> = [
    [0.16, 0.20, 0.06, 0.06],
    [0.26, 0.15, 0.07, 0.07],
    [0.38, 0.16, 0.05, 0.05],
    [0.50, 0.18, 0.06, 0.06],
    [0.62, 0.20, 0.05, 0.05],
    [0.32, 0.26, 0.05, 0.05],
  ];
  for (const [sx, sy, sw, sh] of spotPositions) {
    R(ctx, sx, sy, sw, sh, bx, by, bw, bh);
  }

  // Pectoral fin
  ctx.fillStyle = O_DARK_GREY;
  R(ctx, 0.58, 0.54, 0.14, 0.08, bx, by, bw, bh);

  // Eye
  ctx.fillStyle = O_EYE_S;
  R(ctx, 0.62, 0.30, 0.10, 0.12, bx, by, bw, bh);
  ctx.fillStyle = O_EYE_P;
  R(ctx, 0.64, 0.32, 0.07, 0.08, bx, by, bw, bh);

  // Pursed mouth — V3 lip proportions (taller, more character)
  ctx.fillStyle = O_OUTLINE;
  R(ctx, 0.76, 0.43, 0.06, 0.08, bx, by, bw, bh);
  ctx.fillStyle = O_BELLY;
  R(ctx, 0.77, 0.44, 0.04, 0.06, bx, by, bw, bh);

  ctx.restore();
}

// ── Oarfish V2 — rounder and goofier ─────────────────────────────────────────
// More circular, bigger eye, comically small mouth, taller dorsal, more spots.

export function drawOarfishV2(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;
  const cx = bx + bw * 0.45;
  const cy = by + bh * 0.50;
  const r  = Math.round(Math.min(bw, bh) * 0.38);

  // Outline — circle
  ctx.fillStyle = O_OUTLINE;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
  ctx.fill();

  // Taller dramatic dorsal
  ctx.fillStyle = O_OUTLINE;
  tri(ctx, 0.28, 0.12, 0.45, -0.10, 0.62, 0.12, bx, by, bw, bh);

  // Anal fin
  tri(ctx, 0.28, 0.88, 0.45, 1.10, 0.62, 0.88, bx, by, bw, bh);

  // Clavus — rounder bumps
  R(ctx, 0.80, 0.32, 0.12, 0.36, bx, by, bw, bh);
  R(ctx, 0.90, 0.28, 0.08, 0.10, bx, by, bw, bh);
  R(ctx, 0.90, 0.62, 0.08, 0.10, bx, by, bw, bh);

  // Body fill
  ctx.fillStyle = O_DARK_GREY;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fill
  ctx.fillStyle = O_DARK_GREY;
  tri(ctx, 0.30, 0.14, 0.45, -0.08, 0.60, 0.14, bx, by, bw, bh);

  // Anal fill
  ctx.fillStyle = O_DARK_GREY;
  tri(ctx, 0.30, 0.86, 0.45, 1.08, 0.60, 0.86, bx, by, bw, bh);

  // Clavus fill
  ctx.fillStyle = O_MID_GREY;
  R(ctx, 0.82, 0.34, 0.09, 0.32, bx, by, bw, bh);
  R(ctx, 0.90, 0.30, 0.06, 0.08, bx, by, bw, bh);
  R(ctx, 0.90, 0.63, 0.06, 0.08, bx, by, bw, bh);

  // Mid grey body
  ctx.fillStyle = O_MID_GREY;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.round(r * 0.82), 0, Math.PI * 2);
  ctx.fill();

  // Belly (big, lower half)
  ctx.fillStyle = O_BELLY;
  ctx.beginPath();
  ctx.arc(cx, cy + Math.round(bh * 0.12), Math.round(r * 0.72), 0, Math.PI * 2);
  ctx.fill();

  // Upper light highlight
  ctx.fillStyle = O_LIGHT_GREY;
  ctx.beginPath();
  ctx.arc(cx - Math.round(bw * 0.04), cy - Math.round(bh * 0.10), Math.round(r * 0.44), 0, Math.PI * 2);
  ctx.fill();

  // More spots
  ctx.fillStyle = O_SPOTS;
  const spots2: Array<[number, number, number, number]> = [
    [0.14, 0.18, 0.07, 0.07],
    [0.24, 0.12, 0.08, 0.08],
    [0.36, 0.14, 0.06, 0.06],
    [0.48, 0.15, 0.07, 0.07],
    [0.60, 0.18, 0.06, 0.06],
    [0.28, 0.24, 0.06, 0.06],
    [0.44, 0.22, 0.05, 0.05],
    [0.56, 0.26, 0.06, 0.06],
  ];
  for (const [sx, sy, sw, sh] of spots2) {
    R(ctx, sx, sy, sw, sh, bx, by, bw, bh);
  }

  // Pectoral fin
  ctx.fillStyle = O_DARK_GREY;
  R(ctx, 0.56, 0.56, 0.14, 0.08, bx, by, bw, bh);

  // Bigger eye
  ctx.fillStyle = O_EYE_S;
  R(ctx, 0.60, 0.28, 0.14, 0.16, bx, by, bw, bh);
  ctx.fillStyle = O_EYE_P;
  R(ctx, 0.62, 0.30, 0.10, 0.12, bx, by, bw, bh);

  // Comically small pursed mouth
  ctx.fillStyle = O_OUTLINE;
  R(ctx, 0.77, 0.46, 0.04, 0.05, bx, by, bw, bh);
  ctx.fillStyle = O_BELLY;
  R(ctx, 0.78, 0.47, 0.02, 0.03, bx, by, bw, bh);

  ctx.restore();
}

// ── Oarfish V3 — angular interpretation ──────────────────────────────────────
// Rounded rectangle body, swept-back dorsal, fewer/bigger spots, high contrast.

export function drawOarfishV3(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): void {
  ctx.save();
  const bx = x, by = y, bw = w, bh = h;

  // Outline — rounded rectangle
  ctx.fillStyle = O_OUTLINE;
  R(ctx, 0.08, 0.08, 0.74, 0.84, bx, by, bw, bh);

  // Shark-like swept dorsal
  ctx.fillStyle = O_OUTLINE;
  tri(ctx, 0.20, 0.08, 0.38, -0.06, 0.60, 0.08, bx, by, bw, bh);

  // Anal fin
  tri(ctx, 0.24, 0.92, 0.42, 1.06, 0.60, 0.92, bx, by, bw, bh);

  // Angular clavus — right side
  R(ctx, 0.80, 0.28, 0.14, 0.44, bx, by, bw, bh);
  R(ctx, 0.90, 0.22, 0.08, 0.10, bx, by, bw, bh);
  R(ctx, 0.90, 0.68, 0.08, 0.10, bx, by, bw, bh);

  // Body fill — dark grey top half
  ctx.fillStyle = O_DARK_GREY;
  R(ctx, 0.10, 0.10, 0.70, 0.42, bx, by, bw, bh);

  // Body fill — cream belly bottom half (high contrast)
  ctx.fillStyle = O_BELLY;
  R(ctx, 0.10, 0.52, 0.70, 0.38, bx, by, bw, bh);

  // Mid grey transition band
  ctx.fillStyle = O_MID_GREY;
  R(ctx, 0.10, 0.44, 0.70, 0.10, bx, by, bw, bh);

  // Swept dorsal fill
  ctx.fillStyle = O_DARK_GREY;
  tri(ctx, 0.22, 0.10, 0.39, -0.04, 0.58, 0.10, bx, by, bw, bh);

  // Anal fin fill
  ctx.fillStyle = O_MID_GREY;
  tri(ctx, 0.26, 0.90, 0.42, 1.04, 0.58, 0.90, bx, by, bw, bh);

  // Clavus fill
  ctx.fillStyle = O_MID_GREY;
  R(ctx, 0.82, 0.30, 0.10, 0.40, bx, by, bw, bh);
  R(ctx, 0.91, 0.24, 0.06, 0.08, bx, by, bw, bh);
  R(ctx, 0.91, 0.68, 0.06, 0.08, bx, by, bw, bh);

  // Light grey upper body highlight
  ctx.fillStyle = O_LIGHT_GREY;
  R(ctx, 0.12, 0.12, 0.60, 0.14, bx, by, bw, bh);

  // Fewer but bigger spots
  ctx.fillStyle = O_SPOTS;
  const spots3: Array<[number, number, number, number]> = [
    [0.14, 0.16, 0.12, 0.10],
    [0.32, 0.12, 0.11, 0.10],
    [0.50, 0.14, 0.10, 0.10],
    [0.68, 0.18, 0.08, 0.08],
  ];
  for (const [sx, sy, sw, sh] of spots3) {
    R(ctx, sx, sy, sw, sh, bx, by, bw, bh);
  }

  // Pectoral fin
  ctx.fillStyle = O_DARK_GREY;
  R(ctx, 0.58, 0.50, 0.16, 0.10, bx, by, bw, bh);

  // Eye
  ctx.fillStyle = O_EYE_S;
  R(ctx, 0.60, 0.18, 0.12, 0.14, bx, by, bw, bh);
  ctx.fillStyle = O_EYE_P;
  R(ctx, 0.62, 0.20, 0.08, 0.10, bx, by, bw, bh);

  // Pursed mouth
  ctx.fillStyle = O_OUTLINE;
  R(ctx, 0.76, 0.36, 0.06, 0.08, bx, by, bw, bh);
  ctx.fillStyle = O_BELLY;
  R(ctx, 0.77, 0.37, 0.04, 0.06, bx, by, bw, bh);

  ctx.restore();
}
