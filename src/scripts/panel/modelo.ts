// Modelo del panel de Nacho: tipos y lógica pura (sin DOM ni red).
//   Alumno ── Inscripción ── Clase (grupo que se repite, con cupo)
//   Clase + fecha = Sesión (se marca la Asistencia de cada alumno) · cada clase a la que vino se cobra · Pagos descuentan.
import { horarios, panel as cfg } from '../../data/academia';

export type EstadoAsist = 'anotado' | 'vino' | 'falto' | 'aviso';
export interface Alumno { id: string; nombre: string; telefono: string; nivel: string; notas: string; activo: boolean }
/** Clase semanal (dia_semana + desde/hasta) o clase única de un solo día (fecha). */
export interface Clase { id: string; dia_semana: number | null; hora: number; fecha: string | null; desde: string | null; hasta: string | null; tipo: string; cupo: number }
export interface Inscripcion { id: string; clase_id: string; alumno_id: string; desde: string; hasta: string | null }
export interface Suspension { id: string; clase_id: string; fecha: string; motivo: string }
export interface Asistencia { id: string; clase_id: string; fecha: string; alumno_id: string; estado: EstadoAsist; precio: number }
export interface Pago { id: string; alumno_id: string; fecha: string; monto: number; nota: string }
export interface Datos { alumnos: Alumno[]; clases: Clase[]; inscripciones: Inscripcion[]; suspensiones: Suspension[]; asistencias: Asistencia[]; pagos: Pago[] }
export const vacio = (): Datos => ({ alumnos: [], clases: [], inscripciones: [], suspensiones: [], asistencias: [], pagos: [] });

// ── Fechas ────────────────────────────────────────────────────────────────
/** Horas de inicio de cada clase (1 hora), salen de las franjas de academia.ts: "8 a 12 hs" → 8, 9, 10, 11. */
export const HORAS: number[] = horarios.franjas.flatMap((f) => {
  const [a, b] = (f.match(/\d+/g) ?? []).map(Number);
  return Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
});
export const DIAS_SEMANA = [1, 2, 3, 4, 5]; // lunes a viernes, como en academia.ts
export const NOMBRE_DIA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const diaSemana = (s: string) => ((parse(s).getDay() + 6) % 7) + 1; // 1 = lunes
export const sumarDias = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
export const lunesDe = (s: string) => sumarDias(s, 1 - diaSemana(s));
export const finDeMes = (s: string) => { const d = parse(s); return iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
export const horaTxt = (h: number) => `${pad(h)}:00`;
/** Primera fecha desde `desde` (inclusive) que cae en el día de semana `dia` (1 = lunes). */
export const primeraDesde = (desde: string, dia: number) => sumarDias(desde, (dia - diaSemana(desde) + 7) % 7);
export function fechasEnRango(desde: string, hasta: string, dia: number): string[] {
  const out: string[] = [];
  for (let f = primeraDesde(desde, dia); f <= hasta; f = sumarDias(f, 7)) out.push(f);
  return out;
}

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// ── Clases y sesiones ─────────────────────────────────────────────────────
export const claseEn = (c: Clase, fecha: string) =>
  c.fecha ? c.fecha === fecha : c.dia_semana === diaSemana(fecha) && (c.desde ?? '') <= fecha && (!c.hasta || c.hasta >= fecha);
export const vigente = (i: Inscripcion, fecha: string) => i.desde <= fecha && (!i.hasta || i.hasta >= fecha);

export interface Integrante { alumno: Alumno; estado: EstadoAsist; asistenciaId: string | null; visita: boolean }
export interface Sesion { clase: Clase; fecha: string; suspendida: Suspension | null; integrantes: Integrante[] }

/** Una clase en una fecha: quiénes están anotados (inscriptos vigentes + visitas de ese día) y cómo quedó su asistencia. */
export function sesion(d: Datos, c: Clase, fecha: string): Sesion {
  const asis = d.asistencias.filter((a) => a.clase_id === c.id && a.fecha === fecha);
  const porId = new Map(d.alumnos.map((a) => [a.id, a]));
  const vistos = new Set<string>();
  const integrantes: Integrante[] = [];
  for (const i of d.inscripciones) {
    if (i.clase_id !== c.id || !vigente(i, fecha) || vistos.has(i.alumno_id)) continue;
    const alumno = porId.get(i.alumno_id); if (!alumno) continue;
    const a = asis.find((x) => x.alumno_id === i.alumno_id);
    vistos.add(i.alumno_id);
    integrantes.push({ alumno, estado: a?.estado ?? 'anotado', asistenciaId: a?.id ?? null, visita: false });
  }
  for (const a of asis) {
    const alumno = porId.get(a.alumno_id);
    if (!alumno || vistos.has(a.alumno_id)) continue;
    vistos.add(a.alumno_id);
    integrantes.push({ alumno, estado: a.estado, asistenciaId: a.id, visita: true });
  }
  integrantes.sort((x, y) => x.alumno.nombre.localeCompare(y.alumno.nombre, 'es'));
  return { clase: c, fecha, suspendida: d.suspensiones.find((s) => s.clase_id === c.id && s.fecha === fecha) ?? null, integrantes };
}
export const sesionesDelDia = (d: Datos, fecha: string): Sesion[] =>
  d.clases.filter((c) => claseEn(c, fecha)).sort((a, b) => a.hora - b.hora).map((c) => sesion(d, c, fecha));

/** ¿Ya hay una clase (aunque esté suspendida) a esa hora ese día? Hay una sola cancha de Nacho por horario. */
export const ocupadaEl = (d: Datos, fecha: string, hora: number) => d.clases.some((c) => c.hora === hora && claseEn(c, fecha));

/** Clases en las que está anotado un alumno y que todavía no terminaron (incluye las que empiezan más adelante). */
export function inscripcionesVigentes(d: Datos, alumnoId: string, fecha: string) {
  return d.inscripciones
    .filter((i) => i.alumno_id === alumnoId && (!i.hasta || i.hasta >= fecha))
    .map((insc) => ({ insc, clase: d.clases.find((c) => c.id === insc.clase_id) }))
    .filter((x): x is { insc: Inscripcion; clase: Clase } => !!x.clase && (x.clase.fecha ? true : !x.clase.hasta || x.clase.hasta >= fecha));
}

// ── Plata ─────────────────────────────────────────────────────────────────
/** Lo que cuesta una clase según cómo quedó la asistencia. */
export const precioPor = (e: EstadoAsist) => (e === 'vino' || (e === 'falto' && cfg.cobraFaltaSinAviso) ? cfg.precioClase : 0);
export function cuenta(d: Datos, alumnoId: string) {
  const dadas = d.asistencias.filter((a) => a.alumno_id === alumnoId && a.precio > 0);
  const cobrado = dadas.reduce((n, a) => n + a.precio, 0);
  const pagado = d.pagos.filter((p) => p.alumno_id === alumnoId).reduce((n, p) => n + p.monto, 0);
  return { clases: dadas.length, cobrado, pagado, debe: cobrado - pagado };
}
export const dinero = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR');

/** Link de WhatsApp: solo dígitos; un celular local de Formosa (10 dígitos) se completa con 549. */
export function waLink(tel: string, texto = ''): string | null {
  const dig = tel.replace(/\D/g, '');
  if (dig.length < 8) return null;
  const full = dig.startsWith('54') ? dig : dig.length === 10 ? '549' + dig : dig;
  return `https://wa.me/${full}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
}
