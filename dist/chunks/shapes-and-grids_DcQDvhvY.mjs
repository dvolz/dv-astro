import { b as createAstro, c as createComponent, r as renderTemplate, e as renderScript, a as renderComponent, m as maybeRenderHead, j as unescapeHTML } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { a as $$Icon, $ as $$BaseLayout } from './BaseLayout_hcN8E3TP.mjs';
import { $ as $$BlogDetails } from './BlogDetails_BIm46kxo.mjs';
/* empty css                                    */
/* empty css                            */
import katex from 'katex';

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "Shapes and Grids",
  author: "David Volz",
  description: `Playing with some shapes and grids.`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  display: true,
  pubDate: "2024-11-22",
  tags: ["css", "code", "design", "fluff"],
  featured: true
};
const $$ShapesAndGrids = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ShapesAndGrids;
  const showTypographyHero = true;
  const theme = "inverted";
  const fullWidthBody = true;
  const mathExpressions = [
    { id: "w", expression: "w = 60\\%", description: "Width percentage" },
    {
      id: "smallColumnWidth",
      expression: "smallColumnWidth = 100 - w",
      description: "Small column width"
    },
    {
      id: "boxWidth",
      expression: "boxWidth = 100 - (smallColumnWidth \\times 2)",
      description: "Box width"
    },
    {
      id: "gaussianIntegral",
      expression: "\\int_{-\\infty}^\\infty e^{-x^2} \\, dx = \\sqrt{\\pi}",
      description: "Integral of a Gaussian"
    },
    {
      id: "seriesSum",
      expression: "\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
      description: "Sum of the Basel problem"
    }
  ];
  const renderedMath = mathExpressions.map((item) => ({
    id: item.id,
    html: katex.renderToString(item.expression, { throwOnError: false }),
    description: item.description
  }));
  return renderTemplate`${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/shapes-and-grids.astro?astro&type=script&index=0&lang.ts")}${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "showTypographyHero": showTypographyHero, "description": blogData.description, "theme": theme, "fullWidthBody": fullWidthBody, "display": blogData.display, "data-astro-cid-2aax352x": true }, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<div class="details-width" data-astro-cid-2aax352x>${renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData, "data-astro-cid-2aax352x": true })}</div><div class="article" data-astro-cid-2aax352x><h3 data-astro-cid-2aax352x>The Design</h3><p data-astro-cid-2aax352x>
A couple years back I was working a site that had a layout that stuck in
			my mind far after completing it. It had two rows. Both rows had two
			columns with about a 3/5 width and a 2/5 width. The first row had the big
			column on the left and then the second row had the big column on the
			right.
</p><p data-astro-cid-2aax352x>
The design also featured a centered square that dynamically aligned with
			the inner edges of the columns, maintaining its proportions as the screen
			size changed. At the time I just played with the percentages until
			everything lined up. I wanted to revisit this design to see if I could
			make it interactive.
</p><p class="instruction" data-astro-cid-2aax352x>
Click and drag the resize handle to see how the columns and box adjust.
</p></div><div class="row example-box" data-astro-cid-2aax352x><div class="column example-column" data-astro-cid-2aax352x></div><div class="column example-column" data-astro-cid-2aax352x></div><div class="column example-column" data-astro-cid-2aax352x></div><div class="column example-column" data-astro-cid-2aax352x></div><div class="box" data-astro-cid-2aax352x></div><div class="resize-handle" data-astro-cid-2aax352x>${renderComponent($$result2, "Icon", $$Icon, { "name": "mdi:arrow-split-vertical", "style": "stroke: var(--text-color); stroke-width: .3;", "data-astro-cid-2aax352x": true })}</div></div><div class="article" data-astro-cid-2aax352x><h4 data-astro-cid-2aax352x>Responsive Squares</h4><p data-astro-cid-2aax352x>
Before encountering this design, I had known that if you give a block
			element a padding-bottom of 100% it would render as a square as long as it
			had a 100% width. What I didn't know was that you could give it a width of
			50% and a padding-bottom of 50% and it would still render as a square. So
			knowing this, I can resize the square along with the columns and still
			keep the proportions of a square.
</p><p data-astro-cid-2aax352x>
Looking into it a little further I learned when you set padding-bottom:
			100% on a div, the height of the padding becomes 100% of the width of the
			div. Since padding adds space inside the div without directly affecting
			its width, this effectively creates a box where the height equals the
			width.
</p><p data-astro-cid-2aax352x>Please humor me while I display this below real quick.</p><div class="box-1 width-box" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>
width = 50%<br data-astro-cid-2aax352x>
padding-bottom = 50%
</p></div><div class="box-2 width-box" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>
width = 75%<br data-astro-cid-2aax352x>
padding-bottom = 75%
</p></div><h4 data-astro-cid-2aax352x>Aspect Ratio</h4><p data-astro-cid-2aax352x>
All this padding-bottom talk isn't really necessary anymore with the
			advent of <code data-astro-cid-2aax352x>aspect-ratio</code>. This is a much cleaner and
			straightforward approach.
</p><div class="box-3 width-box" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>
width = 50%<br data-astro-cid-2aax352x>
aspect-ratio = 1/1
</p></div><h4 data-astro-cid-2aax352x>Square Positioning</h4><p data-astro-cid-2aax352x>
In order to keep the square centered while having its width change I am
			absolutely positioning the square. I noticed that at certain widths the
			border of the square is not perfectly aligned with the column on the
			right. It isn't off by much, but the line looks thicker than the line on
			the left. If I adjust it to look good at one resolution it glitches at
			other resolutions.
</p><p data-astro-cid-2aax352x>
I tried a completely different layout where I use flex to position the
			square and used aspect-ratio to maintain the square shape but it had the
			same issue. This is an issue I will not go down the rabbit hole to fix as
			there are no project requirements.
</p><p data-astro-cid-2aax352x>
If this was a real project, I would suggest having larger borders to hide
			the inconsistency as long as that aligned with design's goals.
</p><h3 data-astro-cid-2aax352x>The Idea</h3><p data-astro-cid-2aax352x>
I had the idea to make a slider that controls the width of all the
			elements inside. If you change the width of the big column, the rest of
			the widths and proportions would update.
</p><blockquote data-astro-cid-2aax352x>
I admit this math isn't very complicated. But it's still fun.
</blockquote><div class="tip tip-left tip-hidden" data-astro-cid-2aax352x><div class="tip-inner" id="tipContainer" data-astro-cid-2aax352x>
I am using <a href="https://katex.org/" title="Katex Official Site" target="_blank" data-astro-cid-2aax352x>Katex</a> to render this math. My math here is too simple to look real cool <span class="emoji" data-astro-cid-2aax352x>💀</span></div></div><h3 data-astro-cid-2aax352x>The Math</h3><h5 data-astro-cid-2aax352x>Big Column Width</h5><div class="math" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>${unescapeHTML(renderedMath.find(({ id }) => id === "w").html)}</p></div><h5 data-astro-cid-2aax352x>Small Column Width</h5><div class="math" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>${unescapeHTML(renderedMath.find(({ id }) => id === "smallColumnWidth").html)}</p><p class="result" data-astro-cid-2aax352x>Result: 40%</p></div><h5 data-astro-cid-2aax352x>Box Width</h5><div class="math" data-astro-cid-2aax352x><p data-astro-cid-2aax352x>${unescapeHTML(renderedMath.find(({ id }) => id === "boxWidth").html)}</p><p class="result" data-astro-cid-2aax352x>Result: 20%</p></div><p data-astro-cid-2aax352x>
After calculating the proportions, I implemented a slider that updates the
			values in real-time as you adjust it, allowing for an interactive
			demonstration of the layout.
</p><p data-astro-cid-2aax352x>
The inner box can get too tall for the container so once the box height is
			taller than the container I change the amount of padding-bottom it gets.
			This changes it from a square to a rectangle.
</p><h3 data-astro-cid-2aax352x>The Result</h3></div><div class="grid-feature" data-astro-cid-2aax352x><div class="controls" data-astro-cid-2aax352x><label data-astro-cid-2aax352x><p class="sliderLabel" data-astro-cid-2aax352x>Box Width</p><p class="sliderValue" data-astro-cid-2aax352x><span id="boxWidthValue" data-astro-cid-2aax352x>60</span>%
</p><input type="range" id="boxWidthSlider" min="51" max="95" value="60" step="0.01" data-astro-cid-2aax352x></label></div><div class="row box-lines" data-astro-cid-2aax352x><div class="column column-box-lines" data-astro-cid-2aax352x></div><div class="column column-box-lines" data-astro-cid-2aax352x></div><div class="column column-box-lines" data-astro-cid-2aax352x></div><div class="column column-box-lines" data-astro-cid-2aax352x></div><div class="box" data-astro-cid-2aax352x><div class="box-height" data-astro-cid-2aax352x></div></div></div></div>${renderScript($$result2, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/shapes-and-grids.astro?astro&type=script&index=1&lang.ts")}` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/shapes-and-grids.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/shapes-and-grids.astro";
const $$url = "/play/shapes-and-grids";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$ShapesAndGrids,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
