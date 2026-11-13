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
`src/pages/panel.astro` (página y estilos) · `src/scripts/panel/modelo.ts` (tipos y lógica pura) · `store.ts` (Supabase o demo) · `app.ts` (interfaz). Reglas de negocio (precio, cupo inicial, cobro de faltas) en `panel` de `src/data/academia.ts`. Prueba: `npm run test:panel` (con `npm run preview` corriendo).

## Modo demo vs. modo con login
- **Sin claves de Supabase** → modo demo: los datos se guardan solo en ese navegador. Hay un botón **"Cargar datos de ejemplo"** para ver cómo queda con alumnos, clases y deudas.
- **Con claves** → Nacho entra con email y contraseña, y ve lo mismo en todos sus dispositivos. Los datos están en la nube con copia de seguridad, y nadie más los puede ver: Row Level Security, cada fila es de su dueño.

## Cómo conectar Supabase (una sola vez, ~10 minutos)
1. Crear una cuenta gratis en https://supabase.com y un proyecto nuevo (región: São Paulo, la más cercana). Guardar la contraseña de la base en un lugar seguro.
2. **SQL Editor → New query**: pegar todo `supabase/schema.sql` y tocar **Run**. Crea las tablas `alumnos`, `clases`, `inscripciones`, `suspensiones`, `asistencias` y `pagos`, cada una con su seguridad. (Si antes se corrió una versión vieja con la tabla `turnos`, ya no se usa: se puede borrar.)
3. **Authentication → Sign In / Providers → Email**: dejar Email activado y **desactivar "Allow new users to sign up"**, para que nadie más pueda crearse una cuenta.
4. **Authentication → Users → Add user → Create new user**: el email de Nacho y una contraseña. Marcar "Auto Confirm User".
5. **Project Settings → API**: copiar la **Project URL** y la **anon public key**. La anon key es pública por diseño: va en la web y la protege el RLS. **Nunca** usar ni pegar la `service_role` key.
6. En GitHub, en el repo `CEDETEC-TI/nr-academia-web`: **Settings → Secrets and variables → Actions → Variables**, crear `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` con esos valores.
7. Para probar en local, crear `01 WEB/.env` (está en `.gitignore`) con:
   ```
   PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
8. Publicar (push a `main`). El panel pide login y Nacho entra con el usuario del paso 4.

Plan gratis de Supabase: alcanza de sobra. Ojo: pausa el proyecto si pasa 7 días sin uso; se reactiva desde el panel de Supabase. **Nota:** el modo con Supabase todavía no se probó contra una base real (solo el modo demo).
