import React from 'react';
import {Easing, interpolate} from 'remotion';
import {INK, SCREEN, Look} from './Person';

// Close-up insert: both hands holding a phone while the feed scrolls (a touch ripple shows the swipe).
// The feed is abstract shapes only (no text, no logos, no real apps). Laid out from width/height.

const TILE_COLORS = ['#e8735a', '#5b7a8a', '#c9a76a', '#7a4f78', '#3f8f86', '#a9805a', '#6a7eab'];

export const PhoneInsert: React.FC<{frame: number; W: number; H: number; look: Look; flickEvery?: number}> = ({frame, W, H, look, flickEvery = 14}) => {
  // phone sits between the hook card (top ~24% of the frame) and the Shorts caption zone (bottom 22%)
  const ph = H * 0.52;
  const pw = ph / 1.95;
  const px = W / 2 - pw / 2;
  const py = H * 0.51 - ph / 2;
  const pad = pw * 0.06;
  const sx = px + pad;
  const sy = py + pad * 1.6;
  const sw = pw - pad * 2;
  const sh = ph - pad * 3.2;
  const tileH = sw * 0.92;

  // each flick scrolls one tile, eased; the thumb moves up during a flick
  const n = Math.floor(frame / flickEvery);
  const t = (frame % flickEvery) / flickEvery;
  const e = Easing.out(Easing.cubic)(Math.min(1, t * 1.6));
  const scroll = (n + e) * tileH;
  const thumbLift = interpolate(t, [0, 0.35, 0.7, 1], [0, 1, 0.2, 0]);

  const tiles = [];
  const first = Math.floor(scroll / tileH) - 1;
  for (let i = first; i < first + 5; i++) {
    const y = sy + i * tileH - scroll;
    const c = TILE_COLORS[((i % TILE_COLORS.length) + TILE_COLORS.length) % TILE_COLORS.length];
    tiles.push(
      <g key={i}>
        <circle cx={sx + 34} cy={y + 34} r={20} fill={TILE_COLORS[(i + 3 + 70) % TILE_COLORS.length]} stroke={INK} strokeWidth={3} />
        <rect x={sx + 66} y={y + 24} width={sw * 0.42} height={9} rx={4} fill="#c9ccd8" opacity={0.55} />
        <rect x={sx + 12} y={y + 66} width={sw - 24} height={tileH - 150} rx={18} fill={c} stroke={INK} strokeWidth={4} />
        <circle cx={sx + sw * 0.72} cy={y + 66 + (tileH - 150) * 0.32} r={sw * 0.08} fill="#fff4dc" opacity={0.7} />
        <path d={`M ${sx + 12} ${y + tileH - 84} L ${sx + sw * 0.4} ${y + 120} L ${sx + sw * 0.62} ${y + tileH - 150} L ${sx + sw * 0.78} ${y + tileH - 200} L ${sx + sw - 12} ${y + tileH - 84} Z`} fill={INK} opacity={0.18} />
        {/* heart + share shapes, no text */}
        <path d={`M ${sx + 34} ${y + tileH - 50} c -14 -14 -30 4 0 22 c 30 -18 14 -36 0 -22 Z`} fill="#e8735a" stroke={INK} strokeWidth={3} />
        <circle cx={sx + 84} cy={y + tileH - 40} r={10} fill="none" stroke="#c9ccd8" strokeWidth={4} />
        <rect x={sx + 116} y={y + tileH - 46} width={sw * 0.3} height={9} rx={4} fill="#c9ccd8" opacity={0.4} />
      </g>,
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <radialGradient id="pi-glow">
          <stop offset="0" stopColor={SCREEN} stopOpacity={0.55} />
          <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
        </radialGradient>
        <clipPath id="pi-screen">
          <rect x={sx} y={sy} width={sw} height={sh} rx={26} />
        </clipPath>
      </defs>
      {/* dark bedroom behind the phone, fairy lights out of focus */}
      <rect width={W} height={H} fill="#2a3150" />
      {[0.12, 0.3, 0.55, 0.78, 0.92].map((fx, i) => (
        <circle key={i} cx={W * fx} cy={H * (0.08 + (i % 2) * 0.05)} r={W * 0.06} fill="#ffe4a3" opacity={0.18} />
      ))}
      <circle cx={W / 2} cy={H * 0.51} r={W * 0.75} fill="url(#pi-glow)" />
      {/* phone */}
      <rect x={px} y={py} width={pw} height={ph} rx={60} fill="#20232b" stroke={INK} strokeWidth={10} />
      <rect x={sx} y={sy} width={sw} height={sh} rx={26} fill="#151826" />
      <g clipPath="url(#pi-screen)">{tiles}</g>
      <rect x={W / 2 - 50} y={py + pad * 0.6} width={100} height={18} rx={9} fill="#0e1018" />
      {/* touch ripple where the (unseen) finger swipes up the screen */}
      <circle cx={W / 2 + sw * 0.12} cy={sy + sh * 0.72 - thumbLift * sh * 0.22} r={18 + thumbLift * 26} fill="none" stroke="#ffffff" strokeOpacity={0.55 * thumbLift} strokeWidth={6} />
      {/* both hands grip the lower sides of the phone; sleeves run out of frame */}
      {[-1, 1].map((side) => {
        const hx = side < 0 ? px + pw * 0.02 : px + pw * 0.98;
        const hy = py + ph * 0.8;
        return (
          <g key={side}>
            <path d={`M ${hx} ${hy + 40} L ${W / 2 + side * W * 0.62} ${H * 1.05}`} stroke={INK} strokeWidth={pw * 0.36 + 16} strokeLinecap="round" />
            <path d={`M ${hx} ${hy + 40} L ${W / 2 + side * W * 0.62} ${H * 1.05}`} stroke={look.topColor} strokeWidth={pw * 0.36} strokeLinecap="round" />
            <ellipse cx={hx} cy={hy} rx={pw * 0.17} ry={pw * 0.22} fill={look.skin} stroke={INK} strokeWidth={8} />
          </g>
        );
      })}
    </svg>
  );
};
