// Transform posts into a common format
export function transformPosts(posts, sourceType) {
	return posts.map((post) => {
		const data = sourceType === 'astro' ? post.blogData : post.frontmatter

		return {
			url: post.url,
			title: data?.title ?? 'Untitled',
			date: data?.pubDate ?? 'Unknown date',
			display: data?.display ?? false,
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

// Dynamically load components for posts with `display: true`
export async function loadDynamicComponents(posts) {
	return Promise.all(
		posts.map(async (post) => {
			if (post.display) {
				try {
					const formattedTitle = post.title.replace(/\s+/g, '-').toLowerCase()
					const DynamicComponent = await import(
						`../components/display/${formattedTitle}-display.astro`
					)
					return { ...post, DynamicComponent: DynamicComponent.default }
				} catch (e) {
					console.error(
						`Failed to import dynamic component for ${post.title}`,
						e
					)
				}
			}
			return { ...post, DynamicComponent: null }
		})
	)
}
