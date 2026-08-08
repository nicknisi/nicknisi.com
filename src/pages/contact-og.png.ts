import { fieldOgNode, renderOgResponse } from '@/utils/og';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () =>
	renderOgResponse(
		fieldOgNode({
			title: 'Let’s stay connected.',
			label: 'Contact Nick',
			detail: 'nick@nisi.org',
		}),
	);
