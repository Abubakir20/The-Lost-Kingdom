// Builds the single self-contained index.html from the modules and assets in src/.
// Usage: node build.js
const fs = require('fs');
const MODULES = ['core', 'world', 'scenery', 'entities', 'systems', 'ui', 'main'];
const js = MODULES.map(f => fs.readFileSync('src/' + f + '.js', 'utf8')).join('\n');
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
