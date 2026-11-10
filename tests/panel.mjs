// Prueba del panel de Nacho en modo demo: ocupar, ver la semana siguiente, liberar un día, deshacer, liberar para siempre.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const B = process.env.B ?? 'http://localhost:4321/nr-academia-web/panel/'; const OUT = process.argv[2] ?? 'tests/shots'; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const res = {};
for (const [n, w, h, m] of [['m', 390, 844, true], ['d', 1440, 900, false]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto(B, { waitUntil: 'networkidle' });
  const resumen = () => p.textContent('.resumen');
  const r0 = await resumen();
  // ocupar lunes 08:00 como fijo
  if (m) await p.click('.chip[data-dia="1"]');
  const lunes = await p.getAttribute('.dia:first-child .slot[data-h="8"]', 'data-f');
  const slot = `.slot[data-f="${lunes}"][data-h="8"]`;
  await p.click(slot); await p.fill('#hoja input[name=alumnos]', 'Juan Pérez'); await p.click('#hoja .opts label:nth-child(2)'); await p.click('#hoja button[type=submit]'); await p.waitForTimeout(150);
  const r1 = await resumen(); const t1 = await p.textContent(slot);
  await p.click('[data-act=next]'); await p.waitForTimeout(100);
  const sig = await p.textContent('.dia:first-child .slot[data-h="8"]');
  await p.click('[data-act=prev]'); await p.waitForTimeout(100);
  // liberar solo este día
  await p.click(slot); await p.click('#hoja [data-lib=dia]'); await p.waitForTimeout(150); const t2 = await p.textContent(slot);
  // deshacer
  await p.click(slot); await p.click('#hoja [data-lib=deshacer]'); await p.waitForTimeout(150); const t3 = await p.textContent(slot);
  // liberar para siempre
  await p.click(slot); await p.click('#hoja [data-lib=siempre]'); await p.waitForTimeout(150); const t4 = await p.textContent(slot);
  await p.click('[data-act=next]'); await p.waitForTimeout(100); const sig2 = await p.textContent('.dia:first-child .slot[data-h="8"]'); await p.click('[data-act=prev]');
  // turno de un solo día
  const s9 = `.slot[data-f="${lunes}"][data-h="9"]`;
  await p.click(s9); await p.fill('#hoja input[name=alumnos]', 'Sofía y Lucas'); await p.uncheck('#hoja input[name=fijo]'); await p.click('#hoja button[type=submit]'); await p.waitForTimeout(150);
  const t5 = await p.textContent(s9);
  await p.click(s9); await p.waitForTimeout(100); await p.screenshot({ path: `${OUT}/panel-${n}-hoja.png` }); await p.keyboard.press('Escape');
  await p.screenshot({ path: `${OUT}/panel-${n}.png`, fullPage: true });
  const ov = (await p.evaluate(() => document.documentElement.scrollWidth)) - w;
  const slots = await p.locator('.dia .slot').count();
  const robots = await p.getAttribute('meta[name=robots]', 'content');
  res[n] = { r0, r1, t1, sig, t2, t3, t4, sig2, t5, ov, slots, robots, errs };
  await c.close();
}
await b.close();
console.log(JSON.stringify(res, null, 1));
