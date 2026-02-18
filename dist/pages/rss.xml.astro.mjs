import rss, { pagesGlobToRssItems } from '@astrojs/rss';
export { renderers } from '../renderers.mjs';

async function GET(context) {
	return rss({
		title: 'Astro Learner | Blog',
		description: 'My journey learning Astro',
		site: context.site,
		items: await pagesGlobToRssItems(/* #__PURE__ */ Object.assign({"./play/thoughts.md": () => import('../chunks/thoughts_DaIo6kg5.mjs').then(n => n._),"./thoughts/post-1.md": () => import('../chunks/post-1_BvYlkjSE.mjs').then(n => n._),"./thoughts/post-2.md": () => import('../chunks/post-2_BlocIOec.mjs').then(n => n._),"./thoughts/post-3.md": () => import('../chunks/post-3_BDoWn6_p.mjs').then(n => n._),"./thoughts/post-4.md": () => import('../chunks/post-4_BPZoHAz5.mjs').then(n => n._)})),
		customData: `<language>en-us</language>`,
	})
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
