import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML } from './astro/server_BDmygan7.mjs';
import 'piccolore';
import { $ as $$MarkdownPostLayout } from './MarkdownPostLayout_DQ3FXCCH.mjs';

const html = () => "<p>After a successful first week learning Astro, I decided to try some more. I wrote and imported a small component from memory!</p>";

				const frontmatter = {"layout":"../../layouts/MarkdownPostLayout.astro","title":"My Second Blog Post","author":"Astro Learner","description":"After learning some Astro, I couldn't stop!","image":{"url":"https://docs.astro.build/assets/arc.webp","alt":"The Astro logo on a dark background with a purple gradient arc."},"pubDate":"2022-07-08","tags":["astro","blogging","learning in public","successes"]};
				const file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts/post-2.md";
				const url = "/thoughts/post-2";
				function rawContent() {
					return "   \n                                              \n                          \n                     \n                                                          \n      \n                                                 \n                                                                        \n                     \n                                                              \n   \n\nAfter a successful first week learning Astro, I decided to try some more. I wrote and imported a small component from memory!\n";
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
