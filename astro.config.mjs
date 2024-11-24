import { defineConfig } from 'astro/config'
import icon from 'astro-icon'

import preact from '@astrojs/preact'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
	site: 'https://dv-astro.netlify.app/',
	integrations: [react(), preact(), icon()],
})
