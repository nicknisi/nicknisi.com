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
  return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy')
}

/**
* Get the reading time of a blog post
* @param content - Content of the blog post
*/
export function getWordCount(content: string = '') {
  const length = content.split(/\s+/gu).length;
  return Math.ceil(length / 240);
}
