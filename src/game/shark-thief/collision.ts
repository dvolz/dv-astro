// ===== CollisionDetector =====  →  CollisionDetector.swift
// Pure functions — no imports, no state.

/** Returns true if two 2×2 blocks overlap. */
export function bigEnemyOverlaps(
  ax: number, ay: number,
  bx: number, by: number,
): boolean {
  return ax < bx + 2 && ax + 2 > bx && ay < by + 2 && ay + 2 > by;
}

/** Returns true if the shark occupies any cell of the 3×3 leviathan block. */
export function leviathanCollision(
  shark:     { x: number; y: number },
  leviathan: { x: number; y: number } | null,
): boolean {
  if (!leviathan) return false;
  return (
    shark.x >= leviathan.x && shark.x <= leviathan.x + 2 &&
    shark.y >= leviathan.y && shark.y <= leviathan.y + 2
  );
}
