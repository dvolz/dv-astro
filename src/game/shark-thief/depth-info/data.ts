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
    { key: "ENEMIES",   val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",     val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "CORAL",     val: "+5 PTS — CONVERTS TO BARRIER — SPAWNS 1 ENEMY — NEW SHELL EVERY 15 MOVES", keyColor: "#daa070" },
    { key: "BARRIERS",  val: "PERMANENT IMPASSABLE WALLS" },
    { key: "ON ENTRY",  val: "ENEMIES RESET TO 5 FARTHEST FROM YOU" },
    { key: "DESCEND",   val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  3: [
    { key: "ENEMIES",    val: "MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",      val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "EGG",        val: "+10 PTS — HATCHES BABY SHARK — SPAWNS 1 ENEMY — 1 EGG ON BOARD AT ALL TIMES", keyColor: "#e06fa0" },
    { key: "BABY SHARK", val: "FOLLOWS YOU — IF AN ENEMY EATS IT, YOU LOSE 5 PTS", keyColor: "#e06fa0" },
    { key: "BLOOD",      val: "CELL WHERE BABY WAS EATEN TURNS RED — FADES OVER 10 MOVES" },
    { key: "ON ENTRY",   val: "10 CLOSEST ENEMIES DISSOLVE — OPEN WATER, NO CORAL" },
    { key: "DESCEND",    val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  4: [
    { key: "ENEMIES",      val: "5 ON ENTRY — MOVE 1 STEP EVERY 2 PLAYER MOVES" },
    { key: "COINS",        val: "+1 PT — SPAWNS 1 ENEMY" },
    { key: "FROZEN FISH",  val: "+5 PTS — SPAWNS 1 ENEMY — CONVERTS TILE TO ICE — 1 FISH ON BOARD AT ALL TIMES", keyColor: "#7fd8f0" },
    { key: "ICE PATCHES",  val: "STEPPING ONTO ICE CAUSES YOU TO SLIDE UNTIL YOU HIT A WALL OR FLOOR" },
    { key: "SLIDE DEATH",  val: "SLIDING INTO AN ENEMY AT ANY POINT — INCLUDING THE FRESHLY SPAWNED ONE — IS DEATH" },
    { key: "DESCEND",      val: "EARN 100 PTS IN THIS DEPTH" },
  ],
  5: [
    { key: "STATUS",    val: "THIS DEPTH IS NOT YET CHARTED." },
    { key: "LEVIATHAN", val: "A 3×3 MEGA ENEMY — MOVE RATE TBD", keyColor: "#9d6fe0" },
    { key: "SHELL",     val: "PIECE AND PARAMETERS TBD" },
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
    { key: "SHELL SPAWN", val: "1 new coral shell every 15 moves — max 6 on board" },
    { key: "SHELL INIT",  val: "4 shells placed on entry" },
    { key: "CORAL TILES", val: "~2% of grid on entry" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
  ],
  3: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "EGG SPAWN",   val: "1 egg always on board — respawns immediately on collection" },
    { key: "CORAL TILES", val: "0% — open water" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES" },
    { key: "BABY MOVE",   val: "1 STEP EVERY PLAYER MOVE — TRAILS 1 CELL BEHIND" },
  ],
  4: [
    { key: "GRID",        val: "25 × 25 CELLS" },
    { key: "COIN RATE",   val: "0.00025 per cell per move" },
    { key: "COIN INIT",   val: "5% of cells on start" },
    { key: "FISH SPAWN",  val: "1 frozen fish on board at all times — respawns immediately on collection" },
    { key: "ICE PATCHES", val: "5 patches seeded at level start — more added as fish are collected" },
    { key: "ENEMY SPAWN", val: "≥ 5 CELLS FROM SHARK — NOT ON ICE" },
    { key: "ENEMY MOVE",  val: "1 STEP EVERY 2 PLAYER MOVES — ENEMIES ALSO SLIDE ON ICE" },
  ],
  5: [],
};

// ── Plain-text summaries ──────────────────────────────────────────────────

export const DEPTH_SUMMARY: Record<number, string> = {
  1: "Open ocean — no obstacles. Collect coins to score, but every coin spawns a new enemy. The purple ammonite appears every 25 moves and is worth 10 pts — but grabbing it spawns a 2×2 mega enemy. Earn 100 pts here to descend.",
  2: "The reef reshapes the board. A new coral shell appears every 15 moves (max 6 at once). Hitting one converts it to a permanent barrier and spawns an enemy. Earn 100 pts here to descend.",
  3: "The nursery. Shark eggs drift in the current — collect one for 10 pts, but it hatches a baby shark that follows you everywhere. If an enemy runs into your baby, it gets eaten and you lose 5 pts. Earn 100 pts here to descend.",
  4: "The Arctic. Ice patches scattered across the board — step onto one and you slide until you hit a wall or normal floor. Collect the frozen fish for 5 pts, but it turns the tile to ice and spawns an enemy. The board gets icier as you play. Don't slide into anything that wants to kill you.",
  5: "Uncharted territory. A 3×3 Leviathan enemy lurks somewhere in the deep. Proceed at your own risk.",
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
