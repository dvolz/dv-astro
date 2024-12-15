import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import preact from '@astrojs/preact'
import react from '@astrojs/react'

// Suppress specific warnings
const originalConsoleWarn = console.warn
console.warn = (message, ...args) => {
	if (message.includes('Astro.glob is deprecated')) {
		return // Ignore this specific warning
	}
	originalConsoleWarn(message, ...args) // Allow other warnings
}

// https://astro.build/config
export default defineConfig({
	site: 'https://dv-astro.netlify.app/',
	integrations: [react(), preact(), icon()],

	image: {
		experimentalLayout: 'responsive',
	},
	experimental: {
		responsiveImages: true,
	},
})
