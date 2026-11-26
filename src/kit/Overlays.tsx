import React, {useState} from 'react';
import {continueRender, delayRender, spring, staticFile, useVideoConfig} from 'remotion';
import {INK} from './Person';

// Channel overlays for Shorts: hook headline card, dialogue caption bar, fact pop-up, clock chip.
// All on-screen text is composited here (never generated). Layout keeps clear of the Shorts UI:
// nothing below y = H - 430 and no faces/text in the right 150 px except the top bar area.

const FONTS: [string, string][] = [
  ['Bangers', 'fonts/Bangers.woff2'],
  ['Baloo', 'fonts/Baloo2-Variable.ttf'],
  ['InterBlack', 'fonts/InterDisplay-Black.otf'],
  ['InterXB', 'fonts/InterDisplay-ExtraBold.otf'],
  ['InterSB', 'fonts/InterDisplay-SemiBold.otf'],
];
let loaded = false;
export const useChannelFonts = () => {
  const [handle] = useState(() => (loaded ? null : delayRender('fonts')));
  if (handle !== null && !loaded) {
    loaded = true;
    Promise.all(
      FONTS.map(([name, file]) => {
        const f = new FontFace(name, `url(${staticFile(file)})`, name === 'Baloo' ? {weight: '400 800'} : {});
        return f.load().then((ff) => document.fonts.add(ff));
      }),
    ).then(() => continueRender(handle));
  }
};

export const CREAM = '#fffaf0';
export const MUSTARD = '#e8a93a';
const ORANGE = '#e8735a';

export const HookCard: React.FC<{lines: string[]; appear: number}> = ({lines, appear}) => (
  <div
    style={{
      position: 'absolute', top: 96, left: 70, right: 70,
      background: CREAM, border: `7px solid ${INK}`, borderRadius: 22, boxShadow: `10px 10px 0 ${INK}`,
      padding: '18px 24px 10px', textAlign: 'center',
      transform: `rotate(-1.5deg) scale(${0.6 + 0.4 * appear})`, opacity: appear,
    }}
  >
    {lines.map((l) => (
      <div key={l} style={{fontFamily: 'Bangers', fontSize: 118, lineHeight: 1.02, color: INK, letterSpacing: 2}}>{l}</div>
    ))}
  </div>
);

export const Caption: React.FC<{text: string; highlight?: string}> = ({text, highlight}) => (
  <div style={{position: 'absolute', left: 60, right: 60, bottom: 450, display: 'flex', justifyContent: 'center'}}>
    <div
      style={{
        background: 'rgba(22,25,38,0.92)', borderRadius: 26, padding: '16px 30px', maxWidth: 900,
        fontFamily: 'Baloo', fontWeight: 700, fontSize: 48, lineHeight: 1.3, color: '#fff', textAlign: 'center',
        border: `4px solid ${INK}`,
      }}
    >
      {text.split(' ').map((w, i) => (
        <span key={i}>
          {w === highlight ? <span style={{background: ORANGE, borderRadius: 10, padding: '0 10px', color: '#fff'}}>{w}</span> : w}{' '}
        </span>
      ))}
    </div>
  </div>
);

export const FactCard: React.FC<{frame: number; title: string; body: string; source: string; accent?: string}> = ({frame, title, body, source, accent = MUSTARD}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 170}});
  return (
    <div style={{position: 'absolute', left: 64, right: 64, bottom: 452, transform: `scale(${0.5 + 0.5 * s}) rotate(${1.2 - 1.2 * s}deg)`, opacity: Math.min(1, s * 1.5)}}>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 30, boxShadow: `10px 10px 0 ${INK}`, overflow: 'hidden'}}>
        <div style={{background: accent, borderBottom: `6px solid ${INK}`, padding: '14px 28px 6px', fontFamily: 'Bangers', fontSize: 72, letterSpacing: 2, color: INK}}>
          {title}
        </div>
        <div style={{padding: '18px 30px 8px', fontFamily: 'Baloo', fontWeight: 700, fontSize: 50, lineHeight: 1.22, color: INK}}>{body}</div>
        <div style={{padding: '0 30px 18px', fontFamily: 'Baloo', fontWeight: 500, fontSize: 28, color: INK, opacity: 0.6}}>{source}</div>
      </div>
    </div>
  );
};

export const ClockChip: React.FC<{text: string; flip: number; top: number}> = ({text, flip, top}) => (
  <div
    style={{
      position: 'absolute', right: 56, top, background: '#1e2140', borderRadius: 22, padding: '10px 26px 4px',
      fontFamily: 'Baloo', fontWeight: 700, fontSize: 46, color: '#a9c8ff', transform: `scaleY(${Math.max(0.05, flip)})`,
      border: '3px solid #0f1226',
    }}
  >
    {text}
  </div>
);

// Small time-jump tag ("3 HOURS EARLIER", "NEXT NIGHT"), pops in under the hook card.
export const Sticker: React.FC<{frame: number; text: string}> = ({frame, text}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 200}});
  return (
    <div style={{position: 'absolute', left: 70, top: 470, transform: `rotate(-4deg) scale(${s})`, transformOrigin: 'left center'}}>
      <div style={{background: MUSTARD, border: `6px solid ${INK}`, borderRadius: 16, boxShadow: `6px 6px 0 ${INK}`, padding: '8px 22px 2px', fontFamily: 'Bangers', fontSize: 64, letterSpacing: 2, color: INK}}>
        {text}
      </div>
    </div>
  );
};
