import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as renderComponent, d as addAttribute } from './astro/server_9QOt-6f6.mjs';
import 'kleur/colors';

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$BlogPost = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, url, date, display, description, DynamicComponent } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<li> ${display === true && DynamicComponent ? renderTemplate`${renderComponent($$result, "DynamicComponent", DynamicComponent, { "title": title, "url": url, "description": description })}` : renderTemplate`<a class="blogPost"${addAttribute(url, "href")}> <div class="frame"> <p class="title">${title}</p> </div> </a>`} </li>`;
}, "/Users/dvolz/Sites/dv/astro-start/src/components/BlogPost.astro", void 0);

const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};

function transformPosts(posts, sourceType) {
	return posts.map((post) => {
		const data = sourceType === 'astro' ? post.blogData : post.frontmatter;

		return {
			url: post.url,
			title: data?.title ?? 'Untitled',
			date: data?.pubDate ?? 'Unknown date',
			display: data?.display ?? false,
			description: data?.description ?? 'No Description',
			featured: data?.featured ?? false,
			tags: data?.tags ?? 'no tags',
		}
	})
}

// Filter posts by category
function filterPostsByCategory(posts, category) {
	if (category === 'both') return posts
	return posts.filter((post) =>
		category === 'thoughts'
			? post.url.includes('/thoughts/')
			: post.url.includes('/play/')
	)
}

// Filter by featured status
function filterFeaturedPosts(posts, isFeatured) {
	return isFeatured ? posts.filter((post) => post.featured) : posts
}

// Dynamically load components for posts with `display: true`
async function loadDynamicComponents(posts) {
	return Promise.all(
		posts.map(async (post) => {
			if (post.display) {
				try {
					const formattedTitle = post.title.replace(/\s+/g, '-').toLowerCase();
					const DynamicComponent = await __variableDynamicImportRuntimeHelper((/* #__PURE__ */ Object.assign({"../components/display/shapes-and-grids-display.astro": () => import('./shapes-and-grids-display_OebnusJC.mjs'),"../components/display/test-thoughts-astro-post-display.astro": () => import('./test-thoughts-astro-post-display_pN58CMj5.mjs')})), `../components/display/${formattedTitle}-display.astro`, 4);
					return { ...post, DynamicComponent: DynamicComponent.default }
				} catch (e) {
					console.error(
						`Failed to import dynamic component for ${post.title}`,
						e
					);
				}
			}
			return { ...post, DynamicComponent: null }
		})
	)
}

export { $$BlogPost as $, filterFeaturedPosts as a, filterPostsByCategory as f, loadDynamicComponents as l, transformPosts as t };
