// ===== Level Config =====
// Per-depth gameplay parameters. Edit values here to tune each level.
// Only include the shell section(s) that actually appear at that depth —
// omitting a section means that mechanic won't show up.

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

// ── Per-depth config ──────────────────────────────────────────────────────

export interface DepthConfig {
  // Only define the shell type(s) that appear at this depth.
  // Omit any that shouldn't appear — they'll be inactive.
  ammonite?:   AmmoniteConfig;
  coral?:      CoralConfig;
  egg?:        EggConfig;
  frozenFish?: FrozenFishConfig;
  icePatches?: IcePatchConfig;

  coinRate:     number; // probability per cell per player move of a coin spawning
  coinInit:     number; // fraction of cells pre-filled with coins at start
  descendScore: number; // points to earn in this depth before descending
  minEnemyDist: number; // min Manhattan distance from shark for enemy spawn
}

// ── Level definitions ─────────────────────────────────────────────────────

export const LEVEL_CONFIG: Record<number, DepthConfig> = {
  1: {
    ammonite: {
      initCount: 1,   // ammonites placed at game start
      max:       4,   // up to 4 purple shells on the board at once
      interval:  25,  // a new shell spawns 25 moves after the last is collected
      points:    10,
    },
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  2: {
    coral: {
      initCount: 4,   // shells placed on entering this depth
      max:       6,   // max 6 coral shells on the board at once
      interval:  15,  // a new shell spawns every 15 player moves
      points:    5,
    },
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  3: {
    egg: {
      initCount:      1,  // eggs placed on entering this depth
      interval:       0,  // moves after collecting an egg before the next spawns (0 = immediate)
      points:         10, // points per egg collected
      babyPenalty:    5,  // points lost when the baby shark is eaten by an enemy
      centerSafeZone: 10, // eggs won't spawn in the center 10×10 area — keeps the middle accessible
    },
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  4: {
    frozenFish: {
      initCount: 1, // fish placed on entering this depth
      max:       3, // max frozen fish on the board at once
      interval:  20, // moves after collecting a fish before the next one spawns
      points:    5, // points per frozen fish collected
    },
    icePatches: {
      initialCount: 8, // number of ice patch shapes seeded at the start of this depth
    },
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },

  5: {
    coinRate:     0.00025,
    coinInit:     0.05,
    descendScore: 100,
    minEnemyDist: 5,
  },
};
