import { c as createAstro, a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_9QOt-6f6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_MLDguVh-.mjs';
import { t as transformPosts, l as loadDynamicComponents, $ as $$BlogPost } from '../../chunks/postHelpers_r1y4ZJ97.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const Astro = $$Astro;
async function getStaticPaths() {
  const mdPlay = await Astro.glob(/* #__PURE__ */ Object.assign({"../play/thoughts.md": () => import('../../chunks/thoughts_BgbyvbRW.mjs').then(n => n._)}), () => "../play/*.md");
  const astroPlay = await Astro.glob(/* #__PURE__ */ Object.assign({"../play/shapes-and-grids.astro": () => import('../../chunks/shapes-and-grids_-LyYhqjZ.mjs').then(n => n._),"../play/test.astro": () => import('../../chunks/test_B4pa7uOv.mjs').then(n => n._)}), () => "../play/*.astro");
  const mdThoughts = await Astro.glob(/* #__PURE__ */ Object.assign({"../thoughts/post-1.md": () => import('../../chunks/post-1_DP_3jcO_.mjs').then(n => n._),"../thoughts/post-2.md": () => import('../../chunks/post-2_CAiOuaqm.mjs').then(n => n._),"../thoughts/post-3.md": () => import('../../chunks/post-3_CHBHZUoA.mjs').then(n => n._),"../thoughts/post-4.md": () => import('../../chunks/post-4_CnTnH49b.mjs').then(n => n._)}), () => "../thoughts/*.md");
  const astroThoughts = await Astro.glob(/* #__PURE__ */ Object.assign({"../thoughts/astro-scripts.astro": () => import('../../chunks/astro-scripts_zx8iW0fh.mjs').then(n => n._)}), () => "../thoughts/*.astro");
  const allPosts = [
    ...transformPosts(mdThoughts, "markdown"),
    ...transformPosts(astroThoughts, "astro"),
    ...transformPosts(mdPlay, "markdown"),
    ...transformPosts(astroPlay, "astro")
  ];
  const uniqueTags = [...new Set(allPosts.map((post) => post.tags).flat())];
  return uniqueTags.map((tag) => {
    const filteredPosts = allPosts.filter(
      (post) => post && post.tags && post.tags.includes(tag)
    );
    return {
      params: { tag },
      props: { posts: filteredPosts }
    };
  });
}
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$tag;
  const mdPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({"../play/thoughts.md": () => import('../../chunks/thoughts_BgbyvbRW.mjs').then(n => n._)}), () => "../play/*.md");
  const astroPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({"../play/shapes-and-grids.astro": () => import('../../chunks/shapes-and-grids_-LyYhqjZ.mjs').then(n => n._),"../play/test.astro": () => import('../../chunks/test_B4pa7uOv.mjs').then(n => n._)}), () => "../play/*.astro");
  const mdThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../thoughts/post-1.md": () => import('../../chunks/post-1_DP_3jcO_.mjs').then(n => n._),"../thoughts/post-2.md": () => import('../../chunks/post-2_CAiOuaqm.mjs').then(n => n._),"../thoughts/post-3.md": () => import('../../chunks/post-3_CHBHZUoA.mjs').then(n => n._),"../thoughts/post-4.md": () => import('../../chunks/post-4_CnTnH49b.mjs').then(n => n._)}), () => "../thoughts/*.md");
  const astroThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../thoughts/astro-scripts.astro": () => import('../../chunks/astro-scripts_zx8iW0fh.mjs').then(n => n._)}), () => "../thoughts/*.astro");
  const allPosts = [
    ...transformPosts(mdThoughts, "markdown"),
    ...transformPosts(astroThoughts, "astro"),
    ...transformPosts(mdPlay, "markdown"),
    ...transformPosts(astroPlay, "astro")
  ];
  const processedPosts = await loadDynamicComponents(allPosts);
  const sortedPosts = processedPosts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
  const { tag } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": `${tag} Articles` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<p>Posts tagged with ${tag}</p> <ul class="recentItems"> ${sortedPosts.map((post) => renderTemplate`${renderComponent($$result2, "BlogPost", $$BlogPost, { "url": post.url, "title": post.title, "date": post.date, "display": post.display, "description": post.description, "DynamicComponent": post.DynamicComponent })}`)} </ul> ` })}`;
}, "/Users/dvolz/Sites/dv/astro-start/src/pages/tags/[tag].astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/astro-start/src/pages/tags/[tag].astro";
const $$url = "/tags/[tag]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$tag,
	file: $$file,
	getStaticPaths,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
