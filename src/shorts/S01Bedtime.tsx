import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Shadow, SCREEN, POSES, Arm, Expression, INK} from '../kit/Person';
import {MIKA} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';
import {HookCard, Caption, FactCard, ClockChip} from '../kit/Overlays';
import lines from '../../public/vo/s01/lines.json';

// Short S01 — "Exhausted… but still awake?"  (episodes/s01-bedtime/SCRIPT.md)
// All timing lives in T; line lengths come from the TTS files (lines.json).

type LineId = 'L1' | 'L2' | 'L3' | 'L4';
const LINES = lines as Record<LineId, {seconds: number; frames: number; mouth: number[]}>;

const T = {
  L1: 12,
  jump1: 88,
  L2: 104,
  jump2: 172,
  L3: 190,
  fact: 336,
  factEnd: 476,
  reach: 482,
  phoneDown: 494,
  lampOff: 504,
  armBack: 512,
  L4: 528,
  sleep: 642,
  end: 705,
};
export const S01_DURATION = T.end;

const TEXT: Record<LineId, {text: string; hi: string}> = {
  L1: {text: 'Okay. Five more minutes. Then sleep.', hi: 'Five'},
  L2: {text: "One more video. I've earned this.", hi: 'earned'},
  L3: {text: 'My whole day belonged to everyone else. This is the only part that’s mine.', hi: 'mine.'},
  L4: {text: 'Fine. Tomorrow I take my break at lunch. Not at 2 a.m.', hi: 'lunch.'},
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixArm = (a: Arm, b: Arm, t: number, hand: Arm['hand']): Arm => ({upper: lerp(a.upper, b.upper, t), fore: lerp(a.fore, b.fore, t), hand});
const REACH: Arm = {upper: 78, fore: 92, hand: 'open'};

export const S01Bedtime: React.FC = () => {
  const frame = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const L = bedroomLayout(W, H);

  // ---- who is talking
  let talk = 0;
  (Object.keys(LINES) as LineId[]).forEach((id) => {
    const i = frame - T[id];
    const m = LINES[id].mouth;
    if (i >= 0 && i < m.length) talk = m[i];
  });

  // ---- clock
  const clock = frame < T.jump1 + 5 ? '11:15 PM' : frame < T.jump2 + 5 ? '12:40 AM' : frame < T.lampOff ? '1:55 AM' : '1:56 AM';
  const flip = (j: number) => interpolate(frame, [j, j + 5, j + 10], [1, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clockFlip = Math.min(flip(T.jump1), flip(T.jump2));

  // ---- expression
  let expression: Expression = 'scrollZombie';
  if (frame >= T.jump1 + 5) expression = 'tired';
  if (frame >= T.jump2 + 5) expression = 'scrollZombie';
  if (frame >= T.L3) expression = 'tired';
  if (frame >= T.fact) expression = 'guilty';
  if (frame >= T.reach) expression = 'neutral';
  if (frame >= T.L4) expression = 'neutral';
  if (frame >= T.L4 + LINES.L4.frames) expression = 'happy';

  // ---- arms: holding phone -> reach to nightstand -> rest
  const phoneArm = POSES.phone.L;
  const restArm = POSES.rest.L;
  let armL: Arm = phoneArm;
  if (frame >= T.reach) armL = mixArm(phoneArm, REACH, Easing.inOut(Easing.cubic)(Math.min(1, (frame - T.reach) / (T.phoneDown - T.reach))), frame < T.phoneDown ? 'phone' : 'open');
  if (frame >= T.armBack) armL = mixArm(REACH, restArm, Easing.inOut(Easing.cubic)(Math.min(1, (frame - T.armBack) / 14)), 'open');
  const arms = {L: armL, R: POSES.phone.R};
  const phoneInHand = frame < T.phoneDown;

  // ---- lamp + light
  const lampOn = interpolate(frame, [T.lampOff, T.lampOff + 3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const screenGlow = phoneInHand ? 1 : 0;

  // ---- eyes: blink every ~2.6 s, then drift off to sleep
  const cyc = frame % 78;
  let blink = cyc >= 74 ? [0.6, 1, 1, 0.5][cyc - 74] : 0;
  if (frame >= T.sleep) blink = interpolate(frame, [T.sleep, T.sleep + 30], [0.2, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  if (expression === 'happy' && frame < T.sleep) blink = 0;
  if (frame >= T.sleep) expression = 'neutral';

  // ---- camera: slow push-in on Mika's face, with a small punch at each time jump
  const face = {x: -20, y: -430};
  const push = interpolate(frame, [0, T.end], [1, 1.12]);
  const punch = (j: number) => interpolate(frame, [j, j + 4, j + 14], [0, 0.05, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = push + punch(T.jump1) + punch(T.jump2);
  const fx = W / 2 + face.x * L.u;
  const fy = L.feetY + face.y * L.u;

  // ---- overlays
  const hookIn = spring({frame, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 10});
  const showFact = frame >= T.fact && frame < T.factEnd;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <radialGradient id="scr">
            <stop offset="0" stopColor={SCREEN} stopOpacity={0.35} />
            <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${fx} ${fy}) scale(${zoom}) translate(${-fx} ${-fy})`}>
          <g transform={`translate(${W / 2} ${L.feetY}) scale(${L.u})`}>
            <BedroomBack L={L} id="s01" lampOn={lampOn} phoneOnStand={!phoneInHand} />
            <g transform="translate(-20 0)">
              {screenGlow > 0 && <circle cx={-40} cy={-300} r={260} fill="url(#scr)" />}
              <Shadow w={110} opacity={0.3} />
              <Person look={MIKA} idPrefix="m" sit arms={arms} expression={phoneInHand || frame < T.reach ? expression : expression} talk={talk} blink={blink} />
            </g>
          </g>
          <BedroomFront L={L} id="s01" dark={1 - lampOn} />
        </g>
      </svg>

      {/* overlays: not affected by the camera */}
      <HookCard lines={['EXHAUSTED…', 'BUT STILL AWAKE?']} appear={hookIn} />
      <ClockChip text={clock} flip={clockFlip} top={392} />
      {(Object.keys(TEXT) as LineId[]).map((id) => (
        <Sequence key={id} from={T[id]} durationInFrames={LINES[id].frames + 8} layout="none">
          <Caption text={TEXT[id].text} highlight={TEXT[id].hi} />
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

      {/* sound */}
      <Audio src={staticFile('sfx/ticks.wav')} volume={(f) => (f >= T.lampOff ? 0.5 : 0.9)} />
      {(Object.keys(LINES) as LineId[]).map((id) => (
        <Sequence key={'a' + id} from={T[id]} layout="none">
          <Audio src={staticFile(`vo/s01/${id}.wav`)} />
        </Sequence>
      ))}
      <Sequence from={T.jump1} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      <Sequence from={T.jump2} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      <Sequence from={T.fact} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.phoneDown} layout="none"><Audio src={staticFile('sfx/clack.wav')} /></Sequence>
      <Sequence from={T.lampOff} layout="none"><Audio src={staticFile('sfx/click.wav')} /></Sequence>
    </AbsoluteFill>
  );
};
