import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_BDmygan7.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DaOo42CO.mjs';
import { $ as $$RecentItems } from '../chunks/RecentItems_DHrAlstg.mjs';
export { renderers } from '../renderers.mjs';

const $$Thoughts = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = `Penia's Salad Blog`;
  const description = "Play page that showcases experiments";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "description": description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "RecentItems", $$RecentItems, { "category": "thoughts" })} ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts.astro";
const $$url = "/thoughts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Thoughts,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
