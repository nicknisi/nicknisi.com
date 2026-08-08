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

/** Hex equivalents of the light-theme Field Evidence tokens. */
export const PALETTE = {
	paper: '#f8f7fa',
	paper2: '#efedf4',
	card: '#fefdff',
	ink: '#211c2d',
	inkSoft: '#5b5766',
	inkFaint: '#74707e',
	line: '#d5d0de',
	darkMuted: '#c9c1d4',
	darkFaint: '#a99fb8',
	darkRule: '#59466f',
	purple: '#724bb7',
	purpleDark: '#2a183f',
	teal: '#17b897',
	white: '#ffffff',
} as const;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const FONTS: SatoriOptions['fonts'] = [
	{ name: 'Bricolage Grotesque Variable', data: bricolageExtraBold, weight: 800, style: 'normal' },
	{ name: 'Bricolage Grotesque Variable', data: bricolageBold, weight: 700, style: 'normal' },
	{ name: 'Atkinson Hyperlegible', data: atkinsonRegular, weight: 400, style: 'normal' },
	{ name: 'Atkinson Hyperlegible', data: atkinsonBold, weight: 700, style: 'normal' },
	{ name: 'JetBrains Mono Variable', data: monoSemiBold, weight: 600, style: 'normal' },
	{ name: 'JetBrains Mono Variable', data: monoMedium, weight: 500, style: 'normal' },
];

const beefDataUri = `data:image/png;base64,${Buffer.from(beefImage).toString('base64')}`;

/** Normalize source imagery to the RGBA PNG representation Satori renders reliably. */
export async function pngDataUri(input: ArrayBuffer | Uint8Array | Buffer): Promise<string> {
	const png = await sharp(Buffer.from(input as ArrayBuffer)).ensureAlpha().png().toBuffer();
	return `data:image/png;base64,${png.toString('base64')}`;
}

const titleSize = (title: string, hasPhoto: boolean): number => {
	if (hasPhoto) {
		if (title.length <= 26) return 78;
		if (title.length <= 42) return 68;
		if (title.length <= 58) return 59;
		return 52;
	}
	if (title.length <= 28) return 92;
	if (title.length <= 50) return 78;
	if (title.length <= 72) return 68;
	return 60;
};

const brandFooter = (inverse = false): ReactNode =>
	jsx(
		'div',
		{ style: { display: 'flex', alignItems: 'center', gap: '13px', color: inverse ? PALETTE.white : PALETTE.ink } },
		jsx('img', { src: beefDataUri, width: 44, height: 44, style: { width: '44px', height: '44px' } }),
		jsx('div', { style: { display: 'flex', fontFamily: 'Bricolage Grotesque Variable', fontWeight: 800, fontSize: 29 } }, 'Nick Nisi'),
		jsx('div', { style: { display: 'flex', width: '7px', height: '7px', borderRadius: '999px', background: inverse ? PALETTE.teal : PALETTE.purple } }),
		jsx('div', { style: { display: 'flex', fontFamily: 'JetBrains Mono Variable', fontWeight: 500, fontSize: 22, color: inverse ? PALETTE.darkMuted : PALETTE.inkSoft } }, 'nicknisi.com'),
	);

const evidenceLabel = (label: string, detail?: string, inverse = false): ReactNode =>
	jsx(
		'div',
		{ style: { display: 'flex', alignItems: 'center', gap: '13px', fontFamily: 'JetBrains Mono Variable', fontSize: 16, fontWeight: 600, letterSpacing: 2.2, textTransform: 'uppercase', color: inverse ? PALETTE.darkMuted : PALETTE.inkFaint } },
		jsx('div', { style: { display: 'flex', width: '11px', height: '11px', borderRadius: '999px', background: PALETTE.teal } }),
		label,
		detail ? jsx('div', { style: { display: 'flex', color: inverse ? PALETTE.darkFaint : PALETTE.inkFaint } }, `· ${detail}`) : null,
	);

const signalRule = (): ReactNode =>
	jsx(
		'div',
		{ style: { display: 'flex', alignItems: 'center', width: '190px' } },
		jsx('div', { style: { display: 'flex', width: '174px', height: '2px', background: PALETTE.teal } }),
		jsx('div', { style: { display: 'flex', width: '12px', height: '12px', marginLeft: '4px', borderRadius: '999px', background: PALETTE.purple } }),
	);

const eventDiagram = (): ReactNode =>
	jsx(
		'div',
		{ style: { position: 'relative', display: 'flex', width: '330px', height: '330px', alignItems: 'center', justifyContent: 'center' } },
		...([310, 224, 138] as const).map((size) =>
			jsx('div', { style: { position: 'absolute', display: 'flex', width: `${size}px`, height: `${size}px`, border: `1px solid ${PALETTE.darkRule}`, borderRadius: '999px' } }),
		),
		jsx('div', { style: { display: 'flex', width: '18px', height: '18px', borderRadius: '999px', background: PALETTE.teal } }),
		jsx('div', { style: { position: 'absolute', display: 'flex', width: '92px', height: '2px', background: PALETTE.purple, right: '0px', top: '164px' } }),
	);

interface FieldOgOptions {
	title: string;
	label: string;
	detail?: string;
	image?: string;
	description?: string;
	imagePosition?: string;
}

/**
 * Shared social-card composition for the Field Evidence visual world.
 * Real documentary imagery gets an editorial split. Surfaces without evidence
 * use abstract event geometry so a generic portrait is never presented as proof.
 */
export const fieldOgNode = ({ title, label, detail, image, description, imagePosition = 'center' }: FieldOgOptions): ReactNode => {
	if (image) {
		return jsx(
			'div',
			{ style: { display: 'flex', width: '100%', height: '100%', background: PALETTE.paper, color: PALETTE.ink } },
			jsx(
				'div',
				{ style: { display: 'flex', width: '46%', height: '100%', overflow: 'hidden', borderRight: `1px solid ${PALETTE.line}` } },
				jsx('img', { src: image, width: 552, height: 630, style: { width: '552px', height: '630px', objectFit: 'cover', objectPosition: imagePosition } }),
			),
			jsx(
				'div',
				{ style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '54%', padding: '48px 54px 42px' } },
				evidenceLabel(label, detail),
				jsx(
					'div',
					{ style: { display: 'flex', flexDirection: 'column' } },
					jsx('div', { style: { display: 'flex', fontFamily: 'Bricolage Grotesque Variable', fontWeight: 800, fontSize: titleSize(title, true), lineHeight: 0.92, letterSpacing: -2.2, color: PALETTE.ink } }, title),
					description ? jsx('div', { style: { display: 'flex', marginTop: '24px', maxWidth: '500px', fontFamily: 'Atkinson Hyperlegible', fontSize: 25, lineHeight: 1.3, color: PALETTE.inkSoft } }, description) : null,
				),
				signalRule(),
				brandFooter(),
			),
		);
	}

	return jsx(
		'div',
		{ style: { display: 'flex', width: '100%', height: '100%', background: PALETTE.paper, color: PALETTE.ink } },
		jsx(
			'div',
			{ style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '34%', height: '100%', padding: '48px 42px 42px', overflow: 'hidden', background: PALETTE.purpleDark, color: PALETTE.white } },
			evidenceLabel(label, detail, true),
			eventDiagram(),
			jsx('div', { style: { display: 'flex', fontFamily: 'JetBrains Mono Variable', fontSize: 15, fontWeight: 500, letterSpacing: 1.5, color: PALETTE.darkFaint, textTransform: 'uppercase' } }, 'Build · Teach · Write · Speak'),
		),
		jsx(
			'div',
			{ style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '66%', padding: '54px 58px 42px' } },
			jsx('div', { style: { display: 'flex', width: '100%', height: '1px', background: PALETTE.line } }),
			jsx('div', { style: { display: 'flex', fontFamily: 'Bricolage Grotesque Variable', fontWeight: 800, fontSize: titleSize(title, false), lineHeight: 0.92, letterSpacing: -2.4, color: PALETTE.ink } }, title),
			signalRule(),
			brandFooter(),
		),
	);
};

/** Render a Satori node to raw PNG bytes. */
export async function renderOgPng(node: ReactNode): Promise<Uint8Array> {
	const svg = await satori(node, { width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS });
	return new Uint8Array(new Resvg(svg).render().asPng());
}

/** Render a Satori node to a PNG response with the shared brand fonts. */
export async function renderOgResponse(node: ReactNode): Promise<Response> {
	const png = await renderOgPng(node);
	return new Response(png as BodyInit, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
