import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {K, Background, Tag, Hero, Body, Source} from './Design';

// Four style frames for approval (stills only): hook, problem, why, fix.
// Composition "KineticStyle", frames 0–3 = one scene each.

const Phone: React.FC<{x: number; y: number; w: number; rot?: number; children?: React.ReactNode}> = ({x, y, w, rot = 0, children}) => {
  const h = w * 2.05;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.14} fill="#0d0f1c" stroke="#3a4070" strokeWidth={6} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={w * 0.11} fill="#1a2350" />
      {children}
    </g>
  );
};

const Hook: React.FC = () => (
  <AbsoluteFill>
    <Background glow={{x: 540, y: 1130, r: 760, color: K.blue, o: 0.42}} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {/* the phone, held above your face in bed */}
      <Phone x={540} y={1110} w={400} rot={-5}>
        <text x={0} y={-180} textAnchor="middle" fontFamily="InterBlack" fontSize={150} fill={K.cream} letterSpacing={-4}>1:55</text>
        <text x={0} y={-118} textAnchor="middle" fontFamily="InterSB" fontSize={30} fill={K.mute}>Tuesday</text>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${-40 + i * 110})`}>
            <rect x={-170} y={0} width={340} height={92} rx={22} fill="#ffffff" opacity={0.12} />
            <circle cx={-128} cy={46} r={24} fill={[K.coral, K.yellow, K.blue][i]} />
            <rect x={-90} y={30} width={170 - i * 30} height={12} rx={6} fill="#ffffff" opacity={0.5} />
            <rect x={-90} y={54} width={220 - i * 40} height={10} rx={5} fill="#ffffff" opacity={0.25} />
          </g>
        ))}
        {/* 4% battery */}
        <g transform="translate(110 -385)">
          <rect x={0} y={0} width={54} height={26} rx={6} fill="none" stroke={K.cream} strokeWidth={4} />
          <rect x={56} y={8} width={5} height={10} rx={2} fill={K.cream} />
          <rect x={5} y={5} width={7} height={16} rx={2} fill={K.coral} />
        </g>
      </Phone>
      {/* blanket edge, bottom of your view */}
      <path d="M -20 1560 C 160 1480 300 1610 520 1540 C 720 1476 880 1600 1100 1520 L 1100 1940 L -20 1940 Z" fill="#2b3370" />
      <path d="M -20 1560 C 160 1480 300 1610 520 1540 C 720 1476 880 1600 1100 1520" fill="none" stroke={K.blue} strokeOpacity={0.35} strokeWidth={6} />
    </svg>
    <Tag text="Phone: 4% · You: 2%" color={K.coral} top={150} />
    <Hero
      top={250}
      lines={[
        {text: 'Why are you', size: 118},
        {text: 'still', size: 150, block: K.yellow},
        {text: 'scrolling?', size: 132},
      ]}
    />
  </AbsoluteFill>
);

// 12-hour dial: angle in degrees from 12 o'clock for h:m
const ang = (h: number, m: number) => ((h % 12) * 30 + m * 0.5);
const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];

const Problem: React.FC = () => {
  const cx = 540;
  const cy = 1010;
  const r = 250;
  const a0 = ang(11, 15);
  const a1 = ang(1, 55) + 360;
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const [hx, hy] = pt(cx, cy, r * 0.5, ang(1, 55));
  const [mx, my] = pt(cx, cy, r * 0.78, 55 * 6);
  return (
    <AbsoluteFill>
      <Background glow={{x: 540, y: 1010, r: 620, color: K.coral, o: 0.22}} />
      <Tag text="11:15 PM · You said" color={K.blue} top={150} />
      <Hero top={250} lines={[{text: '“5 more', size: 150}, {text: 'minutes”', size: 150}]} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={r + 26} fill={K.night3} />
        <circle cx={cx} cy={cy} r={r} fill={K.night1} stroke="#3a4070" strokeWidth={6} />
        {Array.from({length: 12}).map((_, i) => {
          const [a, b] = pt(cx, cy, r - 18, i * 30);
          const [c, d] = pt(cx, cy, r - 44, i * 30);
          return <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={K.mute} strokeWidth={8} strokeLinecap="round" />;
        })}
        {/* the "5 minutes" that became 2 h 40 min */}
        <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={K.coral} strokeWidth={34} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={K.cream} strokeWidth={18} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke={K.cream} strokeWidth={10} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={16} fill={K.coral} />
      </svg>
      <div style={{position: 'absolute', left: 64, top: 1300, width: 866, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 120, letterSpacing: -2, color: K.yellow}}>= 2 H 40 MIN</div>
    </AbsoluteFill>
  );
};

const Why: React.FC = () => (
  <AbsoluteFill>
    <Background glow={{x: 760, y: 1250, r: 600, color: K.blue, o: 0.25}} />
    <Tag text="Psychologists call it" color={K.blue} top={150} />
    <Hero
      top={250}
      lines={[
        {text: 'Bedtime', size: 150},
        {text: 'procrasti-', size: 136, color: K.coral},
        {text: 'nation', size: 150, color: K.coral},
      ]}
    />
    <Body top={760} text="Going to bed later than you planned, when nothing is stopping you." />
    <Source top={900} text="Kroese et al., 2014 · Frontiers in Psychology" />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {/* the phone eclipsing the moon */}
      <circle cx={600} cy={1210} r={190} fill={K.yellow} />
      <circle cx={680} cy={1160} r={170} fill={K.night2} />
      <g transform="translate(470 1230) rotate(-12)">
        <rect x={-95} y={-190} width={190} height={380} rx={30} fill="#0d0f1c" stroke="#3a4070" strokeWidth={6} />
        <rect x={-80} y={-175} width={160} height={350} rx={22} fill={K.blue} opacity={0.9} />
        <rect x={-60} y={-140} width={120} height={70} rx={12} fill="#ffffff" opacity={0.35} />
        <rect x={-60} y={-50} width={120} height={70} rx={12} fill="#ffffff" opacity={0.25} />
        <rect x={-60} y={40} width={120} height={70} rx={12} fill="#ffffff" opacity={0.18} />
      </g>
      {[[860, 1010, 6], [300, 1080, 5], [900, 1320, 4], [230, 1360, 6]].map(([x, y, rr], i) => (
        <circle key={i} cx={x} cy={y} r={rr} fill={K.cream} opacity={0.7} />
      ))}
    </svg>
  </AbsoluteFill>
);

const Fix: React.FC = () => (
  <AbsoluteFill>
    <Background glow={{x: 540, y: 1250, r: 620, color: K.yellow, o: 0.16}} />
    <Tag text="The fix" color={K.yellow} top={150} />
    <Hero top={250} lines={[{text: 'Make an', size: 118}, {text: 'if–then', size: 150, block: K.yellow}, {text: 'plan', size: 150}]} />
    {[
      {k: 'IF', c: K.coral, v: 'it’s 11 PM,', top: 740},
      {k: 'THEN', c: K.blue, v: 'my phone charges across the room.', top: 846},
    ].map((r) => (
      <div key={r.k} style={{position: 'absolute', left: 64, top: r.top, width: 866, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{background: r.c, color: K.ink, fontFamily: 'InterBlack', fontSize: 40, padding: '12px 0 8px', borderRadius: 12, width: 150, flexShrink: 0, textAlign: 'center'}}>{r.k}</div>
        <div style={{fontFamily: 'InterXB', fontSize: 46, lineHeight: 1.12, color: K.cream}}>{r.v}</div>
      </div>
    ))}
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {/* bed (left) — dashed path — phone on its charger (right), moon over the bed */}
      <g transform="translate(250 1230)">
        <rect x={-160} y={-40} width={320} height={90} rx={22} fill={K.night3} stroke="#4a5296" strokeWidth={6} />
        <rect x={-150} y={-90} width={110} height={60} rx={20} fill={K.cream} />
        <rect x={-30} y={-70} width={190} height={50} rx={18} fill="#4a5296" />
        <rect x={-160} y={50} width={20} height={40} fill="#4a5296" />
        <rect x={140} y={50} width={20} height={40} fill="#4a5296" />
        <circle cx={90} cy={-165} r={46} fill={K.yellow} />
        <circle cx={108} cy={-180} r={40} fill={K.night2} />
      </g>
      <path d="M 450 1210 C 560 1120 680 1120 760 1190" fill="none" stroke={K.cream} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
      <path d="M 742 1164 L 768 1196 L 728 1202" fill="none" stroke={K.cream} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(830 1230)">
        <rect x={-50} y={-110} width={100} height={200} rx={20} fill="#0d0f1c" stroke="#3a4070" strokeWidth={6} />
        <rect x={-40} y={-100} width={80} height={180} rx={14} fill="#1a2350" />
        <path d="M -8 -40 L 12 -40 L -2 -6 L 14 -6 L -10 40 L -2 6 L -16 6 Z" fill={K.yellow} />
        <path d="M 0 90 Q 0 140 40 150" fill="none" stroke={K.mute} strokeWidth={6} />
      </g>
    </svg>
    <Source top={1400} text="If–then plans help people stick to their goals. Gollwitzer & Sheeran, 2006 (review of 94 studies)" />
  </AbsoluteFill>
);

export const KineticStyle: React.FC = () => {
  const f = useCurrentFrame();
  return [<Hook key="h" />, <Problem key="p" />, <Why key="w" />, <Fix key="f" />][Math.min(3, f)];
};
