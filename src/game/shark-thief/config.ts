// ===== GameConfig =====  →  GameConfig.swift
// Per-depth tuning (palettes, spawn rates, shell configs, canvas colours) lives in level-config.ts.

export const ANIM_DURATION  = 80;  // ms — ease-out quad shark slide
export const DYING_DURATION = 450; // ms per dying-enemy dissolve animation
export const RISING_DURATION = 350; // ms per rising-pickup pop-in animation
export const BUBBLE_POP_DURATION = 300; // ms per special-pickup bubble pop

export const BUBBLE_POP_COLORS: Record<number, string> = {
  1: "#9848d8", // Ammonite — purple
  2: "#e06020", // Shark egg — red-orange
  3: "#88e030", // Toxic barrel — toxic green
  4: "#ff6030", // Shrimp — red-orange
  5: "#c0e8f8", // Frozen fish — icy blue-white
  6: "#90c840", // Kelp bladder — kelp green
  7: "#c8906a", // Coral shell — sandy tan
  8: "#c8e8b0", // Turtle egg — soft green-white
};
export const ARCTIC_TILE_COLORS = [
  "#8ab8cc", "#7aafc4", "#8cbfd4", "#82b4c8", "#90c0d0",
  "#7ab0c4", "#88bcd0", "#7cb2c8", "#86bace", "#7aaecc",
];

export const GRID = 25; // grid is always 25×25

// Ocean tile palette — shallow sunlit reef colours (Depth 1, 3, 5)
export const TILE_COLORS = [
  "#1d7e92", "#228898", "#1a7888", "#268498", "#1e8090",
  "#248898", "#1c7682", "#247c8e", "#1e7e8e", "#207a8c",
];

// Tropical reef palette — vibrant turquoise water (Depth 2)
// Hue ~176-182°: true turquoise, clearly brighter and greener than depth 1's blue-teal.
export const TROPICAL_TILE_COLORS = [
  "#26b8b4", "#2ebcb8", "#22b0ac", "#2ab8b4", "#24b4b0",
  "#2cb6b2", "#20aeaa", "#30bab6", "#26b2ae", "#28b6b2",
];

// Nursery palette — ocean palette shifted cooler (Depth 3)
// Same lightness as depth 1 so enemies stay visible; G reduced ~10, B increased ~8
// to push from teal (~190°) toward a cooler blue-teal (~200°).
export const NURSERY_TILE_COLORS = [
  "#1d749a", "#227ea0", "#1a6e90", "#267aa0", "#1e7698",
  "#247ea0", "#1c6c8a", "#247296", "#1e7496", "#207094",
];

// Toxic palette — barely darker than ocean/shallows (Depth 5)
// Ocean values minus ~3 per channel; hue stays at ~185-188°.
export const TOXIC_TILE_COLORS = [
  "#1a7b8f", "#1f8595", "#177585", "#238195", "#1b7d8d",
  "#218595", "#19737f", "#21798b", "#1b7b8b", "#1d7789",
];

// Pacific kelp forest palette — sunlit surface water, brighter and slightly bluer than ocean (Depth 6)
// Hue ~195°, higher lightness range to suggest light filtering down through kelp.
export const PACIFIC_TILE_COLORS = [
  "#2a8faa", "#1e8aa8", "#2c94b0", "#2488a4", "#309aac",
  "#1a86a2", "#2890a8", "#228ca6", "#2e96ae", "#2084a0",
];

// Electric eel depth palette — reef-like base shifted to blue-indigo (Depth 7)
// Hue ~210-225°: blue water with purple undertones, distinct from Pacific (~195°).
// Yellow eel glow pops against this cooler, darker base.
export const ELECTRIC_TILE_COLORS = [
  "#2a60b4", "#3268bc", "#2258a8", "#3870c0", "#2c62b0",
  "#4060b0", "#2a58aa", "#3464b8", "#3c70be", "#2e5eb2",
];

// Coastal palette — warm sandy blue-green, shallow sun-lit water (Depth 8)
// Hue ~184-186°, higher lightness than deep ocean — brighter and slightly warmer.
export const COASTAL_TILE_COLORS = [
  "#3ab8b0", "#42bab8", "#4abcba", "#38b4ac", "#46b8b6",
  "#40b6b4", "#3cbab2", "#44bcba", "#3ab0a8", "#48bab8",
];

// Available background palettes — add new entries here to create more options.
export type TilePalette = "ocean" | "tropical" | "arctic" | "nursery" | "toxic" | "pacific" | "electric" | "coastal";

export const TILE_PALETTES: Record<TilePalette, string[]> = {
  ocean:    TILE_COLORS,
  tropical: TROPICAL_TILE_COLORS,
  arctic:   ARCTIC_TILE_COLORS,
  nursery:  NURSERY_TILE_COLORS,
  toxic:    TOXIC_TILE_COLORS,
  pacific:  PACIFIC_TILE_COLORS,
  electric: ELECTRIC_TILE_COLORS,
  coastal:  COASTAL_TILE_COLORS,
};

export function randomColorFromPalette(palette: TilePalette): string {
  const colors = TILE_PALETTES[palette];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Depth metadata — colour, glow, name  →  DepthSystem.swift
export const DEPTH_META: Record<number, { color: string; glow: string; name: string }> = {
  1: { color: "#48cae4", glow: "rgba(72,202,228,0.5)",   name: "THE SHALLOWS" },
  2: { color: "#e06fa0", glow: "rgba(224,111,160,0.5)",  name: "NURSERY" },
  3: { color: "#6abf3a", glow: "rgba(106,191,58,0.5)",   name: "TOXIC" },
  4: { color: "#ffe030", glow: "rgba(255,224,48,0.5)",   name: "ELECTRIC" },
  5: { color: "#7fd8f0", glow: "rgba(127,216,240,0.5)",  name: "ARCTIC" },
  6: { color: "#48d4b8", glow: "rgba(72,212,184,0.5)",   name: "BUSY PACIFIC" },
  7: { color: "#daa070", glow: "rgba(218,160,112,0.5)",  name: "REEF" },
  8: { color: "#42bdb8", glow: "rgba(66,189,184,0.5)",   name: "TURTLE MIGRATION" },
  9: { color: "#9d6fe0", glow: "rgba(157,111,224,0.5)",  name: "ABYSS" },
};
