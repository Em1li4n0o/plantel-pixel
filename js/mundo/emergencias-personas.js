'use strict';
// ===================== VEHÍCULOS DE EMERGENCIA =====================
// Cada tanto aparece una ambulancia con sirena detrás del jugador: los demás se orillan; si usted no le cede el paso, es falta.
function emergStep(W,P,dt){if(!W.adj||!W.inter||S.foot)return;S.emT=(S.emT==null?35+Math.random()*20:S.emT)-dt;const E=W.emerg;
  if(E){E.age=(E.age||0)+dt;const d=Math.hypot(E.x-P.x,E.y-P.y);E.sir-=dt;if(E.sir<=0){E.sir=.4;E.tone=!E.tone;beep(E.tone?620:900,.38,'sawtooth',Math.max(0,.06-d/4000))}
    const rx=P.x-E.x,ry=P.y-E.y,f=rx*Math.cos(E.h)+ry*Math.sin(E.h),l=Math.abs(-rx*Math.sin(E.h)+ry*Math.cos(E.h)),behind=f>4&&f<85&&l<11&&Math.cos(P.h-E.h)>.6;
    if(behind&&!S.emWarn){S.emWarn=1;toast('¡AMBULANCIA ATRÁS!','Oríllese a la derecha, baje la velocidad y déjela pasar','bad');say('Ambulancia atrás. Oríllese y ceda el paso.')}
    if(behind&&Math.abs(P.v)>14){S.emBlk=(S.emBlk||0)+dt;if(S.emBlk>3){S.emBlk=-6;fault('emerg','No ceder el paso a un vehículo de emergencia','II',10)}}else if(S.emBlk>0)S.emBlk=Math.max(0,S.emBlk-dt);
    if(E.age>70||d>750){W.ai=W.ai.filter(c=>c!==E);W.emerg=null;S.emWarn=0;S.emT=70+Math.random()*50}return}
  if(S.emT>0)return;S.emT=20;const r=W.roads.find(r=>inR(P.x,P.y,r.rect));if(!r)return;const ax=r.o==='h'?0:1,dir=Math.sign(r.o==='h'?Math.cos(P.h):Math.sin(P.h));if(!dir)return;
  const pc=r.o==='h'?P.x:P.y,on=W.inter.filter(q=>(r.o==='h'?q[1]===r.c:q[0]===r.c)).sort((a,b)=>(a[ax]-b[ax])*dir);const back=on.filter(q=>(q[ax]-pc)*dir<-60).pop(),idx=on.indexOf(back);if(!back||idx<0||idx>=on.length-1)return;
  const a=back,b=on[idx+1],di=u2(a,b);let sx=r.o==='h'?pc-dir*110:r.c,sy=r.o==='h'?r.c:pc-dir*110;if((r.o==='h'?(sx-a[0])*dir:(sy-a[1])*dir)<0){sx=r.o==='h'?a[0]+dir*20:r.c;sy=r.o==='h'?r.c:a[1]+dir*20}
  if(Math.hypot(sx-P.x,sy-P.y)<70)return;
  const c=mkCar('ambulance',{emerg:true,nav:1,nn:[a,b,navPick(W,a,b)],q:[],x:sx-di[1]*7,y:sy+di[0]*7,h:Math.atan2(di[1],di[0]),v:30,vmax:60,cap:64,drv:1.45,ok:{},wait:0,lo:7,sir:0,collT:99});navFill(W,c);W.ai.push(c);W.emerg=c}
// Persona vista desde arriba: sombra, piernas y brazos que se alternan al caminar, torso, cabeza con pelo.
// ===================== PERSONAS CON CARA =====================
// Cada persona tiene: g (m/f), piel, pelo y peinado (hs), ropa, y a veces barba, bigote, lentes o vestido.
function personize(p,R){if(p.g)return p;const r=R||Math.random;const pk=a=>a[(r()*a.length)|0];p.g=r()<.5?'f':'m';p.skin=p.skin&&p.skinFixed?p.skin:pk(SKINS);p.hair=pk(p.g==='f'?HAIRS.slice(0,8):HAIRS.slice(0,8));
  if(r()<.12)p.hair=pk(['#8a8a8a','#cfcfcf']);p.hs=p.g==='f'?pk([2,2,3,3,5,0]):pk([0,0,1,1,4,6]);p.beard=p.g==='m'&&r()<.28?pk([1,2]):0;p.gl=r()<.14;p.dress=p.g==='f'&&r()<.4;
  p.col=p.col||pk(SHIRTS);p.pants=pk(PANTS);p.ht=p.ht||(p.g==='f'?4.1:4.5)+r()*.7;p.seed=r()*10;return p}
// Dibuja una cabeza con cara. dir: 1 de frente, 0 de espaldas, entre -1 y 1 de lado (corre los ojos). mood: '' | 'feliz' | 'enojo' | 'susto'
function drawFace(x,cx,cy,r,F,dir,t,mood){const sk=F.skin,hr=F.hair,hs=F.hs||0;r=Math.max(1,r);const R2=r*1.08;
  const circ=(X,Y,rr,c)=>{x.fillStyle=c;x.beginPath();x.arc(X,Y,rr,0,7);x.fill()};
  if(dir===0){if(hs===2||hs===5){x.fillStyle=hr;x.fillRect(cx-R2,cy-r*.2,2*R2,r*(hs===5?1.9:1.5))}circ(cx,cy,r,sk);circ(cx,cy-r*.08,R2*(hs===4?.9:1),hs===4?'#555':hr);if(hs===3)circ(cx,cy+r*.15,r*.45,hr);return}
  const sx=(dir===1?0:(dir||0))*r*.3;
  // pelo largo detrás de la cabeza
  if(hs===2||hs===5){x.fillStyle=hr;x.fillRect(cx-R2,cy-r*.15,2*R2,r*(hs===5?1.9:1.45))}
  if(hs===3){circ(cx-sx*2.2-(dir>=0?-1:1)*0,cy-r*.6,r*.42,hr);circ(cx-sx*3,cy-r*.35,r*.38,hr)}
  // orejas y cara
  circ(cx-r*.95+sx,cy+r*.08,r*.2,shade(sk,-.12));circ(cx+r*.95+sx,cy+r*.08,r*.2,shade(sk,-.12));circ(cx+sx*.3,cy,r,sk);
  x.fillStyle=shade(sk,-.12);x.fillRect(cx-r*.75+sx*.3,cy+r*.55,r*1.5,r*.12);
  // pelo de arriba según peinado
  x.fillStyle=hr;x.beginPath();x.arc(cx+sx*.3,cy-r*.05,R2,Math.PI*1.02,Math.PI*1.98);x.fill();
  if(hs===0||hs===6){x.fillRect(cx-r*.95+sx*.3,cy-r*.45,r*.45,r*.3);x.fillRect(cx-r*.3+sx*.3,cy-r*.5,r*.9,r*.22)}
  if(hs===1){for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(cx+k*r*.38-r*.18+sx*.3,cy-r*.75);x.lineTo(cx+k*r*.38+sx*.3,cy-r*1.35);x.lineTo(cx+k*r*.38+r*.18+sx*.3,cy-r*.75);x.fill()}}
  if(hs===2||hs===5){x.fillRect(cx-R2+sx*.3,cy-r*.5,r*.45,r*1.2);x.fillRect(cx+R2-r*.45+sx*.3,cy-r*.5,r*.45,r*1.2);x.fillRect(cx-r*.6+sx*.3,cy-r*.62,r*1.1,r*.28)}
  if(hs===3){x.fillRect(cx-r*.85+sx*.3,cy-r*.55,r*1.7,r*.25)}
  if(hs===4){x.fillStyle='#e63946';x.beginPath();x.arc(cx+sx*.3,cy-r*.1,R2,Math.PI,0);x.fill();x.fillRect(cx-r*.2+sx*1.2,cy-r*.25,r*1.35,r*.22)}
  if(hs===6){x.fillStyle=sk;x.beginPath();x.arc(cx+sx*.3,cy-r*.05,r*.98,Math.PI*1.25,Math.PI*1.75);x.fill()}
  if(r<2.2)return;
  // ojos (parpadean de vez en cuando), cejas, boca, cachetes, barba y lentes
  const ex=r*.38,ey=cy+r*.08,es=Math.max(1,r*.2),blink=((t||0)*.6+(F.seed||0))%4<.12,ec='#1b1b24';
  for(const sd of[-1,1]){const X=cx+sd*ex+sx-es/2;if(blink){x.fillStyle=ec;x.fillRect(X,ey,es,Math.max(1,es*.35))}else{x.fillStyle=ec;x.fillRect(X,ey-es*.4,es,es*1.3);if(r>=5){x.fillStyle='#fff';x.fillRect(X+es*.5,ey-es*.4,Math.max(1,es*.4),Math.max(1,es*.4))}
      if(F.g==='f'&&r>=4){x.fillStyle=ec;x.fillRect(sd<0?X-es*.45:X+es,ey-es*.6,Math.max(1,es*.45),Math.max(1,es*.35))}}
    if(r>=4){x.fillStyle=shade(hr,-.1);const tilt=mood==='enojo'?sd*r*.08:0;x.save();x.translate(cx+sd*ex+sx,ey-es*1.1);x.rotate(tilt*.6);x.fillRect(-es*.75,-Math.max(1,r*.07)-(mood==='susto'?r*.12:0),es*1.5,Math.max(1,r*.12));x.restore()}}
  if(F.gl&&r>=3){x.strokeStyle='#222';x.lineWidth=Math.max(.6,r*.07);for(const sd of[-1,1])x.strokeRect(cx+sd*ex+sx-es,ey-es*.9,es*2,es*1.9);x.beginPath();x.moveTo(cx-ex+sx+es,ey);x.lineTo(cx+ex+sx-es,ey);x.stroke()}
  if(F.g==='f'&&r>=4){x.fillStyle='rgba(255,120,140,.35)';x.fillRect(cx-ex*1.55+sx,ey+es*1.1,es*1.2,es*.7);x.fillRect(cx+ex*1.55+sx-es*1.2,ey+es*1.1,es*1.2,es*.7)}
  if(F.beard===1){x.fillStyle=hr;x.globalAlpha=.85;x.beginPath();x.arc(cx+sx*.6,cy+r*.25,r*.82,Math.PI*.12,Math.PI*.88);x.fill();x.globalAlpha=1}
  const my=cy+r*.55,mw=r*.5;
  if(F.beard===2&&r>=3){x.fillStyle=hr;x.fillRect(cx-mw*.7+sx,my-r*.22,mw*1.4,Math.max(1,r*.14))}
  if(r>=3){if(mood==='susto'){circ(cx+sx,my,Math.max(.8,r*.16),'#5a1a1a')}
    else if(mood==='enojo'){x.fillStyle='#5a1a1a';x.fillRect(cx-mw/2+sx,my,mw,Math.max(1,r*.1))}
    else{x.fillStyle='#7a2230';x.fillRect(cx-mw/2+sx,my,mw,Math.max(1,r*.13));x.fillRect(cx-mw/2-r*.1+sx,my-r*.1,Math.max(1,r*.12),Math.max(1,r*.12));x.fillRect(cx+mw/2+sx-r*.02,my-r*.1,Math.max(1,r*.12),Math.max(1,r*.12));
      if(mood==='feliz'&&r>=6){x.fillStyle='#fff';x.fillRect(cx-mw/2+sx+r*.05,my,mw-r*.1,Math.max(1,r*.07))}}}}
// Retrato (para diálogos, garaje y licencia): cabeza grande con hombros
// caras fijas de los personajes que hablan (el evaluador siempre se ve igual)
function speakerFace(n){n=String(n||'').toUpperCase();if(/^(USTED|YO|CONDUCTOR)/.test(n))return AV;if(FACES[n])return FACES[n];for(const k in FACES)if(n.includes(k))return FACES[k];let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;let s0=h;return personize({},()=>{s0=(s0*1664525+1013904223)>>>0;return s0/4294967296})}
function drawPortrait(x,w,h,F,t,mood,bg){x.fillStyle=bg||'#9fd3ff';x.fillRect(0,0,w,h);const r=w*.27;x.fillStyle=F.col;x.beginPath();x.ellipse(w/2,h+w*.08,w*.42,w*.36,0,Math.PI,0);x.fill();x.fillStyle=shade(F.col,-.25);x.fillRect(w/2-w*.08,h-w*.27,w*.16,w*.06);
  x.fillStyle=F.skin;x.fillRect(w/2-r*.35,h*.5+r*.6,r*.7,r*.6);drawFace(x,w/2,h*.45,r,F,1,t,mood)}
function drawWalker2D(g,x,y,h,an,v,F){if(!F.g&&!F.foot)personize(F);const sw=v>.3?Math.sin(an*9)*(v>10?2.2:1.4):0;
  g.save();g.translate(Math.round(x),Math.round(y));g.rotate(h);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(1,1,3.2,2.4,0,0,7);g.fill();
  g.fillStyle=F.pants;g.fillRect(Math.round(sw)-1,-2,2,1.6);g.fillRect(Math.round(-sw)-1,.6,2,1.6);g.fillStyle='#222';g.fillRect(Math.round(sw)+1,-2,1,1.6);g.fillRect(Math.round(-sw)+1,.6,1,1.6);
  g.fillStyle=F.skin;g.fillRect(Math.round(-sw*.8)-.5,-3.4,1.6,1.2);g.fillRect(Math.round(sw*.8)-.5,2.2,1.6,1.2);
  g.fillStyle=F.col;g.fillRect(-1.6,-2.6,3.2,5.2);g.fillStyle=shade(F.col,-.25);g.fillRect(-1.6,1.6,3.2,1);
  if(F.hs===2||F.hs===5){g.fillStyle=F.hair;g.fillRect(-2.6,-1.4,2,2.8)}g.fillStyle=F.skin;g.beginPath();g.arc(.3,0,1.5,0,7);g.fill();g.fillStyle=F.hs===4?'#e63946':F.hair;g.beginPath();g.arc(-.1,0,1.5,Math.PI*.55,Math.PI*1.45);g.fill();g.restore()}
