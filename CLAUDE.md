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

## How to work here
- **Look at what you make.** Render stills at key frames and inspect them before rendering video. Check for props
  touching heads, hands touching furniture, text in the safe area, and hidden brows.
- After rendering, check the file with `ffprobe` (size, fps, duration, audio) and normalise loudness to about -14 LUFS.
- `npx tsc --noEmit` must pass. `out/` is not committed.

## Status (keep current)
- **Done:** character rig + cast of 3, bedroom set, overlays, free TTS pipeline, Short S01 "Exhausted… but
  still awake?" (bedtime procrastination) in v1 (single shot), v2 (`S01v2-Bedtime`, fast-cut) v3 (`S01v3-Bedtime`, puppet play) and **v4 (`S01v4-Kinetic`, current format)**.
- **S02 "Why you forget names in 3 seconds"** (`S02-Names`, 36 s): next-in-line effect (Brenner 1973) → fix: say the
  name out loud (production effect, MacLeod et al. 2010). Shared kinetic blocks live in `src/kinetic/Kit.tsx`.
- **Open (owner):** review S02; choose the next topics.
- **Format (owner-approved, Nov 26): POV + kinetic type with Mika as the face.** Big animated words (Inter Display,
  `src/kinetic/Design.tsx`) carry the story; graphics show the numbers; Mika appears only as close-ups and reaction
  badges (head only). One female narrator (Kokoro `af_heart`), music bed from `tools/music/bed.py`. The puppet-play
  format (v1–v3) was rejected: stiff, slideshow-like.
- **Story rule (owner, Nov 26):** every Short states a problem, explains why (fact card), and gives a fix the viewer can
  use (fix card, also sourced). The hook is the most striking moment, shown first, with the headline on screen from frame 0.
- **Pacing rule (from dissect, Nov 26):** cut every ~2–5 s, calm 5 s opening, at least one cutaway insert, a twist
  in the last seconds, loop back to the opening. Keep the channel's content: everyday behaviour + one verified fact.
- **Open (code):** music bed; more sets (kitchen, doorway/hallway, office); side view and walk cycle; long-form template.
