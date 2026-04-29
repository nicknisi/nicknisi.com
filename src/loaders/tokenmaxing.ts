import type { Loader } from 'astro/loaders';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

interface Options {
	user: string;
	gistId: string;
	fixturePath?: string;
}

export const tokenmaxingLoader = ({ user, gistId, fixturePath }: Options): Loader => ({
	name: 'tokenmaxing',
	async load({ store, logger, parseData }) {
		// 1. Try local fixture first (dev mode)
		const localPath = fixturePath
			? resolve(dirname(fileURLToPath(import.meta.url)), '..', fixturePath)
			: null;
		if (localPath && existsSync(localPath)) {
			try {
				const data = JSON.parse(readFileSync(localPath, 'utf8'));
				store.set({ id: 'current', data: await parseData({ id: 'current', data }) });
				logger.info(`tokenmaxing: loaded fixture from ${fixturePath}`);
				return;
			} catch (err) {
				logger.warn(
					`tokenmaxing: fixture parse failed, falling through to gist: ${(err as Error).message}`,
				);
			}
		}

		// 2. Fall through to gist (production)
		if (!gistId) {
			logger.warn('tokenmaxing: no fixture found and TOKENMAXING_GIST_ID not set; skipping');
			return;
		}
		try {
			const url = `https://gist.githubusercontent.com/${user}/${gistId}/raw/tokenmaxing.json`;
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) throw new Error(`gist fetch ${res.status}`);
			const data = await res.json();
			store.set({ id: 'current', data: await parseData({ id: 'current', data }) });
			logger.info(`tokenmaxing: loaded from gist ${gistId}`);
		} catch (err) {
			logger.error(`tokenmaxing loader: ${(err as Error).message}`);
		}
	},
});
