/* Event transport. SSE + REST when served by server.js; localStorage + BroadcastChannel fallback. */
(function(g){
  const K='zokozoku:events:v3',CHAN='zokozoku-realtime-v3';
  function connection(onEvent,onStatus){
    const sent=new Set(), instance=Math.random().toString(36).slice(2);
    let mode='demo', channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(CHAN):null, stream=null;
    const remember=(e)=>{if(!e||!e.id||sent.has(e.id))return;sent.add(e.id);onEvent(e)};
    function localRead(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return []}}
    function localStore(e){const list=localRead();list.push(e);try{localStorage.setItem(K,JSON.stringify(list.slice(-250)))}catch{}if(channel)channel.postMessage(e);remember(e)}
    if(channel)channel.onmessage=msg=>remember(msg.data);
    window.addEventListener('storage',e=>{if(e.key===K)localRead().forEach(remember)});
    async function init(){
      try{const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),1200);
        const r=await fetch('/api/state',{signal:ctl.signal});clearTimeout(tm);if(!r.ok)throw Error('not connected');
        const state=await r.json();mode='server';state.events.forEach(remember);
        stream=new EventSource('/api/events');stream.addEventListener('zoko',ev=>{try{remember(JSON.parse(ev.data))}catch{}});
        stream.addEventListener('open',()=>onStatus('live'));stream.addEventListener('error',()=>onStatus('reconnecting'));
        onStatus('live');return mode;
      }catch{mode='demo';localRead().forEach(remember);onStatus('demo');return mode}
    }
    async function publish(type,payload){const e={id:'e'+Date.now().toString(36)+instance+Math.random().toString(36).slice(2,7),type,payload,origin:instance,at:Date.now()};
      if(mode==='server'){
        try{const r=await fetch('/api/'+type,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(String(r.status));const data=await r.json();remember(data.event);return data.event}catch{onStatus('reconnecting');throw new Error('共有サーバーに送信できませんでした。再試行してください。')}
      }
      localStore(e);return e;
    }
    return {init,publish,get mode(){return mode},close(){stream?.close();channel?.close()}};
  }
  g.ZokoLive={connection};
})(window);
