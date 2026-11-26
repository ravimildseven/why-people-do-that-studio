import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Shadow, SCREEN, POSES, Arm, Expression, INK} from '../kit/Person';
import {MIKA} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';
import {HookCard, Caption, FactCard, ClockChip} from '../kit/Overlays';
import {PhoneInsert} from '../kit/PhoneInsert';
import lines from '../../public/vo/s01v2/lines.json';

// Short S01 v2: "Exhausted… but still awake?" rebuilt to a fast-cut format
// (10 shots, a cut every ~2–5 s, a twist at the end, loops back to the start).
// Script and beat sheet: episodes/s01-bedtime/SCRIPT.md (v2).

type LineId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
const LINES = lines as Record<LineId, {seconds: number; frames: number; mouth: number[]}>;

// ---- shots (frames at 30 fps). kind: how the camera frames the set.
type Shot = {from: number; kind: 'wide' | 'medium' | 'close' | 'impact' | 'phone'};
const SHOTS: Shot[] = [
  {from: 0, kind: 'wide'}, //      S1 11:15 PM, "five more minutes"
  {from: 150, kind: 'phone'}, //   S2 thumb flicking the feed
  {from: 207, kind: 'medium'}, //  S3 12:40 AM, "one more video"
  {from: 288, kind: 'close'}, //   S4 1:55 AM, "the only part that's mine"
  {from: 440, kind: 'medium'}, //  S5 dozing off... bonk
  {from: 492, kind: 'impact'}, //  S6 "Ow."
  {from: 528, kind: 'medium'}, //  S7 fact card
  {from: 660, kind: 'wide'}, //    S8 phone down, lamp off, "take my break at lunch", sleeps
  {from: 840, kind: 'wide'}, //    S9 7:00 AM: morning light, alarm
  {from: 858, kind: 'close'}, //   S10 "Wait... it's morning?!"
];
const T = {
  L1: 12, jump1: 207, L2: 218, jump2: 288, L3: 296,
  doze: 446, nodStart: 470, bonk: 486, L4: 498,
  fact: 534, factEnd: 654,
  reach: 666, phoneDown: 678, lampOff: 688, armBack: 696, L5: 700, sleep: 812,
  morning: 840, wake: 856, L6: 860,
};
export const S01V2_DURATION = 898; // last frame is a 1-frame white flash, then the loop

const TEXT: Partial<Record<LineId, {text: string; hi: string}>> = {
  L1: {text: 'Okay. Five more minutes. Then sleep.', hi: 'Five'},
  L2: {text: "One more video. I've earned this.", hi: 'earned'},
  L3: {text: 'My whole day belonged to everyone else. This is the only part that’s mine.', hi: 'mine.'},
  L4: {text: 'Ow.', hi: 'Ow.'},
  L5: {text: 'Fine. Tomorrow I take my break at lunch. Not at 2 a.m.', hi: 'lunch.'},
  L6: {text: 'Wait… it’s morning?!', hi: 'morning?!'},
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const mixArm = (a: Arm, b: Arm, t: number, hand: Arm['hand']): Arm => ({upper: lerp(a.upper, b.upper, t), fore: lerp(a.fore, b.fore, t), hand});
const REACH: Arm = {upper: 78, fore: 92, hand: 'open'};
const MIKA_X = -20;

export const S01v2Bedtime: React.FC = () => {
  const frame = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const L = bedroomLayout(W, H);

  const shotIndex = SHOTS.reduce((acc, s, i) => (frame >= s.from ? i : acc), 0);
  const shot = SHOTS[shotIndex];
  const shotEnd = SHOTS[shotIndex + 1]?.from ?? S01V2_DURATION;
  const p = (frame - shot.from) / (shotEnd - shot.from); // 0..1 through the shot

  // ---- voice → mouth
  let talk = 0;
  (Object.keys(LINES) as LineId[]).forEach((id) => {
    const i = frame - T[id];
    const m = LINES[id].mouth;
    if (i >= 0 && i < m.length) talk = m[i];
  });

  // ---- clock
  const clock =
    frame < T.jump1 ? '11:15 PM' : frame < T.jump2 ? '12:40 AM' : frame < T.lampOff ? '1:55 AM' : frame < T.morning ? '1:58 AM' : '7:00 AM';
  const flipAt = (j: number) => interpolate(frame, [j, j + 4, j + 8], [1, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clockFlip = Math.min(flipAt(T.jump1 - 4), flipAt(T.jump2 - 4), flipAt(T.morning - 4));

  // ---- acting
  let expression: Expression = 'scrollZombie';
  if (frame >= T.jump1) expression = 'tired';
  if (frame >= T.jump2) expression = 'scrollZombie';
  if (frame >= T.L3) expression = 'tired';
  if (frame >= T.bonk) expression = 'shocked';
  if (frame >= T.fact) expression = 'guilty';
  if (frame >= T.reach) expression = 'neutral';
  if (frame >= T.L5 + LINES.L5.frames) expression = 'happy';
  if (frame >= T.morning) expression = 'shocked';

  // arms: phone at the chest -> reach to the nightstand -> rest
  const phoneArm = POSES.phone.L;
  let armL: Arm = phoneArm;
  if (frame >= T.reach) armL = mixArm(phoneArm, REACH, Easing.inOut(Easing.cubic)(clamp01((frame - T.reach) / (T.phoneDown - T.reach))), frame < T.phoneDown ? 'phone' : 'open');
  if (frame >= T.armBack) armL = mixArm(REACH, POSES.rest.L, Easing.inOut(Easing.cubic)(clamp01((frame - T.armBack) / 14)), 'open');
  const phoneInHand = frame < T.phoneDown;

  // dozing: eyes close, head drops onto the phone, snaps back up on the bonk
  const nod =
    frame < T.nodStart ? 0 : frame < T.bonk ? Easing.in(Easing.quad)(clamp01((frame - T.nodStart) / (T.bonk - T.nodStart))) : interpolate(frame, [T.bonk, T.bonk + 3, T.bonk + 8], [1, 0.4, 0], {extrapolateRight: 'clamp'});

  // eyes: blink every ~2.6 s; close while dozing and at the end of S8; snap open at 7:00 AM
  const cyc = frame % 78;
  let blink = cyc >= 74 ? [0.6, 1, 1, 0.5][cyc - 74] : 0;
  if (frame >= T.doze && frame < T.bonk) blink = interpolate(frame, [T.doze, T.nodStart], [0.3, 1], {extrapolateRight: 'clamp'});
  if (expression === 'happy' && frame < T.sleep) blink = 0;
  if (frame >= T.sleep && frame < T.morning) {
    blink = interpolate(frame, [T.sleep, T.sleep + 20], [0.2, 1], {extrapolateRight: 'clamp'});
    expression = 'neutral';
  }
  if (frame >= T.morning) blink = frame < T.wake ? 1 : 0;

  const lampOn = interpolate(frame, [T.lampOff, T.lampOff + 3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const morning = frame >= T.morning ? 1 : 0;

  // ---- camera: each shot frames a point of the set; slow push inside every shot
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
  const shake = shot.kind === 'impact' ? interpolate(frame - shot.from, [0, 8], [22, 0], {extrapolateRight: 'clamp'}) * Math.sin(frame * 2.7) : 0;
  const cam = `translate(${framing.anchor.x + shake} ${framing.anchor.y}) scale(${z}) translate(${-framing.pt.x} ${-framing.pt.y})`;

  const hookIn = spring({frame, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 10});
  const showFact = frame >= T.fact && frame < T.factEnd;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shot.kind === 'phone' ? (
        <PhoneInsert frame={frame - shot.from} W={W} H={H} look={MIKA} />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <radialGradient id="scr">
              <stop offset="0" stopColor={SCREEN} stopOpacity={0.35} />
              <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={cam}>
            <g transform={`translate(${W / 2} ${L.feetY}) scale(${L.u})`}>
              <BedroomBack L={L} id="s01v2" lampOn={lampOn} phoneOnStand={!phoneInHand} morning={morning} />
              <g transform={`translate(${MIKA_X} 0)`}>
                {phoneInHand && !morning && <circle cx={-40} cy={-300} r={260} fill="url(#scr)" />}
                <Shadow w={110} opacity={0.3} />
                <Person look={MIKA} idPrefix="m2" sit arms={{L: armL, R: POSES.phone.R}} expression={expression} talk={talk} blink={blink} nod={nod} />
                {shot.kind === 'impact' && (
                  <g stroke={INK} strokeWidth={7} strokeLinecap="round">
                    {[-150, -115, -70, 70, 115, 150].map((a) => {
                      const r = (a * Math.PI) / 180;
                      const cx = -40;
                      const cy = -350;
                      return <line key={a} x1={cx + Math.sin(r) * 120} y1={cy - Math.cos(r) * 120} x2={cx + Math.sin(r) * 170} y2={cy - Math.cos(r) * 170} />;
                    })}
                  </g>
                )}
              </g>
            </g>
            <BedroomFront L={L} id="s01v2" dark={1 - lampOn} morning={morning} />
          </g>
        </svg>
      )}

      {/* overlays: not affected by the camera */}
      <HookCard lines={['EXHAUSTED…', 'BUT STILL AWAKE?']} appear={hookIn} />
      <ClockChip text={clock} flip={clockFlip} top={392} />
      {(Object.keys(TEXT) as LineId[]).map((id) => (
        <Sequence key={id} from={T[id]} durationInFrames={LINES[id].frames + 8} layout="none">
          <Caption text={TEXT[id]!.text} highlight={TEXT[id]!.hi} />
        </Sequence>
      ))}
      {showFact && (
        <FactCard
          frame={frame - T.fact}
          title="BEDTIME PROCRASTINATION"
          body="Going to bed later than you planned, when nothing is stopping you."
          source="Kroese et al., 2014 · Frontiers in Psychology"
        />
      )}
      {frame === S01V2_DURATION - 1 && <AbsoluteFill style={{background: '#fffaf0'}} />}

      {/* sound */}
      <Audio src={staticFile('sfx/ticks.wav')} volume={(f) => (f >= T.morning ? 0 : f >= T.lampOff ? 0.5 : 0.9)} />
      {(Object.keys(LINES) as LineId[]).map((id) => (
        <Sequence key={'a' + id} from={T[id]} layout="none">
          <Audio src={staticFile(`vo/s01v2/${id}.wav`)} />
        </Sequence>
      ))}
      {[T.jump1 - 2, T.jump2 - 2].map((f) => (
        <Sequence key={'w' + f} from={f} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={'s' + i} from={150 + 2 + i * 14} layout="none"><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
      ))}
      <Sequence from={T.bonk} layout="none"><Audio src={staticFile('sfx/bonk.wav')} /></Sequence>
      <Sequence from={T.fact} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.phoneDown} layout="none"><Audio src={staticFile('sfx/clack.wav')} /></Sequence>
      <Sequence from={T.lampOff} layout="none"><Audio src={staticFile('sfx/click.wav')} /></Sequence>
      <Sequence from={T.morning} layout="none"><Audio src={staticFile('sfx/alarm.wav')} /></Sequence>
    </AbsoluteFill>
  );
};
