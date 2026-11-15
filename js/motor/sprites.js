'use strict';
// ===================== FUENTE PIXEL 3x5 =====================
const FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110',' ':'000000000000000','/':'001001010100100','!':'010010010000010','?':'110001010000010','#':'101111101111101','@':'111101111100011','%':'101001010100101','$':'011110010011110','.':'000000000000010',':':'000010000010000','-':'000000111000000','*':'000101010101000','^':'010010101101101','+':'000010111010000'};
function ptext(ctx,str,x,y,col,rot=0,s=1){ctx.fillStyle=col;const Wd=str.length*4-1;for(let i=0;i<str.length;i++){const f=FONT[str[i]]||FONT[' '];for(let k=0;k<15;k++)if(f[k]==='1'){const px=i*4+k%3,py=(k/3|0);let X,Y;if(rot===0){X=px;Y=py}else if(rot===1){X=4-py;Y=px}else if(rot===2){X=Wd-1-px;Y=4-py}else{X=py;Y=Wd-1-px}ctx.fillRect(x+X*s,y+Y*s,s,s)}}}
const clean=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,'');
function fillCirc(ctx,cx,cy,r,col){ctx.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy));ctx.fillRect(Math.round(cx-w),Math.round(cy+dy),2*w+1,1)}}
function ringPx(ctx,cx,cy,r,col,dash=0,col2=null){const N=Math.ceil(2*Math.PI*r);for(let i=0;i<N;i++){const a=i/N*2*Math.PI;if(dash&&((i/dash|0)%2)){if(!col2)continue;ctx.fillStyle=col2}else ctx.fillStyle=col;ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1)}}

// ===================== LOGO PULZAR SOLUTIONS (pixel art) =====================
const PZ_NAVY='#101c3c',PZ_BLUE='#3d63f2';
const PZLOGO=(()=>{const c=document.createElement('canvas');c.width=52;c.height=34;const x=c.getContext('2d');
  x.fillStyle='#fafafa';x.fillRect(0,0,52,34);x.fillStyle='#d6d9e4';x.fillRect(0,33,52,1);
  const cx=26,cy=11;ringPx(x,cx,cy,7,PZ_NAVY);ringPx(x,cx,cy,7.6,PZ_NAVY);
  x.fillStyle='#fafafa';x.fillRect(cx-9,cy-2,4,5);x.fillRect(cx+6,cy-2,4,5);
  x.fillStyle=PZ_BLUE;for(let X=3;X<49;X++){if(Math.abs(X-cx)<4)continue;const thick=Math.abs(X-cx)<12;x.fillRect(X,thick?cy-1:cy,1,thick?2:1)}
  fillCirc(x,cx,cy,2,PZ_BLUE);
  const W1='PULZ^R';for(let i=0;i<6;i++)ptext(x,W1[i],10+i*6,20,PZ_NAVY);
  const W2='SOLUTIONS';for(let i=0;i<9;i++)ptext(x,W2[i],8+i*4,27,PZ_BLUE);
  return c})();

// ===================== SPRITES =====================
const spr=document.createElement('canvas');spr.width=32;spr.height=16;const sg=spr.getContext('2d');
// ESTILO 16-BIT: cada sprite de carro se dibuja una vez, se le agrega contorno oscuro y sombra suave, y se guarda.
const CARCACHE=new Map(),NOCTX={save(){},restore(){},translate(){},rotate(){},drawImage(){}};
function drawCar(ctx,x,y,h,col,o={},ox=0,oy=0,type='sedan'){col=col||'#e63946';o=o||{};const v=VEH[type]||VEH.sedan;const sir=type==='police'||type==='ambulance';
  const key=GFX+type+'|'+(v.fixed||col)+'|'+(o.brake?1:0)+(o.rev?1:0)+(o.on&&o.bl?1:0)+(o.on&&o.br?1:0)+(o.boost?1:0)+(sir&&o.on?1:0)+'|'+(o.helm||'')+(o.rider||'');
  let cv=CARCACHE.get(key);if(!cv){if(CARCACHE.size>700)CARCACHE.clear();drawCarRaw(NOCTX,0,0,0,col,o,0,0,type);cv=document.createElement('canvas');cv.width=32;cv.height=16;const cx=cv.getContext('2d');
    const id=sg.getImageData(0,0,32,16),d=id.data,A=i=>d[i*4+3],out=new Uint8ClampedArray(d);
    for(let yy=0;yy<16;yy++)for(let xx=0;xx<32;xx++){const i=yy*32+xx;if(A(i)>=200)continue;let n=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=xx+dx,Y=yy+dy;if(X>=0&&Y>=0&&X<32&&Y<16&&A(Y*32+X)>=200){n=true;break}}
      if(n){out[i*4]=18;out[i*4+1]=16;out[i*4+2]=28;out[i*4+3]=235}}
    for(let yy=15;yy>=0;yy--)for(let xx=31;xx>=0;xx--){const i=yy*32+xx;if(out[i*4+3]>=200)continue;const sx=xx-1,sy=yy-1,sx2=xx-2,sy2=yy-2;const op=(X,Y)=>X>=0&&Y>=0&&out[(Y*32+X)*4+3]>=200;
      if(op(sx,sy)||op(sx2,sy2)){out[i*4]=0;out[i*4+1]=0;out[i*4+2]=0;out[i*4+3]=op(sx,sy)?80:45}}
    if(GFX===32)for(let yy=0;yy<16;yy++){const k=1.1-.26*Math.min(1,Math.abs(yy-7.5)/4.5);for(let xx=0;xx<32;xx++){const i=(yy*32+xx)*4;if(d[i+3]<200)continue;const m=d[i]+d[i+1]+d[i+2];if(m<90)continue;const kk=k+(xx>14&&xx<19&&yy===6?.18:0);out[i]=Math.min(255,d[i]*kk);out[i+1]=Math.min(255,d[i+1]*kk);out[i+2]=Math.min(255,d[i+2]*kk)}}
    id.data.set(out);cx.putImageData(id,0,0);CARCACHE.set(key,cv)}
  ctx.save();ctx.translate(Math.round(x-ox),Math.round(y-oy));ctx.rotate(h);ctx.drawImage(cv,-16,-8);ctx.restore()}
function drawCarRaw(ctx,x,y,h,col,o={},ox=0,oy=0,type='sedan'){
  const v=VEH[type]||VEH.sedan;if(v.fixed)col=v.fixed;const L=v.L,Wd=v.Wd;const x0=16-(L>>1),y0=8-(Wd>>1),x1=x0+L-1,y1=y0+Wd-1;const f=(c,a,b,w,hh)=>{sg.fillStyle=c;sg.fillRect(a,b,w,hh)};
  sg.clearRect(0,0,32,16);
  if(type==='kart'){f('rgba(0,0,0,.35)',x0+1,y0+1,L,Wd);for(const[a,b]of[[x0,y0],[x0,y1-1],[x1-2,y0],[x1-2,y1-1]])f('#141414',a,b,3,2);f(col,x0+2,y0+1,L-4,Wd-2);f(shade(col,-.3),x0+2,y0+2,L-4,1);f('#222',x0+3,6,3,4);f(o.helm||'#ffd23f',x0+4,7,2,2);f('#9fd3ff',x0+5,7,1,2);f('#ddd',x1-1,y0+1,1,Wd-2)
    if(o.boost){f('#ff6a00',x0-2,7,2,2);f('#ffd23f',x0-1,7,1,2)}ctx.save();ctx.translate(Math.round(x-ox),Math.round(y-oy));ctx.rotate(h);ctx.drawImage(spr,-16,-8);ctx.restore();return}
  if(v.moto){// motos y bicicletas vistas desde arriba: llantas, cuerpo, piloto con casco y manubrio
    const hc=o.helm||'#1b1b1f';f('rgba(0,0,0,.35)',x0+1,8,L,2);
    if(v.bike){f('#1b1b1f',x0,8,2,1);f('#1b1b1f',x1-1,8,2,1);f('#9aa0a6',x0+2,8,L-4,1);f(col,x0+2,7,3,3);f(hc,x0+3,7,2,2);f('#f1c27d',x0+4,8,1,1);f('#555',x1-2,6,1,5)}
    else{f('#141414',x0,7,2,2);f('#141414',x1-1,7,2,2);f(col,x0+2,7,L-4,2);if(type==='scooter')f(col,x1-3,6,2,4);
      f(o.rider||'#2b2d42',x0+2,6,3,4);f(hc,x0+3,7,2,2);f('#9fd3ff',x0+4,7,1,2);f('#888',x1-2,5,1,6);f('#fff6b0',x1,8,1,1);f(o.brake?'#ff2a2a':'#7a1010',x0,8,1,1);
      if(o.on){if(o.bl){f('#ffb000',x1-1,5,1,1);f('#ffb000',x0,6,1,1)}if(o.br){f('#ffb000',x1-1,10,1,1);f('#ffb000',x0,9,1,1)}}}
    ctx.save();ctx.translate(Math.round(x-ox),Math.round(y-oy));ctx.rotate(h);ctx.drawImage(spr,-16,-8);ctx.restore();return}
  const wr=x0+2,wf=x1-4;if(type==='monster'){for(const wx of[x0,x1-4])for(const wy of[y0-2,y1-1]){f('#141414',wx,wy,5,4);f('#3a3a3a',wx+1,wy+1,3,1)}}else for(const wx of(L>20?[wr,wr+5,wf]:[wr,wf])){f('#141414',wx,y0-1,3,1);f('#141414',wx,y1+1,3,1)}
  f(col,x0,y0,L,Wd);sg.clearRect(x0,y0,1,1);sg.clearRect(x1,y0,1,1);sg.clearRect(x0,y1,1,1);sg.clearRect(x1,y1,1,1);
  f(shade(col,.32),x0+1,y0,L-2,1);f(shade(col,-.32),x0+1,y1,L-2,1);
  const glass='#2b3a55',roof=shade(col,-.14);
  const cab=(rx0,rx1,ws,rw)=>{f(glass,rx0,y0+1,rx1-rx0+1,Wd-2);f(roof,rx0,y0+2,rx1-rx0+1,Wd-4);f('#8fd0ff',ws,y0+1,2,Wd-2);f('#e0f4ff',ws+1,y0+1,1,1);if(rw!=null)f('#5a86aa',rw,y0+1,1,Wd-2);f(shade(col,-.4),ws,y0-1,1,1);f(shade(col,-.4),ws,y1+1,1,1)};
  if(type==='truck'){f('#f2f2f2',x0+1,y0+1,L-9,Wd-2);for(let k=x0+3;k<x1-9;k+=4)f('#d0d0d0',k,y0+1,1,Wd-2);f('#333',x1-8,y0+2,2,Wd-4);f(col,x1-6,y0+1,6,Wd-2);f('#8fd0ff',x1-1,y0+2,1,Wd-4);f('#ffd23f',x0+1,y0+1,1,1);f('#ffd23f',x0+1,y1-1,1,1)}
  else if(type==='garbage'){f('#2e8b57',x0+1,y0+1,L-2,Wd-2);for(let k=x0+2;k<x1-7;k+=3)f('#1f6b40',k,y0+1,1,Wd-2);f('#f4f4f4',x1-6,y0+1,6,Wd-2);f('#8fd0ff',x1-1,y0+1,1,Wd-2);f('#555',x0,y0+2,2,Wd-4);f('#ffd23f',x0+2,y0+1,1,1);f('#ffd23f',x0+2,y1-1,1,1)}
  else if(type==='bus'){f('#f4f4f4',x0+1,y0+1,L-2,Wd-2);for(let k=x0+2;k<x1-3;k+=3){f(glass,k,y0,2,1);f(glass,k,y1,2,1)}f('#8fd0ff',x1-1,y0+1,1,Wd-2);f('#9a9a9a',x0+6,y0+3,4,Wd-6);f('#9a9a9a',x0+15,y0+3,4,Wd-6);f(col,x0+1,y0+1,L-2,1);f(col,x0+1,y1-1,L-2,1)}
  else if(type==='pickup'){cab(x1-8,x1-6,x1-5,x1-9);f(shade(col,-.5),x0+1,y0+2,L-11,Wd-4);f(shade(col,-.2),x0+3,y0+2,1,Wd-4);f(shade(col,-.2),x0+7,y0+2,1,Wd-4)}
  else if(type==='hatch'){cab(x0+2,x1-5,x1-4,x0+1)}
  else if(type==='suv'){cab(x0+2,x1-5,x1-4,x0+1);for(let k=x0+3;k<x1-5;k+=2){f('#bbb',k,y0+1,1,1);f('#bbb',k,y1-1,1,1)}}
  else if(type==='sport'){cab(x0+5,x1-6,x1-5,x0+4);f('#fff',x1-3,7,3,1);f('#fff',x1-3,8,3,1);f('#fff',x0+1,7,3,1);f('#fff',x0+1,8,3,1);f('#111',x0,y0+1,1,Wd-2)}
  else{cab(x0+4,x1-6,x1-5,x0+3);if(type==='taxi'){f('#ffd23f',x0+7,y0+3,2,Wd-6);f('#000',x0+7,y0+3,2,1)}
    if(type==='hyper'){f('#111',x0+1,y0+1,3,Wd-2);f('#fff',x1-4,7,4,2)}if(type==='muscle'){f('#fff',x0+1,7,L-2,1);f('#fff',x0+1,8,L-2,1);f('#222',x1-5,7,2,2)}
    if(type==='rally'){fillCirc(sg,x0+4,8,2,'#fff');f('#000',x0+4,8,1,1);f('#ffd23f',x1-6,y0+1,1,Wd-2);f('#2a9df4',x0+1,y0,L-2,1);f('#2a9df4',x0+1,y1,L-2,1)}
    if(type==='tuner'){f('#111',x0,y0,1,Wd);f('#111',x0+1,y0,1,Wd);f('#ff4fa3',x0+3,y0,L-6,1);f('#ff4fa3',x0+3,y1,L-6,1)}if(type==='monster'){f('#ffd23f',x0+2,y0+2,1,Wd-4);f('#ffd23f',x1-8,y0+3,1,Wd-6)}
    if(o.boost){f('#ff6a00',x0-3,y0+2,3,2);f('#ff6a00',x0-3,y1-3,3,2);f('#ffd23f',x0-2,y0+2,2,1);f('#ffd23f',x0-2,y1-3,2,1)}
    if(type==='ambulance'){f('#e63946',x0+1,y0,L-2,1);f('#e63946',x0+1,y1,L-2,1);f('#e63946',x0+3,7,4,2);f('#e63946',x0+4,6,2,4);f(o.on?'#ff2a4a':'#ffffff',x1-7,y0+2,1,2);f(o.on?'#ffffff':'#ff2a4a',x1-7,y1-3,1,2)}
    if(type==='police'){f('#1d4ed8',x0+1,y0,L-2,1);f('#1d4ed8',x0+1,y1,L-2,1);f(o.on?'#2f6bff':'#ff2a4a',x0+7,y0+2,1,2);f(o.on?'#ff2a4a':'#2f6bff',x0+7,y1-3,1,2)}}
  f('#fff6b0',x1,y0+1,1,1);f('#fff6b0',x1,y1-1,1,1);
  const tl=o.brake?'#ff2a2a':'#7a1010';f(tl,x0,y0+1,1,2);f(tl,x0,y1-2,1,2);
  if(o.rev){f('#fff',x0,y0+3,1,1);f('#fff',x0,y1-3,1,1)}
  if(o.on){if(o.bl){f('#ffb000',x1-1,y0,2,1);f('#ffb000',x0,y0,2,1)}if(o.br){f('#ffb000',x1-1,y1,2,1);f('#ffb000',x0,y1,2,1)}}
  ctx.save();ctx.translate(Math.round(x-ox),Math.round(y-oy));ctx.rotate(h);ctx.drawImage(spr,-16,-8);ctx.restore();
}
