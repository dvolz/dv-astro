import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, a as renderComponent } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { t as transformPosts, f as filterPostsByCategory, a as filterFeaturedPosts, l as loadDynamicComponents, $ as $$BlogPost } from './postHelpers_B6UX38j2.mjs';
/* empty css                         */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$RecentItems = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$RecentItems;
  const { featured = "false", category = "both" } = Astro2.props;
  const isFeatured = featured === "true";
  const mdPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/play/thoughts.md": () => import('./thoughts_Dt1fmvpJ.mjs').then(n => n._)}), () => "../pages/play/*.md");
  const astroPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/play/shapes-and-grids.astro": () => import('./shapes-and-grids_DcQDvhvY.mjs').then(n => n._),"../pages/play/svgs-and-astro.astro": () => import('./svgs-and-astro_COojqDoV.mjs').then(n => n._),"../pages/play/test.astro": () => import('./test_OeIdah1Z.mjs').then(n => n._)}), () => "../pages/play/*.astro");
  const mdThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/thoughts/post-1.md": () => import('./post-1_CK6PPMrE.mjs').then(n => n._),"../pages/thoughts/post-2.md": () => import('./post-2_BrJ_15dO.mjs').then(n => n._),"../pages/thoughts/post-3.md": () => import('./post-3_CuwFXF5H.mjs').then(n => n._),"../pages/thoughts/post-4.md": () => import('./post-4_BgCYoBgn.mjs').then(n => n._)}), () => "../pages/thoughts/*.md");
  const astroThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/thoughts/astro-scripts.astro": () => import('./astro-scripts_Dxtrz6aU.mjs').then(n => n._)}), () => "../pages/thoughts/*.astro");
  const allPosts = [
    ...transformPosts(mdThoughts, "markdown"),
    ...transformPosts(astroThoughts, "astro"),
    ...transformPosts(mdPlay, "markdown"),
    ...transformPosts(astroPlay, "astro")
  ];
  const categoryFilteredPosts = filterPostsByCategory(allPosts, category);
  const featuredFilteredPosts = filterFeaturedPosts(
    categoryFilteredPosts,
    isFeatured
  );
  const processedPosts = await loadDynamicComponents(featuredFilteredPosts);
  const sortedPosts = processedPosts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
  return renderTemplate`${maybeRenderHead()}<ul class="recentItems"> ${sortedPosts.length > 0 ? sortedPosts.map((post) => renderTemplate`${renderComponent($$result, "BlogPost", $$BlogPost, { "url": post.url, "title": post.title, "date": post.date, "display": post.display, "description": post.description, "DynamicComponent": post.DynamicComponent })}`) : renderTemplate`<p>No posts</p>`} </ul>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/RecentItems.astro", void 0);

export { $$RecentItems as $ };
