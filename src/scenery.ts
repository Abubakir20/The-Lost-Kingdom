/* ============ scenery: shrine, bridge, Oakrest, ruins, Veilfall, the Temple of Echoes ============ */
const STATIC = new T.Group(); scene.add(STATIC);
function grpAt(x: number, y: number, z: number, ry = 0, par: THREE.Object3D = STATIC) { const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g; }
const VINE = 0x4f8a3a, PLASTER = 0xf4e8cc, chimneys: number[][] = [], banners: any[] = [];
// painted surfaces: every cached stone, plaster and timber material picks up a generated texture
for (const c of [STONE, STONE_D, 0x8e918b, 0x777b76, 0x9a9d97, 0xb9bfb3, 0xa4ada4, 0x717d77]) painted(lam(c), 'stone', 0.3, 0.9);
painted(lam(PLASTER), 'plaster', 0.3, 0.85);
for (const c of [TIMBER, 0x7a4a2a, 0x8a5a30, 0xa8743c, 0x9a6a3c, 0xb07c44, 0x8a6a44, 0x5a3d28, 0x6b4a30, 0x5f432c, 0xb88a54]) painted(lam(c), 'wood', 0.55, 0.7);

/* column pieces sculpted in Blender, in units of the column's radius: a stepped plinth, two fluted drums, a capital,
   a broken drum and a fallen one. A column of any height is stacked from them. */
const PIECE_MAT = painted(new T.MeshToonMaterial({ color: STONE, gradientMap: TOON, vertexColors: true }), 'stone', 0.5, 0.95);
/* ivy: leaf cards along a few hanging strands, laid against a surface whose outward normal is local +z, hanging down from the origin */
const IVY_MAT = (() => {
  const src = (window.TLK_TEX || {}).leaves; if (!src) return null;
  const img = new Image(), t = new T.Texture(img); img.onload = () => { t.needsUpdate = true; }; img.src = src;
  return new T.MeshLambertMaterial({ map: t, alphaTest: 0.45, vertexColors: true, side: T.DoubleSide });
})();
function ivy(parent: THREE.Object3D, x: number, y: number, z: number, ry: number, len: number, wid: number, seed: number) {
  if (!IVY_MAT) return null;
  const r = mulberry(seed), P: number[] = [], N: number[] = [], U: number[] = [], C: number[] = [], col = new T.Color(), up = new T.Vector3(0, 1, 0);
  const card = (cx: number, cy: number, cz: number, sz: number, shade: number) => {
    const tilt = (r() - 0.5) * 1.2, roll = r() * 6.283, n = new T.Vector3(Math.sin(tilt) * Math.cos(roll), Math.sin(tilt) * Math.sin(roll) + 0.3, Math.cos(tilt)).normalize();
    const ax = up.clone().cross(n).normalize(), ay = n.clone().cross(ax).normalize(), sp = r() * 6.283, cs = Math.cos(sp), sn = Math.sin(sp);
    const bx2 = ax.clone().multiplyScalar(cs).addScaledVector(ay, sn), by2 = ay.clone().multiplyScalar(cs).addScaledVector(ax, -sn);
    const v = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => new T.Vector3(cx, cy, cz).addScaledVector(bx2, a * sz).addScaledVector(by2, b * sz)), uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
    col.setHSL(0.26 + r() * 0.08, 0.48 + r() * 0.18, (0.27 + r() * 0.15) * shade);
    for (const i of [0, 1, 2, 0, 2, 3]) { P.push(v[i].x, v[i].y, v[i].z); N.push(n.x * 0.5, 0.45 + n.y * 0.4, 0.55 + n.z * 0.3); U.push(uv[i][0], uv[i][1]); C.push(col.r, col.g, col.b); }
  };
  const strands = Math.max(2, Math.round(wid / 0.32));
  for (let q = 0; q < strands * 3; q++) card((r() - 0.5) * wid * 1.1, r() * 0.18 - 0.05, 0.05 + r() * 0.12, 0.16 + r() * 0.1, 1.05);   // the mat spilling over the top
  for (let k = 0; k < strands; k++) {
    let sx = (strands > 1 ? k / (strands - 1) - 0.5 : 0) * wid + (r() - 0.5) * 0.2; const L = len * (0.5 + r() * 0.5);
    for (let t = 0.1; t < L; t += 0.15) {
      sx += (r() - 0.5) * 0.1; const f = t / L, n = f < 0.3 ? 3 : 2;
      for (let q = 0; q < n; q++) card(sx + (r() - 0.5) * 0.32 * (1 - f * 0.5), -t + (r() - 0.5) * 0.1, 0.03 + r() * 0.09 * (1 - f), 0.11 + r() * 0.09 * (1 - f * 0.5), 1 - f * 0.35);
    }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); g.setAttribute('color', new T.Float32BufferAttribute(C, 3));
  const m = mesh(g, IVY_MAT, x, y, z, parent, true); m.rotation.y = ry; return m;
}
const PIECES = PROPS.P_PLINTH ? {
  plinth: propGeo('P_PLINTH', STONE, 40) as THREE.BufferGeometry, cap: propGeo('P_CAPITAL', STONE, 40) as THREE.BufferGeometry,
  drums: [propGeo('P_DRUM_A', STONE, 32) as THREE.BufferGeometry, propGeo('P_DRUM_B', STONE, 32) as THREE.BufferGeometry],
  broken: propGeo('P_BROKEN', STONE, 32) as THREE.BufferGeometry, fallen: propGeo('P_FALLEN', STONE, 32) as THREE.BufferGeometry,
} : null;
function pillar(x: number, z: number, h: number, r = 0.6, collide = true, broken?: boolean) {
  const g = grpAt(x, groundAt(x, z), z, rng() * 6.283);
  if (PIECES) {
    const R = r * 0.86, n = Math.max(1, Math.round(h / (R * 2.3))), dh = h / n;
    mesh(PIECES.plinth, PIECE_MAT, 0, 0, 0, g).scale.set(r, 1, r);
    for (let k = 0; k < n; k++) {
      const top = k === n - 1 && broken, d = mesh(top ? PIECES.broken : PIECES.drums[(k + Math.round(x)) & 1], PIECE_MAT, 0, 0.62 + k * dh, 0, g);
      d.scale.set(R, dh, R); d.rotation.y = (k * 1.7 + x * 0.37 + z * 0.23) % 6.283;   // turned so the wear never lines up
    }
    if (broken) { const f = mesh(PIECES.fallen, PIECE_MAT, r * 2.4, 0, r, g); f.scale.setScalar(R); f.rotation.y = 0.6 + (x * 0.11) % 1; }
    else mesh(PIECES.cap, PIECE_MAT, 0, 0.62 + h, 0, g).scale.setScalar(r);
    mesh(bx(0.07, Math.min(1.6, h * 0.45), 0.05), glowMat(RUNE), 0, 0.62 + h * 0.5, R * 1.04, g, true);
    if (IVY_MAT) { const a = Math.atan2(0.83, -0.55); ivy(g, Math.sin(a) * (R + 0.02), 0.62 + h * (broken ? 0.95 : 1.0), Math.cos(a) * (R + 0.02), a, h * 0.75, R * 1.3, Math.round(x * 13 + z * 7)); }
    else { const v = mesh(cyl(0.04, 0.05, h * 0.7, 4), lam(VINE), r * 0.75, 0.62 + h * 0.62, -r * 0.5, g, true); v.rotation.z = 0.08; mesh(sph(0.22, 6, 5), lam(VINE), r * 0.8, 0.62 + h * 0.3, -r * 0.55, g, true); }
    if (collide) addCircle(x, z, r * 1.25);
    return g;
  }
  mesh(bx(r * 3.1, 0.3, r * 3.1), lam(STONE_D), 0, 0.15, 0, g); mesh(bx(r * 2.5, 0.32, r * 2.5), lam(STONE), 0, 0.46, 0, g);
  mesh(cyl(r * 0.84, r, h, 10), lam(STONE), 0, 0.62 + h / 2, 0, g);
  for (let k = 1; k <= 2; k++) if (h > 2.4) mesh(cyl(r * 1.0, r * 1.02, 0.14, 10), lam(STONE_D), 0, 0.62 + h * 0.33 * k, 0, g);
  if (broken) { const t = mesh(cyl(r * 0.84, r * 0.86, 0.5, 10), lam(STONE), r * 0.15, 0.7 + h, 0, g); t.rotation.z = 0.2; mesh(sph(r * 0.8, 7, 5), lam(MOSS), 0, 0.85 + h, 0, g).scale.y = 0.4; mesh(cyl(r * 0.84, r * 0.84, 0.9, 10), lam(STONE), r * 2.4, 0.42, r, g).rotation.z = Math.PI / 2; }
  else { mesh(bx(r * 2.2, 0.2, r * 2.2), lam(STONE_D), 0, 0.72 + h, 0, g); mesh(bx(r * 2.7, 0.3, r * 2.7), lam(STONE), 0, 0.96 + h, 0, g); mesh(bx(r * 2.8, 0.16, r * 2.8), lam(MOSS), 0, 1.19 + h, 0, g); }
  mesh(bx(0.07, Math.min(1.6, h * 0.45), 0.05), glowMat(RUNE), 0, 0.62 + h * 0.5, r * 0.95, g, true);
  const v = mesh(cyl(0.04, 0.05, h * 0.7, 4), lam(VINE), r * 0.75, 0.62 + h * 0.62, -r * 0.5, g, true); v.rotation.z = 0.08;
  mesh(sph(0.22, 6, 5), lam(VINE), r * 0.8, 0.62 + h * 0.3, -r * 0.55, g, true);
  if (collide) addCircle(x, z, r * 1.25);
  return g;
}
/* the arch, the wall course and its merlon, sculpted in Blender as dressed, coursed stone with baked occlusion and moss */
const MASONRY = PROPS.ARCH ? { arch: propGeo('ARCH', STONE, 35, 0.8) as THREE.BufferGeometry, walls: [propGeo('W_SEG_A', STONE, 35, 0.7) as THREE.BufferGeometry, propGeo('W_SEG_B', STONE, 35, 0.7) as THREE.BufferGeometry], merlon: propGeo('W_MERLON', STONE, 35, 0.8) as THREE.BufferGeometry } : null;
function arch(x: number, z: number, rot: number, glow: boolean) {
  const g = grpAt(x, groundAt(x, z), z, rot);
  if (MASONRY) {
    mesh(MASONRY.arch, PIECE_MAT, 0, 0, 0, g);
    /* ivy over the extrados: two falls on the face, one behind */
    if (IVY_MAT) for (const [vx, side, len, wid] of [[-1.55, 1, 2.6, 0.9], [1.25, 1, 1.7, 0.7], [0.7, -1, 2.2, 0.9]]) ivy(g, vx, 5.49 + Math.sqrt(2.72 * 2.72 - vx * vx) + 0.05, side * 0.6, side > 0 ? 0 : Math.PI, len, wid, Math.round(x * 3 + z * 5 + vx * 10));
    else for (const vx of [-1.3, 0.4, 1.6]) mesh(cyl(0.035, 0.035, 1.2 + (vx + 2) * 0.4, 4), lam(VINE), vx, 6.9 - Math.abs(vx) * 0.6 - (1.2 + (vx + 2) * 0.4) / 2, 0.62, g, true);
    if (glow) { mesh(bx(0.5, 0.5, 0.1), glowMat(RUNE), 0, 7.75, 0.68, g, true).rotation.z = 0.785; halo(g, 0, 7.75, 0.8, 2.4, RUNE, 0.35); }
    const c = Math.cos(rot), s = Math.sin(rot);
    addCircle(x + c * 2.2, z - s * 2.2, 0.8); addCircle(x - c * 2.2, z + s * 2.2, 0.8);
    return;
  }
  for (const s of [-1, 1]) { for (let k = 0; k < 5; k++) mesh(bx(1.1 - (k % 2) * 0.1, 1, 1.1 - (k % 2) * 0.1), lam(k % 2 ? STONE : STONE_D), s * 2.2, 0.5 + k, 0, g); mesh(bx(1.5, 0.3, 1.5), lam(STONE_D), s * 2.2, 0.15, 0, g); }
  for (let k = -3; k <= 3; k++) { const a = k * 0.33; const st = mesh(bx(0.95, 0.9, 1.15), lam(k % 2 ? STONE : STONE_D), Math.sin(a) * 2.5, 4.9 + Math.cos(a) * 1.35, 0, g); st.rotation.z = -a; }
  mesh(bx(6.4, 0.22, 1.3), lam(MOSS), 0, 6.72, 0, g).scale.x = 0.55;
  for (const vx of [-1.3, 0.4, 1.6]) mesh(cyl(0.035, 0.035, 1.2 + (vx + 2) * 0.4, 4), lam(VINE), vx, 5.3 - (vx + 2) * 0.1, 0.55, g, true);
  if (glow) { mesh(bx(0.5, 0.5, 0.1), glowMat(RUNE), 0, 6.2, 0.6, g, true).rotation.z = 0.785; halo(g, 0, 6.2, 0.7, 2.4, RUNE, 0.35); }
  const c = Math.cos(rot), s = Math.sin(rot);
  addCircle(x + c * 2.2, z - s * 2.2, 0.8); addCircle(x - c * 2.2, z + s * 2.2, 0.8);
}
function emblem(parent: THREE.Group|THREE.Scene|THREE.Mesh<THREE.BufferGeometry,THREE.MeshToonMaterial>, x: number, y: number, z: number, s: number, color: number) {       // original three-arc sigil of Eldoria
  const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  const m = glowMat(color);
  mesh(new T.TorusGeometry(1, 0.07, 6, 28, Math.PI * 1.5), m, 0, 0, 0, g, true).userData.live = 1;
  const b = mesh(new T.TorusGeometry(0.62, 0.07, 6, 22, Math.PI * 1.2), m, 0, 0, 0, g, true); b.rotation.z = 2.2; b.userData.live = 1;
  mesh(new T.TorusGeometry(0.26, 0.07, 6, 14), m, 0, 0, 0, g, true).userData.live = 1;
  return g;
}
const waystones: Record<string, any> = {};
function waystone(id: string, x: number, z: number) {
  const y = groundAt(x, z), g = grpAt(x, y, z);
  mesh(cyl(1.5, 1.7, 0.3, 12), lam(STONE_D), 0, 0.15, 0, g); mesh(cyl(1.15, 1.3, 0.3, 12), lam(STONE), 0, 0.42, 0, g);
  mesh(new T.TorusGeometry(1.32, 0.05, 5, 26), glowMat(RUNE), 0, 0.33, 0, g, true).rotation.x = Math.PI / 2;
  const st = mesh(cyl(0.34, 0.52, 3.1, 6), lam(STONE), 0, 2.1, 0, g); st.rotation.y = 0.2;
  mesh(new T.ConeGeometry(0.34, 0.6, 6), lam(STONE_D), 0, 3.95, 0, g).rotation.y = 0.2;
  mesh(sph(0.3, 6, 5), lam(MOSS), 0.3, 0.75, 0.2, g).scale.y = 0.5;
  const dyn = new T.Group(); dyn.position.set(x, y, z); scene.add(dyn);
  const em = emblem(dyn, 0, 2.5, 0.5, 0.3, RUNE); const hl = halo(dyn, 0, 2.5, 0.6, 3.2, RUNE, 0.4);
  addCircle(x, z, 0.9); waystones[id] = { g: dyn, em, hl, x, z };
}
function lampPost(x: number, z: number) {
  const y = groundAt(x, z), g = grpAt(x, y, z);
  mesh(cyl(0.07, 0.1, 2.9, 6), lam(0x3f444b), 0, 1.45, 0, g); mesh(bx(0.7, 0.07, 0.07), lam(0x3f444b), 0.3, 2.85, 0, g); mesh(bx(0.3, 0.1, 0.3), lam(0x3f444b), 0.6, 2.72, 0, g);
  mesh(bx(0.24, 0.34, 0.24), glowMat(0xffd98a), 0.6, 2.5, 0, g, true); mesh(new T.ConeGeometry(0.24, 0.2, 4), lam(0x3f444b), 0.6, 2.22, 0, g).rotation.x = Math.PI;
  halo(scene, x + 0.6, y + 2.5, z, 5, 0xffc56a, 0.75, true); halo(scene, x + 0.6, y + 2.5, z, 0.9, 0xffe2a8, 0.5);
}
function signpost(x: number, z: number, ry: number, n = 2) {
  const g = grpAt(x, groundAt(x, z), z, ry);
  mesh(cyl(0.08, 0.1, 2.6, 6), lam(TIMBER), 0, 1.3, 0, g);
  for (let k = 0; k < n; k++) { const b = mesh(bx(1.3, 0.3, 0.06), lam(0xb88a54), 0.4 * (k % 2 ? -1 : 1), 2.3 - k * 0.42, 0, g); b.rotation.y = k * 1.1; mesh(bx(0.7, 0.05, 0.07), lam(TIMBER), 0.4 * (k % 2 ? -1 : 1), 2.3 - k * 0.42, 0, g).rotation.y = k * 1.1; }
  addCircle(x, z, 0.3);
}
function fence(x0: number, z0: number, x1: number, z1: number, collide = true) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.9)), wood = lam(0xa8743c);
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), z = lerp(z0, z1, i / n); mesh(bx(0.16, 1.15, 0.16), wood, x, groundAt(x, z) + 0.55, z, STATIC); }
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, my = groundAt(mx, mz), horiz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  for (const h of [0.45, 0.9]) mesh(horiz ? bx(len, 0.1, 0.07) : bx(0.07, 0.1, len), wood, mx, my + h, mz, STATIC);
  if (collide) addBox(Math.min(x0, x1) - 0.15, Math.max(x0, x1) + 0.15, Math.min(z0, z1) - 0.15, Math.max(z0, z1) + 0.15, Math.min(Math.abs(x1 - x0), Math.abs(z1 - z0)) < 0.5 ? my + 1.12 : undefined);
}
function barrel(x: number, z: number, par?: undefined) { const y = groundAt(x, z); mesh(cyl(0.42, 0.38, 1, 10), lam(0x8a5a30), x, y + 0.5, z, par || STATIC); for (const h of [0.22, 0.78]) mesh(cyl(0.44, 0.44, 0.07, 10), lam(0x4a4f57), x, y + h, z, par || STATIC); }
function crate(x: number, z: number, s = 0.9) { const y = groundAt(x, z), c = mesh(bx(s, s, s), lam(0xb07c44), x, y + s / 2, z, STATIC); c.rotation.y = rng(); mesh(bx(s * 1.04, s * 0.12, s * 1.04), lam(0x8a5a30), x, y + s * 0.5, z, STATIC).rotation.y = c.rotation.y; }

/* a timber-framed Oakrest house */
function house(x: number, z: number, w: number, d: number, roofC: number, dz: number, o: HouseOptions = {}) {
  const y = groundAt(x, z), g = grpAt(x, y - 0.1, z), beam = lam(TIMBER), wh = o.h || 3.2, f = 0.85, plaster = lam(o.plaster || PLASTER);
  mesh(bx(w + 0.35, f, d + 0.35), lam(0x8e918b), 0, f / 2, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(bx(0.55, f + 0.12, 0.55), lam(0x777b76), sx * (w / 2 + 0.1), f / 2 + 0.03, sz * (d / 2 + 0.1), g);
  const frame = (fw: number, fd: number, y0: number, hh: number) => {
    mesh(bx(fw - 0.22, hh, fd - 0.22), plaster, 0, y0 + hh / 2, 0, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(bx(0.26, hh, 0.26), beam, sx * (fw / 2 - 0.12), y0 + hh / 2, sz * (fd / 2 - 0.12), g);
    for (const sz of [-1, 1]) {
      for (const hy of [0.1, hh - 0.1]) mesh(bx(fw, 0.2, 0.2), beam, 0, y0 + hy, sz * (fd / 2 - 0.08), g);
      const n = Math.round(fw / 1.8); for (let i = 1; i < n; i++) mesh(bx(0.16, hh, 0.14), beam, -fw / 2 + i * fw / n, y0 + hh / 2, sz * (fd / 2 - 0.06), g);
      for (const sx of [-1, 1]) { const br = mesh(bx(0.15, 1.7, 0.12), beam, sx * (fw / 2 - 0.75), y0 + hh - 0.75, sz * (fd / 2 - 0.05), g); br.rotation.z = sx * 0.72; }
    }
    for (const sx of [-1, 1]) {
      for (const hy of [0.1, hh - 0.1]) mesh(bx(0.2, 0.2, fd), beam, sx * (fw / 2 - 0.08), y0 + hy, 0, g);
      mesh(bx(0.14, hh, 0.16), beam, sx * (fw / 2 - 0.06), y0 + hh / 2, 0, g);
      for (const sz of [-1, 1]) { const br = mesh(bx(0.12, 1.7, 0.15), beam, sx * (fw / 2 - 0.05), y0 + hh - 0.75, sz * (fd / 2 - 0.75), g); br.rotation.x = -sz * 0.72; }
    }
  };
  const windowAt = (px: number, py: number, pz: number, ry: number, shut: number) => {
    const wg = grpAt(px, py, pz, ry, g);
    mesh(bx(0.86, 1.0, 0.1), windowMat, 0, 0, 0, wg, true);
    for (const s of [-1, 1]) { mesh(bx(0.1, 1.16, 0.14), beam, s * 0.48, 0, 0.02, wg, true); mesh(bx(1.06, 0.1, 0.14), beam, 0, s * 0.55, 0.02, wg, true); mesh(bx(0.42, 1.0, 0.06), lam(shut), s * 0.76, 0, 0.05, wg, true); }
    mesh(bx(0.05, 1.0, 0.12), beam, 0, 0, 0.02, wg, true); mesh(bx(0.86, 0.05, 0.12), beam, 0, 0.08, 0.02, wg, true);
    mesh(bx(1.05, 0.22, 0.3), lam(0x8a5a30), 0, -0.72, 0.18, wg, true);
    const fc = [0xff6b8a, 0xffd24a, 0xffffff, 0xc58bff]; for (let k = -1; k <= 1; k++) mesh(sph(0.13, 6, 5), lam(fc[(Math.abs(px * 3 + k + py) | 0) % 4]), k * 0.3, -0.55, 0.2, wg, true);
    for (let k = -1; k <= 1; k += 2) mesh(sph(0.12, 6, 5), lam(VINE), k * 0.15, -0.6, 0.26, wg, true);
  };
  frame(w, d, f, wh);
  let top = f + wh, uw = w, ud = d; const shut = o.shut || 0x3f7a6a;
  if (o.two) { uw = w + 0.7; ud = d + 0.7; mesh(bx(uw + 0.1, 0.3, ud + 0.1), beam, 0, top + 0.15, 0, g); for (let i = 0; i < 5; i++) mesh(bx(0.2, 0.26, ud + 0.4), beam, -uw / 2 + 0.3 + i * (uw - 0.6) / 4, top + 0.02, 0, g); frame(uw, ud, top + 0.3, 2.5); for (const sx of [-0.27, 0.27]) windowAt(sx * uw, top + 0.3 + 1.35, dz * (ud / 2 + 0.02), dz > 0 ? 0 : Math.PI, shut); windowAt(0, top + 0.3 + 1.35, -dz * (ud / 2 + 0.02), dz > 0 ? Math.PI : 0, shut); top += 2.8; }
  // roof: two shingled slopes, gables, ridge and barge boards
  const ov = 0.75, rh = uw * 0.46, half = uw / 2 + ov, ang = Math.atan2(rh, uw / 2), sl = half / Math.cos(ang), roof = painted(lam(roofC), 'roof', 0.42, 1.0, { mode: 'roof' }), roofD = painted(lam(new T.Color(roofC).multiplyScalar(0.78).getHex()), 'roof', 0.42, 1.0, { mode: 'roof' });
  for (const s of [-1, 1]) {
    const sg = grpAt(s * half / 2, top + rh - (half / 2) * Math.tan(ang) + 0.1, 0, 0, g); sg.rotation.z = -s * ang;
    mesh(bx(sl, 0.2, ud + 1.5), roof, 0, 0, 0, sg);
    for (let k = 0; k < 5; k++) mesh(bx(sl / 5 * 0.55, 0.09, ud + 1.56), k % 2 ? roofD : roof, -sl / 2 + (k + 0.5) * sl / 5, 0.13, 0, sg, true);
    mesh(bx(0.5, 0.12, 1.4), lam(MOSS), -s * sl * 0.2, 0.2, ud * 0.2, sg, true);
    for (const e of [-1, 1]) mesh(bx(sl + 0.1, 0.26, 0.14), beam, 0, -0.02, e * (ud / 2 + 0.72), sg);
  }
  mesh(bx(0.34, 0.3, ud + 1.7), beam, 0, top + rh + 0.2, 0, g);
  { const r = (uw - 0.3) / 1.732, pg = cyl(r, r, ud - 0.3, 3); pg.rotateX(-Math.PI / 2); const s = rh / (1.5 * r), gm = mesh(pg, plaster, 0, top + 0.5 * r * s, 0, g); gm.scale.y = s; for (const e of [-1, 1]) { mesh(bx(0.16, rh * 0.8, 0.12), beam, 0, top + rh * 0.4, e * (ud / 2 - 0.1), g); mesh(bx(uw * 0.5, 0.14, 0.12), beam, 0, top + rh * 0.45, e * (ud / 2 - 0.1), g); } }
  { const cxm = uw * 0.22, czm = -dz * ud * 0.18, ch = rh + 1.3; mesh(bx(0.85, ch, 0.85), lam(0x8e918b), cxm, top + ch / 2 + 0.3, czm, g); mesh(bx(1.05, 0.2, 1.05), lam(0x777b76), cxm, top + ch + 0.36, czm, g); mesh(bx(0.55, 0.3, 0.55), lam(0x4a4f57), cxm, top + ch + 0.55, czm, g); if (o.smoke !== false) chimneys.push([x + cxm, y + top + ch + 0.8, z + czm]); }
  // door, step, lantern
  const dzp = dz * (d / 2 - 0.04), ry = dz > 0 ? 0 : Math.PI, dg = grpAt(o.doorX || 0, f, dzp, ry, g);
  mesh(bx(1.15, 2.1, 0.14), lam(0x7a4a2a), 0, 1.05, 0.05, dg, true); for (const s of [-1, 1]) mesh(bx(0.16, 2.3, 0.2), beam, s * 0.66, 1.15, 0.06, dg, true); mesh(bx(1.5, 0.18, 0.22), beam, 0, 2.3, 0.06, dg, true);
  for (const hy of [0.5, 1.6]) mesh(bx(1.1, 0.08, 0.16), lam(0x4a4f57), 0, hy, 0.07, dg, true); mesh(sph(0.06, 6, 5), lam(GOLD), 0.4, 1.05, 0.16, dg, true);
  mesh(bx(1.9, 0.2, 0.9), lam(0x9a9d97), 0, -0.72, 0.55, dg, true); mesh(bx(1.5, 0.2, 0.6), lam(0x8e918b), 0, -0.5, 0.42, dg, true);
  { const aw = mesh(bx(1.9, 0.08, 0.8), roofD, 0, 2.62, 0.42, dg, true); aw.rotation.x = 0.35; }
  mesh(bx(0.18, 0.26, 0.18), glowMat(0xffd98a), 1.0, 1.9, 0.2, dg, true); halo(scene, x + (o.doorX || 0) + (dz > 0 ? 1 : -1), y + f + 1.8, z + dzp + dz * 0.3, 3.6, 0xffc56a, 0.7, true);
  const wy = f + wh * 0.58;
  for (const sx of [-1, 1]) if (Math.abs(sx * w * 0.3 - (o.doorX || 0)) > 1.3) windowAt(sx * w * 0.3, wy, dz * (d / 2 + 0.02), ry, shut);
  windowAt(-w * 0.2, wy, -dz * (d / 2 + 0.02), ry + Math.PI, shut);
  for (const sx of [-1, 1]) windowAt(sx * (w / 2 + 0.02), wy, 0, sx * Math.PI / 2, shut);
  // ivy up one corner
  for (let k = 0; k < 6; k++) mesh(sph(0.3 + (k % 3) * 0.1, 6, 5), lam(k % 2 ? VINE : MOSS), -w / 2 + 0.1 + (k % 2) * 0.4, f + 0.3 + k * 0.5, dz * (d / 2 + 0.05), g, true).scale.z = 0.4;
  if (o.sign) { const sg = grpAt(-w * 0.36, f + 2.5, dz * (d / 2 + 0.5), ry, g); mesh(bx(0.08, 0.08, 1), beam, 0, 0.3, -0.3, sg, true); mesh(bx(0.7, 0.55, 0.06), lam(0xb88a54), 0, -0.1, 0.05, sg, true); mesh(sph(0.14, 6, 5), lam(o.sign), 0, -0.1, 0.09, sg, true); }
  addBox(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  return g;
}

/* ---------- shrine of awakening ---------- */
const spirit = new T.Group();
{
  const y = groundAt(0, 60), g = grpAt(0, y, 60);
  mesh(cyl(8.4, 9, 0.3, 24), lam(STONE_D), 0, -0.02, 0, g); mesh(cyl(7.2, 7.6, 0.3, 24), lam(STONE), 0, 0.14, 0, g); mesh(cyl(5.1, 5.3, 0.3, 24), lam(0xa4ada4), 0, 0.3, 0, g);
  mesh(new T.TorusGeometry(4.3, 0.07, 5, 40), glowMat(RUNE), 0, 0.47, 0, g, true).rotation.x = Math.PI / 2; mesh(new T.TorusGeometry(2.2, 0.05, 5, 30), glowMat(RUNE), 0, 0.47, 0, g, true).rotation.x = Math.PI / 2;
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; mesh(bx(0.06, 0.02, 1.9), glowMat(RUNE), Math.sin(a) * 3.25, 0.47, Math.cos(a) * 3.25, g, true).rotation.y = a; }
  for (let k = 0; k < 7; k++) { const a = rng() * 6.283, r = 5.6 + rng() * 2.6; mesh(sph(0.5 + rng() * 0.5, 6, 5), lam(MOSS), Math.sin(a) * r, 0.3, Math.cos(a) * r, g, true).scale.y = 0.25; }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.52; pillar(Math.sin(a) * 7, 60 + Math.cos(a) * 7, i % 3 === 0 ? 2.2 : 4.8, 0.55, true, i % 3 === 0); }
  waystone('shrine', 0, 55.5);
  spirit.position.set(0, y + 2.2, 58.5); scene.add(spirit);
  mesh(sph(0.36, 14, 10), glowMat(0xeafffb), 0, 0, 0, spirit, true);
  mesh(sph(0.62, 14, 10), glowMat(RUNE, { transparent: true, opacity: 0.3, depthWrite: false }), 0, 0, 0, spirit, true);
  for (let i = 0; i < 3; i++) { const r = mesh(new T.TorusGeometry(0.9 + i * 0.22, 0.018, 4, 30), glowMat(RUNE, { transparent: true, opacity: 0.75 }), 0, 0, 0, spirit, true); r.rotation.set(i * 1.1, i * 0.7, 0); r.userData.ring = i + 1; }
  halo(spirit, 0, 0, 0, 4.6, RUNE, 0.6); halo(spirit, 0, 0, 0, 1.6, 0xffffff, 0.7);
  const beamM = mesh(new T.CylinderGeometry(0.5, 1.5, 30, 12, 1, true), new T.MeshBasicMaterial({ color: RUNE, transparent: true, opacity: 0.07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }), 0, y + 15, 58.5, scene, true); beamM.userData.live = 1;
  const pl = new T.PointLight(0x7ff3e0, 1.0, 20); pl.position.set(0, 0.4, 0); spirit.add(pl);
  signpost(9.5, 49, 0.6); lampPost(13, 51.5); lampPost(-9.5, 45);
}

/* ---------- old stonebridge ---------- */
{
  const g = grpAt(BRIDGE.x, 0, BRIDGE.z), W = BRIDGE.w, H = BRIDGE.half;
  mesh(bx(H * 2, 0.5, W * 2), lam(STONE), 0, BRIDGE.y - 0.25, 0, g);
  for (let i = 0; i < 15; i++) mesh(bx(1.7, 0.06, W * 2 - 0.9), lam(i % 2 ? 0xb2b8ae : 0x9aa39c), -H + 1 + i * 2, BRIDGE.y + 0.01, 0, g, true);
  for (const s of [-1, 1]) {
    mesh(bx(H * 2, 0.6, 0.45), lam(STONE_D), 0, BRIDGE.y + 0.3, s * (W - 0.22), g); mesh(bx(H * 2 + 0.2, 0.14, 0.6), lam(STONE), 0, BRIDGE.y + 0.66, s * (W - 0.22), g);
    for (let i = -2; i <= 2; i++) { mesh(bx(0.7, 1.35, 0.7), lam(STONE_D), i * 7, BRIDGE.y + 0.6, s * (W - 0.22), g); mesh(bx(0.85, 0.16, 0.85), lam(STONE), i * 7, BRIDGE.y + 1.32, s * (W - 0.22), g); }
    mesh(bx(H * 2 - 2, 0.1, 0.5), lam(MOSS), 1, BRIDGE.y + 0.75, s * (W - 0.22), g, true).scale.x = 0.3;
  }
  /* underneath, sculpted in Blender: coursed piers with pointed cutwaters, and a stone barrel vault over each bay
     with a proud voussoir ring and coursed spandrels up to the deck (both pieces hang from the deck's underside) */
  const span = propGeo('BR_SPAN', STONE, 35, 0.8), pierG = propGeo('BR_PIER', STONE, 35, 0.8);
  if (span && pierG) {
    for (const px of [-7, 0, 7]) mesh(pierG, PIECE_MAT, px, BRIDGE.y - 0.5, 0, g);
    for (const px of [-10.5, -3.5, 3.5, 10.5]) mesh(span, PIECE_MAT, px, BRIDGE.y - 0.5, 0, g);
  } else {
    for (const px of [-7, 0, 7]) { mesh(bx(2.2, 5.4, W * 2 - 0.5), lam(STONE_D), px, BRIDGE.y - 3.1, 0, g); mesh(bx(2.8, 0.5, W * 2 + 0.3), lam(STONE), px, BRIDGE.y - 0.65, 0, g); }
    for (const px of [-3.5, 3.5]) { const a = mesh(new T.CylinderGeometry(2.4, 2.4, W * 2 - 0.6, 12, 1, true, 0, Math.PI), lam(STONE_D, { side: T.DoubleSide }), px, BRIDGE.y - 1.9, 0, g); a.rotation.set(Math.PI / 2, Math.PI / 2, 0); }
  }
  /* the piers stop a swimmer (out to where the vault gets too low for a head); on the deck above they are ignored */
  for (const px of [-7, 0, 7]) addBox(BRIDGE.x + px - 1.85, BRIDGE.x + px + 1.85, BRIDGE.z - W - 1.2, BRIDGE.z + W + 1.2, BRIDGE_SOFFIT);
  arch(BRIDGE.x + 17.5, BRIDGE.z, Math.PI / 2, true);
  lampPost(BRIDGE.x + 16, BRIDGE.z + 4); lampPost(BRIDGE.x - 16.5, BRIDGE.z - 4); signpost(BRIDGE.x - 18, BRIDGE.z + 4.5, 2.1);
}

/* ---------- Oakrest village ---------- */
const VILLAGE = { x: 78, z: 20 };
let villageFire: THREE.Object3D, windmill: THREE.Object3D;
{
  const V = VILLAGE, y = groundAt(V.x, V.z);
  house(V.x - 15, V.z - 15, 8, 7, 0xd9682e, 1, { shut: 0x3f7a6a });
  house(V.x + 13, V.z - 16, 9, 7, 0x9a4e3a, 1, { two: true, shut: 0x8a3a2e, sign: 0x8fd6c0 });
  house(V.x - 17, V.z + 14, 8, 8, 0xe07a2c, -1, { shut: 0x4f6a9a });
  house(V.x + 20, V.z + 14, 8, 7, 0x4f7a8a, -1, { shut: 0xc8a23a, sign: 0x4a4f57 });
  house(V.x, V.z + 24, 11, 8, 0xc9552a, -1, { two: true, h: 3.4, shut: 0x6a4c8a, sign: GOLD });
  // well
  const wg = grpAt(V.x, y, V.z);
  mesh(cyl(1.45, 1.6, 0.95, 12), lam(STONE), 0, 0.47, 0, wg); mesh(cyl(1.6, 1.6, 0.16, 12), lam(STONE_D), 0, 1.0, 0, wg); mesh(cyl(1.15, 1.15, 0.1, 12), lam(0x2f7f93), 0, 0.8, 0, wg, true);
  for (const s of [-1, 1]) mesh(bx(0.2, 2.4, 0.2), lam(TIMBER), s * 1.3, 2.1, 0, wg);
  mesh(cyl(0.09, 0.09, 2.8, 6), lam(TIMBER), 0, 2.8, 0, wg).rotation.z = Math.PI / 2; mesh(cyl(0.012, 0.012, 1.2, 3), lam(0xd8c8a0), 0.2, 2.2, 0, wg, true); mesh(cyl(0.2, 0.16, 0.3, 8), lam(0x8a5a30), 0.2, 1.5, 0, wg, true);
  { const r = cyl(1.7, 1.7, 2.6, 3); r.rotateX(-Math.PI / 2); const rm = mesh(r, lam(0xd9682e), 0, 3.75, 0, wg); rm.rotation.y = Math.PI / 2; rm.scale.y = 0.6; }
  addCircle(V.x, V.z, 1.7, y + 1.08);
  // Tessa's stall
  const sx = V.x - 9, sz = V.z + 3, sg = grpAt(sx, y, sz);
  mesh(bx(3.6, 1, 1.4), lam(0x9a6a3c), 0, 0.5, 0, sg); mesh(bx(3.8, 0.1, 1.6), lam(0xb88a54), 0, 1.04, 0, sg);
  for (const a of [-1, 1]) for (const b of [-1, 1]) mesh(bx(0.14, 2.8, 0.14), lam(TIMBER), a * 1.7, 1.4, b * 0.95, sg);
  for (let k = 0; k < 6; k++) { const c = mesh(bx(0.66, 0.1, 2.5), lam(k % 2 ? 0xc8452f : 0xf2ead8), -1.65 + k * 0.66, 2.85, 0, sg); c.rotation.x = 0.16; }
  for (let k = 0; k < 5; k++) mesh(sph(0.17, 7, 6), lam([0xd94a3a, 0xe8c36a, 0x7fae4a, 0xd94a3a, 0xff9a3c][k]), -1.3 + k * 0.3, 1.24, 0.25 - (k % 2) * 0.4, sg, true);
  for (let k = 0; k < 3; k++) { mesh(cyl(0.1, 0.13, 0.36, 7), lam(0x8fd6c0), 0.6 + k * 0.35, 1.27, 0.1, sg, true); mesh(cyl(0.05, 0.05, 0.12, 6), lam(0x8a5a30), 0.6 + k * 0.35, 1.5, 0.1, sg, true); }
  mesh(bx(0.5, 0.4, 0.5), lam(0xb07c44), 1.3, 1.3, -0.3, sg, true);
  addBox(sx - 1.8, sx + 1.8, sz - 0.7, sz + 0.7, y + 1.09);
  barrel(sx - 2.5, sz - 0.2); barrel(sx - 2.6, sz + 0.8); crate(sx + 2.6, sz + 0.2, 0.8); addCircle(sx - 2.55, sz + 0.3, 0.7, y + 1.0); addCircle(sx + 2.6, sz + 0.2, 0.6, y + 0.8);
  // Borin's forge under a lean-to
  const fx = V.x + 10, fz = V.z + 7, fg = grpAt(fx, y, fz);
  mesh(bx(0.5, 0.5, 0.5), lam(0x6b4226), 0, 0.25, 0, fg); mesh(bx(1.1, 0.3, 0.5), lam(0x3c4046), 0, 0.72, 0, fg); mesh(new T.ConeGeometry(0.2, 0.5, 6), lam(0x3c4046), 0.75, 0.72, 0, fg).rotation.z = -Math.PI / 2;
  mesh(bx(1.9, 1.5, 1.9), lam(STONE_D), 2.6, 0.75, 1, fg); mesh(bx(1.3, 0.24, 1.3), glowMat(0xff8a3c), 2.6, 1.52, 1, fg, true); mesh(bx(1.1, 2.2, 1.1), lam(STONE), 2.6, 2.6, 1.3, fg); mesh(bx(1.3, 0.2, 1.3), lam(STONE_D), 2.6, 3.8, 1.3, fg);
  halo(scene, fx + 2.6, y + 1.7, fz + 1, 4.5, 0xff8a3c, 0.5); chimneys.push([fx + 2.6, y + 4.1, fz + 1.3]);
  for (const [px, pz] of [[-1.4, 2.6], [4.2, 2.6]]) mesh(bx(0.18, 3, 0.18), lam(TIMBER), px, 1.5, pz, fg);
  { const rf = mesh(bx(6.4, 0.14, 3.4), lam(0x9a4e3a), 1.4, 3.15, 1.6, fg); rf.rotation.x = -0.22; }
  mesh(bx(0.9, 0.8, 0.5), lam(0x8a5a30), -1.2, 0.4, 1.6, fg); for (let k = 0; k < 3; k++) mesh(bx(0.06, 0.9, 0.06), lam(0xcfd6da), -1.5 + k * 0.3, 1.1, 1.6, fg, true).rotation.z = 0.1 * k;
  addCircle(fx, fz, 0.7); addCircle(fx + 2.6, fz + 1, 1.2);
  // hearth fire with benches
  const cx = V.x + 5, cz = V.z + 6;
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; mesh(sph(0.24, 6, 5), lam(i % 2 ? STONE_D : STONE), cx + Math.cos(a) * 0.9, y + 0.12, cz + Math.sin(a) * 0.9, STATIC); }
  for (let i = 0; i < 3; i++) { const l = mesh(cyl(0.1, 0.1, 1.2, 6), lam(0x5a3d28), cx, y + 0.2, cz, STATIC); l.rotation.set(Math.PI / 2, 0, i * 1.05); }
  villageFire = mesh(new T.ConeGeometry(0.42, 1.2, 7), glowMat(0xffa23c), cx, y + 0.7, cz, scene, true); mesh(new T.ConeGeometry(0.22, 0.7, 6), glowMat(0xffe08a), 0, -0.15, 0, villageFire, true);
  const fl = new T.PointLight(0xff9a4a, 1.2, 18); fl.position.set(cx, y + 1.4, cz); scene.add(fl); villageFire.userData.light = fl; villageFire.userData.halo = halo(scene, cx, y + 0.9, cz, 5, 0xff9a4a, 0.55);
  addCircle(cx, cz, 1);
  for (const a of [0.6, 2.7, 4.6]) { const bxp = cx + Math.cos(a) * 2.6, bzp = cz + Math.sin(a) * 2.6, b = mesh(cyl(0.3, 0.3, 1.8, 8), lam(0x8a6a44), bxp, y + 0.3, bzp, STATIC); b.rotation.set(Math.PI / 2, 0, a); }
  // gate, fences, lamps, signs, banners
  arch(V.x - 31, V.z, Math.PI / 2, false);
  for (const s of [-1, 1]) { const bg = grpAt(V.x - 31, y, V.z + s * 3.6, 0, scene); mesh(cyl(0.07, 0.07, 5, 5), lam(TIMBER), 0, 2.5, 0, bg); const fl2 = mesh(bx(0.05, 1.7, 0.9), lam(s > 0 ? 0xc8452f : 0x2f6f7a), 0, 4, 0.5, bg, true); banners.push(fl2); mesh(bx(0.06, 0.3, 0.3), lam(GOLD), 0, 4.2, 0.5, bg, true); addCircle(V.x - 31, V.z + s * 3.6, 0.2); }
  fence(V.x - 30, V.z - 9, V.x - 20, V.z - 9); fence(V.x - 30, V.z + 9, V.x - 24, V.z + 9);
  lampPost(V.x - 24, V.z - 3); lampPost(V.x + 6, V.z - 8.5); lampPost(V.x - 5, V.z + 14); lampPost(V.x + 14, V.z + 2); lampPost(40, 31); lampPost(22, 47);
  signpost(V.x - 27, V.z + 4, -0.5, 3);
  // cart, hay, woodpile, laundry
  const cg = grpAt(V.x - 21, y, V.z - 5, 0.5);
  mesh(bx(2.6, 0.16, 1.4), lam(0xa8743c), 0, 0.85, 0, cg); for (const s of [-1, 1]) { mesh(bx(2.6, 0.5, 0.1), lam(0x8a5a30), 0, 1.15, s * 0.68, cg); const wh = mesh(new T.TorusGeometry(0.5, 0.08, 6, 14), lam(0x5a3d28), -0.4, 0.55, s * 0.82, cg); mesh(cyl(0.08, 0.08, 0.14, 6), lam(0x3c4046), -0.4, 0.55, s * 0.82, cg).rotation.x = Math.PI / 2; for (let k = 0; k < 3; k++) mesh(bx(0.95, 0.06, 0.05), lam(0x5a3d28), -0.4, 0.55, s * 0.82, cg).rotation.z = k * 1.05; }
  mesh(bx(1.8, 0.08, 0.1), lam(0x8a5a30), 2.1, 0.7, 0, cg).rotation.z = -0.25; mesh(sph(0.7, 8, 6), lam(0xe0c060), 0.3, 1.4, 0, cg).scale.set(1.5, 0.8, 0.9);
  addCircle(V.x - 21, V.z - 5, 1.5);
  for (const [hx, hz, r] of [[100, 4, 0], [101.6, 5.2, 1], [100.6, 6.6, 0.4], [118, 8, 0.8]]) { const hb = mesh(cyl(0.8, 0.8, 1.1, 12), lam(0xe0c060), hx, groundAt(hx, hz) + 0.8, hz, STATIC); hb.rotation.set(Math.PI / 2, 0, r); mesh(cyl(0.82, 0.82, 0.1, 12), lam(0xb89a40), hx, groundAt(hx, hz) + 0.8, hz, STATIC).rotation.set(Math.PI / 2, 0, r); addCircle(hx, hz, 0.9, groundAt(hx, hz) + 1.58); }
  for (let k = 0; k < 9; k++) { const l = mesh(cyl(0.14, 0.14, 1.3, 6), lam(k % 2 ? 0x8a6a44 : 0x7a5a38), V.x + 16.5 + (k % 3) * 0.3, y + 0.16 + Math.floor(k / 3) * 0.27, V.z + 6.5 + (k % 3) * 0.02, STATIC); l.rotation.x = Math.PI / 2; }
  addCircle(V.x + 16.8, V.z + 6.5, 0.8, y + 0.9);
  { const lx0 = V.x - 23, lz = V.z + 22.5, ly = groundAt(lx0, lz); for (const px of [0, 5]) mesh(cyl(0.06, 0.06, 2.4, 5), lam(TIMBER), lx0 + px, ly + 1.2, lz, STATIC); mesh(bx(5, 0.02, 0.02), lam(0xd8c8a0), lx0 + 2.5, ly + 2.3, lz, STATIC, true); [0xc8452f, 0xf2ead8, 0xe8c36a, 0x4f7a8a, 0xf2ead8].forEach((c, k) => { const cl = mesh(bx(0.6, 0.8 - (k % 2) * 0.2, 0.03), lam(c), lx0 + 0.6 + k * 0.95, ly + 1.9 + (k % 2) * 0.1, lz, scene, true); banners.push(cl); cl.userData.small = 1; }); }
  // kitchen garden and wheat field
  fence(104, 14, 114, 14); fence(104, 24, 114, 24); fence(114, 14, 114, 24); fence(104, 14, 104, 17); fence(104, 21, 104, 24);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { const gx = 105.5 + k * 1.5, gz = 15.6 + r * 2.3, gy = groundAt(gx, gz); if (r < 2) mesh(sph(0.34, 7, 5), lam(r ? 0x7fbf5a : 0x9ad06a), gx, gy + 0.2, gz, STATIC, true).scale.y = 0.75; else if (r === 2) { mesh(sph(0.3, 8, 6), lam(0xf08a2c), gx, gy + 0.22, gz, STATIC, true).scale.y = 0.75; mesh(cyl(0.03, 0.03, 0.14, 4), lam(VINE), gx, gy + 0.5, gz, STATIC, true); } else { mesh(cyl(0.03, 0.03, 1, 4), lam(TIMBER), gx, gy + 0.5, gz, STATIC, true); mesh(sph(0.26, 6, 5), lam(0x5fa04a), gx, gy + 0.7, gz, STATIC, true); mesh(sph(0.08, 5, 4), lam(0xd94a3a), gx + 0.15, gy + 0.65, gz + 0.15, STATIC, true); } }
  for (let r = 0; r < 4; r++) mesh(bx(9, 0.12, 0.9), lam(0x7a5a3c), 109.2, groundAt(109, 15.6 + r * 2.3) + 0.02, 15.6 + r * 2.3, STATIC, true);
  fence(103, -16, 122, -16, false); fence(122, -16, 122, 3, false); fence(103, 3, 122, 3, false);
  { const sc = grpAt(112.5, groundAt(112.5, -6.5), -6.5, 0.4); mesh(cyl(0.06, 0.06, 2.4, 5), lam(TIMBER), 0, 1.2, 0, sc); mesh(cyl(0.05, 0.05, 1.8, 5), lam(TIMBER), 0, 1.75, 0, sc).rotation.z = Math.PI / 2; mesh(bx(0.7, 0.9, 0.3), lam(0x8a3a2e), 0, 1.5, 0, sc); mesh(sph(0.26, 8, 6), lam(0xe0c060), 0, 2.25, 0, sc); mesh(new T.ConeGeometry(0.42, 0.4, 8), lam(0x8a6a44), 0, 2.55, 0, sc); mesh(cyl(0.5, 0.5, 0.04, 10), lam(0x8a6a44), 0, 2.38, 0, sc); }
  // windmill on the rise north-east of the square
  const mx = 97, mz = -10, my = groundAt(mx, mz), mg = grpAt(mx, my - 0.2, mz);
  mesh(cyl(2.5, 3.3, 8.5, 10), lam(0xeadfc6), 0, 4.25, 0, mg); mesh(cyl(3.4, 3.5, 1.1, 10), lam(0x8e918b), 0, 0.55, 0, mg); mesh(cyl(2.65, 2.65, 0.3, 10), lam(TIMBER), 0, 8.55, 0, mg);
  mesh(new T.ConeGeometry(3.1, 3, 10), lam(0x9a4e3a), 0, 10.2, 0, mg); for (let k = 0; k < 4; k++) mesh(bx(0.16, 8.3, 0.16), lam(TIMBER), Math.cos(k * 1.571 + 0.4) * 2.9, 4.3, Math.sin(k * 1.571 + 0.4) * 2.9, mg).rotation.set(Math.sin(k * 1.571 + 0.4) * 0.09, 0, -Math.cos(k * 1.571 + 0.4) * 0.09);
  mesh(bx(1.2, 2, 0.2), lam(0x7a4a2a), 0, 1.9, 3.2, mg); mesh(bx(0.8, 0.9, 0.2), windowMat, 0, 5.6, 2.75, mg, true); mesh(cyl(0.2, 0.2, 1.6, 8), lam(TIMBER), 0, 8.2, 2.9, mg).rotation.x = Math.PI / 2;
  windmill = new T.Group(); windmill.position.set(mx, my + 8, mz + 3.75); scene.add(windmill);
  for (let k = 0; k < 4; k++) { const b = new T.Group(); b.rotation.z = k * Math.PI / 2; windmill.add(b); mesh(bx(0.16, 6.6, 0.12), lam(TIMBER), 0, 3.3, 0, b); mesh(bx(1.5, 5, 0.05), lam(0xf2ead8), 0.75, 3.8, 0, b); for (let j = 0; j < 5; j++) mesh(bx(1.5, 0.06, 0.08), lam(TIMBER), 0.75, 1.5 + j * 1.15, 0.02, b, true); }
  mesh(sph(0.35, 8, 6), lam(TIMBER), 0, 0, 0.1, windmill);
  addCircle(mx, mz, 3.5); lampPost(mx - 5, mz + 4);
  waystone('village', 70, 11);
}

/* ---------- Hawk's Rest (mesa) ---------- */
{
  pillar(MESA.x - 4, MESA.z - 4, 3.2); pillar(MESA.x + 5, MESA.z + 3, 1.6, 0.6, true, true); pillar(MESA.x - 5, MESA.z + 4, 4.4);
  const g = grpAt(MESA.x + 5.5, MESA.top, MESA.z - 5); mesh(cyl(0.08, 0.08, 6, 5), lam(TIMBER), 0, 3, 0, g);
  const fl = mesh(bx(0.05, 1.5, 2.2), lam(0xc8452f), MESA.x + 5.5, MESA.top + 5.1, MESA.z - 3.8, scene, true); banners.push(fl);
  waystone('mesa', 43, -92);
}

/* ---------- Mossfall ruins + goblin camp ---------- */
let campFire: THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>;
{
  arch(-95, 14, 0, true); pillar(-101, 22, 4.2); pillar(-89, 24, 2, 0.6, true, true); pillar(-99, 27, 1.2, 0.6, true, true); pillar(-90, 17, 3.4);
  const rg = grpAt(-95, groundAt(-95, 20), 20);
  mesh(cyl(4.2, 4.5, 0.25, 16), lam(STONE_D), 0, 0.05, 0, rg); mesh(new T.TorusGeometry(3, 0.06, 5, 30), glowMat(RUNE), 0, 0.2, 0, rg, true).rotation.x = Math.PI / 2;
  for (let k = 0; k < 5; k++) { const b = mesh(bx(1 + rng(), 0.6 + rng() * 0.5, 0.8 + rng()), lam(k % 2 ? STONE : STONE_D), rng() * 10 - 5, 0.3, rng() * 10 - 5, rg); b.rotation.set(rng() * 0.4, rng() * 3, rng() * 0.4); }
  halo(scene, -95, groundAt(-95, 20) + 1, 20, 7, RUNE, 0.25, true);
  const y = groundAt(-85, 70), cg = grpAt(0, 0, 0);
  for (const [tx, tz, r] of [[-91, 65, 0.4], [-79, 66, 2.2], [-86, 77, 4.2]]) {
    const tg = grpAt(tx, y, tz, r, cg); mesh(new T.ConeGeometry(2.5, 3.3, 7), lam(0x8a6a44), 0, 1.65, 0, tg); mesh(new T.ConeGeometry(2.55, 0.9, 7), lam(0x6b4a30), 0, 0.45, 0, tg);
    for (let k = 0; k < 4; k++) { const p = mesh(cyl(0.05, 0.05, 1.2, 4), lam(0x4a3526), Math.cos(k * 1.57) * 0.2, 3.5, Math.sin(k * 1.57) * 0.2, tg); p.rotation.set(Math.sin(k * 1.57) * 0.4, 0, -Math.cos(k * 1.57) * 0.4); }
    mesh(bx(0.9, 1.5, 0.1), lam(0x2a1f18), 0, 0.75, 2.05, tg, true).rotation.x = -0.6; mesh(bx(0.5, 0.5, 0.05), lam(0xc8452f), 0.9, 1.9, 1.5, tg, true).rotation.set(-0.6, 0, 0.785);
    addCircle(tx, tz, 2.2);
  }
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + 0.3; if (i === 2 || i === 3) continue; for (let k = -1; k <= 1; k++) { const aa = a + k * 0.14, px = -85 + Math.cos(aa) * 12.5, pz = 70 + Math.sin(aa) * 12.5; const s = mesh(new T.ConeGeometry(0.26, 2.4 + rng(), 5), lam(0x6b4a2c), px, groundAt(px, pz) + 1.2, pz, cg); s.rotation.set((rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.4); } addCircle(-85 + Math.cos(a) * 12.5, 70 + Math.sin(a) * 12.5, 0.9); }
  for (const [qx, qz] of [[-80.5, 62], [-90.5, 61.5]]) { const tg = grpAt(qx, groundAt(qx, qz), qz, 0, cg); mesh(cyl(0.08, 0.1, 3, 5), lam(0x4a3526), 0, 1.5, 0, tg); mesh(sph(0.3, 8, 6), lam(0xe8e4d6), 0, 3.1, 0, tg); for (const s of [-1, 1]) mesh(new T.ConeGeometry(0.07, 0.5, 5), lam(0xe8e4d6), s * 0.28, 3.3, 0, tg).rotation.z = -s * 0.9; mesh(bx(0.8, 0.5, 0.04), lam(0x8a3a2e), 0, 2.3, 0.1, tg, true); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mesh(sph(0.22, 6, 5), lam(STONE_D), -85 + Math.cos(a) * 0.9, y + 0.1, 72 + Math.sin(a) * 0.9, cg); }
  campFire = mesh(new T.ConeGeometry(0.5, 1.3, 7), glowMat(0xffa23c), -85, y + 0.7, 72, scene, true); campFire.userData.halo = halo(scene, -85, y + 0.9, 72, 5.5, 0xff9a4a, 0.55);
  for (const s of [-1, 1]) mesh(cyl(0.05, 0.05, 1.5, 4), lam(0x4a3526), -85 + s * 1.1, y + 0.75, 72, cg); mesh(cyl(0.04, 0.04, 2.4, 4), lam(0x4a3526), -85, y + 1.45, 72, cg).rotation.z = Math.PI / 2;
  bake(cg);
}

/* ---------- Veilfall ---------- */
const waterfall = (() => {
  const g = grpAt(0, 0, 0), rg = puffGeo(1, 0.3, true), rock = painted(new T.MeshToonMaterial({ color: 0x8a938e, gradientMap: TOON, vertexColors: true }), 'cliff', 0.12, 0.9);
  const blob = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => { const m = mesh(rg, rock, x, y, z, g); m.scale.set(sx, sy, sz); m.rotation.set(rng() * 0.6, rng() * 6, rng() * 0.6); };
  blob(-39, 6, -165, 9, 12, 8); blob(-11, 6, -165, 9, 13, 8); blob(-25, 9, -175, 18, 13, 6); blob(-25, 18, -167, 15, 4.4, 9);
  blob(-44, 3, -160, 5, 6, 5); blob(-6, 3, -160, 5, 5, 5); blob(-50, 9, -170, 8, 14, 9); blob(0, 8, -170, 8, 13, 9); blob(-34, 15, -172, 7, 8, 6); blob(-15, 16, -173, 7, 8, 6);
  blob(-33, -0.6, -154.5, 1.6, 1.2, 1.4); blob(-17.5, -0.6, -155, 1.8, 1.3, 1.5); blob(-29, -1, -153, 1, 0.8, 1); blob(-21, -1, -152.6, 1.1, 0.8, 1);
  const pg = puffGeo(1, 0.2), mossM = new T.MeshToonMaterial({ color: 0x5f9a45, gradientMap: TOON, vertexColors: true });
  for (const [mx2, my2, mz2, s] of [[-40, 17.5, -163, 5], [-10, 18.5, -163, 5], [-25, 22, -167, 8], [-48, 22, -169, 4.5], [1, 20, -169, 4.5], [-44, 8, -157.6, 2.2], [-6, 7, -157.6, 2]]) mesh(pg, mossM, mx2, my2, mz2, g).scale.set(s, s * 0.32, s * 0.8);
  for (const [tx, tz] of [[-43, -164], [-8, -165], [-30, -170], [-19, -171]]) { mesh(cyl(0.2, 0.3, 3, 6), lam(0x5a3d28), tx, 20.5, tz, g); for (let k = 0; k < 3; k++) { const c = mesh(new T.ConeGeometry(1.6 - k * 0.4, 2.2, 8), lam(0x2f6a45), tx, 22 + k * 1.3, tz, g); } }
  for (let k = 0; k < 8; k++) mesh(cyl(0.04, 0.04, 3 + rng() * 4, 4), lam(VINE), -33 + (k < 4 ? k * 0.5 : 13.5 + k * 0.4), 13 - rng() * 2, -158.2, g, true);
  addBox(-48, -31.5, -173, -158); addBox(-18.5, -2, -173, -158); addBox(-48, -2, -180, -171);
  const mk = (rep: number, a: number) => { const c = makeCanvas(64, 256), x = ctx2d(c); x.clearRect(0, 0, 64, 256); x.fillStyle = `rgba(214,244,250,${a})`; x.fillRect(0, 0, 64, 256); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${0.35 + rng() * 0.6})`; const w = 1 + rng() * 4, px = rng() * 64, py = rng() * 256, hh = 30 + rng() * 90; for (const oy of [-256, 0]) x.fillRect(px, py + oy, w, hh); } for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(90,180,210,${0.15 + rng() * 0.3})`; x.fillRect(rng() * 64, rng() * 256, 1 + rng() * 2, 20 + rng() * 60); } const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, 1); return t; };
  const tx = mk(3, 0.9), tx2 = mk(5, 0.0);
  const fall = mesh(new T.PlaneGeometry(13, 19, 1, 6), new T.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0.9, side: T.DoubleSide }), -25, WATER_Y + 9.3, -158.4, scene, true);
  { const p = fall.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, smooth(9.5, -9.5, p.getY(i)) * 1.1); }
  const fall2 = mesh(new T.PlaneGeometry(14, 19.4), new T.MeshBasicMaterial({ map: tx2, transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false }), -25, WATER_Y + 9.4, -157.7, scene, true);
  const foam = mesh(new T.CircleGeometry(1, 20), glowMat(0xffffff, { transparent: true, opacity: 0.7, depthWrite: false }), -25, WATER_Y + 0.08, -156.6, scene, true); foam.rotation.x = -Math.PI / 2; foam.scale.set(8, 3, 1);
  const mist = [halo(scene, -25, WATER_Y + 1.6, -156, 16, 0xffffff, 0.3), halo(scene, -29, WATER_Y + 3, -156.5, 11, 0xffffff, 0.2), halo(scene, -21, WATER_Y + 2.6, -156.2, 12, 0xffffff, 0.22)];
  mist.forEach(m => { m.material.blending = T.NormalBlending; });
  // a faint rainbow in the spray
  const rb = new T.Group(); rb.position.set(-25, WATER_Y, -151); scene.add(rb);
  [0xff5a5a, 0xffb04a, 0xfff06a, 0x7fe07a, 0x6ab4ff, 0xb07aff].forEach((c, k) => { const t = mesh(new T.TorusGeometry(9.6 - k * 0.22, 0.12, 4, 40, Math.PI), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending }), 0, 0, 0, rb, true); });
  bake(g);
  return { tx, tx2, fall, mist, foam, rb };
})();

/* ---------- Temple of Echoes ---------- */
const gates: Record<string, any> = {}, temple: Record<string, any> = {};
function wallBox(x0: number, x1: number, z0: number, z1: number, h = 7, collide = true) {
  const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, long = Math.max(w, d), alongX = w > d, thick = Math.min(w, d);
  if (MASONRY) {
    /* coursed segments 4 m long (stretched a little to fit), every other one turned about so the joints never repeat */
    const ns = Math.max(1, Math.round(long / 4)), sl = long / ns;
    for (let i = 0; i < ns; i++) {
      const t = (i + 0.5) / ns - 0.5, seg = mesh(MASONRY.walls[(i + Math.round(cx + cz)) & 1], PIECE_MAT, cx + (alongX ? t * w : 0), 3, cz + (alongX ? 0 : t * d), STATIC);
      seg.rotation.y = (alongX ? 0 : Math.PI / 2) + (i % 3 === 1 ? Math.PI : 0); seg.scale.set(sl / 4, h / 7, thick / 1.2);
    }
  } else { mesh(bx(w, h, d), lam(STONE), cx, 3 + h / 2, cz, STATIC); mesh(bx(w + 0.35, 0.8, d + 0.35), lam(STONE_D), cx, 3.4, cz, STATIC); mesh(bx(w + 0.3, 0.3, d + 0.3), lam(STONE_D), cx, 3 + h - 0.6, cz, STATIC); }
  const n = Math.floor(long / 2.6);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n - 0.5; if (i % 2 === 0) { if (MASONRY) { const m = mesh(MASONRY.merlon, PIECE_MAT, cx + (alongX ? t * w : 0), 3 + h - 0.02, cz + (alongX ? 0 : t * d), STATIC); m.rotation.y = alongX ? 0 : Math.PI / 2; m.scale.set(1, 1, (thick + 0.1) / 1.2); } else mesh(alongX ? bx(1.3, 0.9, d + 0.1) : bx(w + 0.1, 0.9, 1.3), lam(STONE), cx + (alongX ? t * w : 0), 3 + h + 0.45, cz + (alongX ? 0 : t * d), STATIC); } else if (i % 3 === 0) mesh(alongX ? bx(1.6, 0.2, d + 0.4) : bx(w + 0.4, 0.2, 1.6), lam(MOSS), cx + (alongX ? t * w : 0), 3 + h + 0.1, cz + (alongX ? 0 : t * d), STATIC, true); }
  if (long > 30) for (let i = 0; i < n; i += 4) { const t = (i + 0.5) / n - 0.5; for (const s of [-1, 1]) { const px = cx + (alongX ? t * w : s * (w / 2 + 0.05)), pz = cz + (alongX ? s * (d / 2 + 0.05) : t * d); if (IVY_MAT && MASONRY) { if (i % 8 !== 0) ivy(STATIC, px, 3 + h - 0.08, pz, alongX ? (s > 0 ? 0 : Math.PI) : (s > 0 ? Math.PI / 2 : -Math.PI / 2), 3 + (i % 3), 1.2, i * 31 + (s > 0 ? 7 : 0) + Math.round(cx)); } else mesh(cyl(0.05, 0.05, 2.5 + (i % 3), 4), lam(VINE), px, 3 + h - 1.6 - (i % 3) * 0.5, pz, STATIC, true); if (i % 8 === 0) mesh(alongX ? bx(1.2, h * 0.75, 0.7) : bx(0.7, h * 0.75, 1.2), lam(STONE_D), px, 3 + h * 0.37, pz, STATIC); } }
  if (collide) addBox(x0, x1, z0, z1);
}
function gate(id: string, X: number, color: number) {
  const m = mesh(bx(0.8, 7, 6), lam(0x717d77), X, 6.5, TP.zc);
  for (const s of [-1, 1]) { mesh(bx(0.06, 5.6, 0.22), glowMat(color), s * 0.42, 0, -2.4, m, true); mesh(bx(0.06, 5.6, 0.22), glowMat(color), s * 0.42, 0, 2.4, m, true); mesh(bx(0.1, 7, 0.3), lam(STONE_D), s * 0.38, 0, 0, m, true); emblem(m, s * 0.46, 0.6, 0, 1.15, color).rotation.y = s * Math.PI / 2; }
  for (const s of [-1, 1]) { mesh(bx(1.5, 7.6, 1), lam(STONE_D), X, 6.8, TP.zc + s * 3.4, STATIC); mesh(bx(1.7, 0.4, 1.2), lam(STONE), X, 10.5, TP.zc + s * 3.4, STATIC); }
  gates[id] = { mesh: m, box: addBox(X - 0.6, X + 0.6, TP.zc - 3, TP.zc + 3), open: false, X, hl: halo(scene, X, 7.1, TP.zc, 7, color, 0.3) };
}
function symbolTex(i: number) {
  const c = makeCanvas(128, 128), x = ctx2d(c); x.clearRect(0, 0, 128, 128);
  x.strokeStyle = x.fillStyle = '#aefff0'; x.lineWidth = 8; x.lineCap = 'round'; x.shadowColor = '#7ff3e0'; x.shadowBlur = 14;
  if (i === 0) { x.beginPath(); x.arc(64, 64, 22, 0, 6.3); x.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; x.beginPath(); x.moveTo(64 + Math.cos(a) * 34, 64 + Math.sin(a) * 34); x.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); x.stroke(); } }
  else if (i === 1) { x.beginPath(); x.arc(64, 64, 40, 0.9, 5.4); x.arc(82, 64, 30, 4.9, 1.4, true); x.closePath(); x.fill(); }
  else if (i === 2) { x.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 - 1.571, r = k % 2 ? 20 : 46; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath(); x.fill(); }
  else { x.beginPath(); x.moveTo(30, 100); x.quadraticCurveTo(26, 34, 100, 26); x.quadraticCurveTo(98, 96, 30, 100); x.fill(); x.strokeStyle = '#1d5a55'; x.lineWidth = 4; x.shadowBlur = 0; x.beginPath(); x.moveTo(34, 96); x.lineTo(88, 40); x.stroke(); }
  return new T.CanvasTexture(c);
}
const SYMBOLS = ['Sun', 'Moon', 'Star', 'Leaf'], SYM_TEX = [0, 1, 2, 3].map(symbolTex);
{
  const fl = mesh(bx(TP.x1 - TP.x0, 0.12, TP.z1 - TP.z0), lam(0xb9bfb3), (TP.x0 + TP.x1) / 2, 2.96, TP.zc, STATIC, true); fl.receiveShadow = true; fl.userData.live = 1;
  for (let i = 0; i < 20; i++) mesh(bx(0.1, 0.02, TP.z1 - TP.z0 - 2), lam(0x9aa39c), TP.x0 + 4 + i * 4.1, 3.03, TP.zc, STATIC, true);
  for (let i = 0; i < 7; i++) mesh(bx(TP.x1 - TP.x0 - 2, 0.02, 0.1), lam(0x9aa39c), (TP.x0 + TP.x1) / 2, 3.03, TP.z0 + 4 + i * 4, STATIC, true);
  for (const [rx, rr, c] of [[-88, 4, RUNE], [-106, 4.5, RUNE], [-121, 4, 0xff9a5a], [-145, 12, RUNE], [-145, 8, RUNE]]) mesh(new T.TorusGeometry(rr, 0.06, 4, 48), glowMat(c, { transparent: true, opacity: 0.55 }), rx, 3.05, TP.zc, STATIC, true).rotation.x = Math.PI / 2;
  wallBox(TP.x0, TP.x1, TP.z0, TP.z0 + 1); wallBox(TP.x0, TP.x1, TP.z1 - 1, TP.z1); wallBox(TP.x0, TP.x0 + 1, TP.z0, TP.z1);
  const GX = [-78, -98, -114, -128], GID = ['entry', 'g1', 'g2', 'g3'], GC = [GOLD, RUNE, RUNE, 0xff9a5a];
  GX.forEach((X, i) => {
    wallBox(X - 0.6, X + 0.6, TP.z0 + 1, TP.zc - 3); wallBox(X - 0.6, X + 0.6, TP.zc + 3, TP.z1 - 1);
    mesh(bx(1.6, 1.2, 7.4), lam(STONE_D), X, 10.6, TP.zc, STATIC); mesh(bx(1.9, 0.3, 7.8), lam(STONE), X, 11.3, TP.zc, STATIC);
    gate(GID[i], X, GC[i]);
  });
  // facade: stair, colonnade, braziers, sigil
  for (let k = 0; k < 3; k++) mesh(bx(1.2, 0.2, 9 - k), lam(k % 2 ? STONE : STONE_D), -76.6 + k * 0.0 - 0.0 + 0.9 * 0 + (2 - k) * 0.0, 2.72 + k * 0.1, TP.zc, STATIC).position.x = -75.2 - k * 0.5;
  for (const s of [-1, 1]) { pillar(-75.5, TP.zc + s * 5, 6.5, 0.8); pillar(-73, TP.zc + s * 9, 3.5, 0.6, true, true); pillar(-76.5, TP.zc + s * 12, 5, 0.7);
    const by = groundAt(-73.5, TP.zc + s * 2.6); mesh(cyl(0.3, 0.45, 1.3, 8), lam(STONE_D), -73.5, by + 0.65, TP.zc + s * 2.6, STATIC); mesh(cyl(0.6, 0.35, 0.35, 10), lam(0x4a4f57), -73.5, by + 1.45, TP.zc + s * 2.6, STATIC); mesh(new T.ConeGeometry(0.34, 0.9, 6), glowMat(0x7ff3e0), -73.5, by + 2.05, TP.zc + s * 2.6, scene, true); halo(scene, -73.5, by + 2.1, TP.zc + s * 2.6, 4, RUNE, 0.5); addCircle(-73.5, TP.zc + s * 2.6, 0.6); }
  emblem(scene, -77.3, 13.1, TP.zc, 1.5, GOLD).rotation.y = Math.PI / 2; mesh(bx(0.6, 4.4, 4.4), lam(STONE_D), -78, 13.1, TP.zc, STATIC).rotation.x = Math.PI / 4;
  waystone('temple', -71, -32);

  // room 1 — the weight of stone
  temple.plate = mesh(cyl(1.3, 1.4, 0.14, 14), lam(0x7d8983), -90, 3.09, -33, scene, true);
  temple.plateGlow = mesh(cyl(0.9, 0.9, 0.16, 14), glowMat(0x2c5a55), -90, 3.1, -33, scene, true);
  mesh(new T.TorusGeometry(1.6, 0.08, 5, 24), lam(STONE_D), -90, 3.06, -33, STATIC, true).rotation.x = Math.PI / 2;
  temple.block = mesh(bx(2.2, 2.2, 2.2), lam(0x8f9a93), -86, 4.1, -46);
  for (const s of [-1, 1]) { mesh(bx(2.3, 0.25, 2.3), lam(STONE_D), 0, s * 0.98, 0, temple.block, true); }
  emblem(temple.block, 0, 0, 1.12, 0.7, RUNE); emblem(temple.block, 1.12, 0, 0, 0.7, RUNE).rotation.y = Math.PI / 2;
  emblem(temple.block, 0, 0, -1.12, 0.7, RUNE).rotation.y = Math.PI; emblem(temple.block, -1.12, 0, 0, 0.7, RUNE).rotation.y = -Math.PI / 2;
  temple.blockBox = addBox(-87.1, -84.9, -47.1, -44.9, 5.2);
  temple.blockHome = [-86, -46];
  mesh(bx(0.5, 1.5, 0.9), lam(STONE_D), -80.2, 3.75, -28, STATIC); emblem(scene, -80.48, 3.9, -28, 0.3, GOLD).rotation.y = -Math.PI / 2; halo(scene, -80.6, 3.9, -28, 1.6, GOLD, 0.4);

  // room 2 — the three watchers
  temple.pillars = [-102, -106, -110].map((px, i) => {
    const g = new T.Group(); g.position.set(px, 3, -50); scene.add(g);
    mesh(cyl(1.1, 1.2, 0.3, 8), lam(STONE_D), 0, 0.15, 0, g); mesh(cyl(0.72, 0.88, 2.4, 8), lam(STONE), 0, 1.5, 0, g); mesh(cyl(1, 0.8, 0.35, 8), lam(STONE_D), 0, 2.85, 0, g);
    for (let k = 0; k < 4; k++) mesh(bx(0.08, 1.4, 0.05), glowMat(RUNE), Math.sin(k * 1.571) * 0.82, 1.5, Math.cos(k * 1.571) * 0.82, g, true).rotation.y = k * 1.571;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: SYM_TEX[0], transparent: true, depthWrite: false })); sp.position.set(0, 4.2, 0); sp.scale.set(1.8, 1.8, 1); g.add(sp); halo(g, 0, 4.2, 0, 3.4, RUNE, 0.3);
    addCircle(px, -50, 1.1); return { g, sp, x: px, z: -50, i };
  });
  mesh(bx(3.4, 2.6, 0.4), lam(STONE_D), -106, 4.3, -25.25, STATIC); for (const [w2, hy] of [[2.4, 4.9], [1.8, 4.5], [2.1, 4.1], [1.4, 3.7]]) mesh(bx(w2, 0.08, 0.06), glowMat(RUNE), -106, hy, -25.47, STATIC, true);

  // room 3 — flame and arrow
  temple.braziers = [-50, -30].map(bz => {
    mesh(cyl(0.7, 0.85, 0.3, 8), lam(STONE_D), -124.5, 3.15, bz, STATIC); mesh(cyl(0.45, 0.65, 1.6, 8), lam(STONE), -124.5, 4.05, bz, STATIC); mesh(cyl(0.95, 0.5, 0.5, 10), lam(0x4a4f57), -124.5, 5.05, bz, STATIC);
    const fl2 = mesh(new T.ConeGeometry(0.55, 1.5, 7), glowMat(0xffa23c), -124.5, 5.9, bz, scene, true); mesh(new T.ConeGeometry(0.3, 0.9, 6), glowMat(0xffe08a), 0, -0.2, 0, fl2, true); fl2.visible = false;
    const hl = halo(scene, -124.5, 6, bz, 6, 0xff9a4a, 0.6); hl.visible = false;
    addCircle(-124.5, bz, 0.95); return { x: -124.5, y: 5.3, z: bz, fl: fl2, hl, lit: false };
  });
  mesh(bx(1.4, 2.6, 2.6), lam(STONE_D), -128, 12.6, TP.zc, STATIC); mesh(bx(1.5, 0.4, 3.2), lam(STONE), -128, 14.1, TP.zc, STATIC);
  temple.eye = { x: -127.2, y: 12.6, z: TP.zc, lit: false, m: mesh(sph(0.75, 14, 10), new T.MeshBasicMaterial({ color: 0x2f5560 }), -127.2, 12.6, TP.zc, scene, true), hl: halo(scene, -127, 12.6, TP.zc, 5, 0x9ffcff, 0.6) };
  mesh(sph(0.3, 10, 8), glowMat(0x10262c), 0.52, 0, 0, temple.eye.m, true);
  mesh(bx(3.4, 2.6, 0.4), lam(STONE_D), -121, 4.3, -54.75, STATIC); for (const [w2, hy] of [[2.2, 4.8], [1.6, 4.3], [2, 3.8]]) mesh(bx(w2, 0.08, 0.06), glowMat(0xff9a5a), -121, hy, -54.53, STATIC, true);
  // dressing: rubble, urns, hanging banners
  for (const [ux, uz] of [[-80.5, -53], [-96, -27], [-100, -53], [-112.5, -53], [-116, -27], [-126, -27.5]]) { mesh(cyl(0.35, 0.25, 0.9, 8), lam(0x9a7a5a), ux, 3.45, uz, STATIC); mesh(cyl(0.22, 0.35, 0.25, 8), lam(0x8a6a4a), ux, 4.0, uz, STATIC); addCircle(ux, uz, 0.45); }
  for (const [bx2, c] of [[-88, 0x2f6f7a], [-106, 0x2f6f7a], [-121, 0x8a3a2e]]) for (const s of [-1, 1]) { const b = mesh(bx(2, 4, 0.06), lam(c), bx2 + s * 5, 7.2, s > 0 ? -25.1 : -54.9, STATIC, true); mesh(bx(2.2, 0.14, 0.14), lam(GOLD), bx2 + s * 5, 9.2, s > 0 ? -25.12 : -54.88, STATIC, true); }

  // arena: ring of columns, roots breaking through the floor
  for (const [ax, az] of [[-134, -51], [-134, -29], [-146, -52], [-146, -28], [-157, -50], [-157, -30]]) pillar(ax, az, 6 + rng() * 2, 0.8, true, rng() < 0.35);
  for (let k = 0; k < 9; k++) { const a = rng() * 6.283, r = 13 + rng() * 3, rx = clamp(-145 + Math.cos(a) * r, -159.5, -130), rz = clamp(-40 + Math.sin(a) * r * 0.9, -53.5, -26.5); const rt = mesh(cyl(0.2, 0.5, 4 + rng() * 3, 6), lam(0x5f432c), rx, 3.6, rz, STATIC); rt.rotation.set(rng() * 1.2 + 0.6, rng() * 6, 0); }
  emblem(scene, -160.9, 8.5, TP.zc, 2.6, RUNE).rotation.y = Math.PI / 2; halo(scene, -160.5, 8.5, TP.zc, 12, RUNE, 0.25);
}
/* ---------- Oakrest composition: paved square and streets, bell tower, gate walls, bunting, planters ---------- */
const PAVED: any[] = [];
function paved(x: number, z: number) {
  for (let i = 0; i < PAVED.length; i++) { const p = PAVED[i];
    if (p.length === 3) { if (Math.hypot(x - p[0], z - p[1]) < p[2]) return true; }
    else { const vx = p[2] - p[0], vz = p[3] - p[1], t = clamp(((x - p[0]) * vx + (z - p[1]) * vz) / (vx * vx + vz * vz), 0, 1); if (Math.hypot(x - p[0] - vx * t, z - p[1] - vz * t) < p[4]) return true; } }
  return false;
}
{
  const V = VILLAGE, y = groundAt(V.x, V.z), vr = mulberry(4242), g = grpAt(0, 0, 0);
  const cob = painted(lam(0xb9b09a), 'stone', 0.5, 0.95), cobD = painted(lam(0x8f8776), 'stone', 0.5, 0.95);
  const flat = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, z: number, dy: number) => { const o = mesh(geo, m, x, y + dy, z, g, true); o.receiveShadow = true; return o; };
  // the square: two rings of paving around the well
  flat(cyl(9.6, 9.6, 0.07, 32), cob, V.x, V.z, 0.03); flat(cyl(3.6, 3.6, 0.09, 24), cobD, V.x, V.z, 0.04);
  flat(new T.TorusGeometry(9.6, 0.22, 4, 40), cobD, V.x, V.z, 0.06).rotation.x = Math.PI / 2; flat(new T.TorusGeometry(6.4, 0.12, 4, 36), cobD, V.x, V.z, 0.07).rotation.x = Math.PI / 2;
  PAVED.push([V.x, V.z, 9.9]);
  const street = (x0: number, z0: number, x1: number, z1: number, wd: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0), m = flat(bx(len, 0.06, wd), cob, (x0 + x1) / 2, (z0 + z1) / 2, 0.028); m.rotation.y = -a;
    for (const s of [-1, 1]) for (let d = 0.4; d < len; d += 0.9 + vr() * 0.5) { const k = flat(bx(0.5 + vr() * 0.3, 0.12, 0.34), cobD, x0 + Math.cos(a) * d - Math.sin(a) * s * wd / 2, z0 + Math.sin(a) * d + Math.cos(a) * s * wd / 2, 0.05); k.rotation.y = -a + (vr() - 0.5) * 0.3; }
    PAVED.push([x0, z0, x1, z1, wd / 2 + 0.35]);
  };
  street(49, 20, 69, 20, 4.2);         // west gate to the square
  street(78, 29, 78, 39.4, 3.6);       // square to the elder's hall
  street(76.5, 11, 71.5, -5, 3.4);     // north road towards Hawk's Rest
  street(87, 20.5, 93.6, 18.2, 3);     // square to the bell tower
  // doorstep paths
  for (const [dx, dz, tx, tz] of [[63, 9.6, 66, 17.8], [91, 8.6, 85.5, 14], [61, 28.9, 66, 22.5], [98, 29.4, 87.5, 23.5]]) { const n = Math.round(Math.hypot(tx - dx, tz - dz) / 1.25); for (let i = 0; i <= n; i++) { const st = flat(cyl(0.42 + vr() * 0.15, 0.46, 0.07, 7), i % 2 ? cob : cobD, lerp(dx, tx, i / n) + (vr() - 0.5) * 0.3, lerp(dz, tz, i / n) + (vr() - 0.5) * 0.3, 0.03); st.rotation.y = vr() * 3; } }

  // bell tower: the landmark you can steer by from across the valley
  const tx = 96, tz = 17, tg = grpAt(tx, y, tz), st = lam(STONE), sd = lam(STONE_D), rf = painted(lam(0x9a4e3a), 'roof', 0.5, 1.0);
  mesh(bx(4.6, 1, 4.6), sd, 0, 0.5, 0, tg); mesh(bx(4, 10, 4), st, 0, 6, 0, tg);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(bx(0.7, 10.4, 0.7), sd, sx * 1.9, 6.1, sz * 1.9, tg);
  for (const hy of [4.2, 7.6]) mesh(bx(4.3, 0.3, 4.3), sd, 0, hy, 0, tg);
  mesh(bx(1.2, 2.2, 0.2), lam(0x7a4a2a), -2.02, 2.1, 0, tg).rotation.y = Math.PI / 2;
  for (const [wx, wz, ry] of [[-2.02, 0, Math.PI / 2], [0, 2.02, 0]]) { const w = mesh(bx(0.7, 1.1, 0.12), windowMat, wx, 6, wz, tg, true); w.rotation.y = ry; }
  mesh(bx(4.8, 0.4, 4.8), sd, 0, 11.2, 0, tg);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(bx(0.5, 2.6, 0.5), lam(TIMBER), sx * 1.9, 12.7, sz * 1.9, tg);
  mesh(bx(4.6, 0.3, 4.6), lam(TIMBER), 0, 14.1, 0, tg);
  mesh(new T.ConeGeometry(3.7, 4.4, 4), rf, 0, 16.4, 0, tg).rotation.y = Math.PI / 4; mesh(cyl(0.05, 0.05, 1.4, 5), lam(0x3f444b), 0, 19.2, 0, tg); mesh(sph(0.16, 8, 6), lam(GOLD), 0, 19.9, 0, tg);
  mesh(cyl(0.3, 0.62, 0.9, 12), lam(GOLD), 0, 12.9, 0, tg); mesh(sph(0.16, 8, 6), lam(0x8a6a1a), 0, 12.4, 0, tg); mesh(cyl(0.05, 0.05, 0.7, 5), lam(TIMBER), 0, 13.7, 0, tg);
  { const cf = mesh(cyl(1.05, 1.05, 0.14, 20), lam(0xf2ead8), -2.06, 9.3, 0, tg); cf.rotation.z = Math.PI / 2; const rim = mesh(new T.TorusGeometry(1.05, 0.09, 5, 24), lam(GOLD), -2.12, 9.3, 0, tg); rim.rotation.y = Math.PI / 2; mesh(bx(0.06, 0.8, 0.08), lam(0x2e2a1f), -2.16, 9.6, 0, tg, true); mesh(bx(0.06, 0.08, 0.55), lam(0x2e2a1f), -2.16, 9.3, 0.25, tg, true); }
  for (let k = 0; k < 5; k++) mesh(sph(0.34 + (k % 2) * 0.12, 6, 5), lam(k % 2 ? VINE : MOSS), 2.02, 1 + k * 0.7, -1.2 + (k % 3) * 0.5, tg, true).scale.x = 0.4;
  halo(scene, tx, y + 12.9, tz, 5, 0xffc56a, 0.6, true);
  addBox(tx - 2.3, tx + 2.3, tz - 2.3, tz + 2.3);

  // low stone walls flanking the west gate
  const wallArc = (a0: number, a1: number) => { const R = 30.5, n = Math.round(Math.abs(a1 - a0) * R / 1.5); for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), wx = V.x + Math.cos(a) * R, wz = V.z + Math.sin(a) * R, wy = groundAt(wx, wz); const b = mesh(bx(0.7, 0.95 + vr() * 0.25, 1.7), i % 2 ? st : sd, wx, wy + 0.45, wz, g); b.rotation.y = -a; if (i % 3 === 0) mesh(bx(0.85, 0.14, 1.2), lam(MOSS), wx, wy + 1.0, wz, g, true).rotation.y = -a; addCircle(wx, wz, 0.62); } };
  wallArc(2.53, 2.95); wallArc(3.33, 3.9);

  // bunting from the well roof to four poles at the edge of the square
  const FLAG = [0xc8452f, 0xf2ead8, 0xe8c36a, 0x2f6f7a], fg = new T.ConeGeometry(0.2, 0.42, 3); fg.rotateX(Math.PI); fg.scale(1, 1, 0.12);
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.78, px = V.x + Math.cos(a) * 9.2, pz = V.z + Math.sin(a) * 9.2;
    mesh(cyl(0.07, 0.09, 4.2, 6), lam(TIMBER), px, y + 2.1, pz, g); mesh(sph(0.13, 6, 5), lam(GOLD), px, y + 4.25, pz, g); addCircle(px, pz, 0.25);
    for (let i = 1; i < 12; i++) { const t = i / 12, fx = lerp(V.x, px, t), fz = lerp(V.z, pz, t), fy = lerp(y + 4.5, y + 4.1, t) - Math.sin(t * Math.PI) * 0.55; const f = mesh(fg, lam(FLAG[i % 4]), fx, fy - 0.2, fz, g, true); f.rotation.y = -a; }
    mesh(cyl(0.012, 0.012, 9.3, 3), lam(0xd8c8a0), (V.x + px) / 2, y + 4.05, (V.z + pz) / 2, g, true).rotation.set(0, -a, Math.PI / 2 - 0.045);
  }
  // planters by every door, benches on the square, a notice board inside the gate
  const BLOOM = [0xff6b8a, 0xffd24a, 0xffffff, 0xc58bff, 0xff9a3c];
  for (const [px, pz] of [[60.5, 9.3], [65.5, 9.3], [88.6, 8.3], [93.4, 8.3], [58.6, 29.2], [63.4, 29.2], [95.6, 29.7], [100.4, 29.7], [73.6, 39.2], [82.4, 39.2]]) {
    mesh(bx(1.1, 0.5, 0.5), lam(0x8a5a30), px, y + 0.25, pz, g); mesh(bx(1.16, 0.08, 0.56), lam(TIMBER), px, y + 0.5, pz, g);
    for (let k = 0; k < 3; k++) { mesh(sph(0.2, 6, 5), lam(VINE), px - 0.34 + k * 0.34, y + 0.62, pz, g, true); mesh(sph(0.11, 6, 5), lam(BLOOM[(k + (px | 0)) % 5]), px - 0.34 + k * 0.34 + 0.05, y + 0.8, pz + 0.04, g, true); }
    addCircle(px, pz, 0.5, y + 0.54);
  }
  for (const [bx0, bz0, ry] of [[71.2, 27.6, 0.75], [85.6, 12.2, -2.4]]) { const b = grpAt(bx0, y, bz0, ry, g); mesh(bx(1.8, 0.1, 0.5), lam(0xa8743c), 0, 0.5, 0, b); mesh(bx(1.8, 0.5, 0.08), lam(0xa8743c), 0, 0.85, -0.22, b); for (const s of [-1, 1]) mesh(bx(0.1, 0.5, 0.46), lam(TIMBER), s * 0.8, 0.25, 0, b); addCircle(bx0, bz0, 0.7, y + 0.55); }
  { const b = grpAt(51.5, y, 24.6, 1.2, g); for (const s of [-1, 1]) mesh(bx(0.12, 2.2, 0.12), lam(TIMBER), s * 0.8, 1.1, 0, b); mesh(bx(1.9, 1.2, 0.08), lam(0xb88a54), 0, 1.5, 0, b); mesh(bx(2.1, 0.12, 0.3), lam(0x9a4e3a), 0, 2.25, 0, b); for (const [nx, ny, c] of [[-0.5, 1.6, 0xf2ead8], [0.1, 1.45, 0xefe3c4], [0.55, 1.7, 0xf2ead8]]) mesh(bx(0.42, 0.5, 0.02), lam(c), nx, ny, 0.05, b, true).rotation.z = (nx) * 0.2; addCircle(51.5, 24.6, 0.6); }
  bake(g);
}
buildVegetation();
bake(STATIC);
/* everything built so far belongs to the open valley: hidden while the camera is down in the grotto (see updateCave) */
const OUTDOOR = scene.children.filter(o => !(o as THREE.Light).isLight && o !== partPts && o !== sun.target && o !== rain);
