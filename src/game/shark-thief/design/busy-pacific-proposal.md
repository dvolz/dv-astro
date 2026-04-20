# Busy Pacific — Level Proposal

> Status: **Ready for Ray**
> Proposal stage complete. Open questions resolved 2026-04-19.
> Do NOT update GAME_DESIGN.md until Ray has reviewed and Bob has signed off on implementation plan.
> Received: 2026-04-19 — Elizabeth Volz
> Reviewed by: Zak, 2026-04-19

---

## Original Email (verbatim)

> The "Busy Pacific" - level with a few types of neutral fish that move the same speed as the swarm (but let me control the speed of the neutral fish in the config file). These neutral fish will eat food pieces competing with the shark - the swarm pieces don't see the neutral fish and move through them.
>
> The shark can bump into the neutral fish.
>
> The color scheme is the same or similar to the shallows but there is kelp that rises from the bottom and sways in a gentle tidal like fashion. The color should be a gradient going from lighter at the top to darker at the bottom as if sunlight is coming through.
>
> The kelp is varied heights, the shark is hidden from view when behind the kelp. The kelp will occasionally sprout bulbs that are worth 5.
>
> Kelp is modeled after the pacific kelp forest.
>
> Make the amount of fish adjustable by type in the config
>
> Fish type 1 - pacific mackerel - is small thin and sleek fits in a 1x1 - it moves at the same speed as the swarm pieces. 3 of this fish appear
>
> Fish type 2 - Gulf Grouper - is bulky and 2 x 2 blocks in length, it moves one slower than the shark - one of this fish appears
>
> Fish type 3 - Garibaldi - is small fits in a 1x1 and moves at the same rate as the shark. 3 of this fish appear

---

## Resolved Design Decisions

All 10 open questions have been answered. These decisions are final and drive the design below.

**1. Shark bumping a neutral fish**
Works exactly like bumping into coral: the shark's move is blocked and cancelled. The fish does not react. No damage, no bounce — it is simply impassable. This is clean and consistent with existing collision rules.

**2. Signature mechanic**
Neutral fish competing for food. This is the one thing this depth is about. All fish are always on screen; they move randomly around the board and pick up food as they go. The player is racing them for coins. This is the mechanic. Everything else is atmosphere.

**3. Kelp stealth — enemies CAN see through kelp**
Kelp does NOT affect enemy targeting. Enemies pathfind to the player normally whether or not the player is inside kelp. Kelp is purely visual and atmospheric — it obscures the player's sprite, but the game underneath is unchanged. This eliminates the stealth mechanic entirely and with it, the camping degenerate strategy concern.

**4. Kelp permanence**
Static from level start. Kelp does not grow, spread, or die. It is seeded at depth load and fixed for the entire run. This keeps it firmly in the "environment" category, not the "mechanic" category.

**5. Neutral fish leaving the board**
They never leave the board. Fish are always present. No edge-case handling needed for fish escaping the grid.

**6. Camping prevention**
Not needed. Since enemies see through kelp, there is no safe camping position. A player standing in kelp is just as exposed as anywhere else — they just can't see the enemy closing in. If anything, kelp is mildly dangerous to stand in for too long.

**7. Can the shark eat neutral fish**
No. The shark cannot eat neutral fish. They are permanent obstacles that block movement, compete for food, and persist for the entire depth.

**8. Depth slot**
Depth 6. The Leviathan / The Abyss moves to Depth 7. This is confirmed.

**9. Fish species — all three implemented at once**
All three fish types (Pacific Mackerel, Gulf Grouper, Garibaldi) spawn at level load and persist throughout the depth. All three are implemented together, not one at a time. Count per type is configurable in `level-config.ts`. **For Bob:** Use the `pixel-art-sprites` skill to generate sprites for all three fish. Art target is Sega Genesis feel.

**10. Sunlight gradient**
Purely atmospheric. No gameplay effect. Lighter at top, darker at bottom — it's visual world-building, not a mechanic.

---

## Updated Design Analysis

### What this depth actually is

With all questions resolved, the design is considerably simpler and cleaner than the original proposal suggested. The two-mechanic problem is solved:

- **Kelp is not a mechanic.** It is environment. It obscures the player's sprite (atmospheric, slightly spooky since you can't see enemies while inside it) but does not change any rules. No AI changes. No stealth system. No cost-of-cover balance problem. Purely visual.

- **Neutral fish competing for food is the mechanic.** Full stop. Three fish species, all always present, all moving randomly, all eating coins before the player can reach them. This is the entire signature of Depth 6.

This simplification is significant. The original proposal had implementation complexity across two major systems. Now kelp is a rendering layer and a static terrain seed — no logic changes needed for enemy AI, no pathfinding exceptions, no line-of-sight calculations. The gameplay innovation is entirely the neutral fish / food competition system.

---

### The Signature Mechanic — Neutral Fish

Food competition is the right call. Here is why it works within the existing design:

The current game gives the player complete control over enemy accumulation. You collect a coin, you spawn an enemy — that's your decision. Neutral fish break this in a specific and interesting way: they do not spawn enemies when they eat coins. The board starves the player of points without generating new threats. You can watch three fish eat six coins and have nothing to show for it — no enemy spawn, no points, just loss. That is a new texture of tension the game has not had before.

The three fish types add visual variety and behavioral complexity without introducing a taxonomy problem. Since enemies move through fish and fish are permanent, the player reads them as terrain with agency — a moving obstacle that also eats their food. The Grouper's 2x2 size makes it clearly readable as a different entity than the regular swarm. The Mackerel and Garibaldi are both 1x1 but different in color and movement rate, which is enough to distinguish them without requiring the player to learn separate rule sets. All three follow the same core rule: moves around, eats coins, blocks the shark.

Shark-bumps-fish behaving like coral collision is the right call. It's already a known rule in the player's vocabulary (Depth 5 has barriers). No new concept to learn — just "this fish is solid." The fish not reacting keeps them readable as obstacles, not as entities with their own hunger states or priorities that the player needs to model.

---

### Kelp — Clarified Role

Kelp is now firmly atmospheric. Its mechanical footprint:

- Seeded at depth start, static for the run
- Player sprite is visually obscured while standing in a kelp cell (the player cannot see their shark clearly, which creates mild tension since they also can't see enemies closing in)
- No effect on enemy pathfinding
- No interaction with neutral fish movement
- No cost, no benefit beyond visual texture

The swaying animation and sunlight gradient are purely rendering concerns. They reinforce the Pacific kelp forest feel and differentiate this depth visually from The Shallows (which uses a similar ocean palette). These should proceed without design gates — they are art direction, not design decisions.

One note on the visual consequence of enemies seeing through kelp: the player inside kelp knows enemies are coming but cannot easily see them. This is a soft tension mechanic that emerges from the visual — not from any AI change. It rewards the player for not camping in kelp even though camping is not technically punished. Good emergent design.

---

### Fish Species — What to Build

All three species at once. Count per type configurable in `level-config.ts`. Suggested starting counts matching the proposal: 3 Mackerel, 1 Grouper, 3 Garibaldi — 7 neutral fish total on a 25x25 board. This is a light population. Tune upward if the competition pressure isn't felt.

Speed per type should be configurable independently. Suggested defaults: Mackerel at swarm speed, Garibaldi at shark speed, Grouper at one step slower than shark. The speed differentiation creates an intuitive priority hierarchy: Garibaldi and Mackerel are the dangerous food competitors (they'll beat you to coins); Grouper is the obstacle (it'll get in the way but rarely wins the race).

Sprites: Sega Genesis feel, pixel art. Use the `pixel-art-sprites` skill. All three should read clearly at 1x1 (Mackerel, Garibaldi) and 2x2 (Grouper) tile sizes. Color priority: Garibaldi is historically an orange fish — it should be vivid enough to distinguish from coins. Mackerel is silver-blue. Grouper can be earth-toned.

---

### What to Throw Out (still)

These elements remain shelved. The resolved answers confirm they do not belong in this depth:

- **Kelp stealth as a mechanic** — confirmed not implemented. Enemies see through kelp.
- **Kelp bulbs as a pickup** — the signature mechanic is food competition, not terrain-anchored pickups. Kelp bulbs would split attention and dilute the neutral fish mechanic. Remove from scope entirely for this depth.
- **Camping prevention system** — not needed. Resolved by the kelp stealth decision.

---

### Depth 6 Placement — Confirmed

Depth 6, with Leviathan / The Abyss at Depth 7. The food competition mechanic fits well at Depth 6 — the player has seen all the prior depth types (self-generated threats, terrain reshaping, commitment mechanics, cloud cover) and is ready for a mechanic that removes their control over enemy accumulation rather than adding a new cost to their decisions.

---

## For Ray — Implementation Scope

The design is clean. Here is what Ray needs to plan:

**New systems:**
- Neutral fish entities: 3 types, each with configurable count and speed, persistent for the depth, random movement, coin-eating behavior, enemy-passthrough, shark-collision
- Kelp terrain: seeded at depth start, static, player sprite obscured visually when occupying a kelp cell, no AI interaction

**No changes to:**
- Enemy pathfinding / targeting (kelp does not affect it)
- Enemy collision rules
- Coin spawn logic (coins spawn normally; fish simply compete to reach them)

**Sprites needed (Bob, via `pixel-art-sprites` skill):**
- Pacific Mackerel — 1x1, silver-blue, Sega Genesis pixel art
- Gulf Grouper — 2x2, earth-toned, Sega Genesis pixel art
- Garibaldi — 1x1, vivid orange, Sega Genesis pixel art

**Config additions needed in `level-config.ts`:**
- Fish count per type
- Fish speed per type
- Kelp density (cell count or percentage)
