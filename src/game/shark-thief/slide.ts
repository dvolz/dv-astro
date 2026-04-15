// ===== Ice Slide Resolver =====
// Shared by engine.ts and ai.ts — extracted to avoid circular imports.

import { GRID } from "./config";
import { gs } from "./state";

/**
 * Resolves an ice slide starting from (startX, startY) in direction (dx, dy).
 * Returns the terminal cell — last valid cell before hitting a wall, coral,
 * or a non-ice cell.
 *
 * The starting cell itself is NOT re-checked — the caller already validated it.
 * Each intermediate cell is yielded to the `onCell` callback so the caller can
 * check for pickups, enemy contact, etc.
 *
 * Returns { x, y } of the terminal position.
 */
export function resolveSlide(
  startX: number, startY: number,
  dx: number, dy: number,
  onCell?: (x: number, y: number) => "stop" | "continue",
): { x: number; y: number } {
  let x = startX, y = startY;
  while (true) {
    const nx = x + dx, ny = y + dy;
    // Hit board edge
    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) break;
    // Hit coral (Depth 2 barrier — not present in Arctic, but guard anyway)
    if (gs.coral[ny]?.[nx]) break;
    // Advance
    x = nx; y = ny;
    // Per-cell callback (check enemy contact, pickups if mid-slide collection is on)
    if (onCell) {
      const result = onCell(x, y);
      if (result === "stop") break;
    }
    // Stop if we've left ice — we're at the terminal
    if (!gs.iceCells[y][x]) break;
  }
  return { x, y };
}
