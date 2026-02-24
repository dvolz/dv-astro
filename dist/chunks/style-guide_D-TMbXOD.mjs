import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './astro/server_BDmygan7.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_DaOo42CO.mjs';
import { $ as $$BlogDetails } from './BlogDetails_BwLfRjDy.mjs';
/* empty css                               */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "Style Guide",
  author: "David Volz",
  description: `A living reference of every visual element on this site.`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  pubDate: "2026-2-21",
  tags: ["design", "css", "reference"],
  featured: true,
  display: true
};
const $$StyleGuide = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StyleGuide;
  const showTypographyHero = true;
  const fullWidthBody = true;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "showTypographyHero": showTypographyHero, "description": blogData.description, "fullWidthBody": fullWidthBody, "data-astro-cid-efegbnsl": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="details-width" data-astro-cid-efegbnsl> ${renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData, "data-astro-cid-efegbnsl": true })} </div> <div class="article" data-astro-cid-efegbnsl> <p data-astro-cid-efegbnsl>
This page is a living style guide — a single place to see every visual
			element used across the site. It's meant to keep things consistent and
			serve as a reference when building new pages. If you add a new pattern,
			drop it here too.
</p> <!-- ════════════════════════════════════════════ --> <!-- COLORS --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Colors</h3> <p data-astro-cid-efegbnsl>The core palette is defined as CSS custom properties on the body.</p> <div class="sg-swatches" data-astro-cid-efegbnsl> <div class="sg-swatch" style="--sw: var(--primary-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--primary-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#29435c</em></span> </div> <div class="sg-swatch" style="--sw: var(--secondary-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--secondary-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#568091</em></span> </div> <div class="sg-swatch" style="--sw: var(--accent-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--accent-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#5bb598</em></span> </div> <div class="sg-swatch" style="--sw: var(--highlight-secondary);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--highlight-secondary<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#4a97b8</em></span> </div> <div class="sg-swatch" style="--sw: var(--highlight-accent);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--highlight-accent<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#55c892</em></span> </div> <div class="sg-swatch" style="--sw: var(--text-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--text-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#332e2e</em></span> </div> <div class="sg-swatch" style="--sw: var(--background-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block sg-swatch-block--light" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--background-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#fff7f2</em></span> </div> <div class="sg-swatch" style="--sw: var(--link-color);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--link-color<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#2f5362</em></span> </div> <div class="sg-swatch" style="--sw: var(--link-hover);" data-astro-cid-efegbnsl> <div class="sg-swatch-block" data-astro-cid-efegbnsl></div> <span class="sg-swatch-label" data-astro-cid-efegbnsl>--link-hover<br data-astro-cid-efegbnsl><em data-astro-cid-efegbnsl>#16688b</em></span> </div> </div> <!-- ════════════════════════════════════════════ --> <!-- TYPOGRAPHY --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Typography</h3> <p data-astro-cid-efegbnsl>
Two font families are used: <strong data-astro-cid-efegbnsl>Source Serif 4</strong> (<code data-astro-cid-efegbnsl>--p-font</code>) for body copy and <strong data-astro-cid-efegbnsl>Poppins</strong> (<code data-astro-cid-efegbnsl>--a-font</code>) for
			headings and accents.
</p> <div class="sg-type-specimen" data-astro-cid-efegbnsl> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h1</span> <h1 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h1> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h2</span> <h2 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h2> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h3</span> <h3 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h3> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h4</span> <h4 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h4> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h5</span> <h5 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h5> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>h6</span> <h6 class="sg-inline" data-astro-cid-efegbnsl>The quick brown fox</h6> </div> <div class="sg-type-row" data-astro-cid-efegbnsl> <span class="sg-type-label" data-astro-cid-efegbnsl>p</span> <p class="sg-inline" data-astro-cid-efegbnsl>
Body text at 1.7rem / 1.8rem on tablet+. Source Serif 4, weight 400.
					This is what most of the content on the site looks like.
</p> </div> </div> <!-- ════════════════════════════════════════════ --> <!-- LINKS --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Links</h3> <p data-astro-cid-efegbnsl>
Internal links use the default <code data-astro-cid-efegbnsl>--link-color</code> and transition to <code data-astro-cid-efegbnsl>--link-hover</code>
on hover.
</p> <p data-astro-cid-efegbnsl> <a href="/about/" data-astro-cid-efegbnsl>Internal link example</a> </p> <h4 data-astro-cid-efegbnsl>External Links</h4> <p data-astro-cid-efegbnsl>
Outbound links get the gradient accent bar, bold weight, and ↗ arrow
			treatment automatically.
</p> <p data-astro-cid-efegbnsl> <a href="https://astro.build" target="_blank" data-astro-cid-efegbnsl>Astro</a> ·
<a href="https://developer.mozilla.org" target="_blank" data-astro-cid-efegbnsl>MDN Web Docs</a> ·
<a href="https://fonts.google.com" target="_blank" data-astro-cid-efegbnsl>Google Fonts</a> </p> <!-- ════════════════════════════════════════════ --> <!-- BUTTONS --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Buttons</h3> <p data-astro-cid-efegbnsl>
The <code data-astro-cid-efegbnsl>.line-button</code> is the primary interactive element — a double-border
			pill that highlights on hover.
</p> <div class="sg-button-row" data-astro-cid-efegbnsl> <a href="#" class="line-button" data-astro-cid-efegbnsl>Default</a> <a href="#" class="line-button" data-astro-cid-efegbnsl>Another Action</a> </div> <!-- ════════════════════════════════════════════ --> <!-- INLINE CODE --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Inline Code</h3> <p data-astro-cid-efegbnsl>
Inline code uses a reversed color scheme: <code data-astro-cid-efegbnsl>background: --text-color</code>
and <code data-astro-cid-efegbnsl>color: --background-color</code> with a 4px border-radius.
</p> <p data-astro-cid-efegbnsl>
Example: Use <code data-astro-cid-efegbnsl>&lt;script is:inline&gt;</code> to bypass processing.
</p> <!-- ════════════════════════════════════════════ --> <!-- BLOCKQUOTE --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Blockquotes</h3> <p data-astro-cid-efegbnsl>
Blockquotes are large, italic, with a left accent bar using <code data-astro-cid-efegbnsl>--contrast-background-color</code>.
</p> <blockquote data-astro-cid-efegbnsl>
Design is not just what it looks like and feels like. Design is how it
			works.
</blockquote> <!-- ════════════════════════════════════════════ --> <!-- TIPS --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Tips</h3> <p data-astro-cid-efegbnsl>
Tips are sidebar callouts that attach to the left or right gutter on
			desktop. They use <code data-astro-cid-efegbnsl>--highlight-accent</code> as a translucent backdrop.
</p> <div class="tip tip-left" data-astro-cid-efegbnsl> <div class="tip-inner" data-astro-cid-efegbnsl> <p data-astro-cid-efegbnsl>
This is a <strong data-astro-cid-efegbnsl>left-aligned tip</strong>. On wide screens it floats
					in the left gutter alongside the content.
</p> </div> </div> <p data-astro-cid-efegbnsl>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
			tempor incididunt ut labore et dolore. This paragraph sits next to the tip
			on desktop and gives it context.
</p> <div class="tip tip-right" data-astro-cid-efegbnsl> <div class="tip-inner" data-astro-cid-efegbnsl> <p data-astro-cid-efegbnsl>
This is a <strong data-astro-cid-efegbnsl>right-aligned tip</strong>. On wide screens it
					floats in the right gutter.
</p> </div> </div> <p data-astro-cid-efegbnsl>
And this paragraph sits beside the right-side tip. On mobile, tips stack
			normally in flow.
</p> <!-- ════════════════════════════════════════════ --> <!-- LISTS --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Lists</h3> <h4 data-astro-cid-efegbnsl>Unordered List</h4> <ul data-astro-cid-efegbnsl> <li data-astro-cid-efegbnsl>First list item with some content</li> <li data-astro-cid-efegbnsl>Second list item — a bit longer to see how wrapping behaves</li> <li data-astro-cid-efegbnsl>Third item</li> </ul> <h4 data-astro-cid-efegbnsl>Ordered List</h4> <ol data-astro-cid-efegbnsl> <li data-astro-cid-efegbnsl>Step one: set up the project</li> <li data-astro-cid-efegbnsl>Step two: add styles</li> <li data-astro-cid-efegbnsl>Step three: ship it</li> </ol> <!-- ════════════════════════════════════════════ --> <!-- FIGURES / IMAGES --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Figures</h3> <p data-astro-cid-efegbnsl>
Figures use a thin border with <code data-astro-cid-efegbnsl>--text-color</code> and centered content.
			On desktop, they break out to span the full article grid.
</p> <figure data-astro-cid-efegbnsl> <div class="sg-placeholder-image" data-astro-cid-efegbnsl>960 × 320 image placeholder</div> <figcaption data-astro-cid-efegbnsl>
A descriptive caption rendered in italic at 1.6rem.
</figcaption> </figure> <!-- ════════════════════════════════════════════ --> <!-- SOLO LINE (DECORATIVE BAR) --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Solo Line</h3> <p data-astro-cid-efegbnsl>
The <code data-astro-cid-efegbnsl>.solo-line</code> class adds a decorative accent bar beneath an element
			that fills on hover. Used on the header nav and footer.
</p> <div class="sg-solo-line-demo solo-line" data-astro-cid-efegbnsl> <p data-astro-cid-efegbnsl>Hover me to see the accent bar fill</p> </div> <!-- ════════════════════════════════════════════ --> <!-- DOUBLE-BORDER FRAME --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Double-Border Frame</h3> <p data-astro-cid-efegbnsl>
The card frame used in <code data-astro-cid-efegbnsl>.recentItems</code> — an outer stroke, a color-gap
			border, and an inner stroke. Hover changes the gap color.
</p> <div class="sg-frame-demo" data-astro-cid-efegbnsl> <div class="sg-frame-card" data-astro-cid-efegbnsl> <p class="sg-frame-title" data-astro-cid-efegbnsl>Card Title</p> <p class="sg-frame-desc" data-astro-cid-efegbnsl>
A short description that sits inside the double-border frame.
</p> </div> </div> <!-- ════════════════════════════════════════════ --> <!-- TYPOGRAPHY HERO --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Typography Hero</h3> <p data-astro-cid-efegbnsl>
Every page starts with a hero block: page title in <strong data-astro-cid-efegbnsl>Poppins 700</strong>
at 5rem (7.5rem on desktop), an optional subtitle, and a green accent bar bordered
			by <code data-astro-cid-efegbnsl>--text-color</code>.
</p> <div class="sg-hero-demo" data-astro-cid-efegbnsl> <p class="sg-hero-title" data-astro-cid-efegbnsl>Page Title</p> <p class="sg-hero-sub" data-astro-cid-efegbnsl>An optional subtitle line</p> <div class="sg-hero-bar" data-astro-cid-efegbnsl></div> </div> <!-- ════════════════════════════════════════════ --> <!-- SPACING & LAYOUT --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Spacing &amp; Layout</h3> <p data-astro-cid-efegbnsl>
The site uses a 3-column CSS grid (<code data-astro-cid-efegbnsl>.site</code>) with areas for
			header, main, sidebar, and footer. Content sits in <code data-astro-cid-efegbnsl>.content</code>
with <code data-astro-cid-efegbnsl>3rem 2.5rem</code> padding, and articles max at <code data-astro-cid-efegbnsl>55rem</code>
(or <code data-astro-cid-efegbnsl>120rem</code> with the 3-col grid on desktop).
</p> <div class="sg-spacing-grid" data-astro-cid-efegbnsl> <div class="sg-spacing-box" data-astro-cid-efegbnsl><span data-astro-cid-efegbnsl>header</span></div> <div class="sg-spacing-box sg-spacing-main" data-astro-cid-efegbnsl><span data-astro-cid-efegbnsl>main</span></div> <div class="sg-spacing-box" data-astro-cid-efegbnsl><span data-astro-cid-efegbnsl>sidebar</span></div> <div class="sg-spacing-box sg-spacing-full" data-astro-cid-efegbnsl><span data-astro-cid-efegbnsl>footer</span></div> </div> <!-- ════════════════════════════════════════════ --> <!-- ANIMATION --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>Animation</h3> <p data-astro-cid-efegbnsl>
Transitions default to <code data-astro-cid-efegbnsl>0.3s ease</code>. Accent-specific animations
			include a gentle pulse for instructional elements and the sad bounce on
			emoji. Custom cursor on hover.
</p> <div class="sg-anim-row" data-astro-cid-efegbnsl> <p class="instruction" data-astro-cid-efegbnsl>↕ Pulse animation</p> <span class="emoji" data-astro-cid-efegbnsl>😢</span> </div> <!-- ════════════════════════════════════════════ --> <!-- CSS VARIABLES REFERENCE --> <!-- ════════════════════════════════════════════ --> <h3 data-astro-cid-efegbnsl>CSS Custom Properties Reference</h3> <p data-astro-cid-efegbnsl>All variables defined on <code data-astro-cid-efegbnsl>:global(body)</code>:</p> <div class="sg-var-table" data-astro-cid-efegbnsl> <div class="sg-var-row sg-var-header" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl>Property</span><span data-astro-cid-efegbnsl>Value</span><span data-astro-cid-efegbnsl>Usage</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--p-font</code></span> <span data-astro-cid-efegbnsl>Source Serif 4</span> <span data-astro-cid-efegbnsl>Body text</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--a-font</code></span> <span data-astro-cid-efegbnsl>Poppins</span> <span data-astro-cid-efegbnsl>Headings, accents</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--primary-color</code></span> <span data-astro-cid-efegbnsl>#29435c</span> <span data-astro-cid-efegbnsl>Deep brand tone</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--secondary-color</code></span> <span data-astro-cid-efegbnsl>#568091</span> <span data-astro-cid-efegbnsl>Muted complement</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--accent-color</code></span> <span data-astro-cid-efegbnsl>#5bb598</span> <span data-astro-cid-efegbnsl>Hero bars, accents</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--highlight-secondary</code></span> <span data-astro-cid-efegbnsl>#4a97b8</span> <span data-astro-cid-efegbnsl>Blue highlights</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--highlight-accent</code></span> <span data-astro-cid-efegbnsl>#55c892</span> <span data-astro-cid-efegbnsl>Green highlights</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--text-color</code></span> <span data-astro-cid-efegbnsl>#332e2e</span> <span data-astro-cid-efegbnsl>Default text</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--background-color</code></span> <span data-astro-cid-efegbnsl>#fff7f2</span> <span data-astro-cid-efegbnsl>Page background</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--link-color</code></span> <span data-astro-cid-efegbnsl>#2f5362</span> <span data-astro-cid-efegbnsl>Link default</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--link-hover</code></span> <span data-astro-cid-efegbnsl>#16688b</span> <span data-astro-cid-efegbnsl>Link hover</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--contrast-background-color</code></span> <span data-astro-cid-efegbnsl>var(--primary-color)</span> <span data-astro-cid-efegbnsl>Blockquote bar</span> </div> <div class="sg-var-row" data-astro-cid-efegbnsl> <span data-astro-cid-efegbnsl><code data-astro-cid-efegbnsl>--tablet</code></span> <span data-astro-cid-efegbnsl>768px</span> <span data-astro-cid-efegbnsl>Breakpoint</span> </div> </div> </div> ` })} `;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/style-guide.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/style-guide.astro";
const $$url = "/play/style-guide";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$StyleGuide,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
