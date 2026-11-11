/* ============ world: renderer, materials, sky, terrain, water, vegetation ============ */
const canvas = $('game');
let renderer;
try { renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { $('fatal').style.display = 'flex'; throw e; }
renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
const scene = new T.Scene();
scene.fog = new T.Fog(0xbfe6f5, 55, 430);
const camera = new T.PerspectiveCamera(60, 1, 0.3, 2400);
const hemi = new T.HemisphereLight(0xdcefff, 0x7fa05a, 0.6); scene.add(hemi);
const sun = new T.DirectionalLight(0xfff2d6, 0.8); scene.add(sun); scene.add(sun.target);
sun.castShadow = true; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05; sun.shadow.radius = 2.5;
{ const c = sun.shadow.camera; c.left = -52; c.right = 52; c.top = 52; c.bottom = -52; c.near = 10; c.far = 340; }

const circles = [], boxes = [];
const addCircle = (x, z, r, top) => { const c = { x, z, r, on: true, top }; circles.push(c); return c; };   // top: world height of a surface you can stand on
const addBox = (x0, x1, z0, z1, top) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), on: true, top }; boxes.push(b); return b; };
let hitTop = null;   // lowest standable top touched by the last resolveCollide that was given a height
function resolveCollide(p, r, y) {
  hitTop = null;
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i]; if (!c.on) continue;
    if (y !== undefined && c.top !== undefined && y >= c.top - 0.3) continue;
    const dx = p.x - c.x, dz = p.z - c.z, m = r + c.r;
    if (dx > m || dx < -m || dz > m || dz < -m) continue;
    const d = Math.hypot(dx, dz);
    if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; if (c.top !== undefined && (hitTop === null || c.top < hitTop)) hitTop = c.top; }
  }
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i]; if (!b.on) continue;
    if (y !== undefined && b.top !== undefined && y >= b.top - 0.3) continue;
    if (p.x > b.x0 - r && p.x < b.x1 + r && p.z > b.z0 - r && p.z < b.z1 + r) {
      if (b.top !== undefined && (hitTop === null || b.top < hitTop)) hitTop = b.top;
      const pl = p.x - (b.x0 - r), pr = (b.x1 + r) - p.x, pn = p.z - (b.z0 - r), pf = (b.z1 + r) - p.z, m = Math.min(pl, pr, pn, pf);
      if (m === pl) p.x = b.x0 - r; else if (m === pr) p.x = b.x1 + r; else if (m === pn) p.z = b.z0 - r; else p.z = b.z1 + r;
    }
  }
}
/* highest standable top under a point, counting only tops at or below the feet (never snaps up from underneath) */
function platformAt(x, z, y) {
  let h = -1e9; const pad = 0.25;
  for (let i = 0; i < circles.length; i++) { const c = circles[i]; if (c.top === undefined || !c.on || c.top > y + 0.35 || c.top <= h) continue; const dx = x - c.x, dz = z - c.z, m = c.r + pad; if (dx * dx + dz * dz < m * m) h = c.top; }
  for (let i = 0; i < boxes.length; i++) { const b = boxes[i]; if (b.top === undefined || !b.on || b.top > y + 0.35 || b.top <= h) continue; if (x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad) h = b.top; }
  return h;
}
function insideBox(x, z, pad) {
  for (let i = 0; i < boxes.length; i++) { const b = boxes[i]; if (b.on && x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad) return true; }
  return false;
}

/* ---------- materials: cel shading with a soft three-band ramp ---------- */
const TOON = (() => { const v = [46, 46, 96, 170, 236, 255], d = new Uint8Array(24); v.forEach((s, i) => { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = s; d[i * 4 + 3] = 255; }); const t = new T.DataTexture(d, 6, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
const _mats = {};
const lam = (c, o) => { const k = 'l' + c + (o ? JSON.stringify(o) : ''); return _mats[k] || (_mats[k] = new T.MeshToonMaterial(Object.assign({ color: c, gradientMap: TOON }, o))); };
const glowMat = (c, o) => { const k = 'g' + c + (o ? JSON.stringify(o) : ''); return _mats[k] || (_mats[k] = new T.MeshBasicMaterial(Object.assign({ color: c }, o))); };
function mesh(geo, material, x, y, z, parent, noShadow) {
  const m = new T.Mesh(geo, material); m.position.set(x, y, z);
  if (!noShadow) { m.castShadow = true; m.receiveShadow = true; }
  (parent || scene).add(m); return m;
}
const _geo = {};
const bx = (w, h, d) => new T.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 8) => new T.CylinderGeometry(rt, rb, h, s);
const sph = (r, w = 10, h = 8) => new T.SphereGeometry(r, w, h);
const STONE = 0x929b93, STONE_D = 0x717d77, MOSS = 0x6f9a45, RUNE = 0x7ff3e0, GOLD = 0xe8c36a, TIMBER = 0x6e4226;
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const glowTex = (() => { const c = makeCanvas(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(0.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
const nightHalos = [];
/* soft additive glow; night=true makes it fade in after dusk */
function halo(parent, x, y, z, size, color, op = 0.55, night) {
  const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: night ? 0 : op, blending: T.AdditiveBlending, depthWrite: false }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); (parent || scene).add(s); if (night) { s.userData.op = op; nightHalos.push(s); } return s;
}
/* static scenery is merged per material once it is built: far fewer draw calls */
function bake(group, shadow = true) {
  group.updateMatrixWorld(true);
  const by = new Map(), keep = [];
  group.traverse(o => { if (o.isSprite || o.isLight) { keep.push(o); return; } if (!o.isMesh) return; if (o.userData.live) { keep.push(o); return; } const k = o.material.uuid + (o.castShadow ? 's' : 'n'); if (!by.has(k)) by.set(k, { mat: o.material, cast: o.castShadow, list: [] }); by.get(k).list.push(o); });
  const out = new T.Group();
  for (const b of by.values()) {
    let n = 0; const parts = b.list.map(o => { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld); n += g.attributes.position.count; return g; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), vc = b.mat.vertexColors ? new Float32Array(n * 3).fill(1) : null; let off = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, off); if (g.attributes.normal) nor.set(g.attributes.normal.array, off); if (vc && g.attributes.color) vc.set(g.attributes.color.array, off); off += g.attributes.position.count * 3; g.dispose(); }
    const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(pos, 3)); mg.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (vc) mg.setAttribute('color', new T.BufferAttribute(vc, 3));
    const m = new T.Mesh(mg, b.mat); m.castShadow = shadow && b.cast; m.receiveShadow = shadow; m.matrixAutoUpdate = false; out.add(m);
  }
  const par = group.parent; par.remove(group); par.add(out);
  for (const o of keep) { const wp = new T.Vector3(), wq = new T.Quaternion(), ws = new T.Vector3(); o.matrixWorld.decompose(wp, wq, ws); out.add(o); o.position.copy(wp); o.quaternion.copy(wq); o.scale.copy(ws); }
  return out;
}

/* ---------- painted textures (generated for the game, embedded as data URIs) ---------- */
const PAINT = {};
function paintTex(name) {
  if (PAINT[name]) return PAINT[name];
  const src = (window.TLK_TEX || {})[name], img = new Image(), t = new T.Texture(img), gain = new T.Vector3(1, 1, 1);
  t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; t.triGain = gain;
  if (src) {
    img.onload = () => {
      t.needsUpdate = true;
      try {   // average colour, so the texture adds painted detail without shifting a material's own colour
        const c = makeCanvas(16, 16), x = c.getContext('2d'); x.drawImage(img, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } const n = d.length / 4;
        gain.set(255 * n / Math.max(r, 1), 255 * n / Math.max(g, 1), 255 * n / Math.max(b, 1));
      } catch (e) { /* keep neutral gain */ }
    };
    img.src = src;
  } else { const c = makeCanvas(2, 2), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 2, 2); t.image = c; t.needsUpdate = true; }
  return (PAINT[name] = t);
}
/* triplanar texturing in object space (static scenery is baked in world space, so it lines up; moving characters keep their texture); mode 'roof' projects along X so tile rows follow the eaves */
function painted(mat, name, scale, amount = 0.9, o = {}) {
  if (mat.userData.painted) return mat;
  const tex = paintTex(name), tex2 = o.side ? paintTex(o.side) : null;
  mat.userData.painted = name;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.tTri = { value: tex }; sh.uniforms.triGain = { value: tex.triGain }; sh.uniforms.triScale = { value: scale }; sh.uniforms.triAmt = { value: amount };
    if (tex2) { sh.uniforms.tTri2 = { value: tex2 }; sh.uniforms.triGain2 = { value: tex2.triGain }; sh.uniforms.triScale2 = { value: o.sideScale || scale }; }
    sh.vertexShader = 'varying vec3 vTriP;\nvarying vec3 vTriN;\n' + sh.vertexShader.replace('#include <fog_vertex>', [
      '#include <fog_vertex>', '{ mat4 tm = mat4(1.0);', '#ifdef USE_INSTANCING', 'tm = instanceMatrix;', '#endif',
      'vTriP = (tm * vec4(transformed, 1.0)).xyz; vTriN = normalize(mat3(tm) * objectNormal); }'].join('\n'));
    const side = tex2 ? 'uniform sampler2D tTri2; uniform vec3 triGain2; uniform float triScale2;\n' : '';
    let body;
    if (o.mode === 'roof') body = 'vec3 tx = texture2D(tTri, vec2(vTriP.z, vTriP.y * 1.35) * triScale).rgb * triGain;';
    else body = [
      'vec3 bw = pow(abs(normalize(vTriN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z + 1e-5);',
      tex2 ? 'vec3 sx = texture2D(tTri2, vTriP.zy * triScale2).rgb * triGain2; vec3 sz = texture2D(tTri2, vTriP.xy * triScale2).rgb * triGain2;'
           : 'vec3 sx = texture2D(tTri, vTriP.zy * triScale).rgb * triGain; vec3 sz = texture2D(tTri, vTriP.xy * triScale).rgb * triGain;',
      'vec3 tx = sx * bw.x + texture2D(tTri, vTriP.xz * triScale).rgb * triGain * bw.y + sz * bw.z;'].join('\n');
    sh.fragmentShader = 'uniform sampler2D tTri; uniform vec3 triGain; uniform float triScale; uniform float triAmt;\n' + side + 'varying vec3 vTriP;\nvarying vec3 vTriN;\n' +
      sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n{ ' + body + '\ndiffuseColor.rgb *= mix(vec3(1.0), clamp(tx, 0.0, 2.2), triAmt); }');
  };
  mat.customProgramCacheKey = () => 'tri:' + name + ':' + (o.side || '') + ':' + (o.mode || '') + ':' + mat.type;
  mat.needsUpdate = true;
  return mat;
}

/* ---------- sky ---------- */
const skyU = { top: { value: new T.Color(0x3f8fe0) }, bot: { value: new T.Color(0xbfe6f5) }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunCol: { value: new T.Color(0xfff2d6) }, glow: { value: 1 }, pano: { value: null }, panoAmt: { value: 0 }, panoTint: { value: new T.Color(0xffffff) } };
{ const src = (window.TLK_ART || {}).sky; if (src) { const img = new Image(), t = new T.Texture(img); t.wrapS = T.MirroredRepeatWrapping; t.wrapT = T.ClampToEdgeWrapping; t.minFilter = T.LinearFilter; t.generateMipmaps = false; img.onload = () => { t.needsUpdate = true; skyU.pano.value = t; skyU.panoAmt.value = 1; }; img.src = src; } }
const sky = new T.Mesh(new T.SphereGeometry(1900, 32, 16), new T.ShaderMaterial({
  uniforms: skyU, side: T.BackSide, depthWrite: false,
  vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: ['uniform vec3 top;uniform vec3 bot;uniform vec3 sunDir;uniform vec3 sunCol;uniform float glow;uniform sampler2D pano;uniform float panoAmt;uniform vec3 panoTint;varying vec3 vP;',
    'void main(){vec3 d=normalize(vP);float h=max(d.y,0.0);',
    'vec3 c=mix(bot,top,pow(h,0.48));',
    'if(panoAmt>0.0){float az=atan(d.z,d.x)/3.14159265;float v=(asin(clamp(d.y,-1.0,1.0))-0.03)/1.25;',
    'vec3 p=texture2D(pano,vec2(az,clamp(v,0.0,1.0))).rgb*panoTint;',
    'c=mix(c,p,panoAmt*smoothstep(-0.02,0.05,v)*(1.0-smoothstep(0.72,1.0,v)));}',
    'float s=max(dot(d,sunDir),0.0);',
    'c+=sunCol*glow*(pow(s,6.0)*0.16+pow(s,40.0)*0.3);',
    'c+=sunCol*(smoothstep(0.9993,0.9997,s)*1.6);',
    'c=mix(c,bot*1.06+sunCol*glow*0.1*pow(s,3.0),pow(1.0-h,9.0)*mix(0.7,0.3,step(0.001,panoAmt)));',
    'gl_FragColor=vec4(c,1.0);}'].join('\n'),
}));
scene.add(sky);
const clouds = [], cloudMat = new T.MeshBasicMaterial({ vertexColors: true, fog: false });
{
  const cg = new T.SphereGeometry(1, 12, 8), cp = cg.attributes.position, cc = new Float32Array(cp.count * 3);
  for (let i = 0; i < cp.count; i++) { const k = smooth(-0.9, 0.6, cp.getY(i)); cc[i * 3] = lerp(0.84, 1, k); cc[i * 3 + 1] = lerp(0.88, 1, k); cc[i * 3 + 2] = lerp(0.97, 1, k); }
  cg.setAttribute('color', new T.BufferAttribute(cc, 3));
  for (let i = 0; i < 26; i++) {
    const g = new T.Group(), n = 4 + (rng() * 5 | 0), big = 26 + rng() * 34;
    for (let j = 0; j < n; j++) { const s = big * (0.55 + rng() * 0.6) * (1 - Math.abs(j - n / 2) / n * 0.8); const m = mesh(cg, cloudMat, (j - n / 2) * big * 0.62 + rng() * 10, s * 0.22 + rng() * 5, rng() * 26 - 13, g, true); m.scale.set(s * 1.25, s * 0.5, s * 0.95); }
    const a = rng() * 6.283, r = 420 + rng() * 950; g.position.set(Math.cos(a) * r, 200 + rng() * 170, Math.sin(a) * r); g.rotation.y = rng() * 0.6 - 0.3; scene.add(g); clouds.push(g);
  }
}
const moon = mesh(sph(34, 16, 12), new T.MeshBasicMaterial({ color: 0xe6eeff, fog: false }), 0, -999, 0, scene, true);
const stars = (() => {
  const n = 700, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const th = rng() * Math.PI * 2, ph = Math.acos(rng()); a[i * 3] = Math.sin(ph) * Math.cos(th) * 1800; a[i * 3 + 1] = Math.cos(ph) * 1800 + 20; a[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 1800; }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3));
  const p = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 2.1, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  p.frustumCulled = false; scene.add(p); return p;
})();
/* far ranges beyond the valley: painted with their own haze so they read at any distance */
const farMat = new T.MeshLambertMaterial({ vertexColors: true, fog: false });
{
  const g = new T.Group();
  const peak = (a, r, hgt, wid, tone) => {
    const geo = new T.ConeGeometry(wid, hgt, 9, 5).toNonIndexed(), p = geo.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = (y + hgt / 2) / hgt, j = 1 + 0.28 * Math.sin(x * 0.07 + y * 0.05 + a * 7) * Math.cos(z * 0.06 + a * 3);
      if (k < 0.98) { p.setX(i, x * j); p.setZ(i, z * j); p.setY(i, y + Math.sin(x * 0.05 + z * 0.04 + a) * hgt * 0.05 * (1 - k)); }
      const sn = smooth(0.58, 0.74, k + 0.08 * Math.sin(x * 0.11 + z * 0.13));
      c[i * 3] = lerp(lerp(0.50, 0.42, k), 0.96, sn) * tone; c[i * 3 + 1] = lerp(lerp(0.66, 0.55, k), 0.98, sn) * tone; c[i * 3 + 2] = lerp(lerp(0.70, 0.70, k), 1.0, sn) * (tone * 0.5 + 0.5);
    }
    geo.setAttribute('color', new T.BufferAttribute(c, 3)); geo.computeVertexNormals();
    const m = new T.Mesh(geo, farMat); m.position.set(Math.cos(a) * r, hgt / 2 - 30, Math.sin(a) * r); m.rotation.y = a * 3; g.add(m);
  };
  for (let i = 0; i < 30; i++) { const a = i / 30 * 6.283 + rng() * 0.12; peak(a, 640 + rng() * 120, 190 + rng() * 170, 150 + rng() * 90, 1); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + rng() * 0.3; peak(a, 1050 + rng() * 150, 380 + rng() * 260, 240 + rng() * 120, 1.12); }
  // the ruined citadel of Eldoria, far to the north-east: a promise of the regions to come
  const cm = new T.MeshBasicMaterial({ color: 0x5f7fa8, fog: false }), cx = 430, cz = -520;
  const cb = (w, h, d, x, y, z) => { const m = new T.Mesh(bx(w, h, d), cm); m.position.set(cx + x, y + h / 2 + 40, cz + z); g.add(m); };
  cb(120, 60, 80, 0, 0, 0); cb(26, 150, 26, -30, 40, 0); cb(18, 96, 18, 34, 40, 10); cb(14, 70, 14, 4, 50, -24); cb(40, 26, 40, -30, 190, 0);
  { const sp = new T.Mesh(new T.ConeGeometry(22, 70, 6), cm); sp.position.set(cx - 30, 40 + 216 + 35, cz); g.add(sp); const s2 = new T.Mesh(new T.ConeGeometry(13, 44, 6), cm); s2.position.set(cx + 34, 40 + 136 + 22, cz + 10); g.add(s2); }
  halo(g, cx - 30, 300, cz, 150, 0xff6a5a, 0.5);
  g.traverse(o => { o.matrixAutoUpdate = false; o.updateMatrix(); }); g.visible = !(window.TLK_ART || {}).sky; scene.add(g);
}
const SKY_KEYS = [ // time, zenith, horizon, sun colour, sun, hemi, ground bounce, fog near
  [0.00, 0x0a1838, 0x24406e, 0x9db8ff, 0.34, 0.40, 0x27384a, 40],
  [0.20, 0x0a1838, 0x24406e, 0x9db8ff, 0.34, 0.40, 0x27384a, 40],
  [0.245, 0x35508f, 0xf4a27a, 0xffb07a, 0.50, 0.46, 0x5a5a50, 26],
  [0.29, 0x4f8fd8, 0xffd9a8, 0xffdcae, 0.74, 0.54, 0x7f9a5a, 30],
  [0.37, 0x3a8be6, 0xc4eaf8, 0xffedc8, 0.86, 0.60, 0x8aa860, 55],
  [0.64, 0x3a8be6, 0xc4eaf8, 0xffedc8, 0.86, 0.60, 0x8aa860, 55],
  [0.71, 0x4a78c8, 0xffd08a, 0xffc880, 0.78, 0.54, 0x8a9a56, 45],
  [0.76, 0x4a4a9a, 0xff8e62, 0xff8a52, 0.56, 0.46, 0x6a5a58, 36],
  [0.80, 0x1b2458, 0x6a4e86, 0xb9a0e0, 0.36, 0.42, 0x34384e, 38],
  [0.85, 0x0a1838, 0x24406e, 0x9db8ff, 0.34, 0.40, 0x27384a, 40],
  [1.00, 0x0a1838, 0x24406e, 0x9db8ff, 0.34, 0.40, 0x27384a, 40],
];
const _c1 = new T.Color(), _c2 = new T.Color();
let nightAmt = 0, rainAmt = 0, flashAmt = 0;
const windowMat = new T.MeshToonMaterial({ color: 0x4a6a86, gradientMap: TOON, emissive: 0xffc56a, emissiveIntensity: 0 });
function updateSky(time, focus) {
  let i = 0; while (i < SKY_KEYS.length - 2 && time > SKY_KEYS[i + 1][0]) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1], t = smooth(0, 1, clamp((time - a[0]) / (b[0] - a[0] || 1), 0, 1));
  skyU.top.value.copy(_c1.setHex(a[1])).lerp(_c2.setHex(b[1]), t);
  skyU.bot.value.copy(_c1.setHex(a[2])).lerp(_c2.setHex(b[2]), t);
  if (rainAmt > 0) { _c1.setHex(nightAmt > 0.5 ? 0x26303c : 0x8492a0); skyU.top.value.lerp(_c1, rainAmt * 0.8); skyU.bot.value.lerp(_c1, rainAmt * 0.7); }
  if (flashAmt > 0) { _c1.setHex(0xffffff); skyU.top.value.lerp(_c1, flashAmt * 0.6); skyU.bot.value.lerp(_c1, flashAmt * 0.6); }
  scene.fog.color.copy(skyU.bot.value);
  sun.color.copy(_c1.setHex(a[3])).lerp(_c2.setHex(b[3]), t); skyU.sunCol.value.copy(sun.color);
  sun.intensity = lerp(a[4], b[4], t) * (1 - rainAmt * 0.4) + flashAmt;
  hemi.intensity = lerp(a[5], b[5], t) + flashAmt * 0.6;
  hemi.color.copy(skyU.top.value).lerp(_c1.setHex(0xffffff), 0.62);
  hemi.groundColor.copy(_c1.setHex(a[6])).lerp(_c2.setHex(b[6]), t);
  const ang = (time - 0.25) * Math.PI * 2; let sx = Math.cos(ang) * 0.78, sy = Math.sin(ang), sz = 0.42;
  nightAmt = smooth(0.06, -0.14, sy);
  const isNight = sy < -0.02;
  if (isNight) { sx = -sx; sy = -sy; }
  const l0 = Math.hypot(sx, sy, sz); skyU.sunDir.value.set(sx / l0, sy / l0, sz / l0); skyU.glow.value = (isNight ? 0.35 : 1) * (1 - rainAmt * 0.8);
  if (isNight) { moon.position.set(camera.position.x + sx / l0 * 1700, camera.position.y + sy / l0 * 1700, camera.position.z + sz / l0 * 1700); skyU.sunCol.value.setRGB(0, 0, 0); } else moon.position.y = -9999;
  sy = Math.max(sy, 0.24); const l = Math.hypot(sx, sy, sz); sx /= l; sy /= l; sz /= l;
  sun.position.set(focus.x + sx * 140, focus.y + sy * 140, focus.z + sz * 140); sun.target.position.copy(focus);
  stars.material.opacity = nightAmt * (1 - rainAmt) * (0.75 + 0.25 * Math.sin(time * 9000)); stars.position.copy(camera.position); sky.position.copy(camera.position);
  scene.fog.near = lerp(lerp(a[7], b[7], t), 14, rainAmt); scene.fog.far = lerp(QUALITY.fog, 190, rainAmt);
  if (skyU.pano.value) { skyU.panoTint.value.copy(sun.color).lerp(_c1.setHex(0xffffff), 0.55).multiplyScalar(lerp(1, 0.2, nightAmt)); if (nightAmt > 0.01) skyU.panoTint.value.lerp(_c1.setRGB(0.1, 0.14, 0.3), nightAmt * 0.6); skyU.panoAmt.value = 1 - rainAmt * 0.75; for (let k = 0; k < clouds.length; k++) clouds[k].visible = false; }
  waterU.uSky.value.copy(skyU.bot.value); waterU.uDay.value = 1 - nightAmt * 0.8; { const k = 1 - nightAmt * 0.72 - rainAmt * 0.25; waterU.uShallow.value.setRGB(0.42 * k, 0.84 * k, 0.74 * k); waterU.uDeep.value.setRGB(0.10 * k, 0.50 * k, 0.60 * k); water.userData.far.material.color.setRGB(0.18 * k, 0.58 * k, 0.7 * k); }
  // clouds and far ranges take on the colour of the hour
  cloudMat.color.copy(sun.color).lerp(_c1.setHex(0xffffff), 0.6).multiplyScalar(lerp(1, 0.34, nightAmt) * (1 - rainAmt * 0.35));
  farMat.color.copy(skyU.bot.value).lerp(_c1.setHex(0xffffff), 0.55 - nightAmt * 0.35); farMat.emissive.copy(skyU.bot.value).multiplyScalar(0.34);
  windowMat.emissiveIntensity = nightAmt * 0.95;
  for (let k = 0; k < nightHalos.length; k++) nightHalos[k].material.opacity = nightHalos[k].userData.op * nightAmt;
}
const QUALITY_SETS = { low: { grass: 0.3, shadow: 0, pr: 1, fog: 270, veg: 85, post: false }, medium: { grass: 0.65, shadow: 1024, pr: 1.5, fog: 330, veg: 115, post: true }, high: { grass: 1, shadow: 2048, pr: 2, fog: 370, veg: 150, post: true } };
let QUALITY = QUALITY_SETS.medium;

/* ---------- terrain ---------- */
const MAPN = 220, COLGRID = new Float32Array(MAPN * MAPN * 3);
{ const c = [0, 0, 0]; for (let j = 0; j < MAPN; j++) for (let i = 0; i < MAPN; i++) { const wx = (i + 0.5) / MAPN * WORLD * 2 - WORLD, wz = (j + 0.5) / MAPN * WORLD * 2 - WORLD; terrainColor(wx, wz, terrainH(wx, wz), c); COLGRID.set(c, (j * MAPN + i) * 3); } }
function gridColor(x, z, out) { const i = clamp(((x + WORLD) / (WORLD * 2) * MAPN) | 0, 0, MAPN - 1), j = clamp(((z + WORLD) / (WORLD * 2) * MAPN) | 0, 0, MAPN - 1), k = (j * MAPN + i) * 3; out[0] = COLGRID[k]; out[1] = COLGRID[k + 1]; out[2] = COLGRID[k + 2]; }
const terrain = (() => {
  const SEG = 220, g = new T.PlaneGeometry(WORLD * 2, WORLD * 2, SEG, SEG); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = terrainH(x, z); pos.setY(i, h);
    terrainColor(x, z, h, c); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
  }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals();
  // painterly detail: soft brush blotches multiplied over the vertex colours
  const cv = makeCanvas(256, 256), x = cv.getContext('2d'); x.fillStyle = '#ededed'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) { const px = rng() * 256, py = rng() * 256, r = 4 + rng() * 22, v = rng() < 0.5 ? 255 : 196; x.fillStyle = `rgba(${v},${v},${v},${0.05 + rng() * 0.1})`; for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { x.beginPath(); x.ellipse(px + ox, py + oy, r, r * (0.4 + rng() * 0.5), rng() * 3, 0, 6.3); x.fill(); } }
  const tx = new T.CanvasTexture(cv); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(64, 64); tx.anisotropy = 4;
  const m = new T.Mesh(g, painted(new T.MeshLambertMaterial({ vertexColors: true, map: tx }), 'grass', 0.11, 0.85, { side: 'cliff', sideScale: 0.06 })); m.receiveShadow = true; m.matrixAutoUpdate = false; scene.add(m); return m;
})();
const windU = { value: 0 };
const waterTex = (() => {
  const c = makeCanvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#dfe9ea'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 120; i++) { x.strokeStyle = `rgba(255,255,255,${0.25 + rng() * 0.5})`; x.lineWidth = 1 + rng() * 2.2; const px = rng() * 256, py = rng() * 256, w = 12 + rng() * 26; for (const ox of [-256, 0, 256]) { x.beginPath(); x.moveTo(px + ox, py); x.quadraticCurveTo(px + ox + w / 2, py - 5 + rng() * 10, px + ox + w, py); x.stroke(); } }
  for (let i = 0; i < 50; i++) { x.fillStyle = `rgba(120,160,170,${0.08 + rng() * 0.1})`; x.beginPath(); x.ellipse(rng() * 256, rng() * 256, 10 + rng() * 20, 3 + rng() * 5, 0, 0, 6.3); x.fill(); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(44, 44); return t;
})();
/* toon caustics: a tiling cell-edge pattern, sampled twice and scrolled, gives the painted 'light net' on the water */
const causticTex = (() => {
  const N = 128, c = makeCanvas(N, N), x = c.getContext('2d'), im = x.createImageData(N, N), cr = mulberry(9917), pts = [];
  for (let i = 0; i < 22; i++) pts.push([cr() * N, cr() * N]);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let d1 = 1e9, d2 = 1e9;
    for (const p of pts) { let dx = Math.abs(i - p[0]), dy = Math.abs(j - p[1]); if (dx > N / 2) dx = N - dx; if (dy > N / 2) dy = N - dy; const d = dx * dx + dy * dy; if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    const e = Math.sqrt(d2) - Math.sqrt(d1), v = 255 * (1 - smooth(0.6, 3.4, e)), k = (j * N + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = v; im.data[k + 3] = 255;
  }
  x.putImageData(im, 0, 0); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
})();
const waterU = { tCaust: { value: causticTex }, uSky: { value: new T.Color(0xc4eaf8) }, uShallow: { value: new T.Color(0x66dcd2) }, uDeep: { value: new T.Color(0x1b86ad) }, uDay: { value: 1 } };
const water = (() => {
  const SEG = 150, g = new T.PlaneGeometry(WORLD * 2, WORLD * 2, SEG, SEG); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, dep = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) dep[i] = clamp(WATER_Y - terrainH(pos.getX(i), pos.getZ(i)), -1, 4);
  g.setAttribute('aDepth', new T.BufferAttribute(dep, 1));
  const mat = new T.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 1, shininess: 120, specular: 0xbfd8d8 });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uTime = windU; for (const k in waterU) sh.uniforms[k] = waterU[k];
    sh.vertexShader = 'uniform float uTime;\nattribute float aDepth;\nvarying float vDepth;\nvarying vec3 vWP;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed.y+=sin(uTime*1.4+position.x*0.35)*0.045+cos(uTime*1.1+position.z*0.4)*0.04;\nvDepth=aDepth;\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = 'uniform float uTime;\nuniform sampler2D tCaust;\nuniform vec3 uSky;\nuniform vec3 uShallow;\nuniform vec3 uDeep;\nuniform float uDay;\nvarying float vDepth;\nvarying vec3 vWP;\n' + sh.fragmentShader.replace('#include <color_fragment>', [
      '#include <color_fragment>',
      '{ vec2 uv = vWP.xz;',
      '  float c1 = texture2D(tCaust, uv * 0.12 + vec2(uTime * 0.012, -uTime * 0.035)).r;',
      '  float c2 = texture2D(tCaust, uv * 0.19 + vec2(-uTime * 0.02, -uTime * 0.05) + 0.37).r;',
      '  float net = min(c1, c2);',                                      // bright lines only where both layers agree: they drift and break up
      '  float dk = smoothstep(0.0, 2.2, vDepth);',
      '  vec3 col = mix(uShallow, uDeep, dk);',
      '  col += vec3(0.32, 0.38, 0.36) * smoothstep(0.25, 0.8, net) * (1.0 - dk * 0.5) * uDay;',
      '  float lap = vDepth + sin(uTime * 1.6 + uv.x * 0.9 + uv.y * 0.7) * 0.07;',
      '  float foam = (1.0 - smoothstep(0.1, 0.6, lap)) * step(-0.45, vDepth);',
      '  foam = max(foam * (0.55 + 0.45 * c1), (1.0 - smoothstep(0.02, 0.2, lap)) * step(-0.45, vDepth));',
      '  col = mix(col, vec3(1.0), foam * 0.92);',
      '  vec3 V = normalize(cameraPosition - vWP); float fr = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);',
      '  col = mix(col, uSky, fr * 0.6 * (1.0 - foam));',
      '  diffuseColor.rgb = col;',
      '  diffuseColor.a = max(mix(0.5, 0.93, smoothstep(0.0, 1.4, vDepth)), max(foam, fr * 0.9)); }'].join('\n'));
  };
  const m = new T.Mesh(g, mat); m.position.y = WATER_Y; m.receiveShadow = true; scene.add(m);
  // open water beyond the valley rim
  const far = new T.Mesh(new T.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x2f93b4 })); far.position.y = WATER_Y - 0.6; scene.add(far); m.userData.far = far;
  return m;
})();

/* ---------- map image (minimap + world map) ---------- */
const mapCanvas = (() => {
  const c = makeCanvas(MAPN, MAPN), x = c.getContext('2d'), im = x.createImageData(MAPN, MAPN), col = [0, 0, 0];
  for (let j = 0; j < MAPN; j++) for (let i = 0; i < MAPN; i++) {
    const wx = (i + 0.5) / MAPN * WORLD * 2 - WORLD, wz = (j + 0.5) / MAPN * WORLD * 2 - WORLD, h = terrainH(wx, wz), k = (j * MAPN + i) * 4;
    gridColor(wx, wz, col);
    // parchment-map treatment: muted inks, hill shading, pale water
    let r = lerp(col[0], 0.86, 0.38), g = lerp(col[1], 0.78, 0.38), b = lerp(col[2], 0.58, 0.38);
    if (h < WATER_Y) { r = 0.50; g = 0.70; b = 0.74; if (h > WATER_Y - 0.5) { r = 0.66; g = 0.82; b = 0.82; } }
    if (inTemple(wx, wz)) { r = 0.66; g = 0.66; b = 0.60; }
    const sh = 0.9 + clamp((terrainH(wx - 2, wz - 2) - h) * -0.1, -0.24, 0.2);
    im.data[k] = r * 255 * sh; im.data[k + 1] = g * 255 * sh; im.data[k + 2] = b * 255 * sh; im.data[k + 3] = 255;
  }
  x.putImageData(im, 0, 0); return c;
})();

/* ---------- chunked instancing: every cell is frustum- and distance-culled ---------- */
const chunkSets = [];
function chunked(geo, mat, items, cell, o = {}) {
  const buckets = new Map(), dummy = new T.Object3D(), col = new T.Color();
  for (const it of items) { const k = Math.floor((it.x + WORLD) / cell) + ',' + Math.floor((it.z + WORLD) / cell); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(it); }
  geo.boundingSphere = new T.Sphere(new T.Vector3(0, o.cy || 6, 0), cell * 0.71 + (o.extent || 4));
  const set = { meshes: [], dist: o.dist || 0, grass: !!o.grass, total: items.length };
  for (const [k, list] of buckets) {
    const [ci, cj] = k.split(',').map(Number), cx = (ci + 0.5) * cell - WORLD, cz = (cj + 0.5) * cell - WORLD;
    const m = new T.InstancedMesh(geo, mat, list.length); m.position.set(cx, 0, cz);
    list.forEach((it, i) => {
      dummy.position.set(it.x - cx, it.y, it.z - cz); dummy.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); dummy.scale.set(it.sx, it.sy == null ? it.sx : it.sy, it.sz == null ? it.sx : it.sz); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      if (it.c) m.setColorAt(i, col.setRGB(it.c[0], it.c[1], it.c[2]));
    });
    m.castShadow = !!o.shadow; m.receiveShadow = o.receive !== false; m.updateMatrix(); m.matrixAutoUpdate = false; m.userData.max = list.length; m.userData.cx = cx; m.userData.cz = cz;
    scene.add(m); set.meshes.push(m);
  }
  chunkSets.push(set); return set;
}
let chunkT = 0;
function updateChunks(dt, cam) {
  chunkT -= dt; if (chunkT > 0) return; chunkT = 0.25;
  for (const s of chunkSets) { if (!s.dist) continue; const lim = s.dist * (s.grass ? QUALITY.veg / 115 : 1); for (const m of s.meshes) m.visible = Math.hypot(m.userData.cx - cam.x, m.userData.cz - cam.z) < lim; }
}
function windify(mat, amp, grassLike) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uTime = windU;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      ['#include <begin_vertex>', '#ifdef USE_INSTANCING',
        'vec4 wO=modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);',
        'float wPh=uTime*1.7+wO.x*0.11+wO.z*0.09;',
        'float wG=sin(wPh)+0.5*sin(wPh*2.3+wO.x*0.5)+0.6;',
        'float wK=' + amp.toFixed(3) + '*' + (grassLike ? 'position.y*position.y' : 'max(position.y+0.4,0.0)') + ';',
        'transformed.x+=wG*wK;transformed.z+=cos(wPh*0.8)*wK*0.6;', '#endif'].join('\n'));
  };
  return mat;
}
/* organic blob with smooth normals and a built-in light-to-dark gradient */
function puffGeo(detail, rough, flat) {
  const g = new T.IcosahedronGeometry(1, detail), p = g.attributes.position, n = g.attributes.normal, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = 1 + rough * (Math.sin(x * 3.1 + y * 1.7 + 1) * Math.cos(z * 2.9 - y * 2.1) + 0.5 * Math.sin(y * 5.3 + x * 4.1));
    p.setXYZ(i, x * f, y * f * (y < 0 ? 0.8 : 1), z * f); n.setXYZ(i, x, y, z);
    const k = smooth(-0.9, 0.9, y); c[i * 3] = lerp(0.6, 1.12, k); c[i * 3 + 1] = lerp(0.66, 1.1, k); c[i * 3 + 2] = lerp(0.74, 1.0, k);
  }
  g.setAttribute('color', new T.BufferAttribute(c, 3)); if (flat) g.computeVertexNormals(); return g;
}
const GIANTS = [[-150, 25], [-135, 62], [-105, 96], [-150, -102], [-70, 112], [-160, 72], [-95, -102], [-62, -122]];
function plantBlocked(x, z, pad) {
  if (inTemple(x, z, pad + 1.5)) return true;
  if (insideBox(x, z, pad)) return true;
  for (const f of FLATS) if (f !== FLATS[2] && f !== FLATS[3] && Math.hypot(x - f.x, z - f.z) < f.r * (f === FLATS[1] ? 0.95 : 0.85)) return true;
  if (Math.hypot(x - MESA.x, z - MESA.z) < 18) return true;
  if (pathDist(x, z) < pad + 2.6) return true;
  if (Math.abs(x - BRIDGE.x) < 24 && Math.abs(z - BRIDGE.z) < 7) return true;
  if (Math.hypot(x + 74, z + 40) < 9) return true;
  if (x > 92 && x < 124 && z > -18 && z < 27) return true;
  for (const g of GIANTS) if (Math.hypot(x - g[0], z - g[1]) < 5) return true;
  return false;
}
const hsl = (h, s, l) => { _c1.setHSL(h, s, l); return [_c1.r, _c1.g, _c1.b]; };
let grass, TREES = [];
/* vegetation is planted after the buildings exist, so nothing grows through a wall */
function buildVegetation() {
  /* --- trees --- */
  const trunks = [], puffs = [], cones = [];
  for (let i = 0; i < 5200 && TREES.length < 820; i++) {
    const x = (rng() * 2 - 1) * 194, z = (rng() * 2 - 1) * 194, d = Math.hypot(x, z); if (d > 192) continue;
    const h = terrainH(x, z); if (h < 0.3 || h > 46) continue;
    const west = x < riverX(z) - 8;
    const dens = west ? 0.82 : (0.5 + 0.5 * Math.sin(x * 0.045 + 1) * Math.cos(z * 0.05)) * 0.5 + (d > 150 ? 0.35 : 0);
    if (rng() > dens) continue;
    if (Math.abs(terrainH(x + 1.5, z) - h) > 1.8 || Math.abs(terrainH(x, z + 1.5) - h) > 1.8) continue;
    if (plantBlocked(x, z, 1.4)) continue;
    let type = 'oak';
    if (h > 11 || rng() < (west ? 0.3 : 0.14)) type = 'pine';
    else if (west) type = (z < 5 && x > -175 && rng() < 0.3) ? 'autumn' : 'oak';
    else { const ds = Math.hypot(x, z - 60), dv = Math.hypot(x - 78, z - 20); if ((ds < 46 && rng() < 0.5) || (dv < 52 && rng() < 0.3)) type = 'blossom'; else if (rng() < 0.26) type = 'birch'; }
    TREES.push({ x, z, h, type, s: 0.85 + rng() * 0.95, west });
  }
  for (const t of TREES) {
    const s = t.s, ry = rng() * 6.283;
    if (t.type === 'pine') {
      trunks.push({ x: t.x, y: t.h - 0.2, z: t.z, ry, sx: s * 0.95, sy: 2.2 * s, sz: s * 0.95, c: [0.42, 0.29, 0.2] });
      const R = [2.1, 1.75, 1.35, 0.9], Y = [1.1, 2.5, 3.8, 5.0], hue = 0.39 + rng() * 0.05, li = 0.2 + rng() * 0.06;
      for (let k = 0; k < 4; k++) cones.push({ x: t.x, y: t.h + Y[k] * s, z: t.z, ry: ry + k * 0.7, sx: R[k] * s, sy: 2.5 * s, sz: R[k] * s, c: hsl(hue, 0.5, li + k * 0.035) });
    } else {
      const birch = t.type === 'birch', th = (birch ? 4.2 : 2.9) * s, tw = birch ? 0.55 : 1;
      trunks.push({ x: t.x, y: t.h - 0.2, z: t.z, ry, sx: s * tw, sy: th, sz: s * tw, c: birch ? [0.92, 0.9, 0.84] : t.type === 'blossom' ? [0.36, 0.25, 0.22] : [0.46, 0.31, 0.2] });
      let hue, sat, li;
      if (t.type === 'blossom') { hue = 0.93 + rng() * 0.04; sat = 0.72; li = 0.76; }
      else if (t.type === 'autumn') { hue = 0.04 + rng() * 0.07; sat = 0.78; li = 0.5; }
      else if (birch) { hue = 0.2 + rng() * 0.04; sat = 0.66; li = 0.48; }
      else if (t.west) { hue = 0.35 + rng() * 0.07; sat = 0.55; li = 0.29 + rng() * 0.07; }
      else { hue = 0.26 + rng() * 0.06; sat = 0.62; li = 0.38 + rng() * 0.08; }
      const R = birch ? 1.25 : 1.9, top = t.h + th;
      const put = (ox, oy, oz, r, dl) => puffs.push({ leaf: 1, x: t.x + ox * s, y: top + oy * s, z: t.z + oz * s, rx: rng() * 0.5, ry: rng() * 6.283, sx: r * s, sy: r * s * 0.8, sz: r * s, c: hsl(hue + (rng() - 0.5) * 0.02, sat, li + dl) });
      put(0, 0.7, 0, R, 0);
      const n = birch ? 2 : 3 + (rng() * 2 | 0);
      for (let k = 0; k < n; k++) { const a = ry + k / n * 6.283; put(Math.cos(a) * R * 0.75, 0.1 + rng() * 0.7, Math.sin(a) * R * 0.75, R * (0.6 + rng() * 0.2), -0.04 + rng() * 0.03); }
      put(rng() * 0.6 - 0.3, 1.9, rng() * 0.6 - 0.3, R * 0.66, 0.05);
    }
    addCircle(t.x, t.z, 0.42 * s * (t.type === 'birch' ? 0.7 : 1));
  }
  /* bushes */
  for (let i = 0; i < 4000 && puffs.length < TREES.length * 5 + 620; i++) {
    const x = (rng() * 2 - 1) * 188, z = (rng() * 2 - 1) * 188, h = terrainH(x, z);
    if (Math.hypot(x, z) > 188 || h < 0.25 || h > 20 || plantBlocked(x, z, 0.4) || Math.abs(terrainH(x + 1, z) - h) > 0.9) continue;
    const west = x < riverX(z) - 8, s = 0.45 + rng() * 0.55;
    puffs.push({ leaf: 1, x, y: h + s * 0.35, z, ry: rng() * 6, sx: s * 1.2, sy: s * 0.72, sz: s * 1.1, c: west ? hsl(0.36 + rng() * 0.06, 0.48, 0.28) : hsl(0.28 + rng() * 0.06, 0.5, 0.34) });
  }
  /* rocks, with moss caps on the big ones */
  const rocks = [];
  for (let i = 0; i < 1400 && rocks.length < 230; i++) {
    const x = (rng() * 2 - 1) * 197, z = (rng() * 2 - 1) * 197, h = terrainH(x, z);
    if (Math.hypot(x, z) > 198 || h < -0.9 || plantBlocked(x, z, 1)) continue;
    const s = 0.4 + rng() * rng() * 2.8, v = 0.9 + rng() * 0.25;
    rocks.push({ x, y: h + s * 0.15, z, rx: rng() * 0.5, ry: rng() * 6, rz: rng() * 0.5, sx: s * (0.9 + rng() * 0.5), sy: s * (0.6 + rng() * 0.45), sz: s, c: [v, v * 1.01, v * 1.0] });
    if (s > 1) { addCircle(x, z, s * 0.85, h + s * 0.15 + rocks[rocks.length - 1].sy * 0.78); puffs.push({ x, y: h + s * 0.62, z, ry: rng() * 6, sx: s * 0.75, sy: s * 0.22, sz: s * 0.7, c: hsl(0.25, 0.5, 0.38) }); }
  }
  const trunkG = (() => { const g = new T.CylinderGeometry(0.17, 0.34, 1, 7, 4); g.translate(0, 0.5, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), fl = 1 + smooth(0.25, 0, y) * 0.55; p.setX(i, p.getX(i) * fl + Math.sin(y * 2.6) * 0.07); p.setZ(i, p.getZ(i) * fl + Math.cos(y * 2.1) * 0.05); } g.computeVertexNormals(); return g; })();
  const coneG = (() => { const g = new T.ConeGeometry(1, 1, 10, 2); g.translate(0, 0.5, 0); const p = g.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i)); if (y < 0.05) { const j = (Math.round(a / 0.628) % 2 === 0) ? 1.12 : 0.9; p.setX(i, p.getX(i) * j); p.setZ(i, p.getZ(i) * j); p.setY(i, y - (j > 1 ? 0.14 : 0)); } const k = smooth(0, 1, y); c[i * 3] = lerp(0.62, 1.2, k); c[i * 3 + 1] = lerp(0.68, 1.18, k); c[i * 3 + 2] = lerp(0.78, 1.05, k); } g.setAttribute('color', new T.BufferAttribute(c, 3)); g.computeVertexNormals(); return g; })();
  const leafMat = () => new T.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
  chunked(trunkG, painted(new T.MeshToonMaterial({ color: 0xffffff, gradientMap: TOON }), 'wood', 0.9, 0.75), trunks, 88, { shadow: true, extent: 8 });
  const leafSrc = (window.TLK_TEX || {}).leaves;
  if (leafSrc) {   // painted leaf cards around a darker core: soft, brushy canopies instead of faceted blobs
    const lr = mulberry(777), P = [], N = [], U = [], C = [];
    for (let i = 0; i < 18; i++) {
      const y = -0.35 + lr() * 1.35, th = lr() * 6.283, q = Math.sqrt(Math.max(0, 1 - Math.min(1, y * y))), d = new T.Vector3(Math.cos(th) * q, Math.min(y, 1), Math.sin(th) * q).normalize();
      const up = new T.Vector3(0, 1, 0), tx = new T.Vector3().crossVectors(up, d); if (tx.lengthSq() < 0.01) tx.set(1, 0, 0); tx.normalize(); const ty = new T.Vector3().crossVectors(d, tx).normalize();
      const roll = lr() * 6.283, cr = Math.cos(roll), sr = Math.sin(roll), ax = tx.clone().multiplyScalar(cr).addScaledVector(ty, sr), ay = ty.clone().multiplyScalar(cr).addScaledVector(tx, -sr), s = 0.4 + lr() * 0.2, c = d.clone().multiplyScalar(0.74 + lr() * 0.16);
      const v = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => c.clone().addScaledVector(ax, a * s).addScaledVector(ay, b * s)), uv = [[0, 0], [1, 0], [1, 1], [0, 1]], k = lerp(0.62, 1.14, smooth(-0.4, 0.9, d.y));
      for (const idx of [0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0]) { P.push(v[idx].x, v[idx].y, v[idx].z); const nn = v[idx].clone().normalize().lerp(d, 0.5).normalize(); N.push(nn.x, Math.abs(nn.y) * 0.5 + 0.5, nn.z); U.push(uv[idx][0], uv[idx][1]); C.push(k, k * 1.02, k * 0.96); }
    }
    const cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); cg.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); cg.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); cg.setAttribute('color', new T.Float32BufferAttribute(C, 3));
    const li = new Image(), lt = new T.Texture(li); li.onload = () => { lt.needsUpdate = true; }; li.src = leafSrc;
    const cards = [];
    for (const p of puffs) if (p.leaf) { cards.push({ x: p.x, y: p.y, z: p.z, ry: p.ry, sx: p.sx * 1.22, sy: p.sy * 1.34, sz: p.sz * 1.22, c: [Math.min(1.6, p.c[0] * 1.5), Math.min(1.6, p.c[1] * 1.5), Math.min(1.6, p.c[2] * 1.5)] }); p.sx *= 0.86; p.sy *= 0.86; p.sz *= 0.86; p.c = [p.c[0] * 0.8, p.c[1] * 0.84, p.c[2] * 0.86]; }
    chunked(cg, windify(new T.MeshLambertMaterial({ map: lt, alphaTest: 0.42, vertexColors: true }), 0.07), cards, 88, { extent: 12, receive: false });
  }
  chunked(puffGeo(1, 0.16), windify(leafMat(), 0.045), puffs, 88, { shadow: true, extent: 10 });
  chunked(coneG, windify(leafMat(), 0.03), cones, 88, { shadow: true, extent: 10 });
  chunked(puffGeo(1, 0.26, true), painted(new T.MeshToonMaterial({ color: 0x8f958f, gradientMap: TOON, vertexColors: true }), 'cliff', 0.35, 0.85), rocks, 88, { shadow: true, extent: 5 });

  /* giant trees of the Forgotten Forest edge */
  GIANTS.forEach(([x, z], gi) => {
    const y = terrainH(x, z), g = new T.Group(); g.position.set(x, y - 0.5, z); scene.add(g);
    const bark = lam(0x5f432c), tg = new T.CylinderGeometry(1.4, 2.6, 24, 10, 6), tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { const yy = tp.getY(i), a = Math.atan2(tp.getZ(i), tp.getX(i)), f = 1 + 0.12 * Math.sin(a * 5 + yy * 0.3) + smooth(-7, -12, yy) * 0.6; tp.setX(i, tp.getX(i) * f + Math.sin(yy * 0.2 + gi) * 0.5); tp.setZ(i, tp.getZ(i) * f); } tg.computeVertexNormals();
    mesh(tg, bark, 0, 12, 0, g);
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + gi; const r = mesh(cyl(0.3, 0.9, 6, 6), bark, Math.cos(a) * 3, 1.3, Math.sin(a) * 3, g); r.rotation.set(Math.sin(a) * -1.0, 0, Math.cos(a) * 1.0); }
    for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + gi * 0.7; const br = mesh(cyl(0.35, 0.7, 9, 6), bark, Math.cos(a) * 3.4, 20, Math.sin(a) * 3.4, g); br.rotation.set(Math.sin(a) * 0.95, 0, -Math.cos(a) * 0.95); }
    const cm = new T.MeshLambertMaterial({ color: gi % 2 ? 0x2f7d4f : 0x3a8a52, vertexColors: true }), pg = puffGeo(2, 0.2);
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; const b = mesh(pg, cm, Math.cos(a) * 6.2, 23.5 + (k % 2) * 3, Math.sin(a) * 6.2, g); b.scale.set(6.6, 4.4, 6.6); b.rotation.y = a; }
    mesh(pg, cm, 0, 29, 0, g).scale.set(8, 5.2, 8);
    for (let k = 0; k < 4; k++) { const a = k * 1.7 + gi; const v = mesh(cyl(0.05, 0.05, 6 + k, 4), lam(0x4f8a3a), Math.cos(a) * 5, 19 - k * 0.5, Math.sin(a) * 5, g, true); v.userData.vine = 1; }
    for (let k = 0; k < 7; k++) {
      const a = rng() * 6.283, r = 3.4 + rng() * 3.4, mx = Math.cos(a) * r, mz = Math.sin(a) * r, my = terrainH(x + mx, z + mz) - y + 0.5, c = k % 2 ? 0xff7ad1 : 0x7ff3e0, s = 0.6 + rng() * 0.9;
      mesh(cyl(0.07 * s, 0.1 * s, 0.6 * s, 5), lam(0xe8e4d6), mx, my + 0.3 * s, mz, g, true); mesh(new T.SphereGeometry(0.36 * s, 8, 5, 0, 6.3, 0, 1.5), glowMat(c), mx, my + 0.58 * s, mz, g, true);
      if (k < 2) halo(scene, x + mx, y + my + 0.4, z + mz, 2.6, c, 0.4, true);
    }
    // a shaft of light through the canopy
    const sh = mesh(new T.CylinderGeometry(1.2, 3.4, 22, 10, 1, true), shaftMat, 6 + (gi % 3) * 2, 11, 5, g, true); sh.rotation.z = 0.22; sh.userData.live = 1;
    bake(g); addCircle(x, z, 2.6);
  });

  /* --- grass --- */
  const blade = (() => {
    const p = [], c = [], n = [];
    for (let b = 0; b < 6; b++) {
      const a = b * 1.31 + 0.4, ox = Math.cos(b * 2.4) * (0.12 + (b % 4) * 0.09) * (b ? 1 : 0), oz = Math.sin(b * 2.4) * (0.12 + (b % 4) * 0.09) * (b ? 1 : 0), cx = Math.cos(a) * 0.04, sz = Math.sin(a) * 0.04, hh = 0.42 + (b % 4) * 0.13, lx = Math.cos(a + 1.3) * 0.16, lz = Math.sin(a + 1.3) * 0.16;
      const A = [ox - cx, 0, oz - sz], B = [ox + cx, 0, oz + sz], C = [ox + lx, hh, oz + lz];
      p.push(...A, ...B, ...C, ...B, ...A, ...C);
      for (let k = 0; k < 2; k++) { c.push(0.5, 0.58, 0.46, 0.5, 0.58, 0.46, 1.2, 1.24, 0.95); n.push(0, 1, 0, 0, 1, 0, 0, 1, 0); }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); g.setAttribute('color', new T.Float32BufferAttribute(c, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(n, 3)); return g;
  })();
  const gi = [], c3 = [0, 0, 0], GN = 230000;
  for (let i = 0; i < GN; i++) {
    const x = (rng() * 2 - 1) * 188, z = (rng() * 2 - 1) * 188; if (x * x + z * z > 35300) continue;
    const h = terrainH(x, z); if (h < 0.12 || h > 22 || inTemple(x, z, 0.5) || pathDist(x, z) < 1.6) continue;
    if (Math.abs(terrainH(x + 1, z) - h) > 0.95) continue;
    if (Math.hypot(x - 78, z - 20) < 25 && (rng() < 0.7 || insideBox(x, z, 0.4))) continue;
    if ((typeof paved === 'function' && paved(x, z)) || Math.hypot(x, z - 60) < 9.3 || Math.hypot(x + 95, z - 20) < 4.7 || (Math.abs(x - BRIDGE.x) < 15.5 && Math.abs(z - 10) < 3.2) || Math.hypot(x - 97, z + 10) < 3.8) continue;
    gridColor(x, z, c3);
    const s = 0.7 + rng() * 0.55, k = 0.94 + rng() * 0.2;
    gi.push({ x, y: h - 0.04, z, ry: rng() * 6.283, sx: s * 1.2, sy: s * (0.55 + rng() * 0.4), sz: s * 1.2, c: [c3[0] * k, c3[1] * k * 1.03, c3[2] * k] });
  }
  const gs = chunked(blade, windify(new T.MeshLambertMaterial({ vertexColors: true }), 0.2, true), gi, 44, { dist: 115, grass: true, extent: 2, cy: 4 });
  grass = { set: gs, userData: { max: gi.length }, count: gi.length };

  /* --- wheat field east of Oakrest --- */
  const wheat = [];
  for (let i = 0; i < 2600; i++) { const x = 104 + rng() * 17, z = -15 + rng() * 17; if (Math.abs(((x - 104) % 3.4) - 1.7) < 0.35) continue; const h = terrainH(x, z), s = 1.1 + rng() * 0.5; wheat.push({ x, y: h, z, ry: rng() * 6, sx: s, sy: s * 1.5, sz: s, c: [1.0 + rng() * 0.1, 0.84 + rng() * 0.08, 0.34] }); }
  chunked(blade.clone(), windify(new T.MeshLambertMaterial({ vertexColors: true }), 0.16, true), wheat, 44, { dist: 150, extent: 2, cy: 4 });

  /* --- flowers, reeds, lily pads --- */
  const flowers = [], FC = [[1, 1, 1], [1, 0.56, 0.78], [1, 0.88, 0.36], [0.62, 0.84, 1], [0.8, 0.6, 1], [1, 0.42, 0.34]];
  for (let p = 0; p < 240; p++) {
    const cxm = (rng() * 2 - 1) * 180, czm = (rng() * 2 - 1) * 180, fc = FC[(rng() * FC.length) | 0], n = 10 + (rng() * 26 | 0), rad = 2 + rng() * 5;
    for (let i = 0; i < n; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * rad, x = cxm + Math.cos(a) * r, z = czm + Math.sin(a) * r, h = terrainH(x, z);
      if (h < 0.2 || h > 16 || inTemple(x, z, 0.5) || x * x + z * z > 33800 || insideBox(x, z, 0.3)) continue;
      const s = 0.8 + rng() * 0.8; flowers.push({ x, y: h + 0.3 + rng() * 0.25, z, ry: rng() * 6, sx: s, c: fc });
    }
  }
  const flG = (() => { const g = new T.ConeGeometry(0.15, 0.1, 6); g.rotateX(Math.PI); return g; })();
  chunked(flG, new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x3a3a3a }), flowers, 88, { dist: 130, extent: 1, cy: 4, receive: false });
  const reeds = [], pads = [];
  for (let i = 0; i < 30000 && reeds.length < 1500; i++) {
    const x = (rng() * 2 - 1) * 180, z = (rng() * 2 - 1) * 180, h = terrainH(x, z);
    if (h > -0.55 || h < -1.45 || x * x + z * z > 32000 || rng() < 0.45 || Math.abs(x - BRIDGE.x) < 17 && Math.abs(z - 10) < 5) continue;
    for (let k = 0; k < 3; k++) { const s = 0.8 + rng() * 0.7; reeds.push({ x: x + rng() * 0.7, y: Math.min(h, WATER_Y), z: z + rng() * 0.7, rx: (rng() - 0.5) * 0.2, rz: (rng() - 0.5) * 0.2, sx: 1, sy: s, sz: 1, c: hsl(0.2 + rng() * 0.06, 0.5, 0.36) }); }
  }
  for (let i = 0; i < 9000 && pads.length < 170; i++) {
    const x = (rng() * 2 - 1) * 170, z = (rng() * 2 - 1) * 170, h = terrainH(x, z);
    if (h > -1.35 || h < -2.4 || Math.abs(x - BRIDGE.x) < 17 && Math.abs(z - 10) < 5) continue;
    const s = 0.35 + rng() * 0.4; pads.push({ x, y: WATER_Y + 0.05, z, ry: rng() * 6, sx: s, sy: 1, sz: s, c: hsl(0.3 + rng() * 0.05, 0.55, 0.36) });
    if (rng() < 0.3) flowers.push && pads.push({ x: x + 0.1, y: WATER_Y + 0.14, z, ry: 0, sx: 0.16, sy: 5, sz: 0.16, c: [1, 0.72, 0.86] });
  }
  const reedG = new T.ConeGeometry(0.035, 1.7, 4); reedG.translate(0, 0.85, 0);
  chunked(reedG, windify(new T.MeshLambertMaterial({ color: 0xffffff }), 0.05, false), reeds, 88, { dist: 140, extent: 2, cy: 0 });
  const padG = new T.CylinderGeometry(1, 1, 0.03, 9, 1, false, 0.4, 5.6);
  chunked(padG, new T.MeshLambertMaterial({ color: 0xffffff }), pads, 88, { dist: 140, extent: 2, cy: 0 });
}
const shaftMat = new T.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 0.09, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false });

/* ---------- particles ---------- */
const PART_N = 700, part = { p: new Float32Array(PART_N * 3), c: new Float32Array(PART_N * 3), v: new Float32Array(PART_N * 3), life: new Float32Array(PART_N), grav: new Float32Array(PART_N), i: 0 };
const partGeo = new T.BufferGeometry();
partGeo.setAttribute('position', new T.BufferAttribute(part.p, 3)); partGeo.setAttribute('color', new T.BufferAttribute(part.c, 3));
for (let i = 0; i < PART_N; i++) part.p[i * 3 + 1] = -999;
const partPts = new T.Points(partGeo, new T.PointsMaterial({ size: 0.34, map: glowTex, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, alphaTest: 0.02 })); partPts.frustumCulled = false; scene.add(partPts);
function burst(x, y, z, color, n = 10, speed = 4, life = 0.6, grav = 9) {
  _c1.setHex(color);
  for (let k = 0; k < n; k++) {
    const i = part.i = (part.i + 1) % PART_N, a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = speed * (0.4 + Math.random() * 0.6), q = Math.sqrt(1 - u * u);
    part.p[i * 3] = x; part.p[i * 3 + 1] = y; part.p[i * 3 + 2] = z;
    part.v[i * 3] = Math.cos(a) * q * s; part.v[i * 3 + 1] = Math.abs(u) * s + 1; part.v[i * 3 + 2] = Math.sin(a) * q * s;
    part.c[i * 3] = _c1.r; part.c[i * 3 + 1] = _c1.g; part.c[i * 3 + 2] = _c1.b; part.life[i] = life * (0.6 + Math.random() * 0.6); part.grav[i] = grav;
  }
}
/* slow drifting puff: chimney smoke, mist, dust */
function puff(x, y, z, color, vx, vy, vz, life) {
  _c1.setHex(color); const i = part.i = (part.i + 1) % PART_N;
  part.p[i * 3] = x; part.p[i * 3 + 1] = y; part.p[i * 3 + 2] = z; part.v[i * 3] = vx; part.v[i * 3 + 1] = vy; part.v[i * 3 + 2] = vz;
  part.c[i * 3] = _c1.r; part.c[i * 3 + 1] = _c1.g; part.c[i * 3 + 2] = _c1.b; part.life[i] = life; part.grav[i] = 0;
}
function updateParticles(dt) {
  for (let i = 0; i < PART_N; i++) {
    if (part.life[i] <= 0) continue;
    part.life[i] -= dt;
    if (part.life[i] <= 0) { part.p[i * 3 + 1] = -999; continue; }
    part.v[i * 3 + 1] -= part.grav[i] * dt;
    part.p[i * 3] += part.v[i * 3] * dt; part.p[i * 3 + 1] += part.v[i * 3 + 1] * dt; part.p[i * 3 + 2] += part.v[i * 3 + 2] * dt;
  }
  partGeo.attributes.position.needsUpdate = true; partGeo.attributes.color.needsUpdate = true;
}
/* drifting motes around the camera: pollen by day, fireflies after dusk, petals and leaves on the wind */
function driftField(n, size, color, box) {
  const a = new Float32Array(n * 3), ph = new Float32Array(n); for (let i = 0; i < n; i++) { a[i * 3] = rand(-box, box); a[i * 3 + 1] = rand(0.3, box * 0.45); a[i * 3 + 2] = rand(-box, box); ph[i] = Math.random() * 6.283; }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3));
  const p = new T.Points(g, new T.PointsMaterial({ size, map: glowTex, color, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })); p.frustumCulled = false; scene.add(p);
  return { p, a, ph, n, box };
}
const motes = driftField(260, 0.16, 0xfff6c8, 26), petals = driftField(90, 0.22, 0xffc4dc, 22);
petals.p.material.blending = T.NormalBlending;
function updateDrift(dt, focus, t) {
  for (const f of [motes, petals]) {
    const fall = f === petals;
    for (let i = 0; i < f.n; i++) {
      const k = i * 3; f.a[k] += (0.5 + Math.sin(t * 0.7 + f.ph[i]) * 0.5 + (fall ? 1.3 : 0)) * dt; f.a[k + 1] += (fall ? -0.7 : Math.sin(t * 0.9 + f.ph[i] * 3) * 0.25) * dt; f.a[k + 2] += Math.cos(t * 0.6 + f.ph[i]) * 0.5 * dt;
      if (f.a[k] > f.box) f.a[k] -= f.box * 2; if (f.a[k + 2] > f.box) f.a[k + 2] -= f.box * 2; if (f.a[k + 2] < -f.box) f.a[k + 2] += f.box * 2;
      if (f.a[k + 1] < 0.2) f.a[k + 1] += f.box * 0.45; if (f.a[k + 1] > f.box * 0.45 + 0.3) f.a[k + 1] -= f.box * 0.45;
    }
    f.p.geometry.attributes.position.needsUpdate = true;
    f.p.position.set(Math.round(focus.x), groundAt(focus.x, focus.z), Math.round(focus.z));
  }
  motes.p.material.color.setHex(nightAmt > 0.5 ? 0xd8ff7a : 0xfff6c8); motes.p.material.size = nightAmt > 0.5 ? 0.3 : 0.15;
  motes.p.material.opacity = (nightAmt > 0.5 ? 0.55 + 0.4 * Math.sin(t * 2.2) : 0.55) * (1 - rainAmt);
  const nearBlossom = Math.max(smooth(70, 30, Math.hypot(focus.x, focus.z - 60)), smooth(70, 35, Math.hypot(focus.x - 78, focus.z - 20)));
  const west = focus.x < riverX(focus.z) - 8; petals.p.material.color.setHex(west ? 0xc9d86a : 0xffc4dc); petals.p.material.opacity = (west ? 0.6 : nearBlossom * 0.9) * (1 - nightAmt * 0.6);
}
/* rain as slanted streaks */
const RAIN_N = 1300, rainPos = new Float32Array(RAIN_N * 6), rainGeo = new T.BufferGeometry(), rainSeed = new Float32Array(RAIN_N * 3);
for (let i = 0; i < RAIN_N; i++) { rainSeed[i * 3] = rand(-28, 28); rainSeed[i * 3 + 1] = rand(0, 26); rainSeed[i * 3 + 2] = rand(-28, 28); }
rainGeo.setAttribute('position', new T.BufferAttribute(rainPos, 3));
const rain = new T.LineSegments(rainGeo, new T.LineBasicMaterial({ color: 0xcfe4f4, transparent: true, opacity: 0.5, depthWrite: false })); rain.frustumCulled = false; rain.visible = false; scene.add(rain);
let weather = { raining: false, next: 170, bolt: 8 };
function updateWeather(dt, focus) {
  weather.next -= dt;
  if (weather.next <= 0) { weather.raining = !weather.raining; weather.next = weather.raining ? rand(55, 95) : rand(180, 320); }
  rainAmt = clamp(rainAmt + (weather.raining ? dt : -dt) * 0.22, 0, 1);
  flashAmt = Math.max(0, flashAmt - dt * 2.4);
  rain.visible = rainAmt > 0.02;
  if (rain.visible) {
    rain.position.set(focus.x, focus.y - 3, focus.z); rain.material.opacity = 0.5 * rainAmt;
    for (let i = 0; i < RAIN_N; i++) {
      const k = i * 3; rainSeed[k + 1] -= 36 * dt; if (rainSeed[k + 1] < 0) { rainSeed[k + 1] += 26; if (i % 40 === 0 && rainAmt > 0.6) burst(focus.x + rainSeed[k], groundAt(focus.x + rainSeed[k], focus.z + rainSeed[k + 2]) + 0.1, focus.z + rainSeed[k + 2], 0xdff0ff, 2, 1.2, 0.25, 6); }
      const j = i * 6; rainPos[j] = rainSeed[k]; rainPos[j + 1] = rainSeed[k + 1]; rainPos[j + 2] = rainSeed[k + 2]; rainPos[j + 3] = rainSeed[k] + 0.16; rainPos[j + 4] = rainSeed[k + 1] + 0.95; rainPos[j + 5] = rainSeed[k + 2];
    }
    rainGeo.attributes.position.needsUpdate = true;
    weather.bolt -= dt; if (weather.bolt <= 0 && rainAmt > 0.8) { weather.bolt = rand(9, 22); flashAmt = 1; setTimeout(() => sfx('thunder'), 500 + Math.random() * 900); }
  }
}
/* ---------- post-processing: soft bloom and a gentle film grade (skipped on Low) ---------- */
const POST = (() => {
  const vs = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  const mk = (uniforms, fs) => new T.ShaderMaterial({ uniforms, vertexShader: vs, fragmentShader: fs, depthTest: false, depthWrite: false });
  const bright = mk({ t: { value: null }, px: { value: new T.Vector2() } }, 'uniform sampler2D t;uniform vec2 px;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv+px*vec2(-1.,-1.)).rgb+texture2D(t,vUv+px*vec2(1.,-1.)).rgb+texture2D(t,vUv+px*vec2(-1.,1.)).rgb+texture2D(t,vUv+px*vec2(1.,1.)).rgb;c*=0.25;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(0.8,1.15,l),1.);}');
  const blur = mk({ t: { value: null }, d: { value: new T.Vector2() } }, 'uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*0.227;c+=(texture2D(t,vUv+d*1.4).rgb+texture2D(t,vUv-d*1.4).rgb)*0.316;c+=(texture2D(t,vUv+d*3.3).rgb+texture2D(t,vUv-d*3.3).rgb)*0.07;gl_FragColor=vec4(c,1.);}');
  const fin = mk({ t: { value: null }, b: { value: null }, amt: { value: 0.36 } }, ['uniform sampler2D t;uniform sampler2D b;uniform float amt;varying vec2 vUv;',
    'void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(b,vUv).rgb*amt;',
    'float l=dot(c,vec3(0.299,0.587,0.114));',
    'c*=mix(vec3(0.95,0.98,1.07),vec3(1.05,1.01,0.95),smoothstep(0.12,0.75,l));',   // cool shadows, warm lights
    'c=mix(vec3(l),c,1.06);c=c*1.04/(1.0+max(c-0.85,0.0)*0.35);',                    // a little colour, soft shoulder
    'vec2 q=vUv-0.5;c*=1.0-dot(q,q)*0.42;',
    'gl_FragColor=vec4(c,1.);}'].join('\n'));
  const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.Mesh(new T.PlaneGeometry(2, 2), fin), sc = new T.Scene(); quad.frustumCulled = false; sc.add(quad);
  const size = new T.Vector2(); let main = null, ra = null, rb = null, on = false, w = 0, h = 0;
  function alloc() {
    renderer.getDrawingBufferSize(size); if (main && size.x === w && size.y === h) return; w = size.x; h = size.y;
    for (const r of [main, ra, rb]) if (r) r.dispose();
    const o = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat };
    main = renderer.capabilities.isWebGL2 ? new T.WebGLMultisampleRenderTarget(w, h, o) : new T.WebGLRenderTarget(w, h, o);
    const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2), ob = Object.assign({ depthBuffer: false }, o); ra = new T.WebGLRenderTarget(bw, bh, ob); rb = new T.WebGLRenderTarget(bw, bh, ob);
  }
  const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(sc, cam); };
  renderer.info.autoReset = false;
  return {
    get on() { return on; },
    enable(v) { on = !!v; const vg = document.getElementById('vignette'); if (vg) vg.style.display = on ? 'none' : ''; canvas.style.filter = on ? 'none' : ''; },
    render() {
      renderer.info.reset();
      if (!on) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
      try {
        alloc(); renderer.setRenderTarget(main); renderer.render(scene, camera);
        bright.uniforms.t.value = main.texture; bright.uniforms.px.value.set(1 / w, 1 / h); pass(bright, ra);
        blur.uniforms.t.value = ra.texture; blur.uniforms.d.value.set(1 / ra.width, 0); pass(blur, rb);
        blur.uniforms.t.value = rb.texture; blur.uniforms.d.value.set(0, 1 / ra.height); pass(blur, ra);
        fin.uniforms.t.value = main.texture; fin.uniforms.b.value = ra.texture; pass(fin, null);
      } catch (e) { on = false; this.enable(false); renderer.setRenderTarget(null); renderer.render(scene, camera); }   // any failure falls back to plain rendering
    },
  };
})();
function applyQuality() {
  QUALITY = QUALITY_SETS[SETTINGS.quality] || QUALITY_SETS.medium;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QUALITY.pr));
  if (grass) { for (const m of grass.set.meshes) m.count = Math.max(1, Math.floor(m.userData.max * QUALITY.grass)); grass.count = Math.floor(grass.userData.max * QUALITY.grass); }
  POST.enable(QUALITY.post);
  sun.castShadow = QUALITY.shadow > 0;
  if (QUALITY.shadow > 0 && sun.shadow.mapSize.x !== QUALITY.shadow) { sun.shadow.mapSize.set(QUALITY.shadow, QUALITY.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  onResize();
}
function onResize() {
  const w = window.innerWidth || 1280, h = window.innerHeight || 720;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
