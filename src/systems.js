/* ============ systems: items, quests, dialogue, NPCs, interactables, puzzles, UI ============ */
let MODE = 'menu';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- feedback ---------- */
function notify(text, cls) {
  const box = $('notes'), el = document.createElement('div'); el.className = 'note ' + (cls || ''); el.textContent = text; box.appendChild(el);
  while (box.children.length > 5) box.removeChild(box.firstChild);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 500); }, 3600);
}
let bannerT = 0;
function banner(title, sub) { $('bannerT').textContent = title; $('bannerS').textContent = sub || ''; $('banner').classList.add('show'); bannerT = 3.6; }
const _pv = new T.Vector3();
function dmgText(x, y, z, text, cls) {
  _pv.set(x, y, z).project(camera); if (_pv.z > 1) return;
  const el = document.createElement('div'); el.className = 'dmg ' + (cls || ''); el.textContent = text;
  el.style.left = ((_pv.x * 0.5 + 0.5) * 100 + rand(-1.5, 1.5)) + '%'; el.style.top = ((-_pv.y * 0.5 + 0.5) * 100) + '%';
  $('dmgLayer').appendChild(el); setTimeout(() => el.remove(), 800);
}
function flashHurt() { const h = $('hurt'); h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
function fade(cb) { const f = $('fade'); f.classList.add('on'); setTimeout(() => { cb(); setTimeout(() => f.classList.remove('on'), 120); }, 380); }

/* ---------- items & progression ---------- */
function giveItem(id, n = 1, quiet) { G.inv[id] = (G.inv[id] || 0) + n; if (!quiet) notify('+' + n + ' ' + ITEMS[id].n, 'gain'); if (id === 'herb') questEvent('herb'); }
function giveCoins(n) { G.p.coins += n; notify('+' + n + ' coins', 'gain'); }
function takeItem(id, n = 1) { G.inv[id] = Math.max(0, (G.inv[id] || 0) - n); if (!G.inv[id]) delete G.inv[id]; }
function gainXp(n) {
  const S = G.p; S.xp += n;
  while (S.xp >= xpNeed(S.level)) {
    S.xp -= xpNeed(S.level); S.level++; S.maxHp += 10; S.maxSt += 5; S.maxMp += 5; S.hp = S.maxHp; S.st = S.maxSt;
    banner('Level ' + S.level, 'Health, stamina and strength have grown'); sfx('quest');
  }
}
function useItem(id) {
  if (!has(id) || PL.dead) return false; const S = G.p;
  if (id === 'potion') { if (S.hp >= S.maxHp) { notify('You are already at full health.'); return false; } S.hp = Math.min(S.maxHp, S.hp + 50); }
  else if (id === 'berry') { if (S.hp >= S.maxHp) { notify('You are already at full health.'); return false; } S.hp = Math.min(S.maxHp, S.hp + 12); }
  else if (id === 'roast') { S.hp = Math.min(S.maxHp, S.hp + 35); S.st = S.maxSt; }
  else return false;
  takeItem(id); sfx('heal'); burst(PL.pos.x, PL.pos.y + 1.2, PL.pos.z, 0x8fe08a, 12, 2.5, 0.7, -2); return true;
}
function craft(i) {
  const r = RECIPES[i]; for (const k in r.need) if (!has(k, r.need[k])) { notify('You are missing materials.'); sfx('deny'); return; }
  for (const k in r.need) takeItem(k, r.need[k]); giveItem(r.out, r.n); sfx('pickup');
}
function setWeapon(w) { if (w === 'bow' && !G.p.hasBow) { notify('You do not have a bow yet.'); return; } if (G.p.weapon !== w) { G.p.weapon = w; PL.hold = -1; PL.draw = -1; sfx('step'); } }

/* ---------- quests ---------- */
const SHARD_CHESTS = ['c_camp', 'c_mesa', 'c_islet'];
const shardCount = () => SHARD_CHESTS.filter(c => G.flags[c]).length;
const trialCount = () => (G.flags.puz1 ? 1 : 0) + (G.flags.puz2 ? 1 : 0) + (G.flags.puz3 ? 1 : 0);
const QUESTS = {
  awaken: { name: 'A Voice in the Stone', kind: 'Main quest', desc: 'You woke beside an old shrine with no memory. Something there is calling to you.', reward: 'A direction',
    obj: () => [['Speak with the spirit at the Shrine of Awakening', false]], target: () => [0, 58.5] },
  road: { name: 'The Road to Oakrest', kind: 'Main quest', desc: 'Ilyra asked you to find Elder Maren in Oakrest, east along the dirt road.', reward: 'Ashwood bow, 15 arrows, 50 XP',
    obj: s => [['Follow the road east to Oakrest', s.stage >= 1], ['Speak with Elder Maren', false]], target: () => [NPCS.maren.pos.x, NPCS.maren.pos.z] },
  shards: { name: 'Shards of the Sunstone', kind: 'Main quest', desc: 'Three shards of the Sunstone were scattered across Greenwind Valley: one in the goblin camp south-west of the bridge, one on the high rock north of Oakrest, one on a drowned islet upriver.', reward: 'Temple Key, Ember Bolt, 100 XP',
    obj: () => [['Find the Sunstone Shards (' + shardCount() + '/3)', shardCount() >= 3], ['Return to Elder Maren', false]],
    target: () => { if (shardCount() >= 3) return [NPCS.maren.pos.x, NPCS.maren.pos.z]; const c = CHESTS[SHARD_CHESTS.find(k => !G.flags[k])]; return [c.x, c.z]; } },
  temple: { name: 'The Sealed Temple', kind: 'Main quest', desc: 'The Temple of Echoes stands west of the Old Stonebridge. Its guardian still keeps the Heart of the Forest.', reward: 'Heart of the Forest, 300 XP',
    obj: () => [['Unseal the temple gate beyond the Old Stonebridge', !!G.flags.g_entry], ['Solve the three trials (' + trialCount() + '/3)', trialCount() >= 3], ['Defeat the Ancient Forest Guardian', !!G.flags.boss], ['Take the Heart of the Forest', !!G.flags.c_boss], ['Return to Ilyra at the Shrine of Awakening', false]],
    target: () => !G.flags.g_entry ? [-75.5, -40] : !G.flags.puz1 ? [-90, -33] : !G.flags.puz2 ? [-106, -46] : !G.flags.puz3 ? [-121, -40] : !G.flags.c_boss ? [-145, -40] : [0, 58.5] },
  goblins: { name: 'Clubs and Anvils', kind: 'Side quest', desc: 'Borin the smith wants the thicket goblins thinned out before they steal another cartload of ore.', reward: 'Oakrest steel edge (+6 sword damage), 40 coins',
    obj: s => [['Defeat thicket goblins (' + Math.min(4, s.n) + '/4)', s.n >= 4], ['Return to Borin', false]], target: s => s.n >= 4 ? [NPCS.borin.pos.x, NPCS.borin.pos.z] : [-85, 70] },
  herbs: { name: 'Silver for a Fever', kind: 'Side quest', desc: 'Tessa’s stock of silverleaf is gone. The pale herb grows near old stones and in the western woods.', reward: '3 Healing Draughts, 30 coins',
    obj: () => [['Gather silverleaf (' + Math.min(4, G.inv.herb || 0) + '/4)', has('herb', 4)], ['Bring it to Tessa', false]], target: () => has('herb', 4) ? [NPCS.tessa.pos.x, NPCS.tessa.pos.z] : [-95, 20] },
};
const qState = id => (G.q[id] ? G.q[id].s : null);
function qStart(id) { if (G.q[id]) return; G.q[id] = { s: 'active', n: 0, stage: 0 }; notify('New quest: ' + QUESTS[id].name, 'quest'); sfx('questStart'); autosave(); }
function qDone(id) { if (!G.q[id] || G.q[id].s === 'done') return; G.q[id].s = 'done'; banner('Quest complete', QUESTS[id].name); sfx('quest'); autosave(); }
function questEvent(ev) {
  if (ev === 'goblin' && qState('goblins') === 'active') { const s = G.q.goblins; if (s.n < 4) { s.n++; notify('Goblins defeated: ' + s.n + '/4', 'quest'); } }
}
function trackedQuest() {
  for (const kind of ['Main quest', 'Side quest']) for (const id in QUESTS) if (QUESTS[id].kind === kind && qState(id) === 'active') return id;
  return null;
}
function currentObjective() {
  const id = trackedQuest(); if (!id) return null;
  const list = QUESTS[id].obj(G.q[id]), cur = list.find(o => !o[1]) || list[list.length - 1];
  return { id, name: QUESTS[id].name, text: cur[0], target: QUESTS[id].target(G.q[id]) };
}

/* ---------- dialogue ---------- */
let dlg = null;
function talk(who, pages, done) { dlg = { who, pages, i: 0, done }; setMode('dialog'); renderDlg(); }
function pickOpt(k) { if (!dlg) return; const pg = dlg.pages[dlg.i]; if (!pg.opts || !pg.opts[k]) return; const cur = dlg, fn = pg.opts[k][1]; sfx('ui'); if (fn) fn(); if (dlg === cur) advanceDlg(true); }
function advanceDlg(force) {
  if (!dlg) return; const pg = dlg.pages[dlg.i]; if (pg.opts && !force) return;
  dlg.i++; sfx('ui');
  if (dlg.i >= dlg.pages.length) { const d = dlg; dlg = null; setMode('play'); if (d.done) d.done(); } else renderDlg();
}

/* ---------- interactables ---------- */
const interactables = [];
function addInteract(o) { interactables.push(o); return o; }
let nearInteract = null;
function findInteract() {
  let best = null, bd = 1e9;
  for (const it of interactables) {
    const x = it.ref ? it.ref.x : it.x, z = it.ref ? it.ref.z : it.z, d = Math.hypot(PL.pos.x - x, PL.pos.z - z);
    if (d < (it.r || 2.6) && d < bd) { const l = it.label(); if (l) { best = it; bd = d; it._l = l; } }
  }
  nearInteract = best;
}

/* chests */
const CHESTS = {};
function chest(id, x, z, items, coins, rot = 0, hidden) {
  const y = Math.max(groundAt(x, z), WATER_Y + 0.3), g = new T.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  mesh(bx(1.2, 0.6, 0.8), lam(0x8a5a30), 0, 0.3, 0, g); mesh(bx(1.26, 0.1, 0.86), lam(GOLD), 0, 0.6, 0, g);
  const lid = new T.Group(); lid.position.set(0, 0.62, -0.4); g.add(lid);
  mesh(bx(1.2, 0.3, 0.8), lam(0x9a6a3c), 0, 0.15, 0.4, lid); mesh(bx(0.16, 0.2, 0.06), lam(GOLD), 0, 0.1, 0.82, lid);
  const col = addCircle(x, z, 0.75);
  mesh(bx(1.3, 0.12, 0.9), lam(0x5a3d28), 0, 0.06, 0, g); for (const sx of [-0.5, 0.5]) mesh(bx(0.1, 0.66, 0.84), lam(GOLD), sx, 0.33, 0, g); for (const sx of [-0.5, 0.5]) mesh(bx(0.1, 0.34, 0.84), lam(GOLD), sx, 0.15, 0.4, lid);
  const hl = halo(g, 0, 0.9, 0, 3.4, GOLD, 0.45);
  const c = CHESTS[id] = { id, g, lid, x, z, items, coins, col, hl };
  if (hidden) { g.visible = false; col.on = false; }
  addInteract({ x, z, r: 2.4, label: () => (!g.visible || G.flags[id]) ? null : 'Open chest', act: () => {
    G.flags[id] = true; c.open = 0.001; hl.visible = false; sfx('chest'); burst(x, y + 1, z, GOLD, 22, 3.5, 0.9, 1); addRing(x, y + 0.2, z, GOLD, 2.6, 0.6);
    for (const k in items) giveItem(k, items[k]); if (coins) giveCoins(coins);
    if (items.shard) { notify('Sunstone Shards: ' + shardCount() + '/3', 'quest'); }
    if (items.heart) { banner('Heart of the Forest', 'It beats in time with your own'); G.p.maxHp += 20; G.p.hp = G.p.maxHp; }
    gainXp(10); autosave();
  } });
  return c;
}
chest('c_camp', -85, 68, { shard: 1 }, 12, 0);
chest('c_mesa', MESA.x, MESA.z, { shard: 1, crystal: 1 }, 0, 0.6);
chest('c_islet', riverX(-80), -80, { shard: 1 }, 0, 1.2);
chest('c_ruin', -96, 22, { potion: 2 }, 20, 2.4);
chest('c_fall', -25, -167, { crystal: 3 }, 40, 0);
chest('c_vill', 59.5, 40.2, { arrow: 10 }, 0, 1.57);
chest('c_boss', -145, -40, { heart: 1 }, 100, Math.PI / 2, true);

/* gatherables */
const NODES = [];
function node(kind, x, z) {
  const y = groundAt(x, z), g = new T.Group(), id = 'n' + NODES.length; g.position.set(x, y, z); scene.add(g);
  let item, label, n = 1;
  if (kind === 'herb') { item = 'herb'; label = 'Gather silverleaf'; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; const l = mesh(new T.ConeGeometry(0.1, 0.55, 4), lam(0xcfe8d8), Math.cos(a) * 0.18, 0.3, Math.sin(a) * 0.18, g, true); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); } mesh(sph(0.08, 5, 4), glowMat(0xeafff6), 0, 0.62, 0, g, true); }
  else if (kind === 'berry') { item = 'berry'; label = 'Pick sunberries'; n = 2; mesh(new T.IcosahedronGeometry(0.6, 0), lam(0x3f8a3a), 0, 0.45, 0, g); for (let i = 0; i < 6; i++) mesh(sph(0.09, 5, 4), lam(0xffb02e, { emissive: 0x7a3a00 }), rand(-0.45, 0.45), rand(0.4, 0.9), rand(-0.45, 0.45), g, true); }
  else if (kind === 'wood') { item = 'wood'; label = 'Collect deadwood'; n = 2; for (let i = 0; i < 3; i++) { const l = mesh(cyl(0.12, 0.12, 1.3, 6), lam(0x8a6a44), 0, 0.14 + (i === 2 ? 0.2 : 0), (i - 0.5) * 0.26 * (i === 2 ? 0 : 1), g); l.rotation.z = Math.PI / 2; l.rotation.y = i * 0.2; } }
  else if (kind === 'stone') { item = 'stone'; label = 'Chip flint'; n = 2; mesh(new T.DodecahedronGeometry(0.5, 0), lam(0x4f565c), 0, 0.3, 0, g); mesh(new T.DodecahedronGeometry(0.28, 0), lam(0x3c4247), 0.45, 0.18, 0.2, g); }
  else { item = 'crystal'; label = 'Harvest echo crystal'; for (let i = 0; i < 4; i++) { const c = mesh(new T.ConeGeometry(0.16, 0.7 + i * 0.15, 5), glowMat(0x7ff3e0), (i - 1.5) * 0.2, 0.35, (i % 2) * 0.2, g, true); c.rotation.z = (i - 1.5) * 0.25; } halo(g, 0, 0.5, 0, 2.4, 0x7ff3e0, 0.4); }
  NODES.push({ id, g });
  addInteract({ x, z, r: 2.2, label: () => G.flags[id] ? null : label, act: () => { G.flags[id] = true; g.visible = false; giveItem(item, n); sfx('pickup'); burst(x, y + 0.5, z, 0xbfffd0, 6, 2, 0.5); } });
}
function scatter(kind, n, cx, cz, rad) {
  let placed = 0;
  for (let i = 0; i < n * 30 && placed < n; i++) {
    const a = rng() * 6.283, r = Math.sqrt(rng()) * rad, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (terrainH(x, z) < 0.3 || inTemple(x, z, 2) || insideBox(x, z, 1.2) || Math.hypot(x, z) > 175 || Math.abs(terrainH(x + 1, z) - terrainH(x, z)) > 0.8) continue;
    node(kind, x, z); placed++;
  }
}
scatter('herb', 5, -95, 20, 16); scatter('herb', 5, -110, 70, 40); scatter('herb', 3, 0, 60, 22); scatter('herb', 3, 60, -50, 30);
scatter('berry', 5, 40, 40, 45); scatter('berry', 3, 10, 110, 30);
scatter('wood', 5, -100, 50, 45); scatter('wood', 4, 30, 0, 50); scatter('wood', 2, 78, 20, 28);
scatter('stone', 4, MESA.x, MESA.z, 30); scatter('stone', 4, 0, 0, 90);
scatter('crystal', 3, -120, 80, 40); scatter('crystal', 2, -25, -145, 14);
node('crystal', -96, -52); node('crystal', -112.5, -28); node('crystal', -159, -53);

/* relics */
const RELICS = [[102, 39.5], [-140, 34], [-23, -168.5], [15, 140], [BRIDGE.x + 2, 15.5]].map(([x, z], i) => {
  const y = Math.max(groundAt(x, z), WATER_Y) + 1.1, id = 'r' + i;
  const m = mesh(cyl(0.3, 0.3, 0.06, 12), glowMat(GOLD), x, y, z, scene, true); m.rotation.x = Math.PI / 2; halo(m, 0, 0, 0, 2.6, GOLD, 0.6); mesh(new T.TorusGeometry(0.2, 0.03, 4, 14, 4.6), glowMat(0x8a6a1a), 0, 0.04, 0, m, true).rotation.x = Math.PI / 2;
  addInteract({ x, z, r: 2.4, label: () => G.flags[id] ? null : 'Take the Eldorian relic', act: () => { G.flags[id] = true; m.visible = false; giveItem('relic'); gainXp(25); sfx('quest'); burst(x, y, z, GOLD, 20, 3, 0.9, 1); const n = G.inv.relic; notify(n >= 5 ? 'All five relics found. Tessa will pay well for the set.' : 'Relics found: ' + n + '/5', 'quest'); autosave(); } });
  return { id, m, y };
});

/* inscriptions */
function tablet(id, x, z, rot, pages) {
  const y = groundAt(x, z), g = new T.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  mesh(bx(1.5, 1.9, 0.35), lam(STONE_D), 0, 0.95, 0, g).rotation.x = -0.12;
  for (let i = 0; i < 4; i++) mesh(bx(1.1 - (i % 2) * 0.3, 0.07, 0.04), glowMat(RUNE), 0, 1.5 - i * 0.28, 0.2 - (1.5 - i * 0.28) * 0.12 + 0.11, g, true);
  addCircle(x, z, 0.8);
  addInteract({ x, z, r: 2.8, label: () => 'Read the inscription', act: () => talk('Inscription', pages, () => { if (!G.flags[id]) { G.flags[id] = true; gainXp(10); } }) });
}
tablet('t_shrine', 6.5, 52, -0.7, ['HERE THE WARDENS KEPT VIGIL.', 'Speak softly. The stone remembers every voice it has heard, and it has been listening for a long time.']);
tablet('t_ruin', -92, 15.5, 0.4, ['In the ninth year of King Aldric’s grief, he commanded the Sunstone to give back what death had taken.', 'The Sunstone was made to guard the living. It did not know how to refuse a king.']);
tablet('t_mesa', MESA.x + 3.5, MESA.z - 3.5, -0.8, ['From this rock the hawk-riders watched four roads: to the Forgotten Forest, to the Frostfall peaks, to the Sunken halls, and to the place we do not name.']);
tablet('t_fall', -28.5, -166.5, 0.9, ['The queen’s lantern was carried here, behind the veil of water, so the king would not find it and remember.', 'Forgive us, Aldric. Forgetting was the only mercy left to give.']);
addInteract({ x: -106, z: -27.2, r: 3, label: () => 'Read the wall carving', act: () => talk('Wall carving', ['When the sun rose in the east, the leaf turned to face it, and the moon kept watch from the west.', 'The star is a liar. It belongs to no one.']) });
addInteract({ x: -121, z: -52.6, r: 3, label: () => 'Read the wall carving', act: () => talk('Wall carving', ['Flame wakes the twin lamps.', 'The sleeper’s eye, high above the last door, opens only to the hunter’s shaft.']) });

/* waystones */
for (const L of LOCS) if (L.way) addInteract({ x: L.way[0], z: L.way[1], r: 2.8, label: () => 'Touch the waystone', act: () => { G.p.respawn = L.id; G.disc[L.id] = true; G.p.hp = G.p.maxHp; G.p.mp = G.p.maxMp; sfx('heal'); notify('The waystone restores you. Open the map to travel between waystones.'); writeSave(); openPanel('map'); } });

/* temple mechanisms */
addInteract({ x: -76.4, z: -40, r: 3.2, label: () => G.flags.g_entry ? null : (has('key') ? 'Unseal the temple gate' : 'The gate is sealed by sunlight'), act: () => {
  if (!has('key')) { notify('The gate will not move. Elder Maren may know how to open it.'); sfx('deny'); return; }
  takeItem('key'); G.flags.g_entry = true; sfx('gate'); banner('The seal breaks', 'The Temple of Echoes is open'); autosave();
} });
addInteract({ x: -80.9, z: -28, r: 2.4, label: () => G.flags.puz1 ? null : 'Touch the rune (returns the stone block)', act: () => { setBlock(temple.blockHome[0], temple.blockHome[1]); sfx('gate'); } });
temple.pillars.forEach(pl => addInteract({ x: pl.x, z: pl.z, r: 2.6, label: () => G.flags.puz2 ? null : 'Turn the pillar (' + SYMBOLS[pilState(pl.i)] + ')', act: () => {
  G.flags['pil' + pl.i] = (pilState(pl.i) + 1) % 4; sfx('stone'); pl.spin = 1;
  if (pilState(0) === 0 && pilState(1) === 3 && pilState(2) === 1) solvePuzzle('puz2', 'The watchers agree');
} }));
const PIL_INIT = [2, 1, 3];
function pilState(i) { const v = G.flags['pil' + i]; return typeof v === 'number' ? v : PIL_INIT[i]; }
function solvePuzzle(flag, text) { if (G.flags[flag]) return; G.flags[flag] = true; sfx('quest'); sfx('gate'); banner('Trial complete', text); gainXp(40); autosave(); }
function puzzle3Check() {
  temple.braziers.forEach((b, i) => { if (b.lit) G.flags['br' + i] = true; }); if (temple.eye.lit) G.flags.eye = true; sfx('fire');
  if (temple.braziers.every(b => b.lit) && temple.eye.lit) solvePuzzle('puz3', 'Flame and arrow');
}
function updateTemple(dt, instant) {
  const b = temple.blockBox, bcx = (b.x0 + b.x1) / 2, bcz = (b.z0 + b.z1) / 2;
  const onPlate = Math.hypot(bcx + 90, bcz + 33) < 1.3, pressed = onPlate || (Math.hypot(PL.pos.x + 90, PL.pos.z + 33) < 1.25 && PL.grounded);
  if (onPlate && !G.flags.puz1) solvePuzzle('puz1', 'The weight of stone');
  temple.plateGlow.material = glowMat(pressed || G.flags.puz1 ? RUNE : 0x2c5a55); temple.plate.position.y = pressed ? 3.04 : 3.09;
  gates.entry.open = !!G.flags.g_entry; gates.g1.open = !!G.flags.puz1 || pressed; gates.g2.open = !!G.flags.puz2; gates.g3.open = !!G.flags.puz3 && !bossFight;
  for (const k in gates) { const g = gates[k], ty = g.open ? -0.8 : 6.5; g.mesh.position.y = instant ? ty : lerp(g.mesh.position.y, ty, 1 - Math.exp(-3 * dt)); g.box.on = g.mesh.position.y > 1.2; }
  for (const pl of temple.pillars) { pl.sp.material.map = SYM_TEX[pilState(pl.i)]; if (pl.spin > 0) { pl.spin -= dt * 2.5; pl.g.rotation.y = (1 - Math.max(0, pl.spin)) * Math.PI / 2; } pl.sp.material.opacity = G.flags.puz2 ? 1 : 0.85; }
  temple.eye.hl.visible = temple.eye.lit; for (const k in gates) gates[k].hl.material.opacity = gates[k].open ? 0.06 : 0.26 + Math.sin(performance.now() * 0.002) * 0.06;
  for (const br of temple.braziers) { br.fl.visible = br.hl.visible = br.lit; if (br.lit) br.fl.scale.y = 1 + Math.sin(performance.now() * 0.012 + br.z) * 0.15; }
  temple.eye.m.material.color.setHex(temple.eye.lit ? 0x9ffcff : 0x2f5560);
}

/* ---------- NPCs ---------- */
const NPCS = {};
function npc(id, name, look, x, z, route, talkFn) {
  const h = humanoid(look), n = NPCS[id] = { id, name, g: h.g, p: h.p, pos: new T.Vector3(x, groundAt(x, z), z), home: [x, z], route, ri: 0, wait: rng() * 3, yaw: 0, anim: rng() * 4, talk: talkFn };
  scene.add(h.g); h.g.position.copy(n.pos);
  setTimeout(() => addOutline(h.g, 0.013), 0);
  if (look.prop === 'staff') { const s = grpIn(h.p.handR, 0, 0, 0.03); mesh(cyl(0.03, 0.035, 1.9, 6), lam(TIMBER), 0, 0.35, 0, s); mesh(new T.TorusGeometry(0.11, 0.03, 5, 12, 5), lam(TIMBER), 0, 1.36, 0, s); mesh(sph(0.06, 8, 6), glowMat(RUNE), 0, 1.36, 0, s, true); halo(s, 0, 1.36, 0, 1.2, RUNE, 0.6); n.hold = [-0.5, -0.9]; }
  else if (look.prop === 'hammer') { const s = grpIn(h.p.handR, 0, 0, 0.03); mesh(cyl(0.03, 0.03, 0.6, 6), lam(TIMBER), 0, 0, 0.25, s).rotation.x = Math.PI / 2; mesh(bx(0.3, 0.16, 0.16), lam(0x4a4f57), 0, 0, 0.55, s); }
  else if (look.prop === 'spear') { const s = grpIn(h.p.handR, 0, 0, 0.03); mesh(cyl(0.028, 0.028, 2.6, 6), lam(TIMBER), 0, 0.6, 0, s); mesh(new T.ConeGeometry(0.07, 0.34, 4), lam(0xcfd6da), 0, 2.05, 0, s); mesh(bx(0.04, 0.3, 0.3), lam(0xc8452f), 0, 1.7, 0.14, s); n.hold = [-0.45, -1.0]; }
  else if (look.prop === 'scroll') { const s = grpIn(h.p.handL, 0, 0, 0.05); mesh(cyl(0.05, 0.05, 0.42, 8), lam(0xf2ead8), 0, 0, 0, s).rotation.z = Math.PI / 2; n.holdL = [-0.9, -1.2]; }
  addInteract({ ref: n.pos, r: 2.9, label: () => 'Talk to ' + name, act: () => { n.yaw = Math.atan2(PL.pos.x - n.pos.x, PL.pos.z - n.pos.z); n.g.rotation.y = n.yaw; talkFn(n); } });
  return n;
}
function updateNPCs(dt) {
  const night = G.time > 0.8 || G.time < 0.22;
  for (const id in NPCS) {
    const n = NPCS[id]; n.anim += dt; let moving = false;
    const dp = Math.hypot(PL.pos.x - n.pos.x, PL.pos.z - n.pos.z); if (dp > 110) continue;
    if (dp < 3.2) n.yaw = angLerp(n.yaw, Math.atan2(PL.pos.x - n.pos.x, PL.pos.z - n.pos.z), 6 * dt);
    else if (n.route) {
      const tgt = night ? n.home : n.route[n.ri], dx = tgt[0] - n.pos.x, dz = tgt[1] - n.pos.z, d = Math.hypot(dx, dz);
      if (d > 0.4) { if (n.wait > 0) n.wait -= dt; else { const sp = n.speed || 1.6; n.pos.x += dx / d * sp * dt; n.pos.z += dz / d * sp * dt; n.yaw = angLerp(n.yaw, Math.atan2(dx, dz), 8 * dt); resolveCollide(n.pos, 0.4); moving = true; } }
      else if (!night) { n.ri = (n.ri + 1) % n.route.length; n.wait = n.pause != null ? n.pause : 2 + Math.random() * 4; }
    }
    n.pos.y = groundAt(n.pos.x, n.pos.z); n.g.position.copy(n.pos); n.g.rotation.y = n.yaw;
    animHumanoid(n.p, moving ? ((n.speed || 0) > 3 ? 'run' : 'walk') : 'idle', n.anim, dt);
    if (n.hold) { n.p.armR.rotation.x = n.hold[0]; n.p.elbowR.rotation.x = n.hold[1]; } if (n.holdL) { n.p.armL.rotation.x = n.holdL[0]; n.p.elbowL.rotation.x = n.holdL[1]; }
    if (id === 'borin' && !moving && dp > 3.2 && !night) { const hsw = Math.max(0, Math.sin(n.anim * 4.2)); n.p.armR.rotation.x = -2.2 + hsw * 1.5; n.p.elbowR.rotation.x = -0.9 + hsw * 0.6; if (hsw > 0.97 && !n.clink) { n.clink = true; if (dp < 30) { burst(n.pos.x + Math.sin(n.yaw) * 0.8, n.pos.y + 1, n.pos.z + Math.cos(n.yaw) * 0.8, 0xffc04a, 5, 3, 0.3); if (MODE === 'play') sfx('clink'); } } else if (hsw < 0.5) n.clink = false; }
  }
  // the spirit
  const t = performance.now() * 0.001; spirit.position.y = groundAt(0, 58.5) + 2.2 + Math.sin(t * 1.4) * 0.2;
  for (const c of spirit.children) if (c.userData.ring) { c.rotation.x += dt * 0.5 * c.userData.ring; c.rotation.y += dt * 0.7; }
}
addInteract({ x: 0, z: 58.5, r: 3.4, label: () => 'Speak with the spirit', act: talkSpirit });
function talkSpirit() {
  if (qState('awaken') !== 'done') {
    if (!G.q.awaken) G.q.awaken = { s: 'active', n: 0, stage: 0 };
    talk('Ilyra', ['…You wake. After so long, you wake.',
      'I am Ilyra. What remains of a voice that once sang over Eldoria. You do not remember this place, and for now that is a mercy.',
      'Three hundred years ago the Sunstone broke, and a kingdom went silent in a single night. Its temples sealed themselves. Its guardians lay down and slept.',
      'Now something stirs under the old roots. Take the blade at your side and follow the road east to Oakrest. Find Elder Maren. Tell her the shrine is singing again.',
      { t: 'Will you go?', opts: [['Who am I?', () => talk('Ilyra', ['A question the stone will answer when you are ready to hear it. Go east, Warden.'], startRoad)], ['I’ll find her.', startRoad]] }]);
  } else if (qState('temple') === 'active' && G.flags.c_boss) {
    talk('Ilyra', ['The Guardian sleeps truly now, and the Heart beats in your hand. Do you feel it? It knows you.',
      'You asked me who you are. You stood in the throne hall the night the Sunstone broke. It was your hand that broke it.',
      'You did it to stop a king who would not let his kingdom grieve, and so it has never quite died and never quite lived.',
      'He waits still, past the Frostfall peaks and the drowned halls, in the Shadowed Lands. The Fallen King. Aldric. Your father.',
      'That road is for another day. Rest, Warden. Greenwind Valley is yours to wander.'],
      () => { qDone('temple'); gainXp(300); G.flags.ended = true; autosave(); setMode('end'); });
  } else if (G.flags.ended) talk('Ilyra', ['The mountains to the north are waking too. When you are ready, the Frostfall road will open.', 'Until then, walk the valley. Five seals of Eldoria are still hidden in it.']);
  else talk('Ilyra', [{ t: 'The stone is listening. What would you ask?', opts: [
    ['Where should I go?', () => { const o = currentObjective(); talk('Ilyra', [o ? o.text + '.' : 'Wherever the valley calls you.']); }],
    ['Tell me about Eldoria.', () => talk('Ilyra', ['It was a kingdom of four roads and one light. The light was the Sunstone, and the Wardens kept it.', 'You wore their red once. You still do.'])],
    ['Nothing for now.', null]] }]);
}
function startRoad() { if (qState('awaken') !== 'done') { G.q.awaken.s = 'done'; qStart('road'); notify('Hold the left mouse button to charge a heavy strike. Press F to dodge.'); } }

npc('maren', 'Elder Maren', { skin: 0xd9a680, top: 0x6a4c8a, bottom: 0x4a3a5a, hair: 0xe4e0da, style: 'bun', robe: 0x6a4c8a, belt: 0xc79a3a, prop: 'staff' }, 78, 38.6, null, () => {
  if (qState('awaken') !== 'done') return talk('Elder Maren', ['You have the look of someone the shrine has not finished with. Go back west and listen to it.']);
  if (qState('road') === 'active') return talk('Elder Maren', ['The shrine is singing? Then my grandmother’s stories were more than stories.',
    'And you carry a Warden’s blade. I will not ask where you found it. I think it found you.',
    'Take this. It was my daughter’s bow, and it has hung on a wall too long.',
    'The Temple of Echoes, west of the river, is sealed by the Sunstone’s own light. Three shards of it lie scattered in this valley. Bring them to me and I can open the way.',
    'One the goblins carried to their camp, south-west past the Old Stonebridge. One lies on Hawk’s Rest, the high rock north of here; you will have to climb. One sank with a drowned islet upriver, north of the bridge.'],
    () => { qDone('road'); G.p.hasBow = true; giveItem('arrow', 15); gainXp(50); notify('You received the Ashwood Bow. Press 2 to ready it, hold the left mouse button to draw.', 'quest'); qStart('shards'); });
  if (qState('shards') === 'active') {
    if (shardCount() >= 3 && has('shard', 3)) return talk('Elder Maren', ['All three. They are warm, even now.',
      'Hold out your hand. The shards remember fire, and now so will you.',
      'I have bound them into a key. The temple’s guardian was made to test Wardens, not to welcome them. Watch how it moves before you strike.'],
      () => { takeItem('shard', 3); giveItem('key'); G.p.ember = true; qDone('shards'); gainXp(100); notify('You learned Ember Bolt. Press Q to cast it.', 'quest'); qStart('temple'); });
    return talk('Elder Maren', [{ t: 'You have ' + shardCount() + ' of three shards. Which one troubles you?', opts: [
      ['The goblin camp', () => talk('Elder Maren', ['Cross the Old Stonebridge west of the shrine, then turn south into the trees. Goblins fight badly alone and well together. Crouch with C and they notice you later.'])],
      ['Hawk’s Rest', () => talk('Elder Maren', ['Follow the road north out of the village. Walk straight at the rock face and you will climb. Mind your stamina; rest on the way if you must.'])],
      ['The drowned islet', () => talk('Elder Maren', ['Follow the river north from the bridge. You will have to swim to it. Do not linger in deep water once your breath runs short.'])],
      ['Never mind.', null]] }]);
  }
  if (qState('temple') === 'active') return talk('Elder Maren', ['The temple is west, across the bridge and up the old road. Three trials, my grandmother said: stone, memory, and flame.', 'Read what the builders carved on the walls. They wanted Wardens to pass.']);
  talk('Elder Maren', ['Oakrest will remember what you did, Warden. Even if you do not remember what came before.']);
});
npc('borin', 'Borin', { skin: 0xb07850, top: 0x8a3a2e, bottom: 0x3a3028, hair: 0x2a2220, beard: 0x2a2220, apron: 0x5a4630, bare: true, s: 1.1, prop: 'hammer' }, 88, 25.2, [[88, 25.2], [90.6, 25.7]], () => {
  const up = () => {
    const cost = 30 + G.p.swordLv * 20;
    if (G.p.swordLv >= 3) return talk('Borin', ['That edge is as fine as I can make it. Any sharper and it would cut the scabbard.']);
    talk('Borin', [{ t: 'I can fold echo crystal into that blade. Two crystals and ' + cost + ' coins.', opts: [
      ['Do it.', () => { if (!has('crystal', 2) || G.p.coins < cost) return talk('Borin', ['Come back with two echo crystals and the coin. The temple walls are full of them.']); takeItem('crystal', 2); G.p.coins -= cost; G.p.swordLv++; sfx('anvil'); notify('Sword improved. Damage is now ' + swordDmg() + '.', 'gain'); autosave(); }],
      ['Not now.', null]] }]);
  };
  if (!G.q.goblins) return talk('Borin', ['New face. Good arms on you.', 'Thicket goblins took a cartload of my ore last week. Put four of them down and I’ll put a proper steel edge on that old blade of yours.',
    { t: 'What do you say?', opts: [['I’ll deal with them.', () => qStart('goblins')], ['Maybe later.', null]] }]);
  if (qState('goblins') === 'active') {
    if (G.q.goblins.n >= 4) return talk('Borin', ['Four fewer goblins. I heard the squealing from here.', 'Hand me the sword. This won’t take long.'], () => { qDone('goblins'); G.p.swordLv++; giveCoins(40); gainXp(60); sfx('anvil'); notify('Sword improved. Damage is now ' + swordDmg() + '.', 'gain'); });
    return talk('Borin', ['They camp past the bridge, south-west in the trees. ' + G.q.goblins.n + ' down so far.']);
  }
  up();
});
npc('tessa', 'Tessa', { skin: 0xe0b08a, top: 0x3f7a6a, bottom: 0x5a4630, hair: 0x8a4a20, style: 'long', hat: 'straw', apron: 0xf2ead8, skirt: 0x8a3a2e }, 69, 24.4, null, () => {
  const opts = [['Show me your goods.', () => openPanel('shop')]];
  if (!G.q.herbs) opts.push(['You look worried.', () => talk('Tessa', ['Pip has a fever and I am out of silverleaf. It grows near old stones, mostly west of the river.', 'Bring me four and I’ll brew three draughts for you from my own stock.'], () => qStart('herbs'))]);
  else if (qState('herbs') === 'active') opts.push(['About the silverleaf…', () => { if (has('herb', 4)) talk('Tessa', ['Four good stems. Thank you. Truly.'], () => { takeItem('herb', 4); qDone('herbs'); giveItem('potion', 3); giveCoins(30); gainXp(50); }); else talk('Tessa', ['Four stems is what the brew needs. You have ' + (G.inv.herb || 0) + '. Try the Mossfall ruins past the bridge.']); }]);
  if (has('relic', 5) && !G.flags.relicSold) opts.push(['I found five Eldorian relics.', () => talk('Tessa', ['A full set of royal seals? I know a collector who will weep. Here, 150 coins, and keep them. They suit you better.'], () => { G.flags.relicSold = true; giveCoins(150); gainXp(80); })]);
  opts.push(['Goodbye.', null]);
  talk('Tessa', [{ t: 'Potions, arrows, hot food. If it keeps a traveller alive, I sell it.', opts }]);
});
npc('halric', 'Halric', { skin: 0xc98f6a, top: 0x6a7480, bottom: 0x2a3a50, hair: 0x4a3a2a, hat: 'helm', tabard: 0x2f6f7a, belt: 0x5a3d28, s: 1.06, prop: 'spear' }, 50, 20, [[50, 17], [50, 23]], () => {
  talk('Halric', [{ t: 'Gate’s quiet. I like it quiet. Ask your questions.', opts: [
    ['What lies beyond the valley?', () => talk('Halric', ['North, the Frostfall Mountains. There’s a titan of ice up there if the shepherds aren’t lying.', 'East, the Sunken Kingdom. Castles under a lake. And past it all, the Shadowed Lands. Nobody draws maps of those.', 'The passes are snowed shut for now. Maybe that is for the best.'])],
    ['Any advice for a traveller?', () => talk('Halric', ['Raise your shield with the right mouse button and face what’s hitting you. Roll with F when the big ones wind up.', 'Boars leave you alone if you leave them alone. Roast one with deadwood and it’ll put you back on your feet.'])],
    ['Stay safe.', null]] }]);
});
{ const pip = npc('pip', 'Pip', { skin: 0xe0b08a, top: 0xe8c36a, bottom: 0x5a7a4a, hair: 0x8a4a20, hat: 'cap', hatC: 0xc8452f, headScale: 1.2, s: 0.66 }, 80, 16, [[82, 17], [81, 23.5], [75, 23], [74.5, 16.5]], n => {
  const lines = ['I saw something shiny under the old bridge! But I can’t swim yet.', 'There’s a cave behind the big waterfall up north. Halric says I made it up. I didn’t.', 'Someone left a chest behind our house. I’m not allowed to open it.', 'The stranger by the bridge draws maps of places that aren’t there anymore.'];
  n.li = ((n.li || 0) + 1) % lines.length; talk('Pip', [lines[n.li]]);
}); pip.speed = 3.4; pip.pause = 0.6; }
npc('carto', 'The Cartographer', { skin: 0x9a7a6a, top: 0x2f3b45, bottom: 0x22292f, hat: 'hood', robe: 0x2f3b45, belt: 0xc79a3a, prop: 'scroll' }, -12, 15, null, () => {
  talk('The Cartographer', ['A Warden’s scarf. I thought the last of those burned with the throne hall.',
    { t: 'I chart what the kingdom was. What would you have of me?', opts: [
      ['Mark something on my map.', () => { if (G.disc.falls) return talk('The Cartographer', ['I have nothing more to mark. The rest you must walk.']); G.disc.falls = true; talk('The Cartographer', ['Follow the river north until it roars. That is Veilfall. Walk through the water, not around it.', 'The queen’s people hid things there. I have marked it for you.']); }],
      ['Who are you?', () => talk('The Cartographer', ['Someone who was also there that night, and who chose to remember.', 'We will meet again on the Frostfall road. Bring a warmer cloak.'])],
      ['Nothing.', null]] }]);
});

/* ---------- world events ---------- */
let discT = 0;
function updateDiscovery(dt) {
  discT -= dt; if (discT > 0) return; discT = 0.5;
  for (const L of LOCS) {
    if (Math.hypot(PL.pos.x - L.x, PL.pos.z - L.z) < L.r) {
      if (!G.flags['seen_' + L.id]) { G.flags['seen_' + L.id] = true; G.disc[L.id] = true; banner(L.name, 'Location discovered'); gainXp(20); sfx('discover'); if (L.way) G.p.respawn = L.id; if (L.id === 'village' && qState('road') === 'active') G.q.road.stage = 1; autosave(); }
    }
  }
}
function regionName() {
  for (const L of LOCS) if (Math.hypot(PL.pos.x - L.x, PL.pos.z - L.z) < L.r) return L.name;
  if (inTemple(PL.pos.x, PL.pos.z)) return 'Temple of Echoes';
  return PL.pos.x < riverX(PL.pos.z) - 10 ? 'Edge of the Forgotten Forest' : 'Greenwind Valley';
}
function travelTo(id) {
  const L = LOCS.find(l => l.id === id); if (!L || !L.way || !G.disc[id]) return;
  if (bossFight) { notify('The waystones are silent while the Guardian is awake.'); return; }
  closePanel(); fade(() => { placePlayer(L.way[0] + 1.6, L.way[1] + 1.6); G.p.respawn = id; sfx('discover'); autosave(); });
}
function placePlayer(x, z) { PL.pos.set(x, groundAt(x, z), z); PL.vel.set(0, 0, 0); PL.grounded = true; PL.lock = null; PL.swim = false; CARRY.snap(); updateCamera(0.016, true); }
function playerDied() {
  if (PL.dead) return; PL.dead = true; PL.atk = null; PL.hold = -1; PL.draw = -1; sfx('die');
  setTimeout(() => { if (PL.dead) setMode('dead'); }, 900);
}
function respawn() {
  const L = LOCS.find(l => l.id === G.p.respawn) || LOCS[0];
  fade(() => { G.p.hp = G.p.maxHp; G.p.st = G.p.maxSt; G.p.mp = G.p.maxMp; PL.dead = false; PL.iframes = 2; bossReset(); for (const e of enemies) if (e.alive && !e.def.boss) { e.aggro = false; e.state = 'return'; } placePlayer(L.way[0] + 1.6, L.way[1] + 1.6); setMode('play'); });
}
function bossDefeated(e) {
  G.flags.boss = true; bossFight = false; clearHazards(); sfx('roar'); hitStop = 0.25;
  const c = CHESTS.c_boss, ex = e.pos.x, ez = e.pos.z, a0 = Math.atan2(PL.pos.z - ez, PL.pos.x - ex);
  timeScale = 0.3;
  startCine(4.4, (k, t) => { timeScale = t < 1.3 ? 0.3 : 1; const a = a0 + 0.5 + k * 1.1, r = lerp(10, 13, k); camera.position.set(ex + Math.cos(a) * r, 3 + lerp(5.5, 3.2, k), ez + Math.sin(a) * r); camera.lookAt(ex, 3 + lerp(4.5, 2, smooth(0.2, 0.9, k)), ez); },
    () => { banner('The Guardian falls', 'Its long vigil is over'); sfx('quest'); c.g.visible = true; c.col.on = true; burst(c.x, 4, c.z, GOLD, 50, 6, 1.4, 1); addRing(c.x, 3.2, c.z, GOLD, 6, 0.9); });
  autosave();
}
let lastSave = 0;
function autosave() { if (MODE === 'menu') return; syncSaveState(); if (writeSave()) { lastSave = performance.now(); const s = $('saveIcon'); s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 1400); } }
function syncSaveState() { const S = G.p; S.x = PL.pos.x; S.y = PL.pos.y; S.z = PL.pos.z; S.yaw = PL.yaw; if (PL.dead || bossFight) { const L = LOCS.find(l => l.id === S.respawn) || LOCS[0]; S.x = L.way[0] + 1.6; S.z = L.way[1] + 1.6; S.y = groundAt(S.x, S.z); if (S.hp <= 0) S.hp = S.maxHp; } }
/* bring every world object in line with G (after New Game / Continue) */
function syncWorld() {
  for (const id in CHESTS) { const c = CHESTS[id]; c.lid.rotation.x = G.flags[id] ? -1.9 : 0; c.open = 0; c.hl.visible = !G.flags[id]; if (id === 'c_boss') { c.g.visible = !!G.flags.boss; c.col.on = !!G.flags.boss; } }
  for (const n of NODES) n.g.visible = !G.flags[n.id];
  for (const r of RELICS) r.m.visible = !G.flags[r.id];
  const bl = Array.isArray(G.flags.blk) ? G.flags.blk : temple.blockHome; setBlock(bl[0], bl[1]);
  temple.braziers.forEach((b, i) => b.lit = !!G.flags['br' + i]); temple.eye.lit = !!G.flags.eye;
  for (const e of enemies) if (!e.def.boss) reviveEnemy(e);
  for (const d of drops) scene.remove(d.m); drops.length = 0; for (const pr of projs) killProj(pr);
  bossReset();
  const S = G.p; PL.pos.set(S.x, S.y, S.z); PL.yaw = S.yaw; PL.vel.set(0, 0, 0); PL.grounded = false; PL.dead = false; PL.atk = null; PL.hold = -1; PL.draw = -1; PL.lock = null; PL.rollT = 0; PL.crouch = false; PL.iframes = 1;
  PL.pos.y = Math.max(S.y, groundAt(S.x, S.z)); CAM.yaw = S.yaw + Math.PI; CAM.pitch = 0.3;
  updateTemple(0.016, true); updateCamera(0.016, true);
}

/* ---------- panels ---------- */
let panelTab = null, shopOpen = false;
function openPanel(tab) { if (MODE !== 'play' && MODE !== 'panel' && MODE !== 'dialog') return; if (MODE === 'dialog') { dlg = null; } shopOpen = tab === 'shop'; panelTab = tab; setMode('panel'); renderPanel(); sfx('ui'); }
function closePanel() { if (MODE === 'panel') { panelTab = null; shopOpen = false; setMode('play'); } }
$('panel').addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b) return; const [a, v] = b.dataset.act.split(':'), S = G.p;
  if (a === 'close') return closePanel();
  if (a === 'tab') { panelTab = v; sfx('ui'); }
  else if (a === 'use') useItem(v);
  else if (a === 'craft') craft(+v);
  else if (a === 'eq') setWeapon(v);
  else if (a === 'travel') return travelTo(v);
  else if (a === 'buy') { const s = SHOP[+v]; if (S.coins < s.price) return; S.coins -= s.price; if (s.id === 'armor') { S.armor = 3; notify('You put on the Leather Jerkin.', 'gain'); } else giveItem(s.id, s.n || 1); sfx('coin'); }
  else if (a === 'sell') { if (!has(v)) return; takeItem(v); S.coins += SELL[v]; sfx('coin'); }
  renderPanel();
});
/* ---------- floating health bars over wounded foes ---------- */
const ebarPool = [];
function updateEnemyBars() {
  let n = 0; const layer = $('ebars'), W = window.innerWidth || 1280, H = window.innerHeight || 720;
  if (MODE === 'play' && !cine) for (const e of enemies) {
    if (!e.alive || e.def.boss || e.hp >= e.def.hp || !(e.hurtShown > 0 || e.state === 'chase' || e.state === 'windup')) continue;
    _pv.set(e.pos.x, e.pos.y + e.def.height + 0.35, e.pos.z).project(camera); if (_pv.z > 1 || Math.abs(_pv.x) > 1.05 || Math.abs(_pv.y) > 1.05) continue;
    let el = ebarPool[n]; if (!el) { el = ebarPool[n] = document.createElement('div'); el.className = 'ebar'; el.innerHTML = '<i></i>'; layer.appendChild(el); }
    el.style.display = 'block'; el.style.transform = 'translate(' + ((_pv.x * 0.5 + 0.5) * W - 30).toFixed(1) + 'px,' + ((-_pv.y * 0.5 + 0.5) * H).toFixed(1) + 'px)'; el.firstChild.style.width = (e.hp / e.def.hp * 100) + '%'; n++;
  }
  for (let i = n; i < ebarPool.length; i++) ebarPool[i].style.display = 'none';
}
