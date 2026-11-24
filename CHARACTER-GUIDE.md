# Why People Do That: character and set style guide (v1, Nov 24 2026)

The house style for the 2D cast and sets. Everything is built in code. There are no
generated images and no credits spent, and every render is identical.

## Files
| Path | What |
|---|---|
| `src/kit/Person.tsx` | the one rig every character uses: expressions, poses, sitting, silhouette |
| `src/cast.ts` | the cast. **A new character is a new `Look` in this file. Nothing else changes.** |
| `src/sets/Bedroom.tsx` | night bedroom set. It lays itself out for 9:16 or 16:9 (`bedroomLayout(W, H)`) |
| `src/renders/*.tsx` | sheet and scene renders (`node build.mjs src/renders/<x>.tsx out`, then `node shot.cjs`) |

## The cast
- **Mika** (lead): mustard hoodie, hair bun with a pencil through it, coral earrings.
- **Dev** (flatmate): teal shirt, curly hair, light stubble. Slightly taller and broader.
- **Aaji** (grandmother): plum cardigan, teal skirt with a gold border, grey bun, round glasses, bindi. Shorter, with softer eyelids.

## Rules every character follows (do not change per character)
1. **Ink** `#1c1f1c`, outline width 6 on every shape. Eyes, brows and mouth are the same set for everyone.
2. **Proportions:** big head (about 0.35 of total height), short body, mitten hands with a thumb (they can hold things).
3. **Eyes do the acting:** white ovals, moving pupils, eyelids that drop, thick brows. The 8 shared
   expressions are neutral, curious, tired, side-eye, guilty, shocked, happy and doom-scroll.
4. **One signature per character, readable as a black silhouette:** Mika's pencil bun, Dev's curls,
   Aaji's grey bun and glasses. Check every new character with `silhouette`.
5. **One main colour per character, never shared.** It must stand out against the navy night palette.
   Taken so far: mustard (Mika), teal (Dev), plum (Aaji). Still free: coral, sky blue, leaf green, rust.
6. **Brows must stay visible.** Hair must not cover them (this happened with Dev and was fixed).
7. **Feet stand on y=0 and always get a contact shadow.** Seated characters use `sit` (the seat height matches the bed).
8. **No text on characters.** No logos, no brands, no lettering on clothes.

## Adding a character
1. Add a `Look` to `cast.ts`: skin and shade, hair style and colour, top style and colours, bottom, shoes, accessories.
2. If a new hairstyle or top is needed, add one case to `hairFront`/`hairBack` or `torso`/`collar` in `Person.tsx`.
3. Render the cast sheet. Check the silhouette, brows, all 8 expressions and the true relative height against the others.
4. Put them in a set at both 9:16 and 16:9. Check that nothing touches or crosses their head (lamps, sills, plants).

## Set rules
- The night palette lives in `NIGHT` (Bedroom.tsx): navy wall with a faint pattern, warm wood, muted fabrics.
  Light sources: warm lamp glow, a cool moonbeam from the window, fairy lights, and the phone's blue light on the face.
- Every set has a foreground (rug, floor), a midground (bed, furniture) and a background (wall, window), plus a vignette.
- **No text anywhere in a set:** blank book spines, image-only frames, no signs. The clock chip is the only text.
- **Shorts (9:16):** faces stay in the upper-middle. The bottom ~430 px of 1920 is left as plain floor for
  YouTube's caption area, and the right ~150 px carries no faces.
- **Before calling a shot done:** render it and check for props crossing a head, things cut off at the edges,
  hands touching furniture, and floating feet.

## Known limits (v1)
- Front view only. There is no side or 3/4 view and no walk cycle yet.
- Only one set (bedroom) so far. Other sets (kitchen, office, street) should be built the same way.
