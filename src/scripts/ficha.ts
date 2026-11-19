// Página /cuenta/ficha/: el alumno completa y edita su ficha técnica (tabla `fichas`, una por usuario, protegida por RLS).
import { cliente, hayNube, mensajeError, sesion } from './auth';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;

function aviso(msg: string, tipo: 'ok' | 'error' | '' = '') {
  const a = $('#f-estado'); a.textContent = msg; a.dataset.tipo = tipo; a.hidden = !msg;
  if (msg) a.scrollIntoView({ block: 'nearest' });
}

async function iniciar() {
  if (!hayNube) { $('#f-off').hidden = false; return; }
  const s = await sesion();
  if (!s) { $('#f-sin').hidden = false; return; }
  const sb = await cliente();
  const form = $<HTMLFormElement>('#f-form');

  const { data: ficha, error } = await sb.from('fichas').select('*').eq('owner', s.id).maybeSingle();
  if (error) throw error;
  const set = (n: string, v: unknown) => { const el = form.elements.namedItem(n) as HTMLInputElement | null; if (el && v != null) el.value = String(v); };
  if (ficha) {
    ['nombre', 'edad', 'objetivo', 'lesiones', 'disponibilidad'].forEach((n) => set(n, ficha[n]));
    for (const n of ['nivel', 'mano', 'lado'] as const) form.querySelector<HTMLInputElement>(`input[name=${n}][value="${ficha[n]}"]`)?.click();
    for (const g of ficha.golpes ?? []) { const c = [...form.querySelectorAll<HTMLInputElement>('input[name=golpes]')].find((x) => x.value === g); if (c) c.checked = true; }
  } else {
    // Quien entró con Google ya trae el nombre: se ofrece de entrada.
    const { data } = await sb.auth.getUser();
    set('nombre', data.user?.user_metadata?.full_name ?? data.user?.user_metadata?.name ?? '');
  }
  form.hidden = false;

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const txt = (n: string) => String(fd.get(n) ?? '').trim();
    if (!txt('nombre')) { aviso('Escribí tu nombre.', 'error'); form.nombre.focus(); return; }
    const edad = txt('edad') ? Number(txt('edad')) : null;
    if (edad !== null && !(Number.isInteger(edad) && edad >= 3 && edad <= 99)) { aviso('La edad tiene que ser un número entre 3 y 99.', 'error'); return; }
    const fila = {
      owner: s.id, nombre: txt('nombre'), edad, nivel: txt('nivel') || null, mano: txt('mano') || null, lado: txt('lado') || null,
      objetivo: txt('objetivo'), golpes: fd.getAll('golpes').map(String), lesiones: txt('lesiones'), disponibilidad: txt('disponibilidad'),
      actualizado: new Date().toISOString(),
    };
    const b = form.querySelector<HTMLButtonElement>('button[type=submit]')!; b.disabled = true;
    try {
      const { error: e } = await sb.from('fichas').upsert(fila, { onConflict: 'owner' });
      if (e) throw e;
      aviso('¡Listo! Guardamos tu ficha.', 'ok');
    } catch (e) { aviso(mensajeError(e), 'error'); } finally { b.disabled = false; }
  };
}
iniciar().catch((e) => { $('#f-form').hidden = true; aviso(mensajeError(e), 'error'); });
