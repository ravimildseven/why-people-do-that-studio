import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {K, Background, SAFE} from '../kinetic/Design';
import {Person, Expression, INK} from '../kit/Person';
import {MIKA} from '../cast';
import lines from '../../public/vo/s01v4/lines.json';

// Short S01 v4: "Why are you still scrolling?" in the POV + kinetic-type design, with Mika as the face.
// Narrated (female, Kokoro af_heart). Hook → problem → why → why it feels good → fix → evidence → try it.
// Script + fact checks: episodes/s01-bedtime/SCRIPT.md (v4).

type N = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7';
const LINES = lines as Record<N, {seconds: number; frames: number; mouth: number[]}>;
const TEXT: Record<N, string> = {
  N1: "It's almost two a.m. You're exhausted. So why are you still scrolling?",
  N2: 'You said five more minutes. That was two hours and forty minutes ago.',
  N3: 'Psychologists call it bedtime procrastination: going to bed later than you planned, when nothing is stopping you.',
  N4: "And late at night can feel like the only time that's yours.",
  N5: "The fix? Make an if, then plan. If it's eleven p.m., then my phone charges across the room.",
  N6: 'Plans like this help people stick to their goals.',
  N7: 'So tonight, try it. Future you will thank you.',
};
const START: Record<N, number> = {N1: 6, N2: 140, N3: 270, N4: 486, N5: 596, N6: 784, N7: 866};
const SCENES = [0, 132, 262, 480, 590, 780, 860]; // hook, problem, why, only-time, fix, evidence, payoff
export const S01V4_DURATION = 956;

// frame at which a phrase is spoken (character-proportional estimate inside the line)
const at = (n: N, phrase: string) => {
  const i = TEXT[n].indexOf(phrase);
  return START[n] + Math.round((Math.max(0, i) / TEXT[n].length) * LINES[n].frames);
};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- animated type
const Pop: React.FC<{from: number; children: React.ReactNode; style?: React.CSSProperties; still?: boolean}> = ({from, children, style, still}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = still ? 1 : spring({frame: f - from, fps, config: {damping: 13, stiffness: 220}});
  return <div style={{...style, opacity: f < from && !still ? 0 : 1, transform: `${style?.transform ?? ''} scale(${0.6 + 0.4 * s})`, transformOrigin: 'left center'}}>{children}</div>;
};

const Line: React.FC<{text: string; size: number; color?: string; block?: string; from: number; still?: boolean}> = ({text, size, color = K.cream, block, from, still}) => (
  <Pop from={from} still={still} style={{fontFamily: 'InterBlack', fontSize: size, lineHeight: 0.98, letterSpacing: -2, textTransform: 'uppercase', color: block ? K.ink : color, margin: block ? '12px 0' : 0}}>
    {block ? <span style={{background: block, padding: '2px 18px 0', borderRadius: 12, display: 'inline-block', transform: 'rotate(-1.5deg)'}}>{text}</span> : text}
  </Pop>
);

const Tag: React.FC<{text: string; color: string; from: number; top?: number; still?: boolean}> = ({text, color, from, top = 150, still}) => (
  <Pop from={from} still={still} style={{position: 'absolute', left: SAFE.left, top, background: color, color: K.ink, fontFamily: 'InterXB', fontSize: 36, letterSpacing: 3, padding: '12px 22px 10px', borderRadius: 14, textTransform: 'uppercase'}}>
    {text}
  </Pop>
);

const Stack: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left}}>{children}</div>
);

// words revealed as they are spoken
const Spoken: React.FC<{text: string; from: number; to: number; top: number; size?: number}> = ({text, from, to, top, size = 50}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left, fontFamily: 'InterSB', fontSize: size, lineHeight: 1.22, color: K.cream}}>
      {words.map((w, i) => {
        const t = from + ((to - from) * i) / words.length;
        return <span key={i} style={{opacity: interpolate(f, [t, t + 4], [0.18, 1], clamp)}}>{w} </span>;
      })}
    </div>
  );
};

const SourceLine: React.FC<{text: string; top: number; from: number}> = ({text, top, from}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left, fontFamily: 'InterSB', fontSize: 27, color: K.mute, opacity: interpolate(f, [from, from + 8], [0, 1], clamp)}}>{text}</div>;
};

// ---------- Mika cut-outs
const MikaHead: React.FC<{x: number; y: number; s: number; e: Expression; id: string; blink?: number}> = ({x, y, s, e, id, blink = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(0 468)`}>
    <Person look={MIKA} idPrefix={id} expression={e} headOnly blink={blink} />
  </g>
);
const blinkAt = (f: number) => {
  const c = f % 84;
  return c >= 80 ? [0.6, 1, 1, 0.5][c - 80] : 0;
};
const Badge: React.FC<{cx: number; cy: number; r: number; e: Expression; id: string; from: number; bg?: string}> = ({cx, cy, r, e, id, from, bg = '#f3d9a4'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - from, fps, config: {damping: 11, stiffness: 180}});
  if (f < from) return null;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <clipPath id={id + 'c'}><circle cx={cx} cy={cy} r={r - 4} /></clipPath>
      <g clipPath={`url(#${id}c)`}>
        <MikaHead x={cx} y={cy + r * 0.2} s={r / 160} e={e} id={id} blink={blinkAt(f)} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={10} />
    </g>
  );
};

// ---------- scenes
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = 0.42 + 0.05 * Math.sin(f * 0.9) + (f % 23 === 0 ? 0.06 : 0);
  const still = at('N1', 'still');
  const pulse = interpolate(f, [still, still + 4, still + 10], [1, 1.12, 1], clamp);
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1150, r: 700, color: K.blue, o: flicker}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(540 1080) scale(${1 + f * 0.0006}) translate(-540 -1080)`}>
          <MikaHead x={540} y={1080} s={1.9} e="scrollZombie" id="h1" blink={blinkAt(f + 30)} />
          <g transform="translate(560 1470) rotate(-6)">
            <rect x={-150} y={-300} width={300} height={600} rx={48} fill="#151829" stroke={INK} strokeWidth={10} />
            <circle cx={-80} cy={-230} r={26} fill="#2a2f45" stroke={INK} strokeWidth={5} />
          </g>
        </g>
        <path d="M -20 1620 C 160 1560 300 1660 520 1600 C 720 1546 880 1650 1100 1580 L 1100 1940 L -20 1940 Z" fill="#2b3370" />
      </svg>
      {/* headline is fully on screen from frame 0 (first thing people see in the feed) */}
      <Tag text={f % 30 < 22 ? '1:55 AM · Phone 4% · You 2%' : '1:55 AM · Phone 4% · You 1%'} color={K.coral} from={0} still />
      <Stack top={250}>
        <Line text="Why are you" size={118} from={0} still />
        <div style={{transform: `scale(${pulse})`, transformOrigin: 'left center'}}>
          <Line text="still" size={150} block={K.yellow} from={0} still />
        </div>
        <Line text="scrolling?" size={132} from={0} still />
      </Stack>
    </AbsoluteFill>
  );
};

const ang = (h: number, m: number) => (h % 12) * 30 + m * 0.5;
const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];

const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const sweepFrom = at('N2', 'That was');
  const sweepTo = sweepFrom + 40;
  const k = interpolate(f, [sweepFrom, sweepTo], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const minutes = 15 + k * 160; // 11:15 → 13:55
  const h = 11 + Math.floor(minutes / 60);
  const m = minutes % 60;
  const cx = 540, cy = 1010, r = 250;
  const a0 = ang(11, 15);
  const a1 = a0 + k * 80;
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const [hx, hy] = pt(cx, cy, r * 0.5, ang(h, m));
  const [mx, my] = pt(cx, cy, r * 0.78, m * 6);
  const slam = sweepTo + 2;
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1010, r: 620, color: K.coral, o: 0.12 + 0.18 * k}} />
      <Tag text={k < 1 ? '11:15 PM · You said' : '1:55 AM · Still here'} color={K.blue} from={SCENES[1]} />
      <Stack top={250}>
        <Line text="“5 more" size={150} from={START.N2 + 4} />
        <Line text="minutes”" size={150} from={at('N2', 'minutes')} />
      </Stack>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={r + 26} fill={K.night3} />
        <circle cx={cx} cy={cy} r={r} fill={K.night1} stroke="#3a4070" strokeWidth={6} />
        {Array.from({length: 12}).map((_, i) => {
          const [a, b] = pt(cx, cy, r - 18, i * 30);
          const [c, d] = pt(cx, cy, r - 44, i * 30);
          return <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={K.mute} strokeWidth={8} strokeLinecap="round" />;
        })}
        {k > 0.01 && <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={K.coral} strokeWidth={34} strokeLinecap="round" />}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={K.cream} strokeWidth={18} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke={K.cream} strokeWidth={10} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={16} fill={K.coral} />
      </svg>
      <Pop from={slam} style={{position: 'absolute', left: 64, top: 1300, width: 866, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 120, letterSpacing: -2, color: K.yellow, transformOrigin: 'center'}}>
        = 2 H 40 MIN
      </Pop>
    </AbsoluteFill>
  );
};

const Why: React.FC = () => {
  const def0 = at('N3', 'going');
  return (
    <AbsoluteFill>
      <Background glow={{x: 700, y: 1230, r: 600, color: K.blue, o: 0.25}} />
      <Tag text="Psychologists call it" color={K.blue} from={SCENES[2]} />
      <Stack top={250}>
        <Line text="Bedtime" size={150} from={at('N3', 'bedtime')} />
        <Line text="procrasti-" size={136} color={K.coral} from={at('N3', 'procrastination')} />
        <Line text="nation" size={150} color={K.coral} from={at('N3', 'procrastination') + 6} />
      </Stack>
      <Spoken text="Going to bed later than you planned, when nothing is stopping you." from={def0} to={START.N3 + LINES.N3.frames} top={760} />
      <SourceLine text="Kroese et al., 2014 · Frontiers in Psychology" top={900} from={def0 + 20} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Badge cx={540} cy={1250} r={250} e="guilty" id="b3" from={def0} />
      </svg>
    </AbsoluteFill>
  );
};

const OnlyTime: React.FC = () => {
  const f = useCurrentFrame();
  // a day as a bar: everyone else's blocks fill in, then the late-night slot lights up as "you"
  const segs = [
    {w: 0.34, c: '#4a5296', label: 'Work'},
    {w: 0.16, c: '#5b6aa8', label: 'Chores'},
    {w: 0.3, c: '#6c7cc0', label: 'Everyone else'},
    {w: 0.2, c: K.coral, label: 'You'},
  ];
  const x0 = 64, x1 = 930, y = 760, h = 150;
  let acc = x0;
  return (
    <AbsoluteFill>
      <Background glow={{x: 800, y: 840, r: 520, color: K.coral, o: 0.2}} />
      <Tag text="Why it feels so good" color={K.coral} from={SCENES[3]} />
      <Stack top={250}>
        <Line text="The only time" size={118} from={at('N4', 'only')} />
        <Line text="that’s yours" size={150} block={K.coral} from={at('N4', 'yours')} />
      </Stack>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {segs.map((s, i) => {
          const from = SCENES[3] + 8 + i * 16;
          const k = interpolate(f, [from, from + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const w = (x1 - x0) * s.w;
          const x = acc;
          acc += w;
          return (
            <g key={i} opacity={k}>
              <rect x={x + 3} y={y} width={(w - 6) * k} height={h} rx={18} fill={s.c} />
              <text x={x + w / 2} y={y + h + 54} textAnchor="middle" fontFamily="InterXB" fontSize={i === 3 ? 44 : 32} fill={i === 3 ? K.coral : K.mute}>{s.label}</text>
            </g>
          );
        })}
        <text x={x0} y={y - 22} fontFamily="InterSB" fontSize={30} fill={K.mute}>7 AM</text>
        <text x={x1} y={y - 22} textAnchor="end" fontFamily="InterSB" fontSize={30} fill={K.mute}>2 AM</text>
        <Badge cx={540} cy={1260} r={200} e="tired" id="b4" from={at('N4', 'only') + 4} />
      </svg>
    </AbsoluteFill>
  );
};

const Fix: React.FC = () => {
  const f = useCurrentFrame();
  const ifAt = at('N5', "If it's");
  const thenAt = at('N5', 'then my');
  const fly = interpolate(f, [thenAt + 30, thenAt + 54], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  // the phone flies from the bed to the charger along the dashed arc
  const bx = 330, by = 1180, ex = 830, ey = 1230;
  const px = bx + (ex - bx) * fly;
  const py = by + (ey - by) * fly - Math.sin(Math.PI * fly) * 140;
  const charged = fly >= 1;
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1250, r: 620, color: K.yellow, o: 0.16}} />
      <Tag text="The fix" color={K.yellow} from={SCENES[4]} />
      <Stack top={250}>
        <Line text="Make an" size={118} from={at('N5', 'Make')} />
        <Line text="if–then" size={150} block={K.yellow} from={at('N5', 'if, then')} />
        <Line text="plan" size={150} from={at('N5', 'plan')} />
      </Stack>
      {[
        {k: 'IF', c: K.coral, v: 'it’s 11 PM,', top: 740, from: ifAt},
        {k: 'THEN', c: K.blue, v: 'my phone charges across the room.', top: 846, from: thenAt},
      ].map((r) => (
        <Pop key={r.k} from={r.from} style={{position: 'absolute', left: 64, top: r.top, width: 866, display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: r.c, color: K.ink, fontFamily: 'InterBlack', fontSize: 40, padding: '12px 0 8px', borderRadius: 12, width: 150, flexShrink: 0, textAlign: 'center'}}>{r.k}</div>
          <div style={{fontFamily: 'InterXB', fontSize: 46, lineHeight: 1.12, color: K.cream}}>{r.v}</div>
        </Pop>
      ))}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(250 1230)">
          <rect x={-160} y={-40} width={320} height={90} rx={22} fill={K.night3} stroke="#4a5296" strokeWidth={6} />
          <rect x={-150} y={-90} width={110} height={60} rx={20} fill={K.cream} />
          <rect x={-30} y={-70} width={190} height={50} rx={18} fill="#4a5296" />
          <rect x={-160} y={50} width={20} height={40} fill="#4a5296" />
          <rect x={140} y={50} width={20} height={40} fill="#4a5296" />
          <circle cx={90} cy={-165} r={46} fill={K.yellow} />
          <circle cx={108} cy={-180} r={40} fill={K.night2} />
        </g>
        <path d="M 450 1210 C 560 1120 680 1120 760 1190" fill="none" stroke={K.cream} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" opacity={0.7} />
        {/* charger on the far side */}
        <g transform="translate(830 1290)">
          <rect x={-58} y={30} width={116} height={20} rx={8} fill="#3a4070" />
          <path d="M 0 50 Q 0 110 40 130" fill="none" stroke={K.mute} strokeWidth={6} />
        </g>
        {/* the phone itself */}
        <g transform={`translate(${px} ${py}) rotate(${-20 + 20 * fly})`}>
          <rect x={-46} y={-95} width={92} height={180} rx={18} fill="#0d0f1c" stroke="#3a4070" strokeWidth={6} />
          <rect x={-36} y={-85} width={72} height={160} rx={12} fill={charged ? '#1a2350' : K.blue} opacity={charged ? 1 : 0.85} />
          {charged && <path d="M -8 -40 L 12 -40 L -2 -6 L 14 -6 L -10 40 L -2 6 L -16 6 Z" fill={K.yellow} opacity={0.6 + 0.4 * Math.sin(f * 0.3)} />}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Evidence: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [SCENES[5] + 4, SCENES[5] + 40], [0, 94], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 760, r: 640, color: K.yellow, o: 0.2}} />
      <Tag text="Does it work?" color={K.yellow} from={SCENES[5]} />
      <div style={{position: 'absolute', left: 64, top: 260, width: 866, fontFamily: 'InterBlack', fontSize: 420, lineHeight: 1, letterSpacing: -14, color: K.yellow}}>{n}</div>
      <Stack top={700}>
        <Line text="studies" size={132} from={SCENES[5] + 6} />
      </Stack>
      <Spoken text="If–then plans helped people reach the goals they set." from={START.N6} to={START.N6 + LINES.N6.frames} top={880} />
      <SourceLine text="Gollwitzer & Sheeran, 2006 · review of 94 studies" top={1030} from={START.N6 + 20} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Badge cx={540} cy={1290} r={170} e="curious" id="b6" from={SCENES[5] + 20} />
      </svg>
    </AbsoluteFill>
  );
};

const Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sun = spring({frame: f - SCENES[6], fps, config: {damping: 20, stiffness: 60}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, #ffcf8a ${0}%, #ff9f7a 55%, #7a5aa8 100%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={540} cy={1500 - sun * 300} r={260} fill="#fff1c1" opacity={0.85} />
        <MikaHead x={540} y={1120} s={1.8} e="happy" id="p7" />
        <path d="M -20 1600 C 160 1540 300 1640 520 1580 C 720 1526 880 1630 1100 1560 L 1100 1940 L -20 1940 Z" fill="#7a5aa8" />
      </svg>
      <Tag text="7:00 AM · Rested" color={K.cream} from={SCENES[6]} />
      <Stack top={250}>
        <Line text="Try it" size={150} color={K.ink} from={at('N7', 'try')} />
        <Line text="tonight." size={150} block={K.cream} from={at('N7', 'try') + 6} />
      </Stack>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS = [Hook, Problem, Why, OnlyTime, Fix, Evidence, Payoff];

export const S01v4Kinetic: React.FC = () => {
  const f = useCurrentFrame();
  const i = SCENES.reduce((acc, s, k) => (f >= s ? k : acc), 0);
  const Scene = SCENE_COMPONENTS[i];
  // each cut lands with a small zoom-in punch
  const punch = i === 0 ? 1 : interpolate(f - SCENES[i], [0, 7], [1.06, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: K.night1}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        <Scene />
      </AbsoluteFill>
      {f === S01V4_DURATION - 1 && <AbsoluteFill style={{background: '#fffaf0'}} />}

      {/* sound: narrator over a quiet music bed, soft swishes on cuts, pops on highlights */}
      <Audio src={staticFile('music/s01-bed.wav')} volume={0.16} />
      {(Object.keys(START) as N[]).map((n) => (
        <Sequence key={n} from={START[n]} layout="none"><Audio src={staticFile(`vo/s01v4/${n}.wav`)} /></Sequence>
      ))}
      {SCENES.slice(1).map((s) => (
        <Sequence key={'c' + s} from={s - 3} layout="none"><Audio src={staticFile('sfx/swish.wav')} /></Sequence>
      ))}
      {[at('N1', 'still'), at('N2', 'minutes'), at('N3', 'procrastination'), at('N4', 'yours'), at('N5', 'if, then'), at('N5', "If it's"), at('N5', 'then my')].map((t, k) => (
        <Sequence key={'p' + k} from={t} layout="none"><Audio src={staticFile('sfx/pop.wav')} volume={0.5} /></Sequence>
      ))}
      <Sequence from={at('N2', 'That was') + 42} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.35} /></Sequence>
      <Sequence from={at('N5', 'then my') + 54} layout="none"><Audio src={staticFile('sfx/clack.wav')} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};
