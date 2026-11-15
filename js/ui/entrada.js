'use strict';
// ===================== A PIE Y TELETRANSPORTE =====================
const FOOTOK=m=>m==='city'||!!ROUTES[m];
function toggleFoot(){const P=S.P;
  if(S.foot){const F=S.foot;if(Math.hypot(F.x-P.x,F.y-P.y)>18){toast('ACÉRQUESE AL VEHÍCULO','Camine hasta su '+(isMoto(P.type)?'moto':'carro')+' y pulse '+(TOUCH?'A PIE':'T'),'info');return}S.foot=null;S.look=0;toast('DE VUELTA AL VOLANTE','','good');sfx.gear();return}
  if(S.exam){toast('NO DISPONIBLE','Puede bajarse en Manejo libre, San José libre y Alajuela (no durante un examen)','info');return}
  if(Math.abs(P.v)>1){toast('DETÉNGASE','para bajarse del vehículo','info');return}
  P.v=0;P.thr=0;const c=Math.cos(P.h),sn=Math.sin(P.h),d=P.Wd/2+4;let fx=P.x+sn*d,fy=P.y-c*d;if(footBlocked(S.W,fx,fy)){fx=P.x-sn*d;fy=P.y+c*d}
  S.foot=Object.assign({},AV,{x:fx,y:fy,h:P.h,face:P.h,v:0,vx:0,vy:0,an:0,foot:true,L:3,Wd:3});S.look=0;sfx.gear();
  toast('A PIE',TOUCH?'◀ ▶ girar · GAS caminar · MANO correr · A PIE para subirse':'WASD caminar · ESPACIO correr · T subirse','info')}
function footBlocked(W,x,y){if(x<2||y<2||x>W.w-2||y>W.h-2)return true;if(S&&S.P&&S.foot&&Math.abs(S.P.x-x)<20&&Math.abs(S.P.y-y)<20)for(const c of circles(S.P))if(Math.hypot(c.x-x,c.y-y)<c.r+1.2)return true;for(const o of W.obst)if(x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h)return true;
  if(W.circObs)for(const q of W.circObs)if(q.type!=='isla'&&Math.hypot(x-q.x,y-q.y)<q.r)return true;return false}
function updateFoot(W,dt){const F=S.foot;const run=keys[' ']||keys.shift;const sp=run?17:6.5;let mx=0,my=0;
  if((S.fp)||TOUCH){const tr=(keys.a||keys.arrowleft?-1:0)+(keys.d||keys.arrowright?1:0);F.h=nA(F.h+tr*3*dt);const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?.6:0);mx=Math.cos(F.h)*f;my=Math.sin(F.h)*f}
  else{mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);const l=Math.hypot(mx,my);if(l){mx/=l;my/=l;F.h=Math.atan2(my,mx)}}
  const k=Math.min(1,dt*9);F.vx=(F.vx||0)+(mx*sp-(F.vx||0))*k;F.vy=(F.vy||0)+(my*sp-(F.vy||0))*k;F.v=Math.hypot(F.vx,F.vy);if(F.v>.3)F.an+=dt*F.v*.16;
  {const f0=F.face==null?F.h:F.face,tg=(S.fp||TOUCH)?F.h:(F.v>.5?Math.atan2(F.vy,F.vx):f0);F.face=f0+nA(tg-f0)*Math.min(1,dt*12)}
  const nx=F.x+F.vx*dt,ny=F.y+F.vy*dt;if(!footBlocked(W,nx,F.y))F.x=nx;else F.vx=0;if(!footBlocked(W,F.x,ny))F.y=ny;else F.vy=0;
  for(const c of W.ai.concat(W.ringCars)){const d=Math.hypot(c.x-F.x,c.y-F.y);if(d<c.L/2+2){const a=Math.atan2(F.y-c.y,F.x-c.x);F.x=c.x+Math.cos(a)*(c.L/2+2.5);F.y=c.y+Math.sin(a)*(c.L/2+2.5);
    if(c.v>6&&!(S.cd.hitme>S.t)){S.cd.hitme=S.t+3;S.shake=.4;sfx.crash();toast('¡CUIDADO!','Cruce por los pasos peatonales y mire a ambos lados','bad')}}}}
// Mapa: clic o toque en un lugar para ir ahí (solo fuera de los exámenes)
function snapRoad(W,x,y){let best=null,bd=1e9;
  for(const r of W.roads){const along=r.o==='h'?clamp(x,r.a+24,r.b-24):clamp(y,r.a+24,r.b-24),qx=r.o==='h'?along:r.c,qy=r.o==='h'?r.c:along,d=Math.hypot(qx-x,qy-y);
    if(d<bd){const f=(r.ow||0)>=0?1:-1;bd=d;best=r.o==='h'?{x:qx,y:r.c+7*f,h:f>0?0:Math.PI}:{x:r.c-7*f,y:qy,h:f>0?Math.PI/2:-Math.PI/2}}}
  for(const p of W.paths)if(p.oneway||!W.roads.length)for(const q of p.segs){const t=clamp(((x-q.ax)*q.dx+(y-q.ay)*q.dy)/q.len2,0,1),qx=q.ax+q.dx*t,qy=q.ay+q.dy*t,d=Math.hypot(qx-x,qy-y);if(d<bd){bd=d;best={x:qx,y:qy,h:Math.atan2(q.dy,q.dx)}}}
  return best}
function mapClick(e){if(!S||!S.mapOpen||!S.mapT)return false;const r=$('game').getBoundingClientRect(),T=S.mapT;const wx=((e.clientX-r.left)/r.width*VW-T.ox)/T.k,wy=((e.clientY-r.top)/r.height*VH-T.oy)/T.k;
  if(wx<0||wy<0||wx>S.W.w||wy>S.W.h||S.exam)return false;
  if(S.foot){let ok=null;for(let rr=0;rr<60&&!ok;rr+=3)for(let a=0;a<6.28&&!ok;a+=.5){const x=wx+Math.cos(a)*rr,y=wy+Math.sin(a)*rr;if(!footBlocked(S.W,x,y))ok=[x,y]}if(!ok)return true;S.foot.x=ok[0];S.foot.y=ok[1]}
  else{const q=snapRoad(S.W,wx,wy);if(!q)return true;const P=S.P;P.x=q.x;P.y=q.y;P.h=q.h;P.v=0;P.thr=0;P.steer=0}
  S.mapOpen=false;sfx.good();toast('¡LISTO!','Llegó al lugar elegido','good');return true}

// ===================== MIRAR ALREDEDOR (mouse o dedo) =====================
// En vista de piloto, desde atrás o a pie: arrastre sobre la pantalla para girar la cámara; al soltar vuelve sola al frente.
const DRAG={on:false,id:null,x:0,y:0,t:0};
addEventListener('pointerdown',e=>{if(!S||!S.fp||S.mapOpen||S.over||S.replay)return;const t=e.target;if(t.closest&&t.closest('button,.tb,#dlg,input,a'))return;if(!(t.id==='game'||(t.closest&&t.closest('#hud,#wrap'))))return;DRAG.on=true;DRAG.id=e.pointerId;DRAG.x=e.clientX;DRAG.y=e.clientY});
addEventListener('pointermove',e=>{if(!DRAG.on||e.pointerId!==DRAG.id||!S)return;const r=$('game').getBoundingClientRect(),k=VW/r.width;S.yaw=clamp((S.yaw||0)+(e.clientX-DRAG.x)*k*.012,-3.1,3.1);S.lp=clamp((S.lp||0)+(e.clientY-DRAG.y)*k*.008,-.9,.9);DRAG.x=e.clientX;DRAG.y=e.clientY;DRAG.t=performance.now()});
addEventListener('pointerup',e=>{if(e.pointerId===DRAG.id){DRAG.on=false;DRAG.t=performance.now()}});addEventListener('pointercancel',()=>{DRAG.on=false});
function lookRelax(dt){if(!S||DRAG.on||performance.now()-DRAG.t<1200)return;const k=Math.min(1,dt*3);S.yaw=(S.yaw||0)*(1-k);S.lp=(S.lp||0)*(1-k);if(Math.abs(S.yaw)<.002)S.yaw=0}

// ===================== ENTRADA =====================
const keys={},pressed={};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'){if(e.key==='Escape')e.target.blur();return}const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(!keys[k])pressed[k]=true;keys[k]=true;if(!e.repeat)onKey(k);audioInit()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
function onKey(k){
  if(!S){
    if(ui==='wel'){if(k==='enter'&&!$('welOk').disabled)$('welOk').onclick();return}
    if(ui==='tyc'){if(k==='enter')tycAccept();return}
    if(ui==='rep'){if(k==='escape')repBack();return}
    if(ui==='rules'){if(k==='escape'||k==='enter')back();return}
    if(ui==='lic'){if(k==='escape'||k==='enter')back();return}
    if(ui==='prg'){if(k==='escape')back();return}
    if(ui==='pl'){if(k==='1')start('sanjose');{const b=[...document.querySelectorAll('#plScr [data-sede],#plScr [data-of]')].find(b=>b.textContent.trim().startsWith(k+' ·'));if(b)start(b.dataset.of?'of_'+b.dataset.of:'pl_'+b.dataset.sede)}if(k==='escape')back();return}
    if(ui==='rt'){if(k==='1')start('centro');if(k==='2')start('r27');if(k==='3')start('sjlibre');if(k==='4')start('r32');if(k==='5')start('tilaran');if(k==='6')start('alajuela');if(k==='7')start('manuel');if(k==='8')start('cerro');if(k==='escape')back();return}
    if(ui==='garage'){if(k==='p'){togAv();return}if(k==='a'||k==='arrowleft')garage(-1,0);if(k==='d'||k==='arrowright')garage(1,0);if(k==='w'||k==='arrowup')garage(0,-1);if(k==='s'||k==='arrowdown')garage(0,1);if(k==='enter'||k==='escape')back();return}
    if(ui==='theory'){theoryKey(k);return}
    if(k==='1')openTheory();if(k==='2')openPlanteles();if(k==='3')openRutas();if(k==='4')start('street');if(k==='5')start('city');if(k==='6')openProgress();if(k==='7')showLicense();if(k==='8')openGarage();if(k==='9'){show('rules');ui='rules'}if(k==='0')start('tuto');return}
  if(S.replay){if(k==='escape')endReplay();else if(k==='enter'||k===' ')nextReplay();return}
  if(S.over){if(k==='enter')start(S.mode);if(k==='escape')toMenu();return}
  if(S.mapOpen&&(k==='escape'||k==='m')){S.mapOpen=false;return}
  if(k==='m'&&!S.paused){S.mapOpen=true;S.mapZ=0;return}
  if(k==='+'&&TOUCH&&!S.mapOpen&&(S.zoom||1.5)>=2.5){S.zoom=1;store.set('pp_zoom',1);toast('ZOOM x1','','info');return}
  if(k==='+'&&TOUCH&&S.mapOpen&&(S.mapZ||0)>=2){S.mapZ=0;return}
  if(k==='+'||k==='='||k==='-'){const up=k!=='-';if(S.mapOpen)S.mapZ=clamp((S.mapZ||0)+(up?1:-1),0,2);else{const Z=[1,1.5,2,2.5];let i=Z.indexOf(S.zoom||1.5);i=clamp(i+(up?1:-1),0,Z.length-1);S.zoom=Z[i];store.set('pp_zoom',S.zoom);toast('ZOOM x'+S.zoom,'','info')}return}
  if(S.dlg&&k==='enter'){S.dlg.i++;S.dlg.t=0;return}
  if(k==='escape'||k==='p'){togglePause();return}
  if(S.paused)return;
  const P=S.P;
  if(S.ev&&S.ev.ph==='ask'&&'123'.includes(k)){evAnswer(+k-1);return}if(S.ev&&S.ev.over){if(k==='1')evRetry(true);if(k==='2')evRetry(false);return}
  if(k==='t'){toggleFoot();return}
  if(k==='l'&&!S.foot){P.lights=!P.lights;sfx.gear();toast(P.lights?'LUCES ENCENDIDAS':'LUCES APAGADAS','',P.lights?'good':'info');return}
  if(k==='i'){VOZ=!VOZ;store.set('pp_voz',VOZ);if(!VOZ)shush();toast(VOZ?'VOZ DEL INSTRUCTOR ACTIVADA':'VOZ DEL INSTRUCTOR APAGADA','','info');return}
  if(k==='o'){if(S.exam){toast('RADIO','En el examen no hay radio: concéntrese','info');return}if(!S.radio){S.radio=true}else if(CFG.station<STATIONS.length-1){CFG.station++}else{S.radio=false;CFG.station=0}cfgSave();store.set('pp_radio2',S.radio);S.radioT=8;if(!S.radio)shush();toast(S.radio?STATIONS[CFG.station].n:'RADIO APAGADA',S.radio?STATIONS[CFG.station].d+' · [O] cambia de emisora':'','info');setTimeout(instrHello,900);return}
  if(S.foot&&'qehgcb'.includes(k))return;
  if(k==='q'){P.blinkL=!P.blinkL;P.blinkR=false;P.haz=false;P.bh0=P.h;P.armed=false}
  if(k==='e'){P.blinkR=!P.blinkR;P.blinkL=false;P.haz=false;P.bh0=P.h;P.armed=false}
  if(k==='h'){P.haz=!P.haz;P.blinkL=P.blinkR=false}
  if(k==='b')horn();
  if(k==='g'){if(P.gear===1){P.low=!P.low;sfx.gear();toast(P.low?'MARCHA BAJA (L)':'MARCHA NORMAL (D)',P.low?'Freno de motor: ideal para bajar pendientes':'',P.low?'good':'info')}}
  if(k==='c'){const bw=isMoto(P.type)?'CASCO':'CINTURÓN';if(Math.abs(P.v)<1){P.belt=!P.belt;sfx.gear();toast(P.belt?bw+' PUESTO':bw+' QUITADO','',P.belt?'good':'info')}else toast('DETÉNGASE','para ponerse el '+bw.toLowerCase(),'info')}
  if(k==='v'){if(!S.fp){S.fp=true;S.chase=false}else if(!S.chase&&S.mode!=='tuto'){S.chase=true;S.camH=P.h}else{S.fp=false;S.chase=false}store.set('pp_fp',S.fp);store.set('pp_chase',!!S.chase);
    if(S.chase){toast('VISTA DESDE ATRÁS','Cambie con [V]','info');return}toast(S.fp?'VISTA DE PILOTO':'VISTA DESDE ARRIBA',S.fp?'Z/X: mirar espejos laterales · F: mirar arriba (semáforo)':'Cambie con [V]','info')}
  if(k==='n'){muted=!muted;if(muted)shush();toast(muted?'SONIDO APAGADO':'SONIDO ENCENDIDO','','info')}
  if(k==='r'){if(S.calm&&!S.over)calmRewind();else start(S.mode)}}
function back(){show('menu');ui='menu';refreshMenu()}
function openPlanteles(){show('plScr');ui='pl'}
function openRutas(){show('rtScr');ui='rt'}
function togglePause(){S.paused=!S.paused;$('pause').classList.toggle('hidden',!S.paused);$('cfgScr').classList.add('hidden');$('repScr').classList.add('hidden');if(engG&&S.paused)engG.gain.value=0}
$('b0').onclick=openTheory;$('bSJ').onclick=openPlanteles;$('plSJ').onclick=()=>{audioInit();start('sanjose')};$('plMine').onclick=()=>{if(!loadCustom()){if(confirm('Todavía no ha creado un plantel. ¿Abrir el Creador de planteles?'))location.href='editor.html';return}audioInit();start('custom')};for(const b of document.querySelectorAll('#plScr [data-sede]'))b.onclick=()=>{audioInit();start('pl_'+b.dataset.sede)};for(const b of document.querySelectorAll('#plScr [data-of]'))b.onclick=()=>{audioInit();start('of_'+b.dataset.of)};$('plBack').onclick=back;$('dlg').onclick=()=>{if(S&&S.dlg){S.dlg.i++;S.dlg.t=0}};$('bRT').onclick=openRutas;$('rtC').onclick=()=>{audioInit();start('centro')};$('rtR').onclick=()=>{audioInit();start('r27')};$('rtL').onclick=()=>{audioInit();start('sjlibre')};$('rtB').onclick=()=>{audioInit();start('r32')};$('rtE').onclick=()=>{audioInit();start('tilaran')};$('rtA').onclick=()=>{audioInit();start('alajuela')};$('rtM').onclick=()=>{audioInit();start('manuel')};$('rtD').onclick=()=>{audioInit();start('cerro')};$('rtBack').onclick=back;$('b2').onclick=()=>{audioInit();start('street')};$('b3').onclick=()=>{audioInit();start('city')};
$('b4').onclick=openGarage;$('b5').onclick=showLicense;$('b6').onclick=()=>{show('rules');ui='rules'};$('b7').onclick=openProgress;$('bT').onclick=()=>{audioInit();start('tuto')};$('bBack').onclick=back;$('licBack').onclick=back;
$('gPrev').onclick=()=>garage(-1,0);$('gNext').onclick=()=>garage(1,0);$('gCol').onclick=()=>garage(0,1);$('gOk').onclick=back;
$('bResume').onclick=togglePause;
function cfgDraw(){const pc=v=>Math.round(v*100)+'%',row=(lbl,val,id)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:calc(var(--u)*4)"><span>${lbl}</span><span style="display:flex;align-items:center;gap:calc(var(--u)*2)"><button data-c="${id}" data-d="-1" style="min-width:0;padding:calc(var(--u)*2) calc(var(--u)*3)">-</button><b style="min-width:calc(var(--u)*44);text-align:center;color:var(--acc)">${val}</b><button data-c="${id}" data-d="1" style="min-width:0;padding:calc(var(--u)*2) calc(var(--u)*3)">+</button></span></div>`;
  $('cfgRows').innerHTML=row('MÚSICA',pc(CFG.music),'music')+row('EFECTOS Y MOTOR',pc(CFG.sfx),'sfx')+row('VOZ DEL INSTRUCTOR',CFG.voice?'SÍ':'NO','voice')+row('EMISORA',STATIONS[CFG.station].n.replace(/ [0-9.]+$/,''),'station')+row('BRILLO',pc(CFG.bright),'bright')+row('GRÁFICOS',gqLabel(),'gfx')+ST_INSTR.filter(pk=>instrVars(pk).length>1).map(pk=>row('VOZ '+INSTR[pk].n,instrVarName(pk),'vz_'+pk)).join('');
  for(const b of $('cfgRows').querySelectorAll('button'))b.onclick=()=>{const k=b.dataset.c,d=+b.dataset.d;
    if(k==='music'||k==='sfx')CFG[k]=clamp(Math.round((CFG[k]+d*.1)*10)/10,0,1);else if(k==='bright')CFG.bright=clamp(Math.round((CFG.bright+d*.1)*10)/10,.6,1.5);else if(k==='voice'){CFG.voice=!CFG.voice;if(!CFG.voice)shush()}
    else if(k==='station')CFG.station=(CFG.station+d+STATIONS.length)%STATIONS.length;else if(k==='gfx')cycleGq(d);else if(k.startsWith('vz_'))instrCycleVar(k.slice(3),d);cfgSave();if(k==='sfx')beep(660,.08,'square',.1);cfgDraw()}}
$('bCfg').onclick=()=>{show('cfgScr');cfgDraw()};$('bCfgBack').onclick=()=>{show('pause')};$('bGfx').textContent='GRÁFICOS: '+gqLabel();$('bGfx').onclick=()=>cycleGq(1);$('bRestart').onclick=()=>start(S.mode);$('bMenu').onclick=toMenu;$('bAgain').onclick=()=>start(S.mode);$('bReplay').onclick=startReplay;$('game').addEventListener('click',()=>{if(S&&S.replay)nextReplay()});$('bMenu2').onclick=toMenu;
