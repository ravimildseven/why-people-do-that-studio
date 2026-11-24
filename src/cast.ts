import type {Look} from './kit/Person';

// The cast. A new character = a new Look here. Rules for adding one: see CHARACTER-GUIDE.md.

export const MIKA: Look = {
  name: 'Mika',
  skin: '#c68a5e',
  skinShade: '#a96f47',
  hair: 'bunPencil',
  hairColor: '#2b2430',
  hairShine: '#4a3f52',
  top: 'hoodie',
  topColor: '#e8a93a',
  topShade: '#c98b22',
  topAccent: '#fff4dc',
  bottom: '#33405c',
  shoe: '#f4efe4',
  shoeStripe: '#e8735a',
  sole: '#2b2f38',
  blush: '#e8735a',
  earrings: '#e8735a',
};

// Mika's flatmate: the "normal" one she compares herself to. Teal so he never competes with her mustard.
export const DEV: Look = {
  name: 'Dev',
  skin: '#8d5a3b',
  skinShade: '#6f4329',
  hair: 'curly',
  hairColor: '#231c1f',
  hairShine: '#43373c',
  top: 'shirt',
  topColor: '#3f8f86',
  topShade: '#2f6e67',
  topAccent: '#efe6d2',
  bottom: '#4b4f5a',
  shoe: '#3a3f4b',
  shoeStripe: '#e8a93a',
  sole: '#1e222b',
  blush: '#d9694f',
  stubble: true,
  hip: 180,
  bodyW: 1.08,
};

// Mika's grandmother: the voice of old habits. Shorter, softer lids, plum + teal, gold accents.
export const AAJI: Look = {
  name: 'Aaji',
  skin: '#b07a55',
  skinShade: '#8f5f3e',
  hair: 'greyBun',
  hairColor: '#bdb8b1',
  hairShine: '#e4e0d9',
  browColor: '#8f8a84',
  head: {a: 118, b: 110, n: 2.5},
  top: 'cardigan',
  topColor: '#7a4f78',
  topShade: '#5c3a5a',
  topAccent: '#e9dcc3',
  bottom: '#3f7a72',
  bottomStyle: 'longSkirt',
  shoe: '#6b4a3a',
  shoeStripe: '#e0b04a',
  sole: '#3a2a22',
  blush: '#d9694f',
  earrings: '#e0b04a',
  glasses: true,
  bindi: true,
  hip: 146,
  bodyW: 1.06,
  lidBase: 0.12,
};

export const CAST = [MIKA, DEV, AAJI];
