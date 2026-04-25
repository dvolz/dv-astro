// ===== Depth Info — static data & HTML builder =====
// No game-state imports — pure data + template functions.

import { DEPTH_META } from "../config";

// ── Core rules ────────────────────────────────────────────────────────────

export const DEPTH_RULES: Record<number, Array<{ key: string; val: string; keyColor?: string }>> = {
  1: [
    { key: "ENEMIES",   val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",     val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "AMMONITE",  val: "+10 PTS — SPAWNS BIG 2×2 ENEMY — APPEARS EVERY 25 MOVES", keyColor: "#9b59e0" },
    { key: "DESCEND",   val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  2: [
    { key: "ENEMIES",    val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",      val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "EGG",        val: "+10 PTS — HATCHES BABY SHARK — SPAWNS 1 ENEMY — 1 EGG ON BOARD AT ALL TIMES", keyColor: "#e06fa0" },
    { key: "BABY SHARK", val: "FOLLOWS YOU — IF AN ENEMY EATS IT, YOU LOSE 5 PTS", keyColor: "#e06fa0" },
    { key: "BLOOD",      val: "CELL WHERE BABY WAS EATEN TURNS RED — FADES OVER 10 MOVES" },
    { key: "ON ENTRY",   val: "ENEMIES RESET TO 5 FARTHEST FROM YOU — NO BARRIERS" },
    { key: "DESCEND",    val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  3: [
    { key: "ENEMIES",   val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",     val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "BARREL",    val: "+8 PTS — SPAWNS 1 ENEMY — EXPANDS A TOXIC CLOUD — APPEARS EVERY 20 MOVES", keyColor: "#6abf3a" },
    { key: "CLOUD",     val: "GAS CELLS COVER THE GRID — ENEMIES AND PLAYER HIDDEN INSIDE" },
    { key: "SPAWN",     val: "ENEMIES CANNOT SPAWN INSIDE OR NEAR CLOUD CELLS" },
    { key: "ON ENTRY",  val: "ENEMIES RESET TO 8 FARTHEST FROM YOU" },
    { key: "DESCEND",   val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  4: [
    { key: "ENEMIES",      val: "10 ON ENTRY — MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",        val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "FROZEN FISH",  val: "+5 PTS — SPAWNS 1 ENEMY — CONVERTS TILE TO ICE — 1 FISH ON BOARD AT ALL TIMES", keyColor: "#7fd8f0" },
    { key: "ICE PATCHES",  val: "STEPPING ONTO ICE CAUSES YOU TO SLIDE UNTIL YOU HIT A WALL OR FLOOR" },
    { key: "SLIDE DEATH",  val: "SLIDING INTO AN ENEMY AT ANY POINT — INCLUDING THE FRESHLY SPAWNED ONE — IS DEATH" },
    { key: "DESCEND",      val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  5: [
    { key: "ENEMIES",   val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",     val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "CORAL",     val: "+5 PTS — CONVERTS TO BARRIER — SPAWNS 1 ENEMY — NEW SHELL EVERY 15 MOVES", keyColor: "#daa070" },
    { key: "BARRIERS",  val: "PERMANENT IMPASSABLE WALLS" },
    { key: "ON ENTRY",  val: "ENEMIES RESET TO 12 FARTHEST FROM YOU" },
    { key: "DESCEND",   val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  6: [
    { key: "ENEMIES",      val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",        val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "NEUTRAL FISH", val: "MACKEREL, GARIBALDI & OARFISH — IMPASSABLE — THEY MOVE AROUND YOU", keyColor: "#48d4b8" },
    { key: "KELP",         val: "COLUMNS GROW FROM THE SEA FLOOR — YOU CAN HIDE INSIDE THEM" },
    { key: "GAS BLADDER",  val: "+5 PTS — COLLECT KELP FLOATS FOR BONUS POINTS", keyColor: "#48d4b8" },
    { key: "ON ENTRY",     val: "ENEMIES RESET TO 14 FARTHEST FROM YOU" },
    { key: "DESCEND",      val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  7: [
    { key: "ENEMIES",       val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",         val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "PURPLE PEARL",  val: "+5 PTS — SPAWNS 1 ENEMY — 4 PEARLS ON BOARD AT ALL TIMES", keyColor: "#ffe030" },
    { key: "ELECTRIC EELS", val: "5 EELS PATROL THE DEPTHS — TOUCH ONE AND YOU'RE PARALYZED FOR 2 SECONDS", keyColor: "#ffe030" },
    { key: "SHOCK",         val: "WHILE PARALYZED, ENEMIES AND EELS KEEP MOVING — ESCAPE OR DIE" },
    { key: "ON ENTRY",      val: "ENEMIES RESET TO 16 FARTHEST FROM YOU" },
    { key: "DESCEND",       val: "EARN 100 PTS IN THIS DEPTH" },
  ],
};

// ── Technical parameters ──────────────────────────────────────────────────

export const DEPTH_PARAMS: Record<number, Array<{ key: string; val: string }>> = {
  1: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "SHELL SPAWN", val: "1 ammonite on board at a time — respawns 25 moves after collected" },
    { key: "SHELL INIT",  val: "1 ammonite placed at game start" },
    { key: "CORAL TILES", val: "0% — no coral at Depth 1" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
  2: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "EGG SPAWN",   val: "1 egg always on board — respawns immediately on collection" },
    { key: "CORAL TILES", val: "0% — open water" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
    { key: "BABY MOVE",   val: "1 STEP EVERY PLAYER MOVE — TRAILS 1 CELL BEHIND" },
  ],
  3: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "BARREL SPAWN",val: "1 barrel on entry — max 4 on board — respawns 20 moves after collected" },
    { key: "CLOUD SIZE",  val: "4×4 minus corners = 12 cells per expansion" },
    { key: "CLOUD BUFFER",val: "Enemies cannot spawn within 2 Manhattan distance of any cloud cell" },
    { key: "ENEMY SPAWN", val: "≥ 6 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
  4: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "FISH SPAWN",  val: "1 frozen fish on board at all times — respawns immediately on collection" },
    { key: "ICE PATCHES", val: "8 patches seeded at level start — more added as fish are collected" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK — NOT ON ICE" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES — ENEMIES ALSO SLIDE ON ICE" },
  ],
  5: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "SHELL SPAWN", val: "1 new coral shell every 15 moves — max 6 on board" },
    { key: "SHELL INIT",  val: "4 shells placed on entry" },
    { key: "CORAL TILES", val: "~2% of grid on entry" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
  6: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "FISH",        val: "MACKEREL (1×1, every 2 turns) · GARIBALDI (1×1, every turn) · OARFISH (2×2, every 3 turns)" },
    { key: "KELP",        val: "COLUMNS DISTRIBUTED ACROSS THE WIDTH — PLAYER CAN STAND INSIDE" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
  7: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "PEARLS",      val: "4 PURPLE PEARLS ON BOARD AT ALL TIMES — RESPAWN IMMEDIATELY ON COLLECT" },
    { key: "EELS",        val: "5 ELECTRIC EELS — 5 SEGMENTS EACH — MOVE EVERY PLAYER TURN" },
    { key: "SHOCK",       val: "TOUCH AN EEL HEAD OR BODY = 2 SECONDS PARALYSIS — ENEMIES TICK ONCE PER SECOND" },
    { key: "EEL AVOID",   val: "EEL HEADS STAY ≥ 7 MANHATTAN TILES APART — THEY SPREAD ACROSS THE BOARD" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
};

// ── Plain-text summaries ──────────────────────────────────────────────────

export const DEPTH_SUMMARY: Record<number, string> = {
  1: "Open ocean — no obstacles. Collect coins to score, but every coin spawns a new enemy. The purple ammonite appears every 25 moves and is worth 10 pts — but grabbing it spawns a 2×2 mega enemy. Earn 100 pts here to descend.",
  2: "The nursery. Shark eggs drift in the current — collect one for 10 pts, but it hatches a baby shark that follows you everywhere. If an enemy runs into your baby, it gets eaten and you lose 5 pts. Earn 100 pts here to descend.",
  3: "Toxic waters. Barrels of hazardous waste drift through the deep — collect one for 8 pts, but it explodes into a cloud of toxic gas that covers the board. Enemies and the player are hidden inside the clouds. Earn 100 pts here to descend.",
  4: "The Arctic. Ice patches scattered across the board — step onto one and you slide until you hit a wall or normal floor. Collect the frozen fish for 5 pts, but it turns the tile to ice and spawns an enemy. The board gets icier as you play. Don't slide into anything that wants to kill you.",
  5: "The reef reshapes the board. A new coral shell appears every 15 moves (max 6 at once). Hitting one converts it to a permanent barrier and spawns an enemy. Earn 100 pts here to descend.",
  6: "The Busy Pacific. Neutral fish drift through open water — mackerel dart fast, garibaldi block every turn, and massive oarfish claim a 2×2 zone. Moving into one cancels your move. Kelp grows from the sea floor — slip inside to hide. Earn 100 pts to descend.",
  7: "The Electric Depths. Five electric eels patrol the grid in sinuous chains — touch one anywhere and you're paralyzed for 2 seconds while enemies keep closing in. Collect the glowing purple pearls for 5 pts each, but every pickup spawns another enemy. Earn 100 pts to descend.",
};

// ── HTML builder ──────────────────────────────────────────────────────────

export function buildRulesHTML(depth: number): string {
  const meta    = DEPTH_META[depth] ?? DEPTH_META[1];
  const c       = meta.color;
  const summary = DEPTH_SUMMARY[depth] ?? "";

  const summaryHtml = summary
    ? `<div class="depth-summary"><p class="depth-summary-text">${summary}</p></div>` : "";

  const rulesHtml = (DEPTH_RULES[depth] ?? []).map(r => {
    const kc = r.keyColor ?? c;
    return `<div class="depth-rule-row">
      <span class="depth-rule-key" style="color:${kc}">${r.key}</span>
      <span class="depth-rule-val">${r.val}</span>
    </div>`;
  }).join("");

  const paramsHtml = (DEPTH_PARAMS[depth] ?? []).map(p =>
    `<div class="depth-rule-row">
      <span class="depth-rule-key" style="color:${c}">${p.key}</span>
      <span class="depth-rule-val">${p.val}</span>
    </div>`,
  ).join("");

  const enemyAiHtml = `
    <div class="depth-rule-row" style="grid-template-columns:1fr;margin-top:0.6rem">
      <span class="depth-rule-val" style="font-size:1.4rem;opacity:0.85">
        Each enemy finds the shortest Manhattan-distance path to the shark and steps along it.
        They move every 2nd player move. Enemies act independently — they converge from multiple
        directions as the board fills.
      </span>
    </div>`;

  const detailsHtml = `
    <details class="depth-details">
      <summary class="depth-details-toggle">▶ FULL DETAILS</summary>
      <div class="depth-details-body">
        <div class="depth-rules-section-label" style="margin-bottom:0.6rem">LEVEL PARAMETERS</div>
        ${paramsHtml}
        <div class="depth-rules-section-label" style="margin-top:1rem;margin-bottom:0.3rem">ENEMY AI</div>
        ${enemyAiHtml}
      </div>
    </details>`;

  return `${summaryHtml}
    <div class="depth-rules-section-label">► RULES</div>
    ${rulesHtml}
    ${detailsHtml}`;
}
