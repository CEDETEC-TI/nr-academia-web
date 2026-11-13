// Prueba contra la base REAL de Supabase: cuentas, roles, reglas de acceso (RLS) y Cuaderno por usuario.
// Uso: compilar con las claves reales (.env), `npm run preview`, y
//   NACHO_EMAIL=... node tests/cuenta.mjs      (la clave temporal de Nacho se lee de ~/.academia-nr-nacho-temp.txt)
// Crea un alumno de prueba (qa-…@example.com) y lo borra al terminar, con todo lo suyo.
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { URL_SB, ANON, api, nacho } from './real-db.mjs';

const B = process.env.B ?? 'http://localhost:4321/nr-academia-web/';
let fallos = 0;
const ok = (c, m) => { if (!c) { fallos++; console.error('FALLO:', m); } else console.log('ok:', m); };
const rnd = () => Math.random().toString(36).slice(2, 10);
const qa = { email: `qa-${Date.now()}-${rnd()}@example.com`, clave: `Qa-${rnd()}-${rnd()}` };
const N = nacho();
let uid = null;

try {
  // ── Alta del alumno de prueba (como si ya hubiera confirmado el mail) ──
  const alta = await api('POST', '/auth/v1/admin/users', { email: qa.email, password: qa.clave, email_confirm: true });
  uid = alta.data?.id; ok(!!uid, 'se creó el alumno de prueba');
  const perf = await api('GET', `/rest/v1/perfiles?user_id=eq.${uid}&select=rol`);
  ok(perf.data?.[0]?.rol === 'alumno', 'un usuario nuevo queda con rol "alumno"');

  // ── Reglas de acceso con el cliente público, igual que la web ──
  const nuevo = () => createClient(URL_SB, ANON, { auth: { persistSession: false } });
  const anon = nuevo();
  ok(((await anon.from('cuaderno_entradas').select('*')).data ?? []).length === 0, 'sin sesión no se lee ningún cuaderno');
  ok(((await anon.from('alumnos').select('*')).data ?? []).length === 0, 'sin sesión no se leen alumnos del panel');
  ok(!!(await anon.from('alumnos').insert({ nombre: 'x' })).error, 'sin sesión no se puede escribir en el panel');

  const al = nuevo(); ok(!(await al.auth.signInWithPassword({ email: qa.email, password: qa.clave })).error, 'el alumno entra con mail y contraseña');
  ok(!!(await al.from('alumnos').insert({ nombre: 'QA' })).error, 'el alumno NO puede crear alumnos en el panel');
  ok(((await al.from('alumnos').select('*')).data ?? []).length === 0, 'el alumno NO ve datos del panel');
  await al.from('perfiles').update({ rol: 'nacho' }).eq('user_id', uid);
  ok((await api('GET', `/rest/v1/perfiles?user_id=eq.${uid}&select=rol`)).data?.[0]?.rol === 'alumno', 'el alumno NO puede subirse el rol a "nacho"');
  ok(!!(await al.from('perfiles').insert({ user_id: uid, rol: 'nacho' })).error, 'el alumno NO puede crear su propio perfil');
  ok(!(await al.from('cuaderno_entradas').insert({ coleccion: 'partidos', id: 'rls1', data: { companero: 'QA' } })).error, 'el alumno guarda en su cuaderno');
  ok(!!(await al.from('cuaderno_entradas').insert({ owner: '00000000-0000-0000-0000-000000000000', coleccion: 'partidos', id: 'rls2', data: {} })).error, 'el alumno NO puede escribir en el cuaderno de otro usuario');

  const na = nuevo(); ok(!(await na.auth.signInWithPassword({ email: N.email, password: N.clave })).error, 'Nacho entra con su clave temporal');
  ok((await na.from('perfiles').select('rol')).data?.[0]?.rol === 'nacho', 'Nacho tiene rol "nacho"');
  ok(((await na.from('cuaderno_entradas').select('*')).data ?? []).length === 0, 'Nacho NO ve el cuaderno del alumno');
  const crea = await na.from('alumnos').insert({ nombre: 'QA rol nacho' }).select('id').single();
  ok(!crea.error, 'Nacho SÍ puede crear alumnos en el panel');
  if (crea.data) await na.from('alumnos').delete().eq('id', crea.data.id);

  // ── Navegador ──
  const b = await chromium.launch();
  const errs = [];
  const nuevaPagina = async (ctx) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (x) => x.type() === 'error' && errs.push(x.text())); return p; };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('padel-cuaderno-v1')) localStorage.setItem('padel-cuaderno-v1', JSON.stringify({ partidos: [
      { id: 'qa-a1', fecha: '2026-11-01', tipo: 'Amistoso', companero: 'Compañero QA', rivales: 'Rival QA', resultado: '6-4 6-3', gano: 'Ganado', creado: 1 },
      { id: 'qa-a2', fecha: '2026-11-03', tipo: 'Liga', companero: 'Otro QA', rivales: 'Rival 2', resultado: '3-6 4-6', gano: 'Perdido', creado: 2 }],
    torneos: [], entrenos: [], fisico: [], mental: [], ficha: { nombre: 'Alumno QA', posicion: 'Revés' } }));
  });
  const p = await nuevaPagina(ctx);

  // Sin sesión: el cuaderno funciona y ofrece entrar
  await p.goto(B + 'cuaderno/', { waitUntil: 'networkidle' });
  ok(/Sin cuenta/.test(await p.textContent('#nube')), 'cuaderno sin sesión: avisa que guarda en el navegador y ofrece cuenta');
  ok(/navegador/.test(await p.textContent('#status')), 'cuaderno sin sesión: estado "guardado en este navegador"');
  await p.goto(B + 'panel/', { waitUntil: 'networkidle' });
  ok(await p.isVisible('#login'), 'panel sin sesión: pide login');
  ok(await p.isHidden('#panel'), 'panel sin sesión: no muestra datos');

  // Login del alumno en /cuenta/
  await p.goto(B + 'cuenta/', { waitUntil: 'networkidle' });
  { // el 400 del navegador por la clave mala es esperado: esta página no cuenta para "consola limpia"
    const pm = await ctx.newPage();
    await pm.goto(B + 'cuenta/', { waitUntil: 'networkidle' });
    await pm.fill('#f-entrar input[name=email]', qa.email); await pm.fill('#f-entrar input[name=clave]', 'clave-mala');
    await pm.click('#f-entrar button[type=submit]'); await pm.waitForSelector('#c-estado:not([hidden])');
    ok(/incorrectos/.test(await pm.textContent('#c-estado')), 'login con clave mala: mensaje claro');
    await pm.close();
  }
  await p.fill('#f-entrar input[name=email]', qa.email);
  await p.fill('#f-entrar input[name=clave]', qa.clave); await p.click('#f-entrar button[type=submit]');
  await p.waitForSelector('#c-dentro:not([hidden])');
  ok((await p.textContent('#c-mail')) === qa.email, 'cuenta: muestra el mail del alumno');
  ok(await p.isHidden('#c-panel'), 'cuenta: el alumno NO ve el botón del panel');
  ok(await p.locator('a[data-nav=cuenta]').first().isVisible() && /Mi cuenta/.test(await p.locator('a[data-nav=cuenta]').first().textContent()), 'menú: dice "Mi cuenta" con sesión');
  ok(await p.locator('a[data-nav=panel]').first().isHidden(), 'menú: el alumno NO ve "Panel"');
  await p.goto(B + 'panel/', { waitUntil: 'networkidle' });
  await p.waitForSelector('#sinacceso:not([hidden])');
  ok(await p.isHidden('#panel'), 'panel: la cuenta de alumno ve "este panel es de Nacho" y ningún dato');

  // Cuaderno con sesión: subir lo del navegador
  await p.goto(B + 'cuaderno/', { waitUntil: 'networkidle' });
  await p.waitForSelector('#subir');
  ok(/2 registros/.test(await p.textContent('#nube')), 'cuaderno con sesión: ofrece subir los 2 registros del navegador');
  ok(/tu cuenta/.test(await p.textContent('#status')), 'cuaderno con sesión: estado "guardado en tu cuenta"');
  await p.click('#subir'); await p.waitForFunction(() => document.getElementById('nube').hidden);
  const filas = (await api('GET', `/rest/v1/cuaderno_entradas?owner=eq.${uid}&select=id,coleccion`)).data;
  ok(filas.some((f) => f.id === 'qa-a1') && filas.some((f) => f.id === 'qa-a2'), 'los registros del navegador quedaron en la base, a nombre del alumno');
  ok((await api('GET', `/rest/v1/cuaderno_ficha?owner=eq.${uid}&select=data`)).data?.[0]?.data?.nombre === 'Alumno QA', 'la ficha también se subió');
  // Otro dispositivo (contexto limpio): inicia sesión y ve lo mismo
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await nuevaPagina(ctx2);
  await p2.goto(B + 'cuenta/', { waitUntil: 'networkidle' });
  await p2.fill('#f-entrar input[name=email]', qa.email); await p2.fill('#f-entrar input[name=clave]', qa.clave);
  await p2.click('#f-entrar button[type=submit]'); await p2.waitForSelector('#c-dentro:not([hidden])');
  await p2.goto(B + 'cuaderno/#historial', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(500);
  ok(/Compañero QA/.test(await p2.textContent('#view')), 'otro dispositivo: el cuaderno trae los partidos de la nube');
  ok(await p2.isHidden('#nube'), 'otro dispositivo: sin nada para subir, no molesta');
  // Guardar y borrar desde la interfaz
  await p2.goto(B + 'cuaderno/#ficha', { waitUntil: 'networkidle' });
  ok(/Alumno QA/.test(await p2.textContent('#view')), 'otro dispositivo: la ficha viene de la nube');
  await p2.click('#tabs a[href="#partidos"]'); await p2.waitForTimeout(300);
  // salir
  await p.goto(B + 'cuenta/', { waitUntil: 'networkidle' }); await p.click('#b-salir');
  await p.waitForSelector('#c-entrada:not([hidden])');
  ok(await p.evaluate(() => !localStorage.getItem('nr-sesion')), 'al salir se borra la pista del menú');
  await ctx2.close();

  // Nacho en el panel real
  const ctx3 = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pn = await nuevaPagina(ctx3);
  await pn.goto(B + 'panel/', { waitUntil: 'networkidle' });
  await pn.fill('#login input[name=email]', N.email); await pn.fill('#login input[name=clave]', N.clave); await pn.click('#login button');
  await pn.waitForSelector('#panel:not([hidden])');
  ok(await pn.isHidden('#sinacceso'), 'panel: Nacho entra y ve la agenda');
  await pn.goto(B, { waitUntil: 'networkidle' });
  ok(await pn.locator('a[data-nav=panel]').first().isVisible(), 'menú: Nacho SÍ ve "Panel"');
  await pn.goto(B + 'cuenta/', { waitUntil: 'networkidle' }); await pn.waitForSelector('#c-dentro:not([hidden])');
  ok(/cuenta de Nacho/.test(await pn.textContent('#c-rol')) && await pn.isVisible('#c-panel'), 'cuenta: Nacho ve el botón "Abrir el panel"');
  ok(errs.length === 0, 'consola limpia: ' + errs.join(' | '));
  await b.close();
} finally {
  if (uid) { const r = await api('DELETE', `/auth/v1/admin/users/${uid}`); console.log('limpieza: alumno de prueba borrado', r.status); }
}
process.exit(fallos ? 1 : 0);
