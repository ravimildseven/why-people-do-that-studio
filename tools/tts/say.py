# usage: python say.py <outdir> <voice> <speed> <id=text> [<id=text> ...]
# Writes <id>.wav per line (trimmed), plus <id>.json with per-frame (30 fps) mouth openness 0..1.
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
out, voice, speed = sys.argv[1], sys.argv[2], float(sys.argv[3])
os.makedirs(out, exist_ok=True)
k = Kokoro(os.path.join(HERE, 'models/kokoro-v1.0.onnx'), os.path.join(HERE, 'models/voices-v1.0.bin'))
FPS = 30
meta = {}
for arg in sys.argv[4:]:
    lid, text = arg.split('=', 1)
    lang = 'en-us'
    samples, sr = k.create(text, voice=voice, speed=speed, lang=lang)
    a = np.abs(samples)
    thr = 0.02 * a.max()
    idx = np.where(a > thr)[0]
    pad = int(0.06 * sr)
    samples = samples[max(0, idx[0] - pad): min(len(samples), idx[-1] + pad)]
    sf.write(os.path.join(out, f'{lid}.wav'), samples, sr)
    # mouth envelope: RMS over each 1/30 s window, normalised, gated
    win = sr // FPS
    n = int(np.ceil(len(samples) / win))
    rms = np.array([np.sqrt(np.mean(samples[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(n)])
    env = np.clip((rms / rms.max() - 0.12) / 0.6, 0, 1)
    meta[lid] = {'seconds': round(len(samples) / sr, 3), 'frames': n, 'mouth': [round(float(x), 3) for x in env]}
    print(lid, meta[lid]['seconds'], 's')
with open(os.path.join(out, 'lines.json'), 'w') as f:
    json.dump(meta, f)
