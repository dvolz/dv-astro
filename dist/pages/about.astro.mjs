import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_hcN8E3TP.mjs';
export { renderers } from '../renderers.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "About Me";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="article"> <p>
Before I rehaul this page and make it look more complete, I will briefly
			tell you about myself. I live in San Diego, CA and have a background in
			both web design and development. I love the ability to display ideas in an
			interactive way combining CSS with JS to create a unique experience.
</p> </div> ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/about.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$About,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
