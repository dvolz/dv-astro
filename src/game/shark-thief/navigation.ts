// ===== ScreenManager / NavigationView =====  →  RootNavigationView.swift

import { gs } from "./state";
import { GRID } from "./config";
import { getHighScore, getSave, getMaxDepth, clearSave, saveGame } from "./persistence";
import { initRenderer } from "./renderers";
import { fetchLeaderboard } from "./leaderboard";
import { init, loadGame, initAtDepth, setShowGameScreen } from "./engine";
import { openDepthInfo } from "./depth-info/scenes";

// ── Screen switching ──────────────────────────────────────────────────────

type ScreenId = "splash" | "main-menu" | "game" | "leaderboard" | "settings";

export function showScreen(id: ScreenId): void {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`screen-${id}`);
  if (target) target.classList.add("active");
  if (id === "main-menu") refreshMenuState();
}

// ── Menu state helpers ────────────────────────────────────────────────────

export function refreshMenuBest(): void {
  document.getElementById("menuBestScore")!.textContent = String(getHighScore());
}

export function refreshMenuState(): void {
  refreshMenuBest();
  const save     = getSave();
  const maxDepth = getMaxDepth();

  const continueBtn  = document.getElementById("menuContinueBtn")!;
  const abandonBtn   = document.getElementById("menuAbandonBtn")!;
  const depthSubBtns = document.getElementById("depthSubBtns")!;
  const playBtn      = document.getElementById("menuPlayBtn")!;

  (continueBtn as HTMLElement).style.display = save ? "block" : "none";
  (abandonBtn  as HTMLElement).style.display = save ? "block" : "none";

  depthSubBtns.classList.remove("expanded");
  playBtn.classList.toggle("pixel-btn-dive-toggle", maxDepth >= 2);
  playBtn.classList.remove("open");

  if (maxDepth >= 2) {
    let html = `<button class="pixel-btn pixel-btn-sub" data-depth="1">DEPTH 1 — FRESH</button>`;
    html    += `<button class="pixel-btn pixel-btn-sub pixel-btn-d2" data-depth="2">DEPTH 2 — REEF</button>`;
    if (maxDepth >= 3)
      html  += `<button class="pixel-btn pixel-btn-sub pixel-btn-d3" data-depth="3">DEPTH 3 — NURSERY</button>`;
    if (maxDepth >= 4)
      html  += `<button class="pixel-btn pixel-btn-sub pixel-btn-d4" data-depth="4">DEPTH 4 — ARCTIC</button>`;
    if (maxDepth >= 5)
      html  += `<button class="pixel-btn pixel-btn-sub pixel-btn-d5" data-depth="5">DEPTH 5 — ABYSS</button>`;
    depthSubBtns.innerHTML = html;
    depthSubBtns.querySelectorAll("[data-depth]").forEach(btn => {
      btn.addEventListener("click", () => {
        const depth = parseInt((btn as HTMLElement).dataset.depth || "1", 10);
        depthSubBtns.classList.remove("expanded");
        playBtn.classList.remove("open");
        initAtDepth(depth);
      });
    });
  } else {
    depthSubBtns.innerHTML = "";
  }
}

// ── Wire up all navigation event listeners ────────────────────────────────

export function initNavigation(): void {
  // Tell engine.ts which function to call when it needs to show the game screen
  setShowGameScreen(() => showScreen("game"));

  // Splash → Main Menu (auto)
  setTimeout(() => showScreen("main-menu"), 1200);

  // Main Menu buttons
  document.getElementById("menuContinueBtn")!.addEventListener("click", () => {
    const save = getSave();
    if (!save) return;
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    gs.CELL = canvas.width / GRID;
    initRenderer(canvas);
    showScreen("game");
    loadGame(save);
    fetchLeaderboard();
  });

  document.getElementById("menuAbandonBtn")!.addEventListener("click", () => {
    clearSave();
    refreshMenuState();
  });

  document.getElementById("menuPlayBtn")!.addEventListener("click", () => {
    const maxDepth = getMaxDepth();
    if (maxDepth >= 2) {
      const subBtns = document.getElementById("depthSubBtns")!;
      const playBtn = document.getElementById("menuPlayBtn")!;
      const isOpen  = subBtns.classList.toggle("expanded");
      playBtn.classList.toggle("pixel-btn-dive-toggle", true);
      playBtn.classList.toggle("open", isOpen);
    } else {
      const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
      gs.CELL = canvas.width / GRID;
      initRenderer(canvas);
      showScreen("game");
      init();
      fetchLeaderboard();
    }
  });

  document.getElementById("menuLeaderboardBtn")!.addEventListener("click", () => {
    fetchLeaderboard();
    showScreen("leaderboard");
  });

  document.getElementById("menuSettingsBtn")!.addEventListener("click", () => showScreen("settings"));

  // Leaderboard
  document.getElementById("lbBackBtn")!.addEventListener("click", () => showScreen("main-menu"));

  document.querySelectorAll<HTMLButtonElement>(".lb-tab:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      if (cat) fetchLeaderboard(cat);
    });
    btn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
    });
  });

  // Shark Score formula popup
  document.getElementById("sharkScorePopupClose")!.addEventListener("click", () => {
    document.getElementById("sharkScorePopup")!.classList.remove("visible");
  });
  document.getElementById("sharkScorePopup")!.addEventListener("click", e => {
    if (e.target === e.currentTarget)
      (e.currentTarget as HTMLElement).classList.remove("visible");
  });

  // HUD depth button → open depth info modal
  document.getElementById("hudDepthBtn")!.addEventListener("click", () => {
    openDepthInfo(gs.currentDepth);
  });

  // HUD menu button (mid-game → main menu)
  document.getElementById("hudMenuBtn")!.addEventListener("click", () => {
    if (!gs.gameOver) saveGame();
    gs.gameOver = true;
    const label = document.getElementById("menuDepthLabel")!;
    label.textContent = gs.currentDepth > 1 ? `REACHED DEPTH ${gs.currentDepth}` : "";
    showScreen("main-menu");
  });

  // Game Over buttons
  document.getElementById("playAgainBtn")!.addEventListener("click", () => init());
  document.getElementById("gameOverMenuBtn")!.addEventListener("click", () => {
    const label = document.getElementById("menuDepthLabel")!;
    label.textContent = gs.currentDepth > 1 ? `REACHED DEPTH ${gs.currentDepth}` : "";
    showScreen("main-menu");
  });

  // Settings back
  document.getElementById("settingsBackBtn")!.addEventListener("click", () => showScreen("main-menu"));
}
