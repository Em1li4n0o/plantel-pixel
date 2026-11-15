'use strict';
// ===================== TRAZOS DE CALLES (compartidos) =====================
// Flechas pintadas, calles de una vía, curvas suaves, líneas paralelas y manzanas de edificios. Los usan todas las ciudades, rutas y planteles.
function arrowPx(x,cx,cy,dx,dy,col){x.fillStyle=col;for(let k=-5;k<=3;k++)x.fillRect(Math.round(cx+dx*k),Math.round(cy+dy*k),1,1);
  for(let k=1;k<=3;k++){const bx=cx+dx*(3-k),by=cy+dy*(3-k);x.fillRect(Math.round(bx-dy*k),Math.round(by+dx*k),1,1);x.fillRect(Math.round(bx+dy*k),Math.round(by-dx*k),1,1)}}
// calles de una vía: r.ow=+1 (al este / al sur) o -1 (al oeste / al norte). El grafo de la IA queda dirigido y solo hay semáforo para los sentidos que existen.
function oneWayFix(W){const roadAt=(o,cc,q)=>W.roads.find(r=>r.o===o&&r.c===cc&&q>=r.a-1&&q<=r.b+1);
  for(const k in W.adj){const[x,y]=k.split(',').map(Number);W.adj[k]=W.adj[k].filter(n=>{const o=n[1]===y?'h':'v';const r=roadAt(o,o==='h'?y:x,o==='h'?(x+n[0])/2:(y+n[1])/2);if(!r||!r.ow)return true;return(o==='h'?Math.sign(n[0]-x):Math.sign(n[1]-y))===r.ow})}
  W.stops=W.stops.filter(s=>{if(s.kind!=='light'&&s.kind!=='stop')return true;const hz=s.dir==='E'||s.dir==='W';const r=roadAt(hz?'h':'v',(s.dir==='E'||s.dir==='N')?s.a:s.b,s.pos);if(!r||!r.ow)return true;
    if(((s.dir==='E'||s.dir==='S')?1:-1)!==r.ow)return false;s.a=r.c-HW;s.b=r.c+HW;return true});W.stops.forEach((s,i)=>s.id=i)}
function smoothLine(ctrl,step=14){const out=[];for(let i=0;i<ctrl.length-1;i++){const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)];const n=Math.max(1,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(j=>.5*(2*p1[j]+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}
  out.push(ctrl[ctrl.length-1].slice());return out}
function offLine(pts,d){return pts.map((q,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[q[0]-dy/l*d,q[1]+dx/l*d]})}
function fillBlock(W,R,ix1,iy1,ix2,iy2,tall=0){const rows=(iy2-iy1)>90?[[iy1,(iy1+iy2)/2|0],[((iy1+iy2)/2|0)+3,iy2]]:[[iy1,iy2]];
  for(const[ry1,ry2]of rows){let x=ix1;while(x<ix2-18){let w=22+R()*40|0;if(ix2-x-w<24)w=ix2-x;
    const b={x,y:ry1,w:w-3,h:ry2-ry1-3,type:'bld',col:['#c9ada7','#9a8c98','#e9c46a','#a8dadc','#f4a261','#cdb4db','#b7b7a4','#d6ccc2'][(R()*8)|0]};b.roof=shade(b.col,-.18);
    if(W.kind==='centro'){const r=R();b.blk=[ix1,iy1,ix2,iy2];
      if(r<.09+tall&&b.w>24&&b.h>24){b.H=46+R()*44|0;const ci=R()*6|0;b.col=['#5d7f99','#7f95a8','#9fb3c2','#4b5d73','#d4d0c6','#c2b8a3'][ci];b.win=ci<4?'glass':'grid';b.roof='#9aa0a6';b.roofT='flat'}
      else{b.H=r<.72?13+R()*13|0:28+R()*14|0;b.win='grid';b.shop=['#c1121f','#2a9d8f','#e76f51','#264653','#f4a261','#6a4c93','#1d3557'][R()*7|0];
        if(R()<.55){b.roofT='zinc';b.roof=R()<.6?'#9aa3a8':'#a4553f'}else{b.roofT='flat';b.roof='#b9b4aa';b.tanks=[[4+R()*(b.w-8)|0,4+R()*(b.h-8)|0]];if(b.w>30)b.tanks.push([4+R()*(b.w-8)|0,4+R()*(b.h-8)|0])}}}
    W.obst.push(b);W.blds.push(b);x+=w}}}
