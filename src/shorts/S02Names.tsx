import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {K, Background} from '../kinetic/Design';
import {INK} from '../kit/Person';
import {clamp, Pop, Line, Tag, Stack, Spoken, SourceLine, MikaHead, Badge, blinkAt, phraseFrame} from '../kinetic/Kit';
import lines from '../../public/vo/s02/lines.json';

// Short S02: "Why you forget names in 3 seconds" (episodes/s02-names/SCRIPT.md)
// Hook → problem → why (next-in-line effect) → why explained → fix (say it out loud) → evidence (production effect) → payoff.

type N = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7';
const LINES = lines as Record<N, {seconds: number; frames: number; mouth: number[]}>;
const TEXT: Record<N, string> = {
  N1: "Someone just told you their name. Three seconds later, it's gone. Why?",
  N2: 'You heard it. You even nodded. But your brain was busy with something else.',
  N3: 'Psychologists call it the next-in-line effect. In a classic study, people remembered less of what was said in the nine seconds before their own turn to speak.',
  N4: 'You were too busy rehearsing your own line to store theirs.',
  N5: 'The fix? Say their name out loud, right away. Nice to meet you, Priya.',
  N6: "Words you say out loud are remembered better than words you only read silently. It's called the production effect.",
  N7: "So next time, say it back. They'll notice.",
};
const START: Record<N, number> = {N1: 6, N2: 136, N3: 270, N4: 562, N5: 660, N6: 794, N7: 1002};
const SCENES = [0, 130, 262, 556, 652, 786, 994];
export const S02_DURATION = 1086;
const at = (n: N, phrase: string) => phraseFrame(TEXT[n], START[n], LINES[n].frames, phrase);

// ---------- speech bubble (HTML), tail on the left or right
const Bubble: React.FC<{x: number; y: number; w: number; children: React.ReactNode; tail?: 'left' | 'right'; from?: number; still?: boolean; scale?: number; opacity?: number; size?: number}> = ({
  x, y, w, children, tail = 'left', from = 0, still, scale = 1, opacity = 1, size = 64,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = still ? 1 : spring({frame: f - from, fps, config: {damping: 12, stiffness: 200}});
  if (!still && f < from) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${s * scale})`, transformOrigin: tail === 'left' ? 'left bottom' : 'right bottom', opacity}}>
      <div style={{background: K.cream, border: `7px solid ${INK}`, borderRadius: 40, padding: '26px 34px 20px', fontFamily: 'InterXB', fontSize: size, lineHeight: 1.1, color: K.ink}}>{children}</div>
      <svg width={70} height={50} style={{position: 'absolute', [tail]: 60, bottom: -43}}>
        <path d={tail === 'left' ? 'M 4 0 L 10 44 L 50 0' : 'M 20 0 L 60 44 L 66 0'} fill={K.cream} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <rect x={0} y={0} width={70} height={6} fill={K.cream} />
      </svg>
    </div>
  );
};
const Hi: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{background: K.yellow, borderRadius: 10, padding: '0 10px'}}>{children}</span>;

// the name dissolving letter by letter into "…"
const FadingName: React.FC<{name: string; from: number; to: number}> = ({name, from, to}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, to], [0, 1], clamp);
  const letters = name.split('');
  return (
    <span>
      {letters.map((c, i) => {
        const o = interpolate(k, [i / letters.length, (i + 1) / letters.length], [1, 0], clamp);
        return <span key={i} style={{opacity: o, filter: `blur(${(1 - o) * 6}px)`}}>{c}</span>;
      })}
      <span style={{opacity: k}}>…</span>
    </span>
  );
};

// ---------- scenes
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const gone = at('N1', 'gone');
  const shocked = f >= gone;
  return (
    <AbsoluteFill>
      <Background glow={{x: 620, y: 1200, r: 650, color: K.blue, o: 0.3}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(640 1230) scale(${1 + f * 0.0005}) translate(-640 -1230)`}>
          <MikaHead x={640} y={1230} s={1.6} e={shocked ? 'shocked' : 'neutral'} id="h" blink={blinkAt(f + 20)} />
        </g>
      </svg>
      <Bubble x={64} y={740} w={640} still>
        Hi, I’m <FadingName name="Priya!" from={at('N1', 'Three')} to={gone} />
      </Bubble>
      <Tag text="New person · 3 sec ago" color={K.coral} from={0} still />
      <Stack top={250}>
        <Line text="Why you forget" size={94} from={0} still />
        <Line text="names in" size={140} from={0} still />
        <Line text="3 seconds" size={140} block={K.yellow} from={0} still />
      </Stack>
    </AbsoluteFill>
  );
};

const Problem: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1100, r: 600, color: K.coral, o: 0.2}} />
      <Tag text="3 seconds later" color={K.coral} from={SCENES[1]} />
      <Stack top={250}>
        <Line text="It’s" size={150} from={SCENES[1] + 2} />
        <Line text="gone." size={170} block={K.coral} from={SCENES[1] + 10} />
      </Stack>
      <Bubble x={64} y={720} w={600} from={SCENES[1] + 6}>Hi, I’m <span style={{color: K.coral}}>???</span></Bubble>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Badge cx={680} cy={1250} r={200} e={f >= at('N2', 'nodded') ? 'guilty' : 'neutral'} id="p2" from={SCENES[1] + 14} />
      </svg>
      <Spoken text="Your brain was busy with something else." from={at('N2', 'But')} to={START.N2 + LINES.N2.frames} top={925} size={46} />
    </AbsoluteFill>
  );
};

const Why: React.FC = () => {
  const f = useCurrentFrame();
  // six people take turns speaking; "you" are 5th. The ~9 s before your turn is the blind spot.
  const people = 6;
  const youIdx = 4;
  const x0 = 120, x1 = 960, y = 1110;
  const step = (x1 - x0) / (people - 1);
  const turnStart = at('N3', 'In a classic');
  const turn = Math.floor(interpolate(f, [turnStart, turnStart + 120], [0, people], clamp));
  const blindOn = f >= at('N3', 'nine seconds');
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1150, r: 620, color: K.blue, o: 0.22}} />
      <Tag text="Psychologists call it" color={K.blue} from={SCENES[2]} />
      <Stack top={250}>
        <Line text="The next-" size={140} from={at('N3', 'next-in-line')} />
        <Line text="in-line" size={140} color={K.coral} from={at('N3', 'next-in-line') + 6} />
        <Line text="effect" size={140} color={K.coral} from={at('N3', 'next-in-line') + 12} />
      </Stack>
      <Spoken text="People remembered less of what was said in the 9 seconds before their own turn to speak." from={at('N3', 'people')} to={START.N3 + LINES.N3.frames} top={740} size={46} />
      <SourceLine text="Brenner, 1973 · the next-in-line effect" top={940} from={at('N3', 'people') + 20} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* the 9-second blind spot just before your turn */}
        {blindOn && (
          <g opacity={interpolate(f, [at('N3', 'nine seconds'), at('N3', 'nine seconds') + 10], [0, 1], clamp)}>
            <rect x={x0 + step * (youIdx - 1) - 70} y={y - 120} width={step + 40} height={250} rx={30} fill={K.coral} opacity={0.22} />
            <text x={x0 + step * (youIdx - 0.5) - 15} y={y + 200} textAnchor="middle" fontFamily="InterXB" fontSize={34} fill={K.coral}>9 SEC BLIND SPOT</text>
          </g>
        )}
        {Array.from({length: people}).map((_, i) => {
          const cx = x0 + step * i;
          const speaking = i === turn % people && f >= turnStart;
          const you = i === youIdx;
          const c = you ? K.coral : speaking ? K.yellow : '#5b6aa8';
          return (
            <g key={i}>
              <circle cx={cx} cy={y - 40} r={36} fill={c} />
              <path d={`M ${cx - 56} ${y + 70} Q ${cx - 56} ${y} ${cx} ${y} Q ${cx + 56} ${y} ${cx + 56} ${y + 70} Z`} fill={c} />
              {speaking && !you && <path d={`M ${cx + 44} ${y - 70} q 14 -10 28 0 M ${cx + 50} ${y - 94} q 22 -16 44 0`} fill="none" stroke={K.yellow} strokeWidth={6} strokeLinecap="round" />}
              {you && <text x={cx} y={y + 130} textAnchor="middle" fontFamily="InterBlack" fontSize={40} fill={K.coral}>YOU</text>}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Rehearse: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [SCENES[3] + 10, SCENES[3] + 60], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Background glow={{x: 760, y: 1000, r: 600, color: K.yellow, o: 0.16}} />
      <Tag text="What was really happening" color={K.yellow} from={SCENES[3]} />
      <Stack top={250}>
        <Line text="You were" size={130} from={at('N4', 'You were')} />
        <Line text="rehearsing" size={140} block={K.yellow} from={at('N4', 'rehearsing')} />
      </Stack>
      {/* their line shrinks and fades; yours takes over */}
      <Bubble x={64} y={700} w={430} still scale={1 - 0.45 * k} opacity={1 - 0.75 * k} size={56}>“Priya”</Bubble>
      <Bubble x={300} y={860} w={700} tail="right" from={SCENES[3] + 8} scale={0.75 + 0.25 * k} size={58}>“Hi! I’m Mika, I work in…”</Bubble>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Badge cx={640} cy={1290} r={170} e="sideEye" id="r4" from={SCENES[3] + 16} />
      </svg>
    </AbsoluteFill>
  );
};

const Fix: React.FC = () => {
  const f = useCurrentFrame();
  const say = at('N5', 'Nice');
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1150, r: 640, color: K.yellow, o: 0.2}} />
      <Tag text="The fix" color={K.yellow} from={SCENES[4]} />
      <Stack top={250}>
        <Line text="Say it" size={150} from={at('N5', 'Say')} />
        <Line text="out loud" size={150} block={K.yellow} from={at('N5', 'out loud')} />
      </Stack>
      <Bubble x={250} y={760} w={760} tail="right" from={say} size={62}>“Nice to meet you, <Hi>Priya</Hi>.”</Bubble>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <MikaHead x={560} y={1260} s={1.35} e={f >= say ? 'happy' : 'curious'} id="f5" blink={blinkAt(f)} />
        {f >= say &&
          [0, 1, 2].map((i) => {
            const o = interpolate((f - say + i * 6) % 24, [0, 12, 24], [0, 1, 0]);
            return <path key={i} d={`M ${830 + i * 34} ${1160 - i * 26} q 30 70 0 140`} fill="none" stroke={K.yellow} strokeWidth={10} strokeLinecap="round" opacity={o} />;
          })}
      </svg>
    </AbsoluteFill>
  );
};

const Evidence: React.FC = () => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [SCENES[5] + 10, SCENES[5] + 50], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const base = 1360;
  const bars = [
    {label: 'Read silently', h: 300, c: '#5b6aa8', x: 200},
    {label: 'Said out loud', h: 430, c: K.yellow, x: 560},
  ];
  return (
    <AbsoluteFill>
      <Background glow={{x: 640, y: 1100, r: 620, color: K.yellow, o: 0.16}} />
      <Tag text="Does it work?" color={K.yellow} from={SCENES[5]} />
      <Stack top={250}>
        <Line text="The production" size={112} from={SCENES[5] + 4} />
        <Line text="effect" size={140} block={K.yellow} from={SCENES[5] + 12} />
      </Stack>
      <Spoken text="Words you say out loud are remembered better than words you only read silently." from={START.N6} to={at('N6', "It's called")} top={640} size={46} />
      <SourceLine text="MacLeod et al., 2010 · Journal of Experimental Psychology: Learning, Memory, and Cognition" top={810} from={START.N6 + 30} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={120} y1={base} x2={960} y2={base} stroke={K.mute} strokeWidth={5} />
        {bars.map((b) => (
          <g key={b.label}>
            <rect x={b.x} y={base - b.h * grow} width={300} height={b.h * grow} rx={18} fill={b.c} />
            <text x={b.x + 150} y={base + 56} textAnchor="middle" fontFamily="InterXB" fontSize={38} fill={b.c === K.yellow ? K.yellow : K.mute}>{b.label}</text>
          </g>
        ))}
        <text x={940} y={base - 470} textAnchor="end" fontFamily="InterSB" fontSize={30} fill={K.mute}>remembered (illustration)</text>
      </svg>
    </AbsoluteFill>
  );
};

const Payoff: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #ffcf8a 0%, #ff9f7a 55%, #7a5aa8 100%)'}} />
      <Tag text="Next time" color={K.cream} from={SCENES[6]} />
      <Stack top={250}>
        <Line text="Say it" size={150} color={K.ink} from={at('N7', 'say it')} />
        <Line text="back." size={170} block={K.cream} from={at('N7', 'say it') + 6} />
      </Stack>
      <Bubble x={250} y={700} w={760} tail="right" from={SCENES[6] + 10} size={60}>“Nice to meet you, <Hi>Priya</Hi>!”</Bubble>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <MikaHead x={560} y={1220} s={1.55} e="happy" id="p7" blink={0} />
        <path d="M -20 1600 C 160 1540 300 1640 520 1580 C 720 1526 880 1630 1100 1560 L 1100 1940 L -20 1940 Z" fill="#7a5aa8" />
      </svg>
      {f === S02_DURATION - 1 && <AbsoluteFill style={{background: '#fffaf0'}} />}
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS = [Hook, Problem, Why, Rehearse, Fix, Evidence, Payoff];

export const S02Names: React.FC = () => {
  const f = useCurrentFrame();
  const i = SCENES.reduce((acc, s, k) => (f >= s ? k : acc), 0);
  const Scene = SCENE_COMPONENTS[i];
  const punch = i === 0 ? 1 : interpolate(f - SCENES[i], [0, 7], [1.06, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: K.night1}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        <Scene />
      </AbsoluteFill>
      <Audio src={staticFile('music/s02-bed.wav')} volume={0.16} />
      {(Object.keys(START) as N[]).map((n) => (
        <Sequence key={n} from={START[n]} layout="none"><Audio src={staticFile(`vo/s02/${n}.wav`)} /></Sequence>
      ))}
      {SCENES.slice(1).map((s) => (
        <Sequence key={'c' + s} from={s - 3} layout="none"><Audio src={staticFile('sfx/swish.wav')} /></Sequence>
      ))}
      {[at('N1', 'gone'), SCENES[1] + 10, at('N3', 'nine seconds'), at('N4', 'rehearsing'), at('N5', 'out loud'), at('N6', 'production')].map((t, k) => (
        <Sequence key={'p' + k} from={t} layout="none"><Audio src={staticFile('sfx/pop.wav')} volume={0.5} /></Sequence>
      ))}
      <Sequence from={at('N5', 'Nice')} layout="none"><Audio src={staticFile('sfx/ding.wav')} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
