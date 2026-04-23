// Pixel art sprites — Depth 6 neutral fish (Busy Pacific)
// Sega Genesis aesthetic: bold outlines, chunky highlights, ≤16 colors per sprite.
// Mackerel: 32×16. Garibaldi/Grouper: 16×16. Rendered right-facing; left/up/down via canvas transform.
// Offscreen canvases are built once and cached by (name + destW).

import type { NeutralFish, AlgaeBall } from "./state";

export interface SpriteData {
  width:   number;
  height:  number;
  palette: (string | null)[];
  pixels:  number[][];
}

// ── Palettes ──────────────────────────────────────────────────────────────────
// Sega Genesis used a 9-bit RGB palette (512 colors, 16 per sprite).
// We stay within 9 per sprite to match that chunky, saturated look.

const P_MACKEREL: (string | null)[] = [
  null,       // 0  transparent
  '#0a1220',  // 1  outline
  '#182e48',  // 2  dark tail
  '#0d2840',  // 3  dark wavy stripe marking
  '#2a5878',  // 4  dorsal/back
  '#4888a8',  // 5  upper flank blue
  '#78aac8',  // 6  silver-blue base
  '#a8c8d8',  // 7  light silver flank
  '#d0e8f5',  // 8  belly
  '#f0f8ff',  // 9  belly highlight
  '#f8fcff',  // 10 eye white
  '#040c18',  // 11 eye pupil
  '#c0d8ee',  // 12 eye sclera rim
];

const P_GARIBALDI: (string | null)[] = [
  null,      // 0 transparent
  '#1a0800', // 1 outline
  '#601500', // 2 deep shadow
  '#a02a00', // 3 dark orange-red
  '#cc4800', // 4 orange-red
  '#f06820', // 5 vivid orange (base ~#ff7020)
  '#ff8c3a', // 6 bright orange
  '#ffb060', // 7 light orange
  '#ffd888', // 8 highlight
];

const P_GROUPER: (string | null)[] = [
  null,      // 0 transparent
  '#140c04', // 1 outline
  '#2a1a08', // 2 deep shadow
  '#3c2810', // 3 dark earth
  '#5a3c1c', // 4 brown
  '#7a5428', // 5 mid earth
  '#a07848', // 6 earth base (#a07848 specified)
  '#c09860', // 7 light earth
  '#d8b878', // 8 highlight
  '#501008', // 9 dark spot / mottling
];

// ── MACKEREL 32×16 — right-facing, top-down ──────────────────────────────────
// 2×1 torpedo silhouette. Forked tail at left, pointed snout at right.
// Body rows 4–11 (50% of sprite height) keeps the fish slim in the cell.
// Dark wavy stripe markings on back (rows 5, 10). Eye near head (cols 23–25, rows 6–8).
const _M: number[][] = [
  // Row 0
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 1
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 2
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 3: tail top prong tip
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 4: upper body edge + tail fork top
  [1,2,2,1,1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,2,1,0,0],
  // Row 5: upper body — dark wavy mackerel stripe markings
  [0,1,3,4,3,3,5,3,3,5,5,3,3,5,5,3,3,5,5,5,6,6,5,5,4,3,2,1,0,0,0,0],
  // Row 6: upper silver body + eye left ring / sclera / white
  [0,0,1,4,5,6,6,7,7,6,7,7,6,7,7,6,7,7,7,7,7,7,7,1,12,10,5,4,3,1,0,0],
  // Row 7: belly transition + eye pupil / white
  [0,0,1,4,6,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,1,11,10,6,4,3,1,0,0],
  // Row 8: belly highlight + eye sclera bottom / white highlight
  [0,0,1,4,6,7,7,7,7,7,7,7,7,7,7,7,7,7,8,9,9,9,8,1,12, 9,6,4,3,1,0,0],
  // Row 9: lower silver body (mirrored upper)
  [0,0,1,4,5,6,6,7,7,6,7,7,6,7,7,6,7,7,7,7,7,7,7,7,7,6,5,4,3,1,0,0],
  // Row 10: lower body — dark wavy markings (symmetric with row 5)
  [0,1,3,4,3,3,5,3,3,5,5,3,3,5,5,3,3,5,5,5,6,6,5,5,4,3,2,1,0,0,0,0],
  // Row 11: lower body edge + tail fork bottom
  [1,2,2,1,1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,3,2,1,0,0],
  // Row 12: tail bottom fork
  [1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 13: tail bottom prong tip
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 14
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 15
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ── GARIBALDI 16×16 — right-facing, top-down ─────────────────────────────────
// Round compact damselfish. Fan tail left, blunt-ish rounded head right.
// Body spans rows 2–12, much wider than mackerel. Vivid orange Sega pop.
const _G: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0], // tail top tip
  [1,3,4,3,2,2,3,4,5,5,4,3,2,1,0,0], // tail + upper body
  [1,4,5,6,6,5,5,6,7,7,6,5,4,3,1,0], // upper body
  [1,4,6,7,8,7,6,7,7,8,7,6,5,4,2,1], // wide highlight
  [0,1,4,6,8,8,7,7,8,8,7,6,5,4,3,1], // centre highlight
  [0,1,4,6,8,8,7,7,8,8,7,6,5,4,3,1], // centre
  [0,1,4,6,8,8,7,7,8,8,7,6,5,4,3,1], // centre
  [1,4,6,7,8,7,6,7,7,8,7,6,5,4,2,1], // wide lower
  [1,4,5,6,6,5,5,6,7,7,6,5,4,3,1,0], // lower body
  [1,3,4,3,2,2,3,4,5,5,4,3,2,1,0,0], // tail + lower body
  [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0], // tail bottom tip
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ── GROUPER 16×16 — right-facing, top-down ───────────────────────────────────
// Rendered at 2×CELL × 2×CELL so each pixel appears ~CELL/8 on screen.
// Broad fan tail, heavy body, characteristic dark mottling spots (color 9).
// Blunt rounded head — groupers don't taper.
const _GR: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0], // tail fan top
  [1,4,5,6,5,3,2,2,3,4,5,5,4,3,1,0], // tail base + upper body
  [1,5,6,7,8,7,6,5,9,6,7,7,6,4,2,1], // upper body + spot
  [1,5,7,8,8,7,6,6,6,7,8,7,6,5,3,1], // highlight band
  [1,4,6,8,8,8,7,6,9,7,8,8,7,5,3,1], // highlight + spot
  [1,4,6,7,8,8,7,7,7,8,8,7,6,5,3,1], // centre
  [1,4,6,7,8,8,7,7,7,8,8,7,6,5,3,1], // centre
  [1,4,6,7,8,8,7,7,7,8,8,7,6,5,3,1], // centre
  [1,4,6,8,8,8,7,6,9,7,8,8,7,5,3,1], // highlight + spot (mirror)
  [1,5,7,8,8,7,6,6,6,7,8,7,6,5,3,1], // highlight band
  [1,5,6,7,8,7,6,5,9,6,7,7,6,4,2,1], // lower body + spot
  [1,4,5,6,5,3,2,2,3,4,5,5,4,3,1,0], // tail base + lower body
  [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0], // tail fan bottom
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

export const MACKEREL_SPRITE:  SpriteData = { width: 32, height: 16, palette: P_MACKEREL,  pixels: _M  };
export const GARIBALDI_SPRITE: SpriteData = { width: 16, height: 16, palette: P_GARIBALDI, pixels: _G  };
export const GROUPER_SPRITE:   SpriteData = { width: 16, height: 16, palette: P_GROUPER,   pixels: _GR };

// ── Offscreen canvas cache ────────────────────────────────────────────────────
// Cached by "name_destW" — rebuilt automatically if CELL changes between renders.

const _cache = new Map<string, HTMLCanvasElement>();

function buildCanvas(name: string, sprite: SpriteData, destW: number, destH: number): HTMLCanvasElement {
  const w   = Math.round(destW);
  const h   = Math.round(destH);
  const off = document.createElement('canvas');
  off.width  = w;
  off.height = h;
  const c = off.getContext('2d')!;
  c.imageSmoothingEnabled = false;

  const pw = destW / sprite.width;
  const ph = destH / sprite.height;

  for (let row = 0; row < sprite.height; row++) {
    for (let col = 0; col < sprite.width; col++) {
      const color = sprite.palette[sprite.pixels[row][col]];
      if (color === null) continue;
      c.fillStyle = color;
      c.fillRect(Math.floor(col * pw), Math.floor(row * ph), Math.ceil(pw), Math.ceil(ph));
    }
  }
  return off;
}

function getCanvas(name: string, sprite: SpriteData, destW: number, destH: number): HTMLCanvasElement {
  const key = `${name}_${Math.round(destW)}`;
  if (!_cache.has(key)) _cache.set(key, buildCanvas(name, sprite, destW, destH));
  return _cache.get(key)!;
}

export function clearSpriteCache(): void { _cache.clear(); }

// ── Public draw call ──────────────────────────────────────────────────────────
// Sprites are right-facing. Left = flipH. Up/down = 90° rotation (crisp top-down read).

const SPRITE_MAP: Record<NeutralFish["type"], { name: string; sprite: SpriteData }> = {
  mackerel:  { name: 'mackerel',  sprite: MACKEREL_SPRITE  },
  garibaldi: { name: 'garibaldi', sprite: GARIBALDI_SPRITE },
  grouper:   { name: 'grouper',   sprite: GROUPER_SPRITE   },
};

export function drawNeutralFish(
  ctx:   CanvasRenderingContext2D,
  fish:  NeutralFish,
  CELL:  number,
): void {
  const { name, sprite } = SPRITE_MAP[fish.type];
  const destW = fish.sizeX * CELL;
  const destH = fish.sizeY * CELL;
  const canvas = getCanvas(name, sprite, destW, destH);

  const px = fish.visualX * CELL;
  const py = fish.visualY * CELL;
  const cx = px + destW / 2;
  const cy = py + destH / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, cy);

  // Bladder-spawn grow effect: fish scales from 0 → full over 500ms, glow fades over 2s
  let spawnScale = 1;
  if (fish.spawnTime !== undefined) {
    const elapsed = Date.now() - fish.spawnTime;
    if (elapsed < 2000) {
      // easeOutBack over 500ms — gives a slight overshoot pop
      const growT = Math.min(1, elapsed / 500);
      const c1 = 1.70158, c3 = c1 + 1;
      spawnScale = growT < 1
        ? 1 + c3 * Math.pow(growT - 1, 3) + c1 * Math.pow(growT - 1, 2)
        : 1;
      ctx.scale(spawnScale, spawnScale);

      // Glow drawn in scaled space (centered at 0,0)
      const fade = Math.pow(1 - elapsed / 2000, 1.5);
      const pulse = 0.5 + 0.5 * Math.sin((elapsed / 120) * Math.PI);
      const pad = Math.round(CELL * 0.2);
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
    case 'left':  ctx.scale(-1, 1);       break;
    case 'up':    ctx.rotate(-Math.PI / 2); break;
    case 'down':  ctx.rotate( Math.PI / 2); break;
  }

  ctx.drawImage(canvas, -destW / 2, -destH / 2);
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

  // Slow gentle bob
  const bob = Math.sin(now / 900 + ball.x * 1.3 + ball.y * 0.7) * CELL * 0.05;

  ctx.translate(cx, cy + bob);

  // Outer dark outline
  ctx.fillStyle = "#0a2208";
  ctx.beginPath();
  ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
  ctx.fill();

  // Base green body
  ctx.fillStyle = "#2a7a18";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Mid green layer
  ctx.fillStyle = "#3ea024";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy bumps around the perimeter — 6 small lobes
  ctx.fillStyle = "#2a7a18";
  const lobeCount = 6;
  const lobeR = r * 0.28;
  for (let i = 0; i < lobeCount; i++) {
    const angle = (i / lobeCount) * Math.PI * 2 + now / 3000;
    const lx = Math.cos(angle) * r * 0.72;
    const ly = Math.sin(angle) * r * 0.72;
    ctx.beginPath();
    ctx.arc(lx, ly, lobeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright inner highlight
  ctx.fillStyle = "#66cc40";
  ctx.beginPath();
  ctx.arc(-r * 0.18, -r * 0.20, r * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = "#aaee80";
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.25, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Tiny white glint
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.30, Math.max(1, r * 0.065), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
