import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import {Person, Shadow, SCREEN, PersonProps} from '../kit/Person';
import {MIKA, DEV, AAJI} from '../cast';
import {bedroomLayout, BedroomBack, BedroomFront} from '../sets/Bedroom';

const OUT = process.argv[2];
const FONT = 'file://' + path.resolve('public/fonts/Baloo2-Variable.ttf');
const css = `@font-face{font-family:Baloo;src:url('${FONT}');font-weight:400 800}*{margin:0;padding:0}`;

type Placed = PersonProps & {x: number; glow?: boolean};

const Clock: React.FC<{W: number; s: number}> = ({W, s}) => (
  <g transform={`translate(${W - 40 * s - 250 * s} ${40 * s}) scale(${s})`}>
    <rect width={250} height={84} rx={22} fill="#1e2140" />
    <text x={125} y={57} textAnchor="middle" fontFamily="Baloo" fontWeight={700} fontSize={44} fill="#a9c8ff">11:15 PM</text>
  </g>
);

function scene(W: number, H: number, id: string, cast: Placed[]) {
  const L = bedroomLayout(W, H);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={id + 'scr'}>
          <stop offset="0" stopColor={SCREEN} stopOpacity={0.35} />
          <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${W / 2} ${L.feetY}) scale(${L.u})`}>
        <BedroomBack L={L} id={id} />
        {cast.map((c, i) => (
          <g key={i} transform={`translate(${c.x} 0)`}>
            {c.glow && <circle cx={-40} cy={-300} r={260} fill={`url(#${id}scr)`} />}
            <Shadow w={c.sit ? 110 : 130} opacity={0.3} />
            <Person {...c} />
          </g>
        ))}
      </g>
      <BedroomFront L={L} id={id} />
      <Clock W={W} s={W > H ? 0.9 : 1} />
    </svg>
  );
}

const page = (W: number, H: number, el: React.ReactElement) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="width:${W}px;height:${H}px">${renderToStaticMarkup(el)}</body></html>`;

fs.writeFileSync(path.join(OUT, 'bedroom-916.html'), page(1080, 1920, scene(1080, 1920, 'p', [
  {look: MIKA, idPrefix: 'pm', x: -20, sit: true, pose: 'phone', expression: 'scrollZombie', glow: true},
])));
fs.writeFileSync(path.join(OUT, 'bedroom-169.html'), page(1920, 1080, scene(1920, 1080, 'w', [
  {look: DEV, idPrefix: 'wd', x: -990, pose: 'shrug', expression: 'sideEye'},
  {look: MIKA, idPrefix: 'wm', x: 60, sit: true, pose: 'phone', expression: 'guilty', glow: true},
  {look: AAJI, idPrefix: 'wa', x: 720, pose: 'think', expression: 'curious'},
])));
fs.writeFileSync(path.join(OUT, 'bedroom-empty-916.html'), page(1080, 1920, scene(1080, 1920, 'e', [])));
console.log('ok');
