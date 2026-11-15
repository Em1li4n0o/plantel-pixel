'use strict';
// ===================== ALAJUELA: AEROPUERTO, MODO TAXI Y LA GUÁCIMA =====================
let MODE_NOW=null;
function buildAlajuela(){HW=14;const W=newWorld('alajuela',3000,2000);W.limit=40;W.taxi=true;
  const h=(c,a,b)=>addRoad(W,'h',c,a,b),v=(c,a,b)=>addRoad(W,'v',c,a,b);
  h(440,900,2100);h(700,600,2700);h(950,600,2700);h(1200,900,2700);h(1500,900,2700);
  v(600,700,950);v(900,440,1500);v(1300,440,1500);v(1700,440,1500);v(2100,440,1500);v(2500,700,1500);
  W.inter=cityGraph(W);for(const[x,y]of W.inter)addNode(W,x,y);
  const xb=[900,1300,1700,2100,2500,2700],yb=[440,700,950,1200,1500],R=rng(44),B=b=>{W.obst.push(b);W.blds.push(b);return b};W.parks=[];W.plazas=[];W.labels=[];W.stalls=[];W.birds=[];W.flags=[];
  // cuadras: parque de los mangos, catedral de Alajuela, hoteles y casas
  for(let i=0;i<xb.length-1;i++)for(let j=0;j<yb.length-1;j++){const x1=xb[i]+HW,x2=xb[i+1]-HW,y1=yb[j]+HW,y2=yb[j+1]-HW;if(j===0&&(i<0))continue;if(yb[j]===440&&xb[i]>=2100)continue;
    if(xb[i+1]-xb[i]<100)continue;W.sidewalks.push({x:x1,y:y1,w:x2-x1,h:y2-y1});const ix1=x1+7,ix2=x2-7,iy1=y1+7,iy2=y2-7,mx=(ix1+ix2)/2|0,my=(iy1+iy2)/2|0;
    if(j===0)continue;// frente al aeropuerto: parqueo
    if(i===1&&j===1){W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});W.plazas.push({x:mx-5,y:iy1,w:10,h:iy2-iy1},{x:ix1,y:my-5,w:ix2-ix1,h:10},{x:mx-16,y:my-16,w:32,h:32});W.labels.push({x:ix1+3,y:iy1+3,t:'PARQUE DE LOS MANGOS'});
      addLM(W,[PO(mx,my,11,0,2,'#d8d0c0'),...pRing(mx,my,9,8,2,10,'#f0ead8'),PO(mx,my,11,10,12,'#e9e2d0'),PD(mx,my,8,12,17,'#e9e2d0')]);for(let k=0;k<14;k++){const bx=mx-60+R()*120,by=my-50+R()*100;W.birds.push({hx:bx,hy:by,x:bx,y:by,z:0,fly:0,t:R()*9})}continue}
    if(i===1&&j===2){W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});addLM(W,[PB(mx-60,my-40,120,80,0,22,'#f1eee4',{top:'#9aa2a9',win:'classic'}),PB(mx-70,my-30,12,60,0,28,'#f7f5ee',{win:'classic'}),...pCols(mx-73,my-24,mx-73,my+24,6,20,'#fbfaf5'),
      PO(mx+10,my,18,22,28,'#e6e3da'),PD(mx+10,my,18,28,46,'#b5462e'),PO(mx+10,my,3,46,50,'#f7f5ee'),PB(mx+9.4,my-.6,1.2,1.2,50,55,'#d4af37',{s:'stat'})],{label:'CATEDRAL DE ALAJUELA',ly:my+28});continue}
    if((i+j)%3===0){B({x:ix1+10,y:iy1+10,w:Math.min(120,ix2-ix1-20),h:Math.min(80,iy2-iy1-20),type:'bld',col:pick(['#f4f1e8','#e9c46a','#a8dadc']),roof:'#c9c6bd',H:30+R()*20|0,win:'grid',shop:'#1d3557',label:'HOTEL'});continue}
    fillBlock(W,R,ix1,iy1,ix2,iy2)}
  // aeropuerto: parqueo, terminal, torre de control, malla perimetral
  W.paved.push({x:950,y:460,w:300,h:90,tag:'lot'},{x:1750,y:460,w:300,h:90,tag:'lot'});
  W.tower=null;addLM(W,[PB(1150,330,700,70,0,20,'#cfe3f2',{win:'glass',top:'#f4f6f8'}),PB(1140,322,720,86,20,23,'#f7f9fb',{top:'#ffffff'}),...pCols(1160,407,1840,407,18,16,'#e3e6ea'),PB(1150,405,700,4,16,17.5,'#f7f9fb')],{label:'AEROPUERTO INTERNACIONAL JUAN SANTAMARIA',ly:360});
  for(let k=0;k<5;k++)B({x:1230+k*130,y:300,w:8,h:30,type:'bld',col:'#c9ced3',roof:'#b0b8bf',H:9});
  addLM(W,[PO(2000,300,5,0,52,'#ececec'),PO(2000,300,9,52,60,'#5d7f99',{win:'glass'}),PO(2000,300,10,60,62,'#dddddd')],{label:''});
  for(const[a,b]of[[200,1140],[1860,2900]]){W.obst.push({x:a,y:398,w:b-a,h:3,type:'fence'});W.fences.push([a,399,b,399])}
  // La Guácima: circuito cerrado con entrada a boxes
  const TL=smoothLine([[150,1110],[450,1080],[570,1180],[520,1320],[610,1450],[560,1700],[380,1800],[200,1730],[110,1560],[230,1420],[120,1260],[150,1110],[450,1080]],10).slice(0,-12);
  W.track=TL;const tp=addPath(W,TL.concat([TL[0]]));tp.hw=16;tp.noCenter=true;const pit=addPath(W,smoothLine([[600,960],[575,1000],[520,1050],[470,1080]],8));pit.noCenter=true;
  W.zones.push({x:60,y:1040,w:600,h:820,limit:250,name:'PISTA',noText:true});
  W.labels.push({x:250,y:1000,t:'AUTODROMO LA GUACIMA',col:'#fff'},{x:1000,y:470,t:'PARQUEO',col:'#fff'},{x:1800,y:470,t:'PARQUEO',col:'#fff'},{x:1440,y:418,t:'SALIDAS',col:'#ffd23f'},{x:1050,y:1560,t:'ALAJUELA',col:'#fff'});
  for(let k=0;k<3;k++)B({x:640+k*0,y:1250+k*120,w:14,h:90,type:'bld',col:'#c9ced3',roof:'#e63946',H:10,label:''});
  W.drawUnder=x=>{// pista de aterrizaje, calle de rodaje y plataforma
    x.fillStyle='#4f5b47';x.fillRect(200,100,2700,300);x.fillStyle='#3b3d42';x.fillRect(250,120,2600,60);x.fillStyle='#5b5e64';x.fillRect(300,220,2450,20);for(const cx of[700,1200,1700,2200])x.fillRect(cx,180,20,40);
    x.fillStyle='#8a8d93';x.fillRect(1100,240,800,90);x.fillStyle='#fff';for(let k=300;k<2800;k+=60)x.fillRect(k,149,30,2);for(const tx of[262,2818])for(let k=0;k<8;k++)x.fillRect(tx,124+k*7,22,3);ptext(x,'07',300,140,'#fff',0,2);ptext(x,'25',2780,140,'#fff',0,2);
    x.fillStyle='#ffd23f';for(let k=1100;k<1900;k+=130)x.fillRect(k+20,240,2,90)};
  W.drawExtra=x=>{x.strokeStyle='#e63946';x.lineWidth=2;x.setLineDash([3,3]);for(const d of[-16,16]){const q=offLine(TL.concat([TL[0]]),d);x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const p of q)x.lineTo(p[0],p[1]);x.stroke()}x.setLineDash([]);
    const a=offLine(TL,-16)[0],b=offLine(TL,16)[0];for(let k=0;k<8;k++){x.fillStyle=k%2?'#000':'#fff';x.fillRect(a[0]+(b[0]-a[0])*k/8-1,a[1]+(b[1]-a[1])*k/8-1,4,4)}ptext(x,'META',TL[0][0]-8,TL[0][1]-24,'#fff')};
  for(const p of W.parks)addTrees(W,R,30,Object.assign({inside:true},p),3);
  {const inP=(x,y)=>W.plazas.some(q=>x>q.x-5&&x<q.x+q.w+5&&y>q.y-5&&y<q.y+q.h+5);W.trees=W.trees.filter(t=>!inP(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inP(o.x+2,o.y+2))}
  addTrees(W,R,260,{x:0,y:420,w:3000,h:1580},12);
  W.walkers=[];for(let i=0;i<40;i++){const r=pick(W.sidewalks);if(r.w<30||r.h<30)continue;W.walkers.push({r,s:Math.random()*1000,sp:(4+Math.random()*4)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(CARCOLS)})}addDogs(W,5);
  W.spawn={x:1500,y:433,h:Math.PI};spawnNav(W,36,['bus',null,null,'taxi',null,'moto',null,null,'taxi',null,'bici',null,'bus',null,null,'moto']);
  spawnOnLoop(W,makePathLoop(TL,5),4,78,['hyper','tuner','muscle','rally']);
  // aviones: uno despega hacia el este, otro aterriza hacia el oeste; otros esperan en la plataforma
  W.jets=[{kind:'off',T:46,ph:0,col:'#1d4ed8'},{kind:'land',T:46,ph:23,col:'#c1121f'},{st:1,x:1300,y:285,h:Math.PI/2,z:0,col:'#2a9d8f'},{st:1,x:1560,y:285,h:Math.PI/2,z:0,col:'#f4a261'},{st:1,x:1820,y:285,h:Math.PI/2,z:0,col:'#6a4c93'}];
  W.pickups=[{n:'HOTEL LOS MANGOS',x:1100,y:707},{n:'EL CENTRO DE ALAJUELA',x:1500,y:957},{n:'HOTEL VOLCAN POAS',x:2300,y:957},{n:'BARRIO SAN JOSE',x:2600,y:1207},{n:'LA CATEDRAL',x:1500,y:1207},{n:'LA GUACIMA',x:650,y:707},{n:'BARRIO LA TRINIDAD',x:1900,y:1507},{n:'HOTEL DEL PARQUE',x:2300,y:707}];
  W.airport={n:'EL AEROPUERTO (SALIDAS)',x:1500,y:433};W.dests=[W.airport];W.jay=null;return W}
function jetPos(J,t){if(J.st)return J;const ph=((t+J.ph)%J.T+J.T)%J.T;let x,z;const rw=J.rw;if(rw){if(ph>22)return null;const k=ph/22;if(J.kind==='off'){x=rw.x0+rw.L*1.5*k*k;const xa=rw.x0+rw.L*.55;return{x,y:rw.y,z:x>xa?(x-xa)*.12:0,h:0,col:J.col}}x=rw.x0+rw.L*1.6-rw.L*1.5*(1-(1-k)*(1-k));const xb=rw.x0+rw.L*.8;return{x,y:rw.y,z:x>xb?(x-xb)*.12:0,h:Math.PI,col:J.col}}
  if(J.kind==='off'){if(ph>22)return null;const k=ph/22;x=300+2900*k*k;z=x>1700?(x-1700)*.09:0;return{x,y:150,z,h:0,col:J.col}}
  if(ph>22)return null;const k=ph/22;x=3300-2600*(1-(1-k)*(1-k));z=Math.max(0,(2700-x)*-.09+(x>2700?(x-2700)*.09:0));return{x,y:150,z:x>2700?(x-2700)*.1:0,h:Math.PI,col:J.col}}
function jet2D(g,sx,sy,h,z,col){g.save();g.translate(Math.round(sx+z*.4),Math.round(sy+z*.4));g.rotate(h);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(-20,-2,40,5);g.fillRect(-4,-18,8,36);g.restore();
  g.save();g.translate(Math.round(sx),Math.round(sy));g.rotate(h);g.fillStyle='#f4f6f8';g.fillRect(-20,-2,40,5);g.beginPath();g.moveTo(-3,-18);g.lineTo(5,-18);g.lineTo(8,0);g.lineTo(5,18);g.lineTo(-3,18);g.lineTo(0,0);g.fill();
  g.fillRect(-19,-7,5,14);g.fillStyle=col;g.fillRect(-20,-1,40,1);g.fillRect(-19,-1,4,3);g.fillStyle='#2b3a55';g.fillRect(17,-1,2,3);g.restore()}
function jet3D(ctx,C,V,j){const c=Math.cos(j.h),s=Math.sin(j.h),pt=(a,b)=>[j.x+c*a-s*b,j.y+s*a+c*b],R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],z=j.z;
  if(z<1)poly(ctx,proj(C,V,R2(20,-20,-2.6,2.6).map(p=>[p[0],p[1],.05])),'rgba(0,0,0,.3)');
  for(const sd of[-1,1])box(ctx,C,V,R2(4,-2,sd*6,sd*9),z+1.2,z+3.4,'#9aa0a6');
  box(ctx,C,V,R2(6,-6,-18,18),z+3,z+3.8,'#e6e9ec');box(ctx,C,V,R2(-14,-19,-7,7),z+6,z+6.6,'#e6e9ec');box(ctx,C,V,R2(-14,-20,-.5,.5),z+6.5,z+14,j.col);
  box(ctx,C,V,R2(20,-20,-2.6,2.6),z+2,z+7,'#f4f6f8',{win:'grid',near:true});box(ctx,C,V,R2(20.5,18,-1.6,1.6),z+4.5,z+6.2,'#2b3a55');box(ctx,C,V,R2(14,-16,-2.65,2.65),z+3.6,z+4.2,j.col)}
function taxiNew(){const W=S.W,P=S.P;S.tx=S.tx||{n:0};S.tx.n++;const fromAir=S.tx.n%3===0;let from,to;
  if(fromAir){from=W.airport;to=pick(W.pickups)}else{const c=W.pickups.filter(q=>Math.hypot(q.x-P.x,q.y-P.y)>250);from=pick(c.length?c:W.pickups);to=W.airport}
  Object.assign(S.tx,{ph:'pick',from,to,hold:0});S.dest={n:from.n,x:from.x,y:from.y};S.destT=S.t;
  const sd=from.y<500?-14:14;S.tx.ped={r:{seg:[[from.x,from.y-(from===W.airport?18:-(sd>0?0:0))-sd*0+(from===W.airport?0:sd*.0)],[from.x,from.y]]},s:0,sp:0,an:0,x:from.x,y:from.y,col:pick(CARCOLS),pax:true};
  const py=from===W.airport?from.y-20:from.y+ (from.y%2?13:13);S.tx.ped.r.seg=[[from.x,py],[from.x,py]];W.walkers.push(S.tx.ped)}
function taxiStep(W,P,dt){const T=S.tx;if(!T)return;const d=S.dest;if(Math.hypot(P.x-d.x,P.y-d.y)<18&&Math.abs(P.v)<1){T.hold+=dt;if(T.hold<.7)return;T.hold=0;
    if(T.ph==='pick'){T.ph='go';T.t0=S.t;T.inf0=S.infr;W.walkers=W.walkers.filter(p=>p!==T.ped);S.dest={n:T.to.n,x:T.to.x,y:T.to.y};T.dist=Math.hypot(T.to.x-T.from.x,T.to.y-T.from.y);sfx.good();
      const L=T.to===W.airport?pick(['¡Buenas! Al aeropuerto, por favor. Mi vuelo sale en dos horas.','Pura vida. Lléveme a salidas, por favor, que voy para Guanacaste.','Buenas tardes. Al aeropuerto, pero con calma, por favor.']):pick(['¡Qué vuelo tan largo! Lléveme a '+T.to.n.toLowerCase()+', por favor.','Hola, bienvenido... digo, ¡gracias! Voy para '+T.to.n.toLowerCase()+'.','¡Por fin en Costa Rica! A '+T.to.n.toLowerCase()+', por favor.']);
      S.dlg={lines:[['PASAJERO',L]],i:0,t:0,auto:1};say(L)}
    else{const clean_=S.infr===T.inf0,mins=(S.t-T.t0)/60,fare=Math.round((700+T.dist*1.4)/50)*50,tip=clean_?Math.round(fare*.2/50)*50:0;S.pts+=fare+tip;S.deliv++;S.streak=clean_?S.streak+1:0;
      toast('VIAJE COMPLETADO','₡'+fare+(tip?' + propina ₡'+tip:' · sin propina (cometió infracciones)'),'good');sfx.good();const L=clean_?pick(['¡Excelente manejo, muchas gracias!','Qué viaje tan tranquilo. ¡Pura vida!','Gracias, maneja muy bien. Ahí le dejo algo extra.']):pick(['Bueno... llegamos. Maneje con más cuidado.','Casi me da algo. Gracias igual.']);S.dlg={lines:[['PASAJERO',L]],i:0,t:0,auto:1};say(L);taxiNew()}}}
function lapStep(W,P){const TL=W.track;if(!TL)return;let bi=-1,bd=24;for(let i=0;i<TL.length;i+=2){const d=Math.hypot(TL[i][0]-P.x,TL[i][1]-P.y);if(d<bd){bd=d;bi=i}}if(bi<0){S.lapOn=false;return}const n=TL.length,pr=S.lapI==null?bi:S.lapI;S.lapI=bi;
  if(bi>n*.4&&bi<n*.6)S.lapHalf=true;if(pr>n*.85&&bi<n*.15){if(S.lapStart!=null&&S.lapHalf){const lt=S.t-S.lapStart,best=store.get('pp_guacima',0);const nb=!best||lt<best;if(nb)store.set('pp_guacima',lt);toast(nb?'¡RÉCORD EN LA GUÁCIMA!':'VUELTA COMPLETADA',fmtLap(lt)+(best&&!nb?' · récord '+fmtLap(best):''),'good');sfx.good()}
    else toast('LA GUÁCIMA','¡Arrancó el cronómetro! Dé una vuelta completa','info');S.lapStart=S.t;S.lapHalf=false}}
const fmtLap=t=>`${t/60|0}:${String((t%60).toFixed(1)).padStart(4,'0')}`;
