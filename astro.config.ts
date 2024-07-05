import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	site: 'https://nicknisi.com',
	server: {
		port: 8080,
	},
	image: {
		domains: ['img.youtube.com', 'vimeo.com'],
	},
	integrations: [
		icon(),
		react(),
		mdx(),
		tailwind(),
		sitemap({
			filter: page => page !== 'https://nicknisi.com/resume',
		}),
	],
	markdown: {
		shikiConfig: {
			theme: 'dracula',
			wrap: true,
		},
	},
});
