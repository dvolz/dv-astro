// ===== ScreenManager / NavigationView =====  →  RootNavigationView.swift

import { gs } from "./state";
import { GRID } from "./config";
import { DEPTH_META } from "./config";
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

// ── Depth Select popup ────────────────────────────────────────────────────

let _pendingDepth: number | null = null;

function openDepthSelect(): void {
  _pendingDepth = null;
  document.getElementById("depthSelectConfirm")!.classList.remove("visible");
  buildDepthSelectButtons();
  document.getElementById("depthSelectOverlay")!.classList.add("visible");
}

function closeDepthSelect(): void {
  document.getElementById("depthSelectOverlay")!.classList.remove("visible");
  _pendingDepth = null;
}

function buildDepthSelectButtons(): void {
  const maxDepth = getMaxDepth();
  const container = document.getElementById("depthSelectBtns")!;

  const depths: Array<{ depth: number; cls: string; label: string }> = [
    { depth: 1, cls: "",       label: "DEPTH 1 — THE SHALLOWS"  },
    { depth: 2, cls: "ds-d2",  label: "DEPTH 2 — THE NURSERY"   },
    { depth: 3, cls: "ds-d3",  label: "DEPTH 3 — TOXIC"         },
    { depth: 4, cls: "ds-d4",  label: "DEPTH 4 — THE ARCTIC"    },
    { depth: 5, cls: "ds-d5",  label: "DEPTH 5 — THE REEF"      },
    { depth: 6, cls: "ds-d6",  label: "DEPTH 6 — BUSY PACIFIC"  },
    { depth: 7, cls: "ds-d7",  label: "DEPTH 7 — THE ABYSS"     },
  ];

  container.innerHTML = depths
    .filter(d => d.depth <= maxDepth)
    .map(d => `<button class="${d.cls}" data-depth="${d.depth}">${d.label}</button>`)
    .join("");

  container.querySelectorAll<HTMLButtonElement>("[data-depth]").forEach(btn => {
    btn.addEventListener("click", () => {
      const depth = parseInt(btn.dataset.depth!, 10);
      if (getSave()) {
        _pendingDepth = depth;
        document.getElementById("depthSelectConfirm")!.classList.add("visible");
      } else {
        closeDepthSelect();
        startAtDepth(depth);
      }
    });
  });
}

function startAtDepth(depth: number): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  gs.CELL = canvas.width / GRID;
  initRenderer(canvas);
  setShowGameScreen(() => showScreen("game"));
  showScreen("game");
  initAtDepth(depth);
  fetchLeaderboard();
}

// ── Menu state helpers ────────────────────────────────────────────────────

export function refreshMenuBest(): void {
  document.getElementById("menuBestScore")!.textContent = String(getHighScore());
}

export function refreshMenuState(): void {
  refreshMenuBest();
  const save     = getSave();
  const maxDepth = getMaxDepth();

  const continueBtn      = document.getElementById("menuContinueBtn")   as HTMLElement;
  const abandonBtn       = document.getElementById("menuAbandonBtn")     as HTMLElement;
  const depthSelectBtn   = document.getElementById("menuDepthSelectBtn") as HTMLElement;
  const newDiveConfirm   = document.getElementById("menuNewDiveConfirm")!;

  continueBtn.style.display    = save ? "block" : "none";
  abandonBtn.style.display     = save ? "block" : "none";
  depthSelectBtn.style.display = maxDepth >= 2 ? "block" : "none";

  // Reset the new-dive confirm if it was open
  newDiveConfirm.classList.remove("visible");
}

// ── Wire up all navigation event listeners ────────────────────────────────

export function initNavigation(): void {
  setShowGameScreen(() => showScreen("game"));

  // Splash → Main Menu (auto)
  setTimeout(() => showScreen("main-menu"), 1200);

  // ── Continue ────────────────────────────────────────────────────────────
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

  // ── New Dive ─────────────────────────────────────────────────────────────
  document.getElementById("menuNewDiveBtn")!.addEventListener("click", () => {
    if (getSave()) {
      document.getElementById("menuNewDiveConfirm")!.classList.add("visible");
    } else {
      launchNewGame();
    }
  });

  document.getElementById("menuNewDiveYes")!.addEventListener("click", () => {
    document.getElementById("menuNewDiveConfirm")!.classList.remove("visible");
    launchNewGame();
  });

  document.getElementById("menuNewDiveNo")!.addEventListener("click", () => {
    document.getElementById("menuNewDiveConfirm")!.classList.remove("visible");
  });

  function launchNewGame(): void {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    gs.CELL = canvas.width / GRID;
    initRenderer(canvas);
    showScreen("game");
    init();
    fetchLeaderboard();
  }

  // ── Depth Select ─────────────────────────────────────────────────────────
  document.getElementById("menuDepthSelectBtn")!.addEventListener("click", openDepthSelect);

  document.getElementById("depthSelectClose")!.addEventListener("click", closeDepthSelect);

  document.getElementById("depthSelectOverlay")!.addEventListener("click", e => {
    if (e.target === e.currentTarget) closeDepthSelect();
  });

  document.getElementById("depthSelectConfirmYes")!.addEventListener("click", () => {
    if (_pendingDepth !== null) {
      const depth = _pendingDepth;
      closeDepthSelect();
      startAtDepth(depth);
    }
  });

  document.getElementById("depthSelectConfirmNo")!.addEventListener("click", () => {
    _pendingDepth = null;
    document.getElementById("depthSelectConfirm")!.classList.remove("visible");
  });

  // ── Leaderboard ──────────────────────────────────────────────────────────
  document.getElementById("menuLeaderboardBtn")!.addEventListener("click", () => {
    fetchLeaderboard();
    showScreen("leaderboard");
  });

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

  // ── Settings ─────────────────────────────────────────────────────────────
  document.getElementById("menuSettingsBtn")!.addEventListener("click", () => showScreen("settings"));
  document.getElementById("settingsBackBtn")!.addEventListener("click", () => showScreen("main-menu"));

  // ── Abandon ───────────────────────────────────────────────────────────────
  document.getElementById("menuAbandonBtn")!.addEventListener("click", () => {
    clearSave();
    refreshMenuState();
  });

  // ── Shark Score formula popup ─────────────────────────────────────────────
  document.getElementById("sharkScorePopupClose")!.addEventListener("click", () => {
    document.getElementById("sharkScorePopup")!.classList.remove("visible");
  });
  document.getElementById("sharkScorePopup")!.addEventListener("click", e => {
    if (e.target === e.currentTarget)
      (e.currentTarget as HTMLElement).classList.remove("visible");
  });

  // ── HUD depth button → depth info modal ──────────────────────────────────
  document.getElementById("hudDepthBtn")!.addEventListener("click", () => {
    openDepthInfo(gs.currentDepth);
  });

  // ── HUD menu button ───────────────────────────────────────────────────────
  document.getElementById("hudMenuBtn")!.addEventListener("click", () => {
    if (!gs.gameOver) saveGame();
    gs.gameOver = true;
    const label = document.getElementById("menuDepthLabel")!;
    label.textContent = gs.currentDepth > 1 ? `REACHED DEPTH ${gs.currentDepth}` : "";
    showScreen("main-menu");
  });

  // ── Game Over buttons ─────────────────────────────────────────────────────
  document.getElementById("playAgainBtn")!.addEventListener("click", () => init());
  document.getElementById("gameOverMenuBtn")!.addEventListener("click", () => {
    const label = document.getElementById("menuDepthLabel")!;
    label.textContent = gs.currentDepth > 1 ? `REACHED DEPTH ${gs.currentDepth}` : "";
    showScreen("main-menu");
  });
}
