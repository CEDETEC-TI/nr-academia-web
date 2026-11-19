// Cuaderno de Pádel simplificado: una entrada por día con fecha, "Qué trabajé hoy", "Qué me costó" y "Qué practico para la próxima".
// Sin cuenta se guarda en este navegador (localStorage). Con cuenta, en Supabase (`cuaderno_notas`, RLS por dueño).
import { cliente, hayNube, mensajeError, sesion, type Sesion } from './auth';
import { url } from '../utils';

interface Nota { id: string; fecha: string; trabaje: string; costo: string; proxima: string }

const LS_V1 = 'padel-cuaderno-v1'; // el cuaderno anterior: no se toca nunca
const LS = 'nr-cuaderno-v2';
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fechaLarga = (f: string) => new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const nuevoId = () => (crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const ordenar = (n: Nota[]) => [...n].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));

let notas: Nota[] = [];
let ses: Sesion | null = null;
let editando: string | null = null;
let borrando: string | null = null;

// ───────────── Guardado local (sin cuenta) ─────────────
function leerLocal(): Nota[] {
  try {
    const v2 = localStorage.getItem(LS);
    if (v2) return JSON.parse(v2) as Nota[];
    const v1 = localStorage.getItem(LS_V1); // primera vez con el cuaderno nuevo: se convierte lo viejo (el original queda como estaba)
    if (v1) { const n = convertirV1(JSON.parse(v1)); guardarLocal(n); return n; }
  } catch { /* sin storage o datos rotos */ }
  return [];
}
function guardarLocal(n: Nota[]) { try { localStorage.setItem(LS, JSON.stringify(n)); } catch { /* sin storage */ } }

/** Pasa los registros del cuaderno anterior al formato nuevo (misma regla que la migración SQL). */
function convertirV1(o: Record<string, Record<string, unknown>[]>): Nota[] {
  const t = (v: unknown) => (v == null ? '' : String(v).trim());
  const juntar = (...p: unknown[]) => p.map(t).filter(Boolean).join('\n');
  const cortar = (s: string) => s.slice(0, 2000);
  const out: Nota[] = [];
  for (const col of ['entrenos', 'partidos', 'mental', 'fisico', 'torneos']) {
    for (const r of o[col] ?? []) {
      if (!r || typeof r.id !== 'string' || !r.id) continue;
      const fecha = /^\d{4}-\d{2}-\d{2}$/.test(t(r.fecha)) ? t(r.fecha) : hoy();
      let trabaje = '', costo = '', proxima = '';
      if (col === 'entrenos') trabaje = juntar([t(r.foco), t(r.tipo), r.minutos ? t(r.minutos) + ' min' : ''].filter(Boolean).join(' · '), r.notas);
      if (col === 'partidos') { trabaje = juntar(['Partido', t(r.tipo), r.rivales ? 'vs ' + t(r.rivales) : '', t(r.resultado)].filter(Boolean).join(' · '), r.funciono); costo = t(r.mejorar); }
      if (col === 'mental') { trabaje = juntar('Mental', r.situacion, r.hice); costo = t(r.senti); proxima = t(r.proxima); }
      if (col === 'fisico') trabaje = juntar('Físico', r.notas);
      if (col === 'torneos') { trabaje = juntar(['Torneo', t(r.nombre), t(r.instancia)].filter(Boolean).join(' · '), r.balance); proxima = t(r.objetivo); }
      out.push({ id: `mig-${col}-${r.id}`.slice(0, 80), fecha, trabaje: cortar(trabaje), costo: cortar(costo), proxima: cortar(proxima) });
    }
  }
  return out;
}

// ───────────── Guardado en la nube (con cuenta) ─────────────
async function leerNube(): Promise<Nota[]> {
  const sb = await cliente();
  const out: Nota[] = [];
  for (let d = 0; ; d += 1000) { // Supabase devuelve como máximo 1000 filas por pedido
    const { data, error } = await sb.from('cuaderno_notas').select('id,fecha,trabaje,costo,proxima').order('fecha', { ascending: false }).order('id').range(d, d + 999);
    if (error) throw error;
    out.push(...(data as Nota[]));
    if ((data ?? []).length < 1000) return out;
  }
}
async function guardarNube(n: Nota) {
  const { error } = await (await cliente()).from('cuaderno_notas').upsert({ owner: ses!.id, ...n, actualizado: new Date().toISOString() }, { onConflict: 'owner,id' });
  if (error) throw error;
}
async function borrarNube(id: string) {
  const { error } = await (await cliente()).from('cuaderno_notas').delete().eq('owner', ses!.id).eq('id', id);
  if (error) throw error;
}

// ───────────── Pantalla ─────────────
function toast(msg: string) {
  const t = $('#c-toast'); t.textContent = msg; t.hidden = false;
  clearTimeout((toast as unknown as { t: number }).t); (toast as unknown as { t: number }).t = window.setTimeout(() => (t.hidden = true), 2800);
}
function pintar() {
  const lista = ordenar(notas);
  $('#c-vacio').hidden = lista.length > 0;
  $('#c-lista').innerHTML = lista.map((n) => {
    const bloques = ([['Qué trabajé', n.trabaje], ['Qué me costó', n.costo], ['Qué practico para la próxima', n.proxima]] as const)
      .filter(([, v]) => v.trim()).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    return `<li class="c-nota"><p class="c-fecha">${esc(fechaLarga(n.fecha))}</p><dl>${bloques}</dl>
      <div class="c-acc"><button type="button" data-a="editar" data-id="${esc(n.id)}">Editar</button>
      <button type="button" data-a="borrar" data-id="${esc(n.id)}"${borrando === n.id ? ' data-peligro' : ''}>${borrando === n.id ? 'Tocá de nuevo para borrar' : 'Borrar'}</button></div></li>`;
  }).join('');
}
function estado() {
  const e = $('#c-estado');
  e.textContent = ses ? `Guardado en tu cuenta (${ses.email})` : 'Guardado solo en este navegador';
  const nube = $('#c-nube'); nube.hidden = true;
  if (!hayNube) return;
  if (!ses) { nube.hidden = false; nube.innerHTML = `Si entrás con tu cuenta, tu cuaderno queda guardado en la nube. <a class="c-link" href="${url('cuenta/')}">Entrar</a>`; return; }
  const locales = leerLocalSinConvertir();
  if (locales.length) {
    nube.hidden = false;
    nube.innerHTML = `Hay ${locales.length} ${locales.length === 1 ? 'entrada guardada' : 'entradas guardadas'} en este navegador. <button class="c-btn" type="button" id="c-subir">Subirlas a mi cuenta</button>`;
    $('#c-subir').onclick = subirLocales;
  }
}
const leerLocalSinConvertir = () => { const l = leerLocal(); const ids = new Set(notas.map((n) => n.id)); return l.filter((n) => !ids.has(n.id)); };
async function subirLocales() {
  const b = $<HTMLButtonElement>('#c-subir'); b.disabled = true;
  try {
    const l = leerLocalSinConvertir();
    for (let i = 0; i < l.length; i += 200) {
      const { error } = await (await cliente()).from('cuaderno_notas').upsert(l.slice(i, i + 200).map((n) => ({ owner: ses!.id, ...n })), { onConflict: 'owner,id' });
      if (error) throw error;
    }
    notas = await leerNube(); pintar(); estado(); toast(`Subimos ${l.length} ${l.length === 1 ? 'entrada' : 'entradas'} a tu cuenta`);
  } catch (e) { toast(mensajeError(e)); b.disabled = false; }
}

function abrirForm(n: Nota | null) {
  const f = $<HTMLFormElement>('#c-form');
  editando = n?.id ?? null;
  f.fecha.value = n?.fecha ?? hoy(); f.trabaje.value = n?.trabaje ?? ''; f.costo.value = n?.costo ?? ''; f.proxima.value = n?.proxima ?? '';
  $('#c-form-titulo').textContent = n ? 'Editar entrada' : 'Nueva entrada';
  $('#c-cancelar').hidden = !n;
  if (n) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.trabaje.focus(); }
}

async function iniciar() {
  ses = await sesion().catch(() => null);
  try { notas = ses ? await leerNube() : leerLocal(); } catch (e) { $('#c-estado').textContent = mensajeError(e); notas = []; }
  estado(); pintar(); abrirForm(null);

  const f = $<HTMLFormElement>('#c-form');
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const n: Nota = { id: editando ?? nuevoId(), fecha: f.fecha.value, trabaje: f.trabaje.value.trim(), costo: f.costo.value.trim(), proxima: f.proxima.value.trim() };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.fecha)) return toast('Elegí la fecha.');
    if (!n.trabaje && !n.costo && !n.proxima) return toast('Escribí al menos una de las tres cosas.');
    const b = f.querySelector<HTMLButtonElement>('button[type=submit]')!; b.disabled = true;
    try {
      if (ses) await guardarNube(n);
      notas = [...notas.filter((x) => x.id !== n.id), n];
      if (!ses) guardarLocal(notas);
      toast(editando ? 'Entrada actualizada' : 'Entrada guardada'); abrirForm(null); pintar(); estado();
    } catch (e) { toast(mensajeError(e)); } finally { b.disabled = false; }
  };
  $('#c-cancelar').onclick = () => abrirForm(null);
  $('#c-lista').onclick = async (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
    const id = b.dataset.id!;
    if (b.dataset.a === 'editar') { borrando = null; abrirForm(notas.find((x) => x.id === id) ?? null); pintar(); return; }
    if (borrando !== id) { borrando = id; pintar(); return; } // dos toques para borrar
    borrando = null;
    try {
      if (ses) await borrarNube(id);
      notas = notas.filter((x) => x.id !== id); if (!ses) guardarLocal(notas);
      if (editando === id) abrirForm(null);
      pintar(); estado(); toast('Entrada borrada');
    } catch (e) { toast(mensajeError(e)); pintar(); }
  };
}
iniciar();
