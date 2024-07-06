import { ImageMetadata } from 'astro';
import { Talk } from '@/types.js';

const STATIC_ASSETS = import.meta.glob<{ default: ImageMetadata }>('../assets/*.{png,jpg,jpeg}');

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
	let defaultThumbnail = await getAsset('talk_thumbnail.png');
	if (talk.source === 'vimeo') {
		const response = await fetch(`http://vimeo.com/api/v2/video/${talk.videoId}.json`);
		if (response.ok) {
			const data = await response.json();
			return data[0].thumbnail_medium as string;
		}
	} else if (talk.videoId) {
		return `https://img.youtube.com/vi/${talk.videoId}/hqdefault.jpg`;
	}

	return defaultThumbnail;
}
