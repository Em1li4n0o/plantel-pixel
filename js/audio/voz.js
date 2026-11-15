'use strict';
// ===================== VOZ: INSTRUCTOR Y RADIO =====================
let VOZ=store.get('pp_voz',true),VOICE=null;
// Voz: se elige la mejor voz en español disponible (primero Costa Rica / Latinoamérica, y de preferencia las "naturales" o en línea, que suenan menos robóticas)
function pickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang));const sc=v=>(/es[-_]CR/i.test(v.lang)?40:/es[-_](MX|US|419|CO|AR|PA|GT|HN|NI|SV)/i.test(v.lang)?30:/es[-_]ES/i.test(v.lang)?10:15)+(/natural|neural|online|premium|enhanced/i.test(v.name)?25:0)+(/google/i.test(v.name)?12:0)+(v.localService===false?5:0);
  vs.sort((a,b)=>sc(b)-sc(a));VOICE=vs[0]||null}catch(e){}}
function dlgDur(d,min){const l=d&&d.lines[Math.min(d.i,d.lines.length-1)];return Math.max(min,l?String(l[1]).replace(/\([^)]*\)/g,'').length*.07:0)}
try{speechSynthesis.onvoiceschanged=pickVoice;pickVoice()}catch(e){}
let SAYLAST='',SAYT=0;
function say(txt,cut){if(!VOZ||muted||!window.speechSynthesis||(typeof CFG!=='undefined'&&!CFG.voice))return;try{
  // limpiar lo que no se debe leer: teclas [W], acotaciones (se sube al carro), símbolos y abreviaturas
  let t=String(txt).replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'').replace(/km\/h/gi,' kilómetros por hora').replace(/(\d)\s*m\b/g,'$1 metros').replace(/\bkm\b/gi,'kilómetros').replace(/\bcat\.\s*/gi,'categoría ')
    .replace(/[✔✖✗⚠→←↑↓•★¡!]/g,' ').replace(/·/g,', ').replace(/\//g,' o ').replace(/…/g,'.').replace(/\.{2,}/g,'.').replace(/\s+/g,' ').replace(/\s+([,.;:])/g,'$1').trim().toLowerCase().replace(/categor\S* (i{1,3})\b/g,(m,r)=>'categoría '+['uno','dos','tres'][r.length-1]).replace(/\s+(con|use|pulse|presione|toque|o)\s*(?=[.,;]|$)/g,'').replace(/\s+([,.;:])/g,'$1');
  if(!t)return;const now=performance.now();if(t===SAYLAST&&now-SAYT<4000)return;SAYLAST=t;SAYT=now;
  if(cut||speechSynthesis.pending)speechSynthesis.cancel();
  // frases cortas: Chrome corta las frases largas y suenan más naturales por partes
  for(const part of t.split(/(?<=[.;?])\s+/)){if(!part.trim())continue;const u=new SpeechSynthesisUtterance(part);u.lang=VOICE?VOICE.lang:'es-CR';if(VOICE)u.voice=VOICE;const pz=typeof instrVoice==='function'?instrVoice():{rate:.98,pitch:1};u.rate=pz.rate;u.pitch=pz.pitch;speechSynthesis.speak(u)}}catch(e){}}
function shush(){try{speechSynthesis.cancel()}catch(e){}}
