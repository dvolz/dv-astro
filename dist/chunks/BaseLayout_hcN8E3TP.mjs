import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, s as spreadAttributes, d as addAttribute, a as renderComponent, j as unescapeHTML, F as Fragment, e as renderScript, y as renderHead, x as renderSlot } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { getIconData, iconToSVG } from '@iconify/utils';
/* empty css                            */
import 'clsx';


const cache = /* @__PURE__ */ new WeakMap();

const $$Astro$6 = createAstro("https://dv-astro.netlify.app/");
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Icon;
  class AstroIconError extends Error {
    constructor(message) {
      super(message);
      this.hint = "";
    }
  }
  const req = Astro2.request;
  const { name = "", title, desc, "is:inline": inline = false, ...props } = Astro2.props;
  const map = cache.get(req) ?? /* @__PURE__ */ new Map();
  const i = map.get(name) ?? 0;
  map.set(name, i + 1);
  cache.set(req, map);
  const includeSymbol = !inline && i === 0;
  let [setName, iconName] = name.split(":");
  if (!setName && iconName) {
    const err = new AstroIconError(`Invalid "name" provided!`);
    throw err;
  }
  if (!iconName) {
    iconName = setName;
    setName = "local";
    if (!icons[setName]) {
      const err = new AstroIconError('Unable to load the "local" icon set!');
      throw err;
    }
    if (!(iconName in icons[setName].icons)) {
      const err = new AstroIconError(`Unable to locate "${name}" icon!`);
      throw err;
    }
  }
  const collection = icons[setName];
  if (!collection) {
    const err = new AstroIconError(`Unable to locate the "${setName}" icon set!`);
    throw err;
  }
  const iconData = getIconData(collection, iconName ?? setName);
  if (!iconData) {
    const err = new AstroIconError(`Unable to locate "${name}" icon!`);
    throw err;
  }
  const id = `ai:${collection.prefix}:${iconName ?? setName}`;
  if (props.size) {
    props.width = props.size;
    props.height = props.size;
    delete props.size;
  }
  const renderData = iconToSVG(iconData);
  const normalizedProps = { ...renderData.attributes, ...props };
  const normalizedBody = renderData.body;
  const { viewBox } = normalizedProps;
  if (includeSymbol) {
    delete normalizedProps.viewBox;
  }
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(normalizedProps)}${addAttribute(name, "data-icon")}> ${title && renderTemplate`<title>${title}</title>`} ${desc && renderTemplate`<desc>${desc}</desc>`} ${inline ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "id": id }, { "default": ($$result2) => renderTemplate`${unescapeHTML(normalizedBody)}` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${includeSymbol && renderTemplate`<symbol${addAttribute(id, "id")}${addAttribute(viewBox, "viewBox")}>${unescapeHTML(normalizedBody)}</symbol>`}<use${addAttribute(`#${id}`, "href")}></use> ` })}`} </svg>`;
}, "/Users/dvolz/Sites/dv/dv-astro/node_modules/astro-icon/components/Icon.astro", void 0);

const $$ThemeIcon = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button id="themeToggle" aria-label="Theme Toggle" data-astro-cid-oemx5le4> <svg id="Expanded" viewBox="0 0 64 64" class="sun" xmlns="http://www.w3.org/2000/svg" data-astro-cid-oemx5le4> <title></title> <!-- Circle in the middle --> <circle class="sun-circle" cx="32" cy="32" r="19.5" fill="currentColor" stroke-width="1.5" data-astro-cid-oemx5le4></circle> <!-- Sun rays (retain other paths for rays around the circle) --> <path d="M32,7.8a1,1,0,0,0,1-1V3.93a1,1,0,1,0-2,0V6.8A1,1,0,0,0,32,7.8Z" data-astro-cid-oemx5le4></path> <path d="M44.06,11.08a1.06,1.06,0,0,0,.45.11,1,1,0,0,0,.9-.55,27.84,27.84,0,0,1,1.47-2.45,1,1,0,0,0-.31-1.38,1,1,0,0,0-1.38.3,30.23,30.23,0,0,0-1.57,2.63A1,1,0,0,0,44.06,11.08Z" data-astro-cid-oemx5le4></path> <path d="M53.82,20.32a1,1,0,0,0,.55-.17s.52-.34,2.29-1.31a1,1,0,1,0-1-1.75c-1.84,1-2.38,1.36-2.44,1.39a1,1,0,0,0,.56,1.84Z" data-astro-cid-oemx5le4></path> <path d="M60.07,31H57.2a1,1,0,0,0,0,2h2.87a1,1,0,0,0,0-2Z" data-astro-cid-oemx5le4></path> <path d="M56.72,45.19c-1.83-1.16-2.34-1.5-2.35-1.51a1,1,0,1,0-1.11,1.67s.51.34,2.38,1.53a1.09,1.09,0,0,0,.54.16,1,1,0,0,0,.54-1.85Z" data-astro-cid-oemx5le4></path> <path d="M45.35,53.26a1,1,0,1,0-1.67,1.11s.35.52,1.51,2.35a1,1,0,0,0,.85.46.94.94,0,0,0,.53-.16,1,1,0,0,0,.31-1.38C45.69,53.77,45.35,53.26,45.35,53.26Z" data-astro-cid-oemx5le4></path> <path d="M32,56.2a1,1,0,0,0-1,1v2.87a1,1,0,0,0,2,0V57.2A1,1,0,0,0,32,56.2Z" data-astro-cid-oemx5le4></path> <path d="M18.48,53.26c0,.06-.39.6-1.39,2.44a1,1,0,1,0,1.75,1c1-1.77,1.31-2.29,1.31-2.29a1,1,0,0,0-1.67-1.11Z" data-astro-cid-oemx5le4></path> <path d="M9.74,43.62a30.23,30.23,0,0,0-2.63,1.57A1,1,0,0,0,7.65,47a1.09,1.09,0,0,0,.54-.16c1.76-1.13,2.44-1.47,2.44-1.47a1,1,0,0,0-.89-1.79Z" data-astro-cid-oemx5le4></path> <path d="M7.8,32a1,1,0,0,0-1-1H3.93a1,1,0,1,0,0,2H6.8A1,1,0,0,0,7.8,32Z" data-astro-cid-oemx5le4></path> <path d="M7.17,18.84c1.88,1,2.57,1.37,2.57,1.37a1,1,0,0,0,.89-1.79s-.68-.34-2.5-1.33a1,1,0,1,0-1,1.75Z" data-astro-cid-oemx5le4></path> <path d="M18.42,10.63a1,1,0,0,0,.9.56,1,1,0,0,0,.89-1.45s-.34-.69-1.37-2.57a1,1,0,1,0-1.75,1C18.08,10,18.42,10.62,18.42,10.63Z" data-astro-cid-oemx5le4></path> </svg> ${renderComponent($$result, "Icon", $$Icon, { "name": "mdi:moon-waning-crescent", "style": "stroke: var(--text-color); stroke-width: .8;", "class": "moon", "data-astro-cid-oemx5le4": true })} </button>  ${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/components/ThemeIcon.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/ThemeIcon.astro", void 0);

const $$Astro$5 = createAstro("https://dv-astro.netlify.app/");
const $$Navigation = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Navigation;
  const navLinks = [
    { path: "/about/", name: "About" },
    { path: "/thoughts/", name: "Thoughts" },
    { path: "/play/", name: "Play" }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<ul class="nav-links" data-astro-cid-pux6a34n> ${navLinks.map((link) => renderTemplate`<li data-astro-cid-pux6a34n> <a${addAttribute(link.path, "href")}${addAttribute(currentPath.startsWith(link.path) ? "active" : "", "class")} data-astro-cid-pux6a34n> ${link.name} </a> </li>`)} <li class="theme-li" data-astro-cid-pux6a34n>${renderComponent($$result, "ThemeIcon", $$ThemeIcon, { "data-astro-cid-pux6a34n": true })}</li> </ul>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Navigation.astro", void 0);

const $$Logo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<a class="logo-link" href="/" aria-label="Go to homepage" data-astro-cid-tvrurpns> <svg width="262" height="262" viewBox="0 0 262 262" fill="none" xmlns="http://www.w3.org/2000/svg" data-astro-cid-tvrurpns> <rect x="2.5" y="2.5" width="257" height="257" rx="47.5" stroke="black" stroke-width="2" class="outer-box" data-astro-cid-tvrurpns></rect> <path d="M72.3771 208.545C64.4879 208.545 57.1621 206.416 50.3999 202.159C43.6377 197.903 38.2138 191.943 34.1283 184.281C30.0428 176.618 28 167.75 28 157.676C28 148.878 30.0428 140.648 34.1283 132.986C38.3547 125.182 44.1307 118.939 51.4565 114.256C58.9231 109.432 67.3759 107.02 76.8148 107.02C81.323 107.02 85.7607 107.587 90.128 108.722C94.4952 109.716 98.2286 111.135 101.328 112.979H101.962V80.4146C101.962 77.8605 101.821 75.5192 101.539 73.3908C101.398 71.1205 100.624 69.3469 99.2147 68.0698C97.8059 66.6509 95.1292 65.9414 91.1846 65.9414C89.9167 65.9414 88.7192 65.7995 87.5921 65.5157C86.606 65.09 86.1129 63.813 86.1129 61.6846C86.1129 59.5562 87.2399 58.2791 89.494 57.8535C95.9745 56.8602 100.905 55.867 104.286 54.8737C107.808 53.8804 110.485 53.0291 112.317 52.3196C114.148 51.6101 115.768 51.1845 117.177 51.0426C118.304 50.9007 119.22 51.1135 119.924 51.6811C120.769 52.2487 121.192 53.3838 121.192 55.0865V186.409C121.192 194.781 126.686 198.967 137.675 198.967C139.225 198.967 140.211 199.392 140.633 200.244C141.056 200.953 141.267 201.663 141.267 202.372C141.267 204.359 140.07 205.565 137.675 205.99L104.075 208.332C103.089 208.332 102.525 207.906 102.385 207.055C102.244 206.203 102.173 205.21 102.173 204.075V195.561H101.539C98.0172 199.251 93.5795 202.372 88.2261 204.926C83.0135 207.338 77.7306 208.545 72.3771 208.545ZM79.562 197.903C84.9154 197.903 89.3531 196.838 92.8751 194.71C96.3971 192.44 99.426 189.956 101.962 187.261V131.071C101.257 128.658 99.9191 126.246 97.9468 123.834C96.1154 121.28 93.5795 119.152 90.3393 117.449C87.2399 115.604 83.4362 114.682 78.928 114.682C70.757 114.682 63.8539 118.584 58.2187 126.388C52.5835 134.05 49.7659 144.834 49.7659 158.74C49.7659 165.409 50.8225 171.794 52.9357 177.896C55.1898 183.855 58.5005 188.679 62.8677 192.369C67.235 196.058 72.7998 197.903 79.562 197.903Z" fill="black" stroke="black" stroke-width="2" class="letter-d letter" data-astro-cid-tvrurpns></path> <path d="M172.316 207.515C168.79 199.76 165.264 191.3 161.738 182.134C158.212 172.969 154.756 164.016 151.371 155.273C147.985 146.531 144.741 138.917 141.638 132.431C139.381 127.214 137.195 123.548 135.079 121.433C132.964 119.177 129.79 117.767 125.559 117.203C123.725 116.921 122.456 116.639 121.75 116.357C121.186 116.075 120.834 115.017 120.692 113.184C120.551 110.787 121.186 109.518 122.597 109.377C124.148 109.095 125.982 108.884 128.098 108.743C136.843 108.32 143.683 109.589 148.62 112.55C153.557 115.511 157.577 120.516 160.68 127.566C162.655 131.938 164.841 137.366 167.239 143.852C169.778 150.338 172.387 156.895 175.067 163.522C177.747 170.149 180.356 176.142 182.895 181.5H183.53L204.476 126.086C205.886 121.997 205.957 119.459 204.687 118.472C203.418 117.485 200.667 116.991 196.436 116.991C195.166 116.991 194.108 116.921 193.262 116.78C192.416 116.498 191.922 115.299 191.781 113.184C191.781 112.338 191.993 111.422 192.416 110.435C192.98 109.448 193.756 108.954 194.743 108.954C198.834 109.095 202.36 109.236 205.322 109.377C208.284 109.518 211.599 109.589 215.266 109.589C217.805 109.589 219.85 109.589 221.401 109.589C222.953 109.448 224.575 109.377 226.268 109.377C227.96 109.236 230.146 109.095 232.826 108.954C233.955 108.954 234.731 109.448 235.154 110.435C235.718 111.422 236 112.338 236 113.184C235.859 115.299 235.295 116.498 234.307 116.78C233.461 116.921 232.474 116.991 231.345 116.991C226.691 116.991 222.953 117.837 220.132 119.529C217.452 121.221 215.125 124.535 213.15 129.47C213.15 129.47 212.374 131.374 210.823 135.181C209.412 138.847 207.508 143.641 205.11 149.563C202.712 155.485 200.174 161.76 197.494 168.387C194.814 175.014 192.204 181.288 189.665 187.211C187.268 193.133 185.293 197.997 183.741 201.804C182.19 205.611 181.344 207.515 181.202 207.515H172.316Z" fill="black" stroke="black" stroke-width="2" class="letter-v letter" data-astro-cid-tvrurpns></path> </svg> </a>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Logo.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header> <nav class="solo-line"> ${renderComponent($$result, "Logo", $$Logo, {})} ${renderComponent($$result, "Navigation", $$Navigation, {})} </nav> </header>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Header.astro", void 0);

const $$Astro$4 = createAstro("https://dv-astro.netlify.app/");
const $$TypographyHero = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$TypographyHero;
  const { pageTitle, subTitle, theme } = Astro2.props;
  const compiledClasses = `typographyHero ${theme}`.trim();
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(compiledClasses, "class")} data-astro-cid-kgjdu7np> <p class="mainTitle" data-astro-cid-kgjdu7np>${pageTitle}</p> <p class="subTitle" data-astro-cid-kgjdu7np>${subTitle}</p> </div>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/TypographyHero.astro", void 0);

const CatSVGFile = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<svg viewBox=\"75 120 340 230\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path class=\"catBody\" style=\"stroke: rgb(0, 0, 0); fill: rgb(238, 188, 143); stroke-width: 5px;\" d=\"M 251.699 206.861 C 251.714 207.33 257.842 200.354 258.31 198.194 C 259.475 192.824 253.218 181.399 252.373 180.554 C 249.481 177.663 247.208 175.173 242.837 174.332 C 230.324 171.926 231.797 145.563 231.797 136.235 C 231.797 132.272 231.239 126.066 234.37 122.909 C 236.411 120.851 246.779 124.4 248.866 125.087 C 262.984 129.738 274.785 148.052 289.565 148.052 C 301.475 148.052 329.38 147.604 330.821 149.045 C 341.514 127.525 364.295 126.506 385.256 126.506 C 398.187 126.506 412.014 134.452 409.279 149.334 C 405.936 167.527 387.46 186.138 372.773 195.848 C 371.398 196.757 355.674 203.11 348.303 217.277 C 339.684 233.843 334.152 256.855 330.502 260.052 C 319.067 270.068 314.343 268.516 299.252 268.516 C 297.891 268.516 281.909 267.794 281.738 269.236 C 280.805 277.093 283.712 285.208 284.779 292.887 C 286.04 301.956 285.734 310.978 285.377 320.111 C 285.043 328.68 283.999 337.285 276.354 342.377 C 264.307 350.401 258.088 332.974 254.186 326.083 C 245.617 310.948 249.729 294.629 246.594 278.348 C 245.334 271.802 238.282 263.435 231.057 262.691 C 225.267 262.095 218.974 262.83 213.293 263.767 C 211.457 264.069 197.66 265.396 196.754 268.31 C 193.13 279.959 199.5 292.968 200.621 303.986 C 201.231 309.979 200.332 316.439 199.587 322.368 C 199.122 326.062 199.686 337.149 195.617 339.355 C 182.3 346.576 159.749 338.617 149.44 329.521 C 137.401 318.899 135.05 307.827 134.781 291.939 C 134.742 289.632 134.644 273.877 131.798 272.971 C 127.329 271.549 126.306 269.369 121.44 267.92 C 116.622 266.485 119.99 229.372 114.903 227.359 C 93.994 219.083 104.624 208.188 93.814 192.544 C 83.562 177.709 75.277 166.437 87.786 163.265 C 93.876 161.721 95.838 162.967 102.364 161.778 C 110.617 160.274 113.453 166.698 116.34 173.198 C 119.982 181.398 128.807 208.87 140.929 209.969 C 155.573 211.297 169.758 207.284 184.253 206.648 C 198.012 206.045 211.849 206.418 225.634 206.418 C 228.575 206.418 249.049 204.011 251.699 206.861 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\"/>\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); opacity: 0.9; stroke-width: 3px;\" d=\"M 293.299 161.139 C 292.534 160.645 285.949 164.129 286.582 167.298 C 287.158 170.181 286.511 176.614 288.124 178.818 C 290.307 181.805 295.248 182.016 297.911 181.687 C 301.897 181.193 302.318 178.666 302.318 173.195 C 302.318 171.269 302.348 167.686 301.709 165.921 C 300.327 162.1 295.784 160.845 293.299 161.139 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\"/>\n  <path style=\"stroke: rgb(0, 0, 0); opacity: 0.9; fill: rgb(198, 245, 248); stroke-width: 3px;\" d=\"M 292.711 164.959 C 292.657 165.85 292.605 173.328 293.002 178.093 C 293.062 178.818 294.52 181.211 294.911 181.787 C 295.595 182.792 296.57 178.535 296.85 177.475 C 297.893 173.508 297.117 167.779 296.258 163.936 C 296.078 163.126 295.254 161.04 294.192 161.093 C 293.263 161.139 293.018 163.884 292.711 164.959 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\"/>\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); stroke-width: 3px;\" d=\"M 320.631 164.917 C 317.978 167.869 320.465 173.345 320.566 178.064 C 320.71 184.838 327.781 185.927 331.995 183.556 C 335.152 181.782 335.465 177.232 333.809 171.82 C 333.133 169.61 332.692 166.964 331.031 165.685 C 329.926 164.836 321.028 164.516 320.631 164.917 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\"/>\n  <path style=\"stroke: rgb(0, 0, 0); fill: rgb(198, 245, 248); stroke-width: 3px;\" d=\"M 324.198 167.933 C 324.042 168.532 324.576 175.329 325.116 178.695 C 325.414 180.547 326.97 185.173 328.634 184.44 C 330.278 183.715 328.645 179.087 328.902 176.956 C 329.206 174.426 329.143 169.948 328.636 167.299 C 327.985 163.891 324.964 164.988 324.198 167.933 Z\" transform=\"matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)\"/>\n  <g transform=\"matrix(1.1565430164337158, 0, 0, 1.1565430164337158, 8.607187271118164, -66.16307830810547)\" style=\"\">\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255); stroke-width: 4.32323px;\" d=\"M 259.072 224.247 C 258.554 224.349 254.207 231.263 257.395 234.279 C 258.787 235.596 260.785 235.627 262.58 235.59 C 263.756 235.566 265.385 235.653 266.43 234.972 C 267.547 234.244 267.805 232.395 268.07 231.22 C 269.172 226.337 263.523 222.036 259.072 224.247 Z\"/>\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgba(255, 255, 255, 0); stroke-width: 4.32323px;\" d=\"M 266.357 235.346 C 272.24 237.657 279.208 240.856 283.675 234.47 C 284.506 233.283 284.803 232.079 285.099 230.721\"/>\n    <path style=\"stroke: rgb(0, 0, 0); fill: rgba(255, 255, 255, 0); stroke-width: 4.32323px;\" d=\"M 259.673 235.332 C 255.95 240.635 245.093 238.988 240.355 235.248 C 238.9 234.101 238.97 232.47 237.749 231.462\"/>\n  </g>\n</svg>\n\n";

const $$CatSVG = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="background-container" data-astro-cid-wmnv4f23> <div class="catSVG" id="cat-svg"${addAttribute(CatSVGFile, "data-svg")} data-astro-cid-wmnv4f23> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(CatSVGFile)}` })} </div> <div class="catControls" data-astro-cid-wmnv4f23> <div class="catControlsInner line-border" data-astro-cid-wmnv4f23> <label for="spacing-slider" data-astro-cid-wmnv4f23>Adjust Cat Space</label> <input id="spacing-slider" type="range" min="50" max="300" value="100" data-astro-cid-wmnv4f23> <span id="slider-value" data-astro-cid-wmnv4f23>100</span> </div> </div> </div> ${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/components/CatSVG.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/CatSVG.astro", void 0);

const AstroSVGRaw = "<svg viewBox=\"0 0 460 160\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" id='astroSVG'>\n<title>Astro</title>\n\n<path class=\"letter letter-1\" d=\"M65.7846 121.175C61.2669 117.045 59.9481 108.368 61.8303 102.082C65.0939 106.045 69.6158 107.301 74.2997 108.009C81.5305 109.103 88.6318 108.694 95.349 105.389C96.1174 105.011 96.8275 104.507 97.6672 103.998C98.2974 105.826 98.4615 107.672 98.2413 109.551C97.706 114.127 95.4288 117.662 91.8069 120.341C90.3586 121.413 88.8261 122.371 87.3303 123.382C82.7349 126.487 81.4917 130.129 83.2184 135.427C83.2594 135.556 83.2961 135.685 83.389 136C81.0427 134.95 79.3289 133.421 78.023 131.411C76.6438 129.289 75.9876 126.942 75.9531 124.403C75.9358 123.167 75.9358 121.92 75.7696 120.702C75.3638 117.732 73.9694 116.402 71.3426 116.325C68.6467 116.247 66.5141 117.913 65.9486 120.538C65.9054 120.739 65.8428 120.938 65.7803 121.172L65.7846 121.175Z\" />\n<path class=\"flame letter-1\" d=\"M65.7846 121.175C61.2669 117.045 59.9481 108.368 61.8303 102.082C65.0939 106.045 69.6158 107.301 74.2997 108.009C81.5305 109.103 88.6318 108.694 95.349 105.389C96.1174 105.011 96.8275 104.507 97.6672 103.998C98.2974 105.826 98.4615 107.672 98.2413 109.551C97.706 114.127 95.4288 117.662 91.8069 120.341C90.3586 121.413 88.8261 122.371 87.3303 123.382C82.7349 126.487 81.4917 130.129 83.2184 135.427C83.2594 135.556 83.2961 135.685 83.389 136C81.0427 134.95 79.3289 133.421 78.023 131.411C76.6438 129.289 75.9876 126.942 75.9531 124.403C75.9358 123.167 75.9358 121.92 75.7696 120.702C75.3638 117.732 73.9694 116.402 71.3426 116.325C68.6467 116.247 66.5141 117.913 65.9486 120.538C65.9054 120.739 65.8428 120.938 65.7803 121.172L65.7846 121.175Z\" />\n<path class=\"letter letter-2\" d=\"M40 101.034C40 101.034 53.3775 94.5177 66.7924 94.5177L76.9068 63.2155C77.2855 61.7017 78.3911 60.6729 79.6393 60.6729C80.8875 60.6729 81.9932 61.7017 82.3719 63.2155L92.4862 94.5177C108.374 94.5177 119.279 101.034 119.279 101.034C119.279 101.034 96.5558 39.133 96.5114 39.0088C95.8592 37.1787 94.7583 36 93.274 36H66.007C64.5227 36 63.4662 37.1787 62.7696 39.0088C62.7205 39.1307 40 101.034 40 101.034Z\" />\n<path class=\"letter letter-3\" d=\"M181.043 81.1227C181.043 86.6079 174.22 89.8838 164.773 89.8838C158.624 89.8838 156.45 88.3601 156.45 85.1604C156.45 81.8083 159.149 80.2085 165.297 80.2085C170.846 80.2085 175.569 80.2846 181.043 80.9703V81.1227ZM181.118 74.3423C177.744 73.5805 172.645 73.1234 166.572 73.1234C148.877 73.1234 140.555 77.3135 140.555 87.065C140.555 97.1975 146.253 101.083 159.449 101.083C170.621 101.083 178.193 98.2641 180.968 91.3313H181.417C181.342 93.0074 181.268 94.6834 181.268 95.9785C181.268 99.5592 181.867 99.8639 184.791 99.8639H198.587C197.837 97.7308 197.388 91.7122 197.388 86.5317C197.388 80.9703 197.612 76.7802 197.612 71.1426C197.612 59.6388 190.715 52.3251 169.121 52.3251C159.824 52.3251 149.477 53.925 141.605 56.2867C142.354 59.4102 143.404 65.7335 143.929 69.8474C150.752 66.6477 160.424 65.2764 167.922 65.2764C178.268 65.2764 181.118 67.6381 181.118 72.4377V74.3423Z\" />\n<path class=\"letter letter-4\" d=\"M218.971 84.3224C217.097 84.5509 214.547 84.5509 211.923 84.5509C209.149 84.5509 206.6 84.4748 204.875 84.2462C204.875 84.8557 204.8 85.5413 204.8 86.1508C204.8 95.6738 211.024 101.235 232.917 101.235C253.535 101.235 260.208 95.75 260.208 86.0746C260.208 76.9325 255.785 72.4377 236.216 71.4473C220.995 70.7616 219.646 69.0856 219.646 67.181C219.646 64.9717 221.595 63.8289 231.792 63.8289C242.364 63.8289 245.213 65.2764 245.213 68.3238V69.0094C246.713 68.9332 249.412 68.8571 252.186 68.8571C254.81 68.8571 257.659 68.9332 259.309 69.0856C259.309 68.3999 259.384 67.7905 259.384 67.2572C259.384 56.0581 250.086 52.4013 232.092 52.4013C211.848 52.4013 205.025 57.3533 205.025 67.0286C205.025 75.7136 210.499 81.1227 229.918 81.9607C244.238 82.4178 245.813 84.0177 245.813 86.227C245.813 88.5887 243.489 89.6553 233.442 89.6553C221.895 89.6553 218.971 88.0554 218.971 84.7795V84.3224Z\" />\n<path class=\"letter letter-5\" d=\"M284.955 44.1734C279.482 49.2778 269.66 54.3821 264.187 55.7534C264.262 58.5722 264.262 63.7527 264.262 66.5715L269.285 66.6477C269.21 72.0568 269.135 78.6086 269.135 82.9511C269.135 93.0835 274.458 100.702 291.028 100.702C298.001 100.702 302.65 99.9401 308.423 98.7212C307.823 94.9881 307.148 89.2743 306.923 84.9319C303.475 86.0746 299.126 86.6841 294.327 86.6841C287.654 86.6841 284.955 84.8557 284.955 79.599C284.955 75.028 284.955 70.7616 285.03 66.8001C293.578 66.8763 302.125 67.0286 307.148 67.181C307.073 63.2194 307.223 57.5056 307.448 53.6964C300.176 53.8488 292.003 53.925 285.255 53.925C285.33 50.5729 285.405 47.3732 285.48 44.1734H284.955Z\" />\n<path class=\"letter letter-6\" d=\"M329.736 64.286C329.811 60.3244 329.886 56.9724 329.961 53.6964H314.89C315.115 60.2483 315.115 66.9525 315.115 76.7802C315.115 86.6079 315.04 93.3883 314.89 99.8639H332.135C331.835 95.2929 331.76 87.5983 331.76 81.0465C331.76 70.6855 335.959 67.7143 345.481 67.7143C349.905 67.7143 353.054 68.2476 355.828 69.238C355.903 65.3526 356.653 57.8104 357.102 54.4583C354.253 53.6203 351.104 53.087 347.28 53.087C339.108 53.0108 333.11 56.3629 330.336 64.3622L329.736 64.286Z\"/>\n<path class=\"letter letter-7\" d=\"M404.808 76.4754C404.808 84.7795 398.81 88.6649 389.363 88.6649C379.991 88.6649 373.993 85.008 373.993 76.4754C373.993 67.9428 380.066 64.7431 389.363 64.7431C398.735 64.7431 404.808 68.1714 404.808 76.4754ZM420.478 76.0945C420.478 59.5626 407.582 52.1728 389.363 52.1728C371.069 52.1728 358.623 59.5626 358.623 76.0945C358.623 92.5503 370.244 101.388 389.288 101.388C408.482 101.388 420.478 92.5503 420.478 76.0945Z\" />\n\n</svg>\n";

const $$Astro$3 = createAstro("https://dv-astro.netlify.app/");
const $$AstroSVG = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$AstroSVG;
  const lastUpdated = "2024-12-20";
  const astroVersionReal = Astro2.generator.replace("Astro ", "");
  return renderTemplate`${maybeRenderHead()}<div class="astroSVG" data-astro-cid-gzktvm76> ${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(AstroSVGRaw)}` })} </div> <div class="lastUpdated terminal" data-astro-cid-gzktvm76> <div class="inner" data-astro-cid-gzktvm76> <p data-astro-cid-gzktvm76>Astro Version <span data-astro-cid-gzktvm76>${astroVersionReal}</span></p> <p data-astro-cid-gzktvm76>
Site last updated<br data-astro-cid-gzktvm76> <span data-astro-cid-gzktvm76>${lastUpdated}</span> </p> </div> </div> ${renderScript($$result, "/Users/dvolz/Sites/dv/dv-astro/src/components/AstroSVG.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/AstroSVG.astro", void 0);

const platforms = {
	linkedin: {
		url: (username) => `https://www.linkedin.com/in/${username}`,
		icon: 'mdi:linkedin',
	},
	bluesky: {
		url: (username) => `https://bsky.app/profile/${username}.bsky.social`,
		icon: 'mdi:twitter',
	},
	instagram: {
		url: (username) => `https://www.instagram.com/${username}`,
		icon: 'mdi:instagram',
	},
};

const defaultPlatform = {
	url: (platform, username) => `https://www.${platform}.com/${username}`,
	icon: (platform) => `${platform}`,
};

const $$Astro$2 = createAstro("https://dv-astro.netlify.app/");
const $$Social = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Social;
  const { platform, username, icon } = Astro2.props;
  const { url, socialIcon } = platforms[platform] ? {
    url: platforms[platform].url(username),
    socialIcon: platforms[platform].icon
  } : {
    url: defaultPlatform.url(platform, username),
    socialIcon: defaultPlatform.icon(icon)
  };
  return renderTemplate`${maybeRenderHead()}<li class="social-item" data-astro-cid-yxtifmrq> <a${addAttribute(url, "href")}${addAttribute(platform, "title")} target="_blank" data-astro-cid-yxtifmrq> ${renderComponent($$result, "Icon", $$Icon, { "name": socialIcon, "style": "stroke: var(--text-color); stroke-width:.7; fill:none;", "data-astro-cid-yxtifmrq": true })} </a> </li>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Social.astro", void 0);

const $$Astro$1 = createAstro("https://dv-astro.netlify.app/");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const socialLinks = [
    { platform: "bluesky", username: "saladjones", icon: "mdi:twitter" },
    { platform: "instagram", username: "penia", icon: "mdi:instagram" },
    { platform: "linkedin", username: "davidtvolz", icon: "mdi:linkedin" }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="solo-line" data-astro-cid-sz7xmlte> <div class="row" data-astro-cid-sz7xmlte> <div class="column" data-astro-cid-sz7xmlte> <ul class="social-footer" data-astro-cid-sz7xmlte> ${socialLinks.map(({ platform, username, icon }) => renderTemplate`${renderComponent($$result, "Social", $$Social, { "platform": platform, "username": username, "icon": icon, "data-astro-cid-sz7xmlte": true })}`)} </ul> </div> <div class="column catColumn" data-astro-cid-sz7xmlte> ${renderComponent($$result, "CatSVG", $$CatSVG, { "data-astro-cid-sz7xmlte": true })} <p data-astro-cid-sz7xmlte>&copy; Copyright ${currentYear}</p> </div> <div class="column astroColumn" data-astro-cid-sz7xmlte> <p data-astro-cid-sz7xmlte>Developed from scratch using</p> ${renderComponent($$result, "AstroSVG", $$AstroSVG, { "data-astro-cid-sz7xmlte": true })} </div> </div> </footer>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Footer.astro", void 0);

const $$Variables = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate``;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/Variables.astro", void 0);

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    pageTitle,
    subTitle,
    showSidebar,
    showTypographyHero = true,
    theme = "",
    fullWidthBody = false,
    pubDate,
    description = "Sample Description"
  } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon-dv.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${pageTitle}</title><meta name="description"${addAttribute(description, "content")}><meta name="generator"${addAttribute(Astro2.generator, "content")}><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap" as="style" onload="this.rel='stylesheet'">${renderComponent($$result, "Variables", $$Variables, {})}${renderHead()}</head> <body${addAttribute(`${fullWidthBody ? "full-width-body" : ""} ${theme}`, "class")}> <div${addAttribute([
    "site",
    showSidebar ? "sidebar" : "",
    fullWidthBody ? "full-width-body" : ""
  ].filter(Boolean).join(" "), "class")}> ${renderComponent($$result, "Header", $$Header, {})} <main> ${showTypographyHero && renderTemplate`${renderComponent($$result, "TypographyHero", $$TypographyHero, { "pageTitle": pageTitle, "subTitle": subTitle, "theme": theme })}`} ${renderSlot($$result, $$slots["default"])} </main> ${showSidebar && renderTemplate`<aside> <div class="sidebar-item"> <h3>Thoughts</h3> </div> </aside>`} ${renderComponent($$result, "Footer", $$Footer, {})} </div> </body></html>`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $, $$Icon as a };