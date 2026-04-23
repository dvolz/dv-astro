# Leaderboard Redesign — Implementation Steps for Bob

> Execute top to bottom. No skipping. No reordering.
> All file paths are absolute.

---

## Pre-flight checklist

Files you will edit:
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/leaderboard.ts`
- `/Users/dvolz/Sites/dv-astro/src/game/shark-thief/navigation.ts`
- `/Users/dvolz/Sites/dv-astro/src/pages/play/shark-thief-ios.astro`

---

## PART 1 — `leaderboard.ts`

### Step 1 — Add `getMaxDepth` to the import line

Current line 4:
```ts
import { calcSharkScore } from "./persistence";
```

Replace with:
```ts
import { calcSharkScore, getMaxDepth } from "./persistence";
```

---

### Step 2 — Replace `MOCK_SCORES`

Current lines 15–24 (the entire `MOCK_SCORES` array). Replace the whole block:

```ts
export const MOCK_SCORES: LbEntry[] = [
  { name: "SharkMaster",  score: 285, date: "2026-03-14T09:23:00Z", totalTimeMs:  78400, levelTimes: [42100, 36300, 51200, 44800, 38900, 67400, 91200], sharkScore: 1036 },
  { name: "FinFrenzy",    score: 240, date: "2026-03-13T22:15:00Z", totalTimeMs:  91200, levelTimes: [53000, 38200, 48900, 41300, 55100],               sharkScore:  631 },
  { name: "OceanKing",    score: 210, date: "2026-03-14T14:02:00Z", totalTimeMs:  67500, levelTimes: [67500, 52000, 61800],                              sharkScore:  653 },
  { name: "DeepDiver",    score: 190, date: "2026-03-12T18:45:00Z", totalTimeMs:  84300, levelTimes: [48200, 36100, 44700, 38500],                       sharkScore:  428 },
  { name: "WaveCatcher",  score: 160, date: "2026-03-14T11:30:00Z", totalTimeMs:  55100, levelTimes: [55100, 49300],                                     sharkScore:  465 },
  { name: "CoralQueen",   score: 130, date: "2026-03-11T20:10:00Z", totalTimeMs:  48700, levelTimes: [48700],                                            sharkScore:  347 },
  { name: "TideRunner",   score: 105, date: "2026-03-13T16:55:00Z", totalTimeMs:  39200, levelTimes: [39200],                                            sharkScore:  281 },
  { name: "ReefRaider",   score:  80, date: "2026-03-10T08:40:00Z", totalTimeMs:  31500, levelTimes: [31500],                                            sharkScore:  203 },
];
```

---

### Step 3 — Replace `updateTabUI`

Current lines 45–51. Replace the entire function:

```ts
export function updateTabUI(category: string): void {
  const isDepthTime = /^d[1-7]_time$/.test(category);
  document.querySelectorAll<HTMLButtonElement>(".lb-tab").forEach(btn => {
    const cat = btn.dataset.category;
    const active = isDepthTime ? cat === "depth_times" : cat === category;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}
```

---

### Step 4 — Replace the `isTime` and `depthIdx` lines in `renderLeaderboard`

Current lines 78–80 inside `renderLeaderboard`:
```ts
  const isTime  = ["d1_time","d2_time","d3_time","d4_time"].includes(category);
  const isShark = category === "shark_score";
  const depthIdx = category === "d1_time" ? 0 : category === "d2_time" ? 1 : category === "d3_time" ? 2 : 3;
```

Replace with:
```ts
  const isTime  = /^d[1-7]_time$/.test(category);
  const isShark = category === "shark_score";
  const depthIdx = isTime ? parseInt(category[1], 10) - 1 : 0;
```

---

### Step 5 — Replace the rank cell HTML and add canvas injection in `renderLeaderboard`

Current line 100 (inside `renderLeaderboard`):
```ts
  const medalCls = ["medal-gold", "medal-silver", "medal-bronze"];
```
Delete this line entirely.

Current line 119 (inside the `sorted.map` callback):
```ts
    const rank = i < 3 ? `<span class="medal ${medalCls[i]}">${i + 1}</span>` : `${i + 1}`;
```

Replace with:
```ts
    const rank = i < 3 ? `` : `${i + 1}`;
```

Current line 137 (closing of `tbody.innerHTML = sorted.map(...).join("")`):
```ts
  tbody.innerHTML = sorted.map((s, i) => {
    ...
    return `<tr${hi}><td class="lb-rank">${rank}</td><td>${esc(s.name)}</td>${valueCell}${metaCell}</tr>`;
  }).join("");
```

The `return` line inside the map — change `<td class="lb-rank">` to use a `data-medal` attribute for top-3 rows. Replace only the return statement:

```ts
    const rankCell = i < 3
      ? `<td class="lb-rank" data-medal="${i + 1}"></td>`
      : `<td class="lb-rank">${i + 1}</td>`;
    return `<tr${hi}>${rankCell}<td>${esc(s.name)}</td>${valueCell}${metaCell}</tr>`;
```

Then delete the existing `const rank = ...` line (which you already changed above to empty string — remove it entirely now, since `rankCell` replaces it).

After the `tbody.innerHTML = ...` assignment (the line that ends with `.join("")`), add these lines immediately below it:

```ts
  tbody.querySelectorAll<HTMLTableCellElement>("td[data-medal]").forEach(td => {
    const r = parseInt(td.dataset.medal!, 10) as 1 | 2 | 3;
    td.appendChild(drawMedalCanvas(r));
  });
```

---

### Step 6 — Add `showDepthTimePanel`, `hideDepthTimePanel`, and `buildDepthTimeBtns` functions

Add these three exported functions after `updateTabUI` and before `formatDate`. Paste the entire block verbatim:

```ts
export function showDepthTimePanel(): void {
  const panel = document.getElementById("lbDepthPanel")!;
  panel.removeAttribute("hidden");
  updateTabUI("d1_time"); // activates the DEPTH TIMES tab button visually
  buildDepthTimeBtns();
}

export function hideDepthTimePanel(): void {
  const panel = document.getElementById("lbDepthPanel")!;
  panel.setAttribute("hidden", "");
}

function buildDepthTimeBtns(): void {
  const maxDepth = getMaxDepth();
  const container = document.getElementById("lbDepthBtns")!;

  const depths: Array<{ depth: number; cls: string; label: string }> = [
    { depth: 1, cls: "",       label: "DEPTH 1 — THE SHALLOWS"  },
    { depth: 2, cls: "ds-d2",  label: "DEPTH 2 — THE NURSERY"   },
    { depth: 3, cls: "ds-d3",  label: "DEPTH 3 — TOXIC"         },
    { depth: 4, cls: "ds-d4",  label: "DEPTH 4 — THE ARCTIC"    },
    { depth: 5, cls: "ds-d5",  label: "DEPTH 5 — THE REEF"      },
    { depth: 6, cls: "ds-d6",  label: "DEPTH 6 — BUSY PACIFIC"  },
    { depth: 7, cls: "ds-d7",  label: "DEPTH 7 — THE ABYSS"     },
  ];

  container.innerHTML = depths.map(d => {
    const locked = d.depth > maxDepth ? " lb-depth-locked" : "";
    return `<button class="${d.cls}${locked}" data-depth-time="${d.depth}">${d.label}</button>`;
  }).join("");

  container.querySelectorAll<HTMLButtonElement>("[data-depth-time]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll<HTMLButtonElement>("[data-depth-time]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const depth = parseInt(btn.dataset.depthTime!, 10);
      fetchLeaderboard(`d${depth}_time`);
    });
  });

  // Auto-select max unlocked depth
  const autoDepth = Math.min(maxDepth, 7);
  const autoBtn = container.querySelector<HTMLButtonElement>(`[data-depth-time="${autoDepth}"]`);
  if (autoBtn) {
    autoBtn.classList.add("active");
    fetchLeaderboard(`d${autoDepth}_time`);
  }
}
```

---

### Step 7 — Add `drawMedalCanvas` function

Add this function after `buildDepthTimeBtns` and before `formatDate`. Paste verbatim:

```ts
export function drawMedalCanvas(rank: 1 | 2 | 3): HTMLCanvasElement {
  const W = 16, H = 20, SCALE = 2;
  const cvs = document.createElement("canvas");
  cvs.width  = W * SCALE;
  cvs.height = H * SCALE;
  cvs.style.width  = `${W}px`;
  cvs.style.height = `${H}px`;
  cvs.style.imageRendering = "pixelated";
  cvs.style.verticalAlign = "middle";
  const ctx = cvs.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const pal = rank === 1
    ? { hi: "#fff0a0", mid: "#e8c000", dk: "#a07800", edge: "#5c3a00", rib: "#c09000" }
    : rank === 2
    ? { hi: "#e8e8e8", mid: "#b8b8b8", dk: "#707070", edge: "#303030", rib: "#909090" }
    : { hi: "#e09060", mid: "#c07040", dk: "#803a10", edge: "#401800", rib: "#a05828" };

  const NUMS: Record<number, number[][]> = {
    1: [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
    2: [[1,1,0],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
    3: [[1,1,0],[0,0,1],[1,1,0],[0,0,1],[1,1,0]],
  };

  const px = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  // Ribbon: cols 5–10, rows 0–2
  for (let r = 0; r < 3; r++)
    for (let c = 5; c <= 10; c++)
      px(c, r, pal.rib);

  // Circle face: 12 rows at y=3–14, top-left light source
  const rows: [number, number][] = [
    [4,11],[2,13],[1,14],[1,14],[1,14],[1,14],
    [1,14],[1,14],[1,14],[1,14],[2,13],[4,11],
  ];
  rows.forEach(([cs, ce], i) => {
    const y = i + 3;
    for (let x = cs; x <= ce; x++) {
      const isEdge = x === cs || x === ce || i === 0 || i === 11;
      const isHi   = !isEdge && i < 4 && x < 6;
      const isDark = !isEdge && !isHi && (x > 10 || i > 8);
      px(x, y, isEdge ? pal.edge : isHi ? pal.hi : isDark ? pal.dk : pal.mid);
    }
  });

  // Numeral 3×5 at col=6, row=7
  NUMS[rank].forEach((row, ry) =>
    row.forEach((on, cx) => { if (on) px(6 + cx, 7 + ry, pal.edge); })
  );

  return cvs;
}
```

---

## PART 2 — `navigation.ts`

### Step 8 — Add `showDepthTimePanel` and `hideDepthTimePanel` to the import from leaderboard

Current line 8:
```ts
import { fetchLeaderboard } from "./leaderboard";
```

Replace with:
```ts
import { fetchLeaderboard, showDepthTimePanel, hideDepthTimePanel } from "./leaderboard";
```

---

### Step 9 — Replace the leaderboard tab click handler

Current lines 183–191 in `initNavigation()`:
```ts
  document.querySelectorAll<HTMLButtonElement>(".lb-tab:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      if (cat) fetchLeaderboard(cat);
    });
    btn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
    });
  });
```

Replace with:
```ts
  document.querySelectorAll<HTMLButtonElement>(".lb-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      if (cat === "depth_times") {
        showDepthTimePanel();
      } else if (cat) {
        hideDepthTimePanel();
        fetchLeaderboard(cat);
      }
    });
    btn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
    });
  });
```

Note: the selector changes from `.lb-tab:not(:disabled)` to `.lb-tab` — with 3 tabs and none disabled, the `:not(:disabled)` filter would still work, but removing it is correct since none of the new tabs use the `disabled` attribute.

---

## PART 3 — `shark-thief-ios.astro`

### Step 10 — Replace the tab bar HTML

Find this block (lines 1873–1880 in the current file):
```html
        <!-- Tab bar -->
        <div class="lb-tab-bar" role="tablist" aria-label="Leaderboard categories">
          <button class="lb-tab active" role="tab" aria-selected="true"  data-category="high_score">HIGH SCORE</button>
          <button class="lb-tab"        role="tab" aria-selected="false" data-category="d1_time">D1 TIME</button>
          <button class="lb-tab"        role="tab" aria-selected="false" data-category="d2_time">D2 TIME</button>
          <button class="lb-tab lb-tab-disabled" role="tab" aria-selected="false" aria-disabled="true" data-category="d3_time" disabled>D3 TIME</button>
          <button class="lb-tab lb-tab-disabled" role="tab" aria-selected="false" aria-disabled="true" data-category="d4_time" disabled>D4 TIME</button>
          <button class="lb-tab"        role="tab" aria-selected="false" data-category="shark_score">SHARK SCORE</button>
        </div>
```

Replace with:
```html
        <!-- Tab bar -->
        <div class="lb-tab-bar" role="tablist" aria-label="Leaderboard categories">
          <button class="lb-tab active" role="tab" aria-selected="true"  data-category="high_score">HIGH SCORE</button>
          <button class="lb-tab"        role="tab" aria-selected="false" data-category="depth_times">DEPTH TIMES</button>
          <button class="lb-tab"        role="tab" aria-selected="false" data-category="shark_score">SHARK SCORE</button>
        </div>
```

---

### Step 11 — Add the depth panel HTML

Immediately after the closing `</div>` of the tab bar you just replaced, and before the `<div class="lb-table-wrap">` line, insert:

```html
        <!-- Depth time selector panel — shown when DEPTH TIMES tab is active -->
        <div id="lbDepthPanel" class="lb-depth-panel depth-select-btns" hidden>
          <div id="lbDepthBtns"></div>
        </div>
```

The resulting order inside `.lb-content-wrap` should be:
1. `.lb-header`
2. `.lb-tab-bar`
3. `#lbDepthPanel` ← new
4. `.lb-table-wrap`

---

### Step 12 — Add SCSS for the depth panel

Add the following block inside the `<style lang="scss">` tag, placed after the `.lb-tab` block (after the closing brace of `.lb-tab`, before `/* Shark Score [?] inline help button */` around line 1439).

```scss
  /* ── Leaderboard Depth Time Panel ── */
  .lb-depth-panel {
    width: 100%;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    /* override .depth-select-btns padding — panel has its own spacing */
    padding: 0;
  }

  .lb-depth-panel[hidden] {
    display: none !important;
  }

  /* Active state for selected depth button inside the panel */
  .lb-depth-panel :global(button.active) {
    color: var(--ocean-abyss);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  /* Locked depth — not yet reached by the player */
  .lb-depth-panel :global(.lb-depth-locked) {
    opacity: 0.3;
    pointer-events: none;
    cursor: not-allowed;
  }
```

**Why `:global()` here:** The depth buttons inside `#lbDepthPanel` are injected via `innerHTML` in `buildDepthTimeBtns()`. Astro's scoped styles cannot reach dynamically-injected elements. Anchoring `:global()` to the static `.lb-depth-panel` parent (which is in the HTML) gates the rules to this panel only — same pattern already used for `.depth-select-btns :global(button)`.

---

### Step 13 — Remove the old CSS medal rules

Remove these three rule blocks from the SCSS (currently lines 1365–1516, roughly). Delete from `.medal {` through the closing `}` of `.medal-bronze`. The exact text to delete:

```scss
  .medal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    font-family: var(--font-pixel);
    font-size: 0.55rem;
    box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  }
```

and:

```scss
  .medal-gold {
    background: linear-gradient(145deg, #f7dc6f, #d4a017);
    color: #5c4300;
    border: 2px solid #c9960c;
  }
  .medal-silver {
    background: linear-gradient(145deg, #d5d5d5, #a0a0a0);
    color: #4a4a4a;
    border: 2px solid #909090;
  }
  .medal-bronze {
    background: linear-gradient(145deg, #dea06e, #b87333);
    color: #5a3510;
    border: 2px solid #a0612a;
  }
```

The `.lb-tab-disabled` style block (inside `.lb-tab`) stays — it is still valid CSS for any future disabled state. Do not remove it.

---

## PART 4 — Verify and gotchas

### Gotcha A — `depth-select-btns` active state conflict

The `.depth-select-btns` class adds `padding: 1rem 1.4rem` and `gap: 0.65rem`. You are putting this class on `#lbDepthPanel`. The SCSS you add in Step 12 overrides padding to `0` — this is intentional. The gap is also overridden by `gap: 0.4rem` in `.lb-depth-panel`. These overrides win because `.lb-depth-panel` is more specific when both classes are on the same element.

The per-depth color rules (`.depth-select-btns :global(.ds-d2)` etc.) ARE the rules that color the depth buttons. `#lbDepthPanel` carries the `depth-select-btns` class so those rules apply automatically. No new color rules needed.

The `.depth-select-btns :global(button)` rule sets `font-size: 1.05rem` and `padding: 1.2rem 2rem`. These will apply to the depth time buttons inside the panel. This is fine — same size as main menu depth buttons. If the buttons feel too tall in context, that is a follow-up design call, not a bug.

### Gotcha B — `active` class on depth buttons conflicts with tab `active` class

The `.lb-depth-panel :global(button.active)` rule you add sets `color: var(--ocean-abyss)` and a box-shadow. The `.depth-select-btns :global(button)` rule does not set a background for `.active` state — it only sets hover background. So the active button inside the depth panel will show dark text but no background fill.

To make the active state visually clear (background fills with depth color), you need to rely on the per-depth hover rule triggering at `.active` too, or add a fallback. The simplest correct approach: also add `background: var(--cyan)` to the `.lb-depth-panel :global(button.active)` rule as a cyan fallback, and let the per-depth `.ds-d2.active` etc. rules override it if needed. Without this, depth 1 (no class) will get cyan fill but depths 2–7 will get dark text on transparent background, which looks broken.

Replace the active rule in Step 12 with:

```scss
  .lb-depth-panel :global(button.active) {
    background: var(--cyan);
    color: var(--ocean-abyss);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  .lb-depth-panel :global(.ds-d2.active) { background: #e06fa0; }
  .lb-depth-panel :global(.ds-d3.active) { background: #6abf3a; }
  .lb-depth-panel :global(.ds-d4.active) { background: #7fd8f0; }
  .lb-depth-panel :global(.ds-d5.active) { background: #daa070; }
  .lb-depth-panel :global(.ds-d6.active) { background: #48d4b8; }
  .lb-depth-panel :global(.ds-d7.active) { background: #9d6fe0; }
```

### Gotcha C — `lbSharkHelpBtn` dynamic injection still works

`renderLeaderboard` injects `#lbSharkHelpBtn` via `thead.innerHTML`, then immediately calls `document.getElementById("lbSharkHelpBtn")?.addEventListener(...)`. This pattern works because the `?` optional chain silently skips if the element is not found, and the query runs synchronously after innerHTML assignment in the same call stack. The tab restructure does not change this behavior — SHARK SCORE still calls `renderLeaderboard` the same way via `fetchLeaderboard("shark_score")`. No change needed.

### Gotcha D — `activeLeaderboardTab` is `"depth_times"` when panel is showing

When the user clicks DEPTH TIMES, `showDepthTimePanel()` is called from `navigation.ts`. `activeLeaderboardTab` is NOT updated to `"depth_times"` at that point — only `fetchLeaderboard()` updates it, and the auto-select inside `buildDepthTimeBtns()` calls `fetchLeaderboard("d{n}_time")`, which sets `activeLeaderboardTab` to e.g. `"d3_time"`.

This means after the panel auto-selects a depth, `activeLeaderboardTab` holds the actual depth category (`"d3_time"`), not `"depth_times"`. This is correct behavior — when `initScoreSubmission` calls `renderLeaderboard(scores, activeLeaderboardTab)` after a submission, it will use the actual depth category, not `"depth_times"`, which means `fetchLeaderboard("depth_times")` will never be called. Good. Do not set `activeLeaderboardTab = "depth_times"` anywhere.

### Gotcha E — `showDepthTimePanel` calls `updateTabUI("d1_time")`

In `showDepthTimePanel`, the call to `updateTabUI("d1_time")` is used only to light up the DEPTH TIMES tab button visually. The real `activeLeaderboardTab` will be updated moments later when `buildDepthTimeBtns` calls `fetchLeaderboard("d{n}_time")`. This sequence is safe — the visual tab highlight updates twice in the same synchronous call stack, so the user sees only the final state.

If you prefer clarity, change `updateTabUI("d1_time")` inside `showDepthTimePanel` to `updateTabUI("d7_time")` or any valid `d{n}_time` string — all of them activate the DEPTH TIMES tab button because `updateTabUI` now uses the regex test. The exact depth passed does not matter for tab highlight purposes.

### Gotcha F — backend does not have D5–D7 time endpoints yet

The mock data path (`IS_LOCAL`) works for all 7 depths immediately. In production (non-localhost), `fetchLeaderboard("d5_time")` through `"d7_time"` will hit `/api/scores?map=shark-thief-v3&category=d5_time` etc. If the backend does not have these categories indexed, the response will likely be a 200 with an empty array or a 404. The error handler in `fetchLeaderboard` calls `renderLeaderboard([], category)` on any non-ok response, showing "NO DATA YET". This is acceptable for a stub. No code change needed — just flag this to the backend team.

---

## Final check — what `renderLeaderboard` must NOT do

Do not pass `"depth_times"` as a category to `renderLeaderboard`. The function has no handling for that string:
- `isTime` regex does not match it
- `isShark` does not match it
- Falls through to the `else` branch (high score layout)

`renderLeaderboard` should only ever receive: `"high_score"`, `"d1_time"` through `"d7_time"`, or `"shark_score"`. The routing in `navigation.ts` (Step 9) and `buildDepthTimeBtns` ensure this is always the case.

