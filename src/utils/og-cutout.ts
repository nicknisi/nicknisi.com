import { jsx } from '@/utils/jsx-factory';
import { PALETTE, brandFooter, squiggle, sticker } from '@/utils/og';
import type { ReactNode } from 'react';

/**
 * Production cutout source is the feathered + drop-shadow PNG at 1019x1520.
 * The figure inside it sits at offset (60, 60) with size 899x1400 — there's
 * 60px padding on every side to give the drop shadow room to render. Display
 * positioning math below accounts for that padding so the visible figure lands
 * at the intended canvas coordinates.
 */
const SHADOW_PNG_W = 1019;
const SHADOW_PNG_H = 1520;
const SHADOW_PAD = 60;
const FIG_SRC_W = SHADOW_PNG_W - SHADOW_PAD * 2; // 899

/** Target visible figure width on the OG canvas. */
const FIG_DISPLAY_W = 405;
const SCALE = FIG_DISPLAY_W / FIG_SRC_W;
export const CUTOUT_HEIGHT = Math.round(SHADOW_PNG_H * SCALE);
export const CUTOUT_WIDTH = Math.round(SHADOW_PNG_W * SCALE);

/** Visible figure anchor offsets (right and bottom) on the OG canvas. */
const FIG_RIGHT = 80;
const FIG_BOTTOM = -30; // overflow 30px below canvas to give head top breathing room

/**
 * Offsets that place the shadow-PNG so the visible figure inside it lands at
 * (FIG_RIGHT, FIG_BOTTOM) on the canvas. Derived from PAD * SCALE so the math
 * stays correct if any constants above change.
 */
const PAD_SCALED = Math.round(SHADOW_PAD * SCALE);
export const CUTOUT_RIGHT = FIG_RIGHT - PAD_SCALED;
export const CUTOUT_BOTTOM = FIG_BOTTOM - PAD_SCALED;

/** Title column width capped so it never collides with the visible figure. */
const TITLE_GAP = 40;
const CANVAS_PAD_LEFT = 64;
export const TITLE_MAX_WIDTH = 1200 - FIG_RIGHT - FIG_DISPLAY_W - CANVAS_PAD_LEFT - TITLE_GAP;

/**
 * Desaturated teal halo color: sky (#36BABB) mixed ~40% with paper. Sits
 * complementary to the warm skin tone, quiet enough to support the kicker
 * rather than compete with it. See og-preview iteration notes (deleted) for
 * the trail of why this won over tomato, sage, mustard, and apricot.
 */
const HALO_COLOR = '#AADEE1';

/** The production halo: dusty teal, strong intensity, anchored behind the figure. */
export const productionHalo = (): ReactNode =>
	jsx('div', {
		style: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			display: 'flex',
			backgroundImage: `radial-gradient(ellipse 58% 78% at 75% 55%, ${HALO_COLOR} 22%, ${PALETTE.paper} 92%)`,
		},
	});

/** Title sizing: bigger for short titles, smaller as length grows. */
export const titleSize = (title: string): number => {
	const len = title.length;
	if (len <= 22) return 86;
	if (len <= 38) return 72;
	if (len <= 58) return 60;
	return 50;
};

interface CutoutNodeOpts {
	kicker: string;
	title: string;
	cutoutDataUri: string;
	/** Optional decorative layer rendered between the paper background and the foreground. */
	background?: ReactNode;
	/** Cutout anchor offset from the right edge. */
	cutoutRight?: number;
	/** Cutout anchor offset from the bottom edge. Negative values push the figure
	 * down (clipping the bottom of the image but creating top breathing room). */
	cutoutBottom?: number;
	/** Override cutout width/height when supplying a non-default source crop. */
	cutoutWidth?: number;
	cutoutHeight?: number;
	/** Title column max width. Must be shrunk if cutoutRight increases. */
	titleMaxWidth?: number;
}

/**
 * Compose the homepage / post-no-hero OG variant: kicker sticker, title with
 * squiggle, full-bleed cutout, brand footer. The `background` slot lets us
 * iterate on what sits behind the figure without rewriting the rest.
 */
export const buildCutoutOgNode = ({
	kicker,
	title,
	cutoutDataUri,
	background,
	cutoutRight = CUTOUT_RIGHT,
	cutoutBottom = CUTOUT_BOTTOM,
	cutoutWidth = CUTOUT_WIDTH,
	cutoutHeight = CUTOUT_HEIGHT,
	titleMaxWidth = TITLE_MAX_WIDTH,
}: CutoutNodeOpts): ReactNode =>
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
		// Background layer renders first so the foreground stays on top.
		background ?? null,
		// Full-bleed cutout, anchored to the bottom-right of the card.
		jsx(
			'div',
			{
				style: {
					position: 'absolute',
					bottom: `${cutoutBottom}px`,
					right: `${cutoutRight}px`,
					display: 'flex',
				},
			},
			jsx('img', {
				src: cutoutDataUri,
				width: cutoutWidth,
				height: cutoutHeight,
				style: { width: `${cutoutWidth}px`, height: `${cutoutHeight}px` },
			}),
		),
		// Kicker
		sticker(kicker, { bg: PALETTE.grape, rotate: -2 }),
		// Title column, kept clear of the cutout silhouette via max-width.
		jsx(
			'div',
			{
				style: {
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1,
					paddingTop: '8px',
					paddingBottom: '8px',
					maxWidth: `${titleMaxWidth}px`,
				},
			},
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
		brandFooter(),
	);
