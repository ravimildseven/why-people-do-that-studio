# Short S02: "One yawn. Whole house."

**Behaviour:** catching a yawn just from seeing someone else yawn.
**Format:** 9:16 play, about 22 s. Each character speaks a line (TTS) and a caption bar shows it.
The hook headline stays on screen the whole time. One fact card appears.
**Set:** night bedroom (same as S01, no new set). **Cast:** Dev, Mika, Aaji.

## Hook headline (top card, whole video)
ONE YAWN. WHOLE HOUSE.

## Beats
| # | Clock | Shot | Action | Line (TTS + caption) |
|---|---|---|---|---|
| Y1 | 10:30 PM | two-shot, Dev + Mika on the bed | Mika wide awake. Dev, on the edge of the bed, stretches and yawns huge. Mika watches | |
| L1 | 10:30 PM | two-shot | | Dev: "Sorry. Long day." |
| Y2 | 10:30 PM | two-shot | Mika presses her lips together, sweating, fighting it... and yawns anyway | |
| L2 | 10:30 PM | two-shot | shocked | Mika: "I wasn't even tired!" |
| Y3 | 10:31 PM | cut to the wide shot: Aaji is standing by the bed | Aaji yawns, her glasses slide down her nose and stay there | |
| L3 | 10:31 PM | wide | | Aaji: "Who started this?" |
| FACT | 10:31 PM | wide | all three side-eye each other | fact card (see below) |
| L4 | 10:32 PM | slow push in on Mika | Mika points straight at the viewer | Mika: "Did you just yawn too?" |
| END | 10:32 PM | close | Dev yawns again, Mika catches it again | |

## Fact card (on-screen text only)
**CONTAGIOUS YAWNING**
55% of people watching a 5-minute yawn video yawned within 5 minutes.
*Provine, 1986, Ethology*

### Fact check (Nov 25, 2026)
- Provine, R. R. (1986), "Yawning as a stereotyped action pattern and releasing stimulus", *Ethology* 72:109-122.
  Viewers watched a 5-minute video of repeated yawns; 55% yawned during it.
- Provine restates the 55% / 5-minute figure himself in "Contagious yawning and infant imitation",
  *Bulletin of the Psychonomic Society* 27(2), 1989.
- Don't claim yawning shows empathy: that link is debated. Nothing in the episode says why it spreads.

## Voices (Kokoro, free)
| Character | Voice | Speed | Note |
|---|---|---|---|
| Mika | `af_heart` | 1.0 | same as S01; follows the owner's pick of Mika's voice |
| Dev | `am_michael` | 1.0 | first use, owner to confirm |
| Aaji | `hf_beta` | 0.92 | first use, owner to confirm |

```bash
tools/tts/venv/bin/python tools/tts/say.py public/vo/s02 am_michael 1.0 "L1=Sorry. Long day."
tools/tts/venv/bin/python tools/tts/say.py public/vo/s02 af_heart 1.0 "L2=I wasn't even tired!" "L4=Did you just yawn too?"
tools/tts/venv/bin/python tools/tts/say.py public/vo/s02 hf_beta 0.92 "L3=Who started this?"
```
The yawns themselves are a soft breath sound (`public/sfx/yawn.wav`, made by `tools/sfx/make-yawn.sh`), not voiced.

## Rig additions for this episode (`src/kit/Person.tsx`)
- `yawn` (0..1): eyes squeeze shut, brows lift, head tips back, mouth opens wide.
- `lookAt`: point the eyes somewhere other than the expression's default (characters look at each other).
- `glassesDrop` (0..1): glasses slide down the nose.
- `stretch` pose (both arms up) and `point` pose (finger at the camera, foreshortened).
