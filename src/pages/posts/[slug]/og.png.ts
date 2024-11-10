import fs from 'fs/promises';
import { join } from 'path';
import satori from 'satori';
import sharp from 'sharp';
import { type ReactNode } from 'react';
import { type CollectionEntry, getCollection } from 'astro:content';
import { APIRoute } from 'astro';

interface Props {
	props: { post: CollectionEntry<'posts'> };
}

export const GET: APIRoute = async ({ props }: Props) => {
	const { post } = props;

	const robotoData = await fs.readFile(
		join(import.meta.dirname, '..', '..', '..', '..', 'public/fonts/Roboto/Roboto-Regular.ttf'),
	);
	const robotoBoldData = await fs.readFile(
		join(import.meta.dirname, '..', '..', '..', '..', 'public/fonts/Roboto/Roboto-Bold.ttf'),
	);
	const beef = (await fs.readFile(join(import.meta.dirname, '..', '..', '..', '..', 'public/beef_nick.png'))).toString(
		'base64',
	);
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
											backgroundImage: `url('data:image/png;base64,${beef}')`,
											backgroundRepeat: 'no-repeat',
											backgroundColor: '#Ob1215',
											//backgroundPosition: 'bottom',
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
										children: post.data.title,
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
								//justifyContent: 'center',
								gap: '1rem',
								padding: '1rem',
								flexGrow: 1,
							},
						},
					},
					{
						type: 'div',
						props: {
							children: 'nicknisi.com',
							style: {
								textAlign: 'center',
								fontWeight: 900,
								padding: '1rem',
								justifyContent: 'flex-end',
								paddingRight: 20,
								paddingBottom: 20,
								flexGrow: 0,
								//backgroundImage: 'linear-gradient(45deg, #5921A7, #00BBE0)',
								//backgroundClip: 'text',
								//color: 'transparent',
								fontSize: 40,
								color: '#fff',
								letterSpacing: -1,
								fontFamily: 'Roboto Bold',
								textShadow: '-1px -1px 0 #0b1215, 1px -1px 0 #0b1215, -1px  1px 0 #0b1215, 1px  1px 0 #0b1215',
							},
						},
					},
				],
				style: {
					display: 'flex',
					width: '100%',
					height: '100%',
					flexDirection: 'column',
					//backgroundImage: 'linear-gradient(45deg, #B3ECFF, #CFBCF2)',
					//backgroundImage: 'linear-gradient(to bottom, #B3ECFF, #5921a7)',
					backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #cfbcf2)',
				},
			},
		} as ReactNode,
		{
			width: 1200,
			height: 630,
			fonts: [
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

export async function getStaticPaths() {
	const posts = await getCollection('posts');
	return posts.map(post => ({
		params: { slug: post.slug },
		props: { post },
	}));
}
