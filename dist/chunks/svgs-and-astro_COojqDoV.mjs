import { c as createComponent, j as unescapeHTML, s as spreadAttributes, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as renderComponent, F as Fragment } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from './BaseLayout_hcN8E3TP.mjs';
import { $ as $$BlogDetails } from './BlogDetails_BIm46kxo.mjs';
import 'clsx';
import shiki from 'shiki';
/* empty css                                  */

const countersByPage = /* @__PURE__ */ new WeakMap();
function createSvgComponent({ meta, attributes, children }) {
  const renderedIds = /* @__PURE__ */ new WeakMap();
  const Component = createComponent((result, props) => {
    let counter = countersByPage.get(result) ?? 0;
    const {
      title: titleProp,
      viewBox,
      mode,
      ...normalizedProps
    } = normalizeProps(attributes, props);
    const title = titleProp ? unescapeHTML(`<title>${titleProp}</title>`) : "";
    if (mode === "sprite") {
      let symbol = "";
      let id = renderedIds.get(result);
      if (!id) {
        countersByPage.set(result, ++counter);
        id = `a:${counter}`;
        symbol = unescapeHTML(`<symbol${spreadAttributes({ viewBox, id })}>${children}</symbol>`);
        renderedIds.set(result, id);
      }
      return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${title}${symbol}<use href="#${id}" /></svg>`;
    }
    return renderTemplate`<svg${spreadAttributes({ viewBox, ...normalizedProps })}>${title}${unescapeHTML(children)}</svg>`;
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = { role: "img" };
function dropAttributes(attributes) {
  for (const attr of ATTRS_TO_DROP) {
    delete attributes[attr];
  }
  return attributes;
}
function normalizeProps(attributes, { size, ...props }) {
  if (size !== void 0 && props.width === void 0 && props.height === void 0) {
    props.height = size;
    props.width = size;
  }
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}

const LogoSvg = createSvgComponent({"meta":{"src":"/_astro/cat.DzPBOK8K.svg","width":340,"height":230,"format":"svg"},"attributes":{"mode":"inline","viewBox":"75 120 340 230"},"children":"\n  <path class=\"catBody\" style=\"stroke: rgb(0, 0, 0); fill: rgb(238, 188, 143); stroke-width: 5px;\" d=\"M 251.699 206.861 C 251.714 207.33 257.842 200.354 258.31 198.194 C 259.475 192.824 253.218 181.399 252.373 180.554 C 249.481 177.663 247.208 175.173 242.837 174.332 C 230.324 171.926 231.797 145.563 231.797 136.235 C 231.797 132.272 231.239 126.066 234.37 122.909 C 236.411 120.851 246.779 124.4 248.866 125.087 C 262.984 129.738 274.785 148.052 289.565 148.052 C 301.475 148.052 329.38 147.604 330.821 149.045 C 341.514 127.525 364.295 126.506 385.256 126.506 C 398.187 126.506 412.014 134.452 409.279 149.334 C 405.936 167.527 387.46 186.138 372.773 195.848 C 371.398 196.757 355.674 203.11 348.303 217.277 C 339.684 233.843 334.152 256.855 330.502 260.052 C 319.067 270.068 314.343 268.516 299.252 268.516 C 297.891 268.516 281.909 267.794 281.738 269.236 C 280.805 277.093 283.712 285.208 284.779 292.887 C 286.04 301.956 285.734 310.978 285.377 320.111 C 285.043 328.68 283.999 337.285 276.354 342.377 C 264.307 350.401 258.088 332.974 254.186 326.083 C 245.617 310.948 249.729 294.629 246.594 278.348 C 245.334 271.802 238.282 263.435 231.057 262.691 C 225.267 262.095 218.974 262.83 213.293 263.767 C 211.457 264.069 197.66 265.396 196.754 268.31 C 193.13 279.959 199.5 292.968 200.621 303.986 C 201.231 309.979 200.332 316.439 199.587 322.368 C 199.122 326.062 199.686 337.149 195.617 339.355 C 182.3 346.576 159.749 338.617 149.44 329.521 C 137.401 318.899 135.05 307.827 134.781 291.939 C 134.742 289.632 134.644 273.877 131.798 272.971 C 127.329 271.549 126.306 269.369 121.44 267.92 C 116.622 266.485 119.99 229.372 114.903 227.359 C 93.994 219.083 104.624 208.188 93.814 192.544 C 83.562 177.709 75.277 166.437 87.786 163.265 C 93.876 161.721 95.838 162.967 102.364 161.778 C 110.617 160.274 113.453 166.698 116.34 173.198 C 119.982 181.398 128.807 208.87 140.929 209.969 C 155.573 211.297 169.758 207.284 184.253 206.648 C 198.012 206.045 211.849 206.418 225.634 206.418 C 228.575 206.418 249.049 204.011 251.699 206.861 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\" />\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); opacity: 0.9; stroke-width: 3px;\" d=\"M 293.299 161.139 C 292.534 160.645 285.949 164.129 286.582 167.298 C 287.158 170.181 286.511 176.614 288.124 178.818 C 290.307 181.805 295.248 182.016 297.911 181.687 C 301.897 181.193 302.318 178.666 302.318 173.195 C 302.318 171.269 302.348 167.686 301.709 165.921 C 300.327 162.1 295.784 160.845 293.299 161.139 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\" />\n  <path style=\"stroke: rgb(0, 0, 0); opacity: 0.9; fill: rgb(198, 245, 248); stroke-width: 3px;\" d=\"M 292.711 164.959 C 292.657 165.85 292.605 173.328 293.002 178.093 C 293.062 178.818 294.52 181.211 294.911 181.787 C 295.595 182.792 296.57 178.535 296.85 177.475 C 297.893 173.508 297.117 167.779 296.258 163.936 C 296.078 163.126 295.254 161.04 294.192 161.093 C 293.263 161.139 293.018 163.884 292.711 164.959 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\" />\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); stroke-width: 3px;\" d=\"M 320.631 164.917 C 317.978 167.869 320.465 173.345 320.566 178.064 C 320.71 184.838 327.781 185.927 331.995 183.556 C 335.152 181.782 335.465 177.232 333.809 171.82 C 333.133 169.61 332.692 166.964 331.031 165.685 C 329.926 164.836 321.028 164.516 320.631 164.917 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\" />\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(198, 245, 248); stroke-width: 3px;\" d=\"M 324.198 167.933 C 324.042 168.532 324.576 175.329 325.116 178.695 C 325.414 180.547 326.97 185.173 328.634 184.44 C 330.278 183.715 328.645 179.087 328.902 176.956 C 329.206 174.426 329.143 169.948 328.636 167.299 C 327.985 163.891 324.964 164.988 324.198 167.933 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\" />\n  <g transform=\"matrix(1.1565430164337158, 0, 0, 1.1565430164337158, 8.607187271118164, -66.16307830810547)\" style=\"\">\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); stroke-width: 4.32323px;\" d=\"M 259.072 224.247 C 258.554 224.349 254.207 231.263 257.395 234.279 C 258.787 235.596 260.785 235.627 262.58 235.59 C 263.756 235.566 265.385 235.653 266.43 234.972 C 267.547 234.244 267.805 232.395 268.07 231.22 C 269.172 226.337 263.523 222.036 259.072 224.247 Z\" />\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgba(255, 255, 255, 0); stroke-width: 4.32323px;\" d=\"M 266.357 235.346 C 272.24 237.657 279.208 240.856 283.675 234.47 C 284.506 233.283 284.803 232.079 285.099 230.721\" />\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgba(255, 255, 255, 0); stroke-width: 4.32323px;\" d=\"M 259.673 235.332 C 255.95 240.635 245.093 238.988 240.355 235.248 C 238.9 234.101 238.97 232.47 237.749 231.462\" />\n  </g>\n"});

const $$Astro$1 = createAstro("https://dv-astro.netlify.app/");
const $$CodeBlock = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CodeBlock;
  const { code, lang = "typescript", theme = "github-dark" } = Astro2.props;
  const highlighter = await shiki.getHighlighter({
    theme
  });
  const html = highlighter.codeToHtml(code, { lang });
  return renderTemplate`${maybeRenderHead()}<div class="code-block" data-astro-cid-jgrc2lfe> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(html)}` })} </div> `;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/CodeBlock.astro", void 0);

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "SVGs and Astro",
  author: "David Volz",
  description: `Playing with some shapes and grids.`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  pubDate: "2025-1-3",
  tags: ["css", "code", "design", "fluff"],
  featured: true
};
const $$SvgsAndAstro = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SvgsAndAstro;
  const showTypographyHero = true;
  const theme = "inverted";
  const fullWidthBody = true;
  const sampleCode = `
---
// Your Astro component
const greeting = "Hello World";
---

<h1>{greeting}</h1>
`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "showTypographyHero": showTypographyHero, "description": blogData.description, "theme": theme, "fullWidthBody": fullWidthBody }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="details-width"> ${renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData })} </div> <div class="article"> ${renderComponent($$result2, "LogoSvg", LogoSvg, {})} ${renderComponent($$result2, "LogoSvg", LogoSvg, { "mode": "sprite" })} ${renderComponent($$result2, "CodeBlock", $$CodeBlock, { "code": sampleCode, "lang": "astro" })} </div> ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/svgs-and-astro.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/play/svgs-and-astro.astro";
const $$url = "/play/svgs-and-astro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  blogData,
  default: $$SvgsAndAstro,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
