import { a as createComponent, r as renderTemplate, b as renderComponent } from '../chunks/astro/server_9QOt-6f6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_MLDguVh-.mjs';
import { $ as $$RecentItems } from '../chunks/RecentItems_CKHTREov.mjs';
export { renderers } from '../renderers.mjs';

const $$Thoughts = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = `Penia's Salad Blog`;
  const description = "Play page that showcases experiments";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "description": description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "RecentItems", $$RecentItems, { "category": "thoughts" })} ` })}`;
}, "/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts.astro";
const $$url = "/thoughts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Thoughts,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
