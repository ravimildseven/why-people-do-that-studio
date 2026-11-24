import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import {Person, Shadow, INK, Expression, Pose} from '../kit/Person';
import {MIKA as LOOK} from '../cast';
const MIKA = {skin: LOOK.skin, hair: LOOK.hairColor, hoodie: LOOK.topColor, hoodieShade: LOOK.topShade, jeans: LOOK.bottom, shoeStripe: LOOK.shoeStripe, pencil: '#f2c94c'};

const OUTDIR = process.argv[2];
const FONT = 'file://' + path.resolve('public/fonts/Baloo2-Variable.ttf');

const css = `
@font-face{font-family:Baloo;src:url('${FONT}');font-weight:400 800}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Baloo,sans-serif;color:${INK}}
`;

const page = (w: number, h: number, body: React.ReactNode) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="width:${w}px;height:${h}px">` +
  renderToStaticMarkup(<>{body}</>) +
  `</body></html>`;

// ---------- 1. Character sheet ----------
const EXPR: [Expression, string][] = [
  ['neutral', 'neutral'],
  ['curious', 'curious — "why?"'],
  ['tired', 'tired'],
  ['sideEye', 'side-eye'],
  ['guilty', 'guilty'],
  ['shocked', 'shocked'],
  ['happy', 'happy'],
  ['scrollZombie', 'doom-scroll'],
];
const POSES: [Pose, Expression, string][] = [
  ['phone', 'scrollZombie', 'phone'],
  ['shrug', 'sideEye', 'shrug'],
  ['think', 'curious', 'think'],
  ['wave', 'happy', 'wave'],
];

const SW: [string, string][] = [
  ['skin', MIKA.skin],
  ['hair', MIKA.hair],
  ['hoodie', MIKA.hoodie],
  ['hoodie shade', MIKA.hoodieShade],
  ['jeans', MIKA.jeans],
  ['accent', MIKA.shoeStripe],
  ['pencil', MIKA.pencil],
  ['ink', INK],
];

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: '#fffaf0', border: `4px solid ${INK}`, borderRadius: 28, ...style}}>{children}</div>
);

const sheet = (
  <div style={{width: 2400, height: 1500, background: '#2e3547', padding: 40, display: 'flex', gap: 36}}>
    <Card style={{width: 720, height: 1420, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 36, left: 44}}>
        <div style={{fontSize: 96, fontWeight: 800, lineHeight: 1}}>Mika</div>
        <div style={{fontSize: 30, fontWeight: 600, opacity: 0.75, marginTop: 8}}>Why People Do That · character v1</div>
      </div>
      <svg viewBox="-260 -700 520 760" style={{position: 'absolute', left: 30, top: 230, width: 660, height: 965}}>
        <Shadow />
        <Person look={LOOK} idPrefix="hero" pose="rest" expression="neutral" />
      </svg>
      <div style={{position: 'absolute', bottom: 34, left: 44, right: 44, display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {SW.map(([n, c]) => (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 600}}>
            <div style={{width: 34, height: 34, borderRadius: 10, background: c, border: `3px solid ${INK}`}} />
            {n} <span style={{opacity: 0.55, fontWeight: 500}}>{c}</span>
          </div>
        ))}
      </div>
    </Card>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 36}}>
      <Card style={{height: 724, padding: 26}}>
        <div style={{fontSize: 40, fontWeight: 800, marginBottom: 6}}>Expressions</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10}}>
          {EXPR.map(([e, label]) => (
            <div key={e} style={{textAlign: 'center'}}>
              <svg viewBox="-170 -680 340 360" style={{width: 290, height: 258}}>
                <Person look={LOOK} idPrefix={'x' + e} expression={e} headOnly />
              </svg>
              <div style={{fontSize: 26, fontWeight: 700, marginTop: -6}}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{flex: 1, padding: 26}}>
        <div style={{fontSize: 40, fontWeight: 800, marginBottom: 0}}>Poses</div>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
          {POSES.map(([p, e, label]) => (
            <div key={p} style={{textAlign: 'center'}}>
              <svg viewBox="-250 -700 500 740" style={{width: 330, height: 488}}>
                <Shadow />
                <Person look={LOOK} idPrefix={'p' + p} pose={p} expression={e} />
              </svg>
              <div style={{fontSize: 26, fontWeight: 700}}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);
fs.writeFileSync(path.join(OUTDIR, 'mika-sheet.html'), page(2400, 1500, sheet));
console.log('wrote mika-sheet.html');
