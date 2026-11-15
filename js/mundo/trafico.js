'use strict';
// ===================== MUNDO DINÁMICO =====================
// ¿está detenido por una razón válida? (cerca de un alto/semáforo/cruce, en rotonda o en fila detrás de otro detenido)
function stopReason(W,o){if(o.inR)return true;for(const st of W.stops){const x=(st.dir==='E'||st.dir==='W')?st.pos:(st.a+st.b)/2,y=(st.dir==='E'||st.dir==='W')?(st.a+st.b)/2:st.pos;if(Math.hypot(x-o.x,y-o.y)<55)return true}
  if(W.nodes.some(n=>Math.hypot(n.x-o.x,n.y-o.y)<40))return true;const q=o.blkO;return!!(q&&!q.static&&(q.v||0)<1&&!(q.haz))}
function updateWorld(W,P,dt,t){const FP=(S&&S.W===W&&S.foot)||P;
  for(const z of W.zebras){z.next-=dt;if(z.next<=0){z.next=5+Math.random()*9;const sd=Math.random()<.5?-1:1;
      if(z.o==='h')z.peds.push({x:z.x-3+Math.random()*6,y:z.y+sd*(HW+6),vx:0,vy:-sd*8,an:0,col:pick(CARCOLS)});
      else z.peds.push({x:z.x+sd*(HW+6),y:z.y-3+Math.random()*6,vx:-sd*8,vy:0,an:0,col:pick(CARCOLS)})}
    for(const p of z.peds){const blocked=(P&&Math.abs(P.v)>1.5&&Math.hypot(P.x-p.x,P.y-p.y)<12)||W.ai.some(c=>c.v>1.5&&Math.hypot(c.x-p.x,c.y-p.y)<c.L/2+5);if(!blocked){p.x+=p.vx*dt;p.y+=p.vy*dt;p.an+=dt}}
    z.peds=z.peds.filter(p=>z.o==='h'?Math.abs(p.y-z.y)<HW+8:Math.abs(p.x-z.x)<HW+8);
    z.occ=z.peds.some(p=>z.o==='h'?Math.abs(p.y-z.y)<HW+2:Math.abs(p.x-z.x)<HW+2)}
  // rotonda
  for(const c of W.ringCars){const R=c.R;let tgt=c.vmax,pl=false;c.angryT=Math.max(0,c.angryT-dt);
    if(c.stun>0){c.stun-=dt;tgt=0}
    for(const o of W.ringCars){if(o===c||o.R!==R)continue;const da=nA(c.a-o.a);if(da>0&&da<.65)tgt=Math.min(tgt,Math.max(0,(da-.42)*90))}
    if(P)for(const k of[0,.35,.7]){const qx=P.x+Math.cos(P.h)*P.v*k,qy=P.y+Math.sin(P.h)*P.v*k;const d=Math.hypot(qx-R.x,qy-R.y);
      if(d<R.R+2&&d>R.r-2){const da=nA(c.a-Math.atan2(qy-R.y,qx-R.x));if(da>0&&da<.95){const want=Math.max(0,(da-.45)*75);if(want<tgt){tgt=want;pl=true}}}}
    const dv=c.v-tgt;c.v+=clamp(tgt-c.v,-(pl&&dv>8?90:45)*dt,7*dt);if(pl&&dv>14&&c.v>10)anger(c);
    c.brake=c.v<tgt-.5||c.v<1;c.a=nA(c.a-c.v/c.r*dt);c.x=R.x+Math.cos(c.a)*c.r;c.y=R.y+Math.sin(c.a)*c.r;c.h=c.a-Math.PI/2}
  // peatones en aceras y peatones que cruzan sin paso peatonal
  if(W.walkers)for(const p of W.walkers){if(FP&&Math.abs(p.x-FP.x)+Math.abs(p.y-FP.y)>700&&p.x)continue;p.s+=p.sp*dt;p.an+=dt;const q=walkPos(p.r,p.s);if(!p.r.seg&&W.rounds.length&&W.rounds.some(R=>Math.hypot(q[0]-R.x,q[1]-R.y)<R.R+4)){if(!p.x){p.s+=60*Math.sign(p.sp);continue}p.s-=p.sp*dt*2;p.sp=-p.sp;continue}p.x=q[0];p.y=q[1]}
  // palomas: picotean en las plazas y vuelan si alguien se acerca
  if(W.birds)for(const b of W.birds){if(FP&&Math.abs(b.x-FP.x)+Math.abs(b.y-FP.y)>450)continue;b.t+=dt;if(b.ox==null){b.ox=b.hx;b.oy=b.hy}
    const near=FP&&Math.hypot(FP.x-b.x,FP.y-b.y)<((Math.abs(FP.v)>1.5)?24:FP.foot?14:9);
    if(near&&b.fly<=0){b.fly=2.5+Math.random()*3;const a=Math.atan2(b.y-FP.y,b.x-FP.x)+(Math.random()-.5);b.vx=Math.cos(a)*34;b.vy=Math.sin(a)*34}
    if(b.fly>0){b.fly-=dt;b.z=Math.min(16,b.z+dt*22);if(b.fly<1.6){const d=Math.hypot(b.hx-b.x,b.hy-b.y)||1;b.vx=(b.hx-b.x)/d*34;b.vy=(b.hy-b.y)/d*34}b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.fly<=0)b.fly=0}
    else if(b.z>0){const d=Math.hypot(b.hx-b.x,b.hy-b.y);if(d>1.5){b.x+=(b.hx-b.x)/d*30*dt;b.y+=(b.hy-b.y)/d*30*dt}else b.z=Math.max(0,b.z-dt*18)}
    else if(Math.random()<dt*.7){b.hx=b.ox+(Math.random()-.5)*10;b.hy=b.oy+(Math.random()-.5)*10;b.dir=b.hx>b.x?1:-1;b.x+=(b.hx-b.x)*.3;b.y+=(b.hy-b.y)*.3}}
  if(W.cows)for(const c of W.cows){c.t-=dt;if(c.t<0){c.t=3+Math.random()*6;c.h=Math.random()*6.28}const nx=c.x+Math.cos(c.h)*1.2*dt,ny=c.y+Math.sin(c.h)*1.2*dt;if(Math.hypot(nx-c.ox,ny-c.oy)<22&&!pavedW(W,nx,ny)){c.x=nx;c.y=ny}}
  if(W.ccow){const c=W.ccow,ph=((t+c.ph)%c.T+c.T)%c.T;c.v=ph<9;if(c.v){const k=ph/9;c.x=c.x0+(c.x1-c.x0)*k;c.y=c.y0+(c.y1-c.y0)*k}}
  if(W.jay){for(const p of W.jay){const blocked=(P&&Math.abs(P.v)>1.5&&Math.hypot(P.x-p.x,P.y-p.y)<10)||W.ai.some(o=>o.v>1.5&&Math.hypot(o.x-p.x,o.y-p.y)<o.L/2+3);if(!blocked){p.x+=p.vx*dt;p.y+=p.vy*dt;p.an+=dt}p.life-=dt}W.jay=W.jay.filter(p=>p.life>0)}
  // circuitos y tráfico libre
  const others=W.ai.concat(W.ringCars,W.roadObs||[]);if(P)others.push(P);if(FP&&FP.foot)others.push({x:FP.x,y:FP.y,h:0,v:0,L:3,Wd:3,static:true,ped:true});if(W.ccow&&W.ccow.v)others.push({x:W.ccow.x,y:W.ccow.y,h:0,v:0,L:6,Wd:6,static:true,ped:true});
  const SIMR=TOUCH?700:950;for(const c of W.ai){if(FP&&Math.abs(c.x-FP.x)+Math.abs(c.y-FP.y)>SIMR)continue;// solo se simula el tráfico cercano al jugador
    c.angryT=Math.max(0,c.angryT-dt);if(c.knock){const k=c.knock;c.x+=k.vx*dt;c.y+=k.vy*dt;c.h=nA(c.h+k.spin*dt);k.vx*=Math.pow(.12,dt);k.vy*=Math.pow(.12,dt);k.t-=dt;c.v=0;if(k.t<=0)c.knock=null;continue}let wp,tn,cv=0;
    if(c.nav){wp=c.q[0];if(Math.hypot(wp.x-c.x,wp.y-c.y)<9){c.q.shift();navFill(W,c);wp=c.q[0]}tn=wp.turn}
    else{wp=c.loop.pts[c.wi];if(Math.hypot(wp.x-c.x,wp.y-c.y)<9){c.wi=(c.wi+1)%c.loop.pts.length;wp=c.loop.pts[c.wi]}tn=c.loop.turn[c.wi];cv=c.loop.curv?c.loop.curv[c.wi]:0}
    let dx=wp.x-c.x,dy=wp.y-c.y;const dist=Math.hypot(dx,dy);
    // adelantar: desplazamiento lateral hacia el carril izquierdo
    if(c.ovt){if(c.ovt.st==='out'&&c.off>HW-2){const k=c.ovt.blk,lat=Math.abs(-(k.x-c.x)*Math.sin(k.h||0)+(k.y-c.y)*Math.cos(k.h||0));if(lat>(c.Wd+(k.Wd||8))/2+1.5||!k.player)c.ovt.st='pass'}if(c.ovt.st==='pass'){const k=c.ovt.blk;if((k.x-c.x)*Math.cos(c.h)+(k.y-c.y)*Math.sin(c.h)<-(c.L+k.L)/2-6)c.ovt.st='back'}if(c.ovt.st==='back'&&c.off<.5)c.ovt=null}
    c.off=c.off||0;c.pull=false;if(!c.emerg&&W.emerg){const E=W.emerg,rx=c.x-E.x,ry=c.y-E.y,f=rx*Math.cos(E.h)+ry*Math.sin(E.h),l=Math.abs(-rx*Math.sin(E.h)+ry*Math.cos(E.h));if(f>4&&f<90&&l<10&&Math.cos(c.h-E.h)>.6)c.pull=true}
    c.off+=clamp((c.ovt&&c.ovt.st!=='back'?HW:c.pull?-4:0)-c.off,-9*dt,9*dt);
    // carril lateral (adelantar / orillarse): apuntar a un punto cercano corrido de lado, corrigiendo la distancia real a la línea del carril
    if(Math.abs(c.off)>.2||c.anc){if(!c.anc){const ux=dx/(dist||1),uy=dy/(dist||1);c.anc={x:c.x,y:c.y,ux,uy}}const A=c.anc,ux=A.ux,uy=A.uy,dl=(c.x-A.x)*uy-(c.y-A.y)*ux,D=Math.max(14,c.v*.9);if(Math.abs(c.off)<=.2&&Math.abs(dl)<1)c.anc=null;const e=c.off-dl;dx=ux*D+uy*e;dy=uy*D-ux*e}
    const heavy=c.type==='bus'||c.type==='garbage'||c.type==='truck';
    const rate=Math.max(.2,c.v*(heavy?.06:.085));c.h=nA(c.h+clamp(nA(Math.atan2(dy,dx)-c.h),-rate*dt,rate*dt));
    let zl=c.zl||W.limit;for(const z of W.zones)if(inR(c.x,c.y,z)){zl=z.limit;if(z.name==='ESCUELA')break}
    let tgt=c.nav?Math.min(c.cap||99,zl/KMH*(c.drv||1)):Math.min(c.vmax,zl/KMH*1.04);if(W.slopes&&heavy){const q=slopeAt(W,c.x,c.y);if(q&&Math.cos(c.h)*q.dx+Math.sin(c.h)*q.dy<-.5)tgt*=.6}
    if(dist<34&&Math.abs(tn)>.5)tgt=Math.min(tgt,heavy?12:16);if(dist<30&&cv>.25)tgt=Math.min(tgt,15);if(wp.slow)tgt=Math.min(tgt,wp.slow);
    if(c.stun>0){c.stun-=dt;tgt=0}if(c.pull)tgt=Math.min(tgt,7);
    if(c.type==='garbage'){c.collT=(c.collT==null?8:c.collT)-dt;if(c.stopT>0){tgt=0;if(c.v<1)c.stopT-=dt;c.haz=true}else{c.haz=false;if(c.collT<=0&&dist>60&&!wp.ring&&!wp.entry&&!c.ovt){c.stopT=5+Math.random()*4;c.collT=12+Math.random()*10}}}
    const hx=Math.cos(c.h),hy=Math.sin(c.h),cd=card(c.h);
    if(!c.emerg)for(const s of W.stops){if(s.dir!==cd)continue;const hz=cd==='E'||cd==='W';const lat=hz?c.y:c.x;if(lat<s.a-2||lat>s.b+2)continue;
      const sg=(cd==='E'||cd==='S')?1:-1;const d=(s.pos-(hz?c.x:c.y))*sg-c.L/2;
      if(d<-4||d>50){delete c.ok[s.id];continue}if(d<0)continue;let stop=false;
      if(s.kind==='light'){const ls=lightState(s.light,axisOf(s.dir),t);if(ls==='R'||(ls==='Y'&&d>10))stop=true}
      else{const warn=s.kind==='rail'&&railWarn(W,s.light,s.ca,t);if(warn)stop=true;else if(!c.ok[s.id]){stop=true;if(c.v<.5&&d<6){c.wait+=dt;if(c.wait>.9){c.ok[s.id]=1;c.wait=0}}}}
      if(stop)tgt=Math.min(tgt,Math.max(0,d*1.3))}
    // ceder el paso al entrar a la rotonda
    if(wp.entry&&dist<26){const R=wp.entry,ae=Math.atan2(wp.y-R.y,wp.x-R.x);let yieldTo=false;
      for(const o of W.ai.concat(W.ringCars)){if(o===c)continue;if(!(o.ring?o.R===R:o.inR===R))continue;const da=nA(Math.atan2(o.y-R.y,o.x-R.x)-ae);if(da>-.15&&da<1.2&&o.v>2){yieldTo=true;break}}
      if(P){const d=Math.hypot(P.x-R.x,P.y-R.y);if(d<R.R&&d>R.r){const da=nA(Math.atan2(P.y-R.y,P.x-R.x)-ae);if(da>-.15&&da<1.2)yieldTo=true}}
      if(yieldTo)tgt=Math.min(tgt,Math.max(0,(dist-5)*1.3))}
    c.inR=wp.ring||null;
    const look=30+c.v*2.2+c.v*c.v/55+c.L/2;let pl=false,blk=null;
    c.stT=c.v<.4?(c.stT||0)+dt:0;if(c.ghost>0)c.ghost-=dt;
    if(c.stT>16&&c.nav){c.stT=0;const far=!FP||Math.hypot(c.x-FP.x,c.y-FP.y)>230;if(far){for(let k=0;k<30;k++){const a=pick(W.inter),b=pick(navNb(W,a));const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(FP&&Math.hypot(mx-FP.x,my-FP.y)<260)continue;if(W.ai.some(o=>o!==c&&Math.hypot(o.x-mx,o.y-my)<40))continue;const di=u2(a,b),lo=c.lo||7;c.x=mx-di[1]*lo;c.y=my+di[0]*lo;c.h=Math.atan2(di[1],di[0]);c.nn=[a,b,navPick(W,a,b)];c.q=[];c.ok={};c.ovt=null;c.off=0;navFill(W,c);break}}else c.ghost=2.5}
    for(const o of others){if(c.ghost>0&&!o.player&&!o.ped)continue;if(o===c||(c.ovt&&o===c.ovt.blk))continue;
      const pts=o.player?[[o.x,o.y],[o.x+Math.cos(o.h)*o.v*.35,o.y+Math.sin(o.h)*o.v*.35],[o.x+Math.cos(o.h)*o.v*.7,o.y+Math.sin(o.h)*o.v*.7]]:[[o.x,o.y]];
      for(const[ox,oy]of pts){const rx=ox-c.x,ry=oy-c.y;const f=rx*hx+ry*hy;if(f<=0||f>look)continue;const l=Math.abs(-rx*hy+ry*hx);if(l>(c.Wd+(o.Wd||8))/2+(o.player?4:1))continue;
        if(!o.player&&!o.static&&Math.cos(o.h-c.h)<.2)continue;const gap=f-(c.L+(o.L||14))/2-(c.emerg?14:o.player?8:5);const want=Math.max(0,gap<10?gap*1.2:gap/1.8);if(want<tgt){tgt=want;pl=!!o.player;blk=o}}}
    // tráfico cruzado muy cerca: el que está más lejos del punto de cruce cede (desempate por id para no trabarse)
    if(!(c.ghost>0))for(const o of W.ai){if(o===c||Math.abs(o.x-c.x)>45||Math.abs(o.y-c.y)>45)continue;const cs=Math.cos(o.h-c.h);if(cs>.5)continue;
      const rx=o.x-c.x,ry=o.y-c.y,f=rx*hx+ry*hy;if(f<=0)continue;const lat=Math.abs(-rx*hy+ry*hx);if(cs<-.5&&lat>8)continue;
      const ax=c.x+hx*(c.v*.7+c.L/2),ay=c.y+hy*(c.v*.7+c.L/2),ox=o.x+Math.cos(o.h)*o.v*.7,oy=o.y+Math.sin(o.h)*o.v*.7;
      if(Math.hypot(ax-ox,ay-oy)>(c.L+o.L)/2+3&&Math.hypot(ax-o.x,ay-o.y)>(c.L+o.L)/2+2&&lat>(c.Wd+o.L)/2+2)continue;
      const of=(c.x-o.x)*Math.cos(o.h)+(c.y-o.y)*Math.sin(o.h);
      if(of>0&&(f+2<of||(Math.abs(f-of)<=2&&c.id<o.id)))continue;
      tgt=Math.min(tgt,Math.max(0,(f-(c.L+o.L)/2-3)*1.8))}
    // de frente en el carril contrario (mientras adelanta)
    if(c.off>2&&!c.emerg)for(const o of others){if(o===c||o.static)continue;if(Math.cos(o.h-c.h)>-.5)continue;const rx=o.x-c.x,ry=o.y-c.y,f=rx*hx+ry*hy,l=Math.abs(-rx*hy+ry*hx);if(f>0&&f<45+c.v&&l<10){tgt=Math.min(tgt,Math.max(0,(f-22)*1.5));if(c.ovt)c.ovt.st='back'}}
    // decidir adelantar a un vehículo detenido (obra, carro varado, camión de basura recogiendo)
    const stillB=!!(blk&&!blk.static&&!blk.ped&&(blk.player?(S&&S.pStill||0)>4:(blk.stT||0)>4)&&!stopReason(W,blk));
    if(!c.ovt&&blk&&(!blk.player||c.emerg||stillB)&&((blk.static&&!blk.ped)||blk.haz||stillB||blk.type==='bici'||(c.emerg&&(blk.pull||blk.player)))&&c.v<(blk.type==='bici'?blk.v+5:c.emerg?14:6)&&c.type!=='bici'&&dist>60&&!wp.ring&&!wp.entry){c.blockT=(c.blockT||0)+dt;
      if(c.blockT>(c.bad?.6:1.5)){let clear=true;const need=c.bad?80:140;
        for(const o of others){if(o===c||o===blk)continue;const rx=o.x-c.x,ry=o.y-c.y,f=rx*hx+ry*hy,lat=-rx*hy+ry*hx;if(f>-15&&f<need&&Math.abs(lat+HW)<9){clear=false;break}}
        if(clear){c.ovt={blk,st:'out'};c.blockT=0;if(stillB&&blk.player&&Math.random()<.7){c.say=pick(['PIII!','¿Y DIAY?','¡MUÉVASE!']);c.angryT=1.2;beep(420,.18,'square',.05);beep(420,.18,'square',.05,0,.25)}if(c.bad&&P&&Math.hypot(P.x-c.x,P.y-c.y)<160&&Math.random()<.5){c.say=pick(['PIII!','QUITE!','DIAY!?']);c.angryT=1.2}}}}
    else if(!blk)c.blockT=0;
    c.blkO=blk;
    if(c.emerg&&!c.ovt&&!(c.slideL>0)&&blk&&(blk.player||blk.pull)&&c.v<5){c.eb=(c.eb||0)+dt;if(c.eb>1.2){c.slideL=14;c.sb=blk;c.eb=0}}
    if(c.slideL>0){const k=Math.min(c.slideL,12*dt);c.x+=Math.sin(c.h)*k;c.y-=Math.cos(c.h)*k;c.slideL-=k;tgt=0;if(c.slideL<=0){c.ovt={blk:c.sb,st:'pass'};c.off=14;c.ghost=3}}
    for(const z of W.zebras){if(!z.occ)continue;const rx=z.x-c.x,ry=z.y-c.y;const f=rx*hx+ry*hy,l=Math.abs(-rx*hy+ry*hx);if(f>6&&f<32+c.L/2&&l<16)tgt=Math.min(tgt,Math.max(0,(f-c.L/2-8)*1.5))}
    if(W.jay)for(const p of W.jay){const rx=p.x-c.x,ry=p.y-c.y,f=rx*hx+ry*hy,l=Math.abs(-rx*hy+ry*hx);if(f>2&&f<34+c.L/2&&l<11)tgt=Math.min(tgt,Math.max(0,(f-c.L/2-6)*1.5))}
    if(W.holes)for(const h of W.holes){const rx=h.x-c.x,ry=h.y-c.y,f=rx*hx+ry*hy,l=Math.abs(-rx*hy+ry*hx);if(f>0&&f<30&&l<6)tgt=Math.min(tgt,13)}
    if(c.ovt&&c.ovt.st==='out'&&c.off<10)tgt=Math.min(tgt,7);
    const dv=c.v-tgt;const dec=pl&&dv>10?90:(dv>20?45:30);
    if(c.v<tgt)c.v=Math.min(tgt,c.v+(c.type==='bus'?4:c.type==='garbage'?3.5:7)*dt);else c.v=Math.max(tgt,c.v-dec*dt);c.brake=c.v>tgt+.3||c.v<.5;
    // pitar si el jugador se queda detenido sin motivo delante de él
    if(P&&blk===P&&Math.abs(P.v)<.5&&c.v<.6&&S&&S.W===W&&!S.pLegit){c.waitP=(c.waitP||0)+dt;if(c.waitP>2.6){c.waitP=-5;c.say='PIII!';c.angryT=1.3;if(Math.hypot(P.x-c.x,P.y-c.y)<200)sfx.honk()}}else if(c.waitP>0)c.waitP=0;
    if(pl&&dv>16&&c.v>14){anger(c);if(S&&S.W===W&&P.v>4&&Math.cos(P.h-c.h)<.7)fault('cut','Obligar a otro conductor a frenar bruscamente','II',6)}
    c.x+=hx*c.v*dt;c.y+=hy*c.v*dt;
    c.bl=c.br=false;
    if(c.haz){c.bl=c.br=true}else if(c.ovt){if(!c.bad){c.bl=c.ovt.st==='out';c.br=c.ovt.st==='back'}}
    else if(wp.sig){c.bl=wp.sig==='L';c.br=wp.sig==='R'}else if(dist<50){if(tn>.5)c.br=true;else if(tn<-.5)c.bl=true}}
  // separación física: dos carros nunca quedan uno encima del otro
  {const act=FP?W.ai.filter(c=>Math.abs(c.x-FP.x)+Math.abs(c.y-FP.y)<950):W.ai;
    for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++){const a=act[i],b=act[j];if(Math.abs(b.x-a.x)>30||Math.abs(b.y-a.y)>30)continue;let hit=false;
      if(a.ghost>0||b.ghost>0||a.knock||b.knock)continue;for(const p of circles(a))for(const q of circles(b)){const ex=q.x-p.x,ey=q.y-p.y,d=Math.hypot(ex,ey),m=p.r+q.r;if(d<m&&d>.01){const k=(m-d)/2;a.x-=ex/d*k;a.y-=ey/d*k;b.x+=ex/d*k;b.y+=ey/d*k;hit=true}}
      if(hit){const bk=(b.x-a.x)*Math.cos(a.h)+(b.y-a.y)*Math.sin(a.h)>0?a:b;bk.v=Math.min(bk.v,1.5)}}}
  for(const k of W.cones){k.x+=k.vx*dt;k.y+=k.vy*dt;k.vx*=.9;k.vy*=.9}
}
