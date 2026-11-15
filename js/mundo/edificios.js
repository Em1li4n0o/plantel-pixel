'use strict';
// ===================== EDIFICIOS EMBLEMÁTICOS (POR PIEZAS) =====================
// Cada pieza: caja (box), columna (col), estatua (stat), octágono (oct), cúpula (dome) o aguja (spire); z en unidades (1 piso ≈ 5).
const PB=(x,y,w,h,z0,z1,col,o={})=>Object.assign({s:'box',x,y,w,h,z0,z1,col},o);
const PO=(cx,cy,r,z0,z1,col,o={})=>Object.assign({s:'oct',x:cx-r,y:cy-r,w:2*r,h:2*r,r,z0,z1,col},o);
const PD=(cx,cy,r,z0,z1,col,o={})=>Object.assign({s:'dome',x:cx-r,y:cy-r,w:2*r,h:2*r,r,z0,z1,col},o);
const PS=(x,y,w,h,z0,z1,col,o={})=>Object.assign({s:'spire',x,y,w,h,z0,z1,col},o);
function pCols(x0,y0,x1,y1,n,z1,col,z0=0){const o=[];for(let i=0;i<n;i++){const t=n>1?i/(n-1):.5;o.push(PB(x0+(x1-x0)*t-1,y0+(y1-y0)*t-1,2,2,z0,z1,col,{s:'col'}))}return o}
function pRing(cx,cy,r,n,z0,z1,col){const o=[];for(let i=0;i<n;i++){const a=i/n*6.283;o.push(PB(cx+Math.cos(a)*r-1,cy+Math.sin(a)*r-1,2,2,z0,z1,col,{s:'col'}))}return o}
function pCren(x,y,w,h,z,col,st=5){const o=[];const L=2*(w+h);for(let s=0;s<L;s+=st){let px,py;if(s<w){px=x+s;py=y}else if(s<w+h){px=x+w;py=y+s-w}else if(s<2*w+h){px=x+w-(s-w-h);py=y+h}else{px=x;py=y+h-(s-2*w-h)}o.push(PB(px-.8,py-.8,1.6,1.6,z,z+2.5,col,{s:'col'}))}return o}
const octPts=(cx,cy,r)=>{const o=[];for(let i=0;i<8;i++){const a=(i+.5)/8*6.283;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o};
function prepPart(p){p.cx=p.x+p.w/2;p.cy=p.y+p.h/2;const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  if(p.s==='pg'){const xs=p.cs.map(q=>q[0]),ys=p.cs.map(q=>q[1]);p.x=Math.min(...xs);p.y=Math.min(...ys);p.w=Math.max(...xs)-p.x;p.h=Math.max(...ys)-p.y;p.cx=p.x+p.w/2;p.cy=p.y+p.h/2;p.tiers=[{cs:p.cs,z0:p.z0,z1:p.z1,win:true}];return p}
  if(p.s==='oct')p.tiers=[{cs:octPts(p.cx,p.cy,p.r),z0:p.z0,z1:p.z1,win:true}];
  else if(p.s==='dome'){const dz=(p.z1-p.z0)/3;p.tiers=[1,.84,.5].map((f,i)=>({cs:octPts(p.cx,p.cy,p.r*f),z0:p.z0+dz*i,z1:p.z0+dz*(i+1)}))}
  else if(p.s==='spire'){const dz=(p.z1-p.z0)/4;p.tiers=[1,.72,.45,.18].map((f,i)=>({cs:rect(p.cx-p.w*f/2,p.cy-p.h*f/2,p.w*f,p.h*f),z0:p.z0+dz*i,z1:p.z0+dz*(i+1)}))}
  else p.tiers=[{cs:rect(p.x,p.y,p.w,p.h),z0:p.z0,z1:p.z1,win:p.s==='box'}];return p}
// TORRE PULZAR SOLUTIONS: vestíbulo de vidrio, tres cuerpos escalonados, aletas LED en las esquinas, corona de cristal y antena
// TORRE PULZAR SOLUTIONS: rascacielos torcido de 22 niveles redondeados que giran sobre sí mismos, franjas LED cian,
// vestíbulo elíptico de vidrio, cuatro pantallas con el logo, corona de cristal, anillo flotante y antena.
function pulzarParts(cx,cy){const o=[],ring=(rx,ry,rot,n=14,bump=0)=>{const pts=[];for(let i=0;i<n;i++){const a=rot+i/n*6.283,k=1+(i%2?-bump:0);pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}return pts};
  o.push({s:'pg',cs:ring(46,38,0,18),z0:0,z1:11,col:'#dfe7f2',win:'glass',top:'#c9d6e6',shop:'#3d63f2'});
  const N=22,dz=9.5;for(let k=0;k<N;k++){const t=k/(N-1),r=31*(1-.42*t)*(1+.1*Math.sin(t*3.1)),band=k%4===3;
    o.push({s:'pg',cs:ring(r,r*.8,k*.15,6,.0),z0:11+k*dz,z1:11+(k+1)*dz,col:band?'#3df2ff':k%2?'#1f3b73':'#24478a',win:band?'none':'glass',top:band?'#bff8ff':'#2a4d8f'})}
  const zt=11+N*dz;for(let k=0;k<5;k++){const r=17*(1-k/5.2);o.push({s:'pg',cs:ring(r,r*.8,N*.085+k*.2,10),z0:zt+k*6,z1:zt+(k+1)*6,col:k%2?'#bfe0ff':'#9cc4ff',win:'none',top:'#e6f4ff'})}
  o.push(PB(cx-.6,cy-.6,1.2,1.2,zt+30,zt+58,'#e0e6ef',{s:'col'}));
  for(let i=0;i<20;i++){const a=i/20*6.283;o.push(PB(cx+Math.cos(a)*25-1,cy+Math.sin(a)*21-1,2,2,zt-10,zt-8,'#3df2ff',{s:'col'}))}
  o.push(PB(cx-16,cy-26,32,1.2,150,172,'#0b1022'),PB(cx-16,cy+24.8,32,1.2,150,172,'#0b1022'),PB(cx-26,cy-14,1.2,28,150,170,'#0b1022'),PB(cx+24.8,cy-14,1.2,28,150,170,'#0b1022'));
  return o}
function addLM(W,parts,o={}){parts.forEach(prepPart);const g=parts.filter(p=>p.z0<.5);const x0=Math.min(...g.map(p=>p.x)),y0=Math.min(...g.map(p=>p.y)),x1=Math.max(...g.map(p=>p.x+p.w)),y1=Math.max(...g.map(p=>p.y+p.h));
  const b=Object.assign({x:x0,y:y0,w:x1-x0,h:y1-y0,type:'bld',parts,H:Math.max(...parts.map(p=>p.z1)),col:parts[0].col,roof:parts[0].top||shade(parts[0].col,-.2)},o);
  W.obst.push({x:x0,y:y0,w:x1-x0,h:y1-y0,type:'bld'});W.blds.push(b);return b}
function parts3D(ctx,C,V,b,near){const g0=[],up=[];for(const p of b.parts){const d=Math.hypot(p.cx-C.x,p.cy-C.y);(p.z0>.5?up:g0).push([d,p])}
  g0.sort((a,c)=>c[0]-a[0]);up.sort((a,c)=>Math.abs(c[0]-a[0])>.5?c[0]-a[0]:a[1].z0-c[1].z0);
  for(const[,p]of g0.concat(up))for(const t of p.tiers)box(ctx,C,V,t.cs,t.z0,t.z1,p.col,{win:t.win&&p.win&&p.win!=='none'?p.win:null,top:p.top,near,shop:p.shop})}
// sombra proyectada hacia el sureste, más larga cuanto más alto
function shadowPath(x,p){const s=Math.min(22,2+p.z1/7);if(p.s==='pg'){for(const k of[0,s/3,2*s/3,s]){x.moveTo(p.cs[0][0]+k,p.cs[0][1]+k);for(const q of p.cs)x.lineTo(q[0]+k,q[1]+k);x.closePath()}return}if(p.s==='oct'||p.s==='dome'){for(let k=0;k<=s;k+=1.5){x.moveTo(p.cx+k+p.r,p.cy+k);x.arc(p.cx+k,p.cy+k,p.r,0,6.283)}return}
  x.moveTo(p.x,p.y);x.lineTo(p.x+p.w,p.y);x.lineTo(p.x+p.w+s,p.y+s);x.lineTo(p.x+p.w+s,p.y+p.h+s);x.lineTo(p.x+s,p.y+p.h+s);x.lineTo(p.x,p.y+p.h);x.closePath()}
function roof2D(x,p){const top=p.top||shade(p.col,-.15),X=Math.round(p.x),Y=Math.round(p.y),w=Math.round(p.w),h=Math.round(p.h);
  if(p.s==='pg'){x.fillStyle=p.top||shade(p.col,-.15);x.beginPath();x.moveTo(p.cs[0][0],p.cs[0][1]);for(const q of p.cs)x.lineTo(q[0],q[1]);x.closePath();x.fill();x.strokeStyle=shade(p.top||p.col,.3);x.lineWidth=1;x.stroke();return}
  if(p.s==='col'){x.fillStyle=shade(p.col,.2);x.fillRect(X,Y,2,2);x.fillStyle=shade(p.col,-.35);x.fillRect(X+1,Y+1,1,1);return}
  if(p.s==='oct'){fillCirc(x,p.cx,p.cy,p.r,shade(top,-.15));fillCirc(x,p.cx,p.cy,p.r-1,top);return}
  if(p.s==='dome'){fillCirc(x,p.cx,p.cy,p.r,shade(p.col,-.3));fillCirc(x,p.cx-.5,p.cy-.5,p.r*.8,p.col);fillCirc(x,p.cx-p.r*.3,p.cy-p.r*.3,Math.max(1,p.r*.35),shade(p.col,.35));return}
  if(p.s==='spire'){x.fillStyle=top;x.fillRect(X,Y,w,h);x.fillStyle=shade(top,-.3);for(let k=0;k<Math.min(w,h)/2;k++){x.fillRect(X+w-1-k,Y+k,1,h-2*k);x.fillRect(X+k,Y+h-1-k,w-2*k,1)}x.fillStyle=shade(top,.3);x.fillRect(X+w/2|0,Y+h/2|0,1,1);return}
  x.fillStyle=top;x.fillRect(X,Y,w,h);
  if(p.roofT==='zinc'){x.fillStyle=shade(top,-.12);if(w>=h){for(let k=1;k<h;k+=2)x.fillRect(X,Y+k,w,1)}else for(let k=1;k<w;k+=2)x.fillRect(X+k,Y,1,h)}
  x.fillStyle=shade(top,.28);x.fillRect(X,Y,w,1);x.fillRect(X,Y,1,h);x.fillStyle=shade(top,-.35);x.fillRect(X,Y+h-1,w,1);x.fillRect(X+w-1,Y,1,h);
  if(p.z1>36&&w>14&&h>14){x.fillStyle=shade(top,-.12);x.fillRect(X+2,Y+2,w-4,1);x.fillRect(X+2,Y+2,1,h-4);x.fillStyle='#8d9399';x.fillRect(X+w-9,Y+5,5,4);x.fillStyle='#5f656b';x.fillRect(X+w-8,Y+6,3,2);x.fillRect(X+4,Y+h-8,4,3)
    if(p.z1>95&&w>30&&h>30){const cx=X+w/2|0,cy=Y+h/2|0;fillCirc(x,cx,cy,8,'#4a4f55');fillCirc(x,cx,cy,7,'#5f656b');x.fillStyle='#ffd23f';x.fillRect(cx-3,cy-3,1,7);x.fillRect(cx+3,cy-3,1,7);x.fillRect(cx-3,cy,7,1)}}}
function parts2D(x,b){x.fillStyle='rgba(0,0,0,.34)';x.beginPath();for(const p of b.parts)if(p.s!=='stat')shadowPath(x,p);if(GFX===32){x.save();x.fillStyle='rgba(0,0,0,.12)';x.translate(1,1);x.fill();x.restore()}x.fill();
  const ps=b.parts.slice().sort((a,c)=>a.z1-c.z1);for(const p of ps){if(p.s==='stat'){x.fillStyle=p.col;x.fillRect(Math.round(p.x),Math.round(p.y),1,2);x.fillStyle='#3d3d3d';x.fillRect(Math.round(p.x)+1,Math.round(p.y)+1,1,1)}else roof2D(x,p)}
  if(b.label){const tw=b.label.length*4-1,lx=b.x+(b.w-tw)/2|0,ly=(b.ly!=null?b.ly:b.y+b.h/2-2)|0;ptext(x,b.label,lx+1,ly+1,'#000');ptext(x,b.label,lx,ly,'#fff')}}
// ESTILO 16-BIT: franja de fachada en el borde sur (con ventanas, algunas encendidas, y puerta) y contorno oscuro del edificio
function facade16(x,b,win){const X=Math.round(b.x),Y=Math.round(b.y),w=Math.round(b.w),h=Math.round(b.h);if(w<8||h<8)return;const fh=clamp(Math.round((b.ht||10)/8),3,7);
  x.fillStyle=shade(b.col,-.08);x.fillRect(X,Y+h-fh,w,fh);x.fillStyle=shade(b.col,-.3);x.fillRect(X,Y+h-fh,w,1);
  for(let k=X+2;k<X+w-3;k+=4){const lit=((k*13+Y*7)%9)<2;x.fillStyle=lit?'#ffe8a0':win;x.fillRect(k,Y+h-fh+(fh>4?2:1),2,Math.max(1,fh-3));x.fillStyle=shade(win,-.35);x.fillRect(k,Y+h-fh+(fh>4?2:1),2,1)}
  if(w>14){x.fillStyle='#5c4033';x.fillRect(X+(w>>1)-1,Y+h-Math.min(3,fh-1),3,Math.min(3,fh-1))}
  x.strokeStyle='rgba(18,16,28,.75)';x.lineWidth=1;x.strokeRect(X-.5,Y-.5,w+1,h+1)}
// edificio común del centro: sombra según altura, techo de zinc o de concreto con tanques negros, toldos de tiendas en la acera
function bld2D(x,b){const s=Math.min(18,2+b.ht/7);x.fillStyle='rgba(0,0,0,.34)';x.beginPath();shadowPath(x,{x:b.x,y:b.y,w:b.w,h:b.h,z1:b.ht});if(GFX===32){x.save();x.fillStyle='rgba(0,0,0,.12)';x.translate(1,1);x.fill();x.restore()}x.fill();
  if(b.shop&&b.blk){const[a1,c1,a2,c2]=b.blk;const aw=(X,Y,w,h,hz)=>{for(let k=0;k<(hz?w:h);k++){x.fillStyle=(k>>1)%2?'#f4f1e8':b.shop;hz?x.fillRect(X+k,Y,1,h):x.fillRect(X,Y+k,w,1)}};
    const m=Math.max(2,b.w*.15|0),mv=Math.max(2,b.h*.15|0);if(b.y<=c1+1)aw(b.x+m,b.y-3,b.w-2*m,3,1);if(b.y+b.h>=c2-4)aw(b.x+m,b.y+b.h,b.w-2*m,3,1);if(b.x<=a1+1)aw(b.x-3,b.y+mv,3,b.h-2*mv,0);if(b.x+b.w>=a2-4)aw(b.x+b.w,b.y+mv,3,b.h-2*mv,0)}
  roof2D(x,{s:'box',x:b.x,y:b.y,w:b.w,h:b.h,z1:b.ht,col:b.col,top:b.roof,roofT:b.roofT});facade16(x,b,b.win==='glass'?'#7fd1d8':'#9fd3ff');
  if(b.roofT==='flat'&&b.tanks)for(const[tx,ty]of b.tanks){fillCirc(x,b.x+tx,b.y+ty,2,'#1b1b1f');x.fillStyle='#3a3a44';x.fillRect(b.x+tx-1,b.y+ty-1,1,1)}
  if(b.label){const tw=b.label.length*4-1;ptext(x,b.label,b.x+(b.w-tw)/2|0,b.y+b.h/2-2|0,'#fff')}}
