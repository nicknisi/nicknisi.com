import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { authorFeedLoader } from '@/loaders/bsky.js';
import { tokenmaxingLoader } from '@/loaders/tokenmaxing.js';
import TalkSchema from './content/schemas/Talk';

const posts = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			permalink: z.string().optional(),
			tags: z.array(z.string()),
			description: z.string().optional(),
			pubDate: z.coerce.date(),
			external: z.string().optional(),
			draft: z.boolean().optional(),
			post: z.url().optional(),
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
		url: z.url(),
		hidden: z.optional(z.boolean()),
	}),
});

const appearances = defineCollection({
	loader: file('src/content/data/speaking.json'),
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
			url: z.url(),
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

const tokenmaxing = defineCollection({
	loader: tokenmaxingLoader({
		user: 'nicknisi',
		gistId: import.meta.env['TOKENMAXING_GIST_ID'] ?? '',
		fixturePath: 'content/data/tokenmaxing.fixture.json',
	}),
	schema: z.object({
		schemaVersion: z.union([z.literal(1), z.literal(2)]),
		generatedAt: z.string(),
		period: z.object({ from: z.string(), to: z.string() }),
		summary: z.object({
			totalCostUSD: z.number(),
			totalTokens: z.number(),
			sessions: z.number(),
			messages: z.number(),
			activeDays: z.number(),
			currentStreakDays: z.number(),
			longestStreakDays: z.number(),
			peakHourLocal: z.number(),
			favoriteModel: z.object({
				tool: z.enum(['claude-code', 'pi', 'codex']),
				provider: z.string(),
				id: z.string(),
				label: z.string(),
			}),
		}),
		byTool: z.array(
			z.object({
				id: z.enum(['claude-code', 'pi', 'codex']),
				label: z.string(),
				tokens: z.number(),
				costUSD: z.number(),
				sessions: z.number(),
				messages: z.number(),
			}),
		),
		byProvider: z.array(
			z.object({
				id: z.string(),
				label: z.string(),
				tokens: z.number(),
				costUSD: z.number(),
			}),
		),
		byModel: z.array(
			z.object({
				tool: z.enum(['claude-code', 'pi', 'codex']),
				provider: z.string(),
				id: z.string(),
				label: z.string(),
				tokens: z.number(),
				costUSD: z.number(),
				sessions: z.number(),
				messages: z.number(),
			}),
		),
		byProject: z.array(
			z.object({
				label: z.string(),
				tokens: z.number(),
				costUSD: z.number(),
				sessions: z.number(),
			}),
		),
		daily: z.array(
			z.object({
				date: z.string(),
				tokens: z.number(),
				costUSD: z.number(),
				sessions: z.number(),
				messages: z.number(),
				hourCounts: z.array(z.number()).length(24),
				byTool: z.record(
					z.string(),
					z.object({
						tokens: z.number(),
						costUSD: z.number(),
						sessions: z.number(),
						messages: z.number(),
					}),
				),
				byProvider: z.record(
					z.string(),
					z.object({
						tokens: z.number(),
						costUSD: z.number(),
					}),
				),
				byModel: z.array(
					z.object({
						tool: z.enum(['claude-code', 'pi', 'codex']),
						provider: z.string(),
						id: z.string(),
						tokens: z.number(),
						costUSD: z.number(),
						sessions: z.number(),
						messages: z.number(),
					}),
				),
				byProject: z.record(
					z.string(),
					z.object({
						tokens: z.number(),
						costUSD: z.number(),
						sessions: z.number(),
					}),
				),
			}),
		),
		weeklyHighlights: z.array(
			z.object({
				weekEnding: z.string(),
				pullRequests: z.array(
					z.object({
						url: z.string(),
						repo: z.string(),
						number: z.number(),
						title: z.string(),
						state: z.enum(['open', 'merged', 'closed']),
						additions: z.number(),
						deletions: z.number(),
						createdAt: z.string(),
						mergedAt: z.string().nullable(),
					}),
				),
				summary: z.string().nullable().optional(),
			}),
		),
		insights: z
			.object({
				weekly: z.array(
					z.object({
						weekEnding: z.string(),
						tokens: z.number(),
						costUSD: z.number(),
						sessions: z.number(),
						messages: z.number(),
						byTool: z.record(z.string(), z.object({ tokens: z.number(), costUSD: z.number() })),
						prsMerged: z.number(),
						additions: z.number(),
						deletions: z.number(),
					}),
				),
				hourCounts: z.array(z.number()).length(24),
				weekdayCounts: z.array(z.number()).length(7),
			})
			.optional(),
	}),
});

export const collections = {
	posts,
	jobs,
	projects,
	profiles,
	bluesky,
	appearances,
	tokenmaxing,
};
