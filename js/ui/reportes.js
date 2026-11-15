'use strict';
// ===================== REPORTAR PROBLEMA O SUGERENCIA =====================
// Todavía no hay servidor: el reporte se arma aquí (con datos técnicos para poder reproducir el problema) y se manda
// por correo o WhatsApp desde el teléfono del jugador. También queda guardado en el aparato (pp_reports) para
// subirlo cuando exista la base de datos.
// CONTACTO: a dónde llegan los reportes. Si un campo está vacío, ese botón no aparece.
const CONTACTO={correo:'',whatsapp:''};// whatsapp: solo números con código de país, ej. '50688887777'
const APP_VER='2026.11.15';
const REP={tipo:'problema',desde:null};
const REP_TIPOS={problema:'PROBLEMA',sugerencia:'SUGERENCIA',examen:'EXAMEN DISTINTO AL REAL'};
function repTec(){const L=PROF&&LICS.find(l=>l.id===PROF.lic),ua=navigator.userAgent,
    os=/Android [\d.]+/.exec(ua)||/iPhone OS [\d_]+|iPad; CPU OS [\d_]+/.exec(ua)||/Windows NT [\d.]+|Mac OS X [\d_]+|CrOS|Linux/.exec(ua),
    br=/Edg\/[\d]+|OPR\/[\d]+|SamsungBrowser\/[\d]+|CriOS\/[\d]+|Chrome\/[\d]+|FxiOS\/[\d]+|Firefox\/[\d]+|Version\/[\d.]+ .*Safari/.exec(ua);
  const t=[`Versión: ${APP_VER}`,`Equipo: ${os?os[0].replace(/_/g,'.'):'?'} · ${br?br[0].replace(/ .*Safari/,' Safari'):'?'} · pantalla ${screen.width}×${screen.height} · ${TOUCH?'táctil':'teclado'}`,
    `Gráficos: ${GFX}-bit · Licencia: ${L?L.id:'práctica libre'}`];
  if(REP.desde)t.push(`Estaba en: ${REP.desde}`);
  if(ERRLOG.length)t.push('Errores: '+ERRLOG.slice(-3).join(' / '));
  return t.join('\n')}
function repText(){const quien=$('repQuien').value.trim(),txt=$('repTxt').value.trim();
  return `PLANTEL PIXEL · ${REP_TIPOS[REP.tipo]}\n\n${txt}`+(quien?`\n\nDe: ${quien}`:'')+($('repTec').checked?`\n\n— Datos técnicos —\n${repTec()}`:'')}
function openReport(){REP.desde=S?(MNAME[S.mode]||S.mode)+' · '+(VEH[CAR.type]?VEH[CAR.type].n:CAR.type)+' · '+Math.floor(S.t)+' s':null;
  show('repScr');if(!S)ui='rep';
  $('repMail').style.display=CONTACTO.correo?'':'none';$('repWa').style.display=CONTACTO.whatsapp?'':'none';
  $('repShare').style.display=navigator.share?'':'none';$('repMsg').textContent='';repPaint()}
function repPaint(){for(const b of $('repTipo').children)b.classList.toggle('sel',b.dataset.t===REP.tipo);
  const ok=$('repTxt').value.trim().length>=8;for(const id of['repMail','repWa','repCopy','repShare'])$(id).disabled=!ok;
  $('repTxt').placeholder=REP.tipo==='sugerencia'?'Ej.: estaría bueno practicar el estacionamiento en paralelo por separado.':REP.tipo==='examen'?'Ej.: en el plantel de San José los conos de la reversa están más cerca que en el real.':'Ej.: al estacionar en reversa me marcó falta aunque no toqué el cono.'}
function repSaved(how){const L=store.get('pp_reports',[]);L.push({t:Date.now(),tipo:REP.tipo,txt:$('repTxt').value.trim(),quien:$('repQuien').value.trim(),tec:$('repTec').checked?repTec():'',how});
  while(L.length>20)L.shift();store.set('pp_reports',L);$('repMsg').textContent='¡GRACIAS! LO VAMOS A REVISAR.';$('repTxt').value='';repPaint()}
function repBack(){if(S){show('pause');$('pause').classList.toggle('hidden',!S.paused)}else back()}
for(const b of $('repTipo').children)b.onclick=()=>{REP.tipo=b.dataset.t;repPaint()};
$('repTxt').addEventListener('input',repPaint);
$('repMail').onclick=()=>{const t=repText();location.href=`mailto:${CONTACTO.correo}?subject=${encodeURIComponent('Plantel Pixel · '+REP_TIPOS[REP.tipo])}&body=${encodeURIComponent(t)}`;repSaved('correo')};
$('repWa').onclick=()=>{window.open('https://wa.me/'+CONTACTO.whatsapp+'?text='+encodeURIComponent(repText()),'_blank','noopener');repSaved('whatsapp')};
$('repShare').onclick=()=>{navigator.share({title:'Plantel Pixel · '+REP_TIPOS[REP.tipo],text:repText()}).then(()=>repSaved('compartir'),()=>{})};
$('repCopy').onclick=()=>{const t=repText(),done=()=>repSaved('copiado');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,()=>{$('repTxt').select();$('repMsg').textContent='COPIE EL TEXTO A MANO (CTRL+C)'});else{$('repTxt').select();$('repMsg').textContent='COPIE EL TEXTO A MANO (CTRL+C)'}};
$('repBack').onclick=repBack;$('bRep').onclick=openReport;$('bRepP').onclick=openReport;

// ===================== TÉRMINOS Y CONDICIONES =====================
// Al cambiar terminos.html de forma importante, subir TYC_VER: a todos se les vuelve a pedir que acepten.
const TYC_VER='2026-11-15';
const tycOk=()=>store.get('pp_tyc',null)===TYC_VER;
function tycAccept(){store.set('pp_tyc',TYC_VER);back()}
function openTyc(){show('tycScr');ui='tyc'}
$('tycOk').onclick=tycAccept;
