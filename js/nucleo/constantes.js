'use strict';
// ===================== CONSTANTES =====================
const VW=384,VH=216,KMH=1.08;let HW=14;
const CAT={I:32,II:12,III:8,IV:4};
const $=id=>document.getElementById(id);
const game=$('game'),g=game.getContext('2d');g.imageSmoothingEnabled=false;
const mini=$('mini'),mg=mini.getContext('2d');
const SKINS=['#ffdbac','#f1c27d','#e0ac69','#c68642','#a0662f','#8d5524','#5c3a1e'],HAIRS=['#111','#2b1b10','#4a2f1b','#7a4a24','#a0522d','#d8b26a','#e8d9a8','#8a8a8a','#c0392b'];
const SHIRTS=['#2a9df4','#e63946','#3ddc84','#ffd23f','#ff7aa8','#9b5de5','#f4a261','#2ec4b6','#ffffff','#1d3557','#6a994e','#ff8c42'],PANTS=['#2b3a55','#333','#5c4b37','#1d3557','#6b705c','#3d405b','#7f8c8d'];
const AVDEF={g:'m',skin:'#e0ac69',hair:'#2b1b10',hs:0,beard:0,gl:false,dress:false,col:'#2a9df4',pants:'#2b3a55',ht:4.6,seed:1};
let AV=Object.assign({},AVDEF,(()=>{try{return JSON.parse(localStorage.getItem('pp_av'))||{}}catch(e){return{}}})());
const FACES={'EVALUADOR':{g:'m',skin:'#c68642',hair:'#222',hs:6,beard:2,gl:true,col:'#1d4ed8',seed:2},'EVALUADOR DE CALLE':{g:'f',skin:'#e0ac69',hair:'#4a2f1b',hs:3,gl:false,col:'#2e8b57',seed:5},'EVALUADORA':{g:'f',skin:'#e0ac69',hair:'#4a2f1b',hs:3,col:'#2e8b57',seed:5},'INSTRUCTOR':{g:'m',skin:'#f1c27d',hair:'#7a4a24',hs:0,beard:1,col:'#e63946',seed:7},'OFICIAL':{g:'m',skin:'#a0662f',hair:'#111',hs:4,col:'#1d3557',seed:3}};
// ESTILO 32-BIT: misma resolución (como las consolas de 32 bits), pero con luz suave (brillo/bloom), viñeta, carros con volumen, sombras difusas y cielo sin franjas.
let GFX=(()=>{let v=null;try{v=JSON.parse(localStorage.getItem('pp_gfx'))}catch(e){}if(v!==16&&v!==32)v=matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches?16:32;return v})();
const BLM=document.createElement('canvas');BLM.width=96;BLM.height=54;const blx=BLM.getContext('2d');let VIG=null;
function post32(){if(GFX!==32)return;const X=S&&S.wx,n=X&&X.on?X.n||0:0;
  blx.globalCompositeOperation='copy';blx.imageSmoothingEnabled=true;blx.drawImage(game,0,0,96,54);
  blx.globalCompositeOperation='multiply';for(let i=n>.3?5:3;i>0;i--)blx.drawImage(BLM,0,0);
  g.save();g.imageSmoothingEnabled=true;g.globalCompositeOperation='screen';g.globalAlpha=.2+.45*n;g.drawImage(BLM,0,0,VW,VH);g.restore();
  if(!VIG){VIG=document.createElement('canvas');VIG.width=VW;VIG.height=VH;const v=VIG.getContext('2d'),gr=v.createRadialGradient(VW/2,VH/2,VH*.4,VW/2,VH/2,VW*.62);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(12,8,28,.34)');v.fillStyle=gr;v.fillRect(0,0,VW,VH)}
  g.drawImage(VIG,0,0)}
function setGfx(v){GFX=v;store.set('pp_gfx',v);CARCACHE.clear();if(S&&S.W){S.W.bg=renderBG(S.W);S.W.bg32=null}if(A&&A.W)A.W.bg=renderBG(A.W);const b=$('bGfx');if(b)b.textContent='GRÁFICOS: '+v+'-BIT';toast('GRÁFICOS '+v+'-BIT',v===32?'luz suave y más detalle':'más liviano','info')}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const nA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
const inR=(x,y,r)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
const pick=a=>a[Math.random()*a.length|0];
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const dirVec={E:[1,0],W:[-1,0],S:[0,1],N:[0,-1]};
const armDir={W:'E',E:'W',N:'S',S:'N'},opp={W:'E',E:'W',N:'S',S:'N'};
const axisOf=d=>(d==='E'||d==='W')?'h':'v';
function card(h){h=nA(h);if(h>-Math.PI/4&&h<=Math.PI/4)return'E';if(h>Math.PI/4&&h<=3*Math.PI/4)return'S';if(h<=-Math.PI/4&&h>-3*Math.PI/4)return'N';return'W'}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const m=f<0?0:255,k=Math.abs(f);r=Math.round(r+(m-r)*k);gg=Math.round(gg+(m-gg)*k);b=Math.round(b+(m-b)*k);return'#'+((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1)}
const CARCOLS=['#f2f2ee','#e9e8e2','#f4f4f0','#c7cbd1','#b4b9c0','#9ea4ac','#6b717b','#4a4f58','#2a2d33','#1d1e23','#b3202a','#d0313b','#7a1f2b','#1f3f7a','#2f6fb5','#5b8fc9','#2f5d50','#c9b48a','#8a6d4b','#e07a2e'];
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
// últimos errores del juego (van en los reportes para poder repetir el problema)
const ERRLOG=[];addEventListener('error',e=>{ERRLOG.push(String(e.message).slice(0,120)+(e.filename?' @'+e.filename.split('/').pop()+':'+e.lineno:''));if(ERRLOG.length>5)ERRLOG.shift()});
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
