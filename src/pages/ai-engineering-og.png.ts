import { fieldOgNode, pngDataUri, renderOgResponse } from '@/utils/og';
import type { APIRoute } from 'astro';
import workshopImage from '@/assets/posts/2026-aie-europe-workshop.jpg?buffer';

export const GET: APIRoute = async () => {
	const node = fieldOgNode({
		title: 'Make AI how your team works.',
		label: 'Hands-on workshops',
		detail: 'Nick Nisi + crew',
		description: 'Real workflows. Shared practice. A room that ships together.',
		image: await pngDataUri(workshopImage),
		imagePosition: 'center',
	});
	return renderOgResponse(node);
};
