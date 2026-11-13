'use strict';
/* ============ THE LOST KINGDOM — core: utils, terrain, data, state ============ */
const T = THREE;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const angLerp = (a: number, b: number, t: number) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * clamp(t, 0, 1); };
function mulberry(seed: number): () => number { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rng = mulberry(20261110);
const $ = <E extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as E;

/* ---------- world layout ---------- */
const WORLD = 220, LIMIT = 203, WATER_Y = -1;
const riverX = (z: number) => -40 + 18 * Math.sin(z * 0.025);
const BRIDGE = { z: 10, x: riverX(10), half: 15, w: 2.6, y: 1.0 };
const TP = { x0: -162, x1: -78, z0: -56, z1: -24, zc: -40 };          // temple footprint
const MESA = { x: 40, z: -95, top: 14 };
const FLATS = [
  { x: 0, z: 60, r: 11, b: 12, h: 3.2 },        // shrine of awakening
  { x: 78, z: 20, r: 32, b: 16, h: 2.6 },       // Oakrest
  { x: -122, z: -40, r: 50, b: 12, h: 3 },      // temple
  { x: BRIDGE.x, z: 10, r: 20, b: 10, h: 1 },   // bridge banks
  { x: -85, z: 70, r: 11, b: 10, h: 2.6 },      // goblin camp
  { x: -95, z: 20, r: 9, b: 8, h: 2.8 },        // forest ruins
];
const ISLETS = [
  { x: riverX(-80), z: -80, h: -0.55, r: 2.6, b: 4 },   // drowned islet
  { x: -25, z: -164, h: -0.5, r: 4.5, b: 4 },           // hollow behind the waterfall
];
/* ---------- the Veilfall grotto: an enclosed cave laid out beyond the valley's edge (x > 280), reached through the
   cave mouth behind the waterfall. Its floor is a heightfield of its own: rooms and ledges cut out of solid rock,
   with chasms that drop away into the dark. ---------- */
const CAVE = { x0: 284, x1: 392, z0: -54, z1: 18, wall: 26, pit: -40 };
const inCave = (x: number, z?: number) => x > CAVE.x0 - 4;
type CaveShape = { k: 'c' | 'r' | 'p'; a: number; b: number; c: number; d: number; e: number; f: number };
/* k: c = circle (a,b centre, c radius), r = rounded rect (a,b)-(c,d), p = capsule (a,b)-(c,d) half-width e; f = floor height */
const CAVE_FLOORS: CaveShape[] = [
  { k: 'c', a: 304, b: 0, c: 7.5, d: 0, e: 0, f: 0 },          // the grotto behind the falls
  { k: 'p', a: 309, b: 0, c: 321, d: 0.5, e: 2.4, f: 0 },      // a low passage
  { k: 'c', a: 327.5, b: 0, c: 8.5, d: 0, e: 0, f: 0 },        // the bat hall
  { k: 'c', a: 327.5, b: 8.6, c: 2.9, d: 0, e: 0, f: 0 },      // the alcove with the hook
  { k: 'p', a: 334, b: 0, c: 339.6, d: 0, e: 2.6, f: 0 },      // the lip of the first chasm
  { k: 'r', a: 339, b: -4.6, c: 359.5, d: 4.6, e: 0, f: 0 },   // across it, a shelf under a cliff
  { k: 'r', a: 348, b: -15, c: 360, d: -3.6, e: 0, f: 7 },     // the upper ledge
  { k: 'r', a: 348, b: -33.5, c: 360, d: -14.5, e: 0, f: 7 },  // (cut away below: the long drop)
  { k: 'r', a: 348, b: -41, c: 360, d: -33, e: 0, f: 7 },      // the far ledge
  { k: 'r', a: 359, b: -39.5, c: 364, d: -34.5, e: 0, f: 7 },  // (cut away below: the gap the slab bridges)
  { k: 'c', a: 374, b: -37, c: 11.5, d: 0, e: 0, f: 7 },       // the vault where the golem waits
];
const CAVE_PITS: CaveShape[] = [
  { k: 'r', a: 339.7, b: -5, c: 347.4, d: 5, e: 0, f: 0 },
  { k: 'r', a: 347.6, b: -33.1, c: 360.4, d: -15.2, e: 0, f: 0 },
  { k: 'r', a: 360.1, b: -40, c: 363.3, d: -34, e: 0, f: 0 },
];
function caveSd(s: CaveShape, x: number, z: number) {
  if (s.k === 'c') return Math.hypot(x - s.a, z - s.b) - s.c;
  if (s.k === 'r') { const cx = (s.a + s.c) / 2, cz = (s.b + s.d) / 2, hx = (s.c - s.a) / 2, hz = (s.d - s.b) / 2, qx = Math.abs(x - cx) - hx, qz = Math.abs(z - cz) - hz; return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0); }
  const vx = s.c - s.a, vz = s.d - s.b, t = clamp(((x - s.a) * vx + (z - s.b) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(x - s.a - vx * t, z - s.b - vz * t) - s.e;
}
const caveNoise = (x: number, z: number) => Math.sin(x * 0.71 + Math.sin(z * 0.43) * 2.1) * Math.cos(z * 0.67 + Math.sin(x * 0.29) * 1.7);
function caveH(x: number, z: number): number {
  const wob = caveNoise(x, z) * 0.55 + Math.sin(x * 2.1 + z * 1.7) * 0.12;
  let h = CAVE.wall + caveNoise(x * 0.3, z * 0.3) * 3;
  for (const s of CAVE_FLOORS) { const sd = caveSd(s, x, z) + wob; if (sd < 0.7) h = lerp(h, s.f + caveNoise(x * 1.9, z * 1.9) * 0.06, smooth(0.7, -0.25, sd)); }
  for (const s of CAVE_PITS) { const sd = caveSd(s, x, z) + wob * 0.35; if (sd < 0.4) h = lerp(h, CAVE.pit, smooth(0.4, -0.45, sd)); }
  return h;
}
/* the cave's vaulted roof: high enough for the camera, low enough to close the space in */
const caveCeil = (x: number, z: number) => 17 + caveNoise(x * 0.45 + 3, z * 0.45) * 1.8 + Math.sin(x * 0.13) * 0.8;
/* open water: the valley's river and lakes; the grotto has none, only chasms */
const waterAt = (x: number) => inCave(x) ? -1000 : WATER_Y;
function terrainH(x: number, z: number): number {
  if (inCave(x)) return caveH(x, z);
  let h = 3 + 3 * Math.sin(x * 0.021) * Math.cos(z * 0.023) + 1.6 * Math.sin(x * 0.052 + 1.3) * Math.sin(z * 0.047 + 0.7)
    + 0.5 * Math.sin(x * 0.13 + z * 0.05) * Math.cos(z * 0.11);
  const d = Math.hypot(x, z);
  if (d > 165) { const m = (d - 165) / 45, rg = Math.abs(Math.sin(x * 0.045 + Math.sin(z * 0.031) * 2.2) * Math.cos(z * 0.052 + Math.sin(x * 0.027) * 1.7)); h += m * m * (12 + 9 * rg) + m * 4 * (1 + Math.sin(x * 0.09) * Math.cos(z * 0.08)) + m * 2 * Math.sin(x * 0.21 + z * 0.17); }
  const dm = Math.hypot(x - MESA.x, z - MESA.z);
  if (dm < 17) h = lerp(h, MESA.top, smooth(16, 11, dm));
  for (let i = 0; i < FLATS.length; i++) {
    const f = FLATS[i], df = Math.hypot(x - f.x, z - f.z);
    if (df < f.r + f.b) h = lerp(h, f.h, smooth(f.r + f.b, f.r, df));
  }
  const dx = x - riverX(z);
  if (dx > -30 && dx < 30) h = lerp(h, -3.4, Math.min(1, Math.exp(-dx * dx / 70) * 1.25));
  for (let i = 0; i < ISLETS.length; i++) {
    const s = ISLETS[i], ds = Math.hypot(x - s.x, z - s.z);
    if (ds < s.r + s.b) h = lerp(h, s.h, smooth(s.r + s.b, s.r, ds));
  }
  return h;
}
const onBridge = (x: number, z: number, pad = 0) => Math.abs(z - BRIDGE.z) < BRIDGE.w + pad && Math.abs(x - BRIDGE.x) < BRIDGE.half + pad;
function groundAt(x: number, z: number): number {
  let h = terrainH(x, z);
  if (onBridge(x, z)) h = Math.max(h, BRIDGE.y);
  return h;
}
/* the floor under something at height y: the bridge deck counts only for what is already up at deck level,
   so you can swim (or shoot) underneath it */
const BRIDGE_UNDER = BRIDGE.y - 0.85, BRIDGE_SOFFIT = BRIDGE.y - 0.5;
function floorAt(x: number, z: number, y: number): number {
  const h = terrainH(x, z);
  return onBridge(x, z) && y > BRIDGE_UNDER ? Math.max(h, BRIDGE.y) : h;
}
/* too little headroom under the deck to pass: the bank where it runs up under the bridge */
const bridgeLowGap = (x: number, z: number, y: number, r: number) => y <= BRIDGE_UNDER && onBridge(x, z, r) && Math.max(terrainH(x, z), WATER_Y - 0.95) > BRIDGE_SOFFIT - 1.75;
const inTemple = (x: number, z: number, pad = 0) => x > TP.x0 - pad && x < TP.x1 + pad && z > TP.z0 - pad && z < TP.z1 + pad;

const PATHS = [
  [[0, 60], [30, 42], [52, 22], [78, 20]],
  [[0, 60], [-14, 28], [-20, 10], [-51, 10], [-64, -14], [-76, -40]],
  [[78, 20], [60, -30], [46, -74]],
];
function pathDist(x: number, z: number): number {
  let best = 1e9;
  for (const p of PATHS) for (let i = 0; i < p.length - 1; i++) {
    const ax = p[i][0], az = p[i][1], bx = p[i + 1][0], bz = p[i + 1][1];
    const vx = bx - ax, vz = bz - az, t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
    const d = Math.hypot(x - ax - vx * t, z - az - vz * t);
    if (d < best) best = d;
  }
  return best;
}
/* writes rgb (0..1) into out[0..2] */
function terrainColor(x: number, z: number, h: number, out: number[]) {
  const n = 0.5 + 0.5 * Math.sin(x * 0.31 + Math.sin(z * 0.17) * 2) * Math.cos(z * 0.27 + Math.sin(x * 0.11));
  const big = 0.5 + 0.5 * Math.sin(x * 0.037 + Math.sin(z * 0.021) * 2.4) * Math.cos(z * 0.043 - Math.sin(x * 0.019) * 1.8);
  const west = smooth(4, -14, x - riverX(z));
  // meadow: fresh green drifting to sun-bleached yellow-green; forest floor: deep cool green
  let r = lerp(lerp(0.36, 0.60, big * 0.75 + n * 0.25), lerp(0.17, 0.27, n), west);
  let g = lerp(lerp(0.66, 0.78, big * 0.6 + n * 0.4), lerp(0.46, 0.58, n * 0.6 + big * 0.4), west);
  let b = lerp(lerp(0.22, 0.27, n), lerp(0.24, 0.31, n), west);
  const slope = Math.max(Math.abs(terrainH(x + 1.2, z) - h), Math.abs(terrainH(x, z + 1.2) - h)) / 1.2;
  const alp = smooth(12, 30, h); r = lerp(r, 0.27 + n * 0.08, alp); g = lerp(g, 0.47 + n * 0.08, alp); b = lerp(b, 0.33, alp);
  const pd = pathDist(x, z);
  const dirt = Math.max(smooth(3.0, 1.3, pd) * (0.75 + n * 0.25), 0.5 * smooth(27, 15, Math.hypot(x - 78, z - 20)));
  r = lerp(r, 0.76, dirt); g = lerp(g, 0.63, dirt); b = lerp(b, 0.43, dirt);
  const band = 0.5 + 0.5 * Math.sin(h * 0.55 + n * 2.5), rock = smooth(0.8, 1.35, slope) * (1 - alp * 0.55) + alp * smooth(1.5, 2.6, slope) * 0.55 + smooth(40, 56, h) * 0.5;
  r = lerp(r, 0.50 + band * 0.1, rock); g = lerp(g, 0.55 + band * 0.09, rock); b = lerp(b, 0.62 + band * 0.07, rock);
  const sand = smooth(0.35, -0.6, h);
  r = lerp(r, 0.86, sand); g = lerp(g, 0.79, sand); b = lerp(b, 0.56, sand);
  const snow = smooth(44, 60, h + n * 8) * smooth(2.4, 1.0, slope);
  r = lerp(r, 0.95, snow); g = lerp(g, 0.97, snow); b = lerp(b, 1, snow);
  out[0] = r; out[1] = g; out[2] = b;
}

/* ---------- data ---------- */
const ITEMS: Record<string, ItemDef> = {
  potion: { n: 'Healing Draught', c: 'Potions', d: 'Brewed from silverleaf. Restores 50 health.', use: 1 },
  berry: { n: 'Sunberries', c: 'Food', d: 'Sweet and bright. Restores 12 health.', use: 1 },
  roast: { n: 'Roasted Boar', c: 'Food', d: 'A hearty meal. Restores 35 health and all stamina.', use: 1 },
  herb: { n: 'Silverleaf', c: 'Materials', d: 'A pale herb that grows near old stones.' },
  wood: { n: 'Deadwood', c: 'Materials', d: 'Dry branches. Good for shafts and cookfires.' },
  stone: { n: 'Flint', c: 'Materials', d: 'Sharp enough for arrowheads.' },
  crystal: { n: 'Echo Crystal', c: 'Materials', d: 'It hums faintly. Smiths prize it.' },
  fang: { n: 'Goblin Fang', c: 'Materials', d: 'Merchants pay a little for these.' },
  meat: { n: 'Raw Boar Meat', c: 'Materials', d: 'Cook it with deadwood.' },
  core: { n: 'Sentinel Core', c: 'Materials', d: 'The cold heart of a hollow sentinel.' },
  arrow: { n: 'Arrows', c: 'Weapons', d: 'Ashwood shafts with flint heads.' },
  shard: { n: 'Sunstone Shard', c: 'Quest items', d: 'Warm to the touch, even at night.' },
  key: { n: 'Temple Key', c: 'Quest items', d: 'Three shards bound in gold wire. Opens the Temple of Echoes.' },
  heart: { n: 'Heart of the Forest', c: 'Artifacts', d: 'It beats slowly. It seems to know you.' },
  hook: { n: 'Grappling Hook', c: 'Tools', d: 'Aim at a glowing ring and press G (or the middle mouse button) to reel yourself to it.' },
  stoneheart: { n: 'Golem Heartstone', c: 'Artifacts', d: 'The vault golem’s crystal heart. It steadies your own.' },
  relic: { n: 'Eldorian Relic', c: 'Collectibles', d: 'A coin-sized seal from the lost kingdom. Five were hidden in the valley.' },
};
const RECIPES: Recipe[] = [
  { out: 'potion', n: 1, need: { herb: 3 }, label: 'Brew a Healing Draught' },
  { out: 'arrow', n: 5, need: { wood: 1, stone: 1 }, label: 'Fletch 5 arrows' },
  { out: 'roast', n: 1, need: { meat: 1, wood: 1 }, label: 'Roast boar meat' },
];
const SHOP = [
  { id: 'potion', price: 20 }, { id: 'arrow', n: 10, price: 15 }, { id: 'roast', price: 18 },
  { id: 'armor', price: 60, name: 'Leather Jerkin', d: 'Reduces every hit you take by 3.' },
];
const SELL: Record<string, number> = { fang: 6, core: 15, crystal: 10, meat: 4 };
const LOCS = [
  { id: 'shrine', name: 'Shrine of Awakening', x: 0, z: 60, r: 14, way: [0, 55.5] },
  { id: 'village', name: 'Oakrest', x: 78, z: 20, r: 26, way: [70, 11] },
  { id: 'bridge', name: 'Old Stonebridge', x: BRIDGE.x, z: 10, r: 12 },
  { id: 'camp', name: 'Fangmoot Camp', x: -85, z: 70, r: 16 },
  { id: 'ruins', name: 'Mossfall Ruins', x: -95, z: 20, r: 12 },
  { id: 'mesa', name: 'Hawk’s Rest', x: MESA.x, z: MESA.z, r: 9, way: [43, -92] },
  { id: 'falls', name: 'Veilfall', x: -25, z: -150, r: 16 },
  { id: 'islet', name: 'Drowned Islet', x: riverX(-80), z: -80, r: 6 },
  { id: 'temple', name: 'Temple of Echoes', x: -74, z: -40, r: 12, way: [-71, -32] },
];

/* ---------- state ---------- */
const SAVE_KEY = 'tlk_save_v1', SET_KEY = 'tlk_settings_v1';
function newState(): GameState {
  return {
    v: 1, time: 0.32, playTime: 0,
    p: { x: 0, y: 3.2, z: 66, yaw: Math.PI, hp: 100, maxHp: 100, st: 100, maxSt: 100, mp: 50, maxMp: 50, level: 1, xp: 0, coins: 15,
      weapon: 'sword', swordLv: 0, armor: 0, hasBow: false, ember: false, respawn: 'shrine' },
    inv: { potion: 1, berry: 2 }, q: {}, flags: {}, disc: {}, kills: 0,
  };
}
let G = newState();
let SETTINGS = { master: 0.8, music: 0.6, sfx: 0.8, quality: 'medium', sens: 1, invertY: false };
function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(SET_KEY) || 'null'); if (s && typeof s === 'object') Object.assign(SETTINGS, s); } catch (e) { /* defaults */ }
  if (!['low', 'medium', 'high'].includes(SETTINGS.quality)) SETTINGS.quality = 'medium';
}
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(SETTINGS)); } catch (e) { /* ignore */ } }
function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !s.p || typeof s.p.x !== 'number' || !isFinite(s.p.x + s.p.y + s.p.z) || typeof s.inv !== 'object' || typeof s.q !== 'object' || typeof s.flags !== 'object') return null;
    const base = newState();
    s.p = Object.assign(base.p, s.p); s.disc = s.disc || {}; s.kills = s.kills | 0;
    s.time = typeof s.time === 'number' ? s.time : 0.32; s.playTime = s.playTime || 0;
    return s;
  } catch (e) { return null; }
}
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; } catch (e) { return false; }
}
const has = (id: string, n = 1) => (G.inv[id] || 0) >= n;
const xpNeed = (lv: number) => 60 + (lv - 1) * 45;
const swordDmg = () => 14 + 6 * G.p.swordLv + (G.p.level - 1);
