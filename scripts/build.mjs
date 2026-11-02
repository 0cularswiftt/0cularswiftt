import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const CACHE = join(ROOT, 'data', 'metrics.json');
const LOGIN = process.env.PROFILE_LOGIN || '0cularswiftt';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

const SANS = "'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";

const THEMES = {
  dark: {
    bg: '#0b0d10',
    panel: '#11151a',
    border: '#22272e',
    text: '#e8eaed',
    muted: '#8b929b',
    faint: '#3a4048',
    grid: '#2a3038',
    accent: '#d2ff4d',
    accentSoft: '#d2ff4d',
    signal: '#ff5d4d',
  },
  light: {
    bg: '#ffffff',
    panel: '#f6f7f8',
    border: '#d8dde3',
    text: '#0f1215',
    muted: '#5b636c',
    faint: '#b9c0c7',
    grid: '#d3d8de',
    accent: '#4f6f00',
    accentSoft: '#7fa300',
    signal: '#d63a2b',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n, p = 2) => Number(n.toFixed(p));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function frame(w, h, t, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<defs>
<clipPath id="card"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16"/></clipPath>
${defs}
</defs>
<style>
.sans{font-family:${SANS}}
.mono{font-family:${MONO}}
</style>
<g clip-path="url(#card)">
<rect width="${w}" height="${h}" fill="${t.bg}"/>
${body}
</g>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" stroke="${t.border}"/>
</svg>
`;
}

function sectionLabel(t, x, y, label, w) {
  const lw = label.length * 7.2 + 14;
  return `<text x="${x}" y="${y}" class="mono" font-size="12" letter-spacing="1.6" fill="${t.muted}">${esc(label)}</text>
<line x1="${x + lw}" y1="${y - 4}" x2="${x + w}" y2="${y - 4}" stroke="${t.border}"/>`;
}

function typingTimeline(phrases, { slot = 4.2, type = 0.055, erase = 0.022, hold = 1.6, tick = 0.05 }) {
  const cycle = slot * phrases.length;
  const samples = [];
  for (let s = 0; s <= cycle + 1e-9; s += tick) {
    const i = Math.min(phrases.length - 1, Math.floor(s / slot));
    const local = s - i * slot;
    const len = phrases[i].length;
    const typed = Math.min(len, Math.floor(local / type));
    const typeEnd = len * type;
    let chars = typed;
    if (local > typeEnd + hold) chars = Math.max(0, len - Math.floor((local - typeEnd - hold) / erase));
    samples.push({ s, i, chars });
  }
  return { cycle, samples };
}

function header(t) {
  const W = 1200;
  const H = 340;
  const HZ = 176;
  const VX = 940;
  const rand = rng(1985);

  const verticals = [];
  for (let k = -14; k <= 14; k++) {
    const bx = VX + k * 96;
    verticals.push(`<line x1="${VX}" y1="${HZ}" x2="${bx}" y2="${H + 40}"/>`);
  }

  const period = 5.2;
  const lines = 9;
  const steps = 28;
  const ys = [];
  const ops = [];
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const z = 14 - 13 * p;
    ys.push(r(HZ + (H - HZ + 60) / z));
    ops.push(r(Math.min(1, p * 2.4), 3));
  }
  const horizontals = [];
  for (let i = 0; i < lines; i++) {
    const begin = r((-i * period) / lines, 3);
    horizontals.push(`<line x1="${VX - 900}" x2="${VX + 900}" y1="${HZ}" y2="${HZ}">
<animate attributeName="y1" values="${ys.join(';')}" dur="${period}s" begin="${begin}s" repeatCount="indefinite"/>
<animate attributeName="y2" values="${ys.join(';')}" dur="${period}s" begin="${begin}s" repeatCount="indefinite"/>
<animate attributeName="stroke-opacity" values="${ops.join(';')}" dur="${period}s" begin="${begin}s" repeatCount="indefinite"/>
</line>`);
  }

  const buildings = [];
  const windows = [];
  let x = 660;
  while (x < 1190) {
    const near = 1 - Math.min(1, Math.abs(x - VX) / 320);
    const bw = 14 + Math.floor(rand() * 26);
    const bh = 12 + Math.floor(rand() * (28 + near * 64));
    buildings.push({ x, w: bw, h: bh });
    x += bw + (rand() < 0.25 ? 2 + Math.floor(rand() * 4) : 0);
  }
  const tower = { x: VX - 10, w: 22, h: 132 };
  buildings.push(tower);

  const shapes = buildings
    .map((b) => `<rect x="${b.x}" y="${HZ - b.h}" width="${b.w}" height="${b.h}"/>`)
    .join('');

  for (const b of buildings) {
    const cols = Math.max(1, Math.floor((b.w - 4) / 5));
    const rows = Math.max(1, Math.floor((b.h - 6) / 7));
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        if (rand() > 0.12) continue;
        const wx = b.x + 3 + cx * 5;
        const wy = HZ - b.h + 5 + cy * 7;
        if (rand() < 0.22) {
          const dur = r(3 + rand() * 6, 2);
          const begin = r(rand() * 6, 2);
          windows.push(`<rect x="${wx}" y="${wy}" width="2" height="3" fill="${t.accent}"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.7;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></rect>`);
        } else {
          windows.push(`<rect x="${wx}" y="${wy}" width="2" height="3" fill="${t.muted}" opacity="0.55"/>`);
        }
      }
    }
  }

  const antenna = `<line x1="${tower.x + tower.w / 2}" y1="${HZ - tower.h}" x2="${tower.x + tower.w / 2}" y2="${HZ - tower.h - 22}" stroke="${t.muted}"/>
<circle cx="${tower.x + tower.w / 2}" cy="${HZ - tower.h - 23}" r="2.2" fill="${t.signal}"><animate attributeName="opacity" values="1;0.15;1" dur="2.4s" repeatCount="indefinite"/></circle>`;

  const phrases = [
    'lua · typescript · react',
    'qbox / qb-core / esx — one bridge',
    'server-authoritative gameplay systems',
    'interfaces that feel built, not generated',
  ];
  const FS = 18;
  const CW = FS * 0.6;
  const TX = 92;
  const TY = 280;
  const tl = typingTimeline(phrases, {});
  const keyTimes = tl.samples.map((s) => r(s.s / tl.cycle, 4)).join(';');
  const typed = phrases
    .map((p, i) => {
      const widths = tl.samples.map((s) => (s.i === i ? r(s.chars * CW) : 0)).join(';');
      return `<clipPath id="tp${i}"><rect x="${TX}" y="${TY - 20}" width="${i === 0 ? r(p.length * CW) : 0}" height="28"><animate attributeName="width" values="${widths}" keyTimes="${keyTimes}" calcMode="discrete" dur="${tl.cycle}s" repeatCount="indefinite"/></rect></clipPath>
<text x="${TX}" y="${TY}" class="mono" font-size="${FS}" fill="${t.text}" textLength="${r(p.length * CW)}" lengthAdjust="spacing" clip-path="url(#tp${i})">${esc(p)}</text>`;
    })
    .join('\n');
  const cursorX = tl.samples.map((s) => r(TX + s.chars * CW + 2)).join(';');
  const cursor = `<rect x="${r(TX + phrases[0].length * CW + 2)}" y="${TY - 15}" width="9" height="19" fill="${t.accent}">
<animate attributeName="x" values="${cursorX}" keyTimes="${keyTimes}" calcMode="discrete" dur="${tl.cycle}s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite"/>
</rect>`;

  const defs = `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${t.grid}"/></pattern>
<radialGradient id="dotfade" cx="0.22" cy="0.35" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="dotmask"><rect width="${W}" height="${H}" fill="url(#dotfade)"/></mask>
<linearGradient id="hfade" x1="560" x2="900" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="sidemask"><rect width="${W}" height="${H}" fill="url(#hfade)"/></mask>
<linearGradient id="vfade" x1="0" x2="0" y1="${HZ}" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.05"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="floormask"><rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#vfade)"/></mask>
<linearGradient id="glow" x1="0" x2="0" y1="${HZ - 40}" y2="${HZ + 30}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.accent}" stop-opacity="0"/><stop offset="0.57" stop-color="${t.accent}" stop-opacity="0.10"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient>`;

  const body = `<rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotmask)" opacity="0.7"/>
<g mask="url(#sidemask)">
<rect x="560" y="${HZ - 40}" width="${W - 560}" height="70" fill="url(#glow)"/>
<g mask="url(#floormask)" stroke="${t.grid}" stroke-width="1">${verticals.join('')}</g>
<g mask="url(#floormask)" stroke="${t.accentSoft}" stroke-width="1" stroke-opacity="0">${horizontals.join('')}</g>
<g fill="${t.bg}" stroke="${t.faint}" stroke-width="1">${shapes}</g>
${windows.join('')}
${antenna}
<line x1="560" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="${t.muted}" stroke-opacity="0.7"/>
</g>
<g>
<animate attributeName="opacity" from="0" to="1" dur="0.9s" begin="0.1s" fill="freeze"/>
<animateTransform attributeName="transform" type="translate" from="0 8" to="0 0" dur="0.9s" begin="0.1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.8 0.2 1"/>
<text x="64" y="74" class="mono" font-size="13" letter-spacing="1.4" fill="${t.muted}">0CULARSWIFTT <tspan fill="${t.faint}">/</tspan> CREATIVE STORE</text>
<text x="60" y="176" class="sans" font-size="96" font-weight="700" letter-spacing="-4" fill="${t.text}"><tspan fill="${t.accent}">0</tspan>cular</text>
<text x="64" y="220" class="sans" font-size="21" fill="${t.muted}">Gameplay systems &amp; interface engineering for FiveM.</text>
</g>
<polyline points="66,268 76,275 66,282" stroke="${t.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
${typed}
${cursor}
<text x="${W - 40}" y="48" text-anchor="end" class="mono" font-size="12" fill="${t.faint}">vec3(-75.0, -818.0, 326.2)</text>
<text x="${W - 40}" y="${H - 28}" text-anchor="end" class="mono" font-size="12" fill="${t.faint}">oslo · los santos</text>`;

  return frame(W, H, t, body, defs);
}

const STACK = [
  { label: 'RUNTIME', items: ['CitizenFX / FiveM', 'Lua 5.4', 'ox_lib · oxmysql', 'txAdmin'] },
  { label: 'FRAMEWORKS', items: ['Qbox', 'QBCore', 'ESX', 'Agnostic bridges'] },
  { label: 'INTERFACE', items: ['React + TypeScript', 'Vite', 'Tailwind CSS', 'NUI / CEF tuning'] },
  { label: 'DATA & WORLD', items: ['MySQL / MariaDB', 'Python tooling', 'CodeWalker pipeline', 'MLO interiors'] },
];

function stack(t) {
  const W = 1200;
  const H = 250;
  const colW = (W - 128) / STACK.length;
  const cols = STACK.map((c, ci) => {
    const x = 64 + ci * colW;
    const items = c.items
      .map(
        (it, ii) => `<text x="${x}" y="${120 + ii * 30}" class="mono" font-size="11" fill="${t.faint}">${String(ii + 1).padStart(2, '0')}</text>
<text x="${x + 28}" y="${120 + ii * 30}" class="sans" font-size="17" fill="${t.text}">${esc(it)}</text>`,
      )
      .join('\n');
    const rule = ci > 0 ? `<line x1="${x - 24}" y1="84" x2="${x - 24}" y2="${H - 40}" stroke="${t.border}"/>` : '';
    return `${rule}
<rect x="${x}" y="75" width="6" height="6" fill="${t.accent}"/>
<text x="${x + 14}" y="82" class="mono" font-size="12" letter-spacing="1.4" fill="${t.muted}">${esc(c.label)}</text>
${items}`;
  }).join('\n');
  const body = `${sectionLabel(t, 64, 44, 'STACK', W - 128)}
${cols}`;
  return frame(W, H, t, body);
}

function monotone(pts) {
  const n = pts.length;
  if (n < 2) return '';
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    m[i] = (pts[i + 1].y - pts[i].y) / dx[i];
  }
  const tg = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) tg[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tg[i] = (w1 + w2) / (w1 / m[i - 1] + w2 / m[i]);
    }
  }
  tg[n - 1] = m[n - 2];
  let d = `M${r(pts[0].x)},${r(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${r(pts[i].x + h)},${r(pts[i].y + h * tg[i])} ${r(pts[i + 1].x - h)},${r(pts[i + 1].y - h * tg[i + 1])} ${r(pts[i + 1].x)},${r(pts[i + 1].y)}`;
  }
  return d;
}

function activity(t, mtx) {
  const W = 1200;
  const H = 380;
  const CX = 400;
  const CY = 92;
  const CW = W - CX - 64;
  const CH = 150;
  const weeks = mtx.weeks.length ? mtx.weeks : [0];
  const max = Math.max(4, ...weeks);
  const ceil = Math.ceil(max / 4) * 4;
  const step = weeks.length > 1 ? CW / (weeks.length - 1) : CW;
  const pts = weeks.map((v, i) => ({ x: CX + i * step, y: CY + CH - (v / ceil) * CH }));
  const line = monotone(pts);
  const area = `${line} L${r(CX + CW)},${CY + CH} L${CX},${CY + CH} Z`;
  const last = pts[pts.length - 1];

  const gridLines = [0, 0.5, 1]
    .map((f) => {
      const y = r(CY + CH - f * CH);
      return `<line x1="${CX}" y1="${y}" x2="${CX + CW}" y2="${y}" stroke="${t.border}" ${f === 0 ? '' : 'stroke-dasharray="2 5"'}/>
<text x="${CX - 12}" y="${y + 4}" text-anchor="end" class="mono" font-size="11" fill="${t.faint}">${r(ceil * f, 0)}</text>`;
    })
    .join('\n');

  const months = [];
  let prev = '';
  mtx.weekStarts.forEach((d, i) => {
    const mo = new Date(`${d}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
    if (mo !== prev && i > 0 && i < mtx.weekStarts.length - 2) {
      months.push(`<text x="${r(CX + i * step)}" y="${CY + CH + 24}" text-anchor="middle" class="mono" font-size="10.5" letter-spacing="0.8" fill="${t.faint}">${mo}</text>`);
    }
    prev = mo;
  });

  const stats = [
    ['CONTRIBUTIONS', mtx.total.toLocaleString('en-US'), 'rolling 52 weeks'],
    ['CURRENT STREAK', `${mtx.current}d`, mtx.current ? 'still going' : 'resets daily'],
    ['LONGEST STREAK', `${mtx.longest}d`, 'consecutive days'],
    ['PEAK DAY', String(mtx.best.count), mtx.best.date ? new Date(`${mtx.best.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '—'],
  ]
    .map(([k, v, s], i) => {
      const x = 64 + (i % 2) * 150;
      const y = 106 + Math.floor(i / 2) * 84;
      return `<text x="${x}" y="${y}" class="mono" font-size="10.5" letter-spacing="1.3" fill="${t.muted}">${k}</text>
<text x="${x}" y="${y + 36}" class="sans" font-size="32" font-weight="600" letter-spacing="-1" fill="${t.text}">${esc(v)}</text>
<text x="${x}" y="${y + 56}" class="mono" font-size="10.5" fill="${t.faint}">${esc(s)}</text>`;
    })
    .join('\n');

  const langs = mtx.languages;
  const total = langs.reduce((a, l) => a + l.bytes, 0) || 1;
  const top = langs.slice(0, 5);
  const rest = langs.slice(5).reduce((a, l) => a + l.bytes, 0);
  if (rest > 0) top.push({ name: 'Other', bytes: rest });
  const shades = [1, 0.62, 0.42, 0.3, 0.22, 0.16];
  const BX = 64;
  const BW = W - 128;
  const BY = 318;
  let cx = BX;
  const segs = [];
  const legend = [];
  let lx = BX;
  top.forEach((l, i) => {
    const w = Math.max(3, (l.bytes / total) * BW - 3);
    const color = i === 0 ? t.accent : t.text;
    const op = i === 0 ? 1 : shades[i];
    segs.push(`<rect x="${r(cx)}" y="${BY}" width="${r(w)}" height="8" rx="2" fill="${color}" fill-opacity="${op}"><animate attributeName="width" from="0" to="${r(w)}" dur="0.9s" begin="${r(0.3 + i * 0.08)}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.8 0.2 1"/></rect>`);
    cx += w + 3;
    const pct = `${((l.bytes / total) * 100).toFixed(1)}%`;
    legend.push(`<rect x="${lx}" y="${BY + 28}" width="7" height="7" rx="1.5" fill="${color}" fill-opacity="${op}"/>
<text x="${lx + 14}" y="${BY + 35}" class="sans" font-size="13" fill="${t.text}">${esc(l.name)} <tspan class="mono" font-size="11.5" fill="${t.muted}">${pct}</tspan></text>`);
    lx += 34 + l.name.length * 7.4 + pct.length * 7;
  });

  const defs = `<linearGradient id="area" x1="0" x2="0" y1="${CY}" y2="${CY + CH}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient>
<clipPath id="reveal"><rect x="${CX - 4}" y="${CY - 20}" width="${CW + 12}" height="${CH + 24}"><animate attributeName="width" from="0" to="${CW + 12}" dur="1.6s" begin="0.2s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/></rect></clipPath>`;

  const body = `${sectionLabel(t, 64, 44, 'ACTIVITY', W - 128)}
<line x1="${CX - 52}" y1="84" x2="${CX - 52}" y2="${CY + CH + 20}" stroke="${t.border}"/>
${stats}
${gridLines}
${months.join('\n')}
<g clip-path="url(#reveal)">
<path d="${area}" fill="url(#area)"/>
<path d="${line}" stroke="${t.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
</g>
<circle cx="${r(last.x)}" cy="${r(last.y)}" r="3.5" fill="${t.accent}"/>
<circle cx="${r(last.x)}" cy="${r(last.y)}" r="3.5" fill="none" stroke="${t.accent}"><animate attributeName="r" values="3.5;12" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/></circle>
<text x="${BX}" y="${BY - 14}" class="mono" font-size="10.5" letter-spacing="1.3" fill="${t.muted}">LANGUAGES <tspan fill="${t.faint}">· by bytes across owned repositories</tspan></text>
${segs.join('\n')}
${legend.join('\n')}`;

  return frame(W, H, t, body, defs);
}

async function gql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': `${LOGIN}-profile` },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

const QUERY = `query($login:String!){
  user(login:$login){
    contributionsCollection{ contributionCalendar{ totalContributions weeks{ firstDay contributionDays{ date contributionCount } } } }
    repositories(first:100, ownerAffiliations:OWNER, isFork:false){ nodes{ languages(first:20, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } } } }
  }
}`;

function summarize(user, cached) {
  const cal = user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const weeks = cal.weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
  const weekStarts = cal.weeks.map((w) => w.firstDay);

  let longest = 0;
  let run = 0;
  let best = { date: '', count: 0 };
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (d.contributionCount > best.count) best = { date: d.date, count: d.contributionCount };
  }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++;

  const bytes = new Map();
  for (const repo of user.repositories.nodes) {
    for (const e of repo.languages.edges) bytes.set(e.node.name, (bytes.get(e.node.name) || 0) + e.size);
  }
  let languages = [...bytes].map(([name, b]) => ({ name, bytes: b })).sort((a, b) => b.bytes - a.bytes);
  const fresh = languages.reduce((a, l) => a + l.bytes, 0);
  const prior = (cached?.languages || []).reduce((a, l) => a + l.bytes, 0);
  if (fresh === 0 || fresh < prior * 0.5) languages = cached?.languages || languages;

  return { total: cal.totalContributions, weeks, weekStarts, current, longest, best, languages };
}

async function main() {
  await mkdir(ASSETS, { recursive: true });
  await mkdir(dirname(CACHE), { recursive: true });
  const cached = await readFile(CACHE, 'utf8').then(JSON.parse).catch(() => null);

  let metrics = cached;
  if (TOKEN) {
    try {
      const { user } = await gql(QUERY, { login: LOGIN });
      metrics = summarize(user, cached);
      await writeFile(CACHE, `${JSON.stringify(metrics, null, 2)}\n`);
    } catch (err) {
      console.error(`metrics fetch failed: ${err.message}`);
    }
  }
  if (!metrics) {
    metrics = { total: 0, weeks: [], weekStarts: [], current: 0, longest: 0, best: { date: '', count: 0 }, languages: [] };
  }

  for (const [name, t] of Object.entries(THEMES)) {
    await writeFile(join(ASSETS, `header-${name}.svg`), header(t));
    await writeFile(join(ASSETS, `stack-${name}.svg`), stack(t));
    await writeFile(join(ASSETS, `activity-${name}.svg`), activity(t, metrics));
  }
  console.log(`built cards for ${LOGIN}: ${metrics.total} contributions, ${metrics.languages.length} languages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
