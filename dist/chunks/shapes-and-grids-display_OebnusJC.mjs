import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute, e as renderScript } from './astro/server_9QOt-6f6.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$ShapesAndGridsDisplay = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ShapesAndGridsDisplay;
  const { title, url, description } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a class="blogPost"${addAttribute(url, "href")} data-astro-cid-nsztifj6> <div class="row box-lines" data-astro-cid-nsztifj6> <div class="column column-box-lines" data-astro-cid-nsztifj6></div> <div class="column column-box-lines" data-astro-cid-nsztifj6></div> <div class="column column-box-lines" data-astro-cid-nsztifj6></div> <div class="column column-box-lines" data-astro-cid-nsztifj6></div> <div class="box" data-astro-cid-nsztifj6><div class="box-height" data-astro-cid-nsztifj6>${title}</div></div> </div> </a> ${renderScript($$result, "/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro";
const $$url = undefined;

export { $$ShapesAndGridsDisplay as default, $$file as file, $$url as url };
