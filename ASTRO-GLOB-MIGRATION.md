# Astro.glob() → import.meta.glob() Migration Plan

## Background

`Astro.glob()` is **removed** in Astro 6. All calls must be replaced with `import.meta.glob()`.

### Key Differences

|                  | `Astro.glob()`          | `import.meta.glob({ eager: true })`    |
| ---------------- | ----------------------- | -------------------------------------- |
| **Returns**      | `Promise<Array>`        | `Record<string, Module>` (synchronous) |
| **Await**        | `await Astro.glob(...)` | No await needed                        |
| **Array**        | Returns array directly  | Must wrap: `Object.values(...)`        |
| **Module shape** | Identical               | Identical (with `eager: true`)         |

### Conversion Pattern

```diff
- const posts = await Astro.glob('./posts/*.md')
+ const posts = Object.values(import.meta.glob('./posts/*.md', { eager: true }))
```

With try/catch (for globs that may match 0 files):

```diff
- let posts = []
- try {
-   posts = await Astro.glob('./posts/*.md')
- } catch {}
+ const posts = Object.values(import.meta.glob('./posts/*.md', { eager: true }))
```

> **Note:** `import.meta.glob` returns an empty object `{}` when no files match —
> `Object.values({})` returns `[]`. No try/catch needed.

### What stays the same

The module objects returned by `import.meta.glob({ eager: true })` have the **same shape** as `Astro.glob()`:

- **`.md` files**: `{ frontmatter, url, Content, ... }`
- **`.astro` files**: `{ default (component), blogData, url, ... }`

The `url` property, `frontmatter`, and named exports like `blogData` all work identically.

---

## Files to Change (4 files, ~20 call sites)

### Current state: No `.md` files exist in `play/` or `thoughts/`

All `.md` files were previously moved to `src/examples/`. The try/catch blocks around `.md` globs exist only to prevent build errors from empty matches. With `import.meta.glob`, empty matches return `{}` → `[]`, so **all try/catch wrappers can be removed**.

---

### File 1: `src/pages/tags/index.astro`

**1 glob call.** Simplest file.

```diff
  ---
  import BaseLayout from '../../layouts/BaseLayout.astro'
- let allPosts = []
- try {
- 	allPosts = await Astro.glob('../thoughts/*.md')
- } catch {}
+ const allPosts = Object.values(import.meta.glob('../thoughts/*.md', { eager: true }))
  const tags = [...new Set(allPosts.map((post) => post.frontmatter.tags).flat())]
```

---

### File 2: `src/components/RecentItems.astro`

**4 glob calls.** All in the frontmatter section.

```diff
  // Use Astro.glob to load posts
- let mdPlay = []
- try {
- 	mdPlay = await Astro.glob('../pages/play/*.md')
- } catch {}
- const astroPlay = await Astro.glob('../pages/play/*.astro')
- let mdThoughts = []
- try {
- 	mdThoughts = await Astro.glob('../pages/thoughts/*.md')
- } catch {}
- const astroThoughts = await Astro.glob('../pages/thoughts/*.astro')
+ const mdPlay = Object.values(import.meta.glob('../pages/play/*.md', { eager: true }))
+ const astroPlay = Object.values(import.meta.glob('../pages/play/*.astro', { eager: true }))
+ const mdThoughts = Object.values(import.meta.glob('../pages/thoughts/*.md', { eager: true }))
+ const astroThoughts = Object.values(import.meta.glob('../pages/thoughts/*.astro', { eager: true }))
```

---

### File 3: `src/components/RecentItems-works.astro`

**4 glob calls.** Similar pattern but uses `|| {}` fallback instead of try/catch for some.

```diff
- const mdPlay = (await Astro.glob('../pages/play/*.md')) || {}
- const astroPlay = (await Astro.glob('../pages/play/*.astro')) || {}
- let mdThoughts = []
- try {
- 	mdThoughts = await Astro.glob('../pages/thoughts/*.md')
- } catch {}
- const astroThoughts = (await Astro.glob('../pages/thoughts/*.astro')) || {}
+ const mdPlay = Object.values(import.meta.glob('../pages/play/*.md', { eager: true }))
+ const astroPlay = Object.values(import.meta.glob('../pages/play/*.astro', { eager: true }))
+ const mdThoughts = Object.values(import.meta.glob('../pages/thoughts/*.md', { eager: true }))
+ const astroThoughts = Object.values(import.meta.glob('../pages/thoughts/*.astro', { eager: true }))
```

---

### File 4: `src/pages/tags/[tag].astro`

**8 glob calls** — the most complex file. Has TWO identical sets of globs:

1. Inside `getStaticPaths()` (lines 12–22)
2. In the page frontmatter body (lines 47–57)

Both blocks get the same treatment.

#### Block 1: Inside `getStaticPaths()`

```diff
  export async function getStaticPaths() {
- 	let mdPlay = []
- 	try {
- 		mdPlay = await Astro.glob('../play/*.md')
- 	} catch {}
- 	const astroPlay = await Astro.glob('../play/*.astro')
- 	let mdThoughts = []
- 	try {
- 		mdThoughts = await Astro.glob('../thoughts/*.md')
- 	} catch {}
- 	const astroThoughts = await Astro.glob('../thoughts/*.astro')
+ 	const mdPlay = Object.values(import.meta.glob('../play/*.md', { eager: true }))
+ 	const astroPlay = Object.values(import.meta.glob('../play/*.astro', { eager: true }))
+ 	const mdThoughts = Object.values(import.meta.glob('../thoughts/*.md', { eager: true }))
+ 	const astroThoughts = Object.values(import.meta.glob('../thoughts/*.astro', { eager: true }))
```

#### Block 2: Page frontmatter body

```diff
- // Use Astro.glob to load posts
- let mdPlay = []
- try {
- 	mdPlay = await Astro.glob('../play/*.md')
- } catch {}
- const astroPlay = await Astro.glob('../play/*.astro')
- let mdThoughts = []
- try {
- 	mdThoughts = await Astro.glob('../thoughts/*.md')
- } catch {}
- const astroThoughts = await Astro.glob('../thoughts/*.astro')
+ // Use import.meta.glob to load posts
+ const mdPlay = Object.values(import.meta.glob('../play/*.md', { eager: true }))
+ const astroPlay = Object.values(import.meta.glob('../play/*.astro', { eager: true }))
+ const mdThoughts = Object.values(import.meta.glob('../thoughts/*.md', { eager: true }))
+ const astroThoughts = Object.values(import.meta.glob('../thoughts/*.astro', { eager: true }))
```

---

## Additional Cleanup

### File 5: `astro.config.mjs`

Remove the `Astro.glob` deprecation warning suppression since it's no longer relevant:

```diff
  import { defineConfig } from 'astro/config'
  import icon from 'astro-icon'
  import react from '@astrojs/react'

- // Suppress specific warnings
- const originalConsoleWarn = console.warn
- console.warn = (message, ...args) => {
- 	if (message.includes('Astro.glob is deprecated')) {
- 		return // Ignore this specific warning
- 	}
- 	originalConsoleWarn(message, ...args) // Allow other warnings
- }
-
  // https://astro.build/config
  export default defineConfig({
```

### File 6: `src/pages/play.astro`

Update deprecated `astro:schema` import (deprecated in Astro 6):

```diff
  ---
- import { object } from 'astro:schema'
+ import { z } from 'astro/zod'
```

> **Note:** Check if `object` is actually used in this file. If it's unused, just remove the import entirely.

### File 7: `src/pages/rss.xml.js`

Already uses `import.meta.glob` — **no changes needed**. Just verify it still works.

---

## Checklist

- [ ] **1.** Update `src/pages/tags/index.astro` (1 glob)
- [ ] **2.** Update `src/components/RecentItems.astro` (4 globs)
- [ ] **3.** Update `src/components/RecentItems-works.astro` (4 globs)
- [ ] **4.** Update `src/pages/tags/[tag].astro` (8 globs, 2 blocks)
- [ ] **5.** Remove console.warn suppression from `astro.config.mjs`
- [ ] **6.** Fix `astro:schema` import in `src/pages/play.astro`
- [ ] **7.** Update comment text from "Astro.glob" → "import.meta.glob"
- [ ] **8.** Run `npm run build` — verify no errors
- [ ] **9.** Run `npm run dev` — spot check pages:
  - Home page (RecentItems renders)
  - `/play` page (RecentItems renders)
  - `/thoughts` page
  - `/tags` page (tags list renders)
  - `/tags/<any-tag>` page (filtered posts render)
  - RSS feed at `/rss.xml`
- [ ] **10.** Verify all post cards show correct title, date, description, and display components

---

## Risk Assessment

| Risk                                                         | Likelihood | Impact | Mitigation                                            |
| ------------------------------------------------------------ | ---------- | ------ | ----------------------------------------------------- |
| Module shape differs between Astro.glob and import.meta.glob | Very low   | High   | `{ eager: true }` ensures identical module shape      |
| `url` property missing on modules                            | Very low   | High   | Vite provides `url` for page files in `src/pages/`    |
| `.md` glob returns error when no files match                 | None       | N/A    | `import.meta.glob` returns `{}`, not an error         |
| `.astro` page exports (`blogData`) not accessible            | Very low   | High   | Named exports work identically with `eager: true`     |
| `getStaticPaths()` breaks due to import.meta.glob            | Low        | High   | `import.meta.glob` is valid inside `getStaticPaths()` |

### Why `{ eager: true }` is critical

Without `eager: true`, `import.meta.glob` returns lazy import functions instead of resolved modules:

```js
// WITHOUT eager — returns { './post.md': () => import('./post.md') }
// WITH eager — returns { './post.md': { frontmatter, url, ... } }
```

`Astro.glob()` always eagerly loaded modules, so `{ eager: true }` preserves the same behavior.
