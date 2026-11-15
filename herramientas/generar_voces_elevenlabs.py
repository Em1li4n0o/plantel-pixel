# Voces del instructor con ElevenLabs (https://elevenlabs.io).
#
# Necesita una clave de la API de ElevenLabs: el programa la pide al empezar (o la toma de ELEVENLABS_API_KEY). Se crea en
# elevenlabs.io > Developers > API Keys; NO la guarde en el repositorio). Solo usa la biblioteca estándar de Python.
#
#   python herramientas/generar_voces_elevenlabs.py            busca voces, elige la mejor para cada papel y genera todo
#   python herramientas/generar_voces_elevenlabs.py buscar     solo busca: deja audio/voces/_candidatos.html para escuchar
#                                                              las opciones (escuchar las muestras NO gasta créditos)
#   python herramientas/generar_voces_elevenlabs.py elegir rock/rasposo 3     usa el candidato 3 para ese papel
#   python herramientas/generar_voces_elevenlabs.py generar [papel ...]        genera (o regenera) las frases
#
# Papeles: general/eleven, tropical/eleven, lofi/dulce, lofi/abuelo, rock/rasposo, rock/radical.
# Las frases salen de js/audio/instructores.js; los audios van a audio/voces/<instructor>/<variante>/<id>.mp3.
# Plan gratis: 10.000 créditos al mes (1 crédito por letra); todo esto gasta unos 2.700. El plan gratis NO permite uso
# comercial y pide mencionar a ElevenLabs: antes de vender, pasar a Starter (USD 6) y volver a generar.
import os, sys, json, subprocess, urllib.request, urllib.parse, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
API = 'https://api.elevenlabs.io/v1'
PICKS = os.path.join(ROOT, 'herramientas', 'voces_elevenlabs.json')
CANDS = os.path.join(ROOT, 'herramientas', '_candidatos.json')
MODELS = ['eleven_v4', 'eleven_multilingual_v2']  # se prueba el más expresivo primero; si la cuenta no lo tiene, el siguiente
# Cuenta gratis: ElevenLabs no deja usar por la API las voces de la biblioteca, solo sus voces de fábrica (hablan español
# con el modelo multilingüe). Estas son las que mejor calzan con cada papel; con plan de pago se usan las de la biblioteca.
FABRICA = {'general/eleven': 'Chris', 'tropical/eleven': 'Roger', 'lofi/dulce': 'Lily', 'lofi/abuelo': 'Bill',
           'rock/rasposo': 'Callum', 'rock/radical': 'Laura'}
# papel: qué buscar en la biblioteca y cómo debe sonar (estabilidad baja = más expresiva; style = más actuada)
ROLES = {
    'general/eleven': dict(gender='male', age='middle_aged', search=['conversational', 'casual', ''], quiere='Hombre de unos 30 años, voz neutra pero interesante, vacilona y tranquila',
                           vs=dict(stability=.45, similarity_boost=.8, style=.35)),
    'tropical/eleven': dict(gender='male', age='young', search=['reggaeton', 'relaxed', 'chill', 'casual', ''], quiere='Reggaetonero bien relajado, suelto, caribeño',
                            caribe=True, vs=dict(stability=.35, similarity_boost=.75, style=.5)),
    'lofi/dulce': dict(gender='female', age='young', search=['soft', 'sweet', 'calm', 'gentle', ''], quiere='Chica de voz muy dulce y calmada',
                       vs=dict(stability=.6, similarity_boost=.8, style=.25)),
    'lofi/abuelo': dict(gender='male', age='old', search=['calm', 'wise', 'grandfather', ''], quiere='Viejito sabio, zen, que habla despacio',
                        vs=dict(stability=.65, similarity_boost=.8, style=.2)),
    'rock/rasposo': dict(gender='male', age='middle_aged', search=['raspy', 'gravelly', 'rough', 'deep', ''], quiere='Señor rockero con la voz rasposa',
                         vs=dict(stability=.3, similarity_boost=.8, style=.65)),
    'rock/radical': dict(gender='female', age='young', search=['energetic', 'edgy', 'rebel', 'confident', ''], quiere='Chica radical, rockera y con energía',
                         vs=dict(stability=.3, similarity_boost=.75, style=.6)),
}
LATAM = ('latin', 'mexic', 'colomb', 'venez', 'argent', 'chile', 'peru', 'costa', 'puerto', 'caribbean', 'domin', 'cuba', 'ecuador', 'guatem', 'panam', 'neutral')
CARIBE = ('puerto', 'caribbean', 'domin', 'cuba', 'colomb', 'venez', 'panam')

def key():
    k = os.environ.get('ELEVENLABS_API_KEY', '').strip().strip('"\'= ')
    if not k:  # si no está en la variable, se pide aquí (no se ve en pantalla al pegarla)
        import getpass
        k = getpass.getpass('Pegue su clave de ElevenLabs (no se verá al pegarla) y presione Enter: ').strip().strip('"\'= ')
        if not k: sys.exit('No se recibió ninguna clave.')
        os.environ['ELEVENLABS_API_KEY'] = k
    return k

def req(method, path, body=None, raw=False):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(API + path, data=data, method=method, headers={'xi-api-key': key(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' if raw else 'application/json'})
    try:
        with urllib.request.urlopen(r, timeout=90) as f:
            b = f.read()
            return b if raw else json.loads(b.decode() or '{}')
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors='replace')[:400]
        raise RuntimeError(f'ElevenLabs {e.code} en {path}: {msg}')

def lines():
    js = ("const src=require('fs').readFileSync(process.argv[1],'utf8');const i0=src.indexOf('const INSTR='),i1=src.indexOf('const ST_INSTR');"
          "const I=eval('('+src.slice(i0+12,i1).trim().replace(/;\\s*$/,'')+')');console.log(JSON.stringify(I))")
    return json.loads(subprocess.check_output(['node', '-e', js, os.path.join(ROOT, 'js/audio/instructores.js')]).decode('utf-8'))

def score(v, role):
    acc = (v.get('accent') or '').lower() + ' ' + (v.get('description') or '').lower()
    if any(x in acc for x in ('spain', 'peninsular', 'castil', 'españa', 'madrid')): return -1
    s = 2 if any(x in acc for x in LATAM) else 0
    if role.get('caribe') and any(x in acc for x in CARIBE): s += 2
    return s

def buscar(solo=None):
    cands = json.load(open(CANDS, encoding='utf-8')) if os.path.exists(CANDS) else {}
    for rk, role in ROLES.items():
        if solo and rk not in solo: continue
        found = {}
        for term in role['search']:
            q = dict(page_size=40, language='es', gender=role['gender'], age=role['age'], sort='usage_character_count_1y')
            if term: q['search'] = term
            for v in req('GET', '/shared-voices?' + urllib.parse.urlencode(q)).get('voices', []):
                if v.get('free_users_allowed') is False or score(v, role) < 0: continue
                found.setdefault(v['voice_id'], v)
            if len(found) >= 8: break
        L = sorted(found.values(), key=lambda v: (-score(v, role), -(v.get('usage_character_count_1y') or 0)))[:8]
        cands[rk] = [dict(voice_id=v['voice_id'], owner=v['public_owner_id'], name=v.get('name'), accent=v.get('accent'), age=v.get('age'),
                          desc=(v.get('description') or '')[:200], preview=v.get('preview_url')) for v in L]
        print(f'{rk}: {len(L)} candidatos' + (f' · el mejor: {L[0].get("name")} ({L[0].get("accent")})' if L else ' (ninguno, pruebe otra búsqueda)'))
    json.dump(cands, open(CANDS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    html = ['<!doctype html><meta charset="utf-8"><title>Candidatos de voces</title><body style="font:15px system-ui;background:#111;color:#eee;max-width:900px;margin:auto;padding:20px">',
            '<h1>Voces candidatas (ElevenLabs)</h1><p>Escuchar no gasta créditos. Para cambiar una: <code>python herramientas/generar_voces_elevenlabs.py elegir PAPEL N</code> y luego <code>generar PAPEL</code>.</p>']
    picks = json.load(open(PICKS, encoding='utf-8')) if os.path.exists(PICKS) else {}
    for rk, L in cands.items():
        html.append(f'<h2>{rk}</h2><p style="color:#aaa">{ROLES[rk]["quiere"]}</p><ol>')
        for v in L:
            sel = ' <b style="color:#ffd23f">← ELEGIDA</b>' if picks.get(rk, {}).get('voice_id') == v['voice_id'] else ''
            html.append(f'<li><b>{v["name"]}</b> · {v["accent"]} · {v["age"]}{sel}<br><small>{v["desc"]}</small><br><audio controls preload="none" src="{v["preview"]}"></audio></li>')
        html.append('</ol>')
    os.makedirs(os.path.join(ROOT, 'audio', 'voces'), exist_ok=True)
    open(os.path.join(ROOT, 'audio', 'voces', '_candidatos.html'), 'w', encoding='utf-8').write('\n'.join(html))
    for rk, L in cands.items():
        if rk not in picks and L: picks[rk] = L[0]
    json.dump(picks, open(PICKS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Candidatos para escuchar: audio/voces/_candidatos.html')

def elegir(rk, n):
    cands = json.load(open(CANDS, encoding='utf-8'))
    picks = json.load(open(PICKS, encoding='utf-8')) if os.path.exists(PICKS) else {}
    picks[rk] = cands[rk][int(n) - 1]
    json.dump(picks, open(PICKS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{rk} → {picks[rk]["name"]}. Ahora corra: generar {rk}')

USE_LANG = True
def tts(vid, txt, vs):
    global MODELS, USE_LANG
    while True:
        body = {'text': txt, 'model_id': MODELS[0], 'voice_settings': dict(vs, use_speaker_boost=True)}
        if USE_LANG: body['language_code'] = 'es'
        try:
            return req('POST', f'/text-to-speech/{vid}?output_format=mp3_44100_64', body, raw=True)
        except RuntimeError as e:
            m = str(e)
            if USE_LANG and 'language' in m.lower(): USE_LANG = False; continue
            if len(MODELS) > 1 and ('model' in m.lower() or 'language_code' in m or ' 400 ' in m or ' 422 ' in m):
                print(f'  (el modelo {MODELS[0]} no está disponible para esta cuenta; uso {MODELS[1]})'); MODELS = MODELS[1:]; continue
            raise

def generar(solo=None):
    I = lines()
    sub = req('GET', '/user/subscription'); gratis = (sub.get('tier') or 'free') == 'free'
    voces = req('GET', '/voices').get('voices', []); mine = {v['voice_id'] for v in voces}
    if gratis:
        print('Cuenta gratis: uso las voces de fábrica de ElevenLabs (las de la biblioteca piden plan de pago).')
        byname = {v['name'].split(' ')[0].split('-')[0].strip().lower(): v for v in voces if v.get('category') == 'premade'}
        picks = {}
        for rk, nm in FABRICA.items():
            v = byname.get(nm.lower())
            if v: picks[rk] = dict(voice_id=v['voice_id'], name=v['name'], fabrica=True)
            else: print(f'  {rk}: no encontré la voz {nm} en su cuenta')
    else:
        picks = json.load(open(PICKS, encoding='utf-8'))
    total = 0
    for rk, role in ROLES.items():
        if (solo and rk not in solo) or rk not in picks: continue
        pk, var = rk.split('/'); v = picks[rk]; vid = v['voice_id']
        if vid not in mine and not v.get('fabrica'):  # las voces de la biblioteca se agregan a la cuenta (no gastan los cupos de voces propias)
            vid = req('POST', f'/voices/add/{v["owner"]}/{v["voice_id"]}', {'new_name': f'Plantel Pixel {rk}'}).get('voice_id', vid); mine.add(vid)
        out = os.path.join(ROOT, 'audio', 'voces', pk, var); os.makedirs(out, exist_ok=True)
        for ev, L in I[pk]['L'].items():
            for lid, txt in L:
                audio = tts(vid, txt, role['vs'])
                open(os.path.join(out, lid + '.mp3'), 'wb').write(audio); total += len(txt)
        print(f'{rk}: listo con la voz {v["name"]} (modelo {MODELS[0]})')
    print(f'Letras usadas: {total}')
    try:
        s = req('GET', '/user/subscription'); print(f'Créditos del mes: {s.get("character_count")} de {s.get("character_limit")}')
    except Exception: pass
    subprocess.run([sys.executable, os.path.join(ROOT, 'herramientas', 'lista_voces.py'), ROOT])

if __name__ == '__main__':
    a = sys.argv[1:]
    cmd = a[0] if a else 'todo'
    if cmd == 'buscar': buscar(a[1:] or None)
    elif cmd == 'elegir': elegir(a[1], a[2])
    elif cmd == 'generar': generar(a[1:] or None)
    elif cmd == 'todo': buscar(); generar()
    else: sys.exit(__doc__ if __doc__ else 'Comando no válido')
