import { z, defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { authorFeedLoader } from '@/loaders/bsky.js';
import TalkSchema from './schemas/Talk';

const posts = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			permalink: z.string().optional(),
			tags: z.array(z.string()),
			description: z.string().optional(),
			pubDate: z.coerce.date(),
			external: z.string().optional(),
			draft: z.boolean().optional(),
			post: z.string().url().optional(),
			hero: z
				.object({
					img: image(),
					alt: z.string(),
					darkOverlay: z.boolean().optional(),
				})
				.optional(),
		}),
});

const bluesky = defineCollection({
	loader: authorFeedLoader({ handle: 'nicknisi.com', limit: 5 }),
});

const profiles = defineCollection({
	loader: file('src/content/data/profiles.json'),
	schema: z.object({
		network: z.string(),
		username: z.string(),
		url: z.string().url(),
		hidden: z.optional(z.boolean()),
	}),
});

const appearances = defineCollection({
	schema: TalkSchema,
});

const projects = defineCollection({
	loader: file('src/content/data/projects.json'),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			image: image().optional(),
			startDate: z.string().date(),
			endDate: z.optional(z.string().date()),
			description: z.optional(z.string()),
			url: z.string().url(),
			roles: z.array(z.string()),
			entity: z.optional(z.string()),
			highlights: z.array(z.string()),
			keywords: z.array(z.string()),
			promote: z.boolean().optional(),
			status: z.enum(['active', 'inactive']),
		}),
});

const jobs = defineCollection({
	loader: file('src/content/data/jobs.json'),
	schema: z.object({
		name: z.string(),
		summary: z.optional(z.string()),
		position: z.string(),
		description: z.optional(z.string()),
		location: z.string(),
		url: z.string(),
		startDate: z.string().date(),
		endDate: z.optional(z.string().date()),
		highlights: z.array(z.string()),
		remote: z.optional(z.boolean()),
		image: z.optional(z.string()),
	}),
});

export const collections = {
	posts,
	jobs,
	projects,
	profiles,
	bluesky,
	appearances,
};
