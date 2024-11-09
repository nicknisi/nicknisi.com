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
		// redirects for mastodon
		'/.well-known/host-meta*': 'https://fediverse.nicknisi.com/.well-known/host-meta:splat',
		'/.well-known/webfinger*': 'https://fediverse.nicknisi.com/.well-known/webfinger:splat',
		'/.well-known/nodeinfo*': 'https://fediverse.nicknisi.com/.well-known/nodeinfo:splat',
		'/@nicknisi': 'https://fediverse.nicknisi.com/@nicknisi',

		// redirects for RSS feed
		'/feed/feed.xml': 'https://nicknisi.com/rss.xml',

		// tsconf info
		'/tsconf': 'https://archive.tsconf.io/2021/',

		// simpler talk redirects for sharing
		'/state-talk': '/talks/componentizing-application-state',
		'/compiler-talk': '/talks/unleashing-the-typescript-compiler',
	},
});
