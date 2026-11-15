# Guion de voces del instructor

Generado de `js/audio/instructores.js` (no editar a mano: cambie las frases allá y vuelva a generar).

Cada instructor puede tener varias voces (variantes) que el jugador elige en CONFIGURACIÓN. Cada frase se graba como **audio/voces/<instructor>/<variante>/<id>.mp3** (mono, sin silencios largos). Después se corre `python herramientas/lista_voces.py` para que el juego la encuentre.

- Piper: `herramientas/generar_voces.py` (variante `piper`).
- ElevenLabs: `herramientas/generar_voces_elevenlabs.py` (el resto de variantes).

## PROFE PIXEL · carpeta `general/`

**Personalidad:** Neutro, vacilón y tranquilo. **Suena con:** Radio apagada. **Voces:** `eleven` (vacilón), `piper` (clásico).

| Archivo | Cuándo se dice | Texto |
|---|---|---|
| `trompo1.mp3` | Da una vuelta completa resbalando (trompo) | ¡Uy, qué trompo! Bien controlado, pero en la calle real ni se le ocurra. |
| `trompo2.mp3` | Da una vuelta completa resbalando (trompo) | ¡Una vuelta completa! Eso sí que no lo enseño en clase. |
| `derrape1.mp3` | Derrapa más de 2,5 segundos | Qué derrape tan largo. Ojo con las llantas. |
| `derrape2.mp3` | Derrapa más de 2,5 segundos | Bonito derrape. Ahora, suave otra vez. |
| `velocidad1.mp3` | Pasa de 180 km/h | Más de ciento ochenta kilómetros por hora. Aquí se vale, en la calle no. |
| `choque1.mp3` | Choca con otro carro u objeto | ¿Todo bien? Respire y siga. |
| `choque2.mp3` | Choca con otro carro u objeto | Uy, ese golpe sonó feo. Con calma. |
| `aplastar1.mp3` | Aplasta un carro con el monster truck | ¡Lo aplastó! Menos mal que es un juego. |
| `casi1.mp3` | Pasa rozando otro carro a más de 60 km/h | ¡Uf, por poquito! Deje más espacio. |
| `casi2.mp3` | Pasa rozando otro carro a más de 60 km/h | Muy cerca de ese carro. Mantenga distancia. |
| `hola1.mp3` | Al cambiar de emisora (presentación) | Diay, ¿qué tal? Soy el Profe Pixel. Maneje a su ritmo, que aquí vamos tranquilos. |

## PROFE TROPICAL · carpeta `tropical/`

**Personalidad:** Reggaetonero bien relajado. **Suena con:** Tropical 94.3. **Voces:** `eleven` (reggaetonero), `piper` (clásico).

| Archivo | Cuándo se dice | Texto |
|---|---|---|
| `trompo1.mp3` | Da una vuelta completa resbalando (trompo) | ¡Qué chiva, mae! ¡Qué tremenda vuelta! |
| `trompo2.mp3` | Da una vuelta completa resbalando (trompo) | ¡Diay, qué trompo más tuanis! |
| `derrape1.mp3` | Derrapa más de 2,5 segundos | ¡Pura vida ese derrape! |
| `derrape2.mp3` | Derrapa más de 2,5 segundos | ¡Upe, cómo baila ese carro! |
| `velocidad1.mp3` | Pasa de 180 km/h | ¡Qué rajado! Va volando, mae. |
| `choque1.mp3` | Choca con otro carro u objeto | ¡Uy, mae! ¿Todo bien? Tranqui, siga. |
| `choque2.mp3` | Choca con otro carro u objeto | ¡Qué golpazo! Pero aquí seguimos, pura vida. |
| `aplastar1.mp3` | Aplasta un carro con el monster truck | ¡Qué torta! Lo dejó como tortilla. |
| `casi1.mp3` | Pasa rozando otro carro a más de 60 km/h | ¡Por un pelito, mae! |
| `casi2.mp3` | Pasa rozando otro carro a más de 60 km/h | ¡Uy, casi se lo lleva puesto! |
| `hola1.mp3` | Al cambiar de emisora (presentación) | Pura vida, mi rey. Aquí el Profe Tropical, bien relajado. Vamos suave, con buena música. |

## PROFE ZEN · carpeta `lofi/`

**Personalidad:** Dulce y en calma. **Suena con:** Lo-fi 88.9 y práctica tranquila. **Voces:** `dulce` (chica dulce), `abuelo` (viejito zen), `piper` (clásico).

| Archivo | Cuándo se dice | Texto |
|---|---|---|
| `trompo1.mp3` | Da una vuelta completa resbalando (trompo) | Una vuelta completa. Respire. Volvamos a la calma. |
| `trompo2.mp3` | Da una vuelta completa resbalando (trompo) | El mundo giró un poquito. Despacio, volvamos al carril. |
| `derrape1.mp3` | Derrapa más de 2,5 segundos | Sienta cómo resbala el carro. Ahora, suave. |
| `derrape2.mp3` | Derrapa más de 2,5 segundos | Las llantas también necesitan descanso. |
| `velocidad1.mp3` | Pasa de 180 km/h | Vamos muy rápido. Bajemos el ritmo, sin prisa. |
| `choque1.mp3` | Choca con otro carro u objeto | Tranquilo. Un golpe no define el viaje. Siga. |
| `choque2.mp3` | Choca con otro carro u objeto | Respire hondo. Todo bien. Seguimos con calma. |
| `aplastar1.mp3` | Aplasta un carro con el monster truck | Eso fue intenso. Respiremos. |
| `casi1.mp3` | Pasa rozando otro carro a más de 60 km/h | Muy cerca. Más espacio, más calma. |
| `casi2.mp3` | Pasa rozando otro carro a más de 60 km/h | Deje que los demás pasen. No hay prisa. |
| `hola1.mp3` | Al cambiar de emisora (presentación) | Hola. Soy el Profe Zen. Respire, y maneje tranquilo, sin prisa. |

## ROCKO · carpeta `rock/`

**Personalidad:** Rockero emocionado, a todo volumen. **Suena con:** Arcade Rock 107.7. **Voces:** `rasposo` (señor rasposo), `radical` (chica radical), `piper` (clásico).

| Archivo | Cuándo se dice | Texto |
|---|---|---|
| `trompo1.mp3` | Da una vuelta completa resbalando (trompo) | ¡WOW! ¡Qué tremenda vuelta, amigo! |
| `trompo2.mp3` | Da una vuelta completa resbalando (trompo) | ¡Ey, ey, EY! ¡Eso fue un trompo de leyenda! |
| `derrape1.mp3` | Derrapa más de 2,5 segundos | ¡Eso es! ¡Qué derrape más brutal! |
| `derrape2.mp3` | Derrapa más de 2,5 segundos | ¡Siga, siga! ¡Qué humo! |
| `velocidad1.mp3` | Pasa de 180 km/h | ¡Más de ciento ochenta! ¡Esto es rock and roll! |
| `choque1.mp3` | Choca con otro carro u objeto | ¡Uff, qué golpe! ¡Pero seguimos! |
| `choque2.mp3` | Choca con otro carro u objeto | ¡Auch! ¡Eso dolió hasta en la guitarra! |
| `aplastar1.mp3` | Aplasta un carro con el monster truck | ¡APLASTADO! ¡Qué bestia! |
| `casi1.mp3` | Pasa rozando otro carro a más de 60 km/h | ¡Uyyy, por un pelo! ¡Qué nervios! |
| `casi2.mp3` | Pasa rozando otro carro a más de 60 km/h | ¡Wow, lo pasó rozando! |
| `hola1.mp3` | Al cambiar de emisora (presentación) | ¡Súbale al volumen! Soy Rocko. ¡A manejar! |

