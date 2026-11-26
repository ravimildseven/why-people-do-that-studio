import React from 'react';

// "POV + kinetic type" design system for Why People Do That Shorts.
// The viewer is the character; big words carry the story; graphics show the numbers.
// 1080×1920. Text lives inside x 64..930 (right ~150 px kept clear) and above y 1490 (Shorts UI below).

export const K = {
  night1: '#10122a',
  night2: '#1b2045',
  night3: '#2a3166',
  coral: '#ff6b5b',
  blue: '#7cc8ff',
  yellow: '#ffd166',
  cream: '#f6f1e7',
  mute: '#9aa1d6',
  ink: '#0b0d1f',
};
export const SAFE = {left: 64, right: 930, bottom: 1490};

export const Background: React.FC<{glow?: {x: number; y: number; r: number; color: string; o: number}}> = ({glow}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="kbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={K.night1} />
        <stop offset="1" stopColor={K.night2} />
      </linearGradient>
      <radialGradient id="kglow">
        <stop offset="0" stopColor={glow?.color ?? K.blue} stopOpacity={glow?.o ?? 0} />
        <stop offset="1" stopColor={glow?.color ?? K.blue} stopOpacity={0} />
      </radialGradient>
      <filter id="kgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
      </filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#kbg)" />
    {glow && <circle cx={glow.x} cy={glow.y} r={glow.r} fill="url(#kglow)" />}
    <rect width={1080} height={1920} filter="url(#kgrain)" />
  </svg>
);

export const Tag: React.FC<{text: string; color?: string; top: number}> = ({text, color = K.yellow, top}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, display: 'inline-block', background: color, color: K.ink, fontFamily: 'InterXB', fontSize: 36, letterSpacing: 3, padding: '12px 22px 10px', borderRadius: 14, textTransform: 'uppercase'}}>
    {text}
  </div>
);

// A stack of hero lines. A line can be highlighted (word on a coloured block).
export type HeroLine = {text: string; size: number; color?: string; block?: string};
export const Hero: React.FC<{lines: HeroLine[]; top: number}> = ({lines, top}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left}}>
    {lines.map((l, i) => (
      <div key={i} style={{fontFamily: 'InterBlack', fontSize: l.size, lineHeight: 0.98, letterSpacing: -2, textTransform: 'uppercase', color: l.block ? K.ink : l.color ?? K.cream, marginTop: l.block ? 14 : 0, marginBottom: l.block ? 14 : 0}}>
        {l.block ? (
          <span style={{background: l.block, padding: '2px 18px 0', borderRadius: 12, display: 'inline-block', transform: 'rotate(-1.5deg)'}}>{l.text}</span>
        ) : (
          l.text
        )}
      </div>
    ))}
  </div>
);

export const Body: React.FC<{text: string; top: number; size?: number; color?: string}> = ({text, top, size = 50, color = K.cream}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left, fontFamily: 'InterSB', fontSize: size, lineHeight: 1.22, color}}>{text}</div>
);

export const Source: React.FC<{text: string; top: number}> = ({text, top}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left, fontFamily: 'InterSB', fontSize: 27, color: K.mute, letterSpacing: 0.5}}>{text}</div>
);
