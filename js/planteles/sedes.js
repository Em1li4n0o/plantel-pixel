'use strict';
// ===================== PLANTELES DE LAS SEDES (VERSIÓN PRELIMINAR) =====================
// Sedes donde se aplica la prueba práctica según la Dirección General de Educación Vial. La prueba es la misma en todo el país;
// mientras se consiguen medidas y fotos de cada sede, se usa un plantel estándar con el entorno de cada región.
const SEDES={heredia:{n:'HEREDIA',r:'valle'},alajuela:{n:'ALAJUELA',r:'valle'},perez:{n:'PÉREZ ZELEDÓN',r:'montana'},rioclaro:{n:'RÍO CLARO',r:'sur'},limon:{n:'LIMÓN',r:'caribe'},
  guapiles:{n:'GUÁPILES',r:'caribe'},sancarlos:{n:'SAN CARLOS',r:'norte'},nicoya:{n:'NICOYA',r:'seco'},puntarenas:{n:'PUNTARENAS',r:'costa'},liberia:{n:'LIBERIA',r:'seco'}};
const REGION={valle:{g:['#3f8f3f','#357d35','#4ea24a'],palms:0,trees:70},montana:{g:['#2f7a36','#276b2d','#3d8f42'],palms:0,trees:110},sur:{g:['#3a8a3a','#2f7a31','#4b9c45'],palms:14,trees:90},
  caribe:{g:['#2f8a3a','#287a31','#3fa04a'],palms:26,trees:90},norte:{g:['#3b8f38','#317e31','#4da746'],palms:6,trees:90},seco:{g:['#a3a34f','#8f9043','#b7b45f'],palms:4,trees:40},costa:{g:['#8fa35a','#7f9450','#a7b56a'],palms:22,trees:30}};
function buildSede(k){const D=SEDES[k],Rg=REGION[D.r];const W=buildPlantel();W.grass=Rg.g;W.sede=D.n;
  const R=rng(k.length*31+7);W.trees=W.trees.slice(0,Rg.trees);W.palms=[];for(let i=0,t=0;i<Rg.palms&&t<400;t++){const x=R()*640,y=R()*480;if(pavedW(W,x,y)||pavedW(W,x+8,y)||pavedW(W,x-8,y)||W.obst.some(o=>x>o.x-6&&x<o.x+o.w+6&&y>o.y-6&&y<o.y+o.h+6))continue;W.palms.push({x,y,r:R()*6});i++}
  if(D.r==='costa'||D.r==='caribe'){W.drawUnder=x=>{x.fillStyle=D.r==='costa'?'#e6d7a3':'#d8c991';x.fillRect(0,462,640,18);x.fillStyle='#3a86b8';x.fillRect(0,470,640,10)}}
  W.labels=(W.labels||[]).concat([{x:150,y:108,t:'PLANTEL DE '+D.n.normalize('NFD').replace(/[̀-ͯ]/g,''),col:'#fff'}]);
  if(D.r==='seco'){W.cows=[];for(let i=0;i<5;i++){const x=520+R()*100,y=360+R()*90;if(!pavedW(W,x,y))W.cows.push({x,y,ox:x,oy:y,h:R()*6,t:R()*5})}}
  return W}
// ===================== PLANTEL DE HEREDIA (prueba B1, antes de salir a calle) =====================
// Basado en tomas aéreas del plantel de la sede de Heredia (San Pedro de Barva). Franja larga con, de norte a sur:
// el carril de FILA (revisión de la fase 1), el carril de REVERSA entre conos, los espacios del PARQUEO EN REVERSA y el carril del ZIGZAG.
// Recorrido: fila -> al fondo, primera curva a la derecha, la "entradita" entre conos, segunda curva -> zigzag de regreso ->
// ALTO junto a la isla rayada -> vuelta a la derecha al carril de reversa -> reversa en línea recta -> parqueo en reversa ->
// dos carriles de salida, donde otro evaluador se sube para llevarlo a calle. Medidas aproximadas (unos 75 x 34 m).
const PH={w:240,h:110,q:14,a:38,z:93,zz:[180,158,136,114,92],alto:62,fwd:172,retro:66,bays:[100,114,128],bay:1,bayY:63,gate:[213,235],isla:[[24,80],[60,80],[60,52]]};
function buildPatioHeredia(W,o){const L=(x,y)=>[o.x+x,o.y+y];W.patioO=o;W.patioEsp=o.esp;
  const cone=(x,y,q={})=>W.cones.push(Object.assign({x,y,vx:0,vy:0,hit:false},q));
  const coneLine=(a,b,step,skip)=>{const Ln=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=Ln;t+=step){const x=a[0]+(b[0]-a[0])*t/Ln,y=a[1]+(b[1]-a[1])*t/Ln;if(skip&&skip(x-o.x,y-o.y))continue;cone(x,y)}};
  // carril de reversa: conos a los dos lados (con espacio frente al parqueo para poder maniobrar)
  const gap=x=>x>88&&x<146;
  coneLine(L(64,29),L(180,29),9,gap);coneLine(L(64,47),L(180,47),9,gap);
  // separación entre el parqueo y el carril del zigzag; conitos del zigzag
  coneLine(L(64,79),L(200,79),9);for(const x of PH.zz){const[cx,cy]=L(x,PH.z);cone(cx,cy,{zz:1})}
  // la "entradita" del fondo: un paso angosto entre conos
  for(const gx of PH.gate)for(const gy of[46,58])cone(...L(gx,gy));
  // parqueo en reversa: 3 espacios abiertos hacia el carril de reversa; el del centro es el de la prueba
  W.pslots=[];PH.bays.forEach((bx,i)=>{const[cx,cy]=L(bx,PH.bayY);const s={cx,cy,ang:Math.PI/2,hl:13,hw:7,target:i===PH.bay};W.opaved.push(s);W.oslots.push(s);W.pslots.push(s);
    if(i!==PH.bay)addParked(W,cx,cy,-Math.PI/2,CARCOLS[(i*5+1)%CARCOLS.length],i?'suv':'sedan')});
  W.pslot=W.pslots[PH.bay];{const q=W.pslot;for(const sd of[-1,1])for(const e of[-1,1])cone(q.cx+sd*(q.hw+1),q.cy+e*(q.hl-1.5))}
  // isla rayada junto al ALTO (no se puede pisar)
  W.isla=PH.isla.map(([x,y])=>L(x,y));
  // malla alrededor; en el lado oeste, la entrada (carril de fila) y la salida (dos carriles)
  const fen=(a,b)=>{W.fences.push([a[0],a[1],b[0],b[1]]);const Ln=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let k=0;k<=Ln;k+=3)W.circObs.push({x:a[0]+(b[0]-a[0])*k/Ln,y:a[1]+(b[1]-a[1])*k/Ln,r:1.5,type:'muro'})};
  fen(L(22,0),L(PH.w,0));fen(L(PH.w,0),L(PH.w,PH.h));fen(L(PH.w,PH.h),L(0,PH.h));fen(L(0,PH.h),L(0,52));
  // evaluadores: el de la fila (fase 1) y el que espera en los carriles de salida para ir a calle
  W.eval1={r:{seg:[[o.x+40,o.y+3],[o.x+40,o.y+3]]},s:0,sp:0,an:0,x:0,y:0,col:'#1d3557',staff:true};W.instr={r:{seg:[[W.patioEsp.x+16,W.patioEsp.y],[W.patioEsp.x+16,W.patioEsp.y]]},s:0,sp:0,an:0,x:0,y:0,col:'#1d3557',staff:true};W.walkers.push(W.eval1,W.instr);
  W.patioDraw=x=>{const P2=(t,px,py,col='#ecece4',rot=0)=>ptext(x,t,Math.round(o.x+px),Math.round(o.y+py),col,rot);
    const bar=(x0,y0,x1,y1,col,w=2)=>{x.fillStyle=col;const Ln=Math.hypot(x1-x0,y1-y0);for(let k=0;k<=Ln;k+=.5)x.fillRect(Math.round(o.x+x0+(x1-x0)*k/Ln),Math.round(o.y+y0+(y1-y0)*k/Ln),w,w)};
    // líneas de carriles
    for(let xx=8;xx<PH.w-30;xx+=10)bar(xx,26,xx+5,26,'#ecece4',1);bar(64,PH.a-1,64,PH.a+1,'#ecece4',1);
    x.strokeStyle='#ecece4';x.lineWidth=1;x.strokeRect(o.x+2.5,o.y+2.5,PH.w-5,PH.h-5);
    // isla rayada
    const I=W.isla;x.fillStyle='#ecece4';x.beginPath();x.moveTo(I[0][0],I[0][1]);for(const q of I)x.lineTo(q[0],q[1]);x.closePath();x.save();x.clip();for(let k=-40;k<60;k+=5){x.fillRect(Math.round(I[0][0]+k),Math.round(I[2][1]),2,40)}x.restore();x.strokeStyle='#ecece4';x.stroke();
    // ALTO del zigzag, líneas de la reversa
    bar(PH.alto,82,PH.alto,104,'#ecece4');P2('ALTO',PH.alto-12,90,'#ecece4',3);
    bar(PH.fwd,30,PH.fwd,46,'#ecece4');bar(PH.fwd+3,30,PH.fwd+3,46,'#ecece4');bar(PH.retro,30,PH.retro,46,'#f2c230');bar(PH.retro+3,30,PH.retro+3,46,'#f2c230');
    P2('REVERSA',110,32,'#ffd23f');P2('ZIGZAG',140,99,'#ffd23f');P2('FILA',90,8,'#ffd23f');P2('ENTRADITA',196,64,'#ffd23f',1);P2('PARQUEO',100,80,'#ffd23f');
    P2('1',PH.bays[0]-1,72);P2('2',PH.bays[1]-1,72,'#ffd23f');P2('3',PH.bays[2]-1,72);P2('PLANTEL DE HEREDIA - B1',70,PH.h+4,'#ffffff');
    // flechas de sentido
    for(const[ax,ay,dx]of[[150,14,1],[200,93,-1],[30,93,-1]]){x.fillStyle='#ecece4';for(let k=0;k<6;k++)x.fillRect(Math.round(o.x+ax+dx*k),Math.round(o.y+ay),1,1);x.fillRect(Math.round(o.x+ax+dx*4),Math.round(o.y+ay-1),1,3)}
    // dos carriles de salida: línea punteada y ESPERE
    const E=W.patioEsp;bar(E.x-o.x-11,E.y-o.y,E.x-o.x+11,E.y-o.y,'#ecece4');P2('ESPERE',E.x-o.x-12,E.y-o.y-9,'#ecece4');P2('SALIDA',E.x-o.x-30,E.y-o.y+16,'#ffd23f')}}
// tareas del plantel; después siguen las del recorrido en calle
function patioTasks(){const W=S.W,o=W.patioO,G=(x,y)=>({x:o.x+x,y:o.y+y}),near=(x,y,r)=>Math.hypot(S.P.x-o.x-x,S.P.y-o.y-y)<r,lx=()=>S.P.x-o.x,ly=()=>S.P.y-o.y;
  const dlg=(t,lines,key,cond)=>{if(!S.dlg&&!t.done1&&still(key,cond,1.2)){S.dlg={lines,i:0,t:0};if(t.onDlg)t.onDlg()}if(S.dlg&&!S.dlg.auto){S.dlg.t+=S.dt;if(S.dlg.t>dlgDur(S.dlg,3.2)){S.dlg.i++;S.dlg.t=0}if(S.dlg.i>=S.dlg.lines.length){S.dlg=null;t.done1=true}}return!!t.done1};
  return[
  {txt:'PLANTEL DE HEREDIA (B1): póngase el cinturón [C], entre por el carril de la FILA y deténgase junto al evaluador para la REVISIÓN (fase 1).',tgt:G(40,PH.q),
   check(){return dlg(this,PH_F1,'phF1',near(40,PH.q,14))},ok:'¡Revisión aprobada!'},
  {txt:'Avance por la FILA hasta el fondo del plantel.',tgt:G(196,PH.q),check(){return near(196,PH.q,16)}},
  {txt:'PRIMERA CURVA a la DERECHA y pase la ENTRADITA, el paso angosto entre los conos, sin tocarlos.',tgt:G(224,52),check(){return near(224,52,12)}},
  {txt:'SEGUNDA CURVA a la DERECHA hacia el carril del ZIGZAG.',tgt:G(196,PH.z),check(){return near(196,PH.z,16)}},
  {txt:'ZIGZAG: pase los 5 conitos alternando el lado (uno por la derecha, el siguiente por la izquierda) sin tocarlos.',tgt:G(80,PH.z),start(){this.sd=[];this.k=0},
   check(){const x=lx(),y=ly();while(this.k<PH.zz.length&&x<PH.zz[this.k]){this.sd.push(Math.sign(y-PH.z)||1);this.k++}
     if(this.k>=PH.zz.length&&x<PH.zz[PH.zz.length-1]-10){let ok=true;for(let i=1;i<this.sd.length;i++)if(this.sd[i]===this.sd[i-1])ok=false;if(!ok)fault('zz','No hizo el zigzag completo (debe alternar el lado de cada cono)','II');return true}return false},ok:'¡Zigzag completado!'},
  {txt:'ALTO: deténgase por completo con el frente en la línea de ALTO, junto a la isla rayada.',tgt:G(PH.alto+8,PH.z),
   check(){const x=lx(),y=ly();if(still('phAlto',x>PH.alto+1&&x<PH.alto+18&&Math.abs(y-PH.z)<13,1))return true;if(x<PH.alto-6){fault('phAltoX','No se detuvo en la línea de ALTO','I');return true}return false},ok:'¡ALTO correcto!'},
  {txt:'Doble a la DERECHA alrededor de la isla rayada (sin pisarla) y entre al carril de REVERSA, entre los conos.',tgt:G(70,PH.a),check(){if(!this.f&&inPoly(S.P.x,S.P.y,W.isla)){this.f=1;fault('isla','Pasar por encima de la zona rayada','III')}return near(70,PH.a,12)}},
  {txt:'REVERSA: avance por el carril entre los conos hasta la doble línea blanca y deténgase.',tgt:G(PH.fwd-8,PH.a),ok:'¡Reversa completada!',
   check(){const P=S.P,x=lx(),y=ly();
     if(!this.ph){if(still('phFwd',x>PH.fwd-16&&x<PH.fwd+2&&Math.abs(y-PH.a)<9,.6)){this.ph=1;this.txt='REVERSA: ponga la reversa (toque S dos veces) y retroceda en línea recta, sin detenerse, hasta la doble línea AMARILLA.';this.tgt=G(PH.retro-2,PH.a);toast('AHORA EN REVERSA','Mire hacia atrás y retroceda recto, sin detenerse','info')}return false}
     if(P.gear===-1){if(P.v<-1)this.mv=true;if(Math.abs(y-PH.a)>9&&!this.lat){this.lat=1;fault('phRecto','No retrocedió en línea recta','III')}
       if(this.mv&&Math.abs(P.v)<.3){this.st=(this.st||0)+S.dt;if(this.st>1&&!this.fl){this.fl=1;fault('phRstop','Detenerse durante la conducción en reversa','IV')}}else this.st=0}
     if(x<PH.retro+4){if(!this.mv)fault('phNoRet','No realizó la conducción en reversa','III');return true}return false}},
  {txt:'PARQUEO EN REVERSA: estaciónese DE RETROCESO en el espacio 2 (el amarillo, entre los dos carros), con el frente hacia el carril. Cada cono que toque le quita puntos.',tgt:{x:0,y:0},start(){this.tgt={x:W.pslot.cx,y:W.pslot.cy}},ok:'¡Parqueo en reversa correcto!',
   check(){const P=S.P,q=W.pslot,dx=P.x-q.cx,dy=P.y-q.cy,al=dy,lt=-dx,inB=Math.abs(al)<5&&Math.abs(lt)<2.2,hd=Math.cos(P.h+Math.PI/2);
     if(inB&&hd<-.9&&Math.abs(P.v)<.5&&!this.warn){this.warn=1;toast('DE FRENTE NO','Este parqueo se hace en REVERSA: salga y entre retrocediendo','bad')}return still('phPark',inB&&hd>.92,1.2)}},
  {txt:'SALIDA: salga con cuidado del espacio (sin bajar conos), vaya a los DOS CARRILES de salida y deténgase en la línea ESPERE: ahí se sube el evaluador que lo lleva a calle.',tgt:{x:0,y:0},start(){this.tgt={x:W.patioEsp.x,y:W.patioEsp.y+6}},
   onDlg(){W.walkers=W.walkers.filter(w=>w!==W.instr)},
   check(){const E=W.patioEsp;return dlg(this,PH_DLG,'phEsp',Math.abs(S.P.x-E.x)<13&&S.P.y>E.y-2&&S.P.y<E.y+22)},ok:'¡Plantel terminado! Ahora a la calle'}]}
const PH_F1=[['EVALUADOR','Buenos días. Vamos con la revisión del vehículo: fase uno.'],['EVALUADOR','Encienda las luces, las direccionales y las escobillas... ahora la reversa y el freno.'],['EVALUADOR','Todo en orden. Avance hasta el fondo, haga los ejercicios y no toque los conos. ¡Suerte!']];
const PH_DLG=[['EVALUADOR','Muy bien, terminó la parte del plantel. Acomódese aquí.'],['EVALUADOR DE CALLE','(se sube al carro) Buenos días. Ahora vamos a salir a calle. Con calma.'],['EVALUADOR DE CALLE','Al llegar a la calle La Amada, doble a la DERECHA. Recuerde el ALTO antes de la Ruta 126.']];
