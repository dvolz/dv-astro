import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_hcN8E3TP.mjs';
import { $ as $$RecentItems } from '../chunks/RecentItems_DF3WeRxQ.mjs';
export { renderers } from '../renderers.mjs';

const $$Play = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "Play";
  const description = "Play page that showcases experiments";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="content"> <p>
The idea here is to talk about my love for seeing structured html become
			styled by css and into a useful format. An idea is to show the code on the
			left and then a button or something to add upgrade the link at at time.
			Like it starts of as unstyled link, then a basic button, then some more
			things
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
