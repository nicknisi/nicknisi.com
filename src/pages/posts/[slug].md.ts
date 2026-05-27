import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';

interface Props {
	post: CollectionEntry<'posts'>;
}

export async function getStaticPaths() {
	const mode = import.meta.env.MODE;
	const posts = await getCollection('posts', post => (mode === 'production' ? !post.data.draft : true));
	return posts.map(post => ({ params: { slug: post.slug }, props: { post } }));
}

// Serialize a value as a YAML scalar, quoting only when needed.
const yamlScalar = (value: string): string => (/^[\w .,/:-]+$/.test(value) ? value : JSON.stringify(value));

// MDX posts carry `import`/`export` statements in their raw body. Drop those
// top-level lines so the markdown reads clean, but only outside fenced code
// blocks (a real `import` inside a ```ts block must survive). JSX component
// usage in the prose is left as-is; that is the accepted MDX caveat.
const stripMdxStatements = (body: string): string => {
	let inFence = false;
	return body
		.split('\n')
		.filter(line => {
			if (/^\s*(```|~~~)/.test(line)) {
				inFence = !inFence;
				return true;
			}
			if (inFence) return true;
			return !/^(import|export)\s/.test(line);
		})
		.join('\n');
};

// Plain-markdown variant of a post, for agents that request `/posts/<slug>.md`.
// post.body is the raw authored markdown; we prepend YAML frontmatter and an
// H1 (the title lives in frontmatter on-site, so the body has no H1 of its own).
export const GET: APIRoute<Props> = ({ props }) => {
	const { post } = props;
	const { title, description, pubDate, tags = [], external } = post.data;
	const canonical = external ?? `https://nicknisi.com/posts/${post.slug}`;

	const frontmatter = [
		'---',
		`title: ${yamlScalar(title)}`,
		`date: ${pubDate.toISOString().slice(0, 10)}`,
		tags.length ? `tags: [${tags.map(yamlScalar).join(', ')}]` : null,
		description ? `description: ${yamlScalar(description)}` : null,
		`canonical: ${canonical}`,
		'---',
	]
		.filter(Boolean)
		.join('\n');

	const externalNote = external ? `> Originally published at ${external}\n\n` : '';
	const body = stripMdxStatements(post.body ?? '').trim();

	const markdown = `${frontmatter}\n\n# ${title}\n\n${externalNote}${body}\n`.trimEnd() + '\n';

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
