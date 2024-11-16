import type { Loader } from 'astro/loaders';
import { AtpAgent } from '@atproto/api';

export const authorFeedLoader = ({ handle, limit }: { handle: string; limit: number }): Loader => ({
	name: 'bsky',
	//schema: {},
	async load({ store, logger, meta, parseData }) {
		const agent = new AtpAgent({ service: 'https://public.api.bsky.app' });
		try {
			const mostRecent = meta.get('lastFetched') ?? 0;
			let cursor: string | undefined = '';
			let first;
			let count = 0;
			fetching: do {
				const { data } = await agent.getAuthorFeed({
					actor: handle,
					cursor,
					limit: 100,
				});

				for (const { post } of data.feed) {
					if ((mostRecent && mostRecent === post.cid) || (limit && count++ >= limit)) {
						break fetching;
					}

					if (!first) {
						first = post.cid;
					}
					store.set({
						id: post.uri,
						data: await parseData({
							id: post.uri,
							data: JSON.parse(JSON.stringify(post)),
						}),
					});
				}
				cursor = data.cursor;
			} while (cursor);

			if (first) {
				meta.set('lastFetched', first);
			}
		} catch (error) {
			logger.error(`Error loading author feed: ${(error as Error).message}`);
		}
	},
});
