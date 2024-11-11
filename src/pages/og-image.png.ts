import fs from 'fs/promises';
import { join } from 'path';
import satori from 'satori';
import sharp from 'sharp';
import type { APIRoute } from 'astro';
import { type ReactNode } from 'react';
import { type CollectionEntry } from 'astro:content';
import metadata from '@/data/metadata.json';

const PUBLIC = join(import.meta.dirname, '..', '..', 'public');

interface Props {
	post?: CollectionEntry<'posts'>;
}

export const GET: APIRoute<Props> = async ({ props }) => {
	const oswaldBoldData = await fs.readFile(`${PUBLIC}/fonts/Oswald/Oswald-Bold.ttf`);
	const dmSansBoldData = await fs.readFile(`${PUBLIC}/fonts/DM_SANS/DMSans-Bold.ttf`);
	const robotoData = await fs.readFile(`${PUBLIC}/fonts/Roboto/Roboto-Regular.ttf`);
	const robotoBoldData = await fs.readFile(`${PUBLIC}/fonts/Roboto/Roboto-Bold.ttf`);
	const beef = (await fs.readFile(`${PUBLIC}/beef_nick.png`)).toString('base64');
	const headshot = (await fs.readFile(`${PUBLIC}/headshot.png`)).toString('base64');
	const { data: { title = metadata.description } = {} } = props.post ?? {};
	const svg = await satori(
		{
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
											backgroundImage: `url('data:image/png;base64,${headshot}')`,
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
									type: 'h1',
									props: {
										children: title,
										style: {
											fontFamily: 'Roboto Bold',
											fontSize: 60,
											color: 'transparent',
											backgroundImage: 'linear-gradient(45deg, #5921a7, rgb(0, 124, 240), rgb(0, 223, 216))',
											backgroundClip: 'text',
											flexGrow: 1,
											flexBasis: '1000px',
											letterSpacing: -1,
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
											backgroundImage: `url('data:image/png;base64,${beef}')`,
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
											color: '#2463EA',
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
											color: '#0b1215',
											letterSpacing: -1,
											//textShadow: '-1px -1px 0 #0b1215, 1px -1px 0 #0b1215, -1px  1px 0 #0b1215, 1px  1px 0 #0b1215',
										},
									},
								},
							],
							style: {
								display: 'flex',
								justifyContent: 'flex-end',
								alignItems: 'flex-end',
								paddingBottom: 20,
								fontSize: 32,
							},
						},
					},
				],
				style: {
					display: 'flex',
					width: '100%',
					height: '100%',
					flexDirection: 'column',
					//backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #cfbcf2)',
				},
			},
		} as ReactNode,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					data: dmSansBoldData,
					name: 'DM Sans Bold',
					style: 'normal',
				},
				{
					data: oswaldBoldData,
					name: 'Oswald Bold',
					style: 'normal',
				},
				{
					data: robotoData,
					name: 'Roboto',
					style: 'normal',
				},
				{
					data: robotoBoldData,
					name: 'Roboto Bold',
					style: 'normal',
				},
			],
		},
	);

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
		},
	});
};
