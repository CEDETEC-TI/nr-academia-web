// Lighthouse móvil y escritorio sobre el sitio servido con `astro preview`.
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:4321/nr-academia-web/';
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
let fail = 0;
for (const [name, path] of [['inicio', ''], ['clase', 'clases/individuales/']]) {
  for (const preset of ['mobile', 'desktop']) {
    const cfg = preset === 'desktop' ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } } : undefined;
    const r = await lighthouse(BASE + path, { port: chrome.port, output: 'json', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, cfg);
    const c = r.lhr.categories; const sc = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const ok = sc.performance >= 90 && sc.accessibility >= 90; if (!ok) fail++;
    const a = r.lhr.audits;
    console.log(`${ok ? 'OK ' : 'FAIL'} ${name} ${preset}`, JSON.stringify(sc), `LCP=${a['largest-contentful-paint'].displayValue} CLS=${a['cumulative-layout-shift'].displayValue} TBT=${a['total-blocking-time'].displayValue}`);
    if (!ok) for (const k of ['performance', 'accessibility']) for (const ref of c[k].auditRefs) { const au = a[ref.id]; if (au.score !== null && au.score < 0.9 && ref.weight > 0) console.log('   -', k, au.id, au.score, au.displayValue ?? ''); }
  }
}
await chrome.kill();
process.exit(fail ? 1 : 0);
