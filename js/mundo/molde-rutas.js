'use strict';
// ===================== MOLDE DE RUTAS EMBLEMÁTICAS =====================
// Una ruta se describe con datos: puntos de control, perfil de pendientes, relieve, tráfico, decoración y tareas.
// Así se puede agregar una ruta por cantón rápidamente.
function buildRoute(D){HW=16;const W=newWorld(D.id,D.w,D.h);W.limit=D.limit||60;W.r32=true;W.iTun0=-1;W.iTun1=-1;if(D.fogAll)W.fogAll=D.fogAll;
  const CL=smoothLine(D.ctrl,12);W.CL=CL;const pa=addPath(W,CL);pa.noCenter=true;const n=CL.length,fi=f=>clamp(Math.round(f*(n-1)),0,n-1);W.fi=fi;
  const gradeAt=i=>{const f=i/(n-1);for(const q of D.prof||[])if(f>=q[0]&&f<q[1])return q[2];return 0};
  const e=[0];for(let i=1;i<n;i++)e.push(e[i-1]+gradeAt(i)*Math.hypot(CL[i][0]-CL[i-1][0],CL[i][1]-CL[i-1][1])*.4);
  W.slopes=[];for(let i=0;i<n-1;i++){const g=gradeAt(i),a=CL[i],b=CL[i+1];if(!g)continue;W.slopes.push({seg:g>0?[b[0],b[1],a[0],a[1]]:[a[0],a[1],b[0],b[1]],hw:16,grade:Math.abs(g),n:Math.round(Math.abs(g)*100)+'%'})}
  // curvas: zonas de 40 km/h y señales donde la carretera dobla fuerte
  W.signs=[];let lastSign=-99;for(let i=4;i<n-4;i++){const a1=Math.atan2(CL[i][1]-CL[i-4][1],CL[i][0]-CL[i-4][0]),a2=Math.atan2(CL[i+4][1]-CL[i][1],CL[i+4][0]-CL[i][0]);if(Math.abs(nA(a2-a1))>.55){W.zones.push({x:CL[i][0]-36,y:CL[i][1]-36,w:72,h:72,limit:D.curveLim||40,name:'CURVAS',noText:true});
    if(i-lastSign>30){const j=Math.max(0,i-12),q=offLine(CL,24)[j];W.signs.push({x:q[0],y:q[1],t:'CURVA PELIGROSA'});lastSign=i}}}
  const R=rng(D.seed||7);const water=D.water||[];W.waterPolys=water;
  const inWater=(x,y)=>water.some(pg=>inPoly(x,y,pg));const SH=D.shore?smoothLine(D.shore,20):null;
  const NCL=nearCL(CL,n);makeHM(W,10,(x,y)=>{let[bi,bd]=NCL(x,y);for(let i=Math.max(0,bi-5);i<Math.min(n,bi+6);i++){const d=Math.hypot(CL[i][0]-x,CL[i][1]-y);if(d<bd){bd=d;bi=i}}
    const base=e[bi];if(inWater(x,y))return Math.min(base,D.waterLvl!=null?D.waterLvl:base)-3;if(bd<HW+7)return base;const nz=(Math.sin(x*.011)+Math.sin(y*.015+1)+Math.sin((x+y)*.008+2))/3;
    const hh=base+Math.min(D.hillMax||60,(bd-21)*(D.hill||.3))*(.6+.4*nz);if(SH){let i=0;while(i<SH.length-2&&SH[i+1][0]<x)i++;const a=SH[i],b=SH[i+1],t=clamp((x-a[0])/((b[0]-a[0])||1),0,1),ds=Math.abs(y-(a[1]+(b[1]-a[1])*t))*.85;if(ds<70){const wl=(D.waterLvl!=null?D.waterLvl:base)+1,bh=Math.min(hh,Math.max(wl,Math.min(base,wl+ds*.12)));return ds<50?bh:bh+(hh-bh)*(ds-50)/20}}return hh});
  W.drawUnder=x=>{const G=D.ground||['#6f9a45','#628c3c','#7da852'];x.fillStyle=G[0];x.fillRect(0,0,W.w,W.h);for(let i=0;i<W.w*W.h/900;i++){x.fillStyle=R()<.5?G[1]:G[2];x.fillRect(R()*W.w|0,R()*W.h|0,3,2)}
    for(const pg of water){x.fillStyle='#2f6f9f';x.beginPath();x.moveTo(pg[0][0],pg[0][1]);for(const q of pg)x.lineTo(q[0],q[1]);x.fill();x.strokeStyle='#d9c99a';x.lineWidth=3;x.stroke();x.fillStyle='#4a8fc0';for(let i=0;i<200;i++){const px=R()*W.w,py=R()*W.h;if(inPoly(px,py,pg))x.fillRect(px|0,py|0,4,1)}}
    if(D.under)D.under(x,W,CL,fi);hillshade(x,W)};
  W.drawExtra=x=>{const line=(d,col)=>{const q=offLine(CL,d);x.strokeStyle=col;x.lineWidth=1;x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const p of q)x.lineTo(p[0],p[1]);x.stroke()};
    line(-1,'#f2c230');line(1,'#f2c230');line(HW-1.5,'#ecece4');line(-(HW-1.5),'#ecece4');if(D.extra)D.extra(x,W,CL,fi)};
  W.labels=[];if(D.decor)D.decor(W,CL,fi,R);
  addBushes(W,CL,R,D.bush||1,-1,-1);if(D.bushCols)for(const b of W.bushes)b.c=pick(D.bushCols);addTrees(W,R,D.trees||600,{x:0,y:0,w:W.w,h:W.h},18);W.trees=W.trees.filter(t=>!inWater(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inWater(o.x+2,o.y+2));
  const loop=CL.concat(CL.slice(1,-1).reverse());spawnOnLoop(W,makePathLoop(loop,HW/2),D.cars||18,D.vmax||56,D.types);
  const s0=offLine(CL,HW/2),k=fi(.02);W.spawn={x:s0[k][0],y:s0[k][1],h:Math.atan2(CL[k+1][1]-CL[k][1],CL[k+1][0]-CL[k][0])};
  W.dests=[{n:D.end,x:CL[fi(D.endAt||.92)][0],y:CL[fi(D.endAt||.92)][1]}];W.jay=null;return W}
function routeTasks(){const W=S.W,fi=W.fi,at=f=>({x:W.CL[fi(f)][0],y:W.CL[fi(f)][1]});return ROUTEDEF[S.mode].tasks.map(t=>Object.assign({txt:t.txt,tgt:at(t.at),check(){if(t.check)t.check.call(this,W,fi);return S.ci>=fi(t.at)}},t.start?{start:t.start}:{}))}
// aerogenerador: torre, góndola y tres aspas que giran (vistas de frente al viento del este)
function turbine3D(ctx,C,V,T,t){const u=[0,1],H=T.h,hub=[T.x,T.y,H];box(ctx,C,V,[[T.x-1.4,T.y-1.4],[T.x+1.4,T.y-1.4],[T.x+1.4,T.y+1.4],[T.x-1.4,T.y+1.4]],0,H*.5,'#f4f6f8');box(ctx,C,V,[[T.x-.9,T.y-.9],[T.x+.9,T.y-.9],[T.x+.9,T.y+.9],[T.x-.9,T.y+.9]],H*.5,H,'#f4f6f8');
  box(ctx,C,V,[[T.x-1,T.y-1.6],[T.x+4,T.y-1.6],[T.x+4,T.y+1.6],[T.x-1,T.y+1.6]],H-1.4,H+1.4,'#e9edf0');
  const a0=t*T.sp+T.ph,Lb=T.h*.42;for(let k=0;k<3;k++){const a=a0+k*2.094,dc=Math.cos(a),ds=Math.sin(a),ec=-ds,es=dc,P3=(p,q)=>[T.x-1.2+u[0]*p,T.y+u[1]*p,H+q];
    poly(ctx,proj(C,V,[P3(ec*1,es*1),P3(dc*Lb+ec*.35,ds*Lb+es*.35),P3(dc*Lb-ec*.35,ds*Lb-es*.35),P3(-ec*1,-es*1)]),'#fdfdfd')}}
function tollRules(W,P,dt){for(const T of W.tolls){if(T.done)continue;const al=(P.x-T.x)*T.dir;if(Math.abs(P.y-T.y)>16||al<-150||al>60)continue;
  if(!T.paid&&Math.abs(al)<16&&Math.abs(P.v)<.6){T.hold=(T.hold||0)+dt;if(T.hold>1){T.paid=true;sfx.good();toast('PEAJE '+T.n+' PAGADO','₡'+T.cost+' · ¡Buen viaje!','good')}}
  if(al>17){T.done=true;if(!T.paid)fault('peaje','Pasó el peaje de '+T.n+' sin detenerse a pagar','II',2)}}}
function r27Tasks(){const T=S.W.tolls;return[
  {txt:'RUTA 27: póngase el cinturón [C] y entre a la autopista desde la rampa de Escazú. Direccional IZQUIERDA y ceda el paso.',tgt:{x:2700,y:278},start(){S.r27sig=false},check(){const P=S.P;if(P.blinkL)S.r27sig=true;if(P.x<2700&&Math.abs(P.y-278)<16){if(!S.r27sig)fault('sig','Se incorporó a la autopista sin direccional izquierda','III',3);return true}return false}},
  {txt:'PEAJE DE ESCAZÚ: baje a 30 km/h, deténgase en la caseta y pague ₡'+T[0].cost+'.',tgt:{x:T[0].x,y:T[0].y},check(){return T[0].done}},
  {txt:'Mantenga la DERECHA, máximo 80 km/h (60 en las curvas). Siga hasta el peaje de SAN RAFAEL.',tgt:{x:T[1].x,y:T[1].y},check(){return T[1].done}},
  {txt:'Siga hacia Atenas. PEAJE DE ATENAS: deténgase y pague ₡'+T[2].cost+'.',tgt:{x:T[2].x,y:T[2].y},check(){return T[2].done}},
  {txt:'Tome la SALIDA A ATENAS a la DERECHA. Ponga la direccional DERECHA antes de salir.',tgt:{x:640,y:1065},start(){S.r27sig=false;S.r27f=false},check(){const P=S.P;if(P.blinkR&&P.x<1340&&P.x>960)S.r27sig=true;
    if(!S.r27f&&Math.hypot(P.x-930,P.y-1270)<24){S.r27f=true;if(!S.r27sig)fault('sig','Salió de la autopista sin direccional derecha','III',3)}return Math.hypot(P.x-640,P.y-1065)<24}}]}
