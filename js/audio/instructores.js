'use strict';
// ===================== INSTRUCTORES CON PERSONALIDAD =====================
// Cada emisora trae su instructor: cambia cómo habla (velocidad y tono de la voz) y cómo reacciona a lo que usted hace
// en manejo libre (trompos, derrapes, velocidad, choques, casi-choques, aplastar con el monster truck).
// Con la radio apagada habla el PROFE PIXEL. En los exámenes las instrucciones no cambian, solo el tono de la voz.
//
// VOCES GRABADAS: cada frase tiene un id. Si existe el archivo audio/voces/<instructor>/<id>.mp3 y está en
// VOCES_GRABADAS, se reproduce esa grabación (voz real: actor de voz, ElevenLabs, Piper...). Si no, se lee con la
// voz del navegador. El guion completo para grabar está en audio/voces/GUION.md.
const VOCES_GRABADAS=new Set([/* 'rock/trompo1', 'general/choque1', ... */]);
const INSTR={
  general:{n:'PROFE PIXEL',d:'Amable y claro',rate:.98,pitch:1,L:{
    trompo:[['trompo1','¡Uy, qué trompo! Bien controlado, pero en la calle real ni se le ocurra.'],['trompo2','¡Una vuelta completa! Eso sí que no lo enseño en clase.']],
    derrape:[['derrape1','Qué derrape tan largo. Ojo con las llantas.'],['derrape2','Bonito derrape. Ahora, suave otra vez.']],
    velocidad:[['velocidad1','Más de ciento ochenta kilómetros por hora. Aquí se vale, en la calle no.']],
    choque:[['choque1','¿Todo bien? Respire y siga.'],['choque2','Uy, ese golpe sonó feo. Con calma.']],
    aplastar:[['aplastar1','¡Lo aplastó! Menos mal que es un juego.']],
    casi:[['casi1','¡Uf, por poquito! Deje más espacio.'],['casi2','Muy cerca de ese carro. Mantenga distancia.']],
    hola:[['hola1','Ahora le acompaño yo, el Profe Pixel. Maneje a su ritmo.']]}},
  tropical:{n:'PROFE TROPICAL',d:'Alegre y bien tico',rate:1.06,pitch:1.12,L:{
    trompo:[['trompo1','¡Qué chiva, mae! ¡Qué tremenda vuelta!'],['trompo2','¡Diay, qué trompo más tuanis!']],
    derrape:[['derrape1','¡Pura vida ese derrape!'],['derrape2','¡Upe, cómo baila ese carro!']],
    velocidad:[['velocidad1','¡Qué rajado! Va volando, mae.']],
    choque:[['choque1','¡Uy, mae! ¿Todo bien? Tranqui, siga.'],['choque2','¡Qué golpazo! Pero aquí seguimos, pura vida.']],
    aplastar:[['aplastar1','¡Qué torta! Lo dejó como tortilla.']],
    casi:[['casi1','¡Por un pelito, mae!'],['casi2','¡Uy, casi se lo lleva puesto!']],
    hola:[['hola1','¡Pura vida! Soy el Profe Tropical. Vamos a pasear con buena música.']]}},
  lofi:{n:'PROFE ZEN',d:'Tranquilo y calmado',rate:.86,pitch:.9,L:{
    trompo:[['trompo1','Una vuelta completa. Respire. Volvamos a la calma.'],['trompo2','El mundo giró un poquito. Despacio, volvamos al carril.']],
    derrape:[['derrape1','Sienta cómo resbala el carro. Ahora, suave.'],['derrape2','Las llantas también necesitan descanso.']],
    velocidad:[['velocidad1','Vamos muy rápido. Bajemos el ritmo, sin prisa.']],
    choque:[['choque1','Tranquilo. Un golpe no define el viaje. Siga.'],['choque2','Respire hondo. Todo bien. Seguimos con calma.']],
    aplastar:[['aplastar1','Eso fue intenso. Respiremos.']],
    casi:[['casi1','Muy cerca. Más espacio, más calma.'],['casi2','Deje que los demás pasen. No hay prisa.']],
    hola:[['hola1','Hola. Soy el Profe Zen. Maneje tranquilo, sin prisa.']]}},
  rock:{n:'ROCKO',d:'Emocionado y a todo volumen',rate:1.12,pitch:1.04,L:{
    trompo:[['trompo1','¡WOW! ¡Qué tremenda vuelta, amigo!'],['trompo2','¡Ey, ey, EY! ¡Eso fue un trompo de leyenda!']],
    derrape:[['derrape1','¡Eso es! ¡Qué derrape más brutal!'],['derrape2','¡Siga, siga! ¡Qué humo!']],
    velocidad:[['velocidad1','¡Más de ciento ochenta! ¡Esto es rock and roll!']],
    choque:[['choque1','¡Uff, qué golpe! ¡Pero seguimos!'],['choque2','¡Auch! ¡Eso dolió hasta en la guitarra!']],
    aplastar:[['aplastar1','¡APLASTADO! ¡Qué bestia!']],
    casi:[['casi1','¡Uyyy, por un pelo! ¡Qué nervios!'],['casi2','¡Wow, lo pasó rozando!']],
    hola:[['hola1','¡Súbale al volumen! Soy Rocko. ¡A manejar!']]}},
};
const ST_INSTR=['general','tropical','lofi','rock'];// en el orden de STATIONS
function instrNow(){if(S&&S.calm)return'lofi';return S&&S.radio?ST_INSTR[CFG.station]||'general':'general'}
function instrVoice(){const p=INSTR[instrNow()];return{rate:p.rate,pitch:p.pitch}}
let CLIP=null;
// dice una frase del instructor: grabación si existe, si no voz del navegador; también aparece escrita
function instrLine(pk,ev){const p=INSTR[pk],L=p&&p.L[ev];if(!L||!L.length)return;
  const T=S.stn||(S.stn={});let k=Math.floor(Math.random()*L.length);if(L.length>1&&T.last===pk+ev+k)k=(k+1)%L.length;T.last=pk+ev+k;const[id,txt]=L[k];
  toast(p.n,txt,'info');
  if(muted||!CFG.voice)return;const key=pk+'/'+id;
  if(VOCES_GRABADAS.has(key)){try{shush();if(CLIP)CLIP.pause();CLIP=new Audio('audio/voces/'+key+'.mp3');CLIP.volume=Math.min(1,.4+CFG.sfx*.6);CLIP.onerror=()=>say(txt,true);CLIP.play().catch(()=>say(txt,true));return}catch(e){}}
  say(txt,true)}
// reacciones en manejo libre: se detectan aquí, una cada 6 segundos como mucho
function react(ev,force){const T=S.stn;if(!force&&T.cool>0)return;T.cool=6;instrLine(instrNow(),ev)}
function stuntStep(P,dt){if(S.foot||S.calm)return;
  const T=S.stn||(S.stn={});if(T.ph==null){Object.assign(T,{yaw:0,dr:0,off:0,cool:3,cr:S.crashes||0,cu:S.crushes||0,fast:false,lastCr:-9,ph:P.h})}
  T.cool-=dt;const kmh=Math.abs(P.v)*KMH,dh=nA(P.h-T.ph);T.ph=P.h;
  if((S.crushes||0)>T.cu){T.cu=S.crushes;T.lastCr=S.t;react('aplastar',true);return}
  if((S.crashes||0)>T.cr){T.cr=S.crashes;T.lastCr=S.t;react('choque');return}
  // trompo: una vuelta completa resbalando; derrape: más de 2,5 s de lado a buena velocidad
  if((P.drift||(P.slip||0)>.3)&&kmh>6){T.yaw+=dh;T.off=0;T.dr+=dt}else{T.off+=dt;if(T.off>.7){T.yaw=0;T.dr=0}}
  if(Math.abs(T.yaw)>=Math.PI*2-.25&&S.t-T.lastCr>1.5){T.yaw=0;T.dr=-3;react('trompo',true);return}
  if(T.dr>2.5&&kmh>35){T.dr=-5;react('derrape');return}
  if(kmh>180&&!T.fast){T.fast=true;react('velocidad');return}if(kmh<130)T.fast=false;
  // casi-choque: pasar muy cerca de otro carro a más de 60 km/h sin tocarlo
  if(kmh>60&&S.W.ai)for(const o of S.W.ai){if(o.crushed)continue;const d=Math.hypot(o.x-P.x,o.y-P.y);
    if(d<7.5)o._nm=S.t;else if(o._nm&&d>11){const ok=S.t-o._nm<.6&&S.t-T.lastCr>1.5;o._nm=0;if(ok){react('casi');return}}}}
// al cambiar de emisora se presenta el instructor nuevo
function instrHello(){if(!S||S.exam)return;const pk=instrNow();if(S.stn)S.stn.cool=4;instrLine(pk,'hola')}
