'use strict';
// ===================== REPETICIÓN DE FALTAS =====================
function recTrace(W,P){if(!S.trace)S.trace=[];if(S.t-(S.lastRec||-1)<.1)return;S.lastRec=S.t;const F=S.foot||P;
  const cars=[];for(const c of W.ai)if(Math.abs(c.x-F.x)<180&&Math.abs(c.y-F.y)<120)cars.push([c.x|0,c.y|0,+c.h.toFixed(2),c.type,c.col]);
  S.trace.push([S.t,P.x,P.y,P.h,cars]);if(S.trace.length>9000)S.trace.shift()}
function startReplay(){if(!S||!S.faults.length||!S.trace||!S.trace.length)return;S.replay={k:0,t:0};show(null);$('hud').classList.add('hidden');ui='replay'}
function endReplay(){S.replay=null;show('end');ui='end'}
function nextReplay(){const R=S.replay;R.k++;R.t=0;if(R.k>=S.faults.length)endReplay()}
function drawReplay(dt){const R=S.replay,W=S.W,f=S.faults[R.k],tr=S.trace;R.t+=dt;const cur=f.t-4+R.t;if(cur>f.t+1.6){nextReplay();if(!S.replay)return;return}
  let i=0,lo=0,hi=tr.length-1;while(lo<hi){const m=(lo+hi)>>1;if(tr[m][0]<cur)lo=m+1;else hi=m}i=lo;const fr=tr[i];
  const zm=2,vw=VW/zm,vh=VH/zm,ix=Math.round(clamp(f.x-vw/2,0,W.w-vw)),iy=Math.round(clamp(f.y-vh/2,0,W.h-vh));
  g.fillStyle='#000';g.fillRect(0,0,VW,VH);g.save();g.setTransform(zm,0,0,zm,0,0);g.drawImage(W.bg,ix,iy,vw,vh,0,0,vw,vh);
  for(const c of fr[4])drawCar(g,c[0],c[1],c[2],c[4],{},ix,iy,c[3]);drawCar(g,fr[1],fr[2],fr[3],S.P.col,{},ix,iy,S.P.type);
  if(cur>=f.t){g.strokeStyle='#ff3030';g.lineWidth=1;g.beginPath();g.arc(f.x-ix,f.y-iy,12+Math.sin(cur*10)*2,0,7);g.stroke()}g.restore();
  g.fillStyle='rgba(10,10,20,.88)';g.fillRect(0,0,VW,28);g.fillRect(0,VH-12,VW,12);ptext(g,`REPETICION - FALTA ${R.k+1}/${S.faults.length} - CAT ${f.cat}`,6,4,'#ffd23f');
  const t=clean(f.text).toUpperCase();ptext(g,t.slice(0,92),6,13,'#fff');if(t.length>92)ptext(g,t.slice(92,184),6,20,'#fff');
  ptext(g,cur<f.t?'MIRE LO QUE PASA...':'AQUI COMETIO LA FALTA',VW-100,VH-9,cur<f.t?'#cfd6dd':'#ff6b6b');ptext(g,TOUCH?'TOQUE: SIGUIENTE':'ENTER: SIGUIENTE - ESC: VOLVER',6,VH-9,'#cfd6dd')}

// ===================== RETO DEL DÍA =====================
const DAILY=[{t:'Apruebe el CENTRO DE SAN JOSÉ con 90 o más',ok:S=>S.mode==='centro'&&S.okRes&&S.score>=90},
  {t:'Apruebe la PRUEBA EN CALLE sin faltas de categoría I ni II',ok:S=>S.mode==='street'&&S.okRes&&!S.faults.some(f=>f.cat==='I'||f.cat==='II')},
  {t:'En MANEJO LIBRE llegue a 3 destinos sin ninguna infracción',ok:S=>S.mode==='city'&&S.deliv>=3&&S.infr===0},
  {t:'Apruebe el PLANTEL DE SAN JOSÉ',ok:S=>S.mode==='sanjose'&&S.okRes},
  {t:'Apruebe la RUTA 27 pagando los 3 peajes',ok:S=>S.mode==='r27'&&S.okRes},
  {t:'En SAN JOSÉ LIBRE visite 2 lugares emblemáticos sin infracciones',ok:S=>S.mode==='sjlibre'&&S.deliv>=2&&S.infr===0},
  {t:'Llegue a 2 destinos en MANEJO LIBRE de noche o con lluvia, sin infracciones',ok:S=>S.mode==='city'&&S.deliv>=2&&S.infr===0&&S.wx&&(S.wx.n>.5||S.wx.rain>.3)}];
const today=()=>new Date().toLocaleDateString('en-CA');
function dailyCh(){const d=today();let h=0;for(const c of d)h=(h*31+c.charCodeAt(0))>>>0;return DAILY[h%DAILY.length]}
function dailyTxt(){const st=store.get('pp_daily',{}),done=st.date===today(),n=done||st.date===new Date(Date.now()-864e5).toLocaleDateString('en-CA')?st.n||0:0;return`RETO DEL DÍA: ${dailyCh().t} ${done?'✔':''} · RACHA ${n} DÍA${n===1?'':'S'}`}
function checkDaily(){if(!S)return;const st=store.get('pp_daily',{});if(st.date===today())return;if(!dailyCh().ok(S))return;
  const y=new Date(Date.now()-864e5).toLocaleDateString('en-CA'),n=st.date===y?(st.n||0)+1:1;store.set('pp_daily',{date:today(),n});toast('¡RETO DEL DÍA CUMPLIDO!','Racha: '+n+' día'+(n>1?'s':'')+' seguidos','good');sfx.fanfare();say('¡Reto del día cumplido!')}
