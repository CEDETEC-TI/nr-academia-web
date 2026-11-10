// Dónde se guardan los turnos: Supabase (con login) si hay claves configuradas; si no, modo demo en este navegador.
import type { NuevoTurno, Turno } from './agenda';

export interface Store {
  modo: 'nube' | 'demo';
  sesion(): Promise<string | null>; // email del usuario logueado
  entrar(email: string, clave: string): Promise<void>;
  salir(): Promise<void>;
  listar(desde: string, hasta: string): Promise<Turno[]>;
  crear(t: NuevoTurno): Promise<void>;
  actualizar(id: string, cambios: Partial<NuevoTurno>): Promise<void>;
  borrar(id: string): Promise<void>;
}

const URL_SB = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY_SB = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export async function crearStore(): Promise<Store> {
  if (URL_SB && KEY_SB) {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(URL_SB, KEY_SB);
    const ok = <T>(r: { data: T; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data; };
    return {
      modo: 'nube',
      async sesion() { const { data } = await sb.auth.getSession(); return data.session?.user.email ?? null; },
      async entrar(email, clave) { const { error } = await sb.auth.signInWithPassword({ email, password: clave }); if (error) throw new Error(error.message); },
      async salir() { await sb.auth.signOut(); },
      async listar(desde, hasta) {
        return ok(await sb.from('turnos').select('*').or(`fijo.eq.true,and(fecha.gte.${desde},fecha.lte.${hasta})`)) as Turno[];
      },
      async crear(t) { ok(await sb.from('turnos').insert(t)); },
      async actualizar(id, c) { ok(await sb.from('turnos').update(c).eq('id', id)); },
      async borrar(id) { ok(await sb.from('turnos').delete().eq('id', id)); },
    };
  }
  // Modo demo: localStorage. Sirve para probar el panel antes de conectar Supabase.
  const KEY = 'nr-panel-demo-v1';
  const leer = (): Turno[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const guardar = (t: Turno[]) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* sin almacenamiento */ } };
  const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    modo: 'demo',
    async sesion() { return 'demo'; },
    async entrar() {},
    async salir() {},
    async listar(desde, hasta) { return leer().filter((t) => t.fijo || (t.fecha! >= desde && t.fecha! <= hasta)); },
    async crear(t) { guardar([...leer(), { ...t, id: id() }]); },
    async actualizar(i, c) { guardar(leer().map((t) => (t.id === i ? { ...t, ...c } : t))); },
    async borrar(i) { guardar(leer().filter((t) => t.id !== i)); },
  };
}
