import { c as createComponent, r as renderTemplate, m as maybeRenderHead, a as renderComponent, e as renderScript } from '../chunks/astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { a as $$Icon, $ as $$BaseLayout } from '../chunks/BaseLayout_hcN8E3TP.mjs';
/* empty css                                 */
import { $ as $$RecentItems } from '../chunks/RecentItems_DF3WeRxQ.mjs';
export { renderers } from '../renderers.mjs';

const $$HomeContent = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="home-content" data-astro-cid-bobyx3ht> <a href="/thoughts" class="box" data-astro-cid-bobyx3ht> <div class="top" data-astro-cid-bobyx3ht> ${renderComponent($$result, "Icon", $$Icon, { "name": "mdi:brain", "style": "stroke: var(--text-color); stroke-width: .3;", "data-astro-cid-bobyx3ht": true })} <h4 data-astro-cid-bobyx3ht>Thoughts</h4> </div> <p data-astro-cid-bobyx3ht>Read my thoughts on various topics.</p> </a> <a href="/play" class="box" data-astro-cid-bobyx3ht> <div class="top" data-astro-cid-bobyx3ht> ${renderComponent($$result, "Icon", $$Icon, { "name": "mdi:palette-outline", "style": "stroke: var(--text-color); stroke-width: .3;", "data-astro-cid-bobyx3ht": true })} <h4 data-astro-cid-bobyx3ht>Play</h4> </div> <p data-astro-cid-bobyx3ht>Check out some of my ideas.</p> </a> </div>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/HomeContent.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const pageTitle = "Hello and welcome";
  const description = "David Volz's Personal Site";
  const subTitle = "I am David Volz, a software manager and engineer";
  return renderTemplate`${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "subTitle": subTitle, "description": description, "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<div class="home-blurb" data-astro-cid-j7pv25f6><p data-astro-cid-j7pv25f6>
Welcome to my personal site—a space where I share ideas, experiment with
			code, and explore creativity. With a background in both design and
			development, I enjoy blending the two to create something unique.
</p><p class="join" data-astro-cid-j7pv25f6>
Join me as I <a class="changing-link" href="/play/shapes-and-grids" data-astro-cid-j7pv25f6><span data-astro-cid-j7pv25f6>play with the grid</span></a>.
</p></div>${renderComponent($$result2, "HomeContent", $$HomeContent, { "data-astro-cid-j7pv25f6": true })}<h3 class="full-line" data-astro-cid-j7pv25f6>Recent Posts</h3>${renderComponent($$result2, "RecentItems", $$RecentItems, { "featured": "true", "data-astro-cid-j7pv25f6": true })}` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/index.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
