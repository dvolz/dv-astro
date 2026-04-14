# Arctic Level — Implementation Plan

**Feature:** New depth (currently Depth 5, confirm ordering with Zak before hardcoding) introducing ice patches and a frozen fish collectible.

**Status:** Design finalized for frozen fish mechanic and ice physics. Some values (point worth, enemy count on entry) are open — see section at the bottom. Do not invent defaults; ask Zak.

---

## Files to Read First

Before writing anything, read these in order:

- `src/game/shark-thief/engine.ts` — movement resolution, turn loop, collision checks. Ice sliding must integrate here.
- `src/game/shark-thief/state.ts` — board state shape, cell types, entity definitions. You'll need to add ice patch cell type and frozen fish entity.
- `src/game/shark-thief/spawn.ts` — how collectibles are seeded at level start and respawned after collection. Frozen fish follows the same respawn pattern.
- `src/game/shark-thief/config.ts` — depth configs, point values, spawn timers. Arctic depth config goes here.
- `src/game/shark-thief/renderers.ts` — all visual drawing. Ice patches and frozen fish need new render cases.

---

## 1. Ice Patch Mechanics

Ice patches are permanent floor tiles placed at board generation. They are not spawned dynamically during play (except when a frozen fish is collected — see section 2).

### Patch shapes

Four valid shapes only. No other sizes or orientations.

| Shape | Cells covered |
|-------|--------------|
| 1x2   | 2 cells, horizontal or vertical |
| 1x3   | 3 cells, horizontal or vertical |
| 1x4   | 4 cells, horizontal or vertical |
| 2x2   | 4 cells, square |

Orientation (horizontal vs vertical for 1xN shapes) should be randomized per placement, but the shape set is fixed — no freeform scatter.

### Sliding behavior

When any entity (shark or enemy) moves onto an ice cell:

1. Resolve the move normally (check for collision, enemy contact, collectible at destination).
2. If the destination cell is ice, continue sliding in the same direction, one cell at a time, until the entity would move into a wall, an impassable tile (coral if present, board edge), or a non-ice cell.
3. The entity stops at the last valid cell before the blocking tile.
4. Each cell passed during the slide is checked individually: enemy contact = death, collectible = collected (confirm with Zak whether mid-slide collection is intended — see open questions).

Sliding is resolved in a single turn. It is not animated as separate moves — from the engine's perspective it is one extended move, but visually it should look like continuous motion (see visual section).

### Enemy ice rules

Enemies follow identical sliding rules. If an enemy steps onto ice (either from their own move or from being spawned on ice — avoid spawning on ice if possible), it slides. This is intentional — it can fling enemies into or away from the player.

---

## 2. Frozen Fish Collectible

### Steady state

- Exactly 1 frozen fish on the board at all times.
- Respawns immediately after collection (same as shark egg in Depth 3 — replicate that pattern from `spawn.ts`).
- Spawn position: random empty non-ice cell. Do not spawn on ice, on an enemy, or on the player's current cell.

### Collection sequence (exact behavior, in order)

When the shark's movement would land on a frozen fish cell:

1. Award points (value TBD — confirm with Zak).
2. Spawn 1 new enemy (consistent with the design principle: every pickup has a cost).
3. Convert the frozen fish cell into an ice patch (single-cell ice, type `1x1` — this is the only case where a 1x1 ice tile exists).
4. Immediately apply sliding rules: the shark is now on ice, so slide in the direction of the move that collected the fish, until hitting a wall or non-ice cell.
5. Resolve whatever the slide terminal cell contains (enemy = death, collectible = collected if mid-slide collection is confirmed, otherwise only at stop cell).
6. Respawn the frozen fish at a new valid location.

Steps 3 and 4 happen within the same move resolution, before the next enemy turn.

### The 1x1 post-collection ice tile

This tile persists for the rest of the level — it does not disappear. It behaves identically to all other ice tiles. Over the course of a level, the board accumulates these single-cell patches wherever fish have been collected. This is intentional: the board gets progressively icier.

---

## 3. Board Generation

### Ice patch seeding

- Place ice patches during level initialization, before spawning the player, enemies, or fish.
- Patches should be placed using a readable layout — clusters, not uniform scatter. A few larger patches grouped near each other reads better than many tiny patches spread evenly.
- Suggested approach: pick N anchor points, place one shape per anchor, allow small adjacency between patches but avoid full-board coverage.
- N (number of patches) is unspecified — confirm with Zak. Start with something testable: 4-6 patches on a standard grid.

### Hard constraints (do not violate)

1. The player spawn cell must not be ice.
2. The frozen fish spawn cell must not be ice (at level start).
3. Every non-ice cell must be reachable from the player spawn without crossing ice. The board must be fully navigable ignoring ice entirely. Ice is a modifier on movement, not a barrier — it must never block a path when treated as floor.
4. No patch may be placed such that it covers the entire width or height of a corridor (i.e., if the only path between two regions is 1 cell wide, that cell must not be ice — wait, ice is passable, this constraint may not apply. Confirm with Zak whether ice is considered impassable for pathing purposes. If it's always passable, constraint 3 above may be moot. If sliding off the board edge is a kill, treat board edges as walls and this matters more.)

---

## 4. Visual Requirements

### Arctic color palette

The board background and floor tiles should shift to a cold palette for this depth. Reference the depth-info scenes for how other depths change the visual theme (`src/game/shark-thief/depth-info/scenes.ts`).

Suggested palette direction (confirm with Zak):
- Board background: deep cold blue (e.g., `#0a1a2e` or similar dark navy)
- Floor tiles: pale blue-grey instead of ocean sand

### Ice patch rendering

Ice patches must be visually distinct from regular floor at a glance, on a small mobile screen.

Requirements:
- Different fill color from floor — suggest a lighter, more saturated icy blue-white (e.g., `#b8d4e8` or similar)
- White highlight or border on ice cells. A 1px or 2px inner border in white/near-white ensures contrast on both light and dark device screens. This is a mobile contrast concern — do not rely on color alone.
- Ice cells should look "slippery" — a subtle sheen or highlight stripe (e.g., a diagonal white line across the tile) is enough. Keep it readable at 32x32px or smaller.

### Frozen fish rendering

- Distinct from regular coins and shells. Suggest a fish silhouette with a pale blue tint and a crystalline/frosted overlay (white highlight or sparkle detail).
- Should be immediately recognizable as "collectible" (same visual language as other collectibles) but also clearly "different/special."
- When the fish is collected and the tile converts to ice, there should be a brief visual pop — the fish disappears and the cell transitions to the ice tile appearance. This can be a single-frame swap if animation is out of scope for v1.

### Slide animation

The slide should feel continuous, not teleport. If the engine resolves sliding as a single move, the renderer needs to interpolate the entity across intermediate cells. Confirm with Bob whether interpolation is in scope for v1 or if an instant snap is acceptable initially.

---

## 5. Open Questions — Confirm with Zak Before Implementing

These are unresolved design decisions. Do not make calls on these yourself.

1. **Depth number:** ✅ Arctic = Depth 4. Leviathan/Abyss moves to Depth 5.
2. **Frozen fish point value:** ✅ Confirmed. 5 points per fish.
3. **Enemy count on entry:** ✅ Confirmed. 5 enemies at level start.
4. **Number of ice patches at level start:** How many patches seed the board? (Suggest starting with 4-6 for first playtest.)
5. **Mid-slide collectible collection:** If the shark slides over a coin mid-slide, is it collected in passing, or only when the slide stops?
6. **Slide into enemy = death:** ✅ Confirmed. If the shark slides into an enemy at any point during the slide (including the enemy spawned from collecting the frozen fish), it's death. You triggered it, you die.
7. **Board edge during slide:** If a slide would carry the shark off the board edge, does it stop at the last valid cell, or is it a kill? (Expected: stop at edge cell — same as hitting a wall. Confirm.)
8. **Ice passable for pathfinding:** Enemies use Manhattan pathfinding. Should they treat ice cells as normal floor when pathfinding (and just slide when they step on them), or should they try to avoid ice? Avoiding ice would require pathfinding changes. Normal floor treatment is simpler.
9. **Post-collection 1x1 ice tile permanence:** Confirm these accumulate permanently. If the board gets too icy late in the depth this could be a problem — is there a cap or a clear mechanic?
10. **Slide animation:** Interpolated motion across intermediate cells, or instant snap to terminal cell for v1?
