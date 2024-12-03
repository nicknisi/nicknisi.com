import {
	type AppBskyFeedGetLikes,
	//type AppBskyFeedGetPostThread
} from '@atproto/api';
const DID = 'did:plc:qcyz4wcmgnz4mzxevrsrf6j6';

function formatUri(uri: string) {
	if (!uri.startsWith('at://') && uri.includes('bsky.app/profile/')) {
		const match = uri.match(/profile\/([\w.]+)\/post\/([\w]+)/);
		if (match) {
			const [, , postId] = match;
			return `at://${DID}/app.bsky.feed.post/${postId}`;
		}
	}
	return uri;
}

export async function getLikes(uri: string, limit = 100) {
	let likes: AppBskyFeedGetLikes.OutputSchema['likes'] = [];
	let cursor: string | undefined = undefined;
	do {
		const atUri = formatUri(uri);
		const params = new URLSearchParams({ uri: atUri, limit: limit.toString() });

		if (cursor) {
			params.set('cursor', cursor);
		}

		const likesUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getLikes?${params.toString()}`;

		const res = await fetch(likesUrl, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			cache: 'no-store',
		});
		const data = await res.json();
		cursor = data.cursor;
		likes.push(...(data.likes ?? []));
	} while (cursor);

	return likes;
}

//export async function getPostThread(uri: string) {
//	const atUri = formatUri(uri);
//	const params = new URLSearchParams({ uri: atUri });
//
//	const res = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?' + params.toString(), {
//		method: 'GET',
//		headers: {
//			Accept: 'application/json',
//		},
//		cache: 'no-store',
//	});
//
//	if (!res.ok) {
//		console.error(await res.text());
//		throw new Error('Failed to fetch post thread');
//	}
//
//	const data = (await res.json()) as AppBskyFeedGetPostThread.OutputSchema;
//
//	if (!AppBskyFeedDefs.isThreadViewPost(data.thread)) {
//		throw new Error('Could not find thread');
//	}
//
//	return data.thread;
//}

/**
 * recursively check for replies and add them up
 */
export function getCommentCount(comments: { replies?: any }[]) {
	let count = comments.length;
	for (const comment of comments) {
		if (comment.replies?.length) {
			count += getCommentCount(comment.replies);
		}
	}
	return count;
}
