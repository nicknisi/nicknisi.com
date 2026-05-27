import { jsx } from '@/utils/jsx-factory';
import { PALETTE, brandFooter, photoCard, pngDataUri, renderOgResponse, sparkle, squiggle, sticker } from '@/utils/og';
import type { APIRoute } from 'astro';
import type { ReactNode } from 'react';

import headshotImage from '@/assets/headshot.png?buffer';

export const GET: APIRoute = async () => {
	const headshotDataUri = await pngDataUri(headshotImage);
	const node: ReactNode = jsx(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: '58px 64px',
				background: PALETTE.paper,
				position: 'relative',
			},
		},
		// Decorative sparkle, top-right
		jsx(
			'div',
			{ style: { position: 'absolute', top: '50px', right: '76px', display: 'flex' } },
			sparkle(PALETTE.pine, 66),
		),
		// Kicker
		sticker('Engineering Team Training', { bg: PALETTE.pine, color: PALETTE.onLight, rotate: -2 }),
		// Title + headshot
		jsx(
			'div',
			{ style: { display: 'flex', alignItems: 'center', gap: '44px', flexGrow: 1, paddingTop: '6px' } },
			jsx(
				'div',
				{ style: { display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: '0px' } },
				jsx(
					'div',
					{
						style: {
							display: 'flex',
							fontFamily: 'Bricolage',
							fontWeight: 800,
							fontSize: 92,
							lineHeight: 1.0,
							letterSpacing: -2,
							color: PALETTE.grape,
						},
					},
					'AI-Native',
				),
				jsx(
					'div',
					{
						style: {
							display: 'flex',
							fontFamily: 'Bricolage',
							fontWeight: 800,
							fontSize: 92,
							lineHeight: 1.02,
							letterSpacing: -2,
							color: PALETTE.ink,
						},
					},
					'Engineer',
				),
				jsx('div', { style: { display: 'flex', marginTop: '16px' } }, squiggle(PALETTE.tomato, 280, 24)),
				jsx(
					'div',
					{
						style: {
							display: 'flex',
							marginTop: '26px',
							maxWidth: '520px',
							fontFamily: 'Atkinson',
							fontWeight: 700,
							fontSize: 30,
							lineHeight: 1.3,
							color: PALETTE.inkSoft,
						},
					},
					"You're not being replaced. You're being promoted.",
				),
			),
			jsx(
				'div',
				{ style: { display: 'flex', flexShrink: 0 } },
				photoCard(headshotDataUri, { width: 290, height: 290, rotate: -3, shadow: PALETTE.marigold }),
			),
		),
		// Footer
		jsx(
			'div',
			{ style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
			brandFooter(),
			sticker('Live · Tailored · Hands-on', { bg: PALETTE.sky, color: PALETTE.onLight, rotate: 2, fontSize: 18 }),
		),
	);

	return renderOgResponse(node);
};
