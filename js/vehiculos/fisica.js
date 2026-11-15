'use strict';
// ===================== FÍSICA DEL JUGADOR =====================
function circles(o){const L=o.L||14,r=(o.Wd||8)/2,c=Math.cos(o.h),s=Math.sin(o.h);const half=L/2-r;const n=Math.max(2,Math.ceil(2*half/r)+1);const out=[];
  for(let i=0;i<n;i++){const k=-half+2*half*i/(n-1);out.push({x:o.x+c*k,y:o.y+s*k,r})}return out}
let SQG=null,SQO=null;
function muG(){return 32.7*.9*(S.grip||1)*(S.arcade?1.25:1)}
function updatePlayer(W,P,dt){
  const sp=P.sp;const up=keys.w||keys.arrowup,dn=keys.s||keys.arrowdown,lf=keys.a||keys.arrowleft,rt=keys.d||keys.arrowright,hb=keys[' '];
  const pU=pressed.w||pressed.arrowup,pD=pressed.s||pressed.arrowdown;const stopped=Math.abs(P.v)<.6;
  P.brake=false;let gas=false;P.aLong=0;
  // pedales progresivos: el acelerador se hunde poco a poco, el freno un poco más rápido
  const gasKey=P.gear===1?up:dn,brkKey=P.gear===1?dn:up;
  P.thr=gasKey?Math.min(1,P.thr+dt*.6):Math.max(0,P.thr-dt*3);
  P.bp=brkKey?Math.min(1,P.bp+dt*2.5):0;
  const thr=.2+.8*P.thr,bp=.3+.7*P.bp;
  if(P.gear===1){
    if(pD&&stopped){P.gear=-1;P.v=0;P.thr=0;sfx.gear()}
    else{if(up){const a=sp.acc*thr*(1-Math.max(0,P.v)/sp.vmax);P.aLong=a;P.v+=a*dt;gas=true}
      if(dn){P.brake=true;if(P.v>0){const dec=Math.min(sp.brk*1.45*bp,muG());P.aLong=-dec;P.v=Math.max(0,P.v-dec*dt)}else P.v=0}}
  }else{
    if(pU&&stopped){P.gear=1;P.v=0;P.thr=0;sfx.gear()}
    else{if(dn){P.v-=4*thr*dt*(1-Math.max(0,-P.v)/12);gas=true}
      if(up){P.brake=true;if(P.v<0){const dec=Math.min(sp.brk*1.45*bp,muG());P.aLong=-dec;P.v=Math.min(0,P.v+dec*dt)}else P.v=0}}
  }
  if(hb){P.brake=true;const d=48*dt;P.v=Math.abs(P.v)<d?0:P.v-Math.sign(P.v)*d}
  if(!gas){const d=(1.4+.0012*P.v*P.v)*dt;P.v=Math.abs(P.v)<d?0:P.v-Math.sign(P.v)*d}
  // pendientes: la gravedad empuja cuesta abajo; con freno o freno de mano el carro se sostiene
  const sl=slopeAt(W,P.x,P.y);P.slope=sl||null;P.slAl=0;
  if(sl){const al=Math.cos(P.h)*sl.dx+Math.sin(P.h)*sl.dy;P.slAl=al;const held=(P.brake||hb)&&Math.abs(P.v)<2.5;if(!held){const creep=P.gear===1&&al<0&&Math.abs(P.v)<3&&!(keys.w||keys.arrowup)?.075:0;P.v+=32.7*Math.max(0,sl.grade-creep)*al*dt}else if(Math.abs(P.v)<.6)P.v=0}
  // marcha baja (compresionar): freno de motor y velocidad limitada
  if(P.low&&P.gear===1){if(!gas&&P.v>2)P.v-=5*(P.v/22)*dt;if(P.v>27)P.v-=Math.min(P.v-27,14*dt)}
  if(S.arcade){const tb=(keys.shift)&&P.gear===1&&P.nitro>0;P.boost=tb;if(tb){P.v=Math.min(sp.vmax*1.4,P.v+sp.acc*1.6*dt);P.nitro=Math.max(0,P.nitro-dt*.35)}else P.nitro=Math.min(1,P.nitro+dt*.12);
    if(P.spin){P.h=nA(P.h+P.spin*dt);P.spin*=Math.pow(.08,dt);if(Math.abs(P.spin)<.05)P.spin=0}}
  // volante más duro (menos ángulo) a alta velocidad, como la dirección real
  const maxS=sp.steer/(1+Math.abs(P.v)/80);const tgt=((rt?1:0)-(lf?1:0))*maxS;const rate=(tgt===0?4:3.4)*dt;P.steer+=clamp(tgt-P.steer,-rate,rate);
  S.pStill=Math.abs(P.v)<.4?(S.pStill||0)+dt:0;
  {let yaw=P.v/sp.wb*Math.tan(P.steer);const aMax=muG()*1.2,aL=Math.min(Math.abs(P.aLong||0),aMax*.95);
    // transferencia de peso: al frenar se carga el frente (gira un poco más), al acelerar se descarga (gira menos)
    const wt=P.aLong<0?1+.1*Math.min(1,-P.aLong/20):1-.12*Math.min(1,(P.aLong||0)/8);
    const latMax=Math.sqrt(aMax*aMax-aL*aL)*wt,lat=Math.abs(P.v*yaw);P.slip=0;
    if(lat>latMax&&Math.abs(P.v)>3){const k=latMax/lat;P.slip=Math.min(1,1-k+.05);yaw*=k;P.v-=Math.sign(P.v)*Math.min(Math.abs(P.v),(lat-latMax)*.12*dt)}if(S.arcade&&P.gear===1){if(P.mv==null)P.mv=P.h;const sp2=Math.abs(P.v);
      if(!P.drift&&hb&&sp2>16&&Math.abs(P.steer)>.08){P.drift=true;P.dPts=0}
      if(P.drift){yaw=clamp(P.v/sp.wb*Math.tan(P.steer)*(hb?1.35:1.1),-1.7,1.7);P.slip=Math.max(P.slip,.35);const ang=nA(P.h-P.mv);
        P.mv=nA(P.mv+clamp(ang,-1,1)*(gas?1.9:3.2)*dt);if(Math.abs(nA(P.h-P.mv))>1.15)P.mv=nA(P.h-Math.sign(ang)*1.15);
        P.v*=1-(.08+.16*Math.abs(Math.sin(ang)))*dt;P.dPts+=Math.abs(ang)*sp2*dt*.6;
        if(sp2<10||(!hb&&Math.abs(ang)<.06)){P.drift=false;P.mv=P.h;if(P.dPts>25){const pts=Math.round(P.dPts);S.pts+=pts;toast('DRIFT +'+pts,P.dPts>150?'¡Increíble!':P.dPts>70?'¡Muy bien!':'¡Bien!','good')}}}
      else P.mv=P.h}else{P.drift=false;P.mv=P.h}
    P.h=nA(P.h+yaw*dt)}
  {const mv=P.drift?P.mv:P.h;P.x+=Math.cos(mv)*P.v*dt;P.y+=Math.sin(mv)*P.v*dt}
  // humo de las llantas en el drift
  if(P.drift&&Math.random()<.6){(S.smoke=S.smoke||[]).push({x:P.x-Math.cos(P.h)*P.L/2,y:P.y-Math.sin(P.h)*P.L/2,t:0});if(S.smoke.length>60)S.smoke.shift()}
  if(S.smoke)for(const q of S.smoke)q.t+=dt;
  // aviso educativo: entró muy rápido a la curva
  if(!P.drift&&P.slip>.22&&Math.abs(P.v)*KMH>22){S.slipT=(S.slipT||0)+dt;if(S.slipT>.5&&!(S.slipWarn>S.t)){S.slipWarn=S.t+10;toast('¡MUY RÁPIDO PARA ESA CURVA!','Las llantas no agarran: frene ANTES de la curva, en recta, y gire suave','bad');say('Muy rápido para esa curva. Frene antes, en recta.')}}else S.slipT=0;
  if((P.brake&&-(P.aLong||0)>=muG()*.97&&Math.abs(P.v)>20)||(hb&&Math.abs(P.v)>18)||P.slip>.2||P.drift){const sk=W.skid.getContext('2d');sk.fillStyle='rgba(15,15,18,.55)';const c=Math.cos(P.h),s=Math.sin(P.h);
    for(const l of[-P.Wd/2+1,P.Wd/2-1])sk.fillRect(Math.round(P.x-c*(P.L/2-2)-s*l),Math.round(P.y-s*(P.L/2-2)+c*l),1,1)}
  let hit=null,spd=Math.abs(P.v);
  for(let it=0;it<2;it++){for(const o of W.obst){if(P.x<o.x-14||P.x>o.x+o.w+14||P.y<o.y-14||P.y>o.y+o.h+14)continue;
    for(const c of circles(P)){const qx=clamp(c.x,o.x,o.x+o.w),qy=clamp(c.y,o.y,o.y+o.h);const dx=c.x-qx,dy=c.y-qy,d2=dx*dx+dy*dy;
      if(d2<c.r*c.r){let d=Math.sqrt(d2),nx,ny;if(d<.01){nx=-Math.cos(P.h)*Math.sign(P.v||1);ny=-Math.sin(P.h)*Math.sign(P.v||1);d=0}else{nx=dx/d;ny=dy/d}
        P.x+=nx*(c.r-d);P.y+=ny*(c.r-d);hit=o}}}
    for(const o of W.circObs){if(Math.abs(o.x-P.x)>14||Math.abs(o.y-P.y)>14)continue;for(const c of circles(P)){const dx=c.x-o.x,dy=c.y-o.y,d=Math.hypot(dx,dy),m=c.r+o.r;if(d<m&&d>.01){P.x+=dx/d*(m-d);P.y+=dy/d*(m-d);hit=o}}}}
  if(hit&&S.arcade){if(spd>4){P.v*=-.6;P.spin=(Math.random()-.5)*Math.min(8,spd/10);S.shake=Math.min(.5,spd/120);boing(spd)}else P.v*=-.2;hit=null}
  if(hit){P.v*=-.15;if(spd>2){if(spd>48)fatal('Choque fuerte a alta velocidad');else fault('crash',hit.type==='car'?'Golpear un vehículo estacionado':hit.type==='fence'?'Chocar contra la malla':'Chocar contra un obstáculo','I',3);sfx.crash()}}
  P.x=clamp(P.x,6,W.w-6);P.y=clamp(P.y,6,W.h-6);
  // MAR: el carro no flota. Al entrar al agua se frena, se hunde y la prueba termina (en modo libre vuelve al inicio).
  if(W.waterPolys&&W.waterPolys.length&&!S.foot&&!S.over){const wet=W.waterPolys.some(pg=>inPoly(P.x,P.y,pg));
    if(wet){if(!P.sea){P.sea=.001;sfx.crash&&sfx.crash();toast('¡AL MAR!','El carro se está hundiendo','bad')}P.sea+=dt;P.v*=Math.pow(.08,dt);
      if(P.sea>1.8){P.sea=0;if(S.arcade||S.mode==='tuto'){const sp=W.spawn;P.x=sp.x;P.y=sp.y;P.h=sp.h;P.v=0;toast('CARRO RESCATADO','Nunca maneje hacia el agua ni por la arena','info')}else fatal('El carro entró al mar y se hundió. Nunca maneje hacia el agua ni por la arena.')}}
    else P.sea=0}
  for(const k of W.cones){for(const c of circles(P)){const dx=k.x-c.x,dy=k.y-c.y,d=Math.hypot(dx,dy);if(d<c.r+1.2&&d>0){k.x+=dx/d*(c.r+2-d);k.y+=dy/d*(c.r+2-d);k.vx+=dx/d*Math.abs(P.v)*.6;k.vy+=dy/d*Math.abs(P.v)*.6;if(!k.hit){k.hit=true;if(k.fatal)fatal(typeof k.fatal==='string'?k.fatal:'Tocó un cono en el parqueo: prueba perdida');else fault('cone'+W.cones.indexOf(k),'Tocar o botar un cono (baliza)','II',99)}}}}
  for(const o of W.ai.concat(W.ringCars)){if(Math.abs(o.x-P.x)>30||Math.abs(o.y-P.y)>30)continue;if(o.crushed>S.t)continue;let pushed=false;
    for(const a of circles(P))for(const b of circles(o)){const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),m=a.r+b.r;if(d<m&&d>0){P.x+=dx/d*(m-d)*.6;P.y+=dy/d*(m-d)*.6;pushed=true}}
    if(pushed&&S.arcade&&P.type==='monster'&&Math.abs(P.v)>2){const rel=Math.abs(P.v)+o.v*.5;o.crushed=S.t+12;o.stun=12;o.v=0;o.knock=null;P.v*=.9;S.shake=.35;S.crushes=(S.crushes||0)+1;boing(rel);toast('¡APLASTADO!','Monster truck: '+S.crushes+(S.crushes>1?' carros':' carro'),'good');continue}
    if(pushed&&S.arcade){const rel=Math.abs(P.v)+o.v*.5;if(rel>3){const a=Math.atan2(o.y-P.y,o.x-P.x);o.knock={vx:Math.cos(a)*rel*1.1,vy:Math.sin(a)*rel*1.1,spin:(Math.random()-.5)*rel*.25,t:1};o.stun=2;P.v*=-.35;P.spin=(Math.random()-.5)*rel/12;S.crashes=(S.crashes||0)+1;S.shake=Math.min(.5,rel/100);boing(rel);if(rel>12)anger(o,true)}continue}
    if(pushed){const rel=Math.abs(P.v)+o.v*.5;P.v*=-.2;o.v=0;o.stun=1.2;if(rel>3)anger(o,true);if(o.emerg){P.v*=.5}else if(rel>40)fatal('Choque fuerte contra otro vehículo');else if(rel>2){fault('carhit','Colisión con otro vehículo','I',3);sfx.crash()}}}
  if(P.type==='neon'){P.trT=(P.trT||0)+dt;if(P.trT>.035&&Math.abs(P.v)>1.5){P.trT=0;(P.trail=P.trail||[]).push([P.x-Math.cos(P.h)*4.5,P.y-Math.sin(P.h)*4.5]);if(P.trail.length>48)P.trail.shift()}else if(Math.abs(P.v)<=1.5&&P.trail&&P.trail.length&&P.trT>.03){P.trT=0;P.trail.shift()}}else if(P.trail)P.trail=null;
  if(P.blinkL)P.lastL=S.t;if(P.blinkR)P.lastR=S.t;
  const inRing=W.rounds.some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+4)||(W.cRings||[]).some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+4);
  const nearRing=inRing||W.rounds.some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+16)||(W.cRings||[]).some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+16);
  if(inRing){P.bh0=P.h;P.armed=false}
  if(nearRing&&P.blinkL&&P.steer>.3){P.rStrong=(P.rStrong||0)+S.dt;if(P.rStrong>.35){P.blinkL=false;P.rStrong=0;P.bh0=P.h;P.armed=false}}else P.rStrong=0
  if((P.blinkL||P.blinkR)&&!inRing){if(Math.abs(nA(P.h-P.bh0))>1.05)P.armed=true;if(P.armed&&Math.abs(P.steer)<.06){P.blinkL=P.blinkR=false;P.armed=false}}
}
