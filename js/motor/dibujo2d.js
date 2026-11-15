'use strict';
// ===================== DIBUJO =====================
function drawWorld(W,P,ix,iy,t){
  g.drawImage(W.bg,ix,iy,VW,VH,0,0,VW,VH);g.drawImage(W.skid,ix,iy,VW,VH,0,0,VW,VH);
  const blinkOn=Math.floor(t*2.6)%2===0;const X=v=>Math.round(v-ix),Y=v=>Math.round(v-iy);
  if(S&&S.exam&&!S.over){const tk=S.tasks[S.task];if(tk&&tk.zone){const zp=zonePts(tk.zone);g.fillStyle=blinkOn?'rgba(255,210,63,.4)':'rgba(255,210,63,.15)';g.beginPath();zp.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fill();g.strokeStyle='#ffd23f';g.lineWidth=1;g.stroke()}}
  for(const k of W.cones){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X(k.x),Y(k.y),3,3);g.fillStyle=k.hit?'#b34700':k.green?'#3ddc84':'#ff7b00';g.fillRect(X(k.x)-1,Y(k.y)-1,3,3);g.fillStyle='#fff';g.fillRect(X(k.x),Y(k.y),1,1)}
  for(const z of W.zebras)for(const p of z.peds){const a=Math.floor(p.an*6)%2;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X(p.x)-1,Y(p.y),3,3);g.fillStyle='#222';g.fillRect(X(p.x)-1+a,Y(p.y)+1,1,1);g.fillRect(X(p.x)+1-a,Y(p.y)+1,1,1);g.fillStyle=p.col;g.fillRect(X(p.x)-1,Y(p.y)-1,3,2);g.fillStyle='#f1c27d';g.fillRect(X(p.x),Y(p.y)-2,1,1)}
  const ped=p=>{if(!p.dog)personize(p);if(p.dog){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X(p.x)-1,Y(p.y)+1,4,2);g.fillStyle=p.col;g.fillRect(X(p.x)-2,Y(p.y)-1,4,2);g.fillRect(X(p.x)+1,Y(p.y)-2,2,1);return}const a=Math.floor(p.an*6)%2;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X(p.x)-1,Y(p.y),3,3);g.fillStyle='#222';g.fillRect(X(p.x)-1+a,Y(p.y)+1,1,1);g.fillRect(X(p.x)+1-a,Y(p.y)+1,1,1);g.fillStyle=p.col;g.fillRect(X(p.x)-1,Y(p.y)-1,3,2);g.fillStyle=p.hair;g.fillRect(X(p.x)-(p.hs===2||p.hs===5?1:0),Y(p.y)-3,p.hs===2||p.hs===5?3:1,p.hs===2||p.hs===5?2:1);g.fillStyle=p.skin;g.fillRect(X(p.x),Y(p.y)-2,1,1)};
  if(W.walkers)for(const p of W.walkers)if(p.x>ix-5&&p.x<ix+VW+5&&p.y>iy-5&&p.y<iy+VH+5)ped(p);if(W.jay)for(const p of W.jay)ped(p);
  if(W.birds)for(const b of W.birds){const sx=X(b.x),sy=Y(b.y-b.z);if(sx<-4||sx>VW+4||sy<-20||sy>VH+4)continue;
    if(b.z>.5){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X(b.x),Y(b.y),2,1);const f=Math.floor(t*12+b.t)%2;g.fillStyle='#5f646c';g.fillRect(sx-1,sy-f,1,1);g.fillRect(sx+1,sy-f,1,1);g.fillRect(sx,sy,1,1)}
    else{g.fillStyle='#80868f';g.fillRect(sx,sy,2,1);g.fillStyle='#4f8a6e';g.fillRect(sx+(b.dir>0?1:0),sy-1,1,1)}}
  if(W.flags)for(const f of W.flags){const sx=X(f.x),sy=Y(f.y)-f.z*.25|0;if(sx<-12||sx>VW+4||sy<-8||sy>VH+8)continue;g.fillStyle='#ddd';g.fillRect(sx,sy,1,7);
    const rows=['#002b7f','#fff','#ce1126','#ce1126','#fff','#002b7f'];for(let c=0;c<8;c++){const dy=Math.round(Math.sin(t*6-c*.8)*.8*c/7);for(let r=0;r<6;r++){g.fillStyle=rows[r];g.fillRect(sx+1+c,sy+r+dy,1,1)}}}
  if(W.works)for(const r of W.works){for(let k=0;k<Math.max(r.w,r.h);k++){g.fillStyle=(k>>1)%2?'#fff':'#ff6a00';if(r.w>r.h){g.fillRect(X(r.x+k),Y(r.y),1,r.h)}else g.fillRect(X(r.x),Y(r.y+k),r.w,1)}g.fillStyle='#000';g.fillRect(X(r.x+r.w/2)-1,Y(r.y+r.h/2)-1,3,3);g.fillStyle='#ffd23f';g.fillRect(X(r.x+r.w/2),Y(r.y+r.h/2)-1,1,2)}
  if(W.broken)for(const b of W.broken)drawCar(g,b.x,b.y,b.h,b.col,{bl:true,br:true,on:blinkOn},ix,iy,b.type);
  const vis=(x,y)=>x>ix-30&&x<ix+VW+30&&y>iy-30&&y<iy+VH+30;
  for(const c of W.ai)if(vis(c.x,c.y))drawCar(g,c.x,c.y,c.h,c.col,{brake:c.brake,bl:c.bl,br:c.br,on:blinkOn},ix,iy,c.type);
  for(const c of W.ringCars)drawCar(g,c.x,c.y,c.h,c.col,{brake:c.brake},ix,iy,c.type);
  if(S&&S.cop&&S.W===W){const C=S.cop,fl=Math.floor(t*8)%2===0;g.fillStyle=fl?'rgba(47,107,255,.28)':'rgba(255,42,74,.28)';g.fillRect(X(C.x)-12,Y(C.y)-12,24,24);drawCar(g,C.x,C.y,C.h,C.col,{on:fl,brake:C.arrest},ix,iy,'police')}
  if(P&&P.hornT>0){P.hornT-=1/60;const sx=X(P.x),sy=Y(P.y)-16;g.fillStyle='#000';g.fillRect(sx-12,sy-1,25,9);g.fillStyle='#fff';g.fillRect(sx-11,sy,23,7);ptext(g,'PIII!',sx-9,sy+1,'#1b4965')}
  if(P&&!(S&&S.respawn>0&&blinkOn))drawCar(g,P.x,P.y,P.h,P.col,{boost:P.boost&&Math.floor(t*20)%2,brake:P.brake,rev:P.gear===-1,bl:P.blinkL||P.haz,br:P.blinkR||P.haz,on:blinkOn},ix,iy,P.type);
  if(S&&S.W===W&&S.gravel&&Math.abs(S.P.v)>12){const P=S.P;for(let k=0;k<6;k++){const d=P.L/2+3+k*3,j=Math.sin(t*37+k*7)*3;g.fillStyle=`rgba(194,164,119,${.5-k*.07})`;g.fillRect(X(P.x-Math.cos(P.h)*d-Math.sin(P.h)*j)-2,Y(P.y-Math.sin(P.h)*d+Math.cos(P.h)*j)-2,4+k,4+k)}}
  if(S&&S.W===W)evLive2D(g,X,Y,ix,iy,t,blinkOn,ped,W);
  if(S&&S.W===W&&S.ev&&S.ev.ty==='nino'){const e=S.ev.e,k2=Math.min(1,S.ev.t/1.2),bx=e.x+e.ux*34-e.uy*(26-22*k2),by=e.y+e.uy*34+e.ux*(26-22*k2);fillCirc(g,X(bx),Y(by),2,'#ff7b00');g.fillStyle='#fff';g.fillRect(X(bx),Y(by)-1,1,1);if(S.ev.t>.5)ped({x:bx-e.uy*(-9),y:by+e.ux*(-9),an:S.t,col:'#e63946'})}
  if(S&&S.W===W&&S.tire){const T=S.tire;if(T.tri){const tx=X(T.tri.x),ty=Y(T.tri.y);if(T.placed){g.fillStyle='#e63946';g.beginPath();g.moveTo(tx,ty-4);g.lineTo(tx+4,ty+3);g.lineTo(tx-4,ty+3);g.fill();g.fillStyle='#fff';g.fillRect(tx-1,ty,2,1)}else if(T.st===2&&Math.floor(t*4)%2){g.strokeStyle='#ffd23f';g.strokeRect(tx-5,ty-5,10,10)}}
    if(T.st===3&&T.wh){const wx=X(T.wh.x),wy=Y(T.wh.y);g.strokeStyle='#ffd23f';g.strokeRect(wx-4,wy-4,8,8);if(T.t>0){g.fillStyle='#000';g.fillRect(wx-8,wy-9,16,3);g.fillStyle='#3ddc84';g.fillRect(wx-8,wy-9,16*Math.min(1,T.t/3),3)}}}
  if(S&&S.foot&&S.W===W){const F=S.foot;drawWalker2D(g,X(F.x),Y(F.y),F.face!=null?F.face:F.h,F.an,F.v,F);const bx=X(F.x),by=Y(F.y)-9+Math.round(Math.sin(t*5));g.fillStyle='#000';g.fillRect(bx-3,by-1,7,4);g.fillStyle='#ffd23f';g.fillRect(bx-2,by,5,1);g.fillRect(bx-1,by+1,3,1);g.fillRect(bx,by+2,1,1)}
  for(const R of W.rails){
    for(const s of W.stops){if(s.kind!=='rail'||s.light!==R)continue;const warn=railWarn(W,R,s.ca,t);const p=polePos(s);
      const ph=Math.floor(t*4)%2;if(warn){g.fillStyle=ph?'#ff2a2a':'#550000';g.fillRect(X(p[0])-3,Y(p[1])+3,2,2);g.fillStyle=ph?'#550000':'#ff2a2a';g.fillRect(X(p[0])+2,Y(p[1])+3,2,2)}
      const hz=s.dir==='E'||s.dir==='W';const bp=s.pos+(s.dir==='E'||s.dir==='S'?2:-2);
      if(warn){for(let k=0;k<s.b-s.a;k++){g.fillStyle=(k>>1)%2?'#fff':'#e00';if(hz)g.fillRect(X(bp),Y(s.a+k),1,1);else g.fillRect(X(s.a+k),Y(bp),1,1)}}
      else{g.fillStyle='#e00';if(hz)g.fillRect(X(bp),Y(s.dir==='E'?s.b+1:s.a-4),1,3);else g.fillRect(X(s.dir==='S'?s.a-4:s.b+1),Y(bp),3,1)}}
    const tr=trainRect(W,R,t);if(tr){const v=R.o==='v';const n=Math.ceil(tr[v?'h':'w']/28);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X(tr.x)+3,Y(tr.y)+3,tr.w,tr.h);
      for(let i=0;i<n;i++){const loco=i===0;const a0=(tr.s-(i+1)*28);const len=26;
        const col=loco?'#f4c430':'#2b6cb0',dark=loco?'#b8860b':'#1a4480';
        if(v){g.fillStyle=col;g.fillRect(X(tr.x),Y(a0+2),10,len);g.fillStyle=dark;g.fillRect(X(tr.x)+2,Y(a0+4),6,len-4);if(loco){g.fillStyle='#9fd3ff';g.fillRect(X(tr.x)+2,Y(a0+len-3),6,2);g.fillStyle='#fff6b0';g.fillRect(X(tr.x)+1,Y(a0+len+1),2,1);g.fillRect(X(tr.x)+7,Y(a0+len+1),2,1)}}
        else{g.fillStyle=col;g.fillRect(X(a0+2),Y(tr.y),len,10);g.fillStyle=dark;g.fillRect(X(a0+4),Y(tr.y)+2,len-4,6);if(loco){g.fillStyle='#9fd3ff';g.fillRect(X(a0+len-3),Y(tr.y)+2,2,6);g.fillStyle='#fff6b0';g.fillRect(X(a0+len+1),Y(tr.y)+1,1,2);g.fillRect(X(a0+len+1),Y(tr.y)+7,1,2)}}}}}
  for(const s of W.stops){if(s.kind!=='light')continue;const p=polePos(s);const st=lightState(s.light,axisOf(s.dir),t);
    const mid=(s.a+s.b)/2;const hp=(s.dir==='E'||s.dir==='W')?[p[0],mid]:[mid,p[1]];
    const ax=Math.min(p[0],hp[0]),ay=Math.min(p[1],hp[1]);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X(ax)+3,Y(ay)+3,Math.abs(p[0]-hp[0])+1,Math.abs(p[1]-hp[1])+1);
    g.fillStyle='#555';g.fillRect(X(ax),Y(ay),Math.abs(p[0]-hp[0])+1,Math.abs(p[1]-hp[1])+1);
    g.fillStyle='#222';g.fillRect(X(p[0])-1,Y(p[1])-1,3,3);
    const col=st==='G'?'#3ddc84':st==='Y'?'#ffd23f':'#ff3030';
    g.fillStyle=col+'44';g.fillRect(X(hp[0])-4,Y(hp[1])-4,9,9);g.fillStyle='#111';g.fillRect(X(hp[0])-2,Y(hp[1])-2,5,5);g.fillStyle=col;g.fillRect(X(hp[0])-1,Y(hp[1])-1,3,3)}
  {const ph=(Math.sin(t*3)+1)/2,col=ph>.5?'#ff3df2':'#3df2ff';
    if(W.billboards)for(const b of W.billboards){const sx=X(b.cx),sy=Y(b.cy);if(sx<-30||sx>VW+30||sy<-30||sy>VH+30)continue;g.fillStyle='#fafafa';if(b.o==='h'){g.fillRect(sx-14,sy-4,29,9);ptext(g,'PULZ^R',sx-11,sy-2,PZ_NAVY);g.fillStyle=PZ_BLUE;g.fillRect(sx-14,sy+4,29,1)}else{g.fillRect(sx-4,sy-14,9,29);ptext(g,'PULZ^R',sx-2,sy-11,PZ_NAVY,1);g.fillStyle=PZ_BLUE;g.fillRect(sx+4,sy-14,1,29)}}
    for(const b of W.blds)if(b.pulzar){const sx=X(b.x+b.w/2),sy=Y(b.y+b.h/2);if(sx<-40||sx>VW+40||sy<-30||sy>VH+30)continue;const lw=Math.min(52,b.w-4,(b.h-4)*52/34),lh=lw*34/52;g.drawImage(PZLOGO,Math.round(sx-lw/2),Math.round(sy-lh/2),Math.round(lw),Math.round(lh))}}
  if(W.tower){const b=W.tower,ph=(Math.sin(t*3)+1)/2,col=ph>.5?'#ff3df2':'#3df2ff',gl=ph>.5?'#ff3df255':'#3df2ff55';const tx=X(b.x+b.w/2-23),ty=Y(b.y+27);
    if(tx>-60&&tx<VW+10&&ty>-30&&ty<VH+10){{const lx=X(b.x+b.w/2)-26,ly=Y(b.y+b.h/2)-17;g.fillStyle=ph>.5?'rgba(61,99,242,.55)':'rgba(61,99,242,.2)';g.fillRect(lx-3,ly-3,58,40);g.drawImage(PZLOGO,lx,ly)}
      if(Math.floor(t*2)%2){g.fillStyle='#ff2a2a';g.fillRect(X(b.x+3),Y(b.y+3),2,2);g.fillRect(X(b.x+b.w-5),Y(b.y+b.h-5),2,2)}}}
  if(W.cLights)for(const L of W.cLights){const st=semState(L,t),px=X(L.x+(-L.uy)*(L.w+3)),py=Y(L.y+L.ux*(L.w+3)),n=L.kind==='sem3'?3:2;g.fillStyle='#111';g.fillRect(Math.round(px)-2,Math.round(py)-2-n*2,5,n*4+1);
    const cols=L.kind==='sem3'?[['R','#ff2a2a'],['A','#ffd23f'],['V','#3ddc84']]:[['R','#ff2a2a'],['V','#3ddc84']];cols.forEach(([k,c],i)=>{g.fillStyle=st===k?c:'#333';g.fillRect(Math.round(px)-1,Math.round(py)-1-n*2+i*4,3,3)})}
  for(const q of(W.roofs||(W.roof?[W.roof]:[]))){g.save();g.globalAlpha=.62;g.fillStyle='#1f3f8f';g.beginPath();g.moveTo(X(q[0][0]),Y(q[0][1]));for(const r of q)g.lineTo(X(r[0]),Y(r[1]));g.fill();g.globalAlpha=.5;g.strokeStyle='#8fb4ff';g.lineWidth=1;
    for(let k=1;k<12;k++){const a=k/12;g.beginPath();g.moveTo(X(q[0][0]+(q[3][0]-q[0][0])*a),Y(q[0][1]+(q[3][1]-q[0][1])*a));g.lineTo(X(q[1][0]+(q[2][0]-q[1][0])*a),Y(q[1][1]+(q[2][1]-q[1][1])*a));g.stroke()}g.restore()}
  if(W.tolls)for(const T of W.tolls){const bx=X(T.x+T.dir*13);if(bx<-5||bx>VW+5)continue;const near=Math.abs(P.x-T.x)<120&&Math.abs(P.y-T.y)<16;
    for(const ly of[T.y-8,T.y+8]){g.fillStyle='#2b2d42';g.fillRect(bx-1,Y(ly+(ly<T.y?-7:7))-1,3,3);if(near&&!T.paid&&Math.abs(P.y-ly)<9){for(let k=0;k<12;k++){g.fillStyle=(k>>1)%2?'#fff':'#e63946';g.fillRect(bx,Y(ly-6)+k,1,1)}}}}
  if(W.jets)for(const J of W.jets){const j=jetPos(J,t);if(!j)continue;const sx=X(j.x),sy=Y(j.y);if(sx<-60||sx>VW+60||sy<-60||sy>VH+60)continue;jet2D(g,sx,sy,j.h,j.z,j.col)}
  if(S&&S.tx&&S.tx.ph==='pick'&&S.W===W){const q=S.tx.ped,sx=X(q.x),sy=Y(q.y)-8+Math.round(Math.sin(t*6));g.fillStyle='#000';g.fillRect(sx-9,sy-6,19,7);g.fillStyle='#ffd23f';g.fillRect(sx-8,sy-5,17,5);ptext(g,'TAXI',sx-7,sy-5,'#000');g.fillStyle='#5c4b37';g.fillRect(X(q.x)+2,Y(q.y)-1,3,3)}
  if(W.turbines)for(const T of W.turbines){const sx=X(T.x),sy=Y(T.y);if(sx<-40||sx>VW+40||sy<-40||sy>VH+40)continue;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(sx+4,sy+4,3,3);g.fillStyle='#e9edf0';g.fillRect(sx-1,sy-1,3,3);
    const a0=t*T.sp+T.ph;g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();for(let k=0;k<3;k++){const c=Math.cos(a0+k*2.094)*14;g.moveTo(sx-1,sy);g.lineTo(sx-1,sy+c)}g.stroke();g.strokeStyle='rgba(0,0,0,.18)';g.beginPath();for(let k=0;k<3;k++){const c=Math.cos(a0+k*2.094)*14;g.moveTo(sx+9,sy+9);g.lineTo(sx+9,sy+9+c)}g.stroke()}
  if(W.cows)for(const c of W.cows){const sx=X(c.x),sy=Y(c.y);if(sx>-10&&sx<VW+10&&sy>-10&&sy<VH+10)cow2D(g,sx,sy,c.h)}
  if(W.ccow&&W.ccow.v){if(W.ccow.kind==='mono')mono2D(g,X(W.ccow.x),Y(W.ccow.y));else cow2D(g,X(W.ccow.x),Y(W.ccow.y),W.ccow.h)}
  if(W.drawTop)W.drawTop(g,X,Y,t,ix,iy);
  // globos de enojo
  for(const c of W.ai.concat(W.ringCars)){if(!(c.angryT>0))continue;const sx=X(c.x),sh=Math.floor(t*24)%2,sy=Y(c.y)-16+(c.angryT>1.6?sh:0);if(sx<-30||sx>VW+30||sy<-10||sy>VH+10)continue;
    const w=c.say.length*4+3,bx=Math.round(sx-w/2);g.fillStyle='#000';g.fillRect(bx-1,sy-1,w+2,9);g.fillRect(sx-2,sy+7,4,2);g.fillRect(sx-1,sy+9,2,1);
    g.fillStyle='#fff';g.fillRect(bx,sy,w,7);g.fillRect(sx-1,sy+7,2,1);ptext(g,c.say,bx+2,sy+1,'#d00');
    g.fillStyle='#ff2a2a';const ax2=bx+w+1,ay2=sy-3;g.fillRect(ax2,ay2,1,2);g.fillRect(ax2+1,ay2+2,2,1);g.fillRect(ax2+4,ay2,1,2);g.fillRect(ax2+3,ay2+2,1,1);g.fillRect(ax2,ay2+4,2,1);g.fillRect(ax2+2,ay2+5,1,1);g.fillRect(ax2+4,ay2+4,1,2)}
}
function drawFullMap(W,P,t,tg){g.fillStyle='#0d0d16';g.fillRect(0,0,VW,VH);
  const fit=Math.min((VW-12)/W.w,(VH-36)/W.h),k=fit*[1,2.5,5][S.mapZ||0],mw=W.w*k,mh=W.h*k;
  let ox=VW/2-P.x*k,oy=VH/2+1-P.y*k;ox=mw<=VW-12?(VW-mw)/2:clamp(ox,VW-6-mw,6);oy=mh<=VH-36?19+(VH-36-mh)/2:clamp(oy,VH-17-mh,19);
  S.mapT={ox,oy,k};g.imageSmoothingEnabled=k<1;g.drawImage(W.bg,ox,oy,mw,mh);if(S.foot){g.fillStyle='#ffd23f';g.fillRect(Math.round(ox+S.foot.x*k)-2,Math.round(oy+S.foot.y*k)-2,4,4)}g.imageSmoothingEnabled=false;g.strokeStyle='#6a6a9a';g.lineWidth=1;g.strokeRect(Math.round(ox)-.5,Math.round(oy)-.5,Math.round(mw)+1,Math.round(mh)+1);
  for(const c of W.ai){g.fillStyle=c.angryT>0?'#ff4d4d':'#e8e8e8';g.fillRect(Math.round(ox+c.x*k)-1,Math.round(oy+c.y*k)-1,2,2)}
  if(W.events){for(const e of W.events){const X=Math.round(ox+e.x*k),Y=Math.round(oy+e.y*k);g.fillStyle='#000';g.fillRect(X-4,Y-4,9,9);g.fillStyle=e.done?'#3ddc84':SCEN[e.ty].col;g.fillRect(X-3,Y-3,7,7)}
    let lx=6,ly=20;for(const ty of[...new Set(W.events.map(e=>e.ty))]){const t=(SCEN[ty].l||SCEN[ty].n.split(' ')[0]).normalize('NFD').replace(/[̀-ͯ]/g,''),wd=t.length*4+14;if(lx+wd>VW-4){lx=6;ly+=8}g.fillStyle='rgba(0,0,0,.6)';g.fillRect(lx-1,ly-1,wd,7);g.fillStyle=SCEN[ty].col;g.fillRect(lx,ly,5,5);ptext(g,t,lx+7,ly,'#fff');lx+=wd+2}}
  if(tg){const X=ox+tg.x*k,Y=oy+tg.y*k,r=3+(Math.sin(t*6)+1)*1.5;g.strokeStyle='#ffd23f';g.beginPath();g.arc(X,Y,r+3,0,7);g.stroke();g.fillStyle='#000';g.fillRect(X-3,Y-3,7,7);g.fillStyle='#ffd23f';g.fillRect(X-2,Y-2,5,5)}
  g.save();g.translate(ox+P.x*k,oy+P.y*k);g.rotate(P.h);g.fillStyle='#000';g.beginPath();g.moveTo(8,0);g.lineTo(-5,-6);g.lineTo(-2,0);g.lineTo(-5,6);g.fill();g.fillStyle='#ff3b30';g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-1,0);g.lineTo(-4,4);g.fill();g.restore();
  g.fillStyle='rgba(10,10,20,.9)';g.fillRect(0,0,VW,16);g.fillRect(0,VH-14,VW,14);
  const head=clean(S.exam?(S.tasks[S.task]?`TAREA ${S.task+1}/${S.tasks.length}`:'FIN'):'DESTINO '+(S.dest?S.dest.n:''));ptext(g,'MAPA',6,6,'#ffd23f');ptext(g,head.slice(0,70),30,6,'#ffffff');
  ptext(g,!S.exam?(TOUCH?'TOQUE UN LUGAR PARA IR AHI':'CLIC EN UN LUGAR PARA IR - M CERRAR'):TOUCH?'TOQUE MAPA PARA CERRAR - ZOOM PARA ACERCAR':'M CERRAR - TECLAS + Y - ACERCAR',6,VH-9,!S.exam?'#ffd23f':'#cfd6dd');
  g.fillStyle='#ff3b30';g.fillRect(268,VH-10,5,5);ptext(g,'USTED',276,VH-9,'#fff');g.fillStyle='#ffd23f';g.fillRect(310,VH-10,5,5);ptext(g,'DESTINO',318,VH-9,'#fff');
}
function drawTarget(tg,ix,iy,t,zm=1){const sx=(tg.x-ix)*zm,sy=(tg.y-iy)*zm;
  if(sx>8&&sx<VW-8&&sy>8&&sy<VH-8){const b=Math.round(Math.sin(t*6)*2);g.fillStyle='#000';g.fillRect(Math.round(sx)-3,Math.round(sy)-12+b,7,6);g.fillStyle='#ffd23f';for(let k=0;k<4;k++)g.fillRect(Math.round(sx)-3+k,Math.round(sy)-11+b+k,7-2*k,1)}
  else{const cx=VW/2,cy=VH/2,a=Math.atan2(sy-cy,sx-cx);const r=Math.min((VW/2-14)/Math.abs(Math.cos(a)||1e-6),(VH/2-14)/Math.abs(Math.sin(a)||1e-6));
    g.save();g.translate(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r));g.rotate(a);g.fillStyle='#000';g.fillRect(-6,-5,13,11);g.fillStyle='#ffd23f';for(let k=0;k<5;k++)g.fillRect(-5+k,-4+k,2,9-2*k);g.restore()}}
function drawMini(W,P,tg){const mw=mini.width,mh=mini.height,k=mw/W.w;mg.imageSmoothingEnabled=true;mg.drawImage(W.bg,0,0,mw,mh);
  for(const c of W.ai.concat(W.ringCars)){mg.fillStyle=c.angryT>0?'#ff4d4d':'#ddd';mg.fillRect(c.x*k-1,c.y*k-1,2,2)}
  for(const R of W.rails){const tr=trainRect(W,R,S.t);if(tr){mg.fillStyle='#f4c430';mg.fillRect(tr.x*k,tr.y*k,Math.max(2,tr.w*k),Math.max(2,tr.h*k))}}
  if(W.events)for(const e of W.events){mg.fillStyle=e.done?'#3ddc84':SCEN[e.ty].col;mg.fillRect(e.x*k-2,e.y*k-2,4,4);if(!e.done&&Math.floor(S.t*2)%2){mg.strokeStyle='#fff';mg.strokeRect(e.x*k-3,e.y*k-3,6,6)}}
  if(tg&&Math.floor(S.t*3)%2){mg.fillStyle='#ffd23f';mg.fillRect(tg.x*k-2,tg.y*k-2,5,5)}
  if(S.cop&&Math.floor(S.t*6)%2){mg.fillStyle='#2f6bff';mg.fillRect(S.cop.x*k-2,S.cop.y*k-2,5,5)}
  mg.fillStyle='#ff3b30';mg.fillRect(P.x*k-2,P.y*k-2,4,4);mg.strokeStyle='#fff';mg.strokeRect(P.x*k-2.5,P.y*k-2.5,5,5)}
