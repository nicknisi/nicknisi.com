import { fieldOgNode, pngDataUri, renderOgResponse } from '@/utils/og';
import type { APIRoute } from 'astro';
import { type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import homepageImage from '@/assets/posts/nick-presenting-workos-claude-skills.jpg?buffer';

interface Props { post?: CollectionEntry<'posts'>; }

const resolveImagePath=(imagePath:string):string=>{
	const source=imagePath.split('?')[0]??'';
	if(source.startsWith('/@fs/')) return '/'+source.slice(5);
	if(source.startsWith('/_astro/')){
		const filename=source.split('/').pop()||'';
		const match=filename.match(/^(.+?)\.[\w-]+\.(jpg|jpeg|png|webp|avif)$/);
		if(match)return `${process.cwd()}/src/assets/posts/${match[1]}.${match[2]}`;
	}
	return source;
};
const resolveHero=async(hero:unknown):Promise<string|null>=>{
	if(!hero||typeof hero!=='object'||!('img' in hero))return null;
	const img=(hero as {img?:unknown}).img;
	const src=typeof img==='string'?img:img&&typeof img==='object'&&'src' in img?(img as {src:string}).src:null;
	if(!src)return null;
	try{return await pngDataUri(await readFile(resolveImagePath(src)));}catch{return null;}
};

export const GET: APIRoute<Props> = async ({ props }) => {
	const post = props.post;
	const hero = post ? await resolveHero(post.data.hero) : null;
	const image = hero ?? (post ? null : await pngDataUri(homepageImage));
	const node = fieldOgNode({
		title: post?.data.title ?? 'AI-native DX. In practice.',
		label: post ? 'Field note' : 'AI-native developer experience',
		detail: post ? String(post.data.pubDate.getFullYear()) : 'Nick Nisi',
		...(image ? { image, imagePosition: post ? 'center' : '55% 31%' } : {}),
	});
	return renderOgResponse(node);
};
