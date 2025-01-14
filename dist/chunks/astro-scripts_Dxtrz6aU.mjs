import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead, e as renderScript } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from './BaseLayout_hcN8E3TP.mjs';
import { $ as $$BlogDetails } from './BlogDetails_BIm46kxo.mjs';
import { jsx } from 'react/jsx-runtime';
import { useEffect } from 'react';
/* empty css                                 */

function IsVisibleExample() {
  useEffect(() => {
    console.log(
      "%cLazy loaded Javascript coming in HOT!!",
      "font-size: 20px; font-weight: bold; color: #39ff14; text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14; padding: 1rem;"
    );
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        fontFamily: "var(--p-font)",
        fontSize: "1.8rem"
      },
      children: "Loaded with client:visible!"
    }
  );
}

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const blogData = {
  title: "Astro Scripts",
  author: "David Volz",
  description: `Analyzing how Astro handles the script tag`,
  image: {
    url: "https://docs.astro.build/assets/arc.webp",
    alt: "The Astro logo on a dark background with a purple gradient arc."
  },
  display: false,
  pubDate: "2024-12-18",
  tags: ["astro", "javascript"],
  featured: true
};
const $$AstroScripts = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AstroScripts;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "pageTitle": blogData.title, "description": blogData.description, "display": blogData.display, "data-astro-cid-7hqydfbl": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="details-width" data-astro-cid-7hqydfbl> ${renderComponent($$result2, "BlogDetails", $$BlogDetails, { ...blogData, "data-astro-cid-7hqydfbl": true })} </div> <div class="article" data-astro-cid-7hqydfbl> <p data-astro-cid-7hqydfbl>
As I have been developing this site, I have been learning about how Astro
			compiles and renders my code. One thing in particular that has stood out
			to me is how Astro handles the script tag.
</p> <div class="tip tip-left" data-astro-cid-7hqydfbl> <div class="tip-inner" data-astro-cid-7hqydfbl> <p data-astro-cid-7hqydfbl>
Much of this content is taken from <a href="https://docs.astro.build/en/guides/client-side-scripts/" target="_blank" title="Astro Script Documentation" data-astro-cid-7hqydfbl>
Astro's Docs.</a> </p> </div> </div> <h3 data-astro-cid-7hqydfbl>Processing</h3> <p data-astro-cid-7hqydfbl>
Astro works by compiling a lot of different components and pages together
			to create a site. A common way to include scripts on these components is
			by using inline script tags.
</p> <p data-astro-cid-7hqydfbl>
By default, Astro will process every script tag. It automatically does the
			following on scripts:
</p> <ul data-astro-cid-7hqydfbl> <li data-astro-cid-7hqydfbl>Removes whitespace</li> <li data-astro-cid-7hqydfbl>Shortens variable names</li> <li data-astro-cid-7hqydfbl>
It adds <code data-astro-cid-7hqydfbl>type="module"</code> to the script. Amongst other things, this
				allows for scoped variables which will help avoid any conflicts
</li> <li data-astro-cid-7hqydfbl>
It only injects the script one time if the component is used multiple
				times on the page
</li> </ul> <p data-astro-cid-7hqydfbl>
Astro's script processing ensures that your code is optimized for
			performance by minimizing file sizes and preventing conflicts in the
			global namespace. This is particularly beneficial for large-scale
			applications with numerous components.
</p> <h3 data-astro-cid-7hqydfbl>Options</h3> <h4 data-astro-cid-7hqydfbl>is:inline</h4> <p data-astro-cid-7hqydfbl>
If you use <code data-astro-cid-7hqydfbl>${`<script is:inline>`}</code>, it will remove that script
			from Astro processing and it will be rendered exactly as written. This can
			be helpful when dealing with 3rd party code or libraries. For instance, if
			you're embedding a third-party analytics snippet or a custom script that
			requires precise formatting, using this ensures the script is injected
			exactly as written without modification.
</p> <h4 data-astro-cid-7hqydfbl>define:vars</h4> <p data-astro-cid-7hqydfbl>
Using <code data-astro-cid-7hqydfbl>${`<script define:vars>`}</code> will allow you to access your frontmatter
			variables inside your script. The drawback to this if you pass your variables
			this way, Astro won't process your script, it will be treated as an <code data-astro-cid-7hqydfbl>is:inline</code> script.
</p> <h4 data-astro-cid-7hqydfbl>Lazy Load JS</h4> <p data-astro-cid-7hqydfbl>
There is no built-in way to lazy load Javascript in Astro. Instead, it
			offers hydration directives like <code data-astro-cid-7hqydfbl>client:visible</code> to control when
			a component and its associated JavaScript are loaded and executed. Using this
			directive lazy loads a componenent only when the componenent becomes visible
			in the viewport. This component has to be using a framework that supports hydration
			like React or Svelte.
</p> <p data-astro-cid-7hqydfbl>
In order to lazy load the component you should put <code data-astro-cid-7hqydfbl>client:visible</code> in the inclusion of the component.
</p><p data-astro-cid-7hqydfbl>
Example
<br data-astro-cid-7hqydfbl> <code data-astro-cid-7hqydfbl>${`<ComponentName client:visible />`}</code> </p> <p data-astro-cid-7hqydfbl>
If you click the button it will load and reveal a sample component that
			uses React to leave a console log and to render a div.
</p> <p data-astro-cid-7hqydfbl> <a href="#" id="revealButton" class="line-button" data-astro-cid-7hqydfbl>Click here to see the component</a> </p> <div class="tip tip-right tip-hidden" data-astro-cid-7hqydfbl> <div class="tip-inner" id="tipContainer" data-astro-cid-7hqydfbl> ${renderComponent($$result2, "IsVisibleExample", IsVisibleExample, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/dvolz/Sites/dv/dv-astro/src/components/IsVisibleExample.jsx", "client:component-export": "default", "data-astro-cid-7hqydfbl": true })} </div> </div> <h3 data-astro-cid-7hqydfbl>Conclusion</h3> <p data-astro-cid-7hqydfbl>
I have been enjoying the flexibility of using Astro to develop this site.
			The way it handles scripts is a great example of how it can be customized
			to fit the needs of the developer. For example, I just included a script
			and style tag right next to where I wrote the paragraph that explains it.
			When I build the site, Astro will process the code and inject it at the
			exact right place in the DOM. Its a very satisfying process.
</p> </div>  ${renderScript($$result2, "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts/astro-scripts.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts/astro-scripts.astro", void 0);

const $$file = "/Users/dvolz/Sites/dv/dv-astro/src/pages/thoughts/astro-scripts.astro";
const $$url = "/thoughts/astro-scripts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	blogData,
	default: $$AstroScripts,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _ };
