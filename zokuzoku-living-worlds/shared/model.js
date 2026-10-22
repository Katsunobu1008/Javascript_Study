/* ZOKUZOKU shared model and playful graphics — no dependencies. */
(function(g){
  const rand=(a,b)=>a+Math.random()*(b-a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const palettes=[['#ffa3db','#f05aac'],['#d1a1ff','#8251db'],['#ffc09b','#f47a99'],['#8af4e4','#29b9ca'],['#ffe6a6','#efa959'],['#b9b5ff','#7168d4']];
  const names=['はじまりのぬい','星降るトート','月色のチャーム','花のアクリル','夢見るマグ','ふわふわフーディ','オーロラのかばん','小さな惑星','ときめきの輪','ミルキーリボン','夜明けのバッジ','空色の記憶','雲の向こう','虹のしっぽ'];
  const seeds=[
    {id:'s0',title:names[0],x:-520,y:-210,kind:0,hue:328,votes:300,author:'公式',parentIds:[]},
    {id:'s1',title:names[1],x:-160,y:-385,kind:1,hue:305,votes:720,author:'みさき',parentIds:['s0']},
    {id:'s2',title:names[2],x:210,y:-270,kind:2,hue:258,votes:88,author:'haru',parentIds:['s0']},
    {id:'s3',title:names[3],x:520,y:-40,kind:3,hue:344,votes:1050,author:'sora',parentIds:['s1','s2']},
    {id:'s4',title:names[4],x:-450,y:210,kind:4,hue:32,votes:40,author:'hana',parentIds:['s0']},
    {id:'s5',title:names[5],x:-80,y:110,kind:5,hue:317,votes:198,author:'mino',parentIds:['s1']},
    {id:'s6',title:names[6],x:340,y:260,kind:1,hue:182,votes:130,author:'ren',parentIds:['s2','s5']},
    {id:'s7',title:names[7],x:690,y:335,kind:2,hue:275,votes:65,author:'noa',parentIds:['s3']},
    {id:'s8',title:names[8],x:-710,y:505,kind:3,hue:13,votes:450,author:'miu',parentIds:['s4']},
    {id:'s9',title:names[9],x:-240,y:515,kind:0,hue:347,votes:93,author:'aki',parentIds:['s5']},
    {id:'s10',title:names[10],x:180,y:560,kind:2,hue:44,votes:75,author:'yu',parentIds:['s5']},
    {id:'s11',title:names[11],x:655,y:-430,kind:4,hue:216,votes:19,author:'rei',parentIds:['s3']}
  ];
  function nodeRadius(v,mode='cosmos'){return (mode==='cosmos'?35:31)+clamp(Math.log2(Math.max(1,v)+1)*5.35,0,64)}
  function derivedTitle(prompt){let s=(prompt||'').trim();return s?s.slice(0,24):names[Math.floor(Math.random()*names.length)]+'の進化'}
  function makeChild(parents,prompt,author='あなた'){
    const a=parents[0],b=parents[1],phi=rand(0,Math.PI*2),dist=rand(170,280);
    const cx=parents.reduce((sum,n)=>sum+n.x,0)/parents.length;
    const cy=parents.reduce((sum,n)=>sum+n.y,0)/parents.length;
    let hue=(a.hue+rand(-85,85)+360)%360;
    if(b)hue=((a.hue+b.hue)/2+rand(-38,38)+360)%360;
    return {id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),title:derivedTitle(prompt),x:cx+Math.cos(phi)*dist,y:cy+Math.sin(phi)*dist,kind:b?((a.kind+b.kind+1)%6):(a.kind+Math.ceil(rand(1,5)))%6,hue:Math.round(hue),votes:0,author,parentIds:parents.map(n=>n.id),createdAt:Date.now()};
  }
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function merch(ctx,kind,hue,size){
    const S=size/100;ctx.save();ctx.scale(S,S);ctx.shadowColor=`hsla(${hue},100%,83%,.6)`;ctx.shadowBlur=15;
    ctx.fillStyle=`hsl(${hue} 92% 85%)`;ctx.strokeStyle='rgba(255,255,255,.82)';ctx.lineWidth=2.5;
    if(kind===0){ // soft plush
      for(let d of [-1,1]){ctx.beginPath();ctx.moveTo(d*22,-18);ctx.lineTo(d*26,-46);ctx.lineTo(d*8,-35);ctx.closePath();ctx.fill();ctx.stroke()}
      ctx.beginPath();ctx.ellipse(0,10,35,37,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#53304e';for(let x of [-12,12]){ctx.beginPath();ctx.ellipse(x,4,3,5,0,0,7);ctx.fill()}ctx.beginPath();ctx.arc(0,18,3,0,7);ctx.fill();ctx.fillStyle='#f599b7';for(let x of [-23,23]){ctx.beginPath();ctx.ellipse(x,17,7,3,0,0,7);ctx.fill()}
    }else if(kind===1){ // tote
      rounded(ctx,-34,-19,68,74,8);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,-20,23,Math.PI,0);ctx.lineWidth=7;ctx.stroke();ctx.beginPath();ctx.arc(0,16,15,0,7);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('♡',0,22);
    }else if(kind===2){ // charm
      ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-37,10,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(0,-15);ctx.stroke();for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,r=i%2?22:37;let x=Math.cos(a)*r,y=Math.sin(a)*r+12;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(0,12,8,0,7);ctx.fill();
    }else if(kind===3){ // badge
      ctx.beginPath();ctx.arc(0,5,38,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,5,30,0,7);ctx.fillStyle='rgba(255,255,255,.38)';ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 43px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✿',0,5)
    }else if(kind===4){ // mug
      rounded(ctx,-34,-24,60,69,9);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(27,3,24,-1.4,1.4);ctx.stroke();ctx.beginPath();ctx.moveTo(-30,-23);ctx.lineTo(24,-23);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='bold 33px serif';ctx.textAlign='center';ctx.fillText('✦',-5,23)
    }else{ // hoodie
      ctx.beginPath();ctx.moveTo(-17,-32);ctx.quadraticCurveTo(0,-52,17,-32);ctx.lineTo(39,-27);ctx.lineTo(51,4);ctx.lineTo(35,12);ctx.lineTo(29,-3);ctx.lineTo(29,46);ctx.lineTo(-29,46);ctx.lineTo(-29,-3);ctx.lineTo(-35,12);ctx.lineTo(-51,4);ctx.lineTo(-39,-27);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,-26,16,0,Math.PI);ctx.stroke();ctx.font='bold 30px serif';ctx.fillStyle='white';ctx.textAlign='center';ctx.fillText('♡',0,24)
    }
    ctx.restore();
  }
  function nodeArt(ctx,n,r,time,selected=false){
    const p=time*.8+(Number(n.hue)||0),pulse=1+Math.sin(p)*.028,rr=r*pulse;
    const grad=ctx.createRadialGradient(n.x-r*.25,n.y-r*.4,r*.03,n.x,n.y,r*1.6);grad.addColorStop(0,`hsla(${n.hue},100%,86%,.96)`);grad.addColorStop(.25,`hsla(${n.hue},91%,58%,.9)`);grad.addColorStop(.68,`hsla(${(n.hue+28)%360},70%,31%,.93)`);grad.addColorStop(1,'rgba(12,5,29,.05)');
    ctx.save();ctx.shadowBlur=selected?38:25;ctx.shadowColor=`hsla(${n.hue},96%,61%,.5)`;ctx.fillStyle=grad;ctx.beginPath();ctx.arc(n.x,n.y,rr,0,7);ctx.fill();ctx.strokeStyle=`hsla(${n.hue},96%,86%,${selected?.98:.6})`;ctx.lineWidth=selected?3.3:1.7;ctx.stroke();ctx.shadowBlur=0;
    ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,r*.89,0,7);ctx.clip();ctx.translate(n.x,n.y);merch(ctx,n.kind,n.hue,r*1.23);ctx.restore();
    for(let k=0;k<3;k++){const a=time*(.21+k*.06)+k*2.1+n.hue;ctx.fillStyle='#fff5fc';ctx.globalAlpha=.52;ctx.beginPath();ctx.arc(n.x+Math.cos(a)*rr*(1.14+k*.07),n.y+Math.sin(a)*rr*(1.14+k*.07),1.5+k*.5,0,7);ctx.fill()}
    ctx.restore();
  }
  g.ZokoModel={rand,clamp,palettes,names,seeds,nodeRadius,makeChild,merch,nodeArt};
})(window);
