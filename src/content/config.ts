import { z, defineCollection } from 'astro:content';

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    permalink: z.optional(z.string()),
    tags: z.array(z.string()),
    description: z.optional(z.string()),
    pubDate: z.date(),
    external: z.optional(z.string()),
  })
});

export const collections = {
  posts: postsCollection,
};
