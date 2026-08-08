import { jsx } from '@/utils/jsx-factory';
import { PALETTE, brandFooter, pngDataUri, renderOgResponse } from '@/utils/og';
import type { APIRoute } from 'astro';
import type { ReactNode } from 'react';
import workshopImage from '@/assets/posts/2026-aie-europe-workshop.jpg?buffer';

export const GET: APIRoute = async () => {
	const photo = await pngDataUri(workshopImage);
	const node: ReactNode = jsx(
		'div',
		{ style: { display:'flex',width:'100%',height:'100%',background:PALETTE.paper,color:PALETTE.ink } },
		jsx('div',{style:{display:'flex',width:'51%',height:'100%',overflow:'hidden'}},jsx('img',{src:photo,width:612,height:630,style:{width:'612px',height:'630px',objectFit:'cover'}})),
		jsx('div',{style:{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'49%',padding:'54px 54px 46px'}},
			jsx('div',{style:{display:'flex',fontFamily:'Bricolage',fontWeight:800,fontSize:82,lineHeight:.88,letterSpacing:-2,color:PALETTE.ink}},'Make AI how your team works.'),
			jsx('div',{style:{display:'flex',fontFamily:'Atkinson',fontSize:27,lineHeight:1.35,color:PALETTE.inkSoft,maxWidth:'500px'}},'Hands-on workshops for organizations moving from experiments to shared practice.'),
			jsx('div',{style:{display:'flex',height:'2px',background:PALETTE.pine,width:'190px'}}),
			brandFooter(),
		),
	);
	return renderOgResponse(node);
};
