// Prueba de humo: 390px y 1440px, consola limpia, sin scroll horizontal, reduced-motion.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE_URL ?? 'http://localhost:4321/nr-academia-web/';
const OUT = process.env.OUT ?? 'tests/shots';
mkdirSync(OUT, { recursive: true });
const pages = ['', 'cuaderno/', 'clases/individuales/', 'clases/grupales/', 'clases/para-chicos/', 'clases/competencia/', 'no-existe/'];
const sizes = [{ n: 'm', width: 390, height: 844, mobile: true }, { n: 'd', width: 1440, height: 900 }];
const browser = await chromium.launch();
let fail = 0;
for (const reduce of ['no-preference', 'reduce']) {
  for (const s of sizes) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, isMobile: !!s.mobile, hasTouch: !!s.mobile, deviceScaleFactor: 2, reducedMotion: reduce });
    for (const p of pages) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/google\.com\/maps|Failed to load resource.*(404)/.test(m.text() + m.location().url) && errs.push(m.text()));
      page.on('pageerror', (e) => errs.push(String(e)));
      // Las cancelaciones (ERR_ABORTED) de videos al cerrar la página o pausarlos fuera de vista son normales.
      page.on('requestfailed', (r) => !r.url().includes('google.com') && !(r.url().endsWith('.mp4') && /ABORTED/.test(r.failure()?.errorText ?? '')) && errs.push('requestfailed ' + r.url()));
      const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });
      // recorrer la página para disparar reveals
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
      await page.waitForTimeout(900);
      const overflow = (await page.evaluate(() => document.documentElement.scrollWidth)) - s.width; // ancho fijo: innerWidth se ensancha en modo móvil
      const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity < 0.99).length);
      const menuOk = !s.mobile || (await page.evaluate(() => { const r = document.getElementById('menu-btn').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.x >= 0; }));
      if (!menuOk) errs.push('botón de menú fuera de pantalla');
      const ok = errs.length === 0 && overflow <= 0 && hidden === 0 && (res.status() === 200 || p === 'no-existe/');
      if (!ok) fail++;
      console.log(`${ok ? 'OK ' : 'FAIL'} ${reduce} ${s.n} /${p} status=${res.status()} overflow=${overflow} sinRevelar=${hidden} errores=${JSON.stringify(errs)}`);
      if (reduce === 'no-preference' && (p === '' || p.includes('individuales'))) {
        await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
        await page.screenshot({ path: `${OUT}/${s.n}-${p.replace(/\W/g, '') || 'home'}.png`, fullPage: true });
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
console.log(fail ? `\n${fail} FALLAS` : '\nTODO OK');
process.exit(fail ? 1 : 0);
