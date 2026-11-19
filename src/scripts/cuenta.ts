// Página /cuenta/: entrar, crear cuenta, recuperar y cambiar contraseña, cerrar sesión.
import { cliente, entrar, entrarConGoogle, googleActivo, hayNube, mensajeError, nuevaClave, recuperar, registrar, rol, salir, sesion } from './auth';

// El hash trae el aviso de los enlaces de mail; se lee antes de crear el cliente (que lo procesa y lo borra).
const hash = location.hash;
const query = location.search; // los errores de Google (OAuth) vuelven en la URL
let googleOk = false;

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const form = (id: string) => $<HTMLFormElement>(id);
const valor = (f: HTMLFormElement, n: string) => String(new FormData(f).get(n) ?? '').trim();

function aviso(msg: string, tipo: 'ok' | 'error' | '' = '') {
  const a = $('#c-estado'); a.textContent = msg; a.dataset.tipo = tipo; a.hidden = !msg;
}
function mostrar(que: 'entrada' | 'dentro' | 'nueva' | 'off') {
  $('#c-entrada').hidden = que !== 'entrada';
  $('#c-dentro').hidden = que !== 'dentro';
  $('#f-nueva').hidden = que !== 'nueva';
  $('#c-off').hidden = que !== 'off';
}
function pestana(cual: 'entrar' | 'crear' | 'olvide') {
  form('#f-entrar').hidden = cual !== 'entrar';
  form('#f-crear').hidden = cual !== 'crear';
  form('#f-olvide').hidden = cual !== 'olvide';
  $('#t-entrar').setAttribute('aria-selected', String(cual === 'entrar'));
  $('#t-crear').setAttribute('aria-selected', String(cual === 'crear'));
  $('#c-google').hidden = !googleOk || cual === 'olvide';
  aviso('');
}
// Ejecuta una acción deshabilitando el botón para evitar toques dobles.
async function hacer(f: HTMLFormElement, fn: () => Promise<void>) {
  const b = f.querySelector<HTMLButtonElement>('button[type=submit]')!; b.disabled = true;
  try { await fn(); } catch (e) { aviso(mensajeError(e), 'error'); } finally { b.disabled = false; }
}

async function pintarDentro() {
  const s = await sesion(); if (!s) return pintarEntrada();
  const r = await rol();
  $('#c-mail').textContent = s.email;
  $('#c-rol').textContent = r === 'nacho' ? ' (cuenta de Nacho)' : '';
  $('#c-panel').hidden = r !== 'nacho';
  void avisoFicha(s.id, r);
  mostrar('dentro');
}
/** Si el alumno todavía no tiene ficha técnica, se lo recuerda. */
async function avisoFicha(uid: string, r: string | null) {
  const a = $('#c-ficha-aviso'); a.hidden = true;
  if (r === 'nacho') return;
  const { data } = await (await cliente()).from('fichas').select('owner').eq('owner', uid).maybeSingle();
  a.hidden = Boolean(data);
}
function pintarEntrada() { mostrar('entrada'); pestana('entrar'); }

async function iniciar() {
  if (!hayNube) return mostrar('off');
  const sb = await cliente();

  $('#t-entrar').onclick = () => pestana('entrar');
  $('#t-crear').onclick = () => pestana('crear');
  $('#b-google').onclick = async () => { const b = $<HTMLButtonElement>('#b-google'); b.disabled = true; try { await entrarConGoogle(); } catch (e) { aviso(mensajeError(e), 'error'); b.disabled = false; } };
  void googleActivo().then((ok) => { googleOk = ok; $('#c-google').hidden = !ok || !form('#f-olvide').hidden || !$('#c-entrada').offsetParent; });
  $('#b-olvide').onclick = () => pestana('olvide');
  $('#b-volver').onclick = () => pestana('entrar');

  form('#f-entrar').onsubmit = (ev) => { ev.preventDefault(); const f = form('#f-entrar');
    void hacer(f, async () => { await entrar(valor(f, 'email'), valor(f, 'clave')); aviso(''); await pintarDentro(); }); };
  form('#f-crear').onsubmit = (ev) => { ev.preventDefault(); const f = form('#f-crear'); const email = valor(f, 'email');
    if (valor(f, 'clave').length < 8) return aviso('La contraseña tiene que tener al menos 8 caracteres.', 'error');
    void hacer(f, async () => { await registrar(email, valor(f, 'clave')); f.reset(); pestana('entrar');
      aviso(`Te mandamos un mail a ${email}. Tocá el enlace para confirmar tu cuenta y después entrá acá.`, 'ok'); }); };
  form('#f-olvide').onsubmit = (ev) => { ev.preventDefault(); const f = form('#f-olvide'); const email = valor(f, 'email');
    void hacer(f, async () => { await recuperar(email); pestana('entrar'); aviso('Si ese mail tiene cuenta, te mandamos un enlace para elegir una contraseña nueva.', 'ok'); }); };
  form('#f-nueva').onsubmit = (ev) => { ev.preventDefault(); const f = form('#f-nueva');
    if (valor(f, 'clave').length < 8) return aviso('La contraseña tiene que tener al menos 8 caracteres.', 'error');
    void hacer(f, async () => { await nuevaClave(valor(f, 'clave')); f.reset(); await pintarDentro(); aviso('Listo, guardamos tu contraseña nueva.', 'ok'); }); };
  $('#b-salir').onclick = async () => { await salir(); aviso('Cerraste la sesión.', 'ok'); pintarEntrada(); };
  $('#b-cambiar').onclick = () => { aviso(''); mostrar('nueva'); };

  // Enlaces de los mails (confirmar cuenta / recuperar): Supabase los procesa solo y avisa por este evento.
  const err = hash + '&' + query;
  let msgErr = '';
  if (/error(_description)?=/.test(err)) {
    const d = decodeURIComponent((err.match(/error_description=([^&]+)/)?.[1] ?? '').replace(/\+/g, ' '));
    const codigo = err.match(/error_code=([^&]+)/)?.[1] ?? '';
    if (/otp_expired|expired|invalid/i.test(d + codigo)) msgErr = 'El enlace venció o ya se usó. Pedí uno nuevo desde "Me olvidé la contraseña".';
    else if (/access_denied/.test(err)) msgErr = 'Cancelaste el ingreso con Google.';
    else msgErr = 'No se pudo completar el ingreso. Probá de nuevo.';
  }
  sb.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') { aviso(''); mostrar('nueva'); }
    else if (evento === 'SIGNED_OUT') pintarEntrada();
  });
  if (/type=recovery/.test(hash)) { mostrar('nueva'); return; }
  const vinoConfirmar = /type=signup|type=email/.test(hash);
  await pintarDentro();
  if (msgErr) aviso(msgErr, 'error'); // después de pintar: mostrar la pestaña borra los avisos
  if (vinoConfirmar && (await sesion())) aviso('¡Cuenta confirmada! Ya podés usar tu Cuaderno en la nube.', 'ok');
}
iniciar().catch((e) => aviso(mensajeError(e), 'error'));
