// Transform posts into a common format
export function transformPosts(posts, sourceType) {
	return posts.map((post) => {
		const data = sourceType === 'astro' ? post.blogData : post.frontmatter

		return {
			url: post.url,
			title: data?.title ?? 'Untitled',
			date: data?.pubDate ?? 'Unknown date',
			display: data?.display ?? true,
			description: data?.description ?? 'No Description',
			featured: data?.featured ?? false,
			tags: data?.tags ?? 'no tags',
		}
	})
}

// Filter posts by category
export function filterPostsByCategory(posts, category) {
	if (category === 'both') return posts
	return posts.filter((post) =>
		category === 'thoughts'
			? post.url.includes('/thoughts/')
			: post.url.includes('/play/')
	)
}

// Filter by featured status
export function filterFeaturedPosts(posts, isFeatured) {
	return isFeatured ? posts.filter((post) => post.featured) : posts
}

// Match display components from a pre-loaded module map
export function loadDynamicComponents(posts, displayModules) {
	return posts.map((post) => {
		if (post.display) {
			const formattedTitle = post.title.replace(/\s+/g, '-').toLowerCase()
			const filename = `${formattedTitle}-display.astro`
			// Find the module by matching the end of the key (handles different relative paths)
			const entry = Object.entries(displayModules).find(([key]) =>
				key.endsWith(`/${filename}`)
			)
			if (entry) {
				return { ...post, DynamicComponent: entry[1].default }
			}
			console.error(
				`Display component not found for ${post.title} (expected ${filename})`
			)
		}
		return { ...post, DynamicComponent: null }
	})
}
