import { c as createComponent, b as createAstro, m as maybeRenderHead, d as addAttribute, a as renderTemplate } from './astro/server_BDmygan7.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$StyleGuideDisplay = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StyleGuideDisplay;
  const { title, url, description } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a class="blogPost"${addAttribute(url, "href")} data-astro-cid-arc65szn> <div class="frame" data-astro-cid-arc65szn> <div data-astro-cid-arc65szn> <div class="sg-palette-strip" data-astro-cid-arc65szn> <span class="sg-dot" data-astro-cid-arc65szn></span> <span class="sg-dot" data-astro-cid-arc65szn></span> <span class="sg-dot" data-astro-cid-arc65szn></span> <span class="sg-dot" data-astro-cid-arc65szn></span> <span class="sg-dot" data-astro-cid-arc65szn></span> </div> <p class="title" data-astro-cid-arc65szn>${title}</p> </div> </div> </a>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/display/style-guide-display.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/components/display/style-guide-display.astro";
const $$url = undefined;

export { $$StyleGuideDisplay as default, $$file as file, $$url as url };
