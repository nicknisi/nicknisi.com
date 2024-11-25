import { getCollection } from 'astro:content';
import { DateTime } from 'luxon';

/**
 * Convert a data to a readable format
 * @param dateObj - Date object to be converted to readable format
 * @returns Readable date string
 */
export function readableDate(dateObj: Date | string) {
	if (typeof dateObj === 'string') {
		dateObj = new Date(dateObj);
	}
	return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy');
}

/**
 * Get the reading time of a blog post
 * @param content - Content of the blog post
 */
export function getWordCount(content: string = '') {
	const length = content.split(/\s+/gu).length;
	return Math.ceil(length / 240);
}

export async function getPosts(limit?: number | undefined) {
	const mode = import.meta.env.MODE;
	const posts = (
		await getCollection('posts', post => {
			if (mode === 'production') {
				return !post.data.draft;
			}
			return true;
		})
	).sort((a, b) => {
		return new Date(a.data.pubDate) > new Date(b.data.pubDate) ? -1 : 1;
	});

	if (limit) {
		return posts.slice(0, limit);
	}

	return posts;
}

export async function getAppearances(limit?: number | undefined) {
	let appearances = (await getCollection('appearances')).sort((a, b) => {
		return new Date(a.data.instances[0].date) > new Date(b.data.instances[0].date) ? -1 : 1;
	});

	if (limit) {
		appearances = appearances.slice(0, limit);
	}

	return appearances.map(appearance => ({
		...appearance,
		data: {
			...appearance.data,
			instances: appearance.data.instances.map(instance => ({
				...instance,
				date: readableDate(instance.date),
			})),
		},
	}));
}
