// Fichas técnicas de los alumnos que se registraron en /cuenta/ (solo lectura para Nacho).
// La base (RLS) deja leer todas las fichas y notas solo al rol 'nacho'; nadie más ve nada y Nacho no puede modificarlas.
import { cliente } from '../auth';
import { norm } from './modelo';

export interface FichaFila {
  owner: string; nombre: string; edad: number | null; nivel: 'principiante' | 'intermedio' | 'avanzado' | null;
  mano: 'derecha' | 'zurda' | null; lado: 'derecha' | 'reves' | null; objetivo: string; golpes: string[]; lesiones: string; disponibilidad: string;
}
export interface NotaFila { id: string; fecha: string; trabaje: string; costo: string; proxima: string }

export const NIVELES = ['principiante', 'intermedio', 'avanzado'] as const;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaCorta = (f: string) => { const [, m, d] = f.split('-'); return `${+d} ${MESES[+m - 1]}`; };

export async function cargarFichas(): Promise<FichaFila[]> {
  const sb = await cliente();
  const out: FichaFila[] = [];
  for (let d = 0; ; d += 1000) {
    const r = await sb.from('fichas').select('owner,nombre,edad,nivel,mano,lado,objetivo,golpes,lesiones,disponibilidad').order('nombre').range(d, d + 999);
    if (r.error) throw new Error(r.error.message);
    out.push(...(r.data as FichaFila[]));
    if ((r.data ?? []).length < 1000) return out;
  }
}
export async function cargarNotas(owner: string, limite = 10): Promise<NotaFila[]> {
  const r = await (await cliente()).from('cuaderno_notas').select('id,fecha,trabaje,costo,proxima').eq('owner', owner).order('fecha', { ascending: false }).order('id').limit(limite);
  if (r.error) throw new Error(r.error.message);
  return r.data as NotaFila[];
}

export function htmlLista(fichas: FichaFila[], q: string, nivel: string) {
  const nq = norm(q);
  const lista = fichas.filter((f) => (!nivel || f.nivel === nivel || (nivel === 'sin' && !f.nivel)) && (!nq || norm(f.nombre).includes(nq)))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const chip = (v: string, t: string) => `<button type="button" class="chip" data-a="f-nivel" data-n="${v}" aria-pressed="${nivel === v}">${t}</button>`;
  const filas = lista.map((f) => `<li class="alu"><button class="alu-main" data-a="ficha" data-o="${esc(f.owner)}">
      <span class="alu-nom">${esc(f.nombre || 'Sin nombre')}</span>
      <span class="alu-meta">${esc([f.nivel ? cap(f.nivel) : 'Sin nivel', f.edad ? f.edad + ' años' : ''].filter(Boolean).join(' · '))}</span></button></li>`).join('');
  return `<div class="top"><p class="resumen"><b>${fichas.length}</b> ${fichas.length === 1 ? 'ficha' : 'fichas'}</p></div>
    <div class="filtros"><input id="busca-f" type="search" placeholder="Buscar alumno" value="${esc(q)}" aria-label="Buscar alumno" autocomplete="off"></div>
    <div class="nivel-chips" role="group" aria-label="Nivel">${chip('', 'Todos')}${NIVELES.map((n) => chip(n, cap(n))).join('')}${chip('sin', 'Sin nivel')}</div>
    ${lista.length ? `<ul class="alus">${filas}</ul>` : `<p class="vacio">${fichas.length ? 'No hay alumnos con ese nombre y nivel.' : 'Todavía nadie completó su ficha. Aparecen acá cuando los alumnos la guardan desde su cuenta.'}</p>`}`;
}

const dato = (k: string, v: string | null | undefined) => (v && v.trim() ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '');
export function htmlFicha(f: FichaFila, notas: NotaFila[] | null) {
  const ficha = [
    dato('Nivel', f.nivel && cap(f.nivel)), dato('Edad', f.edad ? f.edad + ' años' : ''), dato('Mano hábil', f.mano && cap(f.mano)),
    dato('Lado de la cancha', f.lado === 'reves' ? 'Revés' : f.lado && 'Derecha'), dato('Objetivo', f.objetivo),
    dato('Golpes a mejorar', f.golpes.join(', ')), dato('Lesiones o cuidados', f.lesiones), dato('Disponibilidad', f.disponibilidad),
  ].join('');
  const nb = notas === null ? '<p class="vacio">No se pudo cargar el cuaderno.</p>'
    : notas.length ? `<ul class="f-notas">${notas.map((n) => `<li><p class="f-fecha">${esc(fechaCorta(n.fecha))}</p><dl class="f-dl">${dato('Trabajó', n.trabaje)}${dato('Le costó', n.costo)}${dato('Practica para la próxima', n.proxima)}</dl></li>`).join('')}</ul>`
      : '<p class="vacio">Todavía no anotó nada en el cuaderno.</p>';
  return `<form method="dialog" class="form"><div class="hhead"><div><p class="lbl">Ficha técnica · solo lectura</p><h3>${esc(f.nombre || 'Sin nombre')}</h3></div><button type="button" class="x" data-cerrar aria-label="Cerrar">×</button></div>
    <dl class="f-dl">${ficha || '<p class="vacio">La ficha está vacía.</p>'}</dl>
    <h4 class="f-sub">Últimas entradas del cuaderno</h4>${nb}</form>`;
}
