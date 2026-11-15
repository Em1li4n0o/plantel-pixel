'use strict';
// ===================== RUTAS EMBLEMÁTICAS =====================
// CENTRO DE SAN JOSÉ: cuadrícula y sentidos tomados de OpenStreetMap (girada ~6° para dejarla recta). 1 m ≈ 1,8 unidades.
function buildCentro(){HW=14;
  const W=newWorld('centro',2622,1717);W.limit=40;const E=W.w,H2=W.h;
  const h=(cc,a,b,ow)=>{addRoad(W,'h',cc,a,b).ow=ow},v=(cc,a,b,ow)=>{addRoad(W,'v',cc,a,b).ow=ow};
  // avenidas (de norte a sur): 7, 5, 3, 1, Central (peatonal salvo calles 9-13), 2, 4 (peatonal), 6, 8, 10
  h(80,0,E,0);h(238,0,1746,1);h(417,0,1566,-1);h(417,1895,E,-1);h(591,0,E,-1);h(757,1895,2310,1);h(940,0,E,1);h(1232,0,E,-1);h(1439,0,E,-1);h(1637,0,E,0);
  // calles (de oeste a este): 12, 10, 8, 6, 4, 2, Central, 1, 3, 5, 7, 9, 11, 13, 15
  v(80,0,H2,0);v(222,0,H2,1);v(381,0,H2,-1);v(550,0,H2,1);v(708,0,H2,-1);v(883,0,431,1);v(883,1218,H2,1);v(1050,0,H2,-1);v(1225,0,H2,1);v(1366,0,605,-1);v(1366,1218,H2,1);
  v(1552,0,H2,-1);v(1732,0,252,-1);v(1732,577,H2,1);v(1909,0,954,1);v(2100,0,H2,-1);v(2296,0,H2,-1);v(2542,0,H2,0);
  W.inter=cityGraph(W);for(const[x,y]of W.inter)addNode(W,x,y);oneWayFix(W);
  const xb=[-14,80,222,381,550,708,883,1050,1225,1366,1552,1732,1909,2100,2296,2542,2636],yb=[-14,80,238,417,591,757,940,1106,1232,1439,1637,1731];
  const R=rng(11);W.parks=[];W.plazas=[];W.fountains=[];W.labels=[];const B=b=>{W.obst.push(b);W.blds.push(b);return b};
  W.stalls=[];W.birds=[];W.flags=[];
  const stalls=(x0,y0,x1,y1,n)=>{for(let i=0;i<n;i++){const t=(i+.5)/n;W.stalls.push({x:x0+(x1-x0)*t|0,y:y0+(y1-y0)*t|0,col:pick(['#e63946','#2a9df4','#f4d35e','#2ec4b6','#ff70a6','#70e000','#ee964b'])})}};
  const birds=(x,y,w,h,n)=>{for(let i=0;i<n;i++)W.birds.push({hx:x+R()*w,hy:y+R()*h,x:0,y:0,z:0,fly:0,t:R()*9});for(const b of W.birds){if(!b.x){b.x=b.hx;b.y=b.hy}}};
  // Edificios emblemáticos (z en unidades; 1 piso ≈ 5). Ubicados en su cuadra real.
  const LMB={
    '1366,757':(ix1,iy1,ix2,iy2)=>{// TEATRO NACIONAL y Plaza de la Cultura (Calles 3-5, Av. Central-2)
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:66},{x:ix1,y:iy1+66,w:18,h:iy2-iy1-66});W.labels.push({x:ix1+3,y:iy1+3,t:'PLAZA DE LA CULTURA',col:'#5c4b37'});birds(ix1+6,iy1+12,ix2-ix1-12,46,26);
      const CR='#eadcb9',RF='#7f8f7d',WH='#f7f0dd';
      addLM(W,[PB(1408,848,96,68,0,26,CR,{top:RF,win:'classic'}),PB(1404,864,10,36,0,30,'#efe3c4',{top:'#76887a',win:'classic'}),PB(1504,852,24,60,0,22,'#e3d4b0',{top:RF,win:'classic'}),
        ...pCols(1402,867,1402,897,6,20,WH),PB(1400,864,4,36,20,23,WH),PB(1400,872,4,20,23,26,WH),PB(1400,878,4,8,26,28,WH),
        PB(1470,852,30,60,26,38,'#e2d3b0',{top:'#6f8370'}),PB(1408,868,14,32,30,33,'#efe3c4',{top:'#76887a'}),
        PB(1413,882,1.4,1.4,33,39,'#e9e2c8',{s:'stat'}),PB(1413,870,1.4,1.4,33,37.5,'#e9e2c8',{s:'stat'}),PB(1413,896,1.4,1.4,33,37.5,'#e9e2c8',{s:'stat'}),
        ...pCols(1412,917,1500,917,10,22,WH)],{label:'TEATRO NACIONAL'});W.flags.push({x:1486,y:882,z:44})},
    '1366,940':(ix1,iy1,ix2,iy2,mx,my)=>{// TORRE PULZAR SOLUTIONS (rascacielos moderno al sur del Teatro)
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});W.fountains.push({x:ix1+12,y:iy1+12},{x:ix2-12,y:iy2-12});W.tower=addLM(W,pulzarParts(mx,my),{tower:true});0},
    '1225,757':(ix1,iy1,ix2,iy2)=>{// GRAN HOTEL COSTA RICA frente a la plaza
      fillBlock(W,R,ix1,iy1,1294,iy2);addLM(W,[PB(1300,782,42,134,0,32,'#f4f1e8',{top:'#a9a39a',win:'grid',shop:'#7a1f2b'}),PB(1300,830,42,40,32,36,'#ece7da')],{label:'GRAN HOTEL'});stalls(1349,800,1349,900,4)},
    '883,757':(ix1,iy1,ix2,iy2)=>{// TEATRO MELICO SALAZAR frente al Parque Central
      fillBlock(W,R,ix1,iy1,ix2,858);addLM(W,[PB(912,866,110,46,0,24,'#efe3c9',{top:'#8d8576',win:'classic'}),...pCols(922,915,1012,915,8,16,'#f8f1df'),PB(916,912,100,5,16,19,'#f3e9d2'),PB(940,868,54,42,24,28,'#efe3c9')],{label:'TEATRO MELICO'})},
    '1050,940':(ix1,iy1,ix2,iy2)=>{// CATEDRAL METROPOLITANA (fachada hacia el Parque Central)
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});const WH='#f7f5ee';
      addLM(W,[PB(1098,976,92,94,0,22,'#f1eee4',{top:'#8a929a',win:'classic'}),PB(1088,972,12,102,0,28,WH,{top:'#9aa2a9',win:'classic'}),...pCols(1085,990,1085,1056,6,21,'#fbfaf5'),
        PB(1082,986,6,74,21,24,WH),PB(1082,1000,6,46,24,26.5,WH),PB(1082,1010,6,26,26.5,29,WH),PB(1082,1018,6,10,29,31,WH),
        PO(1150,1023,13,22,27,'#e6e3da'),PD(1150,1023,13,27,40,'#aab4bd'),PO(1150,1023,3,40,44,WH),PB(1149.4,1022.4,1.2,1.2,44,49,'#d4af37',{s:'stat'})],{label:'CATEDRAL'})},
    '883,940':(ix1,iy1,ix2,iy2,mx,my)=>{// PARQUE CENTRAL con su kiosko
      W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});W.plazas.push({x:mx-5,y:iy1,w:10,h:iy2-iy1},{x:ix1,y:my-5,w:ix2-ix1,h:10},{x:mx-18,y:my-18,w:36,h:36});W.labels.push({x:ix1+3,y:iy1+3,t:'PARQUE CENTRAL'});
      addLM(W,[PO(mx,my,13,0,2,'#d8d0c0'),...pRing(mx,my,10,8,2,11,'#f0ead8'),PO(mx,my,13,11,13,'#c45a3c'),PD(mx,my,9,13,19,'#c45a3c'),PO(mx,my,1.5,19,22,'#f0ead8')]);birds(mx-30,my-30,60,60,18)},
    '381,591':(ix1,iy1,ix2,iy2)=>{// MERCADO CENTRAL (1880)
      const SG='#b5462e';addLM(W,[PB(404,614,124,120,0,13,'#e4d6bc',{top:'#9aa3a8',roofT:'zinc',win:'classic',shop:'#8e3522'}),
        PB(410,636,112,6,13,16,'#cfd6da',{top:'#c3cbd0'}),PB(410,670,112,6,13,16,'#cfd6da',{top:'#c3cbd0'}),PB(410,704,112,6,13,16,'#cfd6da',{top:'#c3cbd0'}),
        PB(452,727,28,7,0,18,SG,{top:'#8e3522',win:'none'}),PB(452,614,28,7,0,18,SG,{top:'#8e3522',win:'none'}),PB(404,662,7,26,0,17,SG,{top:'#8e3522',win:'none'}),PB(521,662,7,26,0,17,SG,{top:'#8e3522',win:'none'})],{label:'MERCADO CENTRAL'});
      stalls(400,746,532,746,7);stalls(400,762,532,762,6);stalls(396,606,536,606,6)},
    '222,238':(ix1,iy1,ix2,iy2)=>{// MERCADO BORBÓN
      addLM(W,[PB(246,262,112,132,0,11,'#f0c75e',{top:'#9aa3a8',roofT:'zinc',win:'classic',shop:'#2a9d8f'}),PB(250,300,104,6,11,14,'#d9dfe3'),PB(250,350,104,6,11,14,'#d9dfe3'),PB(288,387,28,7,0,15,'#2a9d8f',{win:'none'})],{label:'MERCADO BORBON'});
      stalls(240,404,364,404,6);stalls(237,256,237,396,5)},
    '708,417':(ix1,iy1,ix2,iy2)=>{// BANCO NACIONAL (torre) y CORREOS DE COSTA RICA
      addLM(W,[PB(731,440,58,128,0,12,'#b9c3c9',{win:'grid',shop:'#1b5e20'}),PB(740,452,42,104,12,92,'#5d7f99',{win:'glass',top:'#9aa5ae'}),PB(752,490,18,28,92,97,'#8d9399')],{label:'BCO NACIONAL',ly:500});
      addLM(W,[PB(797,442,62,124,0,24,'#7fa36a',{top:'#4f6d3a',win:'classic'}),...pCols(861,470,861,538,6,17,'#e8efe0'),PB(800,488,56,32,24,31,'#86ab70',{top:'#5a7a44'}),PB(824,500,8,8,31,38,'#86ab70',{top:'#5a7a44'})],{label:'CORREOS'});W.flags.push({x:828,y:504,z:44})},
    '708,591':(ix1,iy1,ix2,iy2)=>{// BANCO CENTRAL (dos torres)
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});addLM(W,[PB(732,616,56,116,0,80,'#4b5d73',{win:'glass',top:'#7d8a99'}),PB(796,640,62,92,0,58,'#6c7f93',{win:'glass',top:'#8a96a3'}),PB(748,650,20,30,80,86,'#7d8a99')],{label:'BANCO CENTRAL'})},
    '1552,940':(ix1,iy1,ix2,iy2)=>{// LA CAJA (CCSS), el edificio más alto del centro
      addLM(W,[PB(1575,963,134,120,0,14,'#dfe5ea',{win:'grid',shop:'#1d4e89'}),PB(1598,976,88,92,14,124,'#eceff1',{win:'grid',top:'#b0b8bf'}),PB(1620,1000,40,40,124,130,'#cfd8dc'),PB(1639,1019,2,2,130,150,'#d62828',{s:'col'})],{label:'LA CAJA - CCSS',ly:1050})},
    '1732,80':(ix1,iy1,ix2,iy2)=>{// INSTITUTO NACIONAL DE SEGUROS
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});addLM(W,[PB(1772,110,72,96,0,104,'#d9d3c3',{win:'grid',shop:'#0d47a1',top:'#a8a293'}),PB(1772,110,72,96,104,109,'#0d47a1',{win:'none',top:'#b3ad9e'}),PB(1796,140,24,30,109,116,'#a8a293')],{label:'INS'})},
    '1909,80':(ix1,iy1,ix2,iy2)=>{// EDIFICIO METÁLICO (escuela de 1896, traída de Bélgica)
      addLM(W,[PB(1934,108,142,104,0,22,'#c5ccd3',{top:'#8e3b32',win:'classic'}),PB(1984,104,42,10,0,28,'#b4bcc5',{top:'#7b2d26',win:'classic'}),PB(1934,108,142,4,22,24,'#7b2d26',{win:'none'}),PB(1994,104,22,6,28,32,'#b4bcc5')],{label:'EDIFICIO METALICO'})},
    '1909,238':()=>{W.parks.push({x:1923,y:224,w:163,h:179});W.labels.push({x:1928,y:396,t:'PARQUE ESPANA'})},
    '2100,80':(ix1,iy1,ix2,iy2)=>{// CASA AMARILLA (Cancillería)
      W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});addLM(W,[PB(2140,118,116,64,0,22,'#f2c94c',{top:'#b0563a',win:'classic'}),...pCols(2172,184,2224,184,6,16,'#fff8e1'),PB(2168,182,60,4,16,19,'#fbe7a1'),PB(2180,140,36,24,22,27,'#f2c94c',{top:'#9c4a32'})],{label:'CASA AMARILLA'});W.flags.push({x:2198,y:150,z:34})},
    '2296,591':(ix1,iy1,ix2,iy2)=>{// ASAMBLEA LEGISLATIVA (torre nueva) y CASTILLO AZUL
      addLM(W,[PB(2324,620,44,44,0,18,'#3d6fb5',{top:'#2b4f86',win:'classic'}),...pCren(2324,620,44,44,18,'#3d6fb5',4.4),PO(2324,620,5,0,24,'#3566a8'),PO(2368,620,5,0,24,'#3566a8')],{label:'CASTILLO AZUL',ly:640});
      addLM(W,[PB(2400,618,112,114,0,14,'#d8d4cc',{win:'grid',shop:'#5d4037'}),PB(2420,632,72,86,14,150,'#8fa3b3',{win:'glass',top:'#b5bec6'}),PB(2440,655,32,40,150,157,'#c8c2b6')],{label:'ASAMBLEA',ly:672});
      fillBlock(W,R,ix1,672,2392,iy2);W.flags.push({x:2456,y:675,z:164})},
    '2296,757':(ix1,iy1,ix2,iy2)=>{// PLAZA DE LA DEMOCRACIA y MUSEO NACIONAL (antiguo Cuartel Bellavista)
      W.plazas.push({x:ix1,y:iy1,w:124,h:iy2-iy1});W.labels.push({x:ix1+4,y:iy1+4,t:'PLAZA DE LA',col:'#5c4b37'},{x:ix1+4,y:iy1+11,t:'DEMOCRACIA',col:'#5c4b37'});birds(ix1+10,iy1+24,100,100,16);
      const Y='#f0cf6a',Y2='#e6c15a';W.parks.push({x:2441,y:iy1,w:ix2-2441,h:iy2-iy1});
      addLM(W,[PB(2450,784,66,130,0,14,Y,{top:'#cfa94a',win:'classic'}),...pCren(2450,784,66,130,14,Y,5),PB(2442,834,10,30,0,22,Y2,{top:'#c79f3e',win:'classic'}),...pCren(2442,834,10,30,22,Y2,3.3),
        ...[[2452,786],[2514,786],[2452,912],[2514,912]].flatMap(([x,y])=>[PO(x,y,7,0,20,Y2,{top:'#c79f3e'}),...pRing(x,y,6,8,20,22.5,Y2)])],{label:'MUSEO NACIONAL'});W.flags.push({x:2447,y:849,z:30})},
    '2542,757':(ix1,iy1,ix2,iy2)=>{W.parks.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1})},
    '80,940':(ix1,iy1,ix2,iy2)=>{// IGLESIA DE LA MERCED (gótica, de piedra gris)
      W.plazas.push({x:ix1,y:iy1,w:ix2-ix1,h:iy2-iy1});const G='#a3a8ad';
      addLM(W,[PB(122,990,56,90,0,20,G,{top:'#5f6b75',win:'classic'}),PB(118,972,18,20,0,44,'#9aa0a6',{win:'classic'}),PB(164,972,18,20,0,44,'#9aa0a6',{win:'classic'}),PS(118,972,18,20,44,62,'#6c757d'),PS(164,972,18,20,44,62,'#6c757d'),PB(136,975,28,16,0,30,G,{win:'classic'}),PS(136,975,28,16,30,38,'#6c757d')],{label:'LA MERCED',ly:1030})},
    '1552,238':()=>{},'1732,238':()=>{}};
  for(let i=0;i<xb.length-1;i++)for(let j=0;j<yb.length-1;j++){const x1=xb[i]+HW,x2=xb[i+1]-HW,y1=yb[j]+HW,y2=yb[j+1]-HW,k=xb[i]+','+yb[j];
    W.sidewalks.push({x:x1,y:y1,w:x2-x1,h:y2-y1});const ix1=x1+7,ix2=x2-7,iy1=y1+7,iy2=y2-7,mx=(ix1+ix2)/2|0,my=(iy1+iy2)/2|0;
    if(LMB[k]){LMB[k](ix1,iy1,ix2,iy2,mx,my);continue}
    fillBlock(W,R,ix1,iy1,ix2,iy2,(j>=3&&j<=6&&i>=4&&i<=12)?.08:0)}
  // Parque Morazán con el Templo de la Música; calles peatonales y bulevares
  W.parks.push({x:1566,y:252,w:329,h:179});W.plazas.push({x:1566,y:337,w:329,h:10},{x:1725,y:252,w:10,h:179},{x:1710,y:322,w:40,h:40});W.labels.push({x:1572,y:258,t:'PARQUE MORAZAN'},{x:1692,y:362,t:'TEMPLO DE LA MUSICA',col:'#fff'});
  addLM(W,[PO(1730,342,14,0,2,'#e8e2d0'),...pRing(1730,342,11,8,2,13,'#f6f2e6'),PO(1730,342,14,13,15,'#f0ebdc'),PD(1730,342,11,15,24,'#e9e4d6'),PO(1730,342,2,24,27,'#e9e4d6')]);birds(1580,270,120,60,12);
  stalls(1566,760,1880,760,8);stalls(30,1104,860,1104,10);
  // vallas publicitarias de PULZAR en las aceras
  W.billboards=[];for(const[x,y,o]of[[629,922,'h'],[1137,922,'h'],[2004,922,'h'],[465,98,'h'],[1137,1619,'h'],[2524,1336,'v'],[98,1336,'v'],[2004,573,'h'],[629,1250,'h']]){const b=o==='h'?{x:x-16,y:y-2,w:32,h:4}:{x:x-2,y:y-16,w:4,h:32};W.billboards.push(Object.assign({cx:x,cy:y,o},b));W.obst.push(Object.assign({type:'valla'},b))}
  {let n=0;for(const b of W.blds)if(b.H&&b.H>44&&!b.parts&&n<5&&(b.x*13+b.y*7)%3===0){b.pulzar=true;n++}}
  W.sidewalks.push({x:1718,y:431,w:28,h:146},{x:1923,y:1092,w:699,h:28});
  const blv=[{x:0,y:743,w:1895,h:28},{x:2310,y:743,w:312,h:28},{x:0,y:1092,w:1895,h:28},{x:869,y:431,w:28,h:787},{x:1352,y:605,w:28,h:613},{x:1895,y:954,w:28,h:763}];W.plazas.push(...blv);
  W.labels.push({x:420,y:755,t:'BULEVAR AVENIDA CENTRAL',col:'#5c4b37'},{x:420,y:1104,t:'BULEVAR AVENIDA 4',col:'#5c4b37'},{x:1907,y:1300,t:'PASEO DE LOS ESTUDIANTES',col:'#5c4b37',rot:1});
  for(const x of[80,222,381,550,708,1050,1225,1552,1732,2542])W.zebras.push(makeZebra('v',x,757));
  for(const x of[80,222,381,550,708,1050,1225,1552,1732])W.zebras.push(makeZebra('v',x,1106));
  W.zebras.push(makeZebra('h',883,591),makeZebra('h',883,940),makeZebra('h',1366,940),makeZebra('h',1909,1232),makeZebra('h',1909,1439),makeZebra('h',1909,1637));
  // nombres de calles y avenidas en las aceras
  const HN={80:'AVENIDA 7',238:'AVENIDA 5',417:'AVENIDA 3',591:'AVENIDA 1',757:'AVENIDA CENTRAL',940:'AVENIDA 2',1232:'AVENIDA 6',1439:'AVENIDA 8',1637:'AVENIDA 10'};
  const VN={80:'CALLE 12',222:'CALLE 10',381:'CALLE 8',550:'CALLE 6',708:'CALLE 4',883:'CALLE 2',1050:'CALLE CENTRAL',1225:'CALLE 1',1366:'CALLE 3',1552:'CALLE 5',1732:'CALLE 7',1909:'CALLE 9',2100:'CALLE 11',2296:'CALLE 13',2542:'CALLE 15'};
  for(const r of W.roads){const nm=r.o==='h'?HN[r.c]:VN[r.c];if(!nm)continue;const L=r.o==='h'?xb:yb;
    for(let i=1;i<L.length-1;i+=2){const m=(L[i]+L[i+1])/2,tw=nm.length*4;if(m-tw/2<r.a+20||m+tw/2>r.b-20)continue;
      if(r.o==='h')W.labels.push({x:m-tw/2,y:r.c-HW-6,t:nm,col:'#ffffff'});else W.labels.push({x:r.c+HW+1,y:m-tw/2,t:nm,col:'#ffffff',rot:1})}}
  for(const p of W.parks)addTrees(W,R,p.w*p.h>20000?40:16,Object.assign({inside:true},p),3);
  {const inP=(x,y)=>W.plazas.some(q=>x>q.x-5&&x<q.x+q.w+5&&y>q.y-5&&y<q.y+q.h+5);W.trees=W.trees.filter(t=>!inP(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inP(o.x+2,o.y+2))}
  for(const f of W.fountains)W.obst.push({x:f.x-4,y:f.y-4,w:8,h:8,type:'fuente'});
  W.holes=[[300,240],[640,591],[1300,940],[1909,620],[2100,1300],[960,1439]].map(([x,y])=>({x,y,r:3.5}));
  W.spawn={x:150,y:947,h:0};
  spawnNav(W,64,['bus','bici',null,null,'moto',null,null,null,null,null,null,'garbage',null,'bici',null,null,'moto',null,null,null,'bus',null,null,'bici',null,null,'moto',null,null,null,'bus',null,'bici',null,null,'moto']);
  W.dogsN=10;W.walkers=[];for(let i=0;i<70;i++){const r=pick(W.sidewalks);if(r.w<30||r.h<30)continue;W.walkers.push({r,s:Math.random()*1000,sp:(4+Math.random()*4)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(CARCOLS)})}
  for(let i=0;i<xb.length-1;i++)for(const by of[743,1092]){const x1=xb[i]+HW,x2=xb[i+1]-HW;if(x2>1895||x2-x1<40)continue;for(let k=0;k<2;k++)W.walkers.push({r:{x:x1,y:by,w:x2-x1,h:28},s:Math.random()*1000,sp:(3+Math.random()*3)*(Math.random()<.5?-1:1),an:0,x:0,y:0,col:pick(CARCOLS)})}
  addDogs(W,10);
  W.jay=[];W.dests=[{n:'EL TEATRO NACIONAL',x:1460,y:940},{n:'EL MERCADO CENTRAL',x:465,y:591},{n:'LA CATEDRAL',x:1140,y:940},{n:'EL PARQUE MORAZAN',x:1640,y:238},{n:'LA PLAZA DE LA DEMOCRACIA',x:2420,y:940},{n:'LA CAJA (CCSS)',x:1640,y:1232},{n:'EL EDIFICIO METALICO',x:2000,y:80},{n:'EL MERCADO BORBON',x:300,y:417},{n:'CORREOS DE COSTA RICA',x:800,y:417},{n:'LA ASAMBLEA LEGISLATIVA',x:2420,y:591}];
  return W}
function centroTasks(){return[
  {txt:'CENTRO DE SAN JOSÉ: póngase el cinturón [C]. La AVENIDA 2 es de UNA VÍA hacia el este: pase frente al PARQUE CENTRAL y la CATEDRAL.',tgt:{x:1140,y:940},check(){const P=S.P;return P.x>1140&&Math.abs(P.y-940)<16}},
  {txt:'Siga por Avenida 2 y pase frente al TEATRO NACIONAL (entre calles 3 y 5).',tgt:{x:1460,y:940},check(){const P=S.P;return P.x>1460&&Math.abs(P.y-940)<16}},
  {txt:'Doble a la IZQUIERDA en CALLE 5 (una vía hacia el norte). ¡Direccional izquierda!',tgt:{x:1552,y:860},check(){const P=S.P;return Math.abs(P.x-1552)<16&&P.y<880}},
  {txt:'Suba por Calle 5 y doble a la DERECHA en AVENIDA 5, junto al PARQUE MORAZÁN.',tgt:{x:1640,y:238},check(){const P=S.P;return Math.abs(P.y-238)<16&&P.x>1640}},
  {txt:'La Avenida 5 termina en Calle 7: doble a la IZQUIERDA y luego a la DERECHA en AVENIDA 7.',tgt:{x:1820,y:80},check(){const P=S.P;return Math.abs(P.y-80)<16&&P.x>1800}},
  {txt:'Doble a la DERECHA en CALLE 9 (una vía hacia el sur) y baje junto al Parque Morazán.',tgt:{x:1909,y:500},check(){const P=S.P;return Math.abs(P.x-1909)<16&&P.y>500}},
  {txt:'Siga por Calle 9 y doble a la IZQUIERDA en AVENIDA 2. Vaya hasta la PLAZA DE LA DEMOCRACIA.',tgt:{x:2420,y:940},check(){const P=S.P;return Math.abs(P.y-940)<16&&P.x>2420}},
  {txt:'Doble a la IZQUIERDA en CALLE 15 y otra vez a la IZQUIERDA en AVENIDA 1 (una vía hacia el oeste).',tgt:{x:2300,y:591},check(){const P=S.P;return Math.abs(P.y-591)<16&&P.x<2330}},
  {txt:'Regrese por Avenida 1 y pase frente a CORREOS DE COSTA RICA y el BANCO CENTRAL.',tgt:{x:800,y:591},check(){const P=S.P;return Math.abs(P.y-591)<16&&P.x<800}},
  {txt:'Llegue al MERCADO CENTRAL para terminar el recorrido.',tgt:{x:465,y:591},check(){const P=S.P;return Math.abs(P.y-591)<16&&P.x<465}}]}
// RUTA 27 (resumida): de Escazú hacia Atenas, con los peajes reales de Escazú, San Rafael y Atenas.
function buildR27(){HW=14;
  const W=newWorld('r27',3300,1600);W.limit=80;
  const CL=smoothLine([[3500,300],[3100,300],[2700,300],[2300,300],[1900,300],[1500,300],[1150,300],[880,320],[650,420],[580,560],[660,700],[880,785],[1150,800],[1500,800],[1900,800],[2250,800],[2520,815],[2740,900],[2820,1050],[2740,1200],[2520,1285],[2250,1300],[1900,1300],[1500,1300],[1100,1300],[700,1300],[300,1300],[-100,1300],[-400,1300]]);
  const A=offLine(CL,22),Bw=offLine(CL,-22).reverse();
  const pa=addPath(W,A),pb=addPath(W,Bw);
  const ramp=addPath(W,smoothLine([[3170,110],[3090,170],[2990,240],[2880,272],[2800,278]],10)),exitR=addPath(W,smoothLine([[1020,1278],[900,1268],[780,1225],[690,1150],[640,1060]],10));
  for(const q of[pa,pb,ramp,exitR]){q.oneway=true;q.noCenter=true}ramp.hw=10;exitR.hw=10;
  W.tolls=[{n:'ESCAZU',cost:420,x:2500,y:278,dir:-1},{n:'SAN RAFAEL',cost:630,x:1900,y:822,dir:1},{n:'ATENAS',cost:830,x:1350,y:1278,dir:-1}];
  const B=b=>{W.obst.push(b);W.blds.push(b);return b};
  for(const T of W.tolls){const oy=T.y+(T.dir<0?44:-44);T.oy=oy;for(const yy of[T.y,oy])B({x:T.x-12,y:yy-2,w:24,h:4,type:'bld',col:'#ffd23f',roof:'#e0a800',booth:true});
    W.zones.push({x:T.x-130,y:T.y-14,w:260,h:28,limit:30,name:'PEAJE'},{x:T.x-130,y:oy-14,w:260,h:28,limit:30,name:'PEAJE'})}
  W.zones.push({x:520,y:330,w:420,h:440,limit:60,name:'CURVAS',noText:true},{x:2560,y:830,w:330,h:440,limit:60,name:'CURVAS',noText:true},{x:2820,y:90,w:380,h:172,limit:60,name:'RAMPA',noText:true},{x:620,y:1040,w:390,h:224,limit:60,name:'RAMPA',noText:true});
  const R=rng(27);W.cafe=[{x:1300,y:440,w:420,h:260},{x:1120,y:960,w:400,h:240},{x:150,y:420,w:330,h:720},{x:1900,y:950,w:520,h:250},{x:150,y:1400,w:700,h:160},{x:2000,y:420,w:420,h:240}];
  // pueblos a la orilla: Escazú, Santa Ana, Ciudad Colón y Atenas
  const town=(bx,by,bw,bh,n)=>{for(let k=0,t=0;k<n&&t<n*20;t++){const b={x:bx+R()*bw|0,y:by+R()*bh|0,w:14+R()*10|0,h:12+R()*8|0,type:'bld',house:true,col:pick(['#f4a261','#e9c46a','#a8dadc','#ffadad','#caffbf','#bdb2ff','#ffd6a5','#f1faee']),roof:pick(['#bc4749','#9c6644','#7f5539','#b5533c'])};
    let ok=!W.blds.some(o=>b.x<o.x+o.w+4&&b.x+b.w+4>o.x&&b.y<o.y+o.h+4&&b.y+b.h+4>o.y);for(const[px,py]of[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h],[b.x+b.w/2,b.y+b.h/2]])if(pavedW(W,px,py))ok=false;
    for(const q of[[b.x-10,b.y+b.h/2],[b.x+b.w+10,b.y+b.h/2],[b.x+b.w/2,b.y-10],[b.x+b.w/2,b.y+b.h+10]])if(pavedW(W,q[0],q[1]))ok=false;if(ok){B(b);k++}}};
  town(2900,10,380,90,22);town(2120,110,420,130,22);town(1100,110,380,130,20);town(430,920,330,120,20);town(1700,600,260,140,10);
  W.labels=[{x:3080,y:16,t:'ESCAZU',col:'#fff'},{x:2280,y:104,t:'SANTA ANA',col:'#fff'},{x:1230,y:104,t:'CIUDAD COLON',col:'#fff'},{x:1780,y:590,t:'SAN RAFAEL',col:'#fff'},{x:560,y:906,t:'ATENAS',col:'#fff'}];
  W.drawExtra=x=>{const line=(pts,d,col,dash)=>{const q=offLine(pts,d);x.strokeStyle=col;x.lineWidth=1;x.setLineDash(dash||[]);x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const p of q)x.lineTo(p[0],p[1]);x.stroke();x.setLineDash([])};
    line(CL,0,'#b0b8c1');line(CL,1,'#6c757d');for(const P of[A,Bw]){line(P,0,'#ecece4',[6,6]);line(P,12.5,'#ecece4');line(P,-12.5,'#f2c230')}
    const sign=(sx,sy,t)=>{const w=t.length*4+5;x.fillStyle='#1b5e20';x.fillRect(sx,sy,w,10);x.fillStyle='#fff';x.fillRect(sx,sy,w,1);x.fillRect(sx,sy+9,w,1);ptext(x,t,sx+3,sy+3,'#fff')};
    for(const T of W.tolls){x.fillStyle='rgba(20,20,30,.28)';x.fillRect(T.x-16,Math.min(T.y,T.oy)-16,32,Math.abs(T.y-T.oy)+32);
      ptext(x,'PAGUE',T.x-T.dir*44-10,T.y-10,'#fff');ptext(x,'PAGUE',T.x-T.dir*44-10,T.y+6,'#fff');
      const s=T.x-T.dir*360,sy=T.dir<0?T.y-30:T.y+20;sign(s-30,sy,'PEAJE '+T.n+' '+T.cost)}
    sign(3010,190,'RUTA 27 CALDERA');sign(1150,1240,'SALIDA ATENAS');sign(260,1240,'CALDERA');sign(2440,760,'SAN RAFAEL');};
  addTrees(W,R,520,{x:0,y:0,w:3300,h:1600},12);
  {const inC=(x,y)=>W.cafe.some(q=>x>q.x-4&&x<q.x+q.w+4&&y>q.y-4&&y<q.y+q.h+4);W.trees=W.trees.filter(t=>!inC(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!inC(o.x+2,o.y+2))}
  W.holes=[[2100,271],[1500,829],[700,1285]].map(([x,y])=>({x,y,r:3.5}));
  // tráfico: carril derecho (más lento, con buses) y carril izquierdo (más rápido)
  const loop=A.concat(Bw);spawnOnLoop(W,makePathLoop(loop,7),22,62,['bus',null,null,'pickup',null,null,null,'bus',null,null,'pickup',null,null,null,null,'bus']);spawnOnLoop(W,makePathLoop(loop,-7),12,80);
  W.spawn={x:3170,y:110,h:Math.atan2(60,-80)};W.dests=[{n:'ATENAS',x:640,y:1060}];W.jay=null;
  return W}
// RUTA 32 · BRAULIO CARRILLO (resumida): de San José a Guápiles por el parque nacional. Curvas, subida al Zurquí,
// túnel con luces, neblina, bajada larga (marcha baja), puente del Río Sucio y camiones de carga.
function buildR32(){HW=14;
  const W=newWorld('r32',3400,2300);W.limit=60;W.r32=true;
  const CL=smoothLine([[-300,260],[150,260],[520,300],[820,420],[960,640],[880,860],[640,980],[560,1180],[700,1380],[1000,1440],[1350,1380],[1700,1260],[2050,1140],[2350,1060],[2620,1100],[2800,1280],[2840,1500],[2720,1700],[2780,1900],[3000,2020],[3300,2060],[3700,2080]],12);
  W.CL=CL;const pa=addPath(W,CL);pa.noCenter=true;
  const idx=f=>CL.findIndex(f);const t0=idx(q=>q[0]>1400&&q[1]>1200),t1=idx(q=>q[0]>1980&&q[1]<1200),river=[[3400,1250],[3100,1330],[2830,1400],[2560,1480],[2300,1650],[2100,1900],[2000,2300]];
  let ib=0,bd=1e9;CL.forEach((q,i)=>{const d=Math.hypot(q[0]-2830,q[1]-1400);if(d<bd){bd=d;ib=i}});const iEnd=idx(q=>q[0]>3200);
  Object.assign(W,{iTun0:t0,iTun1:t1,iBr:ib,iEnd,iStart:idx(q=>q[0]>100),fogAt:t1+25});
  // pendientes: subida hasta el túnel del Zurquí, túnel plano, bajada fuerte hasta el río y bajada suave a Guápiles
  W.slopes=[];for(let i=0;i<CL.length-1;i++){const a=CL[i],b=CL[i+1];if(i<t0)W.slopes.push({seg:[b[0],b[1],a[0],a[1]],hw:16,grade:.07,n:'7%'});else if(i>t1&&i<ib-3)W.slopes.push({seg:[a[0],a[1],b[0],b[1]],hw:16,grade:.10,n:'10%'});else if(i>=ib+3)W.slopes.push({seg:[a[0],a[1],b[0],b[1]],hw:16,grade:.04,n:'4%'})}
  // túnel Zurquí: paredes y luces
  W.tunPts=[];W.walls=[];for(let i=t0;i<=t1;i+=2){const q=CL[i],r=CL[Math.min(CL.length-1,i+2)],dx=r[0]-q[0],dy=r[1]-q[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;W.tunPts.push(q);
    for(const sd of[-1,1]){const o=sd*16,o2=sd*19;W.walls.push({p:[[q[0]+nx*o,q[1]+ny*o],[r[0]+nx*o,r[1]+ny*o],[r[0]+nx*o2,r[1]+ny*o2],[q[0]+nx*o2,q[1]+ny*o2]],ht:11,col:'#6f6f73',cx:q[0]+nx*o,cy:q[1]+ny*o,r:14})}}
  W.zones.push({x:780,y:560,w:260,h:380,limit:40,name:'CURVAS'},{x:480,y:880,w:300,h:440,limit:40,name:'CURVAS'},{x:2600,y:1150,w:320,h:680,limit:40,name:'CURVAS'},{x:1350,y:1100,w:700,h:340,limit:60,name:'TÚNEL',noText:true});
  W.signs=[{x:760,y:395,t:'CURVA PELIGROSA'},{x:1000,y:610,t:'CURVA PELIGROSA'},{x:1290,y:1420,t:'TUNEL ZURQUI'},{x:1250,y:1350,t:'ENCIENDA LUCES'},{x:2130,y:1065,t:'ZONA NIEBLA'},{x:2300,y:1020,t:'MARCHA BAJA'},{x:2560,y:1060,t:'BAJADA 10%'},{x:2860,y:1290,t:'RIO SUCIO'},{x:2690,y:1660,t:'CURVA PELIGROSA'}];
  const R=rng(32);
  W.drawUnder=x=>{x.fillStyle='#2f6e34';x.fillRect(0,0,W.w,W.h);for(let i=0;i<9000;i++){x.fillStyle=R()<.5?'#285f2c':'#3a7f3c';x.fillRect(R()*W.w|0,R()*W.h|0,2,2)}
    // Río Sucio (amarillo por los minerales del volcán) que se une al Río Honduras (oscuro)
    const riv=(pts,w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.lineJoin='round';x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(const q of pts)x.lineTo(q[0],q[1]);x.stroke()};
    riv(river,30,'#6d5a3a');riv(river.slice(0,4),24,'#d4b44a');riv(river.slice(3),24,'#7a5c3e');riv([[2560,1480],[2450,1300],[2380,1180]],18,'#4e6e7a')};
  W.drawExtra=x=>{const line=(d,col,dash)=>{const q=offLine(CL,d);x.strokeStyle=col;x.lineWidth=1;x.setLineDash(dash||[]);x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const p of q)x.lineTo(p[0],p[1]);x.stroke();x.setLineDash([])};
    line(-1,'#f2c230');line(1,'#f2c230');line(HW-1.5,'#ecece4');line(-(HW-1.5),'#ecece4');
    // barandas del puente
    for(const d of[-16,16]){const q=offLine(CL.slice(ib-5,ib+6),d);x.strokeStyle='#c9ced3';x.lineWidth=2;x.beginPath();x.moveTo(q[0][0],q[0][1]);for(const p of q)x.lineTo(p[0],p[1]);x.stroke()}
    const roadTxt=(i,t)=>{const q=CL[i];ptext(x,t,q[0]-t.length*2|0,q[1]+3|0,'#ecece4')};roadTxt(40,'SUBIDA 7%');roadTxt(t1+20,'BAJADA 10%');roadTxt(t0-8,'LUCES')};
  W.drawTop=(gg,X,Y,t,ix,iy)=>{// techo del túnel (semitransparente para ver el carro) y neblina
    gg.fillStyle=S&&S.inTun?'rgba(25,25,30,.55)':'rgba(25,25,30,.9)';gg.beginPath();const a=offLine(CL.slice(t0,t1+1),-19),b=offLine(CL.slice(t0,t1+1),19).reverse();gg.moveTo(X(a[0][0]),Y(a[0][1]));for(const q of a.concat(b))gg.lineTo(X(q[0]),Y(q[1]));gg.fill();
    gg.fillStyle='#ffb347';for(const q of W.tunPts)gg.fillRect(X(q[0]),Y(q[1]),1,1);
    for(const i of[t0,t1]){const q=CL[i];gg.fillStyle='#8d8d93';gg.fillRect(X(q[0])-3,Y(q[1])-22,6,44)}
    if(!S||!S.inTun)ptext(gg,'TUNEL ZURQUI',X(CL[(t0+t1)>>1][0])-23,Y(CL[(t0+t1)>>1][1])-3,'#fff');
    const fk=S&&S.W===W?S.fogK||0:0;if(fk>.02){gg.fillStyle=`rgba(220,226,232,${.5*fk})`;gg.fillRect(0,0,VW*3,VH*3);for(let i=0;i<10;i++){const fx=((i*157+t*8)%(VW+120))-60,fy=(i*53)%VH;gg.fillStyle=`rgba(240,244,248,${.25*fk})`;gg.fillRect(fx,fy,70,14)}}};
  {const e=[0];for(let i=1;i<CL.length;i++){const L=Math.hypot(CL[i][0]-CL[i-1][0],CL[i][1]-CL[i-1][1])*.4;e.push(e[i-1]+(i<=t0?.07*L:i<=t1?0:i<ib-3?-.10*L:i<=ib+3?0:-.04*L))}
    const segD=(px,py,pts)=>{let m=1e9;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,t=clamp(((px-a[0])*dx+(py-a[1])*dy)/l2,0,1);m=Math.min(m,Math.hypot(a[0]+dx*t-px,a[1]+dy*t-py))}return m};
    const NCL=nearCL(CL,CL.length);makeHM(W,10,(x,y)=>{let[bi,bd]=NCL(x,y);for(let i=Math.max(0,bi-5);i<Math.min(CL.length,bi+6);i++){const d=Math.hypot(CL[i][0]-x,CL[i][1]-y);if(d<bd){bd=d;bi=i}}
      const base=e[bi];if(bd<HW+7)return base;const n=(Math.sin(x*.013)+Math.sin(y*.017+1)+Math.sin((x+y)*.009+2))/3,tun=bi>=t0-4&&bi<=t1+4;let hh=base+Math.min(tun?110:70,(bd-21)*(tun?1.1:.38))*(tun?1:.65+.35*n);
      const dr=segD(x,y,river);if(dr<70)hh=Math.min(hh,base-(70-dr)*.45-2);return hh})}
  W.drawUnder0=W.drawUnder;W.drawUnder=x=>{W.drawUnder0(x);hillshade(x,W)};
  addBushes(W,CL,R,2.2,t0,t1);
  addTrees(W,R,1100,{x:0,y:0,w:W.w,h:W.h},18);for(let i=0;i<CL.length;i+=6){const q=CL[i];if(i>=t0-2&&i<=t1+2)continue;addTrees(W,R,7,{x:q[0]-80,y:q[1]-80,w:160,h:160},17)}
  {const nearRiv=(px,py)=>river.some((q,i)=>i<river.length-1&&(()=>{const b=river[i+1],dx=b[0]-q[0],dy=b[1]-q[1],l2=dx*dx+dy*dy,t=clamp(((px-q[0])*dx+(py-q[1])*dy)/l2,0,1);return Math.hypot(q[0]+dx*t-px,q[1]+dy*t-py)<24})());
    W.trees=W.trees.filter(t=>!nearRiv(t.x,t.y));W.obst=W.obst.filter(o=>o.type!=='tree'||!nearRiv(o.x+2,o.y+2))}
  W.labels=[{x:40,y:300,t:'SAN JOSE',col:'#fff'},{x:1150,y:820,t:'PARQUE NACIONAL BRAULIO CARRILLO',col:'#d8f3dc'},{x:3080,y:2110,t:'GUAPILES',col:'#fff'},{x:2880,y:1440,t:'RIO SUCIO',col:'#fff3b0'},{x:1500,y:1180,t:'TUNEL ZURQUI',col:'#fff'}];
  W.holes=[[700,1384],[2420,1068]].map(([x,y])=>({x,y,r:3.5}));
  const loop=CL.concat(CL.slice(1,-1).reverse());spawnOnLoop(W,makePathLoop(loop,7),20,58,['truck',null,null,'truck','moto',null,'bus',null,'truck',null,null,'pickup','truck',null,'moto',null,'truck',null,'bus',null]);
  for(const c of W.ai)if(c.type==='truck'){c.vmax=Math.min(c.vmax,44);c.col=pick(['#c1121f','#1d3557','#2a9d8f','#f4a261'])}
  const s0=offLine(CL,7);const k=W.iStart+2;W.spawn={x:s0[k][0],y:s0[k][1],h:Math.atan2(CL[k+1][1]-CL[k][1],CL[k+1][0]-CL[k][0])};
  W.dests=[{n:'GUAPILES',x:CL[iEnd][0],y:CL[iEnd][1]}];W.jay=null;return W}
function r32Rules(W,P,dt){const CL=W.CL;let best=Math.min(S.ci||0,CL.length-1),bd=1e9;for(let i=Math.max(0,best-40);i<Math.min(CL.length,best+40);i++){const d=Math.hypot(CL[i][0]-P.x,CL[i][1]-P.y);if(d<bd){bd=d;best=i}}
  if(bd>60)for(let i=0;i<CL.length;i++){const d=Math.hypot(CL[i][0]-P.x,CL[i][1]-P.y);if(d<bd){bd=d;best=i}}S.ci=best;
  S.inTun=W.iTun0>=0&&best>=W.iTun0&&best<=W.iTun1&&bd<20;S.fogK=W.fogAll!=null?W.fogAll:W.fogAt!=null?clamp(1-Math.abs(best-W.fogAt)/45,0,1)*.9:0;
  if(W.gust&&best>=W.gust[0]&&best<=W.gust[1]&&!S.foot){S.gT=(S.gT||2)-dt;if(S.gT<=0){S.gT=3+Math.random()*4;S.gD=1.3;S.gS=(Math.random()<.5?-1:1)*(10+Math.random()*8);if(!S.gWarn){S.gWarn=1;toast('VIENTO CRUZADO','Las ráfagas empujan el carro: sujete el volante y baje la velocidad','info')}}
    if(S.gD>0){S.gD-=dt;const a=CL[Math.max(0,best-1)],b=CL[Math.min(CL.length-1,best+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.hypot(tx,ty)||1,k=Math.sin(Math.PI*S.gD/1.3)*S.gS*Math.min(1,Math.abs(P.v)/15+.3);P.x+=-ty/l*k*dt;P.y+=tx/l*k*dt}}
  if(W.ccow){const c=W.ccow;if(c.v&&Math.hypot(P.x-c.x,P.y-c.y)<P.L/2+3&&Math.abs(P.v)>2){fault('vaca',W.ccow.kind==='mono'?'Atropellar fauna silvestre (mono)':'Golpear un animal en la vía','I',8);sfx.crash();P.v*=-.2}}
  const a=CL[Math.max(0,best-1)],b=CL[Math.min(CL.length-1,best+1)],tx=b[0]-a[0],ty=b[1]-a[1],tl=Math.hypot(tx,ty)||1,lat=((P.x-CL[best][0])*-ty+(P.y-CL[best][1])*tx)/tl;
  const fwd=(Math.cos(P.h)*tx+Math.sin(P.h)*ty)/tl;if(Math.abs(P.v)>5&&((fwd>0&&lat<-2)||(fwd<0&&lat>2))){S.laneT=(S.laneT||0)+dt;if(S.laneT>.8){S.laneT=-3;fault('carril','Invadir el carril contrario (doble raya amarilla, prohibido adelantar)','II',4)}}else if(S.laneT>0)S.laneT=0}
function r32Tasks(){const W=S.W;return[
  {txt:'RUTA 32 hacia Limón: póngase el cinturón [C] y suba hacia el Zurquí por su carril. La DOBLE RAYA AMARILLA prohíbe adelantar.',tgt:{x:W.CL[60][0],y:W.CL[60][1]},check(){return S.ci>60}},
  {txt:'CURVAS PELIGROSAS: máximo 40 km/h. No invada el carril contrario en las curvas.',tgt:{x:W.CL[W.iTun0-30][0],y:W.CL[W.iTun0-30][1]},check(){return S.ci>W.iTun0-30}},
  {txt:'TÚNEL ZURQUÍ: encienda las LUCES [L] antes de entrar.',tgt:{x:W.CL[W.iTun0][0],y:W.CL[W.iTun0][1]},check(){if(S.ci>=W.iTun0){if(!S.P.lights)fault('luces','Entrar al túnel con las luces apagadas','III',99);return true}return false}},
  {txt:'Atraviese el túnel sin detenerse ni cambiar de carril.',tgt:{x:W.CL[W.iTun1][0],y:W.CL[W.iTun1][1]},check(){return S.ci>W.iTun1+2}},
  {txt:'NEBLINA Y BAJADA DEL 10%: baje despacio, con luces y MARCHA BAJA [G] (compresionar).',tgt:{x:W.CL[W.iBr-6][0],y:W.CL[W.iBr-6][1]},start(){S.lowT=0;S.dnT=0},
   check(){const P=S.P;if(P.slope&&P.slAl>.5&&P.v>3){S.dnT+=S.dt;if(P.low)S.lowT+=S.dt}if(S.ci>W.iBr-6){if(S.dnT>4&&S.lowT<S.dnT*.5)fault('baja','No usó marcha baja en la bajada fuerte','III',99);return true}return false}},
  {txt:'Cruce el puente del RÍO SUCIO (mire: agua amarilla y oscura juntas) y llegue a GUÁPILES.',tgt:{x:W.CL[W.iEnd][0],y:W.CL[W.iEnd][1]},check(){return S.ci>=W.iEnd}}]}
