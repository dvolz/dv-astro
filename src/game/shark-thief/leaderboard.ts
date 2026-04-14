// ===== LeaderboardService =====  →  GameCenterService.swift

import { gs } from "./state";
import { calcSharkScore } from "./persistence";

export type LbEntry = {
  name: string;
  score: number;
  date?: string;
  totalTimeMs?: number;
  levelTimes?: number[];
  sharkScore?: number;
};

export const MOCK_SCORES: LbEntry[] = [
  { name: "SharkMaster",  score: 285, date: "2026-03-14T09:23:00Z", totalTimeMs:  78400, levelTimes: [42100, 36300], sharkScore: 1036 },
  { name: "FinFrenzy",    score: 240, date: "2026-03-13T22:15:00Z", totalTimeMs:  91200, levelTimes: [53000, 38200], sharkScore:  631 },
  { name: "OceanKing",    score: 210, date: "2026-03-14T14:02:00Z", totalTimeMs:  67500, levelTimes: [67500],        sharkScore:  653 },
  { name: "DeepDiver",    score: 190, date: "2026-03-12T18:45:00Z", totalTimeMs:  84300, levelTimes: [48200, 36100], sharkScore:  428 },
  { name: "WaveCatcher",  score: 160, date: "2026-03-14T11:30:00Z", totalTimeMs:  55100, levelTimes: [55100],        sharkScore:  465 },
  { name: "CoralQueen",   score: 130, date: "2026-03-11T20:10:00Z", totalTimeMs:  48700, levelTimes: [48700],        sharkScore:  347 },
  { name: "TideRunner",   score: 105, date: "2026-03-13T16:55:00Z", totalTimeMs:  39200, levelTimes: [39200],        sharkScore:  281 },
  { name: "ReefRaider",   score:  80, date: "2026-03-10T08:40:00Z", totalTimeMs:  31500, levelTimes: [31500],        sharkScore:  203 },
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
  document.querySelectorAll<HTMLButtonElement>(".lb-tab").forEach(btn => {
    const active = btn.dataset.category === category;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
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

  const isTime  = ["d1_time","d2_time","d3_time","d4_time"].includes(category);
  const isShark = category === "shark_score";
  const depthIdx = category === "d1_time" ? 0 : category === "d2_time" ? 1 : category === "d3_time" ? 2 : 3;

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
  const medalCls = ["medal-gold", "medal-silver", "medal-bronze"];

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
    const rank = i < 3 ? `<span class="medal ${medalCls[i]}">${i + 1}</span>` : `${i + 1}`;
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
    return `<tr${hi}><td class="lb-rank">${rank}</td><td>${esc(s.name)}</td>${valueCell}${metaCell}</tr>`;
  }).join("");
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
