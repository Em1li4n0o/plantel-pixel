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
| P / Esc | Pausa |
| M | Sonido |
| R | Reiniciar |

## Modos

- **Examen teórico**: banco de práctica con explicaciones, examen de 40 preguntas en 50 minutos (nota mínima 70) y repaso de errores. Las preguntas son propias, no el banco oficial.
- **Plantel San José**: trazado copiado de la foto aérea (aproximado): fila de carros de 40 m bajo los paneles solares, zigzag con muchos conos (−12 cada uno), rotonda con una sola salida (vuelta completa), retroceso de 40 m en la vía de la derecha y, de último, parqueo hacia atrás en la plazoleta de la entrada (tocar un cono ahí pierde la prueba).
- **Licencia pixel**: se gana al aprobar teórico, plantel y prueba en calle.
- **Vista de piloto** (tecla V) en primera persona.
- **Examen en plantel**: 9 tareas con nota (empieza en 100, mínimo 80): incorporarse con direccional, parqueo en batería, ALTO en el cruce del tren, rotonda (3ª salida con direccionales), ALTO en intersección, retroceso entre conos, parqueo en paralelo y regreso al cuadro de inicio.
- **Modo calle**: ciudad libre con semáforos altos, rotonda, línea del tren con agujas, pasos peatonales, zona escolar y parqueo público. Lleva la cuenta de infracciones y de destinos alcanzados.

## Faltas (según reportes sobre la prueba de Educación Vial)

- Cat. I (−32): irrespetar ALTO, semáforo o ceda; no ceder al peatón; chocar; manejar sin cinturón; cruzar con el tren encima.
- Cat. II (−12): no usar direccionales; exceso de velocidad; tocar conos; salirse de la vía; invadir el carril contrario.
- Cat. III (−8): maniobra incompleta o salida equivocada (valor aproximado).
- Cat. IV (−4): detenerse durante el retroceso.

Verifique siempre la normativa vigente (Ley 9078 y Educación Vial).
