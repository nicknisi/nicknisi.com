import { getCollection } from 'astro:content';
import { DateTime } from 'luxon';

/**
 * Throws an error if the condition is falsy.
 * @param condition The condition to check.
 * @param message The message to include in the error.
 */
export function invariant(condition: unknown, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}

/**
 * Convert a data to a readable format
 * @param dateObj - Date object to be converted to readable format
 * @returns Readable date string
 */
export function toReadableDate(dateObj: Date | string) {
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

/**
 * Get the blog posts collection, sorted by the date of publication.
 * @param limit The number of posts to return
 * @returns The blog posts collection
 */
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

/**
 * Get the appearnances collection, sorted by the date of the last instance.
 * Also, convert the date to a readable format
 * @param limit The number of appearances to return
 * @returns The appearances collection
 */
export async function getAppearances(limit?: number | undefined) {
	let appearances = (await getCollection('appearances')).sort((a, b) => {
		const aInstance = a.data.instances.at(-1);
		const bInstance = b.data.instances.at(-1);
		if (!aInstance || !bInstance) {
			return 0;
		}
		return new Date(aInstance.date) > new Date(bInstance.date) ? -1 : 1;
	});

	if (limit) {
		return appearances.slice(0, limit);
	}

	return appearances;
}
