import { DateTime } from 'luxon';
import { getCollection } from 'astro:content';

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

export async function getPosts(max?: number) {
  const mode = import.meta.env.MODE;
  const posts = (
    await getCollection('posts', (post) => {
      if (mode === 'production') {
        return !post.data.draft;
      }
      return true;
    })
  ).reverse();

  if (max) {
    return posts.slice(0, max);
  }

  return posts;
}
