import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_HEADER, f as decodeKey } from './chunks/astro/server_9QOt-6f6.mjs';
import 'clsx';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/dvolz/Sites/dv/astro-start/","adapterName":"","routes":[{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/play/shapes-and-grids/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/play/shapes-and-grids","isIndex":false,"type":"page","pattern":"^\\/play\\/shapes-and-grids\\/?$","segments":[[{"content":"play","dynamic":false,"spread":false}],[{"content":"shapes-and-grids","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/play/shapes-and-grids.astro","pathname":"/play/shapes-and-grids","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/play/test/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/play/test","isIndex":false,"type":"page","pattern":"^\\/play\\/test\\/?$","segments":[[{"content":"play","dynamic":false,"spread":false}],[{"content":"test","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/play/test.astro","pathname":"/play/test","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/play/thoughts/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/play/thoughts","isIndex":false,"type":"page","pattern":"^\\/play\\/thoughts\\/?$","segments":[[{"content":"play","dynamic":false,"spread":false}],[{"content":"thoughts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/play/thoughts.md","pathname":"/play/thoughts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/play/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/play","isIndex":false,"type":"page","pattern":"^\\/play\\/?$","segments":[[{"content":"play","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/play.astro","pathname":"/play","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tags","isIndex":true,"type":"page","pattern":"^\\/tags\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/astro-scripts/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts/astro-scripts","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/astro-scripts\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}],[{"content":"astro-scripts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts/astro-scripts.astro","pathname":"/thoughts/astro-scripts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-1/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts/post-1","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/post-1\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}],[{"content":"post-1","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts/post-1.md","pathname":"/thoughts/post-1","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-2/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts/post-2","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/post-2\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}],[{"content":"post-2","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts/post-2.md","pathname":"/thoughts/post-2","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-3/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts/post-3","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/post-3\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}],[{"content":"post-3","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts/post-3.md","pathname":"/thoughts/post-3","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-4/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts/post-4","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/post-4\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}],[{"content":"post-4","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts/post-4.md","pathname":"/thoughts/post-4","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/thoughts","isIndex":false,"type":"page","pattern":"^\\/thoughts\\/?$","segments":[[{"content":"thoughts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/thoughts.astro","pathname":"/thoughts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/dvolz/Sites/dv/astro-start/dist/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://dv-astro.netlify.app/","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/dvolz/Sites/dv/astro-start/src/pages/play/thoughts.md",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/play.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/rss.xml.js",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/tags/[tag].astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/post-1.md",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/tags/index.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/post-2.md",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/post-3.md",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/post-4.md",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/play/shapes-and-grids.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/play/test.astro",{"propagation":"none","containsHead":true}],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/astro-scripts.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/play/shapes-and-grids@_@astro":"pages/play/shapes-and-grids.astro.mjs","\u0000@astro-page:src/pages/play/test@_@astro":"pages/play/test.astro.mjs","\u0000@astro-page:src/pages/play/thoughts@_@md":"pages/play/thoughts.astro.mjs","\u0000@astro-page:src/pages/play@_@astro":"pages/play.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"pages/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/tags/index@_@astro":"pages/tags.astro.mjs","\u0000@astro-page:src/pages/thoughts/astro-scripts@_@astro":"pages/thoughts/astro-scripts.astro.mjs","\u0000@astro-page:src/pages/thoughts/post-1@_@md":"pages/thoughts/post-1.astro.mjs","\u0000@astro-page:src/pages/thoughts/post-2@_@md":"pages/thoughts/post-2.astro.mjs","\u0000@astro-page:src/pages/thoughts/post-3@_@md":"pages/thoughts/post-3.astro.mjs","\u0000@astro-page:src/pages/thoughts/post-4@_@md":"pages/thoughts/post-4.astro.mjs","\u0000@astro-page:src/pages/thoughts@_@astro":"pages/thoughts.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-manifest":"manifest_6rdW2zoU.mjs","/Users/dvolz/Sites/dv/astro-start/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_BkR_XoPb.mjs","/Users/dvolz/Sites/dv/astro-start/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_45_BwdGc.mjs","/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro":"chunks/shapes-and-grids-display_OebnusJC.mjs","/Users/dvolz/Sites/dv/astro-start/src/components/display/test-thoughts-astro-post-display.astro":"chunks/test-thoughts-astro-post-display_pN58CMj5.mjs","/Users/dvolz/Sites/dv/astro-start/src/components/IsVisibleExample.jsx":"_astro/IsVisibleExample.CRZaLsb9.js","@astrojs/react/client.js":"_astro/client.BKX-yLGW.js","/Users/dvolz/Sites/dv/astro-start/src/pages/play/shapes-and-grids.astro?astro&type=script&index=0&lang.ts":"_astro/shapes-and-grids.astro_astro_type_script_index_0_lang.DGtFyZyJ.js","/Users/dvolz/Sites/dv/astro-start/src/pages/play/shapes-and-grids.astro?astro&type=script&index=1&lang.ts":"_astro/shapes-and-grids.astro_astro_type_script_index_1_lang.CJMwfqFu.js","/Users/dvolz/Sites/dv/astro-start/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.FW97egho.js","/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/astro-scripts.astro?astro&type=script&index=0&lang.ts":"_astro/astro-scripts.astro_astro_type_script_index_0_lang.DLKBavTT.js","/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro?astro&type=script&index=0&lang.ts":"_astro/shapes-and-grids-display.astro_astro_type_script_index_0_lang.ChnPYE2Q.js","/Users/dvolz/Sites/dv/astro-start/src/components/display/test-thoughts-astro-post-display.astro?astro&type=script&index=0&lang.ts":"_astro/test-thoughts-astro-post-display.astro_astro_type_script_index_0_lang.B3e8agvf.js","/Users/dvolz/Sites/dv/astro-start/src/components/CatSVG.astro?astro&type=script&index=0&lang.ts":"_astro/CatSVG.astro_astro_type_script_index_0_lang.BdITSHlO.js","/Users/dvolz/Sites/dv/astro-start/src/components/AstroSVG.astro?astro&type=script&index=0&lang.ts":"_astro/AstroSVG.astro_astro_type_script_index_0_lang.CtkeYH6w.js","/Users/dvolz/Sites/dv/astro-start/src/components/ThemeIcon.astro?astro&type=script&index=0&lang.ts":"_astro/ThemeIcon.astro_astro_type_script_index_0_lang.CNPXFTh6.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/dvolz/Sites/dv/astro-start/src/pages/play/shapes-and-grids.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",function(){const t=document.querySelector(\"#boxWidthSlider\"),d=document.querySelector(\"#boxWidthValue\");function c(r){return 100-(100-r)*2}function i(r){let e=r?.target?.value||t?.value;if(!e)return;e=parseFloat(e).toFixed(2),d.innerText=e;const o=c(e),a=document.querySelectorAll(\".column-box-lines\"),n=document.querySelector(\".box-lines .box\"),x=document.querySelector(\".box-lines\"),h=document.querySelector(\".box-height\");a.forEach((s,l)=>{let u=l===0||l===3?e:100-e;s.style.flexBasis=`${u}%`,s.innerText=`${parseFloat(u).toFixed(2)}%`}),n.style.width=`${o+.1}%`,n.style.paddingBottom=`${o}%`,h.innerText=`${parseFloat(o).toFixed(2)}%`;const b=n.offsetHeight,f=x.offsetHeight;b>f&&(n.style.paddingBottom=`${o/2}%`)}t&&(t.addEventListener(\"input\",i),requestAnimationFrame(()=>i({target:t}))),i()});"],["/Users/dvolz/Sites/dv/astro-start/src/pages/play/shapes-and-grids.astro?astro&type=script&index=1&lang.ts","const u=document.querySelector(\".resize-handle\"),s=document.querySelector(\".example-box\"),v=document.body;let n=!1;u.addEventListener(\"mousedown\",c);u.addEventListener(\"touchstart\",c,{passive:!1});function c(e){e.preventDefault(),n=!0,document.addEventListener(\"mousemove\",d),document.addEventListener(\"mouseup\",o),document.addEventListener(\"touchmove\",i,{passive:!1}),document.addEventListener(\"touchend\",o)}function d(e){m(e.clientX)}function i(e){const t=e.touches[0];m(t.clientX)}function m(e){if(n){const t=e-s.offsetLeft,r=v.clientWidth;t<=r&&t>=100&&(s.style.width=`${t}px`)}}function o(){n&&(n=!1,document.removeEventListener(\"mousemove\",d),document.removeEventListener(\"mouseup\",o),document.removeEventListener(\"touchmove\",i),document.removeEventListener(\"touchend\",o))}"],["/Users/dvolz/Sites/dv/astro-start/src/pages/thoughts/astro-scripts.astro?astro&type=script&index=0&lang.ts","const t=document.getElementById(\"revealButton\"),n=document.getElementById(\"tipContainer\");t.addEventListener(\"click\",e=>{e.preventDefault(),n.classList.toggle(\"visible\")});"],["/Users/dvolz/Sites/dv/astro-start/src/components/display/shapes-and-grids-display.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",function(){function d(e){return 100-(100-e)*2}function m(e){e=parseFloat(e).toFixed(2);let r=Math.max(1,d(e));const t=document.querySelectorAll(\".column-box-lines\"),a=document.querySelector(\".box-lines .box\");t.forEach((u,c)=>{let g=c===0||c===3?e:100-e;u.style.flexBasis=`${g}%`}),a.style.width=`${r+.1}%`,a.style.paddingBottom=`${r/2}%`}function f(e){return e<.5?2*e*e:-1+(4-2*e)*e}let n=55,s=90,F=2e3,o=null;const q=1e3/60;let i=0;function l(e){o||(o=e);const r=e-o;if(e-i<q){requestAnimationFrame(l);return}i=e;let t=r/F;t>=1&&([n,s]=[s,n],t=0,o=e);const a=f(t),u=n+(s-n)*a;m(u),requestAnimationFrame(l)}requestAnimationFrame(l)});"],["/Users/dvolz/Sites/dv/astro-start/src/components/display/test-thoughts-astro-post-display.astro?astro&type=script&index=0&lang.ts","console.log(\"test-thoughts-astro-post\");"],["/Users/dvolz/Sites/dv/astro-start/src/components/CatSVG.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const o=document.querySelector(\"body\"),d=document.getElementById(\"spacing-slider\"),g=document.getElementById(\"slider-value\"),i=document.getElementById(\"cat-svg\"),r=i.getAttribute(\"data-svg\"),l=document.querySelector(\".catControls\");function u(n){return`data:image/svg+xml,${encodeURIComponent(n)}`}function a(n){const S=1+(n-50)/200,s=500*S,c=300*S,p=75-(s-500)/2,y=75-(c-300)/2,v=`${p} ${y} ${s} ${c}`,k=r.replace(/<svg[^>]+>/,`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${v}\" opacity=\"0.2\">`),w=u(k);o.style.backgroundImage=`url('${w}')`;const I=`${s/5}px ${c/5}px`;o.style.backgroundSize=I}let t=JSON.parse(localStorage.getItem(\"isBackgroundSet\"))||!1,e=JSON.parse(localStorage.getItem(\"backgroundSpacing\"))||150;function m(){t?(o.style.backgroundImage=`url('${u(r)}')`,l.style.maxHeight=\"20rem\",a(e)):(o.style.backgroundImage=\"\",l.style.maxHeight=\"0\")}function b(){t=!t,m(),localStorage.setItem(\"isBackgroundSet\",JSON.stringify(t))}d.addEventListener(\"input\",n=>{t&&(e=parseInt(n.target.value,10),g.textContent=e,a(e),localStorage.setItem(\"backgroundSpacing\",JSON.stringify(e)))}),d.value=e,g.textContent=e,i.addEventListener(\"click\",b),m(),t&&a(e)});"],["/Users/dvolz/Sites/dv/astro-start/src/components/AstroSVG.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const e=document.querySelector(\".astroSVG\"),s=document.querySelector(\".lastUpdated\");let t=!1;function o(){t?(e.classList.toggle(\"open\"),s.classList.toggle(\"open\"),t=!1):(e.classList.toggle(\"open\"),s.classList.toggle(\"open\"),t=!0)}e.addEventListener(\"click\",o)});"],["/Users/dvolz/Sites/dv/astro-start/src/components/ThemeIcon.astro?astro&type=script&index=0&lang.ts","const r=()=>{const t=localStorage.theme===\"dark\",o=document.documentElement,e=document.body;t?(e.style.setProperty(\"--text-color\",\"#fff7f2\"),e.style.setProperty(\"--background-color\",\"#332e2e\"),e.style.setProperty(\"--contrast-background-color\",\"#55c892\"),e.style.setProperty(\"--link-color\",\"#c3eeff\"),e.style.setProperty(\"--link-hover\",\"#fff\"),o.classList.add(\"dark\")):(e.style.setProperty(\"--text-color\",\"#332e2e\"),e.style.setProperty(\"--background-color\",\"#fff7f2\"),e.style.setProperty(\"--contrast-background-color\",\"#29435c\"),e.style.setProperty(\"--link-color\",\"#3F6E89\"),e.style.setProperty(\"--link-hover\",\"#55c892\"))},l=typeof localStorage<\"u\"&&localStorage.getItem(\"theme\")?localStorage.getItem(\"theme\"):window.matchMedia(\"(prefers-color-scheme: dark)\").matches?\"dark\":\"light\";r();window.localStorage.setItem(\"theme\",l);const c=()=>{const t=document.documentElement;t.classList.toggle(\"dark\");const o=t.classList.contains(\"dark\");localStorage.setItem(\"theme\",o?\"dark\":\"light\"),r()};document.getElementById(\"themeToggle\").addEventListener(\"click\",c);"]],"assets":["/file:///Users/dvolz/Sites/dv/astro-start/dist/about/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/play/shapes-and-grids/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/play/test/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/play/thoughts/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/play/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/rss.xml","/file:///Users/dvolz/Sites/dv/astro-start/dist/tags/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/astro-scripts/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-1/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-2/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-3/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/post-4/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/thoughts/index.html","/file:///Users/dvolz/Sites/dv/astro-start/dist/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"kwSyJm8GaBHhONWEq43zFoAYuwrr2j8nYfjPwtPTgk8="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
