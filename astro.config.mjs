import { defineConfig, fontProviders } from 'astro/config'
import icon from 'astro-icon'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
	site: 'https://dv-astro.netlify.app/',
	integrations: [react({ fastRefresh: false }), icon()],

	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Source Serif 4',
			cssVariable: '--font-source-serif',
			weights: [200, 300, 400, 500, 600, 700, 800, 900],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Poppins',
			cssVariable: '--font-poppins',
			weights: [700],
			styles: ['normal'],
			fallbacks: ['Arial', 'sans-serif'],
		},
	],

	markdown: {
		shikiConfig: {
			// Enable word wrap to prevent horizontal scrolling
			wrap: true,
		},
	},

	vite: {
		optimizeDeps: {
			// Prevent Vite 7 dep scanner from looking for preact JSX runtime in .jsx files
			exclude: ['preact/jsx-dev-runtime'],
			// Pre-bundle astro-icon to prevent "Cannot read properties of undefined (reading 'call')"
			// errors during Vite dependency re-optimization on HMR
			include: ['astro-icon/components'],
		},
	},
})
