/**
 * Generates the illustrated menu pictures (SVG) and the hero artwork.
 * Run with:  npm run images
 * The output is committed in public/images, so you only need this if you want to tweak the artwork.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
fs.mkdirSync(path.join(out, 'menu'), { recursive: true });

/* ----------------------------- small helpers ----------------------------- */
const g = (x, y, s, inner, rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;

const BG = {
  Coffee: ['#f3e6d4', '#e2c9a8'],
  Tea: ['#e6ecdb', '#cbd8b8'],
  Cold: ['#e0ebf0', '#c3d8e2'],
  Pastries: ['#f9e6d6', '#efcab0'],
  Bites: ['#f5ecd3', '#e8d8ac'],
};

function scene(category, subject, { beans = false, w = 800, h = 600 } = {}) {
  const [c1, c2] = BG[category];
  const beanSet = beans
    ? [[90, 80, 20], [700, 110, -30], [740, 500, 60], [70, 520, 110], [160, 300, 0], [650, 300, 40]]
        .map(([x, y, r]) => bean(x, y, r, 1))
        .join('')
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
${GRADS}
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<circle cx="${w / 2}" cy="${h / 2}" r="330" fill="url(#glow)"/>
${beanSet}
${subject}
</svg>`;
}

const GRADS = `
<radialGradient id="saucer" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e1d6"/></radialGradient>
<radialGradient id="cupbody" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efe8de"/></radialGradient>
<radialGradient id="espresso" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#c98a4b"/><stop offset=".55" stop-color="#7d4521"/><stop offset="1" stop-color="#3a1d0c"/></radialGradient>
<radialGradient id="americano" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#6a3b1b"/><stop offset=".7" stop-color="#40220e"/><stop offset="1" stop-color="#2a1508"/></radialGradient>
<radialGradient id="milkcoffee" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#9c6a3f"/><stop offset="1" stop-color="#6a4023"/></radialGradient>
<radialGradient id="mochaliq" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#6b3d2a"/><stop offset="1" stop-color="#3f2116"/></radialGradient>
<radialGradient id="rooibos" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#d4642a"/><stop offset=".7" stop-color="#a23c15"/><stop offset="1" stop-color="#7a2a0e"/></radialGradient>
<radialGradient id="greentea" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#e2db86"/><stop offset=".7" stop-color="#b5b653"/><stop offset="1" stop-color="#8d9a3e"/></radialGradient>
<radialGradient id="chailiq" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#d7a56d"/><stop offset=".7" stop-color="#b57c45"/><stop offset="1" stop-color="#8d5b2e"/></radialGradient>
<radialGradient id="cream" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#eedcc0"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4bf63"/><stop offset=".55" stop-color="#dd8f2e"/><stop offset="1" stop-color="#b4631a"/></linearGradient>
<linearGradient id="muffintop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eab165"/><stop offset="1" stop-color="#bf7a30"/></linearGradient>
<linearGradient id="dough" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efc085"/><stop offset="1" stop-color="#cf8f4a"/></linearGradient>
<linearGradient id="choc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3322"/><stop offset="1" stop-color="#3a1f13"/></linearGradient>
<linearGradient id="toast" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9b46a"/><stop offset="1" stop-color="#c98a3f"/></linearGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset="1" stop-color="#b9b9b9"/></linearGradient>
<linearGradient id="icedlatte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ead6"/><stop offset=".35" stop-color="#d9b48a"/><stop offset="1" stop-color="#5e3519"/></linearGradient>
<linearGradient id="frappeliq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6b186"/><stop offset="1" stop-color="#a06c3d"/></linearGradient>`;

const bean = (x, y, rot, s) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity=".55"><ellipse rx="22" ry="15" fill="#4a2a14"/><path d="M-20 -2 C-8 -10 8 8 20 -2" stroke="#2a1608" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;

/* ------------------------------ cups (top view) -------------------------- */
function cup({ size = 150, saucer = 225, liquid = 'americano', art = '', extras = '', handle = true, shadow = true }) {
  const liq = size - 28;
  return `
${shadow ? `<circle cx="14" cy="20" r="${saucer}" fill="#3a2414" opacity=".28" filter="url(#blur)"/>` : ''}
<circle r="${saucer}" fill="url(#saucer)" stroke="#d9cfc0" stroke-width="3"/>
<circle r="${saucer - 34}" fill="none" stroke="#e2d9cb" stroke-width="3"/>
${extras}
${
  handle
    ? `<path d="M${size - 8} -42 C${size + 78} -64 ${size + 78} 64 ${size - 8} 42" fill="none" stroke="#d9cfc0" stroke-width="32" stroke-linecap="round"/>
<path d="M${size - 8} -42 C${size + 78} -64 ${size + 78} 64 ${size - 8} 42" fill="none" stroke="#fbf8f3" stroke-width="26" stroke-linecap="round"/>`
    : ''
}
<circle r="${size}" fill="url(#cupbody)" stroke="#ddd3c5" stroke-width="3"/>
<circle r="${size - 13}" fill="#f1ebe2" stroke="#e5dccf" stroke-width="2"/>
<circle r="${liq}" fill="url(#${liquid})"/>
${art}
<ellipse cx="${-liq * 0.42}" cy="${-liq * 0.5}" rx="${liq * 0.32}" ry="${liq * 0.12}" fill="#fff" opacity=".22" transform="rotate(-35 ${-liq * 0.42} ${-liq * 0.5})"/>`;
}

const spoon = `<g transform="translate(-140 150) rotate(-38)"><rect x="-4" y="-4" width="110" height="9" rx="4.5" fill="url(#silver)" stroke="#a9a9a9" stroke-width="1"/><ellipse cx="-20" cy="0" rx="26" ry="16" fill="url(#silver)" stroke="#a9a9a9" stroke-width="1"/></g>`;

const heartPath = (s = 1) =>
  `<path transform="scale(${s})" d="M0 62 C-62 20 -52 -46 0 -22 C52 -46 62 20 0 62Z"/>`;

const tulip = (r) => {
  const k = r / 125;
  const hearts = [[1.05, '#f6e8d2'], [0.82, '#a6743f'], [0.6, '#f6e8d2'], [0.38, '#a6743f'], [0.18, '#f6e8d2']]
    .map(([sc, fill]) => `<g transform="translate(0 ${-6 + (1 - sc) * 22})" fill="${fill}">${heartPath(sc * 1.35 * k)}</g>`)
    .join('');
  return `<circle r="${r}" fill="#a6743f" opacity=".5"/>${hearts}`;
};

const rosetta = (r) => {
  const leaves = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const y = 62 - i * 22;
      const w = 62 - i * 8;
      return `<path d="M${-w} ${y} Q0 ${y - 38} ${w} ${y} Q0 ${y - 14} ${-w} ${y}Z" fill="#f7ead4"/>`;
    })
    .join('');
  return `<circle r="${r}" fill="#a6743f" opacity=".5"/><g transform="scale(${r / 118})">${leaves}<path d="M0 70 L0 -62" stroke="#f7ead4" stroke-width="6" stroke-linecap="round"/></g>`;
};

const flatwhiteArt = (r) =>
  `<circle r="${r}" fill="#a6743f" opacity=".45"/><g fill="#f6e8d2">${heartPath(r / 150)}</g>`;

const mochaArt = (r) => {
  const rings = [1, 0.8, 0.6, 0.4, 0.2]
    .map((k) => `<circle r="${r * 0.86 * k}" fill="none" stroke="#f1dfc3" stroke-width="${16 * k + 3}" opacity=".95"/>`)
    .join('');
  const drizzle = [-50, -20, 10, 40]
    .map((y) => `<path d="M-70 ${y} q 35 -22 70 0 t 70 0" stroke="#4a2619" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>`)
    .join('');
  return `<circle r="${r * 0.95}" fill="url(#cream)"/>${rings}${drizzle}`;
};

function espresso() {
  const size = 104;
  const art = `<circle r="${size - 28}" fill="none" stroke="#d9a366" stroke-width="10" opacity=".7"/><path d="M-26 -8 C-12 -30 22 -22 24 0 C26 24 -10 34 -26 14" fill="none" stroke="#e8b97d" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
  return cup({ size, saucer: 170, liquid: 'espresso', art, extras: `<g transform="translate(-35 6) scale(.7)">${spoon}</g>` });
}
const americano = () =>
  cup({ liquid: 'americano', art: `<circle r="118" fill="none" stroke="#b07a46" stroke-width="9" opacity=".6"/>`, extras: spoon });
const cappuccino = () => cup({ liquid: 'milkcoffee', art: tulip(112), extras: spoon });
const latte = () => cup({ liquid: 'milkcoffee', art: rosetta(112), extras: spoon });
const flatWhite = () => cup({ liquid: 'milkcoffee', art: flatwhiteArt(112), extras: spoon });
const mocha = () => cup({ liquid: 'mochaliq', art: mochaArt(116), extras: spoon });

const rooibos = () => {
  const tag = `<path d="M-110 -60 C-170 -20 -190 60 -175 110" fill="none" stroke="#c9bfae" stroke-width="3"/><g transform="translate(-175 110) rotate(12)"><rect x="-26" y="0" width="52" height="64" rx="5" fill="#fffaf0" stroke="#d4c8b4" stroke-width="2"/><circle cx="0" cy="14" r="5" fill="#d9cfbd"/><path d="M-14 36 H14 M-14 46 H8" stroke="#a23c15" stroke-width="4" stroke-linecap="round"/></g>`;
  return cup({ liquid: 'rooibos', art: `<circle r="118" fill="none" stroke="#e98a4c" stroke-width="7" opacity=".5"/>`, extras: spoon + tag });
};
const greenTea = () =>
  cup({
    liquid: 'greentea',
    art: `<circle r="118" fill="none" stroke="#f1eba5" stroke-width="7" opacity=".6"/><g fill="#6e8a2e" opacity=".85"><ellipse cx="-30" cy="10" rx="20" ry="8" transform="rotate(-30 -30 10)"/><ellipse cx="25" cy="-15" rx="18" ry="7" transform="rotate(40 25 -15)"/></g>`,
    extras: spoon,
  });
const chai = () => {
  const stick = `<g transform="translate(-150 120) rotate(-35)"><rect x="-70" y="-9" width="140" height="18" rx="9" fill="#8b4f27"/><path d="M-70 -3 H70 M-70 4 H70" stroke="#b97a45" stroke-width="2"/></g><g transform="translate(-60 190)"><path d="M0 -16 L5 -5 L17 -5 L8 3 L11 16 L0 9 L-11 16 L-8 3 L-17 -5 L-5 -5Z" fill="#5a2f17" stroke="#3d1f0e" stroke-width="2"/></g>`;
  const dots = Array.from({ length: 26 }, (_, i) => {
    const a = i * 2.4;
    const rr = 12 + ((i * 37) % 95);
    return `<circle cx="${Math.cos(a) * rr}" cy="${Math.sin(a) * rr}" r="${2 + (i % 3)}" fill="#7a4a24" opacity=".7"/>`;
  }).join('');
  return cup({ liquid: 'chailiq', art: `<circle r="118" fill="#e6c79b" opacity=".35"/>${dots}`, extras: stick });
};

/* ----------------------------- iced drinks (side) ------------------------ */
const glassPath = 'M-105 -170 L105 -170 L82 168 Q80 186 60 186 L-60 186 Q-80 186 -82 168 Z';

function ice(x, y, r, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-32" y="-32" width="64" height="64" rx="12" fill="#fff" fill-opacity=".32" stroke="#fff" stroke-opacity=".75" stroke-width="3"/><path d="M-20 -18 L-8 -22" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/></g>`;
}

const straw = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9453a" stroke-width="16" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="16" stroke-dasharray="14 22" opacity=".9"/>`;

function icedLatte() {
  return `<ellipse cx="0" cy="196" rx="150" ry="22" fill="#2f2013" opacity=".25" filter="url(#blur)"/>
<clipPath id="gl"><path d="${glassPath}"/></clipPath>
<path d="${glassPath}" fill="#fff" fill-opacity=".28"/>
<g clip-path="url(#gl)">
<rect x="-120" y="-110" width="240" height="310" fill="url(#icedlatte)"/>
${ice(-45, -70, -12, 1)}${ice(48, -45, 18, 1)}${ice(-30, 20, 25, 0.95)}${ice(40, 70, -10, 0.9)}${ice(-35, 105, 8, 0.8)}
${straw(36, -240, -8, 80)}
<rect x="-98" y="-165" width="22" height="340" rx="11" fill="#fff" opacity=".2"/>
</g>
<path d="${glassPath}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="5"/>
<ellipse cx="0" cy="-170" rx="105" ry="12" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="4"/>`;
}

function frappe() {
  const cream = `<g><ellipse cx="0" cy="-125" rx="98" ry="30" fill="#fffaf0"/><ellipse cx="0" cy="-158" rx="76" ry="28" fill="#fff6e6"/><ellipse cx="0" cy="-188" rx="52" ry="24" fill="#fffaf0"/><path d="M-12 -208 Q0 -250 14 -206Z" fill="#fff6e6"/>
<path d="M-84 -128 Q-60 -110 -50 -140 T-10 -130 T30 -142 T70 -128" stroke="#b8671e" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M-60 -160 Q-40 -146 -22 -166 T22 -160 T52 -165" stroke="#b8671e" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  return `<ellipse cx="0" cy="196" rx="150" ry="22" fill="#2f2013" opacity=".25" filter="url(#blur)"/>
<clipPath id="gl2"><path d="${glassPath}"/></clipPath>
<path d="${glassPath}" fill="#fff" fill-opacity=".28"/>
<g clip-path="url(#gl2)">
<rect x="-120" y="-130" width="240" height="330" fill="url(#frappeliq)"/>
<path d="M-120 -40 Q-60 -70 0 -40 T120 -40 V-20 H-120Z" fill="#c79a6b" opacity=".6"/>
<g fill="#fff" opacity=".25"><circle cx="-50" cy="30" r="9"/><circle cx="40" cy="55" r="7"/><circle cx="-10" cy="110" r="10"/><circle cx="55" cy="130" r="6"/><circle cx="-60" cy="140" r="6"/></g>
<rect x="-98" y="-165" width="22" height="340" rx="11" fill="#fff" opacity=".2"/>
</g>
<path d="${glassPath}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="5"/>
${straw(50, -250, 20, 40)}
${cream}`;
}

/* ------------------------------- pastries -------------------------------- */
const plate = (rx = 250, ry = 70, y = 170) =>
  `<ellipse cx="0" cy="${y + 18}" rx="${rx}" ry="${ry}" fill="#3a2414" opacity=".25" filter="url(#blur)"/><ellipse cx="0" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#saucer)" stroke="#d9cfc0" stroke-width="3"/><ellipse cx="0" cy="${y - 4}" rx="${rx - 40}" ry="${ry - 20}" fill="none" stroke="#e2d9cb" stroke-width="3"/>`;

function croissant() {
  const segs = [-3, 3, -2, 2, -1, 1, 0].map((t) => {
    const x = t * 50;
    const y = 8 + t * t * 11;
    const rx = 72 - Math.abs(t) * 9;
    const ry = 104 - Math.abs(t) * 17;
    const rot = t * 21;
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="url(#gold)" stroke="#a65a14" stroke-width="3"/><ellipse cx="${-rx * 0.25}" cy="${-ry * 0.3}" rx="${rx * 0.3}" ry="${ry * 0.55}" fill="#fbd990" opacity=".5"/><path d="M${-rx * 0.85} ${ry * 0.12} Q0 ${ry * 0.4} ${rx * 0.85} ${ry * 0.12}" stroke="#a65a14" stroke-width="2.5" fill="none" opacity=".45"/></g>`;
  });
  return `${plate(260, 70, 185)}<g transform="translate(0 10) rotate(-4)">${segs.join('')}</g>`;
}

function muffin() {
  const berries = [[-85, -30], [-30, -78], [40, -70], [88, -22], [0, -20], [-60, 20], [62, 22]]
    .map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="17" fill="#3b4283"/><circle cx="-5" cy="-6" r="5" fill="#8a92d6" opacity=".7"/><path d="M-5 -14 l5 4 l5 -4" stroke="#242a5c" stroke-width="2.5" fill="none"/></g>`)
    .join('');
  const specks = Array.from({ length: 30 }, (_, i) => `<circle cx="${Math.cos(i * 2.1) * (30 + ((i * 29) % 90))}" cy="${-50 + Math.sin(i * 1.7) * 55}" r="2.5" fill="#fff4d6" opacity=".85"/>`).join('');
  const pleats = Array.from({ length: 9 }, (_, i) => {
    const x = -88 + i * 22;
    return `<path d="M${x * 1} 52 L${x * 0.78} 170" stroke="#c9b394" stroke-width="3"/>`;
  }).join('');
  return `${plate(240, 62, 205)}
<path d="M-98 50 L98 50 L74 190 Q72 200 60 200 L-60 200 Q-72 200 -74 190Z" fill="#efe2cb" stroke="#c9b394" stroke-width="3"/>${pleats}
<path d="M-128 60 C-165 -30 -100 -128 0 -132 C100 -128 165 -30 128 60 C80 75 -80 75 -128 60Z" fill="url(#muffintop)" stroke="#a8611f" stroke-width="3"/>
<path d="M-100 -50 C-90 -100 -40 -118 0 -118" stroke="#f6cf8c" stroke-width="10" fill="none" stroke-linecap="round" opacity=".5"/>
${berries}${specks}`;
}

function cinnamonRoll() {
  let spiral = '';
  let spiral2 = '';
  const pts = [];
  for (let t = 0; t < 6.3 * Math.PI; t += 0.15) {
    const r = 8 + t * 6.2;
    pts.push(`${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`);
  }
  spiral = `<polyline points="${pts.join(' ')}" fill="none" stroke="#8d4b1d" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
  spiral2 = `<polyline points="${pts.join(' ')}" fill="none" stroke="#c97c3a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
  const icing = [-90, -55, -20, 15, 50, 85]
    .map((y, i) => `<path d="M-130 ${y} q 32 ${i % 2 ? -26 : 26} 65 0 t 65 0 t 65 0 t 65 0" stroke="#fffaf1" stroke-width="13" fill="none" stroke-linecap="round" opacity=".96"/>`)
    .join('');
  return `<ellipse cx="14" cy="22" rx="262" ry="262" fill="#3a2414" opacity=".25" filter="url(#blur)"/>
<circle r="260" fill="url(#saucer)" stroke="#d9cfc0" stroke-width="3"/><circle r="225" fill="none" stroke="#e2d9cb" stroke-width="3"/>
<circle r="168" fill="url(#dough)" stroke="#a8611f" stroke-width="4"/>
<clipPath id="roll"><circle r="160"/></clipPath>
<g clip-path="url(#roll)">${spiral}${spiral2}<g transform="rotate(-18)">${icing}</g></g>
<circle r="168" fill="none" stroke="#fff" stroke-width="3" opacity=".25"/>
<ellipse cx="-80" cy="-100" rx="60" ry="22" fill="#fff" opacity=".18" transform="rotate(-35 -80 -100)"/>`;
}

function chocolateCake() {
  const curls = [[-60, -92], [10, -104], [70, -86]]
    .map(([x, y]) => `<g transform="translate(${x} ${y}) rotate(${x})"><rect x="-26" y="-8" width="52" height="16" rx="8" fill="#6b3b26"/><path d="M-22 -2 H22" stroke="#8a5237" stroke-width="3"/></g>`)
    .join('');
  return `${plate(260, 62, 160)}
<polygon points="120,-30 190,-72 190,92 120,132" fill="#2e180f"/>
<polygon points="120,10 190,-30 190,-22 120,18" fill="#e8cfae"/>
<polygon points="120,78 190,38 190,48 120,88" fill="#e8cfae"/>
<polygon points="-140,-30 120,-30 190,-72 -70,-72" fill="url(#choc)"/>
<polygon points="-140,-30 120,-30 190,-72 -70,-72" fill="#fff" opacity=".07"/>
<rect x="-140" y="-30" width="260" height="162" rx="6" fill="#4a2818"/>
<rect x="-140" y="8" width="260" height="12" fill="#ecd5b4"/>
<rect x="-140" y="76" width="260" height="12" fill="#ecd5b4"/>
<rect x="-140" y="-30" width="260" height="22" fill="#2f1a10"/>
<path d="M-136 -8 q 14 22 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0" fill="#2f1a10"/>
<path d="M-132 40 H116 M-132 110 H116" stroke="#5c3320" stroke-width="2" opacity=".6"/>
${curls}
<g transform="translate(110 -88)"><circle r="17" fill="#c4202b"/><circle cx="-5" cy="-6" r="5" fill="#fff" opacity=".6"/><path d="M0 -16 Q8 -34 22 -36" stroke="#5c7a2b" stroke-width="3" fill="none"/></g>`;
}

/* -------------------------------- sandwiches ----------------------------- */
function sandwich(kind) {
  const grill = [-130, -90, -50, -10, 30, 70, 110]
    .map((x) => `<path d="M${x} -78 l40 74" stroke="#8e5316" stroke-width="7" stroke-linecap="round" opacity=".45"/>`)
    .join('');
  const lettuce = (y) => `<path d="M-184 ${y} q 18 -26 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 v26 h-324Z" fill="#79b85c" stroke="#5a9a41" stroke-width="3"/>`;
  const tomato = (y) =>
    [-120, -40, 40, 120]
      .map((x) => `<ellipse cx="${x}" cy="${y}" rx="48" ry="15" fill="#d8402f" stroke="#b02a1d" stroke-width="3"/><ellipse cx="${x}" cy="${y - 2}" rx="34" ry="7" fill="#ef6f5e" opacity=".7"/>`)
      .join('');
  const chicken = `<rect x="-170" y="16" width="340" height="38" rx="18" fill="#f0e1c2" stroke="#d4bf94" stroke-width="3"/><path d="M-140 28 q15 8 30 0 M-60 38 q15 8 30 0 M20 28 q15 8 30 0 M100 38 q15 8 30 0" stroke="#d4bf94" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const cheese = (y) => `<path d="M-176 ${y} H176 V${y + 26} H120 L100 ${y + 52} L80 ${y + 26} H-176Z" fill="#f6c23a" stroke="#d39a12" stroke-width="3"/><circle cx="-100" cy="${y + 12}" r="6" fill="#e8aa1c"/><circle cx="-20" cy="${y + 10}" r="5" fill="#e8aa1c"/><circle cx="60" cy="${y + 14}" r="7" fill="#e8aa1c"/>`;
  const fill =
    kind === 'chicken'
      ? `${lettuce(40)}${chicken}${tomato(4)}`
      : `${cheese(20)}${tomato(8)}`;
  return `${plate(270, 66, 150)}
<rect x="-172" y="52" width="344" height="62" rx="26" fill="url(#toast)" stroke="#b87a2c" stroke-width="4"/>
<path d="M-120 70 H120" stroke="#8e5316" stroke-width="5" opacity=".35" stroke-linecap="round"/>
${fill}
<clipPath id="bt"><path d="M-172 -6 Q-176 -84 -100 -88 L100 -88 Q176 -84 172 -6Z"/></clipPath>
<path d="M-172 -6 Q-176 -84 -100 -88 L100 -88 Q176 -84 172 -6Z" fill="url(#toast)" stroke="#b87a2c" stroke-width="4"/>
<g clip-path="url(#bt)">${grill}</g>
<path d="M-120 -66 Q-60 -80 -10 -76" stroke="#fbe0a8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55"/>
<line x1="70" y1="-132" x2="52" y2="46" stroke="#d9b46f" stroke-width="5" stroke-linecap="round"/>
<path d="M70 -132 l36 -10 l-8 24 z" fill="#c9453a"/>`;
}

/* ---------------------------------- write -------------------------------- */
const items = {
  espresso: ['Coffee', espresso(), true],
  americano: ['Coffee', americano(), true],
  cappuccino: ['Coffee', cappuccino(), true],
  latte: ['Coffee', latte(), true],
  'flat-white': ['Coffee', flatWhite(), true],
  mocha: ['Coffee', mocha(), true],
  rooibos: ['Tea', rooibos(), false],
  chai: ['Tea', chai(), false],
  'green-tea': ['Tea', greenTea(), false],
  'iced-latte': ['Cold', icedLatte(), false],
  frappe: ['Cold', frappe(), false],
  croissant: ['Pastries', croissant(), false],
  muffin: ['Pastries', muffin(), false],
  'cinnamon-roll': ['Pastries', cinnamonRoll(), false],
  'chocolate-cake': ['Pastries', chocolateCake(), false],
  'chicken-sandwich': ['Bites', sandwich('chicken'), false],
  'cheese-sandwich': ['Bites', sandwich('cheese'), false],
};

// Subjects are drawn around (0,0); place them in the middle of the 800x600 canvas.
const place = { espresso: 1.4, 'iced-latte': 1.12, frappe: 1.0 };
for (const [slug, [cat, art, beans]] of Object.entries(items)) {
  let s = place[slug] ?? 1;
  let y = 300;
  if (['croissant', 'muffin', 'chocolate-cake', 'chicken-sandwich', 'cheese-sandwich'].includes(slug)) {
    y = 285;
    s = slug === 'chicken-sandwich' || slug === 'cheese-sandwich' ? 1.1 : 1.12;
  }
  if (['iced-latte', 'frappe'].includes(slug)) y = 305;
  if (slug === 'cinnamon-roll') s = 1.02;
  if (slug === 'espresso') s = 1.4;
  if (['americano', 'cappuccino', 'latte', 'flat-white', 'mocha', 'rooibos', 'green-tea', 'chai'].includes(slug)) s = 1.0;
  fs.writeFileSync(path.join(out, 'menu', `${slug}.svg`), scene(cat, g(400, y, s, art), { beans }));
}

/* Hero: dark espresso scene with a big cup, croissant, steam and beans */
const steam = [-40, 10, 60]
  .map((x, i) => `<path d="M${x} 0 C${x - 30} -50 ${x + 30} -90 ${x} -140 S${x - 20} -210 ${x + 10} -250" stroke="#fff" stroke-width="${10 - i * 2}" fill="none" stroke-linecap="round" opacity=".16" filter="url(#blur)"/>`)
  .join('');
const heroBeans = [[110, 150, 20, 1.6], [980, 130, -25, 1.4], [1060, 620, 50, 1.7], [90, 700, 110, 1.5], [560, 90, 70, 1.2], [1110, 380, 10, 1.1], [330, 800, 30, 1.2]]
  .map(([x, y, r, s]) => bean(x, y, r, s))
  .join('');
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
<defs>
<radialGradient id="hbg" cx=".62" cy=".5" r=".85"><stop offset="0" stop-color="#6a4129"/><stop offset=".6" stop-color="#3a2216"/><stop offset="1" stop-color="#241209"/></radialGradient>
<radialGradient id="hglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f0b36a" stop-opacity=".35"/><stop offset="1" stop-color="#f0b36a" stop-opacity="0"/></radialGradient>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
${GRADS}
</defs>
<rect width="1200" height="900" fill="url(#hbg)"/>
<circle cx="720" cy="470" r="470" fill="url(#hglow)"/>
${heroBeans}
${g(700, 450, 1.18, cappuccino())}
${g(700, 120, 1, steam)}
${g(255, 640, 0.74, croissant())}
</svg>`;
fs.writeFileSync(path.join(out, 'hero.svg'), hero);

/* Wide banner used on the About section */
const about = scene('Coffee', `${g(250, 300, 0.85, latte())}${g(590, 330, 0.8, croissant())}`, { beans: true, w: 900, h: 600 });
fs.writeFileSync(path.join(out, 'about.svg'), about);

/* Placeholder used when an image cannot be loaded */
const placeholder = scene('Coffee', g(400, 300, 1, cup({ liquid: 'milkcoffee', art: tulip(112) })), { beans: true });
fs.writeFileSync(path.join(out, 'placeholder.svg'), placeholder);

console.log(`Wrote ${Object.keys(items).length} menu images + hero, about and placeholder to ${out}`);
