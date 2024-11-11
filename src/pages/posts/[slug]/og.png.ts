import { getCollection } from 'astro:content';

export { GET } from '@/pages/og-image.png.js';

export async function getStaticPaths() {
	const posts = await getCollection('posts');
	return posts.map(post => ({
		params: { slug: post.slug },
		props: { post },
	}));
}
