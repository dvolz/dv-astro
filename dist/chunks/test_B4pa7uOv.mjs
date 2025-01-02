import { c as createAstro, a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead } from './astro/server_9QOt-6f6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from './BaseLayout_MLDguVh-.mjs';
import { $ as $$BlogDetails } from './BlogDetails_xNrFzzSq.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "Test",
  author: "David Volz",
  description: "Test Post",
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  display: false,
  pubDate: "2024-11-20",
  tags: ["css", "code", "design", "fluff"]
};
const $$Test = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Test;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "description": blogData.description, "display": blogData.display }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="article"> ', ` <div> <label>
Box Width: <span id="boxWidthValue">56.08</span>%
<input type="range" id="boxWidthSlider" min="51" max="99" value="56.08" data-box-width="56.08"> </label> </div> <div class="row box-lines"> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="box"></div> </div> <script>
			document.addEventListener('DOMContentLoaded', function () {
				const slider = document.querySelector('#boxWidthSlider')
				const boxWidthValue = document.querySelector('#boxWidthValue')

				function getSquareWidth(width) {
					return 100 - (100 - width) * 2
				}

				function updateStyles(e) {
					const value =
						e?.target?.value || slider?.getAttribute('value') || slider?.value
					if (!value) return

					boxWidthValue.innerText = value
					const squareWidth = getSquareWidth(value)

					const columns = document.querySelectorAll('.column-box-lines')
					const box = document.querySelector('.box-lines .box')

					columns.forEach((column, index) => {
						let width = index === 0 || index === 3 ? value : 100 - value
						column.style.flexBasis = \`\${width}%\`
						column.innerText = \`\${width}%\`
					})

					box.style.width = \`\${squareWidth + 0.1}%\`
					box.style.paddingBottom = \`\${squareWidth}%\`
					box.innerText = \`\${squareWidth}%\`
				}

				if (slider) {
					slider.addEventListener('input', updateStyles)
					requestAnimationFrame(() => updateStyles({ target: slider }))
				}
				setTimeout(updateStyles, 500)
				console.log('Simple Page Loaded')
				updateStyles()
			})
		<\/script> </div> `], [" ", '<div class="article"> ', ` <div> <label>
Box Width: <span id="boxWidthValue">56.08</span>%
<input type="range" id="boxWidthSlider" min="51" max="99" value="56.08" data-box-width="56.08"> </label> </div> <div class="row box-lines"> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="column column-box-lines"></div> <div class="box"></div> </div> <script>
			document.addEventListener('DOMContentLoaded', function () {
				const slider = document.querySelector('#boxWidthSlider')
				const boxWidthValue = document.querySelector('#boxWidthValue')

				function getSquareWidth(width) {
					return 100 - (100 - width) * 2
				}

				function updateStyles(e) {
					const value =
						e?.target?.value || slider?.getAttribute('value') || slider?.value
					if (!value) return

					boxWidthValue.innerText = value
					const squareWidth = getSquareWidth(value)

					const columns = document.querySelectorAll('.column-box-lines')
					const box = document.querySelector('.box-lines .box')

					columns.forEach((column, index) => {
						let width = index === 0 || index === 3 ? value : 100 - value
						column.style.flexBasis = \\\`\\\${width}%\\\`
						column.innerText = \\\`\\\${width}%\\\`
					})

					box.style.width = \\\`\\\${squareWidth + 0.1}%\\\`
					box.style.paddingBottom = \\\`\\\${squareWidth}%\\\`
					box.innerText = \\\`\\\${squareWidth}%\\\`
				}

				if (slider) {
					slider.addEventListener('input', updateStyles)
					requestAnimationFrame(() => updateStyles({ target: slider }))
				}
				setTimeout(updateStyles, 500)
				console.log('Simple Page Loaded')
				updateStyles()
			})
		<\/script> </div> `])), maybeRenderHead(), renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData })) })}`;
}, "/Users/dvolz/Sites/dv/astro-start/src/pages/play/test.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/astro-start/src/pages/play/test.astro";
const $$url = "/play/test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$Test,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
