import { z } from 'astro:content';

const TalkType = z.enum(['Conference Talk', 'Panel', 'Podcast', 'Moderation', 'Workshop', 'Keynote', 'Lightning Talk']);

const TalkInstance = z.object({
	event: z.string(),
	location: z.string(),
	date: z.string(),
	url: z.string().url().optional(),
	videoId: z.string().optional(),
	remote: z.boolean().optional(),
});

const TalkSchema = z.object({
	title: z.string(),
	type: TalkType,
	thumbnail: z.string().optional(),
	description: z.string().optional(),
	promote: z.boolean().optional(),
	detailsUrl: z.string().optional(),
	instances: z.array(TalkInstance).min(1),
});

export type Talk = z.infer<typeof TalkSchema>;

export default TalkSchema;
