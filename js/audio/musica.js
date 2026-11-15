'use strict';
// ===================== MÚSICA =====================
// Se genera con el sintetizador del navegador (sin archivos: no pesa nada). Cuatro emisoras de radio y música según la situación:
// suspenso cuando pasa algo peligroso (llanta estallada, etc.), persecución con sirena cuando la policía lo busca. En el examen no hay música.
const CFG=Object.assign({music:.7,sfx:.8,voice:true,bright:1,station:0},store.get('pp_cfg',{}));
function cfgSave(){store.set('pp_cfg',CFG);cfgApply()}
function cfgApply(){if(master)master.gain.value=.5*CFG.sfx;if(MUS.bus)MUS.bus.gain.value=MUS.fade*CFG.music;const gm=$('game');if(gm)gm.style.filter=CFG.bright===1?'':`brightness(${CFG.bright})`}
const MUS={bus:null,next:0,step:0,track:null,fade:1,noise:null};
const NT=n=>440*Math.pow(2,(n-69)/12);
const STATIONS=[
  {n:'RADIO PIXEL 101.5',d:'Pop',bpm:112,root:60,prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],mel:[12,14,16,19,16,14,12,7],lead:'square',bass:'triangle',drums:'pop'},
  {n:'TROPICAL 94.3',d:'Cumbia y calipso',bpm:96,root:57,prog:[[0,3,7],[0,3,7],[7,10,14],[7,11,14]],mel:[12,15,17,19,17,15,14,12],lead:'triangle',bass:'sine',drums:'cumbia'},
  {n:'LO-FI 88.9',d:'Tranquila para manejar',bpm:74,root:62,prog:[[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]],mel:[16,14,11,12,9,7,9,11],lead:'sine',bass:'sine',drums:'lofi'},
  {n:'ARCADE ROCK 107.7',d:'Rock rápido',bpm:142,root:52,prog:[[0,7,12],[3,10,15],[5,12,17],[3,10,15]],mel:[12,15,17,15,19,17,15,12],lead:'sawtooth',bass:'sawtooth',drums:'rock'}];
const MOODS={tension:{n:'SUSPENSO',bpm:64,root:45},chase:{n:'PERSECUCIÓN',bpm:152,root:50}};
function musInit(){if(!AC||MUS.bus)return;MUS.bus=AC.createGain();MUS.bus.gain.value=CFG.music;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000;MUS.bus.connect(lp);lp.connect(AC.destination);
  const b=AC.createBuffer(1,AC.sampleRate*.3,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;MUS.noise=b}
function mn(f,t,dur,type,vol,att=.01){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(MUS.bus);o.start(t);o.stop(t+dur+.05)}
function mnz(t,dur,vol,hp){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=MUS.noise;f.type=hp?'highpass':'bandpass';f.frequency.value=hp||1800;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect(MUS.bus);s.start(t);s.stop(t+dur+.02)}
function mkick(t,v=.5){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(MUS.bus);o.start(t);o.stop(t+.25)}
function musTrack(){if(!S)return CFG.menuMus===false?null:'st2';if(S.calm&&!S.over)return S.paused?null:'st2';if(S.exam||S.over||S.paused&&!S.radio)return null;if(S.ev&&!S.ev.over)return'tension';if(S.cop)return'chase';return S.radio?'st'+CFG.station:null}
function musStep(tr,i,t,sp){const bar=i>>4,q=i&15;
  if(tr==='tension'){const R=MOODS.tension.root;if(q===0){mn(NT(R),t,sp*16,'sawtooth',.05,.4);mn(NT(R+1),t,sp*16,'sawtooth',.03,.6)}if(q===0||q===3)mkick(t,.35);if(q===8)mn(NT(R+24+(bar%2?6:1)),t,sp*6,'triangle',.05,.05);if(q%4===2)mnz(t,.05,.02,6000);return}
  if(tr==='chase'){const R=MOODS.chase.root,riff=[0,0,12,0,3,0,10,0,0,0,12,0,7,5,3,2];mn(NT(R+riff[q]-12),t,sp*.9,'sawtooth',.07);if(q%4===0)mkick(t,.5);if(q%8===4)mnz(t,.12,.18);mnz(t,.03,.03,7000);
    if(q===0||q===8){const hi=(bar*2+(q?1:0))%2;mn(hi?960:640,t,sp*7.5,'square',.035,.03)}return}
  const S0=STATIONS[+tr.slice(2)]||STATIONS[0],ch=S0.prog[bar%4],R=S0.root;
  // acordes y bajo
  if(S0.drums==='lofi'){if(q===0)for(const n of ch)mn(NT(R+n),t,sp*15,'sine',.035,.08);if(q===0||q===10)mn(NT(R+ch[0]-12),t,sp*5,'sine',.09)}
  else if(S0.drums==='rock'){if(q%2===0)for(const n of ch)mn(NT(R+n),t,sp*1.8,'sawtooth',.018);mn(NT(R+ch[0]-12),t,sp*.9,'sawtooth',.05)}
  else if(S0.drums==='cumbia'){if(q%4===2)for(const n of ch)mn(NT(R+n+12),t,sp*1.4,'triangle',.03);if(q===0||q===6||q===8||q===14)mn(NT(R+ch[(q>>2)%2?2:0]-12),t,sp*2,'sine',.1)}
  else{if(q%4===0)for(const n of ch)mn(NT(R+n),t,sp*3.5,'triangle',.025);if(q%2===0)mn(NT(R+ch[0]-12+(q%8===6?7:0)),t,sp*1.6,'triangle',.07)}
  // melodía (cambia cada vuelta)
  const ml=S0.mel,mi=(q>>1)+(bar%2)*8;if(S0.drums==='lofi'?q%4===0:q%2===0){const n=ml[(mi+bar*3)%ml.length]+(bar%4===3&&q>8?2:0);if((S0.drums!=='rock'||q%4===0)&&((q*7+bar*5)%11)>2)mn(NT(R+n),t,sp*(S0.drums==='lofi'?3.5:1.6),S0.lead,S0.drums==='rock'?.03:.045)}
  // batería
  const d=S0.drums;if(d==='pop'){if(q%4===0)mkick(t,.45);if(q===4||q===12)mnz(t,.12,.16);if(q%2===1)mnz(t,.03,.035,7000)}
  else if(d==='cumbia'){if(q%4===0)mkick(t,.3);if(q%2===1){mnz(t,.04,.06,5000);mnz(t+sp*.5,.03,.04,5000)}if(q===12)mnz(t,.06,.07,2500)}
  else if(d==='lofi'){if(q===0||q===7||q===10)mkick(t,.32);if(q===4||q===12)mnz(t,.1,.06);if(q%2===0)mnz(t+(q%4===2?sp*.15:0),.02,.025,8000)}
  else if(d==='rock'){if(q%4===0||q===10)mkick(t,.55);if(q===4||q===12)mnz(t,.14,.22);mnz(t,.025,.03,7000)}}
function musTick(){if(!AC||AC.state!=='running')return;musInit();const tr=musTrack();
  if(tr!==MUS.track){MUS.track=tr;MUS.step=0;MUS.next=AC.currentTime+.08;MUS.bus.gain.cancelScheduledValues(AC.currentTime);MUS.bus.gain.setValueAtTime(0,AC.currentTime);MUS.bus.gain.linearRampToValueAtTime(CFG.music,AC.currentTime+.6)}
  if(!tr)return;const bpm=tr.startsWith('st')?(STATIONS[+tr.slice(2)]||STATIONS[0]).bpm:MOODS[tr].bpm,sp=60/bpm/4;
  if(MUS.next<AC.currentTime-.2)MUS.next=AC.currentTime+.05;while(MUS.next<AC.currentTime+.3){musStep(tr,MUS.step,MUS.next,sp);MUS.next+=sp;MUS.step++}}
setInterval(()=>{try{musTick()}catch(e){}},90);
for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,()=>{try{audioInit();if(AC&&AC.state!=='running')AC.resume()}catch(e){}},{passive:true});
const RADIO_SONG=[[392,523,659,523],[440,523,698,523],[349,440,587,440],[392,494,587,494]];
function radioLine(){const X=S.wx,d=S.W.dests||[],dn=d.length?pick(d).n.toLowerCase():'el centro';const hr=X&&X.on?clockTxt().slice(0,5):'';
  return pick([`Radio Pixel, ciento uno punto cinco. ${hr?'Son las '+hr+'.':''} Tránsito pesado cerca de ${dn}; tome previsiones.`,
    `Este espacio es presentado por Pulzar Solutions. Pulzar Solutions: tecnología que impulsa su negocio.`,
    X&&X.rain>.2?'Reportan lluvia en la capital. Encienda las luces y aumente la distancia con el carro de adelante.':'Cielo despejado en el Valle Central. Recuerde: el cinturón salva vidas.',
    'Consejo vial: en las rotondas cede el paso a quien ya va circulando, y usa la direccional derecha antes de salir.',
    'Recuerde que adelantar a un ciclista exige dejar un metro y medio de distancia.',
    `Llamada de un oyente: pura vida a todos los que van rumbo a ${dn}.`,
    'Si toma, no maneje. Radio Pixel le acompaña.'])}
function updateRadio(dt){if(!S.radio||S.exam)return;S.radioT=(S.radioT||0)-dt;S.beatT=(S.beatT||0)-dt;
  if(S.radioT<=0){S.radioT=34+Math.random()*16;const l=radioLine().replace('Radio Pixel, ciento uno punto cinco',STATIONS[CFG.station].n);toast(STATIONS[CFG.station].n,l,'info');say(l)}}
