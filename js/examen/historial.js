'use strict';
// ===================== HISTORIAL Y REPORTE PARA EL INSTRUCTOR =====================
function sid(){let s=store.get('pp_sid',null);if(!s){s=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);store.set('pp_sid',s)}return s}
function logAttempt(a){const h=store.get('pp_hist',[]);h.push(Object.assign({d:Date.now()},a));while(h.length>300)h.shift();store.set('pp_hist',h)}
function logDrive(){if(!S||S.logged||S.t<15||S.mode==='tuto')return;S.logged=true;
  logAttempt({m:S.mode,s:S.exam?Math.max(0,S.score):S.pts,ok:S.exam?S.okRes===true:null,fin:S.exam?S.over:true,t:Math.round(S.t),tk:S.exam?[Math.min(S.task,S.tasks.length),S.tasks.length]:[S.deliv,0],
    f:S.faults.slice(0,25).map(f=>[f.text,f.cat,Math.round(f.t),f.x,f.y]),car:CAR.type,fp:!!S.fp,lic:PROF?PROF.lic:null,dev:PROF?PROF.dev:null})}
addEventListener('pagehide',()=>logDrive());
const MNAME={manuel:'MANUEL ANTONIO',cerro:'CERRO DE LA MUERTE',alajuela:'ALAJUELA · TAXI',tilaran:'TILARÁN · EÓLICAS',r32:'RUTA 32',sjlibre:'SAN JOSÉ LIBRE',centro:'CENTRO DE SAN JOSÉ',r27:'RUTA 27',teorico:'TEÓRICO',sanjose:'PLANTEL SAN JOSÉ',plantel:'PLANTEL PIXEL',street:'PRUEBA EN CALLE',city:'MANEJO LIBRE'};
async function makeReport(){const rep={v:1,id:sid(),n:store.get('pp_name','')||'SIN NOMBRE',g:store.get('pp_school',''),at:Date.now(),prog:store.get('pp_prog',{}),h:store.get('pp_hist',[]).slice(-60),w:store.get('pp_wrong',[]).length,prof:PROF};
  const js=JSON.stringify(rep);let out;
  try{const cs=new Blob([js]).stream().pipeThrough(new CompressionStream('deflate-raw'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));out='PPZ1.'+btoa(s)}
  catch(e){out='PPJ1.'+btoa(unescape(encodeURIComponent(js)))}
  return out.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function openProgress(){show('prgScr');ui='prg';$('prgName').value=store.get('pp_name','');$('prgSchool').value=store.get('pp_school','');$('prgCodeBox').classList.add('hidden');$('prgMsg').textContent='';
  const h=store.get('pp_hist',[]);let html='';
  for(const m of['teorico','sanjose',...Object.keys(OFICIALES).map(k=>'of_'+k),...Object.keys(SEDES).map(k=>'pl_'+k),'plantel','street','centro','r27','r32','tilaran','alajuela','manuel','cerro','city','sjlibre']){const a=h.filter(x=>x.m===m&&!x.prac);if(!a.length)continue;const best=Math.max(...a.map(x=>x.s));const pass=a.filter(x=>x.ok).length;const last=a.slice(-5);const avg=Math.round(last.reduce((s,x)=>s+x.s,0)/last.length);
    html+=`<div><b style="color:var(--acc)">${MNAME[m]}</b>: ${a.length} intento${a.length>1?'s':''} · ${(m==='city'||m==='sjlibre'||m==='alajuela')?'mejor '+best+' pts':pass+' aprobado'+(pass===1?'':'s')+' · mejor '+best+' · promedio de los últimos '+last.length+': '+avg}</div>`}
  const fc={};for(const a of h)for(const f of a.f||[])fc[f[0]]=(fc[f[0]]||0)+1;const top=Object.entries(fc).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(top.length)html+=`<div style="margin-top:calc(var(--u)*3);color:var(--acc)">FALTAS QUE MÁS REPITE</div>`+top.map(([t,n])=>`<div class="c2">${n}× ${t}</div>`).join('');
  $('prgSum').innerHTML=html||'<div>Aún no hay intentos guardados. ¡Haga una prueba y vuelva aquí!</div>'}
const saveWho=()=>{store.set('pp_name',$('prgName').value.trim().toUpperCase());store.set('pp_school',$('prgSchool').value.trim().toUpperCase())};
$('prgName').onchange=saveWho;$('prgSchool').onchange=saveWho;
$('prgGen').onclick=async()=>{saveWho();if(!store.get('pp_name','')){$('prgCodeBox').classList.remove('hidden');$('prgCode').value='';$('prgMsg').textContent='Escriba su nombre primero.';return}
  $('prgCode').value=await makeReport();$('prgCodeBox').classList.remove('hidden');$('prgMsg').textContent=`Código listo (${$('prgCode').value.length} caracteres).`};
$('prgCopy').onclick=async()=>{if(!$('prgCode').value)await $('prgGen').onclick();const v=$('prgCode').value;if(!v)return;try{await navigator.clipboard.writeText(v);$('prgMsg').textContent='¡Copiado! Péguelo en el chat con su instructor.'}catch(e){$('prgCode').select();document.execCommand('copy');$('prgMsg').textContent='¡Copiado!'}};
$('prgShare').onclick=async()=>{if(!$('prgCode').value)await $('prgGen').onclick();const v=$('prgCode').value;if(!v)return;const txt=`Reporte de Plantel Pixel de ${store.get('pp_name','')}:\n${v}`;
  if(navigator.share){try{await navigator.share({text:txt});return}catch(e){}}window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank')};
$('prgBack').onclick=()=>back();
