// Dónde se guardan los datos: Supabase (con login) si hay claves configuradas; si no, modo demo en este navegador.
import { vacio, type Datos } from './modelo';
import { cliente, entrar as entrarCuenta, rol as rolCuenta, salir as salirCuenta, sesion as sesionCuenta, type Rol } from '../auth';

export type Tabla = keyof Datos;
const TABLAS: Tabla[] = ['alumnos', 'clases', 'inscripciones', 'suspensiones', 'asistencias', 'pagos'];

export interface Store {
  modo: 'nube' | 'demo';
  sesion(): Promise<string | null>; // email del usuario logueado
  rol(): Promise<Rol | null>; // 'nacho' | 'alumno' (en demo siempre 'nacho')
  entrar(email: string, clave: string): Promise<void>;
  salir(): Promise<void>;
  cargar(): Promise<Datos>;
  crear(tabla: Tabla, fila: Record<string, unknown>): Promise<string>; // devuelve el id
  actualizar(tabla: Tabla, id: string, cambios: Record<string, unknown>): Promise<void>;
  borrar(tabla: Tabla, id: string): Promise<void>;
}

const URL_SB = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY_SB = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export async function crearStore(): Promise<Store> {
  if (URL_SB && KEY_SB) {
    const sb = await cliente(); // el mismo cliente (y la misma sesión) que /cuenta/ y el Cuaderno
    const fallo = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
    // Supabase devuelve como máximo 1000 filas por pedido: se pide por páginas.
    const todas = async (t: Tabla) => {
      const out: unknown[] = [];
      for (let desde = 0; ; desde += 1000) {
        const r = await sb.from(t).select('*').order('creado').order('id').range(desde, desde + 999);
        fallo(r.error); out.push(...(r.data ?? []));
        if ((r.data ?? []).length < 1000) return out;
      }
    };
    return {
      modo: 'nube',
      async sesion() { return (await sesionCuenta())?.email ?? null; },
      rol: rolCuenta,
      entrar: entrarCuenta,
      salir: salirCuenta,
      async cargar() {
        const filas = await Promise.all(TABLAS.map(todas));
        return Object.fromEntries(TABLAS.map((t, i) => [t, filas[i]])) as unknown as Datos;
      },
      async crear(t, fila) { const r = await sb.from(t).insert(fila).select('id').single(); fallo(r.error); return (r.data as { id: string }).id; },
      async actualizar(t, id, c) { fallo((await sb.from(t).update(c).eq('id', id)).error); },
      async borrar(t, id) { fallo((await sb.from(t).delete().eq('id', id)).error); },
    };
  }
  // Modo demo: localStorage. Sirve para probar el panel antes de conectar Supabase.
  const KEY = 'nr-panel-demo-v2';
  const leer = (): Datos => { try { return { ...vacio(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return vacio(); } };
  const guardar = (d: Datos) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* sin almacenamiento */ } };
  const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    modo: 'demo',
    async sesion() { return 'demo'; },
    async rol() { return 'nacho'; },
    async entrar() {},
    async salir() {},
    async cargar() { return leer(); },
    async crear(t, fila) { const d = leer(); const id = nuevoId(); (d[t] as unknown[]).push({ ...fila, id }); guardar(d); return id; },
    async actualizar(t, id, c) { const d = leer(); d[t] = (d[t] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...c } : x)) as never; guardar(d); },
    async borrar(t, id) {
      const d = leer();
      d[t] = (d[t] as { id: string }[]).filter((x) => x.id !== id) as never;
      // Igual que "on delete cascade" en la base: al borrar una clase o un alumno se borra lo que cuelga de él.
      if (t === 'clases') for (const k of ['inscripciones', 'suspensiones', 'asistencias'] as const) d[k] = (d[k] as { clase_id: string }[]).filter((x) => x.clase_id !== id) as never;
      if (t === 'alumnos') for (const k of ['inscripciones', 'asistencias', 'pagos'] as const) d[k] = (d[k] as { alumno_id: string }[]).filter((x) => x.alumno_id !== id) as never;
      guardar(d);
    },
  };
}
