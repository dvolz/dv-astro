import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, F as Fragment, e as renderScript, g as defineScriptVars, m as maybeRenderHead } from './astro/server_BDmygan7.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Icon } from './BaseLayout_DaOo42CO.mjs';
import { $ as $$BlogDetails } from './BlogDetails_BwLfRjDy.mjs';
/* empty css                                 */

const timingNotesData = [
	{
		time: 133,
		message: "Build Up",
		duration: 4.5
	},
	{
		time: 139.5,
		message: "No Fill Coming Up",
		countTo: true
	},
	{
		time: 145.6,
		message: "Simple Lead-in Fill Coming Up",
		countTo: true
	},
	{
		time: 151.6,
		message: "No Fill Coming Up",
		countTo: true
	},
	{
		time: 157.5,
		message: "Easy Transition Fill",
		countTo: true
	},
	{
		time: 163.7,
		message: "Easy Transition Fill With Bass Start",
		countTo: true
	},
	{
		time: 169.5,
		message: "Longer Bass Crash Fill",
		countTo: true
	},
	{
		time: 175.6,
		message: "Finale",
		countTo: true
	},
	{
		time: 181.5,
		message: "Burn Down",
		countTo: true
	},
	{
		time: 187.4,
		message: "Done",
		countTo: true
	}
];

const mightyToSaveTimingData = [
	{
		time: 0,
		message: "Guitar Intro"
	},
	{
		time: 8.8,
		resetBpm: true,
		newBpm: 73,
		invisible: true
	},
	{
		time: 15.4,
		resetBpm: true,
		message: "Drums Start",
		countTo: true,
		countMeasures: 2
	},
	{
		time: 21.7,
		message: "Guitar Starts",
		countTo: true,
		resetBpm: true,
		countMeasures: 1
	},
	{
		time: 48.2,
		message: "Verse 1",
		countTo: true,
		resetBpm: true,
		countMeasures: 1
	},
	{
		time: 74.5,
		message: "Pre-chorus Build",
		countTo: true,
		resetBpm: true,
		countMeasures: 1
	},
	{
		time: 81,
		resetBpm: true,
		message: "Chorus No Drums",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 107.3,
		resetBpm: true,
		message: "Repeat Intro with Drums",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 120.5,
		resetBpm: true,
		message: "Verse 2",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 146.8,
		resetBpm: true,
		message: "Pre-chorus Build",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 153.4,
		resetBpm: true,
		message: "Chorus Drums",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 179.6,
		resetBpm: true,
		message: "Repeat Chorus",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 205.9,
		resetBpm: true,
		message: "Bridge Instrumental",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 219.1,
		resetBpm: true,
		message: "Bridge Vocal",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 232.35,
		resetBpm: true,
		message: "Repeat Bridge Vocal",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 245.4,
		resetBpm: true,
		message: "Verse 3 No Drums",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 258.6,
		resetBpm: true,
		message: "Verse 3 Drums In",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 271.6,
		resetBpm: true,
		message: "Chorus Big",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 284.9,
		resetBpm: true,
		message: "Chorus Repeat",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 298,
		resetBpm: true,
		message: "Bridge Big",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 311.2,
		resetBpm: true,
		message: "Bridge Repeat",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 324.4,
		resetBpm: true,
		message: "Bridge Just Drums",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 337.4,
		resetBpm: true,
		message: "Guitar Starts",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 350.7,
		resetBpm: true,
		message: "Bridge Big",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 363.9,
		resetBpm: true,
		message: "Bridge Repeat",
		countTo: true,
		countMeasures: 1
	},
	{
		time: 371,
		resetBpm: true,
		message: "Slow Down End"
	}
];

const alwaysInvisibleTimingData = [
	{
		time: 150,
		message: "Chorus",
		countTo: false,
		countMeasures: 2,
		resetBpm: false,
		invisible: false,
		color: "#D8A7B1"
	},
	{
		time: 162.5,
		message: "Breakdown Begins",
		countTo: true,
		countMeasures: 2,
		resetBpm: true,
		invisible: false,
		color: "#D8A7B1"
	},
	{
		time: 175,
		message: "",
		countTo: false,
		countMeasures: 1,
		resetBpm: true,
		newBpm: 76,
		invisible: true
	},
	{
		time: 184.2,
		message: "",
		countTo: true,
		countMeasures: 1,
		resetBpm: true,
		invisible: false
	},
	{
		time: 190.8,
		message: "",
		countTo: true,
		countMeasures: 2,
		resetBpm: true,
		newBpm: 77,
		invisible: false
	}
];

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "YouTube Timing Controller",
  author: "David Volz",
  description: `A tool to control YouTube playback with timed text annotations and BPM-based counting.`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  pubDate: "2025-12-6",
  tags: ["javascript", "code", "tools"],
  featured: true,
  display: true
};
const $$YoutubeTimer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$YoutubeTimer;
  const showTypographyHero = true;
  const fullWidthBody = true;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "showTypographyHero": showTypographyHero, "description": blogData.description, "fullWidthBody": fullWidthBody }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<div class="details-width"> ', ' </div> <div class="article"> <p class="intro-text">\nThis tool allows you to control YouTube video playback with precise timing\n			annotations. Set start times, add timed text notes, and sync with BPM for\n			musical analysis or learning.\n</p> </div> <div class="youtube-timer-container"> <!-- Configuration Panel --> <div class="config-panel"> <h3>Configuration</h3> <div class="config-inputs"> <div class="input-group"> <label for="videoUrl">YouTube Video ID or URL</label> <input type="text" id="videoUrl" placeholder="dQw4w9WgXcQ or full URL"> </div> <div class="input-group"> <label for="startTime">Start Time (seconds) - Optional</label> <input type="number" id="startTime" placeholder="Leave empty for start" step="any"> <small>Time in seconds where video should start (61 = 1 minute 1 second).\n						Leave empty to start from beginning.</small> </div> <div class="input-group"> <label for="duration">Duration (seconds) - Optional</label> <input type="number" id="duration" placeholder="Leave empty for full video" step="any"> <small>How long to play from start time. Leave empty to play the entire\n						video.</small> </div> <div class="input-group"> <label for="bpm">BPM - Optional</label> <input type="number" id="bpm" placeholder="120" min="1"> <small>Beat interval <span id="beatInterval">0</span>s</small> </div> <div class="input-group"> <label for="timeSignature">Time Signature - Optional</label> <select id="timeSignature"> <option value="4">4/4</option> <option value="3">3/4</option> <option value="2">2/4</option> <option value="5">5/4</option> <option value="6">6/8</option> <option value="7">7/4</option> </select> <small>Number of beats per measure for count-in</small> </div> </div> <div class="config-actions"> <button id="loadVideo" class="btn-primary">Load Video</button> <button id="loadExample2" class="btn-secondary">Load Example: Mighty to Save</button> <button id="loadExample" class="btn-secondary">Load Example: See You Later Alligator</button> <button id="loadExample3" class="btn-secondary">Load Example: Always Invisible</button> </div> <div class="main-content"> <!-- Video Player --> <div class="player-section"> <button id="toggleVideo" class="btn-toggle-video">\u25BC Show Video</button> <div class="player-wrapper hidden" id="playerWrapper"> <div id="player"></div> </div> <div class="timing-display" role="region" aria-label="Current timing note"> <div id="currentNote" class="note-display" aria-live="polite" aria-atomic="true">\nNo note active\n</div> <div id="nextNote" class="note-display next-note" aria-live="polite">\nUp next: <span id="nextNoteText">--</span> </div> </div> <div class="controls"> <div class="time-display"> <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span> </div> <div class="controls-buttons"> <button id="playBtn" class="btn-control" disabled aria-label="Play">\u25B6</button> <button id="pauseBtn" class="btn-control" disabled aria-label="Pause">\u23F8</button> <div class="btn-control-wrapper"> <button id="slowBtn" class="btn-control" disabled aria-label="Slow down playback"> ', ' </button> <div id="speedDisplay" class="speed-display" aria-live="polite"></div> </div> <button id="resetBtn" class="btn-control" disabled aria-label="Reset to start">\u21BB</button> </div> </div> <!-- Scrubber --> <div class="scrubber-container"> <label for="scrubber" class="sr-only">Video timeline scrubber</label> <input type="range" id="scrubber" min="0" max="100" value="0" step="0.1" disabled> <div class="scrubber-markers" id="markers"></div> </div> </div> <!-- Timing Notes Sidebar --> <div class="notes-list"> <!-- Mode Toggle --> <div class="sidebar-mode-toggle"> <button id="toggleSidebarMode" class="btn-primary">\nPlay Mode</button> <button id="toggleActiveMode" class="btn-secondary">\nActive: OFF</button> </div> <!-- Play Mode --> <div id="playMode" class="play-mode" role="region" aria-label="Timing notes list"> <h4>All Timing Notes:</h4> <div id="notesList">No notes loaded</div> </div> <!-- Edit Mode --> <div id="editMode" class="hidden"> <div class="edit-mode-header"> <h4>Edit Notes</h4> <button id="toggleBuilderMode" class="btn-primary btn-sm btn-builder-toggle">\nJSON Editor</button> </div> <!-- Builder Mode --> <div id="builderMode"> <button id="addNoteAtTime" class="btn-accent btn-full-width btn-lg">\n+ Add Note at Current Time\n</button> <div id="notesBuilder" class="notes-builder"> <p class="notes-empty-state">\nNo notes yet. Click "Add Note at Current Time" to get started.\n</p> </div> <!-- Edit Panel (hidden by default) --> <div id="editPanel" class="edit-panel hidden"> <h4>Edit Note</h4> <div class="form-group"> <label for="editTime">Time</label> <input type="number" id="editTime" step="0.1" placeholder="133.5"> <small id="editTimeFormatted"></small> </div> <div class="form-group"> <label for="editMessage">Message</label> <input type="text" id="editMessage" placeholder="Section name"> </div> <details class="advanced-options"> <summary>Advanced Options</summary> <div class="form-group"> <label> <input type="checkbox" id="editCountTo">\nEnable Count-in\n</label> <input type="number" id="editCountMeasures" min="1" value="1" placeholder="Measures" class="input-inline-sm"> </div> <div class="form-group"> <label> <input type="checkbox" id="editResetBpm">\nBPM Reset\n</label> <input type="number" id="editNewBpm" min="1" placeholder="New BPM" class="input-inline-sm"> </div> <div class="form-group"> <label> <input type="checkbox" id="editInvisible">\nHidden (BPM resets only)\n</label> </div> <div class="form-group"> <label for="editColor">Color</label> <select id="editColor"> <option value="">Auto-assign</option> <option value="#D8A7B1">Pink</option> <option value="#E8A87C">Orange</option> <option value="#D4B483">Tan</option> <option value="#A3B18A">Green</option> <option value="#E5989B">Rose</option> <option value="#B8A9C9">Purple</option> <option value="#C97C5D">Brown</option> <option value="#7D9BA6">Blue</option> </select> </div> </details> <div class="edit-actions"> <button id="saveNote" class="btn-primary">Save</button> <button id="cancelEdit" class="btn-secondary">Cancel</button> <button id="deleteNote" class="btn-delete">Delete</button> </div> </div> </div> <!-- JSON Mode --> <div id="jsonMode" class="hidden"> <label for="timingNotes" class="sr-only">Timing notes JSON</label> <textarea id="timingNotes" rows="15"></textarea> <small>\nTimes are absolute video seconds (e.g. 133 = 2min 13sec in the\n								video). Colors are auto-assigned from palette. Add "countTo":\n								true to enable count-in. Add "resetBpm": true with "newBpm": 120\n								to change tempo. Add "invisible": true to hide from display.\n</small> <div id="jsonStatus" class="json-status"></div> <button id="validateJson" class="btn-secondary btn-full-width">Validate JSON</button> </div> </div> </div> </div> </div> <script>(function(){', "\n			window.timingNotesData = timingNotesData\n			window.mightyToSaveTimingData = mightyToSaveTimingData\n			window.alwaysInvisibleTimingData = alwaysInvisibleTimingData\n		})();<\/script> ", " </div>"])), maybeRenderHead(), renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData }), renderComponent($$result2, "Icon", $$Icon, { "name": "mdi:snail", "aria-hidden": "true" }), defineScriptVars({
    timingNotesData,
    mightyToSaveTimingData,
    alwaysInvisibleTimingData
  }), renderScript($$result2, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/youtube-timer.astro?astro&type=script&index=0&lang.ts")), "head": ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": ($$result3) => renderTemplate` <link rel="preconnect" href="https://www.youtube.com"> <link rel="preconnect" href="https://i.ytimg.com"> ` })}` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/youtube-timer.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/youtube-timer.astro";
const $$url = "/play/youtube-timer";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$YoutubeTimer,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
