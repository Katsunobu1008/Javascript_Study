/* Zero-dependency HTTP/SSE integration smoke test: node --test tests/realtime.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const port = 18000 + Math.floor(Math.random() * 10000);
const base = `http://127.0.0.1:${port}`;
const proc = spawn(process.execPath, ['server.js'], {cwd:new URL('..',import.meta.url).pathname,env:{...process.env,PORT:String(port)},stdio:'ignore'});
async function awaitReady(){for(let i=0;i<70;i++){if(proc.exitCode!==null)throw new Error('server exited');try{const res=await fetch(`${base}/api/state`);if(res.ok)return}catch{}await new Promise(r=>setTimeout(r,80))}throw new Error('server did not start')}

try {
 await awaitReady();
 await test('serves two prototypes and shared scripts',async()=>{
   for(const route of ['/','/01-living-cosmos.html','/02-gravity-jam.html','/shared/model.js','/shared/live.js']){
     const res=await fetch(base+route);assert.equal(res.status,200,route);
   }
 });
 await test('rejects invalid creations without broadcasting',async()=>{
   const res=await fetch(`${base}/api/create`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({node:{id:'invalid'}})});
   assert.equal(res.status,400);
 });
 await test('shares created work and likes to all clients',async()=>{
   const nodeId='n'+Date.now().toString(36)+'e2etest';
   const node={id:nodeId,title:'E2E ふわふわトート',parentIds:['s0'],x:200,y:330,kind:1,hue:340,author:'test'};
   const streamAbort=new AbortController();
   const stream=await fetch(`${base}/api/events`,{signal:streamAbort.signal});assert.equal(stream.status,200);
   const reader=stream.body.getReader();
   const create=await fetch(`${base}/api/create`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({node})});
   assert.equal(create.status,201);assert.equal((await create.json()).event.payload.node.title,node.title);
   const first=await reader.read();assert.match(new TextDecoder().decode(first.value),/connected|zoko/);
   const state=await (await fetch(`${base}/api/state`)).json();assert(state.events.some(e=>e.payload?.node?.id===nodeId));
   const like=await fetch(`${base}/api/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nodeId})});assert.equal(like.status,200);
   assert.equal((await like.json()).event.payload.votes,1);
   streamAbort.abort();
   await reader.cancel().catch(()=>{});
 });
} finally {proc.kill('SIGTERM');if(proc.exitCode===null)await Promise.race([once(proc,'exit'),new Promise(r=>setTimeout(r,1000))]);}
