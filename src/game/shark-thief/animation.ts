// ===== Animation =====  →  SharkNode.swift / GameScene.swift animation loops

import { ANIM_DURATION } from "./config";
import { gs } from "./state";
import { draw } from "./renderers";

// ── Smooth shark movement animation ──────────────────────────────────────

export function startSharkAnim(): void {
  gs.sharkFromX = gs.sharkVisualX;
  gs.sharkFromY = gs.sharkVisualY;
  gs.animStartTime = performance.now();
  if (gs.animRafId) cancelAnimationFrame(gs.animRafId);
  gs.animRafId = requestAnimationFrame(tickAnim);
}

function tickAnim(now: number): void {
  const t    = Math.min(1, (now - gs.animStartTime) / ANIM_DURATION);
  const ease = 1 - (1 - t) * (1 - t); // ease-out quadratic
  gs.sharkVisualX = gs.sharkFromX + (gs.shark.x - gs.sharkFromX) * ease;
  gs.sharkVisualY = gs.sharkFromY + (gs.shark.y - gs.sharkFromY) * ease;
  draw();
  if (t < 1) {
    gs.animRafId = requestAnimationFrame(tickAnim);
  } else {
    gs.animRafId = null;
  }
}

// ── Bounce animation — shark nudges toward a blocked cell then rebounds ───
// Used when running into a coral shell (which then hardens into a barrier).

export function startBounceAnim(targetX: number, targetY: number): void {
  gs.bounceTargetX = targetX;
  gs.bounceTargetY = targetY;
  gs.sharkFromX = gs.sharkVisualX = gs.shark.x;
  gs.sharkFromY = gs.sharkVisualY = gs.shark.y;
  gs.animStartTime = performance.now();
  if (gs.animRafId) cancelAnimationFrame(gs.animRafId);
  gs.animRafId = requestAnimationFrame(tickBounceAnim);
}

function tickBounceAnim(now: number): void {
  const BOUNCE_DURATION = 180; // ms — short, subtle
  const t    = Math.min(1, (now - gs.animStartTime) / BOUNCE_DURATION);
  const push = Math.sin(t * Math.PI) * 0.40; // 0 → peak → 0
  gs.sharkVisualX = gs.sharkFromX + (gs.bounceTargetX - gs.sharkFromX) * push;
  gs.sharkVisualY = gs.sharkFromY + (gs.bounceTargetY - gs.sharkFromY) * push;
  draw();
  if (t < 1) {
    gs.animRafId = requestAnimationFrame(tickBounceAnim);
  } else {
    gs.sharkVisualX = gs.sharkFromX;
    gs.sharkVisualY = gs.sharkFromY;
    gs.animRafId = null;
  }
}

// ── Water shimmer — caustic light flickers on ocean tiles ────────────────

export function tickShimmer(): void {
  if (!gs.shimmerMode || gs.gameOver) { gs.shimmerRafId = null; return; }
  let dirty = false;
  for (let i = 0; i < gs.shimmerIntensity.length; i++) {
    if (gs.shimmerSpeed[i] !== 0) {
      gs.shimmerIntensity[i] = Math.max(0, Math.min(1, gs.shimmerIntensity[i] + gs.shimmerSpeed[i]));
      if (gs.shimmerIntensity[i] >= 1)      gs.shimmerSpeed[i] = -0.04;
      else if (gs.shimmerIntensity[i] <= 0) gs.shimmerSpeed[i] = 0;
      dirty = true;
    } else if (Math.random() < 0.0018) {
      gs.shimmerSpeed[i] = 0.032 + Math.random() * 0.02;
      dirty = true;
    }
  }
  if (dirty) draw();
  gs.shimmerRafId = requestAnimationFrame(tickShimmer);
}
