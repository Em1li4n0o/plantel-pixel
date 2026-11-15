'use strict';
// ===================== GARAJE =====================
const gcv=$('gcv'),gc=gcv.getContext('2d');gc.imageSmoothingEnabled=false;
function bar(v){const n=Math.round(clamp(v,0,1)*8);const b=(w,c)=>`<i style="display:inline-block;width:calc(var(--u)*${w*5});height:calc(var(--u)*3);background:${c}"></i>`;return b(n,'var(--acc)')+b(8-n,'#3a3a55')}
let GV=null,GSPIN=null;
function garage3D(){if(!GV)GV=Object.assign(mkView(192,108,40,118,999,1),{show:true});const v=VEH[CAR.type],ctx=GV.ctx,t=performance.now()/1000,a=t*.45+.6;
  const wall=ctx.createLinearGradient(0,0,0,GV.hz);wall.addColorStop(0,'#0b0d1c');wall.addColorStop(1,'#1d2246');ctx.fillStyle=wall;ctx.fillRect(0,0,192,GV.hz);
  const fl=ctx.createLinearGradient(0,GV.hz,0,108);fl.addColorStop(0,'#2a2f55');fl.addColorStop(1,'#0c0e1e');ctx.fillStyle=fl;ctx.fillRect(0,GV.hz,192,108-GV.hz);
  ctx.strokeStyle='rgba(120,140,255,.18)';ctx.lineWidth=1;for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(96+i*6,GV.hz);ctx.lineTo(96+i*40,108);ctx.stroke()}for(const y of[52,58,66,77,92])if(y>GV.hz){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(192,y);ctx.stroke()}
  const sp=ctx.createRadialGradient(96,74,4,96,74,70);sp.addColorStop(0,'rgba(255,240,200,.32)');sp.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=sp;ctx.fillRect(0,0,192,108);
  for(const[x,cl]of[[30,'rgba(255,60,200,.25)'],[162,'rgba(0,220,255,.25)']]){const b=ctx.createLinearGradient(x,0,x,60);b.addColorStop(0,cl);b.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=b;ctx.beginPath();ctx.moveTo(x-3,0);ctx.lineTo(x+3,0);ctx.lineTo(x+22,70);ctx.lineTo(x-22,70);ctx.fill()}
  const big=v.L>16||CAR.type==='monster',R=v.L*(big?1.45:1.2)+(big?9:5),C={x:Math.cos(a)*R,y:Math.sin(a)*R,z:3.2+v.L*(big?.26:.2)},h=Math.atan2(-C.y,-C.x);Object.assign(C,{h,c:Math.cos(h),s:Math.sin(h)});
  const o={x:0,y:0,h:0,type:CAR.type,col:carCol(),L:v.L,Wd:v.Wd,lights:true,rider:'#2b2d42',helm:CAR.type==='kart'?'#ffd23f':'#1b1b1f'};
  const sH=HMON,sZ=ZADD;HMON=false;ZADD=0;LIGHTQ=[];try{car3D(ctx,C,GV,o,Math.floor(t*2.6)%2===0);flushLights(ctx,C,GV)}finally{HMON=sH;ZADD=sZ}
  gc.drawImage(GV.c,0,0)}
function garageLoop(){if(ui!=='garage'){GSPIN=null;return}garage3D();GSPIN=requestAnimationFrame(garageLoop)}
function drawGarage(){const v=VEH[CAR.type];garage3D();if(!GSPIN)GSPIN=requestAnimationFrame(garageLoop);
  {const L=licOf(CAR.type);$('gname').textContent=v.n+(L.id==='ARCADE'?' · MODO ARCADE':' · LICENCIA '+L.id);$('gLic').innerHTML=LICS.map((l,i)=>`<button data-l="${i}" style="min-width:0;padding:calc(var(--u)*1.5) calc(var(--u)*2.5);font-size:calc(var(--u)*3.2);${l===L?'background:var(--acc);color:#000':''}">${l.id}<small style="display:block;font-size:calc(var(--u)*2.4)">${l.d}</small></button>`).join('');
    for(const b of $('gLic').querySelectorAll('button'))b.onclick=()=>{CAR.type=LICS[+b.dataset.l].t[0];store.set('pp_car',CAR);drawGarage();sfx.gear()}}
  const row=(l,val)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:calc(var(--u)*4)">${l}<span>${bar(val)}</span></div>`;
  $('gstats').innerHTML=row('ACELERACIÓN',v.acc/11)+row('VELOCIDAD',v.vmax/110)+row('GIRO',7.5/v.wb)+row('TAMAÑO',v.L/17)+`<small style="color:#9cf">${v.d}</small>`}
function garage(dt,dc){if(dt){CAR.type=PTYPES[(PTYPES.indexOf(CAR.type)+dt+PTYPES.length)%PTYPES.length]}if(dc)CAR.col=(CAR.col+dc+PCOLS.length)%PCOLS.length;store.set('pp_car',CAR);drawGarage();sfx.gear()}
function drawAv(){const c=$('avCv');if(!c)return;drawPortrait(c.getContext('2d'),32,32,AV,performance.now()/1000,'feliz','#9fd3ff')}
function avNext(k){const nx=(a,v)=>a[(a.indexOf(v)+1)%a.length];
  if(k==='g'){AV.g=AV.g==='m'?'f':'m';AV.hs=AV.g==='f'?2:0;AV.beard=0}else if(k==='skin')AV.skin=nx(SKINS,AV.skin);else if(k==='hair')AV.hair=nx(HAIRS,AV.hair);
  else if(k==='hs')AV.hs=nx(AV.g==='f'?[2,3,5,0,4]:[0,1,6,4,2],AV.hs);else if(k==='col')AV.col=nx(SHIRTS,AV.col);
  else if(k==='x'){const st=[[0,false],[1,false],[2,false],[0,true],[1,true]];const i=st.findIndex(q=>q[0]===(AV.beard||0)&&q[1]===!!AV.gl);let j=(i+1)%st.length;if(AV.g==='f')j=st[j][0]?3:j;AV.beard=AV.g==='f'?0:st[j][0];AV.gl=st[j][1]}
  AV.ht=AV.g==='f'?4.4:4.7;store.set('pp_av',AV);drawAv()}
document.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>avNext(b.dataset.av));
function togAv(){const on=$('avRow').classList.toggle('hidden');for(const id of['gcv','gstats','gname'])$(id).classList.toggle('hidden',!on);$('gAv').textContent=on?'CONDUCTOR [P]':'VER CARRO [P]';drawAv()}
$('gAv').onclick=togAv;
function openGarage(){show('garage');ui='garage';drawGarage();drawAv()}
