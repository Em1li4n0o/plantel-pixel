'use strict';
// ===================== CARGA POR PARTES =====================
// Las partes pesadas que no todos usan no se bajan al abrir el juego: se piden la primera vez que hacen falta
// (al entrar al examen teórico o a una ruta) y quedan en memoria. Para agregar un paquete: ponerlo en PAQUETES
// y decir en pkgFor() qué modo lo necesita. Los archivos de un paquete NO van en index.html.
const PAQUETES={
  teoria:['examen/teorico.js'],
  rutas:['mundo/rutas.js','mundo/alajuela.js','mundo/recorridos-oficiales.js','mundo/molde-rutas.js'],
};
// versión de esta publicación (la pone herramientas/version.py en index.html): se agrega a lo que se baja después
const VER=(()=>{const me=document.querySelector('script[src*="nucleo/cargador.js"]');return me&&me.src.includes('?')?'?'+me.src.split('?')[1]:''})();
const PKG_OK={},PKG_P={};
function need(pk){if(PKG_OK[pk])return Promise.resolve();if(PKG_P[pk])return PKG_P[pk];
  const ver=VER;
  PKG_P[pk]=Promise.all(PAQUETES[pk].map(f=>new Promise((ok,bad)=>{const s=document.createElement('script');s.src='js/'+f+ver;s.async=false;
    s.onload=ok;s.onerror=()=>{s.remove();bad(new Error('No cargó '+f))};document.head.appendChild(s)})))
    .then(()=>{PKG_OK[pk]=true},e=>{delete PKG_P[pk];throw e});
  return PKG_P[pk]}
// qué paquete necesita cada modo (null = ya viene cargado)
function pkgFor(mode){return(['centro','sjlibre','r27','r32','alajuela'].includes(mode)||mode.startsWith('of_')||ROUTEDEF[mode])?'rutas':null}
// el examen teórico: la primera vez se baja y luego se abre (examen/teorico.js reemplaza esta función por la real)
function openTheory(...a){const stub=openTheory;need('teoria').then(()=>{if(openTheory!==stub)openTheory(...a)},()=>toast('SIN CONEXIÓN','No se pudo cargar el examen teórico. Revise el internet e intente de nuevo.','bad'))}
