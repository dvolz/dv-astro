import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
	site: 'https://dv-astro.netlify.app/',
	integrations: [react({ fastRefresh: false }), icon()],

	markdown: {
		shikiConfig: {
			// Enable word wrap to prevent horizontal scrolling
			wrap: true,
		},
	},
})
