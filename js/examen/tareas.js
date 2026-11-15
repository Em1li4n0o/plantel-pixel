'use strict';
// ===================== TAREAS =====================
function still(k,cond,sec){const P=S.P;if(cond&&Math.abs(P.v)<.5)S.hold[k]=(S.hold[k]||0)+S.dt;else S.hold[k]=0;return S.hold[k]>=sec}
function plantelTasks(){return[
  {txt:'Póngase el cinturón [C], encienda la direccional IZQUIERDA [Q] y salga a la vía hacia el ESTE.',tgt:{x:170,y:47},
   check(){const P=S.P;if(P.blinkL&&P.x<135)this.sig=true;if(P.x>150&&P.y<56){if(!this.sig)fault('inc','No señalizó al incorporarse a la vía','II');return true}}},
  {txt:'PARQUEO EN BATERÍA: estaciónese dentro del espacio AMARILLO (de frente o en reversa) y deténgase.',tgt:{x:413,y:72},zone:{x:406,y:58,w:15,h:28},ok:'¡Parqueo en batería correcto!',
   check(){const P=S.P;return still('bat',P.x>409&&P.x<418&&P.y>65&&P.y<80&&Math.abs(Math.sin(P.h))>.9,1.2)}},
  {txt:'Salga del espacio y siga al ESTE. Haga ALTO TOTAL antes de la vía del tren.',tgt:{x:530,y:47},check(){const P=S.P;return P.x>505&&P.y<60}},
  {txt:'Doble a la DERECHA por la vía del este y luego a la DERECHA hacia la rotonda (use direccionales).',tgt:{x:420,y:233},check(){const P=S.P;return P.y>222&&P.y<258&&P.x<440&&P.x>376}},
  {txt:'ROTONDA: ceda el paso y tome la 3ª SALIDA (SUR). Direccional IZQ. al circular y DER. antes de salir.',tgt:{x:313,y:312},start(){S.lastExit=null},
   check(){if(!S.lastExit)return false;if(S.lastExit.exit!=='S')fault('exit','Tomó una salida equivocada en la rotonda','III',2);return true}},
  {txt:'Haga ALTO en la intersección del fondo y doble a la DERECHA (oeste).',tgt:{x:240,y:433},check(){const P=S.P;return P.y>422&&P.x<290}},
  {txt:'RETROCESO: entre de frente al pasillo de conos hasta la línea amarilla y salga en REVERSA en línea recta.',tgt:{x:123,y:352},zone:{x:114,y:336,w:18,h:90},ok:'¡Retroceso completado!',
   check(){const P=S.P;const inC=P.x>113&&P.x<133&&P.y>334&&P.y<428;
     if(!this.ph){if(inC&&P.y<352){this.ph=1;toast('AHORA EN REVERSA','Toque S dos veces y retroceda recto','info')}return false}
     this.tgt={x:123,y:440};
     if(inC&&P.gear===-1){if(P.v<-1)this.mv=true;if(this.mv&&Math.abs(P.v)<.3){this.st=(this.st||0)+S.dt;if(this.st>1&&!this.fl){this.fl=1;fault('rstop','Detenerse durante el retroceso','IV')}}else this.st=0}
     if(P.y>430){if(P.gear===1)fault('rnoret','No realizó el retroceso en reversa','III');return true}}},
  {txt:'PARQUEO EN PARALELO: estaciónese entre los dos carros, al lado derecho de la vía oeste (mejor en reversa).',tgt:{x:62,y:326},zone:{x:55,y:312,w:14,h:28},ok:'¡Parqueo en paralelo correcto!',
   check(){const P=S.P;return still('par',P.x>56&&P.x<68&&P.y>318&&P.y<334&&Math.abs(Math.cos(P.h))<.35,1.2)}},
  {txt:'Regrese al cuadro de INICIO/FIN (arriba a la izquierda) y deténgase dentro.',tgt:{x:108,y:61},zone:{x:92,y:54,w:32,h:14},
   check(){const P=S.P;return still('fin',P.x>97&&P.x<119&&P.y>56&&P.y<66,1)}}]}
function tutoTasks(){const T=TOUCH,k=(key,btn)=>T?btn:key;const P=()=>S.P;
  return[
  {txt:`¡Bienvenido! Primero póngase el CINTURÓN con ${k('[C]','el botón CINT')}. Sin cinturón no puede manejar.`,check(){return P().belt}},
  {txt:`Acelere con ${k('[W]','el pedal GAS')}. El pedal se hunde poco a poco: llegue a 15 km/h.`,check(){return Math.abs(P().v)*KMH>=15}},
  {txt:`Ahora frene con ${k('[S]','el pedal FRENO')} hasta detenerse por completo.`,check(){return Math.abs(P().v)<.3}},
  {txt:`Gire el volante con ${k('[A] y [D]','◀ y ▶')}. Avance y dé media vuelta (gire 180°).`,start(){this.h0=P().h;this.acc=0;this.prev=P().h},check(){const h=P().h;this.acc+=Math.abs(nA(h-this.prev));this.prev=h;return this.acc>2.8}},
  {txt:`Direccionales: ${k('[Q] izquierda y [E] derecha','◀Q izquierda y E▶ derecha')}. Ponga la DERECHA. (Se apaga sola al enderezar.)`,check(){return P().blinkR}},
  {txt:`Reversa: deténgase con ${k('[S]','FRENO')}, SUELTE y tóquelo OTRA VEZ. En el tablero verá R.`,check(){return P().gear===-1}},
  {txt:`En reversa, ${k('[S]','FRENO')} lo mueve hacia atrás y ${k('[W]','GAS')} frena. Retroceda un poco y luego, detenido, toque ${k('[W]','GAS')} para volver a D.`,start(){this.mv=0},check(){if(P().v<-2)this.mv=1;return this.mv&&P().gear===1}},
  {txt:`Freno de mano: ${k('[ESPACIO]','MANO')}. Sirve para arrancar en subidas. Sosténgalo 1 segundo.`,start(){this.t=0},check(){if(keys[' '])this.t+=S.dt;return this.t>1}},
  {txt:`Marcha baja (compresionar) con ${k('[G]','L/D')}: para bajar cuestas. Póngala y quítela.`,start(){this.on=0},check(){if(P().low)this.on=1;return this.on&&!P().low}},
  {txt:`Bocina: ${k('[B]','PITO')}. Úsela SOLO para evitar un accidente (en el examen pitar sin motivo es falta). Pruébela.`,check(){return P().hornT>0}},
  {txt:`Cambie a la VISTA DE PILOTO con ${k('[V]','VISTA')}.`,check(){return !!S.fp}},
  {txt:`En vista de piloto mire el espejo izquierdo: mantenga ${k('[Z]','◀ESP')}. (${k('[X] derecho, [F] arriba','ESP▶ derecho, ARRIBA para semáforos')}.)`,check(){return (S.look||0)<-.6}},
  {txt:`Vuelva a la vista desde arriba con ${k('[V]','VISTA')}. Pausa con ${k('[P] o [ESC]','II')}.`,check(){return !S.fp}},
  {txt:'¡Último paso! Maneje hasta la flecha amarilla y deténgase ahí. En las pruebas siempre siga la flecha y las instrucciones de arriba.',tgt:{x:320,y:47},check(){const p=P();return Math.hypot(p.x-320,p.y-47)<18&&Math.abs(p.v)<.5}}]}
function streetTasks(){return[
  {txt:'PRUEBA EN CALLE: póngase el cinturón [C] y maneje hasta LA ESCUELA. Respete la zona escolar de 25 km/h.',tgt:{x:200,y:287},check(){const P=S.P;return Math.hypot(P.x-200,P.y-287)<16}},
  {txt:'Vaya a la ROTONDA y tome la salida SUR. Ceda el paso, direccional IZQ. al circular y DER. al salir.',tgt:{x:533,y:345},start(){S.lastExit=null},
   check(){if(!S.lastExit)return false;if(S.lastExit.exit!=='S'){fault('exit','Tomó una salida equivocada en la rotonda','III',2);S.lastExit=null;return false}return true}},
  {txt:'Siga al SUR y cruce la línea del tren. ¡ALTO total antes de los rieles!',tgt:{x:533,y:652},check(){const P=S.P;return P.y>640&&Math.abs(P.x-540)<16}},
  {txt:'Llegue al PARQUEO PÚBLICO y estaciónese en el espacio AMARILLO.',tgt:{x:872,y:588},zone:{x:865,y:574,w:15,h:28},ok:'¡Parqueo correcto!',
   check(){const P=S.P;return still('cp',P.x>868&&P.x<877&&P.y>580&&P.y<597&&Math.abs(Math.sin(P.h))>.9,1.2)}}]}
