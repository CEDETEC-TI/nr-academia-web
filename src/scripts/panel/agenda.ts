// Lógica pura de la agenda (sin DOM ni red): qué turnos hay y cuáles están ocupados en una fecha.
import { horarios } from '../../data/academia';

export interface Turno {
  id: string;
  hora: number;
  fijo: boolean;
  dia_semana: number | null; // 1 = lunes … 7 = domingo
  desde: string | null; // YYYY-MM-DD
  hasta: string | null;
  fecha: string | null;
  excepcion: boolean;
  alumnos: string;
  tipo: string;
  notas: string;
}
export type NuevoTurno = Omit<Turno, 'id'>;

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
export const horaTxt = (h: number) => `${pad(h)}:00`;

export interface Estado { ocupado: boolean; turno: Turno | null; excepcion: Turno | null }

/** Un turno único (no excepción) gana; si no, una excepción libera el fijo; si no, vale el fijo vigente. */
export function estadoDe(turnos: Turno[], fecha: string, hora: number): Estado {
  const delDia = turnos.filter((t) => !t.fijo && t.fecha === fecha && t.hora === hora);
  const unico = delDia.find((t) => !t.excepcion) ?? null;
  const excepcion = delDia.find((t) => t.excepcion) ?? null;
  if (unico) return { ocupado: true, turno: unico, excepcion };
  const dia = diaSemana(fecha);
  const fijo = turnos.find((t) => t.fijo && t.dia_semana === dia && t.hora === hora && (t.desde ?? '') <= fecha && (!t.hasta || t.hasta >= fecha)) ?? null;
  if (fijo && !excepcion) return { ocupado: true, turno: fijo, excepcion: null };
  return { ocupado: false, turno: null, excepcion };
}

export function resumenSemana(turnos: Turno[], lunes: string) {
  let ocupados = 0, total = 0;
  for (const d of DIAS_SEMANA) for (const h of HORAS) { total++; if (estadoDe(turnos, sumarDias(lunes, d - 1), h).ocupado) ocupados++; }
  return { ocupados, libres: total - ocupados, total };
}
