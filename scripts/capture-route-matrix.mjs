import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const WebSocket=require('/Users/nicknisi/.cache/aube/virtual-store/ws@8.21.3-5ef631f49d3757ca/node_modules/ws');
const cases={
  home:'/', workshops:'/workshops/', about:'/about/', posts:'/posts/', postHero:'/posts/ai-tooling/', postPlain:'/posts/git-includeif/', speaking:'/speaking/', talk:'/speaking/about-my-coworkers/', tags:'/tags/', tag:'/tags/ai/', uses:'/uses/', vim:'/vim/', tokens:'/tokens/', resume:'/resume/', jobs:'/jobs/', contact:'/meta/', social:'/social/', studio:'/studio/', now:'/now/', notFound:'/404.html'
};
const viewports={desktop:{width:1440,height:1000,deviceScaleFactor:1,mobile:false},mobile:{width:390,height:844,deviceScaleFactor:1,mobile:true}};
const pages=await(await fetch('http://127.0.0.1:9229/json/list')).json();const page=pages.find(p=>p.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));let seq=0;const pending=new Map();ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});const cmd=(method,params={})=>new Promise(resolve=>{const id=++seq;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}))});
await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
fs.mkdirSync('.impeccable/review/full-site/screens',{recursive:true});
for(const [name,route] of Object.entries(cases))for(const [vpName,vp] of Object.entries(viewports))for(const theme of ['light','dark']){
  await cmd('Emulation.setDeviceMetricsOverride',{width:vp.width,height:vp.height,deviceScaleFactor:1,mobile:vp.mobile});
  await cmd('Page.navigate',{url:'http://127.0.0.1:4173'+route});await new Promise(r=>setTimeout(r,130));
  await cmd('Runtime.evaluate',{expression:`document.documentElement.classList.toggle('dark',${theme==='dark'});localStorage.setItem('theme','${theme}');window.scrollTo(0,0)`});await new Promise(r=>setTimeout(r,30));
  const shot=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  fs.writeFileSync(`.impeccable/review/full-site/screens/${name}-${vpName}-${theme}.png`,Buffer.from(shot.result.data,'base64'));
}
ws.close();console.log(`captured ${Object.keys(cases).length*Object.keys(viewports).length*2} screenshots`);
