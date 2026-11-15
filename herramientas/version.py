# Pone un número de versión (?v=AAAAMMDDHHMMSS) a cada .js y .css que carga index.html, para que los navegadores bajen
# los archivos nuevos en vez de usar los guardados de una versión anterior. Correr ANTES de cada commit que cambie el juego:
#   python herramientas/version.py
# js/nucleo/cargador.js pasa el mismo número a los paquetes que se cargan por partes, y el juego lo usa para los audios.
import re, time, os, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
v = time.strftime('%Y%m%d%H%M%S')
p = os.path.join(root, 'index.html'); s = open(p, encoding='utf-8').read()
s, n = re.subn(r'((?:src|href)="(?:js|css)/[^"?]+)(?:\?v=[^"]*)?"', r'\1?v=' + v + '"', s)
open(p, 'w', encoding='utf-8', newline='\n').write(s)
print(f'versión {v} en {n} archivos')
