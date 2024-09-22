import { z, defineCollection } from 'astro:content';
import { file } from 'astro/loaders';

const posts = defineCollection({
	schema: z.object({
		title: z.string(),
		permalink: z.optional(z.string()),
		tags: z.array(z.string()),
		description: z.optional(z.string()),
		pubDate: z.date(),
		external: z.optional(z.string()),
		draft: z.optional(z.boolean()),
	}),
});

const talks = defineCollection({
	loader: file('src/content/data/talks.json'),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		promote: z.optional(z.boolean()),
		url: z.string(),
		source: z.enum(['website', 'youtube', 'vimeo', 'page']),
		type: z.enum(['talk', 'workshop', 'panel']),
		remote: z.optional(z.boolean()),
		videoId: z.optional(z.string()),
		location: z.optional(z.string()),
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
	}),
});

export const collections = { posts, talks, jobs };
