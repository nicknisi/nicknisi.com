import metadata from '@/data/metadata.json';
import { jsx } from '@/utils/jsx-factory';
import type { APIRoute } from 'astro';
import { type CollectionEntry } from 'astro:content';
import fs from 'fs/promises';
import { type ReactNode } from 'react';
import satori from 'satori';
import sharp from 'sharp';

import dmSansBoldData from '@@/public/fonts/DM_Sans/DMSans-Bold.ttf?buffer';
import oswaldBoldData from '@@/public/fonts/Oswald/Oswald-Bold.ttf?buffer';
import robotoBoldData from '@@/public/fonts/Roboto/Roboto-Bold.ttf?buffer';
import robotoData from '@@/public/fonts/Roboto/Roboto-Regular.ttf?buffer';

import beefImage from '@/assets/beef_nick.png?buffer';
import headshotImage from '@/assets/headshot.png?buffer';

interface Props {
	post?: CollectionEntry<'posts'>;
}

const normalizeVitePath = (src: string): string => {
	return src.replace(/@fs|[?&].*$/g, '');
};

const resolveImagePath = (imagePath: string): string => {
	// If it's already an absolute path to a source file, use it
	if (imagePath.startsWith('/Users/')) {
		return imagePath;
	}
	
	// If it's a build-time generated path (/_astro/...), extract the filename
	// and resolve it to the source assets directory
	if (imagePath.startsWith('/_astro/')) {
		// Extract the original filename from the hashed filename
		// e.g., /_astro/meta-badge-post.CdKNIagU.png -> meta-badge-post.png
		const filename = imagePath.split('/').pop() || '';
		const match = filename.match(/^(.+?)\.[\w]+\.(jpg|jpeg|png|webp|avif)$/);
		if (match) {
			const [, baseName, ext] = match;
			// Reconstruct the original filename
			const originalFilename = `${baseName}.${ext}`;
			// Return the path to the source file
			return `/Users/nicknisi/Developer/nicknisi.com/src/assets/posts/${originalFilename}`;
		}
	}
	
	return imagePath;
};

const imageToBase64 = async (imagePath: string, format: string): Promise<string> => {
	const normalizedPath = normalizeVitePath(imagePath);
	const buffer = await fs.readFile(normalizedPath);
	// Normalize format for MIME type (jpg -> jpeg)
	const mimeFormat = format === 'jpg' ? 'jpeg' : format;
	return `data:image/${mimeFormat};base64,${buffer.toString('base64')}`;
};

export const GET: APIRoute<Props> = async ({ props }) => {
	const beef = `data:image/png;base64,${Buffer.from(beefImage).toString('base64')}`;
	const headshot = `data:image/png;base64,${Buffer.from(headshotImage).toString('base64')}`;

	const {
		data: {
			title = metadata.description,
			// description,
			hero,
		} = {},
	} = props.post ?? {};

	let background: Record<string, unknown> = {
		backgroundImage: 'linear-gradient(to bottom, #11181C, #0b1215)',
		backgroundColor: '#0b1215',
	};

	if (
		hero?.img
		// && isValidOpenGraphRatio(hero.img.width, hero.img.height)
	) {
		try {
			console.log('hero.img object:', hero.img);
			console.log('hero.img keys:', Object.keys(hero.img));
			console.log('hero.img type:', typeof hero.img);

			// Check if hero.img is a string (path) or an object with metadata
			let imagePath: string;
			let imageFormat: string = 'jpg'; // default format

			if (typeof hero.img === 'string') {
				imagePath = hero.img;
				// Try to determine format from extension
				const ext = imagePath.split('.').pop()?.toLowerCase();
				if (ext && ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext)) {
					imageFormat = ext === 'jpg' ? 'jpeg' : ext;
				}
			} else if (hero.img && typeof hero.img === 'object' && 'src' in hero.img) {
				imagePath = resolveImagePath(hero.img.src);
				imageFormat = hero.img.format || 'jpg';
			} else {
				console.error('Unexpected hero.img structure:', hero.img);
				throw new Error('Invalid hero.img structure');
			}

			const backgroundImage = await imageToBase64(imagePath, imageFormat);
			background = {
				...background,
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100% 100%',
			};
		} catch (error) {
			console.error('Failed to load hero image for OG image:', error);
			// Fall back to default background
		}
	}

	const node: ReactNode = jsx(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				...background,
			},
		},
		// Main content area
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
					padding: '1rem',
					flexGrow: 1,
				},
			},
			// Headshot (only if no hero image)
			!hero?.img
				? jsx('div', {
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
					})
				: null,
			// Title container
			jsx(
				'div',
				{
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
				jsx(
					'h1',
					{
						style: {
							fontFamily: 'Roboto Bold',
							fontSize: 60,
							color: 'transparent',
							backgroundImage: 'linear-gradient(45deg, rgb(0, 124, 240), rgb(0, 223, 216))',
							backgroundClip: 'text',
							textAlign: 'center',
						},
					},
					title,
				),
			),
		),
		// Footer
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'flex-end',
					paddingBottom: 30,
					paddingRight: 30,
					fontSize: 32,
				},
			},
			// Beef icon
			jsx('div', {
				style: {
					backgroundImage: `url('${beef}')`,
					backgroundRepeat: 'no-repeat',
					backgroundSize: '100% 100%',
					width: 50,
					height: 50,
					flexShrink: 0,
				},
			}),
			// Nick Nisi text
			jsx(
				'div',
				{
					style: {
						fontFamily: 'DM Sans Bold',
						textAlign: 'center',
						fontWeight: 900,
						flexGrow: 0,
						color: '#2BB0ED',
						paddingRight: '8px',
						paddingLeft: '8px',
						letterSpacing: -1,
					},
				},
				'Nick Nisi',
			),
			// Domain text
			jsx(
				'div',
				{
					style: {
						fontFamily: 'DM Sans Bold',
						textAlign: 'center',
						fontWeight: 900,
						flexGrow: 0,
						color: '#eff0f1',
						letterSpacing: -1,
					},
				},
				'| nicknisi.com',
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

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
		},
	});
};
