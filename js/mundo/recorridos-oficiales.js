'use strict';
// ===================== RECORRIDOS OFICIALES DE LAS SEDES (DGEV) =====================
// Basados en los recorridos publicados por la Dirección General de Educación Vial (educacionvial.go.cr).
// Calles simplificadas (≈1,2 unidades por metro); puntos de referencia según la descripción oficial.
function buildOficial(D){HW=13;const W=newWorld('of_'+D.id,D.w,D.h);W.limit=D.limit||40;W.oficial=D;if(D.region)W.grass=REGION[D.region].g;W.labels=[];W.parks=[];W.plazas=[];
  const B=b=>{W.obst.push(b);W.blds.push(b);return b};
  for(const st of D.streets){const pts=st.p.length>2&&st.curve?smoothLine(st.p,10):st.p;const pa=addPath(W,pts);pa.hw=st.hw||13;if(st.oneway){pa.oneway=true;pa.noCenter=true}st.pts=pts}
  if(D.patio)W.paved.push({x:D.patio.x,y:D.patio.y,w:PH.w,h:PH.h,tag:'patio'});
  // puntos de referencia (edificios con nombre) y parques
  W.ponds=[];for(const L of D.lm||[]){if(L.park){W.parks.push({x:L.x,y:L.y,w:L.w,h:L.h});W.labels.push({x:L.x+3,y:L.y+3,t:L.t,col:'#fff'});continue}
    if(L.water){W.ponds.push(L);W.obst.push({x:L.x,y:L.y,w:L.w,h:L.h,type:'water'});W.labels.push({x:L.x+3,y:L.y+3,t:L.t,col:'#fff'});continue}
    B({x:L.x,y:L.y,w:L.w,h:L.h,type:'bld',col:L.col||'#e9e4d6',roof:L.roof||'#9aa2a9',label:L.t,H:L.H||14})}
  // casas a ambos lados de cada calle
  const R=rng(D.seed||5),ov=(a,b,m)=>a.x<b.x+b.w+m&&a.x+a.w+m>b.x&&a.y<b.y+b.h+m&&a.y+a.h+m>b.y;
  for(const st of D.streets){if(st.nohouse)continue;const pts=st.pts;let carry=8;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;
    let d=carry;for(;d<L;d+=(st.houseSp||D.houseSp||20)+R()*10){for(const sd of[-1,1]){const off=(st.hw||13)+13+R()*4,cx=a[0]+ux*d-uy*off*sd,cy=a[1]+uy*d+ux*off*sd,w=14+R()*8|0,h=14+R()*6|0;
      const b2={x:cx-w/2|0,y:cy-h/2|0,w,h,type:'bld',house:true,col:pick(D.houseCols||['#f4a261','#e9c46a','#a8dadc','#ffadad','#caffbf','#bdb2ff','#f1faee','#ffd6a5']),roof:pick(['#bc4749','#9c6644','#7f5539','#b5533c','#8d99ae'])};
      if([[b2.x,b2.y],[b2.x+w,b2.y],[b2.x,b2.y+h],[b2.x+w,b2.y+h],[cx,cy]].some(([x,y])=>pavedW(W,x,y)))continue;if(W.blds.some(o=>ov(b2,o,3))||W.parks.some(o=>ov(b2,o,2))||W.ponds.some(o=>ov(b2,o,3)))continue;if(b2.x<4||b2.y<4||b2.x+w>W.w-4||b2.y+h>W.h-4)continue;B(b2)}}carry=d-L}}
  // ALTO en las bocacalles indicadas
  W.pstops=(D.stops||[]).map(([x,y,ux,uy],i)=>({x,y,ux,uy,w:13,code:'altoOf'+i,txt:'No hizo ALTO total en la intersección',minV:99}));
  W.drawExtra=x=>{for(const s of W.pstops){const nx=-s.uy,ny=s.ux;x.fillStyle='#ecece4';for(let k=-12;k<=0;k+=.5)x.fillRect(Math.round(s.x+nx*k),Math.round(s.y+ny*k),2,2);ptext(x,'ALTO',Math.round(s.x-s.ux*9-8+nx*-6),Math.round(s.y-s.uy*9-2+ny*-6),'#ecece4')}
    for(const q of W.ponds){x.fillStyle='#4f6b4a';x.fillRect(q.x-2,q.y-2,q.w+4,q.h+4);x.fillStyle='#5d8aa8';x.fillRect(q.x,q.y,q.w,q.h);x.fillStyle='rgba(255,255,255,.25)';for(let k=6;k<q.h;k+=9)x.fillRect(q.x+4+(k*7)%12,q.y+k,10,1)}
    for(const r of D.rings||[]){x.fillStyle='#5a9a4a';x.beginPath();x.arc(r.x,r.y,r.r-12,0,7);x.fill();x.fillStyle='#ecece4';x.beginPath();x.arc(r.x,r.y,r.r-12,0,7);x.lineWidth=1.5;x.strokeStyle='#ecece4';x.stroke()}
    if(W.patioDraw)W.patioDraw(x);if(D.extra)D.extra(x,W)};
  for(const z of D.zones||[])W.zones.push(z);
  for(const l of D.labels||[])W.labels.push(l);
  if(D.slopes)W.slopes=D.slopes.map(q=>({...q}));
  for(const p of W.parks)addTrees(W,R,10,Object.assign({inside:true},p),3);addTrees(W,R,D.trees||160,{x:0,y:0,w:W.w,h:W.h},16);
  // tráfico en las calles principales (ida y vuelta)
  for(const st of D.streets)if(st.main){const pts=st.pts,loop=pts.concat(pts.slice(1,-1).reverse());spawnOnLoop(W,makePathLoop(loop,6.5),st.main,32,st.types)}
  W.sidewalks=[];W.walkers=[];for(const L of D.lm||[]){if(L.park)continue;const cand=[[[L.x,L.y+L.h+5],[L.x+L.w,L.y+L.h+5]],[[L.x,L.y-5],[L.x+L.w,L.y-5]],[[L.x-5,L.y],[L.x-5,L.y+L.h]],[[L.x+L.w+5,L.y],[L.x+L.w+5,L.y+L.h]]];const sg=cand.find(([a,b])=>[a,b,[(a[0]+b[0])/2,(a[1]+b[1])/2]].every(q=>!pavedW(W,q[0],q[1])&&!W.blds.some(o=>o!==L&&q[0]>o.x-2&&q[0]<o.x+o.w+2&&q[1]>o.y-2&&q[1]<o.y+o.h+2)));if(sg)for(let k=0;k<2;k++)W.walkers.push({r:{seg:sg},s:Math.random()*100,sp:3+Math.random()*3,an:0,x:0,y:0,col:pick(CARCOLS)})}
  if(D.patio)buildPatioHeredia(W,D.patio);
  if(D.yard){W.paved.push({x:200,y:120,w:330,h:170,tag:'yard'});for(let k=0;k<6;k++){const cx=270+k*40,cy=k%2?160:200;W.cones.push({x:cx,y:cy-14,vx:0,vy:0,hit:false},{x:cx,y:cy+14,vx:0,vy:0,hit:false})}}
  W.spawn=D.start;W.dests=[{n:D.n,x:D.start.x,y:D.start.y}];W.jay=null;return W}
function oficialStreet(D){const T=D.route.map(r=>({txt:r.t,tgt:{x:r.x,y:r.y},check(){return Math.hypot(S.P.x-r.x,S.P.y-r.y)<22}}));const E=D.route[D.route.length-1];
  T.push({txt:'Llegue frente a la Regional de Educación Vial y deténgase por completo para terminar.',tgt:{x:E.x,y:E.y},check(){return still('finOf',Math.hypot(S.P.x-E.x,S.P.y-E.y)<24,1)}});return T}
function oficialTasks(){const D=S.W.oficial,T=oficialStreet(D);if(D.patio){T[0].txt='EN CALLE: '+T[0].txt;return patioTasks().concat(T)}T[0].txt='RECORRIDO OFICIAL '+D.n+': póngase el cinturón [C]. '+T[0].txt;return T}
const OFICIALES={
  sanramon:{id:'sanramon',n:'SAN RAMÓN',w:1600,h:900,seed:21,limit:40,
    streets:[{p:[[100,300],[1560,300]],main:4,types:['bus',null,'moto',null]},{p:[[60,180],[1560,180]]},{p:[[60,420],[900,420]]},{p:[[60,540],[900,540]]},{p:[[60,660],[900,660]]},
      {p:[[180,100],[180,780]]},{p:[[300,100],[300,780]],main:2},{p:[[420,100],[420,780]]},{p:[[540,100],[540,780]]},{p:[[660,100],[660,780]]},{p:[[900,100],[900,700]]},{p:[[1260,180],[1260,300]]}],
    lm:[{x:1278,y:220,w:100,h:62,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:700,y:205,w:180,h:70,t:'HOSPITAL C.L. VALVERDE VEGA',col:'#eef2f5',roof:'#8d99ae',H:24},
      {x:197,y:207,w:86,h:66,t:'ESC. J.J. SALAS',col:'#f2e8cf',roof:'#bc4749',H:10},{x:197,y:557,w:86,h:86,park:1,t:'PLAZA LA SABANA'},{x:320,y:560,w:50,h:30,t:'MAYCA',col:'#ffd23f',roof:'#c1121f',H:9},{x:30,y:560,w:130,h:40,t:'CAI',col:'#cfd6da',roof:'#5c677d',H:9}],
    stops:[[300,287,0,1],[300,553,0,-1],[420,673,0,-1],[287,540,1,0]],
    zones:[{x:150,y:160,w:300,h:180,limit:25,name:'ESCUELA'},{x:680,y:160,w:240,h:160,limit:25,name:'HOSPITAL'}],
    labels:[{x:950,y:310,t:'AVENIDA 11',col:'#fff'},{x:305,y:700,t:'CALLE 12',col:'#fff',rot:1},{x:425,y:700,t:'CALLE 10',col:'#fff',rot:1},{x:620,y:670,t:'AVENIDA 5',col:'#fff'},{x:620,y:550,t:'AVENIDA 7',col:'#fff'}],
    start:{x:1240,y:307,h:Math.PI},
    route:[{x:300,y:307,t:'Salga hacia el OESTE por la Avenida 11, pase frente al Hospital Carlos Luis Valverde Vega (zona de 25 km/h) hasta la esquina de la Escuela José Joaquín Salas.'},
      {x:307,y:660,t:'Doble a la IZQUIERDA (sur) por la Calle 12, 300 metros, hasta la Avenida 5.'},
      {x:420,y:653,t:'Doble a la IZQUIERDA (este) por la Avenida 5, 100 metros, hasta la Calle 10.'},
      {x:413,y:540,t:'Doble a la IZQUIERDA (norte) por la Calle 10, 100 metros, hasta la Avenida 7.'},
      {x:300,y:533,t:'Doble a la IZQUIERDA (oeste) por la Avenida 7, 100 metros, hasta la esquina de MAYCA (calle 12).'},
      {x:293,y:300,t:'Doble a la DERECHA (norte) por la Calle 12, 200 metros, hasta la Escuela José Joaquín Salas.'},
      {x:1230,y:293,t:'Doble a la DERECHA (este) y regrese 800 metros por la Avenida 11 hasta la Regional de Educación Vial.'}]},
  alajuela:{id:'alajuela',n:'ALAJUELA',w:1100,h:1800,seed:33,limit:40,
    streets:[{p:[[40,300],[1060,300]],main:3},{p:[[40,180],[1060,180]]},{p:[[40,420],[1060,420]]},{p:[[40,1620],[1060,1620]],main:3},{p:[[200,900],[1060,900]]},{p:[[200,1260],[1060,1260]]},
      {p:[[300,60],[300,1760]],main:4,types:['bus',null,'moto',null]},{p:[[420,60],[420,900]]},{p:[[540,60],[540,900]]},{p:[[660,60],[660,900]]},{p:[[780,60],[780,1760]]},{p:[[900,60],[900,1760]]},{p:[[200,60],[200,1760]]}],
    lm:[{x:740,y:1640,w:110,h:60,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:316,y:196,w:90,h:90,t:'MUTUAL ALAJUELA',col:'#eef2f5',roof:'#2a9d8f',H:20},{x:796,y:196,w:90,h:90,t:'INA',col:'#f2e8cf',roof:'#1d3557',H:14},
      {x:796,y:316,w:90,h:90,park:1,t:'PARQUE CRISTO REY'},{x:676,y:76,w:90,h:90,t:'SERVICENTRO',col:'#e63946',roof:'#f1f1f1',H:8},{x:216,y:1636,w:70,h:40,t:'BAR MANCHESTER',col:'#9c6644',roof:'#5c4b37',H:8}],
    stops:[[300,313,0,-1],[787,300,-1,0],[780,193,0,-1],[667,180,-1,0],[660,287,0,1],[300,1607,0,1]],
    labels:[{x:305,y:1000,t:'CALLE 24',col:'#fff',rot:1},{x:500,y:310,t:'AVENIDA 1',col:'#fff'},{x:560,y:190,t:'AVENIDA 3',col:'#fff'},{x:785,y:600,t:'CALLE 16',col:'#fff',rot:1},{x:665,y:600,t:'CALLE 18',col:'#fff',rot:1}],
    start:{x:760,y:1613,h:Math.PI},
    route:[{x:300,y:1613,t:'Salga hacia el OESTE 400 metros hasta la Calle 24.'},{x:307,y:300,t:'Doble a la DERECHA (norte) y suba 1100 metros por la Calle 24, por el costado oeste de la Mutual Alajuela, hasta la Avenida 1.'},
      {x:780,y:307,t:'Doble a la DERECHA (este) por la Avenida 1 hasta el Parque Cristo Rey (Calle 16).'},{x:787,y:180,t:'Doble a la IZQUIERDA (norte) por la Calle 16, frente al INA, hasta la Avenida 3.'},
      {x:660,y:173,t:'Doble a la IZQUIERDA (oeste) por la Avenida 3, frente a la estación de servicio Cristo Rey.'},{x:653,y:300,t:'Doble a la IZQUIERDA (sur) por la Calle 18 hasta la Avenida 1.'},
      {x:300,y:293,t:'Doble a la DERECHA (oeste) por la Avenida 1, pasando detrás de la Mutual, hasta la Calle 24.'},{x:293,y:1620,t:'Doble a la IZQUIERDA (sur) y baje 1100 metros por la Calle 24 hasta el Bar Manchester.'},
      {x:760,y:1627,t:'Doble a la IZQUIERDA (este) 400 metros hasta el MOPT (Regional de Educación Vial).'}]},
  cartago:{id:'cartago',n:'CARTAGO',w:1000,h:1700,seed:44,limit:40,
    streets:[{p:[[600,40],[600,1200]],main:3,types:['bus',null,'pickup',null]},{p:[[600,1200],[600,1560]],main:1},{p:[[600,1200],[440,1370]],nohouse:false},{p:[[440,1370],[600,1500]]},{p:[[200,230],[600,230]],hw:12,nohouse:true}],
    lm:[{x:620,y:180,w:110,h:70,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:438,y:1462,w:80,h:50,t:'ESC. DE SORDOS',col:'#f2e8cf',roof:'#bc4749',H:10}],
    stops:[[600,1187,0,1],[453,1356,.7,-.7]],
    labels:[{x:610,y:700,t:'RUTA 228',col:'#fff',rot:1},{x:612,y:1190,t:'Y GRIEGA',col:'#ffd23f'},{x:470,y:1280,t:'DIAGONAL 13',col:'#fff'},{x:520,y:1450,t:'CALLE 14',col:'#fff'},{x:612,y:1350,t:'CALLE 2',col:'#fff',rot:1},{x:220,y:110,t:'CIRCUITO INTERNO',col:'#ffd23f'}],
    extra(x,W){x.fillStyle='#55585e';x.fillRect(200,120,330,170);x.fillStyle='#ecece4';x.fillRect(200,120,330,1);x.fillRect(200,289,330,1)},
    yard:true,start:{x:230,y:237,h:0},
    route:[{x:300,y:180,t:'CIRCUITO INTERNO: pase el zigzag de conos sin tocarlos.'},{x:470,y:180,t:'Siga por el circuito interno y salga hacia la Ruta 228.'},
      {x:607,y:240,t:'Salga a la DERECHA (sur) por la Ruta 228 (ceda el paso al salir) y avance 800 metros.'},{x:607,y:1190,t:'Llegue a la Y GRIEGA.'},
      {x:450,y:1360,t:'Doble a la DERECHA por la Diagonal 13 (suroeste), 200 metros.'},{x:590,y:1490,t:'Doble a la IZQUIERDA por la Calle 14 hasta la Escuela de Sordos.'},
      {x:607,y:1250,t:'Doble a la IZQUIERDA (norte) por la Calle 2 hasta la Y griega.'},{x:607,y:260,t:'Siga al NORTE 800 metros por la Ruta 228 hasta la Regional de Educación Vial.'}]},
  heredia:{id:'heredia',n:'HEREDIA',w:1100,h:1250,seed:55,limit:40,
    streets:[{p:[[300,30],[310,110],[330,250],[380,420],[430,560],[470,700],[520,830],[560,960],[600,1100],[640,1220]],curve:1,main:5,types:['bus',null,'moto',null,'pickup']},
      {p:[[310,110],[240,150],[160,190],[90,210]],curve:1},{p:[[104,206],[94,240],[72,268],[66,292],[74,304],[86,304]],curve:1,hw:11,nohouse:true},{p:[[82,328],[40,326],[26,300],[26,250],[50,224],[90,210]],curve:1,hw:12,nohouse:true,noCenter:true,oneway:true},{p:[[475,715],[720,715]]},{p:[[720,715],[720,595]]},{p:[[720,595],[445,595]]},{p:[[380,420],[700,330]],curve:0},{p:[[430,560],[200,640]]},{p:[[560,960],[800,960]]}],
    lm:[{x:160,y:225,w:100,h:58,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:335,y:85,w:60,h:30,t:'TRES MARIAS',col:'#f4f1de',roof:'#9c6644',H:8},{x:338,y:508,w:52,h:30,t:'SUPERCORNER',col:'#ffd23f',roof:'#c1121f',H:9},
      {x:495,y:660,w:60,h:34,t:'SUPER SANCHEZ',col:'#a8dadc',roof:'#1d3557',H:9},{x:624,y:1056,w:110,h:50,t:'TERMINAL LA FORTALEZA',col:'#cfd6da',roof:'#5c677d',H:10},{x:436,y:884,w:80,h:70,park:1,t:'LA HERRADURA'}],
    stops:[[462,715,1,0],[458,595,-1,0],[296,118,.9,-.4]],
    labels:[{x:395,y:470,t:'RUTA 126',col:'#fff',rot:1},{x:150,y:160,t:'CALLE LA AMADA',col:'#fff'},{x:480,y:440,t:'CALLE EL TANQUE',col:'#fff'},{x:520,y:605,t:'PUENTE SALAS',col:'#fff'}],
    patio:{x:70,y:290,esp:{x:26,y:262}},start:{x:96,y:232,h:1.86},
    route:[{x:300,y:118,t:'Salga hacia el ESTE por la Calle La Amada hasta la Ruta 126 (Las Tres Marías). ALTO antes de salir.'},
      {x:470,y:705,t:'Doble a la DERECHA (sur) y baje por la Ruta 126 con sus curvas hasta el Súper Sánchez.'},
      {x:715,y:708,t:'Doble a la IZQUIERDA (este) 200 metros.'},{x:713,y:600,t:'Doble a la IZQUIERDA (norte) 100 metros.'},{x:450,y:600,t:'Doble a la IZQUIERDA (oeste) y regrese a la Ruta 126.'},
      {x:310,y:115,t:'Doble a la DERECHA (norte) por la Ruta 126 hasta Las Tres Marías.'},{x:160,y:195,t:'Doble a la IZQUIERDA por la Calle La Amada hasta la Regional de Licencias de Heredia.'}]},
  perez:{id:'perez',n:'PÉREZ ZELEDÓN',region:'montana',w:1500,h:1050,seed:61,limit:40,
    streets:[{p:[[1460,110],[1300,250],[1150,400],[950,560],[700,700],[450,800],[180,900]],curve:1,main:4,types:['bus',null,'pickup',null]},
      {p:[[1150,400],[1380,640]]},{p:[[1380,640],[1150,860]],main:1},{p:[[1150,860],[900,905],[650,885],[450,800]],curve:1},
      {p:[[1150,400],[980,250]]},{p:[[700,700],[780,895]]},{p:[[950,560],[1265,750]]},{p:[[1380,640],[1480,560]]}],
    lm:[{x:1180,y:180,w:95,h:55,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:1400,y:640,w:85,h:90,park:1,t:'ESTADIO MUNICIPAL'},
      {x:1290,y:760,w:80,h:45,t:'CLINICA DE URGENCIAS',col:'#eef2f5',roof:'#c1121f',H:12},{x:1170,y:880,w:90,h:50,t:'ESC. ENSENANZA ESPECIAL',col:'#f2e8cf',roof:'#bc4749',H:9},
      {x:800,y:935,w:150,h:70,water:1,t:'LAGUNA DE OXIDACION'},{x:760,y:540,w:90,h:50,t:'COLEGIO LA ASUNCION',col:'#f4f1de',roof:'#1d3557',H:12},
      {x:955,y:400,w:95,h:50,t:'COLEGIO R.A. CALDERON G.',col:'#f2e8cf',roof:'#9c6644',H:12}],
    stops:[[1366,626,.69,.72],[468,808,-.92,-.39]],
    zones:[{x:730,y:380,w:360,h:340,limit:25,name:'COLEGIOS'}],
    slopes:[{seg:[1150,400,950,560],hw:18,grade:.08,n:'8%'},{seg:[950,560,700,700],hw:18,grade:.08,n:'8%'}],
    labels:[{x:560,y:740,t:'RUTA 243',col:'#fff'},{x:1255,y:490,t:'AVENIDA 12',col:'#fff'},{x:1150,y:780,t:'CALLE CENTRAL',col:'#fff'},{x:380,y:760,t:'EL HOYON',col:'#ffd23f'},{x:840,y:610,t:'PENDIENTE 8%',col:'#ffd23f'}],
    start:{x:1255,y:295,h:2.356},
    route:[{x:1150,y:400,t:'Salga a la DERECHA (suroeste) por la Ruta 243, 100 metros, hasta la Avenida 12.'},
      {x:1380,y:640,t:'Doble a la IZQUIERDA por la Avenida 12 hasta el cruce del Estadio Municipal. ALTO.'},
      {x:1150,y:860,t:'Doble a la DERECHA por la Calle Central, frente a la Clínica de Urgencias, hasta la Escuela de Enseñanza Especial.'},
      {x:450,y:800,t:'Siga a la DERECHA, pase frente a la Laguna de Oxidación y llegue al cruce de El Hoyón con la Ruta 243. ALTO.'},
      {x:950,y:560,t:'Doble a la DERECHA (noreste) y suba la pendiente de la Ruta 243 frente al Colegio La Asunción. En la subida, no deje que el carro se vaya para atrás.'},
      {x:1255,y:295,t:'Siga por la Ruta 243, frente al Colegio Rafael Ángel Calderón Guardia, hasta la Regional de Educación Vial.'}]},
  rioclaro:{id:'rioclaro',n:'RÍO CLARO',w:1500,h:820,seed:72,limit:40,
    streets:[{p:[[30,620],[1470,620]],main:5,types:['truck','bus',null,'pickup',null]},{p:[[1200,40],[1200,790]],main:1},{p:[[600,60],[600,620]]},{p:[[240,330],[240,790]]},{p:[[420,230],[420,620]]},
      {p:[[900,230],[900,790]]},{p:[[240,230],[1320,230]]},{p:[[240,330],[600,330]]},{p:[[240,450],[900,450]]}],
    lm:[{x:470,y:70,w:110,h:60,t:'PLANTEL DE PRUEBAS',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:1220,y:250,w:70,h:50,t:'ANTIGUA CRUZ ROJA',col:'#f4f1de',roof:'#c1121f',H:9},
      {x:150,y:640,w:75,h:45,t:'BANCO NACIONAL',col:'#eef2f5',roof:'#2a9d8f',H:12},{x:440,y:350,w:140,h:80,park:1,t:'PLAZA DE DEPORTES'},{x:440,y:250,w:90,h:60,t:'IGLESIA MORMONA',col:'#f1faee',roof:'#8d99ae',H:14}],
    stops:[[1200,598,0,1],[600,252,0,-1]],
    labels:[{x:700,y:630,t:'RUTA NACIONAL 2',col:'#fff'},{x:1205,y:90,t:'A SAN RAMON',col:'#fff',rot:1},{x:905,y:660,t:'RUTA 14 A GOLFITO',col:'#fff',rot:1}],
    start:{x:600,y:110,h:Math.PI/2},
    route:[{x:600,y:230,t:'Salga del plantel hacia el SUR 100 metros.'},{x:1200,y:230,t:'Doble a la IZQUIERDA (este) unos 500 metros hasta la antigua Cruz Roja (carretera a San Ramón).'},
      {x:1200,y:620,t:'Doble a la DERECHA (sur) 250 metros hasta la Ruta Nacional 2. ALTO.'},{x:240,y:620,t:'Doble a la DERECHA (oeste) por la Ruta 2, unos 800 metros, hasta el Banco Nacional. Cuidado con los camiones.'},
      {x:240,y:450,t:'Doble a la DERECHA (norte) 200 metros.'},{x:420,y:450,t:'Doble a la DERECHA (este) hasta la Plaza de Deportes.'},
      {x:420,y:330,t:'Doble a la IZQUIERDA (norte) 300 metros.'},{x:600,y:330,t:'Doble a la DERECHA (este) frente a la Iglesia de los Mormones.'},
      {x:600,y:120,t:'Doble a la IZQUIERDA (norte) hasta el Plantel de Pruebas. ALTO en la esquina.'}]},
  sancarlos:{id:'sancarlos',n:'SAN CARLOS',w:1500,h:950,seed:83,limit:40,
    streets:[{p:[[400,450],[1460,450]],main:3,types:['bus',null,'pickup']},{p:[[1400,380],[1400,910]]},{p:[[1240,850],[1460,850]]},{p:[[1300,640],[1300,910]]},{p:[[840,700],[1360,700]]},
      {p:[[900,60],[900,760]],main:2},{p:[[700,200],[960,200]]},{p:[[750,140],[750,500]]},{p:[[450,60],[450,500]]},{p:[[400,100],[960,100]]}],
    lm:[{x:1180,y:370,w:100,h:60,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:1330,y:380,w:55,h:50,t:'SUPER MANOLOS',col:'#ffd23f',roof:'#c1121f',H:9},
      {x:1050,y:478,w:180,h:70,park:1,t:'PARQUE'},{x:1090,y:560,w:100,h:120,t:'IGLESIA CATOLICA',col:'#f1eee4',roof:'#9aa2a9',H:22},
      {x:770,y:225,w:112,h:200,park:1,t:'PLAZA DE DEPORTES'},{x:520,y:370,w:120,h:60,t:'UNIVERSIDAD SAN JOSE',col:'#eef2f5',roof:'#1d3557',H:16},{x:340,y:200,w:95,h:80,t:'INA',col:'#f2e8cf',roof:'#2a9d8f',H:12}],
    stops:[[884,100,1,0]],
    slopes:[{seg:[1300,850,1300,700],hw:16,grade:.10,n:'10%'},{seg:[900,100,900,440],hw:16,grade:.06,n:'6%'}],
    labels:[{x:1405,y:640,t:'CALLE COLON',col:'#fff',rot:1},{x:1310,y:862,t:'CALLE TAPIR',col:'#fff'},{x:720,y:186,t:'AVENIDA 4',col:'#fff'},{x:755,y:300,t:'AV. 8 ALBAN PEREIRA',col:'#fff',rot:1},
      {x:455,y:250,t:'CALLE EL INA',col:'#fff',rot:1},{x:560,y:86,t:'CALLE CANTARRANA',col:'#fff'},{x:1305,y:760,t:'BAJADA 10%',col:'#ffd23f',rot:1}],
    start:{x:1240,y:457,h:0},
    route:[{x:1400,y:450,t:'Salga hacia el ESTE 150 metros hasta el antiguo Súper Manolos.'},{x:1400,y:850,t:'Doble a la DERECHA (sur) por la Calle Colón, 400 metros.'},
      {x:1300,y:850,t:'Doble a la DERECHA (oeste) por la Calle Tapir, 100 metros.'},{x:1300,y:700,t:'Doble a la DERECHA (norte) y baje 150 metros por detrás de la Iglesia Católica.'},
      {x:900,y:700,t:'Doble a la IZQUIERDA (oeste) 400 metros por la calle de debajo de la iglesia.'},{x:900,y:200,t:'Doble a la DERECHA (norte) 500 metros por la calle frente a la Plaza de Deportes.'},
      {x:750,y:200,t:'Doble a la IZQUIERDA (oeste) 150 metros por la Avenida 4.'},{x:750,y:450,t:'Doble a la IZQUIERDA (sur) 250 metros por la Avenida 8 (calle Albán Pereira).'},
      {x:450,y:450,t:'Doble a la DERECHA (oeste) 300 metros, detrás de la Universidad de San José.'},{x:450,y:100,t:'Doble a la DERECHA (norte) 350 metros por la calle del INA.'},
      {x:900,y:100,t:'Doble a la DERECHA (este) 450 metros por la Calle Cantarrana hasta el ALTO.'},{x:900,y:700,t:'Doble a la DERECHA (sur) 500 metros por la calle frente a la Plaza de Deportes.'},
      {x:1300,y:700,t:'Doble a la IZQUIERDA (este) 400 metros por la calle de debajo de la iglesia.'},{x:1300,y:850,t:'Doble a la DERECHA (sur) 150 metros por detrás de la iglesia (subida).'},
      {x:1400,y:850,t:'Doble a la IZQUIERDA (este) 100 metros por la Calle Tapir.'},{x:1400,y:450,t:'Doble a la IZQUIERDA (norte) 400 metros por la Calle Colón.'},
      {x:1240,y:457,t:'Doble a la IZQUIERDA (oeste) 150 metros hasta la Regional de Educación Vial.'}]},
  guapiles:{id:'guapiles',n:'GUÁPILES',region:'caribe',w:1500,h:920,seed:94,limit:40,
    streets:[{p:[[30,400],[1470,400]],main:5,types:['truck','bus',null,'pickup',null]},{p:[[500,300],[500,760]]},{p:[[740,60],[740,900]],main:1},{p:[[380,640],[900,640]]},
      {p:[[600,250],[1100,250]]},{p:[[600,120],[1100,120]]},{p:[[1100,60],[1100,700]],main:1}],
    lm:[{x:760,y:790,w:100,h:60,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:560,y:555,w:120,h:65,t:'TRIBUNALES DE JUSTICIA',col:'#eef2f5',roof:'#5c677d',H:16},
      {x:760,y:420,w:110,h:70,t:'MAXIPALI',col:'#ffd23f',roof:'#e63946',H:10},{x:620,y:135,w:100,h:45,t:'SUPER BATERIAS',col:'#a8dadc',roof:'#1d3557',H:8},
      {x:1115,y:60,w:70,h:45,t:'BAR MONTECARLO',col:'#9c6644',roof:'#5c4b37',H:8},{x:1115,y:265,w:70,h:45,t:'MOTOS HONDA',col:'#f1faee',roof:'#c1121f',H:8},
      {x:620,y:265,w:100,h:55,t:'PLANTEL GUAPILENOS',col:'#cfd6da',roof:'#2a9d8f',H:9}],
    stops:[[500,422,0,-1],[740,380,0,1],[740,142,0,-1]],
    labels:[{x:150,y:410,t:'RUTA NACIONAL 32',col:'#fff'},{x:1105,y:500,t:'RUTA 247',col:'#fff',rot:1},{x:400,y:652,t:'AVENIDA 32',col:'#fff'},{x:505,y:470,t:'CALLE 7',col:'#fff',rot:1},
      {x:745,y:700,t:'CALLE 11',col:'#fff',rot:1},{x:850,y:236,t:'AVENIDA 10',col:'#fff'}],
    start:{x:747,y:830,h:-Math.PI/2},
    route:[{x:740,y:640,t:'Salga hacia el NORTE por la Calle 11 hasta la Avenida 32 (Tribunales de Justicia).'},{x:500,y:640,t:'Doble a la IZQUIERDA (oeste) 200 metros hasta la Calle 7.'},
      {x:500,y:400,t:'Doble a la DERECHA (norte) por la Calle 7 hasta la Ruta 32. ALTO.'},{x:740,y:400,t:'Doble a la DERECHA (este) por la Ruta 32, 200 metros, hasta el cruce de MaxiPalí.'},
      {x:740,y:120,t:'Doble a la IZQUIERDA (norte) por la Calle 11 hasta el Súper Baterías. ALTO.'},{x:1100,y:120,t:'Doble a la DERECHA (este) hasta el Bar Montecarlo.'},
      {x:1100,y:250,t:'Doble a la DERECHA (sur) por la Ruta 247 hasta Motos Honda.'},{x:740,y:250,t:'Doble a la DERECHA (oeste) por la Avenida 10 hasta el plantel de Guapileños.'},
      {x:740,y:400,t:'Doble a la IZQUIERDA (sur) por la Calle 11 hasta la Ruta 32. ALTO.'},{x:500,y:400,t:'Doble a la DERECHA (oeste) por la Ruta 32, 200 metros.'},
      {x:500,y:640,t:'Doble a la IZQUIERDA (sur) por la Calle 7 hasta la Avenida 32.'},{x:740,y:640,t:'Doble a la IZQUIERDA (este) por la Avenida 32, frente a los Tribunales de Justicia.'},
      {x:740,y:820,t:'Doble a la DERECHA (sur) por la Calle 11 hasta la Regional de Educación Vial.'}]},
  nicoya:{id:'nicoya',n:'NICOYA',region:'seco',w:1450,h:1250,seed:105,limit:40,
    streets:[{p:[[100,355],[640,760],[1000,1030],[1092,1099],[1188,1171],[1290,1247]],main:4,types:['bus',null,'pickup',null]},
      {p:[[1188,1171],[1332,979]]},{p:[[1332,979],[1236,907]]},{p:[[1236,907],[1092,1099]]},
      {p:[[640,760],[1100,760]]},{p:[[760,300],[760,760]]},{p:[[880,300],[880,760]]},{p:[[1000,300],[1000,1030]]},{p:[[600,400],[1100,400]]},{p:[[600,650],[1100,650]]}],
    lm:[{x:960,y:1100,w:70,h:50,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:1182,y:1014,w:60,h:50,t:'BUSES RYOZUMO',col:'#cfd6da',roof:'#2a9d8f',H:9},
      {x:775,y:415,w:90,h:110,park:1,t:'PARQUE DE NICOYA'},{x:785,y:540,w:70,h:95,t:'IGLESIA COLONIAL',col:'#f4f1de',roof:'#9c6644',H:16},{x:895,y:415,w:90,h:60,t:'BIBLIOTECA',col:'#eef2f5',roof:'#5c677d',H:10}],
    stops:[[1102,1086,-.6,.8],[1000,1010,0,1]],
    labels:[{x:330,y:500,t:'RUTA 150',col:'#fff'},{x:660,y:772,t:'AVENIDA 4',col:'#fff'},{x:885,y:300,t:'CALLE 7',col:'#fff',rot:1},{x:1005,y:830,t:'CALLE 9',col:'#fff',rot:1},
      {x:1010,y:662,t:'AVENIDA 2',col:'#fff'},{x:200,y:330,t:'AEROPUERTO',col:'#ffd23f'}],
    start:{x:1036,y:1057,h:.6435},
    route:[{x:1188,y:1171,t:'Salga a la DERECHA (sur) por la Ruta 150, 150 metros, hasta el plantel de buses Ryozumo.'},{x:1332,y:979,t:'Doble a la IZQUIERDA 200 metros.'},
      {x:1236,y:907,t:'Doble a la IZQUIERDA 100 metros.'},{x:1092,y:1099,t:'Doble a la IZQUIERDA 200 metros hasta la Ruta 150. ALTO.'},
      {x:640,y:760,t:'Doble a la DERECHA por la Ruta 150, hacia el centro de Nicoya, hasta la Avenida 4.'},{x:760,y:760,t:'Doble a la DERECHA 100 metros.'},
      {x:760,y:400,t:'Doble a la IZQUIERDA (norte) 300 metros, junto al parque.'},{x:880,y:400,t:'Doble a la DERECHA 100 metros hasta la Calle 7.'},
      {x:880,y:650,t:'Doble a la DERECHA (sur) por la Calle 7, 250 metros, hasta la Avenida 2.'},{x:1000,y:650,t:'Doble a la IZQUIERDA 100 metros hasta la Calle 9.'},
      {x:1000,y:1030,t:'Doble a la DERECHA (sur) por la Calle 9, 300 metros, hasta la Ruta 150. ALTO.'},{x:1036,y:1057,t:'Doble a la IZQUIERDA por la Ruta 150 hasta la Regional de Educación Vial.'}]},
  liberia:{id:'liberia',n:'LIBERIA',region:'seco',w:2000,h:700,seed:116,limit:60,houseSp:90,trees:260,houseCols:['#f4a261','#e9c46a','#f1faee','#ffd6a5','#caffbf'],
    streets:[{p:[[1960,350],[1600,332],[1200,378],[800,342],[500,360],[315,360]],curve:1,main:6,types:['truck','bus',null,'pickup',null,null]},
      {p:[[315.0,360.0],[313.1,374.2],[307.6,387.5],[298.9,398.9],[287.5,407.6],[274.2,413.1],[260.0,415.0],[245.8,413.1],[232.5,407.6],[221.1,398.9],[212.4,387.5],[206.9,374.2],[205.0,360.0],[206.9,345.8],[212.4,332.5],[221.1,321.1],[232.5,312.4],[245.8,306.9],[260.0,305.0],[274.2,306.9],[287.5,312.4],[298.9,321.1],[307.6,332.5],[313.1,345.8],[315.0,360.0]],hw:11,nohouse:true},{p:[[260,305],[260,60]]},{p:[[205,360],[30,360]]},{p:[[260,415],[260,660]]}],
    rings:[{x:260,y:360,r:55}],
    lm:[{x:1720,y:240,w:110,h:60,t:'EDUCACION VIAL',col:'#f2e8cf',roof:'#1d4e89',H:12},{x:300,y:120,w:120,h:70,t:'OFICENTRO SOLARIUM',col:'#eef2f5',roof:'#5c677d',H:18}],
    zones:[{x:180,y:280,w:160,h:160,limit:30,name:'ROTONDA'}],
    labels:[{x:1000,y:315,t:'RUTA 21',col:'#fff'},{x:1880,y:322,t:'A LIBERIA',col:'#fff'},{x:40,y:340,t:'A EL COCO',col:'#fff'},{x:200,y:470,t:'SOLARIUM',col:'#ffd23f'}],
    start:{x:1760,y:345,h:Math.PI},
    route:[{x:360,y:358,t:'Salga hacia el OESTE por la Ruta 21 (carretera a El Coco) hasta la rotonda del Solarium. Máximo 60 km/h.'},
      {x:299,y:321,t:'Entre a la rotonda: ceda el paso a quien ya va adentro y gire a la DERECHA (contra las manecillas del reloj).'},
      {x:221,y:399,t:'Siga dentro de la rotonda: pase la 1.ª, la 2.ª y la 3.ª salida.'},
      {x:299,y:399,t:'Ponga la direccional derecha y tome la 4.ª salida (por donde entró).'},
      {x:430,y:360,t:'Vire a la DERECHA a la Ruta 21, carretera a Liberia.'},
      {x:1760,y:345,t:'Regrese por la Ruta 21 hasta la Regional de Educación Vial de Liberia.'}]},};
