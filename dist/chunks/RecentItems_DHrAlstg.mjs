import { b as createAstro, c as createComponent, m as maybeRenderHead, r as renderComponent, a as renderTemplate } from './astro/server_BDmygan7.mjs';
import 'piccolore';
import { t as transformPosts, f as filterPostsByCategory, a as filterFeaturedPosts, l as loadDynamicComponents, $ as $$BlogPost } from './postHelpers_CtkuUk5K.mjs';
/* empty css                         */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$RecentItems = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$RecentItems;
  const { featured = "false", category = "both" } = Astro2.props;
  const isFeatured = featured === "true";
  let mdPlay = [];
  try {
    mdPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({}), () => "../pages/play/*.md");
  } catch {
  }
  const astroPlay = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/play/shapes-and-grids.astro": () => import('./shapes-and-grids_EgIp3LpU.mjs').then(n => n._),"../pages/play/style-guide.astro": () => import('./style-guide_D-TMbXOD.mjs').then(n => n._),"../pages/play/svgs-and-astro.astro": () => import('./svgs-and-astro_Cl94cajF.mjs').then(n => n._),"../pages/play/youtube-timer.astro": () => import('./youtube-timer_8OZkM7WR.mjs').then(n => n._)}), () => "../pages/play/*.astro");
  const mdThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/thoughts/post-1.md": () => import('./post-1_CDz_IoTp.mjs').then(n => n._),"../pages/thoughts/post-2.md": () => import('./post-2_CfjFquE_.mjs').then(n => n._),"../pages/thoughts/post-3.md": () => import('./post-3_BqXloG5J.mjs').then(n => n._),"../pages/thoughts/post-4.md": () => import('./post-4_nQMqbTDr.mjs').then(n => n._)}), () => "../pages/thoughts/*.md");
  const astroThoughts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/thoughts/astro-scripts.astro": () => import('./astro-scripts_BGXX8Abg.mjs').then(n => n._)}), () => "../pages/thoughts/*.astro");
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
