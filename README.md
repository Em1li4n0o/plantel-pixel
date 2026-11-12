# Plantel Pixel

Simulador de manejo vista desde arriba, estilo pixel/arcade, inspirado en la prueba práctica de manejo de Costa Rica (plantel de Educación Vial). No es una copia del plantel real.

## Cómo jugar

Abra `index.html` en el navegador, o levante un servidor local:

```bash
python -m http.server 8080
```

y entre a http://localhost:8080

## Controles

| Tecla | Acción |
|---|---|
| W | Acelerar (en reversa: frenar; detenido, otro toque = avanzar) |
| S | Frenar; ya detenido, **suelte y toque otra vez** = reversa |
| A / D | Girar |
| Q / E | Direccional izquierda / derecha (se apagan solas al enderezar) |
| H | Intermitentes |
| C | Cinturón (en moto o bici: casco), con el vehículo detenido |
| T | Bajarse del vehículo / subirse (manejo libre y rutas). A pie: WASD caminar, Espacio o Shift correr |
| Espacio | Freno de mano |
| V | Cambia la vista: desde arriba → piloto (primera persona) → desde atrás del carro |
| Z / X | (Piloto) mirar a la izquierda / derecha: espejos laterales |
| F | (Piloto) mirar hacia arriba; también se inclina sola al detenerse en un semáforo |
| B | Pitar (solo para evitar accidentes; nunca en zona escolar) |
| G | Marcha baja: compresionar al bajar cuestas |
| P / Esc | Pausa |
| M | Mapa completo (también tocando el minimapa); el juego se pausa. En manejo libre, clic o toque en un lugar del mapa para ir ahí |
| + / - | Zoom de la cámara (en el mapa: acercar) |
| L | Luces (obligatorias de noche y con lluvia en manejo libre) |
| O | Radio Pixel 101.5 (solo fuera del examen) |
| I | Voz del instructor (lee cada tarea y las faltas) |
| N | Sonido |
| R | Reiniciar |

## Modos

- **Al abrir por primera vez**: se pregunta dónde se juega (computadora o teléfono) y qué licencia se está sacando (Bici, A1, A2, A3, B1, C1, C2). Los controles se adaptan y el perfil se guarda con cada intento para el panel del instructor. Se cambia desde el menú (PERFIL).
- **Pantalla completa**: botón arriba a la derecha; mientras está activa, el botón rojo SALIR queda siempre visible.
- **Garaje por licencia**: bicicleta, scooter 50 cc (A1), moto 150 cc y trail 250 cc (A2), moto deportiva 600 cc (A3), carros (B1), taxi (C1) y autobús (C2). En moto la vista de piloto muestra el manubrio y los espejos.
- **Clima y hora** (manejo libre): el día avanza (1 hora ≈ 40 s), anochece con luces de calle, faros y estrellas, y a veces llueve: la calle resbala (se frena peor), hay limpiaparabrisas y manejar sin luces es falta.
- **Voz**: el instructor lee cada tarea y anuncia las faltas (voz del navegador en español). Radio con locutor, música, consejos viales, reportes de tránsito y anuncios de Pulzar.
- **Repetición de faltas**: al terminar una prueba, VER REPETICIÓN muestra los segundos antes de cada falta desde arriba, con los carros alrededor.
- **Reto del día**: un reto distinto cada día con racha de días seguidos (se ve en el menú).
- **Modo arcade** (garaje, solo manejo libre): hiperdeportivo, muscle car, rally 4x4, kart, monster truck y tuner, con TURBO (Shift), sin multas y choques que rebotan y mandan a volar a los otros carros.
- **Relieve en 3D**: la Ruta 32 y la ciudad tienen terreno con alturas reales: cerros, subidas, bajadas y el valle del río bajo el puente se ven en la vista de piloto y desde atrás; el mapa de arriba tiene sombreado de relieve.
- **Carros en 3D** con llantas, bumpers, espejos y parabrisas inclinado; más tráfico en la ciudad y el centro.
- **Mirar alrededor**: en vista de piloto, desde atrás o a pie, arrastre con el mouse o el dedo para girar la cámara; al soltar vuelve al frente.
- **Luces**: freno, reversa, direccionales y faros se ven en 3D, con brillo de noche y haz en el piso.
- **Ambulancias** con sirena: los carros se orillan; si usted no le cede el paso es falta.
- **Teórico**: 89 preguntas, incluyendo emergencias, motos, ciclistas, lluvia, neblina, túneles, pendientes, doble raya amarilla, animales y viento.
- **Policía de tránsito** (manejo libre): con 4 infracciones en 90 segundos llega una patrulla con sirena que lo alcanza y lo detiene, con diálogo del oficial y −300 puntos.

- **Tutorial (0)**: enseña los controles paso a paso (cinturón, pedales, volante, direccionales, reversa, freno de mano, marcha baja, bocina, vistas y espejos).
- **Celular / tablet**: botones en pantalla (volante, pedales, direccionales, pito, vista, freno de mano). Se juega en horizontal.

- **Examen teórico**: banco de práctica con explicaciones, examen de 40 preguntas en 50 minutos (nota mínima 70) y repaso de errores. Las preguntas son propias, no el banco oficial.
- **Menú**: 1 examen teórico · 2 planteles oficiales · 3 rutas emblemáticas · 4 prueba en calle · 5 manejo libre; abajo: 0 tutorial · 6 progreso · 7 licencia · 8 garaje · 9 reglas.
- **Rutas emblemáticas**:
  - **Centro de San José**: cuadrícula real de avenidas y calles (Av. 7 a Av. 10, Calle 12 a Calle 15) con sus sentidos de UNA VÍA tomados de OpenStreetMap, bulevares peatonales de Avenida Central y Avenida 4, Paseo de los Estudiantes, Teatro Nacional, Plaza de la Cultura, Catedral, Parque Central, Mercado Central, Correos, Banco Central, Parque Morazán, Plaza de la Democracia y Museo Nacional. Recorrido guiado de 10 tareas; circular en contravía es falta grave.
  - El centro tiene edificios emblemáticos en 3D en su cuadra real: Teatro Nacional (columnas, estatuas y bandera), Gran Hotel, Teatro Melico Salazar, Catedral con cúpula, kiosco del Parque Central, Templo de la Música, Mercado Central y Mercado Borbón con puestos, Correos, torres del Banco Nacional y del Banco Central, La Caja (CCSS), INS, Edificio Metálico, Parque España, Casa Amarilla, Asamblea Legislativa con el Castillo Azul, Museo Nacional con sus almenas e Iglesia de La Merced. Además: torre Pulzar Solutions, vallas Pulzar, palomas que vuelan al acercarse, motos y bicicletas en el tráfico.
  - **San José libre**: el mismo centro sin examen; destinos emblemáticos, se puede caminar y viajar por el mapa.
  - **Ruta 32 · Braulio Carrillo** (resumida): carretera de montaña con curvas de verdad, doble raya amarilla (invadir el carril contrario es falta), subida del 7 % al Zurquí, túnel con luces (entrar sin luces es falta), neblina, bajada del 10 % donde hay que compresionar con marcha baja, puente del Río Sucio (agua amarilla junto a la oscura), camiones de carga y llegada a Guápiles.
  - **Tilarán · Parque eólico**: de Cañas a la Laguna de Arenal por la Ruta 142: molinos que giran, viento cruzado que empuja el carro, ganado en los potreros y una vaca que cruza, el pueblo de Tilarán y la bajada a la laguna.
  - **Alajuela · Modo taxi**: recoja pasajeros en hoteles y barrios y llévelos al Aeropuerto Juan Santamaría (o al revés), con tarifa en colones y propina si no comete infracciones. Aviones que despegan y aterrizan, terminal y torre de control, la Catedral de cúpula roja, el parque de los mangos y el **Autódromo La Guácima** con cronómetro de vueltas, récord y corredores.
  - **Manuel Antonio**: de Quepos por la costa del Pacífico, con playa, palmeras, curvas cerradas, cuestas y monos que cruzan la carretera.
  - **Cerro de la Muerte (Ruta 2)**: de Cartago a San Isidro de El General con neblina casi todo el camino, páramo, subida a 3300 m y una bajada larga del 9 % (marcha baja).
  - **Ruta 27** (resumida): rampa de Escazú, autopista de dos carriles por sentido con curvas, peajes de Escazú, San Rafael y Atenas (hay que detenerse a pagar) y salida a Atenas.
  - Mapa del centro: © colaboradores de OpenStreetMap, licencia ODbL.
- **Planteles oficiales**: San José (Ciudad Vial) y las otras 10 sedes donde se aplica la prueba práctica (Heredia, Alajuela, Pérez Zeledón, Río Claro, Limón, Guápiles, San Carlos, Nicoya, Puntarenas y Liberia). Las 10 sedes son una **versión preliminar**: usan un plantel estándar con el entorno de cada región mientras se consiguen medidas y fotos de cada una. El plantel inventado ya no está en el menú (su mapa solo se usa para el tutorial).
- **Plantel San José (Ciudad Vial, COSEVI)**: calles y alrededores de OpenStreetMap (Avenida 50, Circunvalación), plantel agrandado un 14 %. Entrada en curva por el parqueo (con el toldo y las sillas de las familias a un lado) y punto de revisión de cédula con diálogo del instructor; ALTO al salir del parqueo; plaza de asfalto con CEDA hacia la fila; fila de dos carriles junto al toldo de paneles solares hasta la línea de ESPERE; zigzag en una plancha de asfalto con filas de conos y pirámides en las esquinas (−12 por cono); curva a la izquierda; rotonda con vuelta completa; curva larga; reversa de 40 m en los dos carriles; parqueo de 4 espacios junto al edificio con poste de luz al lado del 4 (el de la prueba; tocar un cono del parqueo pierde la prueba); ALTO en el cruce del tren; CEDA para salir a la Avenida 50. Textos del piso de frente al conductor y señales de ALTO y CEDA.
- **Mi progreso (6)**: el simulador guarda cada intento (nota, faltas, duración). El alumno genera un código de reporte y lo envía a su instructor (copiar o compartir por WhatsApp).
- **Panel del instructor** (`instructor.html`): el instructor pega los códigos y ve a todos sus alumnos: mejores notas por prueba, estado (listo / en progreso / necesita práctica), evolución de notas, faltas más repetidas, temas del teórico con más errores e historial de intentos. Exporta a CSV. Los datos quedan solo en el navegador del instructor (sin servidor).
- **Licencia pixel**: se gana al aprobar teórico, plantel y prueba en calle.
- **Vista de piloto** (tecla V) en primera persona.
- **Mapa del tutorial**: 9 tareas con nota (empieza en 100, mínimo 80): incorporarse con direccional, parqueo en batería, ALTO en el cruce del tren, rotonda (3ª salida con direccionales), ALTO en intersección, retroceso entre conos, parqueo en paralelo y regreso al cuadro de inicio.
- **Modo calle**: ciudad grande con centro, **pista** a 80 km/h, dos **cuestas** (bajar compresionando con marcha baja, arrancar en subida con freno de mano) y un **pueblo** con iglesia, pulpería, plaza de fútbol, escuela, cafetales y su propia rotonda. Estilo Miami: palmeras, edificios de colores y torres de vidrio. La marca PULZAR aparece en un rascacielos moderno, vallas, letreros en azoteas y una tienda. El tráfico solo se simula cerca del jugador. Hay tráfico que circula por todas las calles y la rotonda (cediendo el paso), camiones de basura que se detienen a recoger, obras con conos, carros varados con intermitentes, huecos, peatones en las aceras y algunos que cruzan sin paso peatonal. Los carros adelantan a los vehículos detenidos: unos bien (con direccionales) y otros mal. Usted también puede adelantar: direccional izquierda al salir, derecha al volver, nunca en intersecciones ni cerca de pasos peatonales. Además tiene semáforos altos, rotonda, línea del tren con agujas, pasos peatonales, zona escolar y parqueo público. Lleva la cuenta de infracciones y de destinos alcanzados.

## Faltas (según reportes sobre la prueba de Educación Vial)

- Cat. I (−32): irrespetar ALTO, semáforo o ceda; no ceder al peatón; chocar; manejar sin cinturón; cruzar con el tren encima.
- Cat. II (−12): no usar direccionales; exceso de velocidad; tocar conos; salirse de la vía; invadir el carril contrario.
- Cat. III (−8): maniobra incompleta o salida equivocada (valor aproximado).
- Cat. IV (−4): detenerse durante el retroceso.

Verifique siempre la normativa vigente (Ley 9078 y Educación Vial).
