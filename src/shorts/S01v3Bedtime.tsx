import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Shadow, SCREEN, POSES, Arm, Expression, Pose, INK} from '../kit/Person';
import {MIKA} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';
import {HookCard, Caption, FactCard, ClockChip, Sticker} from '../kit/Overlays';
import {PhoneInsert} from '../kit/PhoneInsert';
import lines from '../../public/vo/s01v3/lines.json';

// Short S01 v3: "Why you can't stop scrolling at night"
// Hook (the 1:55 AM bonk) → problem (3 hours earlier) → why (fact card) → fix (if–then plan card)
// → next night it works → 7:00 AM payoff, loops. Beat sheet: episodes/s01-bedtime/SCRIPT.md (v3).

type LineId = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7';
const LINES = lines as Record<LineId, {seconds: number; frames: number; mouth: number[]}>;

type Kind = 'wide' | 'medium' | 'close' | 'impact' | 'phone';
const SHOTS: {from: number; kind: Kind}[] = [
  {from: 0, kind: 'close'}, //     S1  HOOK 1:55 AM: dozing over the phone… bonk
  {from: 36, kind: 'impact'}, //   S2  "Ow."
  {from: 66, kind: 'wide'}, //     S3  PROBLEM: 3 hours earlier, 11:15 PM "five more minutes"
  {from: 190, kind: 'phone'}, //   S4  the feed scrolls
  {from: 242, kind: 'medium'}, //  S5  12:40 AM "one more video"
  {from: 322, kind: 'close'}, //   S6  1:55 AM "the only part that's mine"
  {from: 470, kind: 'medium'}, //  S7  WHY: fact card
  {from: 610, kind: 'medium'}, //  S8  FIX: if–then plan card
  {from: 770, kind: 'wide'}, //    S9  next night: phone charges across the room, buzzes… "Nope." lamp off
  {from: 880, kind: 'wide'}, //    S10 7:00 AM, morning light, alarm
  {from: 900, kind: 'close'}, //   S11 "Wait… I actually slept!"
];
const T = {
  bonk: 10, A1: 40,
  rewind: 66, A2: 100,
  jump1: 242, A3: 250,
  jump2: 322, A4: 330,
  fact: 474, factEnd: 604,
  fix: 614, A5: 626, fixEnd: 764,
  nextNight: 770, buzz: 800, A6: 836, lampOff: 862, sleep: 866,
  morning: 880, wake: 902, A7: 906,
};
export const S01V3_DURATION = 960;

const CAPTIONS: Partial<Record<LineId, {text: string; hi: string}>> = {
  A1: {text: 'Ow.', hi: 'Ow.'},
  A2: {text: 'Okay. Five more minutes. Then sleep.', hi: 'Five'},
  A3: {text: "One more video. I've earned this.", hi: 'earned'},
  A4: {text: 'My whole day belonged to everyone else. This is the only part that’s mine.', hi: 'mine.'},
  // A5 is read over the fix card, which carries the words
  A6: {text: 'Nope.', hi: 'Nope.'},
  A7: {text: 'Wait… I actually slept!', hi: 'slept!'},
};

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const MIKA_X = -20;

export const S01v3Bedtime: React.FC = () => {
  const frame = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const L = bedroomLayout(W, H);

  const si = SHOTS.reduce((acc, s, i) => (frame >= s.from ? i : acc), 0);
  const shot = SHOTS[si];
  const shotEnd = SHOTS[si + 1]?.from ?? S01V3_DURATION;
  const p = (frame - shot.from) / (shotEnd - shot.from);

  let talk = 0;
  (Object.keys(LINES) as LineId[]).forEach((id) => {
    const i = frame - T[id];
    const m = LINES[id].mouth;
    if (i >= 0 && i < m.length) talk = m[i];
  });

  // ---- clock + time state
  const clock =
    frame < T.rewind ? '1:55 AM' : frame < T.jump1 ? '11:15 PM' : frame < T.jump2 ? '12:40 AM' : frame < T.nextNight ? '1:55 AM' : frame < T.morning ? '11:00 PM' : '7:00 AM';
  const flipAt = (j: number) => interpolate(frame, [j - 4, j, j + 4], [1, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clockFlip = Math.min(...[T.rewind, T.jump1, T.jump2, T.nextNight, T.morning].map(flipAt));
  const nextNight = frame >= T.nextNight;
  const morning = frame >= T.morning ? 1 : 0;
  const lampOn = nextNight ? interpolate(frame, [T.lampOff, T.lampOff + 3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;

  // ---- acting
  let expression: Expression = 'scrollZombie';
  let pose: Pose = 'phone';
  let armR: Arm = POSES.phone.R;
  let blink = 0;
  let nod = 0;
  if (frame < T.rewind) {
    // hook: already dozing over the phone, head drops… bonk, snap awake
    nod = frame < T.bonk ? interpolate(frame, [0, T.bonk], [0.45, 1], {easing: Easing.in(Easing.quad)}) : interpolate(frame, [T.bonk, T.bonk + 3, T.bonk + 8], [1, 0.4, 0], {extrapolateRight: 'clamp'});
    blink = frame < T.bonk ? 1 : 0;
    expression = frame < T.bonk ? 'tired' : 'shocked';
  } else if (frame < T.jump1) {
    expression = 'scrollZombie';
  } else if (frame < T.jump2) {
    expression = 'tired';
  } else if (frame < T.fact) {
    expression = 'tired';
  } else if (frame < T.fix) {
    expression = 'guilty';
  } else if (frame < T.nextNight) {
    expression = 'curious';
    armR = POSES.think.R;
  } else if (frame < T.morning) {
    pose = 'rest';
    expression = frame >= T.buzz && frame < T.A6 + 20 ? 'sideEye' : 'happy';
    if (frame >= T.sleep) blink = interpolate(frame, [T.sleep, T.sleep + 12], [0.2, 1], {extrapolateRight: 'clamp'});
  } else {
    pose = frame >= T.wake + 8 ? 'wave' : 'rest';
    expression = frame >= T.wake ? 'happy' : 'neutral';
    blink = frame < T.wake ? 1 : 0;
  }
  // regular blinks when eyes are open
  const cyc = frame % 78;
  if (blink === 0 && expression !== 'happy' && cyc >= 74) blink = [0.6, 1, 1, 0.5][cyc - 74];
  const arms = pose === 'phone' ? {L: POSES.phone.L, R: armR} : undefined;
  const phoneInHand = pose === 'phone';
  const buzz = frame >= T.buzz && frame < T.buzz + 28 ? 1 : 0;

  // ---- camera
  const toScreen = (x: number, y: number) => ({x: W / 2 + x * L.u, y: L.feetY + y * L.u});
  const face = toScreen(MIKA_X, -428);
  const chest = toScreen(MIKA_X, -330);
  const framing = {
    wide: {pt: face, z: 1, anchor: face},
    medium: {pt: chest, z: 1.45, anchor: {x: W / 2, y: H * 0.5}},
    close: {pt: face, z: 2.15, anchor: {x: W / 2, y: H * 0.47}},
    impact: {pt: toScreen(MIKA_X - 30, -360), z: 2.9, anchor: {x: W / 2, y: H * 0.5}},
    phone: {pt: face, z: 1, anchor: face},
  }[shot.kind];
  const z = framing.z * (1 + 0.035 * p);
  const shaking = (shot.kind === 'impact' || (si === 0 && frame >= T.bonk)) ? interpolate(frame - Math.max(shot.from, T.bonk), [0, 8], [22, 0], {extrapolateRight: 'clamp'}) * Math.sin(frame * 2.7) : 0;
  const cam = `translate(${framing.anchor.x + shaking} ${framing.anchor.y}) scale(${z}) translate(${-framing.pt.x} ${-framing.pt.y})`;
  const showImpactLines = shot.kind === 'impact' || (si === 0 && frame >= T.bonk);

  const hookIn = 1; // the headline is fully on screen from frame 0: it is the first thing people see in the feed

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shot.kind === 'phone' ? (
        <PhoneInsert frame={frame - shot.from} W={W} H={H} look={MIKA} />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <radialGradient id="scr3">
              <stop offset="0" stopColor={SCREEN} stopOpacity={0.35} />
              <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={cam}>
            <g transform={`translate(${W / 2} ${L.feetY}) scale(${L.u})`}>
              <BedroomBack L={L} id="s01v3" lampOn={lampOn} phoneOnShelf={nextNight} phoneBuzz={buzz} morning={morning} />
              <g transform={`translate(${MIKA_X} 0)`}>
                {phoneInHand && <circle cx={-40} cy={-300} r={260} fill="url(#scr3)" />}
                <Shadow w={110} opacity={0.3} />
                <Person look={MIKA} idPrefix="m3" sit pose={pose} arms={arms} expression={expression} talk={talk} blink={blink} nod={nod} />
                {showImpactLines && (
                  <g stroke={INK} strokeWidth={7} strokeLinecap="round">
                    {[-150, -115, -70, 70, 115, 150].map((a) => {
                      const r = (a * Math.PI) / 180;
                      return <line key={a} x1={-40 + Math.sin(r) * 120} y1={-350 - Math.cos(r) * 120} x2={-40 + Math.sin(r) * 170} y2={-350 - Math.cos(r) * 170} />;
                    })}
                  </g>
                )}
              </g>
            </g>
            <BedroomFront L={L} id="s01v3" dark={1 - lampOn} morning={morning} />
          </g>
        </svg>
      )}

      {/* overlays */}
      <HookCard lines={['WHY YOU CAN’T STOP', 'SCROLLING AT NIGHT']} appear={hookIn} />
      <ClockChip text={clock} flip={clockFlip} top={392} />
      <Sequence from={T.rewind} durationInFrames={60} layout="none"><StickerAt text="3 HOURS EARLIER" /></Sequence>
      <Sequence from={T.nextNight} durationInFrames={60} layout="none"><StickerAt text="NEXT NIGHT" /></Sequence>
      {(Object.keys(CAPTIONS) as LineId[]).map((id) => (
        <Sequence key={id} from={T[id]} durationInFrames={LINES[id].frames + 8} layout="none">
          <Caption text={CAPTIONS[id]!.text} highlight={CAPTIONS[id]!.hi} />
        </Sequence>
      ))}
      {frame >= T.fact && frame < T.factEnd && (
        <FactCard frame={frame - T.fact} title="WHY: BEDTIME PROCRASTINATION" body="Going to bed later than you planned, when nothing is stopping you." source="Kroese et al., 2014 · Frontiers in Psychology" />
      )}
      {frame >= T.fix && frame < T.fixEnd && (
        <FactCard
          frame={frame - T.fix}
          accent="#7fc8bd"
          title="FIX: AN IF–THEN PLAN"
          body="“If it’s 11 PM, then my phone charges across the room.” Plans like this help people stick to goals."
          source="Gollwitzer & Sheeran, 2006 · review of 94 studies"
        />
      )}
      {frame === S01V3_DURATION - 1 && <AbsoluteFill style={{background: '#fffaf0'}} />}

      {/* sound */}
      <Audio src={staticFile('sfx/ticks.wav')} volume={(f) => (f >= T.morning ? 0 : f >= T.lampOff ? 0.5 : 0.9)} />
      {(Object.keys(LINES) as LineId[]).map((id) => (
        <Sequence key={'a' + id} from={T[id]} layout="none"><Audio src={staticFile(`vo/s01v3/${id}.wav`)} /></Sequence>
      ))}
      <Sequence from={T.bonk} layout="none"><Audio src={staticFile('sfx/bonk.wav')} /></Sequence>
      {[T.rewind - 4, T.jump1 - 2, T.jump2 - 2, T.nextNight - 4].map((f) => (
        <Sequence key={'w' + f} from={f} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={'s' + i} from={190 + 2 + i * 14} layout="none"><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
      ))}
      <Sequence from={T.fact} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.fix} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.buzz} layout="none"><Audio src={staticFile('sfx/buzz.wav')} /></Sequence>
      <Sequence from={T.lampOff} layout="none"><Audio src={staticFile('sfx/click.wav')} /></Sequence>
      <Sequence from={T.morning} layout="none"><Audio src={staticFile('sfx/alarm.wav')} /></Sequence>
    </AbsoluteFill>
  );
};

const StickerAt: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  return <Sticker frame={f} text={text} />;
};
