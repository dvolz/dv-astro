// ===== LeaderboardService =====  →  GameCenterService.swift

import { gs } from "./state";
import { calcSharkScore, getMaxDepth } from "./persistence";

export type LbEntry = {
  name: string;
  score: number;
  date?: string;
  totalTimeMs?: number;
  levelTimes?: number[];
  sharkScore?: number;
};

export const MOCK_SCORES: LbEntry[] = [
  { name: "SharkMaster",  score: 285, date: "2026-03-14T09:23:00Z", totalTimeMs:  78400, levelTimes: [42100, 36300, 51200, 44800, 38900, 67400, 91200], sharkScore: 1036 },
  { name: "FinFrenzy",    score: 240, date: "2026-03-13T22:15:00Z", totalTimeMs:  91200, levelTimes: [53000, 38200, 48900, 41300, 55100],               sharkScore:  631 },
  { name: "OceanKing",    score: 210, date: "2026-03-14T14:02:00Z", totalTimeMs:  67500, levelTimes: [67500, 52000, 61800],                              sharkScore:  653 },
  { name: "DeepDiver",    score: 190, date: "2026-03-12T18:45:00Z", totalTimeMs:  84300, levelTimes: [48200, 36100, 44700, 38500],                       sharkScore:  428 },
  { name: "WaveCatcher",  score: 160, date: "2026-03-14T11:30:00Z", totalTimeMs:  55100, levelTimes: [55100, 49300],                                     sharkScore:  465 },
  { name: "CoralQueen",   score: 130, date: "2026-03-11T20:10:00Z", totalTimeMs:  48700, levelTimes: [48700],                                            sharkScore:  347 },
  { name: "TideRunner",   score: 105, date: "2026-03-13T16:55:00Z", totalTimeMs:  39200, levelTimes: [39200],                                            sharkScore:  281 },
  { name: "ReefRaider",   score:  80, date: "2026-03-10T08:40:00Z", totalTimeMs:  31500, levelTimes: [31500],                                            sharkScore:  203 },
];

export let activeLeaderboardTab = "high_score";
export let lastSubmittedDate: string | null = null;

const IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";

export async function fetchLeaderboard(category: string = activeLeaderboardTab): Promise<void> {
  activeLeaderboardTab = category;
  updateTabUI(category);
  if (IS_LOCAL) { renderLeaderboard(MOCK_SCORES, category); return; }
  try {
    const res = await fetch(`/api/scores?map=shark-thief-v3&category=${category}`);
    if (!res.ok) throw new Error("failed");
    const scores: LbEntry[] = await res.json();
    renderLeaderboard(scores, category);
  } catch {
    renderLeaderboard([], category);
  }
}

export function updateTabUI(category: string): void {
  const isDepthTime = /^d[1-7]_time$/.test(category);
  document.querySelectorAll<HTMLButtonElement>(".lb-tab").forEach(btn => {
    const cat = btn.dataset.category;
    const active = isDepthTime ? cat === "depth_times" : cat === category;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

export function showDepthTimePanel(): void {
  const panel = document.getElementById("lbDepthPanel")!;
  panel.removeAttribute("hidden");
  updateTabUI("d1_time"); // activates the DEPTH TIMES tab button visually
  buildDepthTimeBtns();
}

export function hideDepthTimePanel(): void {
  const panel = document.getElementById("lbDepthPanel")!;
  panel.setAttribute("hidden", "");
}

function buildDepthTimeBtns(): void {
  const maxDepth = getMaxDepth();
  const container = document.getElementById("lbDepthBtns")!;

  const depths: Array<{ depth: number; cls: string; label: string }> = [
    { depth: 1, cls: "",       label: "DEPTH 1 — THE SHALLOWS"  },
    { depth: 2, cls: "ds-d2",  label: "DEPTH 2 — THE NURSERY"   },
    { depth: 3, cls: "ds-d3",  label: "DEPTH 3 — TOXIC"         },
    { depth: 4, cls: "ds-d4",  label: "DEPTH 4 — THE ARCTIC"    },
    { depth: 5, cls: "ds-d5",  label: "DEPTH 5 — THE REEF"      },
    { depth: 6, cls: "ds-d6",  label: "DEPTH 6 — BUSY PACIFIC"  },
    { depth: 7, cls: "ds-d7",  label: "DEPTH 7 — THE ABYSS"     },
  ];

  container.innerHTML = depths.map(d => {
    const locked = d.depth > maxDepth ? " lb-depth-locked" : "";
    return `<button class="${d.cls}${locked}" data-depth-time="${d.depth}">${d.label}</button>`;
  }).join("");

  container.querySelectorAll<HTMLButtonElement>("[data-depth-time]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll<HTMLButtonElement>("[data-depth-time]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const depth = parseInt(btn.dataset.depthTime!, 10);
      fetchLeaderboard(`d${depth}_time`);
    });
  });

  // Auto-select max unlocked depth
  const autoDepth = Math.min(maxDepth, 7);
  const autoBtn = container.querySelector<HTMLButtonElement>(`[data-depth-time="${autoDepth}"]`);
  if (autoBtn) {
    autoBtn.classList.add("active");
    fetchLeaderboard(`d${autoDepth}_time`);
  }
}

export function drawMedalCanvas(rank: 1 | 2 | 3): HTMLCanvasElement {
  const W = 16, H = 20, SCALE = 2;
  const cvs = document.createElement("canvas");
  cvs.width  = W * SCALE;
  cvs.height = H * SCALE;
  cvs.style.width  = `25px`;
  cvs.style.height = `${Math.round(25 * H / W)}px`;
  cvs.style.imageRendering = "pixelated";
  cvs.style.verticalAlign = "middle";
  const ctx = cvs.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const pal = rank === 1
    ? { hi: "#fff0a0", mid: "#e8c000", dk: "#a07800", edge: "#5c3a00", rib: "#c09000" }
    : rank === 2
    ? { hi: "#e8e8e8", mid: "#b8b8b8", dk: "#707070", edge: "#303030", rib: "#909090" }
    : { hi: "#e09060", mid: "#c07040", dk: "#803a10", edge: "#401800", rib: "#a05828" };

  const NUMS: Record<number, number[][]> = {
    1: [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
    2: [[1,1,0],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
    3: [[1,1,0],[0,0,1],[1,1,0],[0,0,1],[1,1,0]],
  };

  const px = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  // Ribbon: cols 5–10, rows 0–2
  for (let r = 0; r < 3; r++)
    for (let c = 5; c <= 10; c++)
      px(c, r, pal.rib);

  // Circle face: 12 rows at y=3–14, top-left light source
  const rows: [number, number][] = [
    [4,11],[2,13],[1,14],[1,14],[1,14],[1,14],
    [1,14],[1,14],[1,14],[1,14],[2,13],[4,11],
  ];
  rows.forEach(([cs, ce], i) => {
    const y = i + 3;
    for (let x = cs; x <= ce; x++) {
      const isEdge = x === cs || x === ce || i === 0 || i === 11;
      const isHi   = !isEdge && i < 4 && x < 6;
      const isDark = !isEdge && !isHi && (x > 10 || i > 8);
      px(x, y, isEdge ? pal.edge : isHi ? pal.hi : isDark ? pal.dk : pal.mid);
    }
  });

  // Numeral 3×5 at col=6, row=7
  NUMS[rank].forEach((row, ry) =>
    row.forEach((on, cx) => { if (on) px(6 + cx, 7 + ry, pal.edge); })
  );

  return cvs;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day   = d.getDate();
    const year  = String(d.getFullYear()).slice(2);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${month} ${day} '${year} ${hh}:${mm}`;
  } catch { return ""; }
}

export function formatMs(ms: number): string {
  if (!ms) return "—";
  const totalSec = Math.floor(ms / 1000);
  const min    = Math.floor(totalSec / 60);
  const sec    = totalSec % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export function renderLeaderboard(scores: LbEntry[], category: string = "high_score"): void {
  const thead = document.getElementById("lbTableHead")!;
  const tbody = document.getElementById("leaderboardBody")!;

  const isTime  = /^d[1-7]_time$/.test(category);
  const isShark = category === "shark_score";
  const depthIdx = isTime ? parseInt(category[1], 10) - 1 : 0;

  if (isTime) {
    thead.innerHTML = `<tr><th>#</th><th>NAME</th><th>TIME</th><th>DATE</th></tr>`;
  } else if (isShark) {
    thead.innerHTML = `<tr><th>#</th><th>NAME</th><th>SHARK SCORE <button class="lb-shark-help" id="lbSharkHelpBtn" aria-label="Shark Score formula info">[?]</button></th><th>DATE</th></tr>`;
    document.getElementById("lbSharkHelpBtn")?.addEventListener("click", () => {
      document.getElementById("sharkScorePopup")!.classList.add("visible");
    });
  } else {
    thead.innerHTML = `<tr><th>#</th><th>NAME</th><th>HIGH SCORE</th><th>TIME (DATE)</th></tr>`;
  }

  if (!scores.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="lb-empty">NO SCORES YET</td></tr>';
    return;
  }

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  let sorted = [...scores];
  if (isTime) {
    sorted = sorted.filter(s => s.levelTimes && s.levelTimes[depthIdx]);
    sorted.sort((a, b) => (a.levelTimes![depthIdx] ?? Infinity) - (b.levelTimes![depthIdx] ?? Infinity));
  } else if (isShark) {
    sorted.sort((a, b) => (b.sharkScore ?? 0) - (a.sharkScore ?? 0));
  } else {
    sorted.sort((a, b) => b.score - a.score);
  }

  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="lb-empty">NO DATA YET</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map((s, i) => {
    const hi = lastSubmittedDate && s.date === lastSubmittedDate ? ' class="highlight"' : "";
    const dateStr = s.date ? formatDate(s.date) : "";
    const dateOnlyLine = dateStr
      ? `<span style="display:block;white-space:nowrap;font-size:1.6rem">${dateStr}</span>` : "";
    let valueCell: string, metaCell: string;
    if (isTime) {
      valueCell = `<td class="lb-score">${formatMs(s.levelTimes?.[depthIdx] ?? 0)}</td>`;
      metaCell  = `<td class="lb-date">${dateOnlyLine}</td>`;
    } else if (isShark) {
      valueCell = `<td class="lb-score">${s.sharkScore ?? "—"}</td>`;
      metaCell  = `<td class="lb-date">${dateOnlyLine}</td>`;
    } else {
      const timeStr  = s.totalTimeMs ? formatMs(s.totalTimeMs) : "";
      const timeLine = timeStr  ? `<span style="display:block;white-space:nowrap;font-size:1.7rem">${timeStr}</span>` : "";
      const dateLine = dateStr  ? `<span style="display:block;white-space:nowrap;font-size:1.35rem;opacity:0.9">${dateStr}</span>` : "";
      valueCell = `<td class="lb-score">${s.score}</td>`;
      metaCell  = `<td class="lb-date">${timeLine}${dateLine}</td>`;
    }
    const rankCell = i < 3
      ? `<td class="lb-rank" data-medal="${i + 1}"></td>`
      : `<td class="lb-rank">${i + 1}</td>`;
    return `<tr${hi}>${rankCell}<td>${esc(s.name)}</td>${valueCell}${metaCell}</tr>`;
  }).join("");

  tbody.querySelectorAll<HTMLTableCellElement>("td[data-medal]").forEach(td => {
    const r = parseInt(td.dataset.medal!, 10) as 1 | 2 | 3;
    td.appendChild(drawMedalCanvas(r));
  });
}

// ── Score submission UI wiring ────────────────────────────────────────────

const BAD_WORDS = ["ass","asshole","bastard","bitch","bollocks","bullshit","cock","cunt","damn",
  "dick","douche","fag","faggot","fuck","goddamn","jackass","motherfucker","nigger","nigga",
  "piss","prick","pussy","shit","slut","twat","whore","wanker","chink","gook","kike","spic",
  "wetback","retard","tranny","dyke","blowjob","dildo","jizz","porn","tits","penis","vagina",
  "anal","cum","orgasm","nazi","hitler","kkk","rape","molest","pedo","pedophile","fuk","fuc","sh1t","b1tch"];

export function initScoreSubmission(): void {
  const submitScoreBtn  = document.getElementById("submitScoreBtn")!  as HTMLButtonElement;
  const playerNameInput = document.getElementById("playerName")!      as HTMLInputElement;
  const submitStatus    = document.getElementById("submitStatus")!;
  const nameInputRow    = document.getElementById("nameInputRow")!;
  const submitPrompt    = document.getElementById("submitPrompt")!;

  document.getElementById("wantToSubmitBtn")!.addEventListener("click", () => {
    submitPrompt.style.display = "none";
    nameInputRow.classList.add("visible");
    playerNameInput.focus();
  });

  submitScoreBtn.addEventListener("click", async () => {
    const name = playerNameInput.value.trim();
    if (!name) { submitStatus.textContent = "ENTER YOUR NAME"; return; }
    const lower    = name.toLowerCase();
    const stripped = lower.replace(/[^a-z]/g, "");
    if (BAD_WORDS.some(w => lower.includes(w) || stripped.includes(w))) {
      submitStatus.textContent = "INVALID NAME"; return;
    }
    submitScoreBtn.disabled = true;
    submitStatus.textContent = "SUBMITTING...";
    localStorage.setItem("sharkPlayerName", name);
    try {
      const sharkScore = gs.startedFromDepth1 ? calcSharkScore(gs.score, gs.totalTimeMs) : null;
      const payload: Record<string, unknown> = {
        name, score: gs.score, totalTimeMs: gs.totalTimeMs, levelTimes: gs.levelTimes,
      };
      if (sharkScore !== null) payload.sharkScore = sharkScore;
      const res = await fetch(`/api/scores?map=shark-thief-v3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        submitStatus.textContent = "FAILED — TRY AGAIN";
        submitScoreBtn.disabled = false;
        return;
      }
      const scores: LbEntry[] = await res.json();
      const submitted = scores.find(s => s.name === name && s.score === gs.score && s.date);
      lastSubmittedDate = submitted?.date || null;
      renderLeaderboard(scores, activeLeaderboardTab);
      lastSubmittedDate = null;
      submitStatus.textContent = "SCORE SUBMITTED!";
      nameInputRow.classList.remove("visible");
    } catch {
      submitStatus.textContent = "FAILED — TRY AGAIN";
      submitScoreBtn.disabled = false;
    }
  });

  playerNameInput.addEventListener("keydown", e => { if (e.key === "Enter") submitScoreBtn.click(); });
}
