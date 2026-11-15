'use strict';
// ===================== RENDER DEL FONDO =====================
// Las vallas de Pulzar no pueden quedar sobre la calle ni la acera: se corren al lugar libre más cercano (y su obstáculo con ellas)
function fitBoards(W){if(!W.billboards||W.boardsFit)return;W.boardsFit=true;const ov=(a,b,m)=>a.x<b.x+b.w+m&&a.x+a.w+m>b.x&&a.y<b.y+b.h+m&&a.y+a.h+m>b.y;
  const free=r=>{for(let x=r.x-3;x<=r.x+r.w+3;x+=2)for(let y=r.y-3;y<=r.y+r.h+3;y+=2)if(pavedW(W,x,y))return false;return!W.blds.some(o=>ov(r,o,2))};
  for(const b of W.billboards){if(free(b))continue;const ob=W.obst.find(o=>o.type==='valla'&&o.x===b.x&&o.y===b.y);let best=null;
    for(let d=2;d<=60&&!best;d+=2)for(const[dx,dy]of[[0,d],[0,-d],[d,0],[-d,0],[d,d],[-d,d],[d,-d],[-d,-d]]){const r={x:b.x+dx,y:b.y+dy,w:b.w,h:b.h};if(free(r)){best=[dx,dy];break}}
    if(best){b.x+=best[0];b.y+=best[1];b.cx+=best[0];b.cy+=best[1];if(ob){ob.x=b.x;ob.y=b.y}}}}
function renderBG(W){fitBoards(W);
  const c=document.createElement('canvas');c.width=W.w;c.height=W.h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;
  const R=rng(W.kind==='city'?7:3);const px=(X,Y,col)=>{x.fillStyle=col;x.fillRect(X,Y,1,1)};
  const GR=W.grass||['#3f8f3f','#357d35','#4ea24a'];x.fillStyle=GR[0];x.fillRect(0,0,W.w,W.h);
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)],G0=hx(GR[0]),G1=hx(GR[1]),G2=hx(GR[2]);
  {const dk=shade(GR[0],-.22),lt=shade(GR[0],.18);for(let i=0;i<W.w*W.h/420;i++){const X=R()*W.w|0,Y=R()*W.h|0;x.fillStyle=dk;x.fillRect(X,Y+1,1,1);x.fillRect(X+2,Y+1,1,1);x.fillRect(X+1,Y,1,2);x.fillStyle=lt;x.fillRect(X+1,Y-1,1,1)}
    for(let i=0;i<W.w*W.h/2600;i++){x.fillStyle=pick(['#fff6e0','#ffd23f','#ff9fc4','#c7a5ff']);x.fillRect(R()*W.w|0,R()*W.h|0,1,1)}}
  if(W.drawUnder)W.drawUnder(x);
  for(const rl of W.rails){x.fillStyle='#7d6b58';if(rl.o==='v')x.fillRect(rl.pos-7,0,14,W.h);else x.fillRect(0,rl.pos-7,W.w,14)}
  for(const s of W.sidewalks){x.fillStyle='#a3a39b';x.fillRect(s.x,s.y,s.w,s.h);x.fillStyle='#c9c9bf';x.fillRect(s.x,s.y,s.w,1);x.fillRect(s.x,s.y,1,s.h);x.fillStyle='#7c7c74';x.fillRect(s.x,s.y+s.h-1,s.w,1);x.fillRect(s.x+s.w-1,s.y,1,s.h)}
  if(W.parks)for(const p of W.parks){x.fillStyle='#4a9b48';x.fillRect(p.x,p.y,p.w,p.h)}
  {x.save();x.lineJoin='round';x.lineCap='round';for(const[w,a]of[[5,.09],[2.5,.12]]){x.strokeStyle=`rgba(10,20,10,${a})`;x.fillStyle=x.strokeStyle;
      for(const p of W.paths){if(p.hidden)continue;x.lineWidth=2*(p.hw||HW)+2*w;x.beginPath();x.moveTo(p.pts[0][0],p.pts[0][1]);for(const q of p.pts.slice(1))x.lineTo(q[0],q[1]);x.stroke()}
      for(const r of W.roads){const q=r.rect;x.fillRect(q.x-w,q.y-w,q.w+2*w,q.h+2*w)}
      if(W.planes)for(const q of W.planes){x.lineWidth=2*w;x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const v of q)x.lineTo(v[0],v[1]);x.closePath();x.stroke()}
      for(const Rd of W.rounds)fillCirc(x,Rd.x,Rd.y,Rd.R+w,x.fillStyle)}x.restore()}
  if(W.planes)W._planes=true;if(W.paths.length){x.lineJoin='round';x.lineCap=W.kind==='custom'?'butt':'round';const sa=(w,col)=>{x.strokeStyle=col;for(const p of W.paths){if(p.hidden)continue;x.lineWidth=w+2*((p.hw||HW)-HW);x.beginPath();x.moveTo(p.pts[0][0],p.pts[0][1]);for(const q of p.pts.slice(1))x.lineTo(q[0],q[1]);x.stroke()}};sa(2*HW,'#ecece4');sa(2*HW-3,'#3a3a43');x.lineCap='butt'}
  if(W.planes)for(const q of W.planes){x.fillStyle='#3a3a43';x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const r of q)x.lineTo(r[0],r[1]);x.closePath();x.fill()}
  if(W.cafe)for(const q of W.cafe){x.fillStyle='#6b4f2a';x.fillRect(q.x,q.y,q.w,q.h);for(let yy=q.y+3;yy<q.y+q.h-2;yy+=6)for(let xx=q.x+2;xx<q.x+q.w-2;xx+=3){x.fillStyle=(xx+yy)%9?'#2f6b2a':'#3d8a36';x.fillRect(xx,yy,3,3)}}
  if(W.fields)for(const q of W.fields){x.fillStyle='#4cae4c';x.fillRect(q.x,q.y,q.w,q.h);for(let k=0;k<q.w;k+=14){x.fillStyle='#45a145';x.fillRect(q.x+k,q.y,7,q.h)}x.strokeStyle='#fff';x.lineWidth=1;x.strokeRect(q.x+3.5,q.y+3.5,q.w-7,q.h-7);x.fillStyle='#fff';x.fillRect(q.x+q.w/2,q.y+4,1,q.h-8);ringPx(x,q.x+q.w/2,q.y+q.h/2,10,'#fff');x.strokeRect(q.x+3.5,q.y+q.h/2-14.5,16,29);x.strokeRect(q.x+q.w-19.5,q.y+q.h/2-14.5,16,29);x.fillStyle='#ddd';x.fillRect(q.x+1,q.y+q.h/2-5,3,10);x.fillRect(q.x+q.w-4,q.y+q.h/2-5,3,10)}
  if(W.plazas)for(const q of W.plazas){x.fillStyle='#d8cfbd';x.fillRect(q.x,q.y,q.w,q.h);x.fillStyle='#c4b9a3';for(let yy=q.y;yy<q.y+q.h;yy+=4)for(let xx=q.x+((yy-q.y)/4%2?2:0);xx<q.x+q.w;xx+=4)x.fillRect(xx,yy,1,1)}
  if(W.fountains)for(const f of W.fountains){fillCirc(x,f.x,f.y,6,'#9aa5b1');fillCirc(x,f.x,f.y,4,'#4dc3ff');fillCirc(x,f.x-1,f.y-1,1,'#e0f7ff')}
  for(const p of W.paved){x.fillStyle=W.kind==='sanjose'?'#3a3a43':'#45454f';x.fillRect(p.x,p.y,p.w,p.h)}
  for(const o of W.opaved){x.save();x.translate(o.cx,o.cy);x.rotate(o.ang);x.fillStyle='#45454f';x.fillRect(-o.hl,-o.hw,2*o.hl,2*o.hw);x.restore()}
  x.fillStyle='#3a3a43';for(const r of W.roads){const q=r.rect;x.fillRect(q.x,q.y,q.w,q.h)}
  x.fillStyle='#2e2e36';for(const r of W.roads){const q=r.rect;if(r.o==='h'){x.fillRect(q.x,q.y+1,q.w,1);x.fillRect(q.x,q.y+q.h-2,q.w,1)}else{x.fillRect(q.x+1,q.y,1,q.h);x.fillRect(q.x+q.w-2,q.y,1,q.h)}}
  for(const Rd of W.rounds)fillCirc(x,Rd.x,Rd.y,Rd.R,'#3a3a43');
  {const id=x.getImageData(0,0,W.w,W.h),d=id.data;let sd=(W.kind==='city'?7:3)*2654435761>>>0;const rnd=()=>{sd^=sd<<13;sd^=sd>>>17;sd^=sd<<5;return(sd>>>0)/4294967296};let run=0,rc=null;
    // ruido suave en dos tamaños (celdas de 40 y 9 px), interpolado
    // solo en gráficos 32-bit (en teléfono va 16-bit y carga más rápido). El navegador agranda una imagen chica de ruido con suavizado (rápido): canal rojo = manchas grandes, verde = medianas
    const NZ=GFX!==32?null:(()=>{const mk=c=>{const gw=Math.ceil(W.w/c)+1,gh=Math.ceil(W.h/c)+1,cv=document.createElement('canvas');cv.width=gw;cv.height=gh;const g=cv.getContext('2d'),im=g.createImageData(gw,gh);for(let k=0;k<im.data.length;k+=4){im.data[k]=im.data[k+1]=im.data[k+2]=rnd()*255;im.data[k+3]=255}g.putImageData(im,0,0);return cv};
      const big=document.createElement('canvas');big.width=W.w;big.height=W.h;const g=big.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(mk(40),0,0,Math.ceil(W.w/40)*40+40,Math.ceil(W.h/40)*40+40);const A=g.getImageData(0,0,W.w,W.h).data;g.clearRect(0,0,W.w,W.h);g.drawImage(mk(9),0,0,Math.ceil(W.w/9)*9+9,Math.ceil(W.h/9)*9+9);const B=g.getImageData(0,0,W.w,W.h).data;return{A,B}})();
    const key=(r,g,b)=>(r<<16)|(g<<8)|b,ASF=new Set([key(58,58,67),key(69,69,79),key(46,46,54)]),GRS=new Set([G0,G1,G2,[79,138,60],[90,152,68],[68,122,52],[76,154,69],[74,155,72],[63,143,63],[53,125,53],[78,162,74]].map(c=>key(c[0],c[1],c[2])));
    const ww=W.w;
    for(let i=0;i<d.length;i+=4){const k=key(d[i],d[i+1],d[i+2]);
      if(NZ&&ASF.has(k)){const n=NZ.A[i]*.0392+NZ.B[i]*.0235-8,u=rnd();const sp=u<.03?16:u<.05?-10:0;d[i]+=n+sp;d[i+1]+=n+sp;d[i+2]+=n+sp+1}
      else if(NZ&&GRS.has(k)){const a=NZ.A[i]/255,b=NZ.B[i]/255,n=(a-.5)*26+(b-.5)*14,dry=a>.68?(a-.68)*90:0;d[i]+=n+dry;d[i+1]+=n+dry*.45;d[i+2]+=n*.6-dry*.3}if(d[i]===G0[0]&&d[i+1]===G0[1]&&d[i+2]===G0[2]){if(run>0){d[i]=rc[0];d[i+1]=rc[1];d[i+2]=rc[2];run--}else if(rnd()<.034){rc=rnd()<.5?G1:G2;d[i]=rc[0];d[i+1]=rc[1];d[i+2]=rc[2];run=rnd()*2|0}}else run=0;const n=(rnd()*12-6)|0;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(id,0,0)}
  {const R2=rng(91);x.save();x.lineCap='round';x.lineJoin='round';
    for(const p of W.paths){if(p.hidden||p.pts.length<2)continue;const hw=p.hw||HW,lanes=p.oneway?(hw>9?[0]:[0]):[-hw/2,hw/2];
      for(const lc of lanes)for(const t of[-2.6,2.6]){const q=offLine(p.pts,lc+t);x.strokeStyle='rgba(18,18,24,.16)';x.lineWidth=1.6;x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const v of q)x.lineTo(v[0],v[1]);x.stroke()}}
    for(const r of W.roads){const q=r.rect;x.fillStyle='rgba(18,18,24,.14)';if(r.o==='h'){for(const o of[-HW/2-2.6,-HW/2+2.6,HW/2-2.6,HW/2+2.6])x.fillRect(q.x,r.c+o-.8,q.w,1.6)}else{for(const o of[-HW/2-2.6,-HW/2+2.6,HW/2-2.6,HW/2+2.6])x.fillRect(r.c+o-.8,q.y,1.6,q.h)}}
    const onA=(X,Y)=>{const v=x.getImageData(X|0,Y|0,1,1).data;return v[0]<80&&Math.abs(v[0]-v[2])<16&&v[1]<80};
    const nC=Math.min(400,W.w*W.h/9000|0);for(let k=0;k<nC;k++){let X=R2()*W.w,Y=R2()*W.h;if(!pavedW(W,X,Y)||!onA(X,Y))continue;
      if(R2()<.35){const w=6+R2()*10,h=4+R2()*7;x.fillStyle=R2()<.5?'rgba(20,20,26,.22)':'rgba(120,120,128,.10)';x.fillRect(X|0,Y|0,w|0,h|0);continue}
      x.strokeStyle='rgba(16,16,20,.45)';x.lineWidth=1;x.beginPath();x.moveTo(X,Y);let a=R2()*6.28;for(let s=0;s<5+R2()*6;s++){a+=(R2()-.5)*1.4;X+=Math.cos(a)*2.2;Y+=Math.sin(a)*2.2;x.lineTo(X,Y)}x.stroke()}
    x.restore()}
  const WH='#ecece4',YE='#f2c230';
  const nearRound=(X,Y,m)=>W.rounds.some(o=>Math.hypot(X-o.x,Y-o.y)<o.R+m);
  for(const r of W.roads){const RN=W.nodes.filter(n=>(r.o==='h'?n.y:n.x)===r.c).map(n=>r.o==='h'?n.x:n.y),RL=W.rails.filter(l=>l.o!==r.o).map(l=>l.pos),RR=W.rounds.filter(o=>(r.o==='h'?Math.abs(o.y-r.c):Math.abs(o.x-r.c))<o.R+HW+4);
    for(let t=r.a;t<r.b;t++){
      const out1=r.o==='h'?[t,r.c-HW-2]:[r.c-HW-2,t],out2=r.o==='h'?[t,r.c+HW+1]:[r.c+HW+1,t];
      const e1=r.o==='h'?[t,r.c-HW+1]:[r.c-HW+1,t],e2=r.o==='h'?[t,r.c+HW-2]:[r.c+HW-2,t];
      const cpt=r.o==='h'?[t,r.c]:[r.c,t];
      if(RR.length&&RR.some(o=>Math.hypot(cpt[0]-o.x,cpt[1]-o.y)<o.R+3))continue;
      const j1=pavedW(W,...out1),j2=pavedW(W,...out2);
      if(!j1)px(e1[0],e1[1],WH);if(!j2)px(e2[0],e2[1],WH);
      const nearRail=RL.some(q=>Math.abs(t-q)<10);
      const nearNode=RN.some(q=>Math.abs(q-t)<24);
      if(!j1&&!j2&&!nearRail&&((t%10)<5||(nearNode&&!r.ow))){x.fillStyle=r.ow?WH:YE;if(r.o==='h')x.fillRect(t,r.c-1,1,2);else x.fillRect(r.c-1,t,2,1)}
    }}
  if(W.paths.length){x.setLineDash([5,5]);x.strokeStyle=YE;x.lineWidth=1.5;for(const p of W.paths){if(p.noCenter)continue;x.beginPath();x.moveTo(p.pts[0][0],p.pts[0][1]);for(const q of p.pts.slice(1))x.lineTo(q[0],q[1]);x.stroke()}x.setLineDash([])}
  for(const o of W.oslots){x.save();x.translate(o.cx,o.cy);x.rotate(o.ang);x.fillStyle=WH;x.fillRect(-o.hl,-o.hw,2*o.hl,1);x.fillRect(-o.hl,o.hw-1,2*o.hl,1);if(o.target){x.fillStyle=YE;x.fillRect(o.hl-2,-o.hw,2,2*o.hw)}x.restore()}
  for(const f of W.fences){const L=Math.hypot(f[2]-f[0],f[3]-f[1]);for(let k=0;k<=L;k++){const X=Math.round(f[0]+(f[2]-f[0])*k/L),Y=Math.round(f[1]+(f[3]-f[1])*k/L);px(X,Y,k%6===0?'#5c677d':'#aab4be')}}
  for(const Rd of W.rounds){ringPx(x,Rd.x,Rd.y,Rd.R-2,WH);ringPx(x,Rd.x,Rd.y,(Rd.R+Rd.r)/2+1,WH,3);
    fillCirc(x,Rd.x,Rd.y,Rd.r,'#4c9a45');ringPx(x,Rd.x,Rd.y,Rd.r,'#d62828',3,'#f4f4f4');ringPx(x,Rd.x,Rd.y,Rd.r-1,'#d62828',3,'#f4f4f4');
    if(Rd.r>=18){fillCirc(x,Rd.x,Rd.y,7,'#2e6b2c');fillCirc(x,Rd.x-2,Rd.y-2,3,'#5fb85a');for(let i=0;i<8;i++){const a=i/8*6.28;px(Math.round(Rd.x+Math.cos(a)*13),Math.round(Rd.y+Math.sin(a)*13),['#ff5d8f','#ffd23f'][i%2])}}}
  if(W.slopes)for(const q of W.slopes){if(q.seg)continue;for(let yy=q.y;yy<q.y+q.h;yy+=5){x.fillStyle=`rgba(0,0,0,${.05+.12*(yy-q.y)/q.h})`;x.fillRect(q.x,yy,q.w,2)}
    for(let yy=q.y+20;yy<q.y+q.h-10;yy+=40){x.fillStyle='#ffd23f';for(let k=0;k<4;k++){x.fillRect(q.x+q.w/2-4+k,yy+k,1,1);x.fillRect(q.x+q.w/2+3-k,yy+k,1,1)}}
    for(const sd of[-1,1])for(let yy=q.y;yy<q.y+q.h;yy+=3)for(let k=1;k<26;k+=5){const X=sd<0?q.x-k:q.x+q.w+k;if(!pavedW(W,X,yy))px(X,yy,(yy+k)%2?'#2f6b2a':'#356f30')}}
  if(W.signs)for(const s of W.signs){x.fillStyle='#777';x.fillRect(s.x,s.y,1,4);x.fillStyle='#000';for(let k=0;k<4;k++)x.fillRect(s.x-k,s.y-4-3+k,2*k+1,1);for(let k=0;k<3;k++)x.fillRect(s.x-2+k,s.y-4+k,5-2*k,1);x.fillStyle='#ffd23f';for(let k=1;k<3;k++)x.fillRect(s.x-k+1,s.y-7+k,2*k-1,1);x.fillRect(s.x-1,s.y-4,3,1);x.fillRect(s.x,s.y-3,1,1)}
  if(W.billboards)for(const b of W.billboards){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(b.x+3,b.y+3,b.w,b.h);x.fillStyle='#fafafa';x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle='#888';if(b.o==='h'){x.fillRect(b.x+4,b.y+b.h,1,3);x.fillRect(b.x+b.w-5,b.y+b.h,1,3)}else{x.fillRect(b.x+b.w,b.y+4,3,1);x.fillRect(b.x+b.w,b.y+b.h-5,3,1)}}
  if(W.holes)for(const h of W.holes){fillCirc(x,h.x,h.y,4,'#2a2a30');fillCirc(x,h.x-.5,h.y-.5,3,'#17171c');x.fillStyle='#55555e';x.fillRect(h.x-3,h.y+3,5,1)}
  for(const s of W.stops.concat(W.yields)){
    const len=s.b-s.a;const isY=s.kind==='yield';
    const lw=isY?1:s.kind==='stop'?3:2;if(s.dir==='E'||s.dir==='W'){const X=s.dir==='E'?s.pos-lw:s.pos;for(let k=0;k<len;k++)if(!isY||(k%3)<2){x.fillStyle=WH;x.fillRect(X,s.a+k,lw,1)}}
    else{const Y=s.dir==='S'?s.pos-lw:s.pos;for(let k=0;k<len;k++)if(!isY||(k%3)<2){x.fillStyle=WH;x.fillRect(s.a+k,Y,1,lw)}}
    const word=s.kind==='yield'?'CEDA':s.kind==='light'?null:'ALTO';
    if(word){if(s.dir==='E')ptext(x,word,s.pos-12,s.a,WH,1);if(s.dir==='W')ptext(x,word,s.pos+7,s.a,WH,3);if(s.dir==='S')ptext(x,word,s.a,s.pos-12,WH,2);if(s.dir==='N')ptext(x,word,s.a,s.pos+7,WH,0)}
    if(s.kind==='stop'||s.kind==='yield'){const p=polePos(s);
      if(s.kind==='stop'){fillCirc(x,p[0]+1,p[1]+1,4.5,'rgba(0,0,0,.35)');fillCirc(x,p[0],p[1],4.5,'#fff');fillCirc(x,p[0],p[1],3.6,'#c1121f');x.fillStyle='#fff';x.fillRect(p[0]-3,p[1]-.5,6,1.5)}
      else{x.fillStyle='#c1121f';for(let k=0;k<5;k++)x.fillRect(p[0]-3+k*.5|0,p[1]-2+k,7-k,1);x.fillStyle='#fff';x.fillRect(p[0]-1,p[1]-1,3,1);x.fillRect(p[0],p[1],1,1)}}
  }
  for(const z of W.zebras){x.fillStyle=WH;if(z.o==='h'){for(let y=z.rect.y+2;y<z.rect.y+z.rect.h-2;y+=3)x.fillRect(z.rect.x,y,z.rect.w,2)}else{for(let X=z.rect.x+2;X<z.rect.x+z.rect.w-2;X+=3)x.fillRect(X,z.rect.y,2,z.rect.h)}}
  for(const s of W.slots){x.fillStyle=WH;x.fillRect(s.x,s.y,1,s.h);x.fillRect(s.x+s.w,s.y,1,s.h);x.fillRect(s.x,s.y+s.h-1,s.w+1,1)}
  for(const zn of W.zones){if(zn.noText)continue;const L=String(zn.limit);
    if(zn.w>zn.h){for(let xx=zn.x+60;xx<zn.x+zn.w-30;xx+=(zn.name==='ESCUELA'?999:240)){ptext(x,zn.name,xx-30,zn.y+2,YE);ptext(x,L,xx+8,zn.y+zn.h-7,YE)}}
    else{for(let yy=zn.y+60;yy<zn.y+zn.h-30;yy+=220){ptext(x,zn.name,zn.x+zn.w-7,yy-30,YE,1);ptext(x,L,zn.x+2,yy+8,YE,1)}}}
  if(W.kind==='plantel'){
    x.fillStyle=WH;x.fillRect(92,54,32,1);x.fillRect(92,67,32,1);x.fillRect(92,54,1,14);ptext(x,'INICIO',96,56,WH);ptext(x,'FIN',103,61,YE);
    x.fillStyle=YE;x.fillRect(114,346,18,2);ptext(x,'RETRO',113,400,WH,2);
    x.fillStyle=WH;x.fillRect(69,312,1,28);x.fillRect(55,312,14,1);x.fillRect(55,339,14,1);ptext(x,'P',61,323,WH);
    ptext(x,'PARQUEO',398,92,WH);
    for(let i=0;i<W.w;i+=3){px(i,1,'#bbb');px(i,W.h-2,'#bbb')}for(let i=0;i<W.h;i+=3){px(1,i,'#bbb');px(W.w-2,i,'#bbb')}
  }else if(W.kind==='city'){ptext(x,'PARQUEO PUBLICO',851,518,WH)}
  else if(W.kind==='sanjose'){const K=SJK;
    {const[a,b,e,f]=W.canopy,ca=Math.atan2(f-b,e-a),cl=Math.hypot(e-a,f-b);x.save();x.translate(a,b);x.rotate(ca);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(-3,-5,cl+6,14);x.fillStyle='#ececec';x.fillRect(-6,-8,cl+12,16);x.fillStyle='#1f3f8f';x.fillRect(24,-7,cl-22,14);x.fillStyle='#5b80d4';for(let i=24;i<cl+2;i+=5)x.fillRect(i,-7,1,14);for(let j=-7;j<7;j+=4)x.fillRect(24,j,cl-22,1);x.restore()}
    const uy=X=>(104-.2*(X/K-115))*K;x.fillStyle='rgba(42,90,200,.42)';x.beginPath();x.moveTo(150*K,uy(150*K)-8);x.lineTo(330*K,uy(330*K)-8);x.lineTo(330*K,uy(330*K)+8);x.lineTo(150*K,uy(150*K)+8);x.fill();ptext(x,'FILA DE CARROS 40M',190*K,uy(240*K)-3,'#bfe0ff');
    const x0=432,x1=467;x.fillStyle=WH;x.fillRect(x0,69,1,276);x.fillRect(x1,69,1,290);for(let y=SJP.cor.top+4;y<372;y+=10)x.fillRect(450,y,1,5);
    for(let y0=72;y0<360;y0+=8)for(let k=0;k<12;k++)px(Math.round(x1+2+k),Math.round(y0+k*.6),WH);
    x.fillStyle=YE;x.fillRect(SJP.cor.x-8,SJP.cor.end,17,2);ptext(x,'RETRO',SJP.cor.x-3,SJP.cor.end-36,WH,2);
    for(const s of W.hslots){x.fillStyle=WH;x.fillRect(s.x,s.y,s.w,1);x.fillRect(s.x,s.y+s.h,s.w,1);x.fillRect(s.x+s.w-1,s.y,1,s.h);if(s.target){x.fillStyle=YE;x.fillRect(s.x+s.w-3,s.y+1,2,s.h-1);x.fillRect(s.x,s.y+1,s.w,1);x.fillRect(s.x,s.y+s.h-1,s.w,1)}}
    {const L=W.lim;x.fillStyle='#7a766c';x.beginPath();x.moveTo(L[0][0],L[0][1]);for(const q of L)x.lineTo(q[0],q[1]);x.lineTo(L[L.length-1][0],W.h);x.lineTo(0,W.h);x.fill();x.fillStyle='#8a867b';for(let i=0;i<300;i++){const X=(i*53)%300,Y=W.h-((i*37)%140);if(Y>L[0][1]+X*.3)x.fillRect(X,Y,2,1)}
     for(const f of W.fences){const FL=Math.hypot(f[2]-f[0],f[3]-f[1]);for(let k=0;k<=FL;k++)px(Math.round(f[0]+(f[2]-f[0])*k/FL),Math.round(f[1]+(f[3]-f[1])*k/FL),k%6===0?'#5c677d':'#cfd6dd')}ptext(x,'LIMITE DEL PLANTEL',40,325,'#e6e6e6')}
    ptext(x,'PARQUEO',60,80,WH,1);ptext(x,'ZIGZAG',300,140,WH)}
  for(const rl of W.rails){const L=rl.o==='v'?W.h:W.w;
    for(let t=0;t<L;t+=4){const X=rl.o==='v'?rl.pos:t,Y=rl.o==='v'?t:rl.pos;if(!pavedW(W,X,Y)){x.fillStyle='#4a3626';if(rl.o==='v')x.fillRect(rl.pos-6,t,12,2);else x.fillRect(t,rl.pos-6,2,12)}}
    x.fillStyle='#c9c9d4';if(rl.o==='v'){x.fillRect(rl.pos-4,0,1,W.h);x.fillRect(rl.pos+3,0,1,W.h)}else{x.fillRect(0,rl.pos-4,W.w,1);x.fillRect(0,rl.pos+3,W.w,1)}
    for(const s of W.stops)if(s.kind==='rail'&&s.light===rl){const p=polePos(s);x.fillStyle='#fff';for(let k=-2;k<=2;k++){x.fillRect(p[0]+k,p[1]+k,1,1);x.fillRect(p[0]+k,p[1]-k,1,1)}}
  }
  for(const r of W.roads)if(r.ow)for(let t=r.a+70;t<r.b-40;t+=150){if(W.nodes.some(n=>Math.abs((r.o==='h'?n.x:n.y)-t)<40&&(r.o==='h'?n.y:n.x)===r.c))continue;
    for(const off of[-7,7]){const[ax,ay]=r.o==='h'?[t,r.c+off]:[r.c+off,t];arrowPx(x,ax,ay,r.o==='h'?r.ow:0,r.o==='v'?r.ow:0,WH)}}
  if(W.drawExtra)W.drawExtra(x);evDraw2D(x,W);
  if(W.gravelP){x.lineJoin='round';x.lineCap='round';for(const[w,col]of[[25,'#7a5c3a'],[21,'#a8875a']]){x.strokeStyle=col;x.lineWidth=w;for(const pa of W.gravelP){x.beginPath();x.moveTo(pa.pts[0][0],pa.pts[0][1]);for(const q of pa.pts)x.lineTo(q[0],q[1]);x.stroke()}}
    const RG=rng(9);for(const pa of W.gravelP)for(const q of pa.pts)for(let k=0;k<6;k++){x.fillStyle=RG()<.5?'#8d6e45':'#c2a477';x.fillRect(q[0]+(RG()-.5)*18|0,q[1]+(RG()-.5)*18|0,1,1)}
    x.strokeStyle='rgba(90,70,45,.5)';x.lineWidth=2;for(const d of[-5,5])for(const pa of W.gravelP){const o=offLine(pa.pts,d);x.beginPath();x.moveTo(o[0][0],o[0][1]);for(const q of o)x.lineTo(q[0],q[1]);x.stroke()}x.lineCap='butt'}
  if(W.labels)for(const l of W.labels)ptext(x,l.t,Math.round(l.x),Math.round(l.y),l.col||'#f2f2f2',l.rot||0);
  for(const b of W.blds){if(b.parts){b.ht=b.H;parts2D(x,b);continue}if(b.H){b.ht=b.H;bld2D(x,b);continue}
    b.ht=b.tower?96:b.booth?7:b.pillar?8:b.house?9:b.pulzar?16:b.label==='GRADERIAS'?6:12+((b.x*7+b.y*13)%22);
    if(b.tower){x.fillStyle='rgba(0,0,0,.4)';for(let k=1;k<=12;k++)x.fillRect(b.x+k,b.y+k,b.w,b.h);x.fillStyle=b.col;x.fillRect(b.x,b.y,b.w,b.h);
      for(let k=0;k<b.h-4;k+=4){x.fillStyle=k%8?'#1f4f8a':'#2a6bb5';x.fillRect(b.x+2,b.y+2+k,b.w-4,3)}x.fillStyle='#7fd3ff';x.fillRect(b.x+2,b.y+2,b.w-4,1);x.fillRect(b.x+2,b.y+2,1,b.h-4);
      x.fillStyle='#0b1022';x.fillRect(b.x+8,b.y+20,b.w-16,24);fillCirc(x,b.x+b.w-11,b.y+11,6,'#2b2b38');ptext(x,'H',b.x+b.w-12,b.y+9,'#ffd23f');continue}x.fillStyle='rgba(0,0,0,.35)';x.fillRect(b.x+3,b.y+3,b.w,b.h);x.fillStyle=b.col;x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle=b.roof||shade(b.col,-.2);x.fillRect(b.x+2,b.y+2,b.w-4,b.h-4);
    x.fillStyle=shade(b.col,.3);x.fillRect(b.x,b.y,b.w,1);x.fillStyle=shade(b.col,-.4);x.fillRect(b.x,b.y+b.h-1,b.w,1);
    if(b.w>16&&b.h>16){x.fillStyle='#8a8a8a';x.fillRect(b.x+b.w-9,b.y+5,5,4);x.fillStyle='#5a5a5a';x.fillRect(b.x+b.w-8,b.y+6,3,2)}
    if(!b.pillar&&!b.booth&&!b.poste&&b.type!=='tree')facade16(x,b,b.house?'#bfe6ff':'#9fd3ff');
    if(b.label){const tw=b.label.length*4-1;ptext(x,b.label,b.x+(b.w-tw)/2|0,b.y+b.h/2-2|0,'#fff')}}
  if(W.palms)for(const p of W.palms){x.fillStyle='rgba(0,0,0,.3)';for(let k=0;k<6;k++){const a=p.r+k*1.047;x.fillRect(Math.round(p.x+5+Math.cos(a)*3),Math.round(p.y+5+Math.sin(a)*3),2,2)}
    for(let k=0;k<6;k++){const a=p.r+k*1.047;for(let d=1;d<=5;d++){x.fillStyle=d>3?'#2f9e44':'#237a35';x.fillRect(Math.round(p.x+Math.cos(a)*d),Math.round(p.y+Math.sin(a)*d),1,1)}}x.fillStyle='#8a6a3a';x.fillRect(p.x,p.y,1,1)}
  if(W.stalls)for(const s of W.stalls){fillCirc(x,s.x+2,s.y+2,3,'rgba(0,0,0,.3)');fillCirc(x,s.x,s.y,3,s.col);x.fillStyle='#fff';x.fillRect(s.x-3,s.y,7,1);x.fillRect(s.x,s.y-3,1,7);x.fillStyle=shade(s.col,-.35);x.fillRect(s.x,s.y,1,1)}
  for(const t of W.trees){const cs=TREECOL[(((t.x+t.y)|0)%4+4)%4],kd=(((t.x*7.3+t.y*3.1)|0)%5+5)%5;fillCirc(x,t.x+2,t.y+2,t.r+(kd===2?2:0),'rgba(0,0,0,.3)');fillCirc(x,t.x,t.y,t.r+1+(kd===2?2:0),'#143a1c');fillCirc(x,t.x,t.y,t.r+(kd===2?2:0),cs[0]);fillCirc(x,t.x-1,t.y-1,t.r-2,cs[1]);px(t.x-2,t.y-2,cs[2]);px(t.x+1,t.y-3,cs[2])}
  if(W.bushes)for(const b of W.bushes){fillCirc(x,b.x+1,b.y+1,b.r,'rgba(0,0,0,.25)');fillCirc(x,b.x,b.y,b.r,b.c);px(b.x-1,b.y-1,shade(b.c,.2))}
  for(const p of W.parked)drawCar(x,p.x,p.y,p.h,p.col,{},0,0,p.type);
  return c}
function slopeAt(W,x,y){if(!W.slopes)return null;for(const q of W.slopes){if(!q.seg){if(inR(x,y,q))return q;continue}const[ax,ay,bx,by]=q.seg,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1),ex=ax+dx*t-x,ey=ay+dy*t-y;if(ex*ex+ey*ey<q.hw*q.hw){if(q.dx==null){const l=Math.sqrt(l2);q.dx=dx/l;q.dy=dy/l}return q}}return null}
function polePos(s){if(s.dir==='E')return[s.pos-3,s.b+4];if(s.dir==='W')return[s.pos+3,s.a-4];if(s.dir==='S')return[s.a-4,s.pos-3];return[s.b+4,s.pos+3]}
