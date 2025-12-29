import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { readFileSync } from 'fs';
import astroExpressiveCode from 'astro-expressive-code';
import ecTwoSlash from 'expressive-code-twoslash';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// https://astro.build/config
import mdx from '@astrojs/mdx';
import tailwind from '@tailwindcss/vite';
// import cloudflare from '@astrojs/cloudflare';

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

	experimental: {},

	integrations: [
		astroExpressiveCode({
			defaultProps: {
				showLineNumbers: false,
			},
			themes: ['tokyo-night', 'github-light'],
			plugins: [pluginLineNumbers(), pluginCollapsibleSections(), ecTwoSlash()],
		}),
		icon(),
		react(),
		mdx(),
		sitemap({
			filter: page => page !== 'https://nicknisi.com/resume',
		}),
	],

	markdown: {},

	redirects: {
		// redirects for RSS feed
		'/feed/feed.xml': '/rss.xml',

		// simpler talk redirects for sharing
		'/state-talk': '/speaking/componentizing-application-state',
		'/compiler-talk': '/speaking/unleashing-the-typescript-compiler',
		'/talks/componentizing-application-state': '/speaking/componentizing-application-state',
		'/talks/unleashing-the-typescript-compiler': '/speaking/unleashing-the-typescript-compiler',
		'/talks/about-my-coworkers': '/speaking/about-my-coworkers',
		// rename /talks to /speaking
		'/talks': '/speaking',
	},

	vite: {
		plugins: [rawBuffer(), tailwind()],
		build: { minify: false },
	},

	output: 'static',
	// adapter: cloudflare({
	// 	//imageService: 'cloudflare',
	// }),
});

/**
 * Vite plugin to load raw buffer data from a file.
 * This is useful for loading binary data like images or fonts.
 * @returns a Vite plugin object
 * @see https://vitejs.dev/config/#plugins
 */
function rawBuffer() {
	return {
		name: 'vite-plugin-raw-buffer',
		transform(_: unknown, id: string) {
			if (id.endsWith('?buffer')) {
				const buffer = readFileSync(id.replace(/\?buffer$/, ''));
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
			return undefined;
		},
	};
}
