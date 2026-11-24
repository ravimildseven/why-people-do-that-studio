import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import {Person, Shadow, INK, Expression, Pose} from '../kit/Person';
import {CAST} from '../cast';
const OUT = process.argv[2];
const FONT = 'file://' + path.resolve('public/fonts/Baloo2-Variable.ttf');
const css = `@font-face{font-family:Baloo;src:url('${FONT}');font-weight:400 800}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Baloo,sans-serif;color:${INK}}`;
const EX: Expression[] = ['neutral', 'curious', 'tired', 'sideEye', 'guilty', 'shocked', 'happy', 'scrollZombie'];
const POSE: Record<string, [Pose, Expression]> = {Mika: ['phone', 'scrollZombie'], Dev: ['shrug', 'sideEye'], Aaji: ['think', 'curious']};
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="width:2400px;height:1500px;background:#2e3547;padding:40px">` +
  renderToStaticMarkup(
    <div style={{display: 'flex', flexDirection: 'column', gap: 30, height: '100%'}}>
      <div style={{background: '#fffaf0', border: `4px solid ${INK}`, borderRadius: 28, padding: '20px 36px', display: 'flex', alignItems: 'flex-end', gap: 30, height: 700}}>
        <div style={{width: 300, flexShrink: 0}}>
          <div style={{fontSize: 72, fontWeight: 800, lineHeight: 1}}>The cast</div>
          <div style={{fontSize: 28, fontWeight: 600, opacity: 0.7, marginTop: 10}}>one rig, one ink, one set of eyes.<br />Shown at true relative height.</div>
        </div>
        {CAST.map((c) => (
          <div key={c.name} style={{textAlign: 'center'}}>
            <svg viewBox="-260 -720 520 760" style={{width: 380, height: 556}}>
              <Shadow />
              <Person look={c} idPrefix={'h' + c.name} />
            </svg>
            <div style={{fontSize: 36, fontWeight: 800}}>{c.name}</div>
          </div>
        ))}
        {CAST.map((c) => (
          <div key={'p' + c.name} style={{textAlign: 'center'}}>
            <svg viewBox="-260 -720 520 760" style={{width: 230, height: 336}}>
              <Shadow />
              <Person look={c} idPrefix={'q' + c.name} pose={POSE[c.name][0]} expression={POSE[c.name][1]} />
            </svg>
          </div>
        ))}
      </div>
      <div style={{background: '#fffaf0', border: `4px solid ${INK}`, borderRadius: 28, padding: '16px 30px', flex: 1}}>
        {CAST.map((c) => (
          <div key={'r' + c.name} style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{width: 130, fontSize: 32, fontWeight: 800}}>{c.name}</div>
            {EX.map((e) => (
              <svg key={e} viewBox="-175 -690 350 370" style={{width: 230, height: 205}}>
                <Person look={c} idPrefix={'x' + c.name + e} expression={e} headOnly />
              </svg>
            ))}
          </div>
        ))}
      </div>
    </div>,
  ) + `</body></html>`;
fs.writeFileSync(path.join(OUT, 'cast.html'), html);
console.log('ok');
