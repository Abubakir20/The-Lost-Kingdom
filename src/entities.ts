/* ============ entities: jointed characters, hero, camera, combat, enemies, boss ============ */
const HG = { torso: cyl(0.265, 0.195, 0.58, 12), pelvis: cyl(0.2, 0.215, 0.22, 12), neck: cyl(0.06, 0.075, 0.16, 8), head: sph(0.265, 16, 12), eye: sph(0.04, 6, 5), ear: sph(0.06, 6, 5),
  uarm: cyl(0.076, 0.066, 0.32, 10), farm: cyl(0.064, 0.054, 0.3, 10), hand: sph(0.07, 8, 6), sho: sph(0.095, 10, 8), thigh: cyl(0.105, 0.085, 0.44, 10), shin: cyl(0.08, 0.064, 0.42, 10), boot: bx(0.15, 0.14, 0.3), knee: sph(0.086, 8, 6),
  hair: new T.SphereGeometry(0.285, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.56), robe: new T.CylinderGeometry(0.215, 0.42, 0.92, 12, 1, true), skirt: new T.CylinderGeometry(0.22, 0.36, 0.4, 12, 1, true) };
const grpIn = (par: THREE.Object3D, x: number, y: number, z: number) => { const n = new T.Group(); n.position.set(x, y, z); par.add(n); return n; };
function humanoid(o: HumanoidLook): Humanoid {
  const g = new T.Group(), p = {} as Rig, skin = lam(o.skin), top = lam(o.top), sleeve = lam(o.sleeve || o.top), bot = lam(o.bottom), boot = lam(o.boot || 0x4a3526);
  p.pivot = grpIn(g, 0, 0.9, 0); p.hips = grpIn(p.pivot, 0, -0.9, 0);
  mesh(HG.pelvis, bot, 0, 0.9, 0, p.hips);
  p.chest = grpIn(p.hips, 0, 0.95, 0);
  mesh(HG.torso, top, 0, 0.3, 0, p.chest); mesh(HG.neck, skin, 0, 0.63, 0, p.chest);
  p.head = grpIn(p.chest, 0, 0.75, 0);
  const hs = (o.headScale || 1) * 0.76; p.head.scale.setScalar(hs);
  mesh(HG.head, skin, 0, 0.02, 0, p.head).scale.set(1, 1.04, 0.98);
  for (const s of [-1, 1]) {
    const e = mesh(HG.eye, o.eye ? glowMat(o.eye) : lam(0x1d2026), s * 0.1, 0.03, 0.235, p.head, true); e.scale.set(1, 1.5, 0.6);
    if (!o.eye) mesh(sph(0.013, 5, 4), glowMat(0xffffff), s * 0.1 + 0.012, 0.05, 0.262, p.head, true);
    mesh(HG.ear, skin, s * 0.26, 0, 0, p.head, true).scale.set(0.5, 1, 0.8);
  }
  if (o.hair != null) { mesh(HG.hair, lam(o.hair), 0, 0.045, -0.015, p.head); if (o.style === 'bun') mesh(sph(0.13, 8, 6), lam(o.hair), 0, 0.26, -0.14, p.head); if (o.style === 'long') mesh(bx(0.44, 0.4, 0.14), lam(o.hair), 0, -0.14, -0.2, p.head); }
  if (o.beard != null) { mesh(sph(0.17, 8, 6), lam(o.beard), 0, -0.14, 0.14, p.head).scale.set(1.1, 1, 0.7); }
  if (o.hat === 'straw') { mesh(cyl(0.5, 0.52, 0.04, 12), lam(0xe0c060), 0, 0.2, 0, p.head); mesh(cyl(0.2, 0.27, 0.2, 10), lam(0xe0c060), 0, 0.3, 0, p.head); mesh(cyl(0.275, 0.275, 0.05, 10), lam(0xc8452f), 0, 0.23, 0, p.head); }
  else if (o.hat === 'helm') { mesh(new T.SphereGeometry(0.3, 12, 8, 0, 6.3, 0, 1.75), lam(0x8a929a), 0, 0.03, 0, p.head); mesh(bx(0.05, 0.3, 0.06), lam(0x8a929a), 0, -0.02, 0.28, p.head); mesh(new T.ConeGeometry(0.05, 0.22, 6), lam(0xc8452f), 0, 0.42, 0, p.head); }
  else if (o.hat === 'hood') { mesh(new T.SphereGeometry(0.33, 12, 9, 0, 6.3, 0, 2.2), lam(o.top), 0, 0.03, -0.04, p.head); mesh(new T.ConeGeometry(0.16, 0.36, 8), lam(o.top), 0, 0.22, -0.26, p.head).rotation.x = -1.9; }
  else if (o.hat === 'cap') { mesh(new T.SphereGeometry(0.29, 10, 6, 0, 6.3, 0, 1.3), lam(o.hatC || 0x5a7a4a), 0, 0.06, 0, p.head); mesh(bx(0.3, 0.03, 0.2), lam(o.hatC || 0x5a7a4a), 0, 0.1, 0.3, p.head); }
  for (const [k, s] of [['R', -1], ['L', 1]] as [Side, number][]) {
    const a = p[`arm${k}` as const] = grpIn(p.chest, s * 0.325, 0.47, 0);
    mesh(HG.sho, sleeve, 0, 0, 0, a); mesh(HG.uarm, sleeve, 0, -0.16, 0, a);
    const e = p[`elbow${k}` as const] = grpIn(a, 0, -0.32, 0); mesh(HG.farm, o.bare ? skin : sleeve, 0, -0.15, 0, e);
    const h = p[`hand${k}` as const] = grpIn(e, 0, -0.33, 0); mesh(HG.hand, skin, 0, 0, 0, h);
    const l = p[`leg${k}` as const] = grpIn(p.hips, s * 0.14, 0.85, 0); mesh(HG.thigh, bot, 0, -0.21, 0, l);
    const kn = p[`knee${k}` as const] = grpIn(l, 0, -0.43, 0); mesh(HG.knee, bot, 0, 0, 0, kn); mesh(HG.shin, o.robe != null ? bot : boot, 0, -0.2, 0, kn); mesh(HG.boot, boot, 0, -0.39, 0.06, kn);
  }
  if (o.robe != null) mesh(HG.robe, lam(o.robe, { side: T.DoubleSide }), 0, 0.5, 0, p.hips);
  if (o.skirt != null) mesh(HG.skirt, lam(o.skirt, { side: T.DoubleSide }), 0, 0.78, 0, p.hips);
  if (o.apron != null) { mesh(bx(0.42, 0.62, 0.04), lam(o.apron), 0, 0.72, 0.24, p.hips).rotation.x = -0.12; mesh(bx(0.36, 0.34, 0.04), lam(o.apron), 0, 0.3, 0.27, p.chest); }
  if (o.belt != null) { mesh(cyl(0.255, 0.255, 0.09, 12), lam(o.belt), 0, 0.03, 0, p.chest); mesh(bx(0.1, 0.1, 0.04), lam(GOLD), 0, 0.03, 0.29, p.chest); }
  if (o.tabard != null) { mesh(bx(0.4, 0.95, 0.03), lam(o.tabard), 0, 0.02, 0.27, p.chest); mesh(bx(0.4, 0.95, 0.03), lam(o.tabard), 0, 0.02, -0.26, p.chest); }
  p.a = null; p.baseLean = o.lean || 0;
  g.scale.setScalar(o.s || 1);
  return { g, p };
}
const POSE_KEYS: (keyof Pose)[] = ['aL', 'aR', 'zL', 'zR', 'eL', 'eR', 'lL', 'lR', 'kL', 'kR', 'bob', 'lean', 'tw', 'hy', 'hx'];
const _P = {} as Pose;
/* procedural poses, blended over time so every change of state eases in */
function animHumanoid(p: Rig, mode: string, t: number, dt: number, vy?: number) {
  const P = _P; for (const k of POSE_KEYS) P[k] = 0;
  P.eL = P.eR = -0.15; P.zL = 0.07; P.zR = -0.07;
  if (mode === 'walk' || mode === 'run') {
    const run = mode === 'run', f = run ? 13 : 8.5, amp = run ? 1.0 : 0.6, s = Math.sin(t * f), c = Math.cos(t * f), K = run ? 1.75 : 0.95;
    P.lL = s * amp - (run ? 0.15 : 0); P.lR = -s * amp - (run ? 0.15 : 0); P.kL = Math.max(0, -c) * K + 0.1; P.kR = Math.max(0, c) * K + 0.1;
    P.aL = -s * amp * 0.85; P.aR = s * amp * 0.85; P.eL = run ? -1.35 : -0.3 - Math.max(0, s) * 0.3; P.eR = run ? -1.35 : -0.3 - Math.max(0, -s) * 0.3;
    P.bob = Math.abs(c) * (run ? 0.09 : 0.045); P.lean = run ? 0.27 : 0.07; P.tw = s * (run ? 0.24 : 0.11); P.zL = 0.12; P.zR = -0.12;
  } else if (mode === 'air') {
    if ((vy || 0) > 0) { P.aL = P.aR = -0.5; P.zL = 0.9; P.zR = -0.9; P.eL = P.eR = -0.5; P.lL = -0.95; P.kL = 1.5; P.lR = 0.25; P.kR = 0.5; P.lean = 0.1; }
    else { P.aL = P.aR = -2.3; P.zL = 0.55; P.zR = -0.55; P.eL = P.eR = -0.3; P.lL = -0.35; P.kL = 0.6; P.lR = 0.2; P.kR = 0.35; P.lean = -0.05; }
  } else if (mode === 'glide') { P.aL = P.aR = -3.05; P.zL = 0.2; P.zR = -0.2; P.eL = P.eR = -0.1; P.lL = 0.3; P.lR = 0.2; P.kL = 0.5; P.kR = 0.3; P.lean = 0.3; }
  else if (mode === 'climb') { const s = Math.sin(t * 6); P.aL = -2.5 + s * 0.5; P.aR = -2.5 - s * 0.5; P.eL = -0.9 + s * 0.45; P.eR = -0.9 - s * 0.45; P.lL = -0.95 - s * 0.5; P.lR = -0.95 + s * 0.5; P.kL = 1.35 + s * 0.45; P.kR = 1.35 - s * 0.45; P.lean = -0.12; P.zL = 0.25; P.zR = -0.25; P.bob = s * 0.04; }
  else if (mode === 'swim') { const s = Math.sin(t * 5), c = Math.cos(t * 5); P.aL = -2.2 + s * 0.9; P.aR = -2.2 - s * 0.9; P.zL = 0.4 + c * 0.3; P.zR = -0.4 + c * 0.3; P.eL = P.eR = -0.4; P.lL = s * 0.45; P.lR = -s * 0.45; P.kL = 0.3 + Math.max(0, c) * 0.5; P.kR = 0.3 + Math.max(0, -c) * 0.5; P.lean = 1.1; P.hx = -0.8; }
  else if (mode === 'crouch') { const s = Math.sin(t * 7); P.lL = -1.15 + s * 0.25; P.lR = -1.15 - s * 0.25; P.kL = 1.9 - s * 0.2; P.kR = 1.9 + s * 0.2; P.lean = 0.42; P.bob = -0.36; P.aL = -0.5 - s * 0.2; P.aR = -0.5 + s * 0.2; P.eL = P.eR = -0.9; P.hx = -0.3; }
  else if (mode === 'windup') { P.aR = -3.0; P.eR = -0.7; P.aL = -0.7; P.eL = -0.9; P.tw = -0.55; P.lean = -0.14; P.lL = -0.3; P.kL = 0.4; P.lR = 0.35; P.zR = -0.3; }
  else if (mode === 'strike') { P.aR = -0.55; P.eR = -0.1; P.aL = 0.4; P.tw = 0.6; P.lean = 0.38; P.lL = -0.7; P.kL = 0.6; P.lR = 0.5; P.zR = 0.3; }
  else if (mode === 'stagger') { P.lean = -0.42; P.aL = P.aR = -0.4; P.zL = 0.9; P.zR = -0.9; P.hx = -0.5; P.kL = P.kR = 0.4; P.bob = -0.05; }
  else { const b = Math.sin(t * 1.9); P.bob = b * 0.012; P.aL = b * 0.04; P.aR = -b * 0.04; P.zL = 0.09 + b * 0.015; P.zR = -0.09 - b * 0.015; P.hy = Math.sin(t * 0.55) * 0.28; P.eL = P.eR = -0.2; P.tw = Math.sin(t * 0.55) * 0.06; }
  P.lean += p.baseLean;
  let A = p.a; if (!A) { A = p.a = {} as Pose; for (const k of POSE_KEYS) A[k] = P[k]; }
  const f = dt ? 1 - Math.exp(-(mode === 'windup' || mode === 'strike' ? 26 : 15) * dt) : 1;
  for (const k of POSE_KEYS) A[k] += (P[k] - A[k]) * f;
  const zb = p.zBias || 0; p.armL.rotation.set(A.aL, 0, A.zL + zb); p.armR.rotation.set(A.aR, 0, A.zR - zb); p.elbowL.rotation.x = A.eL; p.elbowR.rotation.x = A.eR;
  p.legL.rotation.x = A.lL; p.legR.rotation.x = A.lR; p.kneeL.rotation.x = A.kL; p.kneeR.rotation.x = A.kR;
  p.hips.position.y = -0.9 + A.bob; p.pivot.rotation.x = A.lean; p.chest.rotation.set(0, A.tw, 0); p.hips.rotation.y = -A.tw * 0.4; p.head.rotation.set(A.hx, A.hy - A.tw * 0.5, 0);
}
/* ink outline (inverted hull), the main thing that makes characters read as drawn rather than as blocks */
const OUTLINE: Record<string, THREE.MeshBasicMaterial> = {};
function outlineMat(th: number) { if (!OUTLINE[th]) { const m = new T.MeshBasicMaterial({ color: 0x33263a, side: T.BackSide }); m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * ' + th.toFixed(4) + ';'); }; m.customProgramCacheKey = () => 'ol' + th; OUTLINE[th] = m; } return OUTLINE[th]; }
function addOutline(g: THREE.Group, th = 0.014) { const list: any[] = []; g.traverse((o: any) => { if (o.isMesh && o.castShadow && o.material.isMeshToonMaterial && o.geometry.attributes.normal) list.push(o); }); for (const o of list) { const m = new T.Mesh(o.geometry, outlineMat(th)); m.userData.outline = 1; o.add(m); } }
/* give a character its own materials so it can flash when struck */
function ownMaterials(g: THREE.Group) { const map = new Map(), list: any[] = []; g.traverse((o: any) => { if (!o.isMesh || !o.material.emissive) return; let m = map.get(o.material); if (!m) { m = o.material.clone(); map.set(o.material, m); list.push(m); } o.material = m; }); return list; }

/* ---------- the Warden (player) ---------- */
const hero = humanoid({ skin: 0xd09a72, top: 0xf2ead8, bottom: 0x2f5d62, boot: 0x4a3526, belt: 0x8a5a30 }) as Hero;
scene.add(hero.g);
{
  const p = hero.p, RED = 0xc8452f, TEAL = 0x2f6f7a, HAIR = 0xf0ece4, LEATHER = 0x8a5a30;
  // tunic skirt with trim, strap, pouch
  mesh(HG.skirt, lam(0xf2ead8, { side: T.DoubleSide }), 0, 0.78, 0, p.hips);
  mesh(new T.TorusGeometry(0.355, 0.025, 5, 16), lam(TEAL), 0, 0.59, 0, p.hips).rotation.x = Math.PI / 2;
  mesh(bx(0.07, 0.72, 0.03), lam(LEATHER), 0, 0.3, 0.27, p.chest).rotation.z = 0.62; mesh(bx(0.07, 0.72, 0.03), lam(LEATHER), 0, 0.3, -0.25, p.chest).rotation.z = -0.62;
  mesh(bx(0.16, 0.18, 0.1), lam(LEATHER), 0.29, -0.06, 0.08, p.chest); mesh(bx(0.3, 0.05, 0.02), lam(TEAL), 0, 0.5, 0.25, p.chest);
  // scarf, short cape, scarf tails that catch the wind
  const sc = mesh(new T.TorusGeometry(0.15, 0.075, 8, 16), lam(RED), 0, 0.6, 0.01, p.chest); sc.rotation.x = Math.PI / 2; sc.scale.set(1, 1, 0.8);
  hero.cape = grpIn(p.chest, 0, 0.5, -0.24); mesh(bx(0.58, 0.72, 0.04), lam(RED), 0, -0.36, 0, hero.cape); mesh(bx(0.6, 0.06, 0.05), lam(GOLD), 0, -0.71, 0, hero.cape);
  hero.tails = [-1, 1].map(s => { const t = grpIn(p.chest, s * 0.1, 0.58, -0.2); mesh(bx(0.11, 0.5, 0.025), lam(RED), 0, -0.25, 0, t); const t2 = grpIn(t, 0, -0.5, 0); mesh(bx(0.1, 0.34, 0.025), lam(RED), 0, -0.17, 0, t2); t.userData.t2 = t2; t.userData.s = s; return t; });
  // pauldron, bracers, cuffs
  mesh(new T.SphereGeometry(0.16, 9, 6, 0, 6.3, 0, 1.6), lam(LEATHER), 0.02, 0.03, 0, p.armL); mesh(new T.TorusGeometry(0.15, 0.02, 4, 12), lam(GOLD), 0.02, 0.02, 0, p.armL).rotation.x = Math.PI / 2;
  for (const k of ['L', 'R'] as Side[]) { mesh(cyl(0.088, 0.078, 0.2, 7), lam(LEATHER), 0, -0.2, 0, p[`elbow${k}` as const]); mesh(cyl(0.09, 0.09, 0.03, 7), lam(GOLD), 0, -0.11, 0, p[`elbow${k}` as const]); mesh(cyl(0.12, 0.1, 0.12, 7), lam(0x6a4a30), 0, -0.08, 0, p[`knee${k}` as const]); }
  // hair: cap, fringe, side locks, tied tail; a teal band with a gold stud
  mesh(HG.hair, lam(HAIR), 0, 0.05, -0.02, p.head);
  for (const [hx, hz, rz] of [[-0.14, 0.2, 0.5], [0, 0.23, 0], [0.14, 0.2, -0.5]]) { const b = mesh(new T.ConeGeometry(0.085, 0.22, 5), lam(HAIR), hx, 0.17, hz, p.head); b.rotation.set(2.6, 0, rz); }
  for (const s of [-1, 1]) mesh(new T.ConeGeometry(0.07, 0.3, 5), lam(HAIR), s * 0.25, -0.06, 0.06, p.head).rotation.x = Math.PI;
  hero.pony = grpIn(p.head, 0, 0.08, -0.26); mesh(new T.ConeGeometry(0.1, 0.5, 6), lam(HAIR), 0, -0.2, 0, hero.pony).rotation.x = Math.PI; mesh(cyl(0.07, 0.07, 0.06, 6), lam(RED), 0, 0.02, 0, hero.pony);
  mesh(new T.TorusGeometry(0.272, 0.022, 5, 18), lam(TEAL), 0, 0.12, 0, p.head).rotation.x = Math.PI / 2 - 0.12; mesh(sph(0.035, 6, 5), lam(GOLD), 0, 0.15, 0.265, p.head);
  // scabbard and quiver across the back
  const sb = mesh(bx(0.1, 0.8, 0.05), lam(0x5a3d28), 0.05, 0.25, -0.3, p.chest); sb.rotation.z = 0.5; mesh(bx(0.11, 0.08, 0.06), lam(GOLD), -0.13, 0.57, -0.3, p.chest).rotation.z = 0.5;
  hero.quiver = grpIn(p.chest, -0.12, 0.3, -0.3); hero.quiver.rotation.z = -0.5; mesh(cyl(0.075, 0.065, 0.55, 7), lam(LEATHER), 0, 0, 0, hero.quiver); for (let k = 0; k < 3; k++) { mesh(cyl(0.01, 0.01, 0.3, 3), lam(0xe8dcc0), (k - 1) * 0.035, 0.36, 0, hero.quiver); mesh(new T.ConeGeometry(0.03, 0.08, 4), lam(RED), (k - 1) * 0.035, 0.5, 0, hero.quiver); }
  // sword
  hero.sword = grpIn(p.handR, 0, 0, 0.02);
  mesh(bx(0.085, 0.028, 0.92), lam(0xe8eff3), 0, 0, 0.6, hero.sword); const tip = mesh(new T.ConeGeometry(0.06, 0.18, 4), lam(0xe8eff3), 0, 0, 1.14, hero.sword); tip.rotation.x = Math.PI / 2; tip.scale.z = 0.33;
  mesh(bx(0.02, 0.032, 0.7), glowMat(0xaef4ea), 0, 0, 0.52, hero.sword, true);
  mesh(bx(0.36, 0.06, 0.07), lam(GOLD), 0, 0, 0.1, hero.sword); for (const s of [-1, 1]) mesh(sph(0.045, 6, 5), lam(GOLD), s * 0.19, 0, 0.1, hero.sword);
  mesh(cyl(0.032, 0.032, 0.2, 6), lam(0x2f5d62), 0, 0, -0.02, hero.sword).rotation.x = Math.PI / 2; mesh(sph(0.05, 6, 5), lam(GOLD), 0, 0, -0.14, hero.sword);
  // round shield on the left forearm
  hero.shield = grpIn(p.elbowL, 0.11, -0.16, 0.02); hero.shield.rotation.z = Math.PI / 2;
  mesh(cyl(0.38, 0.38, 0.05, 14), lam(TEAL), 0, 0, 0, hero.shield); mesh(cyl(0.4, 0.4, 0.03, 14), lam(0x8a929a), 0, -0.02, 0, hero.shield); mesh(cyl(0.11, 0.13, 0.07, 8), lam(GOLD), 0, 0.04, 0, hero.shield);
  mesh(new T.TorusGeometry(0.25, 0.022, 4, 18, 4.6), lam(GOLD), 0, 0.03, 0, hero.shield).rotation.x = Math.PI / 2;
  // bow
  hero.bow = grpIn(p.handL, 0, 0, 0.05);
  mesh(new T.TorusGeometry(0.58, 0.028, 5, 14, Math.PI), lam(0x8a5a30), 0, 0, 0, hero.bow).rotation.set(0, Math.PI / 2, Math.PI / 2);
  mesh(cyl(0.007, 0.007, 1.16, 3), lam(0xf2ead8), 0, 0, 0, hero.bow).rotation.x = Math.PI / 2; mesh(cyl(0.04, 0.04, 0.16, 6), lam(RED), 0, -0.58, 0, hero.bow).rotation.x = Math.PI / 2;
  // glider
  hero.glider = grpIn(p.hips, 0, 2.5, 0); mesh(bx(2.6, 0.04, 1.2), lam(RED), 0, 0, 0, hero.glider); mesh(bx(2.7, 0.06, 0.06), lam(TIMBER), 0, 0.03, 0.56, hero.glider); mesh(bx(0.06, 0.06, 1.2), lam(TIMBER), 0, 0.03, 0, hero.glider); mesh(bx(0.9, 0.045, 0.5), lam(GOLD), 0, 0.01, 0, hero.glider); hero.glider.visible = false;
  // sword trails
  const tm = () => new T.MeshBasicMaterial({ color: 0xeafffb, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
  hero.trailH = mesh(new T.RingGeometry(1.15, 2.75, 28, 1, -2.85, 2.56).rotateX(-Math.PI / 2), tm(), 0, 1.2, 0, hero.g, true);
  hero.trailV = mesh(new T.RingGeometry(1.0, 2.6, 22, 1, -0.5, 2.5).rotateY(-Math.PI / 2), tm(), -0.2, 1.3, 0, hero.g, true);
  hero.trailS = mesh(new T.RingGeometry(1.3, 3.4, 40).rotateX(-Math.PI / 2), tm(), 0, 1.15, 0, hero.g, true);
}
addOutline(hero.g, 0.013);
/* ---------- sculpted hero: one skinned mesh driven by the same joints as before ----------
   The mesh is a generated sculpt (A-pose, no skeleton). Its vertices are weighted here to the existing joint
   groups, which act as the bones, so every animation, attachment and gameplay hook keeps working unchanged. */
const HERO3D = (() => {
  const src = window.TLK_HERO; if (!src || !src.mesh) return null;
  try {
    const bin = atob(src.mesh), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const dv = new DataView(buf.buffer), nv = dv.getUint32(0, true), ni = dv.getUint32(4, true); let o = 8;
    const q = new Int16Array(buf.buffer.slice(o, o + nv * 6)); o += nv * 6;
    const n8 = new Int8Array(buf.buffer.slice(o, o + nv * 3)); o += nv * 3;
    const u16 = new Uint16Array(buf.buffer.slice(o, o + nv * 4)); o += nv * 4;
    const idx = new Uint16Array(buf.buffer.slice(o, o + ni * 2));
    const SC = 1.9, pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), si = new Uint16Array(nv * 4), sw = new Float32Array(nv * 4);
    const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const W = new Float32Array(13);   // 0 hips 1 chest 2 head 3 armL 4 elbowL 5 armR 6 elbowR 7 legL 8 kneeL 9 legR 10 kneeR 11 fingersL 12 fingersR
    for (let i = 0; i < nv; i++) {
      const mx = -q[i * 3 + 2] / 65534, my = q[i * 3 + 1] / 65534, mz = q[i * 3] / 65534;   // model faces +x; the game faces +z
      pos[i * 3] = mx * SC; pos[i * 3 + 1] = (my + 0.5) * SC; pos[i * 3 + 2] = mz * SC;
      nor[i * 3] = -n8[i * 3 + 2] / 127; nor[i * 3 + 1] = n8[i * 3 + 1] / 127; nor[i * 3 + 2] = n8[i * 3] / 127;
      uv[i * 2] = u16[i * 2] / 65535; uv[i * 2 + 1] = u16[i * 2 + 1] / 65535;
      W.fill(0); const ax = Math.abs(mx), L = mx >= 0;
      // arm: distance along and around the shoulder-to-wrist axis
      let a = 0, e = 0, f = 0;
      if (my < 0.31 && ax > 0.06) {
        const vx = ax - 0.098, vy = my - 0.262, t = vx * 0.5288 - vy * 0.8488, r = Math.hypot(vx * 0.8488 + vy * 0.5288, mz);
        a = sm(-0.015, 0.05, t); if (t < 0.1) a *= 1 - sm(0.05, 0.08, r);
        if (my < 0.165) { const xb = 0.10 + (0.14 - my) * 0.5; a *= sm(xb - 0.015, xb + 0.01, ax); }
        e = sm(0.12, 0.18, t);
        f = sm(0.302, 0.318, t);   // past the knuckles; the thumb ends before this
      }
      // body
      const head = my > 0.335 ? sm(0.318, 0.345, my) : (Math.hypot(mx, mz) > 0.06 ? 0 : sm(0.318, 0.345, my));
      const chest = sm(0.06, 0.15, my);
      let leg = 0, sideL = L ? 1 : 0, knee = 0;
      if (my < 0.06) {
        if (my > -0.13) { leg = 0.5 * sm(0.06, -0.13, my); sideL = sm(-0.05, 0.05, mx); }
        else { leg = 0.5 + 0.5 * sm(-0.13, -0.165, my); knee = sm(-0.225, -0.285, my); }
      }
      const b = 1 - a;
      W[2] = b * head; W[1] = b * (1 - head) * chest; W[0] = b * (1 - head) * (1 - chest) * (1 - leg);
      const lw = b * (1 - head) * (1 - chest) * leg;
      W[7] = lw * sideL * (1 - knee); W[8] = lw * sideL * knee; W[9] = lw * (1 - sideL) * (1 - knee); W[10] = lw * (1 - sideL) * knee;
      W[L ? 3 : 5] = a * (1 - e); W[L ? 4 : 6] = a * e * (1 - f); W[L ? 11 : 12] = a * e * f;
      let tot = 0; for (let k = 0; k < 4; k++) { let bi = 0; for (let j = 1; j < 13; j++) if (W[j] > W[bi]) bi = j; si[i * 4 + k] = bi; sw[i * 4 + k] = W[bi]; tot += W[bi]; W[bi] = -1; }
      for (let k = 0; k < 4; k++) sw[i * 4 + k] = tot > 0 ? Math.max(0, sw[i * 4 + k]) / tot : (k === 0 ? 1 : 0);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
    geo.setAttribute('skinIndex', new T.BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new T.BufferAttribute(sw, 4)); geo.setIndex(new T.BufferAttribute(idx, 1));
    // the old block-built body steps aside; weapons, cape, quiver and glider stay
    const p = hero.p, keep = new Set([hero.cape, hero.quiver, hero.sword, hero.shield, hero.bow, hero.glider].concat(hero.tails));
    const hideIn = (n: THREE.Object3D) => { if (keep.has(n as THREE.Group)) return; if ((n as THREE.Mesh).isMesh) { n.visible = false; return; } for (const c of n.children) hideIn(c); };
    hideIn(p.pivot);
    // joints move to where the sculpt actually bends
    p.head.position.set(0, 0.636, 0);
    for (const [k, s] of [['R', -1], ['L', 1]] as [Side, number][]) {
      p[`arm${k}` as const].position.set(s * 0.186, 0.498, 0); p[`elbow${k}` as const].position.set(0, -0.285, 0); p[`hand${k}` as const].position.set(0, -0.36, 0);
      p[`leg${k}` as const].position.set(s * 0.1425, 0.874, -0.015); p[`knee${k}` as const].position.set(0, -0.418, 0);
    }
    p.zBias = 0.2;
    // a short shaped cape in two hinged panels replaces the flat board; scarf tails slim down to match the sculpted scarf
    const cloth = (w0: number, w1: number, len: number, bow: number) => {
      const R = 5, C = 6, th = 0.011, P = [], I = [], at = (r: number, c: number, k: number) => (r * (C + 1) + c) * 2 + k;
      for (let r = 0; r <= R; r++) for (let c = 0; c <= C; c++) { const v = r / R, u = c / C * 2 - 1, hw = w0 + (w1 - w0) * v, z = bow * u * u * (0.6 + 0.4 * v) - 0.035 * Math.sin(v * 2.6); P.push(u * hw, -v * len, z + th, u * hw, -v * len, z - th); }
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { I.push(at(r, c, 0), at(r + 1, c, 0), at(r, c + 1, 0), at(r, c + 1, 0), at(r + 1, c, 0), at(r + 1, c + 1, 0), at(r, c, 1), at(r, c + 1, 1), at(r + 1, c, 1), at(r, c + 1, 1), at(r + 1, c + 1, 1), at(r + 1, c, 1)); }
      const rim = (a: number, b: number) => I.push(a * 2, b * 2, a * 2 + 1, b * 2, b * 2 + 1, a * 2 + 1), id = (r: number, c: number) => r * (C + 1) + c;
      for (let c = 0; c < C; c++) { rim(id(0, c + 1), id(0, c)); rim(id(R, c), id(R, c + 1)); } for (let r = 0; r < R; r++) { rim(id(r, 0), id(r + 1, 0)); rim(id(r + 1, C), id(r, C)); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
    };
    while (hero.cape.children.length) hero.cape.remove(hero.cape.children[0]);
    hero.cape.position.set(0, 0.53, -0.125); hero.cape.scale.set(1, 1, 1);
    mesh(cloth(0.15, 0.24, 0.34, 0.07), lam(0xc8452f), 0, 0, 0, hero.cape);
    const lo = hero.cape.userData.lo = grpIn(hero.cape, 0, -0.33, -0.034 * Math.sin(2.6) + 0.0);
    mesh(cloth(0.24, 0.3, 0.3, 0.07 * 1.0), lam(0xc8452f), 0, 0, 0, lo); mesh(cloth(0.302, 0.31, 0.035, 0.07), lam(GOLD), 0, -0.292, 0.002, lo);
    addOutline(hero.cape, 0.011);
    for (const t of hero.tails) { t.position.set(t.userData.s * 0.06, 0.57, -0.14); t.scale.set(0.8, 0.8, 1); }
    hero.quiver.position.set(-0.1, 0.3, -0.2); hero.shield.position.set(0.075, -0.15, 0); hero.shield.scale.setScalar(0.58); (hero.shield.children[1] as THREE.Mesh).material = lam(0x6e4226); hero.sword.scale.setScalar(0.86);
    // bind in the sculpt's own A-pose
    const mat = new T.MeshToonMaterial({ color: 0xe9dcc4, gradientMap: TOON, skinning: true });
    const img = new Image(), tex = new T.Texture(img); tex.flipY = false; tex.anisotropy = 8;
    img.onload = () => { tex.needsUpdate = true; mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true; }; img.src = src.tex;
    const body = new T.SkinnedMesh(geo, mat); body.castShadow = true; body.frustumCulled = false; hero.g.add(body);
    // finger joints sit on the knuckle line, 0.304 below the elbow along the forearm
    p.fingersL = grpIn(p.elbowL, 0, -0.304, 0.015); p.fingersR = grpIn(p.elbowR, 0, -0.304, 0.015);
    const bones = [p.hips, p.chest, p.head, p.armL, p.elbowL, p.armR, p.elbowR, p.legL, p.kneeL, p.legR, p.kneeR, p.fingersL, p.fingersR];
    p.armL.rotation.set(0, 0, 0.557); p.armR.rotation.set(0, 0, -0.557); hero.g.updateMatrixWorld(true);
    // the rig's joint groups stand in for bones; a skeleton only reads their world matrices
    const skel = new T.Skeleton(bones as unknown as THREE.Bone[]); body.bind(skel);
    p.armL.rotation.set(0, 0, 0); p.armR.rotation.set(0, 0, 0);
    const om = new T.MeshBasicMaterial({ color: 0x33263a, side: T.BackSide, skinning: true });
    om.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * 0.0085;'); }; om.customProgramCacheKey = () => 'olSkin';
    const line = new T.SkinnedMesh(geo, om); line.frustumCulled = false; line.userData.outline = 1; body.add(line); line.bind(skel, body.bindMatrix);
    return { body, line, skel, mat };
  } catch (err) { console.warn('hero sculpt unavailable, keeping the built-in body', err); return null; }
})();
const PL = {
  pos: new T.Vector3(0, 3.2, 66), vel: new T.Vector3(), yaw: Math.PI, grounded: true, swim: false, climb: false, glide: false, crouch: false,
  atk: null as AttackState | null, hold: -1, draw: -1, blocking: false, rollT: 0, rollDir: new T.Vector3(), iframes: 0, hurtT: 0, emberCd: 0, stDelay: 0, airT: 0, animT: 0,
  lock: null as Enemy | null, dead: false, moving: 0, sprint: false, step: 0, combo: 0, comboT: 0, queued: false, spin: 0,
  castT: 0, pushing: 0, landT: 0, vaultT: 0, rollBack: false, glideArm: false, chargeFx: false,
  landRoll: false, skidT: 0, mantleT: 0, wasClimb: false, climbT: 0, landHard: 0,
};
const CAM = { yaw: 0, pitch: 0.32, dist: 7.2, shake: 0, cur: new T.Vector3(0, 8, 76) };
const keys: Record<string, boolean> = {}, mouse = { l: false, r: false };
const lockMark = mesh(new T.ConeGeometry(0.25, 0.5, 4), glowMat(GOLD), 0, -99, 0, scene, true); lockMark.rotation.x = Math.PI;
let hitStop = 0, timeScale = 1, cine: Cine | null = null;

/* expanding shock rings */
const rings: any[] = [];
function addRing(x: number, y: number, z: number, color: number, maxR: number, dur: number) {
  let r = rings.find(q => !q.live);
  if (!r) { r = { m: mesh(new T.RingGeometry(0.82, 1, 36).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }), 0, 0, 0, scene, true) }; rings.push(r); }
  r.live = true; r.t = 0; r.dur = dur; r.maxR = maxR; r.m.visible = true; r.m.material.color.setHex(color); r.m.position.set(x, y, z);
}
function updateRings(dt: number) { for (const r of rings) { if (!r.live) continue; r.t += dt; const k = r.t / r.dur; if (k >= 1) { r.live = false; r.m.visible = false; continue; } const s = 0.3 + r.maxR * (1 - (1 - k) * (1 - k)); r.m.scale.set(s, 1, s); r.m.material.opacity = (1 - k) * 0.8; } }

function camForward(out: THREE.Vector3) { out.set(-Math.sin(CAM.yaw), 0, -Math.cos(CAM.yaw)); return out; }
const _v1 = new T.Vector3(), _v2 = new T.Vector3(), _v3 = new T.Vector3(), _v4 = new T.Vector3(), _v5 = new T.Vector3();
function useStamina(n: number) { G.p.st = Math.max(0, G.p.st - n); PL.stDelay = 0.7; }
function faceAim() {
  if (PL.lock) PL.yaw = Math.atan2(PL.lock.pos.x - PL.pos.x, PL.lock.pos.z - PL.pos.z);
  else { camForward(_v1); PL.yaw = Math.atan2(_v1.x, _v1.z); }
}
/* nearest living foe roughly ahead of the camera: gives sword swings a gentle pull toward what you meant to hit */
function softTarget(range: number) {
  camForward(_v1); let best = null, bs = 1e9;
  for (const e of enemies) {
    if (!e.alive || (e.def.boss && e.state === 'sleep')) continue;
    const dx = e.pos.x - PL.pos.x, dz = e.pos.z - PL.pos.z, d = Math.hypot(dx, dz) - e.def.radius; if (d > range || Math.abs(e.pos.y - PL.pos.y) > 3.6) continue;
    const dot = (dx * _v1.x + dz * _v1.z) / (Math.hypot(dx, dz) || 1); if (dot < 0.1 && d > 1.6) continue;
    const sc = d - dot * 2; if (sc < bs) { bs = sc; best = e; }
  }
  return best;
}
function startAttack(heavy: boolean) {
  if (PL.rollT > 0 || PL.swim || PL.climb || PL.dead || cine) return;
  if (PL.atk) { if (!heavy) PL.queued = true; return; }
  const combo = heavy ? 0 : (PL.comboT > 0 ? (PL.combo + 1) % 3 : 0);
  const cost = heavy ? 24 : combo === 2 ? 9 : 6; if (G.p.st < cost * 0.5) { sfx('deny'); return; }
  useStamina(cost);
  const tg = PL.lock || softTarget(5.5); let far = false;
  if (tg) { PL.yaw = Math.atan2(tg.pos.x - PL.pos.x, tg.pos.z - PL.pos.z); far = Math.hypot(tg.pos.x - PL.pos.x, tg.pos.z - PL.pos.z) - tg.def.radius > 2.1; } else faceAim();
  const lunge = heavy ? 2 : far ? 8.5 : 3.2; if (PL.grounded) { PL.vel.x = Math.sin(PL.yaw) * lunge; PL.vel.z = Math.cos(PL.yaw) * lunge; }
  PL.combo = combo; PL.queued = false;
  PL.atk = { t: 0, dur: heavy ? 0.66 : [0.3, 0.3, 0.46][combo], hitAt: heavy ? 0.3 : [0.1, 0.1, 0.2][combo], heavy, combo, hit: false };
  sfx(heavy || combo === 2 ? 'swingBig' : 'swing');
}
function swordHit(heavy: any, combo: number) {
  const range = heavy ? 3.7 : combo === 2 ? 3.1 : 2.8, arc = heavy ? 3.2 : combo === 2 ? 0.9 : 1.25, fx = Math.sin(PL.yaw), fz = Math.cos(PL.yaw);
  let any = false;
  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = e.pos.x - PL.pos.x, dz = e.pos.z - PL.pos.z, d = Math.hypot(dx, dz);
    if (d > range + e.def.radius || Math.abs(e.pos.y - PL.pos.y) > 3.6) continue;
    const ang = Math.abs(Math.atan2(dx, dz) - PL.yaw), a = Math.min(ang, Math.PI * 2 - ang);
    if (d > 1.2 + e.def.radius && a > arc) continue;
    const crit = Math.random() < (combo === 2 ? 0.25 : 0.12), kx = heavy ? dx / (d || 1) : fx, kz = heavy ? dz / (d || 1) : fz;
    damageEnemy(e, swordDmg() * (heavy ? 2.4 : combo === 2 ? 1.5 : 1) * (crit ? 1.8 : 1) * rand(0.92, 1.08), { crit, kx, kz, kb: heavy ? 10 : combo === 2 ? 8 : 3.5 });
    const nr = e.def.radius * 0.75 / (d || 1);
    impactStar(e.pos.x + dx * -nr, e.pos.y + e.def.height * 0.58, e.pos.z + dz * -nr, crit ? 0xffd36a : 0xfff4dc, (crit ? 2.6 : heavy || combo === 2 ? 2.1 : 1.6) * Math.max(1, e.def.scale * 0.8));
    any = true;
  }
  if (any) { sfx(heavy || combo === 2 ? 'hitBig' : 'hit'); CAM.shake = heavy ? 0.4 : combo === 2 ? 0.28 : 0.14; hitStop = heavy ? 0.12 : combo === 2 ? 0.09 : 0.055; }
  if (heavy) addRing(PL.pos.x, PL.pos.y + 0.25, PL.pos.z, 0xeafffb, 4, 0.35);
}
function aimDir(start: THREE.Vector3, speed: number, grav: number, out: THREE.Vector3) {
  let tx, ty, tz;
  if (PL.lock) { const e = PL.lock; tx = e.pos.x; ty = e.pos.y + e.def.height * 0.55; tz = e.pos.z; }
  else { camera.getWorldDirection(_v2); tx = camera.position.x + _v2.x * 42; ty = camera.position.y + _v2.y * 42; tz = camera.position.z + _v2.z * 42; }
  const d = Math.hypot(tx - start.x, ty - start.y, tz - start.z), tt = d / speed;
  out.set(tx - start.x, ty - start.y + 0.5 * grav * tt * tt, tz - start.z).normalize();
  return out;
}
function fireArrow(power: number) {
  if (!has('arrow')) { notify('No arrows left. Fletch some from deadwood and flint.'); sfx('deny'); return; }
  G.inv.arrow--; faceAim();
  const speed = 30 + 30 * power; _v1.set(PL.pos.x + Math.sin(PL.yaw) * 0.5, PL.pos.y + 1.45, PL.pos.z + Math.cos(PL.yaw) * 0.5);
  aimDir(_v1, speed, 9, _v3);
  spawnProj('arrow', _v1, _v3, speed, (9 + 15 * power) + G.p.level, true);
  sfx('bow');
}
function castEmber() {
  if (!G.p.ember || PL.emberCd > 0 || PL.dead || PL.swim || cine) return;
  if (G.p.mp < 18) { notify('Not enough magic.'); sfx('deny'); return; }
  G.p.mp -= 18; PL.emberCd = 0.7; PL.castT = 0.3; faceAim();
  _v1.set(PL.pos.x + Math.sin(PL.yaw) * 0.6, PL.pos.y + 1.4, PL.pos.z + Math.cos(PL.yaw) * 0.6);
  aimDir(_v1, 32, 0, _v3); spawnProj('fire', _v1, _v3, 32, 24 + G.p.level * 2, true); sfx('fire'); burst(_v1.x, _v1.y, _v1.z, 0xffc04a, 10, 3, 0.35, 0);
}
function dodge() {
  if (PL.rollT > 0 || !PL.grounded || PL.swim || PL.dead || cine || G.p.st < 12) return;
  useStamina(20); PL.atk = null; PL.hold = -1; PL.draw = -1; PL.queued = false;
  let ix = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), iz = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  PL.rollBack = !(ix || iz);
  if (ix || iz) { camForward(_v1); PL.rollDir.set(_v1.x * iz - _v1.z * ix, 0, _v1.z * iz + _v1.x * ix).normalize(); }
  else PL.rollDir.set(-Math.sin(PL.yaw), 0, -Math.cos(PL.yaw));
  PL.rollT = 0.42; PL.iframes = 0.4; sfx('roll'); burst(PL.pos.x, PL.pos.y + 0.2, PL.pos.z, 0xd8d2b8, 6, 2, 0.4, 1);
}
function toggleLock() {
  if (PL.lock) { PL.lock = null; return; }
  let best = null, bd = 24;
  for (const e of enemies) { if (!e.alive || (e.def.boss && e.state === 'sleep')) continue; const d = Math.hypot(e.pos.x - PL.pos.x, e.pos.z - PL.pos.z); if (d < bd) { bd = d; best = e; } }
  PL.lock = best; if (!best) notify('No enemy in sight.'); else sfx('ui');
}
/* a blocked blow: the shield flashes and the hit pushes the hero back a step */
function blockFeedback(sx: number, sz: number) {
  const fx = Math.sin(PL.yaw), fz = Math.cos(PL.yaw);
  impactStar(PL.pos.x + fx * 0.55, PL.pos.y + 1.15, PL.pos.z + fz * 0.55, 0xbff4ff, 2.0);
  const ax = PL.pos.x - sx, az = PL.pos.z - sz, ad = Math.hypot(ax, az) || 1;
  PL.vel.x += ax / ad * 4.5; PL.vel.z += az / ad * 4.5; CAM.shake = Math.max(CAM.shake, 0.18);
}
function hurtPlayer(dmg: number, sx: number, sz: number, opts?: { unblockable?: boolean }) {
  if (PL.iframes > 0 || PL.dead || MODE !== 'play' || cine) return false;
  if (PL.blocking && !(opts && opts.unblockable)) {
    const a = Math.abs(Math.atan2(sx - PL.pos.x, sz - PL.pos.z) - PL.yaw), ang = Math.min(a, Math.PI * 2 - a);
    if (ang < 1.3) { useStamina(dmg * 0.9); sfx('block'); blockFeedback(sx, sz); burst(PL.pos.x + Math.sin(PL.yaw) * 0.6, PL.pos.y + 1.2, PL.pos.z + Math.cos(PL.yaw) * 0.6, 0xffe9a8, 9, 4, 0.3); dmg *= G.p.st > 0 ? 0.12 : 0.6; PL.iframes = 0.2; hitStop = 0.05; }
  }
  dmg = Math.max(1, Math.round(dmg - G.p.armor));
  G.p.hp -= dmg; PL.hurtT = 0.35; PL.iframes = Math.max(PL.iframes, 0.45); CAM.shake = 0.4; sfx('hurt');
  dmgText(PL.pos.x, PL.pos.y + 2, PL.pos.z, '-' + dmg, 'bad'); flashHurt();
  const d = Math.hypot(PL.pos.x - sx, PL.pos.z - sz) || 1; PL.vel.x += (PL.pos.x - sx) / d * 6; PL.vel.z += (PL.pos.z - sz) / d * 6;
  if (G.p.hp <= 0) { G.p.hp = 0; playerDied(); }
  return true;
}
function pushBlock() {
  const b = temple.blockBox, r = 0.45, p = PL.pos; if (p.y >= b.top - 0.3) return;   // standing on it, not pushing it
  if (!(p.x > b.x0 - r && p.x < b.x1 + r && p.z > b.z0 - r && p.z < b.z1 + r)) return;
  const pl = p.x - (b.x0 - r), pr = (b.x1 + r) - p.x, pn = p.z - (b.z0 - r), pf = (b.z1 + r) - p.z, m = Math.min(pl, pr, pn, pf);
  let cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
  if (m === pl) cx += m; else if (m === pr) cx -= m; else if (m === pn) cz += m; else cz -= m;
  const nx = clamp(cx, -95.9, -80.2), nz = clamp(cz, -52.8, -27.2);
  if (Math.abs(nx - temple.block.position.x) + Math.abs(nz - temple.block.position.z) > 0.004) { PL.pushing = 0.15; if (Math.random() < 0.25) burst(nx, 3.1, nz, 0xb9bfb3, 1, 1.5, 0.4, 2); }
  setBlock(nx, nz);
}
function setBlock(cx: number, cz: number) {
  const b = temple.blockBox; b.x0 = cx - 1.1; b.x1 = cx + 1.1; b.z0 = cz - 1.1; b.z1 = cz + 1.1;
  temple.block.position.x = cx; temple.block.position.z = cz; G.flags.blk = [cx, cz];
}

function updatePlayer(dt: number) {
  const p = PL, S = G.p;
  p.iframes -= dt; p.hurtT -= dt; p.emberCd -= dt; p.stDelay -= dt; p.animT += dt; p.comboT -= dt; p.castT = (p.castT || 0) - dt; p.pushing = (p.pushing || 0) - dt;
  let ix = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), iz = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  if (p.dead || cine) { ix = 0; iz = 0; mouse.l = mouse.r = false; }
  const mag = Math.hypot(ix, iz); camForward(_v1);
  let dx = 0, dz = 0; if (mag > 0) { dx = (_v1.x * iz - _v1.z * ix) / mag; dz = (_v1.z * iz + _v1.x * ix) / mag; }
  p.blocking = mouse.r && S.weapon === 'sword' && p.grounded && !p.swim && p.rollT <= 0 && !p.atk;
  const aiming = S.weapon === 'bow' && (mouse.r || p.draw >= 0);
  p.climb = false; p.sprint = false;
  if (p.rollT > 0) {
    p.rollT -= dt; if (p.rollT <= 0) p.landRoll = false; p.vel.x = p.rollDir.x * (p.rollBack ? 8 : 11.5); p.vel.z = p.rollDir.z * (p.rollBack ? 8 : 11.5); if (!p.rollBack) p.yaw = Math.atan2(p.rollDir.x, p.rollDir.z);
  } else {
    if (p.grounded && !p.swim && mag > 0) { const g2 = groundAt(p.pos.x + dx * 0.7, p.pos.z + dz * 0.7); if (g2 - p.pos.y > 0.8) p.climb = true; }
    p.sprint = keys.ShiftLeft && mag > 0 && S.st > 0.5 && p.grounded && !p.swim && !p.climb && !p.blocking && !aiming && !p.crouch;
    let sp = p.swim ? 3.3 : p.climb ? 1.7 : (p.blocking || aiming) ? 2.7 : p.crouch ? 2.4 : p.sprint ? 9.3 : 5.6;
    if (p.climb) { if (S.st <= 0) sp = 0; else useStamina(15 * dt); }
    if (p.sprint) useStamina(13 * dt);
    if (p.swim) { useStamina(3.5 * dt); if (S.st <= 0) { S.hp -= 6 * dt; if (S.hp <= 0) { S.hp = 0; playerDied(); } } }
    if (p.atk) { const k = 1 - Math.exp(-7 * dt); p.vel.x = lerp(p.vel.x, 0, k); p.vel.z = lerp(p.vel.z, 0, k); }   // the lunge carries, then settles
    else {
      if (p.grounded && mag === 0 && p.moving > 8 && p.skidT <= 0 && !p.climb && !p.swim) { p.skidT = 0.32; sfx('step'); }
      const k = 1 - Math.exp(-(p.skidT > 0 && mag === 0 ? 5 : p.grounded ? 14 : 3.5) * dt); p.vel.x = lerp(p.vel.x, dx * sp, k); p.vel.z = lerp(p.vel.z, dz * sp, k);
    }
    if (p.skidT > 0) { p.skidT -= dt; if (mag > 0 || !p.grounded) p.skidT = 0; else if (Math.random() < dt * 30) burst(p.pos.x + Math.sin(p.yaw) * 0.3, p.pos.y + 0.08, p.pos.z + Math.cos(p.yaw) * 0.3, 0xd8d2b8, 1, 1.4, 0.4, 1); }
    if (aiming || p.blocking) faceAim();
    else if (p.atk) { /* committed to the swing */ }
    else if (p.lock && mag === 0) p.yaw = angLerp(p.yaw, Math.atan2(p.lock.pos.x - p.pos.x, p.lock.pos.z - p.pos.z), 10 * dt);
    else if (mag > 0) p.yaw = angLerp(p.yaw, Math.atan2(dx, dz), 13 * dt);
  }
  if (p.wasClimb && !p.climb && p.climbT > 0.35 && p.grounded && mag > 0 && p.rollT <= 0) { p.mantleT = 0.34; sfx('step'); }
  p.climbT = p.climb ? p.climbT + dt : (p.wasClimb ? p.climbT : 0); if (!p.climb && !p.wasClimb) p.climbT = 0; p.wasClimb = p.climb; if (p.mantleT > 0) p.mantleT -= dt;
  p.pos.x += p.vel.x * dt; p.pos.z += p.vel.z * dt;
  if (p.grounded && inTemple(p.pos.x, p.pos.z, 2)) pushBlock();
  resolveCollide(p.pos, 0.45, p.pos.y);
  // vault: jumping into something with a top within reach carries you up onto it
  p.vaultT = (p.vaultT || 0) - dt;
  if (hitTop !== null && !p.grounded && mag > 0 && p.rollT <= 0 && hitTop - p.pos.y < 1.35 && p.vel.y > -9) { const need = Math.sqrt(2 * 27 * (hitTop - p.pos.y + 0.3)); if (p.vel.y < need) { if (p.vaultT <= 0) sfx('step'); p.vel.y = need; p.vaultT = 0.28; p.glideArm = false; } }
  const dl = Math.hypot(p.pos.x, p.pos.z); if (dl > LIMIT) { p.pos.x *= LIMIT / dl; p.pos.z *= LIMIT / dl; }
  // vertical
  const g = groundAt(p.pos.x, p.pos.z), plat = platformAt(p.pos.x, p.pos.z, p.pos.y), surf = Math.max(g, WATER_Y - 0.95, plat), deep = g < WATER_Y - 0.95 && plat < WATER_Y - 0.95;
  p.glide = false;
  if (p.grounded) {
    if (surf < p.pos.y - 0.7) { p.grounded = false; p.vel.y = 0; p.airT = 0; }
    else p.pos.y = surf;
  } else {
    p.airT += dt; p.vel.y -= 27 * dt;
    if (keys.Space && p.glideArm && p.vel.y < -2.6 && S.st > 0) { p.vel.y = -2.6; p.glide = true; useStamina(8 * dt); }
    p.pos.y += p.vel.y * dt;
    if (p.pos.y <= surf) {
      if (deep) { burst(p.pos.x, WATER_Y, p.pos.z, 0xdff6ff, 18, 5, 0.6); addRing(p.pos.x, WATER_Y + 0.06, p.pos.z, 0xffffff, 2.6, 0.7); sfx('splash'); }
      else if (p.vel.y < -21) hurtPlayer((-p.vel.y - 21) * 3.2, p.pos.x, p.pos.z, { unblockable: true });
      else if (p.vel.y < -6) {
        sfx('land'); burst(p.pos.x, surf + 0.1, p.pos.z, 0xd8d2b8, p.vel.y < -14 ? 12 : 6, 2.2, 0.35, 2);
        if (p.vel.y < -14 && mag > 0 && p.moving > 3 && !p.atk) { p.rollT = 0.42; p.rollBack = false; p.landRoll = true; p.rollDir.set(Math.sin(p.yaw), 0, Math.cos(p.yaw)); sfx('roll'); }
        else { p.landHard = p.vel.y < -14 ? 1 : 0; p.landT = p.landHard ? 0.3 : 0.16; }
      }
      p.pos.y = surf; p.grounded = true; p.vel.y = 0; p.glideArm = false;
    }
  }
  p.swim = p.grounded && deep; p.landT = (p.landT || 0) - dt;
  if (p.swim) { p.crouch = false; if (p.moving > 1 && Math.random() < dt * 5) addRing(p.pos.x, WATER_Y + 0.06, p.pos.z, 0xffffff, 1.6, 0.8); }
  // attacks
  if (p.hold >= 0 && !p.atk) { p.hold += dt; if (p.hold > 0.4 && !p.chargeFx) { p.chargeFx = true; sfx('charge'); } if (p.hold > 0.4) burst(p.pos.x + Math.sin(p.yaw) * 0.3, p.pos.y + 1.9, p.pos.z + Math.cos(p.yaw) * 0.3, GOLD, 1, 1.5, 0.3, -2); }
  if (p.draw >= 0) p.draw += dt;
  if (p.atk) {
    p.atk.t += dt; if (!p.atk.hit && p.atk.t >= p.atk.hitAt) { p.atk.hit = true; swordHit(p.atk.heavy, p.atk.combo); }
    if (p.atk.t >= p.atk.dur || (p.queued && !p.atk.heavy && p.atk.t >= p.atk.dur * 0.72)) { const q = p.queued; p.atk = null; p.comboT = 0.55; if (q) { p.queued = false; startAttack(false); } }
  }
  // regen
  if (p.stDelay <= 0 && !p.glide) S.st = Math.min(S.maxSt, S.st + (p.blocking ? 8 : 24) * dt);
  S.mp = Math.min(S.maxMp, S.mp + 2.6 * dt);
  if (p.lock && (!p.lock.alive || Math.hypot(p.lock.pos.x - p.pos.x, p.lock.pos.z - p.pos.z) > 34)) p.lock = null;
  if (p.lock) { lockMark.position.set(p.lock.pos.x, p.lock.pos.y + p.lock.def.height + 0.9 + Math.sin(p.animT * 5) * 0.12, p.lock.pos.z); lockMark.rotation.y += dt * 3; } else lockMark.position.y = -99;
  // footsteps and dust
  p.moving = Math.hypot(p.vel.x, p.vel.z);
  if (p.grounded && !p.swim && p.moving > 1.5) { p.step -= dt * p.moving; if (p.step <= 0) { p.step = 3.1; sfx(p.pos.y < WATER_Y + 0.25 ? 'wade' : inTemple(p.pos.x, p.pos.z) ? 'stepStone' : 'step'); if (p.sprint) burst(p.pos.x, p.pos.y + 0.1, p.pos.z, 0xd8d2b8, 2, 1.2, 0.35, 1); } }
  animHero(dt);
}
function animHero(dt: number) {
  const p = PL, hp = hero.p, S = G.p;
  let mode = 'idle';
  if (p.swim) mode = 'swim'; else if (p.glide) mode = 'glide'; else if (p.vaultT > 0) mode = 'climb'; else if (!p.grounded) mode = 'air'; else if (p.climb) mode = 'climb';
  else if (p.crouch) mode = 'crouch'; else if (p.moving > 6.5) mode = 'run'; else if (p.moving > 0.6) mode = 'walk';
  animHumanoid(hp, mode, mode === 'crouch' && p.moving < 0.5 ? 0 : p.animT, dt, p.vel.y);
  CARRY.update(dt); hero.glider.visible = p.glide; hero.quiver.visible = S.hasBow;
  hero.sword.rotation.set(0.4, 0, 0);
  let spin = 0; hero.trailH.material.opacity = hero.trailV.material.opacity = hero.trailS.material.opacity = 0;
  if (p.atk) {
    const k = p.atk.t / p.atk.dur, c = p.atk.combo;
    hero.sword.rotation.set(1.4, 0, 0);
    if (p.atk.heavy) {
      const w = smooth(0.25, 0.8, k); spin = w * Math.PI * 2; hp.armR.rotation.set(-1.5, 0, -0.5); hp.elbowR.rotation.x = -0.1; hp.armL.rotation.set(-0.6, 0, 0.9); hp.pivot.rotation.x = 0.18; hp.chest.rotation.y = -0.5;
      hero.trailS.material.opacity = Math.sin(clamp((k - 0.25) / 0.6, 0, 1) * Math.PI) * 0.75; hero.trailS.rotation.y = -spin;
    } else if (c === 2) {
      const w = smooth(0.2, 0.55, k); hp.armR.rotation.set(lerp(-3.2, -0.25, w), 0, -0.1); hp.elbowR.rotation.x = lerp(-0.9, -0.05, w); hp.armL.rotation.set(lerp(-2.6, 0.2, w), 0, 0.2); hp.pivot.rotation.x = lerp(-0.3, 0.5, w); hp.hips.position.y = -0.9 + Math.sin(k * Math.PI) * 0.18;
      hero.trailV.material.opacity = Math.sin(clamp((k - 0.2) / 0.5, 0, 1) * Math.PI) * 0.8;
    } else {
      const w = smooth(0.12, 0.55, k), d = c === 0 ? 1 : -1; hp.chest.rotation.y = lerp(-0.95, 0.95, w) * d; hp.armR.rotation.set(-1.45, 0, lerp(-1.25, 0.95, w) * d - 0.15); hp.elbowR.rotation.x = -0.15; hp.armL.rotation.set(0.3, 0, 0.5); hp.pivot.rotation.x = 0.2; hp.legL.rotation.x = -0.5; hp.kneeL.rotation.x = 0.5; hp.legR.rotation.x = 0.45;
      hero.trailH.material.opacity = Math.sin(clamp((k - 0.12) / 0.5, 0, 1) * Math.PI) * 0.75; hero.trailH.scale.x = d;
    }
  } else if (p.hold > 0.28) { hp.armR.rotation.set(-0.9, 0, -1.3); hp.elbowR.rotation.x = -1.2; hp.chest.rotation.y = -0.8; hp.pivot.rotation.x = 0.16; hp.legL.rotation.x = -0.4; hp.kneeL.rotation.x = 0.5; hero.sword.rotation.set(1.3, 0, 0); }
  if (p.blocking) {   // guard: shield squared up in front of the body, sword hand held back, knees soft
    hp.chest.rotation.y = -0.5; hp.pivot.rotation.x = 0.13; hp.hips.position.y -= 0.07; hp.head.rotation.y += 0.42;
    armTo(hp.armL, hp.elbowL, GUARD_U.set(-0.04, -0.86, 0.5).normalize(), GUARD_D.set(-0.86, 0.22, 0.46).normalize(), UP);
    hp.armR.rotation.set(0.45, 0, -0.32); hp.elbowR.rotation.x = -0.7;
    if (p.moving < 0.6) { hp.legL.rotation.x = -0.5; hp.kneeL.rotation.x = 0.62; hp.legR.rotation.x = 0.28; hp.kneeR.rotation.x = 0.42; }
  }
  if (S.weapon === 'bow' && !p.swim && (p.draw >= 0 || mouse.r)) bowPose(hp, p.draw >= 0 ? clamp(p.draw / 0.9, 0, 1) : 0); else hero.bowDraw(null);
  if (p.castT > 0) { hp.armL.rotation.set(-1.6, 0, -0.2); hp.elbowL.rotation.x = -0.1; hp.chest.rotation.y = -0.3; }
  if (p.pushing > 0) { hp.armL.rotation.set(-1.4, 0, 0); hp.armR.rotation.set(-1.4, 0, 0); hp.elbowL.rotation.x = hp.elbowR.rotation.x = -0.5; hp.pivot.rotation.x = 0.45; }
  if (p.rollT > 0 && !p.rollBack) { hp.pivot.rotation.x = (1 - p.rollT / 0.42) * Math.PI * 2; hp.hips.position.y = -1.15; hp.legL.rotation.x = hp.legR.rotation.x = -1.6; hp.kneeL.rotation.x = hp.kneeR.rotation.x = 2; hp.armL.rotation.x = hp.armR.rotation.x = -1; }
  if (p.landT > 0) {
    const L = p.landHard ? 0.3 : 0.16, k = Math.sin(p.landT / L * Math.PI);
    hp.hips.position.y -= k * (p.landHard ? 0.32 : 0.14);
    if (p.landHard) { hp.pivot.rotation.x += k * 0.35; hp.legL.rotation.x -= k * 0.7; hp.legR.rotation.x -= k * 0.5; hp.kneeL.rotation.x += k * 1.2; hp.kneeR.rotation.x += k * 1.0; hp.armL.rotation.z += k * 0.6; hp.armR.rotation.z -= k * 0.6; }
  }
  if (p.skidT > 0 && p.rollT <= 0) {   /* braced against the slide: leaning back, lead foot out front, arms out for balance */
    const k = Math.min(1, p.skidT / 0.12);
    hp.pivot.rotation.x = -0.32 * k; hp.hips.position.y -= 0.12 * k; hp.legL.rotation.x = -0.75 * k; hp.kneeL.rotation.x = 0.2 * k; hp.legR.rotation.x = 0.35 * k; hp.kneeR.rotation.x = 0.85 * k;
    hp.armL.rotation.z = 0.7 * k; hp.armR.rotation.z = -0.7 * k; hp.armL.rotation.x = -0.4 * k; hp.armR.rotation.x = -0.2 * k;
  }
  if ((p.mantleT > 0 || p.vaultT > 0) && p.rollT <= 0 && !p.atk) {   /* pulling up over an edge: hands planted, one knee driving up */
    const k = p.vaultT > 0 ? 1 : Math.sin(Math.min(1, p.mantleT / 0.34) * Math.PI);
    hp.pivot.rotation.x = 0.45 * k; hp.armL.rotation.set(-0.9 * k, 0, 0.15 * k); hp.armR.rotation.set(-0.9 * k, 0, -0.15 * k); hp.elbowL.rotation.x = hp.elbowR.rotation.x = -1.1 * k;
    hp.legL.rotation.x = -1.5 * k; hp.kneeL.rotation.x = 1.9 * k; hp.legR.rotation.x = 0.3 * k; hp.kneeR.rotation.x = 0.4 * k;
  }
  if (p.dead) { hp.pivot.rotation.x = -1.45; hp.hips.position.y = -1.25; }
  if (hp.fingersL && hp.fingersR) {
    const drawing = S.weapon === 'bow' && !p.swim && (p.draw >= 0 || mouse.r);
    const holdR = CARRY.it.sword.held, holdL = CARRY.it.bow.held || CARRY.it.shield.held;
    const cR = drawing ? 0.95 : holdR ? 1.55 : 0.3, cL = holdL ? 1.5 : 0.3, k = 1 - Math.exp(-18 * dt);
    hp.fingersR.rotation.z = lerp(hp.fingersR.rotation.z, cR, k); hp.fingersL.rotation.z = lerp(hp.fingersL.rotation.z, -cL, k);
  }
  // cloth follows speed and wind
  const sp = Math.min(p.moving * 0.085, 0.95), wv = Math.sin(p.animT * 5.5), air = p.grounded ? 0 : clamp(-p.vel.y * 0.06, -0.3, 0.9);
  hero.cape.rotation.x = 0.12 + sp + air + wv * 0.05 * (1 + p.moving * 0.3);
  if (hero.cape.userData.lo) { hero.cape.rotation.x = 0.1 + sp * 0.75 + air * 0.8 + wv * 0.04 * (1 + p.moving * 0.3); hero.cape.userData.lo.rotation.x = 0.06 + sp * 0.45 + air * 0.4 + Math.sin(p.animT * 6.3 + 1) * (0.05 + sp * 0.12); }
  for (const t of hero.tails) { t.rotation.x = 0.25 + sp * 1.25 + air + Math.sin(p.animT * 6 + t.userData.s) * (0.08 + sp * 0.12); t.rotation.z = t.userData.s * 0.12 + Math.sin(p.animT * 3.1 + t.userData.s * 2) * 0.1; t.userData.t2.rotation.x = 0.2 + Math.sin(p.animT * 7 + t.userData.s * 1.7) * 0.25 + sp * 0.3; }
  hero.pony.rotation.x = -0.25 - sp * 0.9 - air * 0.5 + wv * 0.06;
  CARRY.pose(hp);
  hero.g.position.copy(p.pos); if (p.swim) hero.g.position.y -= 0.15;
  hero.g.rotation.y = p.yaw + spin;
  hero.g.visible = !(p.hurtT > 0 && Math.floor(p.hurtT * 30) % 2 === 0);
}
/* ---------- gear: sword, shield and bow rebuilt to real proportions (sword ~1.04 m, shield 0.58 m, bow 1.24 m on a 1.78 m hero) ---------- */
(() => {
  const clear = (g: THREE.Group) => { while (g.children.length) g.remove(g.children[0]); };
  const STEEL = lam(0xe6eef2), GOLDM = lam(GOLD), WOOD = lam(0x9a6436), DARKW = lam(0x6e4226), REDM = lam(0xc8452f), LEATH = lam(0x4f3524), RUNEG = glowMat(0x7ff3e0);
  const zc = (r0: number, r1: number, h: number, n: number) => cyl(r0, r1, h, n).rotateX(Math.PI / 2);   // a cylinder lying along z
  // --- sword: tapered diamond blade with a rune fuller, swept guard, wrapped grip, pommel ---
  const sw = hero.sword; clear(sw); sw.position.set(0.028, 0.09, 0.02); sw.scale.setScalar(1);
  { const st = [[0.115, 0.034, 0.0115], [0.45, 0.031, 0.01], [0.76, 0.026, 0.008], [0.875, 0.016, 0.006], [0.95, 0.0006, 0.0006]], P = [];
    const ring = (q: any[]) => [[q[1], 0, q[0]], [0, q[2], q[0]], [-q[1], 0, q[0]], [0, -q[2], q[0]]];
    for (let i = 0; i < st.length - 1; i++) { const a = ring(st[i]), b = ring(st[i + 1]); for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; P.push(...a[k], ...a[k2], ...b[k2], ...a[k], ...b[k2], ...b[k]); } }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); mesh(g, STEEL, 0, 0, 0, sw); }
  mesh(bx(0.009, 0.0245, 0.5), RUNEG, 0, 0, 0.39, sw, true);
  mesh(bx(0.075, 0.032, 0.04), GOLDM, 0, 0, 0.098, sw);
  for (const s of [-1, 1]) { mesh(bx(0.1, 0.024, 0.03), GOLDM, s * 0.078, 0, 0.11, sw).rotation.y = -0.38 * s; mesh(sph(0.019, 7, 5), GOLDM, s * 0.127, 0, 0.131, sw); mesh(sph(0.015, 7, 5), RUNEG, 0, s * 0.017, 0.098, sw, true); }
  mesh(zc(0.0165, 0.019, 0.15, 8), lam(0x2f5d62), 0, 0, 0.005, sw); for (const z of [-0.045, 0.005, 0.055]) mesh(zc(0.0205, 0.0205, 0.009, 8), GOLDM, 0, 0, z, sw);
  mesh(sph(0.029, 8, 6), GOLDM, 0, 0, -0.088, sw).scale.z = 0.8;
  // --- shield: domed round shield, sun device on the face, timber and straps behind; +y is the face ---
  const sh = hero.shield; clear(sh); sh.position.set(0.07, -0.2, 0); sh.rotation.set(0, 0, -Math.PI / 2); sh.scale.setScalar(1);
  { const R = 0.29, pts = []; for (let i = 0; i <= 7; i++) { const r = R * i / 7; pts.push(new T.Vector2(r, 0.052 * (1 - (r / R) * (r / R)))); }
    mesh(new T.LatheGeometry(pts, 26), lam(0x2f6f7a, { side: T.DoubleSide }), 0, 0, 0, sh);
    mesh(cyl(R - 0.004, R - 0.004, 0.012, 26), DARKW, 0, -0.006, 0, sh); mesh(new T.TorusGeometry(R - 0.002, 0.015, 6, 30), GOLDM, 0, 0.002, 0, sh).rotation.x = Math.PI / 2;
    mesh(new T.TorusGeometry(0.2, 0.006, 4, 30), GOLDM, 0, 0.03, 0, sh).rotation.x = Math.PI / 2;
    mesh(sph(0.062, 10, 7), GOLDM, 0, 0.046, 0, sh).scale.y = 0.55;
    for (let k = 0; k < 8; k++) { const L = k % 2 ? 0.075 : 0.115, h = grpIn(sh, 0, 0, 0); h.rotation.y = k * Math.PI / 4; const rm = 0.078 + L / 2, c = mesh(new T.ConeGeometry(0.021, L, 4), GOLDM, rm, 0.052 * (1 - (rm / R) * (rm / R)) + 0.007, 0, h, true); c.rotation.z = -Math.PI / 2 - 0.36 * rm / R; c.scale.x = 0.32; }
    mesh(bx(0.045, 0.014, 0.2), LEATH, 0.06, -0.018, 0, sh, true); mesh(bx(0.045, 0.014, 0.2), LEATH, -0.08, -0.018, 0, sh, true); }
  // --- bow: recurve limbs swept along a curve, wrapped grip, gold nocks; string and nocked arrow follow the draw ---
  const bow = hero.bow; clear(bow); bow.position.set(-0.028, 0.09, 0.02); bow.scale.setScalar(1);
  { const N = 30, SEG = 7, P = [], I = [], prof = (t: number) => { const a = Math.abs(t); return [0.25 * Math.pow(a, 1.7) - 0.08 * smooth(0.76, 1, a), 0.62 * t]; };
    for (let i = 0; i <= N; i++) { const t = i / N * 2 - 1, a = Math.abs(t), [y, z] = prof(t), [y2, z2] = prof(t + 0.01), [y1, z1] = prof(t - 0.01); let ty = y2 - y1, tz = z2 - z1; const tl = Math.hypot(ty, tz); ty /= tl; tz /= tl;
      const g = smooth(0.2, 0.08, a), w = lerp(lerp(0.021, 0.0105, a), 0.019, g), h = lerp(lerp(0.0125, 0.0055, a), 0.019, g);   // flat limbs, round at the grip
      for (let k = 0; k < SEG; k++) { const u = k / SEG * 6.2832, c = Math.cos(u) * w, n = Math.sin(u) * h; P.push(c, y + n * tz, z - n * ty); } }
    for (let i = 0; i < N; i++) for (let k = 0; k < SEG; k++) { const a = i * SEG + k, b = i * SEG + (k + 1) % SEG, c = a + SEG, d = b + SEG; I.push(a, c, b, b, c, d); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); mesh(g, WOOD, 0, 0, 0, bow);
    const tip = prof(1); mesh(zc(0.0235, 0.0235, 0.135, 8), REDM, 0, 0, 0, bow);
    for (const s of [-1, 1]) { mesh(sph(0.015, 7, 5), GOLDM, 0, tip[0], s * tip[1], bow); const [by, bz] = prof(s * 0.2); mesh(zc(0.0225, 0.0215, 0.022, 8), GOLDM, 0, by, bz, bow); const [cy, cz] = prof(s * 0.72); mesh(zc(0.0135, 0.0125, 0.02, 8), RUNEG, 0, cy, cz, bow, true); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute([0, tip[0], tip[1], 0, tip[0], 0, 0, tip[0], -tip[1]], 3));
    const str = new T.Line(sg, new T.LineBasicMaterial({ color: 0xf2ead8 })); str.frustumCulled = false; bow.add(str);
    const ar = grpIn(bow, 0.015, tip[0], 0); mesh(cyl(0.0055, 0.0055, 0.84, 5), lam(0xe8dcc0), 0, -0.42, 0, ar, true); mesh(new T.ConeGeometry(0.016, 0.06, 5), lam(0xcfd6da), 0, -0.87, 0, ar, true).rotation.x = Math.PI;
    for (let k = 0; k < 3; k++) { const f = grpIn(ar, 0, -0.07, 0); f.rotation.y = k * 2.094; mesh(bx(0.002, 0.1, 0.026), REDM, 0, 0, 0.016, f, true); } ar.visible = false;
    // nock: where the string is pulled to, in the bow's own space; nothing for the string at rest
    const DOWN = new T.Vector3(0, -1, 0), dir = new T.Vector3();
    hero.bowDraw = nock => { const a = sg.attributes.position; if (nock) a.setXYZ(1, nock.x, nock.y, nock.z); else a.setXYZ(1, 0, tip[0], 0); a.needsUpdate = true; ar.visible = !!nock && has('arrow');
      if (nock) { ar.position.copy(nock); dir.set(0.014 - nock.x, -nock.y, -nock.z).normalize(); ar.quaternion.setFromUnitVectors(DOWN, dir); } }; }
  addOutline(sw, 0.006); addOutline(sh, 0.008); addOutline(bow, 0.005);
})();
/* point an arm: u1 and d2 are the directions of the upper arm and forearm in chest space; the elbow hinge follows from them */
const _ax = new T.Vector3(), _ay = new T.Vector3(), _az = new T.Vector3(), _am = new T.Matrix4(), _u1 = new T.Vector3(), _d2 = new T.Vector3(), _ik = new T.Vector3(), _ie = new T.Vector3();
function armTo(arm: THREE.Group, elbow: THREE.Group, u1: THREE.Vector3, d2: THREE.Vector3, hint: THREE.Vector3) {
  _ay.copy(u1).negate(); _az.copy(d2).addScaledVector(u1, -d2.dot(u1));
  if (_az.lengthSq() < 4e-4) _az.copy(hint).addScaledVector(u1, -hint.dot(u1));
  _az.normalize(); _ax.crossVectors(_ay, _az); _am.makeBasis(_ax, _ay, _az); arm.quaternion.setFromRotationMatrix(_am);
  elbow.rotation.set(-Math.acos(clamp(u1.dot(d2), -1, 1)), 0, 0);
}
/* two-bone reach: bend the arm so the wrist lands on a point in chest space, elbow swung toward the pole */
function armReach(arm: THREE.Group, elbow: THREE.Group, hand: THREE.Group, target: THREE.Vector3, pole: THREE.Vector3) {
  const L1 = -elbow.position.y, L2 = -hand.position.y; _ik.subVectors(target, arm.position); const D = _ik.length(), Dc = clamp(D, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.004); _ik.multiplyScalar(1 / D);
  const a = (L1 * L1 + Dc * Dc - L2 * L2) / (2 * Dc), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  _ie.copy(pole).addScaledVector(_ik, -pole.dot(_ik)).normalize();
  _u1.copy(_ik).multiplyScalar(a).addScaledVector(_ie, h); _d2.copy(_ik).multiplyScalar(Dc).sub(_u1).normalize(); _u1.normalize();
  armTo(arm, elbow, _u1, _d2, pole);
}
const _aim = new T.Vector3(), _tg = new T.Vector3(), UP = new T.Vector3(0, 1, 0), POLE_DRAW = new T.Vector3(-0.45, 0.45, -0.8), GUARD_U = new T.Vector3(), GUARD_D = new T.Vector3();
/* archer's stance: side-on to the target, bow arm straight, string hand drawn back to the jaw; the arrow lies along the line of sight */
const JAW = new T.Vector3(0.045, 0.6, 0.115), _bx = new T.Vector3(), _by = new T.Vector3(), _bz = new T.Vector3(), _gp = new T.Vector3(), _nk = new T.Vector3(), _nl = new T.Vector3(), _dl = new T.Vector3();
function bowPose(hp: Rig, dr: number) {
  camera.getWorldDirection(_aim); const el = PL.lock ? 0 : clamp(Math.asin(clamp(_aim.y, -1, 1)) + 0.1, -0.55, 0.7), yaw = 1.0;
  hp.hips.rotation.y = -0.3; hp.chest.rotation.set(0, -(yaw - 0.3), 0); hp.head.rotation.set(-el * 0.6, yaw * 0.86, 0);
  _aim.set(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el));   // line of sight in chest space
  // the grip sits on the line of sight through the jaw, at arm's length from the bow shoulder
  const S = hp.armL.position, reach = -hp.elbowL.position.y - hp.handL.position.y + hero.bow.position.y * -1; _dl.subVectors(JAW, S); const b = _dl.dot(_aim), full = -b + Math.sqrt(Math.max(0, b * b - _dl.lengthSq() + reach * reach));
  _gp.copy(JAW).addScaledVector(_aim, full); _u1.subVectors(_gp, S).normalize(); armTo(hp.armL, hp.elbowL, _u1, _u1, UP);
  const pull = full * (0.52 + 0.48 * dr); _nk.copy(_gp).addScaledVector(_aim, -pull);
  _tg.copy(_nk).addScaledVector(_aim, -0.075); _tg.y -= 0.02; armReach(hp.armR, hp.elbowR, hp.handR, _tg, POLE_DRAW);
  // the same nock point seen from the bow (its axes are the bow arm's: x across, -y along the arm, z up the limb)
  _nk.sub(_gp); _bx.set(1, 0, 0).applyQuaternion(hp.armL.quaternion); _by.set(0, 1, 0).applyQuaternion(hp.armL.quaternion); _bz.set(0, 0, 1).applyQuaternion(hp.armL.quaternion);
  hero.bowDraw(_nl.set(_nk.dot(_bx), _nk.dot(_by), _nk.dot(_bz)));
}
/* ---------- carried gear: in the hand, or slung on the back while swimming or while the other weapon is out ---------- */
const CARRY = (() => {
  const chest = hero.p.chest, AX = new T.Vector3(1, 0, 0), AZ = new T.Vector3(0, 0, 1);
  const q = (z: number, x: number, y?: number) => { const r = new T.Quaternion().setFromAxisAngle(AZ, z).multiply(new T.Quaternion().setFromAxisAngle(AX, x)); if (y) r.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), y)); return r; };
  const mk = (obj: THREE.Group, bp: THREE.Vector3, bq: THREE.Quaternion, bs: number) => ({ obj, hand: obj.parent, hp: obj.position.clone(), hq: obj.quaternion.clone(), hs: obj.scale.x, bp, bq, bs, held: true });
  const it: Record<string, CarryItem> = {
    sword: mk(hero.sword, new T.Vector3(-0.21, 0.6, -0.2), q(0.52, Math.PI / 2), 0.92),      // hilt over the right shoulder, blade across the back
    shield: mk(hero.shield, new T.Vector3(0.02, 0.26, -0.255), q(0, -Math.PI / 2), 0.86),      // flat on the back, face outward
    bow: mk(hero.bow, new T.Vector3(0.13, 0.22, -0.3), new T.Quaternion().setFromAxisAngle(AZ, 1.08).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2)), 0.9),   // strung across, opposite the sword
  };
  const put = (k: string, held: any) => { const i = it[k]; i.held = held; (held && i.hand ? i.hand : chest).add(i.obj); i.obj.position.copy(held ? i.hp : i.bp); i.obj.quaternion.copy(held ? i.hq : i.bq); i.obj.scale.setScalar(held ? i.hs : i.bs); };
  const DUR = 0.42; let t = 0, done = true, first = true;
  const want = (): Record<string, boolean> => { const sw = G.p.weapon === 'sword' && !PL.swim; return { sword: sw, shield: sw, bow: G.p.weapon === 'bow' && !PL.swim }; };
  const settle = () => { const w = want(); for (const k in it) if (it[k].held !== w[k]) put(k, w[k]); done = true; };
  return {
    it, snap() { t = 0; settle(); first = false; },
    update(dt: number) {
      hero.sword.visible = hero.shield.visible = true; hero.bow.visible = !!G.p.hasBow;
      if (first) { this.snap(); return; }
      const w = want(); let diff = false; for (const k in it) if (it[k].held !== w[k]) diff = true;
      if (t > 0) { t -= dt; if (!done && t <= DUR * 0.5) { settle(); sfx('step'); } }
      else if (diff) { if (PL.atk || PL.draw >= 0 || PL.dead) settle(); else { t = DUR; done = false; } }
    },
    // the reach over the shoulder; gear on the back keeps its slung orientation whatever the hand animation asked for
    pose(hp: Rig) {
      if (t > 0) { const k = Math.sin((1 - t / DUR) * Math.PI); hp.armR.rotation.set(lerp(hp.armR.rotation.x, -2.75, k), 0, lerp(hp.armR.rotation.z, -0.25, k)); hp.elbowR.rotation.x = lerp(hp.elbowR.rotation.x, -2.0, k); hp.armL.rotation.set(lerp(hp.armL.rotation.x, -2.75, k), 0, lerp(hp.armL.rotation.z, 0.25, k)); hp.elbowL.rotation.x = lerp(hp.elbowL.rotation.x, -2.0, k); }
      for (const k in it) if (!it[k].held) it[k].obj.quaternion.copy(it[k].bq);
    },
  };
})();
let _bigC: { c: CircleCollider; top: number }[] | null = null;   // big rocks the camera must not clip into, built on first use
function camHits(cx: number, cz: number, cy: number) {   // tents, giant trunks, the windmill: anything wide enough to hide the hero
  if (!_bigC) _bigC = circles.filter(c => c.r >= 1.6).map(c => ({ c, top: groundAt(c.x, c.z) + 3.4 }));
  for (let i = 0; i < _bigC.length; i++) { const b = _bigC[i], dx = cx - b.c.x, dz = cz - b.c.z; if (b.c.on && cy < b.top && dx * dx + dz * dz < b.c.r * b.c.r) return true; }
  return false;
}
function updateCamera(dt: number, instant?: boolean) {
  const p = PL, aiming = G.p.weapon === 'bow' && (mouse.r || p.draw >= 0) && MODE === 'play';
  const ks = 1.9 * dt; if (keys.ArrowLeft) CAM.yaw += ks; if (keys.ArrowRight) CAM.yaw -= ks; if (keys.ArrowUp) CAM.pitch += ks * 0.6; if (keys.ArrowDown) CAM.pitch -= ks * 0.6;
  if (p.lock) { const want = Math.atan2(-(p.lock.pos.x - p.pos.x), -(p.lock.pos.z - p.pos.z)); CAM.yaw = angLerp(CAM.yaw, want, 5 * dt); }
  CAM.pitch = clamp(CAM.pitch, -0.55, 1.3);
  const dist = aiming ? 3.4 : CAM.dist + (p.lock && p.lock.def.boss ? 3 : 0), th = (p.crouch ? 1.25 : 1.7), cp = Math.cos(CAM.pitch);
  const rx = Math.cos(CAM.yaw), rz = -Math.sin(CAM.yaw), off = aiming ? 0.75 : 0;
  _v1.set(p.pos.x + rx * off, p.pos.y + th, p.pos.z + rz * off);
  const dxx = Math.sin(CAM.yaw) * cp, dyy = Math.sin(CAM.pitch), dzz = Math.cos(CAM.yaw) * cp;
  let ok = dist;
  for (let i = 1; i <= 12; i++) { const d = dist * i / 12, cx = _v1.x + dxx * d, cz = _v1.z + dzz * d, cy = _v1.y + dyy * d; if ((cy < 11 && insideBox(cx, cz, 0.3)) || cy < groundAt(cx, cz) + 0.35 || camHits(cx, cz, cy)) { ok = Math.max(0.6, dist * (i - 1) / 12); break; } }
  _v2.set(_v1.x + dxx * ok, Math.max(_v1.y + dyy * ok, WATER_Y + 0.35), _v1.z + dzz * ok);
  if (instant) CAM.cur.copy(_v2); else CAM.cur.lerp(_v2, 1 - Math.exp(-16 * dt));
  camera.position.copy(CAM.cur);
  if (CAM.shake > 0) { CAM.shake -= dt; const s = CAM.shake * 0.5; camera.position.x += rand(-s, s); camera.position.y += rand(-s, s); }
  camera.lookAt(_v1.x - dxx * 2, _v1.y - dyy * 2 + (aiming ? 0.2 : 0.1), _v1.z - dzz * 2);
  camera.fov = lerp(camera.fov, aiming ? 48 : (p.sprint ? 67 : 60), 1 - Math.exp(-8 * dt)); camera.updateProjectionMatrix();
}
/* short scripted camera moves (boss entrance, enrage, fall) */
function startCine(dur: number, camFn: Cine['camFn'], onEnd?: () => void) {
  cine = { t: 0, dur, camFn, onEnd }; document.body.classList.add('cine');
  for (const k in keys) keys[k] = false; mouse.l = mouse.r = false; PL.hold = -1; PL.draw = -1; PL.atk = null; PL.queued = false; PL.lock = null;
}
function updateCine(dt: number) {
  if (!cine) return;
  cine.t += dt; cine.camFn(clamp(cine.t / cine.dur, 0, 1), cine.t);
  if (CAM.shake > 0) { CAM.shake -= dt; const s = CAM.shake * 0.4; camera.position.x += rand(-s, s); camera.position.y += rand(-s, s); }
  if (cine.t >= cine.dur) { const c = cine; cine = null; timeScale = 1; document.body.classList.remove('cine'); camera.fov = 60; camera.updateProjectionMatrix(); if (c.onEnd) c.onEnd(); updateCamera(0.016, true); }
}

/* ---------- projectiles ---------- */
const projs: any[] = [];
const PGEO = { arrow: (() => { const g = cyl(0.025, 0.025, 1, 4); g.rotateX(Math.PI / 2); return g; })(), orb: sph(0.26, 8, 6) };
function spawnProj(type: string, pos: THREE.Vector3, dir: THREE.Vector3, speed: number, dmg: number, mine: boolean) {
  let pr = projs.find(q => !q.live && q.type === type);
  if (!pr) {
    let m;
    if (type === 'arrow') { m = mesh(PGEO.arrow, lam(0xe8dcc0), 0, 0, 0, scene, true); const hd = mesh(new T.ConeGeometry(0.05, 0.16, 4), lam(0x8a929a), 0, 0, 0.55, m, true); hd.rotation.x = Math.PI / 2; for (let k = 0; k < 2; k++) mesh(bx(0.14, 0.01, 0.2), lam(0xc8452f), 0, 0, -0.4, m, true).rotation.z = k * 1.571; }
    else { m = mesh(PGEO.orb, glowMat(type === 'fire' ? 0xffe08a : 0xe0b0ff), 0, 0, 0, scene, true); halo(m, 0, 0, 0, type === 'fire' ? 3.2 : 2.4, type === 'fire' ? 0xff7a2c : 0xa85cff, 0.8); }
    pr = { type, m, pos: new T.Vector3(), vel: new T.Vector3() }; projs.push(pr);
  }
  pr.live = true; pr.pos.copy(pos); pr.vel.copy(dir).multiplyScalar(speed); pr.dmg = dmg; pr.mine = mine; pr.life = type === 'spore' ? 6 : 3.2; pr.m.visible = true; pr.grav = type === 'arrow' ? 9 : 0; pr.m.position.copy(pos);
  return pr;
}
function killProj(pr: Projectile, fx?: boolean) { pr.live = false; pr.m.visible = false; if (fx) { burst(pr.pos.x, pr.pos.y, pr.pos.z, pr.type === 'fire' ? 0xff8a3c : pr.type === 'spore' ? 0xc77bff : 0xe8dcc0, pr.type === 'arrow' ? 4 : 16, pr.type === 'arrow' ? 3 : 5, 0.45); if (pr.type === 'fire') addRing(pr.pos.x, pr.pos.y, pr.pos.z, 0xff9a4a, 1.8, 0.3); } }
/* ---------- hit feedback: impact stars and arrows that stay where they land ---------- */
const STAR_TEX = (() => {
  const c = makeCanvas(64, 64), x = ctx2d(c), g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,.75)'); g.addColorStop(0.5, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  x.fillStyle = 'rgba(255,255,255,.95)';
  for (const r of [0, Math.PI / 2]) { x.save(); x.translate(32, 32); x.rotate(r); x.beginPath(); x.moveTo(-31, 0); x.quadraticCurveTo(0, -3.2, 31, 0); x.quadraticCurveTo(0, 3.2, -31, 0); x.fill(); x.restore(); }
  const t = new T.CanvasTexture(c); return t;
})();
const STARS: { s: THREE.Sprite; t: number; life: number; size: number }[] = [];
/* a short bright flash where a blow lands */
function impactStar(x: number, y: number, z: number, color: number, size: number) {
  let st = STARS.find(q => q.t >= q.life);
  if (!st) {
    if (STARS.length >= 12) st = STARS.reduce((a, b) => (a.t > b.t ? a : b));
    else { const s = new T.Sprite(new T.SpriteMaterial({ map: STAR_TEX, transparent: true, blending: T.AdditiveBlending, depthWrite: false, depthTest: false })); s.renderOrder = 5; scene.add(s); st = { s, t: 0, life: 0, size: 0 }; STARS.push(st); }
  }
  st.s.position.set(x, y, z); st.s.material.color.setHex(color); st.s.material.rotation = Math.random() * 0.8 - 0.4; st.t = 0; st.life = 0.16; st.size = size; st.s.visible = true;
}
const STUCK: { m: THREE.Object3D; owner: Enemy | null; t: number }[] = [];
/* leave an arrow standing in whatever it hit; the tip sinks a little way in */
function stickArrow(point: THREE.Vector3, vel: THREE.Vector3, owner: Enemy | null) {
  let sa = STUCK.find(q => !q.m.visible);
  if (!sa) {
    if (STUCK.length >= 28) sa = STUCK.reduce((a, b) => (a.t > b.t ? a : b));
    else {
      const m = new T.Group(); mesh(PGEO.arrow, lam(0xe8dcc0), 0, 0, 0, m, true);
      for (let k = 0; k < 2; k++) mesh(bx(0.14, 0.01, 0.2), lam(0xc8452f), 0, 0, -0.4, m, true).rotation.z = k * 1.571;
      sa = { m, owner: null, t: 0 }; STUCK.push(sa);
    }
  }
  if (owner) { const mine = STUCK.filter(q => q.owner === owner && q.m.visible); if (mine.length >= 6) mine.reduce((a, b) => (a.t > b.t ? a : b)).m.visible = false; }
  _v4.copy(vel).normalize(); scene.add(sa.m); sa.m.position.copy(point).addScaledVector(_v4, -0.42); _v5.copy(sa.m.position).add(_v4); sa.m.lookAt(_v5);
  sa.m.rotation.z += Math.random() * 6.28; sa.m.updateMatrixWorld();
  if (owner) owner.g.attach(sa.m);
  sa.owner = owner; sa.t = 0; sa.m.visible = true;
}
/* arrows in a creature that comes back to life are gone */
function unstickFrom(e: Enemy) { for (const q of STUCK) if (q.owner === e) { q.m.visible = false; q.owner = null; scene.add(q.m); } }
function updateHitFeedback(dt: number, raw: number) {
  for (const st of STARS) {
    if (st.t >= st.life) { st.s.visible = false; continue; }
    st.t += Math.max(dt, raw * 0.35); const k = Math.min(1, st.t / st.life);
    st.s.scale.setScalar(st.size * (0.55 + 0.75 * Math.sqrt(k))); st.s.material.opacity = 1 - k * k;
  }
  for (const q of STUCK) if (q.m.visible && !q.owner) { q.t += dt; if (q.t > 12) q.m.visible = false; } else if (q.m.visible) q.t += dt;
}
function updateProjs(dt: number) {
  for (const pr of projs) {
    if (!pr.live) continue;
    pr.life -= dt; if (pr.life <= 0) { killProj(pr); continue; }
    if (pr.type === 'spore') { _v1.set(PL.pos.x - pr.pos.x, PL.pos.y + 1.1 - pr.pos.y, PL.pos.z - pr.pos.z).normalize().multiplyScalar(pr.speed || 8); pr.vel.lerp(_v1, 1.6 * dt); }
    pr.vel.y -= pr.grav * dt; pr.pos.addScaledVector(pr.vel, dt);
    pr.m.position.copy(pr.pos);
    if (pr.type === 'arrow') { _v1.copy(pr.pos).add(pr.vel); pr.m.lookAt(_v1); }
    else if (Math.random() < 0.7) burst(pr.pos.x, pr.pos.y, pr.pos.z, pr.type === 'fire' ? 0xffc04a : 0xa85cff, 1, 0.8, 0.35, -1);
    if (pr.pos.y < groundAt(pr.pos.x, pr.pos.z) || (pr.pos.y < 10 && insideBox(pr.pos.x, pr.pos.z, 0))) {
      if (pr.type === 'arrow' && pr.pos.y > WATER_Y - 0.2) stickArrow(pr.pos, pr.vel, null);
      killProj(pr, true); continue;
    }
    if (pr.mine) {
      let done = false;
      for (const e of enemies) {
        if (!e.alive) continue; const cy = e.pos.y + e.def.height * 0.55;
        if (Math.abs(pr.pos.x - e.pos.x) < e.def.radius + 0.45 && Math.abs(pr.pos.z - e.pos.z) < e.def.radius + 0.45 && Math.abs(pr.pos.y - cy) < e.def.height * 0.6 + 0.3) {
          const crit = pr.type === 'arrow' && Math.random() < 0.18;
          damageEnemy(e, pr.dmg * (crit ? 1.8 : 1), { crit, fire: pr.type === 'fire', kx: pr.vel.x * 0.03, kz: pr.vel.z * 0.03, kb: 3 }); sfx('hit');
          impactStar(pr.pos.x, pr.pos.y, pr.pos.z, pr.type === 'fire' ? 0xffb050 : crit ? 0xffd36a : 0xfff4dc, crit ? 2.2 : 1.4);
          if (pr.type === 'arrow') {
            // the arrow sinks in at the creature's surface, on the side it came from
            const hx = pr.pos.x - e.pos.x, hz = pr.pos.z - e.pos.z, hd = Math.hypot(hx, hz) || 1, sr = e.def.radius * 0.8 * e.def.scale;
            _v2.set(e.pos.x + hx / hd * sr, pr.pos.y, e.pos.z + hz / hd * sr); stickArrow(_v2, pr.vel, e);
          }
          killProj(pr, true); done = true; break;
        }
      }
      if (done) continue;
      if (inTemple(pr.pos.x, pr.pos.z, 1)) {
        if (pr.type === 'fire') for (const b of temple.braziers) if (!b.lit && Math.hypot(pr.pos.x - b.x, pr.pos.y - b.y, pr.pos.z - b.z) < 1.5) { b.lit = true; killProj(pr, true); puzzle3Check(); break; }
        const ey = temple.eye;
        if (pr.live && pr.type === 'arrow' && !ey.lit && Math.hypot(pr.pos.x - ey.x, pr.pos.y - ey.y, pr.pos.z - ey.z) < 1.3) { ey.lit = true; killProj(pr, true); puzzle3Check(); }
      }
    } else if (Math.hypot(pr.pos.x - PL.pos.x, pr.pos.z - PL.pos.z) < 0.7 && Math.abs(pr.pos.y - PL.pos.y - 1) < 1.2) {
      if (PL.iframes <= 0) hurtPlayer(pr.dmg, pr.pos.x - pr.vel.x, pr.pos.z - pr.vel.z); killProj(pr, true);
    }
  }
}

/* ---------- loot drops ---------- */
const drops: any[] = [];
function dropLoot(x: number, z: number, items: Record<string, number>, coins: any) {
  const m = new T.Group(); m.position.set(x, groundAt(x, z) + 0.6, z); scene.add(m);
  mesh(new T.OctahedronGeometry(0.24), glowMat(GOLD), 0, 0, 0, m, true); halo(m, 0, 0, 0, 2.2, GOLD, 0.6);
  drops.push({ m, x, z, items, coins, t: 0 });
}
function updateDrops(dt: number) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]; d.t += dt; const by = Math.max(groundAt(d.x, d.z), WATER_Y) + 0.6 + Math.sin(d.t * 4) * 0.12; d.m.rotation.y += dt * 3;
    const dist = Math.hypot(PL.pos.x - d.x, PL.pos.z - d.z);
    if (d.t > 0.35 && dist < 4.5) { d.x += (PL.pos.x - d.x) * Math.min(1, dt * 7); d.z += (PL.pos.z - d.z) * Math.min(1, dt * 7); }   // drawn toward you
    d.m.position.set(d.x, by + Math.max(0, 1 - d.t * 2.5) * 1.2, d.z);
    if (d.t > 0.35 && dist < 1.2) {
      for (const k in d.items) giveItem(k, d.items[k]); if (d.coins) giveCoins(d.coins);
      sfx('pickup'); burst(d.x, by, d.z, GOLD, 8, 2.5, 0.4, 0); scene.remove(d.m); drops.splice(i, 1);
    } else if (d.t > 120) { scene.remove(d.m); drops.splice(i, 1); }
  }
}

/* ---------- enemies ---------- */
const EDEF: Record<string, EnemyDef> = {
  goblin: { name: 'Thicket Goblin', hp: 38, dmg: 8, speed: 4.9, detect: 15, leash: 46, range: 2.1, windup: 0.5, recover: 0.8, xp: 14, radius: 0.5, height: 1.5, scale: 0.82, respawn: 150, loot: [['fang', 0.6, 1], ['arrow', 0.5, 3], ['berry', 0.25, 1]], coins: [2, 6] },
  sentinel: { name: 'Hollow Sentinel', hp: 95, dmg: 17, speed: 3.1, detect: 13, leash: 30, range: 2.7, windup: 0.85, recover: 1.1, xp: 34, radius: 0.7, height: 2.6, scale: 1.45, respawn: 260, loot: [['core', 1, 1], ['crystal', 0.5, 1]], coins: [6, 12] },
  boar: { name: 'Mossback Boar', hp: 50, dmg: 11, speed: 6.6, detect: 14, leash: 55, range: 2.0, windup: 0.4, recover: 1.0, xp: 12, radius: 0.75, height: 1.2, scale: 1, passive: true, respawn: 180, loot: [['meat', 1, 2]], coins: [0, 0] },
  wisp: { name: 'Gloomwing', hp: 24, dmg: 9, speed: 4.2, detect: 19, leash: 46, range: 11, xp: 16, radius: 0.6, height: 1.1, scale: 1, fly: true, cd: 2.5, respawn: 150, loot: [['crystal', 0.5, 1]], coins: [1, 4] },
  boss: { name: 'The Ancient Forest Guardian', hp: 640, dmg: 22, speed: 2.3, radius: 2.4, height: 6.6, scale: 1, boss: true, xp: 260 },
};
const enemies: Enemy[] = [];
function buildEnemy(type: string) {
  if (type === 'goblin') {
    const sk = [0x7fae4a, 0x6f9a52, 0x8fb04a][(Math.random() * 3) | 0];
    const h = humanoid({ skin: sk, top: 0x8a5a30, bottom: 0x5a4630, boot: sk, s: 0.82, eye: 0xffe066, headScale: 1.28, lean: 0.16, bare: true, skirt: 0x6b4a30 });
    const hd = h.p.head;
    for (const s of [-1, 1]) { const e = mesh(new T.ConeGeometry(0.1, 0.5, 5), lam(sk), s * 0.36, 0.08, -0.02, hd); e.rotation.z = -s * 1.25; e.scale.z = 0.4; mesh(new T.ConeGeometry(0.03, 0.12, 4), lam(0xf2ead8), s * 0.09, -0.12, 0.22, hd); }
    mesh(new T.ConeGeometry(0.06, 0.2, 5), lam(sk), 0, -0.02, 0.3, hd).rotation.x = Math.PI / 2; mesh(bx(0.28, 0.03, 0.04), lam(0x3a2a20), 0, -0.13, 0.22, hd);
    mesh(new T.SphereGeometry(0.19, 8, 5, 0, 6.3, 0, 1.6), lam(0x5a4630), -0.01, 0.03, 0, h.p.armR); for (let k = 0; k < 3; k++) mesh(new T.ConeGeometry(0.03, 0.12, 4), lam(0xe8e4d6), -0.05 + k * 0.04, 0.2, (k - 1) * 0.08, h.p.armR);
    const cl = grpIn(h.p.handR, 0, 0, 0.02); cl.rotation.x = 0.5; mesh(cyl(0.11, 0.05, 0.95, 7), lam(0x6b4a2c), 0, 0, 0.42, cl).rotation.x = Math.PI / 2; for (let k = 0; k < 4; k++) { const sp = mesh(new T.ConeGeometry(0.035, 0.14, 4), lam(0xd8d2c0), Math.cos(k * 1.571) * 0.12, Math.sin(k * 1.571) * 0.12, 0.72, cl); sp.rotation.z = k * 1.571 - 1.571; }
    mesh(bx(0.5, 0.06, 0.04), lam(0x3a2a20), 0, 0.3, 0.27, h.p.chest).rotation.z = 0.6;
    return h;
  }
  if (type === 'sentinel') {
    const ST = 0x8f9a93, SD = 0x6c7772, h = humanoid({ skin: ST, top: 0x7d8983, bottom: SD, s: 1.45, eye: 0x7ff3e0, boot: SD, sleeve: SD });
    mesh(bx(0.72, 0.5, 0.48), lam(ST), 0, 0.36, 0, h.p.chest); mesh(bx(0.5, 0.2, 0.5), lam(MOSS), 0, 0.64, -0.02, h.p.chest); mesh(sph(0.1, 8, 6), glowMat(RUNE), 0, 0.36, 0.25, h.p.chest, true); halo(h.p.chest, 0, 0.36, 0.3, 1.1, RUNE, 0.6);
    for (const s of [-1, 1]) { mesh(bx(0.34, 0.2, 0.36), lam(SD), 0, 0.06, 0, s > 0 ? h.p.armL : h.p.armR); mesh(bx(0.06, 0.26, 0.03), glowMat(RUNE), s * 0.2, 0.3, 0.25, h.p.chest, true); }
    mesh(new T.SphereGeometry(0.31, 10, 7, 0, 6.3, 0, 1.9), lam(SD), 0, 0.03, 0, h.p.head); mesh(bx(0.36, 0.05, 0.1), glowMat(RUNE), 0, 0.03, 0.26, h.p.head, true); mesh(bx(0.05, 0.3, 0.44), lam(ST), 0, 0.3, -0.04, h.p.head);
    const sw = grpIn(h.p.handR, 0, 0, 0.02); sw.rotation.x = 1.0; mesh(bx(0.14, 0.05, 1.35), lam(0x5d6864), 0, 0, 0.75, sw); mesh(bx(0.4, 0.08, 0.1), lam(SD), 0, 0, 0.08, sw); mesh(bx(0.03, 0.055, 0.9), glowMat(RUNE), 0, 0, 0.7, sw, true);
    const sh = grpIn(h.p.elbowL, 0.12, -0.15, 0); mesh(bx(0.06, 0.7, 0.5), lam(SD), 0, 0, 0, sh); mesh(bx(0.07, 0.3, 0.06), glowMat(RUNE), 0.01, 0, 0, sh, true);
    return h;
  }
  const g = new T.Group(), p: CreatureRig = {};
  if (type === 'boar') {
    const fur = 0x6b5a45, dark = 0x54463a;
    p.body = mesh(sph(0.7, 10, 8), lam(fur), 0, 0.85, 0, g); p.body.scale.set(0.85, 0.82, 1.3);
    mesh(sph(0.5, 9, 7), lam(dark), 0, 1.0, 0.45, g).scale.set(0.9, 0.9, 0.9);
    p.headG = grpIn(g, 0, 0.8, 0.9); mesh(sph(0.4, 9, 7), lam(dark), 0, 0, 0.05, p.headG).scale.set(0.9, 0.9, 1.15); mesh(cyl(0.16, 0.2, 0.3, 8), lam(0x8a6a5a), 0, -0.08, 0.5, p.headG).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) { const t = mesh(new T.ConeGeometry(0.055, 0.34, 5), lam(0xf2ead8), s * 0.2, -0.04, 0.45, p.headG); t.rotation.set(-0.7, 0, -s * 0.5); mesh(sph(0.04, 5, 4), lam(0x111111), s * 0.2, 0.14, 0.32, p.headG, true); mesh(new T.ConeGeometry(0.09, 0.2, 4), lam(dark), s * 0.24, 0.32, 0.0, p.headG).rotation.z = -s * 0.4; }
    for (let k = 0; k < 6; k++) mesh(new T.ConeGeometry(0.09, 0.3, 4), lam(0x4a3d2e), 0, 1.5 - k * 0.03, 0.5 - k * 0.24, g).rotation.x = -0.3;
    mesh(sph(0.42, 7, 5), lam(MOSS), 0, 1.36, -0.25, g).scale.set(1.2, 0.3, 1.4); mesh(cyl(0.03, 0.02, 0.3, 4), lam(dark), 0, 1.0, -0.95, g).rotation.x = 0.8;
    p.legs = []; for (const [lx, lz] of [[-0.35, 0.6], [0.35, 0.6], [-0.35, -0.6], [0.35, -0.6]]) { const l = new T.Group(); l.position.set(lx, 0.5, lz); g.add(l); mesh(cyl(0.11, 0.08, 0.5, 6), lam(0x4a3d2e), 0, -0.25, 0, l); mesh(cyl(0.085, 0.09, 0.08, 6), lam(0x2a221c), 0, -0.47, 0, l); p.legs.push(l); }
  } else if (type === 'wisp') {
    p.body = mesh(sph(0.36, 10, 8), glowMat(0xd8b0ff), 0, 0, 0, g, true); halo(g, 0, 0, 0, 3, 0x9a5cff, 0.7);
    p.wings = []; for (const s of [-1, 1]) { const w = new T.Group(); g.add(w); const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.15, s * 1.2, 0.25, 0.1, s * 0.9, 0, -0.5, 0, 0, 0.15, s * 0.9, 0, -0.5, 0, 0, -0.3], 3)); wg.computeVertexNormals(); mesh(wg, lam(0x3a2a55, { side: T.DoubleSide }), 0, 0, 0, w, true); p.wings.push(w); w.userData.s = s; }
    for (const s of [-1, 1]) mesh(sph(0.06, 6, 5), glowMat(0xffffff), s * 0.14, 0.07, 0.31, g, true);
    p.tail = [0, 1, 2].map(k => mesh(sph(0.16 - k * 0.04, 6, 5), glowMat(0xa85cff), 0, 0, -0.4 - k * 0.3, g, true));
  } else { // the Ancient Forest Guardian
    const bark = lam(0x6b5a45), barkD = lam(0x54463a), moss = lam(0x5f8f3e), stone = lam(0x8a938e), pg = puffGeo(1, 0.24, true), mossV = new T.MeshToonMaterial({ color: 0x5f9a45, gradientMap: TOON, vertexColors: true }), bv = new T.MeshToonMaterial({ color: 0x7a6650, gradientMap: TOON, vertexColors: true });
    p.pivot = new T.Group(); g.add(p.pivot);
    p.body = mesh(pg, bv, 0, 4, 0, p.pivot); p.body.scale.set(2.5, 2.7, 2.0);
    mesh(pg, bv, 0, 2.6, 0, p.pivot).scale.set(1.9, 1.3, 1.6);
    for (let k = 0; k < 5; k++) { const a = -1 + k * 0.5; const rib = mesh(new T.TorusGeometry(1.25, 0.14, 5, 10, 2.2), barkD, 0, 3.3 + Math.abs(k - 2) * 0.35 + 0.5, 1.5, p.pivot); rib.rotation.set(0, 0, a + 0.47); rib.scale.set(1, 1, 0.6); }
    mesh(pg, mossV, 0, 5.9, -0.5, p.pivot).scale.set(3.2, 1.0, 2.3); mesh(pg, mossV, -1.9, 5.6, 0.2, p.pivot).scale.set(1.5, 0.8, 1.4); mesh(pg, mossV, 1.9, 5.6, 0.2, p.pivot).scale.set(1.5, 0.8, 1.4);
    for (const [tx, tz, s] of [[-1.6, -0.6, 1], [1.3, -0.9, 0.8], [0.2, -1.2, 1.2]]) { mesh(cyl(0.08 * s, 0.12 * s, 1.2 * s, 5), bark, tx, 6.9, tz, p.pivot); mesh(pg, mossV, tx, 7.7 * 1 + (s - 1) * 0.6, tz, p.pivot).scale.set(0.9 * s, 0.75 * s, 0.9 * s); }
    for (const [mx, mz, c] of [[-2.3, 0.6, 0xff7ad1], [2.2, 0.5, 0x7ff3e0], [0.9, -1.4, 0x7ff3e0]]) { mesh(cyl(0.05, 0.07, 0.4, 5), lam(0xe8e4d6), mx, 6.45, mz, p.pivot); mesh(new T.SphereGeometry(0.26, 8, 5, 0, 6.3, 0, 1.5), glowMat(c), mx, 6.62, mz, p.pivot, true); }
    p.core = mesh(sph(0.78, 14, 10), new T.MeshBasicMaterial({ color: 0x2f8f85 }), 0, 4, 1.65, p.pivot, true); p.coreHalo = halo(p.pivot, 0, 4, 2.3, 5, 0x7ff3e0, 0.5);
    p.cracks = []; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283, c = mesh(bx(0.09, 1.1 + (k % 2) * 0.5, 0.06), new T.MeshBasicMaterial({ color: 0x2f8f85 }), Math.cos(a) * 1.25, 4 + Math.sin(a) * 1.3, 1.72 - Math.abs(Math.cos(a)) * 0.3, p.pivot, true); c.rotation.z = a + 1.571; p.cracks.push(c); }
    p.head = mesh(pg, bv, 0, 6.6, 0.9, p.pivot); p.head.scale.set(1.0, 0.95, 1.0);
    const hd = grpIn(p.pivot, 0, 6.6, 0.9); p.headG = hd;
    mesh(bx(1.1, 0.24, 0.5), barkD, 0, 0.36, 0.72, hd).rotation.x = 0.3; mesh(bx(0.9, 0.3, 0.5), barkD, 0, -0.55, 0.62, hd);
    p.eyes = []; for (const s of [-1, 1]) { p.eyes.push(mesh(sph(0.17, 8, 6), new T.MeshBasicMaterial({ color: 0x2f5560 }), s * 0.4, 0.08, 0.86, hd, true)); let px = s * 0.5, py = 0.7; for (let k = 0; k < 4; k++) { const len = 1.5 - k * 0.25, a = -s * (0.5 + k * 0.28), br = mesh(cyl(0.06 - k * 0.01, 0.14 - k * 0.02, len, 5), bark, px + Math.sin(-a) * len / 2, py + Math.cos(a) * len / 2, -0.15, hd); br.rotation.z = a; if (k % 2 === 0) { const tw = mesh(cyl(0.02, 0.05, 0.7, 4), bark, px + Math.sin(-a) * len * 0.6 - s * 0.2, py + Math.cos(a) * len * 0.6 + 0.3, -0.15, hd); tw.rotation.z = a - s * 0.8; } px += Math.sin(-a) * len; py += Math.cos(a) * len; } }
    for (const [k, s] of [['armR', -1], ['armL', 1]] as [string, number][]) {
      const a = p[k] = new T.Group(); a.position.set(s * 2.75, 5.1, 0); p.pivot.add(a);
      mesh(pg, mossV, 0, 0.1, 0, a).scale.set(1.2, 0.8, 1.2); mesh(cyl(0.62, 0.5, 2.2, 8), bark, 0, -1.1, 0, a);
      const f = grpIn(a, 0, -2.2, 0); p['fore' + (s < 0 ? 'R' : 'L')] = f; mesh(cyl(0.5, 0.62, 1.7, 8), barkD, 0, -0.8, 0, f); mesh(pg, new T.MeshToonMaterial({ color: 0x8a938e, gradientMap: TOON, vertexColors: true }), 0, -1.9, 0, f).scale.set(1.05, 0.95, 1.05);
      for (let q = 0; q < 3; q++) mesh(cyl(0.035, 0.035, 1.2 + q * 0.5, 4), lam(VINE), (q - 1) * 0.35, -1.3 - q * 0.2, 0.45, a, true);
    }
    for (const [k, s] of [['legR', -1], ['legL', 1]] as [string, number][]) { const l = p[k] = new T.Group(); l.position.set(s * 1.15, 2.3, 0); p.pivot.add(l); mesh(cyl(0.8, 0.95, 2.3, 8), bark, 0, -1.15, 0, l); mesh(cyl(1.05, 1.1, 0.35, 8), stone, 0, -2.15, 0.1, l); mesh(pg, mossV, 0, -0.2, 0, l).scale.set(1, 0.4, 1); }
  }
  return { g, p };
}
function spawnEnemy(type: string, x: number, z: number) {
  const b = buildEnemy(type), def = EDEF[type];
  const e: Enemy = { type, def, g: b.g, p: b.p as Rig & CreatureRig, pos: new T.Vector3(x, groundAt(x, z), z), home: { x, z }, yaw: rng() * 6, hp: def.hp, state: 'idle', t: 0, wait: 1 + rng() * 3, cd: 0, alive: true, deadT: 0, aggro: false, kb: new T.Vector3(), tx: x, tz: z, anim: rng() * 5, punch: 0, flash: 0, mats: ownMaterials(b.g) };
  addOutline(e.g, def.boss ? 0.05 : 0.014); scene.add(e.g); enemies.push(e); return e;
}
function reviveEnemy(e: Enemy) {
  unstickFrom(e);
  e.alive = true; e.hp = e.def.hp; e.state = e.def.boss ? 'sleep' : 'idle'; e.t = 0; e.aggro = false; e.deadT = 0; e.flash = 0; e.pos.set(e.home.x, groundAt(e.home.x, e.home.z), e.home.z);
  e.g.visible = true; e.g.rotation.set(0, e.yaw, 0); e.g.scale.setScalar(e.def.scale); e.g.position.copy(e.pos); e.kb.set(0, 0, 0); for (const m of e.mats) m.emissive.setRGB(0, 0, 0);
}
function damageEnemy(e: Enemy, dmg: number, o: HitOptions) {
  if (!e.alive) return;
  if (e.def.boss) { if (e.state === 'sleep' || e.state === 'wake') return; dmg *= (e.state === 'stun' ? 2 : 0.5) * (o.fire ? 1.5 : 1); }
  else { e.kb.set(o.kx || 0, 0, o.kz || 0).multiplyScalar(o.kb || 0); if (e.state !== 'windup' || dmg > 20) { e.state = 'stagger'; e.t = 0; } e.aggro = true; if (e.def.passive) for (const f of enemies) if (f.type === e.type && f.alive && f.pos.distanceTo(e.pos) < 14) f.aggro = true; }
  dmg = Math.max(1, Math.round(dmg)); e.hp -= dmg; e.punch = 0.18; e.flash = 0.16; e.hurtShown = 6;
  dmgText(e.pos.x, e.pos.y + e.def.height + 0.3, e.pos.z, (o.crit ? '✦ ' : '') + dmg, o.crit ? 'crit' : (e.def.boss && e.state === 'stun' ? 'crit' : ''));
  burst(e.pos.x, e.pos.y + e.def.height * 0.6, e.pos.z, o.fire ? 0xff8a3c : 0xfff2c0, o.crit ? 14 : 7, 5, 0.35);
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e: Enemy) {
  e.alive = false; e.deadT = 0; e.hp = 0; if (PL.lock === e) PL.lock = null; hitStop = Math.max(hitStop, 0.11);
  gainXp(e.def.xp); sfx('die');
  if (e.def.boss) { bossDefeated(e); return; }
  const items: Record<string, number> = {}; for (const [id, ch, n] of e.def.loot) if (Math.random() < ch) items[id] = 1 + (Math.random() * n | 0);
  const cr = e.def.coins || [0, 0], coins = cr[0] + (Math.random() * (cr[1] - cr[0] + 1) | 0);
  if (Object.keys(items).length || coins) dropLoot(e.pos.x, e.pos.z, items, coins);
  G.kills++; if (e.type === 'goblin') questEvent('goblin');
}
function moveEnt(e: Enemy, tx: number, tz: number, speed: number, dt: number) {
  const dx = tx - e.pos.x, dz = tz - e.pos.z, d = Math.hypot(dx, dz); if (d < 0.05) return;
  const ox = e.pos.x, oz = e.pos.z;
  e.pos.x += dx / d * speed * dt; e.pos.z += dz / d * speed * dt; e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), 9 * dt);
  resolveCollide(e.pos, e.def.radius);
  if (!e.def.fly && groundAt(e.pos.x, e.pos.z) < WATER_Y - 0.2) { e.pos.x = ox; e.pos.z = oz; }
  e.moved = true;
}
function updateEnemy(e: Enemy, dt: number) {
  const D = e.def;
  if (!e.alive) {
    e.deadT += dt;
    if (e.g.visible) {
      const k = Math.min(1, e.deadT / 0.45);
      if (!D.boss && e.deadT < 0.6) {   /* carried by the killing blow, with a small hop */
        if (e.kb.lengthSq() > 0.01) { e.pos.x += e.kb.x * dt * 1.4; e.pos.z += e.kb.z * dt * 1.4; e.kb.multiplyScalar(Math.max(0, 1 - 5 * dt)); resolveCollide(e.pos, D.radius); }
        e.g.position.x = e.pos.x; e.g.position.z = e.pos.z; if (!D.fly) e.g.position.y = e.pos.y + 0.35 * Math.sin(Math.min(1, e.deadT / 0.4) * Math.PI);
      }
      if (D.fly) { e.g.position.y -= dt * 4; e.g.rotation.z += dt * 6; } else { e.g.rotation.x = -k * 1.5; e.g.rotation.z = k * 0.3; }
      for (const m of e.mats) m.emissive.setRGB(Math.max(0, 0.6 - e.deadT * 2), Math.max(0, 0.6 - e.deadT * 2), Math.max(0, 0.6 - e.deadT * 2));
      if (e.deadT > 1.1) { e.g.scale.multiplyScalar(Math.max(0.01, 1 - dt * 6)); }
      if (e.deadT > 1.5) { e.g.visible = false; burst(e.pos.x, e.pos.y + 0.5, e.pos.z, 0x4a3a5a, 16, 3, 0.7, -1); burst(e.pos.x, e.pos.y + 0.5, e.pos.z, 0xd8c8ff, 8, 2, 0.6, -2); }
    }
    if (D.respawn && e.deadT > D.respawn && Math.hypot(PL.pos.x - e.home.x, PL.pos.z - e.home.z) > 70) reviveEnemy(e);
    return;
  }
  const dx = PL.pos.x - e.pos.x, dz = PL.pos.z - e.pos.z, d = Math.hypot(dx, dz);
  if (d > 95) return;
  e.t += dt; e.cd -= dt; e.anim += dt; e.moved = false; e.flash -= dt; e.hurtShown = (e.hurtShown || 0) - dt;
  if (e.kb.lengthSq() > 0.01) { e.pos.x += e.kb.x * dt; e.pos.z += e.kb.z * dt; e.kb.multiplyScalar(Math.max(0, 1 - 7 * dt)); resolveCollide(e.pos, D.radius); }
  const dh = Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z);
  const sees = !PL.dead && (D.passive ? e.aggro : (e.aggro || d < D.detect * (PL.crouch ? 0.45 : 1))) && Math.abs(PL.pos.y - e.pos.y) < 9;
  let pose = 'idle', tele = 0;
  switch (e.state) {
    case 'idle': if (sees) { e.state = 'chase'; if (!D.passive) { sfx('alert'); dmgText(e.pos.x, e.pos.y + D.height + 0.5, e.pos.z, '!', 'alert'); } } else if (e.t > e.wait) { const a = Math.random() * 6.283, r = 2 + Math.random() * 6; e.tx = e.home.x + Math.cos(a) * r; e.tz = e.home.z + Math.sin(a) * r; e.state = 'wander'; e.t = 0; } break;
    case 'wander': moveEnt(e, e.tx, e.tz, D.speed * 0.35, dt); if (sees) e.state = 'chase'; else if (e.t > 5 || Math.hypot(e.tx - e.pos.x, e.tz - e.pos.z) < 0.5) { e.state = 'idle'; e.t = 0; e.wait = 1 + Math.random() * 4; } break;
    case 'chase':
      if (PL.dead || d > D.detect * 2.4 || dh > D.leash) { e.state = 'return'; e.aggro = false; break; }
      if (D.fly) {
        if (d > 11) moveEnt(e, PL.pos.x, PL.pos.z, D.speed, dt); else if (d < 7) moveEnt(e, e.pos.x - dx, e.pos.z - dz, D.speed * 0.8, dt); else { moveEnt(e, e.pos.x - dz, e.pos.z + dx, D.speed * 0.5, dt); }
        e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), 8 * dt); if (e.cd < 0.5) tele = 1 - e.cd / 0.5;
        if (e.cd <= 0 && d < 16) { e.cd = D.cd; _v1.set(e.pos.x, e.pos.y + 0.2, e.pos.z); _v2.set(dx, PL.pos.y + 1.1 - e.pos.y, dz).normalize(); const pr = spawnProj('spore', _v1, _v2, 11, D.dmg, false); pr.speed = 11; pr.life = 3.5; sfx('spit'); }
      } else if (d < D.range) { e.state = 'windup'; e.t = 0; sfx('grunt'); }
      else moveEnt(e, PL.pos.x, PL.pos.z, D.speed, dt);
      break;
    case 'windup': pose = 'windup'; e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), 6 * dt); tele = e.t / D.windup;
      if (e.t > D.windup) {
        const a = Math.abs(Math.atan2(dx, dz) - e.yaw), ang = Math.min(a, 6.283 - a);
        if (d < D.range + 0.9 && ang < 1.1) hurtPlayer(D.dmg, e.pos.x, e.pos.z);
        sfx('swing'); e.state = 'recover'; e.t = 0; e.kb.set(Math.sin(e.yaw) * (e.type === 'boar' ? 8 : 3), 0, Math.cos(e.yaw) * (e.type === 'boar' ? 8 : 3));
        if (e.type === 'sentinel') { addRing(e.pos.x + Math.sin(e.yaw) * 2, e.pos.y + 0.15, e.pos.z + Math.cos(e.yaw) * 2, 0x7ff3e0, 2.4, 0.4); CAM.shake = Math.max(CAM.shake, 0.15); }
      } break;
    case 'recover': pose = 'strike'; if (e.t > D.recover) e.state = 'chase'; else if (e.t > 0.3) pose = 'idle'; break;
    case 'stagger': pose = 'stagger'; if (e.t > 0.34) e.state = 'chase'; break;
    case 'return': moveEnt(e, e.home.x, e.home.z, D.speed, dt); e.hp = Math.min(D.hp, e.hp + D.hp * 0.2 * dt); if (dh < 2) { e.state = 'idle'; e.t = 0; } else if (sees && d < D.detect * 0.6 && dh < D.leash * 0.6) e.state = 'chase'; break;
  }
  const gy = groundAt(e.pos.x, e.pos.z);
  e.pos.y = D.fly ? Math.max(gy, WATER_Y) + 2.5 + Math.sin(e.anim * 2) * 0.35 : gy;
  e.g.position.copy(e.pos); e.g.rotation.set(0, e.yaw, 0);
  if (e.punch > 0) e.punch -= dt;
  const sq = Math.max(0, e.punch) * 1.4; e.g.scale.set(D.scale * (1 + sq), D.scale * (1 - sq * 0.6), D.scale * (1 + sq));
  // strike flash (white) and attack telegraph (hot orange)
  const fl = Math.max(0, e.flash) * 6, tp = tele > 0 ? (0.25 + 0.75 * tele) * (0.6 + 0.4 * Math.sin(e.anim * 30)) : 0;
  for (const m of e.mats) m.emissive.setRGB(fl + tp * 0.9, fl + tp * 0.28, fl + tp * 0.08);
  if (e.p.hips) animHumanoid(e.p, pose !== 'idle' ? pose : e.moved ? (e.state === 'chase' ? 'run' : 'walk') : 'idle', e.anim, dt);
  else if (e.type === 'boar') { const s = e.moved ? Math.sin(e.anim * 15) * 0.7 : 0; e.p.legs.forEach((l: THREE.Object3D, i: number) => l.rotation.x = (i === 0 || i === 3) ? s : -s); e.p.body.position.y = 0.85 + (e.moved ? Math.abs(Math.cos(e.anim * 15)) * 0.06 : Math.sin(e.anim * 2) * 0.02); e.p.headG.rotation.x = pose === 'windup' ? 0.5 : pose === 'strike' ? -0.5 : pose === 'stagger' ? -0.3 : Math.sin(e.anim * 1.3) * 0.1; if (pose === 'windup' && Math.random() < 0.3) burst(e.pos.x - Math.sin(e.yaw) * 0.8, e.pos.y + 0.1, e.pos.z - Math.cos(e.yaw) * 0.8, 0xd8d2b8, 1, 2, 0.3, 2); }
  else if (e.type === 'wisp') { e.p.wings.forEach((w: THREE.Object3D) => w.rotation.z = w.userData.s * Math.sin(e.anim * 16) * 0.75); e.p.tail.forEach((t: THREE.Object3D, k: number) => { t.position.x = Math.sin(e.anim * 5 - k * 0.9) * 0.14 * (k + 1); t.position.y = Math.cos(e.anim * 4 - k) * 0.06 * (k + 1); }); e.p.body.scale.setScalar(1 + tele * 0.3); }
}

/* ---------- boss: the Ancient Forest Guardian ---------- */
const hazards: any[] = [];
const HZ = { ring: new T.RingGeometry(0.9, 1, 36).rotateX(-Math.PI / 2), disc: new T.CircleGeometry(1, 30).rotateX(-Math.PI / 2), spike: new T.ConeGeometry(0.45, 3.4, 5), runes: new T.RingGeometry(0.62, 0.7, 8, 1).rotateX(-Math.PI / 2) };
function addHazard(x: number, z: number, r: number, delay: number, dmg: number, spikes: boolean) {
  const y = groundAt(x, z) + 0.12, g = new T.Group(); g.position.set(x, y, z); scene.add(g);
  const mk = (op: number) => new T.MeshBasicMaterial({ color: spikes ? 0xff7a3c : 0xff4a3c, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide });
  const ring = mesh(HZ.ring, mk(0.95), 0, 0, 0, g, true); ring.scale.set(r, 1, r);
  const disc = mesh(HZ.disc, mk(0.22), 0, -0.02, 0, g, true); disc.scale.set(0.01, 1, 0.01);
  const ru = mesh(HZ.runes, mk(0.6), 0, 0.01, 0, g, true); ru.scale.set(r, 1, r);
  hazards.push({ g, disc, ru, x, z, r, t: 0, delay, dmg, spikes, done: false });
}
function updateHazards(dt: number) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i]; h.t += dt; h.ru.rotation.y += dt * 2.5;
    if (!h.done) {
      const k = Math.min(1, h.t / h.delay) * h.r; h.disc.scale.set(k, 1, k); h.disc.material.opacity = 0.18 + 0.2 * (h.t / h.delay);
      if (h.t >= h.delay) {
        h.done = true; sfx('slam'); CAM.shake = Math.max(CAM.shake, h.spikes ? 0.25 : 0.55);
        burst(h.x, h.g.position.y + 0.3, h.z, 0x8a6a44, h.spikes ? 14 : 40, h.spikes ? 6 : 11, 0.7); addRing(h.x, h.g.position.y + 0.1, h.z, h.spikes ? 0xffb07a : 0xffe0b0, h.r * 1.25, h.spikes ? 0.35 : 0.6);
        if (h.spikes) for (let s = 0; s < 6; s++) { const a = s / 5 * 6.283, rr = s ? h.r * 0.5 : 0; const sp = mesh(HZ.spike, lam(s % 2 ? 0x5a4630 : 0x6b5a45), Math.cos(a) * rr, 1.2, Math.sin(a) * rr, h.g, true); sp.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); sp.scale.y = 0.05; sp.userData.spike = 1; }
        if (Math.hypot(PL.pos.x - h.x, PL.pos.z - h.z) < h.r + 0.3 && PL.pos.y - h.g.position.y < 2.4) hurtPlayer(h.dmg, h.x, h.z, { unblockable: !!h.spikes });
      }
    } else {
      const q = h.t - h.delay; for (const c of h.g.children) if (c.userData.spike) c.scale.y = q < 0.12 ? q / 0.12 : Math.max(0.01, 1 - Math.max(0, q - 0.5) * 3.3);
      h.disc.material.opacity = Math.max(0, 0.3 - q); if (q > 0.85) { scene.remove(h.g); hazards.splice(i, 1); }
    }
  }
}
function clearHazards() { for (const h of hazards) scene.remove(h.g); hazards.length = 0; for (const pr of projs) if (pr.live && !pr.mine) killProj(pr); }
let boss: Enemy | null = null, bossFight = false;
function bossGlow(hex: number, eyes?: number) { if (!boss) return; const P = boss.p; P.core.material.color.setHex(hex); P.coreHalo.material.color.setHex(hex); for (const c of P.cracks) c.material.color.setHex(hex); if (eyes != null) P.eyes.forEach((m: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>) => m.material.color.setHex(eyes)); }
function bossReset() {
  bossFight = false; clearHazards(); if (cine) { cine = null; timeScale = 1; document.body.classList.remove('cine'); }
  if (!boss) return;
  if (G.flags.boss) { boss.alive = false; boss.g.visible = false; boss.deadT = 99; return; }
  reviveEnemy(boss); boss.yaw = Math.PI / 2; boss.g.rotation.y = boss.yaw; boss.phase = 1; boss.p.pivot.rotation.set(0, 0, 0); boss.p.pivot.position.y = -1.4; boss.p.core.scale.setScalar(1);
  bossGlow(0x1f5f58, 0x2f5560); boss.p.coreHalo.material.opacity = 0.2;
}
function updateBoss(e: Enemy, dt: number) {
  const P = e.p;
  if (!e.alive) {
    if (e.g.visible && e.deadT < 6) { e.deadT += dt; const k = smooth(0.4, 3, e.deadT); P.pivot.rotation.x = k * 1.45; P.pivot.position.y = -k * 2.2; P.armL.rotation.x = P.armR.rotation.x = lerp(P.armL.rotation.x, 0.6, dt * 2); if (Math.random() < 0.7) burst(e.pos.x + rand(-2.5, 2.5), e.pos.y + rand(0, 4), e.pos.z + rand(-2.5, 2.5), Math.random() < 0.5 ? RUNE : 0xc8ffb0, 2, 3, 1.2, -4); P.coreHalo.material.opacity = Math.max(0, 0.8 - e.deadT * 0.25); for (const m of e.mats) m.emissive.setRGB(0, 0, 0); }
    return;
  }
  const dx = PL.pos.x - e.pos.x, dz = PL.pos.z - e.pos.z, d = Math.hypot(dx, dz);
  if (e.state === 'sleep') {
    P.pivot.position.y = -1.4; P.pivot.rotation.x = 0.25; P.armL.rotation.x = P.armR.rotation.x = 0.3;
    if (!G.flags.boss && G.flags.puz3 && PL.pos.x < -131.5 && inTemple(PL.pos.x, PL.pos.z) && !PL.dead) {
      bossFight = true; e.state = 'wake'; e.t = 0; sfx('rumble'); banner('The Ancient Forest Guardian', 'It has slept for three hundred years');
      const bx0 = e.pos.x, bz0 = e.pos.z;
      startCine(3.7, (k: number) => { const a = lerp(-0.25, 0.95, smooth(0, 1, k)), r = lerp(15, 9.5, smooth(0, 1, k)); camera.position.set(bx0 + Math.cos(a) * r, 3 + lerp(1.4, 3.6, k), bz0 + Math.sin(a) * r); camera.lookAt(bx0, 3 + lerp(2.2, 5.2, smooth(0.1, 0.8, k)), bz0); camera.fov = lerp(52, 60, k); camera.updateProjectionMatrix(); });
    }
    return;
  }
  e.t += dt; e.anim += dt; e.cd -= dt; e.flash -= dt;
  const ph2 = e.phase === 2, turn = () => { e.yaw = angLerp(e.yaw, Math.atan2(dx, dz), 2.6 * dt); };
  let armR = 0, armL = 0, bodyX = 0, foreR = -0.25, foreL = -0.25, tele = 0, headX = 0;
  switch (e.state) {
    case 'wake': {
      const k = smooth(0.4, 2.5, e.t); P.pivot.position.y = lerp(-1.4, 0, k); bodyX = lerp(0.25, 0, k); CAM.shake = Math.max(CAM.shake, 0.12 * (1 - k) + 0.02);
      if (e.t < 2.6 && Math.random() < 0.6) burst(e.pos.x + rand(-3, 3), 3.1, e.pos.z + rand(-3, 3), 0xb9a98a, 2, 3, 0.8, 3);
      if (e.t > 1.2 && !e.lit) { e.lit = true; bossGlow(0x2f8f85, 0x7ff3e0); P.coreHalo.material.opacity = 0.5; sfx('charge'); }
      if (e.t > 2.6) { armR = armL = -2.4; headX = -0.4; bodyX = -0.25; if (!e.roared) { e.roared = true; sfx('roar'); addRing(e.pos.x, 3.15, e.pos.z, 0x7ff3e0, 16, 0.9); CAM.shake = 0.5; } }
      if (e.t > 3.7) { e.state = 'walk'; e.t = 0; e.cd = 0.8; e.lit = e.roared = false; }
      break;
    }
    case 'walk': {
      turn(); const sp = ph2 ? 3.5 : 2.3;
      if (d > 4.5) { e.pos.x += Math.sin(e.yaw) * sp * dt; e.pos.z += Math.cos(e.yaw) * sp * dt; }
      e.pos.x = clamp(e.pos.x, -158, -131); e.pos.z = clamp(e.pos.z, -52, -28);
      const st = Math.sin(e.anim * (ph2 ? 3.4 : 2.4)); armR = st * 0.4; armL = -armR; P.legR.rotation.x = -st * 0.45; P.legL.rotation.x = st * 0.45; bodyX = 0.06 + Math.abs(st) * 0.04;
      if (d > 4.5) { const stp = Math.floor(e.anim * (ph2 ? 3.4 : 2.4) / Math.PI); if (stp !== e.lastStep) { e.lastStep = stp; sfx('stomp'); CAM.shake = Math.max(CAM.shake, clamp(0.3 - d * 0.012, 0, 0.2)); burst(e.pos.x + Math.cos(e.yaw) * (stp % 2 ? 1.2 : -1.2), 3.1, e.pos.z - Math.sin(e.yaw) * (stp % 2 ? 1.2 : -1.2), 0xb9a98a, 6, 3, 0.5, 3); } }
      if (e.cd <= 0) {
        if (d < 7.5) { e.state = 'slamWind'; e.t = 0; addHazard(e.pos.x, e.pos.z, 7.5, ph2 ? 1.0 : 1.25, 22, false); sfx('charge'); }
        else if (ph2 && Math.random() < 0.45) { e.state = 'spore'; e.t = 0; e.n = 0; }
        else { e.state = 'roots'; e.t = 0; e.n = 0; }
      } break;
    }
    case 'slamWind': { const w = ph2 ? 1.0 : 1.25, k = e.t / w; armR = armL = -3.0 * smooth(0, 0.75, k); foreR = foreL = -0.9; bodyX = -0.28 * smooth(0, 0.75, k); headX = -0.3; tele = k;
      if (e.t >= w) { e.state = 'stun'; e.t = 0; notify('The Guardian’s core is exposed. Strike now!'); P.armR.rotation.x = P.armL.rotation.x = 0.55; P.pivot.rotation.x = 0.6; } break; }
    case 'stun': armR = armL = 0.55; foreR = foreL = -0.1; bodyX = 0.6; headX = 0.4; { const on = Math.floor(e.anim * 8) % 2; bossGlow(on ? 0xffffff : 0x7ff3e0); P.core.scale.setScalar(1.3 + Math.sin(e.anim * 12) * 0.06); P.coreHalo.material.opacity = 0.9; if (Math.random() < 0.4) burst(e.pos.x + Math.sin(e.yaw) * 2.6, 5.2, e.pos.z + Math.cos(e.yaw) * 2.6, 0xcffff4, 1, 2.5, 0.5, -2); }
      if (e.t > (ph2 ? 1.9 : 2.6)) { e.state = 'walk'; e.t = 0; e.cd = ph2 ? 1.0 : 1.6; P.core.scale.setScalar(1); bossGlow(ph2 ? 0xff7a3c : 0x2f8f85); P.coreHalo.material.opacity = 0.5; } break;
    case 'roots': turn(); armL = -2.1; foreL = -0.5; armR = 0.2; bodyX = 0.2; tele = 0.5;
      if (e.t > 0.5 + e.n * 0.5) { addHazard(PL.pos.x + PL.vel.x * 0.25, PL.pos.z + PL.vel.z * 0.25, 2.6, 0.85, 16, true); e.n++; sfx('stone'); if (e.n >= (ph2 ? 5 : 3)) { e.state = 'walk'; e.t = 0; e.cd = ph2 ? 0.9 : 1.6; } } break;
    case 'spore': turn(); armR = armL = -1.6; foreR = foreL = -1.1; headX = -0.3; tele = 0.5;
      if (e.t > 0.4 + e.n * 0.35) { _v1.set(e.pos.x + Math.sin(e.yaw) * 2, e.pos.y + 5.5, e.pos.z + Math.cos(e.yaw) * 2); _v2.set(rand(-0.5, 0.5), 1, rand(-0.5, 0.5)).normalize(); const pr = spawnProj('spore', _v1, _v2, 7, 11, false); pr.speed = 7.5; sfx('spit'); e.n++; if (e.n >= 4) { e.state = 'walk'; e.t = 0; e.cd = 1.4; } } break;
    case 'roar': bodyX = -0.32; armR = armL = -2.5; foreR = foreL = -0.6; headX = -0.5; CAM.shake = Math.max(CAM.shake, 0.22); if (Math.random() < 0.8) burst(e.pos.x + rand(-2, 2), e.pos.y + rand(2, 6), e.pos.z + rand(-2, 2), 0xff7a3c, 2, 5, 0.6, -3); if (e.t > 1.9) { e.state = 'walk'; e.t = 0; e.cd = 0.6; } break;
  }
  if (e.phase === 1 && e.hp < D_BOSS_HALF && e.state !== 'slamWind') {
    e.phase = 2; e.state = 'roar'; e.t = 0; sfx('roar'); notify('The Guardian’s bark splits. It burns from within.'); banner('The Guardian burns', 'Its strikes come faster now');
    P.core.scale.setScalar(1); bossGlow(0xff7a3c, 0xff7a3c); P.coreHalo.material.opacity = 0.6;
    burst(e.pos.x, e.pos.y + 4, e.pos.z, 0xff7a3c, 50, 11, 1); addRing(e.pos.x, 3.15, e.pos.z, 0xff7a3c, 18, 0.8); const pd = d || 1; PL.vel.x += dx / pd * 16; PL.vel.z += dz / pd * 16; clearHazards();
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), ex = e.pos.x, ez = e.pos.z;
    startCine(1.9, (k: number) => { const a = lerp(-0.5, 0.5, k); camera.position.set(ex + (fx * Math.cos(a) - fz * Math.sin(a)) * lerp(11, 8, k), 6.4, ez + (fz * Math.cos(a) + fx * Math.sin(a)) * lerp(11, 8, k)); camera.lookAt(ex, 9, ez); });
  }
  const kk = 1 - Math.exp(-(e.state === 'stun' ? 22 : 9) * dt);
  P.armR.rotation.x = lerp(P.armR.rotation.x, armR, kk); P.armL.rotation.x = lerp(P.armL.rotation.x, armL, kk); P.foreR.rotation.x = lerp(P.foreR.rotation.x, foreR, kk); P.foreL.rotation.x = lerp(P.foreL.rotation.x, foreL, kk);
  P.pivot.rotation.x = lerp(P.pivot.rotation.x, bodyX, 1 - Math.exp(-(e.state === 'stun' ? 20 : 7) * dt)); P.headG.rotation.x = P.head.rotation.x = lerp(P.headG.rotation.x, headX, kk);
  P.body.scale.y = 2.7 + Math.sin(e.anim * 1.6) * 0.06;
  const fl = Math.max(0, e.flash) * 5, tp = tele * (0.5 + 0.5 * Math.sin(e.anim * 26)) * 0.5; for (const m of e.mats) m.emissive.setRGB(fl + tp, fl + tp * 0.3, fl + tp * 0.1);
  e.pos.y = 3; e.g.position.copy(e.pos); e.g.rotation.y = e.yaw;
  if (d < 3.1 && d > 0.01) { PL.pos.x = e.pos.x + dx / d * 3.1; PL.pos.z = e.pos.z + dz / d * 3.1; }
}
const D_BOSS_HALF = EDEF.boss.hp / 2;
