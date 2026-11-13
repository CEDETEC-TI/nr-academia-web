// Panel de Nacho (/panel/): Hoy, Semana, Alumnos y Cobros.
import { clases as tiposClase, panel as cfg } from '../../data/academia';
import {
  DIAS_SEMANA, HORAS, NOMBRE_DIA, claseEn, cuenta, diaSemana, dinero, fechasEnRango, finDeMes, horaTxt, inscripcionesVigentes, iso, lunesDe,
  norm, ocupadaEl, parse, precioPor, primeraDesde, sesion, sesionesDelDia, sumarDias, vacio, vigente, waLink,
  type Alumno, type Clase, type Datos, type EstadoAsist, type Sesion,
} from './modelo';
import { crearStore, type Store } from './store';

const TIPOS = tiposClase.map((c) => c.nombre);
const TIPO_DEF = TIPOS.find((n) => /grupal/i.test(n)) ?? TIPOS[0];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const ESTADOS = [['vino', 'Vino'], ['falto', 'Faltó'], ['aviso', 'Avisó']] as const;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fechaCorta = (s: string) => { const d = parse(s); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
const hoyIso = () => iso(new Date());
const cuandoTxt = (f: string) => `${NOMBRE_DIA[diaSemana(f)]} ${fechaCorta(f)}`;
const diaHora = (c: Clase) => (c.fecha ? `${NOMBRE_DIA[diaSemana(c.fecha)].slice(0, 3)} ${fechaCorta(c.fecha)}` : NOMBRE_DIA[c.dia_semana!].slice(0, 3)) + ' ' + horaTxt(c.hora);
/** Próxima fecha (desde hoy) en que se da una clase: para abrirla desde la ficha de un alumno. */
const proximaFecha = (c: Clase) => (c.fecha ? c.fecha : primeraDesde(c.desde && c.desde > hoyIso() ? c.desde : hoyIso(), c.dia_semana!));

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const app = $('#panel');
const hoja = $<HTMLDialogElement>('#hoja');

type Vista = 'hoy' | 'semana' | 'alumnos' | 'cobros';
let store: Store;
let datos: Datos = vacio();
let vista: Vista = 'hoy';
let fechaSel = hoyIso(); // día que se ve en "Hoy"
let lunes = lunesDe(hoyIso()); // semana que se ve en "Semana"
let diaSel = Math.min(5, diaSemana(hoyIso()));
let busca = '';
let verInactivos = false;

function aviso(msg: string) {
  const t = $('#aviso'); t.textContent = msg; t.hidden = false;
  clearTimeout((aviso as any).t); (aviso as any).t = setTimeout(() => (t.hidden = true), 2600 + msg.length * 40);
}
async function recargar() {
  try { datos = await store.cargar(); } catch (e) { aviso('No se pudieron leer los datos: ' + (e as Error).message); }
  render();
}
/** Guarda, recarga y cierra la hoja. */
async function hacer(fn: () => Promise<void>, ok: string) {
  try { await fn(); await recargar(); hoja.close(); aviso(ok); } catch (e) { aviso('No se pudo guardar: ' + (e as Error).message); }
}
/** Guarda, recarga y vuelve a dibujar la misma hoja (para seguir editando). */
async function accion(fn: () => Promise<void>, ok: string, reabrir: () => void) {
  try { await fn(); await recargar(); aviso(ok); reabrir(); } catch (e) { aviso('No se pudo guardar: ' + (e as Error).message); }
}
const dosToques = (b: HTMLElement, texto: string) => { if (b.dataset.seguro) return true; b.dataset.seguro = '1'; b.textContent = texto; return false; };

// ───────────────────────────── Pantallas ─────────────────────────────
function render() {
  const tabs = ([['hoy', 'Hoy'], ['semana', 'Semana'], ['alumnos', 'Alumnos'], ['cobros', 'Cobros']] as const)
    .map(([k, n]) => `<button class="tab" data-a="vista" data-v="${k}" aria-pressed="${vista === k}">${n}</button>`).join('');
  const cuerpo = { hoy: vistaHoy, semana: vistaSemana, alumnos: vistaAlumnos, cobros: vistaCobros }[vista]();
  app.innerHTML = `<nav class="tabs" aria-label="Secciones">${tabs}</nav>${cuerpo}`;
  const seed = document.querySelector<HTMLElement>('#seed');
  if (seed) seed.hidden = datos.alumnos.length > 0 || datos.clases.length > 0;
}

function vistaHoy() {
  const hoy = hoyIso();
  const ses = sesionesDelDia(datos, fechaSel);
  const activas = ses.filter((s) => !s.suspendida);
  const nAl = activas.reduce((n, s) => n + s.integrantes.length, 0);
  return `<div class="top">
      <div class="semana">
        <button class="nav" data-a="dia-prev" aria-label="Día anterior">‹</button>
        <div><p class="lbl">${fechaSel === hoy ? 'Hoy' : 'Día'}</p><p class="rango">${cuandoTxt(fechaSel)}</p></div>
        <button class="nav" data-a="dia-next" aria-label="Día siguiente">›</button>
        ${fechaSel !== hoy ? '<button class="hoyb" data-a="dia-hoy">Hoy</button>' : ''}
        <input class="fechain" type="date" id="fecha-hoy" value="${fechaSel}" aria-label="Elegir otro día">
      </div>
      <p class="resumen"><b>${activas.length}</b> ${activas.length === 1 ? 'clase' : 'clases'} · <b>${nAl}</b> ${nAl === 1 ? 'alumno' : 'alumnos'}</p>
    </div>
    ${ses.length ? `<div class="clases">${ses.map(tarjeta).join('')}</div>` : '<p class="vacio">No hay clases este día.<br>Las creás desde la pestaña Semana.</p>'}`;
}

function tarjeta(s: Sesion) {
  const c = s.clase, n = s.integrantes.length;
  const pend = s.integrantes.filter((i) => i.estado === 'anotado').length;
  const filas = s.integrantes.map((i) => `<li class="al"><span class="an">${esc(i.alumno.nombre)}${i.visita ? ' <em>solo hoy</em>' : ''}</span>
      <div class="est" role="group" aria-label="Asistencia de ${esc(i.alumno.nombre)}">${ESTADOS.map(([k, t]) =>
        `<button type="button" class="e-${k}" data-a="marcar" data-c="${c.id}" data-f="${s.fecha}" data-al="${i.alumno.id}" data-e="${k}" aria-pressed="${i.estado === k}">${t}</button>`).join('')}</div></li>`).join('');
  const cuerpo = s.suspendida
    ? `<p class="nota">Clase suspendida este día.</p><button type="button" class="btn-sec" data-a="reactivar" data-c="${c.id}" data-f="${s.fecha}">Reactivar</button>`
    : n
      ? `<ul class="roster">${filas}</ul>${pend ? `<button type="button" class="btn-sec" data-a="todos" data-c="${c.id}" data-f="${s.fecha}">Todos vinieron</button>` : ''}`
      : '<p class="nota">Todavía no hay alumnos anotados. Tocá Editar para sumarlos.</p>';
  return `<section class="clase${s.suspendida ? ' susp' : ''}" aria-label="Clase de las ${horaTxt(c.hora)}">
    <header><div><p class="ch">${horaTxt(c.hora)}</p><p class="ct">${esc(c.tipo)}${c.fecha ? ' · clase única' : ''}</p></div>
      <span class="cupo${n >= c.cupo ? ' lleno' : ''}" title="Alumnos / cupo">${n}/${c.cupo}</span>
      <button type="button" class="btn-sec chico" data-a="clase" data-c="${c.id}" data-f="${s.fecha}">Editar</button></header>
    ${cuerpo}</section>`;
}

function vistaSemana() {
  const hoy = hoyIso();
  let nClases = 0, nLibres = 0;
  const dias = DIAS_SEMANA.map((d) => {
    const fecha = sumarDias(lunes, d - 1);
    const ses = sesionesDelDia(datos, fecha);
    const celdas = HORAS.map((h) => {
      const s = ses.find((x) => x.clase.hora === h);
      if (!s) { nLibres++; return `<button class="slot libre" data-a="nueva" data-f="${fecha}" data-h="${h}"><span class="h">${horaTxt(h)}</span><span class="who">Libre</span><span class="plus" aria-hidden="true">+</span></button>`; }
      if (!s.suspendida) nClases++;
      const nombres = s.integrantes.map((i) => i.alumno.nombre.split(' ')[0]);
      const quien = nombres.length ? nombres.slice(0, 3).join(', ') + (nombres.length > 3 ? ` +${nombres.length - 3}` : '') : 'Sin alumnos';
      return `<button class="slot ocupado${s.suspendida ? ' susp' : ''}" data-a="clase" data-c="${s.clase.id}" data-f="${fecha}" data-h="${h}"><span class="h">${horaTxt(h)}</span><span class="who">${esc(quien)}</span><span class="meta">${esc(s.clase.tipo)} · ${s.integrantes.length}/${s.clase.cupo}${s.suspendida ? ' · suspendida' : ''}</span></button>`;
    }).join('');
    const libres = HORAS.filter((h) => !ses.some((x) => x.clase.hora === h)).length;
    return `<section class="dia${d === diaSel ? ' sel' : ''}${fecha === hoy ? ' hoy' : ''}" aria-label="${NOMBRE_DIA[d]} ${fechaCorta(fecha)}">
      <h2><span>${NOMBRE_DIA[d]}</span> ${fechaCorta(fecha)} <small>${libres} libres</small></h2><div class="slots">${celdas}</div></section>`;
  }).join('');
  const chips = DIAS_SEMANA.map((d) => `<button class="chip" data-a="dia-chip" data-d="${d}" aria-pressed="${d === diaSel}">${NOMBRE_DIA[d].slice(0, 3)} <b>${parse(sumarDias(lunes, d - 1)).getDate()}</b></button>`).join('');
  return `<div class="top">
      <div class="semana">
        <button class="nav" data-a="sem-prev" aria-label="Semana anterior">‹</button>
        <div><p class="lbl">Semana</p><p class="rango">${fechaCorta(lunes)} – ${fechaCorta(sumarDias(lunes, 4))}</p></div>
        <button class="nav" data-a="sem-next" aria-label="Semana siguiente">›</button>
        ${lunes !== lunesDe(hoy) ? '<button class="hoyb" data-a="sem-hoy">Hoy</button>' : ''}
      </div>
      <button class="btn-sec chico" data-a="libres">Buscar horario libre</button>
    </div>
    <p class="resumen sub"><b>${nClases}</b> ${nClases === 1 ? 'clase' : 'clases'} · <b>${nLibres}</b> ${nLibres === 1 ? 'turno libre' : 'turnos libres'}</p>
    <div class="chips" role="group" aria-label="Día">${chips}</div>
    <div class="dias">${dias}</div>`;
}

function vistaAlumnos() {
  const hoy = hoyIso();
  const q = norm(busca);
  const lista = datos.alumnos.filter((a) => (verInactivos || a.activo) && (!q || norm(a.nombre).includes(q))).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const activos = datos.alumnos.filter((a) => a.activo).length;
  const filas = lista.map((a) => {
    const cl = inscripcionesVigentes(datos, a.id, hoy).map((x) => diaHora(x.clase));
    const cu = cuenta(datos, a.id);
    const wa = waLink(a.telefono);
    return `<li class="alu${a.activo ? '' : ' inactivo'}">
      <button class="alu-main" data-a="alu" data-al="${a.id}"><span class="alu-nom">${esc(a.nombre)}${a.activo ? '' : ' <em>(inactivo)</em>'}</span>
        <span class="alu-meta">${esc([a.nivel, cl.length ? cl.join(' · ') : 'Sin clase fija'].filter(Boolean).join(' · '))}</span></button>
      ${cu.debe > 0 ? `<span class="deuda">Debe ${dinero(cu.debe)}</span>` : ''}
      ${wa ? `<a class="alu-wa" href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp a ${esc(a.nombre)}">WhatsApp</a>` : ''}
    </li>`;
  }).join('');
  return `<div class="top">
      <p class="resumen"><b>${activos}</b> ${activos === 1 ? 'alumno activo' : 'alumnos activos'}</p>
      <button class="btn-pri chico" data-a="nuevo-alu">+ Nuevo alumno</button>
    </div>
    <div class="filtros"><input id="busca" type="search" placeholder="Buscar alumno" value="${esc(busca)}" aria-label="Buscar alumno" autocomplete="off">
      <label class="check"><input type="checkbox" id="inact"${verInactivos ? ' checked' : ''}> <span>Ver inactivos</span></label></div>
    ${lista.length ? `<ul class="alus">${filas}</ul>` : `<p class="vacio">${datos.alumnos.length ? 'No hay alumnos con ese nombre.' : 'Todavía no hay alumnos. Se cargan acá o al anotarlos en una clase.'}</p>`}`;
}

function vistaCobros() {
  const filas = datos.alumnos.map((a) => ({ a, cu: cuenta(datos, a.id) })).filter((x) => x.cu.debe > 0).sort((x, y) => y.cu.debe - x.cu.debe);
  const total = filas.reduce((n, x) => n + x.cu.debe, 0);
  const mes = hoyIso().slice(0, 7);
  const cobradoMes = datos.pagos.filter((p) => p.fecha.startsWith(mes)).reduce((n, p) => n + p.monto, 0);
  const lis = filas.map(({ a, cu }) => {
    const wa = waLink(a.telefono, `Hola ${a.nombre.split(' ')[0]}! Te escribo por las clases de pádel: tenés ${dinero(cu.debe)} pendientes. ¡Gracias!`);
    return `<li class="alu"><button class="alu-main" data-a="cobrar" data-al="${a.id}"><span class="alu-nom">${esc(a.nombre)}</span><span class="alu-meta">${cu.clases} ${cu.clases === 1 ? 'clase' : 'clases'} dadas · pagó ${dinero(cu.pagado)}</span></button>
      <strong class="deuda">${dinero(cu.debe)}</strong>${wa ? `<a class="alu-wa" href="${wa}" target="_blank" rel="noopener" aria-label="Recordarle el pago a ${esc(a.nombre)} por WhatsApp">Avisar</a>` : ''}</li>`;
  }).join('');
  return `<div class="top"><p class="resumen">A cobrar <b>${dinero(total)}</b> <span>· cobrado este mes ${dinero(cobradoMes)}</span></p></div>
    ${filas.length ? `<ul class="alus">${lis}</ul>` : '<p class="vacio">Nadie te debe nada. Cada clase a la que viene un alumno se suma a su cuenta (' + dinero(cfg.precioClase) + ').</p>'}`;
}

// ───────────────────────────── Acciones ─────────────────────────────
async function marcar(claseId: string, fecha: string, alumnoId: string, estado: EstadoAsist) {
  const ex = datos.asistencias.find((a) => a.clase_id === claseId && a.fecha === fecha && a.alumno_id === alumnoId);
  const nuevo: EstadoAsist = ex && ex.estado === estado ? 'anotado' : estado; // tocar de nuevo lo desmarca
  try {
    if (ex) await store.actualizar('asistencias', ex.id, { estado: nuevo, precio: precioPor(nuevo) });
    else await store.crear('asistencias', { clase_id: claseId, fecha, alumno_id: alumnoId, estado: nuevo, precio: precioPor(nuevo) });
    await recargar();
  } catch (e) { aviso('No se pudo guardar: ' + (e as Error).message); }
}

async function idDeAlumno(nombre: string): Promise<string> {
  const ex = datos.alumnos.find((a) => norm(a.nombre) === norm(nombre));
  if (ex) { if (!ex.activo) { await store.actualizar('alumnos', ex.id, { activo: true }); ex.activo = true; } return ex.id; }
  const fila = { nombre, telefono: '', nivel: '', notas: '', activo: true };
  const id = await store.crear('alumnos', fila);
  datos.alumnos.push({ id, ...fila }); // así un nombre repetido en el mismo paso no se crea dos veces
  return id;
}

// ───────────────────────────── Hojas ─────────────────────────────
const head = (lbl: string, titulo: string) => `<div class="hhead"><div><p class="lbl">${esc(lbl)}</p><h3>${esc(titulo)}</h3></div><button type="button" class="x" data-cerrar aria-label="Cerrar">×</button></div>`;
function mostrar(html: string) {
  hoja.innerHTML = html;
  hoja.querySelector('[data-cerrar]')!.addEventListener('click', () => hoja.close());
  if (!hoja.open) hoja.showModal();
  return hoja.querySelector('form')!;
}
const stepper = (n: number) => `<div class="stepper"><button type="button" data-cupo="-1" aria-label="Menos cupo">−</button><output id="cupo-v" aria-live="polite">${n}</output><button type="button" data-cupo="1" aria-label="Más cupo">+</button></div>`;
function conStepper(form: HTMLElement) {
  form.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-cupo]'); if (!b) return;
    const o = form.querySelector('#cupo-v')!; o.textContent = String(Math.min(12, Math.max(1, +o.textContent! + +b.dataset.cupo!)));
  });
}
const cupoDe = (form: HTMLElement) => +form.querySelector('#cupo-v')!.textContent!;

/** Pastillas de alumnos: escribir un nombre (si no existe se crea) o elegir de la lista. */
function selector(root: HTMLElement, excluidos: () => string[] = () => []) {
  const nombres: string[] = [];
  root.innerHTML = `<div class="opts q-chips"></div><div class="q-add"><input name="nuevo" maxlength="80" autocomplete="off" enterkeyhint="done" placeholder="Escribí un nombre" aria-label="Nombre del alumno"><button type="button" class="btn-sec" data-q-add>Agregar</button></div><div class="q-rost" hidden><p class="nota">O elegí de tus alumnos:</p><div class="opts q-picks"></div></div>`;
  const chips = root.querySelector('.q-chips')!, picks = root.querySelector('.q-picks')!, caja = root.querySelector<HTMLElement>('.q-rost')!, input = root.querySelector<HTMLInputElement>('input')!;
  const pintar = () => {
    chips.innerHTML = nombres.map((n, i) => `<button type="button" class="qchip" data-q-del="${i}" aria-label="Quitar ${esc(n)}">${esc(n)} <span aria-hidden="true">×</span></button>`).join('');
    const ya = [...excluidos(), ...nombres].map(norm);
    const otros = datos.alumnos.filter((a) => a.activo && !ya.includes(norm(a.nombre)));
    caja.hidden = !otros.length;
    picks.innerHTML = otros.map((a) => `<button type="button" class="qpick" data-q-pick="${esc(a.nombre)}">+ ${esc(a.nombre)}</button>`).join('');
  };
  const agregar = (n: string) => { n = n.trim(); const ya = [...excluidos(), ...nombres].map(norm); if (n && !ya.includes(norm(n))) nombres.push(n); input.value = ''; pintar(); };
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); agregar(input.value); } });
  root.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('button'); if (!b) return;
    if (b.hasAttribute('data-q-add')) { agregar(input.value); input.focus(); }
    else if (b.dataset.qDel) { nombres.splice(+b.dataset.qDel, 1); pintar(); }
    else if (b.dataset.qPick) agregar(b.dataset.qPick);
  });
  pintar();
  return { nombres, pendiente: () => agregar(input.value) };
}

// ── Nueva clase (horario libre) ──
function abrirNueva(fecha: string, hora: number) {
  const dia = diaSemana(fecha);
  const tipoOpts = TIPOS.map((n) => `<label><input type="radio" name="tipo" value="${esc(n)}"${n === TIPO_DEF ? ' checked' : ''}><span>${esc(n)}</span></label>`).join('');
  const dias = DIAS_SEMANA.map((d) => `<label><input type="checkbox" name="dia" value="${d}"${d === dia ? ' checked disabled' : ''}><span>${NOMBRE_DIA[d].slice(0, 3)}</span></label>`).join('');
  const form = mostrar(`<form method="dialog" class="form">
    ${head('Horario libre', `${cuandoTxt(fecha)} · ${horaTxt(hora)}`)}
    <fieldset class="campo"><legend>Se repite</legend><div class="opts"><label><input type="radio" name="rep" value="semanal" checked><span>Todas las semanas</span></label><label><input type="radio" name="rep" value="unica"><span>Solo este día</span></label></div></fieldset>
    <fieldset class="campo" id="dias-extra"><legend>Otros días a la misma hora</legend><div class="opts">${dias}</div></fieldset>
    <fieldset class="campo"><legend>Tipo de clase</legend><div class="opts">${tipoOpts}</div></fieldset>
    <div class="campo"><span>Cupo (alumnos por clase)</span>${stepper(cfg.cupoPorDefecto)}</div>
    <fieldset class="campo"><legend>Alumnos (los podés sumar después)</legend><div id="sel"></div></fieldset>
    <button class="btn-pri" type="submit">Crear clase</button></form>`);
  conStepper(form);
  const sel = selector(form.querySelector<HTMLElement>('#sel')!);
  form.addEventListener('change', () => { form.querySelector<HTMLElement>('#dias-extra')!.hidden = form.querySelector<HTMLInputElement>('input[name=rep]:checked')!.value === 'unica'; });
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    sel.pendiente();
    const fd = new FormData(form);
    const unica = fd.get('rep') === 'unica', tipo = String(fd.get('tipo')), cupo = cupoDe(form);
    if (sel.nombres.length > cupo) return aviso(`Son ${sel.nombres.length} alumnos y el cupo es ${cupo}. Subí el cupo o sacá a alguien.`);
    const dias = unica ? [dia] : [...new Set([dia, ...fd.getAll('dia').map(Number)])].sort();
    const choques: string[] = [];
    for (const d of dias) {
      const desde = unica ? fecha : primeraDesde(fecha, d);
      const fechas = unica ? [fecha] : fechasEnRango(desde, sumarDias(desde, 26 * 7), d);
      const f = fechas.find((x) => ocupadaEl(datos, x, hora));
      if (f) choques.push(cuandoTxt(f));
    }
    if (choques.length) return aviso(`Ya hay una clase el ${choques.join(', ')} a esa hora. No se creó nada.`);
    await hacer(async () => {
      const ids: string[] = []; for (const n of sel.nombres) ids.push(await idDeAlumno(n));
      for (const d of dias) {
        const desde = unica ? fecha : primeraDesde(fecha, d);
        const claseId = await store.crear('clases', { dia_semana: unica ? null : d, hora, fecha: unica ? fecha : null, desde: unica ? null : desde, hasta: null, tipo, cupo });
        for (const alumno_id of ids) {
          if (unica) await store.crear('asistencias', { clase_id: claseId, fecha, alumno_id, estado: 'anotado', precio: 0 });
          else await store.crear('inscripciones', { clase_id: claseId, alumno_id, desde, hasta: null });
        }
      }
    }, dias.length > 1 ? `${dias.length} clases creadas` : 'Clase creada');
  });
}

// ── Una clase en una fecha ──
function abrirClase(claseId: string, fecha: string) {
  const c = datos.clases.find((x) => x.id === claseId);
  if (!c) { hoja.close(); return; }
  const s = sesion(datos, c, fecha);
  const unica = !!c.fecha;
  const reabrir = () => abrirClase(claseId, fecha);
  const inscDe = (alId: string) => datos.inscripciones.find((i) => i.clase_id === c.id && i.alumno_id === alId && vigente(i, fecha));
  const filas = s.integrantes.map((i) => {
    const hasta = inscDe(i.alumno.id)?.hasta;
    const tag = i.visita ? 'solo este día' : hasta ? 'hasta ' + fechaCorta(hasta) : '';
    return `<li class="fila"><span class="fn">${esc(i.alumno.nombre)}${tag ? ` <small>${tag}</small>` : ''}</span><button type="button" class="btn-sec chico peligro" data-a="quitar" data-al="${i.alumno.id}" aria-label="Quitar a ${esc(i.alumno.nombre)}">Quitar</button></li>`;
  }).join('');
  const tipoOpts = TIPOS.map((n) => `<label><input type="radio" name="tipo" value="${esc(n)}"${c.tipo === n ? ' checked' : ''}><span>${esc(n)}</span></label>`).join('');
  const hastaOpts = unica ? '' : `<fieldset class="campo"><legend>¿Hasta cuándo?</legend><div class="opts">
      <label><input type="radio" name="hasta" value="sin" checked><span>Sin fecha de fin</span></label>
      <label><input type="radio" name="hasta" value="mes"><span>Hasta fin de mes (${fechaCorta(finDeMes(fecha))})</span></label>
      <label><input type="radio" name="hasta" value="dia"><span>Solo este día</span></label></div></fieldset>`;
  const form = mostrar(`<form method="dialog" class="form">
    ${head(`${c.tipo} · ${unica ? 'clase única' : 'semanal'}`, `${cuandoTxt(fecha)} · ${horaTxt(c.hora)}`)}
    <section class="seccion"><h4>Alumnos <span class="cupo${s.integrantes.length >= c.cupo ? ' lleno' : ''}">${s.integrantes.length}/${c.cupo}</span></h4>
      ${s.integrantes.length ? `<ul class="filas">${filas}</ul>` : '<p class="nota">Todavía no hay nadie anotado.</p>'}</section>
    <section class="seccion"><h4>Anotar alumnos</h4><div id="sel"></div>${hastaOpts}
      <button type="button" class="btn-pri" data-a="anotar">Anotar</button></section>
    <section class="seccion"><h4>Ajustes de la clase</h4>
      <fieldset class="campo"><legend>Tipo</legend><div class="opts">${tipoOpts}</div></fieldset>
      <div class="campo"><span>Cupo</span>${stepper(c.cupo)}</div>
      <button type="button" class="btn-sec" data-a="ajustes">Guardar ajustes</button></section>
    <section class="seccion liberar">
      ${s.suspendida ? `<button type="button" class="btn-sec" data-a="reactivar">Reactivar la clase del ${fechaCorta(fecha)}</button>` : `<button type="button" class="btn-sec" data-a="suspender">Suspender solo el ${fechaCorta(fecha)}</button>`}
      <button type="button" class="btn-sec peligro" data-a="terminar">${unica ? 'Borrar la clase' : `Terminar la clase desde el ${fechaCorta(fecha)}`}</button>
    </section></form>`);
  conStepper(form);
  const sel = selector(form.querySelector<HTMLElement>('#sel')!, () => s.integrantes.map((i) => i.alumno.nombre));
  form.addEventListener('submit', (ev) => ev.preventDefault());
  form.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'anotar') {
      sel.pendiente();
      if (!sel.nombres.length) return aviso('Escribí o elegí a quién anotar');
      if (s.integrantes.length + sel.nombres.length > c.cupo) return aviso(`La clase está completa (cupo ${c.cupo}). Subí el cupo en "Ajustes" para sumar a alguien más.`);
      const modo = unica ? 'dia' : String(new FormData(form).get('hasta'));
      accion(async () => {
        for (const n of sel.nombres) {
          const alumno_id = await idDeAlumno(n);
          if (modo === 'dia') { if (!datos.asistencias.some((x) => x.clase_id === c.id && x.fecha === fecha && x.alumno_id === alumno_id)) await store.crear('asistencias', { clase_id: c.id, fecha, alumno_id, estado: 'anotado', precio: 0 }); }
          else await store.crear('inscripciones', { clase_id: c.id, alumno_id, desde: fecha, hasta: modo === 'mes' ? finDeMes(fecha) : null });
        }
      }, 'Alumnos anotados', reabrir);
    } else if (a === 'quitar') {
      const alId = b.dataset.al!, ins = inscDe(alId);
      const asis = datos.asistencias.find((x) => x.clase_id === c.id && x.fecha === fecha && x.alumno_id === alId);
      accion(async () => {
        if (ins) { // sale desde hoy; si ya se le marcó asistencia hoy, sale desde mañana
          const fin = asis && asis.estado !== 'anotado' ? fecha : sumarDias(fecha, -1);
          if (ins.desde > fin) await store.borrar('inscripciones', ins.id); else await store.actualizar('inscripciones', ins.id, { hasta: fin });
          if (asis && asis.estado === 'anotado') await store.borrar('asistencias', asis.id);
        } else if (asis) await store.borrar('asistencias', asis.id);
      }, 'Alumno quitado', reabrir);
    } else if (a === 'ajustes') {
      const cupo = cupoDe(form), tipo = String(new FormData(form).get('tipo'));
      if (cupo < s.integrantes.length) return aviso(`Ya hay ${s.integrantes.length} alumnos anotados: el cupo no puede ser menor.`);
      accion(() => store.actualizar('clases', c.id, { cupo, tipo }), 'Ajustes guardados', reabrir);
    } else if (a === 'suspender') accion(async () => { await store.crear('suspensiones', { clase_id: c.id, fecha, motivo: '' }); }, 'Clase suspendida', reabrir);
    else if (a === 'reactivar') accion(async () => { if (s.suspendida) await store.borrar('suspensiones', s.suspendida.id); }, 'Clase reactivada', reabrir);
    else if (a === 'terminar') {
      if (!dosToques(b, 'Tocá de nuevo para confirmar')) return;
      hacer(async () => { if (unica || (c.desde ?? '') >= fecha) await store.borrar('clases', c.id); else await store.actualizar('clases', c.id, { hasta: sumarDias(fecha, -1) }); }, unica ? 'Clase borrada' : 'Clase terminada');
    }
  });
}

// ── Alumno ──
function abrirAlumno(a: Alumno | null) {
  const hoy = hoyIso();
  const insc = a ? inscripcionesVigentes(datos, a.id, hoy) : [];
  const cu = a ? cuenta(datos, a.id) : null;
  const niv = ['Principiante', 'Intermedio', 'Avanzado'].map((n) => `<label><input type="radio" name="nivel" value="${n}"${a?.nivel === n ? ' checked' : ''}><span>${n}</span></label>`).join('');
  const form = mostrar(`<form method="dialog" class="form">
    ${head(a ? 'Alumno' : 'Nuevo', a ? a.nombre : 'Nuevo alumno')}
    <label class="campo"><span>Nombre</span><input name="nombre" required maxlength="80" autocomplete="off" value="${esc(a?.nombre ?? '')}"></label>
    <label class="campo"><span>WhatsApp (opcional)</span><input name="telefono" type="tel" inputmode="tel" maxlength="30" autocomplete="off" value="${esc(a?.telefono ?? '')}" placeholder="Ej.: 3704 123456"></label>
    <fieldset class="campo"><legend>Nivel (opcional)</legend><div class="opts">${niv}</div></fieldset>
    <label class="campo"><span>Notas (opcional)</span><textarea name="notas" rows="3" maxlength="500" placeholder="Ej.: lesión en el hombro, objetivo: competir">${esc(a?.notas ?? '')}</textarea></label>
    ${a ? `<section class="seccion"><h4>Clases</h4>${insc.length ? `<ul class="filas">${insc.map(({ clase, insc: i }) => `<li class="fila"><button type="button" class="alu-main" data-a="ir-clase" data-c="${clase.id}"><span class="fn">${esc(diaHora(clase))} · ${esc(clase.tipo)}${i.hasta ? ` <small>hasta ${fechaCorta(i.hasta)}</small>` : ''}</span></button></li>`).join('')}</ul>` : '<p class="nota">No está anotado en ninguna clase. Se lo anota desde la clase (pestaña Semana).</p>'}</section>
      <section class="seccion"><h4>Cuenta</h4><p class="nota">${cu!.clases} ${cu!.clases === 1 ? 'clase' : 'clases'} · pagó ${dinero(cu!.pagado)} · ${cu!.debe > 0 ? `<b>debe ${dinero(cu!.debe)}</b>` : cu!.debe < 0 ? `<b>a favor ${dinero(cu!.debe)}</b>` : '<b>al día</b>'}</p>
        <button type="button" class="btn-sec" data-a="cuenta">Cuenta y pagos</button></section>
      <label class="check"><input type="checkbox" name="activo"${a.activo ? ' checked' : ''}> <span>Alumno activo</span></label>` : ''}
    <button class="btn-pri" type="submit">${a ? 'Guardar cambios' : 'Agregar alumno'}</button>
    ${a ? '<div class="liberar"><button type="button" class="btn-sec peligro" data-a="borrar">Borrar alumno</button></div>' : ''}
  </form>`);
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const d = { nombre: String(fd.get('nombre')).trim(), telefono: String(fd.get('telefono') ?? '').trim(), nivel: String(fd.get('nivel') ?? ''), notas: String(fd.get('notas') ?? '').trim(), activo: a ? !!fd.get('activo') : true };
    if (!d.nombre) return;
    await hacer(async () => { if (a) await store.actualizar('alumnos', a.id, d); else await store.crear('alumnos', d); }, a ? 'Cambios guardados' : 'Alumno agregado');
  });
  form.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b || !a) return;
    if (b.dataset.a === 'cuenta') abrirPago(a.id);
    else if (b.dataset.a === 'ir-clase') { const c = datos.clases.find((x) => x.id === b.dataset.c); if (c) abrirClase(c.id, proximaFecha(c)); }
    else if (b.dataset.a === 'borrar') {
      if (!dosToques(b, 'Se borra también su historial y pagos. Tocá de nuevo')) return;
      hacer(() => store.borrar('alumnos', a.id), 'Alumno borrado');
    }
  });
}

// ── Cuenta y pagos de un alumno ──
function abrirPago(alId: string) {
  const a = datos.alumnos.find((x) => x.id === alId); if (!a) return;
  const cu = cuenta(datos, alId);
  const pagos = datos.pagos.filter((p) => p.alumno_id === alId).sort((x, y) => y.fecha.localeCompare(x.fecha)).slice(0, 8);
  const estado = cu.debe > 0 ? `Debe ${dinero(cu.debe)}` : cu.debe < 0 ? `A favor ${dinero(cu.debe)}` : 'Al día';
  const form = mostrar(`<form method="dialog" class="form">
    ${head('Cuenta', a.nombre)}
    <p class="saldo ${cu.debe > 0 ? 'debe' : ''}">${estado}</p>
    <p class="nota">${cu.clases} ${cu.clases === 1 ? 'clase' : 'clases'} dadas (${dinero(cu.cobrado)}) · pagó ${dinero(cu.pagado)}. Cada clase a la que viene cuesta ${dinero(cfg.precioClase)}.</p>
    <label class="campo"><span>Monto que paga ($)</span><input name="monto" type="number" inputmode="numeric" min="1" step="1" required value="${cu.debe > 0 ? cu.debe : ''}"></label>
    <label class="campo"><span>Nota (opcional)</span><input name="nota" maxlength="80" autocomplete="off" placeholder="Ej.: transferencia"></label>
    <button class="btn-pri" type="submit">Registrar pago</button>
    ${pagos.length ? `<section class="seccion"><h4>Últimos pagos</h4><ul class="filas">${pagos.map((p) => `<li class="fila"><span class="fn">${fechaCorta(p.fecha)} · ${dinero(p.monto)}${p.nota ? ` <small>${esc(p.nota)}</small>` : ''}</span><button type="button" class="btn-sec chico peligro" data-a="borrar-pago" data-p="${p.id}" aria-label="Borrar pago del ${fechaCorta(p.fecha)}">Borrar</button></li>`).join('')}</ul></section>` : ''}
  </form>`);
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const monto = Math.round(+new FormData(form).get('monto')!);
    if (!(monto > 0)) return;
    await hacer(() => store.crear('pagos', { alumno_id: alId, fecha: hoyIso(), monto, nota: String(new FormData(form).get('nota') ?? '').trim() }).then(() => {}), 'Pago registrado');
  });
  form.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-a=borrar-pago]'); if (!b) return;
    if (!dosToques(b, 'Tocá de nuevo')) return;
    accion(() => store.borrar('pagos', b.dataset.p!), 'Pago borrado', () => abrirPago(alId));
  });
}

// ── "¿Tenés libre el martes a tal hora?" ──
function abrirLibres(dia = diaSel) {
  const hoy = hoyIso();
  const fechas = fechasEnRango(hoy, sumarDias(hoy, 27), dia); // las próximas 4 semanas
  const filas = HORAS.map((h) => {
    const c = datos.clases.find((x) => x.hora === h && fechas.some((f) => claseEn(x, f)));
    if (!c) return `<li class="fila"><span class="fn"><b>${horaTxt(h)}</b> · libre las próximas 4 semanas</span><button type="button" class="btn-sec chico" data-a="libre-nueva" data-h="${h}" data-f="${fechas[0]}">Crear clase</button></li>`;
    const f = fechas.find((x) => claseEn(c, x))!;
    const n = sesion(datos, c, f).integrantes.length;
    return `<li class="fila"><span class="fn"><b>${horaTxt(h)}</b> · ${esc(c.tipo)} ${n}/${c.cupo} <small>${n < c.cupo ? `hay ${c.cupo - n} ${c.cupo - n === 1 ? 'lugar' : 'lugares'}` : 'completa'}</small></span><button type="button" class="btn-sec chico" data-a="libre-clase" data-c="${c.id}" data-f="${f}">Ver</button></li>`;
  }).join('');
  const chips = DIAS_SEMANA.map((d) => `<button type="button" class="chip" data-a="libre-dia" data-d="${d}" aria-pressed="${d === dia}">${NOMBRE_DIA[d].slice(0, 3)}</button>`).join('');
  const form = mostrar(`<form method="dialog" class="form">${head('Buscar horario', `Los ${NOMBRE_DIA[dia].toLowerCase()}`)}
    <div class="chips" role="group" aria-label="Día">${chips}</div><ul class="filas">${filas}</ul></form>`);
  form.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
    if (b.dataset.a === 'libre-dia') abrirLibres(+b.dataset.d!);
    else if (b.dataset.a === 'libre-nueva') abrirNueva(b.dataset.f!, +b.dataset.h!);
    else if (b.dataset.a === 'libre-clase') abrirClase(b.dataset.c!, b.dataset.f!);
  });
}

// ───────────────────────────── Eventos ─────────────────────────────
app.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-a]');
  if (!el) return;
  const d = el.dataset;
  switch (d.a) {
    case 'vista': vista = d.v as Vista; render(); break;
    case 'dia-prev': fechaSel = sumarDias(fechaSel, -1); render(); break;
    case 'dia-next': fechaSel = sumarDias(fechaSel, 1); render(); break;
    case 'dia-hoy': fechaSel = hoyIso(); render(); break;
    case 'sem-prev': lunes = sumarDias(lunes, -7); render(); break;
    case 'sem-next': lunes = sumarDias(lunes, 7); render(); break;
    case 'sem-hoy': lunes = lunesDe(hoyIso()); render(); break;
    case 'dia-chip': diaSel = +d.d!; render(); break;
    case 'marcar': marcar(d.c!, d.f!, d.al!, d.e as EstadoAsist); break;
    case 'todos': {
      const c = datos.clases.find((x) => x.id === d.c);
      if (c) { const s = sesion(datos, c, d.f!); (async () => { for (const i of s.integrantes) if (i.estado === 'anotado') await marcar(c.id, d.f!, i.alumno.id, 'vino'); })(); }
      break;
    }
    case 'reactivar': { const s = datos.suspensiones.find((x) => x.clase_id === d.c && x.fecha === d.f); if (s) store.borrar('suspensiones', s.id).then(recargar); break; }
    case 'clase': abrirClase(d.c!, d.f!); break;
    case 'nueva': abrirNueva(d.f!, +d.h!); break;
    case 'libres': abrirLibres(); break;
    case 'nuevo-alu': abrirAlumno(null); break;
    case 'alu': abrirAlumno(datos.alumnos.find((a) => a.id === d.al) ?? null); break;
    case 'cobrar': abrirPago(d.al!); break;
  }
});
app.addEventListener('input', (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.id === 'busca') { busca = el.value; const pos = el.selectionStart; render(); const n = $<HTMLInputElement>('#busca'); n.focus(); n.setSelectionRange(pos, pos); }
  else if (el.id === 'inact') { verInactivos = el.checked; render(); }
});
app.addEventListener('change', (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.id === 'fecha-hoy' && /^\d{4}-\d{2}-\d{2}$/.test(el.value)) { fechaSel = el.value; render(); }
});
hoja.addEventListener('click', (ev) => { if (ev.target === hoja) hoja.close(); }); // tocar afuera cierra

// ───────────────────────────── Inicio ─────────────────────────────
/** Datos de ejemplo para probar el panel en modo demo. */
async function sembrar() {
  const base = sumarDias(lunesDe(hoyIso()), -14);
  const ids: Record<string, string> = {};
  const gente: [string, string, string][] = [['Lucía Gómez', 'Intermedio', '3704 111222'], ['Pedro Ruiz', 'Principiante', ''], ['Sofía Benítez', 'Avanzado', '3704 333444'], ['Mariano Acosta', 'Intermedio', ''], ['Camila Duarte', 'Principiante', '']];
  for (const [nombre, nivel, telefono] of gente) ids[nombre] = await store.crear('alumnos', { nombre, telefono, nivel, notas: '', activo: true });
  const clase = async (dia: number, hora: number, nombres: string[]) => {
    const desde = primeraDesde(base, dia);
    const id = await store.crear('clases', { dia_semana: dia, hora, fecha: null, desde, hasta: null, tipo: TIPO_DEF, cupo: cfg.cupoPorDefecto });
    for (const n of nombres) await store.crear('inscripciones', { clase_id: id, alumno_id: ids[n], desde, hasta: null });
    return id;
  };
  const mar = await clase(2, 18, ['Lucía Gómez', 'Pedro Ruiz', 'Sofía Benítez']);
  await clase(4, 18, ['Lucía Gómez', 'Pedro Ruiz']);
  await clase(1, 19, ['Mariano Acosta', 'Camila Duarte']);
  for (const f of [primeraDesde(base, 2), sumarDias(primeraDesde(base, 2), 7)]) {
    for (const [n, estado] of [['Lucía Gómez', 'vino'], ['Pedro Ruiz', 'vino'], ['Sofía Benítez', 'aviso']] as const)
      await store.crear('asistencias', { clase_id: mar, fecha: f, alumno_id: ids[n], estado, precio: precioPor(estado) });
  }
  await store.crear('pagos', { alumno_id: ids['Lucía Gómez'], fecha: hoyIso(), monto: cfg.precioClase, nota: 'ejemplo' });
}

async function iniciar() {
  store = await crearStore();
  const demo = $('#demo');
  demo.hidden = store.modo !== 'demo';
  if (store.modo === 'demo' && !document.querySelector('#seed')) {
    demo.insertAdjacentHTML('beforeend', ' <button id="seed" type="button" class="btn-sec chico">Cargar datos de ejemplo</button>');
    $('#seed').addEventListener('click', async () => { try { await sembrar(); await recargar(); aviso('Datos de ejemplo cargados'); } catch (e) { aviso('No se pudo: ' + (e as Error).message); } });
  }
  const email = await store.sesion();
  if (!email) return mostrarLogin();
  $('#login').hidden = true; app.hidden = false;
  if (store.modo === 'nube') { const s = $('#salir'); s.hidden = false; s.onclick = async () => { await store.salir(); location.reload(); }; }
  await recargar();
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
