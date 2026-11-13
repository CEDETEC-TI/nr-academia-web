// Ayudas para probar contra la base REAL de Supabase. Nada secreto vive en el repo:
// la service_role se pide en el momento a la CLI de Supabase (hay que estar logueado: `supabase login`)
// y la clave temporal de Nacho se lee de un archivo fuera del repo.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
export const URL_SB = env.PUBLIC_SUPABASE_URL; export const ANON = env.PUBLIC_SUPABASE_ANON_KEY;
const REF = new URL(URL_SB).hostname.split('.')[0];
const out = execFileSync('supabase', ['projects', 'api-keys', '--project-ref', REF, '--output-format', 'json'], { encoding: 'utf8' });
const SVC = JSON.parse(out.slice(out.indexOf('{'))).keys.find((k) => k.name === 'service_role').api_key;

export async function api(metodo, ruta, cuerpo, extra = {}) {
  const r = await fetch(URL_SB + ruta, { method: metodo, headers: { apikey: SVC, Authorization: 'Bearer ' + SVC, 'Content-Type': 'application/json', Prefer: 'return=representation', ...extra }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const t = await r.text(); return { status: r.status, data: t ? JSON.parse(t) : null };
}
export const nacho = () => ({ email: process.env.NACHO_EMAIL, clave: readFileSync(process.env.NACHO_CLAVE_ARCHIVO ?? homedir() + '/.academia-nr-nacho-temp.txt', 'utf8').trim() });

/** Borra TODO lo del panel. Solo para la base de pruebas previa al lanzamiento: exige LIMPIAR_PANEL=si. */
export async function limpiarPanel() {
  if (process.env.LIMPIAR_PANEL !== 'si') throw new Error('Falta LIMPIAR_PANEL=si (esto borra todos los datos del panel).');
  for (const t of ['asistencias', 'pagos', 'suspensiones', 'inscripciones', 'clases', 'alumnos']) await api('DELETE', `/rest/v1/${t}?id=not.is.null`);
}
