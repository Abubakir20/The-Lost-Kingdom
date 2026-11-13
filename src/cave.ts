/* ============ the Veilfall grotto: the cave behind the waterfall, the grappling hook, cave bats and the vault golem ============
   The grotto is laid out beyond the valley's edge (see CAVE in core.ts) and reached through the cave mouth behind the
   falls. Its own random stream keeps the valley's shared sequence untouched. */
const crng = mulberry(31337);
const CAVE_IN = { x: 301.2, z: 0.4 }, CAVE_OUT = { x: -26.5, z: -166.4 }, CAVE_MOUTH = { x: -27.5, z: -169.9 };
const ARENA = { x: 374, z: -37, r: 9.6, y: 7 };
/* where a fall into a chasm puts you back: the last safe ground, checked to be flat all round */
const caveSafe = { x: CAVE_IN.x, z: CAVE_IN.z };
let caveAmt = 0, golemFight = false, golem: Enemy | null = null;

/* ---------- the cave mouth behind the falls ---------- */
{
  const g = grpAt(CAVE_MOUTH.x, -0.6, CAVE_MOUTH.z - 0.9, 0, scene);
  const dark = new T.Mesh(new T.CircleGeometry(1, 28), new T.MeshBasicMaterial({ color: 0x05080a }));
  dark.scale.set(2.1, 2.9, 1); dark.position.set(0, 2.2, 0); g.add(dark);
  const rock = painted(new T.MeshToonMaterial({ color: 0x7a8580, gradientMap: TOON, vertexColors: true }), 'cliff', 0.14, 0.9), rg = puffGeo(1, 0.3, true);
  for (const [x, y, z, sx, sy, sz] of [[-2.6, 1.6, 0.3, 1.2, 2.6, 1.1], [2.5, 1.4, 0.3, 1.1, 2.4, 1.1], [0, 4.9, 0.3, 3.0, 1.0, 1.1], [-1.9, 4.0, 0.4, 1.0, 1.0, 1], [1.9, 3.9, 0.4, 1.0, 1.1, 1]])
    { const m = mesh(rg, rock, x, y, z, g); m.scale.set(sx, sy, sz); }
  for (let k = 0; k < 6; k++) mesh(cyl(0.03, 0.03, 1.4 + k * 0.3, 4), lam(VINE), -1.6 + k * 0.62, 4.6 - k * 0.12, 0.9, g, true);
  halo(g, 0, 1.8, -0.4, 4, 0x7ff3e0, 0.12);
}
addInteract({ x: CAVE_MOUTH.x, z: CAVE_MOUTH.z + 0.3, r: 2.7, label: () => 'Enter the cave', act: () => enterCave() });

/* ---------- the cave itself ---------- */
const CAVE_ROOT = new T.Group(); scene.add(CAVE_ROOT); CAVE_ROOT.visible = false;
const caveRock = painted(new T.MeshToonMaterial({ color: 0xffffff, gradientMap: TOON, vertexColors: true }), 'cliff', 0.16, 0.85);
/* floor and walls: one heightfield over the whole grotto; colour carries rock, damp, moss and the dark of the drops */
{
  const S = 0.6, nx = Math.ceil((CAVE.x1 - CAVE.x0) / S), nz = Math.ceil((CAVE.z1 - CAVE.z0) / S);
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3), col = new Float32Array((nx + 1) * (nz + 1) * 3), idx: number[] = [];
  const H: number[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) H.push(caveH(CAVE.x0 + i * S, CAVE.z0 + j * S));
  const at = (i: number, j: number) => H[clamp(j, 0, nz) * (nx + 1) + clamp(i, 0, nx)];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = CAVE.x0 + i * S, z = CAVE.z0 + j * S, h = at(i, j), k = (j * (nx + 1) + i) * 3;
    pos[k] = x; pos[k + 1] = Math.min(h, caveCeil(x, z) + 1.5); pos[k + 2] = z;
    const sl = Math.max(Math.abs(at(i + 1, j) - at(i - 1, j)), Math.abs(at(i, j + 1) - at(i, j - 1))) / (2 * S);
    let wallNear = 0; for (const [di, dj] of [[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, -2], [2, -2], [-2, 2]]) wallNear = Math.max(wallNear, at(i + di, j + dj) - h);
    const n = 0.5 + 0.5 * caveNoise(x * 1.3, z * 1.3), floor = smooth(0.9, 0.3, sl);
    let r = lerp(0.36, 0.5, n), g = lerp(0.38, 0.49, n), b = lerp(0.43, 0.5, n);
    r = lerp(r, 0.55 + n * 0.08, floor); g = lerp(g, 0.52 + n * 0.07, floor); b = lerp(b, 0.47 + n * 0.05, floor);
    const moss = floor * smooth(0.55, 0.85, 0.5 + 0.5 * caveNoise(x * 0.5 + 7, z * 0.5)) * 0.55;
    r = lerp(r, 0.3, moss); g = lerp(g, 0.5, moss); b = lerp(b, 0.3, moss);
    const ao = floor > 0.5 ? 1 - 0.35 * smooth(0.5, 4, wallNear) : 1 - 0.25 * smooth(4, 18, h);
    const deep = smooth(-1.5, -14, h);
    const k2 = ao * (1 - deep * 0.94);
    col[k] = r * k2; col[k + 1] = g * k2; col[k + 2] = b * k2 * (1 + deep * 0.4);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new T.Mesh(geo, caveRock); m.receiveShadow = true; CAVE_ROOT.add(m);
  /* the roof, facing down */
  const rp = new Float32Array(pos.length), rc = new Float32Array(col.length);
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = CAVE.x0 + i * S, z = CAVE.z0 + j * S, k = (j * (nx + 1) + i) * 3, n = 0.5 + 0.5 * caveNoise(x * 2.1, z * 2.1);
    rp[k] = x; rp[k + 1] = caveCeil(x, z) + Math.max(0, n - 0.6) * 1.2; rp[k + 2] = z; rc[k] = 0.26 + n * 0.08; rc[k + 1] = 0.28 + n * 0.08; rc[k + 2] = 0.32 + n * 0.07;
  }
  const ri: number[] = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; ri.push(a, b, c, b, d, c); }
  const rg2 = new T.BufferGeometry(); rg2.setAttribute('position', new T.BufferAttribute(rp, 3)); rg2.setAttribute('color', new T.BufferAttribute(rc, 3)); rg2.setIndex(ri); rg2.computeVertexNormals();
  CAVE_ROOT.add(new T.Mesh(rg2, caveRock));
}
/* where open floor is (for scattering dressing) */
const caveFloorAt = (x: number, z: number) => { const h = caveH(x, z); return h > -1 && h < 8 ? h : null; };
/* dressing: stalactites, stalagmites, crystals, mushrooms */
const CAVE_CRYSTALS: { x: number; y: number; z: number; c: number }[] = [];
function crystalCluster(par: THREE.Object3D, x: number, y: number, z: number, s: number, c: number, light = true) {
  const n = 3 + (crng() * 4 | 0);
  for (let k = 0; k < n; k++) { const h = (0.5 + crng() * 1.1) * s, m = mesh(new T.ConeGeometry(0.16 * s + crng() * 0.08 * s, h, 5), glowMat(c), x + (crng() - 0.5) * 0.7 * s, y + h * 0.42, z + (crng() - 0.5) * 0.7 * s, par, true); m.rotation.set((crng() - 0.5) * 0.9, crng() * 3, (crng() - 0.5) * 0.9); }
  halo(par as THREE.Group, x, y + 0.6 * s, z, 3.2 * s, c, 0.4);
  if (light) CAVE_CRYSTALS.push({ x, y: y + 0.8, z, c });
}
{
  const g = new T.Group(); CAVE_ROOT.add(g);
  const stone = painted(new T.MeshToonMaterial({ color: 0x8b928f, gradientMap: TOON }), 'cliff', 0.3, 0.8);
  for (let k = 0; k < 520; k++) {
    const x = lerp(CAVE.x0 + 2, CAVE.x1 - 2, crng()), z = lerp(CAVE.z0 + 2, CAVE.z1 - 2, crng()), f = caveH(x, z), top = caveCeil(x, z);
    if (f > 9 && f < top - 0.5) continue;                       // inside rock
    if (f > top - 0.5) continue;
    const L = 0.8 + crng() * 2.6, m = mesh(new T.ConeGeometry(0.18 + L * 0.09, L, 6), stone, x, top - L / 2 + 0.2, z, g, true); m.rotation.x = Math.PI;
    if (crng() < 0.25) { const L2 = L * 0.5; mesh(new T.ConeGeometry(0.1 + L2 * 0.08, L2, 5), stone, x + 0.35, top - L2 / 2 + 0.1, z - 0.2, g, true).rotation.x = Math.PI; }
  }
  for (let k = 0; k < 900; k++) {
    const x = lerp(CAVE.x0 + 2, CAVE.x1 - 2, crng()), z = lerp(CAVE.z0 + 2, CAVE.z1 - 2, crng()), f = caveFloorAt(x, z);
    if (f === null) continue;
    let wall = 0; for (const [dx, dz] of [[1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]]) wall = Math.max(wall, caveH(x + dx, z + dz) - f);
    if (wall < 3) continue;                                       // only against the walls, out of the way
    const r = crng();
    if (r < 0.45) { const L = 0.6 + crng() * 1.8; mesh(new T.ConeGeometry(0.2 + L * 0.12, L, 6), stone, x, f + L / 2 - 0.1, z, g); }
    else if (r < 0.6) crystalCluster(g, x, f, z, 0.6 + crng() * 0.6, crng() < 0.7 ? 0x7ff3e0 : 0xb48cff, crng() < 0.35);
    else if (r < 0.75) { for (let q = 0; q < 3; q++) { const mx = x + (crng() - 0.5) * 0.8, mz = z + (crng() - 0.5) * 0.8, s = 0.12 + crng() * 0.16; mesh(cyl(0.025, 0.035, s * 1.6, 5), lam(0xe8e0cc), mx, f + s * 0.8, mz, g, true); mesh(new T.SphereGeometry(s, 8, 5, 0, 6.3, 0, 1.4), glowMat(0x9fe8ff), mx, f + s * 1.6, mz, g, true); } }
  }
  /* the faint far-down glow that says how deep the drops go */
  /* daylight through the falls at the grotto's mouth */
  halo(g, 297.5, 2.2, 0.4, 5, 0xcff6ff, 0.18); halo(g, 297, 3.5, 0.4, 9, 0x9fdcff, 0.08);
  bake(g, false);
}
/* torches: an iron cage on a post, a flickering flame */
const CAVE_TORCHES: THREE.Mesh[] = [];
function caveTorch(x: number, z: number) {
  const y = caveH(x, z), g = grpAt(x, y, z, 0, CAVE_ROOT);
  mesh(cyl(0.07, 0.09, 1.7, 6), lam(0x3a2a20), 0, 0.85, 0, g); mesh(cyl(0.22, 0.14, 0.26, 6), lam(0x2a2a2e), 0, 1.78, 0, g);
  const f = mesh(new T.ConeGeometry(0.17, 0.5, 6), glowMat(0xffb04a), 0, 2.1, 0, g, true); CAVE_TORCHES.push(f);
  halo(g, 0, 2.1, 0, 3.4, 0xffa040, 0.65); addCircle(x, z, 0.3);
}
[[302, -4.5], [302, 5], [316, 2.9], [323, -6.5], [331, 6.2], [337, -2.5], [352, 3.5], [357, -3], [350, -9], [358, -12.5], [350, -38], [358, -39.5], [366, -31], [366, -43], [381, -30], [381, -44]].forEach(([x, z]) => caveTorch(x, z));
/* the way out: back through the falls */
addInteract({ x: 299.6, z: 0.4, r: 2.6, label: () => inCave(PL.pos.x) ? 'Leave the cave' : null, act: () => leaveCave() });

/* ---------- grapple rings ---------- */
interface GrappleRing { x: number; y: number; z: number; land: number[] | null; pull: (() => void) | null; on: () => boolean; m: THREE.Group; glow: THREE.Sprite; ry: number }
const RINGS: GrappleRing[] = [];
const ringMat = new T.MeshToonMaterial({ color: GOLD, gradientMap: TOON, emissive: 0x3a2a08 });
function grappleRing(x: number, y: number, z: number, ry: number, land: number[] | null, opts: { chain?: boolean; pull?: () => void; on?: () => boolean; par?: THREE.Object3D } = {}) {
  const g = grpAt(x, y, z, ry, opts.par || CAVE_ROOT);
  const t = mesh(new T.TorusGeometry(0.42, 0.075, 8, 20), ringMat, 0, 0, 0, g); t.userData.ring = 1;
  mesh(new T.TorusGeometry(0.42, 0.025, 4, 20), glowMat(0xfff0b0), 0, 0, 0, g, true);
  if (opts.chain) { const top = caveCeil(x, z), L = top - y; mesh(cyl(0.04, 0.04, L, 4), lam(0x3a3a40), 0, L / 2 + 0.42, 0, g); }
  else mesh(bx(0.16, 0.16, 0.5), lam(0x3a3a40), 0, 0.5, -0.12, g);
  const glow = halo(g, 0, 0, 0, 2.2, GOLD, 0.35);
  const r: GrappleRing = { x, y, z, land, pull: opts.pull || null, on: opts.on || (() => true), m: g, glow, ry };
  RINGS.push(r); return r;
}
/* ---------- the slab: a carved door stone across the last gap; hook its ring and it falls to make a bridge ---------- */
const SLAB = (() => {
  const piv = grpAt(363.6, 7, -37, 0, CAVE_ROOT);           // pivots on its foot, falls toward the far ledge (−x)
  const st = painted(new T.MeshToonMaterial({ color: 0x8f9890, gradientMap: TOON }), 'stone', 0.5, 0.9);
  const body = mesh(bx(0.7, 5.6, 2.8), st, -0.35, 2.8, 0, piv);
  emblem(body as unknown as THREE.Group, -0.37, 0.6, 0, 0.9, RUNE).rotation.y = -Math.PI / 2;
  mesh(bx(0.74, 0.2, 2.9), lam(STONE_D), -0.35, 5.5, 0, piv); mesh(bx(0.74, 0.2, 2.9), lam(STONE_D), -0.35, 0.1, 0, piv);
  const box = addBox(363.2, 364.2, -38.5, -35.5), deck = addBox(359.7, 363.7, -38.3, -35.7, 7.25); deck.on = false;
  return { piv, box, deck, fall: 0 };
})();
const RING_A = grappleRing(348.2, 3.3, 0, Math.PI / 2, [350.4, 0, 0]);
const RING_B = grappleRing(354, 9.7, -3.95, 0, [354, 7, -6.2]);
const RING_C = grappleRing(354, 10.4, -21, Math.PI / 2, null, { chain: true });
const RING_D = grappleRing(354, 10.1, -28.5, Math.PI / 2, [354, 7, -35.4], { chain: true });
const RING_SLAB = grappleRing(0, 0, 0, Math.PI / 2, null, { par: SLAB.piv, pull: () => dropSlab(), on: () => !G.flags.cv_slab });
RING_SLAB.m.position.set(-0.75, 5.0, 0);
/* a world position for any ring (the slab's rides on the stone) */
const _rw = new T.Vector3();
function ringPos(r: GrappleRing, out: THREE.Vector3) { r.m.updateWorldMatrix(true, false); return out.setFromMatrixPosition(r.m.matrixWorld); }
function dropSlab() {
  if (G.flags.cv_slab) return; G.flags.cv_slab = true; SLAB.fall = 0.001; sfx('rumble'); notify('The door stone topples across the gap.'); autosave();
}

/* ---------- the hook: fire it wherever the crosshair points (rock, wood, roof, a wall), or at a ring; it flies,
   bites, and reels you in. Rings, the roof and anything overhead leave you hanging, so you can fire again. ---------- */
const HOOK = { state: 'none', ring: null as GrappleRing | null, anchor: new T.Vector3(), land: null as number[] | null, hangs: false, t: 0, dur: 0,
  from: new T.Vector3(), to: new T.Vector3(), tip: new T.Vector3(), dir: new T.Vector3(), last: null as GrappleRing | null };
const ropeMesh = mesh((() => { const g = cyl(0.035, 0.035, 1, 5); g.translate(0, 0.5, 0); return g; })(), lam(0xd8b888, { emissive: 0x3a2a14 }), 0, -99, 0, scene, true); ropeMesh.visible = false;
const hookHead = mesh(new T.ConeGeometry(0.08, 0.24, 5), lam(0xb0b4b8), 0, -99, 0, scene, true); hookHead.visible = false;
const hasHook = () => has('hook');
const HOOK_RANGE = 42;
/* what the hook would bite: a ring the camera looks almost straight at, else the first solid thing under the crosshair */
const AIM = { ring: null as GrappleRing | null, p: new T.Vector3(), land: null as number[] | null, hangs: false, ok: false };
/* the crosshair rides a little above the screen's centre, so the hero never hides what you aim at */
const AIM_Y = 0.26, _aimRay = new T.Raycaster(), _aimV = new T.Vector2();
const _aimD = new T.Vector3(), _aimO = new T.Vector3(), _near: { b: BoxCollider[]; c: CircleCollider[] } = { b: [], c: [] };
function solidAt(x: number, y: number, z: number) {
  if (terrainH(x, z) > y) return true;
  if (inCave(x) && y > caveCeil(x, z) - 0.05) return true;
  for (const b of _near.b) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) { const bt = boxTop(b, x, z); if (y < (bt !== undefined ? bt : 11)) return true; }
  for (const c of _near.c) if ((x - c.x) * (x - c.x) + (z - c.z) * (z - c.z) < c.r * c.r && y < (c.top !== undefined ? c.top : 7)) return true;
  return false;
}
function hookTarget(): GrappleRing | null { aimHook(); return AIM.ok ? AIM.ring : null; }
function aimHook() {
  AIM.ok = false; AIM.ring = null; AIM.land = null; AIM.hangs = false;
  if (!hasHook() || PL.dead || cine) return AIM;
  _aimV.set(0, AIM_Y); _aimRay.setFromCamera(_aimV, camera); _aimD.copy(_aimRay.ray.direction);
  /* a ring close to the crosshair wins */
  let bd = 0.88;
  for (const r of RINGS) {
    if (!r.on() || r === HOOK.ring) continue;
    ringPos(r, _rw); const d = _rw.distanceTo(PL.pos); if (d > HOOK_RANGE || d < 1.5) continue;
    _v4.subVectors(_rw, camera.position).normalize(); const dot = _v4.dot(_aimD); if (dot < bd || !inSight(_rw, 0.2)) continue;
    bd = dot; AIM.ring = r; AIM.p.copy(_rw); AIM.ok = true;
  }
  if (AIM.ok) return AIM;
  /* otherwise march the crosshair ray (it sits above the hero's head, see AIM_Y) out from the camera to the first solid thing */
  _aimV.set(0, AIM_Y); _aimRay.setFromCamera(_aimV, camera); _aimO.copy(_aimRay.ray.origin); _aimD.copy(_aimRay.ray.direction); const t0 = Math.max(0.5, _v4.subVectors(PL.pos, _aimO).dot(_aimD) - 0.5), t1 = t0 + HOOK_RANGE + 2;
  const ax0 = Math.min(_aimO.x + _aimD.x * t0, _aimO.x + _aimD.x * t1) - 2, ax1 = Math.max(_aimO.x + _aimD.x * t0, _aimO.x + _aimD.x * t1) + 2;
  const az0 = Math.min(_aimO.z + _aimD.z * t0, _aimO.z + _aimD.z * t1) - 2, az1 = Math.max(_aimO.z + _aimD.z * t0, _aimO.z + _aimD.z * t1) + 2;
  _near.b.length = 0; _near.c.length = 0;
  for (const b of boxes) if (b.on && b.x1 > ax0 && b.x0 < ax1 && b.z1 > az0 && b.z0 < az1) _near.b.push(b);
  for (const c of circles) if (c.on && c.x + c.r > ax0 && c.x - c.r < ax1 && c.z + c.r > az0 && c.z - c.r < az1) _near.c.push(c);
  let prev = t0, hit = -1;
  for (let t = t0; t <= t1; t += 0.3) {
    const x = _aimO.x + _aimD.x * t, y = _aimO.y + _aimD.y * t, z = _aimO.z + _aimD.z * t;
    if (!inCave(x) && y < WATER_Y && terrainH(x, z) < WATER_Y) return AIM;     // open water: nothing to bite
    if (solidAt(x, y, z)) { hit = t; break; }
    prev = t;
  }
  if (hit < 0) return AIM;
  let lo = prev, hi = hit; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (solidAt(_aimO.x + _aimD.x * m, _aimO.y + _aimD.y * m, _aimO.z + _aimD.z * m)) hi = m; else lo = m; }
  const P = AIM.p.set(_aimO.x + _aimD.x * lo, _aimO.y + _aimD.y * lo, _aimO.z + _aimD.z * lo), d = P.distanceTo(PL.pos);
  if (d > HOOK_RANGE || d < 2 || !inSight(P, 0.5)) return AIM;
  /* what kind of surface: the top of something (land on it), the underside of something (hang), or a wall (fly at it) */
  const g = terrainH(P.x, P.z), sl = Math.max(Math.abs(terrainH(P.x + 0.8, P.z) - g), Math.abs(terrainH(P.x, P.z + 0.8) - g)) / 0.8;
  if (Math.abs(g - P.y) < 0.45 && sl < 0.9 && !solidAt(P.x, g + 1.8, P.z)) AIM.land = [P.x, g, P.z];
  else { for (const b of _near.b) { const bt = boxTop(b, P.x, P.z); if (bt !== undefined && P.x > b.x0 - 0.1 && P.x < b.x1 + 0.1 && P.z > b.z0 - 0.1 && P.z < b.z1 + 0.1 && P.y > bt - 0.45) AIM.land = [P.x, bt, P.z]; }
    for (const c of _near.c) if (c.top !== undefined && Math.hypot(P.x - c.x, P.z - c.z) < c.r + 0.1 && P.y > c.top - 0.45) AIM.land = [P.x, c.top, P.z]; }
  /* a wall with its top close above the bite: pull up and over onto it (a roof, a balcony, a ledge) */
  if (!AIM.land) {
    const ix = P.x + _aimD.x * 0.6 / Math.max(0.2, Math.hypot(_aimD.x, _aimD.z)), iz = P.z + _aimD.z * 0.6 / Math.max(0.2, Math.hypot(_aimD.x, _aimD.z));
    const ct = inCave(ix) ? null : climbTop(ix, iz, P.y - 0.85), tg = terrainH(ix, iz);
    if (ct !== null && ct - P.y < 2.6 && !solidAt(ix, ct + 1.8, iz)) AIM.land = [ix, ct, iz];
    else if (tg > P.y && tg - P.y < 2.6 && !solidAt(ix, tg + 1.8, iz)) AIM.land = [ix, tg, iz];
  }
  AIM.hangs = !AIM.land && solidAt(P.x, P.y + 0.35, P.z) && !solidAt(P.x, P.y - 2.2, P.z);
  AIM.ok = true; return AIM;
}
/* a clear line from the hero's chest to a point (the last stretch, where the hook bites, is not checked) */
function inSight(p: THREE.Vector3, slack: number) {
  const sx = PL.pos.x, sy = PL.pos.y + 1.5, sz = PL.pos.z, L = Math.hypot(p.x - sx, p.y - sy, p.z - sz), n = Math.max(6, Math.ceil(L / 0.5));
  for (let i = 1; i < n; i++) { const k = i / n; if (L * (1 - k) < slack) break; const x = lerp(sx, p.x, k), y = lerp(sy, p.y, k), z = lerp(sz, p.z, k); if (terrainH(x, z) > y + 0.15 || (inCave(x) && y > caveCeil(x, z) - 0.2)) return false; }
  return true;
}
function fireHook() {
  if (!hasHook()) return;
  if (PL.swim || PL.dead || cine || HOOK.state === 'fly' || HOOK.state === 'hop' || HOOK.state === 'yank') return;
  const A = aimHook(); if (!A.ok) { sfx('deny'); return; }
  HOOK.ring = A.ring; HOOK.anchor.copy(A.p); HOOK.land = A.ring ? A.ring.land : A.land; HOOK.hangs = A.ring ? !A.ring.land && !A.ring.pull : A.hangs;
  HOOK.state = 'fly'; HOOK.t = 0; HOOK.dur = Math.max(0.1, A.p.distanceTo(PL.pos) / 60); HOOK.tip.copy(PL.pos);
  PL.atk = null; PL.hold = -1; PL.draw = -1; PL.crouch = false; PL.rollT = 0; PL.yaw = Math.atan2(A.p.x - PL.pos.x, A.p.z - PL.pos.z);
  sfx('bow'); tone(900, 0.12, 'triangle', 0.08, null, 0, 1500);
}
function hookRelease() { HOOK.state = 'none'; HOOK.ring = null; PL.grounded = false; PL.vel.set(0, 0, 0); PL.airT = 0; ropeMesh.visible = hookHead.visible = false; }
/* where the hook is now (a ring may ride on something that moves) */
function hookPoint(out: THREE.Vector3) { return HOOK.ring ? ringPos(HOOK.ring, out) : out.copy(HOOK.anchor); }
/* drives the player while the hook is out; returns true when it has taken over the frame */
function hookDrive(dt: number): boolean {
  if (HOOK.state === 'none') return false;
  const p = PL, r = HOOK.ring; if (p.dead) { hookRelease(); return false; }
  hookPoint(_rw); HOOK.t += dt;
  if (HOOK.state === 'fly') {
    hero.p.handR.getWorldPosition(_v4); HOOK.tip.lerpVectors(_v4, _rw, Math.min(1, HOOK.t / HOOK.dur));
    if (!p.grounded) p.vel.y = Math.max(p.vel.y, -2);
    if (HOOK.t >= HOOK.dur) {
      sfx('clink'); burst(_rw.x, _rw.y, _rw.z, r ? 0xfff0b0 : 0xd8d2c0, 8, 3, 0.4, 2);
      if (r && r.pull) { HOOK.state = 'yank'; HOOK.t = 0; }
      else {
        HOOK.state = 'pull'; HOOK.t = 0; HOOK.from.copy(p.pos); HOOK.dir.subVectors(_rw, p.pos).normalize();
        if (r || HOOK.hangs) HOOK.to.set(_rw.x, _rw.y - 1.95, _rw.z);                       // hands on the ring, or on the rock overhead
        else if (HOOK.land) HOOK.to.set(_rw.x - HOOK.dir.x * 0.6, _rw.y + 0.1, _rw.z - HOOK.dir.z * 0.6);   // up to the lip, then onto it
        else HOOK.to.copy(_rw).addScaledVector(HOOK.dir, -0.9).setY(_rw.y - 1.2);          // a wall: fly at it, hands at the bite
        HOOK.dur = Math.max(0.22, HOOK.from.distanceTo(HOOK.to) / 26); p.grounded = false; p.swim = false; sfx('swingBig');
      }
    }
    return !p.grounded;
  }
  HOOK.tip.copy(_rw);
  if (HOOK.state === 'yank') {
    if (HOOK.t > 0.28 && r && r.pull) { const f = r.pull; f(); CAM.shake = 0.3; }
    if (HOOK.t > 0.45) { HOOK.state = 'none'; HOOK.ring = null; }
    return false;
  }
  if (HOOK.state === 'pull') {
    const k = Math.min(1, HOOK.t / HOOK.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    p.pos.lerpVectors(HOOK.from, HOOK.to, e); p.pos.y += Math.sin(k * Math.PI) * 0.5;
    p.yaw = angLerp(p.yaw, Math.atan2(HOOK.to.x - HOOK.from.x, HOOK.to.z - HOOK.from.z), 12 * dt);
    if (Math.random() < 0.5) puff(p.pos.x, p.pos.y + 1, p.pos.z, 0xffffff, 0, 0, 0, 0.25);
    if (k >= 1) {
      if (HOOK.land) { HOOK.state = 'hop'; HOOK.t = 0; HOOK.from.copy(p.pos); HOOK.to.set(HOOK.land[0], HOOK.land[1], HOOK.land[2]); }
      else if (r || HOOK.hangs) { HOOK.state = 'hang'; HOOK.t = 0; HOOK.last = r; if (!G.flags.hangHint) { G.flags.hangHint = true; notify('Hanging. Aim and press G to swing on, or Space to let go.'); } }
      else { /* thrown at a wall: the rope lets go and you carry on, up and in */
        HOOK.state = 'none'; HOOK.ring = null; ropeMesh.visible = hookHead.visible = false;
        p.grounded = false; p.airT = 0; p.vel.set(HOOK.dir.x * 4, 6.5, HOOK.dir.z * 4); p.glideArm = false; p.wallT = 0.6;   // hold W to cling and climb
      }
    }
    return true;
  }
  if (HOOK.state === 'hop') {
    const k = Math.min(1, HOOK.t / 0.3); p.pos.lerpVectors(HOOK.from, HOOK.to, k); p.pos.y += Math.sin(k * Math.PI) * 0.9;
    if (k >= 1) { p.pos.copy(HOOK.to); p.grounded = true; p.vel.set(0, 0, 0); HOOK.state = 'none'; HOOK.ring = null; sfx('land'); burst(p.pos.x, p.pos.y + 0.1, p.pos.z, 0xd8d2b8, 6, 2.2, 0.35, 2); }
    return true;
  }
  if (HOOK.state === 'hang') {
    p.vel.set(0, 0, 0); p.grounded = false;
    p.pos.set(_rw.x + Math.sin(HOOK.t * 2.2) * 0.12, _rw.y - 1.95, _rw.z + Math.cos(HOOK.t * 1.7) * 0.08);
    if (HOOK.t > 6) hookRelease();
    return true;
  }
  return false;
}
/* the right arm reaches along the rope; the rope runs from the hand to the hook */
const _hk = new T.Vector3();
function hookPose() {
  if (HOOK.state === 'none') { ropeMesh.visible = hookHead.visible = false; return; }
  const hp = hero.p; hero.g.updateMatrixWorld(true);
  _hk.copy(HOOK.tip); hp.chest.worldToLocal(_hk); _hk.sub(hp.armR.position).normalize(); armTo(hp.armR, hp.elbowR, _hk, _hk, UP);
  hero.g.updateMatrixWorld(true); hp.handR.getWorldPosition(_v4);
  const L = _v4.distanceTo(HOOK.tip); ropeMesh.visible = hookHead.visible = L > 0.05;
  ropeMesh.position.copy(_v4); ropeMesh.scale.set(1, L, 1); _v3.subVectors(HOOK.tip, _v4).normalize(); ropeMesh.quaternion.setFromUnitVectors(UP, _v3);
  hookHead.position.copy(HOOK.tip); hookHead.quaternion.copy(ropeMesh.quaternion);
}

/* ---------- enter and leave ---------- */
function enterCave() {
  if (bossFight) return;
  fade(() => { placePlayer(CAVE_IN.x, CAVE_IN.z); PL.yaw = Math.PI / 2; CAM.yaw = -Math.PI / 2; updateCamera(0.016, true); caveSafe.x = CAVE_IN.x; caveSafe.z = CAVE_IN.z;
    if (!G.flags.seen_grotto) { G.flags.seen_grotto = true; banner('Veilfall Grotto', 'Location discovered'); gainXp(20); sfx('discover'); }
    if (!qState('veil')) qStart('veil'); else if (G.q.veil && G.q.veil.stage < 1) G.q.veil.stage = 1;
    if (G.q.veil && G.q.veil.stage < 1) G.q.veil.stage = 1;
    autosave(); });
}
function leaveCave() { fade(() => { hookRelease(); placePlayer(CAVE_OUT.x, CAVE_OUT.z); PL.yaw = 0; CAM.yaw = Math.PI; updateCamera(0.016, true); autosave(); }); }
function caveRespawnPoint() { return G.flags.cv_slab ? [354, -37.5] : G.flags.cv_b ? [354, -9] : has('hook') ? [328, 2] : [CAVE_IN.x, CAVE_IN.z]; }
/* a fall into a chasm: back to the last safe ground, a little hurt */
function caveFallOut() {
  if (PL.dead) return; hookRelease();
  fade(() => { placePlayer(caveSafe.x, caveSafe.z); PL.iframes = 1; const S = G.p; S.hp = Math.max(1, S.hp - 12); notify('You climb back up, bruised.'); });
  PL.vel.set(0, 0, 0); PL.pos.y = -14;
}

/* ---------- cave bats: roost under the roof, wake, wheel about you and dive ---------- */
EDEF.bat = { name: 'Cave Bat', hp: 12, dmg: 7, speed: 7, detect: 11, leash: 40, range: 1, xp: 7, radius: 0.45, height: 0.5, scale: 1, fly: true, respawn: 140, loot: [['crystal', 0.15, 1]], coins: [0, 2] };
EDEF.golem = { name: 'The Vault Golem', hp: 420, dmg: 24, speed: 2.1, radius: 1.7, height: 5.2, scale: 1, xp: 220, big: true, loot: [], coins: [0, 0] };
function caveEnemy(type: string, x: number, z: number, build: () => { g: THREE.Group; p: CreatureRig }) {
  const b = build(), def = EDEF[type];
  const e: Enemy = { type, def, g: b.g, p: b.p as Rig & CreatureRig, pos: new T.Vector3(x, terrainH(x, z), z), home: { x, z }, yaw: crng() * 6, hp: def.hp, state: 'idle', t: 0, wait: 1, cd: 0, alive: true, deadT: 0, aggro: false, kb: new T.Vector3(), tx: x, tz: z, anim: crng() * 5, punch: 0, flash: 0, mats: ownMaterials(b.g) };
  addOutline(e.g, def.big ? 0.04 : 0.012); scene.add(e.g); enemies.push(e); return e;
}
function buildBat() {
  const g = new T.Group(), p: CreatureRig = {}, fur = lam(0x3a3040);
  p.body = mesh(sph(0.2, 8, 6), fur, 0, 0, 0, g); p.body.scale.set(1, 0.9, 1.25);
  const hd = grpIn(g, 0, 0.08, 0.2); mesh(sph(0.13, 8, 6), fur, 0, 0, 0, hd);
  for (const s of [-1, 1]) { mesh(new T.ConeGeometry(0.06, 0.18, 4), fur, s * 0.08, 0.14, -0.02, hd).rotation.z = -s * 0.3; mesh(sph(0.03, 5, 4), glowMat(0xff5040), s * 0.055, 0.03, 0.11, hd, true); }
  p.wings = []; for (const s of [-1, 1]) {
    const w = new T.Group(); w.position.set(s * 0.12, 0.04, 0); g.add(w);
    const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.12, s * 0.55, 0.12, 0.06, s * 0.42, 0, -0.22, 0, 0, 0.12, s * 0.42, 0, -0.22, 0, 0, -0.18, s * 0.55, 0.12, 0.06, s * 0.85, 0.02, -0.06, s * 0.42, 0, -0.22], 3)); wg.computeVertexNormals();
    mesh(wg, lam(0x4a3a52, { side: T.DoubleSide }), 0, 0, 0, w, true); w.userData.s = s; p.wings.push(w);
  }
  return { g, p };
}
function updateBat(e: Enemy, dt: number) {
  const D = e.def, P = e.p; e.t += dt; e.anim += dt; e.cd -= dt; e.flash -= dt; e.hurtShown = (e.hurtShown || 0) - dt;
  const ch = PL.pos.y + 1.2, dx = PL.pos.x - e.pos.x, dz = PL.pos.z - e.pos.z, d = Math.hypot(dx, dz), roostY = caveCeil(e.home.x, e.home.z) - 0.6;
  if (e.kb.lengthSq() > 0.01) { e.pos.x += e.kb.x * dt; e.pos.z += e.kb.z * dt; e.kb.multiplyScalar(Math.max(0, 1 - 6 * dt)); }
  let tele = 0, flap = 16, hang = false;
  const near = !PL.dead && d < 26 && Math.abs(PL.pos.y - e.pos.y) < 12;
  switch (e.state) {
    case 'idle': case 'return': {
      const tx = e.home.x, tz = e.home.z; e.pos.x = lerp(e.pos.x, tx, 1 - Math.exp(-2 * dt)); e.pos.z = lerp(e.pos.z, tz, 1 - Math.exp(-2 * dt)); e.pos.y = lerp(e.pos.y, roostY, 1 - Math.exp(-2.5 * dt));
      hang = Math.abs(e.pos.y - roostY) < 0.3; flap = hang ? 0 : 14;
      if (!PL.dead && d < D.detect && Math.abs(PL.pos.y - e.pos.y) < 12) { e.state = 'circle'; e.t = 0; e.cd = 1 + Math.random() * 1.5; e.orb = Math.atan2(e.pos.x - PL.pos.x, e.pos.z - PL.pos.z); tone(2400, 0.08, 'square', 0.03, null, 0, 3200); }
      break;
    }
    case 'stagger': if (e.t > 0.3) { e.state = 'circle'; e.t = 0; e.cd = 0.8 + Math.random(); } break;
    case 'circle': {
      if (!near) { e.state = 'return'; break; }
      e.orb = (e.orb || 0) + dt * 1.7; const R = 3.6 + Math.sin(e.anim * 0.7) * 0.6, tx = PL.pos.x + Math.sin(e.orb) * R, tz = PL.pos.z + Math.cos(e.orb) * R, ty = ch + 1.6 + Math.sin(e.anim * 2.3) * 0.4;
      const k = 1 - Math.exp(-3.2 * dt); e.pos.x = lerp(e.pos.x, tx, k); e.pos.z = lerp(e.pos.z, tz, k); e.pos.y = lerp(e.pos.y, Math.min(ty, caveCeil(e.pos.x, e.pos.z) - 0.8), k);
      if (e.cd <= 0) { e.state = 'windup'; e.t = 0; tone(1800, 0.25, 'sawtooth', 0.035, null, 0, 2600); }
      break;
    }
    case 'windup': tele = e.t / 0.38; flap = 26; e.pos.y += dt * 0.8; if (e.t > 0.38) { e.state = 'swoop'; e.t = 0; e.sx = (PL.pos.x - e.pos.x); e.sy = (ch - e.pos.y); e.sz = (PL.pos.z - e.pos.z); const l = Math.hypot(e.sx, e.sy, e.sz) || 1; e.sx /= l; e.sy /= l; e.sz /= l; e.hit = false; sfx('swing'); } break;
    case 'swoop': {
      flap = 4; e.pos.x += e.sx * 15 * dt; e.pos.y += e.sy * 15 * dt; e.pos.z += e.sz * 15 * dt;
      if (!e.hit && Math.hypot(PL.pos.x - e.pos.x, ch - e.pos.y, PL.pos.z - e.pos.z) < 1.05) { e.hit = true; hurtPlayer(D.dmg, e.pos.x - e.sx, e.pos.z - e.sz); }
      if (e.t > 0.5) { e.state = 'circle'; e.t = 0; e.cd = 1.4 + Math.random() * 1.8; }
      break;
    }
  }
  const fl = terrainH(e.pos.x, e.pos.z); if (e.pos.y < fl + 0.5) e.pos.y = fl + 0.5;
  if (e.state !== 'idle' && e.state !== 'return') e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), 8 * dt);
  e.g.position.copy(e.pos); e.g.rotation.set(hang ? Math.PI : (e.state === 'swoop' ? 0.6 : 0), e.yaw, 0); e.g.scale.setScalar(D.scale * (1 + Math.max(0, e.punch -= dt) * 1.2));
  P.wings.forEach((w: THREE.Object3D) => w.rotation.z = flap ? w.userData.s * Math.sin(e.anim * flap) * 0.8 : -w.userData.s * 1.2);
  const f2 = Math.max(0, e.flash) * 3.1, tp = tele > 0 ? (0.3 + 0.7 * tele) : 0; for (const m of e.mats) m.emissive.setRGB(f2 + tp * 0.9, f2 * 0.9 + tp * 0.2, f2 * 0.8);
}

/* ---------- the vault golem: stone that only cracks when it runs itself into the crystal pillars ---------- */
const PILLARS = [0.5, 2.6, 4.7].map((a, i) => {
  const x = ARENA.x + Math.cos(a) * 6.3, z = ARENA.z + Math.sin(a) * 6.3, g = grpAt(x, ARENA.y, z, a, CAVE_ROOT);
  mesh(cyl(1.0, 1.25, 0.8, 7), painted(new T.MeshToonMaterial({ color: 0x77807c, gradientMap: TOON }), 'cliff', 0.3, 0.8), 0, 0.4, 0, g);
  const cr: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let k = 0; k < 5; k++) { const h = 2.2 + crng() * 1.8, m = mesh(new T.ConeGeometry(0.32 + crng() * 0.2, h, 6), new T.MeshBasicMaterial({ color: 0x7ff3e0 }), (crng() - 0.5) * 0.9, 0.7 + h * 0.45, (crng() - 0.5) * 0.9, g, true); m.rotation.set((crng() - 0.5) * 0.5, crng() * 3, (crng() - 0.5) * 0.5); cr.push(m); }
  const hl = halo(g, 0, 2.4, 0, 6, 0x7ff3e0, 0.45);
  return { x, z, g, cr, hl, dim: 0, i, col: addCircle(x, z, 1.05) };
});
function buildGolem() {
  const g = new T.Group(), p: CreatureRig = {}, rg = puffGeo(1, 0.28, true);
  const rock = painted(new T.MeshToonMaterial({ color: 0x8d9590, gradientMap: TOON, vertexColors: true }), 'cliff', 0.22, 0.95), dark = painted(new T.MeshToonMaterial({ color: 0x6c7470, gradientMap: TOON, vertexColors: true }), 'cliff', 0.22, 0.95);
  const glow = new T.MeshBasicMaterial({ color: 0x2f8f85 });
  const blob = (par: THREE.Object3D, x: number, y: number, z: number, sx: number, sy: number, sz: number, m = rock) => { const b = mesh(rg, m, x, y, z, par); b.scale.set(sx, sy, sz); b.rotation.set(crng() * 0.5, crng() * 6, crng() * 0.5); return b; };
  p.pivot = new T.Group(); g.add(p.pivot);
  p.body = blob(p.pivot, 0, 3.1, 0, 1.65, 1.5, 1.25); blob(p.pivot, 0, 2.1, 0.05, 1.25, 0.8, 1.0, dark); blob(p.pivot, 0, 3.9, -0.25, 1.4, 0.8, 1.05, dark);
  p.headG = grpIn(p.pivot, 0, 4.25, 0.75); blob(p.headG, 0, 0, 0, 0.62, 0.52, 0.58);
  p.eyes = [] as any[]; for (const s of [-1, 1]) (p.eyes as any[]).push(mesh(sph(0.1, 6, 5), glow, s * 0.24, 0.02, 0.5, p.headG, true));
  p.cracks = []; for (let k = 0; k < 5; k++) { const c = mesh(bx(0.08, 0.9 + (k % 2) * 0.5, 0.05), glow, -0.9 + k * 0.45, 3.0 + (k % 2) * 0.3, 1.18, p.pivot, true); c.rotation.z = (k - 2) * 0.35; p.cracks.push(c); }
  /* the heart crystal on its back: dull while it marches, blazing when it is stunned */
  p.core = new T.Group(); p.core.position.set(0, 3.5, -1.15); p.pivot.add(p.core);
  for (let k = 0; k < 5; k++) { const m = mesh(new T.ConeGeometry(0.22, 1.0 + (k % 3) * 0.3, 6), glow, (k - 2) * 0.22, 0.2, -0.1, p.core, true); m.rotation.set(-0.9 - (k % 2) * 0.2, 0, (k - 2) * 0.35); }
  p.coreHalo = halo(p.core, 0, 0.3, -0.3, 4, 0x7ff3e0, 0.2);
  for (const [k, s] of [['armR', -1], ['armL', 1]] as [string, number][]) {
    const a = p[k] = new T.Group(); a.position.set(s * 1.95, 3.7, 0); p.pivot.add(a);
    blob(a, 0, 0.1, 0, 0.75, 0.62, 0.7, dark); blob(a, 0, -0.9, 0, 0.5, 0.75, 0.5);
    const f = grpIn(a, 0, -1.7, 0); p['fore' + (s < 0 ? 'R' : 'L')] = f; blob(f, 0, -0.55, 0, 0.5, 0.7, 0.5); blob(f, 0, -1.35, 0.1, 0.72, 0.6, 0.72, dark);
  }
  for (const [k, s] of [['legR', -1], ['legL', 1]] as [string, number][]) { const l = p[k] = new T.Group(); l.position.set(s * 0.8, 1.7, 0); p.pivot.add(l); blob(l, 0, -0.75, 0, 0.62, 0.9, 0.62, dark); blob(l, 0, -1.55, 0.15, 0.72, 0.3, 0.85); }
  for (let k = 0; k < 4; k++) mesh(rg, new T.MeshToonMaterial({ color: 0x5f9a45, gradientMap: TOON, vertexColors: true }), -0.8 + k * 0.55, 4.25 - (k % 2) * 0.2, -0.4, p.pivot).scale.set(0.5, 0.18, 0.6);
  return { g, p };
}
function golemGlow(hex: number, op: number) { if (!golem) return; const P = golem.p; (P.eyes as any[]).forEach((m: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>) => m.material.color.setHex(hex)); for (const c of P.cracks) c.material.color.setHex(hex); P.core.children.forEach((c: any) => { if (c.material && c.material.color) c.material.color.setHex(hex); }); P.coreHalo.material.opacity = op; }
function golemReset() {
  golemFight = false; if (!golem) return;
  if (G.flags.golem) { golem.alive = false; golem.g.visible = false; golem.deadT = 99; return; }
  golem.alive = true; golem.hp = golem.def.hp; golem.state = 'sleep'; golem.t = 0; golem.phase = 1; golem.g.visible = true; golem.pos.set(ARENA.x + 2.5, ARENA.y, ARENA.z); golem.yaw = -Math.PI / 2;
  golem.g.scale.setScalar(1); golem.p.pivot.rotation.set(0, 0, 0); golem.p.pivot.position.y = -0.9; golemGlow(0x1f4f4a, 0.12); for (const m of golem.mats) m.emissive.setRGB(0, 0, 0);
}
/* the golem only feels a blow while it reels, crystal blazing */
function golemHurt(e: Enemy, o: HitOptions): number {
  if (e.state === 'stun') return o.fire ? 1.4 : 1;
  if (e.state !== 'sleep') { sfx('block'); dmgText(e.pos.x, e.pos.y + e.def.height + 0.3, e.pos.z, 'Stone', 'alert'); burst(e.pos.x, e.pos.y + 3, e.pos.z, 0xd8d2c0, 6, 4, 0.3); if (!G.flags.golemHint) { G.flags.golemHint = true; notify('Your blade glances off. Make it charge into a crystal pillar.'); } }
  return 0;
}
function golemDefeated(e: Enemy) {
  G.flags.golem = true; golemFight = false; clearHazards(); sfx('roar'); hitStop = 0.25; timeScale = 0.35;
  const ex = e.pos.x, ez = e.pos.z, a0 = Math.atan2(PL.pos.z - ez, PL.pos.x - ex);
  startCine(3.6, (k, t) => { timeScale = t < 1.1 ? 0.35 : 1; const a = a0 + 0.4 + k * 0.9, r = lerp(9, 11.5, k); camera.position.set(ex + Math.cos(a) * r, ARENA.y + lerp(4.5, 3, k), ez + Math.sin(a) * r); camera.lookAt(ex, ARENA.y + lerp(3.5, 1.5, k), ez); },
    () => { banner('The Vault Golem crumbles', 'The way home lies open'); const c = CHESTS.c_golem; c.g.visible = true; c.col.on = true; burst(c.x, ARENA.y + 1, c.z, GOLD, 40, 6, 1.2, 1); exitGate.visible = true; if (G.q.veil) G.q.veil.stage = 3; });
  autosave();
}
const exitGate = (() => {
  const g = grpAt(ARENA.x + 8.2, ARENA.y, ARENA.z, 0, CAVE_ROOT);
  const ring = mesh(new T.TorusGeometry(1.5, 0.12, 6, 32), glowMat(0x9ffcff), 0, 1.8, 0, g, true); ring.rotation.y = Math.PI / 2;
  const disc = mesh(new T.CircleGeometry(1.45, 32), glowMat(0x4fd8d0, { transparent: true, opacity: 0.45, side: T.DoubleSide, depthWrite: false }), 0, 1.8, 0, g, true); disc.rotation.y = Math.PI / 2;
  halo(g, 0, 1.8, 0, 7, 0x7ff3e0, 0.5); g.visible = false;
  addInteract({ x: ARENA.x + 8.2, z: ARENA.z, r: 2.4, label: () => g.visible ? 'Step into the light (return to Veilfall)' : null, act: () => leaveCave() });
  return g;
})();
chest('c_golem', ARENA.x + 4.5, ARENA.z + 4.5, { stoneheart: 1 }, 60, -2.3, true);
function updateGolem(e: Enemy, dt: number) {
  const P = e.p;
  if (!e.alive) {
    if (e.g.visible && e.deadT < 5) { e.deadT += dt; const k = smooth(0.2, 2.4, e.deadT); P.pivot.rotation.x = k * 0.5; P.pivot.position.y = -k * 1.6; e.g.scale.setScalar(1 - smooth(2.4, 4.6, e.deadT) * 0.999); if (Math.random() < 0.6) burst(e.pos.x + rand(-1.6, 1.6), e.pos.y + rand(0.5, 4), e.pos.z + rand(-1.6, 1.6), Math.random() < 0.5 ? 0x7ff3e0 : 0xb9b2a0, 2, 3, 1, 3); if (e.deadT > 4.6) e.g.visible = false; }
    return;
  }
  const dx = PL.pos.x - e.pos.x, dz = PL.pos.z - e.pos.z, d = Math.hypot(dx, dz), inArena = Math.hypot(PL.pos.x - ARENA.x, PL.pos.z - ARENA.z) < ARENA.r + 1 && PL.pos.y > ARENA.y - 1;
  e.anim += dt; e.t += dt; e.cd -= dt; e.flash -= dt;
  if (e.state === 'sleep') {
    P.pivot.position.y = -0.9; P.pivot.rotation.x = 0.35; P.armL.rotation.x = P.armR.rotation.x = 0.4;
    if (inArena && !PL.dead && PL.grounded) {
      golemFight = true; e.state = 'wake'; e.t = 0; sfx('rumble'); banner('The Vault Golem', 'Old stone, set here to keep the deep');
      const gx = e.pos.x, gz = e.pos.z; startCine(2.8, (k: number) => { const a = lerp(2.7, 3.5, k); camera.position.set(gx + Math.cos(a) * 9, ARENA.y + lerp(2.2, 4, k), gz + Math.sin(a) * 9); camera.lookAt(gx, ARENA.y + lerp(1.8, 3.8, k), gz); });
    }
    e.g.position.copy(e.pos); e.g.rotation.y = e.yaw; return;
  }
  if (!inArena && e.state !== 'wake' && !PL.dead) { /* it will not follow you out: it waits at the centre */ }
  const ph2 = e.phase === 2, turn = (s: number) => { e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), s * dt); };
  let armR = 0, armL = 0, bodyX = 0.05, tele = 0, legs = 0;
  switch (e.state) {
    case 'wake': { const k = smooth(0.2, 2, e.t); P.pivot.position.y = lerp(-0.9, 0, k); bodyX = lerp(0.35, 0, k); CAM.shake = Math.max(CAM.shake, 0.1 * (1 - k) + 0.02); if (e.t > 1 && !e.lit) { e.lit = true; golemGlow(0x7ff3e0, 0.3); sfx('charge'); } if (e.t > 2.2) { armR = armL = -2.2; if (!e.roared) { e.roared = true; sfx('roar'); addRing(e.pos.x, ARENA.y + 0.15, e.pos.z, 0x7ff3e0, 12, 0.8); CAM.shake = 0.4; } } if (e.t > 2.9) { e.state = 'walk'; e.t = 0; e.cd = 1.2; e.lit = e.roared = false; } break; }
    case 'walk': {
      turn(2.2); const sp = ph2 ? 2.8 : 2.1;
      if (d > 3.4 && inArena) { e.pos.x += Math.sin(e.yaw) * sp * dt; e.pos.z += Math.cos(e.yaw) * sp * dt; legs = 1; }
      if (!inArena) { const hx = ARENA.x - e.pos.x, hz = ARENA.z - e.pos.z; if (Math.hypot(hx, hz) > 1) { e.yaw = angLerp(e.yaw, Math.atan2(hx, hz), 3 * dt); e.pos.x += Math.sin(e.yaw) * sp * dt; e.pos.z += Math.cos(e.yaw) * sp * dt; legs = 1; } }
      if (ph2) { e.rockT = (e.rockT || 2) - dt; if (e.rockT <= 0 && inArena) { e.rockT = 2.4; addHazard(PL.pos.x + PL.vel.x * 0.3, PL.pos.z + PL.vel.z * 0.3, 2.2, 0.95, 14, true); sfx('stone'); } }
      if (e.cd <= 0 && inArena) {
        if (d < 5.2) { e.state = 'slamWind'; e.t = 0; addHazard(e.pos.x, e.pos.z, 5.4, ph2 ? 0.95 : 1.15, 22, false); sfx('charge'); }
        else { e.state = 'chargeWind'; e.t = 0; sfx('grunt'); }
      }
      break;
    }
    case 'slamWind': { const w = ph2 ? 0.95 : 1.15, k = e.t / w; armR = armL = -2.9 * smooth(0, 0.8, k); bodyX = -0.25 * k; tele = k; if (e.t >= w) { e.state = 'recover'; e.t = 0; P.armR.rotation.x = P.armL.rotation.x = 0.4; } break; }
    case 'chargeWind': {
      turn(5); const w = ph2 ? 0.7 : 0.95, k = e.t / w; tele = k; bodyX = 0.35 * k; armR = armL = 0.6 * k; legs = 0.4;
      if (Math.random() < 0.5) burst(e.pos.x - Math.sin(e.yaw) * 1.2, ARENA.y + 0.1, e.pos.z - Math.cos(e.yaw) * 1.2, 0xb9b2a0, 1, 3, 0.4, 2);
      if (e.t >= w) { e.state = 'charge'; e.t = 0; e.cx = Math.sin(e.yaw); e.cz = Math.cos(e.yaw); e.hitP = false; sfx('roar'); }
      break;
    }
    case 'charge': {
      const sp = ph2 ? 16 : 13.5; e.pos.x += e.cx * sp * dt; e.pos.z += e.cz * sp * dt; bodyX = 0.45; armR = armL = 0.9; legs = 2.2;
      if (Math.random() < 0.7) burst(e.pos.x, ARENA.y + 0.2, e.pos.z, 0xb9b2a0, 2, 3, 0.4, 2);
      if (!e.hitP && Math.hypot(PL.pos.x - e.pos.x, PL.pos.z - e.pos.z) < 2.3 && Math.abs(PL.pos.y - ARENA.y) < 2.5) { e.hitP = true; hurtPlayer(e.def.dmg, e.pos.x - e.cx * 3, e.pos.z - e.cz * 3, { unblockable: true }); PL.vel.x += e.cx * 14; PL.vel.z += e.cz * 14; }
      for (const pl of PILLARS) if (Math.hypot(pl.x - e.pos.x, pl.z - e.pos.z) < 2.6) {
        e.state = 'stun'; e.t = 0; CAM.shake = 0.6; sfx('slam'); burst(pl.x, ARENA.y + 2, pl.z, 0x7ff3e0, 40, 9, 0.9); addRing(pl.x, ARENA.y + 0.2, pl.z, 0x7ff3e0, 6, 0.6); pl.dim = 6;
        e.pos.x -= e.cx * 0.8; e.pos.z -= e.cz * 0.8; notify('The golem reels, its crystal blazing. Strike now!'); break;
      }
      if (e.state === 'charge' && (Math.hypot(e.pos.x - ARENA.x, e.pos.z - ARENA.z) > ARENA.r - 0.6 || e.t > 1.7)) { e.state = 'recover'; e.t = 0; CAM.shake = 0.25; sfx('stomp'); }
      break;
    }
    case 'recover': bodyX = 0.2; armR = armL = 0.5; if (e.t > (ph2 ? 0.8 : 1.1)) { e.state = 'walk'; e.t = 0; e.cd = ph2 ? 0.9 : 1.5; } break;
    case 'stun': {
      bodyX = 0.75; armR = armL = 0.9; P.pivot.position.y = lerp(P.pivot.position.y, -0.9, 1 - Math.exp(-8 * dt));
      const on = Math.floor(e.anim * 8) % 2; golemGlow(on ? 0xffffff : 0x7ff3e0, 0.9); P.core.scale.setScalar(1.25 + Math.sin(e.anim * 12) * 0.06);
      if (e.t > (ph2 ? 3.2 : 3.8)) { e.state = 'recover'; e.t = 0; P.core.scale.setScalar(1); golemGlow(ph2 ? 0xff7a3c : 0x7ff3e0, 0.3); }
      break;
    }
    case 'roar': bodyX = -0.3; armR = armL = -2.5; CAM.shake = Math.max(CAM.shake, 0.2); if (Math.random() < 0.8) burst(e.pos.x + rand(-1.5, 1.5), e.pos.y + rand(2, 5), e.pos.z + rand(-1.5, 1.5), 0xff7a3c, 2, 5, 0.6, -3); if (e.t > 1.7) { e.state = 'walk'; e.t = 0; e.cd = 0.8; } break;
  }
  if (e.state !== 'stun') P.pivot.position.y = lerp(P.pivot.position.y, 0, 1 - Math.exp(-6 * dt));
  if (e.phase === 1 && e.hp < e.def.hp / 2 && e.state !== 'stun') {
    e.phase = 2; e.state = 'roar'; e.t = 0; sfx('roar'); golemGlow(0xff7a3c, 0.4); banner('The golem burns', 'Stones fall from the roof'); P.core.scale.setScalar(1); clearHazards();
  }
  /* stay in the vault, off the pillars */
  const ox = e.pos.x - ARENA.x, oz = e.pos.z - ARENA.z, od = Math.hypot(ox, oz); if (od > ARENA.r - 0.5) { e.pos.x = ARENA.x + ox / od * (ARENA.r - 0.5); e.pos.z = ARENA.z + oz / od * (ARENA.r - 0.5); }
  if (e.state !== 'charge') for (const pl of PILLARS) { const px = e.pos.x - pl.x, pz = e.pos.z - pl.z, pd = Math.hypot(px, pz); if (pd < 2.3 && pd > 0.01) { e.pos.x = pl.x + px / pd * 2.3; e.pos.z = pl.z + pz / pd * 2.3; } }
  const kk = 1 - Math.exp(-(e.state === 'stun' ? 18 : 8) * dt), st = legs ? Math.sin(e.anim * 2.6 * legs) : 0;
  P.armR.rotation.x = lerp(P.armR.rotation.x, armR + st * 0.35, kk); P.armL.rotation.x = lerp(P.armL.rotation.x, armL - st * 0.35, kk);
  P.legR.rotation.x = -st * 0.45; P.legL.rotation.x = st * 0.45; P.pivot.rotation.x = lerp(P.pivot.rotation.x, bodyX, 1 - Math.exp(-7 * dt));
  if (legs) { const stp = Math.floor(e.anim * 2.6 * legs / Math.PI); if (stp !== e.lastStep) { e.lastStep = stp; sfx('stomp'); CAM.shake = Math.max(CAM.shake, clamp(0.25 - d * 0.015, 0, 0.18)); } }
  const fl = Math.max(0, e.flash) * 4, tp = tele * (0.5 + 0.5 * Math.sin(e.anim * 26)) * 0.6; for (const m of e.mats) m.emissive.setRGB(fl + tp, fl + tp * 0.35, fl + tp * 0.1);
  e.pos.y = ARENA.y; e.g.position.copy(e.pos); e.g.rotation.y = e.yaw;
  if (d < 2.2 && d > 0.01 && e.state !== 'charge') { PL.pos.x = e.pos.x + dx / d * 2.2; PL.pos.z = e.pos.z + dz / d * 2.2; }
}

/* ---------- populate ---------- */
/* called once the valley's own creatures are in (they keep their places in the list) */
function populateCave() {
  [[313, 0.8], [318, -0.6], [324, -4], [330, -4.5], [326, 4], [332, 2], [352, -38], [356, -36]].forEach(([x, z]) => { const e = caveEnemy('bat', x, z, buildBat); e.pos.y = caveCeil(x, z) - 0.6; });
  golem = caveEnemy('golem', ARENA.x + 2.5, ARENA.z, buildGolem); golem.state = 'sleep';
}
chest('c_hook', 327.5, 9.6, { hook: 1 }, 0, Math.PI);

/* ---------- each frame ---------- */
const _cl = new T.Color(), CAM_FAR = camera.far;
const caveLamp = new T.PointLight(0xffc890, 0, 17, 1.5), caveGlow = new T.PointLight(0x7ff3e0, 0, 22, 1.4); scene.add(caveLamp); scene.add(caveGlow);
let hookMarkEl: HTMLElement | null = null, caveHid = false;
const caveVis = new Map<THREE.Object3D, boolean>();
function updateCave(dt: number, raw: number, tsec: number) {
  const camIn = inCave(camera.position.x);
  CAVE_ROOT.visible = camIn || inCave(PL.pos.x);
  if (camIn !== caveHid) { caveHid = camIn; for (const o of OUTDOOR) { if (camIn) { caveVis.set(o, o.visible); o.visible = false; } else o.visible = caveVis.get(o) ?? true; } }
  caveAmt = lerp(caveAmt, camIn ? 1 : 0, 1 - Math.exp(-6 * raw)); if (Math.abs(caveAmt - (camIn ? 1 : 0)) < 0.01) caveAmt = camIn ? 1 : 0;
  const fog = scene.fog as THREE.Fog;
  if (caveAmt > 0) {
    fog.color.lerp(_cl.setHex(0x0b1116), caveAmt); fog.near = lerp(fog.near, 4, caveAmt); fog.far = lerp(fog.far, 52, caveAmt);
    sun.intensity *= 1 - caveAmt * 0.9; hemi.intensity = lerp(hemi.intensity, 0.42, caveAmt); hemi.color.lerp(_cl.setHex(0x6f86a8), caveAmt); hemi.groundColor.lerp(_cl.setHex(0x2a2420), caveAmt);
  }
  camera.far = caveAmt > 0.5 ? 95 : CAM_FAR;
  caveLamp.intensity = caveAmt * 1.25; caveLamp.position.set(PL.pos.x, PL.pos.y + 2.6, PL.pos.z);
  if (caveAmt > 0) {
    let best = null as { x: number; y: number; z: number; c: number } | null, bd = 1e9; for (const c of CAVE_CRYSTALS) { const dd = Math.hypot(c.x - PL.pos.x, c.z - PL.pos.z); if (dd < bd) { bd = dd; best = c; } }
    const nearGolem = Math.hypot(PL.pos.x - ARENA.x, PL.pos.z - ARENA.z) < 16;
    if (nearGolem) { caveGlow.position.set(ARENA.x, ARENA.y + 6, ARENA.z); caveGlow.intensity = caveAmt * 1.3; caveGlow.distance = 26; }
    else if (best) { caveGlow.position.set(best.x, best.y, best.z); caveGlow.color.setHex(best.c); caveGlow.intensity = caveAmt * 0.9; caveGlow.distance = 14; }
    if (!nearGolem) { } else caveGlow.color.setHex(0x7ff3e0);
  } else caveGlow.intensity = 0;
  updateHookAim();
  if (!CAVE_ROOT.visible) return;
  const fl = 1 + Math.sin(tsec * 19) * 0.08 + Math.sin(tsec * 31) * 0.06; for (const f of CAVE_TORCHES) f.scale.set(1, fl, 1);
  /* the slab falls over the gap */
  if (SLAB.fall > 0 && SLAB.fall < 1) { SLAB.fall = Math.min(1, SLAB.fall + dt * 1.4 * (0.4 + SLAB.fall * 2)); SLAB.piv.rotation.z = -Math.PI / 2 * SLAB.fall * SLAB.fall; if (SLAB.fall >= 1) { sfx('slam'); CAM.shake = 0.5; burst(361.5, 7.2, -37, 0xb9b2a0, 40, 6, 0.8); SLAB.box.on = false; SLAB.deck.on = true; } }
  for (const pl of PILLARS) { pl.dim = Math.max(0, pl.dim - dt); const k = pl.dim > 0 ? 0.35 : 1; for (const c of pl.cr) c.material.color.setRGB(0.5 * k, 0.95 * k, 0.88 * k); pl.hl.material.opacity = 0.45 * k; }
  /* rings: the one you can reach glows and is marked */
  const tgt = AIM.ok ? AIM.ring : null;
  for (const r of RINGS) { r.m.visible = r.on(); r.glow.material.opacity = r === tgt ? 0.75 + Math.sin(tsec * 8) * 0.15 : 0.3; r.glow.scale.setScalar(r === tgt ? 3.2 : 2.2); }
  if (MODE !== 'play') return;
  /* safe ground for chasm falls; the fall itself */
  if (inCave(PL.pos.x)) {
    if (PL.grounded && HOOK.state === 'none' && !PL.swim) { let ok = true; for (const [ox, oz] of [[1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4]]) if (Math.abs(terrainH(PL.pos.x + ox, PL.pos.z + oz) - PL.pos.y) > 0.5 && platformAt(PL.pos.x + ox, PL.pos.z + oz, PL.pos.y) < PL.pos.y - 0.5) ok = false; if (ok) { caveSafe.x = PL.pos.x; caveSafe.z = PL.pos.z; } }
    if (PL.pos.y < -12 && !PL.dead) caveFallOut();
    if (PL.grounded && Math.hypot(PL.pos.x - 354, PL.pos.z + 6) < 4 && PL.pos.y > 6) G.flags.cv_b = true;
    if (G.q.veil && G.q.veil.stage === 1 && has('hook')) G.q.veil.stage = 2;
    /* water dripping from the roof */
    if (Math.random() < raw * 2.5) { const x = PL.pos.x + rand(-9, 9), z = PL.pos.z + rand(-9, 9); if (caveFloorAt(x, z) !== null) { const y = caveCeil(x, z) - 0.3; burst(x, y, z, 0xbfe8ff, 1, 0.2, 1.2, 14); if (Math.random() < 0.2) tone(1500 + Math.random() * 900, 0.06, 'sine', 0.012); } }
  }
}
/* a small map of the grotto for the minimap: rock, floor by height, the drops in black */
const CAVE_MAP = (() => {
  const W = 216, H = Math.round(W * (CAVE.z1 - CAVE.z0) / (CAVE.x1 - CAVE.x0)), c = makeCanvas(W, H), x = ctx2d(c), img = x.createImageData(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const wx = CAVE.x0 + (i + 0.5) / W * (CAVE.x1 - CAVE.x0), wz = CAVE.z0 + (j + 0.5) / H * (CAVE.z1 - CAVE.z0), h = caveH(wx, wz), k = (j * W + i) * 4;
    const [r, g, b] = h > 9 ? [40, 44, 52] : h < -2 ? [8, 10, 14] : [120 + h * 9, 112 + h * 8, 96 + h * 6];
    img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); return { c, W, H };
})();
/* the crosshair, and a mark on whatever the hook would bite */
let hookDotEl: HTMLElement | null = null;
function updateHookAim() {
  if (!hookMarkEl) { hookMarkEl = document.getElementById('hookMark'); hookDotEl = document.getElementById('hookDot'); }
  const on = MODE === 'play' && hasHook() && !cine && !PL.dead && HOOK.state !== 'pull' && HOOK.state !== 'hop';
  if (on) aimHook(); else AIM.ok = false;
  if (hookDotEl) { hookDotEl.style.display = on ? 'block' : 'none'; hookDotEl.classList.toggle('ok', AIM.ok); }
  if (!hookMarkEl) return;
  if (on && AIM.ok) { _rw.copy(AIM.p).project(camera); hookMarkEl.style.display = 'block'; hookMarkEl.classList.toggle('pt', !AIM.ring); hookMarkEl.style.transform = `translate(${((_rw.x * 0.5 + 0.5) * (window.innerWidth || 1280)).toFixed(1)}px,${((-_rw.y * 0.5 + 0.5) * (window.innerHeight || 720)).toFixed(1)}px)`; }
  else hookMarkEl.style.display = 'none';
}
/* bring the grotto in line with the save */
function caveSync() {
  SLAB.fall = G.flags.cv_slab ? 1 : 0; SLAB.piv.rotation.z = G.flags.cv_slab ? -Math.PI / 2 : 0; SLAB.box.on = !G.flags.cv_slab; SLAB.deck.on = !!G.flags.cv_slab;
  const c = CHESTS.c_golem; if (c) { c.g.visible = !!G.flags.golem; c.col.on = !!G.flags.golem; }
  exitGate.visible = !!G.flags.golem; hookRelease(); golemReset(); clearHazards();
  for (const e of enemies) if (e.type === 'bat') { e.state = 'idle'; e.pos.y = caveCeil(e.home.x, e.home.z) - 0.6; }
  if (inCave(PL.pos.x)) { caveSafe.x = PL.pos.x; caveSafe.z = PL.pos.z; }
}
/* the big health bar: whichever great foe you are fighting */
function bigFoe() {
  if (golemFight && golem && golem.alive && golem.state !== 'wake' && golem.state !== 'sleep') return { e: golem, name: golem.def.name, exposed: golem.state === 'stun', rage: golem.phase === 2 };
  if (bossFight && boss && boss.alive && boss.state !== 'wake') return { e: boss, name: boss.def.name, exposed: boss.state === 'stun', rage: boss.phase === 2 };
  return null;
}
