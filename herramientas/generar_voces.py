# Genera audio/voces/<instructor>/<id>.mp3 con Piper (https://github.com/OHF-Voice/piper1-gpl) a partir de las frases de js/audio/instructores.js.
# Uso: python -m venv env; env/Scripts/pip install piper-tts lameenc; env/Scripts/python -m piper.download_voices es_MX-ald-medium es_MX-claude-high
#      env/Scripts/python herramientas/generar_voces.py . <carpeta-de-las-voces>
# Voces: es_MX-ald-medium (dominio público, Unlicense) y es_MX-claude-high (Apache 2.0). No usar voces CC BY-SA ni no comerciales.
import sys, os, json, re, subprocess, wave, io
import lameenc
from piper import PiperVoice, SynthesisConfig
root, vdir = sys.argv[1], sys.argv[2]
src = open(os.path.join(root, 'js/audio/instructores.js'), encoding='utf-8').read()
# frases: sacar el objeto INSTR con node (misma fuente que el juego)
js = "const src=require('fs').readFileSync(process.argv[1],'utf8');const i0=src.indexOf('const INSTR='),i1=src.indexOf('const ST_INSTR');const I=eval('('+src.slice(i0+12,i1).trim().replace(/;\\s*$/,'')+')');console.log(JSON.stringify(I))"
I = json.loads(subprocess.check_output(['node', '-e', js, os.path.join(root, 'js/audio/instructores.js')]).decode('utf-8'))
CAST = {  # instructor: (voz, length_scale = más alto es más lento, noise = expresividad)
    'general': ('es_MX-ald-medium', 1.0, 0.667),
    'tropical': ('es_MX-claude-high', 0.9, 0.8),
    'lofi': ('es_MX-ald-medium', 1.2, 0.5),
    'rock': ('es_MX-claude-high', 0.8, 0.9),
}
voices = {}
done = []
for pk, p in I.items():
    vname, ls, ns = CAST[pk]
    if vname not in voices:
        voices[vname] = PiperVoice.load(os.path.join(vdir, vname + '.onnx'))
    v = voices[vname]
    out = os.path.join(root, 'audio', 'voces', pk, 'piper'); os.makedirs(out, exist_ok=True)
    for ev, L in p['L'].items():
        for vid, txt in L:
            t = txt.lower().replace('mae', 'mae').replace('rock and roll', 'rocanrol')
            pcm = b''; sr = None
            for ch in v.synthesize(t, syn_config=SynthesisConfig(length_scale=ls, noise_scale=ns)):
                pcm += ch.audio_int16_bytes; sr = ch.sample_rate
            enc = lameenc.Encoder(); enc.set_bit_rate(48); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
            mp3 = enc.encode(pcm) + enc.flush()
            open(os.path.join(out, vid + '.mp3'), 'wb').write(mp3)
            done.append(pk + '/' + vid)
print(len(done), 'audios')
subprocess.run([sys.executable, os.path.join(root, 'herramientas', 'lista_voces.py'), root])
print(json.dumps(done))
