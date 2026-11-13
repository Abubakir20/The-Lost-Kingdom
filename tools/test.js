// Full playthrough test in real Chromium: game loop is stepped manually, rendering stubbed for speed.
const { open } = require('./shot.js');
(async () => {
  const { browser, page, logs } = await open(1120, 630);
  const ev = code => page.evaluate(`(()=>{${code}})()`);
  const sleep = ms => page.waitForTimeout(ms);
  let fails = 0; const chk = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) fails++; };
  await ev(`window.requestAnimationFrame=()=>0; window.__render=renderer.render.bind(renderer); renderer.render=()=>{};
    window.TT={now:performance.now()+500,frames(n,dt){dt=dt||1/60;for(let i=0;i<n;i++){this.now+=dt*1000;frame(this.now);}},key(c,t){window.dispatchEvent(new KeyboardEvent(t||'keydown',{code:c}))},md(b){canvas.dispatchEvent(new MouseEvent('mousedown',{button:b||0,bubbles:true}))},mu(b){window.dispatchEvent(new MouseEvent('mouseup',{button:b||0}))}};`);
  const frames = (n, dt) => ev(`TT.frames(${n},${dt || 1 / 60})`);
  const key = (c, t) => ev(`TT.key('${c}','${t || 'keydown'}')`);
  await sleep(200); await frames(5);
  chk('menu mode', await ev('return MODE') === 'menu');
  console.log('stats', JSON.stringify(await ev('let n=0;scene.traverse(o=>{if(o.isMesh)n++});return {meshes:n,circles:circles.length,boxes:boxes.length,nodes:NODES.length,inter:interactables.length,enemies:enemies.length,grass:grass.userData.max,trees:TREES.length}')));
  await page.click('#btnNew'); await sleep(700); await frames(10);
  chk('play mode after new game', await ev('return MODE') === 'play');
  await ev('keys.KeyW=true'); await frames(120); await ev('keys.KeyW=false');
  chk('player walked toward shrine', (await ev('return PL.pos.z')) < 65.9);
  await key('Space'); await frames(5); chk('airborne', await ev('return !PL.grounded')); await key('Space', 'keyup'); await frames(80); chk('landed', await ev('return PL.grounded'));
  // spirit
  await ev('placePlayer(0,61)'); await frames(10); chk('prompt for spirit', /spirit/.test(await ev('return nearInteract&&nearInteract._l') || ''));
  await key('KeyE'); chk('dialog opens', await ev('return MODE') === 'dialog'); await frames(30); chk('typewriter reveals text', (await ev('return $("dlgText").textContent.length')) > 10);
  for (let i = 0; i < 4; i++) await key('KeyE'); await key('Digit1'); await key('KeyE');
  chk('road quest active', await ev('return qState("road")==="active" && MODE==="play"'));
  // village + Maren
  await ev('placePlayer(78,36.6)'); await frames(40); chk('village discovered', await ev('return !!G.disc.village && G.q.road.stage===1'));
  await ev('findInteract()'); chk('maren prompt', /Maren/.test(await ev('return nearInteract&&nearInteract._l') || ''));
  await key('KeyE'); for (let i = 0; i < 6; i++) await key('KeyE');
  chk('bow + shards quest', await ev('return G.p.hasBow && qState("shards")==="active" && G.inv.arrow===15'));
  // bow via real mouse path
  await key('Digit2'); await ev('TT.md(0)'); await frames(40); await ev('TT.mu(0)'); await frames(3);
  chk('arrow fired', await ev('return G.inv.arrow===14 && projs.some(p=>p.live)')); await frames(240); await key('Digit1');
  // sword: click combo + charged spin through the input path
  await ev('placePlayer(20,50)'); await frames(5);
  await ev('TT.md(0);TT.mu(0)'); chk('click strikes immediately', await ev('return !!PL.atk && PL.atk.combo===0'));
  await frames(8); await ev('TT.md(0);TT.mu(0)'); await frames(16); await ev('TT.md(0);TT.mu(0)'); let c2 = false; for (let i = 0; i < 40; i++) { await frames(1); if (await ev('return PL.atk&&PL.atk.combo===2')) c2 = true; }
  chk('three-hit combo chains', c2); await frames(60);
  await ev('TT.md(0)'); await frames(50); await ev('TT.mu(0)'); chk('held click releases heavy spin', await ev('return !!PL.atk && PL.atk.heavy')); await frames(60);
  // combat vs goblin
  await ev('const e=enemies[0];placePlayer(e.pos.x+1.5,e.pos.z);');
  let killed = false; for (let i = 0; i < 60 && !killed; i++) { await ev('G.p.hp=G.p.maxHp;G.p.st=G.p.maxSt;startAttack(false)'); await frames(25); killed = !(await ev('return enemies[0].alive')); }
  chk('goblin killed by sword', killed); await ev('keys.KeyW=false'); await frames(120);
  console.log(' after fight', JSON.stringify(await ev('return {xp:G.p.xp,lvl:G.p.level,inv:G.inv,coins:G.p.coins,drops:drops.length,kills:G.kills}')));
  await ev('const e=enemies[1];e.alive||reviveEnemy(e);placePlayer(e.pos.x+1.2,e.pos.z);G.p.hp=G.p.maxHp'); await frames(220); chk('goblin hurt player', await ev('return G.p.hp<G.p.maxHp'));
  await ev('const e=enemies[1];G.p.hp=G.p.maxHp;damageEnemy(e,5,{});CAM.yaw=Math.atan2(PL.pos.x-e.pos.x,PL.pos.z-e.pos.z)'); await frames(12); chk('enemy health bar shown', await ev('return [...document.querySelectorAll(".ebar")].some(e=>e.style.display==="block")'));
  await key('KeyR'); chk('lock-on', await ev('return !!PL.lock')); await key('KeyF'); chk('dodge roll', await ev('return PL.rollT>0')); await frames(40); await ev('PL.lock=null;G.p.hp=G.p.maxHp');
  // blocking
  await ev('const e=enemies[2];e.alive||reviveEnemy(e);e.home={x:24,z:52};e.pos.set(24,groundAt(24,52),52);placePlayer(e.pos.x+1.2,e.pos.z);G.p.hp=G.p.maxHp;G.p.st=G.p.maxSt;TT.md(2)');
  let blocked = false; for (let i = 0; i < 260 && !blocked; i++) { await ev('const e=enemies[2];CAM.yaw=Math.atan2(PL.pos.x-e.pos.x,PL.pos.z-e.pos.z);TT.frames(1)'); blocked = await ev('return G.p.st<G.p.maxSt-5 && G.p.hp>G.p.maxHp-4'); }
  await ev('TT.mu(2)'); chk('shield blocks a hit', blocked);
  // chests
  for (const c of ['c_camp', 'c_mesa', 'c_islet']) { await ev(`G.p.hp=G.p.maxHp;const c=CHESTS.${c};placePlayer(c.x+1,c.z);`); await frames(12); await ev('findInteract()'); chk('chest prompt ' + c, await ev('return nearInteract&&nearInteract._l') === 'Open chest'); await key('KeyE'); await frames(40); }
  chk('3 shards, lids opened', await ev('return G.inv.shard===3 && shardCount()===3 && CHESTS.c_camp.lid.rotation.x<-1.5'));
  await ev('placePlayer(riverX(40),40)'); await frames(20); chk('swimming', await ev('return PL.swim'));
  // the Veilfall grotto: enter, take the hook, cross by rings, drop the slab, the golem shrugs off blows until stunned
  await ev('placePlayer(CAVE_MOUTH.x,CAVE_MOUTH.z+1.5)'); await frames(4); await ev('findInteract()'); chk('cave mouth prompt', await ev('return nearInteract&&nearInteract._l') === 'Enter the cave');
  await ev('enterCave()'); await new Promise(r => setTimeout(r, 900)); await frames(4); chk('inside the grotto', await ev('return inCave(PL.pos.x)&&regionName()==="Veilfall Grotto"&&qState("veil")==="active"'));
  await ev('placePlayer(327.5,7.6)'); await frames(3); await ev('findInteract();nearInteract&&nearInteract.act()'); await frames(3); chk('grappling hook found', await ev('return has("hook")'));
  /* turns the camera until the crosshair snaps to the wanted ring */
  const aimRing = ri => ev(`for(let q=-0.55;q<=1.3;q+=0.03){CAM.pitch=q;updateCamera(0.016,true);camera.updateMatrixWorld();if(RINGS.indexOf(hookTarget())===${ri})return true}return false`);
  const grap = async (x, z, yaw, pitch, n, ri) => { await ev(`hookRelease();placePlayer(${x},${z});PL.yaw=${yaw}+Math.PI;CAM.yaw=${yaw};CAM.pitch=${pitch};updateCamera(0.016,true)`); await frames(2); if (ri !== undefined) await aimRing(ri); await ev('fireHook()'); await frames(n); };
  await grap(338.6, 0, -Math.PI / 2, 0.1, 70, 0); chk('hook crosses the first chasm', await ev('return PL.pos.x>349&&PL.grounded&&HOOK.state==="none"'));
  await grap(354, 1.2, 0, -0.5, 70, 1); chk('hook climbs to the ledge', await ev('return PL.pos.y>6.5&&PL.grounded'));
  await grap(354, -6.2, 0, -0.1, 100, 2); chk('hangs from a free ring', await ev('return HOOK.state==="hang"'));
  await ev('CAM.yaw=0;CAM.pitch=-0.05;updateCamera(0.016,true)'); await frames(2); await aimRing(3); await ev('fireHook()'); await frames(110); chk('chains to the next ring and lands', await ev('return PL.pos.z<-34&&PL.grounded&&PL.pos.y>6.5'));
  await grap(356, -37, -Math.PI / 2, -0.2, 160, 4); chk('slab pulled down into a bridge', await ev('return !!G.flags.cv_slab&&SLAB.deck.on'));
  await ev('placePlayer(366,-37)'); await frames(200); chk('golem wakes', await ev('return golemFight&&golem.state!=="sleep"'));
  await ev('G.p.hp=G.p.maxHp;golem.state="walk";const h=golem.hp;damageEnemy(golem,30,{});window._gh=h'); chk('golem shrugs off blows', await ev('return golem.hp===_gh'));
  await ev('golem.state="stun";golem.t=0;damageEnemy(golem,30,{})'); chk('stunned golem takes damage', await ev('return golem.hp<_gh'));
  await ev('golem.hp=5;damageEnemy(golem,30,{})'); await frames(260); chk('golem defeated, reward and way home', await ev('return !golem.alive&&G.flags.golem&&CHESTS.c_golem.g.visible&&exitGate.visible'));
  await ev('G.p.hp=G.p.maxHp;placePlayer(350,0)'); await frames(5); await ev('PL.pos.set(343,0.5,0);PL.grounded=false'); await frames(60); await new Promise(r => setTimeout(r, 900)); await frames(4); chk('a fall puts you back on safe ground', await ev('return inCave(PL.pos.x)&&PL.pos.y>-1&&!PL.dead'));
  await ev('leaveCave()'); await new Promise(r => setTimeout(r, 900)); await frames(4); chk('back out by the falls', await ev('return !inCave(PL.pos.x)&&Math.hypot(PL.pos.x-CAVE_OUT.x,PL.pos.z-CAVE_OUT.z)<2'));
  await ev('G.p.hp=G.p.maxHp');
  // the hook bites anywhere: a cliff in the valley pulls you up to it
  await ev('placePlayer(40,-72);PL.yaw=Math.PI;CAM.yaw=0;CAM.pitch=-0.15;updateCamera(0.016,true)'); await frames(2);
  chk('hook aims at bare rock', await ev('return aimHook().ok&&!AIM.ring'));
  await ev('window._y0=PL.pos.y;fireHook()'); await frames(60); chk('free hook reels you up to the cliff', await ev('return PL.pos.y>_y0+3&&PL.pos.z<-78'));
  await ev('hookRelease();placePlayer(MESA.x,MESA.z);CAM.yaw=0;CAM.pitch=-0.55;updateCamera(0.016,true)'); await frames(2); chk('nothing to bite in open sky', await ev('return !aimHook().ok'));
  await ev('G.p.hp=G.p.maxHp');
  // houses can be climbed and their roofs walked on
  await ev('hookRelease();placePlayer(57,5);PL.yaw=Math.PI/2;CAM.yaw=-Math.PI/2;keys.KeyW=true'); let roofed = false, climbed2 = false;
  for (let i = 0; i < 20; i++) { await ev('G.p.st=G.p.maxSt'); await frames(10); if (await ev('return PL.climb')) climbed2 = true; if (await ev('return PL.grounded&&PL.pos.y>7')) roofed = true; }
  await ev('keys.KeyW=false'); chk('climbs a house wall', climbed2); chk('stands on the roof', roofed);
  await ev('G.p.hp=G.p.maxHp');
  // swimming under the stone bridge stays in the water; the deck above is still walkable
  await ev('placePlayer(BRIDGE.x+3.5,2);CAM.yaw=Math.PI;keys.KeyW=true;G.p.st=G.p.maxSt;window._uy=-9'); for (let i = 0; i < 24; i++) { await frames(10); await ev('G.p.st=G.p.maxSt;if(onBridge(PL.pos.x,PL.pos.z))_uy=Math.max(_uy,PL.pos.y)'); }
  await ev('keys.KeyW=false'); chk('swims under the bridge', await ev('return _uy>-9&&_uy<-1.5&&PL.pos.z>BRIDGE.z+BRIDGE.w'));
  await ev('placePlayer(BRIDGE.x-14,BRIDGE.z);CAM.yaw=-Math.PI/2;keys.KeyW=true'); await frames(330); await ev('keys.KeyW=false'); const dk = await ev('return [PL.pos.x-BRIDGE.x,PL.pos.y,PL.pos.z,PL.swim]'); chk('walks across the bridge deck', dk[0] > 10 && !dk[3]);
  await ev('placePlayer(40-17.5,-95);CAM.yaw=-Math.PI/2;keys.KeyW=true;G.p.st=G.p.maxSt'); let climbed = false; for (let i = 0; i < 40; i++) { await frames(10); if (await ev('return PL.climb')) climbed = true; }
  await ev('keys.KeyW=false'); chk('climb state seen', climbed); chk('reached mesa top', await ev('return PL.pos.y>10'));
  await ev('placePlayer(40,-95);CAM.yaw=Math.PI/2;keys.KeyW=true;G.p.st=G.p.maxSt'); await frames(30); await key('Space'); await frames(8); await key('Space', 'keyup'); await frames(2); await key('Space');
  let gl = false; for (let i = 0; i < 40; i++) { await frames(5); if (await ev('return PL.glide')) gl = true; } await ev('keys.KeyW=false;keys.Space=false'); chk('glide seen', gl); await frames(120);
  // hand-in
  await ev('G.p.hp=G.p.maxHp;placePlayer(78,36.6)'); await frames(12); await ev('findInteract()'); await key('KeyE'); for (let i = 0; i < 4; i++) await key('KeyE');
  chk('key + ember + temple quest', await ev('return G.inv.key===1 && G.p.ember && qState("temple")==="active"'));
  // temple
  await ev('placePlayer(-75,-40)'); await frames(12); await ev('findInteract()'); chk('gate prompt', /Unseal/.test(await ev('return nearInteract&&nearInteract._l') || '')); await key('KeyE'); await frames(200);
  chk('entry gate open', await ev('return gates.entry.open && !gates.entry.box.on'));
  await ev('CAM.yaw=Math.PI/2;keys.KeyW=true'); await frames(150); await ev('keys.KeyW=false'); chk('walked into room 1', await ev('return PL.pos.x<-79 && PL.pos.x>-98'));
  await ev('placePlayer(-94,-40);CAM.yaw=Math.PI/2;keys.KeyW=true'); await frames(120); await ev('keys.KeyW=false'); chk('gate 1 blocks', await ev('return PL.pos.x>-98'));
  await ev('placePlayer(-83.5,-46);CAM.yaw=Math.PI/2;keys.KeyW=true;for(let i=0;i<600&&temple.block.position.x>-90;i++)TT.frames(1);keys.KeyW=false');
  await ev('placePlayer(temple.block.position.x,-49.5);CAM.yaw=Math.PI;keys.KeyW=true;for(let i=0;i<900&&!G.flags.puz1;i++)TT.frames(1);keys.KeyW=false');
  chk('puzzle 1 solved by pushing the block', await ev('return !!G.flags.puz1')); await frames(200);
  for (const [px, i, want] of [[-102, 0, 0], [-106, 1, 3], [-110, 2, 1]]) { await ev(`placePlayer(${px},-48)`); await frames(10); for (let t = 0; t < 5 && (await ev(`return pilState(${i})`)) !== want; t++) { await ev('findInteract()'); await key('KeyE'); await frames(5); } }
  chk('puzzle 2 solved', await ev('return !!G.flags.puz2')); await frames(200);
  await ev('for(const e of enemies)if(e.type==="sentinel")killEnemy(e)');
  for (const bz of [-50, -30]) { await ev(`placePlayer(-118,${bz});const b=temple.braziers.find(b=>b.z===${bz});_v1.set(PL.pos.x,PL.pos.y+1.4,PL.pos.z);_v3.set(b.x-_v1.x,b.y-_v1.y,b.z-_v1.z).normalize();spawnProj('fire',_v1,_v3,32,20,true)`); await frames(40); }
  chk('braziers lit', await ev('return temple.braziers.every(b=>b.lit)'));
  await ev(`placePlayer(-118,-40);const e=temple.eye;_v1.set(PL.pos.x,PL.pos.y+1.4,PL.pos.z);const d=Math.hypot(e.x-_v1.x,e.y-_v1.y,e.z-_v1.z),tt=d/55;_v3.set(e.x-_v1.x,e.y-_v1.y+0.5*9*tt*tt,e.z-_v1.z).normalize();spawnProj('arrow',_v1,_v3,55,20,true)`); await frames(60);
  chk('puzzle 3 solved', await ev('return !!G.flags.puz3')); await frames(200); chk('gate 3 open', await ev('return !gates.g3.box.on'));
  await ev('placePlayer(-120,-40);G.p.mp=50;PL.emberCd=0'); await key('KeyQ'); await frames(5); chk('ember bolt spends magic', await ev('return G.p.mp<50'));
  // boss
  await ev('placePlayer(-134,-40)'); await frames(30); chk('boss wakes with a cinematic', await ev('return bossFight && boss.state==="wake" && !!cine && document.body.classList.contains("cine")'));
  chk('gate 3 closes during the fight', await ev('return gates.g3.open===false'));
  await frames(260); chk('cinematic ends, control returns', await ev('return !cine && !document.body.classList.contains("cine") && boss.state!=="wake"'));
  const res = await ev(`const seen=new Set();let heals=0,cines=0,was=false;for(let i=0;i<3500&&boss.alive;i++){TT.frames(2);seen.add(boss.state);if(cine&&!was)cines++;was=!!cine;if(i%10===0){if(G.p.hp<40){heals++;G.p.hp=G.p.maxHp}if(PL.dead){PL.dead=false;G.p.hp=G.p.maxHp;if(MODE!=="play")setMode("play")}damageEnemy(boss,boss.state==="stun"?30:8,{})}}return {seen:[...seen],heals,cines,phase:boss.phase}`);
  console.log(' boss', JSON.stringify(res));
  chk('boss used slam, roots and stun', res.seen.includes('slamWind') && res.seen.includes('roots') && res.seen.includes('stun'));
  chk('boss reached phase 2 with its own cinematic', res.phase === 2 && res.cines >= 1);
  chk('boss dead', await ev('return !boss.alive && G.flags.boss && !bossFight'));
  await frames(420); chk('death cinematic finished, time restored', await ev('return !cine && timeScale===1 && CHESTS.c_boss.g.visible'));
  await ev('if(MODE!=="play")setMode("play");PL.dead=false;G.p.hp=G.p.maxHp;placePlayer(-144,-40)'); await frames(20); await ev('findInteract()'); await key('KeyE'); await frames(5);
  chk('heart obtained', await ev('return G.inv.heart===1'));
  // panels
  for (const [k, t] of [['Tab', 'inventory'], ['KeyJ', 'journal'], ['KeyM', 'map']]) { await key(k); chk('panel ' + t, await ev(`return MODE==="panel"&&panelTab==="${t}"&&$("panelBody").innerHTML.length>300`)); await key('Escape'); }
  await ev('giveItem("herb",3);craft(0)'); chk('craft potion', await ev('return G.inv.potion>=2'));
  await ev('G.p.hp=20;useItem("potion")'); chk('potion heals', await ev('return G.p.hp===70'));
  await ev('openPanel("shop")'); const c0 = await ev('return G.p.coins'); await page.click('[data-act="buy:0"]'); chk('buy potion in shop', (await ev('return G.p.coins')) === c0 - 20); await ev('closePanel()');
  await ev('travelTo("shrine")'); await sleep(700); await frames(5); chk('fast travel to shrine', await ev('return Math.hypot(PL.pos.x-1.6,PL.pos.z-57.1)<1'));
  await ev('autosave()'); chk('save written', (await ev('return (localStorage.getItem("tlk_save_v1")||"").length')) > 200);
  await ev('placePlayer(0,61)'); await frames(12); await ev('findInteract()'); await key('KeyE'); for (let i = 0; i < 6; i++) await key('KeyE');
  chk('ending shown, temple quest done', await ev('return MODE==="end" && qState("temple")==="done"'));
  await page.click('#btnEnd'); await frames(5);
  await ev('hurtPlayer(9999,0,0,{unblockable:true})'); await frames(5); await sleep(1100); chk('death screen', await ev('return MODE') === 'dead'); await page.click('#btnRespawn'); await sleep(700); await frames(5); chk('respawned', await ev('return MODE==="play"&&G.p.hp===G.p.maxHp&&!PL.dead'));
  await key('Escape'); chk('pause', await ev('return MODE') === 'pause'); await page.click('#btnTitle'); chk('title', await ev('return MODE') === 'menu'); chk('continue enabled', await ev('return !$("btnContinue").disabled'));
  await frames(5); await page.click('#btnContinue'); await sleep(700); await frames(10);
  chk('continue restores state', await ev('return MODE==="play" && G.inv.heart===1 && G.flags.boss && !boss.g.visible && qState("temple")==="done" && G.p.hasBow && CHESTS.c_camp.lid.rotation.x<-1 && gates.g3.open'));
  await ev('window.__s=localStorage.getItem("tlk_save_v1");localStorage.setItem("tlk_save_v1","{broken")'); chk('corrupt save handled', await ev('return readSave()') === null);
  await ev('localStorage.setItem("tlk_save_v1",\'{"v":1,"p":{"x":"a"}}\')'); chk('invalid save handled', await ev('return readSave()') === null); await ev('localStorage.setItem("tlk_save_v1",window.__s)');
  await ev('setMode("pause")'); await page.click('#btnPauseSettings'); await page.selectOption('#setQuality', 'low'); chk('quality low', await ev('return SETTINGS.quality==="low" && grass.count<grass.userData.max*0.4 && !sun.castShadow'));
  await page.selectOption('#setQuality', 'high'); chk('quality high', await ev('return grass.count===grass.userData.max && sun.castShadow')); await page.selectOption('#setQuality', 'medium'); await page.click('#btnSettingsBack'); await ev('setMode("play")');
  // soak: random input all over the map
  const soak = await ev(`const codes=['KeyW','KeyA','KeyS','KeyD','ShiftLeft','Space','KeyF','KeyQ','KeyR','KeyC','KeyE','Digit1','Digit2','Digit3'];const spots=[[0,61],[78,22],[-85,66],[-95,20],[40,-95],[-25,-150],[-90,-40],[-145,-40],[100,-5],[-140,40]];
    for(let i=0;i<3000;i++){if(i%300===0){const s=spots[(i/300)|0];G.p.hp=G.p.maxHp;PL.dead=false;placePlayer(s[0],s[1]);}
      if(i%15===0){const c=codes[(Math.random()*codes.length)|0];TT.key(c,Math.random()<0.6?'keydown':'keyup');if(Math.random()<0.3){TT.md(Math.random()<0.7?0:2)}if(Math.random()<0.3){TT.mu(0);TT.mu(2)}CAM.yaw+=Math.random()-0.5}
      if(MODE==='dialog'){TT.key('Digit3');TT.key('KeyE')} if(MODE==='panel')closePanel(); else if(MODE!=='play'&&MODE!=='dialog'){PL.dead=false;G.p.hp=G.p.maxHp;setMode('play')}
      TT.frames(1,1/30);}
    return isFinite(PL.pos.x+PL.pos.y+PL.pos.z)`);
  chk('soak: 3000 random-input frames, position finite', soak);
  await ev('G.time=0.95;weather.raining=true;rainAmt=1;TT.frames(60)'); chk('night + rain run', await ev('return nightAmt>0.9 && rain.visible'));
  await ev('renderer.render=window.__render;TT.frames(3)');
  const errs = [...new Set(logs.filter(l => !/GPU stall|ReadPixels|GL Driver/.test(l)))];
  console.log('CONSOLE ERRORS', errs.length); errs.slice(0, 10).forEach(e => console.log('  ' + e));
  console.log(fails ? 'FAILED ' + fails : 'ALL PASSED'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
})().catch(e => { console.log('TEST CRASH', e.stack.slice(0, 1500)); process.exit(1); });
