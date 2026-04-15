// ===== GameConfig =====  →  GameConfig.swift

export const ANIM_DURATION = 80;       // ms — ease-out quad shark slide
export const MIN_ENEMY_DIST = 5;       // min Manhattan distance for enemy spawn
export const PICKUP_RATE    = 0.00025; // per cell per move
export const PICKUP_INIT    = 0.05;    // 5% of cells on init
export const DYING_DURATION = 450;     // ms per dying-enemy dissolve animation

// Shell spawn system — guaranteed counter (not random)
export const AMMONITE_INTERVAL  = 25; // moves between ammonite respawns
export const CORAL_INTERVAL     = 15; // moves between coral shell spawns
export const CORAL_MAX_ON_BOARD = 6;  // max coral shells on board at once
export const CORAL_PICKUP_INIT  = 4;  // shells seeded on entering depth 2

export const ARCTIC_FISH_POINTS = 5;       // confirmed by design doc
export const ARCTIC_PATCH_COUNT = 5;       // 5 patches seeded at level start
export const ARCTIC_TILE_COLORS = [
  "#8ab8cc", "#7aafc4", "#8cbfd4", "#82b4c8", "#90c0d0",
  "#7ab0c4", "#88bcd0", "#7cb2c8", "#86bace", "#7aaecc",
];

export const GRID = 25; // grid is always 25×25

// Ocean tile palette — shallow sunlit reef colours
export const TILE_COLORS = [
  "#1d7e92", "#228898", "#1a7888", "#268498", "#1e8090",
  "#248898", "#1c7682", "#247c8e", "#1e7e8e", "#207a8c",
];

export function randomTileColor(): string {
  return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
}

export function randomArcticTileColor(): string {
  return ARCTIC_TILE_COLORS[Math.floor(Math.random() * ARCTIC_TILE_COLORS.length)];
}

// Depth metadata — colour, glow, name  →  DepthSystem.swift
export const DEPTH_META: Record<number, { color: string; glow: string; name: string }> = {
  1: { color: "#48cae4", glow: "rgba(72,202,228,0.5)",   name: "THE SHALLOWS" },
  2: { color: "#daa070", glow: "rgba(218,160,112,0.5)",  name: "REEF" },
  3: { color: "#e06fa0", glow: "rgba(224,111,160,0.5)",  name: "NURSERY" },
  4: { color: "#7fd8f0", glow: "rgba(127,216,240,0.5)",  name: "ARCTIC" },
  5: { color: "#9d6fe0", glow: "rgba(157,111,224,0.5)",  name: "ABYSS" },
};
