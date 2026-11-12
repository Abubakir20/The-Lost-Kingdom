/* ============ interface: icons, dialogue, pack, journal, map, HUD ============ */
const IC: Record<string, string[]> = {
  potion: ['#d9503a', '<path d="M9 2h6v2l-1 1v4l4.5 7.5A3 3 0 0 1 15.9 21H8.1a3 3 0 0 1-2.6-4.5L10 9V5L9 4z"/><path d="M7.6 15h8.8l1.2 2.2c.5.9-.1 1.8-1.1 1.8H7.5c-1 0-1.6-.9-1.1-1.8z" fill="#fff" opacity=".4"/>'],
  berry: ['#e8962a', '<circle cx="8" cy="15" r="4.2"/><circle cx="16" cy="15.5" r="4"/><circle cx="12" cy="8.5" r="4.2"/><path d="M12 4c1-2 3-3 5-2-1 2-3 3-5 2z" fill="#5f8f3e"/>'],
  roast: ['#a8643a', '<path d="M4 12a6.5 5.5 0 1 1 10 4.6C10.5 19 5 17.5 4 12z"/><path d="M14.5 15.500l5 5" stroke="#f2ead8" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="21" r="1.8" fill="#f2ead8"/>'],
  herb: ['#6fae7a', '<path d="M12 22V12" stroke="#4f8a3a" stroke-width="2" fill="none"/><path d="M12 13C6 13 4 8 5 3c5 0 8 4 7 10zM12 16c5 0 8-3 8-8-5 0-8 3-8 8z"/>'],
  wood: ['#8a6a44', '<rect x="2.5" y="8" width="19" height="8.5" rx="4.2"/><circle cx="17.5" cy="12.2" r="3" fill="#e0c9a0"/><circle cx="17.5" cy="12.2" r="1.2" fill="#8a6a44"/>'],
  stone: ['#5d666c', '<path d="M4 16l3-9 7-3 6 6-2 9-9 1z"/><path d="M7 7l5 5 8-2M12 12l-3 8" stroke="#8a949a" stroke-width="1" fill="none"/>'],
  crystal: ['#3fc9b6', '<path d="M12 2l5 8-5 12-5-12z"/><path d="M5 12l3 9-5-3zM19 12l-3 9 5-3z" opacity=".7"/><path d="M12 2l-2 8 2 12" stroke="#fff" stroke-width=".8" fill="none" opacity=".7"/>'],
  fang: ['#e8e2d0', '<path d="M8 3h8c0 8-2 14-4 18C10 17 8 11 8 3z" stroke="#8a8270" stroke-width="1"/>'],
  meat: ['#c2584a', '<path d="M4 13c0-5 5-9 10-8s7 6 4 10-9 5-12 3-2-3-2-5z"/><circle cx="13" cy="11" r="2.5" fill="#f2ead8"/>'],
  core: ['#7d8983', '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6" fill="#7ff3e0"/><circle cx="12" cy="12" r="6" fill="none" stroke="#7ff3e0" stroke-width=".8"/>'],
  arrow: ['#8a929a', '<path d="M4 20L17 7" stroke="#8a5a30" stroke-width="2" fill="none"/><path d="M21 3l-2.5 8-5.5-5.500z"/><path d="M4 20l4-.5M4 20l.5-4" stroke="#c8452f" stroke-width="2" fill="none"/>'],
  shard: ['#f0c24a', '<path d="M12 1l3.5 8.500L23 12l-7.5 2.500L12 23l-3.5-8.500L1 12l7.5-2.500z"/><path d="M12 6l1.5 4.500L18 12l-4.5 1.500L12 18l-1.5-4.500L6 12l4.5-1.500z" fill="#fff" opacity=".55"/>'],
  key: ['#c79a3a', '<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.2" fill="#efe3c4"/><path d="M11.5 11.500l9 9M17.5 17.500l2.5-2.500M14.5 14.500l2-2" stroke="#c79a3a" stroke-width="2.6" fill="none"/>'],
  heart: ['#3fae6a', '<path d="M12 21.500C5 15.5 2 11.5 2 7.500A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 10 1.500c0 4-3 8-10 14z"/><path d="M12 9v8M9 12c1 1 2 1 3 0s2-1 3 0" stroke="#d8ffe0" stroke-width="1.2" fill="none"/>'],
  relic: ['#d9ac3a', '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="#7a5a1a" stroke-width="1.6" stroke-dasharray="22 8"/><circle cx="12" cy="12" r="2" fill="#7a5a1a"/>'],
  sword: ['#cfd8de', '<path d="M19.5 2H22v2.500L9.5 17l-2.5-2.500z"/><path d="M4.5 13.500l6 6M3 21l4.5-4.5" stroke="#c79a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
  bow: ['#8a5a30', '<path d="M6 2c13 2 15 18 0 20" fill="none" stroke="#8a5a30" stroke-width="2.6"/><path d="M6 2v20" stroke="#b9b29a" stroke-width="1"/><path d="M3 12h14" stroke="#8a929a" stroke-width="1.4"/>'],
  armor: ['#8a5a30', '<path d="M6 3l6 2 6-2 3.5 5-3.5 2v11H6V10L2.5 8z"/><path d="M12 5v16" stroke="#5a3d28" stroke-width="1" fill="none"/>'],
  ember: ['#f0703a', '<path d="M12 2c1 5 6.5 6 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-4 2-7 2 1 3.5 2 4.5-5z"/><path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-2 3-5z" fill="#ffe08a"/>'],
  tunic: ['#b9b29a', '<path d="M6 3l6 2 6-2 3.5 5-3.5 2v11H6V10L2.5 8z"/>'],
};
/* painted icons for the items in the atlas (4 per row, in this order); everything else keeps its vector icon */
const ICON_ART = ['potion', 'berry', 'roast', 'herb', 'wood', 'stone', 'crystal', 'fang', 'meat', 'core', 'arrow', 'shard', 'key', 'heart', 'relic'];
/* NPC portraits in the atlas (3 per row), keyed by the name shown in dialogue */
const PORTRAITS = ['Elder Maren', 'Borin', 'Tessa', 'Halric', 'Pip', 'The Cartographer'];
const UI_ART = window.TLK_UI || {};
if (UI_ART.icons) document.documentElement.style.setProperty('--icons', `url(${UI_ART.icons})`);
if (UI_ART.portraits) document.documentElement.style.setProperty('--portraits', `url(${UI_ART.portraits})`);
const icon = (id: string) => {
  const k = UI_ART.icons ? ICON_ART.indexOf(id) : -1;
  if (k >= 0) return `<span class="ic art"><i style="background-position:${(k % 4) * 100 / 3}% ${Math.floor(k / 4) * 100 / 3}%"></i></span>`;
  const i = IC[id] || IC.stone; return `<span class="ic"><svg viewBox="0 0 24 24" fill="${i[0]}" aria-hidden="true">${i[1]}</svg></span>`;
};
const SIGIL = '<svg class="sigil" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><path d="M32 6a26 26 0 1 0 26 26" stroke-width="3"/><path d="M47 22a16.5 16.5 0 1 0 1.5 13" stroke-width="3"/><circle cx="32" cy="32" r="6.5" stroke-width="3"/><path d="M32 0v4M32 60v4M0 32h4M60 32h4" stroke-width="2"/></svg>';

/* dialogue with a typewriter reveal; E always advances */
let dlgType: { n: number; full: string } | null = null;
function renderDlg() {
  if (!dlg) return;
  const pg = dlg.pages[dlg.i], text = typeof pg === 'string' ? pg : pg.t;
  const face = UI_ART.portraits ? PORTRAITS.indexOf(dlg.who) : -1, fe = $('dlgFace');
  $('dialog').classList.toggle('face', face >= 0);
  if (face >= 0) fe.style.backgroundPosition = `${(face % 3) * 50}% ${Math.floor(face / 3) * 100}%`;
  $('dlgWho').textContent = dlg.who; $('dlgText').textContent = ''; dlgType = { full: text, n: 0 };
  const o = $('dlgOpts'); o.innerHTML = '';
  const opts = pageOpts(pg);
  if (opts) opts.forEach((op, k) => { const b = document.createElement('button'); b.innerHTML = '<kbd>' + (k + 1) + '</kbd> '; b.appendChild(document.createTextNode(op[0])); b.onclick = ev => { ev.stopPropagation(); pickOpt(k); }; o.appendChild(b); });
  $('dlgHint').style.display = opts ? 'none' : 'block';
  $('dialog').classList.toggle('carved', dlg.who === 'Inscription' || dlg.who === 'Wall carving');
}
function updateDlgType(dt: number) { if (!dlgType || MODE !== 'dialog') return; if (dlgType.n < dlgType.full.length) { const was = dlgType.n | 0; dlgType.n = Math.min(dlgType.full.length, dlgType.n + dt * 70); if ((dlgType.n | 0) !== was) { $('dlgText').textContent = dlgType.full.slice(0, dlgType.n | 0); if (((dlgType.n | 0) % 3) === 0) sfx('type'); } } }

function renderPanel() {
  const tabs = shopOpen ? [['shop', 'Tessa’s stall']] : [['inventory', 'Pack'], ['journal', 'Journal'], ['map', 'Map']];
  $('panelTabs').innerHTML = tabs.map(t => `<button class="tab${t[0] === panelTab ? ' on' : ''}" data-act="tab:${t[0]}">${t[1]}</button>`).join('') + '<span class="purse2">' + icon('relic') + '<b>' + G.p.coins + '</b> coins</span><button class="tab close" data-act="close" aria-label="Close">Close</button>';
  const body = $('panelBody'), S = G.p; body.className = 'tab-' + panelTab;
  const row = (ic: string, title: string, qty: string, desc: string, btn?: string, cls?: string) => `<div class="item${cls ? ' ' + cls : ''}">${icon(ic)}<div class="tx"><b>${title}</b>${qty ? ` <span class="qty">${qty}</span>` : ''}${desc ? `<p>${desc}</p>` : ''}</div>${btn || ''}</div>`;
  const meter = (label: string, v: number, max: number, cls: string) => `<div class="meter ${cls}"><span>${label}</span><div><i style="width:${clamp(v / max * 100, 0, 100)}%"></i></div><em>${Math.ceil(v)} / ${max}</em></div>`;
  if (panelTab === 'inventory') {
    const cats: Record<string, string[]> = {}; for (const id in G.inv) { if (!G.inv[id] || !ITEMS[id]) continue; (cats[ITEMS[id].c] = cats[ITEMS[id].c] || []).push(id); }
    const order = ['Weapons', 'Potions', 'Food', 'Materials', 'Quest items', 'Artifacts', 'Collectibles'];
    let items = ''; for (const c of order) if (cats[c]) items += `<h4>${c}</h4>` + cats[c].map((id: string) => row(id, esc(ITEMS[id].n), '×' + G.inv[id], esc(ITEMS[id].d || ''), ITEMS[id].use ? `<button data-act="use:${id}">Use</button>` : '')).join('');
    const rec = RECIPES.map((r, i) => { const ok = Object.keys(r.need).every(k => has(k, r.need[k])); return row(r.out, esc(r.label), '', Object.keys(r.need).map(k => `<span class="chip${has(k, r.need[k]) ? '' : ' no'}">${r.need[k]} ${esc(ITEMS[k].n)} <i>(${G.inv[k] || 0})</i></span>`).join(' '), `<button data-act="craft:${i}" ${ok ? '' : 'disabled'}>Craft</button>`); }).join('');
    const swordName = ['Warden’s Blade', 'Oakrest Steel Blade', 'Echo-folded Blade', 'Sunstone Edge'][Math.min(3, S.swordLv)];
    body.innerHTML = `<div class="cols"><section class="card"><div class="plate">${SIGIL}<div><h3>The Warden</h3><p>Level ${S.level}, ${S.xp} of ${xpNeed(S.level)} experience</p></div></div>
      ${meter('Health', S.hp, S.maxHp, 'hp')}${meter('Stamina', S.st, S.maxSt, 'st')}${meter('Magic', S.mp, S.maxMp, 'mp')}
      <h4>Equipment</h4>
      ${row('sword', swordName, '', `Damage ${swordDmg()}. Three-strike combo; charged spin ${Math.round(swordDmg() * 2.4)}. Blocks with the round shield.`, `<button data-act="eq:sword" ${S.weapon === 'sword' ? 'disabled' : ''}>${S.weapon === 'sword' ? 'Ready' : 'Equip'}</button>`, S.weapon === 'sword' ? 'eq' : '')}
      ${S.hasBow ? row('bow', 'Ashwood Bow', '', `Damage ${9 + S.level} to ${24 + S.level} by draw. Arrows: ${G.inv.arrow || 0}.`, `<button data-act="eq:bow" ${S.weapon === 'bow' ? 'disabled' : ''}>${S.weapon === 'bow' ? 'Ready' : 'Equip'}</button>`, S.weapon === 'bow' ? 'eq' : '') : ''}
      ${row(S.armor ? 'armor' : 'tunic', S.armor ? 'Leather Jerkin' : 'Traveller’s tunic', '', S.armor ? 'Reduces every hit by ' + S.armor + '.' : 'No protection. Tessa sells better.')}
      ${S.ember ? row('ember', 'Ember Bolt', '', `Press Q. Costs 18 magic. Burns foes for ${24 + S.level * 2} and lights old lamps.`) : ''}
      </section><section><h3>Pack</h3>${items || '<p class="empty">Your pack is empty. Gather herbs, wood and flint as you explore.</p>'}</section>
      <section><h3>Crafting</h3>${rec}<p class="hintline">Silverleaf grows near old stones. Deadwood and flint lie in the open valley.</p></section></div>`;
  } else if (panelTab === 'journal') {
    let h = ''; const ids = Object.keys(QUESTS).filter(id => G.q[id]);
    for (const st of ['active', 'done']) for (const id of ids) if (G.q[id].s === st) {
      const q = QUESTS[id];
      h += `<div class="quest ${st} ${q.kind === 'Main quest' ? 'main' : 'side'}"><h4>${esc(q.name)} <span class="qty">${q.kind}${st === 'done' ? ', complete' : ''}</span></h4><p>${esc(q.desc)}</p>` + (st === 'active' ? '<ul>' + q.obj(G.q[id]).map((o: any[]) => `<li class="${o[1] ? 'ok' : ''}">${esc(o[0])}</li>`).join('') + '</ul>' : '') + `<p class="reward">Reward: ${esc(q.reward)}</p></div>`;
    }
    const lore = ['t_shrine', 't_ruin', 't_mesa', 't_fall'].filter(t => G.flags[t]).length, seen = LOCS.filter(l => G.flags['seen_' + l.id]).length;
    const tally = (label: string, v: number | string, max?: number) => `<div class="tally"><span>${label}</span><b>${v}${max ? ' / ' + max : ''}</b>${max ? `<div><i style="width:${+v / max * 100}%"></i></div>` : ''}</div>`;
    body.innerHTML = `<div class="cols two"><section><h3>Quests</h3>${h || '<p class="empty">No quests yet. Speak with the spirit at the shrine.</p>'}</section>
      <section class="card"><h3>Discoveries</h3>${tally('Locations', seen, LOCS.length)}${tally('Eldorian relics', G.inv.relic || 0, 5)}${tally('Inscriptions read', lore, 4)}${tally('Foes defeated', G.kills)}${tally('Time played', Math.floor(G.playTime / 60) + ' min')}</section></div>`;
  } else if (panelTab === 'map') {
    body.innerHTML = `<div class="mapwrap"><div class="mapframe"><canvas id="bigmap" width="640" height="640"></canvas></div><div class="maplist"><h3>Greenwind Valley</h3><p>Touch a waystone once, then travel to it from here.</p>${LOCS.filter(l => G.disc[l.id]).map(l => `<div class="item"><span class="pin${l.way ? ' way' : ''}"></span><div class="tx"><b>${esc(l.name)}</b></div>${l.way ? `<button data-act="travel:${l.id}">Travel</button>` : ''}</div>`).join('') || '<p class="empty">Nothing discovered yet.</p>'}</div></div>`;
    drawBigMap();
  } else if (panelTab === 'shop') {
    const buy = SHOP.map((s, i) => { const it = ITEMS[s.id], owned = s.id === 'armor' && S.armor; return row(s.id, esc(s.name || it.n) + (s.n ? ' ×' + s.n : ''), '', esc(s.d || it.d), `<button data-act="buy:${i}" ${owned || S.coins < s.price ? 'disabled' : ''}>${owned ? 'Owned' : s.price + ' coins'}</button>`); }).join('');
    const sell = Object.keys(SELL).filter(k => has(k)).map(k => row(k, esc(ITEMS[k].n), '×' + G.inv[k], '', `<button data-act="sell:${k}">Sell for ${SELL[k]}</button>`)).join('');
    body.innerHTML = `<div class="cols two"><section><h3>Buy <span class="qty">You have ${S.coins} coins</span></h3>${buy}</section><section><h3>Sell</h3>${sell || '<p class="empty">Nothing Tessa wants. She buys fangs, cores, crystals and raw meat.</p>'}</section></div>`;
  }
}
const w2m = (v: number, N: number) => (v + WORLD) / (WORLD * 2) * N;
function drawBigMap() {
  const c = $<HTMLCanvasElement>('bigmap'); if (!c) return; const x = ctx2d(c), N = c.width;
  x.imageSmoothingEnabled = true; x.drawImage(mapCanvas, 0, 0, N, N);
  // vignette of old paper, compass rose
  const vg = x.createRadialGradient(N / 2, N / 2, N * 0.3, N / 2, N / 2, N * 0.75); vg.addColorStop(0, 'rgba(120,90,40,0)'); vg.addColorStop(1, 'rgba(90,60,20,.5)'); x.fillStyle = vg; x.fillRect(0, 0, N, N);
  x.save(); x.translate(N - 62, 64); x.strokeStyle = 'rgba(60,40,15,.75)'; x.fillStyle = 'rgba(60,40,15,.75)'; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, 30, 0, 6.3); x.stroke();
  for (let k = 0; k < 8; k++) { x.rotate(Math.PI / 4); x.beginPath(); x.moveTo(0, k % 2 ? -22 : -36); x.lineTo(4, 0); x.lineTo(-4, 0); x.closePath(); k % 2 ? x.stroke() : x.fill(); }
  x.font = '16px "Marcellus SC", Georgia, serif'; x.textAlign = 'center'; x.fillText('N', 0, -42); x.restore();
  x.font = '15px "Marcellus SC", Georgia, serif'; x.textAlign = 'center';
  for (const L of LOCS) if (G.disc[L.id]) {
    const px = w2m(L.x, N), pz = w2m(L.z, N);
    x.fillStyle = L.way ? '#1f8f86' : '#5a3d28'; x.strokeStyle = '#f6ead0'; x.lineWidth = 2; x.beginPath(); if (L.way) { x.moveTo(px, pz - 8); x.lineTo(px + 7, pz); x.lineTo(px, pz + 8); x.lineTo(px - 7, pz); x.closePath(); } else x.arc(px, pz, 4.5, 0, 6.3); x.fill(); x.stroke();
    x.lineWidth = 3.5; x.strokeStyle = 'rgba(246,234,208,.9)'; x.strokeText(L.name, px, pz - 13); x.fillStyle = '#3a2a14'; x.fillText(L.name, px, pz - 13);
  }
  const o = currentObjective(); if (o && o.target) { const tx = w2m(o.target[0], N), tz = w2m(o.target[1], N); x.strokeStyle = '#c8452f'; x.lineWidth = 3; x.beginPath(); x.moveTo(tx - 7, tz - 7); x.lineTo(tx + 7, tz + 7); x.moveTo(tx + 7, tz - 7); x.lineTo(tx - 7, tz + 7); x.stroke(); }
  x.save(); x.translate(w2m(PL.pos.x, N), w2m(PL.pos.z, N)); x.rotate(-PL.yaw + Math.PI); x.fillStyle = '#c8452f'; x.strokeStyle = '#fff8e6'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -11); x.lineTo(7, 8); x.lineTo(0, 4); x.lineTo(-7, 8); x.closePath(); x.fill(); x.stroke(); x.restore();
}

/* ---------- HUD ---------- */
const mini = ctx2d($<HTMLCanvasElement>('minimap'), { willReadFrequently: true });
let hudT = 0, miniT = 0, pipN = 0;
function updateHUD(dt: number) {
  const S = G.p;
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').classList.remove('show'); }
  updateDlgType(dt); updateEnemyBars();
  for (const id in CHESTS) { const c = CHESTS[id]; if (c.open !== undefined && c.open > 0 && c.open < 1) { const k = c.open = Math.min(1, c.open + dt * 2.2); c.lid.rotation.x = -1.9 * (1 - Math.pow(1 - k, 3)) - Math.sin(k * 9) * 0.12 * (1 - k); } }
  hudT -= dt; if (hudT > 0) return; hudT = 0.06;
  // health as sunstone pips (20 each), stamina as a ring round the level crest
  const n = Math.ceil(S.maxHp / 20), box = $('hpPips');
  if (n !== pipN) { pipN = n; box.innerHTML = '<span class="pip"><i></i></span>'.repeat(n); }
  for (let i = 0; i < n; i++) (box.children[i].firstChild as HTMLElement).style.width = clamp((S.hp - i * 20) / 20 * 100, 0, 100) + '%';
  box.classList.toggle('low', S.hp / S.maxHp < 0.3);
  const C = 169.6, sr = $('stRing'), sf = clamp(S.st / S.maxSt, 0, 1); sr.style.strokeDashoffset = (C * (1 - sf)).toFixed(1); sr.style.stroke = sf < 0.25 ? '#e2603a' : '#a8dd5a'; $('crest').classList.toggle('spent', sf < 0.999);
  $('mpFill').style.width = clamp(S.mp / S.maxMp * 100, 0, 100) + '%'; $('mpBar').style.width = (S.maxMp * 2.4) + 'px';
  $('xpFill').style.width = (S.xp / xpNeed(S.level) * 100) + '%'; $('lvl').textContent = String(S.level); $('coins').textContent = String(S.coins);
  const o = currentObjective(); $('objective').style.display = o ? 'block' : 'none'; if (o) { $('objTitle').textContent = o.name; $('objText').textContent = o.text; }
  const pr = $('prompt'); if (nearInteract && MODE === 'play' && !cine) { pr.style.display = 'flex'; $('promptText').textContent = nearInteract._l ?? ''; } else pr.style.display = 'none';
  $('slotSword').classList.toggle('on', S.weapon === 'sword'); $('slotBow').classList.toggle('on', S.weapon === 'bow'); $('slotBow').classList.toggle('locked', !S.hasBow); $('slotEmber').classList.toggle('locked', !S.ember);
  $('slotEmber').classList.toggle('cool', PL.emberCd > 0 || S.mp < 18); $('arrowsN').textContent = S.hasBow ? String(G.inv.arrow || 0) : '–'; $('potN').textContent = String(G.inv.potion || 0); $('slotPot').classList.toggle('cool', !G.inv.potion);
  $('cross').classList.toggle('aim', S.weapon === 'bow'); $('cross').classList.toggle('draw', PL.draw > 0.15); $('cross').classList.toggle('lock', !!PL.lock);
  const bb = $('bossBar'); if (bossFight && boss && boss.alive && boss.state !== 'wake') { bb.style.display = 'block'; $('bossFill').style.width = (boss.hp / boss.def.hp * 100) + '%'; bb.classList.toggle('exposed', boss.state === 'stun'); bb.classList.toggle('rage', boss.phase === 2); } else bb.style.display = 'none';
  const hh = Math.floor(G.time * 24), mm = Math.floor((G.time * 24 - hh) * 6) * 10; $('region').textContent = regionName(); $('clock').textContent = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + (weather.raining ? ', rain' : ''); $('dayIcon').className = nightAmt > 0.5 ? 'moon' : 'sun';
  miniT -= 1; if (miniT <= 0) { miniT = 2; drawMini(o); }
}
function drawMini(o: Objective | null) {
  const N = 150, span = 150, sc = MAPN / (WORLD * 2), x = mini;
  x.save(); x.clearRect(0, 0, N, N); x.beginPath(); x.arc(N / 2, N / 2, N / 2, 0, 6.3); x.clip();
  x.fillStyle = '#7fb0b6'; x.fillRect(0, 0, N, N);
  x.drawImage(mapCanvas, (PL.pos.x + WORLD - span / 2) * sc, (PL.pos.z + WORLD - span / 2) * sc, span * sc, span * sc, 0, 0, N, N);
  const P = (wx: number, wz: number) => [N / 2 + (wx - PL.pos.x) / span * N, N / 2 + (wz - PL.pos.z) / span * N];
  for (const L of LOCS) if (G.disc[L.id]) { const [a, b] = P(L.x, L.z); x.fillStyle = L.way ? '#1f8f86' : '#5a3d28'; x.strokeStyle = '#f6ead0'; x.lineWidth = 1.2; x.beginPath(); x.arc(a, b, 3.4, 0, 6.3); x.fill(); x.stroke(); }
  for (const id in NPCS) { const [a, b] = P(NPCS[id].pos.x, NPCS[id].pos.z); x.fillStyle = '#2f7a3a'; x.fillRect(a - 1.8, b - 1.8, 3.6, 3.6); }
  for (const e of enemies) if (e.alive && (e.state === 'chase' || e.state === 'windup' || e.def.boss && bossFight)) { const [a, b] = P(e.pos.x, e.pos.z); x.fillStyle = '#d9402c'; x.beginPath(); x.arc(a, b, 2.8, 0, 6.3); x.fill(); }
  if (o && o.target) { let [a, b] = P(o.target[0], o.target[1]); const dx = a - N / 2, dy = b - N / 2, d = Math.hypot(dx, dy); if (d > N / 2 - 9) { a = N / 2 + dx / d * (N / 2 - 9); b = N / 2 + dy / d * (N / 2 - 9); } x.fillStyle = '#e8c36a'; x.strokeStyle = '#3a2a10'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(a, b - 6); x.lineTo(a + 5, b); x.lineTo(a, b + 6); x.lineTo(a - 5, b); x.closePath(); x.fill(); x.stroke(); }
  const vg = x.createRadialGradient(N / 2, N / 2, N * 0.3, N / 2, N / 2, N * 0.5); vg.addColorStop(0, 'rgba(60,40,15,0)'); vg.addColorStop(1, 'rgba(60,40,15,.45)'); x.fillStyle = vg; x.fillRect(0, 0, N, N);
  x.translate(N / 2, N / 2); x.rotate(-PL.yaw + Math.PI); x.fillStyle = '#c8452f'; x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -8); x.lineTo(5.5, 6); x.lineTo(0, 3); x.lineTo(-5.5, 6); x.closePath(); x.fill(); x.stroke();
  x.restore();
}
