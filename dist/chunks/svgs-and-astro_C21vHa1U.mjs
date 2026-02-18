import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, a as renderComponent, j as unescapeHTML, F as Fragment } from './astro/server_DHeFfUaE.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_Cfyy66sH.mjs';
import { $ as $$BlogDetails } from './BlogDetails_PGawQXJc.mjs';
import { getHighlighter } from 'shiki';
/* empty css                                  */

const $$Astro$1 = createAstro("https://dv-astro.netlify.app/");
const $$CodeBlock = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CodeBlock;
  const { code, lang = "typescript" } = Astro2.props;
  const theme = "material-theme-palenight";
  const highlighter = await getHighlighter({
    // Specify themes array
    themes: [theme],
    // Specify the languages you need
    langs: ["typescript", "javascript", "jsx", "tsx", "html", "css", "astro"]
  });
  const html = highlighter.codeToHtml(code, {
    lang,
    theme
  });
  highlighter.dispose();
  return renderTemplate`${maybeRenderHead()}<div class="code-block" data-astro-cid-jgrc2lfe> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(html)}` })} </div> `;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/CodeBlock.astro", void 0);

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "SVGs and Astro",
  author: "David Volz",
  description: `Playing with some shapes and grids.`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  pubDate: "2025-1-3",
  tags: ["css", "code", "design", "fluff"],
  featured: true
};
const $$SvgsAndAstro = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SvgsAndAstro;
  const showTypographyHero = true;
  const fullWidthBody = true;
  const catInline = `---
import CatSvg from '../../assets/svgs/cat.svg'
---

<CatSvg />`;
  const catSprite = `---
import CatSvg from '../../assets/svgs/cat.svg'
---

<CatSvg mode="sprite" />`;
  const catAstro4 = `---
import CatSVGFile from '../svgs/cat.svg?raw'
---

<Fragment set:html={CatSVGFile} />`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "showTypographyHero": showTypographyHero, "description": blogData.description, "fullWidthBody": fullWidthBody }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="details-width"> ${renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData })} </div> <div class="article"> <p>
I have recently started to build this new personal site using Astro. I had
			started developing it using Astro version 4 but soon after I began so I
			just recently switched to Astro 5. With Astro 5, comes an <a href="https://docs.astro.build/en/reference/experimental-flags/svg/" target="_blank">experimental feature that features SVGs</a>. The feature allows you to import SVGs and to use them as Astro
			components.
</p> <p>
With Astro 5, you can now import SVG files and use them as components,
			which makes adding SVGs to your projects way easier. Before this, Astro 4
			didn’t have a built-in way to handle SVGs, so you had to rely on clunky
			workarounds that often added unnecessary client-side JavaScript. This
			update cuts out the hassle and keeps your code cleaner and faster.
</p> <h3>Import Options</h3> <h4>Inline</h4> <p>
The simplest way to include an SVG on a page is below. This would pass no
			props to the SVG.
</p> ${renderComponent($$result2, "CodeBlock", $$CodeBlock, { "code": catInline, "lang": "astro" })} <p>
The output is a cleaner SVG with attributes such as xmlns and version
			stripped out. Importing it this way will allow you to you pass it any
			standard SVG as a prop. This includes the attributes below.
</p> <ul> <li><code>width</code></li> <li><code>height</code></li> <li><code>fill</code></li> <li><code>stroke</code></li> <li><code>viewBox</code></li> <li><code>role</code></li> <li><code>aria-label</code></li> <li><code>class</code></li> </ul> <p>
You can also pass it a <code>size</code> attribute which would apply that value
			to both the width and the height. This is particularly useful for icons that
			you want to keep uniform in size.
</p> <h4>Sprite Mode</h4> <p>
Another way to include an SVG is to use the sprite mode. This will allow
			you to include the SVG multiple times on a page without adding extra
			weight to the page. This is particularly useful for icons that are used
			multiple times on a page.
</p> ${renderComponent($$result2, "CodeBlock", $$CodeBlock, { "code": catSprite, "lang": "astro" })} <p>
When you include the SVG in sprite mode, Astro will only include the SVG
			one time on the page using the symbol tag. Then all subsequent uses of the
			of that SVG will use the symbol tag to reference the original SVG. This
			will help keep the page size down and improve performance while still
			being able to affect the innards of the SVG with custom CSS.
</p> <h3>Astro 4</h3> <p>
These new features were refreshing after working with Astro 4. In Astro 4,
			I had to use a workaround to include SVGs. I had to import the SVG as a
			raw file and then use the <code>Fragment</code> component to render the SVG.
			This was a bit clunky and not as clean as the new way in Astro 5.
</p> ${renderComponent($$result2, "CodeBlock", $$CodeBlock, { "code": catAstro4, "lang": "astro" })} <p>
Much thanks for the Astro community for implementing this feature. I read
			through their <a href="https://github.com/withastro/roadmap/pull/1035" target="_blank">proposal discussions for this feature</a>
and there is a lot more info there about this feature and their motiviations
			and goals for this update. I am excited to see what else they have in store.
</p> </div> ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/svgs-and-astro.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/svgs-and-astro.astro";
const $$url = "/play/svgs-and-astro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$SvgsAndAstro,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
