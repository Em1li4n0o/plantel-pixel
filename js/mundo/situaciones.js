'use strict';
// ===================== SITUACIONES DE RIESGO =====================
// Puntos marcados en el mapa. Al llegar, el tiempo se pone lento, aparece la situación y el jugador elige qué hacer.
// Si elige bien, el carro se controla (y en la llanta reventada hay que orillarse, poner el triángulo y cambiarla);
// si elige mal, ocurre el accidente y aparece GAME OVER con la explicación. Consejos basados en las recomendaciones de seguridad vial.
const SCEN={
  llanta:{n:'LLANTA REVENTADA',col:'#e63946',intro:'¡PUM! Se reventó la llanta delantera izquierda y el carro se jala hacia un lado.',
    opts:[['Sujetar firme el volante con las dos manos, soltar el acelerador sin frenar de golpe y orillarse poco a poco',1,'Correcto: con el volante firme y sin frenazos el carro sigue recto mientras pierde velocidad. Ahora toca orillarse y cambiar la llanta.'],
      ['Frenar a fondo de inmediato',0,'Al frenar de golpe con una llanta reventada, el peso se va hacia esa rueda y el carro se cruza: terminó fuera de la vía. Primero se sujeta el volante y se suelta el acelerador; el freno se usa suave, cuando el carro ya está controlado.'],
      ['Dar un volantazo hacia el otro lado para enderezar',0,'Un volantazo brusco con una llanta reventada hace que el carro gire sin control. Se corrige suave, con las dos manos firmes en el volante.']]},
  derrape:{n:'DERRAPE EN CURVA MOJADA',col:'#ff9f1c',intro:'La calle está mojada y la parte trasera del carro empieza a irse de lado.',
    opts:[['Soltar el acelerador, no frenar y girar el volante suavemente hacia donde quiere ir (mirando hacia allá)',1,'Correcto: al soltar el acelerador y "contravolantear" suave hacia donde quiere ir, las llantas recuperan agarre.'],
      ['Frenar fuerte',0,'Frenar en pleno derrape bloquea las llantas y el carro sigue de lado sin poder girar: se salió de la vía.'],
      ['Acelerar para salir rápido del derrape',0,'Acelerar hace que las llantas patinen más: el carro dio un trompo.']]},
  hidro:{n:'HIDROPLANEO',col:'#2a9df4',intro:'Pasó sobre un charco grande: el volante se siente liviano porque las llantas flotan sobre el agua.',
    opts:[['Soltar el acelerador suavemente y mantener el volante recto, sin frenar, hasta recuperar el agarre',1,'Correcto: sin frenazos ni volantazos, las llantas vuelven a tocar el asfalto en pocos segundos. Con lluvia, baje la velocidad.'],
      ['Frenar de golpe',0,'Frenar mientras las llantas flotan las bloquea y el carro se va de lado al salir del agua: chocó contra el borde.'],
      ['Girar el volante para salirse del charco',0,'Con las llantas sin agarre el volante no responde; cuando vuelven a tocar el suelo, el giro acumulado lo lanza fuera de la vía.']]},
  varado:{n:'CARRO VARADO ADELANTE',col:'#ffd23f',intro:'Adelante, en su carril, hay un carro varado con las intermitentes encendidas.',
    opts:[['Bajar la velocidad, mirar el espejo, poner la direccional y pasarlo con buena distancia solo cuando sea seguro',1,'Correcto: reducir, revisar espejos y señalizar evita sorpresas. Si no hay espacio, se espera detrás.'],
      ['Cambiarse de carril de golpe sin mirar',0,'No miró el espejo ni señalizó: otro carro venía por el carril de al lado y lo chocó.'],
      ['Seguir igual y pitarle para que se quite',0,'Un carro varado no se puede mover: no frenó a tiempo y chocó por detrás.']]},
  nino:{n:'NIÑO EN LA VÍA',col:'#c77dff',intro:'Una bola sale rodando a la calle... y detrás viene un niño corriendo.',
    opts:[['Frenar fuerte en línea recta hasta detenerse',1,'Correcto: frenar en línea recta es lo más seguro. Cuando vea una bola en la calle, espere que detrás venga un niño.'],
      ['Esquivarlo con un volantazo a toda velocidad',0,'El volantazo lo sacó de la vía y chocó contra un poste. Con un obstáculo repentino, primero se frena en línea recta.'],
      ['Pitar y seguir',0,'El niño no reacciona a tiempo al pito: no logró detenerse. Cerca de escuelas, parques y zonas residenciales hay que ir despacio.']]},
  frenos:{n:'SIN FRENOS',l:'FRENOS',col:'#ff006e',intro:'Pisa el freno y el pedal se va hasta el fondo: los frenos no responden.',
    opts:[['Bombear el pedal varias veces, bajar a una marcha más baja y usar el freno de mano poco a poco mientras se orilla',1,'Correcto: bombear puede recuperar presión, la marcha baja hace que el motor frene el carro y el freno de mano, usado de a poco, termina de detenerlo. Después: intermitentes y llamar a la grúa.'],
      ['Apagar el motor con la llave',0,'Con el motor apagado se pierde la dirección asistida y el volante puede trabarse: no pudo girar y chocó. Nunca apague el carro en movimiento.'],
      ['Jalar el freno de mano de un solo golpe',0,'El freno de mano de golpe bloquea las ruedas traseras y el carro dio un trompo. Se usa poco a poco, con el botón apretado.']]},
  acelerador:{n:'ACELERADOR TRABADO',l:'ACELERADOR',col:'#00f5d4',intro:'Soltó el pedal, pero el carro sigue acelerando solo: el acelerador se trabó.',
    opts:[['Poner el carro en neutro, frenar firme y orillarse; ya detenido, apagar el motor',1,'Correcto: en neutro el motor ya no empuja las ruedas aunque siga acelerado, y los frenos detienen el carro. El motor se apaga solo cuando ya está detenido.'],
      ['Agacharse a destrabar el pedal con la mano',0,'Al quitar la vista del camino no vio lo que venía adelante y chocó. Nunca deje de mirar al frente: use el neutro y el freno.'],
      ['Apagar el motor con la llave en plena marcha',0,'Con el motor apagado se pierde la ayuda del volante y del freno, y la llave puede trabar el volante: perdió el control. Primero neutro y freno.']]},
  animal:{n:'ANIMAL EN LA VÍA',l:'ANIMAL',col:'#c0703a',intro:'Una vaca se salió de una finca y está cruzando la calle frente a usted.',
    opts:[['Soltar el acelerador, frenar en línea recta sin volantazos y esperar a que el animal termine de pasar',1,'Correcto: frenar en línea recta mantiene el control. Los animales se mueven de forma impredecible: espere a que se alejen y pase despacio.'],
      ['Pitar y pasar rápido por un lado',0,'La vaca se asustó con el pito y se movió justo hacia el carro: la golpeó. Nunca pase rápido junto a un animal.'],
      ['Dar un volantazo para esquivarla',0,'El volantazo a esa velocidad lo sacó de la vía. Primero se frena en línea recta.']]},
  ambulancia:{n:'AMBULANCIA DETRÁS',l:'AMBULANCIA',col:'#ffffff',intro:'Se oye una sirena: una ambulancia con las luces encendidas viene detrás de usted.',
    opts:[['Poner la direccional derecha, orillarse a la derecha con suavidad y detenerse hasta que pase',1,'Correcto: los vehículos de emergencia en servicio tienen prioridad. Orillarse con calma y señalizando le abre el paso sin causar otro accidente. Después no la siga de cerca.'],
      ['Frenar en seco en medio del carril',0,'Al frenar de golpe, la ambulancia no tuvo espacio y lo chocó por detrás. Hay que orillarse de forma suave y predecible.'],
      ['Acelerar para que no lo alcance',0,'Por acelerar perdió el control en la siguiente esquina. Con una emergencia no se compite: se le cede el paso.']]},
  encandilado:{n:'LUCES ALTAS DE FRENTE',l:'LUCES ALTAS',night:1,col:'#e9ff70',intro:'Es de noche y un carro viene de frente con las luces altas: el brillo lo encandila.',
    opts:[['Bajar la velocidad y mirar hacia la orilla derecha de la calle, sin responder con las altas, hasta que pase',1,'Correcto: mirar la orilla derecha le permite seguir en su carril sin ver directo a las luces. Use las altas solo cuando no viene nadie de frente.'],
      ['Ponerle también las luces altas para que las baje',0,'Ahora los dos iban encandilados: ninguno vio al otro y chocaron de frente. Nunca responda con las altas.'],
      ['Seguir igual, mirando directo a las luces',0,'Encandilado no vio el borde de la calle y se salió de la vía. Baje la velocidad y mire hacia la orilla derecha.']]},
  neblina:{n:'NEBLINA DENSA',l:'NEBLINA',col:'#90a4ae',intro:'De pronto entra una neblina muy densa y casi no se ve lo que hay adelante.',
    opts:[['Bajar la velocidad, encender las luces bajas (y las antiniebla), dejar más distancia y no detenerse en medio de la vía',1,'Correcto: con neblina las luces bajas sirven para que lo vean, y la distancia extra le da tiempo para frenar. Si necesita detenerse, que sea fuera de la vía.'],
      ['Encender las luces altas para ver mejor',0,'Las altas rebotan en la neblina y lo dejan más ciego: no vio el carro de adelante y lo chocó por detrás.'],
      ['Detenerse en medio del carril hasta que se vaya',0,'Detenido en el carril y sin que nadie lo viera, el carro de atrás lo chocó. Si se detiene, salga de la vía y ponga intermitentes.']]},
  motor:{n:'MOTOR RECALENTADO',l:'MOTOR',col:'#9d4edd',intro:'Sale humo blanco del capó y la aguja de la temperatura está en rojo.',
    opts:[['Poner intermitentes, orillarse, apagar el motor y esperar a que se enfríe antes de revisar el agua',1,'Correcto: seguir manejando con el motor recalentado lo puede fundir. Espere al menos 30 minutos: el radiador caliente está a presión. Después revise el agua y lleve el carro al taller.'],
      ['Abrir de inmediato la tapa del radiador para echarle agua',0,'El agua hirviendo salió a presión y le quemó la cara y las manos. Nunca abra el radiador caliente.','s'],
      ['Seguir manejando hasta llegar a la casa',0,'El motor se fundió y el carro se apagó en plena vía: ahora la reparación es carísima. Con la temperatura en rojo se orilla y se apaga el motor.','s']]},
  accidente:{n:'CHOQUE ADELANTE',l:'CHOQUE',col:'#ff70a6',intro:'Adelante acaba de ocurrir un choque: dos carros atravesados y una persona herida en la orilla.',
    opts:[['Bajar la velocidad, poner intermitentes, detenerse en un lugar seguro, llamar al 911 y no mover a la persona herida',1,'Correcto: avisar rápido al 911 salva vidas. Mover a un herido puede empeorar una lesión de columna; solo se mueve si hay peligro de fuego o de otro choque.'],
      ['Detenerse en medio de la calle para ver y tomar fotos',0,'Detenido en el carril, otro conductor distraído lo chocó por detrás. Si se detiene, que sea fuera de la vía y para ayudar.'],
      ['Levantar a la persona herida y llevarla en su carro al hospital',0,'Al moverla le empeoró una lesión de la columna. Llame al 911 y espere a los paramédicos: no mueva a los heridos.','s']]},
  bus:{n:'BUS EN LA PARADA',l:'BUS',col:'#4361ee',intro:'Un autobús está detenido en la parada y la gente se está bajando. Usted viene detrás.',
    opts:[['Bajar la velocidad y esperar detrás, o pasarlo muy despacio atento a quien cruce por delante del bus',1,'Correcto: quien se baja suele cruzar por delante del bus, justo donde usted no lo ve. Paciencia: el bus arranca en segundos.'],
      ['Adelantarlo rápido antes de que arranque',0,'Una persona cruzó por delante del bus justo cuando usted pasaba y no logró frenar.'],
      ['Pitar para que el bus se apure',0,'El pito no mueve al bus y lo distrajo a usted: no vio a la persona que salía por delante del bus.']]},
  moto:{n:'MOTO EN EL PUNTO CIEGO',l:'MOTO',col:'#b5838d',intro:'Va a adelantar a un carro lento. En el espejo no se ve nada... pero una moto ya lo está adelantando a usted por la izquierda.',
    opts:[['Poner la direccional, revisar los espejos y girar la cabeza para ver el punto ciego antes de moverse; esperar a que pase la moto',1,'Correcto: los espejos no muestran todo. Una mirada rápida por encima del hombro le muestra las motos y bicis que el espejo esconde.'],
      ['Salirse a adelantar confiando solo en el espejo',0,'La moto venía en el punto ciego: la golpeó al salirse del carril.'],
      ['Salirse rápido sin direccional para aprovechar el espacio',0,'Sin direccional nadie sabía que iba a moverse: la moto no pudo frenar y chocaron.']]}};
const SCENALL=Object.keys(SCEN);
// objetos de la situación en curso (vaca, ambulancia, carro de frente, moto), relativos al carro del jugador
function evRel(P,d,lat){const c=Math.cos(P.h),s=Math.sin(P.h);return{x:P.x+c*d-s*lat,y:P.y+s*d+c*lat,h:P.h}}
function evFx(W,P,dt){const E=S.ev;
  if(E&&E.ty==='neblina')S.evFog=Math.min(.85,(S.evFog||0)+dt*1.2);else if(S.evFog>0)S.evFog=Math.max(0,S.evFog-dt*.05);if(!W.r32)S.fogK=S.evFog||0;
  if(!E)return;const t=E.t,ph=E.ph;
  if(E.ty==='animal'){const c=E.cow;if(!c.st)c.st=1;const sp=ph==='crash'?0:5;c.x+=Math.cos(c.h)*sp*dt;c.y+=Math.sin(c.h)*sp*dt}
  if(E.ty==='ambulancia'){const A=E.amb;if(ph==='safe'){A.lat=Math.max(-12,A.lat-dt*20);A.d+=dt*40}else if(ph==='crash')A.d=Math.min(-P.L+1,A.d+dt*30);else{A.d=Math.min(-18,A.d+dt*24);A.lat=Math.max(-5,A.lat-dt*4)}}
  if(E.ty==='encandilado'){const O=E.onc;O.d-=dt*(ph==='crash'?25:45);if(ph==='crash')O.lat=Math.min(0,O.lat+dt*12)}
  if(E.ty==='moto'){const M=E.moto;M.d+=dt*(ph==='crash'?6:ph==='safe'?30:12);if(ph==='crash')M.lat=Math.min(-6,M.lat+dt*6)}
  if(E.ty==='acelerador'&&ph==='slow')P.v=Math.min(P.v+dt*25,P.vmax||90)}
function evStart(E,P){const ty=E.ty,e=E.e;
  if(ty==='animal'){const rx=-e.uy,ry=e.ux;E.cow={x:e.x+e.ux*34+rx*16,y:e.y+e.uy*34+ry*16,h:Math.atan2(-ry,-rx),t:0};sfx.bad()}
  if(ty==='ambulancia'){E.amb={d:-40,lat:0};for(let i=0;i<4;i++)beep(i%2?740:960,.28,'triangle',.12,0,i*.3)}
  if(ty==='encandilado')E.onc={d:110,lat:-14};
  if(ty==='moto')E.moto={d:-26,lat:-13};
  if(ty==='motor')S.shake=.25}
// dibujo 2D (vista de arriba) de lo que pasa en la situación
function evLive2D(g,X,Y,ix,iy,t,blinkOn,ped,W){if(W.events)for(const e of W.events)if(e.props)for(const q of e.props)ped(q);
  const E=S.ev;if(!E)return;const P=S.P;
  if(E.cow)cow2D(g,X(E.cow.x),Y(E.cow.y),E.cow.h);
  if(E.amb){const A=evRel(P,E.amb.d,E.amb.lat),fl=Math.floor(t*8)%2;g.fillStyle=fl?'rgba(47,107,255,.3)':'rgba(255,42,74,.3)';g.fillRect(X(A.x)-12,Y(A.y)-12,24,24);drawCar(g,A.x,A.y,A.h,'#f4f4f4',{on:fl},ix,iy,'ambulance')}
  if(E.onc){const O=evRel(P,E.onc.d,E.onc.lat);drawCar(g,O.x,O.y,O.h+Math.PI,'#6c757d',{},ix,iy,'sedan');g.save();g.globalCompositeOperation='lighter';glow(g,X(O.x-Math.cos(P.h)*14),Y(O.y-Math.sin(P.h)*14),26,'rgba(255,255,230,.7)');g.restore()}
  if(E.moto){const M=evRel(P,E.moto.d,E.moto.lat);drawCar(g,M.x,M.y,M.h,'#222',{},ix,iy,'moto')}
  if(E.ty==='motor'){for(let k=0;k<7;k++){const a=(t*1.3+k*.37)%1,c=Math.cos(P.h),s=Math.sin(P.h),d=P.L/2-1+a*6,j=Math.sin(k*2.1+t*3)*3;g.fillStyle=`rgba(235,235,235,${.6*(1-a)})`;const r=2+a*5;g.fillRect(X(P.x+c*d-s*j)-r/2,Y(P.y+s*d+c*j)-r/2-a*8,r,r)}}}
function evLive3D(add,ctx,C,V,blinkOn,ped3,W){if(W.events)for(const e of W.events)if(e.props)for(const q of e.props)ped3(q);
  const E=S.ev;if(!E)return;const P=S.P;
  if(E.cow)add(E.cow.x,E.cow.y,6,()=>cow3D(ctx,C,V,E.cow));
  if(E.amb){const A=evRel(P,E.amb.d,E.amb.lat);add(A.x,A.y,10,()=>car3D(ctx,C,V,{...A,type:'ambulance',col:'#f4f4f4',L:16,Wd:9,siren:1,bl:blinkOn,br:!blinkOn},blinkOn))}
  if(E.onc){const O=evRel(P,E.onc.d,E.onc.lat);add(O.x,O.y,10,()=>{car3D(ctx,C,V,{...O,h:O.h+Math.PI,type:'sedan',col:'#6c757d',L:14,Wd:8},blinkOn);const B=bill(C,V,O.x-Math.cos(P.h)*7,O.y-Math.sin(P.h)*7,1.6);if(B){ctx.save();ctx.globalCompositeOperation='lighter';glow(ctx,B.x,B.y,Math.max(10,40*B.k),'rgba(255,255,235,.9)');ctx.restore()}})}
  if(E.moto){const M=evRel(P,E.moto.d,E.moto.lat);add(M.x,M.y,5,()=>car3D(ctx,C,V,{...M,type:'moto',col:'#222',L:8,Wd:4},blinkOn))}
  if(E.ty==='nino'){const e=E.e,k2=Math.min(1,E.t/1.2),bx=e.x+e.ux*34-e.uy*(26-22*k2),by=e.y+e.uy*34+e.ux*(26-22*k2);add(bx,by,1,()=>{const B=bill(C,V,bx,by,.7);if(B){ctx.fillStyle='#ff7b00';ctx.beginPath();ctx.arc(B.x,B.y,Math.max(1,.7*B.k),0,7);ctx.fill()}});if(E.t>.5){E.kid3=E.kid3||{col:'#e63946',ht:3.4};Object.assign(E.kid3,{x:bx+e.uy*9,y:by-e.ux*9,an:S.t});ped3(E.kid3)}}}
// efectos de pantalla: encandilamiento, sirena, humo del capó, neblina en la vista de arriba
function evOver(is3D){const E=S.ev;
  if(!is3D&&S.evFog>.02){g.fillStyle=`rgba(220,226,232,${.6*S.evFog})`;g.fillRect(0,0,VW,VH);for(let i=0;i<10;i++){const fx=((i*157+S.t*8)%(VW+120))-60,fy=(i*53)%VH;g.fillStyle=`rgba(240,244,248,${.25*S.evFog})`;g.fillRect(fx,fy,70,14)}}
  if(!E)return;
  if(E.ty==='encandilado'&&E.onc&&E.onc.d>-10){const k=clamp(1-Math.abs(E.onc.d-25)/80,0,1)*(E.ok?.5:1);g.fillStyle=`rgba(255,255,235,${.75*k})`;g.fillRect(0,0,VW,VH)}
  if(E.ty==='ambulancia'&&E.amb&&E.amb.d<40){const fl=Math.floor(S.t*8)%2;g.fillStyle=fl?'rgba(47,107,255,.3)':'rgba(255,42,74,.3)';g.fillRect(0,0,VW,8);g.fillRect(0,VH-8,VW,8);g.fillRect(0,0,6,VH);g.fillRect(VW-6,0,6,VH);if(Math.floor(S.t*3.3)!==E.sn){E.sn=Math.floor(S.t*3.3);beep(E.sn%2?740:960,.28,'triangle',.06)}}
  if(E.ty==='motor'&&is3D){for(let k=0;k<9;k++){const a=(S.t*.9+k*.29)%1;g.fillStyle=`rgba(235,235,235,${.55*(1-a)})`;const r=6+a*26;g.beginPath();g.arc(VW/2+Math.sin(k*2.3+S.t)*40,VH*.62-a*70,r,0,7);g.fill()}}}
function addEvents(W,types){if(!W.roads||!W.roads.length)return;W.events=[];W.broken=W.broken||[];W.roadObs=W.roadObs||[];const R=rng(77);
  for(const ty of types){for(let tr=0;tr<200;tr++){const r=W.roads[R()*W.roads.length|0];if(r.b-r.a<220)continue;const dir=r.ow?r.ow:(R()<.5?1:-1);const along=r.a+80+R()*(r.b-r.a-160);
      const x=r.o==='h'?along:r.c,y=r.o==='h'?r.c:along;if(W.nodes.some(n=>Math.hypot(n.x-x,n.y-y)<70))continue;if(W.events.some(e=>Math.hypot(e.x-x,e.y-y)<230))continue;if(W.spawn&&Math.hypot(W.spawn.x-x,W.spawn.y-y)<250)continue;if(W.zebras.some(z=>Math.hypot(z.x-x,z.y-y)<60))continue;
      const ux=r.o==='h'?dir:0,uy=r.o==='h'?0:dir,lx=-uy*7,ly=ux*7;const e={ty,x:x+lx,y:y+ly,ux,uy,done:false};
      if(ty==='varado'){const b={x:e.x+ux*40,y:e.y+uy*40,h:Math.atan2(uy,ux),col:'#8d99ae',type:'sedan',L:14,Wd:8,v:0,static:true,haz:true};W.broken.push(b);W.roadObs.push(b);for(const q of circles(b))W.circObs.push({x:q.x,y:q.y,r:q.r,type:'car'});e.car=b}
      const rx=-uy,ry=ux,park=(dx,lat,dh,type,col)=>{const b={x:e.x+ux*dx+rx*lat,y:e.y+uy*dx+ry*lat,h:Math.atan2(uy,ux)+dh,col,type,L:VEH[type].L,Wd:VEH[type].Wd,v:0,static:true,haz:true};W.broken.push(b);W.roadObs.push(b);for(const q of circles(b))W.circObs.push({x:q.x,y:q.y,r:q.r,type:'car'});return b};
      if(ty==='accidente'){park(52,-2,.7,'sedan','#c1121f');park(64,-9,-.5,'pickup','#577590');e.props=[{x:e.x+ux*58+rx*17,y:e.y+uy*58+ry*17,col:'#ffd166',an:0,ht:3},{x:e.x+ux*62+rx*19,y:e.y+uy*62+ry*19,col:'#3a86ff',an:0}]}
      if(ty==='bus'){park(42,0,0,'bus','#2a9d8f');e.props=[{x:e.x+ux*48+rx*13,y:e.y+uy*48+ry*13,col:'#e76f51',an:0},{x:e.x+ux*40+rx*14,y:e.y+uy*40+ry*14,col:'#8338ec',an:0}]}
      W.events.push(e);break}}}
function evDraw2D(x,W){if(!W.events)return;for(const e of W.events){if(e.ty==='hidro'){x.fillStyle='rgba(60,120,190,.55)';x.beginPath();x.ellipse(e.x+e.ux*10,e.y+e.uy*10,e.ux?16:7,e.ux?7:16,0,0,7);x.fill();x.fillStyle='rgba(180,220,255,.5)';x.fillRect(e.x+e.ux*10-3,e.y+e.uy*10-1,5,1)}
  if(e.ty==='derrape'){x.fillStyle='rgba(40,60,90,.25)';x.fillRect(e.x-20,e.y-20,40,40)}}}
function evStep(W,P,dt){const E=S.ev;evFx(W,P,dt);
  if(S.tire)return tireStep(W,P,dt);
  if(E){E.t+=dt;if(E.ph==='slow'){if(E.ty==='llanta')P.h=nA(P.h+.12*dt);if(E.ty==='derrape')P.h=nA(P.h+.35*dt);if(E.t>.9){E.ph='ask';evAsk(E)}}return}
  if(S.foot||Math.abs(P.v)<12)return;for(const e of W.events||[]){if(e.done||(e.cool&&S.t<e.cool))continue;const rx=P.x-e.x,ry=P.y-e.y;if(Math.hypot(rx,ry)>22)continue;if(Math.cos(P.h)*e.ux+Math.sin(P.h)*e.uy<.7)continue;if(SCEN[e.ty].night&&!(S.wx&&S.wx.n>.45)){if(!e.warned){e.warned=1;toast(SCEN[e.ty].n,'Esta situación ocurre de noche: vuelva cuando oscurezca','info')}continue}
    S.ev={e,ty:e.ty,ph:'slow',t:0};evStart(S.ev,P);sfx.bad();if(e.ty==='llanta'){beep(90,.3,'sawtooth',.2,-40);S.shake=.5}if(e.ty==='nino')e.kid={t:0};return}}
function evAsk(E){const D=SCEN[E.ty],box=$('evBox');const ord=shuffle([0,1,2]);E.ord=ord;
  box.innerHTML=`<b style="color:${D.col}">⚠ ${D.n}</b><p>${D.intro}</p><p style="color:#ffd23f">¿Qué hace?</p>`+ord.map((k,i)=>`<button data-k="${i}">${i+1} · ${D.opts[k][0]}</button>`).join('');
  box.classList.remove('hidden');for(const b of box.querySelectorAll('button'))b.onclick=()=>evAnswer(+b.dataset.k);say(D.intro+' ¿Qué hace?',true)}
function evAnswer(i){const E=S.ev;if(!E||E.ph!=='ask')return;const D=SCEN[E.ty],o=D.opts[E.ord[i]];$('evBox').classList.add('hidden');E.ok=!!o[1];E.msg=o[2];E.still=o[3]==='s';E.t=0;
  if(E.ok){E.ph='safe';toast('¡BIEN HECHO!',o[2],'good');say(o[2],true);sfx.good()}else{E.ph='crash';say('¡Cuidado!',true)}}
function evAnim(W,P,dt){const E=S.ev;E.t+=dt;evFx(W,P,dt);
  if(E.ph==='safe'){P.v=Math.max(0,P.v-(E.ty==='nino'||E.ty==='animal'?40:18)*dt);if(E.ty==='ambulancia'&&E.t<1.5){P.x-=Math.sin(P.h)*5*dt;P.y+=Math.cos(P.h)*5*dt}P.steer*=.9;P.brake=true;P.x+=Math.cos(P.h)*P.v*dt;P.y+=Math.sin(P.h)*P.v*dt;
    if(P.v<=.2&&E.t>1){P.v=0;E.e.done=true;S.pts+=150;S.ev=null;if(E.ty==='llanta'){S.tire={st:0,t:0};toast('LLANTA REVENTADA','Ahora: intermitentes [H], bájese [T], coloque el triángulo y cambie la llanta','info')}else{const n=W.events.filter(q=>q.done).length;toast('SITUACIÓN SUPERADA','+150 pts · '+n+' de '+W.events.length+' situaciones del mapa','good')}}return}
  if(E.ph==='crash'){if(E.still){P.v=Math.max(0,P.v-30*dt);P.steer*=.9;P.x+=Math.cos(P.h)*P.v*dt;P.y+=Math.sin(P.h)*P.v*dt;if(E.ty==='motor'&&E.t>.6)S.shake=Math.max(S.shake||0,.15)}
    else{P.spin=E.t<1.2?4.5:0;P.h=nA(P.h+P.spin*dt);P.v=Math.max(0,P.v-10*dt);P.x+=Math.cos(P.h)*P.v*dt+(E.ty==='derrape'||E.ty==='hidro'?Math.cos(P.h+1.5)*12*dt:0);P.y+=Math.sin(P.h)*P.v*dt}
    if(E.t>1.3&&!E.over){E.over=true;sfx.crash();S.shake=.8;const D=SCEN[E.ty],box=$('evBox');S.pts=Math.max(0,S.pts-150);
      box.innerHTML=`<b style="color:#ff4d4d;font-size:150%">GAME OVER</b><p style="color:${D.col}">${D.n}</p><p>${E.msg}</p><p style="color:#9cf">Lo correcto: ${D.opts.find(o=>o[1])[0]}.</p><button id="evRetry">1 · INTENTAR DE NUEVO</button><button id="evGo">2 · SEGUIR MANEJANDO</button>`;
      box.classList.remove('hidden');$('evRetry').onclick=()=>evRetry(true);$('evGo').onclick=()=>evRetry(false)}}}
function evRetry(again){const E=S.ev;if(!E)return;$('evBox').classList.add('hidden');const P=S.P,e=E.e;S.ev=null;P.spin=0;P.v=0;
  if(again){P.x=e.x-e.ux*120;P.y=e.y-e.uy*120;P.h=Math.atan2(e.uy,e.ux);P.v=18;toast('INTÉNTELO DE NUEVO','Acérquese otra vez a la situación','info')}else{e.cool=S.t+60;P.x=e.x-e.ux*60;P.y=e.y-e.uy*60;P.h=Math.atan2(e.uy,e.ux)}}
// cambio de llanta: intermitentes, bajarse, triángulo detrás del carro, cambiar la llanta y subirse
function tireStep(W,P,dt){const T=S.tire,c=Math.cos(P.h),s=Math.sin(P.h);T.tri=T.tri||{x:P.x-c*45,y:P.y-s*45};T.wh={x:P.x+c*4+s*6,y:P.y+s*4-c*6};const F=S.foot;
  if(T.st===0&&P.haz)T.st=1;else if(T.st===1&&F)T.st=2;else if(T.st===2&&F&&Math.hypot(F.x-T.tri.x,F.y-T.tri.y)<9){T.st=3;T.placed=true;sfx.gear();toast('TRIÁNGULO COLOCADO','Así los demás conductores lo ven a tiempo','good')}
  else if(T.st===3&&F){if(Math.hypot(F.x-T.wh.x,F.y-T.wh.y)<9&&F.v<1){T.t+=dt;if(T.t>3){T.st=4;sfx.good();toast('LLANTA CAMBIADA','Apriete bien las tuercas y revise la presión del repuesto','good')}}else T.t=Math.max(0,T.t-dt)}
  else if(T.st===4&&!F){S.tire=null;S.pts+=200;toast('¡LISTO PARA SEGUIR!','+200 pts · Recuerde reparar la llanta pinchada pronto','good')}}
function tireText(){const T=S.tire;return['Encienda las luces INTERMITENTES '+(TOUCH?'(⚠ H)':'[H]'),'Bájese del carro '+(TOUCH?'(A PIE)':'[T]'),'Coloque el TRIÁNGULO: camine al punto amarillo detrás del carro','Cambie la llanta: quédese junto a la llanta delantera (punto amarillo) 3 segundos','Súbase al carro '+(TOUCH?'(A PIE)':'[T]')+' para seguir'][T.st]}
// ===================== POLICÍA DE TRÁNSITO =====================
// En manejo libre: 4 infracciones en 90 s y llega una patrulla que no se detiene por nada hasta alcanzarlo.
const OFI='OFICIAL DE TRÁNSITO';
function copWanted(){if(S.exam||S.cop)return;const n=(S.wl||[]).filter(t=>t>S.t-90).length;if(n<4)return;const T=S.foot||S.P,a=Math.random()*6.283;
  S.cop={x:T.x+Math.cos(a)*280,y:T.y+Math.sin(a)*280,h:a+Math.PI,v:40,L:14,Wd:8,type:'police',col:'#f4f4f4',sir:0};$('banner').textContent='¡LA POLICÍA LO BUSCA!';toast('POLICÍA DE TRÁNSITO','Demasiadas infracciones: una patrulla viene por usted','bad')}
function updateCop(dt){const C=S.cop;if(!C)return;const T=S.foot||S.P;
  if(C.arrest){S.P.v=0;S.dlg.t+=dt;if(S.dlg.t>dlgDur(S.dlg,3.6)){S.dlg.i++;S.dlg.t=0}
    if(S.dlg.i>=S.dlg.lines.length){S.dlg=null;S.cop=null;S.wl=[];$('banner').textContent='';S.pts=Math.max(0,S.pts-300);S.streak=0;S.arrests=(S.arrests||0)+1;S.foot=null;const b=S.P.belt;Object.assign(S.P,spawnState(S.W));S.P.belt=b;toast('PUEDE SEGUIR','-300 pts · Maneje con prudencia','info')}return}
  const dx=T.x-C.x,dy=T.y-C.y,d=Math.hypot(dx,dy);C.h=nA(C.h+clamp(nA(Math.atan2(dy,dx)-C.h),-5*dt,5*dt));C.v=Math.min(Math.max(75,Math.abs(T.v||0)*1.3+25),C.v+70*dt);
  if(d>15){C.x+=Math.cos(C.h)*C.v*dt;C.y+=Math.sin(C.h)*C.v*dt}
  C.sir-=dt;if(C.sir<=0){C.sir=.45;C.tone=!C.tone;beep(C.tone?720:960,.42,'sine',Math.max(.015,.08-d/5000))}
  if(d<17){C.arrest=true;C.v=0;S.P.v=0;S.P.thr=0;sfx.bad();const n=S.infr;
    S.dlg={lines:[[OFI,'¡Alto! Detenga el vehículo y no se mueva, por favor.'],[OFI,'Me permite su licencia y el derecho de circulación.'],[OFI,'Tiene '+n+' infracciones registradas. Le confeccionamos la boleta y el vehículo queda detenido.'],[OFI,'Recuerde: respetar las leyes de tránsito salva vidas.']],i:0,t:0}}}
