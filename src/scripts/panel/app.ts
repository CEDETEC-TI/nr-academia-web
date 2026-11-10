// Panel de Nacho: agenda semanal de turnos ocupados y libres.
import { clases } from '../../data/academia';
import { DIAS_SEMANA, HORAS, NOMBRE_DIA, estadoDe, horaTxt, iso, lunesDe, parse, resumenSemana, sumarDias, type Turno } from './agenda';
import { crearStore, type Store } from './store';

const TIPOS = clases.map((c) => c.nombre);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fechaCorta = (s: string) => { const d = parse(s); return `${d.getDate()} ${MESES[d.getMonth()]}`; };

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const app = $('#panel');
const hoja = $<HTMLDialogElement>('#hoja');

let store: Store;
let lunes = lunesDe(iso(new Date()));
let diaSel = Math.min(5, Math.max(1, ((new Date().getDay() + 6) % 7) + 1));
let turnos: Turno[] = [];

function aviso(msg: string) {
  const t = $('#aviso'); t.textContent = msg; t.hidden = false;
  clearTimeout((aviso as any).t); (aviso as any).t = setTimeout(() => (t.hidden = true), 2600);
}

async function cargar() {
  try { turnos = await store.listar(lunes, sumarDias(lunes, 6)); }
  catch (e) { aviso('No se pudieron leer los turnos: ' + (e as Error).message); turnos = []; }
  render();
}

function render() {
  const r = resumenSemana(turnos, lunes);
  const hoy = iso(new Date());
  const dias = DIAS_SEMANA.map((d) => {
    const fecha = sumarDias(lunes, d - 1);
    const libres = HORAS.filter((h) => !estadoDe(turnos, fecha, h).ocupado).length;
    const celdas = HORAS.map((h) => {
      const e = estadoDe(turnos, fecha, h);
      const t = e.turno;
      return e.ocupado && t
        ? `<button class="slot ocupado" data-f="${fecha}" data-h="${h}"><span class="h">${horaTxt(h)}</span><span class="who">${esc(t.alumnos) || 'Ocupado'}</span><span class="meta">${esc(t.tipo)}${t.fijo ? ' · fijo' : ' · solo este día'}</span></button>`
        : `<button class="slot libre" data-f="${fecha}" data-h="${h}"><span class="h">${horaTxt(h)}</span><span class="who">Libre</span>${e.excepcion ? '<span class="meta">liberado este día</span>' : ''}<span class="plus" aria-hidden="true">+</span></button>`;
    }).join('');
    return `<section class="dia${d === diaSel ? ' sel' : ''}${fecha === hoy ? ' hoy' : ''}" aria-label="${NOMBRE_DIA[d]} ${fechaCorta(fecha)}">
      <h2><span>${NOMBRE_DIA[d]}</span> ${fechaCorta(fecha)} <small>${libres} libres</small></h2><div class="slots">${celdas}</div></section>`;
  }).join('');
  const chips = DIAS_SEMANA.map((d) => {
    const fecha = sumarDias(lunes, d - 1);
    return `<button class="chip" data-dia="${d}" aria-pressed="${d === diaSel}">${NOMBRE_DIA[d].slice(0, 3)} <b>${parse(fecha).getDate()}</b></button>`;
  }).join('');
  app.innerHTML = `
    <div class="top">
      <div class="semana">
        <button class="nav" data-act="prev" aria-label="Semana anterior">‹</button>
        <div><p class="lbl">Semana</p><p class="rango">${fechaCorta(lunes)} – ${fechaCorta(sumarDias(lunes, 4))}</p></div>
        <button class="nav" data-act="next" aria-label="Semana siguiente">›</button>
        ${lunes !== lunesDe(hoy) ? '<button class="hoyb" data-act="hoy">Hoy</button>' : ''}
      </div>
      <p class="resumen"><b>${r.ocupados}</b> ${r.ocupados === 1 ? 'ocupado' : 'ocupados'} · <b>${r.libres}</b> ${r.libres === 1 ? 'libre' : 'libres'} <span>de ${r.total} turnos</span></p>
    </div>
    <div class="chips" role="group" aria-label="Día">${chips}</div>
    <div class="dias">${dias}</div>`;
}

function abrirHoja(fecha: string, hora: number) {
  const e = estadoDe(turnos, fecha, hora);
  const t = e.turno;
  const titulo = `${NOMBRE_DIA[parse(fecha).getDay() === 0 ? 7 : parse(fecha).getDay()]} ${fechaCorta(fecha)} · ${horaTxt(hora)}`;
  const tipoOpts = TIPOS.map((n) => `<label><input type="radio" name="tipo" value="${esc(n)}"${(t?.tipo ?? TIPOS[0]) === n ? ' checked' : ''}><span>${esc(n)}</span></label>`).join('');
  const puedeRepetir = !t && !e.excepcion;
  const acciones = !t ? '' : t.fijo
    ? `<div class="liberar"><p>Liberar este turno</p><button type="button" class="btn-sec" data-lib="dia">Solo el ${fechaCorta(fecha)}</button><button type="button" class="btn-sec peligro" data-lib="siempre">Desde el ${fechaCorta(fecha)} en adelante</button></div>`
    : `<div class="liberar"><button type="button" class="btn-sec peligro" data-lib="unico">Liberar turno</button></div>`;
  const volver = !t && e.excepcion ? `<div class="liberar"><button type="button" class="btn-sec" data-lib="deshacer">Volver a ocupar con el turno fijo</button></div>` : '';
  hoja.innerHTML = `<form method="dialog" class="form">
      <div class="hhead"><div><p class="lbl">${t ? 'Turno ocupado' : 'Turno libre'}</p><h3>${titulo}</h3></div><button type="button" class="x" data-cerrar aria-label="Cerrar">×</button></div>
      <label class="campo"><span>Alumno o grupo</span><input name="alumnos" required maxlength="120" autocomplete="off" value="${esc(t?.alumnos ?? '')}" placeholder="Ej.: Juan, o Sofía y Lucas"></label>
      <fieldset class="campo"><legend>Tipo de clase</legend><div class="opts">${tipoOpts}</div></fieldset>
      <label class="campo"><span>Notas (opcional)</span><textarea name="notas" rows="2" maxlength="300" placeholder="Ej.: trae su paleta, trabajar bandeja">${esc(t?.notas ?? '')}</textarea></label>
      ${puedeRepetir ? '<label class="check"><input type="checkbox" name="fijo" checked> <span>Se repite todas las semanas</span></label>' : ''}
      ${t?.fijo ? '<p class="nota">Es un turno fijo: los cambios valen para todas las semanas.</p>' : ''}
      <button class="btn-pri" type="submit">${t ? 'Guardar cambios' : 'Ocupar turno'}</button>
      ${acciones}${volver}
    </form>`;
  const form = hoja.querySelector('form')!;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const datos = { alumnos: String(fd.get('alumnos')).trim(), tipo: String(fd.get('tipo') ?? ''), notas: String(fd.get('notas') ?? '').trim() };
    if (!datos.alumnos) return;
    await hacer(async () => {
      if (t) await store.actualizar(t.id, datos);
      else if (fd.get('fijo')) await store.crear({ ...datos, hora, fijo: true, dia_semana: ((parse(fecha).getDay() + 6) % 7) + 1, desde: fecha, hasta: null, fecha: null, excepcion: false });
      else await store.crear({ ...datos, hora, fijo: false, dia_semana: null, desde: null, hasta: null, fecha, excepcion: false });
    }, t ? 'Cambios guardados' : 'Turno ocupado');
  });
  hoja.querySelectorAll<HTMLButtonElement>('[data-lib]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.lib;
    hacer(async () => {
      if (k === 'unico' && t) await store.borrar(t.id);
      if (k === 'dia' && t) await store.crear({ hora, fijo: false, dia_semana: null, desde: null, hasta: null, fecha, excepcion: true, alumnos: '', tipo: '', notas: '' });
      if (k === 'siempre' && t) { if ((t.desde ?? '') >= fecha) await store.borrar(t.id); else await store.actualizar(t.id, { hasta: sumarDias(fecha, -1) }); }
      if (k === 'deshacer' && e.excepcion) await store.borrar(e.excepcion.id);
    }, k === 'deshacer' ? 'Turno fijo restablecido' : 'Turno liberado');
  }));
  hoja.querySelector('[data-cerrar]')!.addEventListener('click', () => hoja.close());
  hoja.showModal();
}

async function hacer(fn: () => Promise<void>, ok: string) {
  try { await fn(); hoja.close(); aviso(ok); await cargar(); }
  catch (e) { aviso('No se pudo guardar: ' + (e as Error).message); }
}

app.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('button');
  if (!el) return;
  if (el.dataset.act === 'prev') { lunes = sumarDias(lunes, -7); cargar(); }
  else if (el.dataset.act === 'next') { lunes = sumarDias(lunes, 7); cargar(); }
  else if (el.dataset.act === 'hoy') { lunes = lunesDe(iso(new Date())); cargar(); }
  else if (el.dataset.dia) { diaSel = +el.dataset.dia; render(); }
  else if (el.dataset.f) abrirHoja(el.dataset.f, +el.dataset.h!);
});
hoja.addEventListener('click', (ev) => { if (ev.target === hoja) hoja.close(); }); // tocar afuera cierra

async function iniciar() {
  store = await crearStore();
  $('#demo').hidden = store.modo !== 'demo';
  const email = await store.sesion();
  if (!email) return mostrarLogin();
  $('#login').hidden = true; app.hidden = false;
  if (store.modo === 'nube') { const s = $('#salir'); s.hidden = false; s.onclick = async () => { await store.salir(); location.reload(); }; }
  await cargar();
}
function mostrarLogin() {
  const f = $<HTMLFormElement>('#login'); f.hidden = false; app.hidden = true;
  f.onsubmit = async (ev) => {
    ev.preventDefault(); const fd = new FormData(f); const btn = f.querySelector('button')!; btn.disabled = true;
    try { await store.entrar(String(fd.get('email')), String(fd.get('clave'))); await iniciar(); }
    catch { aviso('Email o contraseña incorrectos'); btn.disabled = false; }
  };
}
iniciar();
