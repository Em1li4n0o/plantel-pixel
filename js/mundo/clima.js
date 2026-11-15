'use strict';
// ===================== CLIMA Y HORA DEL DÍA =====================
// En manejo libre el día avanza (1 hora de juego ≈ 40 s) y a veces llueve: de noche o con lluvia hay que encender las luces [L]; con lluvia se frena peor.
function wxInit(){const RD=ROUTEDEF[S.mode];S.wx={on:!S.exam||!!(RD&&RD.clock),clock:RD&&RD.clock?RD.clock:S.exam?10:16.6,per:RD&&RD.clock?150:40,noRain:!!(RD&&RD.clock),rain:0,rt:0,next:50+Math.random()*60,n:0,drops:[]};S.grip=1;S.P.lights=false}
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function nightOf(h){return h<12?1-smooth(5,6.6,h):smooth(17.4,19,h)}
function updateWx(dt){const X=S.wx;if(!X||!X.on){S.grip=1;return}const P=S.P;const prevH=X.clock|0;X.clock=(X.clock+dt/(X.per||40))%24;X.n=nightOf(X.clock);
  if((X.clock|0)!==prevH){const h=X.clock|0;if(h===18)toast('ATARDECER','Encienda las luces con '+(TOUCH?'LUCES':'[L]'),'info');if(h===6)toast('AMANECE','Ya puede apagar las luces','info')}
  X.next-=dt;if(X.next<=0&&!X.noRain){X.next=60+Math.random()*90;const was=X.rt>0;X.rt=Math.random()<.4?.5+Math.random()*.5:0;if(X.rt>0&&!was)toast('EMPIEZA A LLOVER','Luces encendidas, más distancia y frene antes: la calle resbala','info');if(!X.rt&&was)toast('ESCAMPÓ','La calle sigue mojada un rato','info')}
  X.rain+=clamp(X.rt-X.rain,-dt*.08,dt*.08);S.grip=1-.4*X.rain;
  if((X.n>.5||X.rain>.35)&&!P.lights&&Math.abs(P.v)>3&&!S.foot){S.noLT=(S.noLT||0)+dt;if(S.noLT>5){S.noLT=-20;fault('luces',X.n>.5?'Manejar de noche sin las luces encendidas':'Manejar con lluvia sin las luces encendidas','IV',30)}}else if(S.noLT>0)S.noLT=0}
function clockTxt(){const X=S.wx;if(!X||!X.on)return'';const h=X.clock|0,m=(X.clock%1)*60|0;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+(X.rain>.15?' LLUVIA':'')}
function glow(ctx,x,y,r,col){const gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,2*r,2*r)}
function rainFx(ctx,w,h,k,t,slant){const n=Math.round(140*k);ctx.strokeStyle='rgba(190,215,255,.45)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<n;i++){const x=((i*97+t*30*(i%3+1))%(w+40))-20,y=((i*61+t*(260+i%5*40))%(h+30))-15;ctx.moveTo(x,y);ctx.lineTo(x+slant,y+7)}ctx.stroke()}
function atmo2D(W,P,ix,iy,zm,t){const X=S.wx;if(X&&X.on){const hr=X.clock,gold=Math.max(0,1-Math.abs(hr-17.9)/1.3),dawn=Math.max(0,1-Math.abs(hr-6)/.8);if(gold>0||dawn>0){g.fillStyle=`rgba(255,${120+40*dawn|0},60,${.16*Math.max(gold,dawn)})`;g.fillRect(0,0,VW,VH)}}if(!X||!X.on||(X.n<.02&&X.rain<.02))return;const sx=x=>(x-ix)*zm,sy=y=>(y-iy)*zm;
  if(X.rain>.02){g.fillStyle=`rgba(40,60,90,${.18*X.rain})`;g.fillRect(0,0,VW,VH)}
  if(X.n>.02){g.fillStyle=`rgba(8,12,38,${.62*X.n})`;g.fillRect(0,0,VW,VH);g.save();g.globalCompositeOperation='lighter';const a=X.n;
    for(const nd of W.nodes.concat(W.lamps||[])){const x=sx(nd.x),y=sy(nd.y);if(x<-40||x>VW+40||y<-40||y>VH+40)continue;glow(g,x,y,30*zm,`rgba(255,200,120,${.22*a})`)}
    const cars=W.ai.concat(W.ringCars);if(P&&(P.lights||S.foot))cars.push(P);if(S.cop)cars.push(S.cop);
    for(const c of cars){const x=sx(c.x),y=sy(c.y);if(x<-60||x>VW+60||y<-60||y>VH+60)continue;const cc=Math.cos(c.h),ss=Math.sin(c.h),L=(c.L||14)/2;
      if(c!==P||P.lights)glow(g,sx(c.x+cc*(L+12)),sy(c.y+ss*(L+12)),15*zm,`rgba(255,245,200,${.32*a})`);glow(g,sx(c.x-cc*L),sy(c.y-ss*L),5*zm,`rgba(255,40,40,${.45*a})`)}
    if(S.foot)glow(g,sx(S.foot.x),sy(S.foot.y),10*zm,`rgba(255,230,160,${.2*a})`);g.restore()}
  if(X.rain>.02)rainFx(g,VW,VH,X.rain,t,-3)}
function atmo3D(V,C,W,P,t,mirror){const X=S&&S.wx;if(X&&X.on){const hr=X.clock,gold=Math.max(0,1-Math.abs(hr-17.9)/1.3);if(gold>0){V.ctx.fillStyle=`rgba(255,130,60,${.13*gold})`;V.ctx.fillRect(0,V.hz-10,V.w,V.h)}}if(!X||!X.on||(X.n<.02&&X.rain<.02))return;const ctx=V.ctx,a=X.n;
  if(X.rain>.02){ctx.fillStyle=`rgba(70,85,110,${.25*X.rain})`;ctx.fillRect(0,0,V.w,V.h)}
  if(a>.02){ctx.fillStyle=`rgba(6,10,32,${.66*a})`;ctx.fillRect(0,0,V.w,V.h);ctx.save();ctx.globalCompositeOperation='lighter';
    if(a>.6&&X.rain<.3){ctx.fillStyle=`rgba(255,255,255,${(a-.6)*1.6})`;for(let i=0;i<60;i++){const ang=i*2.399,sx=((ang-C.h)%6.283+6.283)%6.283;const x=(sx/1.4)*V.w-V.w*.5,y=(i*37%(V.hz-10));if(x>=0&&x<V.w)ctx.fillRect(x|0,y|0,1,1)}}
    for(const nd of W.nodes.concat(W.lamps||[])){const B=bill(C,V,nd.x,nd.y,nd.z||9);if(B&&B.f<260)glow(ctx,B.x,B.y,Math.max(3,5*B.k),`rgba(255,200,120,${.6*a})`)}
    if(!mirror&&!S.foot&&P.lights){ctx.fillStyle=`rgba(255,240,190,${.16*a})`;ctx.beginPath();ctx.moveTo(V.w*.3,V.h);ctx.lineTo(V.w*.44,V.hz+6);ctx.lineTo(V.w*.56,V.hz+6);ctx.lineTo(V.w*.7,V.h);ctx.fill()}
    ctx.restore()}
  if(X.rain>.02&&!mirror)rainFx(ctx,V.w,V.h,X.rain,t,-1)}
function wipers(t){const X=S.wx;if(!X||X.rain<.25||isMoto(S.P.type))return;const a=-Math.PI/2+Math.sin(t*3.2)*1.15;g.strokeStyle='#111';g.lineWidth=3;
  for(const bx of[110,250]){g.beginPath();g.moveTo(bx,184);g.lineTo(bx+Math.cos(a)*120,184+Math.sin(a)*120);g.stroke()}
  g.fillStyle='rgba(200,225,255,.35)';for(let i=0;i<40;i++){const x=(i*73+((t*7|0)*31))%360+12,y=(i*41+((t*5|0)*17))%170+6;g.fillRect(x,y,2,2)}}
