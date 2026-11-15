'use strict';
// ===================== PLANTEL DE SAN JOSÉ v2 (Ciudad Vial, Paso Ancho) =====================
// Trazado sobre la foto satelital (Esri, norte arriba, 0,147 m/px) y los videos de dron de 2025:
// caseta de entrada (fase 1), fila bajo el toldo, carril en S con conos, rotonda, vuelta a la isla,
// dos carriles de REVERSA (45 m) con conos verdes y vallas naranjas, dos ALTO, estacionamiento en reversa
// bajo el techo solar (espacio asignado, 5 intentos) y salida con el evaluador hacia la fase 3.
// D(x,y): coordenadas de la foto recortada (x 0..1110, y 0..1140) a unidades del juego (1 u = 0,3 m).
const CV2={k:.32667,o:9.8};
function D2(x,y){return[CV2.o+x*CV2.k,CV2.o+y*CV2.k]}
// ---- examen
const CV2_F1=[['EVALUADOR','¡Buenos días! Bienvenido a Ciudad Vial. Me permite su cédula y el dictamen médico, por favor.'],['EVALUADOR','(revisa los documentos) Muy bien. Vamos con la FASE UNO: la revisión del vehículo.'],['EVALUADOR','Le voy a pedir que encienda algunas luces. Yo reviso por fuera.']];
const CV2_F2=[['EVALUADOR','Todo en orden con el vehículo. Avance despacio a la FILA bajo el toldo y espere su turno en la línea.'],['EVALUADOR','Recuerde: no toque los conos, haga los ALTO completos y use direccionales. ¡Mucha suerte!']];
const CV2_Q=[['EVALUADOR','Su turno. Empezamos la FASE DOS: carril en zigzag, rotonda, conducción en reversa y estacionamiento.'],['EVALUADOR','Siga el carril en zigzag sin tocar conos. Hay bastante espacio, vaya con calma.']];
function dlgRun(t,lines){if(!S.dlg&&!t.dl){S.dlg={lines,i:0,t:0};t.dl=1}if(S.dlg&&t.dl===1){S.dlg.t+=S.dt;if(S.dlg.t>dlgDur(S.dlg,3.2)){S.dlg.i++;S.dlg.t=0}if(S.dlg.i>=S.dlg.lines.length){S.dlg=null;t.dl=2}}return t.dl===2}
