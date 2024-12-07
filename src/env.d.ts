/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="astro/image/client" />

import type { ImageMetadata } from 'astro';

declare module '*?buffer' {
	const value: string;
	export default value;
}

export interface HeroImage {
	img: ImageMetadata;
	alt: string;
	darkOverlay?: boolean;
}
