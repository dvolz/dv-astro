# Toxic Level — Design Document

**Depth:** 5 (follows Arctic, Depth 4 — precedes the Leviathan level, now Depth 6)
**Status:** Design complete. Config values proposed and justified below. No open implementation questions blocking a first build.

---

## What This Depth Is About

Every earlier depth takes something away from the player's options — barriers block paths, babies create liability, ice turns movement into commitment. Toxic takes away something different: **information**.

The board stays fully navigable. Enemies move the same way they always have. But the player progressively loses the ability to see it. Each pickup places a semi-permanent toxic cloud on the board. Clouds accumulate. By the time the player is halfway to 100 points, significant portions of the grid are obscured. The difficulty isn't the enemies getting harder — it's the player flying increasingly blind while the enemies still know exactly where they are.

This depth should feel like the ocean is sick. Something went wrong down here.

---

## Visual Identity

### Tile Palette

**Name: `"toxic"`** — A new palette. Deep, murky green-black water. The tiles read as contaminated rather than clear. Think bioluminescent rot, not tropical reef. Suggested tile fill color in the neighborhood of `#1a3a1a` (very dark, desaturated green) with a slightly lighter `#2a4a2a` variation for the grid lines. The board should look wrong immediately.

**`canvasBase`: `"#0a1f0a"`** — Near-black with a green cast. Bleeds between tiles to reinforce the feeling of polluted deep water. Dark enough that the toxic clouds will read clearly against it.

### The Toxic Cloud Visual

The cloud is the most important visual design call in this depth. It must satisfy two hard requirements simultaneously:
1. It must look clearly toxic and threatening — not decorative.
2. It must be immediately legible as "this is obscuring the board underneath," not "this is another game tile."

**Color:** Sickly yellow-green — something in the range of `#c8e63c` at the center fading to a more transparent `#a0c020` at the edges. This is a strong departure from the dark green tile palette underneath. The contrast has to be high enough that the cloud reads as a layer on top, not part of the water.

**Opacity:** 80-85%. Opaque enough to meaningfully block vision of what's underneath, but with a ghost of the tile grid still faintly visible through it on close inspection. The player should feel obscured, not cheated — there's a difference between "I couldn't see that" and "the game hid it from me arbitrarily."

**Texture quality:** The cloud should look gaseous and slightly uneven, not a clean rectangle. The 21-cell shape (5×5 minus 4 corners) already gives it an organic silhouette. Reinforce that with an uneven fill — a slightly mottled or gradient texture within the shape, darker and denser toward the center, lighter and more wispy at the edges. Small bubble-like details or faint swirl marks inside the cloud would read as toxic gas rather than paint.

**No animation.** The cloud does not drift, pulse, or fade. It lands and it stays. This is intentional — a static obscuring layer feels more oppressive than an animated one. The player has to mentally track what's underneath.

---

## The Pickup: Toxic Barrel

**Name: Toxic Barrel**

A small rusty barrel leaking green fluid. It sits on the board like any other collectible — clearly grabbable, clearly dangerous-looking. Players who have been in every other depth will recognize it as "that's the special pickup for this level" from its visual distinctiveness alone.

**Collection behavior:**
1. Award points.
2. Spawn 1 new enemy (consistent with every pickup having a cost).
3. Place a toxic cloud centered on the collection cell. The cloud covers the 21 cells of the 5×5 grid minus the 4 corner cells.
4. The cloud remains for the entire depth — it does not fade, move, or clear until the player descends.

**Point value: 8 pts**

Justification: Lower than the 10-pt ammonite and egg (those come with big enemies or loss mechanics), but higher than the 5-pt coral shell and frozen fish (those have constraints baked into the terrain). 8 points is enough to tempt a greedy player — they'll collect three barrels for 24 points and suddenly realize they can't see a quarter of the board. The value needs to be high enough that ignoring all barrels and only collecting coins is a real sacrifice. 8 threads that needle.

---

## Config Values

```
toxic: {
  initCount:      1,   // 1 barrel seeded at depth entry
  max:            4,   // up to 4 barrels visible at once
  interval:       20,  // 20 player moves between a collection and the next barrel spawn
  points:         8,
  centerSafeZone: 8,   // barrels won't spawn in the center 8×8 area
}

tilePalette:  "toxic"
canvasBase:   "#0a1f0a"
enemyKeep:    8
coinRate:     0.00025
coinInit:     0.05
descendScore: 100
minEnemyDist: 6
```

### Justification by field

**`initCount: 1`** — One barrel on the board at entry. The player sees it immediately and has a choice: grab it for 8 points and accept the first cloud, or play around it and grind coins. That choice should present itself in the first few moves. Starting with zero would bury the lead; starting with two would feel immediately hostile before the player understands the mechanic.

**`max: 4`** — At four simultaneous barrels, the board has up to four uncollected opportunities, each threatening a new cloud if grabbed. Four clouds, if all collected, cover up to 84 cells — about 13% of the 625-cell grid. That's meaningful but not overwhelming while clouds are fresh. What matters more is the accumulation of already-placed clouds over time. Cap at 4 so the board never drowns in barrels, keeping the pickup feel deliberate rather than constant.

**`interval: 20`** — A 20-move gap means a new barrel appears roughly every 20 seconds of active play. That's slow enough that the player feels the board opening up again after a collection, but fast enough that barrels are a recurring choice rather than a rare event. Compare to Arctic's 20-move fish interval — similar cadence, appropriate for a high-consequence pickup.

**`centerSafeZone: 8`** — Barrels shouldn't cluster in the center because that's where most player maneuvering happens and where enemies converge. A cloud planted in the dead center of the board is disproportionately disruptive compared to one near an edge. The safe zone pushes barrels toward the edges and midfield, where the vision loss is punishing but survivable. An 8×8 zone (rather than the 10×10 used for eggs) keeps barrels accessible enough that strategic players can plan collection routes without too much running across the board.

**`enemyKeep: 8`** — The player arrives from Arctic (Depth 4), which enters with 5 enemies. Eight enemies on entry is a step up — the player descending into Toxic should feel the ocean getting more hostile, not a fresh start. It's tight but not immediately fatal, which matters here: the cloud mechanic is the new pressure, and it shouldn't have to compete with an overwhelming opening enemy count. The escalation from 5 (Arctic) to 8 (Toxic) signals that the deep ocean is serious, and primes the player for the Leviathan level that follows.

**`minEnemyDist: 6`** — One cell further than the standard 5. With clouds accumulating on the board, enemy spawns that land inside a cloud would be genuinely invisible to the player. The extra distance gives a slightly larger guaranteed safe bubble around each collection moment, which partially compensates for the reduced board visibility. This is the one config lever that directly acknowledges the cloud mechanic's information cost.

Note: enemy spawn eligibility is also constrained by the cloud exclusion rule — see the resolved design decision below. These two rules work together: `minEnemyDist` keeps spawns away from the player; the cloud buffer keeps spawns visible.

**`coinRate: 0.00025` and `coinInit: 0.05`** — Unchanged from all other depths. Coins are the steady rhythm of the game; disrupting their rate here would compound the cloud pressure in a way that feels arbitrary rather than designed. The clouds are the difficulty. The coins should feel normal.

---

## Difficulty Curve and What Makes This Depth Feel Different

### The information loss arc

Depth 5 has a specific arc that no other depth has: **it starts easier than it looks and ends harder than it looks.**

On the first move, the board is clear. The player has full information. Enemies are at the standard spread. If they never collect a barrel, nothing about this depth is harder than earlier ones — coins, enemies, the usual loop.

But the barrel is sitting there for 8 points.

The first collection is almost free. One cloud, 21 cells obscured, the board is still 96% visible. Fine. The second collection starts to feel different — maybe an enemy walked into the first cloud and the player lost track of it. The third and fourth collections, combined with accumulated clouds from earlier rounds, start creating dead zones. The player isn't just navigating enemies they can see — they're navigating the memory of where enemies were and the fear of what's in the clouds now.

This is the core feeling: **Toxic is about the erosion of confidence, not the addition of obstacles.**

### How it interacts with enemies

Enemies are not affected by the clouds — they still pathfind to the shark using the full board. The player doesn't know where the enemies in the clouds are. The enemies know exactly where the player is. This asymmetry is the mechanic.

Strategic players will learn to treat clouded zones as danger zones: if you haven't seen an enemy move into a cloud, it might be clear; if you watched one walk in, it's a death trap. This is real spatial memory work, not just luck.

Reckless players will get killed by enemies that stepped into clouds two turns ago and are now exactly where the player just walked. That death will be legible — "I lost track of that enemy when the cloud appeared" — which satisfies design principle 4.

### What 100 points actually costs

At 8 pts per barrel with 3-4 collected in a full depth run (conservative), the player earns 24-32 points from barrels and 68-76 from coins. That's probably 3-4 clouds placed by the end. On a 25×25 grid, 3 clouds cover up to 63 cells — about 10% of the board. That feels meaningful without being absurd.

A maximalist player who grabs every barrel will have 4+ clouds and be playing through a significantly obscured board by the time they approach 100 points. They earned those points faster, but the board is harder to read. That's the intended trade: efficiency costs vision.

---

## The Descent Moment

When the player hits 100 points and descends, **all clouds clear instantly.** The board snaps back to full visibility.

This moment is worth thinking about carefully. After playing through progressive obscurement, full visibility returning all at once will feel like a breath of air. That's good — it's a reward that comes from surviving the depth, not from skill alone. It also cleanly resets the mechanic for the next level so clouds don't bleed into depths that have nothing to do with them (design principle 6: clean mechanical slate).

**One design consideration:** the clouds should clear *before* the depth transition animation plays, not after. If the player sees the board fully revealed for a half-second before the transition, that's a satisfying payoff moment. If the transition fires first and the clear happens invisibly, the moment is wasted. This is a sequencing note for the developer — the cloud-clear should be visible.

There is no partial reward or farewell to the clouds. They don't fade. They cut. The ocean clears because the player moved past the poisoned zone. That's the story.

---

## Resolved Design Decisions

### Enemy spawn exclusion zone around clouds

**Decision:** Enemies cannot spawn inside a cloud cell, and cannot spawn within 2 tiles (Manhattan distance) of any cloud cell.

This closes the open question about invisible enemy spawns. Here is what it means in practice:

**For the player:** The cloud is a hazard that obscures vision, but it is not a hidden enemy factory. An enemy cannot materialize inside a cloud and be immediately invisible to you. The 2-tile buffer goes further — the edges of a cloud are also safe from new spawns. If you are watching the perimeter of a cloud, you will see any enemy that spawns near it. You will not see enemies that have already walked into the cloud from elsewhere, but you will never have one appear inside it without warning.

This is the right call for fairness. Deaths in this depth should come from enemies the player lost track of — enemies that walked into a cloud after the player last saw them. That is a legible death. An enemy that spawned invisibly inside a cloud and immediately killed the player is not legible, and it would undermine trust in the mechanic entirely.

**What this creates downstream — the shrinking spawn pool problem:**

As clouds accumulate over the course of a depth, every cloud plus its 2-tile buffer removes a ring of cells from the eligible spawn area. A single 21-cell cloud (the 5×5 minus-corners shape) with a 2-tile buffer around it excludes roughly 65-80 cells from spawning, depending on position and overlap with board edges. Four clouds in different parts of the board could plausibly eliminate 200+ cells from spawn eligibility — nearly a third of the 625-cell grid.

This has a real late-depth consequence: **as the board gets harder to see, it also gets harder to spawn enemies.** The enemy count grows more slowly in the late game of Toxic than in any other depth — not because the player is being protected, but because the board itself has been poisoned.

This creates an interesting tension that is currently unresolved. On one hand, it gives experienced players a late-game stability that could feel like relief — if you survive to 70+ points in Toxic, the enemy spawn pressure actually softens slightly as clouds cover more territory. On the other hand, players who played aggressively and placed many clouds early may find themselves in a death spiral: they obscured their own vision and also created a dense enemy population before the spawn pool shrank. Conservative players (fewer barrels collected, fewer clouds placed) get full spawn availability but also fewer points from barrels and a clearer board.

This asymmetry is probably fine — maybe even interesting — but it should be watched in playtesting. If late-depth Toxic feels like a free ride due to spawn starvation, the buffer could be reduced from 2 to 1. If it feels punishing because clouds push spawns closer to the player's usual movement corridors (by eliminating the rest), the buffer may need to stay at 2 or even increase. This is the new tuning question this decision opens.

---

## Open Questions

- **Toxic palette name:** `"toxic"` is proposed here. If the palette system has a naming convention to follow, adjust accordingly.
- **Cloud render layer:** The cloud renders on top of all tiles and collectibles, but does it render on top of the player shark and enemies? Recommend: enemies inside clouds are hidden (that's the mechanic), but the player shark always renders on top of everything including clouds — the player always knows where *they* are, just not what's around them.
- **Multiple cloud overlap:** If two barrel collections place clouds in overlapping areas, the overlap region simply remains covered — no visual stacking, just redundant coverage. Confirm this is acceptable.
- **Barrel visual:** The toxic barrel is described here as a design intent. Exact sprite design is up to the developer, but it should be immediately distinct from coins and all prior shells. The leaking green element is load-bearing — it needs to telegraph "this causes the green clouds" before the player has ever collected one.
- **Late-depth spawn starvation:** With the cloud exclusion buffer in place, does aggressive barrel collection create a situation where the spawn pool shrinks enough to meaningfully reduce late-depth enemy pressure? Needs playtesting. If so, decide whether that emergent relief is a feature or a problem — and tune the buffer radius accordingly.
