'use strict';
// ===================== RENDIMIENTO: CALIDAD AUTOMÁTICA Y AHORRO DE BATERÍA =====================
// Tres niveles de gráficos (QL): 2 ALTOS (32-bit, todo), 1 MEDIOS (16-bit), 0 BAJOS (16-bit, se dibuja menos lejos,
// espejos más lentos y 30 cuadros por segundo). En AUTOMÁTICO el juego mide cuánto tarda cada cuadro y baja de nivel
// si el aparato se traba; si va sobrado por un buen rato, vuelve a subir (máximo dos veces por partida).
// Batería: nunca más de 60 cuadros por segundo (aunque la pantalla sea de 120 Hz), 30 en los menús, 10 en la pausa,
// y el audio se suspende cuando el juego queda en segundo plano.
const QN=['BAJOS','MEDIOS','ALTOS'];
if(!['auto','2','1','0'].includes(String(CFG.gq)))CFG.gq='auto';
let QL=CFG.gq==='auto'?(GFX===32?2:1):+CFG.gq;
const PERF={lastR:0,n:0,w:0,iv:0,S:null,skip:0,good:0,ups:0,changed:0};
function gqLabel(){return CFG.gq==='auto'?'AUTO · '+QN[QL]:QN[QL]}
function applyQL(q,why){QL=clamp(q,0,2);const want=QL===2?32:16;if(GFX!==want)setGfx(want,true);
  const b=$('bGfx');if(b)b.textContent='GRÁFICOS: '+gqLabel();PERF.changed=performance.now();PERF.n=PERF.w=PERF.iv=0;PERF.good=0;
  if(why)toast('GRÁFICOS '+QN[QL],why,'info')}
// elegido a mano desde la pausa o la configuración: AUTO → ALTOS → MEDIOS → BAJOS → AUTO
function cycleGq(d=1){const L=['auto','2','1','0'];CFG.gq=L[(L.indexOf(String(CFG.gq))+d+L.length)%L.length];cfgSave();
  applyQL(CFG.gq==='auto'?QL:+CFG.gq,CFG.gq==='auto'?'el juego ajusta la calidad solo para que corra suave':QL===2?'luz suave y más detalle':QL===1?'más liviano':'lo más liviano posible')}
// cuántos milisegundos debe haber entre cuadros según lo que se está viendo
function perfTarget(){if(!S)return 1000/30;if(S.paused)return 100;if(S.over)return 1000/30;return QL===0?1000/30:1000/60}
function perfGate(now){if(now-PERF.lastR<perfTarget()-2.5)return false;const iv=now-PERF.lastR;PERF.lastR=now;PERF.lastIv=iv;return true}
function perfMeasure(work,now){
  if(!S||S.paused||S.over||S.replay||S.mapOpen||document.hidden){PERF.n=0;PERF.w=PERF.iv=0;return}
  if(PERF.S!==S){PERF.S=S;PERF.skip=now+2500;PERF.n=PERF.w=PERF.iv=0;PERF.good=0;PERF.ups=0}
  if(now<PERF.skip||CFG.gq!=='auto')return;
  PERF.n++;PERF.w+=work;PERF.iv+=Math.min(PERF.lastIv||16.7,100);if(PERF.n<60)return;
  const aw=PERF.w/PERF.n,ai=PERF.iv/PERF.n,budget=QL===0?33.3:16.7;PERF.n=PERF.w=PERF.iv=0;
  if(QL>0&&(aw>budget*.7||ai>budget*1.3)){applyQL(QL-1,'bajamos un poco la calidad para que el juego no se trabe');return}
  if(QL<2&&PERF.ups<2&&aw<budget*.3&&ai<budget*1.1&&now-PERF.changed>20000){if(++PERF.good>=4){PERF.ups++;applyQL(QL+1,'su aparato va sobrado: subimos la calidad')}}else PERF.good=0}
// el audio se apaga con el juego en segundo plano (pestaña oculta, teléfono bloqueado) y vuelve al regresar
document.addEventListener('visibilitychange',()=>{try{if(!AC)return;if(document.hidden){if(AC.state==='running'){AC.suspend();PERF.audioOff=true}}else if(PERF.audioOff){PERF.audioOff=false;AC.resume()}}catch(e){}});
