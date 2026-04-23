# Leaderboard Redesign — Working Reference

> Written by Zak. This is the design-intent document. Bob implements from this.
> Last updated: 2026-04-23

---

## What We're Solving

The current 6-tab leaderboard is too wide and mostly broken. Four of the six tabs are either disabled or wired to depths that have no backend data. A scrolling tab bar that makes you hunt for tabs is not good UX on mobile — it's a UX apology for a structure that needs to be rethought.

The fix: collapse to **3 tabs** with a sub-navigation layer for depth times, add pixel art medals for the top 3, and cover all 7 depths with time data.

---

## Tab Structure (Final)

Three tabs only. No scrolling required. They should fill the tab bar evenly.

```
[ HIGH SCORE ]  [ DEPTH TIMES ]  [ SHARK SCORE ]
```

### Tab 1 — HIGH SCORE
Category string: `"high_score"`
No change from existing behavior. Sorted by `score` descending. Shows score + time + date in the meta column.

### Tab 2 — DEPTH TIMES
Category string: not a direct API fetch. This tab triggers the depth selector panel instead.

When the player taps DEPTH TIMES, the table area is replaced by a depth selection panel — the same colored depth buttons used in the main menu Depth Select overlay, re-used inline here. Only depths the player has reached (`getMaxDepth()`) are shown as active; the rest are dimmed but visible, so the player can see what they haven't unlocked yet.

Tapping a depth button then:
1. Highlights that depth button as active
2. Fetches `fetchLeaderboard("d{n}_time")` for that depth
3. Shows the time table in the slot below the depth buttons

This panel is not an overlay. It lives inside `.lb-content-wrap` — inline, between the tab bar and where the table lives. The depth buttons collapse/hide when the player switches to a different top-level tab.

**Why inline, not overlay:** An overlay adds a tap layer. The depth buttons are small enough to fit inline. This keeps the interaction to one tap (select tab) + one tap (select depth) with no dismissal gesture required.

**Verbiage:** "DEPTH TIMES" is the right label. Not "SPLIT TIMES" (implies racing), not "DEPTH RECORDS" (stuffy), not "STAGE TIMES" (wrong vocabulary for this game). Depths are called depths. The times recorded are how long a player spent in each depth. "DEPTH TIMES" is plain and matches the game's own language.

### Tab 3 — SHARK SCORE
Category string: `"shark_score"`
No change from existing behavior. Sorted by `sharkScore` descending. Depth 1 starts only. Keeps the [?] help button inline in the column header.

---

## Depth Times Sub-Navigation

### HTML Structure

Inside `.lb-content-wrap`, immediately after the tab bar and before `.lb-table-wrap`, add a new panel:

```html
<div id="lbDepthPanel" class="lb-depth-panel" hidden>
  <div id="lbDepthBtns" class="lb-depth-btns depth-select-btns"></div>
</div>
```

The `.depth-select-btns` class re-uses the existing depth color CSS (`.ds-d2` through `.ds-d7`) without any new style definitions needed. Those classes already exist in the Astro file and already handle hover, border-color, and color by depth.

The `hidden` attribute is toggled by JS — panel shows when DEPTH TIMES tab is active, hidden otherwise.

### Depth Button State

- **Unlocked (depth <= getMaxDepth()):** Active button with full opacity, tappable
- **Locked (depth > getMaxDepth()):** Rendered with `.lb-depth-locked` class — opacity 0.3, `pointer-events: none`, no hover state. Still visible so the player knows more depths exist
- **Selected:** Add `.active` class to the selected button using the same active-state pattern as `.lb-tab` — background fills to the depth's color, text goes dark

No confirm dialog. Unlike the main depth select (which starts a game and destroys a save), this just fetches read-only data. No friction needed.

### Which Depth Shows First

On first tap of DEPTH TIMES tab: auto-select the player's current max depth and fetch its data immediately. This is the most relevant depth — no extra tap needed to see meaningful data.

### Depth Buttons to Build

Replicate the `buildDepthSelectButtons()` pattern from `navigation.ts` but inside a new function `buildDepthTimeBtns()` in `leaderboard.ts`. Use `getMaxDepth()` to determine locked vs. unlocked state.

All 7 depths are always rendered. Depths beyond `maxDepth` get the locked class.

```
DEPTH 1 — THE SHALLOWS    (no extra class, default cyan)
DEPTH 2 — THE NURSERY     (.ds-d2 — pink)
DEPTH 3 — TOXIC           (.ds-d3 — green)
DEPTH 4 — THE ARCTIC      (.ds-d4 — light blue)
DEPTH 5 — THE REEF        (.ds-d5 — warm sand)
DEPTH 6 — BUSY PACIFIC    (.ds-d6 — teal)
DEPTH 7 — THE ABYSS       (.ds-d7 — purple)
```

---

## API Category Strings

All seven depth time categories follow the same pattern. These are the strings used in `fetchLeaderboard()` and sent to `/api/scores?map=shark-thief-v3&category=`:

| Depth | Category String |
|-------|----------------|
| 1 | `"d1_time"` |
| 2 | `"d2_time"` |
| 3 | `"d3_time"` |
| 4 | `"d4_time"` |
| 5 | `"d5_time"` |
| 6 | `"d6_time"` |
| 7 | `"d7_time"` |

The `isTime` check in `renderLeaderboard()` needs to expand from its current 4-item array to include all seven:

```ts
const isTime = ["d1_time","d2_time","d3_time","d4_time","d5_time","d6_time","d7_time"].includes(category);
```

The `depthIdx` derivation also needs replacing. Currently it's a cascade of ternaries capped at 4. Replace with:

```ts
const depthIdx = isTime ? parseInt(category[1], 10) - 1 : 0;
```

This is cleaner and handles all 7 depths automatically from the category string itself.

---

## Pixel Art Medals

### Direction

Chunky. Hand-crafted. These read at 16×20px — they should not try to be smooth or refined at that size. The aesthetic of this game is pixel-art retro ocean. The medals should look like they belong in that world, not like a polished App Store badge.

They are drawn via `fillRect` calls on a `<canvas>` element created in JS and injected into the rank `<td>`. No image files. No CSS gradients. Canvas pixels only.

### Why Canvas Over CSS

The existing CSS gradient medals (`.medal-gold`, `.medal-silver`, `.medal-bronze`) look like UI badges, not game objects. They read as "website design element" rather than "award in this game's visual language." Canvas pixel art — even if it's 10 `fillRect` calls — reads as belonging to the same world as the grid.

### Medal Canvas Specs

Each medal canvas: **16px wide × 20px tall**, rendered at `2×` device pixel ratio (so the canvas element is 32×40 CSS pixels mapped to 16×20 logical pixels for crisp pixel art).

**Layout — each medal is a face + ribbon tab at the bottom:**

```
 0 1 2 3 4 5 6 7 8 9 A B C D E F   (x, 0-based)
0 . . # # # # # # # # # # . . . .
1 . # # # # # # # # # # # # . . .
2 # # # # # # # # # # # # # # . .
3 # # # . . . . . . . . # # # . .
4 # # . . . . . . . . . . # # . .
5 # # . . . N N N . . . . # # . .   (N = number pixels, centered)
6 # # . . N . . . N . . . # # . .
7 # # . . N N N N . . . . # # . .   (varies per numeral)
8 # # . . . . . . . . . . # # . .
9 # # # # # # # # # # # # # # . .
A . # # # # # # # # # # # # . . .
B . . # # # # # # # # # # . . . .
C . . . . # # # # # # . . . . . .
D . . . . # . . . . # . . . . . .   (ribbon tab)
E . . . . # # # # # # . . . . . .
```

This is schematic — Bob should use it as proportional intent, not a pixel-exact spec. The key structural elements are:
- Circular face body (rows 0–B)
- Narrow ribbon tab centered below the face (rows C–E, approximately 5px wide)
- The numeral 1, 2, or 3 drawn in pixels in the center of the face

### Color Palettes

**Gold (1st):**
- Face fill: `#e8c000`
- Face border/edge: `#a07800`
- Sheen highlight (top-left 2–3 pixels): `#fff0a0`
- Numeral: `#5c3a00`
- Ribbon: `#c09000`

**Silver (2nd):**
- Face fill: `#b8b8b8`
- Face border/edge: `#707070`
- Sheen highlight: `#e8e8e8`
- Numeral: `#303030`
- Ribbon: `#909090`

**Bronze (3rd):**
- Face fill: `#c07040`
- Face border/edge: `#803a10`
- Sheen highlight: `#e09060`
- Numeral: `#401800`
- Ribbon: `#a05828`

### Implementation

In `leaderboard.ts`, add a function:

```ts
function drawMedalCanvas(rank: 1 | 2 | 3): HTMLCanvasElement
```

This function creates a canvas element, sizes it at 32×40 px (2× scale), sets `style.width = "16px"` and `style.height = "20px"`, then draws the medal using `ctx.fillRect`. Returns the canvas element.

In `renderLeaderboard()`, replace the current rank cell HTML string for i < 3:

Current:
```ts
const rank = i < 3 ? `<span class="medal ${medalCls[i]}">${i + 1}</span>` : `${i + 1}`;
```

New approach: the rank cell can't easily contain a canvas via innerHTML. Instead, after setting `tbody.innerHTML`, loop over the rank cells for rows 0–2 and inject the canvas:

```ts
// After tbody.innerHTML = ...
tbody.querySelectorAll<HTMLTableCellElement>("td.lb-rank").forEach((td, i) => {
  if (i < 3) {
    td.textContent = "";
    td.appendChild(drawMedalCanvas((i + 1) as 1 | 2 | 3));
  }
});
```

This means the rank `<td>` for top 3 should be rendered with empty or placeholder content in the HTML string, and a `data-rank` attribute so the loop can target it:

```ts
const rank = i < 3 ? `<td class="lb-rank" data-medal="${i + 1}"></td>` : `<td class="lb-rank">${i + 1}</td>`;
```

Then the post-render loop uses `data-medal` to call `drawMedalCanvas`.

### CSS Changes

Remove `.medal`, `.medal-gold`, `.medal-silver`, `.medal-bronze` from the SCSS. The canvas replaces them entirely. The `lb-rank` cell already has `text-align: center` — that centers the injected canvas too.

---

## Mock Data Update

`MOCK_SCORES` in `leaderboard.ts` currently has `levelTimes` arrays with only 1–2 entries. Update all entries to include times for all 7 depths, with the deeper depths having fewer players (realistic distribution). Only players who reached that depth would have an entry — represent this by having some entries as `0` or simply omitting trailing zeroes by using sparse arrays.

Design intent for mock data: it should look like a real leaderboard. Players at the top reached more depths. Players at the bottom may have only reached D1 or D2.

Suggested mock data structure:

```ts
// SharkMaster reached all 7 depths
levelTimes: [42100, 36300, 51200, 44800, 38900, 67400, 91200]

// FinFrenzy reached 5 depths
levelTimes: [53000, 38200, 48900, 41300, 55100]

// OceanKing reached 3 depths
levelTimes: [67500, 52000, 61800]

// DeepDiver reached 4 depths
levelTimes: [48200, 36100, 44700, 38500]

// WaveCatcher reached 2 depths
levelTimes: [55100, 49300]

// CoralQueen reached 1 depth
levelTimes: [48700]

// TideRunner reached 1 depth
levelTimes: [39200]

// ReefRaider reached 1 depth
levelTimes: [31500]
```

---

## navigation.ts Changes

The current tab wiring in `initNavigation()` uses:
```ts
document.querySelectorAll<HTMLButtonElement>(".lb-tab:not(:disabled)").forEach(btn => { ... })
```

With 3 tabs (none disabled), this still works — no selector change needed.

However, the DEPTH TIMES tab needs special handling: clicking it should NOT call `fetchLeaderboard("depth_times")`. Instead, it should show the depth panel and auto-select the highest unlocked depth.

Add a check in the click handler:

```ts
btn.addEventListener("click", () => {
  const cat = btn.dataset.category;
  if (cat === "depth_times") {
    showDepthTimePanel();
  } else if (cat) {
    hideDepthTimePanel();
    fetchLeaderboard(cat);
  }
});
```

`showDepthTimePanel()` and `hideDepthTimePanel()` live in `leaderboard.ts` and are exported. They toggle the `hidden` attribute on `#lbDepthPanel` and rebuild/show the depth buttons.

`updateTabUI()` needs to handle `"depth_times"` as a valid active state — it should mark the DEPTH TIMES tab as active when any `d{n}_time` category is active, as well as when `category === "depth_times"`.

---

## HTML Changes in the Astro File

### Tab Bar (replace existing 6 buttons with 3)

```html
<div class="lb-tab-bar" role="tablist" aria-label="Leaderboard categories">
  <button class="lb-tab active" role="tab" aria-selected="true"  data-category="high_score">HIGH SCORE</button>
  <button class="lb-tab"        role="tab" aria-selected="false" data-category="depth_times">DEPTH TIMES</button>
  <button class="lb-tab"        role="tab" aria-selected="false" data-category="shark_score">SHARK SCORE</button>
</div>
```

### Depth Panel (add between tab bar and table)

```html
<div id="lbDepthPanel" class="lb-depth-panel depth-select-btns" hidden>
  <div id="lbDepthBtns"></div>
</div>
```

The `depth-select-btns` class is already styled in the SCSS with the per-depth color rules. Bob should verify these rules apply via `:global()` since the buttons are injected via JS innerHTML (same pattern already used in `buildDepthSelectButtons()`).

### CSS to Add

```scss
.lb-depth-panel {
  width: 100%;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lb-depth-panel[hidden] {
  display: none;
}

/* Active state for depth time buttons */
:global(.lb-depth-btns button.active) {
  color: var(--ocean-abyss);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* Locked depth indicator */
:global(.lb-depth-locked) {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}
```

### CSS to Remove

The `.medal`, `.medal-gold`, `.medal-silver`, `.medal-bronze` rules at lines 1365–1515 (approximately). These are replaced by the canvas medals.

---

## Open Questions

1. **Backend for D3–D7 times:** Does the API currently accept and store `levelTimes[2]` through `levelTimes[6]` from submitted scores? If the POST already sends the full `levelTimes` array (it does — see `leaderboard.ts` line 176), the backend may already be storing them. Need to confirm the backend is indexing these for the new category endpoints before Bob wires the API calls.

2. **Medal numeral rendering:** Pixel-perfect 1/2/3 numerals at 5×7px (within the 16×20 face) are tricky with just `fillRect`. Bob should stub the medal function with placeholder fills first and iterate on the numeral shapes separately. A simple approach: hardcode the 1, 2, 3 as bitmap arrays (7 rows × 5 cols of 0/1) and loop to draw. This is the correct approach — do not try to use canvas `fillText` in pixel art mode.

3. **`updateTabUI` and depth sub-tabs:** When a depth time category is active (e.g., `"d3_time"`), the DEPTH TIMES tab should appear active in the tab bar. The current `updateTabUI()` matches `btn.dataset.category === category` exactly. It needs a new rule: if category matches `/^d[1-7]_time$/`, treat `"depth_times"` as the active tab.

4. **lbDepthBtns button sizing:** The depth buttons in the main menu depth select are full-width stacked. In the leaderboard, they're embedded inline — should they be full-width stacked (same as main menu, clean and readable) or a 2-column grid (more compact)? Given the leaderboard's narrow `max-width: 560px` column, full-width stacked is the right call. Same layout, smaller context.
