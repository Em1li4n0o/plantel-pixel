'use strict';
// ===================== REGLAS =====================
function rules(W,P,px,py,dt){
  const t=S.t,kmh=Math.abs(P.v)*KMH;
  if(!P.belt&&Math.abs(P.v)>3)fault('belt',isMoto(P.type)?'Conducir sin casco':'Conducir sin cinturón de seguridad','I',S.exam?999:25);
  let lim=W.limit;for(const z of W.zones)if(inR(P.x,P.y,z))lim=z.limit;S.lim=lim;
  if(kmh>lim){S.overBeep=(S.overBeep||0)-dt;if(S.overBeep<=0){S.overBeep=.9;beep(1400,.06,'square',.04)}}else S.overBeep=0;
  if(kmh>lim+3){S.speedT+=dt;if(S.speedT>1.5)fault('speed',`Exceso de velocidad: ${kmh|0} km/h en zona de ${lim}`,'II',8)}else S.speedT=0;
  const c=Math.cos(P.h),s=Math.sin(P.h),hl=P.L/2-1;
  const off=!pavedW(W,P.x,P.y)||!pavedW(W,P.x+c*hl,P.y+s*hl)||!pavedW(W,P.x-c*hl,P.y-s*hl);
  const nearRail=W.rails.some(r=>Math.abs((r.o==='v'?P.x:P.y)-r.pos)<9)&&pavedW(W,P.x,P.y);
  if(off&&!nearRail&&Math.abs(P.v)>.5){S.offT+=dt;if(S.offT>.4){const inIsl=W.rounds.some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.r+3);fault('off',inIsl?'Subirse a la isleta de la rotonda':'Salirse de la vía / subirse a la acera o zona verde','II',5)}}else S.offT=0;
  const inRnd=W.rounds.some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+8);
  const rs=W.roads.filter(r=>inR(P.x,P.y,r.rect));
  // VUELTA EN U: permitida en calle de doble vía, despacio y con direccional izquierda; prohibida en calle de una vía,
  // en intersecciones con semáforo, cerca de pasos peatonales y donde hay rótulo de prohibido (W.noU).
  {const r1=rs.length===1?rs[0]:null;
    if(r1&&!inRnd&&P.gear===1){const al=r1.o==='h'?c:s;if(Math.abs(al)>.93){const U0=S.uA;if(!U0||t-U0.t>9||Math.abs(nA(P.h-U0.h))<.45)S.uA={h:P.h,t,x:P.x,y:P.y,bl:false,r:r1}}}
    const U=S.uA;S.uOn=false;
    if(U&&t-U.t<9&&Math.hypot(P.x-U.x,P.y-U.y)<45){const dh=Math.abs(nA(P.h-U.h));if(dh>.45&&kmh<28){S.uOn=true;if(P.blinkL||t-P.lastL<1.5)U.bl=true}
      if(dh>2.65&&r1){S.uA=null;const pt=st=>(st.dir==='E'||st.dir==='W')?[st.pos,(st.a+st.b)/2]:[(st.a+st.b)/2,st.pos];
        const why=U.r.ow||r1.ow?'en una calle de UNA VÍA':W.stops.some(st=>st.kind==='light'&&Math.hypot(pt(st)[0]-P.x,pt(st)[1]-P.y)<45)?'en una intersección con semáforo':W.zebras.some(z=>Math.hypot(z.x-P.x,z.y-P.y)<35)?'junto a un paso peatonal':(W.noU||[]).some(q=>inR(P.x,P.y,q))?'donde hay rótulo de PROHIBIDO VUELTA EN U':'';
        if(why)fault('uturn','Vuelta en U prohibida '+why,'II',8);
        else if(!U.bl)fault('uturnL','Vuelta en U sin direccional IZQUIERDA','II',5);
        else{toast('✔ VUELTA EN U CORRECTA','Lugar permitido, despacio y con direccional','good');if(!S.exam)S.pts+=30}}}}
  // adelantar ("rayar"): salir al carril contrario con direccional izquierda, pasar y volver con direccional derecha
  if(!inRnd&&rs.length===1&&P.gear===1){const r=rs[0];let opp=false;
    if(r.ow){const al=r.o==='h'?c:s;if(al*r.ow<-.6&&P.v>3){S.contraT=(S.contraT||0)+dt;if(S.contraT>.6)fault('contra','Circular en contravía: esta calle es de UNA VÍA','I',8)}else S.contraT=0}
    else if(r.o==='h'){if(c>.5&&P.y<r.c-2)opp=true;if(c<-.5&&P.y>r.c+2)opp=true}else{if(s>.5&&P.x>r.c+2)opp=true;if(s<-.5&&P.x<r.c-2)opp=true}
    if(opp&&!S.ovt&&P.v>3){const tg=ovtTarget(W,P);if(tg){S.ovt={t:0,ok:true};
        if(!(P.blinkL||t-P.lastL<2.5)){fault('ovtL','Adelantar sin poner la direccional IZQUIERDA','II',6);S.ovt.ok=false}
        if(W.nodes.some(n=>!n.round&&Math.hypot(n.x-P.x,n.y-P.y)<48)){fault('ovtX','Adelantar en una intersección (línea continua)','II',6);S.ovt.ok=false}
        if(W.zebras.some(z=>Math.hypot(z.x-P.x,z.y-P.y)<40)){fault('ovtZ','Adelantar cerca de un paso peatonal','II',6);S.ovt.ok=false}}}
    if(S.ovt){S.ovt.t+=dt;if(!opp){if(!(P.blinkR||t-P.lastR<2.5)){fault('ovtR','No puso la direccional DERECHA al volver a su carril','II',6);S.ovt.ok=false}
        if(S.ovt.ok&&S.ovt.t>.8){toast('✔ ADELANTAMIENTO CORRECTO','Direccionales bien usadas','good');if(!S.exam)S.pts+=40}S.ovt=null}else if(S.ovt.t>10)S.ovt=null}
    let wrong=opp&&P.v>8&&!(S.ovt&&S.ovt.t<10)&&!S.uOn;
    if(wrong){S.wrongT+=dt;if(S.wrongT>.9)fault('wrong','Invadir el carril contrario','II',6)}else S.wrongT=0}else S.wrongT=0;
  // pendientes: arranque en subida y bajar compresionando
  if(P.slope&&P.gear===1){const al=P.slAl;
    if(al<-.5&&P.v<-.6){S.roll=(S.roll||0)+Math.abs(P.v)*dt;if(S.roll>3){fault('roll','Se fue hacia atrás en la pendiente (arranque con freno de mano)','II',8);S.roll=-99}}else if(P.v>2)S.roll=0;
    if(al>.5&&P.slope.grade>=.08){if(!S.hillTip){S.hillTip=1;toast('BAJADA PRONUNCIADA','Ponga marcha baja [G] para compresionar','info')}
      if(!P.low&&P.brake&&P.v>4){S.hillBrk=(S.hillBrk||0)+dt;if(S.hillBrk>2.5){fault('compr','Bajar sin compresionar (sin marcha baja), abusando del freno','III',20);S.hillBrk=0}}}
    if(al<-.5&&Math.abs(P.v)<.5&&!S.upTip){S.upTip=1;toast('ARRANQUE EN PENDIENTE','Sostenga ESPACIO (freno de mano), acelere con W y suelte ESPACIO','info')}}
  else if(!P.slope){S.hillTip=0;S.hillBrk=0;S.upTip=0}
  // ¿está detenido por una buena razón? (para que los demás no le piten)
  {const hx=Math.cos(P.h),hy=Math.sin(P.h);const ahead=(x,y,d,l)=>{const rx=x-P.x,ry=y-P.y,f=rx*hx+ry*hy;return f>0&&f<d&&Math.abs(-rx*hy+ry*hx)<l};
    S.pLegit=W.ai.concat(W.roadObs||[]).some(o=>ahead(o.x,o.y,28,9))||W.zebras.some(z=>z.occ&&ahead(z.x,z.y,45,20))||(W.jay||[]).some(p=>ahead(p.x,p.y,50,20))
      ||W.stops.some(s=>{const p=polePos(s);if(!ahead(p[0],p[1],40,26))return false;if(s.kind==='light')return lightState(s.light,axisOf(s.dir),t)!=='G';return true})||W.rounds.some(R=>Math.hypot(P.x-R.x,P.y-R.y)<R.R+22)}
  // huecos
  if(W.holes)for(const h of W.holes){if(Math.hypot(h.x-P.x,h.y-P.y)<h.r+2.5&&!(S.holeT>0)){S.holeT=.8;S.shake=.45;beep(90,.12,'sawtooth',.12);
      if(kmh>15){P.v*=.7;toast('¡HUECO!','Reduzca la velocidad antes de los huecos','bad');if(S.exam)fault('hole','Pasar un hueco a alta velocidad','IV',4);else S.pts=Math.max(0,S.pts-15)}}}
  S.holeT=(S.holeT||0)-dt;
  // peatones fuera del paso peatonal
  for(const p of(W.jay||[]).concat(W.walkers||[]))if(Math.hypot(p.x-P.x,p.y-P.y)<5&&Math.abs(P.v)>2){fatal('Atropelló a un peatón');return}
  if(W.jay&&!S.exam||S.mode==='street'){S.jayT=(S.jayT==null?12:S.jayT)-dt;if(S.jayT<=0){S.jayT=14+Math.random()*12;spawnJay(W,P)}}
  if(W.paths.length&&!inRnd&&P.gear===1&&P.v>8){let best=null,bd=1e9,cnt=0;let bp=null;for(const p of W.paths){let pb=1e9,pq=null;for(const q of p.segs){const t=clamp(((P.x-q.ax)*q.dx+(P.y-q.ay)*q.dy)/q.len2,0,1);const ex=q.ax+q.dx*t-P.x,ey=q.ay+q.dy*t-P.y;const d2=ex*ex+ey*ey;if(d2<pb){pb=d2;pq=q}}if(pb<(p.hw||HW)**2){cnt++;if(pb<bd){bd=pb;best=pq;bp=p}}}
    let wr=false;if(cnt===1&&best){const l=Math.sqrt(best.len2),ux=best.dx/l,uy=best.dy/l;const al=c*ux+s*uy,side=ux*(P.y-best.ay)-uy*(P.x-best.ax);if(bp.oneway){if(al<-.6)wr=true}else if(Math.abs(al)>.6&&Math.abs(side)>2&&(al>0?side<0:side>0))wr=true}
    const zl=W.noInv&&W.noInv.some(z=>Math.hypot(P.x-z.x,P.y-z.y)<z.r);
    if(zl){// zona donde se usa el carril contrario a propósito (ej. salida por el CEDA): direccional IZQUIERDA para entrar y DERECHA para volver
      if(wr&&!S.invZ){S.invZ=true;if(!(P.blinkL||S.t-(P.lastL||-9)<2.5))fault('sigInv','No puso la direccional IZQUIERDA para pasar al otro carril','III',8)}
      else if(!wr&&S.invZ&&cnt===1){S.invZ=false;if(!(P.blinkR||S.t-(P.lastR||-9)<2.5))fault('sigRet','No puso la direccional DERECHA para volver a su carril','III',8)}
      S.wrongT2=0}
    else{if(!wr)S.invZ=false;if(wr){S.wrongT2=(S.wrongT2||0)+dt;if(S.wrongT2>.9)fault('wrong','Invadir el carril contrario','II',6)}else S.wrongT2=0}}
  for(const st of W.stops){const hz=st.dir==='E'||st.dir==='W';const lat=hz?P.y:P.x;if(lat<st.a-3||lat>st.b+3){st.minV=999;continue}
    const sg=(st.dir==='E'||st.dir==='S')?1:-1;const d=(st.pos-(hz?P.x:P.y))*sg,dPrev=(st.pos-(hz?px:py))*sg;
    const dv=dirVec[st.dir],fw=(c*dv[0]+s*dv[1])>.5;
    if(dPrev>0&&d<=0&&P.v>0&&fw){
      if(st.kind==='stop'&&st.minV>1.2)fault('stop'+st.id,'No hizo ALTO total antes de la línea','I',4);
      if(st.kind==='rail'&&st.minV>1.2)fault('rstop'+st.id,'No hizo ALTO total antes del cruce del tren','I',4);
      if(st.kind==='light'&&lightState(st.light,axisOf(st.dir),t)==='R')fault('red'+st.id,'Irrespetar la luz ROJA del semáforo','I',4);
      st.minV=999}
    if(d>0&&d<36&&fw)st.minV=Math.min(st.minV,Math.abs(P.v));else if(d>=40||d<-4)st.minV=999}
  for(const R of W.rails){for(const cr of R.cross){if(Math.abs((R.o==='v'?P.x:P.y)-R.pos)<8&&Math.abs((R.o==='v'?P.y:P.x)-cr.ca)<HW&&railWarn(W,R,cr.ca,t))fault('railx','Cruzar la vía férrea con el tren aproximándose','I',8)}
    const tr=trainRect(W,R,t);if(tr)for(const cc of circles(P)){const qx=clamp(cc.x,tr.x,tr.x+tr.w),qy=clamp(cc.y,tr.y,tr.y+tr.h);if(Math.hypot(cc.x-qx,cc.y-qy)<cc.r){fatal('¡El tren lo arrolló!');return}}}
  for(const z of W.zebras){if(z.occ&&inR(P.x,P.y,{x:z.rect.x-2,y:z.rect.y-2,w:z.rect.w+4,h:z.rect.h+4})&&Math.abs(P.v)>1)fault('ped','No ceder el paso al peatón en el paso peatonal','I',6);
    for(const p of z.peds)if(Math.hypot(p.x-P.x,p.y-P.y)<5&&Math.abs(P.v)>2){fatal('Atropelló a un peatón');return}}
  for(const n of W.nodes){if(n.round)continue;const inZ=Math.abs(P.x-n.x)<20&&Math.abs(P.y-n.y)<20;
    if(inZ&&!n.pin){n.pin=true;n.h0=P.h;n.sL=P.blinkL||t-P.lastL<3;n.sR=P.blinkR||t-P.lastR<3}
    if(inZ&&n.pin){if(P.blinkL)n.sL=true;if(P.blinkR)n.sR=true}
    if(!inZ&&n.pin){n.pin=false;if(P.gear===1&&P.v>0){const dh=nA(P.h-n.h0);
      if(dh>.9&&!n.sR)fault('sig','No usó direccional DERECHA al doblar','II',3);
      if(dh<-.9&&!n.sL)fault('sig','No usó direccional IZQUIERDA al doblar','II',3)}}}
  for(const R of W.rounds){const dx=P.x-R.x,dy=P.y-R.y,dist=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);const st=R.st||(R.st={in:false});
    if(dist<R.R-1&&!st.in){Object.assign(st,{in:true,entry:card(ang),prev:ang,trav:0,usedL:false,wrong:0});
      for(const cr of W.ringCars.concat(W.ai.filter(o=>o.inR===R))){if(cr.ring&&cr.R!==R)continue;const da=nA((cr.ring?cr.a:Math.atan2(cr.y-R.y,cr.x-R.x))-ang);if(da>0&&da<1.15&&cr.v>6){fault('yield','No cedió el paso a quien circula en la rotonda','I',5);break}}}
    if(st.in&&dist<R.R+3){const da=nA(ang-st.prev);st.trav-=da;if(da>0&&P.v>2)st.wrong+=da;if(st.wrong>.6){fault('rwrong','Circular en sentido contrario en la rotonda','I',8);st.wrong=-99}
      if(P.blinkL)st.usedL=true;st.prev=ang}
    if(st.in&&dist>R.R+3){st.in=false;const ex=card(ang);
      if(st.trav>.5||ex!==st.entry){
        if(!(P.blinkR||t-P.lastR<1.6))fault('rsigR','No usó direccional DERECHA al salir de la rotonda','II',3);
        if(st.trav>2.3&&!st.usedL)fault('rsigL','No usó direccional IZQUIERDA al circular (salida posterior a la 1ª)','II',3);
        S.lastExit={entry:st.entry,exit:ex,trav:st.trav}}}}
}
function horn(){const W=S.W,P=S.P;P.hornT=.5;beep(415,.32,'square',.09);beep(523,.32,'square',.07);
  const hx=Math.cos(P.h),hy=Math.sin(P.h);const near=(x,y,d)=>Math.hypot(x-P.x,y-P.y)<d;
  for(const p of W.jay||[])if(near(p.x,p.y,70)){p.vx*=1.7;p.vy*=1.7}
  const danger=(W.jay||[]).some(p=>near(p.x,p.y,60))||W.zebras.some(z=>z.occ&&near(z.x,z.y,50))||W.ai.some(c=>{const rx=c.x-P.x,ry=c.y-P.y,f=rx*hx+ry*hy;return near(c.x,c.y,45)&&(f>0||Math.cos(c.h-P.h)<-.3)&&c.v>3});
  const school=W.zones.some(z=>z.name==='ESCUELA'&&inR(P.x,P.y,z));
  if(school){if(S.exam)fault('horn','Pitar en zona escolar','IV',6);else toast('ZONA ESCOLAR','No se pita cerca de escuelas','bad')}
  else if(S.exam&&S.tasks&&S.tasks[S.task]&&/PITO/.test(S.tasks[S.task].txt)){}
  else if(!danger){if(S.exam)fault('horn','Uso innecesario de la bocina (úsela solo para evitar un accidente)','IV',8);else toast('BOCINA','Úsela solo para evitar un accidente','info')}}
function ovtTarget(W,P){const hx=Math.cos(P.h),hy=Math.sin(P.h);for(const o of W.ai.concat(W.roadObs||[])){const rx=o.x-P.x,ry=o.y-P.y,f=rx*hx+ry*hy,lat=-rx*hy+ry*hx;if(f>-25&&f<70&&lat>8&&lat<22&&Math.cos((o.h||0)-P.h)>.5)return o}return null}
function spawnJay(W,P){if(!W.jay)W.jay=[];const rs=W.roads.filter(r=>inR(P.x,P.y,r.rect));if(rs.length!==1)return;const r=rs[0];const hx=Math.cos(P.h),hy=Math.sin(P.h);
  const along=r.o==='h'?Math.sign(hx):Math.sign(hy);if(!along)return;const d=70+Math.random()*50;const pos=(r.o==='h'?P.x:P.y)+along*d;if(pos<r.a+20||pos>r.b-20)return;
  const px=r.o==='h'?pos:r.c,py=r.o==='h'?r.c:pos;if(W.nodes.some(n=>Math.hypot(n.x-px,n.y-py)<40)||W.zebras.some(z=>Math.hypot(z.x-px,z.y-py)<40)||W.rounds.some(R=>Math.hypot(R.x-px,R.y-py)<R.R+20))return;
  const sd=Math.random()<.5?-1:1,sp=8+Math.random()*3;
  W.jay.push(r.o==='h'?{x:px,y:r.c+sd*(HW+5),vx:0,vy:-sd*sp,an:0,col:pick(CARCOLS),life:(2*HW+12)/sp}:{x:r.c+sd*(HW+5),y:py,vx:-sd*sp,vy:0,an:0,col:pick(CARCOLS),life:(2*HW+12)/sp})}
function lightState(L,axis,t){const c=((t+L.off)%20+20)%20;if(axis==='h')return c<7?'G':c<9?'Y':'R';return c<10?'R':c<17?'G':c<19?'Y':'R'}
