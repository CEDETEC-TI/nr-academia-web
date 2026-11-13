// Cuenta de usuario (Supabase Auth), compartida por /cuenta/, /panel/ y /cuaderno/.
// Si no hay claves de Supabase (`hayNube` = false) nada de esto se usa y el sitio funciona como antes.
import type { SupabaseClient } from '@supabase/supabase-js';
import { url } from '../utils';

const URL_SB = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY_SB = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
export const hayNube = Boolean(URL_SB && KEY_SB);

export type Rol = 'nacho' | 'alumno';
export interface Sesion { id: string; email: string }

// Pista liviana para el menú (mostrar "Mi cuenta" y "Panel" sin cargar supabase-js en cada página).
// Es solo cosmética: el acceso real lo deciden Supabase y sus reglas (RLS).
export const PISTA = 'nr-sesion';
function pista(s: (Sesion & { rol: Rol | null }) | null) {
  try { if (s) localStorage.setItem(PISTA, JSON.stringify({ email: s.email, rol: s.rol })); else localStorage.removeItem(PISTA); } catch { /* sin storage */ }
  window.dispatchEvent(new Event('nr-sesion')); // el menú se actualiza al instante
}

let promesa: Promise<SupabaseClient> | null = null;
/** Cliente único de Supabase (se carga recién cuando hace falta). */
export function cliente(): Promise<SupabaseClient> {
  if (!hayNube) return Promise.reject(new Error('Las cuentas todavía no están activas.'));
  promesa ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_SB!, KEY_SB!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }));
  return promesa;
}

/** Usuario logueado o null. */
export async function sesion(): Promise<Sesion | null> {
  if (!hayNube) return null;
  const { data } = await (await cliente()).auth.getSession();
  const u = data.session?.user;
  return u ? { id: u.id, email: u.email ?? '' } : null;
}

/** Rol del usuario logueado ('nacho' | 'alumno'), leído de su perfil. */
export async function rol(): Promise<Rol | null> {
  const s = await sesion();
  if (!s) { pista(null); return null; }
  const { data } = await (await cliente()).from('perfiles').select('rol').eq('user_id', s.id).maybeSingle();
  const r = (data?.rol as Rol | undefined) ?? 'alumno';
  pista({ ...s, rol: r });
  return r;
}

/** Mensajes de error de Supabase en castellano. */
export function mensajeError(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e).toLowerCase();
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos.';
  if (m.includes('not confirmed')) return 'Todavía falta confirmar tu mail: buscá el correo que te mandamos y tocá el enlace.';
  if (m.includes('already registered')) return 'Ese mail ya tiene una cuenta. Probá entrar o recuperar la contraseña.';
  if (m.includes('password') && (m.includes('least') || m.includes('short') || m.includes('weak'))) return 'La contraseña tiene que tener al menos 8 caracteres.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Hiciste muchos intentos seguidos. Esperá un minuto y probá de nuevo.';
  if (m.includes('valid email') || m.includes('invalid email')) return 'Revisá el mail: no parece válido.';
  if (m.includes('not authorized')) return 'Todavía no podemos mandar mails de confirmación a cualquier dirección. Escribinos por WhatsApp y te ayudamos.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No hay conexión. Probá de nuevo en un rato.';
  return 'No se pudo completar. Probá de nuevo.';
}

const aCuenta = () => new URL(url('cuenta/'), location.origin).href;

export async function entrar(email: string, clave: string): Promise<void> {
  const { error } = await (await cliente()).auth.signInWithPassword({ email, password: clave });
  if (error) throw error;
  await rol();
}

/** Crea la cuenta (siempre como 'alumno'). Supabase manda el mail de confirmación. */
export async function registrar(email: string, clave: string): Promise<void> {
  const { error } = await (await cliente()).auth.signUp({ email, password: clave, options: { emailRedirectTo: aCuenta() } });
  if (error) throw error;
}

export async function recuperar(email: string): Promise<void> {
  const { error } = await (await cliente()).auth.resetPasswordForEmail(email, { redirectTo: aCuenta() });
  if (error) throw error;
}

export async function nuevaClave(clave: string): Promise<void> {
  const { error } = await (await cliente()).auth.updateUser({ password: clave });
  if (error) throw error;
}

export async function salir(): Promise<void> {
  try { await (await cliente()).auth.signOut(); } finally { pista(null); }
}
