// Builds the single self-contained index.html from the compiled game script and the assets in src/.
// Usage: npm run build   (tsc, then this script)
const fs = require('fs');
// dist/game.js is the TypeScript output: every src/*.ts compiled, in order, into one script (run `npx tsc` or `npm run build`)
if (!fs.existsSync('dist/game.js')) { console.error('dist/game.js is missing: run `npx tsc` first (or `npm run build`)'); process.exit(1); }
const js = fs.readFileSync('dist/game.js', 'utf8');
const b64 = p => fs.readFileSync(p).toString('base64');

// painted textures and key art are embedded so the page needs no other files
const tex = {};
for (const f of fs.readdirSync('src/tex').sort()) {
  const m = f.match(/^(\w+)\.(jpg|png)$/); if (!m) continue;
  tex[m[1]] = 'data:image/' + (m[2] === 'jpg' ? 'jpeg' : 'png') + ';base64,' + b64('src/tex/' + f);
}
const art = {};
for (const f of fs.readdirSync('src/art').sort()) {
  const m = f.match(/^(\w+)\.jpg$/); if (m) art[m[1]] = 'data:image/jpeg;base64,' + b64('src/art/' + f);
}
const texJs = 'window.TLK_TEX=' + JSON.stringify(tex) + ';\nwindow.TLK_ART=' + JSON.stringify(art) + ';\n';

// the sculpted hero: packed mesh (positions, normals, uvs, indices) and its texture
const heroJs = fs.existsSync('src/hero3d/mesh.bin')
  ? 'window.TLK_HERO=' + JSON.stringify({ mesh: b64('src/hero3d/mesh.bin'), tex: 'data:image/jpeg;base64,' + b64('src/hero3d/tex.jpg') }) + ';\n'
  : '';

const html = fs.readFileSync('src/template.html', 'utf8').replace('/*__JS__*/', () => texJs + heroJs + js);
fs.writeFileSync('index.html', html);
console.log('built index.html', html.length, 'bytes; textures:', Object.keys(tex).join(','));
