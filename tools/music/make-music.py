# Composes the channel's music in code, so there is no licence to track.
# usage: tools/tts/venv/bin/python tools/music/make-music.py
# Writes:
#   public/music/sleepy-bed.wav   a soft, sleepy loop (music box + warm keys + bass), 84 BPM, F major, 8 bars (~22.9 s)
#   public/sfx/sting-dare.wav     two quick plucks up (a playful "go on then")
#   public/sfx/slide-down.wav     a slow, wobbly slide down (a sleepy give-up)
import os
import numpy as np
import soundfile as sf

SR = 48000
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def hz(n):  # midi note -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a, d, sustain=0.0, r=None):
    """attack (s), exponential decay time-constant (s), optional release over the last r seconds"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (sustain + (1 - sustain) * np.exp(-np.maximum(0, t - a) / d))
    if r:
        k = int(r * SR)
        e[-k:] *= np.linspace(1, 0, k)
    return e


def tone(freq, dur, partials, a=0.005, d=0.6, sustain=0.0, r=0.05, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for i, (mult, amp) in enumerate(partials):
        out += amp * np.sin(2 * np.pi * freq * mult * (1 + detune * (i % 2 * 2 - 1)) * t)
    return out * env(n, a, d, sustain, r)


def place(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def reverb(x, mix=0.25):
    # a few feedback combs + a light low-pass: enough to soften the tones
    y = np.zeros_like(x)
    for delay, fb in [(0.0297, 0.72), (0.0371, 0.70), (0.0411, 0.68), (0.0437, 0.66)]:
        k = int(delay * SR)
        c = np.copy(x)
        for i in range(k, len(c)):
            c[i] += fb * c[i - k]
        y += c
    y /= 4
    # one-pole low-pass
    a = 0.35
    for i in range(1, len(y)):
        y[i] = y[i - 1] + a * (y[i] - y[i - 1])
    return (1 - mix) * x + mix * y


MUSIC_BOX = [(1, 1.0), (2.01, 0.35), (3.98, 0.12), (6.1, 0.05)]
KEYS = [(1, 1.0), (2, 0.25), (3, 0.08)]
BASS = [(1, 1.0), (2, 0.18)]


def sleepy_bed():
    bpm = 84
    beat = 60 / bpm
    bar = 4 * beat
    bars = 8
    dur = bars * bar + 1.5
    buf = np.zeros(int(dur * SR))
    # F major: Fmaj7, Dm7, Bbmaj7, Csus4 -> C, twice
    chords = [
        (41, [53, 57, 60, 64]),
        (38, [50, 53, 57, 60]),
        (46, [50, 53, 57, 58]),
        (36, [48, 53, 55, 60]),
    ]
    # music-box tune, (beat offset in the bar, midi note), pentatonic and lazy
    tunes = [
        [(0, 72), (1.5, 69), (2, 67), (3, 69)],
        [(0, 65), (1, 67), (2, 69), (3.5, 72)],
        [(0, 74), (1.5, 72), (2, 69), (3, 67)],
        [(0, 67), (1, 65), (2.5, 64), (3, 65)],
    ]
    for b in range(bars):
        t0 = b * bar
        bass, notes = chords[b % 4]
        # warm keys: chord on beat 1, soft repeat on beat 3
        for k, at in enumerate([0, 2]):
            for i, n in enumerate(notes):
                place(buf, 0.10 * (0.7 if k else 1) * tone(hz(n), 2.6, KEYS, a=0.02 + 0.01 * i, d=1.2), t0 + at * beat + 0.012 * i)
        # bass: root on 1, fifth on 3
        place(buf, 0.20 * tone(hz(bass), 1.6, BASS, a=0.01, d=0.5), t0)
        place(buf, 0.14 * tone(hz(bass + 7), 1.4, BASS, a=0.01, d=0.45), t0 + 2 * beat)
        # music box (rests in bars 1 and 5 so the opening is mostly keys)
        if b % 4 != 0 or b >= 4:
            for at, n in tunes[b % 4]:
                place(buf, 0.16 * tone(hz(n), 1.4, MUSIC_BOX, a=0.002, d=0.35), t0 + at * beat)
        # soft "tick" brush on the off-beats for a lazy pulse
        for at in [1, 3]:
            nz = np.random.default_rng(b * 10 + at).standard_normal(int(0.05 * SR)) * env(int(0.05 * SR), 0.001, 0.012)
            place(buf, 0.03 * nz, t0 + at * beat)
    buf = reverb(buf, 0.3)
    # fade the tail
    k = int(1.2 * SR)
    buf[-k:] *= np.linspace(1, 0, k)
    return buf


def sting_dare():
    buf = np.zeros(int(0.9 * SR))
    place(buf, 0.5 * tone(hz(72), 0.6, MUSIC_BOX, d=0.18), 0.0)
    place(buf, 0.55 * tone(hz(79), 0.8, MUSIC_BOX, d=0.28), 0.12)
    return reverb(buf, 0.25)


def slide_down():
    dur = 1.3
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 700 * (200 / 700) ** (t / dur) * (1 + 0.025 * np.sin(2 * np.pi * 6 * t))  # glide with a wobble
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = (np.sin(ph) + 0.2 * np.sin(2 * ph)) * env(n, 0.04, 0.9, 0.3, 0.3)
    return reverb(0.35 * sig, 0.25)


def write(path, mono, gain_db_peak=-6.0):
    peak = np.max(np.abs(mono)) + 1e-9
    mono = mono / peak * 10 ** (gain_db_peak / 20)
    st = np.stack([mono, mono], axis=1)
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    sf.write(full, st, SR)
    print('wrote', path, round(len(mono) / SR, 2), 's')


if __name__ == '__main__':
    write('public/music/sleepy-bed.wav', sleepy_bed(), -3.0)
    write('public/sfx/sting-dare.wav', sting_dare(), -4.0)
    write('public/sfx/slide-down.wav', slide_down(), -5.0)
