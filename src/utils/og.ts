import { jsx } from '@/utils/jsx-factory';
import type { ReactNode } from 'react';
import satori, { type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

import bricolageExtraBold from '@@/public/fonts/Bricolage/Bricolage-ExtraBold.ttf?buffer';
import bricolageBold from '@@/public/fonts/Bricolage/Bricolage-Bold.ttf?buffer';
import monoSemiBold from '@@/public/fonts/JetBrainsMono/JetBrainsMono-SemiBold.ttf?buffer';
import monoMedium from '@@/public/fonts/JetBrainsMono/JetBrainsMono-Medium.ttf?buffer';
import atkinsonRegular from '@@/public/fonts/Atkinson/Atkinson-Regular.woff?buffer';
import atkinsonBold from '@@/public/fonts/Atkinson/Atkinson-Bold.woff?buffer';

import beefImage from '@/assets/beef_nick.png?buffer';

/**
 * Brand palette, in hex, mirrored from the OKLCH design tokens in base.css
 * (light theme). OG cards are always rendered light so the brand reads the
 * same in every feed regardless of the viewer's theme.
 */
export const PALETTE = {
	paper: '#F7F6FA',
	paper2: '#EFEDF6',
	card: '#FEFDFF',
	ink: '#1E1A2A',
	inkSoft: '#565363',
	inkFaint: '#878492',
	marigold: '#E0D8FD',
	tomato: '#724BC4',
	grape: '#5B31A0',
	pine: '#009E74',
	sky: '#36BABB',
	onLight: '#191525',
	onDark: '#F9F7FD',
} as const;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const FONTS: SatoriOptions['fonts'] = [
	{ name: 'Bricolage', data: bricolageExtraBold, weight: 800, style: 'normal' },
	{ name: 'Bricolage', data: bricolageBold, weight: 700, style: 'normal' },
	{ name: 'Atkinson', data: atkinsonRegular, weight: 400, style: 'normal' },
	{ name: 'Atkinson', data: atkinsonBold, weight: 700, style: 'normal' },
	{ name: 'JetBrains Mono', data: monoSemiBold, weight: 600, style: 'normal' },
	{ name: 'JetBrains Mono', data: monoMedium, weight: 500, style: 'normal' },
];

export const beefDataUri = `data:image/png;base64,${Buffer.from(beefImage).toString('base64')}`;

/**
 * Normalize an image buffer to an RGBA PNG data URI. satori's PNG decoder
 * fails silently on color-type-2 (RGB, no alpha) PNGs, so every photo is run
 * through sharp first to guarantee an alpha channel.
 */
export async function pngDataUri(input: ArrayBuffer | Uint8Array | Buffer): Promise<string> {
	const png = await sharp(Buffer.from(input as ArrayBuffer))
		.ensureAlpha()
		.png()
		.toBuffer();
	return `data:image/png;base64,${png.toString('base64')}`;
}

const svgDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** Hand-drawn underline squiggle, echoing the one under "Nisi" on the homepage. */
export const squiggle = (color: string = PALETTE.tomato, width = 240, height = 22): ReactNode =>
	jsx('div', {
		style: {
			display: 'flex',
			width: `${width}px`,
			height: `${height}px`,
			backgroundImage: `url("${svgDataUri(
				`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 200 18' fill='none'><path d='M3 12 C 50 6, 90 14, 130 9 S 188 6, 197 10' stroke='${color}' stroke-width='5' stroke-linecap='round'/></svg>`,
			)}")`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: '100% 100%',
		},
	});

/** Five-point star sparkle, the same shape used as a decorative accent on the site. */
export const sparkle = (color: string = PALETTE.tomato, size = 64): ReactNode =>
	jsx('div', {
		style: {
			display: 'flex',
			width: `${size}px`,
			height: `${size}px`,
			backgroundImage: `url("${svgDataUri(
				`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='${color}'><path d='M12 0l2.6 7.4L22 8l-6 5 2 8-6-4.6L6 21l2-8-6-5 7.4-.6z'/></svg>`,
			)}")`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: '100% 100%',
		},
	});

interface StickerOpts {
	bg?: string;
	color?: string;
	rotate?: number;
	fontSize?: number;
}

/** A bordered, hard-shadowed, slightly rotated pill, like the homepage stickers. */
export const sticker = (label: string, opts: StickerOpts = {}): ReactNode => {
	const { bg = PALETTE.grape, color = PALETTE.onDark, rotate = -2, fontSize = 22 } = opts;
	return jsx(
		'div',
		{
			style: {
				display: 'flex',
				alignItems: 'center',
				alignSelf: 'flex-start',
				padding: '9px 20px',
				background: bg,
				color,
				border: `3px solid ${PALETTE.ink}`,
				borderRadius: '999px',
				boxShadow: `4px 4px 0 ${PALETTE.ink}`,
				fontFamily: 'JetBrains Mono',
				fontWeight: 600,
				fontSize,
				letterSpacing: 1,
				textTransform: 'uppercase',
				transform: `rotate(${rotate}deg)`,
			},
		},
		label,
	);
};

/** beef logo + name + domain, anchored bottom-left on every card. */
export const brandFooter = (): ReactNode =>
	jsx(
		'div',
		{
			style: { display: 'flex', alignItems: 'center', gap: '14px' },
		},
		jsx('div', {
			style: {
				display: 'flex',
				width: '46px',
				height: '46px',
				backgroundImage: `url('${beefDataUri}')`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100% 100%',
				flexShrink: 0,
			},
		}),
		jsx(
			'div',
			{ style: { display: 'flex', fontFamily: 'Bricolage', fontWeight: 800, fontSize: 30, color: PALETTE.ink } },
			'Nick Nisi',
		),
		jsx('div', {
			style: { display: 'flex', width: '8px', height: '8px', borderRadius: '999px', background: PALETTE.tomato },
		}),
		jsx(
			'div',
			{
				style: { display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 24, color: PALETTE.inkSoft },
			},
			'nicknisi.com',
		),
	);

/**
 * A bordered, rotated "taped-in photo" frame with a hard offset shadow.
 *
 * The photo is an <img>, not a background-image: satori silently drops a
 * background-image on an element whose size is resolved by a flex row with a
 * sibling (the title column here), but renders an <img> with explicit
 * dimensions reliably.
 */
export const photoCard = (
	imageDataUri: string,
	opts: { width: number; height: number; rotate?: number; shadow?: string } = { width: 300, height: 300 },
): ReactNode => {
	const { width, height, rotate = -3, shadow = PALETTE.marigold } = opts;
	const border = 4;
	const innerW = width - border * 2;
	const innerH = height - border * 2;
	return jsx(
		'div',
		{
			style: {
				display: 'flex',
				width: `${width}px`,
				height: `${height}px`,
				flexShrink: 0,
				overflow: 'hidden',
				border: `${border}px solid ${PALETTE.ink}`,
				borderRadius: '18px',
				boxShadow: `10px 10px 0 ${shadow}`,
				transform: `rotate(${rotate}deg)`,
			},
		},
		jsx('img', {
			src: imageDataUri,
			width: innerW,
			height: innerH,
			style: { width: `${innerW}px`, height: `${innerH}px`, objectFit: 'cover' },
		}),
	);
};

/** Render a satori node to raw PNG bytes. */
export async function renderOgPng(node: ReactNode): Promise<Uint8Array> {
	const svg = await satori(node, { width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS });
	return new Uint8Array(new Resvg(svg).render().asPng());
}

/** Render a satori node to a PNG response with the shared brand fonts. */
export async function renderOgResponse(node: ReactNode): Promise<Response> {
	const png = await renderOgPng(node);
	return new Response(png as BodyInit, {
		headers: {
			'Content-Type': 'image/png',
			// URLs aren't content-hashed, so avoid `immutable`: a day lets feeds
			// refetch within reason if the card design changes.
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
