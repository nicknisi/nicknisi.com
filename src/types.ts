import type { ImageMetadata } from 'astro';

export interface HeroImage {
	img: ImageMetadata;
	alt: string;
	darkOverlay?: boolean;
}
