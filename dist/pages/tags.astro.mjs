import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_DHeFfUaE.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Cfyy66sH.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const allPosts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../thoughts/post-1.md": () => import('../chunks/post-1_BvYlkjSE.mjs').then(n => n._),"../thoughts/post-2.md": () => import('../chunks/post-2_BlocIOec.mjs').then(n => n._),"../thoughts/post-3.md": () => import('../chunks/post-3_BDoWn6_p.mjs').then(n => n._),"../thoughts/post-4.md": () => import('../chunks/post-4_BPZoHAz5.mjs').then(n => n._)}), () => "../thoughts/*.md");
  const tags = [...new Set(allPosts.map((post) => post.frontmatter.tags).flat())];
  const pageTitle = "TagZONE";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": pageTitle, "data-astro-cid-os4i7owy": true }, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<p data-astro-cid-os4i7owy>Checkout out these tags</p><ul class="tags" data-astro-cid-os4i7owy>${tags.map((tag) => renderTemplate`<li class="tag" data-astro-cid-os4i7owy><a${addAttribute(`/tags/${tag}`, "href")} data-astro-cid-os4i7owy>${tag}</a></li>`)}</ul>` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/tags/index.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/tags/index.astro";
const $$url = "/tags";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
