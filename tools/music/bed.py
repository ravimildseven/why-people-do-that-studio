# usage: python bed.py <out.wav> <seconds>
# A soft, original lo-fi music bed made from code (no samples, no licences needed):
# warm electric-piano chords (Am7 - Fmaj7 - Cmaj7 - G6, 4 s each), a quiet sub bass and a
# gentle pluck pattern, low-passed and faded. Meant to sit ~20 dB under the narrator.
import sys
import numpy as np
import soundfile as sf

out, secs = sys.argv[1], float(sys.argv[2])
SR = 44100
n = int(SR * secs)
t = np.arange(n) / SR
mix = np.zeros(n)

def hz(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)

def tone(f, start, dur, amp, decay, harmonics=(1, 0.5, 0.25, 0.12)):
    i0 = int(start * SR)
    i1 = min(n, int((start + dur) * SR))
    if i0 >= n:
        return
    tt = np.arange(i1 - i0) / SR
    env = (1 - np.exp(-tt / 0.012)) * np.exp(-tt / decay)
    w = sum(a * np.sin(2 * np.pi * f * k * tt + k) for k, a in enumerate(harmonics, start=1))
    w *= 1 + 0.003 * np.sin(2 * np.pi * 5 * tt)  # tiny wobble
    mix[i0:i1] += amp * env * w

CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]]  # Am7 Fmaj7 Cmaj7 G6
BASS = [45, 41, 36, 43]
BAR = 4.0
bar = 0
while bar * BAR < secs:
    c = CHORDS[bar % 4]
    s = bar * BAR
    for k, m in enumerate(c):
        tone(hz(m), s + k * 0.012, BAR + 1.5, 0.09, 2.6)
        tone(hz(m), s + 2.0 + k * 0.012, 2.5, 0.05, 1.6)
    tone(hz(BASS[bar % 4] - 12), s, BAR, 0.16, 3.0, harmonics=(1, 0.2))
    for j, step in enumerate([0.5, 1.25, 2.5, 3.25]):  # sparse pluck pattern
        tone(hz(c[(j + bar) % 4] + 12), s + step, 0.8, 0.035, 0.35, harmonics=(1, 0.3))
    bar += 1

# soft low-pass (one-pole), vinyl-ish noise, fades
a = np.exp(-2 * np.pi * 2600 / SR)
y = np.empty(n)
acc = 0.0
for i in range(n):
    acc = (1 - a) * mix[i] + a * acc
    y[i] = acc
y += np.random.default_rng(7).normal(0, 0.0015, n)
fade = np.minimum(1, np.minimum(t / 1.0, (secs - t) / 1.5))
y *= np.clip(fade, 0, 1)
y /= np.abs(y).max() + 1e-9
y *= 0.5
sf.write(out, np.stack([y, y], axis=1), SR)
print(out, round(secs, 1), 's')
