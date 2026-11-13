// Prueba del panel de Nacho (modo demo): clases, inscripciones, asistencia, cuenta, cupo, suspensión y búsqueda de horario libre.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const B = process.env.B ?? 'http://localhost:4321/nr-academia-web/panel/'; const OUT = process.argv[2] ?? 'tests/shots'; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); let fallos = 0;
const ok = (c, m) => { if (!c) { fallos++; console.error('FALLO:', m); } else console.log('ok:', m); };
for (const [n, w, h, m] of [['m', 390, 844, true], ['d', 1440, 900, false]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto(B, { waitUntil: 'networkidle' });
  const wait = () => p.waitForTimeout(150);
  const vista = async (v) => { await p.click(`[data-a=vista][data-v=${v}]`); await wait(); };
  const dia = async (d) => { if (m) { await p.click(`.chip[data-d="${d}"]`); await wait(); } };
  ok(await p.locator('.vacio').count() === 1, `${n}: Hoy vacío al empezar`);

  // ── Crear una clase grupal lunes y miércoles 18:00, cupo 2, con dos alumnos nuevos ──
  await vista('semana'); await dia(1);
  const lun = await p.getAttribute('.dia:nth-child(1) .slot[data-h="18"]', 'data-f');
  await p.click(`.slot[data-f="${lun}"][data-h="18"]`);
  ok(await p.isChecked('#hoja input[name=tipo][value=Grupales]'), `${n}: el tipo por defecto es Grupales`);
  ok((await p.textContent('#cupo-v')) === '4', `${n}: cupo por defecto 4`);
  await p.click('[data-cupo="-1"]'); await p.click('[data-cupo="-1"]');
  await p.fill('#hoja input[name=nuevo]', 'Ana Pérez'); await p.press('#hoja input[name=nuevo]', 'Enter');
  await p.fill('#hoja input[name=nuevo]', 'Beto'); await p.click('[data-q-add]');
  await p.click('#hoja label:has(input[name=dia][value="3"])');
  await p.click('#hoja button[type=submit]'); await wait();
  const celda = await p.textContent(`.slot[data-f="${lun}"][data-h="18"]`);
  ok(/Ana, Beto/.test(celda) && /2\/2/.test(celda), `${n}: lunes 18:00 con Ana y Beto 2/2 (${celda.trim()})`);
  await dia(3);
  const mie = await p.getAttribute('.dia:nth-child(3) .slot[data-h="18"]', 'data-f');
  ok(/2\/2/.test(await p.textContent(`.slot[data-f="${mie}"][data-h="18"]`)), `${n}: miércoles 18:00 también creada`);

  // ── Hoy: asistencia ──
  await vista('hoy'); await p.fill('#fecha-hoy', lun); await wait();
  ok(await p.locator('.clase').count() === 1 && /2\/2/.test(await p.textContent('.cupo')), `${n}: Hoy muestra la clase del lunes`);
  await p.click('.al:has-text("Ana") .e-vino'); await p.click('.al:has-text("Beto") .e-falto'); await wait();
  ok(await p.getAttribute('.al:has-text("Ana") .e-vino', 'aria-pressed') === 'true' && await p.getAttribute('.al:has-text("Beto") .e-falto', 'aria-pressed') === 'true', `${n}: asistencia marcada`);

  // ── Cuenta ──
  await vista('alumnos');
  ok(/Debe \$10\.000/.test(await p.textContent('.alu:has-text("Ana")')) && !/Debe/.test(await p.textContent('.alu:has-text("Beto")')), `${n}: Ana debe $10.000 (vino), Beto no (faltó sin avisar)`);
  ok(/Lun 18:00 · Mié 18:00/.test(await p.textContent('.alu:has-text("Ana")')), `${n}: la ficha muestra sus clases`);
  await vista('cobros');
  ok(/A cobrar\s*\$10\.000/.test(await p.textContent('.resumen')), `${n}: Cobros suma $10.000`);
  await p.click('[data-a=cobrar]'); await wait();
  ok(await p.inputValue('#hoja input[name=monto]') === '10000', `${n}: el pago viene con el monto adeudado`);
  await p.click('#hoja button[type=submit]'); await wait();
  ok(/Nadie te debe/.test(await p.textContent('#panel')), `${n}: tras el pago queda al día`);

  // ── Cupo ──
  await vista('semana'); await dia(1);
  await p.click(`.slot[data-f="${lun}"][data-h="18"]`);
  await p.fill('#hoja input[name=nuevo]', 'Caro'); await p.click('[data-a=anotar]');
  ok(/completa/.test(await p.textContent('#aviso')), `${n}: clase completa no deja anotar`);
  await p.click('[data-cupo="1"]'); await p.click('[data-a=ajustes]'); await wait();
  ok(/2\/3/.test(await p.textContent('#hoja .cupo')), `${n}: se sube el cupo a 3`);
  await p.fill('#hoja input[name=nuevo]', 'Caro'); await p.click('#hoja label:has(input[name=hasta][value=dia])'); await p.click('[data-a=anotar]'); await wait();
  ok(await p.locator('#hoja .filas .fila').count() === 3 && /solo este día/.test(await p.textContent('#hoja .filas')), `${n}: Caro anotada solo ese día`);
  await p.keyboard.press('Escape');
  await vista('hoy'); ok(/solo hoy/.test(await p.textContent('.clase')), `${n}: Caro figura como visita en Hoy`);
  await p.fill('#fecha-hoy', sumarSemana(lun)); await wait();
  ok(!/Caro/.test(await p.textContent('#panel')) && /Ana/.test(await p.textContent('#panel')), `${n}: la semana siguiente sigue Ana y ya no Caro`);

  // ── Suspender una fecha ──
  await vista('semana'); await dia(1);
  await p.click(`.slot[data-f="${lun}"][data-h="18"]`); await p.click('[data-a=suspender]'); await wait(); await p.keyboard.press('Escape');
  ok(/suspendida/.test(await p.textContent(`.slot[data-f="${lun}"][data-h="18"]`)), `${n}: la clase queda suspendida ese día`);
  await vista('hoy'); await p.fill('#fecha-hoy', lun); await wait();
  ok(/suspendida/.test(await p.textContent('.clase')), `${n}: Hoy muestra la suspensión`);
  await p.click('[data-a=reactivar]'); await wait(); ok(await p.locator('.est').count() === 1 || await p.locator('.roster').count() === 1, `${n}: se reactiva`);

  // ── ¿Tenés libre el lunes? ──
  await vista('semana'); await p.click('[data-a=libres]'); await p.click('[data-a=libre-dia][data-d="1"]'); await wait();
  const filas = await p.locator('#hoja .fila').count();
  ok(filas === 10 && /18:00 · Grupales 3\/3|18:00 · Grupales 2\/3/.test(await p.textContent('#hoja .filas')) && /libre las próximas 4 semanas/.test(await p.textContent('#hoja .filas')), `${n}: la búsqueda lista los 10 horarios (${filas})`);
  await p.keyboard.press('Escape');

  // ── Alumnos: ficha ──
  await vista('alumnos'); await p.click('[data-a=nuevo-alu]');
  await p.fill('#hoja input[name=nombre]', 'Dani Ríos'); await p.fill('#hoja input[name=telefono]', '3704 123456'); await p.click('#hoja label:has(input[name=nivel][value=Intermedio])'); await p.click('#hoja button[type=submit]'); await wait();
  ok((await p.getAttribute('.alu:has-text("Dani") .alu-wa', 'href')) === 'https://wa.me/5493704123456', `${n}: link de WhatsApp`);
  await p.fill('#busca', 'rios'); ok(await p.locator('.alu').count() === 1, `${n}: búsqueda sin acentos`); await p.fill('#busca', '');
  await p.click('.alu:has-text("Dani") .alu-main'); await p.click('#hoja [data-a=borrar]'); ok(await p.locator('.alu:has-text("Dani")').count() === 1, `${n}: borrar pide segundo toque`);
  await p.click('#hoja [data-a=borrar]'); await wait(); ok(await p.locator('.alu:has-text("Dani")').count() === 0, `${n}: alumno borrado`);

  ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${n}: sin scroll horizontal`);
  for (const v of ['hoy', 'semana', 'alumnos', 'cobros']) { await vista(v); ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${n}: sin scroll horizontal en ${v}`); }
  await vista('hoy'); await p.fill('#fecha-hoy', lun); await wait();
  await p.screenshot({ path: `${OUT}/panel-${n}-hoy.png`, fullPage: true });
  await vista('semana'); await p.screenshot({ path: `${OUT}/panel-${n}-semana.png`, fullPage: true });
  ok(errs.length === 0, `${n}: consola limpia ${errs.join(' | ')}`);
  await c.close();
}
// ── Datos de ejemplo ──
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(B, { waitUntil: 'networkidle' });
  await p.click('#seed'); await p.waitForTimeout(400);
  await p.click('[data-a=vista][data-v=alumnos]');
  ok(await p.locator('.alu').count() === 5 && /Debe \$20\.000/.test(await p.textContent('.alu:has-text("Pedro")')), 'ejemplo: 5 alumnos y Pedro debe 2 clases');
  ok(await p.locator('#seed').isHidden(), 'ejemplo: el botón se esconde cuando ya hay datos');
  await p.screenshot({ path: `${OUT}/panel-d-alumnos.png`, fullPage: true });
  ok(errs.length === 0, `ejemplo: consola limpia ${errs.join(' | ')}`);
  await c.close();
}
await b.close();
function sumarSemana(f) { const d = new Date(f + 'T00:00:00'); d.setDate(d.getDate() + 7); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
process.exit(fallos ? 1 : 0);
