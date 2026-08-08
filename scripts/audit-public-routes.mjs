import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const WebSocket=require('/Users/nicknisi/.cache/aube/virtual-store/ws@8.21.3-5ef631f49d3757ca/node_modules/ws');

const base='http://127.0.0.1:4173';
const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.name==='index.html'||ent.name==='404.html')files.push(p);}}
walk('dist');
const routes=[...new Set(files.map(p=>{let r='/'+path.relative('dist',p).replaceAll(path.sep,'/');r=r.replace(/index\.html$/,'').replace(/404\.html$/,'404');return r||'/';}))].filter(r=>!['/feed/feed.xml/','/nfc-redirect/'].includes(r)).sort();
const pages=await (await fetch('http://127.0.0.1:9229/json/list')).json();
let page=pages.find(p=>p.type==='page');
if(!page) page=await (await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(page.webSocketDebuggerUrl); await new Promise(r=>ws.on('open',r));
let seq=0;const pending=new Map();
ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
const cmd=(method,params={})=>new Promise(resolve=>{const id=++seq;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}));});
await cmd('Page.enable'); await cmd('Runtime.enable');
function evalJs(expression){return cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});}
const findings=[];
for(const route of routes){
  const url=base+route;
  const nav=await cmd('Page.navigate',{url});
  if(nav.result?.errorText){findings.push({route,type:'navigation',detail:nav.result.errorText});continue;}
  await new Promise(r=>setTimeout(r,70));
  for(const theme of ['light','dark']){
    await evalJs(`(()=>{document.documentElement.classList.toggle('dark',${theme==='dark'});localStorage.setItem('theme','${theme}');return true})()`);
    const out=await evalJs(`(()=>{
      const srgb=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
      const parseRgb=s=>{const probe=document.createElement('span');probe.style.color=s;document.body.append(probe);const c=getComputedStyle(probe).color;probe.remove();const m=c.match(/^rgba?\\(([^)]+)\\)$/);if(!m)return null;const vals=m[1].split(/[ ,/]+/).filter(Boolean).slice(0,3).map(Number);return vals.length===3?vals:null};
      const lum=s=>{const vals=parseRgb(s);if(!vals)return null;const [r,g,b]=vals.map(srgb);return .2126*r+.7152*g+.0722*b};
      const contrast=(a,b)=>{const x=lum(a),y=lum(b);if(x==null||y==null)return null;return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
      const bg=el=>{let n=el;while(n){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba?\\(0, 0, 0, 0\\)/.test(c)&&c!=='transparent')return c;n=n.parentElement}return getComputedStyle(document.body).backgroundColor};
      const vis=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>.01&&r.width>0&&r.height>0};
      const issues=[];
      for(const el of document.querySelectorAll('a,button,[role=button],[role=switch],input,select,textarea')){if(!vis(el))continue;const s=getComputedStyle(el),r=el.getBoundingClientRect(),txt=(el.innerText||el.getAttribute('aria-label')||el.value||'').trim();const ratio=contrast(s.color,bg(el));if(txt&&ratio!=null&&ratio<4.5)issues.push({type:'contrast',tag:el.tagName,text:txt.slice(0,80),ratio:+ratio.toFixed(2),color:s.color,bg:bg(el)});const named=(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.innerText||el.getAttribute('title')||el.querySelector('img')?.getAttribute('alt')||'').trim();if(!named)issues.push({type:'label',tag:el.tagName});const iconOnly=el.tagName==='A'&&!(el.innerText||'').trim()&&!!el.querySelector('svg,img');const buttonLike=el.tagName==='BUTTON'||el.getAttribute('role')==='button'||el.getAttribute('role')==='switch'||el.classList.contains('btn')||iconOnly;if(buttonLike&&(r.width<44||r.height<44))issues.push({type:'target',tag:el.tagName,text:named.slice(0,80),size:[Math.round(r.width),Math.round(r.height)]});}
      const overflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {title:document.title,issues,overflow,bodyText:(document.body.innerText||'').trim().length};
    })()`);
    const value=out.result?.result?.value;
    if(!value){findings.push({route,theme,type:'eval'});continue;}
    if(value.overflow>1)findings.push({route,theme,type:'overflow',detail:value.overflow});
    if(value.bodyText<10)findings.push({route,theme,type:'empty',detail:value.bodyText});
    for(const issue of value.issues)findings.push({route,theme,...issue});
  }
}
ws.close();
const summary={routes:routes.length,findings:findings.length,byType:Object.fromEntries([...new Set(findings.map(f=>f.type))].map(t=>[t,findings.filter(f=>f.type===t).length])),findings};
fs.writeFileSync('.impeccable/review/full-site/computed-audit.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify({routes:summary.routes,findings:summary.findings,byType:summary.byType},null,2));
if(findings.some(f=>['navigation','overflow','empty','contrast','label'].includes(f.type)))process.exitCode=1;
