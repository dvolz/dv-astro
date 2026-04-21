// ===== Level Config =====
// Per-depth gameplay parameters. Edit values here to tune each level.
// Only include the shell section(s) that actually appear at that depth —
// omitting a section means that mechanic won't show up.

// Available palettes: "ocean" | "tropical" | "arctic" | "nursery" | "toxic"
// Add new palettes to TILE_PALETTES in config.ts, then use the name here.
import type { TilePalette } from "./config";

// ── Shell / pickup types ──────────────────────────────────────────────────

export interface AmmoniteConfig {
  initCount:      number;  // shells placed at game start
  max:            number;  // max purple shells on the board at once
  interval:       number;  // player moves between spawns
  points:         number;  // points awarded per ammonite collected
  centerSafeZone?: number; // side length of a square in the center where this pickup won't spawn
}

export interface CoralConfig {
  initCount:      number;  // shells seeded when entering this depth
  max:            number;  // max coral shells on the board at once
  interval:       number;  // player moves between spawns
  points:         number;  // points awarded per coral shell collected
  centerSafeZone?: number; // side length of a square in the center where this pickup won't spawn
  barrierCount:   number;  // permanent coral barrier blocks placed at depth entry
  barrierMinDist: number;  // min Manhattan distance from shark when placing a barrier
}

export interface EggConfig {
  initCount:       number;  // eggs placed when entering this depth
  interval:        number;  // player moves between collecting an egg and the next one spawning (0 = immediate)
  points:          number;  // points awarded per egg collected
  babyPenalty:     number;  // points lost when an enemy eats the baby shark
  centerSafeZone?: number;  // side length of a square in the center where eggs won't spawn
}

export interface FrozenFishConfig {
  initCount:      number;  // fish placed when entering this depth
  max:            number;  // max frozen fish on the board at once
  interval:       number;  // player moves between collecting a fish and the next one spawning
  points:         number;  // points awarded per frozen fish collected
  centerSafeZone?: number; // side length of a square in the center where this pickup won't spawn
}

export interface IcePatchConfig {
  initialCount: number; // ice patch shapes seeded at depth start
}

export interface ToxicBarrelConfig {
  initCount:       number;  // barrels placed when entering this depth
  max:             number;  // max barrels on the board at once
  interval:        number;  // player moves between a collection and the next barrel spawn
  points:          number;  // points awarded per barrel collected
  centerSafeZone?: number;  // side length of center square where barrels won't spawn
  cloudBuffer:     number;  // Manhattan distance around each cloud cell excluded from enemy spawns
  cloudSize:       number;  // full width/height of each cloud (corners are always removed)
}

export type NeutralFishType = "mackerel" | "grouper" | "garibaldi";

export interface NeutralFishSpecConfig {
  count:          number;  // how many of this species spawn at depth start
  speedDivisor:   number;  // fish moves once per N player moves (1 = every move, 2 = every 2 moves, etc.)
  sizeX:          number;  // grid cells wide
  sizeY:          number;  // grid cells tall
}

export interface NeutralFishConfig {
  mackerel:   NeutralFishSpecConfig;
  grouper:    NeutralFishSpecConfig;
  garibaldi:  NeutralFishSpecConfig;
}

export interface KelpConfig {
  strandCount:    number;  // number of kelp columns to place, spread evenly across the board
  minHeight:      number;  // minimum cells per kelp column
  maxHeight:      number;  // maximum cells per kelp column
  swayPeriod:     number;  // ms for one full sway cycle (purely visual, no gameplay effect)
  bladeEnabled:   boolean;        // true for Depth 6, false for Depth 2
  bladderEnabled: boolean;        // true for Depth 6, false for Depth 2
  bladderPoints:  number;         // points awarded per bladder collect (Depth 6: 5)
  colorMode: "kelp" | "seaweed"; // "kelp" = brown-green palette, "seaweed" = original green
}

// ── Per-depth config ──────────────────────────────────────────────────────

export interface DepthConfig {
  // Only define the shell type(s) that appear at this depth.
  // Omit any that shouldn't appear — they'll be inactive.
  ammonite?:    AmmoniteConfig;
  coral?:       CoralConfig;
  egg?:         EggConfig;
  frozenFish?:  FrozenFishConfig;
  icePatches?:  IcePatchConfig;
  toxicBarrel?: ToxicBarrelConfig;
  neutralFish?: NeutralFishConfig;
  kelp?:        KelpConfig;

  tilePalette:  TilePalette; // background tile palette
  canvasBase:   string;      // canvas fill colour drawn behind the tile grid
  enemyKeep:    number;      // normal enemies carried over from the previous depth on transition
  coinRate:     number;      // probability per cell per player move of a coin spawning
  coinInit:     number;      // fraction of cells pre-filled with coins at start
  descendScore: number;      // points to earn in this depth before descending
  minEnemyDist: number;      // min Manhattan distance from shark for enemy spawn
}

// ── Level definitions ─────────────────────────────────────────────────────
// To reorder mechanics: move the config block to the desired depth key.
// All mechanic-presence guards in the codebase read from LEVEL_CONFIG — no
// hardcoded depth numbers exist outside this file.

export const LEVEL_CONFIG: Record<number, DepthConfig> = {
  1: {
    ammonite: {
      initCount: 1,   // ammonites placed at game start
      max:       4,   // up to 4 purple shells on the board at once
      interval:  25,  // a new shell spawns 25 moves after the last is collected
      points:    10,
    },
    tilePalette:  "ocean",
    canvasBase:   "#0f5262",
    enemyKeep:    5,  // enemies carried in from depth 1 start (depth 1 always spawns fresh)
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  2: {
    // The Nursery (was depth 3)
    egg: {
      initCount:      1,  // eggs placed on entering this depth
      interval:       0,  // moves after collecting an egg before the next spawns (0 = immediate)
      points:         10, // points per egg collected
      babyPenalty:    5,  // points lost when the baby shark is eaten by an enemy
      centerSafeZone: 10, // eggs won't spawn in the center 10×10 area — keeps the middle accessible
    },
    kelp: {
      strandCount:    26,
      minHeight:      5,
      bladderPoints:  0,
      maxHeight:      7,
      swayPeriod:     4000,
      bladeEnabled:   false,
      bladderEnabled: false,
      colorMode:      "seaweed",
    },
    tilePalette:  "nursery",
    canvasBase:   "#0a4a5e",
    enemyKeep:    5,  // enemies carried over from depth 1
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  3: {
    // Toxic (was depth 5)
    toxicBarrel: {
      initCount:       1,
      max:             4,
      interval:        20,
      points:          8,
      centerSafeZone:  8,
      cloudBuffer:     2,
      cloudSize:       4,
    },
    tilePalette:  "toxic",
    canvasBase:   "#0a1f0a",
    enemyKeep:    8,
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 6,
  },

  4: {
    // The Arctic (same position, was depth 4)
    frozenFish: {
      initCount: 1, // fish placed on entering this depth
      max:       3, // max frozen fish on the board at once
      interval:  20, // moves after collecting a fish before the next one spawns
      points:    5, // points per frozen fish collected
    },
    icePatches: {
      initialCount: 8, // number of ice patch shapes seeded at the start of this depth
    },
    tilePalette:  "arctic",
    canvasBase:   "#0a1a2e",
    enemyKeep:    10, // enemies carried over from depth 3
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  5: {
    // The Reef (was depth 2)
    coral: {
      initCount:      4,   // pickup shells seeded on entering this depth
      max:            6,   // max coral pickup shells on the board at once
      interval:       15,  // a new shell spawns every 15 player moves
      points:         5,
      barrierCount:   12,  // permanent coral barrier blocks placed at depth entry (~2% of grid)
      barrierMinDist: 4,   // min Manhattan distance from shark when placing a barrier
    },
    tilePalette:  "tropical",
    canvasBase:   "#0f5262",
    enemyKeep:    12, // enemies carried over from depth 4
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  6: {
    // The Busy Pacific
    neutralFish: {
      mackerel:  { count: 4, speedDivisor: 2, sizeX: 2, sizeY: 1 },
      grouper:   { count: 2, speedDivisor: 3, sizeX: 2, sizeY: 2 },
      garibaldi: { count: 4, speedDivisor: 1, sizeX: 1, sizeY: 1 },
    },
    kelp: {
      strandCount:    10,
      minHeight:      19,
      maxHeight:      22,
      swayPeriod:     3000,
      bladeEnabled:   true,
      bladderEnabled: true,
      bladderPoints:  5,
      colorMode:      "kelp",
    },
    tilePalette:  "pacific",
    canvasBase:   "#0c4a5a",
    enemyKeep:    14,
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  7: {
    tilePalette:  "ocean",
    canvasBase:   "#0f5262",
    enemyKeep:    5,
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },
};

// ── Mechanic-presence constants ───────────────────────────────────────────
// Derived from LEVEL_CONFIG — never hardcode depth numbers in the game logic.
// If you move a mechanic to a different depth key above, these update automatically.

export const TOXIC_DEPTH   = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].toxicBarrel))!;
export const CORAL_DEPTH   = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].coral))!;
export const ICE_DEPTH     = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].icePatches))!;
export const NURSERY_DEPTH = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].egg))!;
export const PACIFIC_DEPTH = (Object.keys(LEVEL_CONFIG).map(Number).find(d => !!LEVEL_CONFIG[d].neutralFish))!;
