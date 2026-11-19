// Página /cuenta/ficha/: el alumno completa y edita su ficha técnica (tabla `fichas`, una por usuario, protegida por RLS).
import { cliente, hayNube, mensajeError, sesion } from './auth';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

type Ficha = { nombre: string; edad: number | null; nivel: string | null; mano: string | null; lado: string | null;
  objetivo: string; golpes: string[]; lesiones: string; disponibilidad: string };

/** Resumen de la ficha: chips con lo corto y tarjetas con lo que escribió. */
function pintarResumen(f: Ficha) {
  $('#r-nombre').textContent = f.nombre || 'Mi ficha';
  $('#r-sub').textContent = f.edad ? `${f.edad} años · así te ve Nacho para preparar tus clases.` : 'Así te ve Nacho para preparar tus clases.';
  const chips = [f.nivel && cap(f.nivel), f.mano && `Mano ${f.mano === 'zurda' ? 'zurda' : 'derecha'}`, f.lado && `Juega de ${f.lado === 'reves' ? 'revés' : 'derecha'}`].filter(Boolean) as string[];
  $('#r-chips').innerHTML = chips.map((c) => `<span class="f-chip">${esc(c)}</span>`).join('');
  $('#r-chips').hidden = !chips.length;
  const texto = (v: string, vacio: string) => (v ? `<p>${esc(v)}</p>` : `<p class="vacio">${vacio}</p>`);
  const golpes = f.golpes?.length ? `<div class="f-golpes">${f.golpes.map((g) => `<span>${esc(g)}</span>`).join('')}</div>` : '<p class="vacio">No elegiste ninguno.</p>';
  $('#r-tarjetas').innerHTML = [
    `<section class="f-tarjeta ancha"><h2>Qué quiero lograr</h2>${texto(f.objetivo, 'Todavía no lo escribiste.')}</section>`,
    `<section class="f-tarjeta ancha"><h2>Golpes a mejorar</h2>${golpes}</section>`,
    `<section class="f-tarjeta"><h2>Lesiones o cuidados</h2>${texto(f.lesiones, 'Ninguna.')}</section>`,
    `<section class="f-tarjeta"><h2>Cuándo puedo venir</h2>${texto(f.disponibilidad, 'Todavía no lo escribiste.')}</section>`,
  ].join('');
}
function verResumen(f: Ficha) { pintarResumen(f); $('#f-form').hidden = true; $('#f-resumen').hidden = false; }

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
  if (ficha) verResumen(ficha as Ficha); else form.hidden = false;
  $('#b-editar').onclick = () => {
    aviso(''); $('#f-resumen').hidden = true; form.hidden = false;
    $('#b-cancelar').hidden = false; $('#l-volver').hidden = true;
    window.scrollTo({ top: 0 });
  };
  $('#b-cancelar').onclick = () => { aviso(''); $('#f-resumen').hidden = false; form.hidden = true; window.scrollTo({ top: 0 }); };

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
      verResumen(fila);
      $('#b-cancelar').hidden = false; $('#l-volver').hidden = true;
      window.scrollTo({ top: 0 });
      aviso('¡Listo! Guardamos tu ficha.', 'ok');
    } catch (e) { aviso(mensajeError(e), 'error'); } finally { b.disabled = false; }
  };
}
iniciar().catch((e) => { $('#f-form').hidden = true; aviso(mensajeError(e), 'error'); });
