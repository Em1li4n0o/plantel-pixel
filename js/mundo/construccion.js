'use strict';
// ===================== CONSTRUCCIÓN DEL MUNDO =====================
function newWorld(kind,w,h){return{kind,w,h,paths:[],opaved:[],oslots:[],circObs:[],fences:[],roads:[],rounds:[],rails:[],nodes:[],stops:[],yields:[],zebras:[],paved:[],sidewalks:[],obst:[],cones:[],ai:[],ringCars:[],zones:[],slots:[],parked:[],trees:[],blds:[],limit:40}}
function addRoad(W,o,c,a,b){const r={o,c,a,b};r.rect=o==='h'?{x:a,y:c-HW,w:b-a,h:2*HW}:{x:c-HW,y:a,w:2*HW,h:b-a};W.roads.push(r);return r}
function pavedW(W,x,y){for(const R of W.rounds){const d=Math.hypot(x-R.x,y-R.y);if(d<R.r)return false;if(d<R.R)return true}for(const r of W.roads)if(inR(x,y,r.rect))return true;for(const p of W.paved)if(inR(x,y,p))return true;
  for(const p of W.paths){const h=p.hw||HW;for(const q of p.segs){const t=clamp(((x-q.ax)*q.dx+(y-q.ay)*q.dy)/q.len2,0,1);const ex=q.ax+q.dx*t-x,ey=q.ay+q.dy*t-y;if(ex*ex+ey*ey<h*h)return true}}
  if(W.ppaved)for(const q of W.ppaved)if(inPoly(x,y,q))return true;
  for(const o of W.opaved){const dx=x-o.cx,dy=y-o.cy,cc=Math.cos(o.ang),ss=Math.sin(o.ang);if(Math.abs(dx*cc+dy*ss)<=o.hl&&Math.abs(-dx*ss+dy*cc)<=o.hw)return true}
  return false}
function addPath(W,pts){const p={pts,segs:[]};for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1];const dx=bx-ax,dy=by-ay;p.segs.push({ax,ay,dx,dy,len2:dx*dx+dy*dy||1})}W.paths.push(p);return p}
function zonePts(z){if(z.o){const cc=Math.cos(z.ang),ss=Math.sin(z.ang);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[z.cx+cc*a*z.hl-ss*b*z.hw,z.cy+ss*a*z.hl+cc*b*z.hw])}return[[z.x,z.y],[z.x+z.w,z.y],[z.x+z.w,z.y+z.h],[z.x,z.y+z.h]]}
function makePathLoop(pts,off=7){const n=pts.length,out=[],curv=[],turn=[];for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],q=pts[i],r=pts[(i+1)%n];const a1=Math.atan2(q[1]-p[1],q[0]-p[0]),a2=Math.atan2(r[1]-q[1],r[0]-q[0]);const am=a1+nA(a2-a1)/2;out.push({x:q[0]-Math.sin(am)*off,y:q[1]+Math.cos(am)*off});curv.push(Math.abs(nA(a2-a1)));turn.push(0)}return{pts:out,turn,curv}}
function addStop(W,x,y,dir,kind,light,extra=16,list=W.stops){let s;
  if(dir==='E')s={pos:x-extra,a:y,b:y+HW};if(dir==='W')s={pos:x+extra,a:y-HW,b:y};
  if(dir==='S')s={pos:y-extra,a:x-HW,b:x};if(dir==='N')s={pos:y+extra,a:x,b:x+HW};
  Object.assign(s,{dir,kind,light,minV:999,id:list.length});list.push(s);return s}
function addNode(W,x,y,type){
  const has=(px,py)=>W.roads.some(r=>inR(px,py,r.rect));
  const arms={W:has(x-HW-6,y),E:has(x+HW+6,y),N:has(x,y-HW-6),S:has(x,y+HW+6)};
  const n=Object.values(arms).filter(Boolean).length;if(n<3)return null;
  const node={x,y,arms,n,light:null};W.nodes.push(node);
  if(type==='round'){node.round=true;return node}
  if(n===4&&type&&type.startsWith('stop')){for(const d of type.slice(4))addStop(W,x,y,d,'stop');return node}
  if(n===4){node.light={off:Math.floor(Math.random()*20)};for(const a of['W','E','N','S'])addStop(W,x,y,armDir[a],'light',node.light)}
  else{const stem=['W','E','N','S'].find(a=>arms[a]&&!arms[opp[a]]);addStop(W,x,y,armDir[stem],'stop')}
  return node}
let CARID=0;const HELMS=['#1b1b1f','#f0f0f0','#e63946','#2a9df4','#ffd23f','#2b2d42'];function mkCar(type,extra){const v=VEH[type];return Object.assign({id:++CARID,type,L:v.L,Wd:v.Wd,col:v.fixed||pick(CARCOLS),angryT:0,say:'',helm:pick(HELMS),rider:pick(['#2b2d42','#3d405b','#5c677d','#1d3557','#6d4c41'])},extra)}
function addRound(W,x,y,cars,opt={}){const R={x,y,R:opt.R||46,r:opt.r||20};W.rounds.push(R);let node;if(opt.arms){node={x,y,arms:opt.arms,n:4,round:true};W.nodes.push(node)}else node=addNode(W,x,y,'round');
  for(const a in node.arms)if(node.arms[a])addStop(W,x,y,armDir[a],'yield',null,R.R+3,W.yields);
  for(let i=0;i<cars;i++)W.ringCars.push(mkCar(pick(['sedan','hatch','taxi','sedan']),{R,a:i*2*Math.PI/cars,r:R.R-8,v:0,vmax:28,x:0,y:0,h:0,ring:true}));
  return R}
function addRail(W,o,pos,op){const R={o,pos,len:op.len,speed:op.speed,period:op.period,off:op.off,cross:[]};
  for(const r of W.roads){if(r.o!==o&&pos>r.a&&pos<r.b){
    if(o==='v'){R.cross.push({x:pos,y:r.c,ca:r.c});addStop(W,pos,r.c,'E','rail',R,15).ca=r.c;addStop(W,pos,r.c,'W','rail',R,15).ca=r.c}
    else{R.cross.push({x:r.c,y:pos,ca:r.c});addStop(W,r.c,pos,'S','rail',R,15).ca=r.c;addStop(W,r.c,pos,'N','rail',R,15).ca=r.c}}}
  W.rails.push(R);return R}
function trainHead(W,R,t){const L=R.o==='v'?W.h:W.w;const D=L+R.len+300;const dur=D/R.speed;const ph=((t+R.off)%R.period+R.period)%R.period;if(ph>dur)return null;return-150+ph*R.speed}
function railWarn(W,R,ca,t){const s=trainHead(W,R,t);return s!==null&&s>ca-190&&s-R.len<ca+16}
function trainRect(W,R,t){const s=trainHead(W,R,t);if(s===null)return null;return R.o==='v'?{x:R.pos-5,y:s-R.len,w:10,h:R.len,s}:{x:s-R.len,y:R.pos-5,w:R.len,h:10,s}}
function makeZebra(o,x,y){return o==='h'?{o,x,y,rect:{x:x-5,y:y-HW,w:10,h:2*HW},peds:[],next:1+Math.random()*4,occ:false}:{o,x,y,rect:{x:x-HW,y:y-5,w:2*HW,h:10},peds:[],next:1+Math.random()*4,occ:false}}
function addParked(W,x,y,h,col,type='sedan'){W.parked.push({x,y,h,col,type});const v=VEH[type];const vert=Math.abs(Math.sin(h))>.7;W.obst.push(vert?{x:x-v.Wd/2,y:y-v.L/2,w:v.Wd,h:v.L,type:'car'}:{x:x-v.L/2,y:y-v.Wd/2,w:v.L,h:v.Wd,type:'car'})}
function makeLoop(nodes){const n=nodes.length,pts=[],turn=[];const nm=(x,y)=>{const l=Math.hypot(x,y);return[x/l,y/l]};
  for(let i=0;i<n;i++){const p=nodes[(i-1+n)%n],q=nodes[i],r=nodes[(i+1)%n];const di=nm(q[0]-p[0],q[1]-p[1]),dout=nm(r[0]-q[0],r[1]-q[1]);
    pts.push({x:q[0]+7*(-di[1]-dout[1]),y:q[1]+7*(di[0]+dout[0])});turn.push(di[0]*dout[1]-di[1]*dout[0])}
  return{pts,turn}}
const AITYPES=['sedan','sedan','sedan','hatch','hatch','taxi','taxi','pickup','suv','suv','moto','moto','scooter'];
// Navegación libre: los carros eligen en cada esquina si siguen recto o doblan, y cruzan la rotonda (entran, ceden y salen).
const u2=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]};
function cityGraph(W){const pts=[],key=(x,y)=>x+','+y;
  for(const a of W.roads)if(a.o==='h')for(const b of W.roads)if(b.o==='v'&&b.c>=a.a&&b.c<=a.b&&a.c>=b.a&&a.c<=b.b)pts.push([b.c,a.c]);
  W.adj={};for(const q of pts)W.adj[key(...q)]=[];
  for(const r of W.roads){const on=pts.filter(q=>r.o==='h'?q[1]===r.c:q[0]===r.c).sort((a,b)=>r.o==='h'?a[0]-b[0]:a[1]-b[1]);
    for(let i=0;i<on.length-1;i++){W.adj[key(...on[i])].push(on[i+1]);W.adj[key(...on[i+1])].push(on[i])}}
  return pts}
function navNb(W,n){return W.adj[n[0]+','+n[1]]||[]}
function navPick(W,prev,cur){let nb=navNb(W,cur).filter(n=>!(n[0]===prev[0]&&n[1]===prev[1]));if(!nb.length)nb=[prev];const di=u2(prev,cur);const w=nb.map(n=>{const d=u2(cur,n);return d[0]*di[0]+d[1]*di[1]>.5?2:1});let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let k=0;k<nb.length;k++){r-=w[k];if(r<=0)return nb[k]}return nb[0]}
function navWps(W,a,b,c,lo=7){const di=u2(a,b),dout=u2(b,c);const R=W.rounds.find(R=>R.x===b[0]&&R.y===b[1]);
  if(R){const en=[b[0]-di[0]*(R.R+5)-di[1]*lo,b[1]-di[1]*(R.R+5)+di[0]*lo],ex=[b[0]+dout[0]*(R.R+5)-dout[1]*lo,b[1]+dout[1]*(R.R+5)+dout[0]*lo];
    const aE=Math.atan2(en[1]-b[1],en[0]-b[0]),aX=Math.atan2(ex[1]-b[1],ex[0]-b[0]);let del=((aE-aX)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);if(del<.3)del+=2*Math.PI;
    const rr=R.R-9,out=[{x:en[0],y:en[1],turn:0,entry:R,sig:del>3.6?'L':del<2.2?'R':null}];
    for(let a2=aE-.45;a2>aE-del+.45;a2-=.45){const rem=a2-(aE-del);out.push({x:R.x+Math.cos(a2)*rr,y:R.y+Math.sin(a2)*rr,turn:0,ring:R,slow:20,sig:rem<1.3?'R':(del>3.6?'L':null)})}
    out.push({x:ex[0],y:ex[1],turn:0,ring:R,sig:'R'});return out}
  const cr=di[0]*dout[1]-di[1]*dout[0];
  if(Math.abs(cr)<.5)return[{x:b[0]-di[1]*lo,y:b[1]+di[0]*lo,turn:0}];
  return[{x:b[0]+lo*(-di[1]-dout[1]),y:b[1]+lo*(di[0]+dout[0]),turn:cr}]}
function navFill(W,c){while(c.q.length<3){const[a,b,cN]=c.nn;c.q.push(...navWps(W,a,b,cN,c.lo||HW/2));c.nn=[b,cN,navPick(W,b,cN)]}}
function spawnNav(W,n,types){for(let k=0;k<n;k++){let a,b,mx,my,tries=0;
    do{a=pick(W.inter);b=pick(navNb(W,a));mx=(a[0]+b[0])/2;my=(a[1]+b[1])/2;tries++}while(tries<80&&(W.ai.some(o=>Math.hypot(o.x-mx,o.y-my)<45)||Math.hypot(W.spawn.x-mx,W.spawn.y-my)<90));
    const di=u2(a,b),f=.3+Math.random()*.4;const type=(types&&types[k])||pick(AITYPES);const bk=type==='bici';const vm=bk?15:type==='garbage'?18:type==='bus'?38:34*(.85+Math.random()*.3);const bad=Math.random()<.35;const lo=bk?HW*.75:HW/2;
    const c=mkCar(type,{lo,drv:bk?1:bad?1+Math.random()*.12:.85+Math.random()*.17,cap:bk?14+Math.random()*4:type==='garbage'?18:type==='bus'?40:99,nav:1,nn:[a,b,navPick(W,a,b)],q:[],x:a[0]+(b[0]-a[0])*f-di[1]*lo,y:a[1]+(b[1]-a[1])*f+di[0]*lo,h:Math.atan2(di[1],di[0]),v:vm*.5,vmax:vm,ok:{},wait:0,bad,collT:4+Math.random()*8});
    navFill(W,c);W.ai.push(c)}}
function addNodeTown(W,x,y){const has=(px,py)=>W.roads.some(r=>inR(px,py,r.rect));const arms={W:has(x-HW-6,y),E:has(x+HW+6,y),N:has(x,y-HW-6),S:has(x,y+HW+6)};
  const n=Object.values(arms).filter(Boolean).length;if(n<3)return;W.nodes.push({x,y,arms,n,light:null});
  if(n===4){addStop(W,x,y,'S','stop');addStop(W,x,y,'N','stop')}else{const stem=['W','E','N','S'].find(a=>arms[a]&&!arms[opp[a]]);addStop(W,x,y,armDir[stem],'stop')}}
function walkPos(r,s){if(r.seg){const[a,b]=r.seg,L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)return a.slice();let u=((s%(2*L))+2*L)%(2*L);if(u>L)u=2*L-u;return[a[0]+(b[0]-a[0])*u/L,a[1]+(b[1]-a[1])*u/L]}const w=r.w-4,h=r.h-4,L=2*(w+h);s=((s%L)+L)%L;if(s<w)return[r.x+2+s,r.y+2];s-=w;if(s<h)return[r.x+2+w,r.y+2+s];s-=h;if(s<w)return[r.x+2+w-s,r.y+2+h];s-=w;return[r.x+2,r.y+2+h-s]}
function spawnOnLoop(W,loop,count,vmax,types){const P=loop.pts,n=P.length;const seg=[];let tot=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];const l=Math.hypot(b.x-a.x,b.y-a.y);seg.push(l);tot+=l}
  for(let k=0;k<count;k++){let d=(k+.35)/count*tot;let i=0;while(d>seg[i]){d-=seg[i];i++}const a=P[i],b=P[(i+1)%n];const f=d/seg[i];
    const type=(types&&types[k])||pick(AITYPES);const vm=type==='bus'?Math.min(vmax,42):vmax*(.85+Math.random()*.3);
    W.ai.push(mkCar(type,{loop,wi:(i+1)%n,x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,h:Math.atan2(b.y-a.y,b.x-a.x),v:vm*.6,vmax:vm,ok:{},wait:0}))}}
function addTrees(W,R,n,box,minD){for(let i=0,tries=0;i<n&&tries<n*40;tries++){const x=box.x+R()*box.w,y=box.y+R()*box.h;let ok=true;
  for(let a=0;a<6&&ok;a++){const an=a/6*Math.PI*2;if(pavedW(W,x+Math.cos(an)*minD,y+Math.sin(an)*minD))ok=false}
  if(!ok)continue;if(W.obst.some(o=>x>o.x-8&&x<o.x+o.w+8&&y>o.y-8&&y<o.y+o.h+8))continue;
  if(W.sidewalks.some(o=>x>o.x-6&&x<o.x+o.w+6&&y>o.y-6&&y<o.y+o.h+6)&&!box.inside)continue;
  if(W.rails.some(r=>Math.abs((r.o==='v'?x:y)-r.pos)<14))continue;
  W.trees.push({x,y,r:4+(R()*3|0)});W.obst.push({x:x-2,y:y-2,w:4,h:4,type:'tree'});i++}}

function buildPlantel(){
  HW=14;
  const W=newWorld('plantel',640,480);W.limit=25;
  addRoad(W,'h',40,26,614);addRoad(W,'h',440,26,614);addRoad(W,'v',40,26,454);addRoad(W,'v',600,26,454);
  addRoad(W,'h',240,26,614);addRoad(W,'v',320,26,454);
  W.paved.push({x:92,y:54,w:32,h:14,tag:'pocket'});W.paved.push({x:124,y:54,w:16,h:8,tag:'taper'});
  W.paved.push({x:372,y:54,w:96,h:36,tag:'lot'});
  W.paved.push({x:114,y:336,w:18,h:90,tag:'corr'});
  W.paved.push({x:54,y:288,w:16,h:84,tag:'bay'});
  addRound(W,320,240,3);
  for(const[x,y]of[[320,40],[320,440],[40,240],[600,240]])addNode(W,x,y);
  addRail(W,'v',480,{len:110,speed:70,period:34,off:14});
  W.zebras.push(makeZebra('h',220,40));
  const sc=[['#c0392b','sedan'],['#2e86de','suv'],null,['#f1c40f','hatch'],null,['#8e44ad','sedan']];
  for(let i=0;i<6;i++){const x=376+15*i;W.slots.push({x,y:58,w:15,h:28});if(sc[i])addParked(W,x+7.5,72,Math.PI/2,sc[i][0],sc[i][1])}
  addParked(W,62,304,-Math.PI/2,'#16a085');addParked(W,62,348,-Math.PI/2,'#d35400','hatch');
  for(let y=340;y<=420;y+=10){W.cones.push({x:112,y,vx:0,vy:0,hit:false});W.cones.push({x:134,y,vx:0,vy:0,hit:false})}
  W.cones.push({x:72,y:313,vx:0,vy:0,hit:false});W.cones.push({x:72,y:339,vx:0,vy:0,hit:false});
  const off={x:150,y:118,w:84,h:44,type:'bld',col:'#d9cba3',roof:'#b5533c',label:'EDUCACION VIAL'};W.obst.push(off);W.blds.push(off);
  const st={x:420,y:330,w:70,h:30,type:'bld',col:'#8d99ae',roof:'#5c677d',label:'GRADERIAS'};W.obst.push(st);W.blds.push(st);
  const R=rng(11);addTrees(W,R,70,{x:0,y:0,w:640,h:480},11);
  spawnOnLoop(W,makeLoop([[40,40],[600,40],[600,440],[40,440]]),2,25);
  W.ai[0].x=400;W.ai[0].y=433;W.ai[0].h=Math.PI;W.ai[0].wi=3;
  W.spawn={x:108,y:61,h:0};
  return W}

// Plantel de San José: trazado copiado de la foto aérea (aproximado). K = unidades del juego por píxel de la foto;
// la fila de carros bajo los paneles mide ~40 m (1 unidad ≈ 0,3 m; el plantel queda ~1,3 veces el tamaño real para que se pueda manejar).
const SJK=1.15,sjq=a=>a.map(([x,y])=>[x*SJK,y*SJK]);
const SJP={slot:{x:109,y:110},cor:{x:459,top:106,end:250}};
function buildSanJose(){
  HW=9;const K=SJK;
  const W=newWorld('sanjose',492,392);W.limit=25;
  const way=(pts,o={})=>Object.assign(addPath(W,pts),o);
  // vía de la derecha (al norte; retroceso de 40 m) y vía superior (al oeste, regreso a la plazoleta)
  way([[450,372],[450,69]],{oneway:1,noCenter:1,hidden:1});
  way([[450,72],[448,50],[435,31],[414,21],[391,18]].concat(sjq([[250,34],[110,64],[0,76]])),{oneway:1,noCenter:1});
  way(sjq([[130,101],[335,60],[352,58]]),{oneway:1,noCenter:1});          // fila de carros bajo los paneles (40 m)
  way([[92,165],[130,158],[150,128]],{oneway:1,noCenter:1});              // salida de la plazoleta a la fila
  way(sjq([[343,59],[362,52],[380,40]]),{oneway:1,noCenter:1});           // enlace a la vía superior
  // zigzag: calle diagonal ancha con hileras de conos alternadas
  const zz=[[400,67],[418,84],[418,112],[392,134],[312,160],[258,180],[240,202],[240,232],[250,252],[266,262],[292,262]];
  way(zz,{oneway:1,noCenter:1,hw:12});
  way([[350,322],[352,346],[366,362],[392,371],[424,371],[442,362],[450,344]],{oneway:1,noCenter:1}); // salida única (sur): baja y entra a la vía de la derecha
  W.paved.push({x:432,y:69,w:36,h:304,tag:'lanes'});
  W.paved.push({x:6,y:72,w:124,h:100,tag:'plaza'});
  W.paved.push({x:397,y:25,w:50,h:46});
  const rd=addRound(W,350,262,3,{R:62,r:38,arms:{W:true,S:true}});W.yields=W.yields.filter(s=>s.dir!=='N');
  const sA=addStop(W,450,SJP.cor.top,'N','stop',null,0);sA.a=432;sA.b=468;W.nodes.push({x:412,y:76,arms:{},n:3});
  // marquesina de paneles solares (sólida)
  W.canopy=[130*K,79*K,340*K,33*K];{const[a,b,e,f]=W.canopy,L=Math.hypot(e-a,f-b);for(let k=0;k<=L;k+=5)W.circObs.push({x:a+(e-a)*k/L,y:b+(f-b)*k/L,r:7,type:'bld'})}
  const B=(x0,y0,x1,y1,o={})=>{const b=Object.assign({x:x0*K,y:y0*K,w:(x1-x0)*K,h:(y1-y0)*K,type:'bld',col:'#ececec',roof:'#d6d6d6'},o);W.obst.push(b);W.blds.push(b)};
  B(0,0,80,35,{col:'#b23a3a',roof:'#8b1e1e'});
  B(205,98,250,112);B(258,88,325,100,{label:'EDUCACION VIAL'});
  B(140,122,196,215,{label:'OFICINAS'});B(150,215,198,262);
  B(240,170,250,180,{col:'#e9c46a',roof:'#bc4749'});B(362,186,372,196,{col:'#e9c46a',roof:'#bc4749'});
  const cone=(x,y,o={})=>W.cones.push(Object.assign({x,y,vx:0,vy:0,hit:false},o));
  const near=(x,y,d)=>W.cones.some(k=>Math.hypot(k.x-x,k.y-y)<d);
  // conos a ambos lados del zigzag
  for(let i=1;i<zz.length-4;i++){const[a,b]=[zz[i],zz[i+1]];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;
    for(let t=0;t<L;t+=9){const x=a[0]+ux*t,y=a[1]+uy*t;for(const sd of[1,-1]){const cx=x-sd*uy*13.5,cy=y+sd*ux*13.5;if(!pavedW(W,cx,cy)&&!near(cx,cy,5))cone(cx,cy)}}}
  // hileras dentro de la calle, alternando lado (norte, sur, norte): obligan a zigzaguear
  {const[a,b]=[zz[3],zz[4]],[c2,d2]=[zz[4],zz[5]];const gate=(P0,P1,f,side)=>{const L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]),ux=(P1[0]-P0[0])/L,uy=(P1[1]-P0[1])/L;let nx=-uy,ny=ux;if((ny<0)!==(side<0)){nx=-nx;ny=-ny}
      const x=P0[0]+(P1[0]-P0[0])*f,y=P0[1]+(P1[1]-P0[1])*f;for(const o of[11,7,3])cone(x+nx*o,y+ny*o)};
    gate(a,b,.22,-1);gate(a,b,.75,1);gate(c2,d2,.45,-1)}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.2;cone(rd.x+Math.cos(a)*(rd.r+2),rd.y+Math.sin(a)*(rd.r+2))}
  // retroceso (cuadro rojo): pasillo de conos en la vía de la derecha
  for(let y=SJP.cor.top+10;y<=SJP.cor.end;y+=12){cone(SJP.cor.x-8.5,y);cone(SJP.cor.x+8.5,y)}
  // parqueo hacia atrás (círculo rojo): 4 espacios uno al lado del otro, conos en las líneas (tocar uno = prueba perdida)
  W.hslots=[];for(let i=0;i<4;i++){const y=86+16*i;W.hslots.push({x:98,y,w:22,h:16,target:i===1});
    if(i===3){const cx=110,cy=y+8,h=Math.PI;W.parked.push({x:cx,y:cy,h,col:'#c0392b',type:'sedan'});for(const q of circles({x:cx,y:cy,h,L:VEH.sedan.L,Wd:VEH.sedan.Wd}))W.circObs.push({x:q.x,y:q.y,r:q.r,type:'car'})}}
  for(let i=0;i<=3;i++)for(const x of[101,110,119])cone(x,86+16*i,{fatal:1});
  // límite del plantel (malla) al suroeste
  const lim=W.lim=[[0,237],[31,259],[87,285],[160,303],[234,318],[300,330]];
  for(let i=0;i<lim.length-1;i++){const[a,b]=lim[i],[e,f]=lim[i+1];W.fences.push([a,b,e,f]);const L=Math.hypot(e-a,f-b);for(let k=0;k<=L;k+=3)W.circObs.push({x:a+(e-a)*k/L,y:b+(f-b)*k/L,r:1.5,type:'fence'})}
  const limY=x=>{for(let i=0;i<lim.length-1;i++){const[a,b]=lim[i],[e,f]=lim[i+1];if(x>=a&&x<=e)return b+(f-b)*(x-a)/(e-a)}return 1e9};
  addTrees(W,rng(21),30,{x:0,y:0,w:W.w,h:W.h},9);
  W.trees=W.trees.filter(t=>t.y<limY(t.x)-6);W.obst=W.obst.filter(o=>o.type!=='tree'||o.y+2<limY(o.x+2)-6);
  const lane=sjq([[200,90],[335,60],[345,59],[362,52],[380,40],[377,28],[360,18],[340,16],[250,34],[110,64]]);
  spawnOnLoop(W,makePathLoop(lane.concat([[70,86],[40,112],[48,150],[92,165],[130,158],[150,128],[175,111]]),0),1,20);
  W.spawn={x:175*K,y:94*K,h:Math.atan2(-44,220)};
  return W}
function sjTasks(){const T=SJP.slot,C=SJP.cor;
  return[
  {txt:'FILA DE CARROS: póngase el cinturón [C] y avance por la fila bajo los paneles. Al final ponga direccional DERECHA y entre al zigzag.',tgt:{x:418,y:95},check(){const P=S.P;return P.x>404&&P.x<431&&P.y>92&&P.y<140}},
  {txt:'ZIGZAG: pase entre las hileras de conos sin tocarlos (cada cono = -12 puntos).',tgt:{x:352,y:147},check(){const P=S.P;if(P.x<330)this.tgt={x:244,y:205};return P.x<262&&P.y>192}},
  {txt:'ROTONDA: ceda el paso, entre, dé UNA VUELTA COMPLETA (direccional izq.) y salga por la única salida, al SUR (direccional der.).',tgt:{x:280,y:266},start(){S.lastExit=null},
   check(){if(!S.lastExit)return false;const e=S.lastExit;S.lastExit=null;if(e.exit!=='S')fault('exit','Tomó una salida equivocada en la rotonda','III',2);else if(e.trav<5.6)fault('lap','No dio la vuelta completa a la rotonda','III',2);return true}},
  {txt:'Siga la curva y suba por la vía de la derecha (2 carriles), en el CARRIL DERECHO.',tgt:{x:420,y:371},check(){const P=S.P;if(P.x>400)this.tgt={x:459,y:300};return P.x>432&&P.y<330}},
  {txt:'RETROCESO (40 m): por el carril derecho, avance entre los conos hasta la línea de ALTO y deténgase. Luego retroceda en línea recta hasta la línea amarilla.',tgt:{x:C.x,y:C.top+8},zone:{x:C.x-7,y:C.top,w:14,h:C.end-C.top},ok:'¡Retroceso completado!',
   check(){const P=S.P;const inC=Math.abs(P.x-C.x)<11&&P.y>C.top-6&&P.y<C.end+10;
     if(!this.ph){if(inC&&P.y<C.top+16&&Math.abs(P.v)<.5){this.ph=1;this.tgt={x:C.x,y:C.end};toast('AHORA EN REVERSA','Toque S dos veces y retroceda recto hasta la línea amarilla','info')}return false}
     if(inC&&P.gear===-1){if(P.v<-1)this.mv=true;if(this.mv&&Math.abs(P.v)<.3){this.st=(this.st||0)+S.dt;if(this.st>1&&!this.fl){this.fl=1;fault('rstop','Detenerse durante el retroceso','IV')}}else this.st=0}
     if(P.y>C.end){if(P.gear===1)fault('rnoret','No realizó el retroceso en reversa','III');return true}}},
  {txt:'PARQUEO (de último): suba (ALTO otra vez), tome la vía de arriba al OESTE, entre a la plazoleta y estaciónese HACIA ATRÁS en el espacio amarillo. ¡Tocar un cono aquí pierde la prueba!',tgt:{x:T.x,y:T.y},zone:{x:98,y:T.y-8,w:22,h:16},ok:'¡Parqueo hacia atrás correcto!',
   check(){const P=S.P;return still('sjp',Math.abs(P.x-T.x)<4&&Math.abs(P.y-T.y)<3.2&&Math.cos(P.h-Math.PI)>.92,1.2)}}]}

function buildCity(){
  HW=16;
  const W=newWorld('city',2020,1580);W.limit=40;
  const xs=[60,300,540,780,980],ys=[60,280,500,740];
  // centro
  addRoad(W,'h',60,46,1974);addRoad(W,'h',280,46,994);addRoad(W,'h',500,46,994);addRoad(W,'h',740,46,1254);
  for(const x of[60,300,540,780])addRoad(W,'v',x,46,754);addRoad(W,'v',980,46,1014);
  // pista (este), cuestas y pueblo (abajo)
  addRoad(W,'h',1000,966,1974);addRoad(W,'h',1260,1226,1974);addRoad(W,'h',1520,1226,1974);
  addRoad(W,'v',1240,726,1534);addRoad(W,'v',1500,986,1534);addRoad(W,'v',1760,986,1534);addRoad(W,'v',1960,46,1534);
  W.paved.push({x:800,y:514,w:160,h:88,tag:'lot'});
  W.paved.push({x:1820,y:74,w:110,h:52,tag:'gas'});
  addRoad(W,'v',1450,46,176);W.paved.push({x:1300,y:150,w:300,h:70,tag:'lot'});
  addRound(W,540,280,0);addRound(W,1500,1260,0);
  W.inter=cityGraph(W);
  // semáforos solo en los tres cruces grandes de la avenida; en los demás, ALTO para la calle que no tiene prioridad
  const SIG={'300,500':1,'780,500':1,'980,740':1},STP={'540,500':'stopNS','300,280':'stopEW','780,280':'stopNS'};
  for(const[x,y]of W.inter){if(W.rounds.some(R=>R.x===x&&R.y===y))continue;if(x>=1240&&y>=1000)addNodeTown(W,x,y);else addNode(W,x,y,SIG[x+','+y]?undefined:(STP[x+','+y]||'stopNS'))}
  // un par de calles de UNA VÍA en el centro (como en San José): la 300 sube al norte y la 780 baja al sur
  for(const r of W.roads){if(r.o==='v'&&r.b<800&&r.c===300)r.ow=-1;if(r.o==='v'&&r.b<800&&r.c===780)r.ow=1}oneWayFix(W);
  // pendientes (bajan hacia el sur)
  W.slopes=[{x:966,y:758,w:28,h:228,dx:0,dy:1,grade:.12,n:'12%'},{x:1226,y:758,w:28,h:228,dx:0,dy:1,grade:.10,n:'10%'},{x:1946,y:300,w:28,h:480,dx:0,dy:1,grade:.06,n:'6%'}];
  W.signs=[{x:999,y:766,t:'BAJADA 12%'},{x:961,y:978,t:'SUBIDA 12%'},{x:1259,y:766,t:'BAJADA 10%'},{x:1221,y:978,t:'SUBIDA 10%'},{x:1979,y:296,t:'BAJADA 6%'},{x:1941,y:788,t:'SUBIDA 6%'}];
  addRail(W,'h',620,{len:150,speed:80,period:40,off:6});
  makeHM(W,8,(x,y)=>{const d1=-22*smooth(758,986,y),d2=-12*smooth(300,780,y),b=smooth(1600,1720,x);return d1*(1-b)+d2*b});
  W.zebras.push(makeZebra('v',780,390),makeZebra('h',420,500),makeZebra('h',180,280),makeZebra('v',300,170));
  W.zones.push({x:96,y:266,w:190,h:28,limit:25,name:'ESCUELA'});
  const R=rng(5);
  for(let i=0;i<10;i++){const x=805+15*i;W.slots.push({x,y:574,w:15,h:28});if(i!==4&&R()<.6)addParked(W,x+7.5,588,Math.PI/2,CARCOLS[(R()*10)|0],pick(['sedan','hatch','suv']))}
  for(let i=0;i<4;i++)for(let j=0;j<3;j++){
    const bx1=xs[i]+HW,bx2=xs[i+1]-HW,by1=ys[j]+HW,by2=ys[j+1]-HW;
    const subs=(620>by1&&620<by2)?[[by1,606],[634,by2]]:[[by1,by2]];
    for(const[y1,y2]of subs){
      W.sidewalks.push({x:bx1,y:y1,w:bx2-bx1,h:y2-y1});
      const ix1=bx1+7,ix2=bx2-7,iy1=y1+7,iy2=y2-7;
      if(i===3&&j===2&&y1<620)continue;
      if(i===0&&j===0){const s={x:ix1+20,y:iy1+110,w:120,h:60,type:'bld',col:'#f2e8cf',roof:'#bc4749',label:'ESCUELA'};W.obst.push(s);W.blds.push(s);W.parks=W.parks||[];W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:100});continue}
      if(i===2&&j===1){// TORRE PULZAR: rascacielos con parque alrededor
        W.parks=W.parks||[];W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});const cx=(ix1+ix2)/2|0,cy=(iy1+iy2)/2|0;
        W.tower=addLM(W,pulzarParts(cx,cy),{tower:true});
        W.plazas=[{x:cx-54,y:cy-48,w:108,h:96},{x:cx-6,y:iy1,w:12,h:iy2-iy1},{x:ix1,y:cy-6,w:ix2-ix1,h:12}];
        W.fountains=[{x:cx-46,y:cy+40},{x:cx+46,y:cy-40}];for(const f of W.fountains)W.obst.push({x:f.x-4,y:f.y-4,w:8,h:8,type:'fuente'});continue}
      const rows=(iy2-iy1)>90?[[iy1,(iy1+iy2)/2|0],[((iy1+iy2)/2|0)+3,iy2]]:[[iy1,iy2]];
      for(const[ry1,ry2]of rows){let x=ix1;while(x<ix2-18){let w=22+R()*40|0;if(ix2-x-w<24)w=ix2-x;
        const b={x,y:ry1,w:w-3,h:ry2-ry1-3,type:'bld',col:['#ffb3c7','#9be7e0','#fff1a8','#c3f0ca','#e0c3fc','#ffd6a5','#f7f7f2'][(R()*7)|0]};b.roof=shade(b.col,-.18);b.blk=[ix1,iy1,ix2,iy2];
        {const r=R();if(r<.22&&b.w>24&&b.h>24){b.H=55+R()*70|0;const ci=R()*4|0;b.col=['#5fa8d3','#7fd1d8','#9ad1ff','#bfe3f0'][ci];b.win='glass';b.roof='#e8eef2';b.roofT='flat'}else{b.H=r<.7?16+R()*16|0:34+R()*22|0;b.win='grid';b.shop=['#ff4fa3','#00c2c7','#ffb000','#7b2ff7','#ff6b35'][R()*5|0];b.roofT='flat';b.roof='#f2efe6';b.tanks=[]}}
        const cx=clamp(540,b.x,b.x+b.w),cy=clamp(280,b.y,b.y+b.h);if(Math.hypot(cx-540,cy-280)>64){W.obst.push(b);W.blds.push(b)}
        x+=w}}}}
  for(const[t,x,y]of[['HOSPITAL',820,330],['MERCADO',580,520],['BANCO',330,300]]){const b=W.blds.find(b=>inR(x,y,b));if(b)b.label=t}
  // palmeras en las aceras del centro (estilo Miami)
  W.palms=[];for(const sw of W.sidewalks){if(sw.x>990||sw.y>760)continue;for(const[x0,y0,x1,y1]of[[sw.x+3,sw.y+3,sw.x+sw.w-3,sw.y+3],[sw.x+3,sw.y+sw.h-3,sw.x+sw.w-3,sw.y+sw.h-3]]){for(let x=x0+14;x<x1-10;x+=34){if(W.zebras.some(z=>Math.hypot(z.x-x,z.y-y0)<26))continue;W.palms.push({x,y:y0,r:R()*6})}}}
  {const pz=[];for(const b of W.blds)if(b.H&&b.H>40&&!b.parts&&pz.length<4&&R()<.5){b.pulzar=true;pz.push(b)}}
  // ---- pueblo ----
  const RT=rng(17),TX=[1240,1500,1760,1960],TY=[1000,1260,1520];W.cafe=[];W.fields=[];W.billboards=[];
  const B2=b=>{W.obst.push(b);W.blds.push(b);return b};
  const ov=(a,b,m=4)=>a.x<b.x+b.w+m&&a.x+a.w+m>b.x&&a.y<b.y+b.h+m&&a.y+a.h+m>b.y;
  const okR=b=>W.rounds.every(R=>{const cx=clamp(R.x,b.x,b.x+b.w),cy=clamp(R.y,b.y,b.y+b.h);return Math.hypot(cx-R.x,cy-R.y)>R.R+14});
  const town=[];
  const SP=[[{x:1330,y:1040,w:44,h:62,type:'bld',col:'#f4f1de',roof:'#8d99ae',label:'IGLESIA'},{park:{x:1290,y:1120,w:170,h:96}}],
    [{x:1570,y:1036,w:64,h:40,type:'bld',col:'#f4f5fa',roof:'#e3e6f0',pulzar:true},{paved:{x:1566,y:1080,w:72,h:20}}],
    [{x:1810,y:1030,w:34,h:24,type:'bld',col:'#ffd6a5',roof:'#9c6644',label:'PULPERIA'}],
    [{x:1290,y:1296,w:84,h:44,type:'bld',col:'#f2e8cf',roof:'#bc4749',label:'ESCUELA'}],
    [{field:{x:1560,y:1330,w:140,h:84}}],
    [{cafe:{x:1790,y:1300,w:140,h:180}}]];
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x1=TX[i]+HW+6,x2=TX[i+1]-HW-6,y1=TY[j]+HW+6,y2=TY[j+1]-HW-6;const spec=[];
    for(const s of SP[j*3+i]){if(s.type){B2(s);spec.push(s)}if(s.park){(W.parks=W.parks||[]).push(s.park);spec.push(s.park);W.plazas=W.plazas||[];W.plazas.push({x:s.park.x+s.park.w/2-5,y:s.park.y,w:10,h:s.park.h},{x:s.park.x,y:s.park.y+s.park.h/2-5,w:s.park.w,h:10});W.townPlaza=s.park}
      if(s.paved){W.paved.push(s.paved);spec.push(s.paved)}if(s.field){W.fields.push(s.field);spec.push(s.field)}if(s.cafe){W.cafe.push(s.cafe);spec.push(s.cafe)}}
    const put=(x,y,w,h)=>{const b={x,y,w,h,type:'bld',col:pick(['#f4a261','#e9c46a','#a8dadc','#ffadad','#caffbf','#bdb2ff','#fdffb6','#ffd6a5']),roof:pick(['#bc4749','#9c6644','#7f5539','#b5533c']),house:true};
      if(spec.some(s=>ov(b,s,6))||!okR(b)||town.some(t=>ov(b,t,3)))return;B2(b);town.push(b)};
    for(let x=x1;x<x2-14;x+=16+RT()*14|0){const w=14+RT()*8|0;put(x,y1,w,14);put(x,y2-14,w,14)}
    for(let y=y1+24;y<y2-34;y+=18+RT()*12|0){const h=14+RT()*6|0;put(x1,y,14,h);put(x2-14,y,14,h)}}
  // fincas, cafetales y ladera entre las cuestas
  {const G1=smoothLine([[300,754],[300,860],[245,985],[300,1110],[330,1250],[430,1395],[640,1468],[900,1482],[1226,1520]],10),G2=smoothLine([[330,1250],[520,1200],[690,1185]],10);
    W.gravelP=[];for(const g of[G1,G2]){const pa=addPath(W,g);pa.hw=11;pa.hidden=true;pa.noCenter=true;pa.gravel=true;W.gravelP.push(pa);for(let i=0;i<g.length-1;i+=3){const a=g[i],b=g[Math.min(g.length-1,i+3)];W.zones.push({x:Math.min(a[0],b[0])-14,y:Math.min(a[1],b[1])-14,w:Math.abs(b[0]-a[0])+28,h:Math.abs(b[1]-a[1])+28,limit:40,name:'LASTRE',noText:true})}}
    W.gHoles=[[300,900],[300,1180],[520,1440],[800,1480],[600,1192]].map(([x,y])=>({x,y,r:3}));
    W.cows=[];for(let i=0;i<7;i++){const x=640+Math.random()*120,y=1210+Math.random()*60;W.cows.push({x,y,ox:x,oy:y,h:Math.random()*6.28,t:Math.random()*5})}
    W.labels=(W.labels||[]).concat([{x:700,y:1140,t:'FINCA',col:'#fff'},{x:250,y:1000,t:'CALLE DE LASTRE',col:'#ffd23f',rot:1}])}
  W.cafe.push({x:90,y:790,w:380,h:300},{x:520,y:800,w:400,h:240},{x:110,y:1140,w:520,h:360},{x:1060,y:1060,w:150,h:420});
  for(const f of[{x:700,y:1150,w:24,h:18},{x:860,y:1300,w:26,h:18}])B2(Object.assign(f,{type:'bld',col:'#ffd6a5',roof:'#7f5539',house:true}));
  B2({x:1852,y:84,w:46,h:18,type:'bld',col:'#e63946',roof:'#f1f1f1',label:'GAS'});
  // AEROPUERTO: terminal, plataforma con aviones, calle de rodaje y pista de aterrizaje dentro de la malla
  {const AP={x:1040,y:296,w:880,h:264};W.airportR=AP;
    B2({x:1300,y:228,w:300,h:56,type:'bld',col:'#eef3f8',roof:'#cfd9e6',H:18,win:'glass',shop:'#1d4ed8',label:'AEROPUERTO'});
    B2({x:1612,y:236,w:20,h:20,type:'bld',col:'#f1faee',roof:'#e63946',H:46,label:''});
    const fen=(a,b)=>{W.fences.push([a[0],a[1],b[0],b[1]]);const Ln=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let k=0;k<=Ln;k+=3)W.circObs.push({x:a[0]+(b[0]-a[0])*k/Ln,y:a[1]+(b[1]-a[1])*k/Ln,r:1.5,type:'muro'})};
    fen([AP.x,AP.y],[AP.x+AP.w,AP.y]);fen([AP.x+AP.w,AP.y],[AP.x+AP.w,AP.y+AP.h]);fen([AP.x+AP.w,AP.y+AP.h],[AP.x,AP.y+AP.h]);fen([AP.x,AP.y+AP.h],[AP.x,AP.y]);
    for(let i=0;i<9;i++)if(R()<.7)addParked(W,1318+i*30,198,Math.PI/2,CARCOLS[(R()*10)|0],pick(['sedan','suv','taxi','hatch']));
    W.labels=(W.labels||[]).concat([{x:1330,y:156,t:'PARQUEO DEL AEROPUERTO',col:'#fff'},{x:1460,y:540,t:'PISTA 09-27',col:'#fff'}]);
    W.jets=[{kind:'off',T:40,ph:0,col:'#1d4ed8',rw:{x0:1100,L:760,y:445}},{kind:'land',T:40,ph:20,col:'#c1121f',rw:{x0:1100,L:760,y:445}},
      {st:1,x:1340,y:345,h:Math.PI/2,z:0,col:'#2a9d8f'},{st:1,x:1460,y:345,h:Math.PI/2,z:0,col:'#f4a261'},{st:1,x:1580,y:345,h:Math.PI/2,z:0,col:'#6a4c93'}];
    W.drawUnder=x=>{x.fillStyle='#5d8a4a';x.fillRect(AP.x,AP.y,AP.w,AP.h);
      x.fillStyle='#8a8d93';x.fillRect(1250,302,420,80);x.fillStyle='#ffd23f';for(let k=1290;k<1650;k+=120)x.fillRect(k+48,302,2,80);
      x.fillStyle='#5b5e64';x.fillRect(1090,392,780,14);for(const cx of[1180,1460,1760])x.fillRect(cx,380,16,30);x.fillStyle='#ffd23f';for(let k=1095;k<1865;k+=8)x.fillRect(k,398,4,1);
      x.fillStyle='#3b3d42';x.fillRect(1070,420,820,52);x.fillStyle='#fff';for(let k=1130;k<1830;k+=40)x.fillRect(k,445,22,2);
      for(const tx of[1076,1872])for(let k=0;k<7;k++)x.fillRect(tx,424+k*7,12,3);ptext(x,'09',1094,440,'#fff',1,2);ptext(x,'27',1846,440,'#fff',3,2);
      x.fillStyle='#ffd23f';for(const yy of[421,470])for(let k=1070;k<1890;k+=6)x.fillRect(k,yy,3,1)}}
  // comercios variados en el centro (uno por cuadra)
  {const SHOPS=['SUPERMERCADO','FARMACIA','SODA','PANADERIA','CINE','FERRETERIA','HOTEL','PIZZERIA','HELADERIA','LIBRERIA','GIMNASIO','VETERINARIA','CAFETERIA','ZAPATERIA','TIENDA'];let si=0;W.shops=[];
    for(const sw of W.sidewalks){if(sw.x>990||sw.y>760||si>=SHOPS.length)continue;const c=W.blds.filter(b=>!b.label&&!b.parts&&!b.pulzar&&!b.house&&b.w>=28&&(b.H||0)<60&&inR(b.x+b.w/2,b.y+b.h/2,sw));if(!c.length)continue;const b=c[(R()*c.length)|0];b.label=SHOPS[si++];W.shops.push(b)}}
  // MONUMENTOS: estatua de PLANTEL PIXEL en la rotonda del centro y la carreta típica en la plaza del pueblo
  {const cx=540,cy=280,N={win:'none'};W.statue=addLM(W,[PO(cx,cy,14,0,3,'#cfc7b6',N),PO(cx,cy,10,3,14,'#efe9dc',N),PO(cx,cy,11,14,15.5,'#d9d2c3',N),PB(cx-10,cy-5.5,20,11,15.5,20,'#ffd23f',N),PB(cx-5,cy-4.8,10,9.6,20,24.5,'#ffe680',N),
      PB(cx-8,cy-6.6,4.5,1.6,15.5,19,'#222',N),PB(cx+3.5,cy-6.6,4.5,1.6,15.5,19,'#222',N),PB(cx-8,cy+5,4.5,1.6,15.5,19,'#222',N),PB(cx+3.5,cy+5,4.5,1.6,15.5,19,'#222',N),
      PB(cx-2.5,cy-2.5,5,5,30,35,'#ff4fa3',N),PB(cx+5,cy-1.5,3.5,3.5,36,39.5,'#3df2ff',N),PB(cx-8,cy+1,3.5,3.5,34,37.5,'#7b2ff7',N)],{label:'PLANTEL PIXEL',ly:cy+13,statue:true})}
  if(W.townPlaza){const P0=W.townPlaza,cx=P0.x+P0.w/2,cy=P0.y+P0.h/2,N={win:'none'};W.carreta=addLM(W,[PB(cx-11,cy-6,22,12,0,2,'#d8d0c0',N),PB(cx-2,cy-4,11,8,4,7.5,'#e63946',N),PB(cx-1.5,cy-4,10,1,7.5,9,'#ffd23f',N),PB(cx-1.5,cy+3,10,1,7.5,9,'#ffd23f',N),
      PB(cx+1,cy-5.2,6,1.2,2,8,'#ffd23f',N),PB(cx+1,cy+4,6,1.2,2,8,'#ffd23f',N),PB(cx+2.8,cy-5.4,2.4,1.6,4,6,'#2a9df4',N),PB(cx+2.8,cy+3.8,2.4,1.6,4,6,'#2a9df4',N),
      PB(cx-12,cy-4,7,3.4,2,5.5,'#8d6e63',N),PB(cx-12,cy+.6,7,3.4,2,5.5,'#f5f0e6',N),PB(cx-13.5,cy-3.4,1.6,2.2,5.5,7,'#5d4037',N),PB(cx-13.5,cy+1.2,1.6,2.2,5.5,7,'#5d4037',N),PB(cx-7,cy-4,1,8,5.5,6.5,'#7f5539',N)],{label:'CARRETA TIPICA',ly:cy+10,statue:true})}
  // vallas de PULZAR
  for(const[x,y,o]of[[1300,24,'h'],[1650,96,'h'],[1992,520,'v'],[1012,380,'v'],[1110,860,'v'],[700,792,'h'],[1992,1100,'v']]){const b=o==='h'?{x:x-16,y:y-2,w:32,h:4}:{x:x-2,y:y-16,w:4,h:32};W.billboards.push(Object.assign({cx:x,cy:y,o},b));W.obst.push(Object.assign({type:'valla'},b))}
  addTrees(W,R,140,{x:0,y:0,w:1040,h:800},12);
  addTrees(W,RT,520,{x:0,y:760,w:2020,h:820},10);addTrees(W,RT,260,{x:994,y:80,w:950,h:680},10);
  {const inC=(x,y)=>W.cafe.concat(W.fields).some(q=>x>q.x-4&&x<q.x+q.w+4&&y>q.y-4&&y<q.y+q.h+4);W.trees=W.trees.filter(t=>!inC(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inC(o.x+2,o.y+2))}
  {const inRd=(x,y)=>W.rounds.some(R=>Math.hypot(x-R.x,y-R.y)<R.r+6);W.trees=W.trees.filter(t=>!inRd(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inRd(o.x+2,o.y+2))}
  if(W.airportR){const A=W.airportR,inA=(x,y)=>x>A.x-8&&x<A.x+A.w+8&&y>A.y-80&&y<A.y+A.h+8;W.trees=W.trees.filter(t=>!inA(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inA(o.x+2,o.y+2))}
  if(W.parks)for(const p of W.parks)addTrees(W,R,p.w*p.h>20000?46:18,Object.assign({inside:true},p),3);
  if(W.plazas){const inP=(x,y)=>W.plazas.some(q=>x>q.x-5&&x<q.x+q.w+5&&y>q.y-5&&y<q.y+q.h+5);W.trees=W.trees.filter(t=>!inP(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inP(o.x+2,o.y+2))}
  const L=[[[[60,60],[300,60],[300,280],[60,280]],2,34],[[[780,280],[780,500],[980,500],[980,280]],2,36],[[[300,500],[540,500],[540,740],[300,740]],3,36],
    [[[60,60],[980,60],[980,740],[60,740]],8,52,['bus',null,null,null,'bus']],[[[780,60],[980,60],[980,280],[780,280]],2,36],[[[60,500],[60,740],[300,740],[300,500]],3,36],
    [[[540,500],[540,740],[780,740],[780,500]],3,36],[[[780,500],[980,500],[980,740],[780,740]],2,34],[[[60,280],[60,500],[300,500],[300,280]],2,34]];
  W.spawn={x:130,y:507,h:0};
  {const[n,cnt,v,t]=L[3];spawnOnLoop(W,makeLoop(n),cnt,v,t)}
  for(const z of[{x:74,y:46,w:892,h:28},{x:74,y:726,w:892,h:28},{x:46,y:74,w:28,h:652},{x:966,y:74,w:28,h:652}])W.zones.push(Object.assign(z,{limit:60,name:'AVENIDA'}));
  W.zones.push({x:994,y:46,w:952,h:28,limit:80,name:'PISTA'},{x:1946,y:74,w:28,h:912,limit:80,name:'PISTA'},{x:966,y:758,w:28,h:228,limit:30,name:'CUESTA'},{x:1226,y:758,w:28,h:228,limit:30,name:'CUESTA'},{x:1254,y:1246,w:232,h:28,limit:25,name:'ESCUELA'});
  // obstáculos en la calle: obra con conos y carros varados (con intermitentes)
  W.roadObs=[];W.broken=[];
  const obra=(x,y,o)=>{const r=o==='h'?{x:x-10,y:y-5,w:20,h:10}:{x:x-5,y:y-10,w:10,h:20};W.obst.push(Object.assign({type:'obra'},r));W.works=W.works||[];W.works.push(r);
    W.roadObs.push({x,y,h:o==='h'?0:Math.PI/2,L:34,Wd:10,v:0,static:true});for(const[a,b]of o==='h'?[[-15,-3],[-15,3],[15,-3],[15,3]]:[[-3,-15],[3,-15],[-3,15],[3,15]])W.cones.push({x:x+a,y:y+b,vx:0,vy:0,hit:false})};
  obra(650,507,'h');obra(293,620+60,'v');obra(1767,1400,'v');
  const varado=(x,y,h,col,type)=>{const b={x,y,h,col,type,L:VEH[type].L,Wd:VEH[type].Wd,v:0,static:true,haz:true};W.broken.push(b);W.roadObs.push(b);for(const q of circles(b))W.circObs.push({x:q.x,y:q.y,r:q.r,type:'car'})};
  varado(773,170,Math.PI/2,'#8d99ae','sedan');varado(420,733,Math.PI,'#d4a373','pickup');varado(1953,880,Math.PI/2,'#5c677d','suv');varado(1420,1527,0,'#e9c46a','hatch');
  // huecos
  W.holes=[[180,67],[420,273],[293,400],[987,600],[660,747],[67,380],[787,450],[880,287],[547,170],[1373,993],[1953,1100],[1627,1267],[1507,1400],[1700,53]].map(([x,y])=>({x,y,r:3.5})).concat(W.gHoles||[]);
  // tráfico que circula libremente (también por la rotonda) y camiones de basura
  spawnNav(W,60,['garbage',null,null,null,null,null,null,null,null,null,null,null,'garbage',null,null,null,null,null,null,null,null,null,null,null,'bus',null,null,null,null,null,null,null,null,null,null,'garbage']);
  // peatones en las aceras
  W.walkers=[];for(let i=0;i<40;i++){const r=pick(W.sidewalks);if(r.w<30||r.h<30)continue;W.walkers.push({r,s:Math.random()*1000,sp:(4+Math.random()*4)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(CARCOLS)})}
  addDogs(W,8);
  if(W.townPlaza)for(let i=0;i<8;i++)W.walkers.push({r:W.townPlaza,s:Math.random()*1000,sp:(3+Math.random()*3)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(CARCOLS)});
  W.jay=[];
  W.dests=[{n:'LA ESCUELA',x:200,y:287},{n:'EL PARQUEO PÚBLICO',x:880,y:545},{n:'EL MERCADO',x:640,y:507},{n:'LA ESTACIÓN DEL TREN',x:293,y:590},{n:'EL HOSPITAL',x:973,y:390},{n:'LA ROTONDA (SALIDA SUR)',x:533,y:345},{n:'EL BANCO',x:420,y:273},{n:'LA TORRE PULZAR',x:660,y:287},{n:'LA IGLESIA DEL PUEBLO',x:1360,y:1007},{n:'LA TIENDA PULZAR',x:1600,y:1007},{n:'LA PULPERÍA',x:1830,y:1007},{n:'LA ESCUELA DEL PUEBLO',x:1330,y:1267},{n:'LA PLAZA DE FÚTBOL',x:1630,y:1513},{n:'LA GASOLINERA',x:1875,y:110},{n:'EL AEROPUERTO',x:1457,y:140}].concat((W.shops||[]).filter(b=>['SUPERMERCADO','FARMACIA','CINE','PANADERIA','SODA'].includes(b.label)).map(b=>{const sw=W.sidewalks.find(q=>inR(b.x+b.w/2,b.y+b.h/2,q));const cy=b.y+b.h/2,c1=sw&&sw.y-7,c2=sw&&sw.y+sw.h+7,top=sw&&(pavedW(W,b.x+b.w/2,c1)&&(!pavedW(W,b.x+b.w/2,c2)||cy-sw.y<sw.y+sw.h-cy));return{n:{SUPERMERCADO:'EL SUPERMERCADO',FARMACIA:'LA FARMACIA',CINE:'EL CINE',PANADERIA:'LA PANADERÍA',SODA:'LA SODA'}[b.label],x:b.x+b.w/2|0,y:sw?(top?sw.y-7:sw.y+sw.h+7):cy}}));
  return W}

// ---- utilidad: punto dentro de un polígono
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function pstopRules(W,P,dt){for(const s of W.pstops){const dx=P.x-s.x,dy=P.y-s.y,al=dx*s.ux+dy*s.uy,lat=Math.abs(dy*s.ux-dx*s.uy),hd=Math.cos(P.h)*s.ux+Math.sin(P.h)*s.uy;
  if(lat<s.w&&hd>.3&&al>-34&&al<=0&&P.gear===1){s.on=true;s.minV=Math.min(s.minV,Math.abs(P.v))}
  else if(s.on&&al>0){s.on=false;if(s.minV>1.2)fault(s.code,s.txt,'I',4);s.minV=99}
  else if(al<-40||lat>s.w+10){s.on=false;s.minV=99}}}
