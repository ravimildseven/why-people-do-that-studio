# Why People Do That studio: instructions for AI coding sessions

YouTube channel **Why People Do That** (owner: Ravikiran). Short animated plays about everyday behaviour,
each with **one verified psychology fact**. Read `README.md`, `CHARACTER-GUIDE.md` and the episode's
`episodes/<id>/SCRIPT.md` before changing anything.

## Format
- **Shorts (main format):** 9:16, 1080×1920, 30 fps, about 20–40 s. A play that *shows* the behaviour.
  Characters speak short lines (TTS) and a caption bar shows each line with one word highlighted.
  A **big hook headline card stays at the top for the whole video**: the channel's best-performing Shorts all
  had one. One fact card per Short.
- **Long-form:** narrated, beats timed to the voice-over. Not built yet.
- **Shorts safe area:** nothing important below y = 1490 (the bottom ~430 px is YouTube's caption/title UI).
  Keep faces out of the right ~150 px.

## Facts
- Every fact on screen needs a verified, citable source (peer-reviewed where possible). Put the check in the
  episode's SCRIPT.md. If a popular explanation isn't well supported, make it a character's line, never a fact card.
- No invented background text: blank signs, blank book spines, image-only frames. The clock chip, captions,
  hook card and fact card are the only text, and all of it is composited in code.

## Cast and look
- Cast: **Mika** (lead, mustard hoodie, bun with a pencil), **Dev** (flatmate, teal shirt, curls),
  **Aaji** (grandmother, plum cardigan, grey bun, glasses). All share one rig: ink `#1c1f1c`, outline 6.
- New characters: add a `Look` in `src/cast.ts` and follow `CHARACTER-GUIDE.md` (one main colour each, brows
  always visible, readable as a silhouette).
- Sets are code-built in `src/sets/`, with layout derived from width/height so 9:16 and 16:9 both work.
  Low-saturation night palette with warm lamp and cool moon light.
- Original IP only: no real people, brands, logos or other shows' characters.

## Voice
- Free TTS: Kokoro via `tools/tts/` (`npm run tts:setup` once). Mika's voice is `af_heart` unless the owner
  picks another. Keep one fixed voice per character.
- vidIQ's voiceover tool also works but costs credits (28 per 1000 characters). Ask before spending them.

## Music
- Music is composed in code (`tools/music/make-music.py`) so there are no licences. `public/music/sleepy-bed.wav` is the first bed.
  Duck it under every line (see `musicVolume` in `S02Yawns.tsx`).

## How to work here
- **Look at what you make.** Render stills at key frames and inspect them before rendering video. Check for props
  touching heads, hands touching furniture, text in the safe area, and hidden brows.
- After rendering, check the file with `ffprobe` (size, fps, duration, audio) and normalise loudness to about -14 LUFS, and keep the audio at 48 kHz (`-ar 48000`): loudnorm resamples up, and phones may play a 96 kHz track as silence.
- `npx tsc --noEmit` must pass. `out/` is not committed.

## Status (keep current)
- **Done:** character rig + cast of 3, bedroom set, overlays, free TTS pipeline, Short S01 "Exhausted… but
  still awake?" (bedtime procrastination), Short S02 "One yawn. Whole house." (contagious yawning).
- **Open (owner):** pick Mika's voice; confirm Dev's and Aaji's voices (first used in S02); review S01 and S02.
- **Next topics:** S03 doorway effect (needs a kitchen set), S04 saying it out loud (needs a living room set).
- **Open (code):** more sets (kitchen, doorway/hallway, office); side view and walk cycle; long-form template.
