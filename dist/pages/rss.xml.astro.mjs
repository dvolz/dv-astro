import rss, { pagesGlobToRssItems } from '@astrojs/rss';
export { renderers } from '../renderers.mjs';

async function GET(context) {
  return rss({
    title: 'Astro Learner | Blog',
    description: 'My journey learning Astro',
    site: context.site,
    items: await pagesGlobToRssItems(/* #__PURE__ */ Object.assign({"./play/thoughts.md": () => import('../chunks/thoughts_Dt1fmvpJ.mjs').then(n => n._),"./thoughts/post-1.md": () => import('../chunks/post-1_CK6PPMrE.mjs').then(n => n._),"./thoughts/post-2.md": () => import('../chunks/post-2_BrJ_15dO.mjs').then(n => n._),"./thoughts/post-3.md": () => import('../chunks/post-3_CuwFXF5H.mjs').then(n => n._),"./thoughts/post-4.md": () => import('../chunks/post-4_BgCYoBgn.mjs').then(n => n._)})),
    customData: `<language>en-us</language>`,
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
