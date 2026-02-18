import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute, e as renderScript } from './astro/server_DHeFfUaE.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$YoutubeTimingControllerDisplay = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$YoutubeTimingControllerDisplay;
  const { title, url, description } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a class="blogPost"${addAttribute(url, "href")} data-astro-cid-b3vmkjml> <div class="frame youtube-timer-animated" data-astro-cid-b3vmkjml> <p class="title youtube-timer-note" data-astro-cid-b3vmkjml>${title}</p> </div> </a> ${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/components/display/youtube-timing-controller-display.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/display/youtube-timing-controller-display.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/components/display/youtube-timing-controller-display.astro";
const $$url = undefined;

export { $$YoutubeTimingControllerDisplay as default, $$file as file, $$url as url };
