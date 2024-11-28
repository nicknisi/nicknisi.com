import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

type Talk = CollectionEntry<'appearances'>['data'];

const STATIC_ASSETS = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{png,jpg,jpeg,svg}');
const assets = Object.entries(STATIC_ASSETS).reduce(
	(acc, [key, value]) => ({
		...acc,
		[key.replace('../assets/', '')]: value,
	}),
	{},
) as typeof STATIC_ASSETS;

/**
 * Load a local image based on the filename
 * @Param name The name of the sset to load, relative to the assets folder
 */
export async function getAsset(name: string) {
	if (assets[name]) {
		return (await assets[name]()).default;
	}
	throw new Error(`Image ${name} not found`);
}

/**
 * Get the thumbnail for a talk.
 * If not available, return the default thumbnail.
 * @param talk The talk to get the thumbnail for
 */
export async function getThumbnail(talk: Talk): Promise<string | ImageMetadata> {
	let thumbnail = await getAsset('talk_thumbnail.png');
	const firstInstance = talk.instances[0]!;
	if (firstInstance.url?.includes('vimeo')) {
		const response = await fetch(`http://vimeo.com/api/v2/video/${firstInstance.videoId}.json`);
		if (response.ok) {
			const data = await response.json();
			return data[0].thumbnail_medium as string;
		}
	} else if (firstInstance.videoId) {
		return `https://img.youtube.com/vi/${firstInstance.videoId}/hqdefault.jpg`;
	}

	return thumbnail;
}

/**
 * Calculate the aspect ratio of an image based on its width and height
 * @param width The width of the image
 * @param height The height of the image
 * @returns The aspect ratio as a string
 */
export function calculateAspectRatio(width: number, height: number): string {
	const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
	const divisor = gcd(width, height);

	return `${width / divisor}:${height / divisor}`;
}

/**
 * Check if the aspect ratio of an image is valid for OpenGraph
 * @param width The width of the image
 * @param height The height of the image
 * @param tolerance The tolerance for the aspect ratio
 * @returns Whether the aspect ratio is valid
 */
export function isValidOpenGraphRatio(width: number, height: number, tolerance: number = 0.06): boolean {
	const aspectRatio = width / height;
	const targetRatio = 1.91;
	const minRatio = targetRatio - tolerance;
	const maxRatio = targetRatio + tolerance;
	return aspectRatio >= minRatio && aspectRatio <= maxRatio;
}
