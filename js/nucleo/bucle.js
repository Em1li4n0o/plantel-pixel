'use strict';
// ===================== BUCLE =====================
function step(dt){
  S.t+=dt;S.dt=dt;const W=S.W,P=S.P;
  if(S.dlg&&S.dlg.auto){S.dlg.t+=dt;if(S.dlg.t>dlgDur(S.dlg,3.6)){S.dlg.i++;S.dlg.t=0}if(S.dlg.i>=S.dlg.lines.length)S.dlg=null}
  updateWx(dt);if(W.gravelP&&!S.foot){const F=W.gravelP.some(pa=>pa.segs.some(q=>{const t=clamp(((P.x-q.ax)*q.dx+(P.y-q.ay)*q.dy)/q.len2,0,1),ex=q.ax+q.dx*t-P.x,ey=q.ay+q.dy*t-P.y;return ex*ex+ey*ey<121}));if(F&&!S.gravel&&!S.gWarnL){S.gWarnL=1;toast('CALLE DE LASTRE','Máximo 40 km/h: el carro resbala más y necesita más distancia para frenar','info')}S.gravel=F;if(F){S.grip=(S.grip||1)*.72;if(Math.abs(P.v)>25)S.shake=Math.max(S.shake||0,.06)}}else S.gravel=false;recTrace(W,P);updateRadio(dt);if(!S.exam&&(S.t%1)<dt)checkDaily();
  if(S.respawn>0){S.respawn-=dt;if(S.respawn<=0){const b=P.belt;Object.assign(P,spawnState(W));P.belt=b}updateWorld(W,P,dt,S.t);return}
  if(S.cop&&S.cop.arrest){updateCop(dt);updateWorld(W,P,dt,S.t);return}
  if(!S.exam){copWanted();updateCop(dt)}if(!S.exam||S.mode==='street')emergStep(W,P,dt);
  if(S.ev&&(S.ev.ph==='safe'||S.ev.ph==='crash')){evAnim(W,P,dt);updateWorld(W,P,dt,S.t);return}
  if(W.events&&!S.exam)evStep(W,P,dt);
  if(S.foot){updateFoot(W,dt);P.v=0;P.thr=0;updateWorld(W,P,dt,S.t);return}
  const px=P.x,py=P.y;
  updatePlayer(W,P,dt);if(S.over)return;
  rules(W,P,px,py,dt);if(S.over)return;if(W.tolls)tollRules(W,P,dt);if(W.r32)r32Rules(W,P,dt);if(W.pstops)pstopRules(W,P,dt);if(W.cLights&&W.cLights.length)semRules(W,P,dt);if(S.over)return;
  updateWorld(W,P,dt,S.t);if(S.over)return;
  if(S.exam){const tk=S.tasks[S.task];if(tk){if(!tk.started){tk.started=true;tk.start&&tk.start();say(tk.txt,true)}
      if(tk.check()){toast('✔ '+(tk.ok||'¡LISTO!'),'','good');sfx.good();S.task++;if(S.task>=S.tasks.length)endExam('done')}}}
  else if(W.taxi){taxiStep(W,P,dt);lapStep(W,P)}
  else{const d=S.dest;if(Math.hypot(P.x-d.x,P.y-d.y)<16){S.deliv++;const el=S.t-S.destT,bonus=Math.max(0,Math.round((S.destPar-el)*5)),mult=1+Math.min(S.streak,6)*.5;
      const gain=Math.round((100+bonus)*mult);S.pts+=gain;S.streak++;S.best=Math.max(S.best,S.pts);
      toast('✔ LLEGÓ A '+d.n,`+${gain} pts (bono tiempo ${bonus}, x${mult})`+(S.streak>1?` · RACHA ${S.streak}`:''),'good');sfx.good();newDest()}}
  const bp=Math.floor(S.t*2.6)%2;if((P.blinkL||P.blinkR||P.haz)&&bp!==S.blinkPh)(bp?sfx.tock:sfx.tick)();S.blinkPh=bp;
  for(const R of W.rails){const tr=trainRect(W,R,S.t);if(tr){const d=Math.hypot(tr.x+tr.w/2-P.x,tr.y+tr.h/2-P.y);if(d<320&&S.horned!==Math.floor((S.t+R.off)/R.period)){S.horned=Math.floor((S.t+R.off)/R.period);sfx.horn()}}
    for(const cr of R.cross)if(railWarn(W,R,cr.ca,S.t)&&Math.hypot(cr.x-P.x,cr.y-P.y)<150){S.bellT-=dt;if(S.bellT<=0){S.bellT=.45;sfx.bell()}}}
}
function updateHUD(){const P=S.P;let tg=null;{const ct=clockTxt();if(ct&&!S.mapOpen){const w=ct.length*4+5;g.fillStyle='rgba(10,10,20,.75)';g.fillRect(292,128,w,9);ptext(g,ct,295,130,S.wx.n>.5?'#9cf':'#ffd23f')}}$('dlg').classList.toggle('hidden',!S.dlg);$('dlgFace').classList.toggle('hidden',!S.dlg);if(S.dlg){const d=S.dlg,l=d.lines[Math.min(d.i,d.lines.length-1)];const pf=$('dlgFace');if(pf){pf.classList.remove('hidden');const pc=pf.getContext('2d');drawPortrait(pc,32,32,speakerFace(l[0]),S.t,/BIEN|FELICIT|EXCELENT|APROB/i.test(l[1])?'feliz':/NO |MAL|CUIDADO|FALTA/i.test(l[1])?'enojo':'','#cfe8ff')}if(d.spk!==d.i&&d.i<d.lines.length){d.spk=d.i;say(l[1],true)}const h='<b>'+l[0]+':</b> '+l[1]+'<small>'+(TOUCH?'Toque para seguir':'ENTER para seguir')+'</small>';if($('dlg').innerHTML!==h)$('dlg').innerHTML=h}$('touch').classList.toggle('hidden',!TOUCH||S.over);$('tbTurbo').style.display=S.arcade?'':'none';
  if(S.exam){const tk=S.tasks[S.task];$('tasknum').textContent=tk?`${S.mode==='street'?'CALLE':'TAREA'} ${S.task+1}/${S.tasks.length}`:'FIN';$('tasktxt').textContent=tk?tk.txt:'';tg=tk?tk.tgt:null;
    $('scoreLbl').textContent='PUNTOS';$('score').textContent=Math.max(0,S.score);$('score').classList.toggle('low',S.score<80);$('time').textContent=fmtT(S.t)}
  else if(S.tire){$('tasknum').textContent='LLANTA REVENTADA · PASO '+(S.tire.st+1)+'/5';$('tasktxt').textContent=tireText();tg=S.tire.st===2?S.tire.tri:S.tire.st===3?S.tire.wh:null;$('scoreLbl').textContent='PUNTOS';$('score').textContent=S.pts;$('time').textContent=`${S.infr} INFRAC`}
  else if(S.W.taxi&&S.tx){const T=S.tx;$('tasknum').textContent=`TAXI · VIAJE ${T.n}`+(S.lapStart!=null&&S.lapI!=null?` · VUELTA ${fmtLap(S.t-S.lapStart)}`:'');$('tasktxt').textContent=T.ph==='pick'?'Recoja al pasajero en '+T.from.n+' (deténgase a su lado)':'Lleve al pasajero a '+T.to.n+'. Sin infracciones = propina.';tg=S.dest;
    $('scoreLbl').textContent='GANANCIAS';$('score').textContent='₡'+S.pts;$('score').classList.toggle('low',false);$('time').textContent=`${S.deliv} VIAJES · ${S.infr} INFRAC`}
  else{const left=Math.max(0,Math.ceil(S.destPar-(S.t-S.destT)));$('tasknum').textContent=`DESTINO ${S.deliv+1} · BONO: ${left}s`;$('tasktxt').textContent='Maneje hasta '+S.dest.n+' sin infracciones. ¡Rápido pero legal!';tg=S.dest;
    $('scoreLbl').textContent=`PUNTOS · RACHA x${1+Math.min(S.streak,6)*.5}`;$('score').textContent=S.pts;$('score').classList.toggle('low',false);$('time').textContent=`${S.infr} INFRAC · ${S.angered} ENOJADOS`}
  const kmh=Math.round(Math.abs(P.v)*KMH),lim=S.lim||S.W.limit;$('spd').textContent=kmh;
  $('speedo').className=kmh>lim?'over':kmh>=lim-3?'warn':'';$('spdLbl').textContent=kmh>lim?'¡LENTO!':'KM/H';
  const br=P.bp>0||P.brake;$('pedBar').className=br?'brk':'';$('pedBar').style.height=((br?Math.max(.3,P.bp):P.thr>0||keys.w?.2+.8*P.thr:0)*100)+'%';
  $('gear').textContent=P.gear===1?(P.low?'L':'D'):'R';$('gear').classList.toggle('r',P.gear===-1);$('lim').textContent=S.lim||S.W.limit;
  $('belt').className=P.belt?'on':'off';{const bw=isMoto(P.type)?'CASCO':'CINTURÓN';$('belt').textContent=P.belt?bw+' ✔':bw+' [C]'}
  if(S.arcade){g.fillStyle='rgba(10,10,20,.8)';g.fillRect(292,118,62,9);g.fillStyle='#333';g.fillRect(294,120,30,5);g.fillStyle=P.nitro>.2?'#3df2ff':'#ff4d4d';g.fillRect(294,120,30*P.nitro,5);ptext(g,'TURBO',326,120,'#fff')}
  const on=Math.floor(S.t*2.6)%2===0;$('sigL').classList.toggle('on',(P.blinkL||P.haz)&&on);$('sigR').classList.toggle('on',(P.blinkR||P.haz)&&on);
  return tg}

let last=performance.now(),acc=0;
function hideSplash(){const e=$('splash');if(!e||e.dataset.out)return;e.dataset.out=1;const go=()=>{e.classList.add('out');setTimeout(()=>e.remove(),500)};(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(go,250))}
setTimeout(()=>{try{hideSplash()}catch(e){}},8000);
function frame(now){requestAnimationFrame(frame);try{tick(now)}catch(e){console.error(e)}}
function tick(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
  if(ui==='theory'){if(TH.mode)thHead();const q=TH.mode&&TH.list[TH.i];if(q&&q.s&&q.s.endsWith('f'))drawSign(q.s,performance.now()/1000)}
  if(S&&S.replay){drawReplay(dt);return}
  lookRelax(dt);
  if(S){
    if(!S.paused&&!S.over&&!S.mapOpen&&!(S.ev&&(S.ev.ph==='ask'||S.ev.over))){acc+=dt*(S.ev&&S.ev.ph==='slow'?.22:1);while(acc>=1/60){step(1/60);acc-=1/60;for(const k in pressed)delete pressed[k];if(S.over)break}}else{acc=0;for(const k in pressed)delete pressed[k]}
    const W=S.W,P=S.P;const sh=S.shake>0?(S.shake-=dt,S.shake*6):0;// cámara: el carro siempre al centro de la pantalla; zoom con + / -
    const zm=S.zoom||1,vw=VW/zm,vh=VH/zm,FC=S.foot||P;S.cx=FC.x-vw/2+(Math.random()-.5)*sh;S.cy=FC.y-vh/2+(Math.random()-.5)*sh;
    const ix=Math.round(S.cx*zm)/zm,iy=Math.round(S.cy*zm)/zm;$('hud').classList.toggle('fp',!!S.fp&&!S.chase);$('hud').classList.toggle('map',!!S.mapOpen);
    if(S.mapOpen){const tg=updateHUD();drawFullMap(W,P,S.t,tg)}
    else if(S.fp&&S.foot&&S.chase){const F=S.foot;S.camH=nA((S.camH||F.h)+nA(F.h-(S.camH||F.h))*Math.min(1,dt*4));const ch0=S.camH+(S.yaw||0),cx=F.x-Math.cos(ch0)*9,cy=F.y-Math.sin(ch0)*9,ch=Math.atan2(F.y-cy,F.x-cx),c=Math.cos(ch),s=Math.sin(ch);VMAIN.hz=Math.round(70+(S.lp||0)*80);
      render3D(VMAIN,{x:cx,y:cy,z:5.5,h:ch,c,s},W,P,S.t,false);g.drawImage(VMAIN.c,0,0);evOver(true);const tg=updateHUD();if(!S.over)compass(F,tg);drawMini(W,F,tg)}
    else if(S.fp&&S.foot){const F=S.foot,lt=keys.z?-1.05:keys.x?1.05:0;S.look=(S.look||0)+(lt-(S.look||0))*Math.min(1,dt*7);const hh=F.h+S.look+(S.yaw||0);VMAIN.hz=Math.round((S.lp||0)*90)+84+Math.round(Math.sin(F.an*9)*(F.v>1?1:0));
      render3D(VMAIN,{x:F.x,y:F.y,z:3,h:hh,c:Math.cos(hh),s:Math.sin(hh)},W,P,S.t,false);g.drawImage(VMAIN.c,0,0);evOver(true);const tg=updateHUD();if(!S.over)compass(F,tg);drawMini(W,F,tg)}
    else if(S.fp&&S.chase&&!S.foot){
      // CÁMARA DE SEGUNDA PERSONA: cerca y baja despacio (plantel), más lejos y alta en carretera; la distancia se retrasa al acelerar,
      // en las curvas se abre hacia afuera, en reversa sube para ver los conos de atrás y nunca queda metida en un edificio
      const sp=Math.abs(P.v),rev=P.gear===-1,k=Math.min(1,sp/55);S.camH=nA(S.camH+nA(P.h-S.camH)*Math.min(1,dt*(rev?3:4.5)));
      const tB=rev?17:23+k*9,tZ=rev?16:9.6+k*1.8;S.camB=(S.camB||tB)+(tB-(S.camB||tB))*Math.min(1,dt*1.6);S.camZ=(S.camZ||tZ)+(tZ-(S.camZ||tZ))*Math.min(1,dt*2);
      const ch0=S.camH+(S.yaw||0),inB=(x,y)=>{for(const b of W.blds)if(!b.poste&&b.ht>3&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return true;if(W.pblds)for(const b of W.pblds)if(b.ht>3&&Math.abs(x-b.cx)<b.rad&&inPoly(x,y,b.p))return true;return false};
      let back=S.camB;for(let d=4;d<=S.camB;d+=2)if(inB(P.x-Math.cos(ch0)*d,P.y-Math.sin(ch0)*d)){back=Math.max(6,d-3);break}
      const cx=P.x-Math.cos(ch0)*back,cy=P.y-Math.sin(ch0)*back,ah=rev?0:4+sp*.05,ax=P.x+Math.cos(P.h)*ah,ay=P.y+Math.sin(P.h)*ah,ch=Math.atan2(ay-cy,ax-cx),c=Math.cos(ch),s=Math.sin(ch);
      VMAIN.hz=Math.round(62+(S.lp||0)*80-(S.camZ-9.6)*2.5);
      render3D(VMAIN,{x:cx,y:cy,z:S.camZ,h:ch,c,s},W,P,S.t,false);g.drawImage(VMAIN.c,0,0);evOver(true);const tg=updateHUD();if(!S.over)compass(P,tg);drawMini(W,P,tg)}
    else if(S.fp){const c=Math.cos(P.h),s=Math.sin(P.h);
      // cabeza: Z/X mirar a los lados (espejos laterales), F mirar hacia arriba; se inclina sola al detenerse junto a un semáforo
      const lt=keys.z?-1.05:keys.x?1.05:0;S.look=(S.look||0)+(lt-(S.look||0))*Math.min(1,dt*7);
      let pt=keys.f?1:0;if(!pt&&Math.abs(P.v)<4)for(const st of W.stops){if(st.kind!=='light')continue;const hz2=st.dir==='E'||st.dir==='W';const lat=hz2?P.y:P.x;if(lat<st.a-3||lat>st.b+3)continue;const sg=(st.dir==='E'||st.dir==='S')?1:-1;const d=(st.pos-(hz2?P.x:P.y))*sg;const dv=dirVec[st.dir];if(d>-2&&d<30&&(c*dv[0]+s*dv[1])>.5){pt=.75;break}}
      S.pitch=(S.pitch||0)+(pt-(S.pitch||0))*Math.min(1,dt*5);const slp=P.slope?P.slAl*P.slope.grade:0;S.slp=(S.slp||0)+(slp-(S.slp||0))*Math.min(1,dt*4);{const acc=(P.v-(S.pv??P.v))/Math.max(dt,1e-3);S.pv=P.v;S.nod=(S.nod||0)+(clamp(acc*.18,-6,6)-(S.nod||0))*Math.min(1,dt*5)}VMAIN.hz=Math.round(84+S.pitch*80-S.slp*280+(S.lp||0)*90+(S.nod||0));
      const hh=P.h+S.look+(S.yaw||0);render3D(VMAIN,{x:P.x+c+s*1.5,y:P.y+s-c*1.5,z:4-Math.min(3,(P.sea||0)*1.8),h:hh,c:Math.cos(hh),s:Math.sin(hh)},W,P,S.t,false);
      S.mirF=((S.mirF||0)+1)%3;if(S.mirF===0)render3D(VMIR,{x:P.x-c*2+s*1.5,y:P.y-s*2-c*1.5,z:4.3,h:P.h+Math.PI,c:-c,s:-s},W,P,S.t,true);
      if(S.look<-.25){const a=P.h+Math.PI+.22;render3D(VSL,{x:P.x+c*1.5+s*5,y:P.y+s*1.5-c*5,z:4,h:a,c:Math.cos(a),s:Math.sin(a)},W,P,S.t,true)}
      if(S.look>.25){const a=P.h+Math.PI-.22;render3D(VSR,{x:P.x+c*1.5-s*5,y:P.y+s*1.5+c*5,z:4,h:a,c:Math.cos(a),s:Math.sin(a)},W,P,S.t,true)}
      g.drawImage(VMAIN.c,0,0);evOver(true);wipers(S.t);cockpit(P,S.t);const tg=updateHUD();if(!S.over)compass(P,tg);drawMini(W,P,tg)}
    else{g.fillStyle='#2f6b2a';g.fillRect(0,0,VW,VH);g.save();g.setTransform(zm,0,0,zm,0,0);drawWorld(W,P,ix,iy,S.t);if(S.smoke)for(const q of S.smoke){if(q.t>1.2)continue;const r=2+q.t*6;g.fillStyle=`rgba(225,225,230,${.45*(1-q.t/1.2)})`;g.beginPath();g.arc(q.x-ix,q.y-iy,r,0,7);g.fill()}g.restore();atmo2D(W,P,ix,iy,zm,S.t);evOver(false);const tg=updateHUD();if(tg&&!S.over)drawTarget(tg,ix,iy,S.t,zm);drawMini(W,P,tg)}
    if(P.sea>0&&!S.over){g.fillStyle=`rgba(20,110,160,${Math.min(.55,P.sea*.3)})`;g.fillRect(0,0,VW,VH)}
    if(!S.mapOpen)post32();
    if(engG&&AC){if(!SQG){try{const o=AC.createOscillator(),gn=AC.createGain();o.type='sawtooth';o.frequency.value=820;gn.gain.value=0;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1100;f.Q.value=3;o.connect(f);f.connect(gn);gn.connect(master);o.start();SQO=o;SQG=gn}catch(e){SQG={gain:{}}}}
      const sl=(muted||S.paused||S.over)?0:Math.max(P.slip||0,P.brake&&-(P.aLong||0)>=muG()*.97&&Math.abs(P.v)>20?.5:0);SQG.gain.value=Math.min(.05,sl*.07);if(SQO)SQO.frequency.value=760+Math.random()*120}
    if(engG&&AC){engG.gain.value=(muted||S.paused||S.over)?0:.035;eng.frequency.value=38+Math.abs(P.v)*1.7+(keys.w||keys.s?8:0)}
  }else{
    if(SQG&&SQG.gain)SQG.gain.value=0;
    for(const k in pressed)delete pressed[k];
    if(!A){const W=buildCity();W.bg=renderBG(W);W.skid=document.createElement('canvas');W.skid.width=W.w;W.skid.height=W.h;A={W,t:0,cx:300,cy:380}}
    A.t+=dt;updateWorld(A.W,null,dt,A.t);A.cx=330+Math.sin(A.t*.05)*300;A.cy=380+Math.cos(A.t*.07)*230;
    drawWorld(A.W,null,Math.round(clamp(A.cx,0,A.W.w-VW)),Math.round(clamp(A.cy,0,A.W.h-VH)),A.t);post32();hideSplash();
  }}
function fit(){{const vv=window.visualViewport,iw=vv?vv.width:innerWidth,ih=vv?vv.height:innerHeight,wr=$('wrap'),ww=Math.min(iw,ih*VW/VH);wr.style.width=ww+'px';wr.style.height=(ww*VH/VW)+'px';wr.style.left=((vv?vv.offsetLeft:0)+iw/2)+'px';wr.style.top=((vv?vv.offsetTop:0)+ih/2)+'px'}
  const w=$('wrap').getBoundingClientRect().width;$('wrap').style.setProperty('--u',(w/VW)+'px');const u=w/VW;
  for(const b of document.querySelectorAll('#touch .tb')){if(!b.dataset.l){b.dataset.l=parseFloat(b.style.left);b.dataset.t=parseFloat(b.style.top)}b.style.left=(b.dataset.l*u)+'px';b.style.top=(b.dataset.t*u)+'px'}}
let TOUCH=matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches;
// Perfil inicial: dispositivo y licencia que está sacando (adapta los controles y se guarda con cada intento para el instructor)
let PROF=store.get('pp_prof',null);
function applyProf(){if(!PROF)return;TOUCH=PROF.dev==='movil';document.body.classList.toggle('touch',TOUCH);const L=LICS.find(l=>l.id===PROF.lic);$('profL').textContent='PERFIL: '+(PROF.dev==='movil'?'TELÉFONO':'COMPUTADORA')+' · '+(L?'LICENCIA '+L.id:'PRÁCTICA LIBRE')+' (CAMBIAR)'}
function openWelcome(){show('welScr');ui='wel';const sel={dev:PROF?PROF.dev:(TOUCH?'movil':'pc'),lic:PROF?PROF.lic:null};
  $('welLic').innerHTML=LICS.filter(l=>l.id!=='ARCADE').map(l=>`<button data-l="${l.id}" style="min-width:0;padding:calc(var(--u)*1.5) calc(var(--u)*2.5)">${l.id}<small>${l.d}</small></button>`).join('')+'<button data-l="-" style="min-width:0">AÚN NO SÉ<small>solo practicar</small></button>';
  const paint=()=>{for(const b of $('welDev').children)b.classList.toggle('sel',b.dataset.d===sel.dev);for(const b of $('welLic').children)b.classList.toggle('sel',b.dataset.l===sel.lic);$('welOk').disabled=!(sel.dev&&sel.lic&&$('welTycChk').checked)};$('welTycChk').checked=tycOk();$('welTycChk').onchange=paint;
  for(const b of $('welDev').children)b.onclick=()=>{sel.dev=b.dataset.d;paint()};for(const b of $('welLic').children)b.onclick=()=>{sel.lic=b.dataset.l;paint()};
  $('welOk').onclick=()=>{if(!$('welTycChk').checked)return;store.set('pp_tyc',TYC_VER);PROF={dev:sel.dev,lic:sel.lic,d:Date.now()};store.set('pp_prof',PROF);const L=LICS.find(l=>l.id===sel.lic);if(L&&!L.t.includes(CAR.type)){CAR.type=L.t[0];store.set('pp_car',CAR)}applyProf();fit();back()};paint()}
$('profL').onclick=openWelcome;
// Pantalla completa (computadora y celular); el botón cambia a SALIR bien visible
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function fsToggle(){const d=document.documentElement;try{if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{const r=d.requestFullscreen||d.webkitRequestFullscreen;if(r){const p=r.call(d,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>toast('PANTALLA COMPLETA','Su navegador no lo permite aquí. En iPhone: Compartir › Agregar a inicio','info'));try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}else toast('PANTALLA COMPLETA','En iPhone: Compartir › Agregar a pantalla de inicio','info')}}catch(e){}}
function fsPaint(){const on=!!fsEl();$('fsBtn').classList.toggle('on',on);const sm=S||innerHeight<520;$('fsBtn').textContent=sm?(on?'✕ SALIR':'⛶'):(on?'✕ SALIR DE PANTALLA COMPLETA':'⛶ PANTALLA COMPLETA');setTimeout(fit,120)}
$('fsBtn').onclick=fsToggle;if(navigator.standalone||matchMedia('(display-mode: standalone)').matches)$('fsBtn').style.display='none';document.addEventListener('fullscreenchange',fsPaint);document.addEventListener('webkitfullscreenchange',fsPaint);
$('mini').style.pointerEvents='auto';$('mini').style.cursor='pointer';$('mini').title='Ver mapa [M]';$('mini').addEventListener('click',()=>{if(S&&!S.over)onKey('m')});
$('game').addEventListener('click',e=>{if(S&&S.mapOpen&&!mapClick(e))S.mapOpen=false});if(TOUCH)document.body.classList.add('touch');
for(const b of document.querySelectorAll('#touch [data-k]')){const k=b.dataset.k;
  const down=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}audioInit();if(!keys[k])pressed[k]=true;keys[k]=true;b.classList.add('on');onKey(k)};
  const up=e=>{keys[k]=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('contextmenu',e=>e.preventDefault())}
addEventListener('resize',()=>{fit();fsPaint()});if(window.visualViewport){visualViewport.addEventListener('resize',fit);visualViewport.addEventListener('scroll',fit)}addEventListener('orientationchange',()=>setTimeout(fit,300));applyProf();fit();fsPaint();refreshMenu();if(!PROF)openWelcome();else if(!tycOk())openTyc();
cfgApply();requestAnimationFrame(frame);
if(location.hash==='#custom'&&loadCustom())setTimeout(()=>{try{history.replaceState(null,'',location.pathname)}catch(e){}const w=$('welScr');if(w)w.classList.add('hidden');start('custom')},400);
