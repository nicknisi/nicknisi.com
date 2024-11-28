import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { readFileSync } from 'fs';

// https://astro.build/config
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

function rawBuffer(ext: string[]) {
	return {
		name: 'vite-plugin-raw-buffer',
		transform(_: unknown, id: string) {
			if (ext.some(e => id.endsWith(e))) {
				const buffer = readFileSync(id.replace(/\?buffer$/, ''));
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}

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

	vite: {
		plugins: [rawBuffer(['.ttf', '?buffer'])],
	},

	output: 'hybrid',
	adapter: cloudflare(),
});
