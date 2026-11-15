'use strict';
// ===================== RECORRIDOS OFICIALES DE LAS SEDES (DGEV) =====================
// Basados en los recorridos publicados por la Dirección General de Educación Vial (educacionvial.go.cr).
// Calles simplificadas (≈1,2 unidades por metro); puntos de referencia según la descripción oficial.
function buildOficial(D){HW=13;const W=newWorld('of_'+D.id,D.w,D.h);W.limit=D.limit||40;W.oficial=D;if(D.region)W.grass=REGION[D.region].g;W.labels=[];W.parks=[];W.plazas=[];
  const B=b=>{W.obst.push(b);W.blds.push(b);return b};
  for(const st of D.streets){const pts=st.p.length>2&&st.curve?smoothLine(st.p,10):st.p;const pa=addPath(W,pts);pa.hw=st.hw||13;if(st.oneway){pa.oneway=true;pa.noCenter=true}st.pts=pts}
  if(D.patio)W.paved.push({x:D.patio.x,y:D.patio.y,w:PH.w,h:PH.h,tag:'patio'});
  // puntos de referencia (edificios con nombre) y parques
  W.ponds=[];for(const L of D.lm||[]){if(L.park){W.parks.push({x:L.x,y:L.y,w:L.w,h:L.h});W.labels.push({x:L.x+3,y:L.y+3,t:L.t,col:'#fff'});continue}
    if(L.water){W.ponds.push(L);W.obst.push({x:L.x,y:L.y,w:L.w,h:L.h,type:'water'});W.labels.push({x:L.x+3,y:L.y+3,t:L.t,col:'#fff'});continue}
    B({x:L.x,y:L.y,w:L.w,h:L.h,type:'bld',col:L.col||'#e9e4d6',roof:L.roof||'#9aa2a9',label:L.t,H:L.H||14})}
  // casas a ambos lados de cada calle
  const R=rng(D.seed||5),ov=(a,b,m)=>a.x<b.x+b.w+m&&a.x+a.w+m>b.x&&a.y<b.y+b.h+m&&a.y+a.h+m>b.y;
  for(const st of D.streets){if(st.nohouse)continue;const pts=st.pts;let carry=8;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;
    let d=carry;for(;d<L;d+=(st.houseSp||D.houseSp||20)+R()*10){for(const sd of[-1,1]){const off=(st.hw||13)+13+R()*4,cx=a[0]+ux*d-uy*off*sd,cy=a[1]+uy*d+ux*off*sd,w=14+R()*8|0,h=14+R()*6|0;
      const b2={x:cx-w/2|0,y:cy-h/2|0,w,h,type:'bld',house:true,col:pick(D.houseCols||['#f4a261','#e9c46a','#a8dadc','#ffadad','#caffbf','#bdb2ff','#f1faee','#ffd6a5']),roof:pick(['#bc4749','#9c6644','#7f5539','#b5533c','#8d99ae'])};
      if([[b2.x,b2.y],[b2.x+w,b2.y],[b2.x,b2.y+h],[b2.x+w,b2.y+h],[cx,cy]].some(([x,y])=>pavedW(W,x,y)))continue;if(W.blds.some(o=>ov(b2,o,3))||W.parks.some(o=>ov(b2,o,2))||W.ponds.some(o=>ov(b2,o,3)))continue;if(b2.x<4||b2.y<4||b2.x+w>W.w-4||b2.y+h>W.h-4)continue;B(b2)}}carry=d-L}}
  // ALTO en las bocacalles indicadas
  W.pstops=(D.stops||[]).map(([x,y,ux,uy],i)=>({x,y,ux,uy,w:13,code:'altoOf'+i,txt:'No hizo ALTO total en la intersección',minV:99}));
  W.drawExtra=x=>{for(const s of W.pstops){const nx=-s.uy,ny=s.ux;x.fillStyle='#ecece4';for(let k=-12;k<=0;k+=.5)x.fillRect(Math.round(s.x+nx*k),Math.round(s.y+ny*k),2,2);ptext(x,'ALTO',Math.round(s.x-s.ux*9-8+nx*-6),Math.round(s.y-s.uy*9-2+ny*-6),'#ecece4')}
    for(const q of W.ponds){x.fillStyle='#4f6b4a';x.fillRect(q.x-2,q.y-2,q.w+4,q.h+4);x.fillStyle='#5d8aa8';x.fillRect(q.x,q.y,q.w,q.h);x.fillStyle='rgba(255,255,255,.25)';for(let k=6;k<q.h;k+=9)x.fillRect(q.x+4+(k*7)%12,q.y+k,10,1)}
    for(const r of D.rings||[]){x.fillStyle='#5a9a4a';x.beginPath();x.arc(r.x,r.y,r.r-12,0,7);x.fill();x.fillStyle='#ecece4';x.beginPath();x.arc(r.x,r.y,r.r-12,0,7);x.lineWidth=1.5;x.strokeStyle='#ecece4';x.stroke()}
    if(W.patioDraw)W.patioDraw(x);if(D.extra)D.extra(x,W)};
  for(const z of D.zones||[])W.zones.push(z);
  for(const l of D.labels||[])W.labels.push(l);
  if(D.slopes)W.slopes=D.slopes.map(q=>({...q}));
  for(const p of W.parks)addTrees(W,R,10,Object.assign({inside:true},p),3);addTrees(W,R,D.trees||160,{x:0,y:0,w:W.w,h:W.h},16);
  // tráfico en las calles principales (ida y vuelta)
  for(const st of D.streets)if(st.main){const pts=st.pts,loop=pts.concat(pts.slice(1,-1).reverse());spawnOnLoop(W,makePathLoop(loop,6.5),st.main,32,st.types)}
  W.sidewalks=[];W.walkers=[];for(const L of D.lm||[]){if(L.park)continue;const cand=[[[L.x,L.y+L.h+5],[L.x+L.w,L.y+L.h+5]],[[L.x,L.y-5],[L.x+L.w,L.y-5]],[[L.x-5,L.y],[L.x-5,L.y+L.h]],[[L.x+L.w+5,L.y],[L.x+L.w+5,L.y+L.h]]];const sg=cand.find(([a,b])=>[a,b,[(a[0]+b[0])/2,(a[1]+b[1])/2]].every(q=>!pavedW(W,q[0],q[1])&&!W.blds.some(o=>o!==L&&q[0]>o.x-2&&q[0]<o.x+o.w+2&&q[1]>o.y-2&&q[1]<o.y+o.h+2)));if(sg)for(let k=0;k<2;k++)W.walkers.push({r:{seg:sg},s:Math.random()*100,sp:3+Math.random()*3,an:0,x:0,y:0,col:pick(CARCOLS)})}
  if(D.patio)buildPatioHeredia(W,D.patio);
  if(D.yard){W.paved.push({x:200,y:120,w:330,h:170,tag:'yard'});for(let k=0;k<6;k++){const cx=270+k*40,cy=k%2?160:200;W.cones.push({x:cx,y:cy-14,vx:0,vy:0,hit:false},{x:cx,y:cy+14,vx:0,vy:0,hit:false})}}
  W.spawn=D.start;W.dests=[{n:D.n,x:D.start.x,y:D.start.y}];W.jay=null;return W}
function oficialStreet(D){const T=D.route.map(r=>({txt:r.t,tgt:{x:r.x,y:r.y},check(){return Math.hypot(S.P.x-r.x,S.P.y-r.y)<22}}));const E=D.route[D.route.length-1];
  T.push({txt:'Llegue frente a la Regional de Educación Vial y deténgase por completo para terminar.',tgt:{x:E.x,y:E.y},check(){return still('finOf',Math.hypot(S.P.x-E.x,S.P.y-E.y)<24,1)}});return T}
function oficialTasks(){const D=S.W.oficial,T=oficialStreet(D);if(D.patio){T[0].txt='EN CALLE: '+T[0].txt;return patioTasks().concat(T)}T[0].txt='RECORRIDO OFICIAL '+D.n+': póngase el cinturón [C]. '+T[0].txt;return T}
