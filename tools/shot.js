// node shot.js jobs.json — job: {js, wait, js2, wait2, out, w, h}; shared helper for tests too
const { chromium } = require('playwright'); const fs = require('fs');
async function open(w = 1120, h = 630) {
  const three = fs.readFileSync(__dirname + '/node_modules/three/build/three.min.js', 'utf8');
  let html = fs.readFileSync(process.env.TLK_HTML || require('path').join(__dirname, '..', 'index.html'), 'utf8');
  html = html.replace(/<script src="https:\/\/cdnjs[^"]*"><\/script>/, () => '<script>' + three + '</script>').replace(/<link rel="stylesheet"[^>]*>/, '');
  fs.writeFileSync(__dirname + '/_test.html', html);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } }); const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 900)); });
  page.on('pageerror', e => logs.push('PAGEERROR ' + String(e.stack || e).slice(0, 900)));
  await page.goto('file://' + __dirname + '/_test.html'); await page.waitForTimeout(2500);
  await page.evaluate("canvas.requestPointerLock=()=>{};window.STEP=(n)=>{const r=renderer.render,q=window.requestAnimationFrame;renderer.render=()=>{};window.requestAnimationFrame=()=>0;let t=performance.now()+100;for(let i=0;i<n;i++){t+=16.67;frame(t)}renderer.render=r;window.requestAnimationFrame=q;lastT=performance.now()};1");
  return { browser, page, logs };
}
module.exports = { open };
if (require.main === module) (async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (const j of jobs) {
    const { browser, page, logs } = await open(j.w, j.h);
    try {
      if (j.js) { const r = await page.evaluate(j.js); if (r != null) console.log(j.out, JSON.stringify(r)); }
      await page.waitForTimeout(j.wait || 1500);
      if (j.js2) { const r = await page.evaluate(j.js2); if (r != null) console.log(j.out, 'js2', JSON.stringify(r)); await page.waitForTimeout(j.wait2 || 600); }
      await page.screenshot({ path: j.out, type: 'jpeg', quality: 82 });
    } catch (e) { console.log('JOB FAIL', j.out, String(e).slice(0, 300)); }
    [...new Set(logs)].slice(0, 8).forEach(l => console.log('  LOG', l));
    await browser.close();
  }
})();
