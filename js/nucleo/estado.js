'use strict';
// ===================== ESTADO =====================
let S=null,A=null,ui='menu',MODE_NOW=null;
function spawnState(W){const ty=isArc(CAR.type)&&!ARCOK?'sedan':(MODE_NOW==='alajuela'&&!isArc(CAR.type)?'taxi':CAR.type),v=VEH[ty];return{x:W.spawn.x,y:W.spawn.y,h:W.spawn.h,v:0,steer:0,thr:0,bp:0,gear:1,belt:false,blinkL:false,blinkR:false,haz:false,lastL:-99,lastR:-99,bh0:0,armed:false,brake:false,col:carCol(),type:ty,sp:v,nitro:1,L:v.L,Wd:v.Wd,player:true}}
const ROUTES={centro:1,r27:1,r32:1,tilaran:1,sjlibre:1,alajuela:1,manuel:1,cerro:1};
const MODES={custom:'MI PLANTEL',manuel:'MANUEL ANTONIO · COSTA PACÍFICA',cerro:'CERRO DE LA MUERTE · RUTA 2',alajuela:'ALAJUELA · AEROPUERTO Y LA GUÁCIMA',tilaran:'TILARÁN · PARQUE EÓLICO',r32:'RUTA 32 · BRAULIO CARRILLO',sjlibre:'SAN JOSÉ · MANEJO LIBRE',centro:'CENTRO DE SAN JOSÉ',r27:'RUTA 27',tuto:'TUTORIAL',sanjose:'PLANTEL SAN JOSÉ',plantel:'PLANTEL PIXEL',street:'PRUEBA EN CALLE',city:'MANEJO LIBRE'};for(const k in OFICIALES){MODES['of_'+k]='RECORRIDO OFICIAL · '+OFICIALES[k].n;MNAME['of_'+k]='RECORRIDO '+OFICIALES[k].n}
for(const k in SEDES){MODES['pl_'+k]='PLANTEL DE '+SEDES[k].n+' (PRELIMINAR)';MNAME['pl_'+k]='PLANTEL '+SEDES[k].n}
// Arranque: primero se muestra CARGANDO (para que no parezca congelado) y luego se arma el mapa
const LDTIPS=['Consejo: póngase el cinturón ANTES de arrancar. Sin cinturón no puede manejar.','Consejo: en el ALTO deténgase por completo, aunque no venga nadie.','Consejo: en la rotonda, direccional IZQUIERDA adentro y DERECHA para salir.','Consejo: en la reversa, mire por los espejos y vaya despacio. Un cono tocado cuesta puntos.','Consejo: con amarillo se detiene si lo puede hacer con seguridad.','Consejo: el paso peatonal es del peatón. Ceda siempre.','Dato: en el examen práctico se necesita 80 o más para aprobar.','Consejo: use la direccional unos 30 metros antes de doblar.','Dato: la prueba tiene revisión del vehículo, el plantel y el recorrido en calle.','Consejo: en el estacionamiento tiene 5 intentos. Con calma.'];
function start(mode){const pk=pkgFor(mode);if(pk&&!PKG_OK[pk]){const L=$('loadMsg');if(L)L.classList.remove('hidden');need(pk).then(()=>{if(L)L.classList.add('hidden');start(mode)},e=>{if(L)L.classList.add('hidden');toast('SIN CONEXIÓN','No se pudo cargar esta parte del juego. Revise el internet e intente de nuevo.','bad')});return}
  if(window.__syncStart)return startNow(mode);const L=$('loadMsg');if(L){const tp=$('ldTip');if(tp)tp.textContent=pick(LDTIPS);L.classList.remove('hidden')}
  requestAnimationFrame(()=>setTimeout(()=>{try{startNow(mode)}finally{if(L)L.classList.add('hidden')}},60))}
function startNow(mode){
  logDrive();ARCOK=mode==='city'||mode==='sjlibre'||mode==='alajuela';MODE_NOW=mode;
  const W=(mode==='plantel'||mode==='tuto')?buildPlantel():mode.startsWith('of_')?buildOficial(OFICIALES[mode.slice(3)]):mode.startsWith('pl_')?buildSede(mode.slice(3)):mode==='sanjose'?buildCustom(SJ_OFICIAL):mode==='custom'?buildCustom(loadCustom()):(mode==='centro'||mode==='sjlibre')?buildCentro():mode==='r27'?buildR27():mode==='alajuela'?buildAlajuela():mode==='r32'?buildR32():ROUTEDEF[mode]?buildRoute(ROUTEDEF[mode]):buildCity();if(mode==='city')addEvents(W,SCENALL);if(mode==='sjlibre')addEvents(W,['llanta','varado','nino','hidro','ambulancia','bus','moto','accidente','frenos','encandilado','neblina']);if(mode==='alajuela')addEvents(W,['llanta','varado','hidro','nino','animal','motor','acelerador','bus','encandilado','derrape']);W.bg=renderBG(W);W.skid=document.createElement('canvas');W.skid.width=W.w;W.skid.height=W.h;
  S={mode,exam:mode!=='city'&&mode!=='sjlibre'&&mode!=='alajuela',W,P:spawnState(W),t:0,dt:0,faults:[],score:100,cd:{},task:0,hold:{},over:false,paused:false,failed:false,rnd:{in:false},lastExit:null,infr:0,deliv:0,pts:0,streak:0,best:0,destT:0,destPar:30,angered:0,speedT:0,offT:0,wrongT:0,respawn:0,cx:0,cy:0,blinkPh:0,horned:-1,bellT:0};
  S.cx=S.P.x-VW/2;S.cy=S.P.y-VH/2;S.fp=store.get('pp_fp',false);S.chase=S.fp&&store.get('pp_chase',false);S.camH=S.P.h;S.zoom=store.get('pp_zoom',1.5);S.mapOpen=false;
  S.tasks=mode==='tuto'?tutoTasks():(mode==='plantel'||mode.startsWith('pl_'))?plantelTasks():mode.startsWith('of_')?oficialTasks():mode==='sanjose'?customTasks():mode==='custom'?customTasks():mode==='centro'?centroTasks():mode==='r27'?r27Tasks():mode==='r32'?r32Tasks():ROUTEDEF[mode]?routeTasks():mode==='street'?streetTasks():[];if(!S.exam)newDest();
  const mw=W.w>1200?170:130,mh=Math.round(mw*W.h/W.w);mini.width=mw;mini.height=mh;
  // En teléfono el minimapa va arriba a la derecha y pequeño, para no tapar GAS y FRENO (un plantel alto lo hacía enorme)
  if(document.body.classList.contains('touch')){const k=Math.min(80/mw,47/mh);mini.style.width=`calc(var(--u)*${(mw*k).toFixed(1)})`;mini.style.height=`calc(var(--u)*${(mh*k).toFixed(1)})`;mini.style.top='calc(var(--u)*31)';mini.style.bottom='auto'}
  else{const k=Math.min(90/mw,80/mh);mini.style.width=`calc(var(--u)*${(mw*k).toFixed(1)})`;mini.style.top='';mini.style.bottom='';mini.style.height=`calc(var(--u)*${(mh*k).toFixed(1)})`}
  show(null);$('hud').classList.remove('hidden');ui=null;
  $('banner').textContent='';$('toasts').innerHTML='';fsPaint();wxInit();S.trace=[];S.radio=!S.exam&&store.get('pp_radio2',true);shush();
  S.arcade=isArc(S.P.type);if(isArc(CAR.type)&&!ARCOK)toast('VEHÍCULO DE LICENCIA','Los vehículos arcade son solo para manejo libre; aquí usa un sedán','info');
  if(S.arcade)setTimeout(()=>toast('MODO ARCADE','Sin multas · los choques rebotan · TURBO con '+(TOUCH?'el botón TURBO':'SHIFT'),'good'),900);
  toast(MODES[mode],mode==='tuto'?'Siga las instrucciones de arriba, paso a paso.':S.exam?'Siga las instrucciones de arriba. Mínimo 80 puntos.':'Llegue a destinos: rápido pero legal. ¡No enoje a los demás!','info');
}
function show(id){for(const s of['welScr','rtScr','plScr','menu','rules','end','pause','garage','licScr','theory','prgScr','cfgScr','repScr','tycScr'])$(s).classList.add('hidden');if(id)$(id).classList.remove('hidden')}
function toMenu(){shush();logDrive();S=null;$('hud').classList.add('hidden');show('menu');ui='menu';refreshMenu();if(engG)engG.gain.value=0;fsPaint()}
function newDest(){const W=S.W,P=S.P;if(W.taxi){taxiNew();return}let i;do{i=Math.random()*W.dests.length|0}while(S.dest&&W.dests[i]===S.dest&&W.dests.length>1);S.dest=W.dests[i];
  S.destT=S.t;S.destPar=Math.round(12+(Math.abs(S.dest.x-P.x)+Math.abs(S.dest.y-P.y))/30)}

function toast(title,txt,kind='info'){const d=document.createElement('div');d.className='toast '+kind;d.innerHTML=`<b>${title}</b>${txt||''}`;const T=$('toasts');T.prepend(d);while(T.children.length>3)T.lastChild.remove();setTimeout(()=>d.remove(),3800)}
const QUIET=new Set(['belt','off','speed','inc','exit','rnoret','cut']);
function fault(code,text,cat,cdSec=5){if(!S||S.over||S.arcade)return;if(S.mode==='tuto'){if(!S.cd[code]||S.t>S.cd[code]){S.cd[code]=S.t+4;toast('OJO',text,'info')}return}if(S.cd[code]&&S.t<S.cd[code])return;S.cd[code]=S.t+cdSec;const pts=CAT[cat];
  S.faults.push({t:S.t,text,cat,pts,ph:curPh(),x:Math.round(S.P.x),y:Math.round(S.P.y)});
  if(S.exam){S.score-=pts;say('Falta. '+text);if(S.score<80&&!S.failed){S.failed=true;$('banner').textContent='REPROBADO · siga practicando o pulse R'}toast(`FALTA CAT. ${cat} · -${pts}`,text,'bad')}
  else{S.infr++;(S.wl=S.wl||[]).push(S.t);const lost=S.streak>0;S.streak=0;S.pts=Math.max(0,S.pts-50);toast(`INFRACCIÓN · CAT. ${cat}`,text+` · -50 pts${lost?' · ¡RACHA PERDIDA!':''}`,'bad')}
  if(!QUIET.has(code.replace(/\d+$/,'')))angerNear(S.W,S.P.x,S.P.y,95);
  sfx.bad()}
function boing(v){beep(160+Math.random()*60,.18,'square',.1,420);beep(90,.25,'sawtooth',.08,-40)}
function fatal(text){if(S.over||S.arcade)return;if(S.mode==='tuto'){toast('¡CUIDADO!',text,'bad');S.P.v=0;return}sfx.crash();angerNear(S.W,S.P.x,S.P.y,120);
  if(S.exam){S.faults.push({t:S.t,text,cat:'I',pts:32,x:Math.round(S.P.x),y:Math.round(S.P.y)});S.score-=32;endExam('crash',text)}
  else{S.infr++;(S.wl=S.wl||[]).push(S.t);S.streak=0;S.pts=Math.max(0,S.pts-100);S.faults.push({t:S.t,text,cat:'I',pts:32,x:Math.round(S.P.x),y:Math.round(S.P.y)});toast('¡ACCIDENTE!',text+' · -100 pts','bad');S.respawn=1.6;S.P.v=0}}
function endExam(reason,txt){S.over=true;if(engG)engG.gain.value=0;
  if(S.mode==='tuto'){$('endTitle').textContent='¡TUTORIAL COMPLETADO!';$('endTitle').style.color='var(--good)';$('endLic').classList.add('hidden');$('endSub').textContent='Ya sabe manejar el simulador. Siga con el EXAMEN TEÓRICO (1) o practique en MANEJO LIBRE (5). Las reglas completas están en REGLAS (9).';$('endList').innerHTML='';show('end');ui='end';sfx.fanfare();return}
  const ok=reason==='done'&&S.score>=80;S.okRes=ok;logDrive();checkDaily();$('bReplay').classList.toggle('hidden',!S.faults.length);say(reason==='crash'?'Accidente. Prueba terminada.':ok?'¡Felicidades, aprobó!':'Reprobado. Siga practicando.',true);$('endTitle').textContent=reason==='crash'?'¡ACCIDENTE!':ok?'¡APROBADO!':'REPROBADO';$('endTitle').style.color=ok?'var(--good)':'var(--bad)';
  let extra='';const prog=store.get('pp_prog',{});
  const pk=(S.mode==='sanjose'||S.mode.startsWith('pl_')||S.mode.startsWith('of_'))?'plantel':S.mode;if(ok){const prev=prog[pk];if(!prev||prev.score<S.score)prog[pk]={score:S.score,date:new Date().toLocaleDateString('es-CR'),car:CAR.type};store.set('pp_prog',prog)}
  const lic=prog.plantel&&prog.street&&prog.teorico;
  if(ok&&lic&&!ROUTES[S.mode]){extra=' · ¡GANÓ SU LICENCIA!';$('endLic').classList.remove('hidden');$('licName').value=store.get('pp_name','');drawLicense($('licEnd'));setTimeout(sfx.fanfare,500)}
  else{$('endLic').classList.add('hidden');if(ok&&!ROUTES[S.mode])extra=' · Para la licencia le falta: '+[['teorico','TEÓRICO'],['plantel','PLANTEL'],['street','CALLE']].filter(([k])=>!prog[k]).map(a=>a[1]).join(', ')}
  $('endSub').textContent=(reason==='crash'?txt+' · ':'')+`Nota: ${Math.max(0,S.score)}/100 · Tiempo ${fmtT(S.t)} · Conductores enojados: ${S.angered}`+extra;
  const byPh={};for(const f of S.faults)if(f.ph)byPh[f.ph]=(byPh[f.ph]||0)+f.pts;const prac=Object.entries(byPh).sort((a,b)=>b[1]-a[1]);
  const done=(S.tasks||[]).slice(0,reason==='done'?S.tasks.length:S.task).map(k=>k.ph).filter((v,i,a)=>v&&a.indexOf(v)===i&&!byPh[v]);
  $('endList').innerHTML=(prac.length?`<div style="color:#ffd23f">PRACTIQUE: ${prac.map(([k,v])=>`${k} (-${v})`).join(' · ')}</div>`:'')+(done.length?`<div style="color:var(--good)">BIEN: ${done.join(' · ')}</div>`:'')+
    (S.faults.length?S.faults.map(f=>`<div class="c${{I:1,II:2,III:3,IV:4}[f.cat]}">[${fmtT(f.t)}]${f.ph?' '+f.ph.toUpperCase()+' ·':''} CAT ${f.cat} -${f.pts}: ${f.text}</div>`).join(''):'<div style="color:var(--good)">Sin faltas. ¡Manejo perfecto!</div>');
  if(ok&&!lic)sfx.good();setTimeout(()=>{show('end');ui='end'},reason==='crash'?900:300)}
const fmtT=t=>`${String(t/60|0).padStart(2,'0')}:${String(t%60|0).padStart(2,'0')}`;

// ===================== LICENCIA =====================
function drawLicense(cv){const c=cv.getContext('2d');c.imageSmoothingEnabled=false;const prog=store.get('pp_prog',{});const name=clean(store.get('pp_name',''))||'CONDUCTOR PIXEL';const f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  f('#0b2236',0,0,192,112);f('#eef3e6',2,2,188,108);for(let i=-112;i<192;i+=6){c.fillStyle='#e2ead6';for(let k=0;k<108;k++)c.fillRect(i+k,2+k,1,1)}
  f('#1b4965',2,2,188,20);f('#ffd23f',2,22,188,2);ptext(c,'LICENCIA PIXEL',8,6,'#fff',0,2);ptext(c,'CLASE B1',150,6,'#ffd23f');ptext(c,'DE JUEGO',150,13,'#9cf');
  f('#000',8,30,44,54);f('#9fd3ff',9,31,42,52);const col=carCol();
  c.save();c.translate(9,31);drawPortrait(c,42,52,AV,0,'feliz','#9fd3ff');c.restore();
  ptext(c,'NOMBRE',60,30,'#5c677d');ptext(c,name.slice(0,16),60,37,'#111',0,2);
  ptext(c,'TEORICO',60,52,'#5c677d');ptext(c,String(prog.teorico?prog.teorico.score:'--'),60,59,'#1b4965',0,2);
  ptext(c,'PLANTEL',94,52,'#5c677d');ptext(c,String(prog.plantel?prog.plantel.score:'--'),94,59,'#1b4965',0,2);
  ptext(c,'CALLE',128,52,'#5c677d');ptext(c,String(prog.street?prog.street.score:'--'),128,59,'#1b4965',0,2);
  ptext(c,'CARRO',100,74,'#5c677d');ptext(c,clean(VEH[CAR.type].n),100,81,'#111');
  ptext(c,'EMITIDA',60,74,'#5c677d');ptext(c,(prog.street&&prog.street.date)||'--',60,81,'#111');
  const cx=164,cy=88;fillCirc(c,cx,cy,13,'#b8860b');fillCirc(c,cx,cy,11,'#ffd23f');ptext(c,'OK',cx-3,cy-2,'#7a4a00');ringPx(c,cx,cy,9,'#b8860b',2);
  c.save();c.translate(98,98);c.rotate(-.12);f('#c1121f',-30,-6,62,13);f('#eef3e6',-29,-5,60,11);ptext(c,'APROBADO',-15,-2,'#c1121f');c.restore();
  ptext(c,'PLANTEL PIXEL',8,98,'#5c677d');
  drawCar(c,30,92,0,col,{},0,0,CAR.type)}
['licName','licName2'].forEach(id=>$(id).addEventListener('input',e=>{store.set('pp_name',e.target.value);drawLicense($('licEnd'));drawLicense($('licMenu'))}));
function showLicense(){const prog=store.get('pp_prog',{});show('licScr');ui='lic';$('licName2').value=store.get('pp_name','');
  const has=prog.plantel&&prog.street&&prog.teorico;$('licMenu').classList.toggle('hidden',!has);$('licName2').classList.toggle('hidden',!has);
  $('licMsg').textContent=has?'¡Felicidades! Escriba su nombre para su licencia.':`Para ganarla apruebe: TEÓRICO ${prog.teorico?'✔':'✘'} · PLANTEL ${prog.plantel?'✔':'✘'} · CALLE ${prog.street?'✔':'✘'}`;if(has)drawLicense($('licMenu'))}
function refreshMenu(){try{$('daily').textContent=dailyTxt()}catch(e){}const p=store.get('pp_prog',{});$('prog').textContent=`LICENCIA: TEÓRICO ${p.teorico?'✔':'✘'} · PLANTEL ${p.plantel?'✔':'✘'} · CALLE ${p.street?'✔':'✘'} · CARRO: ${VEH[CAR.type].n}`}
