import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BDmygan7.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DaOo42CO.mjs';
import { $ as $$RecentItems } from '../chunks/RecentItems_DHrAlstg.mjs';
export { renderers } from '../renderers.mjs';

const $$Play = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "Play";
  const description = "Play page that showcases experiments";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content"> <p style="text-align: center;">
Here is a collection of experiments and tools I've built for fun or to
			learn new skills.
</p> ${renderComponent($$result2, "RecentItems", $$RecentItems, { "category": "play" })} </div> ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play.astro";
const $$url = "/play";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Play,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
