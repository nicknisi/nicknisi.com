import { jsx } from '@/utils/jsx-factory';
import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

import dmSansBoldData from '@@/public/fonts/DM_Sans/DMSans-Bold.ttf?buffer';
import oswaldBoldData from '@@/public/fonts/Oswald/Oswald-Bold.ttf?buffer';
import robotoBoldData from '@@/public/fonts/Roboto/Roboto-Bold.ttf?buffer';
import robotoData from '@@/public/fonts/Roboto/Roboto-Regular.ttf?buffer';

import beefImage from '@/assets/beef_nick.png?buffer';
import headshotImage from '@/assets/headshot.png?buffer';

export const GET: APIRoute = async () => {
	const beef = `data:image/png;base64,${Buffer.from(beefImage).toString('base64')}`;
	const headshot = `data:image/png;base64,${Buffer.from(headshotImage).toString('base64')}`;

	const node = jsx(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				backgroundImage: 'linear-gradient(135deg, #240754, #34126f, #421987, #240754)',
				backgroundColor: '#240754',
				position: 'relative',
				overflow: 'hidden',
			},
		},
		// Decorative glow — top-left purple
		jsx('div', {
			style: {
				position: 'absolute',
				top: '-200px',
				left: '-100px',
				width: '500px',
				height: '500px',
				borderRadius: '50%',
				background: 'radial-gradient(circle, rgba(101, 60, 173, 0.4), transparent 70%)',
			},
		}),
		// Decorative glow — bottom-right teal
		jsx('div', {
			style: {
				position: 'absolute',
				bottom: '-150px',
				right: '-50px',
				width: '400px',
				height: '400px',
				borderRadius: '50%',
				background: 'radial-gradient(circle, rgba(95, 227, 192, 0.15), transparent 70%)',
			},
		}),
		// Main content
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '2.5rem',
					padding: '3rem',
					flexGrow: 1,
					position: 'relative',
				},
			},
			// Headshot
			jsx('div', {
				style: {
					backgroundImage: `url('${headshot}')`,
					backgroundRepeat: 'no-repeat',
					backgroundSize: '100% 100%',
					width: '240px',
					height: '240px',
					borderRadius: '30px',
					display: 'flex',
					flexShrink: 0,
					boxShadow: '0 0 40px 10px rgba(101, 60, 173, 0.3), 0 0 10px 5px rgba(0, 0, 0, 0.4)',
					border: '3px solid rgba(255, 255, 255, 0.1)',
				},
			}),
			// Text content
			jsx(
				'div',
				{
					style: {
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						flexGrow: 1,
					},
				},
				// Title
				jsx(
					'h1',
					{
						style: {
							fontFamily: 'Oswald Bold',
							fontSize: 82,
							color: 'white',
							lineHeight: 1.1,
							letterSpacing: -1,
							margin: 0,
						},
					},
					'The AI-Native',
				),
				jsx(
					'h1',
					{
						style: {
							fontFamily: 'Oswald Bold',
							fontSize: 82,
							color: 'transparent',
							backgroundImage: 'linear-gradient(135deg, #8662c7, #5fe3c0, #81defd)',
							backgroundClip: 'text',
							lineHeight: 1.3,
							letterSpacing: -1,
							margin: 0,
						},
					},
					'Engineer',
				),
				// Tagline
				jsx(
					'p',
					{
						style: {
							fontFamily: 'Roboto',
							fontSize: 30,
							color: '#cfbcf2',
							marginTop: '20px',
							lineHeight: 1.4,
						},
					},
					"You're not being replaced. You're being promoted.",
				),
			),
		),
		// Footer
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '0 3rem 1.5rem',
					position: 'relative',
				},
			},
			// Label
			jsx(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						fontFamily: 'Roboto',
						fontSize: 22,
						color: 'rgba(207, 188, 242, 0.6)',
					},
				},
				'Live, tailored training for engineering teams',
			),
			// Branding
			jsx(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						fontSize: 28,
					},
				},
				jsx('div', {
					style: {
						backgroundImage: `url('${beef}')`,
						backgroundRepeat: 'no-repeat',
						backgroundSize: '100% 100%',
						width: 44,
						height: 44,
						flexShrink: 0,
					},
				}),
				jsx(
					'div',
					{
						style: {
							fontFamily: 'DM Sans Bold',
							fontWeight: 900,
							color: '#cfbcf2',
							letterSpacing: -0.5,
						},
					},
					'Nick Nisi',
				),
			),
		),
	);

	const svg = await satori(node, {
		width: 1200,
		height: 630,
		fonts: [
			{
				data: Buffer.from(dmSansBoldData),
				name: 'DM Sans Bold',
				style: 'normal',
			},
			{
				data: Buffer.from(oswaldBoldData),
				name: 'Oswald Bold',
				style: 'normal',
			},
			{
				data: Buffer.from(robotoData),
				name: 'Roboto',
				style: 'normal',
			},
			{
				data: Buffer.from(robotoBoldData),
				name: 'Roboto Bold',
				style: 'normal',
			},
		],
	});

	const resvg = new Resvg(svg);
	const png = new Uint8Array(resvg.render().asPng());

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
		},
	});
};
