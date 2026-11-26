import React from 'react';
import {INK, SEAT_HIP} from '../kit/Person';

// Night bedroom set, house style: flat colours, ink outlines, low-saturation night palette,
// warm lamp + cool moon. No text anywhere in the set.
// Coordinates are "character units": origin = the floor point where a character's feet stand,
// y up is negative, 1 unit = 1 unit of the character rig. The layout adapts to 9:16 or 16:9.

export const NIGHT = {
  wallTop: '#36405f',
  wallBottom: '#48537a',
  wallDot: '#525d86',
  skirting: '#2c3350',
  floor: '#5f5464',
  floorLine: '#4e4454',
  wood: '#6b5248',
  woodDark: '#563f37',
  headboard: '#5a4640',
  headPad: '#6e5a52',
  duvet: '#5b6e9a',
  duvetTop: '#6a7eab',
  duvetShade: '#4b5c85',
  sheet: '#cfc8ba',
  pillow: '#d9d2c3',
  curtain: '#5d4b6b',
  curtainShade: '#4a3b57',
  skyTop: '#1f2747',
  skyBottom: '#3a4680',
  city: '#12162a',
  moon: '#efefe7',
  lit: '#f5c65a',
  lamp: '#f5c65a',
  lampGlow: '#ffc46b',
  leaf: '#4f7a5a',
  leafDark: '#3c6048',
  pot: '#a85a42',
  rugA: '#7a4e52',
  rugB: '#a9805a',
  fairy: '#ffe4a3',
};

export type BedroomLayout = {
  W: number;
  H: number;
  wide: boolean;
  u: number; // px per unit
  feetY: number; // px, floor line where characters stand
  hx: number; // half width in units
  top: number; // top edge in units (negative)
  bottom: number; // bottom edge in units
  bedX: number;
  bedW: number;
  seatY: number;
  nsX: number;
  winX: number;
  winW: number;
  shelfX: number;
  plantX: number;
};

export function bedroomLayout(W: number, H: number): BedroomLayout {
  const wide = W > H;
  const u = wide ? H / 1400 : W / 1080;
  const feetY = wide ? H * 0.86 : H * 0.69;
  const hx = W / 2 / u;
  return {
    W, H, wide, u, feetY, hx,
    top: -feetY / u,
    bottom: (H - feetY) / u,
    bedX: wide ? 120 : 60,
    bedW: wide ? 760 : 660,
    seatY: -SEAT_HIP,
    nsX: wide ? -430 : -400,
    winX: wide ? -540 : -255,
    winW: wide ? 380 : 290,
    shelfX: wide ? 640 : 280,
    plantX: wide ? 1020 : 455,
  };
}

const o = (w = 6) => ({stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const});
const WALL_BASE = -70;

const Window: React.FC<{L: BedroomLayout; id: string; morning: number}> = ({L, id, morning}) => {
  const x0 = L.winX - L.winW / 2;
  const x1 = L.winX + L.winW / 2;
  const y0 = L.wide ? -1080 : -1060;
  const y1 = L.wide ? -660 : -700;
  const w = x1 - x0;
  const hgt = y1 - y0;
  const buildings: [number, number, number][] = [
    [0.0, 0.22, 0.24], [0.2, 0.15, 0.36], [0.33, 0.2, 0.18], [0.52, 0.14, 0.3], [0.64, 0.2, 0.22], [0.83, 0.18, 0.34],
  ];
  return (
    <g>
      <defs>
        <linearGradient id={id + 'sky'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={NIGHT.skyTop} />
          <stop offset="1" stopColor={NIGHT.skyBottom} />
        </linearGradient>
        <linearGradient id={id + 'dawn'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc4ea" />
          <stop offset="1" stopColor="#ffd2a1" />
        </linearGradient>
        <clipPath id={id + 'win'}>
          <rect x={x0} y={y0} width={w} height={hgt} />
        </clipPath>
      </defs>
      <rect x={x0} y={y0} width={w} height={hgt} fill={`url(#${id}sky)`} />
      <g clipPath={`url(#${id}win)`}>
        {[[0.12, 0.12], [0.3, 0.28], [0.18, 0.45], [0.55, 0.1], [0.45, 0.36], [0.9, 0.3], [0.7, 0.5]].map(([fx, fy], i) => (
          <circle key={i} cx={x0 + fx * w} cy={y0 + fy * hgt} r={i % 2 ? 3 : 4.5} fill={NIGHT.moon} opacity={0.85} />
        ))}
        <circle cx={x0 + w * 0.74} cy={y0 + hgt * 0.22} r={70} fill={NIGHT.moon} opacity={0.1} />
        <circle cx={x0 + w * 0.74} cy={y0 + hgt * 0.22} r={36} fill={NIGHT.moon} />
        <circle cx={x0 + w * 0.74 + 16} cy={y0 + hgt * 0.22 - 8} r={32} fill={NIGHT.skyTop} />
        {morning > 0 && (
          <g opacity={morning}>
            <rect x={x0} y={y0} width={w} height={hgt} fill={`url(#${id}dawn)`} />
            <circle cx={x0 + w * 0.3} cy={y1 - hgt * 0.18} r={34} fill="#ffe08a" />
          </g>
        )}
        {buildings.map(([fx, fw, fh], i) => {
          const bx = x0 + fx * w;
          const bw = fw * w;
          const bh = fh * hgt;
          return (
            <g key={i}>
              <rect x={bx} y={y1 - bh} width={bw} height={bh} fill={NIGHT.city} />
              {[0, 1, 2].map((r) =>
                [0, 1].map((c) =>
                  (i + r + c) % 3 === 0 ? <rect key={r + '-' + c} x={bx + bw * (0.22 + c * 0.38)} y={y1 - bh + 14 + r * 26} width={bw * 0.2} height={12} fill={NIGHT.lit} opacity={0.85} /> : null,
                ),
              )}
            </g>
          );
        })}
      </g>
      {/* frame + mullions */}
      <rect x={x0} y={y0} width={w} height={hgt} fill="none" {...o(14)} />
      <rect x={x0} y={y0} width={w} height={hgt} fill="none" stroke="#8d8777" strokeWidth={6} />
      <line x1={L.winX} y1={y0} x2={L.winX} y2={y1} {...o(12)} />
      <line x1={x0} y1={(y0 + y1) / 2} x2={x1} y2={(y0 + y1) / 2} {...o(12)} />
      {/* sill */}
      <rect x={x0 - 30} y={y1} width={w + 60} height={22} rx={6} fill="#7d7566" {...o(5)} />
      {/* small cactus on the sill */}
      <g transform={`translate(${x0 + 46} ${y1})`}>
        <path d="M -6 -40 Q -6 -66 6 -66 Q 18 -66 18 -40 Z" fill={NIGHT.leaf} {...o(4)} />
        <path d="M -18 0 L -14 -30 L 30 -30 L 34 0 Z" fill={NIGHT.pot} {...o(4)} />
      </g>
      {/* curtains */}
      {[-1, 1].map((s) => {
        const ex = s < 0 ? x0 - 20 : x1 + 20; // outer edge
        const inner = s < 0 ? x0 + 70 : x1 - 70;
        const tieY = y0 + hgt * 0.62;
        const bot = y1 + 40;
        const d = `M ${ex - s * 60} ${y0 - 40} L ${inner} ${y0 - 40} Q ${inner - s * 10} ${tieY - 80} ${ex + s * 6} ${tieY} Q ${inner - s * 30} ${tieY + 90} ${inner - s * 10} ${bot} L ${ex - s * 70} ${bot} Q ${ex - s * 60} ${tieY} ${ex - s * 60} ${y0 - 40} Z`;
        return (
          <g key={s}>
            <path d={d} fill={NIGHT.curtain} {...o(6)} />
            {[0.3, 0.6].map((f) => (
              <path key={f} d={`M ${ex - s * 60 + (inner - (ex - s * 60)) * f} ${y0 - 34} Q ${ex - s * 30} ${tieY - 30} ${ex + s * 2} ${tieY} Q ${ex - s * 40} ${tieY + 60} ${ex - s * 60 + (inner - s * 10 - (ex - s * 60)) * f} ${bot - 6}`} fill="none" stroke={NIGHT.curtainShade} strokeWidth={6} strokeLinecap="round" />
            ))}
            <rect x={ex - 22} y={tieY - 12} width={44} height={24} rx={10} fill="#c9a76a" {...o(4)} />
          </g>
        );
      })}
      {/* rod */}
      <line x1={x0 - 110} y1={y0 - 44} x2={x1 + 110} y2={y0 - 44} {...o(14)} />
      <line x1={x0 - 110} y1={y0 - 44} x2={x1 + 110} y2={y0 - 44} stroke="#8d8777" strokeWidth={6} strokeLinecap="round" />
      {[x0 - 116, x1 + 116].map((x) => <circle key={x} cx={x} cy={y0 - 44} r={12} fill="#8d8777" {...o(4)} />)}
    </g>
  );
};

const Nightstand: React.FC<{L: BedroomLayout; id: string; lampOn: number; phone: boolean}> = ({L, id, lampOn, phone}) => {
  const x = L.nsX;
  const w = 180;
  const top = -270;
  const base = WALL_BASE + 12;
  return (
    <g>
      <ellipse cx={x} cy={base} rx={w * 0.6} ry={12} fill="#000" opacity={0.25} />
      <rect x={x - w / 2} y={top} width={w} height={base - top} rx={8} fill={NIGHT.wood} {...o()} />
      <rect x={x - w / 2 - 8} y={top - 16} width={w + 16} height={22} rx={6} fill={NIGHT.woodDark} {...o()} />
      <rect x={x - w / 2 + 18} y={top + 30} width={w - 36} height={60} rx={6} fill={NIGHT.woodDark} {...o(4)} />
      <circle cx={x} cy={top + 60} r={7} fill="#c9a76a" {...o(3)} />
      <rect x={x - w / 2 + 18} y={top + 110} width={w - 36} height={60} rx={6} fill={NIGHT.woodDark} {...o(4)} />
      <circle cx={x} cy={top + 140} r={7} fill="#c9a76a" {...o(3)} />
      {/* books */}
      <rect x={x - 80} y={top - 40} width={70} height={22} rx={3} fill="#8a5a5a" {...o(4)} />
      <rect x={x - 74} y={top - 60} width={60} height={20} rx={3} fill="#5b7a8a" {...o(4)} />
      {/* mug with steam */}
      <g transform={`translate(${x + (phone ? 96 : 54)} ${top - 16})`}>
        <path d="M -18 0 L -16 -40 L 16 -40 L 18 0 Z" fill="#e9dcc3" {...o(4)} />
        <path d="M 16 -32 Q 32 -30 30 -16 Q 28 -8 17 -10" fill="none" {...o(4)} />
        {[-6, 6].map((s) => <path key={s} d={`M ${s} -50 Q ${s - 8} -62 ${s} -74 Q ${s + 8} -86 ${s} -98`} fill="none" stroke="#c9c4ba" strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" />)}
      </g>
      {/* phone lying face-down next to the lamp */}
      {phone && <rect x={x + 6} y={top - 24} width={74} height={14} rx={6} fill="#20232b" {...o(4)} />}
      {/* lamp */}
      <g transform={`translate(${x - 10} ${top - 16})`}>
        <ellipse cx={0} cy={-4} rx={30} ry={9} fill="#4a4038" {...o(4)} />
        <rect x={-6} y={-90} width={12} height={86} fill="#4a4038" {...o(4)} />
        <path d="M -62 -84 L 62 -84 L 38 -176 L -38 -176 Z" fill="#7d6f52" {...o(6)} />
        <path d="M -62 -84 L 62 -84 L 38 -176 L -38 -176 Z" fill={NIGHT.lamp} opacity={lampOn} />
        <path d="M -54 -96 L 54 -96" stroke="#ffe7a8" strokeWidth={6} strokeLinecap="round" opacity={0.8 * lampOn} />
      </g>
    </g>
  );
};

const Bed: React.FC<{L: BedroomLayout}> = ({L}) => {
  const x0 = L.bedX - L.bedW / 2;
  const x1 = L.bedX + L.bedW / 2;
  const seat = L.seatY;
  const back = -250;
  const hbTop = -660;
  const pillows = [L.bedX - L.bedW * 0.22, L.bedX + L.bedW * 0.22];
  return (
    <g>
      {/* headboard */}
      <path d={`M ${x0 + 10} ${back + 20} L ${x0 + 10} ${hbTop + 70} Q ${x0 + 10} ${hbTop} ${x0 + 80} ${hbTop} L ${x1 - 80} ${hbTop} Q ${x1 - 10} ${hbTop} ${x1 - 10} ${hbTop + 70} L ${x1 - 10} ${back + 20} Z`} fill={NIGHT.headboard} {...o()} />
      <path d={`M ${x0 + 44} ${back} L ${x0 + 44} ${hbTop + 90} Q ${x0 + 44} ${hbTop + 36} ${x0 + 98} ${hbTop + 36} L ${x1 - 98} ${hbTop + 36} Q ${x1 - 44} ${hbTop + 36} ${x1 - 44} ${hbTop + 90} L ${x1 - 44} ${back} Z`} fill={NIGHT.headPad} {...o(4)} />
      {[0, 1, 2, 3, 4].map((c) => [0, 1].map((r) => (
        <circle key={c + '-' + r} cx={x0 + 44 + ((L.bedW - 88) * (c + 0.5 + (r % 2) * 0.5)) / 5.5} cy={hbTop + 110 + r * 90} r={5} fill={NIGHT.woodDark} />
      )))}
      {/* top surface (seen from above) */}
      <path d={`M ${x0} ${seat} L ${x0 + 24} ${back} L ${x1 - 24} ${back} L ${x1} ${seat} Z`} fill={NIGHT.sheet} {...o()} />
      {pillows.map((px) => (
        <g key={px}>
          <path d={`M ${px - 118} ${back + 14} Q ${px - 128} ${back - 60} ${px - 100} ${back - 74} Q ${px} ${back - 86} ${px + 100} ${back - 74} Q ${px + 128} ${back - 60} ${px + 118} ${back + 14} Q ${px} ${back + 26} ${px - 118} ${back + 14} Z`} fill={NIGHT.pillow} {...o()} />
          <path d={`M ${px - 60} ${back - 40} Q ${px} ${back - 30} ${px + 50} ${back - 44}`} fill="none" stroke="#b9b2a3" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* duvet: folded back below the pillows, then down over the front edge */}
      <path d={`M ${x0 - 6} ${seat + 6} L ${x0 + 14} ${back + 50} Q ${L.bedX} ${back + 30} ${x1 - 14} ${back + 50} L ${x1 + 6} ${seat + 6} Z`} fill={NIGHT.duvetTop} {...o()} />
      <path d={`M ${x0 + 14} ${back + 50} Q ${L.bedX} ${back + 30} ${x1 - 14} ${back + 50} L ${x1 - 12} ${back + 74} Q ${L.bedX} ${back + 54} ${x0 + 12} ${back + 74} Z`} fill={NIGHT.sheet} {...o(4)} />
      {[0.3, 0.62].map((f) => (
        <path key={f} d={`M ${x0 + L.bedW * f} ${back + 90} Q ${x0 + L.bedW * f + 30} ${back + 130} ${x0 + L.bedW * f + 10} ${seat - 6}`} fill="none" stroke={NIGHT.duvetShade} strokeWidth={6} strokeLinecap="round" />
      ))}
      {/* frame + legs */}
      {[x0 + 20, x1 - 20].map((lx) => <rect key={lx} x={lx - 14} y={-40} width={28} height={36} fill={NIGHT.woodDark} {...o(5)} />)}
      <rect x={x0 - 4} y={seat + 50} width={L.bedW + 8} height={46} rx={6} fill={NIGHT.wood} {...o()} />
      {/* duvet front drop with a soft wavy hem */}
      <path d={`M ${x0 - 10} ${seat - 4} L ${x1 + 10} ${seat - 4} L ${x1 + 14} ${seat + 62} Q ${x1 - 60} ${seat + 74} ${x1 - 130} ${seat + 62} Q ${L.bedX + 80} ${seat + 76} ${L.bedX} ${seat + 64} Q ${L.bedX - 90} ${seat + 76} ${x0 + 120} ${seat + 62} Q ${x0 + 40} ${seat + 74} ${x0 - 14} ${seat + 62} Z`} fill={NIGHT.duvet} {...o()} />
      {[0.18, 0.5, 0.8].map((f) => <path key={f} d={`M ${x0 + L.bedW * f} ${seat + 4} Q ${x0 + L.bedW * f - 8} ${seat + 34} ${x0 + L.bedW * f + 4} ${seat + 60}`} fill="none" stroke={NIGHT.duvetShade} strokeWidth={5} strokeLinecap="round" />)}
    </g>
  );
};

const Shelf: React.FC<{L: BedroomLayout}> = ({L}) => {
  const x = L.shelfX;
  const y = L.wide ? -820 : -900;
  const w = 280;
  return (
    <g>
      {/* trailing pothos vines (behind the plank) */}
      {[[-96, 220], [-70, 300], [-44, 180]].map(([vx, len], i) => (
        <g key={i}>
          <path d={`M ${x + vx} ${y} Q ${x + vx - 20} ${y + len * 0.5} ${x + vx + 6} ${y + len}`} fill="none" stroke={NIGHT.leafDark} strokeWidth={5} strokeLinecap="round" />
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <ellipse key={f} cx={x + vx + (f % 0.5 ? -14 : 12)} cy={y + len * f} rx={16} ry={11} transform={`rotate(${f % 0.5 ? -30 : 30} ${x + vx + (f % 0.5 ? -14 : 12)} ${y + len * f})`} fill={NIGHT.leaf} {...o(4)} />
          ))}
        </g>
      ))}
      <rect x={x - w / 2} y={y} width={w} height={20} rx={4} fill={NIGHT.wood} {...o()} />
      {[-1, 1].map((s) => <path key={s} d={`M ${x + s * 100} ${y + 20} L ${x + s * 100} ${y + 54} L ${x + s * 80} ${y + 20}`} fill={NIGHT.woodDark} {...o(4)} />)}
      {/* pot for the vines */}
      <path d={`M ${x - 116} ${y} L ${x - 110} ${y - 54} L ${x - 34} ${y - 54} L ${x - 28} ${y} Z`} fill="#c9a76a" {...o(5)} />
      {[[-104, -70], [-80, -84], [-56, -74], [-40, -62]].map(([lx, ly], i) => <ellipse key={i} cx={x + lx} cy={y + ly} rx={18} ry={12} fill={NIGHT.leaf} {...o(4)} transform={`rotate(${i * 25 - 30} ${x + lx} ${y + ly})`} />)}
      {/* books, blank spines */}
      {[['#5b7a8a', 0, 92], ['#8a5a5a', 26, 104], ['#c9a76a', 52, 86]].map(([c, dx, h], i) => (
        <rect key={i} x={x - 4 + (dx as number)} y={y - (h as number)} width={24} height={h as number} rx={3} fill={c as string} {...o(4)} />
      ))}
      <rect x={x + 76} y={y - 92} width={24} height={92} rx={3} fill="#6e5a7a" {...o(4)} transform={`rotate(14 ${x + 100} ${y})`} />
      {/* tiny framed picture, image only */}
      <g transform={`translate(${x + 104} ${y - 60})`}>
        <rect x={-6} y={-30} width={46} height={60} rx={3} fill="#e9dcc3" {...o(4)} />
        <path d="M -2 22 L 12 -2 L 22 10 L 28 2 L 36 22 Z" fill={NIGHT.leaf} />
        <circle cx={28} cy={-14} r={5} fill={NIGHT.lamp} />
      </g>
    </g>
  );
};

const Plant: React.FC<{L: BedroomLayout}> = ({L}) => {
  const x = L.plantX;
  const base = -30;
  const leaves: [number, number, number, number][] = [
    [-60, -300, -40, 70], [40, -360, 30, 80], [-10, -470, -5, 84], [80, -240, 60, 64], [-100, -200, -70, 60], [10, -230, 10, 66],
  ];
  return (
    <g transform={L.wide ? undefined : `translate(${x} ${base}) scale(0.78) translate(${-x} ${-base})`}>
      <ellipse cx={x} cy={base} rx={90} ry={12} fill="#000" opacity={0.25} />
      {leaves.map(([lx, ly, rot, r], i) => (
        <g key={i}>
          <path d={`M ${x} ${base - 120} Q ${x + lx * 0.3} ${(base - 120 + ly) / 2} ${x + lx} ${ly + r * 0.6}`} fill="none" stroke={NIGHT.leafDark} strokeWidth={6} strokeLinecap="round" />
          <g transform={`rotate(${rot} ${x + lx} ${ly})`}>
            <ellipse cx={x + lx} cy={ly} rx={r * 0.8} ry={r} fill={i % 2 ? NIGHT.leafDark : NIGHT.leaf} {...o(5)} />
            <path d={`M ${x + lx} ${ly + r - 6} L ${x + lx} ${ly - r + 10}`} stroke={NIGHT.leafDark} strokeWidth={4} />
            <path d={`M ${x + lx - r * 0.8} ${ly - 4} L ${x + lx - r * 0.35} ${ly + 2} M ${x + lx + r * 0.8} ${ly - 10} L ${x + lx + r * 0.35} ${ly - 4}`} stroke={i % 2 ? NIGHT.leaf : '#3c6048'} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      ))}
      <path d={`M ${x - 70} ${base - 130} L ${x + 70} ${base - 130} L ${x + 54} ${base} L ${x - 54} ${base} Z`} fill={NIGHT.pot} {...o()} />
      <rect x={x - 78} y={base - 146} width={156} height={24} rx={6} fill="#b8684e" {...o(5)} />
    </g>
  );
};

const Rug: React.FC<{L: BedroomLayout}> = ({L}) => {
  const cx = L.bedX * 0.4;
  const rx = L.wide ? 640 : 470;
  return (
    <g>
      {[-1, 1].map((s) => Array.from({length: 7}).map((_, i) => (
        <line key={s + '-' + i} x1={cx + s * rx} y1={50 + (i - 3) * 12} x2={cx + s * (rx + 22)} y2={50 + (i - 3) * 14} stroke="#c9b48c" strokeWidth={4} strokeLinecap="round" />
      )))}
      <ellipse cx={cx} cy={50} rx={rx} ry={86} fill={NIGHT.rugA} {...o()} />
      <ellipse cx={cx} cy={50} rx={rx - 50} ry={62} fill="none" stroke={NIGHT.rugB} strokeWidth={14} />
      <ellipse cx={cx} cy={50} rx={rx - 120} ry={36} fill="none" stroke={NIGHT.rugB} strokeWidth={8} strokeDasharray="22 16" />
    </g>
  );
};

const Slippers: React.FC<{x: number}> = ({x}) => (
  <g>
    {[0, 70].map((d, i) => (
      <g key={d} transform={`translate(${x + d} ${70 - i * 10}) rotate(${i ? 12 : -6})`}>
        <ellipse cx={0} cy={0} rx={30} ry={16} fill="#c98a8a" {...o(5)} />
        <path d="M -24 -4 Q 0 -20 24 -4" fill="#e9dcc3" {...o(4)} />
      </g>
    ))}
  </g>
);

const FairyLights: React.FC<{L: BedroomLayout; id: string}> = ({L, id}) => {
  const y0 = L.top + (L.wide ? 90 : 70);
  const sag = L.wide ? 110 : 60;
  const swags = L.wide ? 3 : 2;
  const span = (L.hx * 2 + 80) / swags;
  const bulbs: [number, number][] = [];
  const paths: string[] = [];
  for (let k = 0; k < swags; k++) {
    const a = -L.hx - 40 + k * span;
    const b = a + span;
    paths.push(`M ${a} ${y0} Q ${(a + b) / 2} ${y0 + sag * 2} ${b} ${y0}`);
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      bulbs.push([a + (b - a) * t, y0 + 2 * sag * 2 * t * (1 - t) * 1]);
    }
  }
  return (
    <g>
      <defs>
        <radialGradient id={id + 'fl'}>
          <stop offset="0" stopColor={NIGHT.fairy} stopOpacity={0.55} />
          <stop offset="1" stopColor={NIGHT.fairy} stopOpacity={0} />
        </radialGradient>
      </defs>
      {paths.map((d) => <path key={d} d={d} fill="none" stroke={INK} strokeWidth={4} />)}
      {bulbs.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y + 10} r={34} fill={`url(#${id}fl)`} />
          <ellipse cx={x} cy={y + 10} rx={7} ry={10} fill={NIGHT.fairy} stroke={INK} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

// Everything behind the characters.
export const BedroomBack: React.FC<{L: BedroomLayout; id: string; lampOn?: number; phoneOnStand?: boolean; morning?: number}> = ({L, id, lampOn = 1, phoneOnStand = false, morning = 0}) => {
  const left = -L.hx - 10;
  const width = L.hx * 2 + 20;
  const lampX = L.nsX - 10;
  const lampY = -270 - 16 - 130;
  return (
    <g>
      <defs>
        <linearGradient id={id + 'wall'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={NIGHT.wallTop} />
          <stop offset="1" stopColor={NIGHT.wallBottom} />
        </linearGradient>
        <pattern id={id + 'dots'} width={80} height={80} patternUnits="userSpaceOnUse">
          <path d="M 40 30 L 46 40 L 40 50 L 34 40 Z" fill={NIGHT.wallDot} />
          <circle cx={0} cy={0} r={4} fill={NIGHT.wallDot} />
          <circle cx={80} cy={0} r={4} fill={NIGHT.wallDot} />
          <circle cx={0} cy={80} r={4} fill={NIGHT.wallDot} />
          <circle cx={80} cy={80} r={4} fill={NIGHT.wallDot} />
        </pattern>
        <radialGradient id={id + 'lamp'}>
          <stop offset="0" stopColor={NIGHT.lampGlow} stopOpacity={0.5} />
          <stop offset="0.5" stopColor={NIGHT.lampGlow} stopOpacity={0.16} />
          <stop offset="1" stopColor={NIGHT.lampGlow} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id + 'moonbeam'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9c8f0" stopOpacity={0.1} />
          <stop offset="1" stopColor="#b9c8f0" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* wall */}
      <rect x={left} y={L.top - 10} width={width} height={WALL_BASE - L.top + 10} fill={`url(#${id}wall)`} />
      <rect x={left} y={L.top - 10} width={width} height={WALL_BASE - L.top + 10} fill={`url(#${id}dots)`} opacity={0.55} />
      {/* floor */}
      <rect x={left} y={WALL_BASE} width={width} height={L.bottom - WALL_BASE + 10} fill={NIGHT.floor} />
      {Array.from({length: 9}).map((_, i) => {
        const y = WALL_BASE + 18 + Math.pow(i, 1.5) * 14;
        return <line key={i} x1={left} y1={y} x2={left + width} y2={y} stroke={NIGHT.floorLine} strokeWidth={4} />;
      })}
      {Array.from({length: 40}).map((_, i) => {
        const row = i % 8;
        const y = WALL_BASE + 18 + Math.pow(row, 1.5) * 14;
        const y2 = WALL_BASE + 18 + Math.pow(row + 1, 1.5) * 14;
        const x = left + ((i * 337) % width);
        return <line key={'v' + i} x1={x} y1={y} x2={x} y2={y2} stroke={NIGHT.floorLine} strokeWidth={4} />;
      })}
      <rect x={left} y={WALL_BASE - 26} width={width} height={26} fill={NIGHT.skirting} />
      <line x1={left} y1={WALL_BASE} x2={left + width} y2={WALL_BASE} stroke={INK} strokeWidth={6} />
      {/* warm lamp glow on the wall, cool moonbeam from the window */}
      <circle cx={lampX} cy={lampY} r={L.wide ? 620 : 520} fill={`url(#${id}lamp)`} opacity={lampOn} />
      <path d={`M ${L.winX - L.winW / 2} ${L.wide ? -660 : -700} L ${L.winX + L.winW / 2} ${L.wide ? -660 : -700} L ${L.winX + L.winW / 2 + 380} ${90} L ${L.winX - L.winW / 2 + 380} ${90} Z`} fill={`url(#${id}moonbeam)`} />
      <FairyLights L={L} id={id} />
      <Window L={L} id={id} morning={morning} />
      <Shelf L={L} />
      <Rug L={L} />
      <Bed L={L} />
      <Nightstand L={L} id={id} lampOn={lampOn} phone={phoneOnStand} />
      <Plant L={L} />
      <Slippers x={L.bedX + (L.wide ? 280 : 170)} />
    </g>
  );
};

// In front of the characters: soft lamp bloom + vignette (screen space).
export const BedroomFront: React.FC<{L: BedroomLayout; id: string; dark?: number; morning?: number}> = ({L, id, dark = 0, morning = 0}) => (
  <g>
    <defs>
      <radialGradient id={id + 'vig'} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.3} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={L.W} height={L.H} fill="#0b1026" opacity={dark * 0.22 * (1 - morning)} />
    <rect x={0} y={0} width={L.W} height={L.H} fill="#ffd9a0" opacity={morning * 0.22} />
    <rect x={0} y={0} width={L.W} height={L.H} fill={`url(#${id}vig)`} />
  </g>
);
