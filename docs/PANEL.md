# Panel de Nacho (`/panel/`)

Sistema privado para que Nacho maneje sus **clases grupales, alumnos, asistencia y cobros**. Va por dirección directa (`/panel/`), no está en el menú y Google no la indexa (`noindex`). Está pensado para el celular.

## Cómo funciona (el modelo)
```
Alumno ── Inscripción ── Clase (grupo que se repite, con cupo)
                           └─ Clase + fecha = Sesión → Asistencia de cada alumno (vino / faltó / avisó)
Cada clase a la que VINO se cobra ($10.000, `precios.claseSuelta`) · los Pagos descuentan de la cuenta
```
- **Clase:** "martes 18:00, grupal, cupo 4". Es semanal (se repite) o única (un solo día). Hay una sola clase por horario.
- **Inscripción:** un alumno anotado en una clase, con su propio *desde* y *hasta*. Por eso Nacho puede estar anotado todo el mes y otro alumno solo una semana.
- **Asistencia:** se marca con un toque por alumno en cada clase. Tocar de nuevo desmarca. Quien viene un solo día a una clase donde no está inscripto figura como "solo hoy" (recupero o visita).
- **Cuenta:** clases a las que vino × precio − pagos. Un alumno que **faltó con aviso** o **sin aviso** no suma (la regla de faltas sin aviso está en `panel.cobraFaltaSinAviso`, sin confirmar con Nacho). El precio de cada clase queda guardado en la asistencia, así que si cambia el precio no se altera lo anterior.

## Pantallas
- **Hoy:** las clases del día con sus alumnos y tres botones por alumno (Vino · Faltó · Avisó). "Todos vinieron" marca a los pendientes. Se cambia de día con las flechas o el selector de fecha.
- **Semana:** la grilla de lunes a viernes (8–12 y 14–20, salen de `horarios.franjas`). Cada horario dice quién va y "2/4", o "Libre". Tocar un horario libre crea una clase; tocar una clase la abre. **Buscar horario libre** responde "¿tenés lugar el martes a tal hora?": lista cada horario del día con "libre las próximas 4 semanas" o "Grupales 2/4, hay 2 lugares".
- **Alumnos:** lista con buscador, WhatsApp y lo que debe cada uno. La ficha tiene nombre, WhatsApp, nivel, notas, sus clases y su cuenta. Un alumno nuevo también se crea solo al escribir su nombre en una clase.
- **Cobros:** cuánto hay para cobrar, quién debe, botón "Avisar" por WhatsApp con el mensaje armado y registro de pagos.

## Crear y editar clases
- **Crear** (Semana → horario libre): se elige si se repite todas las semanas o solo ese día, otros días a la misma hora (martes y jueves a la vez), tipo, cupo (arranca en 4) y los alumnos. Avisa si ya hay una clase a esa hora y no guarda nada.
- **Anotar a alguien** (abrir la clase): escribe el nombre o lo elige, y dice hasta cuándo: sin fecha de fin, hasta fin de mes o solo ese día. Si la clase está completa, no deja anotar y avisa que suba el cupo.
- **Quitar a alguien:** sale desde ese día; su historial queda.
- **Suspender** una fecha puntual, o **terminar** la clase desde un día (se conserva todo lo anterior).

## Código
`src/pages/panel.astro` (página y estilos) · `src/scripts/panel/modelo.ts` (tipos y lógica pura) · `store.ts` (Supabase o demo; usa `src/scripts/auth.ts`) · `app.ts` (interfaz). Reglas de negocio (precio, cupo inicial, cobro de faltas) en `panel` de `src/data/academia.ts`. Prueba: `npm run test:panel` (con `npm run preview` corriendo).

## Modo demo vs. modo con login
- **Sin claves de Supabase** → modo demo: los datos se guardan solo en ese navegador. Hay un botón **"Cargar datos de ejemplo"**. Para probarlo en local con el `.env` real: `PUBLIC_SUPABASE_URL= PUBLIC_SUPABASE_ANON_KEY= npm run build`.
- **Con claves** (como está hoy en producción) → Nacho entra con email y contraseña y ve lo mismo en todos sus dispositivos. Solo entra una cuenta con **rol `nacho`**: las cuentas de alumnos ven "Este panel es de Nacho". La base lo refuerza con Row Level Security (cada tabla exige ser el dueño **y** tener rol `nacho`), así que aunque alguien llame a la API directo no ve nada.

## Cuentas y roles (Supabase)
- Proyecto `academia-nr` (ref `yifcvcijwiafahrjtqbs`, São Paulo), organización "Academia NR" (plan gratuito).
- **Alta abierta:** cualquiera se registra en `/cuenta/` con mail y contraseña, con confirmación por mail. Todo usuario nuevo es `alumno` (tabla `perfiles`, trigger `crear_perfil`). Nadie puede cambiarse el rol desde la web: `perfiles` no tiene permisos de escritura para `anon` ni `authenticated`.
- **Rol `nacho`:** solo se asigna creando el usuario con la API de administración y `app_metadata: { "rol": "nacho" }` (un alumno no puede escribir `app_metadata`). Ver `supabase/migrations/20261113000200_rol_desde_app_metadata.sql`.
- **Cuaderno por usuario:** tablas `cuaderno_entradas` y `cuaderno_ficha` con RLS por dueño. Sin sesión el Cuaderno sigue guardando en el navegador.
- **Menú:** "Entrar" / "Mi cuenta" para todos y "Panel" solo si la cuenta es de Nacho (es una pista visual guardada en `localStorage`; el acceso real lo decide la base). `/panel/` y `/cuenta/` siguen en `noindex` y fuera del sitemap: son privadas.

## Cómo está conectado (todo por CLI, ya hecho)
1. Proyecto y organización creados con `supabase orgs create` / `supabase projects create`, vinculado con `supabase link`.
2. Esquema en `supabase/migrations/` (se aplica con `supabase db push --remote`). **Ya no existe `schema.sql`**: las migraciones son la fuente de verdad.
3. Auth en `supabase/config.toml` (Site URL, Redirect URLs de GitHub Pages y `localhost:4321`, alta abierta, confirmación por mail, contraseña de 8+): `supabase config push`.
4. Variables del repo `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (públicas por diseño, protege el RLS) cargadas con `gh variable set`. En local van en `01 WEB/.env` (ignorado por git).
5. **Nunca** usar ni commitear la `service_role` ni la contraseña de la base. Los tests que la necesitan la piden a la CLI en el momento (`tests/real-db.mjs`).
6. Cambiar la clave temporal de Nacho la primera vez que entre (en `/cuenta/` → "Cambiar contraseña").

## Pruebas
- `npm run test:panel` → modo demo (compilar con claves vacías).
- Contra la base real: `PANEL_REAL=1 LIMPIAR_PANEL=si NACHO_EMAIL=… npm run test:panel` (borra los datos del panel al empezar y al terminar: solo mientras la base sea de prueba).
- `NACHO_EMAIL=… node tests/cuenta.mjs` → cuentas, roles, reglas de acceso y Cuaderno por usuario (crea y borra un alumno de prueba).

## Pendiente: mails de confirmación
El envío de mails que trae Supabase por defecto **solo llega a miembros del equipo del proyecto** y tiene un tope muy bajo por hora. Para que cualquier alumno reciba el mail de confirmación y el de recuperar contraseña hay que configurar un **SMTP propio** (Resend, Brevo, Gmail con contraseña de aplicación…) en Supabase → Authentication → SMTP Settings. Hasta entonces, los alumnos que no sean del equipo ven un aviso en `/cuenta/`. Nota: el plan gratis pausa el proyecto tras 7 días sin uso.
