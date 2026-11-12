/* ============ main: audio, input, menus, loop ============ */
/* ---------- audio (all synthesized with the Web Audio API) ---------- */
const AU: AudioState = { ctx: null, beat: 0, step: 0, bar: 0 };
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = AU.ctx = new C();
    AU.master = c.createGain(); AU.master.connect(c.destination);
    AU.mus = c.createGain(); AU.mus.connect(AU.master); AU.sfx = c.createGain(); AU.sfx.connect(AU.master);
    const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; AU.noise = b;
    AU.wind = loopNoise(380, 0.5, 'lowpass'); AU.water = loopNoise(1400, 0.7, 'bandpass'); AU.rain = loopNoise(5200, 0.4, 'highpass');
    applyVolume();
  } catch (e) { AU.ctx = null; }
}
function loopNoise(freq: number, q: number, type: BiquadFilterType) { const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(AU.sfx); s.start(); return g; }
function applyVolume() { if (!AU.ctx) return; AU.master.gain.value = SETTINGS.master; AU.mus.gain.value = SETTINGS.music; AU.sfx.gain.value = SETTINGS.sfx; }
function tone(f: number, dur: number, type: OscillatorType, vol: number, dest?: GainNode, delay?: number, slide?: number) {
  if (!AU.ctx) return; const c = AU.ctx, t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || AU.sfx); o.start(t); o.stop(t + dur + 0.05);
}
function nz(dur: number, vol: number, freq: number, type?: BiquadFilterType, delay?: number, slide?: number) {
  if (!AU.ctx) return; const c = AU.ctx, t = c.currentTime + (delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t); if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(AU.sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
function sfx(n: string) {
  if (!AU.ctx) return;
  switch (n) {
    case 'swing': nz(0.16, 0.25, 900, 'bandpass', 0, 2600); break;
    case 'swingBig': nz(0.26, 0.32, 500, 'bandpass', 0, 2200); tone(140, 0.2, 'sine', 0.08, null, 0, 60); break;
    case 'hitBig': nz(0.16, 0.55, 380, 'lowpass'); tone(120, 0.2, 'square', 0.16, null, 0, 45); tone(900, 0.08, 'triangle', 0.1); break;
    case 'thunder': nz(2.2, 0.5, 160, 'lowpass', 0, 60); nz(0.5, 0.3, 900, 'lowpass'); break;
    case 'grunt': tone(170, 0.16, 'sawtooth', 0.07, null, 0, 110); break;
    case 'stomp': nz(0.22, 0.4, 110, 'lowpass'); tone(52, 0.25, 'sine', 0.25, null, 0, 34); break;
    case 'rumble': nz(3, 0.4, 90, 'lowpass'); tone(44, 3, 'sine', 0.25, null, 0, 60); break;
    case 'wade': nz(0.16, 0.12, 1300, 'bandpass', 0, 600); break;
    case 'stepStone': nz(0.04, 0.09, 700 + Math.random() * 300, 'bandpass'); break;
    case 'clink': tone(2100, 0.16, 'triangle', 0.07); tone(3150, 0.1, 'sine', 0.04); break;
    case 'type': tone(520 + Math.random() * 80, 0.03, 'triangle', 0.02); break;
    case 'bird': { const f = 2200 + Math.random() * 1400, n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) tone(f * (1 + (i % 2) * 0.12), 0.09, 'sine', 0.018, null, i * 0.13, f * 1.25); break; }
    case 'cricket': for (let i = 0; i < 4; i++) tone(4300, 0.035, 'sine', 0.012, null, i * 0.07); break;
    case 'hit': nz(0.1, 0.4, 500, 'lowpass'); tone(170, 0.12, 'square', 0.12, null, 0, 70); break;
    case 'block': tone(520, 0.12, 'triangle', 0.25, null, 0, 300); nz(0.08, 0.3, 2400); break;
    case 'hurt': tone(220, 0.22, 'sawtooth', 0.16, null, 0, 90); break;
    case 'bow': tone(300, 0.14, 'triangle', 0.2, null, 0, 120); nz(0.12, 0.15, 3000, 'highpass'); break;
    case 'fire': nz(0.4, 0.3, 500, 'bandpass', 0, 1800); tone(180, 0.3, 'sawtooth', 0.08, null, 0, 420); break;
    case 'roll': nz(0.22, 0.2, 400, 'lowpass'); break;
    case 'step': nz(0.05, 0.07, 300 + Math.random() * 200, 'lowpass'); break;
    case 'jump': tone(260, 0.12, 'sine', 0.1, null, 0, 420); break;
    case 'land': nz(0.1, 0.18, 220, 'lowpass'); break;
    case 'splash': nz(0.5, 0.35, 1500, 'bandpass', 0, 500); break;
    case 'pickup': tone(660, 0.1, 'triangle', 0.16); tone(990, 0.16, 'triangle', 0.14, null, 0.07); break;
    case 'coin': tone(1200, 0.07, 'square', 0.07); tone(1600, 0.12, 'square', 0.06, null, 0.06); break;
    case 'chest': tone(392, 0.16, 'triangle', 0.18); tone(523, 0.16, 'triangle', 0.18, null, 0.12); tone(659, 0.16, 'triangle', 0.18, null, 0.24); tone(784, 0.4, 'triangle', 0.2, null, 0.36); break;
    case 'quest': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.5, 'triangle', 0.16, null, i * 0.11)); break;
    case 'questStart': tone(440, 0.3, 'triangle', 0.14); tone(587, 0.5, 'triangle', 0.14, null, 0.16); break;
    case 'discover': [294, 440, 587, 740].forEach((f, i) => tone(f, 1.2, 'sine', 0.12, null, i * 0.16)); break;
    case 'heal': tone(523, 0.3, 'sine', 0.14, null, 0, 784); break;
    case 'deny': tone(140, 0.14, 'square', 0.08); break;
    case 'ui': tone(700, 0.05, 'triangle', 0.08); break;
    case 'alert': tone(480, 0.1, 'square', 0.06, null, 0, 640); break;
    case 'die': tone(200, 0.4, 'sawtooth', 0.12, null, 0, 50); nz(0.3, 0.2, 300, 'lowpass'); break;
    case 'spit': tone(600, 0.2, 'sine', 0.1, null, 0, 200); break;
    case 'slam': nz(0.5, 0.6, 140, 'lowpass'); tone(60, 0.5, 'sine', 0.4, null, 0, 30); break;
    case 'charge': tone(200, 0.5, 'sine', 0.08, null, 0, 600); break;
    case 'roar': tone(90, 1.3, 'sawtooth', 0.25, null, 0, 45); nz(1.2, 0.3, 300, 'lowpass'); break;
    case 'gate': nz(1.2, 0.3, 120, 'lowpass'); tone(70, 1.1, 'sine', 0.2); break;
    case 'stone': nz(0.35, 0.25, 250, 'lowpass'); break;
    case 'anvil': tone(1800, 0.25, 'triangle', 0.15); tone(2700, 0.2, 'sine', 0.08); tone(1800, 0.25, 'triangle', 0.15, null, 0.3); break;
  }
}
const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99], BOSS_SCALE = [110, 130.81, 146.83, 164.81, 196, 220];
function updateAudio(dt: number) {
  if (!AU.ctx || AU.ctx.state !== 'running') return;
  const t = AU.ctx.currentTime, dr = Math.abs(PL.pos.x - riverX(PL.pos.z)), dfall = Math.hypot(PL.pos.x + 25, PL.pos.z + 158);
  AU.wind.gain.setTargetAtTime(MODE === 'menu' ? 0.05 : 0.035 + clamp(PL.pos.y / 60, 0, 0.1) + rainAmt * 0.05, t, 0.5);
  AU.water.gain.setTargetAtTime(clamp(1 - dr / 26, 0, 1) * 0.05 + clamp(1 - dfall / 70, 0, 1) * 0.22, t, 0.4);
  AU.rain.gain.setTargetAtTime(rainAmt * 0.07, t, 0.5);
  if (MODE === 'pause' || MODE === 'settings') return;
  AU.amb = (AU.amb || 2) - dt; if (AU.amb <= 0) { AU.amb = 1.2 + Math.random() * 4; if (rainAmt < 0.3 && !(bossFight && boss && boss.alive)) sfx(nightAmt > 0.5 ? 'cricket' : 'bird'); }
  AU.beat -= dt; if (AU.beat > 0) return;
  const fight = bossFight && boss && boss.alive;
  if (fight) {
    AU.beat = boss.phase === 2 ? 0.22 : 0.28; AU.step++;
    if (AU.step % 2 === 0) nz(0.12, 0.3, 90, 'lowpass');
    tone(BOSS_SCALE[(AU.step * 5 + (AU.step >> 3)) % 6], 0.26, 'sawtooth', 0.045, AU.mus);
    if (AU.step % 8 === 0) tone(55, 1.6, 'triangle', 0.2, AU.mus);
  } else {
    const night = nightAmt > 0.5; AU.beat = night ? 1.1 : 0.62; AU.step++;
    AU.bar = (AU.bar + (Math.random() < 0.5 ? 1 : Math.random() < 0.5 ? -1 : 2) + 8) % 8;
    if (Math.random() < (night ? 0.5 : 0.78)) tone(SCALE[AU.bar] * (night ? 0.5 : 1), 1.5, 'triangle', 0.05, AU.mus);
    if (AU.step % 8 === 0) { const r = [146.83, 110, 123.47, 98][(AU.step >> 3) % 4]; tone(r, 4.6, 'sine', 0.09, AU.mus); tone(r * 1.5, 4.6, 'sine', 0.045, AU.mus); }
  }
}

/* ---------- populate the valley ---------- */
[[-82, 65.5], [-89.5, 67], [-88, 74], [-80, 73.5], [-70, -22], [-73, -26], [-69.5, -35], [-70, -46]].forEach(p => spawnEnemy('goblin', p[0], p[1]));
[[24, -30], [31, -38], [-6, 110], [5, 118]].forEach(p => spawnEnemy('boar', p[0], p[1]));
[[-102, 26], [-72, -62], [-132, 44]].forEach(p => spawnEnemy('wisp', p[0], p[1]));
[[-98, 17], [-121, -40]].forEach(p => spawnEnemy('sentinel', p[0], p[1]));
boss = spawnEnemy('boss', -148, -40); boss.phase = 1; boss.state = 'sleep';

/* ---------- modes & menus ---------- */
let plocked = false, settingsBack = 'menu';
const OVERLAYS = ['menu', 'dialog', 'panel', 'pause', 'dead', 'settings', 'end', 'credits'];
function setMode(m: string) {
  MODE = m;
  for (const o of OVERLAYS) $(o).classList.toggle('show', o === m);
  $('hud').classList.toggle('show', m !== 'menu' && m !== 'credits' && !(m === 'settings' && settingsBack === 'menu'));
  $('hud').classList.toggle('dim', m !== 'play');
  if (m === 'play') lockPointer();
  else {
    mouse.l = mouse.r = false; PL.hold = -1; PL.draw = -1; for (const k in keys) keys[k] = false;
    try { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* ignore */ }
  }
  if (m === 'menu') { const s = readSave(); $<HTMLButtonElement>('btnContinue').disabled = !s; $('btnNew').textContent = 'New game'; $('btnNew').dataset.confirm = ''; $('saveInfo').textContent = s ? 'Saved journey: level ' + s.p.level + ', ' + Math.floor(s.playTime / 60) + ' min played' : 'No saved journey yet'; }
}
function lockPointer() { try { const r = canvas.requestPointerLock && canvas.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (e) { /* drag fallback */ } }
document.addEventListener('pointerlockchange', () => { const was = plocked; plocked = document.pointerLockElement === canvas; if (was && !plocked && MODE === 'play') setMode('pause'); });
function startGame(state: GameState, fresh: boolean) {
  audioInit(); G = state; weather = { raining: false, next: 170, bolt: 8 }; rainAmt = 0; syncWorld();
  fade(() => { setMode('play'); if (fresh) { banner('Greenwind Valley', 'The Lost Kingdom'); notify('Move with W A S D. Look with the mouse. Press E near the glowing spirit.'); } else notify('Journey resumed.'); });
}
$('btnNew').onclick = () => { const b = $('btnNew'); if (readSave() && !b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Erase the saved journey and begin again'; return; } startGame(newState(), true); };
$('btnContinue').onclick = () => { const s = readSave(); if (!s) { $('saveInfo').textContent = 'The save could not be read. Start a new game.'; $<HTMLButtonElement>('btnContinue').disabled = true; return; } startGame(s, false); };
$('btnSettings').onclick = () => openSettings('menu');
$('btnCredits').onclick = () => { audioInit(); setMode('credits'); };
$('btnCreditsBack').onclick = () => setMode('menu');
$('btnResume').onclick = () => setMode('play');
$('btnSave').onclick = () => { syncSaveState(); const ok = writeSave(); $('btnSave').textContent = ok ? 'Saved' : 'Saving failed: storage is unavailable'; setTimeout(() => $('btnSave').textContent = 'Save game', 1600); };
$('btnPauseSettings').onclick = () => openSettings('pause');
$('btnTitle').onclick = () => { syncSaveState(); writeSave(); setMode('menu'); };
$('btnRespawn').onclick = respawn;
$('btnEnd').onclick = () => setMode('play');
function openSettings(back: string) {
  settingsBack = back; audioInit();
  $<HTMLInputElement>('setMaster').value = String(SETTINGS.master); $<HTMLInputElement>('setMusic').value = String(SETTINGS.music); $<HTMLInputElement>('setSfx').value = String(SETTINGS.sfx); $<HTMLInputElement>('setSens').value = String(SETTINGS.sens); $<HTMLSelectElement>('setQuality').value = SETTINGS.quality; $<HTMLInputElement>('setInvert').checked = SETTINGS.invertY;
  setMode('settings');
}
$('settings').addEventListener('input', () => {
  SETTINGS.master = +$<HTMLInputElement>('setMaster').value; SETTINGS.music = +$<HTMLInputElement>('setMusic').value; SETTINGS.sfx = +$<HTMLInputElement>('setSfx').value; SETTINGS.sens = +$<HTMLInputElement>('setSens').value; SETTINGS.invertY = $<HTMLInputElement>('setInvert').checked;
  const q = $<HTMLSelectElement>('setQuality').value; if (q !== SETTINGS.quality) { SETTINGS.quality = q; applyQuality(); }
  applyVolume(); saveSettings();
});
$('btnSettingsBack').onclick = () => setMode(settingsBack);
$('dialog').addEventListener('click', () => advanceDlg());

/* ---------- input ---------- */
window.addEventListener('keydown', ev => {
  const c = ev.code;
  if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c) && MODE !== 'settings') ev.preventDefault();
  if (ev.repeat) return;
  if (MODE === 'play') {
    if (cine) { if (c === 'Escape') setMode('pause'); return; }
    keys[c] = true;
    if (PL.dead) return;
    if (c === 'ShiftRight') keys.ShiftLeft = true;
    if (c === 'Space' && PL.grounded && !PL.swim) { PL.vel.y = 9.7; PL.grounded = false; PL.airT = 0; PL.crouch = false; PL.glideArm = false; sfx('jump'); }
    else if (c === 'Space' && !PL.grounded) PL.glideArm = true;
    else if (c === 'KeyE') { if (nearInteract) { const it = nearInteract; nearInteract = null; it.act(); } }
    else if (c === 'KeyQ') castEmber(); else if (c === 'KeyF') dodge(); else if (c === 'KeyR') toggleLock();
    else if (c === 'KeyC') { if (PL.grounded && !PL.swim) PL.crouch = !PL.crouch; }
    else if (c === 'Digit1') setWeapon('sword'); else if (c === 'Digit2') setWeapon('bow'); else if (c === 'Digit3') { if (!has('potion')) notify('No Healing Draughts left.'); else useItem('potion'); }
    else if (c === 'Tab') openPanel('inventory'); else if (c === 'KeyM') openPanel('map'); else if (c === 'KeyJ') openPanel('journal');
    else if (c === 'Escape' || c === 'KeyP') setMode('pause');
  } else if (MODE === 'dialog') {
    if (c === 'KeyE' || c === 'Space' || c === 'Enter') advanceDlg(); else if (/^Digit[1-4]$/.test(c)) pickOpt(+c.slice(5) - 1);
  } else if (MODE === 'panel') {
    const want = c === 'Tab' ? 'inventory' : c === 'KeyM' ? 'map' : c === 'KeyJ' ? 'journal' : null;
    if (c === 'Escape' || (want && (want === panelTab || shopOpen))) closePanel(); else if (want) { panelTab = want; renderPanel(); }
  } else if (MODE === 'pause') { if (c === 'Escape' || c === 'KeyP') setMode('play'); }
  else if (MODE === 'settings') { if (c === 'Escape') setMode(settingsBack); }
  else if (MODE === 'credits') { if (c === 'Escape') setMode('menu'); }
});
window.addEventListener('keyup', ev => { keys[ev.code] = false; if (ev.code === 'ShiftRight') keys.ShiftLeft = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.l = mouse.r = false; });
canvas.addEventListener('contextmenu', ev => ev.preventDefault());
canvas.addEventListener('mousedown', ev => {
  if (MODE !== 'play') return; audioInit(); if (!plocked) lockPointer();
  if (PL.dead || cine) return;
  if (ev.button === 0) { mouse.l = true; if (G.p.weapon === 'sword') { PL.hold = 0; PL.chargeFx = false; startAttack(false); } else if (has('arrow')) PL.draw = 0; else { notify('No arrows left. Fletch some from deadwood and flint.'); sfx('deny'); } }
  else if (ev.button === 2) mouse.r = true;
});
window.addEventListener('mouseup', ev => {
  if (ev.button === 0) {
    mouse.l = false;
    if (MODE === 'play' && !PL.dead && !cine) { if (PL.hold > 0.42 && !PL.atk) startAttack(true); if (PL.draw > 0.15) fireArrow(clamp(PL.draw / 0.9, 0.25, 1)); }
    PL.hold = -1; PL.draw = -1;
  } else if (ev.button === 2) mouse.r = false;
});
window.addEventListener('mousemove', ev => {
  if (MODE !== 'play' || !(plocked || mouse.l || mouse.r)) return;
  const s = 0.0024 * SETTINGS.sens; CAM.yaw -= (ev.movementX || 0) * s; CAM.pitch += (ev.movementY || 0) * s * (SETTINGS.invertY ? -1 : 1);
});
canvas.addEventListener('wheel', ev => { if (MODE === 'play') CAM.dist = clamp(CAM.dist + Math.sign(ev.deltaY) * 0.7, 4, 12); }, { passive: true });

/* ---------- ambient life: birds and butterflies ---------- */
const birds: Flyer[] = [], flies: Flyer[] = [];
{
  const wing = (s: number) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.25, s * 1.1, 0, 0, 0, 0, -0.25], 3)); g.computeVertexNormals(); return g; }, WL = wing(1), WR = wing(-1), bm = new T.MeshBasicMaterial({ color: 0x2a3038, side: T.DoubleSide });
  for (let f = 0; f < 3; f++) { const c = [[30, 30, 60, 46], [-90, 40, 80, 58], [70, -60, 70, 52]][f]; for (let i = 0; i < 5; i++) { const g = new T.Group(); const l = mesh(WL, bm, 0, 0, 0, g, true), r = mesh(WR, bm, 0, 0, 0, g, true); mesh(bx(0.12, 0.08, 0.6), bm, 0, 0, 0, g, true); scene.add(g); birds.push({ g, l, r, c, off: i * 0.5 + f * 2, lag: i * 0.11, side: (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 1.6 }); } }
  const fw = new T.PlaneGeometry(0.16, 0.2); fw.translate(0.08, 0, 0);
  for (let i = 0; i < 12; i++) { const home = [[4, 52], [-6, 66], [70, 26], [84, 14], [108, 19], [20, 44], [-20, 20], [60, 34], [10, 70], [90, 30], [50, 24], [-4, 58]][i]; const g = new T.Group(), m = new T.MeshBasicMaterial({ color: [0xffd24a, 0xffffff, 0xff8fc7, 0x9fd8ff][i % 4], side: T.DoubleSide }); const l = mesh(fw, m, 0, 0, 0, g, true), r = mesh(fw, m, 0, 0, 0, g, true); r.scale.x = -1; scene.add(g); flies.push({ g, l, r, home, ph: i * 1.7 }); }
}
function updateLife(dt: number, t: number) {
  for (const b of birds) { const a = t * 0.11 + b.off * 0.02 + b.c[0] - b.lag * 0.5, r = b.c[2] + b.side; b.g.position.set(b.c[0] + Math.cos(a) * r, b.c[3] + Math.sin(t * 0.4 + b.off) * 3 - Math.abs(b.side) * 0.3, b.c[1] + Math.sin(a) * r); b.g.rotation.y = -a; const fl = Math.sin(t * 7 + b.off * 3) * 0.6; b.l.rotation.z = fl; b.r.rotation.z = -fl; b.g.visible = nightAmt < 0.6 && rainAmt < 0.5; }
  for (const f of flies) { const x = f.home[0] + Math.sin(t * 0.5 + f.ph) * 3 + Math.sin(t * 1.3 + f.ph * 2) * 1, z = f.home[1] + Math.cos(t * 0.4 + f.ph * 1.3) * 3; f.g.position.set(x, groundAt(x, z) + 0.9 + Math.sin(t * 2.1 + f.ph) * 0.4, z); f.g.rotation.y = t * 0.8 + f.ph; const fl = Math.abs(Math.sin(t * 14 + f.ph)) * 1.2; f.l.rotation.y = -fl; f.r.rotation.y = fl; f.g.visible = nightAmt < 0.4 && rainAmt < 0.3; }
}

/* ---------- loop ---------- */
let lastT = performance.now(), menuAng = 0.6, interT = 0, saveT = 60, smokeT = 0;
const _focus = new T.Vector3();
let loopFailed = false;
function frame(now: number) {
  requestAnimationFrame(frame);
  const raw = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
  let dt = raw * timeScale; if (hitStop > 0) { hitStop -= raw; dt *= 0.05; }
  windU.value += raw; const tsec = now * 0.001;
  try {
    if (MODE === 'play') {
      G.time = (G.time + dt / 720) % 1; G.playTime += raw;
      updatePlayer(dt);
      for (const e of enemies) if (e.def.boss) updateBoss(e, dt); else updateEnemy(e, dt);
      updateProjs(dt); updateHazards(dt); updateDrops(dt); updateNPCs(dt); updateTemple(dt); updateDiscovery(dt); updateWeather(raw, PL.pos);
      interT -= dt; if (interT <= 0) { interT = 0.12; findInteract(); }
      saveT -= raw; if (saveT <= 0) { saveT = 60; if (!PL.dead && !cine) autosave(); }
    }
    const inMenu = MODE === 'menu' || MODE === 'credits' || (MODE === 'settings' && settingsBack === 'menu');
    if (inMenu) {
      menuAng += raw * 0.05; const y = groundAt(0, 60);
      camera.position.set(Math.sin(menuAng) * 25, y + 6.5 + Math.sin(menuAng * 0.7) * 1.5, 60 + Math.cos(menuAng) * 25); camera.lookAt(-6, y + 4.2, 58);
      hero.g.visible = false; updateNPCs(raw); _focus.set(0, y, 60);
    } else { hero.g.visible = hero.g.visible || MODE !== 'play'; if (cine && MODE === 'play') updateCine(raw); else if (!cine) updateCamera(raw); _focus.copy(PL.pos); }
    updateParticles(dt); updateRings(dt); updateSky(G.time, _focus); updateChunks(raw, camera.position); updateDrift(raw, _focus, tsec); updateLife(raw, tsec);
    // ambient motion
    waterTex.offset.x += raw * 0.006; waterTex.offset.y += raw * 0.016; waterfall.tx.offset.y += raw * 0.95; waterfall.tx2.offset.y += raw * 1.5;
    waterfall.mist.forEach((m, i) => { const s = [16, 11, 12][i] * (1 + Math.sin(tsec * 0.9 + i * 2) * 0.12); m.scale.set(s, s * 0.7, 1); }); waterfall.foam.scale.set(8 + Math.sin(tsec * 2) * 0.5, 3 + Math.cos(tsec * 2.6) * 0.3, 1);
    waterfall.rb.visible = nightAmt < 0.4 && rainAmt < 0.3;
    const fl = 1 + Math.sin(now * 0.02) * 0.12 + Math.sin(now * 0.033) * 0.08;
    for (const f of [villageFire, campFire]) { f.scale.set(1 + (fl - 1) * 0.4, fl, 1 + (fl - 1) * 0.4); f.rotation.y += raw * 3; f.userData.halo.material.opacity = 0.4 + fl * 0.15 + nightAmt * 0.25; }
    villageFire.userData.light.intensity = 0.7 + fl * 0.4 + nightAmt * 0.6;
    windmill.rotation.z -= raw * (0.55 + rainAmt * 0.8);
    for (let i = 0; i < banners.length; i++) { const b = banners[i]; b.rotation.y = Math.sin(tsec * 2.3 + i * 1.3) * (b.userData.small ? 0.25 : 0.4) + Math.sin(tsec * 5.1 + i) * 0.08; if (b.userData.small) b.rotation.x = Math.sin(tsec * 2 + i) * 0.2; }
    for (const c of clouds) { c.position.x += raw * 3; if (c.position.x > 1400) c.position.x = -1400; }
    for (const r of RELICS) if (r.m.visible) { r.m.rotation.z += raw * 2; r.m.position.y = r.y + Math.sin(now * 0.003 + r.y) * 0.15; }
    for (const k in waystones) { const w = waystones[k]; w.em.rotation.z += raw * 0.6; w.hl.material.opacity = 0.32 + Math.sin(tsec * 2 + w.x) * 0.1; }
    shaftMat.opacity = 0.1 * (1 - nightAmt) * (1 - rainAmt);
    smokeT -= raw; if (smokeT <= 0) {
      smokeT = 0.3;
      if (Math.hypot(_focus.x - 78, _focus.z - 20) < 130) for (const c of chimneys) puff(c[0] + rand(-0.15, 0.15), c[1], c[2] + rand(-0.15, 0.15), 0xd8d4cc, 0.5 + rand(-0.1, 0.1), 0.9, 0.15, 3.2);
      if (Math.hypot(_focus.x + 25, _focus.z + 156) < 90) for (let i = 0; i < 4; i++) puff(-25 + rand(-6, 6), WATER_Y + 0.4, -156.5 + rand(-1, 1), 0xffffff, rand(-0.6, 0.6), rand(0.8, 2), rand(0.4, 1.4), 1.6);
      puff(rand(-0.3, 0.3), spirit.position.y, 58.5 + rand(-0.3, 0.3), RUNE, rand(-0.2, 0.2), 0.8, rand(-0.2, 0.2), 2);
      for (const br of temple.braziers) if (br.lit) puff(br.x, br.y + 1.2, br.z, 0xffb04a, rand(-0.2, 0.2), 1.2, rand(-0.2, 0.2), 0.9);
    }
    updateHUD(raw); updateAudio(raw);
    POST.render();
  } catch (err) { console.error(err); if (!loopFailed) { loopFailed = true; notify('Something went wrong in the game loop. Your last save is safe.'); } }
}

/* ---------- boot ---------- */
loadSettings(); applyQuality();
G = readSave() || newState(); syncWorld(); setMode('menu'); { const l = $('loading'); if (l) l.remove(); }
try { if (window.TLK_ART && TLK_ART.keyart) $('menu').style.setProperty('--keyart', 'url("' + TLK_ART.keyart + '")'); } catch (e) { /* the live valley shows through instead */ }
requestAnimationFrame(frame);
window.TLK = { get G() { return G; }, PL, enemies, get MODE() { return MODE; } };
