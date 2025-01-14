import { g as createComponent, h as renderTemplate, i as renderComponent, u as unescapeHTML } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { $ as $$MarkdownPostLayout } from './MarkdownPostLayout_jZcsiZwP.mjs';

const html = () => "<p>It wasn’t always smooth sailing, but I’m enjoying building with Astro. And, the <a href=\"https://astro.build/chat\">Discord community</a> is really friendly and helpful!</p>";

				const frontmatter = {"layout":"../../layouts/MarkdownPostLayout.astro","title":"My Third Blog Post","author":"Astro Learner","description":"I had some challenges, but asking in the community really helped!","image":{"url":"https://docs.astro.build/assets/rays.webp","alt":"The Astro logo on a dark background with rainbow rays."},"pubDate":"2022-07-15T00:00:00.000Z","tags":["astro","learning in public","setbacks","community"]};
				const file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts/post-3.md";
				const url = "/thoughts/post-3";
				function rawContent() {
					return "   \n                                              \n                         \n                     \n                                                                                \n      \n                                                    \n                                                                 \n                   \n                                                              \n   \nIt wasn't always smooth sailing, but I'm enjoying building with Astro. And, the [Discord community](https://astro.build/chat) is really friendly and helpful!";
				}
				async function compiledContent() {
					return await html();
				}
				function getHeadings() {
					return [];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${renderComponent(result, 'Layout', $$MarkdownPostLayout, {
								file,
								url,
								content,
								frontmatter: content,
								headings: getHeadings(),
								rawContent,
								compiledContent,
								'server:root': true,
							}, {
								'default': () => renderTemplate`${unescapeHTML(html())}`
							})}`;
				});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	Content,
	compiledContent,
	default: Content,
	file,
	frontmatter,
	getHeadings,
	rawContent,
	url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
