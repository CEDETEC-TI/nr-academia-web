# Panel de Nacho (`/panel/`)

Agenda privada donde Nacho ve, por semana, qué turnos tiene **ocupados** (con quién y qué tipo de clase) y cuáles **libres**, y los carga desde el celu o la compu.

- **Dirección:** `https://cedetec-ti.github.io/nr-academia-web/panel/`. No está en el menú y Google no la indexa (`noindex`).
- **Turnos:** los de `horarios` en `src/data/academia.ts` (lunes a viernes, 8–12 y 14–20, clases de 1 hora → 50 turnos por semana). Si cambian los horarios ahí, el panel se actualiza solo.
- **Ocupar un turno:** se toca un turno libre, se carga el alumno o grupo, el tipo de clase y notas. "Se repite todas las semanas" lo deja fijo.
- **Liberar un turno fijo:** "solo este día" (por ejemplo, si el alumno avisa que falta; se puede deshacer) o "desde este día en adelante".
- **Código:** `src/pages/panel.astro` (página y estilos), `src/scripts/panel/agenda.ts` (lógica pura), `store.ts` (Supabase o demo), `app.ts` (interfaz). Prueba: `npm run test:panel` (con `npm run preview` corriendo).

## Modo demo vs. modo con login
- **Sin claves de Supabase** → modo demo: los turnos se guardan solo en ese navegador. Sirve para probar.
- **Con claves** → Nacho entra con email y contraseña, y ve lo mismo en todos sus dispositivos. Los datos están en la nube con copia de seguridad, y nadie más los puede ver: Row Level Security, cada fila es de su dueño.

## Cómo conectar Supabase (una sola vez, ~10 minutos)
1. Crear una cuenta gratis en https://supabase.com y un proyecto nuevo (región: São Paulo, la más cercana). Guardar la contraseña de la base en un lugar seguro.
2. **SQL Editor → New query**: pegar todo `supabase/schema.sql` y tocar **Run**. Crea la tabla `turnos` con su seguridad.
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

Plan gratis de Supabase: alcanza de sobra para esta agenda. Ojo: pausa el proyecto si pasa 7 días sin uso; se reactiva desde el panel de Supabase.
