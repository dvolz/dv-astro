// Pixel art sprites — Depth 6 neutral fish (Busy Pacific)
// Sega Genesis aesthetic: bold outlines, chunky highlights, ≤16 colors per sprite.
// All sprites 16×16. Rendered right-facing; left/up/down via canvas transform.
// Offscreen canvases are built once and cached by (name + destW).

import type { NeutralFish } from "./state";

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
  null,      // 0 transparent
  '#0d1520', // 1 outline
  '#1c3850', // 2 dark dorsal
  '#2c5878', // 3 dorsal
  '#4888a8', // 4 mid blue-silver
  '#78aac8', // 5 silver-blue (base color)
  '#b0d4e8', // 6 light flank
  '#dceef8', // 7 highlight
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

// ── MACKEREL 16×16 — right-facing, top-down ──────────────────────────────────
// Sleek torpedo silhouette. Forked tail left, pointed snout right.
// Body spans rows 3–12 (widest 6px at centre). Sega chunky dorsal highlight.
const _M: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // top prong tip
  [1,2,2,3,4,4,5,5,5,4,4,3,2,1,0,0], // top prong + upper body edge
  [0,1,3,5,5,6,5,5,6,6,5,5,4,2,1,0], // upper body
  [0,1,3,5,6,7,6,5,6,6,5,5,4,3,2,1], // highlight + snout (col 15)
  [0,1,3,5,6,7,6,5,6,6,5,5,4,3,2,1], // highlight
  [0,1,3,5,6,7,6,5,6,6,5,5,4,3,2,1], // highlight
  [0,1,3,5,5,6,5,5,6,6,5,5,4,2,1,0], // lower body
  [1,2,2,3,4,4,5,5,5,4,4,3,2,1,0,0], // bottom prong + lower body edge
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // bottom prong
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // bottom prong tip
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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

export const MACKEREL_SPRITE:  SpriteData = { width: 16, height: 16, palette: P_MACKEREL,  pixels: _M  };
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
  const destW = fish.size * CELL;
  const destH = fish.size * CELL;
  const canvas = getCanvas(name, sprite, destW, destH);

  const px = fish.x * CELL;
  const py = fish.y * CELL;
  const cx = px + destW / 2;
  const cy = py + destH / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, cy);

  switch (fish.dir) {
    case 'right': break;
    case 'left':  ctx.scale(-1, 1);       break;
    case 'up':    ctx.rotate(-Math.PI / 2); break;
    case 'down':  ctx.rotate( Math.PI / 2); break;
  }

  ctx.drawImage(canvas, -destW / 2, -destH / 2);
  ctx.restore();
}
