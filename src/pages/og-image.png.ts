import { jsx } from '@/utils/jsx-factory';
import { PALETTE, brandFooter, pngDataUri, renderOgResponse } from '@/utils/og';
import type { APIRoute } from 'astro';
import { type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import type { ReactNode } from 'react';
import profileImage from '@/assets/profile.jpg?buffer';

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

const fieldNode=({title,label,image}:{title:string;label:string;image:string}):ReactNode=>jsx('div',{style:{display:'flex',width:'100%',height:'100%',background:PALETTE.paper,color:PALETTE.ink}},
	jsx('div',{style:{display:'flex',width:'46%',height:'100%',overflow:'hidden',borderRight:`2px solid ${PALETTE.paper2}`}},jsx('img',{src:image,width:552,height:630,style:{width:'552px',height:'630px',objectFit:'cover'}})),
	jsx('div',{style:{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'54%',padding:'50px 54px 44px'}},
		jsx('div',{style:{display:'flex',fontFamily:'JetBrains Mono',fontSize:17,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:PALETTE.pine}},label),
		jsx('div',{style:{display:'flex',fontFamily:'Bricolage',fontWeight:800,fontSize:title.length>55?60:title.length>34?70:82,lineHeight:.94,letterSpacing:-2,color:PALETTE.ink}},title),
		jsx('div',{style:{display:'flex',gap:'12px',alignItems:'center'}},jsx('div',{style:{display:'flex',width:'170px',height:'2px',background:PALETTE.pine}}),jsx('div',{style:{display:'flex',width:'12px',height:'12px',borderRadius:'999px',background:PALETTE.tomato}})),
		brandFooter(),
	),
);

export const GET:APIRoute<Props>=async({props})=>{
	const post=props.post;
	const title=post?.data.title??'AI-native developer experience. In practice.';
	const image=(post?await resolveHero(post.data.hero):null)??await pngDataUri(profileImage);
	return renderOgResponse(fieldNode({title,label:post?'Field note':'Nick Nisi',image}));
};
