import metadata from '@/data/metadata.json';
import { jsx } from '@/utils/jsx-factory';
import { PALETTE, brandFooter, photoCard, pngDataUri, renderOgResponse, sparkle, squiggle, sticker } from '@/utils/og';
import { buildCutoutOgNode, productionHalo, titleSize } from '@/utils/og-cutout';
import type { APIRoute } from 'astro';
import { type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import type { ReactNode } from 'react';

// Feathered + drop-shadowed cutout. The figure inside this PNG sits with 60px
// of padding on every side so the shadow has room; positioning math in
// og-cutout.ts accounts for the padding.
import cutoutImage from '@/assets/nick-cutout-hires-torso-shadow.png?buffer';

interface Props {
	post?: CollectionEntry<'posts'>;
}

const resolveImagePath = (imagePath: string): string => {
	const projectRoot = process.cwd();
	const pathWithoutQuery = imagePath.split('?')[0] ?? '';

	// Dev server: /@fs/path/to/file -> /path/to/file
	if (pathWithoutQuery.startsWith('/@fs/')) {
		return '/' + pathWithoutQuery.slice(5);
	}

	// Build-time path (/_astro/...) -> resolve back to the source file
	if (pathWithoutQuery.startsWith('/_astro/')) {
		const filename = pathWithoutQuery.split('/').pop() || '';
		const match = filename.match(/^(.+?)\.[\w-]+\.(jpg|jpeg|png|webp|avif)$/);
		if (match) {
			const [, baseName, ext] = match;
			return `${projectRoot}/src/assets/posts/${baseName}.${ext}`;
		}
	}

	return pathWithoutQuery;
};

const resolveHero = async (hero: unknown): Promise<string | null> => {
	if (!hero || typeof hero !== 'object' || !('img' in hero)) return null;
	const img = (hero as { img?: unknown }).img;
	const src =
		typeof img === 'string'
			? img
			: img && typeof img === 'object' && 'src' in img
				? (img as { src: string }).src
				: null;
	if (!src) return null;
	try {
		// sharp decodes any source format and re-emits an RGBA PNG satori can read.
		return await pngDataUri(await readFile(resolveImagePath(src)));
	} catch (error) {
		console.error('Failed to load hero image for OG image:', error);
		return null;
	}
};

const buildHeroOgNode = ({ title, kicker, hero }: { title: string; kicker: string; hero: string }): ReactNode =>
	jsx(
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
		jsx(
			'div',
			{ style: { position: 'absolute', top: '52px', right: '74px', display: 'flex' } },
			sparkle(PALETTE.tomato, 66),
		),
		sticker(kicker, { bg: PALETTE.grape, rotate: -2 }),
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '44px',
					flexGrow: 1,
					paddingTop: '8px',
					paddingBottom: '8px',
				},
			},
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
							fontSize: titleSize(title),
							lineHeight: 1.04,
							letterSpacing: -1.5,
							color: PALETTE.ink,
						},
					},
					title,
				),
				jsx('div', { style: { display: 'flex', marginTop: '18px' } }, squiggle(PALETTE.tomato, 260, 22)),
			),
			jsx(
				'div',
				{ style: { display: 'flex', flexShrink: 0 } },
				photoCard(hero, { width: 430, height: 270, rotate: -2, shadow: PALETTE.tomato }),
			),
		),
		brandFooter(),
	);

export const GET: APIRoute<Props> = async ({ props }) => {
	const post = props.post;
	const title = post?.data.title ?? metadata.description;
	const kicker = post ? 'Blog' : 'Developer Experience Engineer';
	const hero = post ? await resolveHero(post.data.hero) : null;

	const node = hero
		? buildHeroOgNode({ title, kicker, hero })
		: buildCutoutOgNode({
				title,
				kicker,
				cutoutDataUri: await pngDataUri(cutoutImage),
				background: productionHalo(),
			});

	return renderOgResponse(node);
};
