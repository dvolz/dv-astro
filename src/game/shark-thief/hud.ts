// ===== HUD =====  →  HUDView.swift


// ── DOM refs (lazy-queried; always available when game screen is active) ──

export const hudScore     = () => document.getElementById("hudScore")!;
export const hudTimeEl    = () => document.getElementById("hudTime")!;
export const hudLvTime    = () => document.getElementById("hudLvTime")!;
export const hudDepthBtn  = () => document.getElementById("hudDepthBtn")!;
export const hudDepthLabel = () => document.getElementById("hudDepthLabel")!;

// Cache them once on first call — avoids per-frame DOM lookups.
let _hudScore:     HTMLElement | null = null;
let _hudTimeEl:    HTMLElement | null = null;
let _hudLvTime:    HTMLElement | null = null;
let _hudDepthBtn:  HTMLElement | null = null;
let _hudDepthLabel: HTMLElement | null = null;

export function getHudScore():      HTMLElement { return _hudScore      ??= document.getElementById("hudScore")!; }

type ScorePulseMode = "normal" | "special" | "penalty" | "none";

export function updateHudScore(score: number, mode: ScorePulseMode = "normal"): void {
  const el = getHudScore();
  el.textContent = String(score);
  if (mode === "none") return;
  el.classList.remove("score-pulse", "score-pulse-special", "score-pulse-penalty");
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add(
    mode === "special" ? "score-pulse-special" :
    mode === "penalty" ? "score-pulse-penalty" :
    "score-pulse"
  );
}
export function getHudTimeEl():     HTMLElement { return _hudTimeEl     ??= document.getElementById("hudTime")!; }
export function getHudLvTime():     HTMLElement { return _hudLvTime     ??= document.getElementById("hudLvTime")!; }
export function getHudDepthBtn():   HTMLElement { return _hudDepthBtn   ??= document.getElementById("hudDepthBtn")!; }
export function getHudDepthLabel(): HTMLElement { return _hudDepthLabel ??= document.getElementById("hudDepthLabel")!; }

// ── Clock ─────────────────────────────────────────────────────────────────

let hudClockInterval: ReturnType<typeof setInterval> | null = null;

export function formatClockSec(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function startHudClock(
  getGameStartTime:  () => number,
  getLevelStartTime: () => number,
  isGameOver:        () => boolean,
): void {
  stopHudClock();
  hudClockInterval = setInterval(() => {
    if (isGameOver()) return;
    const nowMs = performance.now();
    getHudTimeEl().textContent  = formatClockSec(Math.floor((nowMs - getGameStartTime())  / 1000));
    getHudLvTime().textContent  = formatClockSec(Math.floor((nowMs - getLevelStartTime()) / 1000));
  }, 500);
}

export function stopHudClock(): void {
  if (hudClockInterval) { clearInterval(hudClockInterval); hudClockInterval = null; }
}

// ── Depth indicator ───────────────────────────────────────────────────────

export function updateHudDepth(depth: number): void {
  getHudDepthLabel().textContent = `DEPTH ${depth}`;
  getHudDepthBtn().className = `hud-btn hud-depth-btn${depth > 1 ? ` depth-${depth}` : ""}`;
}
