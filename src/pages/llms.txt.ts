import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import metadata from '@/data/metadata.json';

// llms.txt: a markdown index for agents (https://llmstxt.org). Each post links
// to its `.md` variant so an agent can fetch clean markdown directly rather
// than scraping the rendered page.
export const GET: APIRoute = async () => {
	const mode = import.meta.env.MODE;
	const posts = await getCollection('posts', post => (mode === 'production' ? !post.data.draft : true));
	posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

	const lines = posts.map(post => {
		const href = post.data.external ?? `https://nicknisi.com/posts/${post.slug}.md`;
		const desc = post.data.description ? `: ${post.data.description}` : '';
		return `- [${post.data.title}](${href})${desc}`;
	});

	const body = [`# ${metadata.title}`, '', `> ${metadata.description}`, '', '## Posts', '', ...lines, ''].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
