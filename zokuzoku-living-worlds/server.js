/**
 * Small no-dependency realtime prototype server (Node 18+).
 * Same-origin HTTP + SSE. Events and likes are intentionally memory-only.
 * For production add authentication, permissions, persistent database, validation and moderation.
 */
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const PORT=Number(process.env.PORT||4173);
const MAX_BODY=16384;
const events=[];
const likes=new Map();
const peers=new Set();
const seedLikes=Object.fromEntries([
  ['s0',300],['s1',720],['s2',88],['s3',1050],['s4',40],['s5',198],
  ['s6',130],['s7',65],['s8',450],['s9',93],['s10',75],['s11',19]
]);
for(const [k,v] of Object.entries(seedLikes))likes.set(k,v);
const headers={'Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'};
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8',...headers});res.end(JSON.stringify(obj))}
function broadcast(e){const data=`event: zoko\ndata: ${JSON.stringify(e)}\n\n`;for(const res of peers){try{res.write(data)}catch{peers.delete(res)}}}
function readBody(req){return new Promise((resolve,reject)=>{let str='';req.on('data',c=>{str+=c;if(str.length>MAX_BODY){reject(new Error('Too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(str||'{}'))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
function addEvent(type,payload){const e={id:crypto.randomUUID(),type,payload,at:Date.now()};events.push(e);if(events.length>600)events.shift();broadcast(e);return e}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/markdown; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type',...headers});return res.end()}
  if(req.method==='GET'&&pathname==='/api/state')return json(res,200,{events,mode:'shared',online:peers.size});
  if(req.method==='GET'&&pathname==='/api/events'){
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
    res.write(': connected\n\n');peers.add(res);const heartbeat=setInterval(()=>{try{res.write(': ping\n\n')}catch{clearInterval(heartbeat)}},20000);
    req.on('close',()=>{clearInterval(heartbeat);peers.delete(res)});return;
  }
  if(req.method==='POST'&&pathname==='/api/create'){
    try{const data=await readBody(req),n=data.node;
      if(!n||typeof n.id!=='string'||!/^n[a-z0-9]{10,30}$/.test(n.id)||typeof n.title!=='string'||n.title.length>100||!Array.isArray(n.parentIds)||n.parentIds.length>2||n.parentIds.some(v=>typeof v!=='string'||v.length>60)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||Math.abs(n.x)>20000||Math.abs(n.y)>20000||!Number.isFinite(n.kind)||n.kind<0||n.kind>5||!Number.isFinite(n.hue)||n.hue<0||n.hue>=360)return json(res,400,{error:'Invalid creation'});
      if(likes.has(n.id))return json(res,409,{error:'Already exists'});
      const safe={id:n.id,title:n.title.trim().slice(0,60),x:n.x,y:n.y,kind:Math.trunc(n.kind),hue:Math.round(n.hue),votes:0,author:typeof n.author==='string'?n.author.slice(0,32):'CREATOR',parentIds:n.parentIds,createdAt:Date.now()};
      likes.set(n.id,0);return json(res,201,{event:addEvent('create',{node:safe})});
    }catch{return json(res,400,{error:'Invalid JSON'})}
  }
  if(req.method==='POST'&&pathname==='/api/like'){
    try{const data=await readBody(req),id=data.nodeId;
      if(typeof id!=='string'||!likes.has(id))return json(res,404,{error:'Unknown work'});
      // no authentication: one vote per request; this is a prototype, not a voting system.
      const votes=likes.get(id)+1;likes.set(id,votes);return json(res,200,{event:addEvent('like',{nodeId:id,votes})});
    }catch{return json(res,400,{error:'Invalid JSON'})}
  }
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  let file;
  try{file=decodeURIComponent(pathname==='/'?'/index.html':pathname);const full=path.resolve(ROOT,'.'+file);if(!full.startsWith(ROOT+path.sep))return json(res,403,{error:'Forbidden'});const stat=fs.statSync(full);if(!stat.isFile())return json(res,404,{error:'Not found'});res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache'});return fs.createReadStream(full).pipe(res)}catch{return json(res,404,{error:'Not found'})}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`ZOKUZOKU live: http://localhost:${PORT}`));
