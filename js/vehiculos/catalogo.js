'use strict';
// ===================== VEHÍCULOS =====================
const VEH={
  sedan:{n:'SEDÁN',L:14,Wd:8,acc:6.5,vmax:80,brk:17,wb:9,steer:.62,d:'Equilibrado. Ideal para aprender.'},
  hatch:{n:'HATCHBACK',L:12,Wd:8,acc:6.8,vmax:72,brk:18,wb:7.5,steer:.66,d:'Pequeño y ágil. Fácil de parquear.'},
  sport:{n:'DEPORTIVO',L:14,Wd:8,acc:11,vmax:110,brk:22,wb:9,steer:.6,d:'Muy rápido. ¡Cuidado con los límites!'},
  pickup:{n:'PICKUP',L:17,Wd:9,acc:5.2,vmax:76,brk:15,wb:11.5,steer:.6,d:'Grande y pesado. Difícil de parquear.'},
  suv:{n:'SUV',L:15,Wd:9,acc:5.8,vmax:78,brk:16,wb:10,steer:.6,d:'Alto y cómodo. Algo ancho.'},
  taxi:{n:'TAXI ROJO',L:14,Wd:8,acc:6.6,vmax:82,brk:17,wb:9,steer:.62,fixed:'#d62828',d:'El clásico taxi rojo tico.'},
  bus:{n:'AUTOBÚS',L:26,Wd:10,acc:4,vmax:45,brk:18,wb:16,steer:.55,d:'Largo y lento. Abra bien las curvas.'},
  garbage:{n:'BASURA',L:24,Wd:10,acc:3.5,vmax:30,brk:16,wb:15,steer:.55,fixed:'#2e8b57',d:''},
  truck:{n:'CAMIÓN',L:28,Wd:10,acc:3,vmax:50,brk:15,wb:18,steer:.5,d:''},
  bici:{n:'BICICLETA',L:7,Wd:3,acc:3.2,vmax:28,brk:12,wb:4.5,steer:.85,moto:1,bike:1,d:'Sin motor. Vaya a la derecha y con casco.'},
  scooter:{n:'SCOOTER 50 cc',L:7,Wd:4,acc:5,vmax:55,brk:15,wb:4.6,steer:.8,moto:1,d:'Bicimoto automática para la ciudad.'},
  moto:{n:'MOTO 150 cc',L:8,Wd:4,acc:8,vmax:90,brk:18,wb:5,steer:.78,moto:1,d:'La moto de trabajo más común en Costa Rica.'},
  trail:{n:'MOTO TRAIL 250 cc',L:8,Wd:4,acc:8.5,vmax:100,brk:17,wb:5.2,steer:.76,moto:1,d:'Alta y resistente, para calle y lastre.'},
  ambulance:{n:'AMBULANCIA',L:16,Wd:9,acc:8,vmax:110,brk:20,wb:10,steer:.6,fixed:'#f4f4f4',d:''},
  police:{n:'POLICÍA',L:14,Wd:8,acc:9,vmax:120,brk:20,wb:9,steer:.62,fixed:'#f4f4f4',d:''},
  hyper:{n:'HIPERDEPORTIVO',L:14,Wd:8,acc:17,vmax:175,brk:26,wb:8.6,steer:.62,arcade:1,d:'De 0 a 100 en un parpadeo.'},
  muscle:{n:'MUSCLE CAR',L:15,Wd:8,acc:14,vmax:150,brk:20,wb:9.4,steer:.58,arcade:1,d:'Motor V8 y mucho ruido.'},
  rally:{n:'RALLY 4x4',L:13,Wd:8,acc:13,vmax:135,brk:22,wb:7.8,steer:.78,arcade:1,d:'Gira como nadie y aguanta todo.'},
  kart:{n:'KART',L:9,Wd:6,acc:15,vmax:115,brk:24,wb:5.5,steer:.85,arcade:1,d:'Bajito, liviano y muy nervioso.'},
  monster:{n:'MONSTER TRUCK',L:18,Wd:12,acc:11,vmax:115,brk:18,wb:11,steer:.6,arcade:1,d:'Llantas gigantes. Rebota en todo.'},
  tuner:{n:'TUNER DRIFT',L:13,Wd:8,acc:13,vmax:145,brk:21,wb:8,steer:.72,arcade:1,d:'Ligero y con alerón. Para derrapar.'},
  superbike:{n:'MOTO DEPORTIVA 600 cc',L:9,Wd:4,acc:13,vmax:140,brk:22,wb:5.6,steer:.7,moto:1,d:'Potentísima. Solo para licencia A3.'},
  neon:{n:'MOTO NEÓN',L:11,Wd:4,acc:14,vmax:150,brk:24,wb:6.2,steer:.75,moto:1,arcade:1,d:'Moto de luz del futuro: neón celeste y una estela que la sigue.'}};
// Tipos de licencia de Costa Rica y qué vehículos cubren
const LICS=[{id:'BICI',n:'BICICLETA',d:'No requiere licencia',t:['bici']},{id:'A1',n:'A1 · BICIMOTO',d:'Hasta 50 cc',t:['scooter']},{id:'A2',n:'A2 · MOTO',d:'Hasta 500 cc',t:['moto','trail']},
  {id:'A3',n:'A3 · MOTO GRANDE',d:'Más de 500 cc',t:['superbike']},{id:'B1',n:'B1 · AUTOMÓVIL',d:'Carros, pickups y SUV',t:['sedan','hatch','sport','pickup','suv']},{id:'C1',n:'C1 · TAXI',d:'Servicio de taxi',t:['taxi']},{id:'C2',n:'C2 · AUTOBÚS',d:'Transporte público',t:['bus']},{id:'ARCADE',n:'MODO ARCADE',d:'Sin licencia · manejo libre',t:['hyper','muscle','rally','kart','monster','tuner','neon']}];
const licOf=t=>LICS.find(l=>l.t.includes(t))||LICS[4];
const PTYPES=LICS.flatMap(l=>l.t);
const isMoto=t=>!!(VEH[t]&&VEH[t].moto);const isArc=t=>!!(VEH[t]&&VEH[t].arcade);let ARCOK=false;
const PCOLS=['#ff3b30','#2a9df4','#f4d35e','#70e000','#ff70a6','#f0f0f0','#222831','#ee964b','#8e44ad'];
let CAR=store.get('pp_car',{type:'sedan',col:0});if(!VEH[CAR.type])CAR={type:'sedan',col:0};if(!(CAR.col>=0))CAR.col=0;
const carCol=()=>VEH[CAR.type].fixed||PCOLS[CAR.col%PCOLS.length];
