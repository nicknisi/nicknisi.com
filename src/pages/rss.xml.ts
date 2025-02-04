import rss from '@astrojs/rss';
import metadata from '../data/metadata.json';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import markdownIt from 'markdown-it';

export async function GET({ site }: { site: URL }) {
	const posts = (await getCollection('posts', post => !post.data.draft)).reverse();
	return rss({
		title: metadata.title,
		description: metadata.description,
		site: site.toString(),
		customData: `<language>en-us</language>`,
		items: posts
			.filter(post => !post.data.external)
			.map(post => ({
				...post.data,
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/posts/${post.slug}`,
				content: sanitizeHtml(markdownIt().render(post.body)),
			})),
	});
}
