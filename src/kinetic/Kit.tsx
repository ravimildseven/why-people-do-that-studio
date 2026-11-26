import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {K, SAFE} from './Design';
import {Person, Expression, INK} from '../kit/Person';
import {MIKA} from '../cast';

// Animated building blocks for the POV + kinetic-type format (shared by every Short).
// Pop / Line / Tag / Stack / Spoken / SourceLine: type that lands on the narration.
// MikaHead / Badge / blinkAt: Mika as close-ups and reaction badges.

export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- animated type
export const Pop: React.FC<{from: number; children: React.ReactNode; style?: React.CSSProperties; still?: boolean}> = ({from, children, style, still}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = still ? 1 : spring({frame: f - from, fps, config: {damping: 13, stiffness: 220}});
  return <div style={{...style, opacity: f < from && !still ? 0 : 1, transform: `${style?.transform ?? ''} scale(${0.6 + 0.4 * s})`, transformOrigin: 'left center'}}>{children}</div>;
};

export const Line: React.FC<{text: string; size: number; color?: string; block?: string; from: number; still?: boolean}> = ({text, size, color = K.cream, block, from, still}) => (
  <Pop from={from} still={still} style={{fontFamily: 'InterBlack', fontSize: size, lineHeight: 0.98, letterSpacing: -2, textTransform: 'uppercase', color: block ? K.ink : color, margin: block ? '12px 0' : 0}}>
    {block ? <span style={{background: block, padding: '2px 18px 0', borderRadius: 12, display: 'inline-block', transform: 'rotate(-1.5deg)'}}>{text}</span> : text}
  </Pop>
);

export const Tag: React.FC<{text: string; color: string; from: number; top?: number; still?: boolean}> = ({text, color, from, top = 150, still}) => (
  <Pop from={from} still={still} style={{position: 'absolute', left: SAFE.left, top, background: color, color: K.ink, fontFamily: 'InterXB', fontSize: 36, letterSpacing: 3, padding: '12px 22px 10px', borderRadius: 14, textTransform: 'uppercase'}}>
    {text}
  </Pop>
);

export const Stack: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left}}>{children}</div>
);

// words revealed as they are spoken
export const Spoken: React.FC<{text: string; from: number; to: number; top: number; size?: number}> = ({text, from, to, top, size = 50}) => {
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

export const SourceLine: React.FC<{text: string; top: number; from: number}> = ({text, top, from}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', left: SAFE.left, top, width: SAFE.right - SAFE.left, fontFamily: 'InterSB', fontSize: 27, color: K.mute, opacity: interpolate(f, [from, from + 8], [0, 1], clamp)}}>{text}</div>;
};

// ---------- Mika cut-outs
export const MikaHead: React.FC<{x: number; y: number; s: number; e: Expression; id: string; blink?: number}> = ({x, y, s, e, id, blink = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(0 468)`}>
    <Person look={MIKA} idPrefix={id} expression={e} headOnly blink={blink} />
  </g>
);
export const blinkAt = (f: number) => {
  const c = f % 84;
  return c >= 80 ? [0.6, 1, 1, 0.5][c - 80] : 0;
};
export const Badge: React.FC<{cx: number; cy: number; r: number; e: Expression; id: string; from: number; bg?: string}> = ({cx, cy, r, e, id, from, bg = '#f3d9a4'}) => {
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


// frame at which a phrase is spoken, estimated by its character position inside a narration line
export const phraseFrame = (text: string, start: number, frames: number, phrase: string) => {
  const i = text.indexOf(phrase);
  return start + Math.round((Math.max(0, i) / text.length) * frames);
};
