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
| C | Cinturón (con el carro detenido) |
| Espacio | Freno de mano |
| V | Vista de piloto |
| Z / X | (Piloto) mirar a la izquierda / derecha: espejos laterales |
| F | (Piloto) mirar hacia arriba; también se inclina sola al detenerse en un semáforo |
| B | Pitar (solo para evitar accidentes; nunca en zona escolar) |
| G | Marcha baja: compresionar al bajar cuestas |
| P / Esc | Pausa |
| M | Sonido |
| R | Reiniciar |

## Modos

- **Tutorial (0)**: enseña los controles paso a paso (cinturón, pedales, volante, direccionales, reversa, freno de mano, marcha baja, bocina, vistas y espejos).
- **Celular / tablet**: botones en pantalla (volante, pedales, direccionales, pito, vista, freno de mano). Se juega en horizontal.

- **Examen teórico**: banco de práctica con explicaciones, examen de 40 preguntas en 50 minutos (nota mínima 70) y repaso de errores. Las preguntas son propias, no el banco oficial.
- **Plantel San José**: trazado copiado de la foto aérea (aproximado): fila de carros de 40 m bajo los paneles solares, zigzag en diagonal con hileras de conos alternadas (−12 cada uno), rotonda con vuelta completa y una sola salida al sur que sube a la vía de la derecha (2 carriles), retroceso de 40 m y, de último, parqueo hacia atrás en uno de 4 espacios de la plazoleta de la entrada (tocar un cono ahí pierde la prueba).
- **Mi progreso (9)**: el simulador guarda cada intento (nota, faltas, duración). El alumno genera un código de reporte y lo envía a su instructor (copiar o compartir por WhatsApp).
- **Panel del instructor** (`instructor.html`): el instructor pega los códigos y ve a todos sus alumnos: mejores notas por prueba, estado (listo / en progreso / necesita práctica), evolución de notas, faltas más repetidas, temas del teórico con más errores e historial de intentos. Exporta a CSV. Los datos quedan solo en el navegador del instructor (sin servidor).
- **Licencia pixel**: se gana al aprobar teórico, plantel y prueba en calle.
- **Vista de piloto** (tecla V) en primera persona.
- **Examen en plantel**: 9 tareas con nota (empieza en 100, mínimo 80): incorporarse con direccional, parqueo en batería, ALTO en el cruce del tren, rotonda (3ª salida con direccionales), ALTO en intersección, retroceso entre conos, parqueo en paralelo y regreso al cuadro de inicio.
- **Modo calle**: ciudad grande con centro, **pista** a 80 km/h, dos **cuestas** (bajar compresionando con marcha baja, arrancar en subida con freno de mano) y un **pueblo** con iglesia, pulpería, plaza de fútbol, escuela, cafetales y su propia rotonda. La marca PULZAR aparece en la torre, vallas y una tienda. El tráfico solo se simula cerca del jugador. Hay tráfico que circula por todas las calles y la rotonda (cediendo el paso), camiones de basura que se detienen a recoger, obras con conos, carros varados con intermitentes, huecos, peatones en las aceras y algunos que cruzan sin paso peatonal. Los carros adelantan a los vehículos detenidos: unos bien (con direccionales) y otros mal. Usted también puede adelantar: direccional izquierda al salir, derecha al volver, nunca en intersecciones ni cerca de pasos peatonales. Además tiene semáforos altos, rotonda, línea del tren con agujas, pasos peatonales, zona escolar y parqueo público. Lleva la cuenta de infracciones y de destinos alcanzados.

## Faltas (según reportes sobre la prueba de Educación Vial)

- Cat. I (−32): irrespetar ALTO, semáforo o ceda; no ceder al peatón; chocar; manejar sin cinturón; cruzar con el tren encima.
- Cat. II (−12): no usar direccionales; exceso de velocidad; tocar conos; salirse de la vía; invadir el carril contrario.
- Cat. III (−8): maniobra incompleta o salida equivocada (valor aproximado).
- Cat. IV (−4): detenerse durante el retroceso.

Verifique siempre la normativa vigente (Ley 9078 y Educación Vial).
