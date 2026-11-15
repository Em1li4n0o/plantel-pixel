'use strict';
// ===================== VISTA DE PILOTO (PRIMERA PERSONA, ESTILO MODO 7) =====================
const u32=hex=>{const n=parseInt(hex.slice(1),16);return((255<<24)|((n&255)<<16)|((n>>8&255)<<8)|(n>>16))>>>0};
const mix32=(a,b,t)=>{const r=(a&255)*(1-t)+(b&255)*t,gg=(a>>8&255)*(1-t)+(b>>8&255)*t,bb=(a>>16&255)*(1-t)+(b>>16&255)*t;return((255<<24)|(bb<<16)|(gg<<8)|r)>>>0};
const GRASS32=u32('#3f8f3f'),HAZE32=u32('#cfeeff'),MOUNT32=u32('#7aa3bd'),HILL32=u32('#4f8f5a');
// colores del cielo por hora: [hora, arriba, medio, horizonte, nubes, sol]
const SKYK=[[0,'#03061a','#0a1030','#141c40','#1c2448','#000000'],[4.8,'#050a22','#121a40','#22285a','#2a3060','#000000'],[5.6,'#1c2a66','#6a4a8a','#ff9a6a','#ffb8a0','#ffcf80'],
  [6.6,'#3f7fd8','#8fc0ff','#ffd8a8','#fff0e0','#fff2c8'],[8.5,'#2f86f6','#6fb4ff','#cfeeff','#ffffff','#fffbe8'],[15.6,'#3584f0','#76b6ff','#d8efff','#ffffff','#fffbe8'],
  [16.9,'#3a6fd0','#8ab4f0','#ffe2a8','#fff1d6','#ffe9a0'],[17.7,'#2a3c86','#c75b8f','#ff9e45','#ffb27a','#ffb347'],[18.3,'#1c2462','#8a3f86','#ff7a3c','#e0788a','#ff7a2a'],
  [19,'#0c1238','#3a2a66','#7a3f6a','#5a3a6a','#000000'],[19.8,'#04071c','#0c1232','#18204a','#202850','#000000'],[24,'#03061a','#0a1030','#141c40','#1c2448','#000000']];
const SKY32=SKYK.map(k=>[k[0],...k.slice(1).map(u32)]);
function skyAt(hr){let i=0;while(i<SKY32.length-2&&SKY32[i+1][0]<=hr)i++;const a=SKY32[i],b=SKY32[i+1],t=clamp((hr-a[0])/(b[0]-a[0]),0,1);return[1,2,3,4,5].map(j=>mix32(a[j],b[j],t))}
// cielo del cuadro: degradado de tres tonos, nubes que se tiñen con el atardecer, sol que baja por el oeste (y sale por el este)
function skyPrep(V,C){const hr=S&&S.wx&&S.wx.on?S.wx.clock:12.5,rain=S&&S.wx?S.wx.rain:0,key=(hr*20|0)+'|'+(rain*10|0);
  if(V.skyKey!==key+'|'+GFX){V.skyKey=key+'|'+GFX;const[top,mid,hor,cl,sun]=skyAt(hr);const g=u32('#8a96a3');const col=t=>{let c=t<.55?mix32(top,mid,t/.55):mix32(mid,hor,(t-.55)/.45);if(rain>.05)c=mix32(c,g,Math.min(.75,rain));return c};const NB=GFX===32?96:16;V.sky=[];V.sky2=[];for(let y=0;y<=V.h;y++){const t=Math.min(1,y/V.hz),q=t*NB;V.sky.push(col(Math.floor(q)/NB));V.sky2.push(col(Math.min(NB,(q%1>.5?Math.ceil(q):Math.floor(q)))/NB))}
    V.cl=rain>.05?mix32(cl,u32('#9aa3ad'),Math.min(.8,rain)):cl;V.sunC=sun;V.hor=hor;V.mount=mix32(MOUNT32,hor,.28);V.hill=mix32(HILL32,hor,.12);
    const el=Math.sin(clamp((hr-5.8)/12.6,0,1)*Math.PI);V.sunEl=el;V.sunA=hr<12.2?0:Math.PI;V.sunOn=hr>5.6&&hr<18.9&&rain<.5}
  // posición del sol en la pantalla
  V.sx=null;if(V.sunOn){const da=nA(V.sunA-C.h),fov=Math.atan(V.cx/V.foc)+.3;if(Math.abs(da)<fov){V.sx=V.cx+Math.tan(da)*V.foc;V.sy=V.hz-4*V.s-V.sunEl*V.hz*.95;V.sr=Math.max(1.5,(V.sunEl<.25?7:5)*V.s)}}}
// HORIZONTE: alrededor de 360° (1536 columnas) y hasta 52 px de alto. 0 = cielo (se ve lo de atrás).
// 1 edificio lejano · 2 edificio · 3 lado en sombra · 4 ventana · 5 árbol oscuro · 6 árbol claro · 7 torre lejana alta
const HXW=1536,HXH=52;
function hxKind(W){const k=W.kind||'';return(k==='city'||k==='centro'||k==='sanjose'||k==='custom'||k==='plantel'||k==='alajuela'||k.startsWith('of_'))?'city':'open'}
function hxBuild(W){const kind=hxKind(W),T=new Uint8Array(HXW*HXH),top=new Uint8Array(HXW),R=rng(kind==='city'?41:17),set=(u,h,v)=>{u=((u%HXW)+HXW)%HXW;if(h<0||h>=HXH)return;T[h*HXW+u]=v;if(h+1>top[u])top[u]=h+1};
  const trees=(base,amp,dense)=>{for(let u=0;u<HXW;u+=dense){const rr=2+R()*3|0,cy=base+R()*amp|0;for(let dx=-rr;dx<=rr;dx++)for(let dy=-cy;dy<=rr;dy++){if(dy>0&&dx*dx+dy*dy>rr*rr)continue;const hh=cy+dy;if(hh<0)continue;set(u+dx,hh,(dx<0&&dy>rr*.2)?6:5)}}};
  if(kind==='city'){
    // torres lejanas en dos zonas (centro de la ciudad) y edificios lejanos alrededor
    for(let u=0;u<HXW;){const w=5+R()*14|0,dt=Math.abs(Math.sin(u/HXW*Math.PI*2*1.0+.6)),h=(8+R()*12+dt*dt*22)|0;for(let k=0;k<w;k++)for(let y=0;y<h;y++)set(u+k,y,h>30?7:1);u+=w+(R()<.25?2+R()*6|0:0)}
    // edificios cercanos con ventanas y lado en sombra
    for(let u=0;u<HXW;){const w=8+R()*20|0,h=(5+R()*14+(R()<.12?10:0))|0;for(let k=0;k<w;k++)for(let y=0;y<h;y++){let v=k>=w-2?3:2;if(k>1&&k<w-3&&y>1&&y<h-2&&(k%3)!==0&&(y%3)===1)v=4;set(u+k,y,v)}u+=w+(R()<.4?1+R()*5|0:0)}
    trees(0,3,7)}
  else{// bosque: copa de árboles con bordes redondos, en dos alturas
    trees(5,6,4);trees(1,3,3)}
  return{T,top,kind}}
function hxPal(V){const n=nightK(),hor=V.hor||HAZE32,dk=u32('#0b0e1c'),k=(c,a)=>mix32(mix32(u32(c),hor,a),dk,n*.75);
  return[0,k('#6a7591',.5),k('#8d93a2',.2),k('#6a6f7d',.2),n>.45?u32('#ffd27a'):k('#3d4b66',.12),k('#1f4f26',.2),k('#2f6b30',.15),k('#5a6684',.55)]}
function skyPix(V,x,y,a){let c=((x+y)&1)&&V.sky2?V.sky2[y]:V.sky[y];
  if(V.cl!=null&&!TOUCH&&y<V.hz-2){const n=Math.sin(a*3.1+y*.09)+Math.sin(a*7.3-y*.05+1.7)+Math.sin(a*1.3+2.2+y*.02)+Math.sin((S?S.t:0)*.01+a*11);const band=1-Math.abs(y/V.hz-.42)*2.2;const k=clamp((n-1.2)*.55,0,1)*clamp(band,0,1);if(k>0)c=mix32(c,V.cl,k*.85)}
  if(V.sx!=null){const d=Math.hypot(x-V.sx,y-V.sy);if(d<V.sr)c=V.sunC;else if(d<V.sr*5)c=mix32(c,V.sunC,.55*(1-(d-V.sr)/(V.sr*4))**2)}
  return c}
function mkView(w,h,hz,foc,fog,s){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const img=ctx.createImageData(w,h);
  const sky=[];for(let y=0;y<=h;y++){const t=Math.min(1,y/hz);sky.push(mix32(u32('#4fa3ff'),HAZE32,t*t))}
  return{c,ctx,img,buf:new Uint32Array(img.data.buffer),w,h,cx:w/2,hz,foc,fog,s,sky}}
const VMAIN=mkView(VW,VH,84,190,240,1),VMIR=mkView(80,26,10,40,150,.35),VSL=mkView(54,30,12,44,150,.35),VSR=mkView(54,30,12,44,150,.35);
function camXform(C,x,y){const dx=x-C.x,dy=y-C.y;return{f:dx*C.c+dy*C.s,r:-dx*C.s+dy*C.c}}
// Relieve: cada mundo puede tener un mapa de alturas (W.hm). Todo lo que se dibuja en 3D se apoya sobre el terreno.
let CURW=null;
function hgt(W,x,y){const m=W.hm;if(!m)return 0;const fx=clamp(x/m.r,0,m.w-1.001),fy=clamp(y/m.r,0,m.h-1.001),ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,a=m.a,i=iy*m.w+ix;return(a[i]*(1-tx)+a[i+1]*tx)*(1-ty)+(a[i+m.w]*(1-tx)+a[i+m.w+1]*tx)*ty}
let HMON=false;const gh=(x,y)=>HMON?hgt(CURW,x,y):0;
// punto más cercano de la línea central: búsqueda gruesa cada 20 puntos y luego fina alrededor (antes: cada 5 puntos en toda la línea, por cada celda)
function nearCL(CL,n){const xs=new Float32Array(n),ys=new Float32Array(n);for(let i=0;i<n;i++){xs[i]=CL[i][0];ys[i]=CL[i][1]}
  return(x,y)=>{let bi=0,bd=1e18;for(let i=0;i<n;i+=20){const dx=xs[i]-x,dy=ys[i]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}const a=Math.max(0,bi-20),b=Math.min(n-1,bi+20);for(let i=a;i<=b;i+=2){const dx=xs[i]-x,dy=ys[i]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}return[bi,Math.sqrt(bd)]}}
function makeHM(W,r,fn){const w=Math.ceil(W.w/r)+2,h=Math.ceil(W.h/r)+2,a=new Float32Array(w*h);for(let j=0;j<h;j++)for(let i=0;i<w;i++)a[j*w+i]=fn(i*r,j*r);W.hm={r,w,h,a}}
function hillshade(x,W,r=8){if(!W.hm)return;const B=[];for(let k=0;k<10;k++)B.push([]);
  for(let y=0;y<W.h;y+=r)for(let X=0;X<W.w;X+=r){const d=(hgt(W,X+r,y)-hgt(W,X-r,y))*.6+(hgt(W,X,y+r)-hgt(W,X,y-r))*.8;if(Math.abs(d)<.4)continue;const lv=Math.min(4,Math.abs(d)/1.6|0);B[d>0?lv:5+lv].push(X,y)}
  for(let k=0;k<10;k++){if(!B[k].length)continue;x.fillStyle=k<5?`rgba(0,0,0,${.07+k*.07})`:`rgba(255,255,230,${.04+(k-5)*.035})`;x.beginPath();const q=B[k];for(let i=0;i<q.length;i+=2)x.rect(q[i],q[i+1],r,r);x.fill()}}
let ZADD=0;function proj(C,V,pts){const N=.7;const cam=pts.map(p=>{const q=camXform(C,p[0],p[1]);return{f:q.f,r:q.r,z:p[2]+gh(p[0],p[1])+ZADD}});const out=[];
  for(let i=0;i<cam.length;i++){const a=cam[i],b=cam[(i+1)%cam.length];if(a.f>=N)out.push(a);if((a.f>=N)!==(b.f>=N)){const tt=(N-a.f)/(b.f-a.f);out.push({f:N,r:a.r+(b.r-a.r)*tt,z:a.z+(b.z-a.z)*tt})}}
  if(out.length<3)return null;return out.map(p=>[V.cx+p.r*V.foc/p.f,V.hz+(C.z-p.z)*V.foc/p.f])}
// ESTILO 16-BIT en 3D: mientras OUTL3D está activo, cada cara de carros y edificios lleva un contorno oscuro (solo si se ve de buen tamaño)
let OUTL3D=0;
function poly(ctx,pp,col){if(!pp)return;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);for(let i=1;i<pp.length;i++)ctx.lineTo(pp[i][0],pp[i][1]);ctx.closePath();ctx.fill();
  if(OUTL3D&&col.charCodeAt(0)===35){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const q of pp){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}const m=OUTL3D===2?14:4;if(x1-x0>m&&y1-y0>(OUTL3D===2?10:2)){ctx.strokeStyle=OUTL3D===2?'rgba(14,12,24,.45)':'rgba(14,12,24,.7)';ctx.lineWidth=1;ctx.stroke()}}}
const LDIR=[-.6,-.8];
// SPLIT: mientras está activo, los edificios y muros no se dibujan enteros: cada pared se parte en tramos (de ~3.5 m) que entran
// solos al orden de dibujo. Así un carro o un árbol junto a un edificio se compara con el tramo de pared que tiene al lado y no se ve "a través".
let SPLIT=null;
function box(ctx,C,V,cs,z0,z1,col,o={}){let mx=0,my=0;for(const p of cs){mx+=p[0];my+=p[1]}mx/=cs.length;my/=cs.length;
  for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length];const fx=(a[0]+b[0])/2,fy=(a[1]+b[1])/2;let nx=fx-mx,ny=fy-my;const nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;
    if((C.x-fx)*nx+(C.y-fy)*ny<=0)continue;const lit=nx*LDIR[0]+ny*LDIR[1],fc=shade(col,lit>0?lit*.15:lit*.3);
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),at=u=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
    const face=(s0,s1)=>{const A=at(s0),B=at(s1);poly(ctx,proj(C,V,[[A[0],A[1],z0],[B[0],B[1],z0],[B[0],B[1],z1],[A[0],A[1],z1]]),fc);
    const quad=(u0,u1,za,zb,c)=>{if(u0<s0)u0=s0;if(u1>s1)u1=s1;if(u1<=u0)return;const p0=at(u0),p1=at(u1);poly(ctx,proj(C,V,[[p0[0],p0[1],za],[p1[0],p1[1],za],[p1[0],p1[1],zb],[p0[0],p0[1],zb]]),c)};
    if(o.shop&&z1>6&&L>5){quad(.06,.94,.3,3.2,'#2b3a55');quad(.04,.96,3.2,4.1,o.shop)}
    if(o.win&&z1>8&&L>2.5){const glass=o.win==='glass',cl=o.win==='classic',wc=glass?shade(col,.3):shade(col,-.5);const fl=cl?9:5,wh=glass?.45:cl?4.5:2,zs=glass?5:o.shop?6.5:cl?3:3.5;
      const n=o.near&&!glass?Math.max(1,Math.min(12,Math.round(L/(cl?9:6)))):0;
      const ww=cl?.2:.28;for(let z=z0+zs;z+wh<z1-1.2;z+=fl){if(n&&z<z0+zs+40){for(let i=0;i<n;i++)quad((i+.5-ww)/n,(i+.5+ww)/n,z,z+wh,wc)}else quad(.1,.9,z,z+wh,wc)}
      if(glass&&o.near&&L<70){const m=Math.max(1,Math.min(6,Math.round(L/10)));for(let i=1;i<m;i++)quad(i/m-.008,i/m+.008,0,z1,wc)}}
    if(o.bus)poly(ctx,proj(C,V,[[A[0],A[1],4.2],[B[0],B[1],4.2],[B[0],B[1],6.6],[A[0],A[1],6.6]]),'#2b3a55')};
    if(SPLIT&&L>3){const n=Math.max(1,Math.ceil(L/14)),ol=OUTL3D;for(let k=0;k<n;k++){const s0=k/n,s1=(k+1)/n,cp=at((s0+s1)/2),q=camXform(C,cp[0],cp[1]);
        SPLIT.push({d:q.f,r:q.r,x:cp[0],y:cp[1],rad:L/n/2+1,fn:()=>{const k0=OUTL3D;OUTL3D=ol;try{face(s0,s1)}finally{OUTL3D=k0}}})}}
    else face(0,1)}
  if(C.z>z1+gh(mx,my)){const tp=()=>poly(ctx,proj(C,V,cs.map(p=>[p[0],p[1],z1])),o.top||shade(col,.12));if(SPLIT){const q=camXform(C,mx,my);let rd=0;for(const p of cs)rd=Math.max(rd,Math.hypot(p[0]-mx,p[1]-my));SPLIT.push({d:q.f+.01,r:q.r,x:mx,y:my,rad:rd,fn:tp})}else tp()}}
function bill(C,V,x,y,z){const q=camXform(C,x,y);if(q.f<.8)return null;const k=V.foc/q.f;return{x:V.cx+q.r*k,y:V.hz+(C.z-z-gh(x,y))*k,k,f:q.f}}
let LIGHTQ=[];
function nightK(){return S&&S.wx&&S.wx.on?S.wx.n:0}
function carLights(ctx,C,V,o,blinkOn,L2,W2,pt,zl,rearVis,frontVis){const n=nightK(),head=o.lights||(!o.player&&n>.4)||(o.player&&n>.4&&o.lights),Q=(a,b,r,col)=>LIGHTQ.push({x:pt(a,b)[0],y:pt(a,b)[1],z:zl,r,col});
  const lamp=(a,b,z,cl,ww)=>poly(ctx,proj(C,V,[[...pt(a,b-ww),z],[...pt(a,b+ww),z],[...pt(a,b+ww),z+.9],[...pt(a,b-ww),z+.9]]),cl);
  if(rearVis){const tc=o.brake?'#ff3030':head?'#c0181c':'#7a1010';lamp(-L2-.03,-W2+1.1,zl-.45,tc,.85);lamp(-L2-.03,W2-1.1,zl-.45,tc,.85);
    if(o.brake){Q(-L2-.2,-W2+1.1,1.8,'rgba(255,40,40,.75)');Q(-L2-.2,W2-1.1,1.8,'rgba(255,40,40,.75)');Q(-L2-.2,0,1.2,'rgba(255,40,40,.5)')}else if(head||n>.4){Q(-L2-.2,-W2+1.1,1.1,'rgba(255,30,30,.55)');Q(-L2-.2,W2-1.1,1.1,'rgba(255,30,30,.55)')}
    if(o.rev){lamp(-L2-.03,0,zl-.45,'#ffffff',.45);Q(-L2-.2,0,1.5,'rgba(255,255,255,.7)')}}
  if(frontVis){const hc=head?'#fffbe0':'#e8e2c0';lamp(L2+.03,-W2+1.2,zl-.45,hc,.8);lamp(L2+.03,W2-1.2,zl-.45,hc,.8);if(head){Q(L2+.3,-W2+1.2,2.4,'rgba(255,248,215,.85)');Q(L2+.3,W2-1.2,2.4,'rgba(255,248,215,.85)')}}
  if(blinkOn){for(const[on,sd]of[[o.bl,-1],[o.br,1]])if(on){if(rearVis){lamp(-L2-.03,sd*(W2-.35),zl-.45,'#ffb000',.35);Q(-L2-.2,sd*(W2-.35),1.4,'rgba(255,170,0,.8)')}if(frontVis){lamp(L2+.03,sd*(W2-.35),zl-.45,'#ffb000',.35);Q(L2+.2,sd*(W2-.35),1.4,'rgba(255,170,0,.8)')}}}
  if(head&&n>.25){ctx.save();ctx.globalCompositeOperation='lighter';poly(ctx,proj(C,V,[[...pt(L2,-W2),.06],[...pt(L2,W2),.06],[...pt(L2+26,W2+7),.06],[...pt(L2+26,-W2-7),.06]]),`rgba(255,240,190,${.16*n})`);ctx.restore()}}
function flushLights(ctx,C,V){if(!LIGHTQ.length)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const q of LIGHTQ){const B=bill(C,V,q.x,q.y,q.z);if(B&&B.f>.8)glow(ctx,B.x,B.y,Math.max(1.5,q.r*B.k),q.col)}ctx.restore();LIGHTQ=[]}
// Pinta el logo de Pulzar sobre una cara vertical (de a hacia b, entre z0 y z1) con perspectiva, solo si se ve de frente.
function logoFace(ctx,C,V,a,b,z0,z1,glowOn){const nx=-(b[1]-a[1]),ny=b[0]-a[0],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if((C.x-mx)*nx+(C.y-my)*ny<=0)return;
  let TL=bill(C,V,a[0],a[1],z1),TR=bill(C,V,b[0],b[1],z1),BL=bill(C,V,a[0],a[1],z0),BR0=bill(C,V,b[0],b[1],z0);if(!TL||!TR||!BL||!BR0||Math.min(TL.f,TR.f)<3)return;if(Math.max(TL.f,TR.f)/Math.min(TL.f,TR.f)>2.2||Math.abs(TR.x-TL.x)>V.w*1.5)return;const w=52,h=34;
  ctx.save();if(glowOn){ctx.globalAlpha=.35;ctx.fillStyle='#3d63f2';const BR=bill(C,V,b[0],b[1],z0);if(BR){ctx.beginPath();ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);ctx.fill()}ctx.globalAlpha=1}
  ctx.imageSmoothingEnabled=false;ctx.setTransform((TR.x-TL.x)/w,(TR.y-TL.y)/w,(BL.x-TL.x)/h,(BL.y-TL.y)/h,TL.x,TL.y);ctx.drawImage(PZLOGO,0,0);ctx.restore()}
function frustum(ctx,C,V,bot,zb,top,zt,side,roof){let mx=0,my=0;for(const p of bot){mx+=p[0];my+=p[1]}mx/=4;my/=4;
  for(let i=0;i<4;i++){const a=bot[i],b=bot[(i+1)%4],c=top[(i+1)%4],d=top[i];const fx=(a[0]+b[0]+c[0]+d[0])/4,fy=(a[1]+b[1]+c[1]+d[1])/4;const nx=(a[0]+b[0])/2-mx,ny=(a[1]+b[1])/2-my;
    if((C.x-fx)*nx+(C.y-fy)*ny<=0)continue;const nl=Math.hypot(nx,ny)||1,lit=(nx*LDIR[0]+ny*LDIR[1])/nl;poly(ctx,proj(C,V,[[a[0],a[1],zb],[b[0],b[1],zb],[c[0],c[1],zt],[d[0],d[1],zt]]),shade(side,lit>0?lit*.25:lit*.2))}
  if(C.z>zt+gh(mx,my))poly(ctx,proj(C,V,top.map(p=>[p[0],p[1],zt])),roof)}
function car3D(ctx,C,V,o,blinkOn){ZADD=o.sea?-Math.min(2.6,o.sea*1.6):0;try{if(V!==VMAIN||TOUCH)return car3Dr(ctx,C,V,o,blinkOn);OUTL3D=1;car3Dr(ctx,C,V,o,blinkOn)}finally{OUTL3D=0;ZADD=0}}
function byDepth(C,parts){parts.map(q=>[(q[0][0]-C.x)**2+(q[0][1]-C.y)**2,q[1]]).sort((a,b)=>b[0]-a[0]).forEach(q=>q[1]())}
function car3Dr(ctx,C,V,o,blinkOn){const c=Math.cos(o.h),s=Math.sin(o.h),L2=o.L/2,W2=o.Wd/2;const pt=(a,b)=>[o.x+c*a-s*b,o.y+s*a+c*b];
  poly(ctx,proj(C,V,[pt(L2+.6,-W2-.6),pt(L2+.6,W2+.6),pt(-L2-.6,W2+.6),pt(-L2-.6,-W2-.6)].map(p=>[p[0],p[1],.03])),'rgba(0,0,0,.35)');
  const col=(VEH[o.type]&&VEH[o.type].fixed)||o.col;const body=[pt(L2,-W2),pt(L2,W2),pt(-L2,W2),pt(-L2,-W2)];
  if(o.crushed&&S&&o.crushed>S.t){box(ctx,C,V,[pt(L2+.4,-W2-.5),pt(L2+.4,W2+.5),pt(-L2-.4,W2+.5),pt(-L2-.4,-W2-.5)],0,.55,shade(col,-.15),{top:shade(col,-.05)});box(ctx,C,V,[pt(L2*.3,-W2*.8),pt(L2*.3,W2*.8),pt(-L2*.5,W2*.8),pt(-L2*.5,-W2*.8)],.55,.8,'#3a4a66',{top:'#6f86a8'});return}
  const lamp=(a,b,z,cl,ww=.7)=>poly(ctx,proj(C,V,[[...pt(a,b-ww),z],[...pt(a,b+ww),z],[...pt(a,b+ww),z+.8],[...pt(a,b-ww),z+.8]]),cl);
  const rearVis=(C.x-(o.x-c*L2))*(-c)+(C.y-(o.y-s*L2))*(-s)>0,frontVis=(C.x-(o.x+c*L2))*c+(C.y-(o.y+s*L2))*s>0;
  const tl=o.brake?'#ff2a2a':'#a01010';
  if(o.type==='neon'){const q=(a0,a1,w)=>[pt(a0,-w),pt(a0,w),pt(a1,w),pt(a1,-w)],NC='#00f0ff',NG='0,240,255',fine=GFX===32&&(V===VMAIN||V.show);
    if(o.trail&&o.trail.length>1){ctx.save();ctx.globalCompositeOperation='lighter';const T=o.trail,n=T.length;for(let i=0;i<n-1;i++){const a=T[i],b=T[i+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])>12)continue;const al=(i/n)*.55;poly(ctx,proj(C,V,[[a[0],a[1],.15],[b[0],b[1],.15],[b[0],b[1],1.9],[a[0],a[1],1.9]]),`rgba(${NG},${al})`)}ctx.restore()}
    if(fine){ctx.save();ctx.globalCompositeOperation='lighter';poly(ctx,proj(C,V,q(L2+1,-L2-1,1.6).map(v=>[v[0],v[1],.05])),`rgba(${NG},.28)`);ctx.restore()}
    box(ctx,C,V,q(L2,L2-2.4,.4),0,2.4,'#05070a');box(ctx,C,V,q(-L2+2.4,-L2,.45),0,2.4,'#05070a');
    for(const a of[L2-1.2,-L2+1.2]){const w=pt(a,0);LIGHTQ.push({x:w[0],y:w[1],z:1.2,r:1.9,col:`rgba(${NG},.75)`})}
    box(ctx,C,V,q(L2-.6,-L2+.6,.7),1,2.1,'#0b0e14',{top:'#161d2a'});box(ctx,C,V,q(L2-.8,L2-2.6,.55),2.1,2.6,'#0b0e14',{top:'#1d2636'});
    for(const sd of[-1,1]){const b=sd*.72,ok=(C.x-pt(0,b)[0])*(-s*sd)+(C.y-pt(0,b)[1])*(c*sd)>0;if(ok){poly(ctx,proj(C,V,[[...pt(L2-.6,b),1.45],[...pt(-L2+.6,b),1.45],[...pt(-L2+.6,b),1.65],[...pt(L2-.6,b),1.65]]),NC);poly(ctx,proj(C,V,[[...pt(L2-.4,b),.35],[...pt(L2-2.2,b),.35],[...pt(L2-2.2,b),2.05],[...pt(L2-.4,b),2.05]]),'rgba(0,240,255,.35)')}}
    box(ctx,C,V,q(-.6,-2.4,.75),2.1,3.7,'#0b0e14',{top:'#1d2636'});const H=bill(C,V,o.x-c*.4,o.y-s*.4,4.4);if(H){ctx.fillStyle='#05070a';ctx.beginPath();ctx.arc(H.x,H.y,Math.max(1,.8*H.k),0,7);ctx.fill();ctx.fillStyle=NC;ctx.fillRect(H.x-.7*H.k,H.y-.15*H.k,1.4*H.k,Math.max(1,.25*H.k))}
    if(rearVis)lamp(-L2-.02,0,1.6,o.brake?'#ff2a2a':'#ff3b6b',.5);if(frontVis)lamp(L2+.02,0,1.8,'#e8ffff',.5);if(blinkOn&&o.bl)lamp(rearVis?-L2-.02:L2+.02,-.6,2,'#ffb000',.25);if(blinkOn&&o.br)lamp(rearVis?-L2-.02:L2+.02,.6,2,'#ffb000',.25);return}
  if(VEH[o.type]&&VEH[o.type].moto){const bk=VEH[o.type].bike,q=(a0,a1,w)=>[pt(a0,-w),pt(a0,w),pt(a1,w),pt(a1,-w)];
    box(ctx,C,V,q(L2,L2-1.6,.3),0,1.8,'#151515');box(ctx,C,V,q(-L2+1.6,-L2,.3),0,1.8,'#151515');
    box(ctx,C,V,q(L2-1.2,-L2+1.2,bk?.15:.55),bk?1.3:.7,bk?1.6:2.2,bk?'#9aa0a6':col);
    box(ctx,C,V,q(-.2,-1.6,bk?.7:.85),bk?2.2:2.2,bk?4.4:4.5,bk?col:(o.rider||'#2b2d42'));
    box(ctx,C,V,q(L2-1.3,L2-1.6,1.3),2.8,3.1,'#666');
    const H=bill(C,V,o.x-c*.9,o.y-s*.9,5.2);if(H){ctx.fillStyle=o.helm||'#1b1b1f';ctx.beginPath();ctx.arc(H.x,H.y,Math.max(1,.75*H.k),0,7);ctx.fill()}
    if(!bk){if(rearVis)lamp(-L2-.02,0,1.6,tl,.4);if(frontVis)lamp(L2+.02,0,1.8,'#fff6b0',.4);if(blinkOn&&o.bl)lamp(rearVis?-L2-.02:L2+.02,-.7,2,'#ffb000',.25);if(blinkOn&&o.br)lamp(rearVis?-L2-.02:L2+.02,.7,2,'#ffb000',.25)}return}
  if(o.type==='kart'){// KART: llantas anchas afuera, chasis bajo, nariz y pontones del color, asiento, motor con escape, defensas cromadas y piloto con casco y visor
    const q=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],fine=GFX===32&&(V===VMAIN||V.show),stA=o.player?clamp(o.steer||0,-1,1)*.45:0,hc=o.helm||'#ffd23f';
    for(const[a,w]of[[L2-1.3,1.05],[-L2+1.4,1.3]])for(const sd of[-1,1]){const an=a>0?stA:0,ac=a,bc=sd*(W2-w/2),pR=(x,y)=>{const ca=Math.cos(an),sa=Math.sin(an);return pt(ac+ca*x-sa*y,bc+sa*x+ca*y)};
      box(ctx,C,V,[pR(1,-w/2),pR(1,w/2),pR(-1,w/2),pR(-1,-w/2)],0,1.5,'#141416');if(fine)box(ctx,C,V,[pR(.45,sd*(w/2-.08)),pR(.45,sd*(w/2+.06)),pR(-.45,sd*(w/2+.06)),pR(-.45,sd*(w/2-.08))],.4,1.1,'#c9ccd1')}
    box(ctx,C,V,q(L2-.6,-L2+.6,-W2*.5,W2*.5),.25,.45,'#2a2a30');
    box(ctx,C,V,q(L2+.55,L2+.25,-W2*.62,W2*.62),.3,.62,'#c9ccd1');box(ctx,C,V,q(-L2+.15,-L2-.25,-W2*.72,W2*.72),.3,.62,'#c9ccd1');
    for(const sd of[-1,1])box(ctx,C,V,q(L2-2.5,-L2+2.6,sd*W2*.32,sd*W2*.6),.35,1.05,shade(col,-.08),{top:shade(col,.15)});
    box(ctx,C,V,q(L2+.2,L2-2.4,-W2*.42,W2*.42),.35,1.15,col,{top:shade(col,.22)});if(fine)poly(ctx,proj(C,V,q(L2-.3,L2-1.6,-.9,.9).map(v=>[v[0],v[1],1.17])),'#f4f4f4');
    box(ctx,C,V,q(-L2*.4,-L2+.6,W2*.08,W2*.42),.45,1.35,'#5a6068',{top:'#6b717b'});if(fine)box(ctx,C,V,q(-L2+.9,-L2+.2,W2*.3,W2*.42),1.1,1.4,'#b9bec6');
    box(ctx,C,V,q(-L2*.02,-L2*.42,-W2*.3,W2*.06),.45,1.75,'#1b1b1f',{top:'#26262e'});
    box(ctx,C,V,q(L2*.32,L2*.2,-.7,.7),1.5,1.85,'#111');
    box(ctx,C,V,q(.1,-L2*.3,-.85,.6),1.2,2.7,o.rider||'#1d3557',{top:shade(o.rider||'#1d3557',.15)});
    const H=bill(C,V,o.x-c*.35,o.y-s*.35,3.3);if(H){const r=Math.max(1,1*H.k);ctx.fillStyle=hc;ctx.beginPath();ctx.arc(H.x,H.y,r,0,7);ctx.fill();ctx.fillStyle='#14161c';ctx.fillRect(H.x-r*.75,H.y-r*.15,r*1.5,Math.max(1,r*.38));if(fine){ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(H.x-r*.5,H.y-r*.62,r*.45,Math.max(1,r*.22))}}
    if(o.boost&&rearVis){ctx.save();ctx.globalCompositeOperation='lighter';const e=pt(-L2-.4,W2*.36);LIGHTQ.push({x:e[0],y:e[1],z:1.25,r:1.8,col:'rgba(255,140,30,.9)'});ctx.restore()}return}
  if(o.type==='monster'){for(const[a,b]of[[L2-.5,-W2-.8],[L2-.5,W2-1.6],[-L2+4,-W2-.8],[-L2+4,W2-1.6]])box(ctx,C,V,[pt(a,b),pt(a,b+2.4),pt(a-4.4,b+2.4),pt(a-4.4,b)],0,4.4,'#141414');
    box(ctx,C,V,body,3.6,6.2,col);box(ctx,C,V,[pt(L2*.3,-W2*.8),pt(L2*.3,W2*.8),pt(-L2*.5,W2*.8),pt(-L2*.5,-W2*.8)],6.2,8.6,'#2b3a55',{top:shade(col,-.1)});if(frontVis){lamp(L2+.02,-W2+1.5,4.6,'#fff6b0');lamp(L2+.02,W2-1.5,4.6,'#fff6b0')}if(rearVis){lamp(-L2-.02,-W2+1.5,4.6,tl);lamp(-L2-.02,W2-1.5,4.6,tl)}
    if(blinkOn)for(const[on,sd]of[[o.bl,-1],[o.br,1]])if(on){if(rearVis)lamp(-L2-.02,sd*(W2-.5),5.4,'#ffb000',.45);if(frontVis)lamp(L2+.02,sd*(W2-.5),5.4,'#ffb000',.45);const q=pt(rearVis?-L2-.2:L2+.2,sd*(W2-.5));LIGHTQ.push({x:q[0],y:q[1],z:5.6,r:1.6,col:'rgba(255,170,0,.8)'})}return}
  if(o.type==='truck'||o.type==='garbage'){  // ayudas: cara vertical de un lado (sd=-1/1) o de frente/atrás (fa=L2/-L2), solo si mira a la cámara
    const R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],fine=GFX===32&&(V===VMAIN||V.show);
    const sideVis=sd=>{const q=pt(0,sd*W2);return(C.x-q[0])*(-s*sd)+(C.y-q[1])*(c*sd)>0};
    const sideQ=(sd,a0,a1,z0,z1,cl,e=.04)=>{const b=sd*(W2+e);poly(ctx,proj(C,V,[[...pt(a0,b),z0],[...pt(a1,b),z0],[...pt(a1,b),z1],[...pt(a0,b),z1]]),cl)};
    const endQ=(a,b0,b1,z0,z1,cl)=>poly(ctx,proj(C,V,[[...pt(a,b0),z0],[...pt(a,b1),z0],[...pt(a,b1),z1],[...pt(a,b0),z1]]),cl);
    const wheel=(a,sd,len,wd,ht)=>{box(ctx,C,V,R2(a+len/2,a-len/2,sd*(W2+.2),sd*(W2+.2-wd)),0,ht,'#16161a');if(fine)box(ctx,C,V,R2(a+len*.28,a-len*.28,sd*(W2+.26),sd*(W2+.12)),ht*.25,ht*.75,'#b9bec6',{top:'#8e949c'})};
      for(const sd of[-1,1]){wheel(L2-2.4,sd,2.6,1.1,2.3);wheel(-L2+3.4,sd,2.8,1.3,2.3);wheel(-L2+6.4,sd,2.8,1.3,2.3)}
    if(frontVis)endQ(L2+.06,-W2+.4,W2-.4,3.4,5.6,'#22324a');if(frontVis){endQ(L2+.06,-W2+1.2,W2-1.2,1.3,2.9,'#1d1d22');endQ(L2+.07,-W2+.3,W2-.3,.5,1.1,'#2a2a30')}
    for(const sd of[-1,1])box(ctx,C,V,R2(L2-.6,L2-1.2,sd*(W2+.9),sd*(W2+.35)),3.6,5.2,'#1d1d22')}
  if(o.type==='truck'){box(ctx,C,V,[pt(L2-6.8,-W2*.5),pt(L2-6.8,W2*.5),pt(-L2+1,W2*.5),pt(-L2+1,-W2*.5)],1.4,2.4,'#2a2a30');box(ctx,C,V,[pt(L2,-W2),pt(L2,W2),pt(L2-6,W2),pt(L2-6,-W2)],1.5,6.6,col,{bus:true});box(ctx,C,V,[pt(L2-7,-W2),pt(L2-7,W2),pt(-L2,W2),pt(-L2,-W2)],2.5,9.4,'#f2f2f2',{top:'#e0e0e0'});if(rearVis){lamp(-L2-.02,-W2+1,1.5,tl);lamp(-L2-.02,W2-1,1.5,tl)}if(frontVis){lamp(L2+.02,-W2+1,1.5,'#fff6b0');lamp(L2+.02,W2-1,1.5,'#fff6b0')}return}
  if(o.type==='garbage'){box(ctx,C,V,[pt(L2,-W2),pt(L2,W2),pt(L2-6,W2),pt(L2-6,-W2)],1.5,6.2,'#f4f4f4',{bus:true});box(ctx,C,V,[pt(L2-6.4,-W2),pt(L2-6.4,W2),pt(-L2,W2),pt(-L2,-W2)],2.4,8.2,'#2e8b57',{top:'#257a4a'});if(rearVis){lamp(-L2-.02,-W2+1,1.5,tl);lamp(-L2-.02,W2-1,1.5,tl);if(blinkOn&&o.bl)lamp(-L2-.02,-W2+.5,2.6,'#ffb000',.5);if(blinkOn&&o.br)lamp(-L2-.02,W2-.5,2.6,'#ffb000',.5)}if(frontVis){lamp(L2+.02,-W2+1,1.5,'#fff6b0');lamp(L2+.02,W2-1,1.5,'#fff6b0')}return}
  if(o.type==='bus'){
  // ayudas: cara vertical de un lado (sd=-1/1) o de frente/atrás (fa=L2/-L2), solo si mira a la cámara
  const R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],fine=GFX===32&&(V===VMAIN||V.show);
  const sideVis=sd=>{const q=pt(0,sd*W2);return(C.x-q[0])*(-s*sd)+(C.y-q[1])*(c*sd)>0};
  const sideQ=(sd,a0,a1,z0,z1,cl,e=.04)=>{const b=sd*(W2+e);poly(ctx,proj(C,V,[[...pt(a0,b),z0],[...pt(a1,b),z0],[...pt(a1,b),z1],[...pt(a0,b),z1]]),cl)};
  const endQ=(a,b0,b1,z0,z1,cl)=>poly(ctx,proj(C,V,[[...pt(a,b0),z0],[...pt(a,b1),z0],[...pt(a,b1),z1],[...pt(a,b0),z1]]),cl);
  const wheel=(a,sd,len,wd,ht)=>{box(ctx,C,V,R2(a+len/2,a-len/2,sd*(W2+.2),sd*(W2+.2-wd)),0,ht,'#16161a');if(fine)box(ctx,C,V,R2(a+len*.28,a-len*.28,sd*(W2+.26),sd*(W2+.12)),ht*.25,ht*.75,'#b9bec6',{top:'#8e949c'})};
    for(const sd of[-1,1]){wheel(L2-3.2,sd,3,1.1,2.4);wheel(-L2+4,sd,3.4,1.3,2.4)}
    box(ctx,C,V,R2(L2,-L2,-W2,W2),1.4,8.4,col,{top:'#e9ecef'});const glass='#22324a',st=shade(col,-.35),ac=o.stripe||(col==='#f4f4f4'||col==='#f0f0f0'?'#1f6fb5':'#f4f4f4');
    for(const sd of[-1,1])if(sideVis(sd)){sideQ(sd,L2-.4,-L2+.4,2.4,3.1,ac);const n=Math.max(4,Math.round(o.L/4.2)),a0=L2-3.6,a1=-L2+.8,stp=(a0-a1)/n;
      for(let i=0;i<n;i++){const u0=a0-i*stp-.25,u1=a0-(i+1)*stp+.25;sideQ(sd,u0,u1,4.3,6.9,glass)}
      sideQ(sd,L2-.4,L2-3.2,4.3,6.9,glass);if(sd===1){sideQ(sd,L2-.7,L2-3,1,6.9,'#1b2638',.06);sideQ(sd,L2-1.82,L2-1.88,1,6.9,'#9aa0a6',.08)}
      sideQ(sd,L2-.4,-L2+.4,7.5,7.8,st)}
    if(frontVis){endQ(L2+.04,-W2+.4,W2-.4,3.6,7.3,glass);endQ(L2+.05,-W2+.9,W2-.9,7.45,8,'#111');if(fine)endQ(L2+.06,-W2+1.4,W2-1.4,7.55,7.9,'#ffb000');endQ(L2+.05,-W2+.8,W2-.8,1.2,2.2,'#2a2a30');
      lamp(L2+.02,-W2+1,1.5,'#fff6b0');lamp(L2+.02,W2-1,1.5,'#fff6b0');for(const sd of[-1,1])box(ctx,C,V,R2(L2+1.2,L2+.6,sd*(W2+.9),sd*(W2+.4)),4.5,6.4,'#1d1d22')}
    if(rearVis){endQ(-L2-.04,-W2+.8,W2-.8,4.8,7.2,glass);endQ(-L2-.05,-W2+.8,W2-.8,1,1.8,'#2a2a30');lamp(-L2-.02,-W2+1,1.5,tl);lamp(-L2-.02,W2-1,1.5,tl);if(blinkOn&&o.bl)lamp(-L2-.02,-W2+.6,2.6,'#ffb000',.4);if(blinkOn&&o.br)lamp(-L2-.02,W2-.6,2.6,'#ffb000',.4)}
    if(fine)box(ctx,C,V,R2(L2*.2,-L2*.25,-W2*.5,W2*.5),8.2,8.9,'#cfd4da');
    if(frontVis&&blinkOn){if(o.bl)lamp(L2+.02,-W2+.5,2.4,'#ffb000',.35);if(o.br)lamp(L2+.02,W2-.5,2.4,'#ffb000',.35)}return}
  if(o.type==='pickup'){
  // ayudas: cara vertical de un lado (sd=-1/1) o de frente/atrás (fa=L2/-L2), solo si mira a la cámara
  const R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],fine=GFX===32&&(V===VMAIN||V.show);
  const sideVis=sd=>{const q=pt(0,sd*W2);return(C.x-q[0])*(-s*sd)+(C.y-q[1])*(c*sd)>0};
  const sideQ=(sd,a0,a1,z0,z1,cl,e=.04)=>{const b=sd*(W2+e);poly(ctx,proj(C,V,[[...pt(a0,b),z0],[...pt(a1,b),z0],[...pt(a1,b),z1],[...pt(a0,b),z1]]),cl)};
  const endQ=(a,b0,b1,z0,z1,cl)=>poly(ctx,proj(C,V,[[...pt(a,b0),z0],[...pt(a,b1),z0],[...pt(a,b1),z1],[...pt(a,b0),z1]]),cl);
  const wheel=(a,sd,len,wd,ht)=>{box(ctx,C,V,R2(a+len/2,a-len/2,sd*(W2+.2),sd*(W2+.2-wd)),0,ht,'#16161a');if(fine)box(ctx,C,V,R2(a+len*.28,a-len*.28,sd*(W2+.26),sd*(W2+.12)),ht*.25,ht*.75,'#b9bec6',{top:'#8e949c'})};
    const stA=o.player?clamp(o.steer||0,-1,1)*.42:0,wa=L2-2.5,wb=-L2+2.6;
    for(const[a,an]of[[wa,stA],[wb,0]])for(const sd of[-1,1]){const ac=a,bc=sd*(W2-.5),pR=(x,y)=>{const ca=Math.cos(an),sa=Math.sin(an);return pt(ac+ca*x-sa*y,bc+sa*x+ca*y)};
      box(ctx,C,V,[pR(1.4,-.8),pR(1.4,.8),pR(-1.4,.8),pR(-1.4,-.8)],0,2.7,'#16161a');if(fine)box(ctx,C,V,[pR(.75,sd*.72),pR(.75,sd*.88),pR(-.75,sd*.88),pR(-.75,sd*.72)],.6,2.1,'#b9bec6',{top:'#8e949c'})}
    box(ctx,C,V,R2(L2,-L2,-W2,W2),1.4,2.8,shade(col,-.14));box(ctx,C,V,R2(L2+.35,L2,-W2+.4,W2-.4),1.1,2.1,'#2a2a30');box(ctx,C,V,R2(-L2,-L2-.35,-W2+.4,W2-.4),1.1,2,'#2a2a30');
    const bf=-L2*.2,bt=-L2+.15;// cajón: de bf (atrás de la cabina) a bt (compuerta)
    box(ctx,C,V,R2(L2-.25,bf+.05,-W2+.1,W2-.1),2.8,3.9,col,{top:shade(col,.16)});
    const wf=W2*.9,wt=W2*.78,cab=()=>{box(ctx,C,V,R2(L2*.42,bf+.12,-wf,wf),3.9,5,col,{top:col});if(fine)for(const sd of[-1,1]){const b=sd*(wf+.03);poly(ctx,proj(C,V,[[...pt(L2*.42-2.6,b),4],[...pt(L2*.42-2.6,b),4.95],[...pt(L2*.42-2.75,b),4.95],[...pt(L2*.42-2.75,b),4]]),shade(col,-.3))}frustum(ctx,C,V,R2(L2*.42,bf+.12,-wf,wf),5,R2(L2*.42-1.1,bf+.25,-wt,wt),7.4,'#26364f',shade(col,-.04))};
    const mir=sd=>[pt(L2*.42-.45,sd*(W2+.3)),()=>box(ctx,C,V,R2(L2*.42-.1,L2*.42-.8,sd*(W2+.6),sd*W2),3.9,4.6,col)];byDepth(C,[[pt((L2*.42+bf)/2,0),cab],mir(-1),mir(1)]);
    if(C.z>2.9)poly(ctx,proj(C,V,R2(bf,bt,-W2+.4,W2-.4).map(q=>[q[0],q[1],2.85])),'#2c2c32');
    const walls=[[R2(bf+.05,bf-.3,-W2+.1,W2-.1),col],[R2(bt+.3,bt-.05,-W2+.1,W2-.1),shade(col,-.06)],[R2(bf,bt,-W2+.1,-W2+.45),col],[R2(bf,bt,W2-.45,W2-.1),col]];
    walls.map(w=>{let mx=0,my=0;for(const q of w[0]){mx+=q[0];my+=q[1]}return[Math.hypot(mx/4-C.x,my/4-C.y),w]}).sort((a,b)=>b[0]-a[0]).forEach(([,w])=>box(ctx,C,V,w[0],2.8,4.2,w[1],{top:shade(col,.2)}));
    if(frontVis){endQ(L2+.05,-W2+.9,W2-.9,2.3,3.6,'#1d1d22');if(fine){endQ(L2+.06,-W2+.9,W2-.9,2.6,2.7,'#c9ccd1');endQ(L2+.06,-W2+.9,W2-.9,3.05,3.15,'#c9ccd1')}}
    carLights(ctx,C,V,o,blinkOn,L2,W2,pt,3.3,rearVis,frontVis);return}
  // llantas, carrocería en dos niveles, bumpers, cabina con parabrisas inclinado y espejos
  const wa=L2-2.4,R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],stA=o.player?clamp(o.steer||0,-1,1)*.42:0,fine=GFX===32&&(V===VMAIN||V.show);
  const TY={hyper:{l0:.45,l1:1.25,u1:1.95,zt:3.45,cf:[.1,-.48],wh:1.5,glow:'0,240,255'},tuner:{l0:.5,l1:1.5,u1:2.35,zt:4.1,cf:[.2,-.5],wh:1.6,glow:'255,40,200'},muscle:{l0:.75,l1:1.9,u1:2.75,zt:4.3,cf:[.02,-.62],wh:1.8},rally:{l0:1.15,l1:2.3,u1:3.15,zt:5.3,cf:[.25,-.6],wh:2.1}}[o.type]||{l0:.7,l1:1.9,u1:2.8,zt:o.type==='suv'?5.4:4.8,cf:o.type==='pickup'?[.45,-.1]:(o.type==='hatch'||o.type==='suv')?[.3,-.85]:[.25,-.55],wh:1.7};
  const sQ=(sd,a0,a1,z0,z1,cl)=>{const b=sd*(W2+.03),q=pt(0,sd*W2);if((C.x-q[0])*(-s*sd)+(C.y-q[1])*(c*sd)<=0)return;poly(ctx,proj(C,V,[[...pt(a0,b),z0],[...pt(a1,b),z0],[...pt(a1,b),z1],[...pt(a0,b),z1]]),cl)};
  if(fine&&TY.glow){ctx.save();ctx.globalCompositeOperation='lighter';const gp=Math.sin(performance.now()/260)*.08;poly(ctx,proj(C,V,R2(L2+1.4,-L2-1.4,-W2-1.6,W2+1.6).map(q=>[q[0],q[1],.05])),`rgba(${TY.glow},${.22+gp})`);poly(ctx,proj(C,V,R2(L2,-L2,-W2-.4,W2+.4).map(q=>[q[0],q[1],.06])),`rgba(${TY.glow},${.35+gp})`);ctx.restore()}
  const pR=(ac,bc,an,a,b)=>{const ca=Math.cos(an),sa=Math.sin(an);return pt(ac+ca*a-sa*b,bc+sa*a+ca*b)};
  for(const a of[wa,-wa+.4])for(const sd of[-1,1]){const ac=a-1.1,bc=sd*(W2-.525),an=a===wa?stA:0;
    const wh=TY.wh,wl=wh>1.9?1.25:1.1;box(ctx,C,V,[pR(ac,bc,an,wl,-.675),pR(ac,bc,an,wl,.675),pR(ac,bc,an,-wl,.675),pR(ac,bc,an,-wl,-.675)],0,wh,'#16161a');
    if(fine)box(ctx,C,V,[pR(ac,bc,an,.6,sd*.6),pR(ac,bc,an,.6,sd*.74),pR(ac,bc,an,-.6,sd*.74),pR(ac,bc,an,-.6,sd*.6)],wh*.24,wh*.76,o.type==='hyper'||o.type==='tuner'?'#2b2d33':'#b9bec6',{top:'#8e949c'})}
  const{l0,l1,u1}=TY,arc=o.type==='hyper'||o.type==='tuner'||o.type==='muscle'||o.type==='rally';
  box(ctx,C,V,R2(L2,-L2,-W2,W2),l0,l1,shade(col,-.12));box(ctx,C,V,R2(L2-.3,-L2+.2,-W2+.15,W2-.15),l1,u1,col,{top:shade(col,.18)});
  if(fine&&C.z>u1+.2){const gl=(a0,a1,b0,b1,al)=>poly(ctx,proj(C,V,[[...pt(a0,b0),u1+.03],[...pt(a0,b1),u1+.03],[...pt(a1,b1),u1+.03],[...pt(a1,b0),u1+.03]]),`rgba(255,255,255,${al})`);gl(L2-.6,L2*.3,-W2*.35,W2*.1,.16);gl(L2-.6,L2*.3,-W2*.12,-W2*.02,.22);gl(-L2+.5,-L2*.55,-W2*.35,W2*.1,.12)}
  const bc0=o.type==='muscle'?'#c9ccd1':'#2a2a30';box(ctx,C,V,R2(L2+.35,L2,-W2+.5,W2-.5),l0-.1,l0+.7,bc0);box(ctx,C,V,R2(-L2,-L2-.35,-W2+.5,W2-.5),l0-.1,l0+.7,bc0);
  // franjas, tomas de aire y faldones de los arcade (antes de la cabina)
  if(fine&&arc){
    if(o.type==='muscle'&&C.z>u1+.2)for(const b of[-.95,.35])poly(ctx,proj(C,V,R2(L2-.3,-L2+.2,b,b+.6).map(q=>[q[0],q[1],u1+.04])),'rgba(245,245,245,.92)');
    if(o.type==='muscle')box(ctx,C,V,R2(L2*.75,L2*.32,-W2*.28,W2*.28),u1,u1+.55,'#1b1b1f',{top:'#2a2a30'});
    if(o.type==='hyper')for(const sd of[-1,1])sQ(sd,-L2*.05,-L2*.55,l0+.15,l1-.05,'#0d0d10');
    if(o.type==='tuner'){for(const sd of[-1,1]){box(ctx,C,V,R2(L2-2.2,-L2+2.2,sd*(W2+.3),sd*(W2-.2)),.3,.75,'#111');sQ(sd,L2-.5,-L2+.5,l1-.25,l1+.05,'rgb('+TY.glow+')')}}
    if(o.type==='rally'){for(const sd of[-1,1]){sQ(sd,L2-.4,-L2+.4,l1-.1,l1+.3,'#ffd23f');box(ctx,C,V,R2(-L2+2.9,-L2+2.6,sd*(W2-.1),sd*(W2-1.1)),.2,1.3,'#111')}}}
  const cf=TY.cf,zt=TY.zt,wf=W2*(o.type==='hyper'?.8:.84),wt=W2*(o.type==='hyper'?.6:.68);
  {const mir=sd=>[pt(L2*cf[0]-.55,sd*(W2+.3)),()=>box(ctx,C,V,R2(L2*cf[0]-.2,L2*cf[0]-.9,sd*(W2+.6),sd*W2),u1,u1+.6,col)];
   byDepth(C,[[pt(L2*(cf[0]+cf[1])/2,0),()=>frustum(ctx,C,V,R2(L2*cf[0],L2*cf[1],-wf,wf),u1,R2(L2*cf[0]-(o.type==='hyper'?2.4:1.7),L2*cf[1]+(o.type==='suv'||o.type==='hatch'?.3:1),-wt,wt),zt,'#26364f',shade(col,-.06))],mir(-1),mir(1)])}
  if(fine&&arc){
    if(o.type==='muscle'&&C.z>zt+.2)for(const b of[-.75,.25])poly(ctx,proj(C,V,R2(L2*cf[0]-1.8,L2*cf[1]+1.1,b,b+.5).map(q=>[q[0],q[1],zt+.03])),'rgba(245,245,245,.92)');
    if(o.type==='rally'){const a0=L2*cf[0]-1.9;box(ctx,C,V,R2(a0,a0-.6,-W2*.62,W2*.62),zt,zt+.45,'#111');for(const b of[-1.6,-.55,.55,1.6]){const q=pt(a0+.02,b);poly(ctx,proj(C,V,[[...pt(a0+.03,b-.4),zt+.05],[...pt(a0+.03,b+.4),zt+.05],[...pt(a0+.03,b+.4),zt+.4],[...pt(a0+.03,b-.4),zt+.4]]),'#fff3c4');if(o.lights||nightK()>.4)LIGHTQ.push({x:q[0],y:q[1],z:zt+.22,r:1.6,col:'rgba(255,240,190,.8)'})}}}
  if(o.type==='taxi')box(ctx,C,V,[pt(.6,-1),pt(.6,1),pt(-.6,1),pt(-.6,-1)],4.8,5.6,'#ffd23f');
  if(o.type==='tuner'||o.type==='hyper'){const zw=u1+(o.type==='tuner'?1.5:1.05);for(const sd of[-1,1])box(ctx,C,V,R2(-L2+1.1,-L2+.6,sd*W2*.45,sd*W2*.35),u1,zw,'#111');box(ctx,C,V,[pt(-L2+1.5,-W2),pt(-L2+1.5,W2),pt(-L2-.3,W2),pt(-L2-.3,-W2)],zw,zw+.35,o.type==='tuner'?shade(col,-.2):'#111');if(fine)for(const sd of[-1,1])box(ctx,C,V,R2(-L2+1.5,-L2-.3,sd*W2,sd*(W2-.2)),zw-.4,zw+.6,'#111')}
  if(o.type==='ambulance'){const fl=Math.floor(performance.now()/110)%2;box(ctx,C,V,[pt(-L2+.3,-W2+.2),pt(-L2+.3,W2-.2),pt(L2*.1,W2-.2),pt(L2*.1,-W2+.2)],2.8,5.8,'#f4f4f4',{top:'#e8e8e8'});box(ctx,C,V,[pt(-L2+.25,-W2+.15),pt(-L2+.25,W2-.15),pt(L2*.1+.05,W2-.15),pt(L2*.1+.05,-W2+.15)],3.8,4.4,'#e63946');box(ctx,C,V,[pt(1.6,-2.6),pt(1.6,0),pt(.4,0),pt(.4,-2.6)],5.4,6.2,fl?'#ff2a4a':'#ffffff');box(ctx,C,V,[pt(1.6,0),pt(1.6,2.6),pt(.4,2.6),pt(.4,0)],5.4,6.2,fl?'#ffffff':'#ff2a4a');if(fl)LIGHTQ.push({x:o.x,y:o.y,z:6,r:3,col:'rgba(255,40,60,.6)'})}
  if(o.type==='police'){const fl=Math.floor(performance.now()/125)%2;box(ctx,C,V,[pt(.8,-2.6),pt(.8,0),pt(-.3,0),pt(-.3,-2.6)],4.8,5.6,fl?'#2f6bff':'#ff2a4a');box(ctx,C,V,[pt(.8,0),pt(.8,2.6),pt(-.3,2.6),pt(-.3,0)],4.8,5.6,fl?'#ff2a4a':'#2f6bff')}
  // placas de Costa Rica (blancas con franja azul), encima de los bumpers
  if(fine){const plate=(a,vis)=>{if(!vis)return;const q=(b0,b1,z0,z1,cl)=>poly(ctx,proj(C,V,[[...pt(a,b0),z0],[...pt(a,b1),z0],[...pt(a,b1),z1],[...pt(a,b0),z1]]),cl);q(-.75,.75,.75,1.3,'#f1f3f5');q(-.75,.75,1.18,1.3,'#1f4fa0');q(-.45,.45,.86,.98,'#30343c')};plate(-L2-.37,rearVis);plate(L2+.37,frontVis)}
  carLights(ctx,C,V,o,blinkOn,L2,W2,pt,TY.u1-.35,rearVis,frontVis)}
function bubble(ctx,sx,sy,c,t){sx=Math.round(sx);sy=Math.round(sy)-10+(c.angryT>1.6?Math.floor(t*24)%2:0);const w=c.say.length*4+3,bx=Math.round(sx-w/2);
  ctx.fillStyle='#000';ctx.fillRect(bx-1,sy-1,w+2,9);ctx.fillRect(sx-2,sy+7,4,2);ctx.fillStyle='#fff';ctx.fillRect(bx,sy,w,7);ctx.fillRect(sx-1,sy+7,2,1);ptext(ctx,c.say,bx+2,sy+1,'#d00')}
const TREECOL=[['#1f5e25','#2f7d32','#4f9a45'],['#24602a','#357f36','#5aa04a'],['#2c6b2a','#3f8a37','#76b852'],['#3b6e2a','#4f8a33','#8fbf4f']];
function tree3D(ctx,C,V,x,y,r,h){const kind=(((x*7.3+y*3.1)|0)%5+5)%5,cs=TREECOL[(((x+y)|0)%4+4)%4],B=bill(C,V,x,y,0);if(!B)return;
  if(kind===4&&r<6){// palmera de monte
    const T=bill(C,V,x,y,h*1.5);if(!T)return;ctx.strokeStyle='#7a5a32';ctx.lineWidth=Math.max(1,.5*B.k);ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.lineTo(T.x,T.y);ctx.stroke();ctx.strokeStyle=cs[1];ctx.lineWidth=Math.max(1,.6*T.k);
    for(let k=0;k<6;k++){const a=k*1.05+x,dx=Math.cos(a)*4.5*T.k,dy=Math.sin(a)*1.4*T.k;ctx.beginPath();ctx.moveTo(T.x,T.y);ctx.quadraticCurveTo(T.x+dx*.6,T.y-1.2*T.k,T.x+dx,T.y+1.8*T.k+dy);ctx.stroke()}return}
  if(kind===3){// ciprés / pino alto
    const T=bill(C,V,x,y,h*1.6);if(!T)return;ctx.fillStyle='#4a3020';ctx.fillRect(B.x-.3*B.k,B.y-(B.y-T.y)*.2,Math.max(1,.6*B.k),(B.y-T.y)*.2);ctx.fillStyle=cs[0];ctx.beginPath();ctx.ellipse(T.x,(T.y+B.y)/2-(B.y-T.y)*.1,r*.55*B.k,(B.y-T.y)*.45,0,0,7);ctx.fill();ctx.fillStyle=cs[1];ctx.beginPath();ctx.ellipse(T.x-.2*r*B.k,(T.y+B.y)/2-(B.y-T.y)*.15,r*.28*B.k,(B.y-T.y)*.32,0,0,7);ctx.fill();return}
  const T=bill(C,V,x,y,h);if(!T)return;ctx.fillStyle='#5a3a22';ctx.fillRect(B.x-.4*B.k,T.y,Math.max(1,.8*B.k),B.y-T.y);
  if(kind===2){// guanacaste: copa ancha y plana
    ctx.fillStyle=cs[0];ctx.beginPath();ctx.ellipse(T.x,T.y,r*1.8*B.k,r*.7*B.k,0,0,7);ctx.fill();ctx.fillStyle=cs[1];ctx.beginPath();ctx.ellipse(T.x-.4*r*B.k,T.y-.3*r*B.k,r*1.1*B.k,r*.4*B.k,0,0,7);ctx.fill();return}
  ctx.fillStyle=cs[0];ctx.beginPath();ctx.arc(T.x,T.y,r*1.1*B.k,0,7);ctx.fill();ctx.fillStyle=cs[1];ctx.beginPath();ctx.arc(T.x+.35*r*B.k,T.y+.1*r*B.k,r*.7*B.k,0,7);ctx.fill();
  ctx.fillStyle=cs[2];ctx.beginPath();ctx.arc(T.x-.3*r*B.k,T.y-.35*r*B.k,r*.45*B.k,0,7);ctx.fill()}
function bush3D(ctx,C,V,b){const B=bill(C,V,b.x,b.y,0),T=bill(C,V,b.x,b.y,b.h);if(!B||!T||B.f>200)return;ctx.fillStyle=b.c;ctx.beginPath();ctx.ellipse(B.x,(B.y+T.y)/2,b.r*B.k,(B.y-T.y)/2+.5,0,0,7);ctx.fill();ctx.fillStyle=shade(b.c,.18);ctx.beginPath();ctx.ellipse(B.x-b.r*.3*B.k,(B.y+T.y)/2-(B.y-T.y)*.15,b.r*.5*B.k,(B.y-T.y)*.3+.5,0,0,7);ctx.fill()}
function drawObjects3D(V,C,W,P,t,maxD,mirror){const ctx=V.ctx;const items=[];const blinkOn=Math.floor(t*2.6)%2===0;
  const add=(x,y,rad,fn)=>{const q=camXform(C,x,y);if(q.f<-rad||q.f>maxD)return;if(Math.abs(q.r)>Math.max(0,q.f)*(V.cx/V.foc)+rad+6)return;items.push({d:q.f,fn,x,y,rad,r:q.r})};
  const addO=(x,y,rad,fn)=>add(x,y,rad,mirror||TOUCH?fn:()=>{OUTL3D=2;try{fn()}finally{OUTL3D=0}});
  const SPL=[],addS=(x,y,rad,fn,ol)=>{const q=camXform(C,x,y);if(q.f<-rad||q.f>maxD)return;if(Math.abs(q.r)>Math.max(0,q.f)*(V.cx/V.foc)+rad+6)return;SPL.push([fn,ol&&!mirror&&!TOUCH?2:0])};
  if(S&&S.exam&&!mirror){const tk=S.tasks[S.task];if(tk&&tk.zone){poly(ctx,proj(C,V,zonePts(tk.zone).map(p=>[p[0],p[1],.05])),Math.floor(t*2.6)%2?'rgba(255,210,63,.45)':'rgba(255,210,63,.2)')}}
  if(W.cLights)for(const L of W.cLights){const sx=L.x+(-L.uy)*(L.w+3),sy=L.y+L.ux*(L.w+3);add(sx,sy,2,()=>{box(ctx,C,V,[[sx-.5,sy-.5],[sx+.5,sy-.5],[sx+.5,sy+.5],[sx-.5,sy+.5]],0,13,'#5c677d');const n=L.kind==='sem3'?3:2,st=semState(L,t);
    box(ctx,C,V,[[sx-1.2,sy-1.2],[sx+1.2,sy-1.2],[sx+1.2,sy+1.2],[sx-1.2,sy+1.2]],13,13+n*2.2,'#1b1b22');const cols=L.kind==='sem3'?[['R','#ff2a2a'],['A','#ffd23f'],['V','#3ddc84']]:[['R','#ff2a2a'],['V','#3ddc84']];
    cols.forEach(([k,c],i)=>{const B=bill(C,V,sx-L.ux*1.3,sy-L.uy*1.3,13+n*2.2-1.1-i*2.2);if(!B)return;ctx.fillStyle=st===k?c:'#2a2a30';ctx.beginPath();ctx.arc(B.x,B.y,Math.max(1,.8*B.k),0,7);ctx.fill();if(st===k)glow(ctx,B.x,B.y,Math.max(3,2.2*B.k),c+'66')})})}
  if(W.roofs)for(const q of W.roofs){const cx=q.reduce((s,r)=>s+r[0],0)/q.length,cy=q.reduce((s,r)=>s+r[1],0)/q.length,rad=Math.max(...q.map(r=>Math.hypot(r[0]-cx,r[1]-cy)));add(cx,cy,rad,()=>poly(ctx,proj(C,V,q.map(r=>[r[0],r[1],q.h||16])),'rgba(31,63,143,.88)'))}
  if(W.pblds)for(const b of W.pblds)addS(b.cx,b.cy,b.rad,()=>box(ctx,C,V,b.p,0,b.ht,b.col,{win:true,top:b.roof}));
  for(const b of W.blds)if(!b.parts&&!b.tower)addS(b.x+b.w/2,b.y+b.h/2,Math.hypot(b.w,b.h)/2,()=>{const near=Math.hypot(b.x+b.w/2-C.x,b.y+b.h/2-C.y)<85+Math.max(b.w,b.h)/2;box(ctx,C,V,[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]],0,b.ht,b.col,{win:b.win||true,top:b.roof,near:b.H?near:false,shop:b.shop})},true);
  for(const b of W.blds)if(b.parts||b.tower)addO(b.x+b.w/2,b.y+b.h/2,Math.hypot(b.w,b.h)/2,()=>{const near=Math.hypot(b.x+b.w/2-C.x,b.y+b.h/2-C.y)<85+Math.max(b.w,b.h)/2;
    if(b.parts){parts3D(ctx,C,V,b,near);if(!b.tower)return}
    else box(ctx,C,V,[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]],0,b.ht,b.tower?'#1f4f8a':b.col,{win:b.win||true,top:b.roof,near:b.H?near:false,shop:b.shop});
    if(b.tower){const cx=b.x+b.w/2,cy=b.y+b.h/2,on=Math.sin(t*3)>0;if(b.parts){for(const[a,c]of[[[cx+15.5,cy-26.1],[cx-15.5,cy-26.1]],[[cx-15.5,cy+26.1],[cx+15.5,cy+26.1]],[[cx-26.1,cy-13.5],[cx-26.1,cy+13.5]],[[cx+26.1,cy+13.5],[cx+26.1,cy-13.5]]])logoFace(ctx,C,V,a,c,151,171,on)}
      const T=bill(C,V,cx,cy,b.parts?b.ht:b.ht+16);if(T&&Math.floor(t*2)%2){ctx.fillStyle='#ff2a2a';ctx.beginPath();ctx.arc(T.x,T.y,Math.max(1.5,.8*T.k),0,7);ctx.fill()}}});
  {const ph=(Math.sin(t*3)+1)/2,col=ph>.5?'#ff3df2':'#3df2ff';
    const neon=(x,y,z,wl)=>{const B=bill(C,V,x,y,z);if(!B)return;const w=Math.min(380,Math.max(10,wl*B.k)),h=w*34/52;ctx.imageSmoothingEnabled=false;ctx.drawImage(PZLOGO,Math.round(B.x-w/2),Math.round(B.y-h/2),Math.round(w),Math.round(h))};
    if(W.billboards)for(const b of W.billboards)add(b.cx,b.cy,18,()=>{box(ctx,C,V,[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]],5,15,'#fafafa');for(const q of b.o==='h'?[[b.x+4,b.cy],[b.x+b.w-4,b.cy]]:[[b.cx,b.y+4],[b.cx,b.y+b.h-4]])box(ctx,C,V,[[q[0]-.4,q[1]-.4],[q[0]+.4,q[1]-.4],[q[0]+.4,q[1]+.4],[q[0]-.4,q[1]+.4]],0,6,'#888');
      if(b.o==='h'){logoFace(ctx,C,V,[b.x+b.w-1,b.y-.05],[b.x+1,b.y-.05],5.6,14.4);logoFace(ctx,C,V,[b.x+1,b.y+b.h+.05],[b.x+b.w-1,b.y+b.h+.05],5.6,14.4)}else{logoFace(ctx,C,V,[b.x+b.w+.05,b.y+b.h-1],[b.x+b.w+.05,b.y+1],5.6,14.4);logoFace(ctx,C,V,[b.x-.05,b.y+1],[b.x-.05,b.y+b.h-1],5.6,14.4)}});
    for(const b of W.blds)if(b.pulzar)add(b.x+b.w/2,b.y+b.h/2,Math.hypot(b.w,b.h)/2+2,()=>{const cx=b.x+b.w/2,cy=b.y+b.h/2,hz=b.w>=b.h,L=Math.min(26,(hz?b.w:b.h)-4)/2,z0=b.ht+1.5,z1=z0+L*1.3;
      const a=hz?[cx-L,cy]:[cx,cy-L],c=hz?[cx+L,cy]:[cx,cy+L];box(ctx,C,V,hz?[[a[0],cy-.4],[c[0],cy-.4],[c[0],cy+.4],[a[0],cy+.4]]:[[cx-.4,a[1]],[cx+.4,a[1]],[cx+.4,c[1]],[cx-.4,c[1]]],z0,z1,'#f7f7f7',{top:'#ddd'});
      if(hz){logoFace(ctx,C,V,[c[0]-.5,cy-.45],[a[0]+.5,cy-.45],z0+.4,z1-.4);logoFace(ctx,C,V,[a[0]+.5,cy+.45],[c[0]-.5,cy+.45],z0+.4,z1-.4)}else{logoFace(ctx,C,V,[cx+.45,c[1]-.5],[cx+.45,a[1]+.5],z0+.4,z1-.4);logoFace(ctx,C,V,[cx-.45,a[1]+.5],[cx-.45,c[1]-.5],z0+.4,z1-.4)}});
    if(W.signs)for(const s of W.signs)add(s.x,s.y,1,()=>{const B=bill(C,V,s.x,s.y,0),T=bill(C,V,s.x,s.y,6.5);if(!B)return;ctx.fillStyle='#888';ctx.fillRect(B.x-Math.max(.5,.15*B.k),T.y,Math.max(1,.3*B.k),B.y-T.y);const r=Math.max(2,1.8*B.k);
      ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(T.x,T.y-r-1);ctx.lineTo(T.x+r+1,T.y);ctx.lineTo(T.x,T.y+r+1);ctx.lineTo(T.x-r-1,T.y);ctx.fill();ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(T.x,T.y-r);ctx.lineTo(T.x+r,T.y);ctx.lineTo(T.x,T.y+r);ctx.lineTo(T.x-r,T.y);ctx.fill();
      if(r>9){const tx=s.t.split(' ');ptext(ctx,tx[0],Math.round(T.x-tx[0].length*2),Math.round(T.y-6),'#000');ptext(ctx,tx[1],Math.round(T.x-tx[1].length*2),Math.round(T.y+1),'#000')}})}
  if(W.fountains)for(const f of W.fountains)add(f.x,f.y,6,()=>{box(ctx,C,V,[[f.x-5,f.y-5],[f.x+5,f.y-5],[f.x+5,f.y+5],[f.x-5,f.y+5]],0,1.2,'#9aa5b1',{top:'#4dc3ff'});const T=bill(C,V,f.x,f.y,3+Math.sin(t*6)*.5),B=bill(C,V,f.x,f.y,1.2);if(T&&B){ctx.fillStyle='#bfe9ff';ctx.fillRect(T.x-Math.max(.5,.3*B.k),T.y,Math.max(1,.6*B.k),B.y-T.y)}});
  if(W.stalls)for(const s of W.stalls)add(s.x,s.y,4,()=>{box(ctx,C,V,[[s.x-1.6,s.y-1],[s.x+1.6,s.y-1],[s.x+1.6,s.y+1],[s.x-1.6,s.y+1]],0,2.2,'#8d6e63');box(ctx,C,V,[[s.x-.15,s.y-.15],[s.x+.15,s.y-.15],[s.x+.15,s.y+.15],[s.x-.15,s.y+.15]],2.2,4.3,'#ddd');box(ctx,C,V,octPts(s.x,s.y,3),4.3,4.9,s.col)});
  if(W.walls)for(const q of W.walls)addS(q.cx,q.cy,q.r,()=>box(ctx,C,V,q.p,0,q.ht,q.col,{top:q.col}));
  if(W.turbines)for(const T of W.turbines)add(T.x,T.y,30,()=>turbine3D(ctx,C,V,T,t));
  if(W.jets)for(const J of W.jets){const j=jetPos(J,t);if(j)add(j.x,j.y,22,()=>jet3D(ctx,C,V,j))}
  if(W.cows)for(const c of W.cows)add(c.x,c.y,3,()=>cow3D(ctx,C,V,c));if(W.ccow&&W.ccow.v){const c=W.ccow;add(c.x,c.y,3,()=>{if(c.kind==='mono'){const B=bill(C,V,c.x,c.y,0),T=bill(C,V,c.x,c.y,1.8);if(!B||!T)return;const w=Math.max(1.5,1.4*B.k);ctx.fillStyle='#6d4c2f';ctx.fillRect(B.x-w/2,T.y,w,B.y-T.y);ctx.fillStyle='#f1d3a8';ctx.beginPath();ctx.arc(T.x,T.y,w*.45,0,7);ctx.fill();ctx.strokeStyle='#6d4c2f';ctx.lineWidth=Math.max(1,.3*B.k);ctx.beginPath();ctx.moveTo(B.x-w/2,B.y-w);ctx.quadraticCurveTo(B.x-w*2,B.y-w*3,B.x-w*1.2,T.y-w);ctx.stroke()}else cow3D(ctx,C,V,c)})}
  const f0=items.length;if(W.flags)for(const f of W.flags)add(f.x,f.y,6,()=>{const B=bill(C,V,f.x,f.y,f.z-9),T=bill(C,V,f.x,f.y,f.z);if(!B||!T)return;ctx.fillStyle='#ddd';ctx.fillRect(T.x-Math.max(.5,.12*B.k),T.y,Math.max(1,.24*B.k),B.y-T.y);
    const rows=['#002b7f','#fff','#ce1126','#ce1126','#fff','#002b7f'],fw=6*T.k,fh=3.6*T.k,n=8;for(let c=0;c<n;c++){const dy=Math.sin(t*6-c*.8)*.4*T.k*c/n;for(let r=0;r<6;r++){ctx.fillStyle=rows[r];ctx.fillRect(T.x+c*fw/n,T.y+r*fh/6+dy,fw/n+.6,fh/6+.6)}}});for(let i=f0;i<items.length;i++)items[i].d-=80;
  const VD=TOUCH?200:330;for(const tr of W.trees){if(Math.abs(tr.x-C.x)+Math.abs(tr.y-C.y)>VD)continue;add(tr.x,tr.y,tr.r,()=>tree3D(ctx,C,V,tr.x,tr.y,tr.r,9))}
  if(W.bushes)for(const b of W.bushes){if(Math.abs(b.x-C.x)+Math.abs(b.y-C.y)>(TOUCH?110:200))continue;add(b.x,b.y,b.r,()=>bush3D(ctx,C,V,b))}
  if(W.palms)for(const p of W.palms)if(Math.abs(p.x-C.x)+Math.abs(p.y-C.y)<260)add(p.x,p.y,5,()=>{const B=bill(C,V,p.x,p.y,0),T=bill(C,V,p.x,p.y,14);if(!B||!T)return;ctx.strokeStyle='#8a6a3a';ctx.lineWidth=Math.max(1,.5*B.k);ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.quadraticCurveTo(B.x+.8*B.k,(B.y+T.y)/2,T.x,T.y);ctx.stroke();
    ctx.strokeStyle='#2f9e44';ctx.lineWidth=Math.max(1,.6*T.k);for(let k=0;k<7;k++){const a=p.r+k*.9,dx=Math.cos(a)*5*T.k,dy=Math.sin(a)*1.6*T.k;ctx.beginPath();ctx.moveTo(T.x,T.y);ctx.quadraticCurveTo(T.x+dx*.6,T.y-1.5*T.k+dy*.5,T.x+dx,T.y+1.8*T.k+dy);ctx.stroke()}});
  for(const f of W.fences){const L=Math.hypot(f[2]-f[0],f[3]-f[1]);const n=Math.ceil(L/30);for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n;const ax=f[0]+(f[2]-f[0])*a,ay=f[1]+(f[3]-f[1])*a,bx=f[0]+(f[2]-f[0])*b,by=f[1]+(f[3]-f[1])*b;const nx=-(by-ay)/(L/n)*.3,ny=(bx-ax)/(L/n)*.3;add((ax+bx)/2,(ay+by)/2,16,()=>box(ctx,C,V,[[ax+nx,ay+ny],[bx+nx,by+ny],[bx-nx,by-ny],[ax-nx,ay-ny]],0,5,'#8a9aa8'))}}
  for(const R of W.rounds)if(!(W.statue&&Math.hypot(W.statue.x+W.statue.w/2-R.x,W.statue.y+W.statue.h/2-R.y)<6))add(R.x,R.y,8,()=>tree3D(ctx,C,V,R.x,R.y,7,13));
  for(const p of W.parked)add(p.x,p.y,10,()=>car3D(ctx,C,V,{x:p.x,y:p.y,h:p.h,type:p.type,col:p.col,L:VEH[p.type].L,Wd:VEH[p.type].Wd},false));
  if(S&&(S.foot||S.chase)&&S.W===W&&P&&!mirror)add(P.x,P.y,P.L/2+2,()=>car3D(ctx,C,V,{...P,bl:(P.blinkL||P.haz),br:(P.blinkR||P.haz),boost:P.boost,rev:P.gear===-1,brake:P.brake||P.bp>0},blinkOn));
  if(S&&S.cop&&S.W===W){const K=S.cop;add(K.x,K.y,10,()=>car3D(ctx,C,V,K,blinkOn))}
  for(const c of W.ai.concat(W.ringCars))add(c.x,c.y,c.L/2+2,()=>{car3D(ctx,C,V,c,blinkOn);if(c.angryT>0&&!mirror){const B=bill(C,V,c.x,c.y,8);if(B&&B.f<170)bubble(ctx,B.x,B.y,c,t)}});
  const ped3=p=>add(p.x,p.y,1,()=>{if(p.dog){const B=bill(C,V,p.x,p.y,0),T=bill(C,V,p.x,p.y,1.6);if(!B)return;const w=Math.max(2,2.2*B.k),hh=B.y-T.y,lg=Math.sin((p.an||0)*14)*.15*w;ctx.fillStyle=p.col;ctx.fillRect(B.x-w/2,T.y,w,hh*.6);ctx.fillRect(B.x+w/2-w*.1,T.y-hh*.35,w*.35,hh*.45);ctx.fillStyle=shade(p.col,-.3);ctx.fillRect(B.x-w/2+lg,B.y-hh*.4,Math.max(1,w*.15),hh*.4);ctx.fillRect(B.x+w/2-w*.2-lg,B.y-hh*.4,Math.max(1,w*.15),hh*.4);return}
    personize(p);
    const B=bill(C,V,p.x,p.y,0),T=bill(C,V,p.x,p.y,p.ht);if(!B)return;const w=Math.max(1,1.3*B.k),hh=B.y-T.y,sw=Math.sin((p.an||0)*9)*w*.3;
    if(p.dress){ctx.fillStyle=p.skin;ctx.fillRect(B.x-w*.4+sw*.4,B.y-hh*.42,w*.3,hh*.42);ctx.fillRect(B.x+w*.1-sw*.4,B.y-hh*.42,w*.3,hh*.42);ctx.fillStyle='#222';ctx.fillRect(B.x-w*.42+sw*.4,B.y-Math.max(1,hh*.05),w*.34,Math.max(1,hh*.05));ctx.fillRect(B.x+w*.08-sw*.4,B.y-Math.max(1,hh*.05),w*.34,Math.max(1,hh*.05));
      ctx.fillStyle=p.col;ctx.beginPath();ctx.moveTo(B.x-w*.5,T.y+hh*.3);ctx.lineTo(B.x+w*.5,T.y+hh*.3);ctx.lineTo(B.x+w*.72,B.y-hh*.28);ctx.lineTo(B.x-w*.72,B.y-hh*.28);ctx.fill()}
    else{ctx.fillStyle=p.pants;ctx.fillRect(B.x-w/2+sw*.5,B.y-hh*.42,w*.45,hh*.42);ctx.fillRect(B.x+w*.05-sw*.5,B.y-hh*.42,w*.45,hh*.42);ctx.fillStyle='#222';ctx.fillRect(B.x-w/2+sw*.5,B.y-Math.max(1,hh*.05),w*.5,Math.max(1,hh*.05));ctx.fillRect(B.x+w*.05-sw*.5,B.y-Math.max(1,hh*.05),w*.5,Math.max(1,hh*.05))}
    ctx.fillStyle=p.col;ctx.fillRect(B.x-w/2,T.y+hh*.2,w,hh*.42);ctx.fillStyle=shade(p.col,-.2);ctx.fillRect(B.x-w/2-w*.22,T.y+hh*.22-sw*.2,w*.22,hh*.34);ctx.fillRect(B.x+w/2,T.y+hh*.22+sw*.2,w*.22,hh*.34);
    // cabeza un poco más grande (estilo simpático) y cara hacia donde mira la persona
    const hr=Math.max(1,.62*B.k);let ph=p.h!=null?p.h:p.face!=null?p.face:(p.vx||p.vy)?Math.atan2(p.vy,p.vx):null;if(p.dir!=null&&ph==null)ph=p.dir>0?0:Math.PI;
    let dir=1;if(ph!=null){const tx=C.x-p.x,ty=C.y-p.y,tl=Math.hypot(tx,ty)||1,dt=(Math.cos(ph)*tx+Math.sin(ph)*ty)/tl,cr=(Math.cos(ph)*ty-Math.sin(ph)*tx)/tl;dir=dt<-.45?0:dt>.45?1:(cr>0?-.8:.8)}
    const near=P&&Math.abs(P.v)>8&&Math.hypot(P.x-p.x,P.y-p.y)<14;
    drawFace(ctx,T.x,T.y+hh*.1,hr,p,dir,t,near?'susto':p.mood||'')});
  if(S&&S.smoke&&S.W===W)for(const q of S.smoke){if(q.t>1.2)continue;add(q.x,q.y,1,()=>{const B=bill(C,V,q.x,q.y,1+q.t*3);if(!B)return;ctx.fillStyle=`rgba(225,225,230,${.4*(1-q.t/1.2)})`;ctx.beginPath();ctx.arc(B.x,B.y,Math.max(1,(1+q.t*4)*B.k),0,7);ctx.fill()})}
  for(const z of W.zebras)for(const p of z.peds)ped3(p);
  if(W.walkers)for(const p of W.walkers)ped3(p);if(S&&S.foot&&S.chase&&S.W===W&&!mirror)ped3(S.foot);if(W.jay)for(const p of W.jay)ped3(p);
  if(W.works)for(const r of W.works)add(r.x+r.w/2,r.y+r.h/2,12,()=>box(ctx,C,V,[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]],0,3.2,'#ff6a00',{top:'#fff'}));
  if(W.broken)for(const b of W.broken)add(b.x,b.y,10,()=>car3D(ctx,C,V,{x:b.x,y:b.y,h:b.h,type:b.type,col:b.col,L:b.L,Wd:b.Wd,bl:true,br:true},blinkOn));
  if(S&&S.W===W&&!mirror)evLive3D(add,ctx,C,V,blinkOn,ped3,W);
  for(const k of W.cones)add(k.x,k.y,1,()=>{const B=bill(C,V,k.x,k.y,0),T=bill(C,V,k.x,k.y,2.4);if(!B)return;const w=Math.max(1,.9*B.k);ctx.fillStyle=k.hit?'#b34700':k.green?'#2fbf6a':'#ff7b00';ctx.beginPath();ctx.moveTo(B.x-w,B.y);ctx.lineTo(B.x+w,B.y);ctx.lineTo(T.x,T.y);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(B.x-w*.45,B.y-(B.y-T.y)*.55,w*.9,Math.max(1,(B.y-T.y)*.15))});
  for(const s of W.stops.concat(W.yields)){const p=polePos(s);const facing=(dirVec[s.dir][0]*C.c+dirVec[s.dir][1]*C.s)>.2;
    if(s.kind==='stop'||s.kind==='yield')add(p[0],p[1],1,()=>{const B=bill(C,V,p[0],p[1],0),T=bill(C,V,p[0],p[1],7.5);if(!B)return;ctx.fillStyle='#888';ctx.fillRect(B.x-Math.max(.5,.15*B.k),T.y,Math.max(1,.3*B.k),B.y-T.y);const r=Math.max(2,(s.kind==='stop'?2.1:1.6)*B.k);
      if(s.kind==='stop'&&facing){ctx.fillStyle='#fff';ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*6.283+.39;ctx.lineTo(T.x+Math.cos(a)*(r+Math.max(.6,r*.14)),T.y+Math.sin(a)*(r+Math.max(.6,r*.14)))}ctx.fill()}
      ctx.fillStyle=facing?'#c1121f':'#777';ctx.beginPath();
      if(s.kind==='stop'){for(let i=0;i<8;i++){const a=i/8*6.283+.39;ctx.lineTo(T.x+Math.cos(a)*r,T.y+Math.sin(a)*r)}ctx.fill();if(facing&&r>7){ctx.fillStyle='#fff';ctx.font='bold '+Math.round(r*.7)+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ALTO',T.x,T.y+r*.05);ctx.textAlign='left';ctx.textBaseline='alphabetic'}else if(facing&&r>2.5){ctx.fillStyle='#fff';ctx.fillRect(T.x-r*.6,T.y-r*.15,r*1.2,Math.max(1,r*.3))}}
      else{ctx.moveTo(T.x-r,T.y-r*.7);ctx.lineTo(T.x+r,T.y-r*.7);ctx.lineTo(T.x,T.y+r);ctx.fill();if(facing&&r>3){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(T.x-r*.5,T.y-r*.45);ctx.lineTo(T.x+r*.5,T.y-r*.45);ctx.lineTo(T.x,T.y+r*.45);ctx.fill()}}});
    if(s.kind==='light'){const mid=(s.a+s.b)/2;const hp0=(s.dir==='E'||s.dir==='W')?[p[0],mid]:[mid,p[1]];const dv=dirVec[s.dir],far=2*HW+16;
      for(const[pp,hp,zt]of[[p,hp0,15],[[p[0]+dv[0]*far,p[1]+dv[1]*far],[hp0[0]+dv[0]*far,hp0[1]+dv[1]*far],11]])
      add(hp[0],hp[1],8,()=>{const st=lightState(s.light,axisOf(s.dir),t);const B=bill(C,V,pp[0],pp[1],0),T=bill(C,V,pp[0],pp[1],zt),H=bill(C,V,hp[0],hp[1],zt);
        if(B&&T){ctx.fillStyle='#555';ctx.fillRect(B.x-Math.max(.5,.2*B.k),T.y,Math.max(1,.4*B.k),B.y-T.y)}
        if(T&&H){ctx.strokeStyle='#555';ctx.lineWidth=Math.max(1,.3*H.k);ctx.beginPath();ctx.moveTo(T.x,T.y);ctx.lineTo(H.x,H.y);ctx.stroke()}
        if(H){const hw=Math.max(1.5,1.3*H.k),hh=hw*3;ctx.fillStyle='#111';ctx.fillRect(H.x-hw,H.y,hw*2,hh);
          if(facing){const L=[['R','#ff3030'],['Y','#ffd23f'],['G','#3ddc84']];L.forEach(([n,cl],i)=>{const cy=H.y+hh*(i+.5)/3;if(st===n){ctx.fillStyle=cl+'55';ctx.beginPath();ctx.arc(H.x,cy,hw*1.7,0,7);ctx.fill()}ctx.fillStyle=st===n?cl:'#2a2a2a';ctx.beginPath();ctx.arc(H.x,cy,hw*.65,0,7);ctx.fill()})}}})}
    if(s.kind==='rail'){const R=s.light;add(p[0],p[1],6,()=>{const warn=railWarn(W,R,s.ca,t);const B=bill(C,V,p[0],p[1],0),T=bill(C,V,p[0],p[1],8);if(!B)return;
      ctx.fillStyle='#ddd';ctx.fillRect(B.x-Math.max(.5,.15*B.k),T.y,Math.max(1,.3*B.k),B.y-T.y);const r=Math.max(1.5,1.6*B.k);ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,.4*B.k);
      ctx.beginPath();ctx.moveTo(T.x-r,T.y-r*.6);ctx.lineTo(T.x+r,T.y+r*.6);ctx.moveTo(T.x+r,T.y-r*.6);ctx.lineTo(T.x-r,T.y+r*.6);ctx.stroke();
      if(warn){const ph=Math.floor(t*4)%2;ctx.fillStyle=ph?'#ff2a2a':'#400';ctx.beginPath();ctx.arc(T.x-r*.7,T.y+r*1.4,r*.35,0,7);ctx.fill();ctx.fillStyle=ph?'#400':'#ff2a2a';ctx.beginPath();ctx.arc(T.x+r*.7,T.y+r*1.4,r*.35,0,7);ctx.fill();
        const hz=s.dir==='E'||s.dir==='W';const bp=s.pos+(s.dir==='E'||s.dir==='S'?2:-2);box(ctx,C,V,hz?[[bp-.3,s.a],[bp+.3,s.a],[bp+.3,s.b],[bp-.3,s.b]]:[[s.a,bp-.3],[s.b,bp-.3],[s.b,bp+.3],[s.a,bp+.3]],2.2,3,'#e83030')}})}}
  for(const R of W.rails){const tr=trainRect(W,R,t);if(!tr)continue;const v=R.o==='v';const n=Math.ceil((v?tr.h:tr.w)/28);
    for(let i=0;i<n;i++){const a0=tr.s-(i+1)*28+2,a1=a0+26;const cs=v?[[R.pos-5,a0],[R.pos+5,a0],[R.pos+5,a1],[R.pos-5,a1]]:[[a0,R.pos-5],[a1,R.pos-5],[a1,R.pos+5],[a0,R.pos+5]];const loco=i===0;
      add(v?R.pos:(a0+a1)/2,v?(a0+a1)/2:R.pos,16,()=>box(ctx,C,V,cs,.6,10,loco?'#f4c430':'#2b6cb0',{win:true}))}}
  const tg=S&&(S.exam?(S.tasks[S.task]||{}).tgt:S.dest);
  if(tg&&!mirror)add(tg.x,tg.y,2,()=>{const T=bill(C,V,tg.x,tg.y,13+Math.sin(t*4));if(!T)return;const r=Math.max(2.5,2*T.k);ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(T.x,T.y-r-1);ctx.lineTo(T.x+r+1,T.y);ctx.lineTo(T.x,T.y+r+1);ctx.lineTo(T.x-r-1,T.y);ctx.fill();ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(T.x,T.y-r);ctx.lineTo(T.x+r,T.y);ctx.lineTo(T.x,T.y+r);ctx.lineTo(T.x-r,T.y);ctx.fill()});
  for(const[fn,ol]of SPL){SPLIT=[];const k0=OUTL3D;OUTL3D=ol;try{fn()}finally{OUTL3D=k0;for(const f of SPLIT)if(f.d>-f.rad&&f.d<maxD)items.push(f);SPLIT=null}}
  items.sort((a,b)=>b.d-a.d);
  if(!V.occOn){for(const it of items){it.fn();if(LIGHTQ.length)flushLights(ctx,C,V)}return}
  const OC=400,OZ=V.oz,OY=V.oy,ON=V.on,NC=V.w>>1,occ=(col,f)=>{const b=col*OC,n=ON[col];if(!n||OZ[b]>=f)return V.h;let lo=0,hi=n-1;while(lo<hi){const m=(lo+hi+1)>>1;if(OZ[b+m]<f)lo=m;else hi=m-1}return OY[b+lo]};
  for(const it of items){const f=it.d-it.rad-2;if(f<6){it.fn();if(LIGHTQ.length)flushLights(ctx,C,V);continue}const k=V.foc/Math.max(1,it.d-it.rad*.5);
    const c0=clamp(((V.cx+(it.r-it.rad)*V.foc/Math.max(1,it.d-it.rad))>>1)-1,0,NC-1),c1=clamp(((V.cx+(it.r+it.rad)*V.foc/Math.max(1,it.d-it.rad))>>1)+1,0,NC-1);
    const base=V.hz+(C.z-gh(it.x,it.y))*V.foc/Math.max(1,it.d+it.rad);let need=false;const ys=[];
    for(let c=c0;c<=c1;c++){const y=occ(c,f);ys.push(y);if(y<base-1)need=true}
    if(!need){it.fn();if(LIGHTQ.length)flushLights(ctx,C,V);continue}
    ctx.save();ctx.beginPath();ctx.moveTo(c0*2,-50);for(let c=c0;c<=c1;c++){ctx.lineTo(c*2,ys[c-c0]);ctx.lineTo(c*2+2,ys[c-c0])}ctx.lineTo(c1*2+2,-50);ctx.closePath();ctx.clip();it.fn();if(LIGHTQ.length)flushLights(ctx,C,V);ctx.restore()}}
// mezcla bilineal de 4 texeles (suaviza el piso cerca de la cámara en 32-bit)
function bil32(bg,bw,x,y){if(x<0)x=0;if(y<0)y=0;const ix=x|0,iy=y|0,fx=x-ix,fy=y-iy,i=iy*bw+ix,a=bg[i],b=bg[i+1],c=bg[i+bw],d=bg[i+bw+1];if(a===b&&a===c&&a===d)return a;
  const w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy;
  const r=(a&255)*w0+(b&255)*w1+(c&255)*w2+(d&255)*w3,g=(a>>8&255)*w0+(b>>8&255)*w1+(c>>8&255)*w2+(d>>8&255)*w3,bl=(a>>16&255)*w0+(b>>16&255)*w1+(c>>16&255)*w2+(d>>16&255)*w3;
  return(0xff000000|(bl<<16)|(g<<8)|r)>>>0}
function render3D(V,C,W,P,t,mirror){CURW=W;HMON=!!W.hm&&!TOUCH;if(HMON)C.z+=hgt(W,C.x,C.y);
  if(!W.bg32)W.bg32=new Uint32Array(W.bg.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W.w,W.h).data.buffer);
  const{buf,w,h,hz,foc}=V;skyPrep(V,C);
  V.fine=GFX===32&&(V===VMAIN||V.show);const SEA=HMON&&W.waterPolys&&W.waterPolys.length;if(SEA&&(!V.seaC||V.seaC.length!==w))V.seaC=new Uint32Array(w);
  if(SEA)for(let x=0;x<w;x++){const a=C.h+Math.atan((x-V.cx)/foc),fx=clamp(C.x+Math.cos(a)*900,2,W.w-3),fy=clamp(C.y+Math.sin(a)*900,2,W.h-3);V.seaC[x]=W.waterPolys.some(pg=>inPoly(fx,fy,pg))?mix32(W.bg32[(fy|0)*W.w+(fx|0)],HAZE32,.3):0}
  if(!W.hx&&!(S&&S.inTun))W.hx=hxBuild(W);const HX=W.hx&&!(S&&S.W===W&&S.inTun)?W.hx:null,HXP=HX?hxPal(V):null;
  for(let x=0;x<w;x++){if(SEA&&V.seaC[x]){for(let y=0;y<hz;y++)buf[y*w+x]=skyPix(V,x,y,C.h+Math.atan((x-V.cx)/foc));buf[hz*w+x]=V.seaC[x];continue}const a=C.h+Math.atan((x-V.cx)/foc);const m1=Math.round((12+6*Math.sin(a*3)+4*Math.sin(a*7+1)+2*Math.sin(a*13+2))*V.s),m2=Math.round((4+3*Math.sin(a*5+.5)+2*Math.sin(a*11))*V.s);
    for(let y=0;y<=hz;y++)buf[y*w+x]=y>hz-m2?V.hill:y>hz-m1?V.mount:skyPix(V,x,y,a);
    if(HX){const u=((Math.round(a/(Math.PI*2)*HXW)%HXW)+HXW)%HXW,tp=HX.top[u];if(tp){const y0=Math.max(0,Math.floor(hz-tp*V.s)+1);for(let y=y0;y<=hz;y++){const rw=((hz-y)/V.s)|0;if(rw>=HXH)continue;const v=HX.T[rw*HXW+u];if(v)buf[y*w+x]=HXP[v]}}}}
  const bg=W.bg32,bw=W.w,bh=W.h,FK=(S&&S.W===W&&S.fogK)||0,FG=V.fog*(1-FK*.8);
  if(S&&S.W===W&&S.inTun)for(let x=0;x<w;x++)for(let y=0;y<=hz;y++)buf[y*w+x]=y>hz-3?0xff2a2a30:0xff1d1d22;
  if(HMON){for(let i=(hz+1)*w;i<w*h;i++)buf[i]=HAZE32;if(SEA)for(let x=0;x<w;x++){const c=V.seaC[x];if(c)for(let y=hz+1;y<h;y++)buf[y*w+x]=c}
    const OC=400,NC=w>>1;if(!V.oz||V.oz.length!==NC*OC){V.oz=new Float32Array(NC*OC);V.oy=new Int16Array(NC*OC);V.on=new Uint16Array(NC)}const OZ=V.oz,OY=V.oy,ON=V.on;V.occOn=true;
    const XS=V.fine?1:2;for(let x=0;x<w;x+=XS){const rx=(x+.5-V.cx)/foc,dx=C.c-C.s*rx,dy=C.s+C.c*rx;let yb=h,z=.8;const ob=(x>>1)*OC,rec=!(x&1);let on=0;
      const M=W.hm,ma=M.a,mw=M.w,mr=1/M.r,mxw=M.w-1,mxh=M.h-1;let zp=-1;while(z<330&&yb>0){const wx=C.x+dx*z,wy=C.y+dy*z;const hv=z<12?hgt(W,wx,wy):ma[clamp((wy*mr+.5)|0,0,mxh)*mw+clamp((wx*mr+.5)|0,0,mxw)];let sy=Math.floor(hz+(C.z-hv)*foc/z);if(sy<yb){if(sy<0)sy=0;let c=(wx>=0&&wy>=0&&wx<bw&&wy<bh)?bg[(wy|0)*bw+(wx|0)]:(SEA&&V.seaC[x])||GRASS32;const fog=z>FG?Math.min(1,(z-FG)/(160-FK*90)):0;if(fog)c=mix32(c,HAZE32,fog);
        if(zp>0&&z<45&&yb-sy>1){const n=yb-sy;for(let y=sy;y<yb;y++){const zz=z+(zp-z)*(y-sy)/n,ax=C.x+dx*zz,ay=C.y+dy*zz,cc=(ax>=0&&ay>=0&&ax<bw-1&&ay<bh-1)?(XS===1?bil32(bg,bw,ax-.5,ay-.5):bg[(ay|0)*bw+(ax|0)]):c;buf[y*w+x]=cc;if(XS===2)buf[y*w+x+1]=cc}}
        else if(XS===2)for(let y=sy;y<yb;y++){buf[y*w+x]=c;buf[y*w+x+1]=c}else for(let y=sy;y<yb;y++)buf[y*w+x]=c;yb=sy;zp=z;if(rec&&on<OC){OZ[ob+on]=z;OY[ob+on]=sy;on++}}z+=.35+z*.026}if(rec)ON[x>>1]=on}
    if(S&&S.W===W&&S.inTun)for(let x=0;x<w;x++)for(let y=0;y<=hz;y++)buf[y*w+x]=y>hz-3?0xff2a2a30:0xff1d1d22}
  else V.occOn=false;
  if(!HMON)for(let y=hz+1;y<h;y++){const f=C.z*foc/(y-hz);const k=f/foc;const rx=-C.s*k,ry=C.c*k;let wx=C.x+C.c*f-rx*V.cx,wy=C.y+C.s*f-ry*V.cx;
    const fog=f>FG?Math.min(1,(f-FG)/(160-FK*90)):0;const row=y*w;
    const BL=V.fine&&f<32;for(let x=0;x<w;x++){let c=(wx>=0&&wy>=0&&wx<bw-1&&wy<bh-1)?(BL?bil32(bg,bw,wx-.5,wy-.5):bg[(wy|0)*bw+(wx|0)]):GRASS32;if(fog)c=mix32(c,HAZE32,fog);buf[row+x]=c;wx+=rx;wy+=ry}}
  V.ctx.putImageData(V.img,0,0);
  LIGHTQ=[];drawObjects3D(V,C,W,P,t,mirror?220:340,mirror);atmo3D(V,C,W,P,t,mirror);flushLights(V.ctx,C,V);
  if(S&&S.W===W){const ctx=V.ctx;if(S.inTun&&W.tunPts){ctx.save();ctx.globalCompositeOperation='lighter';for(const q of W.tunPts){const B=bill(C,V,q[0],q[1],9.5);if(B&&B.f<200)glow(ctx,B.x,B.y,Math.max(2,2.2*B.k),'rgba(255,170,60,.9)')}ctx.restore()}
    if(S.fogK>.02){ctx.fillStyle=`rgba(214,222,228,${.55*S.fogK})`;ctx.fillRect(0,0,V.w,V.h)}}}
function cockpit(P,t){const col=P.col;const ox=Math.round(-clamp((S.look||0)+(S.yaw||0),-1.4,1.4)*215),oy=Math.round((S.pitch||0)*70);
  if(isMoto(P.type)){// vista desde la moto o la bici: tanque, manubrio con espejos y tablero pequeño
    const bk=VEH[P.type].bike,kmh=Math.round(Math.abs(P.v)*KMH),lim=S.lim||S.W.limit,on=Math.floor(t*2.6)%2===0;g.save();g.translate(ox,oy);
    if(!bk){g.fillStyle=shade(col,-.15);g.beginPath();g.moveTo(140,216);g.lineTo(162,192);g.lineTo(222,192);g.lineTo(244,216);g.fill();g.fillStyle=shade(col,.25);g.fillRect(170,193,44,2)}
    else{g.fillStyle='#9aa0a6';g.fillRect(189,196,6,20)}
    g.save();g.translate(192,196);g.rotate(P.steer*1.1);g.fillStyle='#2a2a30';g.fillRect(-88,-3,176,5);g.fillStyle='#111';g.fillRect(-104,-6,26,11);g.fillRect(78,-6,26,11);
    if(!bk){g.fillStyle='#2a2a30';g.fillRect(-76,-32,2,30);g.fillRect(74,-32,2,30);for(const mx of[-75,75]){g.fillStyle='#111';g.beginPath();g.ellipse(mx,-38,13,8,0,0,7);g.fill();g.fillStyle='#4f6f8f';g.beginPath();g.ellipse(mx,-38,11,6,0,0,7);g.fill()}
      g.fillStyle='#0b0b10';g.fillRect(-22,-18,44,16);const sc=kmh>lim?(Math.floor(t*5)%2?'#ff4d4d':'#7a0d14'):'#e8f6ff',st=String(kmh);ptext(g,st,-st.length*4,-16,sc,0,2);ptext(g,'KM/H',-7,-6,'#888');
      if((P.blinkL||P.haz)&&on){g.fillStyle='#3ddc84';g.fillRect(-20,-15,3,3)}if((P.blinkR||P.haz)&&on){g.fillStyle='#3ddc84';g.fillRect(17,-15,3,3)}}
    g.restore();if(!P.belt&&on){g.fillStyle='#ff4d4d';g.fillRect(172,204,26,7);ptext(g,'CASCO',174,205,'#fff')}
    fillCirc(g,262,200,7,'#d00');fillCirc(g,262,200,5,'#fff');const ls=String(lim);ptext(g,ls,262-ls.length*2+1,198,'#000');g.restore();return}
  g.save();g.translate(ox,0);
  // puertas, marcos de ventana y espejos laterales (se ven al voltear la cabeza)
  g.fillStyle=shade(col,-.25);g.fillRect(-330,150,342,70);g.fillRect(372,150,342,70);g.fillStyle=shade(col,-.45);g.fillRect(-330,150,342,3);g.fillRect(372,150,342,3);
  g.fillStyle='#0d0d12';g.fillRect(-330,0,330,4);g.fillRect(384,0,330,4);
  const sm=(x,V,lbl)=>{g.fillStyle='#111';g.fillRect(x-3,112,V.w+6,V.h+6);g.fillStyle=shade(col,-.2);g.fillRect(x-3,112+V.h+6,V.w+6,3);g.save();g.translate(x+V.w,115);g.scale(-1,1);g.drawImage(V.c,0,0);g.restore();if(lbl)ptext(g,lbl,x+2,104,'#fff')};
  if((S.look||0)<-.25)sm(-120,VSL,'ESPEJO IZQ');if((S.look||0)>.25)sm(450,VSR,'ESPEJO DER');
  g.translate(0,oy);
  if(GFX===32){const gr=g.createLinearGradient(-ox,0,384-ox,180);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.42,'rgba(255,255,255,.07)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(.62,'rgba(255,255,255,.035)');gr.addColorStop(.7,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,384,184)}
  {const hg=g.createLinearGradient(0,183,0,216);hg.addColorStop(0,shade(col,.18));hg.addColorStop(.35,shade(col,-.05));hg.addColorStop(1,shade(col,-.32));g.fillStyle=hg;g.beginPath();g.moveTo(30,216);g.lineTo(66,183);g.lineTo(318,183);g.lineTo(354,216);g.fill();
    g.fillStyle=shade(col,.42);g.fillRect(80,184,224,1);if(GFX===32){g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(120,186);g.lineTo(170,186);g.lineTo(150,196);g.lineTo(96,196);g.fill()}}
  g.fillStyle='#0d0d12';g.beginPath();g.moveTo(0,-oy);g.lineTo(26,-oy);g.lineTo(8,196);g.lineTo(0,196);g.fill();g.beginPath();g.moveTo(384,-oy);g.lineTo(358,-oy);g.lineTo(376,196);g.lineTo(384,196);g.fill();g.fillRect(0,-oy,384,3);
  g.fillStyle='#17171f';g.fillRect(0,194,384,22);g.fillStyle='#2a2a36';g.fillRect(0,194,384,2);
  // tablero de instrumentos
  const kmh=Math.round(Math.abs(P.v)*KMH),lim=S.lim||S.W.limit,on=Math.floor(t*2.6)%2===0;
  g.fillStyle='#0b0b10';g.fillRect(158,176,94,38);g.fillStyle='#3a3a46';g.fillRect(158,176,94,1);g.fillRect(158,176,1,38);g.fillRect(251,176,1,38);
  const sc=kmh>lim?(Math.floor(t*5)%2?'#ff4d4d':'#7a0d14'):kmh>=lim-3?'#ffd23f':'#e8f6ff';const st=String(kmh);ptext(g,st,206-st.length*6,180,sc,0,3);ptext(g,'KM/H',196,197,'#888');
  ptext(g,P.gear===1?(P.low?'L':'D'):'R',164,180,P.gear===1?'#ffd23f':'#ff4d4d',0,2);
  if((P.blinkL||P.haz)&&on){g.fillStyle='#3ddc84';for(let k=0;k<4;k++)g.fillRect(164+k,205-k,1,2*k+1)}
  if((P.blinkR||P.haz)&&on){g.fillStyle='#3ddc84';for(let k=0;k<4;k++)g.fillRect(246-k,205-k,1,2*k+1)}
  if(!P.belt&&on){g.fillStyle='#ff4d4d';g.fillRect(170,203,24,7);ptext(g,isMoto(P.type)?'CASCO':'CINT',172,204,'#fff')}
  fillCirc(g,238,186,7,'#d00');fillCirc(g,238,186,5,'#fff');const ls=String(lim);ptext(g,ls,238-ls.length*2+1,184,'#000');
  if(P.lights){g.fillStyle='#3ddc84';g.fillRect(200,206,4,5);for(let k=0;k<3;k++)g.fillRect(205,206+k*2,3,1)}if(keys[' ']){g.fillStyle='#ff4d4d';ptext(g,'(P)',209,205,'#ff4d4d')}
  const br=P.bp>0||P.brake,pv=br?Math.max(.3,P.bp):(keys.w||keys.arrowup)?.2+.8*P.thr:0;g.fillStyle='#222';g.fillRect(226,196,3,16);g.fillStyle=br?'#ff4d4d':'#3ddc84';g.fillRect(226,212-16*pv,3,16*pv);
  // volante
  g.save();g.translate(110,238);g.rotate(P.steer*3.2);g.strokeStyle='#26262e';g.lineWidth=8;g.beginPath();g.arc(0,0,40,0,7);g.stroke();g.strokeStyle='#3d3d4a';g.lineWidth=2;g.beginPath();g.arc(0,0,43,3.7,5.7);g.stroke();
  g.fillStyle='#26262e';g.fillRect(-38,-3,76,6);g.fillRect(-4,0,8,38);fillCirc(g,0,2,9,'#1d1d24');fillCirc(g,0,1,6,'#30303a');g.fillStyle='#9aa0a6';g.fillRect(-3,0,6,2);g.fillStyle='#ffd23f';g.fillRect(-1,-45,3,5);g.restore();
  // retrovisor
  g.translate(0,-oy);g.fillStyle='#000';g.fillRect(206,3,84,30);g.fillRect(246,0,4,4);g.save();g.translate(208+80,5);g.scale(-1,1);g.drawImage(VMIR.c,0,0);g.restore();g.restore()}
function compass(P,tg){if(!tg)return;const a=nA(Math.atan2(tg.y-P.y,tg.x-P.x)-P.h);const d=Math.hypot(tg.x-P.x,tg.y-P.y)*.3;
  g.save();g.translate(192,68);g.rotate(a);g.fillStyle='#000';g.beginPath();g.moveTo(0,-9);g.lineTo(7,5);g.lineTo(0,2);g.lineTo(-7,5);g.fill();g.fillStyle='#ffd23f';g.beginPath();g.moveTo(0,-7);g.lineTo(5,4);g.lineTo(0,1);g.lineTo(-5,4);g.fill();g.restore();
  const txt=Math.round(d)+' M';ptext(g,txt,193-txt.length*2,79,'#fff')}
