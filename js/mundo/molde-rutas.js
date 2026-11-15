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
function addBushes(W,CL,R,dens,t0,t1){W.bushes=W.bushes||[];const cols=['#2f7d32','#3b8a3a','#26682b','#4a9a3f','#5b8f2e'];for(let i=0;i<CL.length;i+=2){if(i>=t0-2&&i<=t1+2&&t0>=0)continue;for(let k=0;k<dens*2;k++){if(R()>.55)continue;const sd=R()<.5?-1:1,d=19+R()*26,o=offLine(CL,sd*d)[i];const x=o[0]+(R()-.5)*8,y=o[1]+(R()-.5)*8;if(pavedW(W,x,y))continue;W.bushes.push({x,y,r:1.6+R()*2.2,h:1.6+R()*2.6,c:cols[R()*5|0]})}}}
function addDogs(W,n){if(!W.walkers)W.walkers=[];const sw=W.sidewalks.filter(r=>r.w>=30&&r.h>=30);if(!sw.length)return;for(let i=0;i<n;i++)W.walkers.push({r:pick(sw),s:Math.random()*1000,sp:(5+Math.random()*5)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(['#8d6e63','#d7b98e','#3e2c23','#a1887f','#f5f0e6','#5d4037']),dog:true})}
function routeTasks(){const W=S.W,fi=W.fi,at=f=>({x:W.CL[fi(f)][0],y:W.CL[fi(f)][1]});return ROUTEDEF[S.mode].tasks.map(t=>Object.assign({txt:t.txt,tgt:at(t.at),check(){if(t.check)t.check.call(this,W,fi);return S.ci>=fi(t.at)}},t.start?{start:t.start}:{}))}
// aerogenerador: torre, góndola y tres aspas que giran (vistas de frente al viento del este)
function turbine3D(ctx,C,V,T,t){const u=[0,1],H=T.h,hub=[T.x,T.y,H];box(ctx,C,V,[[T.x-1.4,T.y-1.4],[T.x+1.4,T.y-1.4],[T.x+1.4,T.y+1.4],[T.x-1.4,T.y+1.4]],0,H*.5,'#f4f6f8');box(ctx,C,V,[[T.x-.9,T.y-.9],[T.x+.9,T.y-.9],[T.x+.9,T.y+.9],[T.x-.9,T.y+.9]],H*.5,H,'#f4f6f8');
  box(ctx,C,V,[[T.x-1,T.y-1.6],[T.x+4,T.y-1.6],[T.x+4,T.y+1.6],[T.x-1,T.y+1.6]],H-1.4,H+1.4,'#e9edf0');
  const a0=t*T.sp+T.ph,Lb=T.h*.42;for(let k=0;k<3;k++){const a=a0+k*2.094,dc=Math.cos(a),ds=Math.sin(a),ec=-ds,es=dc,P3=(p,q)=>[T.x-1.2+u[0]*p,T.y+u[1]*p,H+q];
    poly(ctx,proj(C,V,[P3(ec*1,es*1),P3(dc*Lb+ec*.35,ds*Lb+es*.35),P3(dc*Lb-ec*.35,ds*Lb-es*.35),P3(-ec*1,-es*1)]),'#fdfdfd')}}
// vaca (ganado en los potreros; una cruza la carretera de vez en cuando)
function mono2D(g,x,y){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(Math.round(x)-1,Math.round(y)+1,4,2);g.fillStyle='#6d4c2f';g.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);g.fillStyle='#f1d3a8';g.fillRect(Math.round(x),Math.round(y)-2,1,1);g.fillStyle='#6d4c2f';g.fillRect(Math.round(x)-3,Math.round(y)-2,2,1)}
function cow2D(g,x,y,h){g.save();g.translate(Math.round(x),Math.round(y));g.rotate(h);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-2,-1,7,4);g.fillStyle='#f4f1ea';g.fillRect(-3,-2,6,4);g.fillStyle='#222';g.fillRect(-2,-2,2,2);g.fillRect(1,0,2,2);g.fillStyle='#d9b38c';g.fillRect(3,-1,2,2);g.restore()}
function cow3D(ctx,C,V,c){const cc=Math.cos(c.h),ss=Math.sin(c.h),pt=(a,b)=>[c.x+cc*a-ss*b,c.y+ss*a+cc*b],R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)];
  box(ctx,C,V,R2(2.2,-2.2,-.9,.9),1.3,3,'#f4f1ea');box(ctx,C,V,R2(-.5,-1.6,-.92,.92),1.8,2.8,'#222');box(ctx,C,V,R2(3.1,2.2,-.5,.5),2,3,'#d9b38c');for(const a of[1.6,-1.6])for(const b of[-.6,.6])box(ctx,C,V,R2(a+.3,a-.3,b-.25,b+.25),0,1.3,'#d8d4cc')}
const ROUTEDEF={
  manuel:{id:'manuel',w:3200,h:2000,limit:50,seed:618,end:'PLAYA MANUEL ANTONIO',curveLim:30,clock:17.2,
    ctrl:[[-300,1700],[200,1650],[600,1560],[900,1400],[1100,1180],[1350,1100],[1600,1180],[1800,1000],[2050,900],[2300,980],[2550,850],[2800,720],[3050,700],[3500,690]],
    prof:[[.2,.45,.06],[.45,.7,-.05],[.7,.85,.04],[.85,1,-.04]],hill:.45,hillMax:70,waterLvl:-25,bush:2.5,shore:[[0,1790],[600,1650],[900,1490],[1100,1270],[1350,1190],[1600,1270],[1800,1090],[2050,990],[2300,1070],[2550,940],[2800,810],[3200,790]],
    water:[[[0,1790],[600,1650],[900,1490],[1100,1270],[1350,1190],[1600,1270],[1800,1090],[2050,990],[2300,1070],[2550,940],[2800,810],[3200,790],[3200,2000],[0,2000]]],
    ground:['#2f8a3a','#287a31','#3fa04a'],trees:900,cars:14,vmax:46,types:['bus',null,'moto',null,'taxi',null,'pickup',null,'moto',null,'suv',null,'bici',null],
    under(x,W,CL,fi){const sh=smoothLine([[0,1790],[600,1650],[900,1490],[1100,1270],[1350,1190],[1600,1270],[1800,1090],[2050,990],[2300,1070],[2550,940],[2800,810],[3200,790]],12),R=rng(31);
      const pl=(w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(sh[0][0],sh[0][1]);for(const q of sh)x.lineTo(q[0],q[1]);x.stroke()};x.lineJoin='round';x.lineCap='round';
      // arena seca (clara) hacia tierra y arena mojada en la orilla
      pl(64,'#f3e6bd');pl(40,'#efdcaa');for(let i=0;i<5000;i++){const q=sh[R()*sh.length|0],px=q[0]+(R()-.5)*60,py=q[1]+(R()-.5)*60;x.fillStyle=R()<.5?'#e4d09a':'#fbf1d2';x.fillRect(px|0,py|0,1,1)}
      // mar: degradado de azul profundo a turquesa en la orilla, y espuma
      const W0=W.waterPolys[0];x.save();x.beginPath();x.moveTo(W0[0][0],W0[0][1]);for(const q of W0)x.lineTo(q[0],q[1]);x.closePath();x.clip();
      x.fillStyle='#1b5c94';x.fillRect(0,0,W.w,W.h);for(const[w,col]of[[260,'#1f6aa3'],[170,'#2380b4'],[110,'#279ac2'],[64,'#33b5c9'],[34,'#5ccfd0'],[16,'#93e3d8']])pl(w,col);
      x.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<900;i++){const px=R()*W.w,py=R()*W.h;x.fillRect(px|0,py|0,5+R()*6|0,1)}
      pl(5,'rgba(255,255,255,.85)');x.setLineDash([6,9]);x.lineDashOffset=0;x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=2;const o1=offLine(sh,9);x.beginPath();x.moveTo(o1[0][0],o1[0][1]);for(const q of o1)x.lineTo(q[0],q[1]);x.stroke();
      x.setLineDash([3,14]);const o2=offLine(sh,20);x.beginPath();x.moveTo(o2[0][0],o2[0][1]);for(const q of o2)x.lineTo(q[0],q[1]);x.stroke();x.setLineDash([]);x.restore();
      // toallas en la arena de la playa de Manuel Antonio
      for(let i=0;i<14;i++){const k=sh.length-34+(R()*30|0),q=sh[Math.max(0,k)],o=offLine(sh,-14-R()*14)[Math.max(0,k)];x.fillStyle=pick(['#e63946','#2a9df4','#ffd23f','#3ddc84','#ff70a6','#f4a261']);x.fillRect(o[0]|0,o[1]|0,4,7);x.fillStyle='rgba(255,255,255,.7)';x.fillRect(o[0]|0,(o[1]|0)+2,4,1)}
      x.lineCap='butt'},
    decor(W,CL,fi,R){W.palms=[];for(let i=0;i<CL.length;i+=3){for(const sd of[-1,1]){if(R()<.35)continue;const o=offLine(CL,sd*(24+R()*30))[i];if(!pavedW(W,o[0],o[1]))W.palms.push({x:o[0],y:o[1],r:R()*6})}}
      {const i=fi(.55),a=offLine(CL,-45)[i],b=offLine(CL,45)[i];W.ccow={x0:a[0],y0:a[1],x1:b[0],y1:b[1],x:a[0],y:a[1],h:Math.atan2(b[1]-a[1],b[0]-a[0]),T:16,ph:4,kind:'mono'}}
      W.labels.push({x:60,y:1600,t:'QUEPOS',col:'#fff'},{x:1300,y:1500,t:'OCEANO PACIFICO',col:'#e0f2ff'},{x:2700,y:760,t:'PARQUE NACIONAL MANUEL ANTONIO',col:'#d8f3dc'},{x:2880,y:830,t:'PLAYA MANUEL ANTONIO',col:'#ffffff'});
      // sombrillas de colores, torre de salvavidas y bañistas en la playa del final
      {const sh=smoothLine([[2550,940],[2800,810],[3200,790]],12),N={win:'none'};for(let i=2;i<sh.length-1;i+=2){if(R()<.3)continue;const o=offLine(sh,-16-R()*12)[i];if(pavedW(W,o[0],o[1]))continue;const col=pick(['#e63946','#ffd23f','#2a9df4','#ff70a6','#3ddc84','#ff9f1c']);
          addLM(W,[PB(o[0]-.3,o[1]-.3,.6,.6,0,4.2,'#f1f1f1',N),PO(o[0],o[1],3.6,4.2,4.9,col,N),PO(o[0],o[1],1.4,4.9,5.5,'#ffffff',N)])}
        const q=offLine(sh,-26)[Math.floor(sh.length*.55)];addLM(W,[PB(q[0]-2.5,q[1]-2.5,1,1,0,6,'#c9a227',N),PB(q[0]+1.5,q[1]-2.5,1,1,0,6,'#c9a227',N),PB(q[0]-2.5,q[1]+1.5,1,1,0,6,'#c9a227',N),PB(q[0]+1.5,q[1]+1.5,1,1,0,6,'#c9a227',N),PB(q[0]-3,q[1]-3,6,6,6,9,'#e63946',N),PB(q[0]-3.4,q[1]-3.4,6.8,6.8,9,9.8,'#ffffff',N)],{label:'SALVAVIDAS',ly:q[1]+6});
        W.walkers=W.walkers||[];for(let i=0;i<10;i++){const k=2+(R()*(sh.length-4)|0),a=offLine(sh,-8)[k],b=offLine(sh,-8)[Math.min(sh.length-1,k+2)];W.walkers.push({r:{seg:[a,b]},s:R()*40,sp:1.5+R()*2,an:0,x:0,y:0,col:pick(['#e63946','#2a9df4','#ffd23f','#ff70a6','#3ddc84'])})}}
      W.signs.push({x:offLine(CL,24)[fi(.5)][0],y:offLine(CL,24)[fi(.5)][1],t:'CRUCE FAUNA'})},
    tasks:[{at:.15,txt:'MANUEL ANTONIO: salga de Quepos por la costa. Cinturón [C]. Máximo 50 km/h.'},
      {at:.45,txt:'CURVAS Y CUESTAS junto al mar: máximo 30 km/h en las curvas cerradas.'},
      {at:.6,txt:'CRUCE DE FAUNA: pueden cruzar MONOS. Baje la velocidad y no pite.'},
      {at:.92,txt:'Llegue a la entrada de la playa Manuel Antonio. ¡Pura vida!'}]},
  cerro:{id:'cerro',w:3400,h:2300,limit:60,seed:2,end:'SAN ISIDRO DE EL GENERAL',endAt:.89,fogAll:.65,curveLim:40,
    ctrl:[[-300,300],[200,320],[600,420],[800,700],[700,1000],[950,1150],[1300,1050],[1650,1150],[1900,1400],[1800,1700],[2100,1850],[2500,1800],[2800,1950],[3100,2050],[3700,2080]],
    prof:[[.05,.45,.09],[.45,.55,0],[.55,.95,-.09]],hill:.55,hillMax:90,ground:['#6e7f4f','#5f7045','#86955f'],trees:380,bush:3,cars:16,vmax:52,
    types:['truck',null,'bus',null,'truck',null,'pickup',null,'truck',null,'moto',null,'suv',null,'truck',null],
    bushCols:['#6b7d3c','#7d8a46','#5a6b35','#8c8f5a'],
    decor(W,CL,fi,R){
      W.labels.push({x:60,y:260,t:'CARTAGO',col:'#fff'},{x:1450,y:980,t:'CERRO DE LA MUERTE 3300 M',col:'#fff'},{x:3000,y:2000,t:'SAN ISIDRO',col:'#fff'});
      W.signs.push({x:offLine(CL,24)[fi(.3)][0],y:offLine(CL,24)[fi(.3)][1],t:'ZONA NIEBLA'},{x:offLine(CL,24)[fi(.56)][0],y:offLine(CL,24)[fi(.56)][1],t:'MARCHA BAJA'})},
    tasks:[{at:.15,txt:'CERRO DE LA MUERTE (Ruta 2): suba desde Cartago. Cinturón [C] y LUCES [L]: hay neblina casi todo el camino.'},
      {at:.45,txt:'SUBIDA DEL 9% hasta la cima (3300 m). Mantenga su carril: doble raya amarilla.'},
      {at:.55,txt:'LA CIMA: hace frío y la neblina es espesa. Baje la velocidad.'},
      {at:.85,txt:'BAJADA LARGA del 9% hacia San Isidro: use MARCHA BAJA [G] para no recalentar los frenos.',start(){S.lowT=0;S.dnT=0},check(){const P=S.P;if(P.slope&&P.slAl>.5&&P.v>3){S.dnT+=S.dt;if(P.low)S.lowT+=S.dt}if(S.ci>=S.W.fi(.85)&&!this.chk){this.chk=1;if(S.dnT>4&&S.lowT<S.dnT*.5)fault('baja','No usó marcha baja en la bajada','III',99)}}},
      {at:.89,txt:'Llegue a San Isidro de El General.'}]},
  tilaran:{id:'tilaran',w:3300,h:2200,limit:60,seed:142,end:'LA LAGUNA DE ARENAL',
    ctrl:[[-300,1900],[200,1860],[620,1720],[900,1520],[820,1280],[1080,1120],[1000,880],[1260,720],[1650,650],[2000,700],[2240,720],[2460,600],[2400,420],[2650,320],[2920,300],[3200,330],[3600,340]],
    prof:[[.13,.42,.08],[.42,.6,0],[.6,.82,-.07],[.82,1,0]],hill:.32,hillMax:55,waterLvl:-20,
    water:[[[2440,0],[3300,0],[3300,250],[3050,262],[2860,250],[2700,215],[2560,150]]],
    ground:['#8ea64e','#7d9443','#a3b45c'],trees:520,cars:16,vmax:54,types:['truck',null,'moto',null,'pickup',null,'bus',null,'moto',null,'pickup',null,'truck',null,null,'suv'],
    under(x,W,CL,fi){x.fillStyle='rgba(214,190,110,.35)';x.fillRect(0,1450,W.w,W.h-1450);// llanura seca de Cañas
      x.strokeStyle='#8a6a3a';x.lineWidth=1;for(let k=0;k<14;k++){const y0=1500+k*48;x.beginPath();x.moveTo(0,y0);x.lineTo(700,y0-60);x.stroke()}},
    extra(x,W,CL,fi){const q=CL[fi(.5)];ptext(x,'TILARAN',q[0]-14|0,q[1]-40|0,'#fff')},
    decor(W,CL,fi,R){const B=b=>{W.obst.push(b);W.blds.push(b);return b};
      // parque eólico en la fila de cerros
      W.turbines=[];for(let k=0;k<40&&W.turbines.length<22;k++){const i=fi(.3+R()*.3),q=CL[i],sd=R()<.5?-1:1,d=60+R()*170,o=offLine(CL,sd*d)[i];if(pavedW(W,o[0],o[1]))continue;if(W.turbines.some(t=>Math.hypot(t.x-o[0],t.y-o[1])<60))continue;W.turbines.push({x:o[0],y:o[1],h:48+R()*14,sp:1.2+R()*.6,ph:R()*6});W.obst.push({x:o[0]-2,y:o[1]-2,w:4,h:4,type:'bld'})}
      // pueblo de Tilarán: iglesia, parque y casas
      const it=fi(.52),c0=CL[it],side=offLine(CL,46);B({x:side[it][0]-22|0,y:side[it][1]-14|0,w:44,h:28,type:'bld',col:'#f4f1de',roof:'#8d99ae',label:'IGLESIA'});
      const pk=offLine(CL,-52)[it];(W.parks=W.parks||[]).push({x:pk[0]-30,y:pk[1]-22,w:60,h:44});W.fountains=[{x:pk[0],y:pk[1]}];
      for(let i=fi(.45);i<fi(.6);i+=4)for(const sd of[-1,1]){const o=offLine(CL,sd*(34+R()*14))[i];const b={x:o[0]-8|0,y:o[1]-7|0,w:16,h:14,type:'bld',house:true,col:pick(['#f4a261','#e9c46a','#a8dadc','#ffadad','#caffbf','#bdb2ff']),roof:pick(['#bc4749','#9c6644','#b5533c'])};
        if([[b.x,b.y],[b.x+b.w,b.y+b.h],[b.x+b.w/2,b.y+b.h/2]].some(([x,y])=>pavedW(W,x,y)))continue;if(W.blds.some(q=>b.x<q.x+q.w+3&&b.x+b.w+3>q.x&&b.y<q.y+q.h+3&&b.y+b.h+3>q.y))continue;B(b)}
      W.zones.push({x:c0[0]-260,y:c0[1]-160,w:520,h:320,limit:40,name:'TILARÁN'});
      // ganado en los potreros de la llanura y una vaca que cruza la carretera
      W.cows=[];for(let i=0;i<26;i++){const x=150+R()*1100,y=1520+R()*600;if(pavedW(W,x,y)||pavedW(W,x+12,y)||pavedW(W,x-12,y))continue;W.cows.push({x,y,ox:x,oy:y,h:R()*6.28,t:R()*9})}
      {const i=fi(.09),a=offLine(CL,-40)[i],b=offLine(CL,40)[i];W.ccow={x0:a[0],y0:a[1],x1:b[0],y1:b[1],x:a[0],y:a[1],h:Math.atan2(b[1]-a[1],b[0]-a[0]),T:22,ph:6}}
      W.gust=[fi(.3),fi(.62)];
      W.labels.push({x:60,y:1800,t:'CANAS',col:'#fff'},{x:1150,y:560,t:'PARQUE EOLICO',col:'#fff'},{x:2900,y:120,t:'LAGUNA DE ARENAL',col:'#e0f2ff'},{x:1200,y:1900,t:'RUTA 142',col:'#fff'});
      W.signs.push({x:offLine(CL,24)[fi(.29)][0],y:offLine(CL,24)[fi(.29)][1],t:'VIENTO CRUZADO'},{x:offLine(CL,24)[fi(.6)][0],y:offLine(CL,24)[fi(.6)][1],t:'MARCHA BAJA'},{x:offLine(CL,24)[fi(.07)][0],y:offLine(CL,24)[fi(.07)][1],t:'CRUCE GANADO'})},
    tasks:[{at:.13,txt:'TILARÁN: salga de Cañas por la Ruta 142. Cinturón [C]. Atento: puede cruzar GANADO en la carretera.'},
      {at:.36,txt:'SUBIDA CON CURVAS: máximo 40 km/h en las curvas y no invada el carril contrario (doble raya amarilla).'},
      {at:.48,txt:'PARQUE EÓLICO: hay VIENTO CRUZADO fuerte. Sujete el volante y baje la velocidad.'},
      {at:.6,txt:'Pase por el centro de TILARÁN: zona urbana de 40 km/h, cuidado con peatones.'},
      {at:.82,txt:'BAJADA DEL 7% hacia la LAGUNA DE ARENAL: use MARCHA BAJA [G] y luces si hay neblina.',start(){S.lowT=0;S.dnT=0},check(){const P=S.P;if(P.slope&&P.slAl>.5&&P.v>3){S.dnT+=S.dt;if(P.low)S.lowT+=S.dt}if(S.ci>=S.W.fi(.82)&&!this.chk){this.chk=1;if(S.dnT>4&&S.lowT<S.dnT*.5)fault('baja','No usó marcha baja en la bajada','III',99)}}},
      {at:.92,txt:'Llegue a la orilla de la LAGUNA DE ARENAL. ¡Disfrute la vista de los molinos!'}]}};
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
