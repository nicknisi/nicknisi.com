import satori from 'satori';
import sharp from 'sharp';
import type { APIRoute } from 'astro';
import { type ReactNode } from 'react';
import { type CollectionEntry } from 'astro:content';
import metadata from '@/data/metadata.json';

import oswaldBoldData from '@@/public/fonts/Oswald/Oswald-Bold.ttf';
import dmSansBoldData from '@@/public/fonts/DM_Sans/DMSans-Bold.ttf';
import robotoData from '@@/public/fonts/Roboto/Roboto-Regular.ttf';
import robotoBoldData from '@@/public/fonts/Roboto/Roboto-Bold.ttf';

import beefImage from '@/assets/beef_nick.png?buffer';
import headshotImage from '@/assets/headshot.png?buffer';

interface Props {
	post?: CollectionEntry<'posts'>;
}

export const GET: APIRoute<Props> = async ({ props }) => {
	const beef = `data:image/png;base64,${Buffer.from(beefImage).toString('base64')}`;
	const headshot = `data:image/png;base64,${Buffer.from(headshotImage).toString('base64')}`;

	const {
		data: {
			title = metadata.description,
			description,
			//image: heroImage
		} = {},
	} = props.post ?? {};

	let background: Record<string, unknown> = {
		backgroundImage: 'linear-gradient(to bottom, #11181C, #0b1215)',
		backgroundColor: '#0b1215',
	};

	//if (heroImage && isValidOpenGraphRatio(heroImage.src.width, heroImage.src.height)) {
	//	const backgroundImage = await imageToBase64(normalizeVitePath(heroImage.src.src), heroImage.src.format);
	//	background = {
	//		...background,
	//		backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
	//		backgroundRepeat: 'no-repeat',
	//		backgroundSize: '100% 100%',
	//	};
	//}

	const node: ReactNode = {
		type: 'div',
		props: {
			children: [
				{
					type: 'div',
					props: {
						children: [
							{
								type: 'div',
								props: {
									children: '',
									style: {
										backgroundImage: `url('${headshot}')`,
										backgroundRepeat: 'no-repeat',
										backgroundColor: '#Ob1215',
										backgroundSize: '100% 100%',
										width: '250px',
										height: '250px',
										borderRadius: '35px',
										display: 'flex',
										flexShrink: 0,
										marginLeft: '2rem',
										marginRight: '2rem',
										boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.5)',
									},
								},
							},
							{
								type: 'div',
								props: {
									children: [
										{
											type: 'h1',
											props: {
												children: title,
												style: {
													fontFamily: 'Roboto Bold',
													fontSize: 60,
													color: 'transparent',
													backgroundImage: 'linear-gradient(45deg, rgb(0, 124, 240), rgb(0, 223, 216))',
													backgroundClip: 'text',
													//color: '#0b1215',
													textAlign: 'center',
												},
											},
										},
										{
											type: 'h2',
											props: {
												children: description,
												style: {
													fontFamily: 'Roboto Bold',
													fontSize: 30,
													color: 'transparent',
													backgroundImage: 'linear-gradient(45deg, rgb(0, 124, 240), rgb(0, 223, 216))',
													backgroundClip: 'text',
													//color: '#0b1215',
													textAlign: 'center',
												},
											},
										},
									],
									style: {
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										flexGrow: 1,
										flexBasis: '800px',
										letterSpacing: -1,
										textAlign: 'center',
										whiteSpace: 'wrap',
										marginRight: '2rem',
									},
								},
							},
						],
						style: {
							display: 'flex',
							alignItems: 'center',
							gap: '1rem',
							padding: '1rem',
							flexGrow: 1,
						},
					},
				},
				{
					type: 'div',
					props: {
						children: [
							{
								type: 'div',
								props: {
									style: {
										backgroundImage: `url('${beef}')`,
										backgroundRepeat: 'no-repeat',
										//backgroundPosition: 'center',
										backgroundSize: '100% 100%',
										width: 50,
										height: 50,
										flexShrink: 0,
									},
								},
							},
							{
								type: 'div',
								props: {
									children: 'Nick Nisi',
									style: {
										fontFamily: 'DM Sans Bold',
										textAlign: 'center',
										fontWeight: 900,
										flexGrow: 0,
										color: '#2BB0ED',
										paddingRight: '8px',
										paddingLeft: '8px',
										letterSpacing: -1,
										//textShadow: '-1px -1px 0 #0b1215, 1px -1px 0 #0b1215, -1px  1px 0 #0b1215, 1px  1px 0 #0b1215',
									},
								},
							},
							{
								type: 'div',
								props: {
									children: '| nicknisi.com',
									style: {
										fontFamily: 'DM Sans Bold',
										textAlign: 'center',
										fontWeight: 900,
										flexGrow: 0,
										color: '#eff0f1',
										letterSpacing: -1,
									},
								},
							},
						],
						style: {
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'flex-end',
							paddingBottom: 30,
							paddingRight: 30,
							fontSize: 32,
						},
					},
				},
			],
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				...background,
			},
		},
	} as ReactNode;

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

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
		},
	});
};
