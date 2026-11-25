import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Shadow, POSES, Arm, Expression} from '../kit/Person';
import {MIKA, DEV, AAJI} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';
import {HookCard, Caption, FactCard, ClockChip} from '../kit/Overlays';
import lines from '../../public/vo/s02/lines.json';

// Short S02 — "One yawn. Whole house."  (episodes/s02-yawns/SCRIPT.md)
// Contagious yawning. Same night bedroom as S01, cast of three, cut close: each yawn gets its own close-up.
// All timing lives in T and is built from the voice line lengths (lines.json), so a re-voiced line re-times itself.

type LineId = 'L1' | 'L2' | 'L3' | 'L4';
const LINES = lines as Record<LineId, {seconds: number; frames: number; mouth: number[]}>;
const len = (id: LineId) => LINES[id].frames;

const YAWN = 52; // frames per yawn: open, hold, close

// The cut: close-ups, face to face. Each yawn is caught in its own shot.
const T = (() => {
  const devYawn = 2; // hook: the first thing on screen is Dev's yawn, big
  const L1 = devYawn + YAWN - 4;
  const cut1 = L1 + len('L1') + 4; // cut to Mika, watching
  const fight = cut1 + 14; // she tries not to
  const mikaYawn = fight + 26;
  const L2 = mikaYawn + YAWN - 6;
  const cut2 = L2 + len('L2') + 10; // 10:31, cut to Aaji
  const aajiYawn = cut2 + 6;
  const L3 = aajiYawn + YAWN - 2;
  const fact = L3 + len('L3') + 8; // side-eye ping-pong under the fact card
  const eyeDev = fact + 54;
  const eyeMika = eyeDev + 32;
  const eyeAaji = eyeMika + 32;
  const factEnd = fact + 150;
  const jump2 = factEnd + 4; // 10:32, Mika straight down the lens
  const point = jump2 + 6;
  const L4 = jump2 + 16;
  const hold = L4 + len('L4') + 6; // she holds it...
  const mikaAgain = hold + 22; // ...and cracks
  const end = mikaAgain + YAWN + 14;
  return {devYawn, L1, cut1, fight, mikaYawn, L2, cut2, aajiYawn, L3, fact, eyeDev, eyeMika, eyeAaji, factEnd, jump2, point, L4, hold, mikaAgain, end};
})();
export const S02_DURATION = T.end;

const TEXT: Record<LineId, {text: string; hi: string}> = {
  L1: {text: 'Sorry. Long day.', hi: 'Long'},
  L2: {text: "I wasn't even tired!", hi: 'tired!'},
  L3: {text: 'Who started this?', hi: 'started'},
  L4: {text: "Okay. Don't yawn. I dare you.", hi: 'dare'},
};

// stage positions (character units, 0 = centre of the set) and face centres (seated heads sit 40 lower)
const X = {dev: -210, mika: 50, aaji: 300};
const FACE = {dev: [X.dev, -426], mika: [X.mika, -426], aaji: [X.aaji, -442]} as const;

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

// camera: a world point (wx, wy) placed at screen point (sx, sy) at zoom z
type Cam = {wx: number; wy: number; z: number; sy?: number};
const on = (who: keyof typeof FACE, z: number, dx = 0, dy = 0, sy = 800): Cam => ({wx: FACE[who][0] + dx, wy: FACE[who][1] + dy, z, sy});
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({wx: lerp(a.wx, b.wx, t), wy: lerp(a.wy, b.wy, t), z: lerp(a.z, b.z, t), sy: lerp(a.sy ?? 800, b.sy ?? 800, t)});
/** a shot: from cam a at frame f0, easing to cam b by frame f1 */
const move = (frame: number, f0: number, f1: number, a: Cam, b: Cam) => mixCam(a, b, ease(interpolate(frame, [f0, f1], [0, 1], clamp)));

function cameraAt(frame: number): Cam {
  // 1. Dev: extreme close-up on the yawn, easing out to a close-up for his line
  if (frame < T.cut1) return move(frame, T.devYawn + YAWN * 0.6, T.L1 + 10, on('dev', 2.7, 0, 30), on('dev', 2.1, 0, -10));
  // 2. Mika: close-up while she watches, slow push in while she fights it, tight on the yawn
  if (frame < T.cut2) {
    if (frame < T.mikaYawn + YAWN) return move(frame, T.fight, T.mikaYawn + 20, on('mika', 1.9, -40, -10), on('mika', 2.8, 0, 30));
    return move(frame, T.mikaYawn + YAWN, T.mikaYawn + YAWN + 8, on('mika', 2.8, 0, 30), on('mika', 2.1, 0, -10));
  }
  // 3. Aaji: close-up, then a push in on her glasses as they slide
  if (frame < T.fact) {
    if (frame < T.L3) return move(frame, T.aajiYawn + 8, T.aajiYawn + 30, on('aaji', 2.0, 0, -10), on('aaji', 3.1, 0, 4, 760));
    return move(frame, T.L3, T.L3 + 12, on('aaji', 3.1, 0, 4, 760), on('aaji', 2.5, 0, 0));
  }
  // 4. fact card: all three, heads big, then quick side-eye cuts
  if (frame < T.eyeDev) return {wx: 45, wy: -430, z: 1.55, sy: 760};
  if (frame < T.eyeMika) return on('dev', 2.3, 0, 0, 760);
  if (frame < T.eyeAaji) return on('mika', 2.3, 0, 0, 760);
  if (frame < T.jump2) return on('aaji', 2.3, 0, 0, 760);
  // 5. Mika, straight down the lens, creeping in, then tight on the final yawn
  if (frame < T.mikaAgain) return move(frame, T.jump2, T.hold + 20, on('mika', 2.2, 0, 20, 780), on('mika', 2.6, 0, 20, 790));
  return move(frame, T.mikaAgain, T.mikaAgain + 22, on('mika', 2.6, 0, 20, 790), on('mika', 3.0, 0, 40, 800));
}

/** music level per frame: full between lines, ducked under every line, drops away when Mika gives in */
function musicVolume(f: number) {
  const BASE = 0.26;
  const DUCK = 0.09 / BASE;
  let k = 1;
  (Object.keys(LINES) as LineId[]).forEach((id) => {
    const d = interpolate(f, [T[id] - 6, T[id], T[id] + len(id), T[id] + len(id) + 8], [1, DUCK, DUCK, 1], clamp);
    k = Math.min(k, d);
  });
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  const giveUp = interpolate(f, [T.mikaAgain, T.mikaAgain + 10], [1, 0.3], clamp);
  const fadeOut = interpolate(f, [T.end - 15, T.end], [1, 0], clamp);
  return BASE * k * fadeIn * giveUp * fadeOut;
}

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
  const yDev = yawnAt(frame, T.devYawn);
  const yMika = Math.max(yawnAt(frame, T.mikaYawn), yawnAt(frame, T.mikaAgain));
  const yAaji = yawnAt(frame, T.aajiYawn);

  // ---- clock
  const clock = frame < T.cut2 + 5 ? '10:30 PM' : frame < T.jump2 + 5 ? '10:31 PM' : '10:32 PM';
  const flip = (j: number) => interpolate(frame, [j, j + 5, j + 10], [1, 0, 1], clamp);
  const clockFlip = Math.min(flip(T.cut2), flip(T.jump2));

  // ---- Dev: sits on the edge of the bed; stretches with the yawn
  let devExp: Expression = 'tired';
  let devLook: [number, number] | undefined;
  if (frame >= T.L1 + len('L1')) {
    devExp = 'neutral';
    devLook = [0.9, 0]; // watches Mika
  }
  if (frame >= T.cut2) devLook = [0.9, -0.1];
  if (frame >= T.fact) {
    devExp = 'sideEye';
    devLook = frame < T.eyeDev ? [1, 0.1] : [1, 0.05];
  }
  if (frame >= T.jump2) {
    devExp = 'tired';
    devLook = undefined;
  }
  const devStretch = interpolate(frame - T.devYawn, [0, 16, YAWN - 12, YAWN], [0, 1, 1, 0], clamp);
  // one-arm stretch, out to the side: Mika sits too close for both arms
  const DEV_STRETCH: Arm = {upper: 138, fore: 162, hand: 'fist'};
  const devArms = {
    L: mixArm(POSES.rest.L, DEV_STRETCH, ease(devStretch), devStretch > 0.5 ? 'fist' : 'open'),
    R: POSES.rest.R,
  };

  // ---- Mika: watches Dev -> fights it -> yawns anyway -> dares you -> fights it -> yawns again
  let mikaExp: Expression = 'neutral';
  let mikaLook: [number, number] | undefined;
  if (frame >= T.cut1) {
    mikaExp = 'curious';
    mikaLook = [-0.9, -0.2]; // looks over at Dev
  }
  if (frame >= T.fight) {
    mikaExp = 'guilty'; // lips pressed, sweating: fighting it
    mikaLook = [0, 0.2];
  }
  if (frame >= T.mikaYawn) mikaLook = undefined;
  if (frame >= T.L2) mikaExp = 'shocked';
  if (frame >= T.cut2) {
    mikaExp = 'neutral';
    mikaLook = [0.9, -0.2]; // looks at Aaji
  }
  if (frame >= T.fact) {
    mikaExp = 'sideEye';
    // in her own cut she glances left, then right
    mikaLook = frame < T.eyeMika + 16 ? [-1, 0.1] : [1, 0.1];
  }
  if (frame >= T.jump2) {
    mikaExp = 'curious';
    mikaLook = [0, 0]; // straight down the lens
  }
  if (frame >= T.hold) mikaExp = 'guilty'; // ...she feels it coming
  if (frame >= T.mikaAgain) mikaLook = undefined;
  const pointT = ease(interpolate(frame, [T.point, T.point + 10, T.hold, T.hold + 10], [0, 1, 1, 0], clamp));
  const mikaArms = {
    L: POSES.rest.L,
    R: mixArm(POSES.rest.R, POSES.point.R, pointT, pointT > 0.5 ? 'point' : 'open'),
  };

  // ---- Aaji: there from her cut; yawns, glasses slide down her nose and stay there
  const aajiOn = frame >= T.cut2;
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
  const glassesDrop = interpolate(frame, [T.aajiYawn + 12, T.aajiYawn + 26], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});

  // ---- camera: a world point placed at a screen point, plus a small punch on each cut
  const c = cameraAt(frame);
  const punch = (j: number, a = 0.06) => interpolate(frame, [j, j + 3, j + 10], [0, a, 0], clamp);
  const cuts = [T.cut1, T.cut2, T.fact, T.eyeDev, T.eyeMika, T.eyeAaji, T.jump2];
  const z = (c.z + cuts.reduce((acc, j) => acc + punch(j), 0) + punch(T.point + 6, 0.05)) * L.u;
  // keep the set covering the frame
  const setHalf = L.hx + 10;
  const top = -(L.top - 10); // set top, as a positive distance above the floor line
  const rawX = W / 2 - c.wx * z - W / 2; // offset of the floor point from screen centre
  const rawY = (c.sy ?? 800) - c.wy * z - L.feetY;
  const cx = Math.min(z * setHalf - W / 2, Math.max(W / 2 - z * setHalf, rawX));
  const cy = Math.min(z * top - L.feetY, Math.max(H - L.feetY - z * (L.bottom + 10), rawY));

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
            <Person look={MIKA} idPrefix="m" sit arms={mikaArms} expression={mikaExp} lookAt={mikaLook} talk={talk.mika} yawn={yMika} blink={blinkAt(frame, 0)} />
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

      {/* sound: music bed (composed in code, tools/music/make-music.py), ducked under every line */}
      <Audio src={staticFile('music/sleepy-bed.wav')} volume={musicVolume} />
      <Audio src={staticFile('sfx/ticks.wav')} volume={0.35} />
      {(Object.keys(LINES) as LineId[]).map((id) => (
        <Sequence key={'a' + id} from={T[id]} layout="none">
          <Audio src={staticFile(`vo/s02/${id}.wav`)} />
        </Sequence>
      ))}
      {[T.devYawn, T.mikaYawn, T.aajiYawn, T.mikaAgain].map((t, i) => (
        <Sequence key={'y' + i} from={t} layout="none">
          <Audio src={staticFile('sfx/yawn.wav')} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={T.cut2} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      <Sequence from={T.jump2} layout="none"><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
      <Sequence from={T.fact} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.L4 + len('L4')} layout="none"><Audio src={staticFile('sfx/sting-dare.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.mikaAgain + 4} layout="none"><Audio src={staticFile('sfx/slide-down.wav')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
