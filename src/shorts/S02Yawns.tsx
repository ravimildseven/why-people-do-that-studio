import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Shadow, POSES, Arm, Expression} from '../kit/Person';
import {MIKA, DEV, AAJI} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';
import {HookCard, Caption, FactCard, ClockChip} from '../kit/Overlays';
import lines from '../../public/vo/s02/lines.json';

// Short S02 — "One yawn. Whole house."  (episodes/s02-yawns/SCRIPT.md)
// Contagious yawning. Same night bedroom as S01, cast of three.
// All timing lives in T and is built from the voice line lengths (lines.json), so a re-voiced line re-times itself.

type LineId = 'L1' | 'L2' | 'L3' | 'L4';
const LINES = lines as Record<LineId, {seconds: number; frames: number; mouth: number[]}>;
const len = (id: LineId) => LINES[id].frames;

const YAWN = 52; // frames per yawn: open, hold, close

const T = (() => {
  const devYawn = 12;
  const L1 = devYawn + YAWN - 4;
  const fight = L1 + len('L1') + 6; // Mika tries not to
  const mikaYawn = fight + 30;
  const L2 = mikaYawn + YAWN - 6;
  const cut = L2 + len('L2') + 14; // 10:31, cut to the wide shot: Aaji is there
  const aajiYawn = cut + 12;
  const L3 = aajiYawn + YAWN - 2;
  const fact = L3 + len('L3') + 10;
  const factEnd = fact + 150;
  const jump2 = factEnd + 4; // 10:32, push in on Mika
  const point = jump2 + 8;
  const L4 = jump2 + 20;
  const devAgain = L4 + len('L4') + 6; // the button: it starts again
  const mikaAgain = devAgain + 22;
  const end = mikaAgain + YAWN + 16;
  return {devYawn, L1, fight, mikaYawn, L2, cut, aajiYawn, L3, fact, factEnd, jump2, point, L4, devAgain, mikaAgain, end};
})();
export const S02_DURATION = T.end;

const TEXT: Record<LineId, {text: string; hi: string}> = {
  L1: {text: 'Sorry. Long day.', hi: 'Long'},
  L2: {text: "I wasn't even tired!", hi: 'tired!'},
  L3: {text: 'Who started this?', hi: 'started'},
  L4: {text: 'Did you just yawn too?', hi: 'you'},
};

// stage positions (character units, 0 = centre of the set)
const X = {dev: -210, mika: 50, aaji: 300};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = Easing.inOut(Easing.cubic);
const mixArm = (a: Arm, b: Arm, t: number, hand: Arm['hand']): Arm => ({upper: lerp(a.upper, b.upper, t), fore: lerp(a.fore, b.fore, t), hand});

/** 0..1 yawn shape: opens slowly, holds wide, closes a little faster */
function yawnAt(frame: number, start: number) {
  const i = frame - start;
  if (i < 0 || i > YAWN) return 0;
  return interpolate(i, [0, YAWN * 0.38, YAWN * 0.7, YAWN], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.quad)});
}

function blinkAt(frame: number, offset: number) {
  const cyc = (frame + offset) % 84;
  return cyc >= 80 ? [0.6, 1, 1, 0.5][cyc - 80] : 0;
}

// camera: offset (px) of the floor point + zoom. Clamped so the set always fills the frame.
type Cam = {x: number; y: number; z: number};
const TWO: Cam = {x: 100, y: 0, z: 1.25}; // Dev + Mika
const WIDE: Cam = {x: -76, y: 0, z: 1.12}; // all three
const MIKA_CU: Cam = {x: -125, y: 70, z: 1.3}; // Mika close-up, a little left of centre so Aaji's face stays clear of the right edge

export const S02Yawns: React.FC = () => {
  const frame = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const L = bedroomLayout(W, H);

  // ---- who is talking
  const SPEAKER: Record<LineId, 'dev' | 'mika' | 'aaji'> = {L1: 'dev', L2: 'mika', L3: 'aaji', L4: 'mika'};
  const talk = {dev: 0, mika: 0, aaji: 0};
  (Object.keys(LINES) as LineId[]).forEach((id) => {
    const i = frame - T[id];
    const m = LINES[id].mouth;
    if (i >= 0 && i < m.length) talk[SPEAKER[id]] = m[i];
  });

  // ---- yawns
  const yDev = Math.max(yawnAt(frame, T.devYawn), yawnAt(frame, T.devAgain));
  const yMika = Math.max(yawnAt(frame, T.mikaYawn), yawnAt(frame, T.mikaAgain));
  const yAaji = yawnAt(frame, T.aajiYawn);

  // ---- clock
  const clock = frame < T.cut + 5 ? '10:30 PM' : frame < T.jump2 + 5 ? '10:31 PM' : '10:32 PM';
  const flip = (j: number) => interpolate(frame, [j, j + 5, j + 10], [1, 0, 1], clamp);
  const clockFlip = Math.min(flip(T.cut), flip(T.jump2));

  // ---- Dev: sits on the edge of the bed; stretches with the yawn
  let devExp: Expression = 'tired';
  let devLook: [number, number] | undefined;
  if (frame >= T.L1 + len('L1')) {
    devExp = 'neutral';
    devLook = [0.9, 0]; // watches Mika
  }
  if (frame >= T.cut) devLook = [0.9, -0.1];
  if (frame >= T.fact) {
    devExp = 'sideEye';
    devLook = [1, 0.1];
  }
  if (frame >= T.jump2) {
    devExp = 'tired';
    devLook = undefined;
  }
  const devStretch = Math.max(
    interpolate(frame - T.devYawn, [0, 16, YAWN - 12, YAWN], [0, 1, 1, 0], clamp),
    interpolate(frame - T.devAgain, [0, 16, YAWN - 12, YAWN], [0, 1, 1, 0], clamp),
  );
  // one-arm stretch, out to the side: Mika sits too close for both arms
  const DEV_STRETCH: Arm = {upper: 138, fore: 162, hand: 'fist'};
  const devArms = {
    L: mixArm(POSES.rest.L, DEV_STRETCH, ease(devStretch), devStretch > 0.5 ? 'fist' : 'open'),
    R: POSES.rest.R,
  };

  // ---- Mika: wide awake -> watches Dev -> fights it -> yawns anyway -> points at you -> yawns again
  let mikaExp: Expression = 'neutral';
  let mikaLook: [number, number] | undefined;
  if (frame >= T.devYawn + 6) {
    mikaExp = 'curious';
    mikaLook = [-0.9, -0.2]; // looks over at Dev
  }
  if (frame >= T.fight) {
    mikaExp = 'guilty'; // lips pressed, sweating: fighting it
    mikaLook = [0, 0.2];
  }
  if (frame >= T.mikaYawn) mikaLook = undefined;
  if (frame >= T.L2) mikaExp = 'shocked';
  if (frame >= T.cut) {
    mikaExp = 'neutral';
    mikaLook = [0.9, -0.2]; // looks at Aaji
  }
  if (frame >= T.fact) {
    mikaExp = 'sideEye';
    // glances left, then right
    mikaLook = frame < T.fact + 70 ? [-1, 0.1] : [1, 0.1];
  }
  if (frame >= T.jump2) {
    mikaExp = 'curious';
    mikaLook = [0, 0]; // straight at the viewer
  }
  if (frame >= T.L4 + len('L4')) mikaExp = 'happy';
  if (frame >= T.devAgain + 4) {
    mikaExp = 'sideEye';
    mikaLook = [-1, 0.1]; // ...oh no, not again
  }
  if (frame >= T.mikaAgain) mikaLook = undefined;
  const pointT = ease(interpolate(frame, [T.point, T.point + 10, T.devAgain, T.devAgain + 10], [0, 1, 1, 0], clamp));
  const mikaArms = {
    L: POSES.rest.L,
    R: mixArm(POSES.rest.R, POSES.point.R, pointT, pointT > 0.5 ? 'point' : 'open'),
  };

  // ---- Aaji: there from the cut; yawns, glasses slide down her nose and stay there
  const aajiOn = frame >= T.cut;
  let aajiExp: Expression = 'neutral';
  let aajiLook: [number, number] | undefined = [-0.7, 0.1];
  if (frame >= T.L3) aajiExp = 'curious';
  if (frame >= T.L3) aajiLook = [-0.8, -0.1];
  if (frame >= T.fact) {
    aajiExp = 'sideEye';
    aajiLook = [-1, 0.1];
  }
  if (frame >= T.jump2) {
    aajiExp = 'tired';
    aajiLook = undefined;
  }
  const glassesDrop = interpolate(frame, [T.aajiYawn + 10, T.aajiYawn + 24], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});

  // ---- camera: two-shot -> (cut) wide -> slow push in on Mika for the last line
  let cam: Cam = TWO;
  if (frame >= T.cut) {
    const drift = interpolate(frame, [T.cut, T.fact], [0, 0.04], clamp);
    cam = {...WIDE, z: WIDE.z + drift};
  }
  if (frame >= T.jump2) {
    const t = ease(interpolate(frame, [T.jump2, T.jump2 + 22], [0, 1], clamp));
    const from = {...WIDE, z: WIDE.z + 0.04};
    cam = {x: lerp(from.x, MIKA_CU.x, t), y: lerp(from.y, MIKA_CU.y, t), z: lerp(from.z, MIKA_CU.z, t)};
    cam.z += interpolate(frame, [T.L4 + len('L4'), T.end], [0, 0.06], clamp);
  }
  // punch at the cut and on the point
  const punch = (j: number, a = 0.05) => interpolate(frame, [j, j + 4, j + 14], [0, a, 0], clamp);
  cam = {...cam, z: cam.z + punch(T.cut) + punch(T.point + 6, 0.04)};
  // keep the set covering the frame
  const z = cam.z * L.u;
  const setHalf = L.hx + 10;
  const cx = Math.min(z * setHalf - W / 2, Math.max(W / 2 - z * setHalf, cam.x));
  const top = -(L.top - 10); // set top, as a positive distance above the floor line
  const cy = Math.min(z * top - L.feetY, Math.max(H - L.feetY - z * (L.bottom + 10), cam.y));

  // ---- overlays
  const hookIn = spring({frame, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 10});
  const showFact = frame >= T.fact && frame < T.factEnd;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(${W / 2 + cx} ${L.feetY + cy}) scale(${z})`}>
          <BedroomBack L={L} id="s02" />
          <g transform={`translate(${X.dev} 0)`}>
            <Shadow w={110} opacity={0.3} />
            <Person look={DEV} idPrefix="d" sit arms={devArms} expression={devExp} lookAt={devLook} talk={talk.dev} yawn={yDev} blink={blinkAt(frame, 30)} />
          </g>
          <g transform={`translate(${X.mika} 0)`}>
            <Shadow w={110} opacity={0.3} />
            <Person look={MIKA} idPrefix="m" sit arms={mikaArms} expression={mikaExp} lookAt={mikaLook} talk={talk.mika} yawn={yMika} blink={mikaExp === 'happy' ? 0 : blinkAt(frame, 0)} />
          </g>
          {aajiOn && (
            <g transform={`translate(${X.aaji} 0)`}>
              <Shadow w={130} opacity={0.3} />
              <Person look={AAJI} idPrefix="a" pose="rest" expression={aajiExp} lookAt={aajiLook} talk={talk.aaji} yawn={yAaji} glassesDrop={glassesDrop} blink={blinkAt(frame, 55)} />
            </g>
          )}
        </g>
        <BedroomFront L={L} id="s02" />
      </svg>

      {/* overlays: not affected by the camera */}
      <HookCard lines={['ONE YAWN.', 'WHOLE HOUSE.']} appear={hookIn} />
      <ClockChip text={clock} flip={clockFlip} top={392} />
      {(Object.keys(TEXT) as LineId[]).map((id) => (
        <Sequence key={id} from={T[id]} durationInFrames={len(id) + 8} layout="none">
          <Caption text={TEXT[id].text} highlight={TEXT[id].hi} />
        </Sequence>
      ))}
      {showFact && (
        <FactCard
          frame={frame - T.fact}
          title="CONTAGIOUS YAWNING"
          body="55% of people watching a 5-minute yawn video yawned within 5 minutes."
          source="Provine, 1986 · Ethology"
        />
      )}

      {/* sound */}
      <Audio src={staticFile('sfx/ticks.wav')} volume={0.6} />
      {(Object.keys(LINES) as LineId[]).map((id) => (
        <Sequence key={'a' + id} from={T[id]} layout="none">
          <Audio src={staticFile(`vo/s02/${id}.wav`)} />
        </Sequence>
      ))}
      {[T.devYawn, T.mikaYawn, T.aajiYawn, T.devAgain, T.mikaAgain].map((t, i) => (
        <Sequence key={'y' + i} from={t} layout="none">
          <Audio src={staticFile('sfx/yawn.wav')} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={T.cut} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      <Sequence from={T.jump2} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
      <Sequence from={T.fact} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};
