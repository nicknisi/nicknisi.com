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
	prefetch: true,
	image: {
		domains: ['img.youtube.com', 'vimeo.com'],
	},
	experimental: {
		contentLayer: true,
	},
	integrations: [
		icon(),
		react(),
		mdx(),
		tailwind({
			applyBaseStyles: false,
		}),
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
	redirects: {
		// redirects for RSS feed
		'/feed/feed.xml': '/rss.xml',

		// simpler talk redirects for sharing
		'/state-talk': '/talks/componentizing-application-state',
		'/compiler-talk': '/talks/unleashing-the-typescript-compiler',
		// rename /talks to /speaking
		'/talks': '/speaking',
	},
});
