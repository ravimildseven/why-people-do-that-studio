# why-people-do-that-studio

Production code for the YouTube channel **Why People Do That**: short animated plays about everyday
human behaviour, each with one verified psychology fact.

Everything is made in code (Remotion + React/SVG): characters, sets, captions, fact cards and the voice.
No image or video generation credits are spent, and every render is identical.

## What's here
| Path | What |
|---|---|
| `src/kit/Person.tsx` | the character rig: 8 expressions, poses, sitting, talking mouth, blinks |
| `src/cast.ts` | the cast: Mika, Dev, Aaji. A new character is a new entry here |
| `src/sets/Bedroom.tsx` | night bedroom set, lays itself out for 9:16 or 16:9 |
| `src/kit/Overlays.tsx` | hook headline card, caption bar, fact card, clock chip, fonts |
| `src/shorts/` | one file per Short (`S01Bedtime.tsx` = "Exhausted… but still awake?") |
| `episodes/<id>/SCRIPT.md` | script, beats and fact-check notes per video |
| `public/vo/<id>/` | voice lines (`L1.wav`…) + `lines.json` (durations + lip-sync data) |
| `public/sfx/`, `public/fonts/` | sound effects; Bangers + Baloo 2 fonts (both SIL Open Font License) |
| `tools/tts/` | free text-to-speech (Kokoro, Apache-2.0) |
| `tools/sheets/` | character sheet / set preview renders |
| `CHARACTER-GUIDE.md` | the style rules every character and set follows |

## Setup (once)
```bash
npm install
npm run tts:setup        # only if you'll generate voices: Python venv + ~350 MB model download
```

## Make a Short
```bash
# 1. voices: one wav per line + lines.json, into public/vo/<id>/
tools/tts/venv/bin/python tools/tts/say.py public/vo/s01 af_heart 1.0 \
  "L1=Okay. Five more minutes. Then sleep." "L2=One more video. I've earned this."

# 2. preview and tweak timing
npm run studio                                            # http://localhost:3000

# 3. check stills, then render
npm run still -- S01-Bedtime out/check.png --frame=300
npm run render -- S01-Bedtime out/S01.mp4 --crf=18

# 4. loudness for Shorts (≈ -14 LUFS)
ffmpeg -i out/S01.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k out/S01-final.mp4
```
Voices tried for Mika: `af_heart` (current), `af_bella`, `bf_emma` (British), `hf_alpha` (Indian accent).

## Previews
`npm run sheet:mika`, `npm run sheet:cast`, `npm run sheet:sets` write PNGs to `out/`.
On your own computer these need Playwright once: `npm i -D playwright && npx playwright install chromium`.
