# Escribe js/audio/voces-lista.js con todos los audio/voces/<instructor>/<variante>/<id>.mp3 que existen.
# Uso: python herramientas/lista_voces.py   (desde la carpeta del juego; los generadores de voces lo llaman solos)
import os, json, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
base = os.path.join(root, 'audio', 'voces'); keys = []
for pk in sorted(os.listdir(base)):
    d = os.path.join(base, pk)
    if not os.path.isdir(d) or pk.startswith('_'): continue
    for var in sorted(os.listdir(d)):
        dv = os.path.join(d, var)
        if os.path.isdir(dv):
            keys += [pk + '/' + var + '/' + f[:-4] for f in sorted(os.listdir(dv)) if f.endswith('.mp3')]
open(os.path.join(root, 'js', 'audio', 'voces-lista.js'), 'w', encoding='utf-8', newline='\n').write(
    "'use strict';\n// Generado por herramientas/lista_voces.py: grabaciones que existen en audio/voces/<instructor>/<variante>/<id>.mp3\nconst VOCES_LISTA=" + json.dumps(keys) + ";\n")
print(len(keys), 'grabaciones en la lista')
