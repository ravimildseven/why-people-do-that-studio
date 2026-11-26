import React from 'react';

// WPD character kit — one rig, many people.
// Every character shares: ink colour + weight, eyes, brows, mouths, hands, proportions,
// expressions and poses. A character is only a `Look` (see cast.ts).
// Origin = midpoint between the feet; figure stands on y=0, extends upward (negative y).

export const INK = '#1c1f1c';
export const OUT = 6;
export const MOUTH_DARK = '#5a2a2e';
export const SCREEN = '#9fd3ff';

export type HairStyle = 'bunPencil' | 'curly' | 'greyBun';
export type TopStyle = 'hoodie' | 'shirt' | 'cardigan';

export type Look = {
  name: string;
  skin: string;
  skinShade: string;
  hair: HairStyle;
  hairColor: string;
  hairShine: string;
  browColor?: string;
  head?: {a: number; b: number; n: number};
  top: TopStyle;
  topColor: string;
  topShade: string;
  topAccent: string; // drawstrings / shirt collar + buttons / cardigan blouse
  bottom: string;
  bottomStyle?: 'trousers' | 'longSkirt';
  shoe: string;
  shoeStripe: string;
  sole: string;
  blush: string;
  earrings?: string;
  glasses?: boolean;
  stubble?: boolean;
  bindi?: boolean;
  hip?: number; // leg length: hip height above the floor (default 170)
  bodyW?: number; // torso width factor (default 1)
  lidBase?: number; // resting eyelid (gentle/older faces)
};

export type Expression = 'neutral' | 'curious' | 'tired' | 'sideEye' | 'guilty' | 'shocked' | 'happy' | 'scrollZombie';
export type Pose = 'rest' | 'phone' | 'shrug' | 'think' | 'wave';

type Face = {
  lid: [number, number];
  lidTilt: [number, number];
  look: [number, number];
  pupil: number;
  brow: [number, number, number, number];
  mouth: 'smile' | 'flat' | 'frown' | 'o' | 'grin' | 'smirk' | 'wobble' | 'slack';
  bags?: boolean;
  blush?: boolean;
  sweat?: boolean;
  happyEyes?: boolean;
  glow?: boolean;
};

export const FACES: Record<Expression, Face> = {
  neutral: {lid: [0.08, 0.08], lidTilt: [0, 0], look: [0, 0], pupil: 14, brow: [0, 0, 0, 0], mouth: 'smile'},
  curious: {lid: [0.05, 0.3], lidTilt: [0, -6], look: [0.6, -0.55], pupil: 14, brow: [-16, -8, 2, 10], mouth: 'smirk'},
  tired: {lid: [0.5, 0.5], lidTilt: [-8, 8], look: [0, 0.35], pupil: 13, brow: [6, -10, 6, -10], mouth: 'flat', bags: true},
  sideEye: {lid: [0.48, 0.48], lidTilt: [-4, -4], look: [1, 0.1], pupil: 13, brow: [4, 6, -2, 2], mouth: 'smirk'},
  guilty: {lid: [0.12, 0.12], lidTilt: [0, 0], look: [-0.9, 0.45], pupil: 13, brow: [-6, -14, -6, -14], mouth: 'wobble', blush: true, sweat: true},
  shocked: {lid: [0, 0], lidTilt: [0, 0], look: [0, 0], pupil: 8, brow: [-22, -4, -22, -4], mouth: 'o'},
  happy: {lid: [0, 0], lidTilt: [0, 0], look: [0, 0], pupil: 14, brow: [-12, -4, -12, -4], mouth: 'grin', blush: true, happyEyes: true},
  scrollZombie: {lid: [0.38, 0.38], lidTilt: [0, 0], look: [0, 0.7], pupil: 9, brow: [4, 0, 4, 0], mouth: 'slack', bags: true, glow: true},
};

export type Arm = {upper: number; fore: number; hand: 'open' | 'phone' | 'palm' | 'fist'};
export const POSES: Record<Pose, {L: Arm; R: Arm}> = {
  rest: {L: {upper: 12, fore: 6, hand: 'open'}, R: {upper: 12, fore: 6, hand: 'open'}},
  phone: {L: {upper: 6, fore: -150, hand: 'phone'}, R: {upper: 12, fore: 4, hand: 'open'}},
  shrug: {L: {upper: 32, fore: 112, hand: 'palm'}, R: {upper: 32, fore: 112, hand: 'palm'}},
  think: {L: {upper: 12, fore: 6, hand: 'open'}, R: {upper: -30, fore: -172, hand: 'fist'}},
  wave: {L: {upper: 12, fore: 6, hand: 'open'}, R: {upper: 118, fore: 168, hand: 'open'}},
};

const DEFAULT_HEAD = {a: 120, b: 114, n: 2.7};
const HEAD_CY = -468;
const SHOULDER_Y = -318;
const UPPER = 88;
const FORE = 78;
export const SEAT_HIP = 130; // hip height when seated (matches the set's seat height)

const rad = (d: number) => (d * Math.PI) / 180;

export function superellipse(cx: number, cy: number, a: number, b: number, n: number, t0 = 0, t1 = 360, steps = 96) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = rad(t0 + ((t1 - t0) * i) / steps);
    const c = Math.cos(t);
    const s = Math.sin(t);
    pts.push([cx + a * Math.sign(c) * Math.abs(c) ** (2 / n), cy + b * Math.sign(s) * Math.abs(s) ** (2 / n)]);
  }
  return pts;
}
export const toPath = (pts: [number, number][], close = true) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + (close ? ' Z' : '');

function armPoints(side: -1 | 1, arm: Arm, shoulderX: number) {
  const sx = side * shoulderX;
  const sy = SHOULDER_Y;
  const ex = sx + side * Math.sin(rad(arm.upper)) * UPPER;
  const ey = sy + Math.cos(rad(arm.upper)) * UPPER;
  const hx = ex + side * Math.sin(rad(arm.fore)) * FORE;
  const hy = ey + Math.cos(rad(arm.fore)) * FORE;
  return {sx, sy, ex, ey, hx, hy, ang: Math.atan2(hx - ex, hy - ey)};
}

// ---------------------------------------------------------------- face parts
const Eye: React.FC<{id: string; cx: number; cy: number; lid: number; tilt: number; look: [number, number]; pupil: number; happy?: boolean; skin: string}> = ({id, cx, cy, lid, tilt, look, pupil, happy, skin}) => {
  const rx = 27;
  const ry = 32;
  if (happy) return <path d={`M ${cx - 22} ${cy + 6} Q ${cx} ${cy - 24} ${cx + 22} ${cy + 6}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  if (lid >= 0.95) return <path d={`M ${cx - 22} ${cy + 4} Q ${cx} ${cy + 18} ${cx + 22} ${cy + 4}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  const px = cx + look[0] * (rx - pupil - 4);
  const py = cy + look[1] * (ry - pupil - 5);
  const lidY = cy - ry + lid * 2 * ry;
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={pupil} fill={INK} />
        <circle cx={px + pupil * 0.35} cy={py - pupil * 0.4} r={Math.max(3, pupil * 0.32)} fill="#fff" />
        {lid > 0.01 && (
          <g transform={`rotate(${tilt} ${cx} ${lidY})`}>
            <rect x={cx - rx - 10} y={cy - ry - 40} width={rx * 2 + 20} height={lidY - (cy - ry - 40)} fill={skin} />
            <line x1={cx - rx - 10} y1={lidY} x2={cx + rx + 10} y2={lidY} stroke={INK} strokeWidth={OUT} />
          </g>
        )}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OUT} />
    </g>
  );
};

const Mouth: React.FC<{kind: Face['mouth']; y: number}> = ({kind, y}) => {
  const s = {fill: 'none', stroke: INK, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (kind) {
    case 'smile':
      return <path d={`M -20 ${y - 4} Q 0 ${y + 12} 20 ${y - 4}`} {...s} />;
    case 'flat':
      return <path d={`M -18 ${y + 2} L 18 ${y + 2}`} {...s} />;
    case 'frown':
      return <path d={`M -20 ${y + 8} Q 0 ${y - 8} 20 ${y + 8}`} {...s} />;
    case 'smirk':
      return <path d={`M -18 ${y + 4} Q 4 ${y + 6} 22 ${y - 8}`} {...s} />;
    case 'wobble':
      return <path d={`M -22 ${y + 4} Q -14 ${y - 4} -6 ${y + 3} Q 2 ${y + 10} 10 ${y + 2} Q 17 ${y - 4} 23 ${y + 4}`} {...s} strokeWidth={6} />;
    case 'o':
      return <ellipse cx={0} cy={y + 6} rx={14} ry={19} fill={MOUTH_DARK} stroke={INK} strokeWidth={OUT} />;
    case 'slack':
      return <ellipse cx={2} cy={y + 4} rx={10} ry={7} fill={MOUTH_DARK} stroke={INK} strokeWidth={5} />;
    case 'grin':
      return (
        <g>
          <path d={`M -30 ${y - 8} Q 0 ${y - 4} 30 ${y - 8} Q 26 ${y + 26} 0 ${y + 28} Q -26 ${y + 26} -30 ${y - 8} Z`} fill={MOUTH_DARK} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <path d={`M -24 ${y - 6} Q 0 ${y - 3} 24 ${y - 6} L 22 ${y + 4} Q 0 ${y + 7} -22 ${y + 4} Z`} fill="#fff" />
          <path d={`M -14 ${y + 22} Q 0 ${y + 12} 14 ${y + 22} Q 0 ${y + 28} -14 ${y + 22} Z`} fill="#e8838a" />
        </g>
      );
  }
};

const Brow: React.FC<{cx: number; y: number; tilt: number; side: -1 | 1; color: string}> = ({cx, y, tilt, side, color}) => (
  <line x1={cx + side * 22} y1={y - tilt / 2} x2={cx - side * 22} y2={y + tilt / 2} stroke={color} strokeWidth={12} strokeLinecap="round" />
);

// ---------------------------------------------------------------- hair
function hairBack(L: Look, H: {a: number; b: number; n: number}) {
  const cy = HEAD_CY;
  if (L.hair === 'bunPencil') {
    return (
      <g>
        <circle cx={22} cy={cy - 130} r={50} fill={L.hairColor} stroke={INK} strokeWidth={OUT} />
        <path d={`M -6 ${cy - 158} Q 22 ${cy - 172} 48 ${cy - 152}`} fill="none" stroke={L.hairShine} strokeWidth={6} strokeLinecap="round" />
        <g transform={`rotate(36 36 ${cy - 150})`}>
          <rect x={-42} y={cy - 160} width={110} height={18} fill="#f2c94c" stroke={INK} strokeWidth={5} />
          <rect x={-58} y={cy - 160} width={18} height={18} rx={4} fill="#e88a8a" stroke={INK} strokeWidth={5} />
          <path d={`M 68 ${cy - 160} L 90 ${cy - 151} L 68 ${cy - 142} Z`} fill="#f1d9b5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M 84 ${cy - 153.5} L 90 ${cy - 151} L 84 ${cy - 148.5} Z`} fill={INK} />
        </g>
      </g>
    );
  }
  if (L.hair === 'greyBun') {
    return (
      <g>
        <circle cx={0} cy={cy - H.b - 22} r={38} fill={L.hairColor} stroke={INK} strokeWidth={OUT} />
        <path d={`M -22 ${cy - H.b - 30} Q 0 ${cy - H.b - 46} 22 ${cy - H.b - 30}`} fill="none" stroke={L.hairShine} strokeWidth={5} strokeLinecap="round" />
        <path d={`M -16 ${cy - H.b - 12} Q 0 ${cy - H.b - 22} 16 ${cy - H.b - 12}`} fill="none" stroke={L.hairShine} strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

function hairFront(L: Look, H: {a: number; b: number; n: number}) {
  const cy = HEAD_CY;
  if (L.hair === 'bunPencil') {
    const cap = superellipse(0, cy - 4, H.a + 7, H.b + 9, H.n, 172, 372, 70);
    const d =
      toPath(cap, false) +
      ` Q 112 ${cy - 62} 74 ${cy - 78} Q 40 ${cy - 66} 18 ${cy - 92} Q -20 ${cy - 58} -78 ${cy - 70} Q -112 ${cy - 58} -126 ${cy - 14} Z`;
    return (
      <g>
        <path d={d} fill={L.hairColor} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
        <path d={`M -30 ${cy - 104} Q -62 ${cy - 70} -100 ${cy - 52} Q -74 ${cy - 84} -64 ${cy - 108} Z`} fill={L.hairColor} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    );
  }
  if (L.hair === 'greyBun') {
    const cap = superellipse(0, cy - 2, H.a + 5, H.b + 6, H.n, 170, 370, 70);
    const d = toPath(cap, false) + ` Q 96 ${cy - 76} 0 ${cy - 86} Q -96 ${cy - 76} ${cap[0][0].toFixed(1)} ${cap[0][1].toFixed(1)} Z`;
    return (
      <g>
        <path d={d} fill={L.hairColor} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
        <path d={`M 0 ${cy - 86} Q 3 ${cy - 104} 0 ${cy - H.b - 2}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d={`M -70 ${cy - 96} Q -40 ${cy - 112} -14 ${cy - 106}`} fill="none" stroke={L.hairShine} strokeWidth={5} strokeLinecap="round" />
        <path d={`M 70 ${cy - 96} Q 40 ${cy - 112} 14 ${cy - 106}`} fill="none" stroke={L.hairShine} strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  // curly: a cloud of circles over a cap, merged by drawing all outlines first, then all fills
  const cap = superellipse(0, cy - 4, H.a + 8, H.b + 10, H.n, 168, 372, 70);
  const capD = toPath(cap, false) + ` Q 70 ${cy - 84} 0 ${cy - 94} Q -70 ${cy - 84} ${cap[0][0].toFixed(1)} ${cap[0][1].toFixed(1)} Z`;
  const ring = superellipse(0, cy - 10, H.a + 4, H.b + 10, H.n, 180, 360, 9);
  const blobs: [number, number, number][] = ring.map(([x, y], i) => [x, y, i === 0 || i === ring.length - 1 ? 26 : 34]);
  blobs.push([-40, cy - H.b - 30, 34], [30, cy - H.b - 34, 36], [-4, cy - H.b - 48, 30]);
  // fringe curls along the hairline
  const fringe: [number, number, number][] = [[-72, cy - 90, 18], [-34, cy - 98, 18], [4, cy - 100, 18], [42, cy - 96, 18], [80, cy - 84, 16], [-104, cy - 70, 15], [108, cy - 62, 14]];
  return (
    <g>
      {[...blobs, ...fringe].map(([x, y, r], i) => <circle key={'o' + i} cx={x} cy={y} r={r + OUT / 2} fill={INK} />)}
      <path d={capD} fill={INK} stroke={INK} strokeWidth={OUT * 2} strokeLinejoin="round" />
      <path d={capD} fill={L.hairColor} />
      {[...blobs, ...fringe].map(([x, y, r], i) => <circle key={'f' + i} cx={x} cy={y} r={r - OUT / 2} fill={L.hairColor} />)}
      {[[-60, cy - 122], [10, cy - 140], [70, cy - 112], [-20, cy - 170]].map(([x, y], i) => (
        <path key={'c' + i} d={`M ${x - 10} ${y + 4} Q ${x} ${y - 10} ${x + 10} ${y + 4}`} fill="none" stroke={L.hairShine} strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------- body parts
const Sleeve: React.FC<{p: ReturnType<typeof armPoints>; L: Look}> = ({p, L}) => {
  const d = `M ${p.sx} ${p.sy} L ${p.ex} ${p.ey} L ${p.hx} ${p.hy}`;
  const cx = p.hx - Math.sin(p.ang) * 12;
  const cy = p.hy - Math.cos(p.ang) * 12;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={52} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={L.topColor} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={19} fill={L.topShade} stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Hand: React.FC<{side: -1 | 1; arm: Arm; x: number; y: number; ang: number; skin: string; skinShade: string}> = ({side, arm, x, y, ang, skin, skinShade}) => {
  const deg = (-ang * 180) / Math.PI;
  if (arm.hand === 'phone') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-30} y={-74} width={58} height={98} rx={12} fill="#20232b" stroke={INK} strokeWidth={OUT} />
        <circle cx={-14} cy={-58} r={6} fill="#3a3f4b" />
        <ellipse cx={0} cy={12} rx={24} ry={20} fill={skin} stroke={INK} strokeWidth={OUT} />
        <ellipse cx={22 * -side} cy={-6} rx={9} ry={15} fill={skin} stroke={INK} strokeWidth={OUT} transform={`rotate(${20 * side} ${22 * -side} -6)`} />
      </g>
    );
  }
  if (arm.hand === 'fist') {
    return (
      <g transform={`translate(${x} ${y}) rotate(${deg})`}>
        <ellipse cx={0} cy={14} rx={21} ry={19} fill={skin} stroke={INK} strokeWidth={OUT} />
        <path d="M -12 6 Q 0 0 12 6" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`}>
      <ellipse cx={-13 * side * (arm.hand === 'palm' ? -1 : 1)} cy={10} rx={8} ry={14} fill={skin} stroke={INK} strokeWidth={OUT} transform={`rotate(${-28 * side} ${-13 * side} 10)`} />
      <ellipse cx={0} cy={18} rx={19} ry={23} fill={skin} stroke={INK} strokeWidth={OUT} />
      {arm.hand === 'palm' && <path d="M -8 20 Q 0 26 8 20" fill="none" stroke={skinShade} strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
};

const TORSO = 'M -82 -322 Q -96 -250 -98 -176 Q -98 -156 -80 -154 L 80 -154 Q 98 -156 98 -176 Q 96 -250 82 -322 Q 40 -344 0 -344 Q -40 -344 -82 -322 Z';

function torso(L: Look) {
  const o = {stroke: INK, strokeWidth: OUT, strokeLinejoin: 'round' as const};
  if (L.top === 'hoodie') {
    return (
      <g>
        <path d={TORSO} fill={L.topColor} {...o} />
        <path d="M -97 -180 L 97 -180" stroke={INK} strokeWidth={4} />
        <path d="M -96 -177 L 96 -177 L 96 -158 Q 96 -156 80 -156 L -80 -156 Q -96 -156 -96 -158 Z" fill={L.topShade} />
        <path d="M -50 -246 L 50 -246 L 64 -196 L -64 -196 Z" fill={L.topShade} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    );
  }
  if (L.top === 'shirt') {
    return (
      <g>
        <path d={TORSO} fill={L.topColor} {...o} />
        <path d="M 0 -326 L 0 -158" stroke={L.topShade} strokeWidth={6} />
        {[-296, -258, -220, -184].map((y) => <circle key={y} cx={0} cy={y} r={5.5} fill={L.topAccent} stroke={INK} strokeWidth={2.5} />)}
        <path d="M -70 -290 L -36 -290 L -36 -256 Q -53 -250 -70 -256 Z" fill={L.topShade} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -98 -168 Q 0 -150 98 -168" fill="none" stroke={L.topShade} strokeWidth={5} />
      </g>
    );
  }
  // cardigan over a blouse
  return (
    <g>
      <path d={TORSO} fill={L.topAccent} {...o} />
      <path d="M -82 -322 Q -96 -250 -98 -176 Q -98 -156 -80 -154 L -26 -154 L -18 -336 Q -50 -340 -82 -322 Z" fill={L.topColor} {...o} />
      <path d="M 82 -322 Q 96 -250 98 -176 Q 98 -156 80 -154 L 26 -154 L 18 -336 Q 50 -340 82 -322 Z" fill={L.topColor} {...o} />
      {[-290, -250, -210].map((y) => <circle key={y} cx={-30} cy={y} r={6} fill={L.topShade} stroke={INK} strokeWidth={2.5} />)}
      {[-1, 1].map((s) => <path key={s} d={`M ${s * 44} -214 L ${s * 82} -214 L ${s * 84} -176 L ${s * 42} -176 Z`} fill={L.topShade} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
      <path d="M -97 -168 L -26 -168 M 26 -168 L 97 -168" stroke={L.topShade} strokeWidth={5} />
    </g>
  );
}

function collar(L: Look) {
  if (L.top === 'hoodie') {
    return (
      <g>
        <path d="M -34 -338 Q 0 -300 34 -338" fill={L.topShade} stroke={INK} strokeWidth={5} />
        {[-1, 1].map((s) => (
          <g key={'d' + s}>
            <path d={`M ${s * 18} -322 Q ${s * 22} -290 ${s * 16} -262`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <path d={`M ${s * 18} -322 Q ${s * 22} -290 ${s * 16} -262`} fill="none" stroke={L.topAccent} strokeWidth={5} strokeLinecap="round" />
            <circle cx={s * 16} cy={-258} r={6} fill={L.topAccent} stroke={INK} strokeWidth={3} />
          </g>
        ))}
      </g>
    );
  }
  if (L.top === 'shirt') {
    return (
      <g>
        {[-1, 1].map((s) => <path key={s} d={`M ${s * 2} -332 L ${s * 44} -346 L ${s * 36} -306 Z`} fill={L.topAccent} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      </g>
    );
  }
  return <path d="M -20 -338 Q 0 -324 20 -338" fill="none" stroke={L.topShade} strokeWidth={5} />;
}

const Shoe: React.FC<{x: number; s: 1 | -1; L: Look}> = ({x, s, L}) => (
  <g transform={`translate(${x} 0) scale(${s} 1)`}>
    <path d="M -30 -6 Q -32 -42 0 -44 Q 38 -44 46 -12 L 46 -6 Z" fill={L.shoe} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
    <path d="M -14 -26 Q 8 -32 30 -22" fill="none" stroke={L.shoeStripe} strokeWidth={7} strokeLinecap="round" />
    <rect x={-34} y={-10} width={84} height={12} rx={5} fill={L.sole} stroke={INK} strokeWidth={3} />
  </g>
);

// ---------------------------------------------------------------- the rig
export type PersonProps = {
  look: Look;
  expression?: Expression;
  pose?: Pose;
  idPrefix: string;
  sit?: boolean;
  headOnly?: boolean;
  silhouette?: boolean;
  /** 0..1 mouth openness while speaking (from the voice track); overrides the expression's mouth when > 0.04 */
  talk?: number;
  /** 0..1 extra eyelid closure (blinks, falling asleep); 1 = fully shut */
  blink?: number;
  /** explicit arm angles, e.g. interpolated between two poses */
  arms?: {L: Arm; R: Arm};
  /** 0..1 head drops forward (dozing off); the head slides down toward the chest */
  nod?: number;
};

export const Person: React.FC<PersonProps> = ({look: L, expression = 'neutral', pose = 'rest', idPrefix, sit, headOnly, silhouette, talk = 0, blink = 0, arms, nod = 0}) => {
  const H = L.head ?? DEFAULT_HEAD;
  const f = FACES[expression];
  const P = arms ?? POSES[pose];
  const bw = L.bodyW ?? 1;
  const hip = L.hip ?? 170;
  const dy = sit ? 170 - SEAT_HIP : 170 - hip; // how far the upper body drops
  const shoulderX = 76 * bw;
  const AL = armPoints(-1, P.L, shoulderX);
  const AR = armPoints(1, P.R, shoulderX);
  const cy = HEAD_CY;
  const headPath = toPath(superellipse(0, cy, H.a, H.b, H.n));
  const eyeY = cy + 2;
  const eyeX = 46;
  const browY = cy - 46;
  const lidB = L.lidBase ?? 0;
  const lid = (v: number) => Math.max(Math.min(0.9, v + lidB), blink);
  const browColor = L.browColor ?? L.hairColor;
  const skirt = L.bottomStyle === 'longSkirt';
  const footX = sit ? 44 : 34;
  const skTop = sit ? SEAT_HIP : hip;

  // legs (drawn behind the torso) — feet never move: the floor is y=0
  const legs = skirt ? (
    <g>
      <Shoe x={-footX} s={-1} L={L} />
      <Shoe x={footX} s={1} L={L} />
      <path d={`M -96 ${-skTop - 10} Q -112 -100 -116 -40 Q 0 -30 116 -40 Q 112 -100 96 ${-skTop - 10} Z`} fill={L.bottom} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
      {[-50, 0, 50].map((x) => <path key={x} d={`M ${x * 0.8} ${-skTop + 20} L ${x} -44`} stroke={INK} strokeOpacity={0.35} strokeWidth={4} />)}
      <path d="M -116 -52 Q 0 -42 116 -52" fill="none" stroke="#e0b04a" strokeWidth={8} strokeOpacity={0.9} />
    </g>
  ) : sit ? (
    <g>
      {[-1, 1].map((s) => <path key={s} d={`M ${s * footX} -110 L ${s * footX} -34`} stroke={INK} strokeWidth={54} strokeLinecap="round" />)}
      {[-1, 1].map((s) => <path key={'j' + s} d={`M ${s * footX} -110 L ${s * footX} -34`} stroke={L.bottom} strokeWidth={42} strokeLinecap="round" />)}
      <Shoe x={-footX} s={-1} L={L} />
      <Shoe x={footX} s={1} L={L} />
    </g>
  ) : (
    <g>
      {[-1, 1].map((s) => <path key={s} d={`M ${s * 34} ${-hip} L ${s * 34} -34`} stroke={INK} strokeWidth={54} strokeLinecap="round" />)}
      {[-1, 1].map((s) => <path key={'j' + s} d={`M ${s * 34} ${-hip} L ${s * 34} -34`} stroke={L.bottom} strokeWidth={42} strokeLinecap="round" />)}
      <Shoe x={-34} s={-1} L={L} />
      <Shoe x={34} s={1} L={L} />
    </g>
  );

  // seated knees come toward the camera, in front of the hem
  const knees = sit && !skirt ? (
    <g>
      {[-1, 1].map((s) => <ellipse key={s} cx={s * 46} cy={-128} rx={40} ry={32} fill={L.bottom} stroke={INK} strokeWidth={OUT} />)}
    </g>
  ) : null;

  const head = (
    <g>
      {hairBack(L, H)}
      {[-1, 1].map((s) => (
        <g key={'e' + s}>
          <circle cx={s * (H.a - 2)} cy={cy + 10} r={20} fill={L.skin} stroke={INK} strokeWidth={OUT} />
          {L.earrings && <circle cx={s * (H.a + 2)} cy={cy + 32} r={5} fill={L.earrings} stroke={INK} strokeWidth={3} />}
        </g>
      ))}
      <path d={headPath} fill={L.skin} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
      {L.stubble && (
        <g>
          <clipPath id={`${idPrefix}-jaw`}>
            <path d={headPath} />
          </clipPath>
          <ellipse cx={0} cy={cy + 120} rx={H.a - 6} ry={62} fill={L.hairColor} opacity={0.13} clipPath={`url(#${idPrefix}-jaw)`} />
        </g>
      )}
      {f.glow && <path d={headPath} fill={`url(#${idPrefix}-glow)`} opacity={0.4} />}
      {hairFront(L, H)}
      {f.blush && [-1, 1].map((s) => <ellipse key={'b' + s} cx={s * 74} cy={cy + 46} rx={20} ry={11} fill={L.blush} opacity={0.5} />)}
      <Eye id={`${idPrefix}-el`} cx={-eyeX} cy={eyeY} lid={lid(f.lid[0])} tilt={f.lidTilt[0]} look={f.look} pupil={f.pupil} happy={f.happyEyes && blink < 0.5} skin={L.skin} />
      <Eye id={`${idPrefix}-er`} cx={eyeX} cy={eyeY} lid={lid(f.lid[1])} tilt={f.lidTilt[1]} look={f.look} pupil={f.pupil} happy={f.happyEyes && blink < 0.5} skin={L.skin} />
      {f.bags && [-1, 1].map((s) => (
        <path key={'g' + s} d={`M ${s * eyeX - 18} ${eyeY + 40} Q ${s * eyeX} ${eyeY + 50} ${s * eyeX + 18} ${eyeY + 40}`} fill="none" stroke={L.skinShade} strokeWidth={5} strokeLinecap="round" />
      ))}
      {L.glasses && (
        <g>
          {[-1, 1].map((s) => <circle key={'gl' + s} cx={s * eyeX} cy={eyeY} r={38} fill="#ffffff" fillOpacity={0.1} stroke={INK} strokeWidth={OUT} />)}
          <path d={`M -10 ${eyeY - 6} Q 0 ${eyeY - 14} 10 ${eyeY - 6}`} fill="none" stroke={INK} strokeWidth={OUT} strokeLinecap="round" />
          {[-1, 1].map((s) => <line key={'ga' + s} x1={s * 84} y1={eyeY - 6} x2={s * (H.a - 6)} y2={eyeY - 12} stroke={INK} strokeWidth={OUT} strokeLinecap="round" />)}
        </g>
      )}
      <Brow cx={-eyeX} y={browY + f.brow[0]} tilt={f.brow[1]} side={-1} color={browColor} />
      <Brow cx={eyeX} y={browY + f.brow[2]} tilt={f.brow[3]} side={1} color={browColor} />
      {L.bindi && <circle cx={0} cy={cy - 40} r={6} fill="#c0392b" stroke={INK} strokeWidth={2} />}
      <path d={`M -6 ${cy + 36} Q 2 ${cy + 44} 10 ${cy + 34}`} fill="none" stroke={L.skinShade} strokeWidth={6} strokeLinecap="round" />
      {talk > 0.04 ? (
        <g>
          <ellipse cx={0} cy={cy + 70} rx={15 + talk * 6} ry={5 + talk * 15} fill={MOUTH_DARK} stroke={INK} strokeWidth={OUT} />
          {talk > 0.35 && <ellipse cx={0} cy={cy + 70 + talk * 9} rx={8 + talk * 3} ry={3 + talk * 4} fill="#e8838a" />}
        </g>
      ) : (
        <Mouth kind={f.mouth} y={cy + 68} />
      )}
      {f.sweat && <path d={`M 116 ${cy - 64} Q 104 ${cy - 40} 116 ${cy - 34} Q 128 ${cy - 40} 116 ${cy - 64} Z`} fill="#bfe6ff" stroke={INK} strokeWidth={4} />}
    </g>
  );

  const upper = (
    <g>
      {L.top === 'hoodie' && <path d="M -70 -336 Q -64 -378 0 -380 Q 64 -378 70 -336 Z" fill={L.topShade} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" transform={`scale(${bw} 1)`} />}
      <g transform={`scale(${bw} 1)`}>{torso(L)}</g>
      <rect x={-22} y={-372} width={44} height={40} fill={L.skinShade} stroke={INK} strokeWidth={OUT} />
      {collar(L)}
    </g>
  );

  const content = (
    <g>
      <defs>
        <linearGradient id={`${idPrefix}-glow`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={SCREEN} stopOpacity={0.7} />
          <stop offset="0.45" stopColor={SCREEN} stopOpacity={0} />
        </linearGradient>
      </defs>
      {headOnly ? (
        head
      ) : (
        <g>
          {legs}
          <g transform={`translate(0 ${dy})`}>{upper}</g>
          {knees}
          <g transform={`translate(0 ${dy})`}>
            <g transform={`translate(0 ${nod * 40}) rotate(${nod * 4} 0 -360)`}>{head}</g>
            <Sleeve p={AL} L={L} />
            <Sleeve p={AR} L={L} />
            <Hand side={-1} arm={P.L} x={AL.hx} y={AL.hy} ang={AL.ang} skin={L.skin} skinShade={L.skinShade} />
            <Hand side={1} arm={P.R} x={AR.hx} y={AR.hy} ang={AR.ang} skin={L.skin} skinShade={L.skinShade} />
          </g>
        </g>
      )}
    </g>
  );
  return silhouette ? <g style={{filter: 'brightness(0)'}}>{content}</g> : content;
};

export const Shadow: React.FC<{w?: number; opacity?: number}> = ({w = 130, opacity = 0.22}) => <ellipse cx={0} cy={0} rx={w} ry={16} fill="#000" opacity={opacity} />;
