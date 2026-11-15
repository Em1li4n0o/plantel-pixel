'use strict';
// ===================== AUDIO =====================
let AC=null,master,eng,engG,muted=false;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5*(typeof CFG!=='undefined'?CFG.sfx:1);master.connect(AC.destination);
  eng=AC.createOscillator();eng.type='sawtooth';engG=AC.createGain();engG.gain.value=0;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;eng.connect(f);f.connect(engG);engG.connect(master);eng.start()}catch(e){AC=null}}
function beep(freq,dur,type='square',vol=.12,slide=0,delay=0){if(!AC||muted)return;const t0=AC.currentTime+delay;const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(freq,t0);if(slide)o.frequency.linearRampToValueAtTime(Math.max(20,freq+slide),t0+dur);gn.gain.setValueAtTime(vol,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+dur);o.connect(gn);gn.connect(master);o.start(t0);o.stop(t0+dur+.02)}
const sfx={tick:()=>beep(1800,.02,'square',.05),tock:()=>beep(1150,.02,'square',.05),bad:()=>{beep(180,.18,'sawtooth',.15,-40);beep(120,.25,'sawtooth',.15,-40,.18)},
  good:()=>{beep(660,.08);beep(880,.08,'square',.12,0,.09);beep(1320,.14,'square',.12,0,.18)},bell:()=>beep(980,.12,'triangle',.07),
  horn:()=>{beep(311,.9,'square',.06);beep(370,.9,'square',.05)},crash:()=>{beep(110,.5,'sawtooth',.25,-80);beep(70,.6,'square',.2,-40,.05)},gear:()=>beep(400,.05,'square',.06),
  honk:()=>{const f=380+Math.random()*120;beep(f,.12,'square',.07);beep(f*1.26,.12,'square',.05);beep(f,.28,'square',.07,0,.16);beep(f*1.26,.28,'square',.05,0,.16)},
  fanfare:()=>{[523,659,784,1047,784,1047].forEach((f,i)=>beep(f,.16,'square',.1,0,i*.14))}};

// ===================== ENOJO DE LOS CONDUCTORES =====================
const SAY=['PIII!','RAR!!','#@%!','OE!!','FIJESE!','JUEPUCHA!','ASH!!','$#@!','DIAY!?'];
function anger(c,crash){if(c.angryT>.5&&!crash)return;const was=c.angryT>0;c.angryT=crash?2.6:1.9;c.say=crash?pick(['#@%!!','JUEPUCHA!','RAR!!!','$#@%!']):pick(SAY);
  if(S&&S.P){if(!was)S.angered++;if(Math.hypot(S.P.x-c.x,S.P.y-c.y)<230)sfx.honk()}}
function angerNear(W,x,y,r){for(const c of W.ai.concat(W.ringCars))if(Math.hypot(c.x-x,c.y-y)<r&&Math.random()<.8)anger(c)}
