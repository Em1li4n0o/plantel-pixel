'use strict';
// ===================== PRÁCTICA TRANQUILA =====================
// Los mismos planteles y rutas que el examen, pero sin presión: las faltas no restan ni reprueban (el instructor las
// explica con calma), un accidente no termina la prueba y con R (o tocando el aviso de arriba) el carro vuelve al
// inicio del paso para repetirlo. Suena la emisora lo-fi y guía el PROFE ZEN. No cuenta como examen ni da licencia.
let CALM=store.get('pp_calm',false);
function calmToggle(){CALM=!CALM;store.set('pp_calm',CALM);calmPaint();toast(CALM?'PRÁCTICA TRANQUILA':'MODO EXAMEN',CALM?'Sin nota ni reprobar. Repita cada paso las veces que quiera.':'Con nota, como la prueba real.','info')}
function calmPaint(){for(const id of['plCalm','rtCalm']){const b=$(id);if(!b)continue;b.classList.toggle('calmOn',CALM);
  b.innerHTML=CALM?'☾ PRÁCTICA TRANQUILA<small>sin nota ni reprobar · R repite el paso · toque para cambiar</small>':'MODO EXAMEN<small>con nota, como la prueba real · toque para práctica tranquila</small>'}}
// al empezar un modo con examen (no el tutorial)
function calmInit(){S.calm=CALM&&S.exam&&S.mode!=='tuto';const b=$('banner');b.classList.toggle('calmBan',S.calm);if(!S.calm)return;S.snap=null;b.textContent='☾ PRÁCTICA TRANQUILA · R o toque aquí para repetir el paso'}
// foto del carro al empezar cada paso: ahí se vuelve al repetir
function calmSnap(){if(!S||!S.calm)return;const P=S.P;S.snap={x:P.x,y:P.y,h:P.h,gear:P.gear,task:S.task}}
function calmRewind(){if(!S||!S.calm||S.over||!S.snap)return;const P=S.P,q=S.snap;
  Object.assign(P,{x:q.x,y:q.y,h:q.h,v:0,thr:0,slip:0,drift:false,spin:0,gear:q.gear});S.task=q.task;const tk=S.tasks[S.task];if(tk)tk.started=false;S.hold={};S.cd={};
  toast('REPETIMOS EL PASO','Con calma. Inténtelo de nuevo.','info')}
// falta en práctica tranquila: se anota (para el resumen) pero no resta ni reprueba
function calmFault(text,cat){toast('OJO · CAT. '+cat,text,'info');say('Ojo. '+text+'. Si quiere, repetimos el paso.')}
function calmCrash(text){toast('¡CUIDADO!',text+' · volvemos al inicio del paso','bad');S.P.v=0;say('Tranquilo. '+text+'. Volvemos al inicio del paso.',true);setTimeout(calmRewind,1400)}
function calmEnd(reason){$('endTitle').textContent='PRÁCTICA TERMINADA';$('endTitle').style.color='var(--good)';$('endLic').classList.add('hidden');$('bReplay').classList.toggle('hidden',!S.faults.length);
  const n=S.faults.length,by={};for(const f of S.faults)by[f.text]=(by[f.text]||0)+1;
  $('endSub').textContent=n?`Terminó la práctica con ${n} ${n===1?'cosa':'cosas'} para mejorar. Cuando se sienta listo, pruebe el MODO EXAMEN para sacar nota.`:'¡Sin faltas! Ya puede probar el MODO EXAMEN para sacar nota.';
  $('endList').innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([t,k])=>`<div>• ${t}${k>1?' (×'+k+')':''}</div>`).join('');
  say(n?'Práctica terminada. Revise lo que puede mejorar.':'¡Práctica perfecta! Ya puede intentar el examen.',true);show('end');ui='end';sfx.good()}
$('banner').addEventListener('click',()=>{if(S&&S.calm)calmRewind()});
for(const id of['plCalm','rtCalm'])if($(id))$(id).onclick=calmToggle;
calmPaint();
