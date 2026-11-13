-- Panel de Nacho: alumnos, clases, inscripciones, asistencia y pagos. Pegar entero en Supabase → SQL Editor → Run.
-- Seguridad: Row Level Security. Cada fila pertenece a un usuario (owner) y solo ese usuario la ve y la edita.
-- (Se puede volver a correr sin problema. Si antes se corrió una versión vieja con la tabla `turnos`, ya no se usa.)

create table if not exists public.alumnos (
  id        uuid primary key default gen_random_uuid(),
  owner     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre    text not null check (length(trim(nombre)) > 0),
  telefono  text not null default '',
  nivel     text not null default '',
  notas     text not null default '',
  activo    boolean not null default true,
  creado    timestamptz not null default now()
);

-- Clase semanal (dia_semana 1=lunes … 7=domingo, vigente entre desde y hasta) o clase única de un solo día (fecha).
create table if not exists public.clases (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dia_semana  smallint check (dia_semana between 1 and 7),
  hora        smallint not null check (hora between 0 and 23),
  fecha       date,
  desde       date,
  hasta       date,
  tipo        text not null default '',
  cupo        smallint not null default 4 check (cupo >= 1),
  creado      timestamptz not null default now(),
  constraint clase_semanal_o_unica check (
    (fecha is not null and dia_semana is null)
    or (fecha is null and dia_semana is not null and desde is not null)
  )
);

-- Un alumno anotado en una clase, con su propio desde y hasta.
create table if not exists public.inscripciones (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  clase_id   uuid not null references public.clases (id) on delete cascade,
  alumno_id  uuid not null references public.alumnos (id) on delete cascade,
  desde      date not null,
  hasta      date,
  creado     timestamptz not null default now()
);

-- Una clase suspendida en una fecha puntual.
create table if not exists public.suspensiones (
  id        uuid primary key default gen_random_uuid(),
  owner     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  clase_id  uuid not null references public.clases (id) on delete cascade,
  fecha     date not null,
  motivo    text not null default '',
  creado    timestamptz not null default now(),
  unique (clase_id, fecha)
);

-- Asistencia de un alumno a una clase en una fecha. `precio` es lo que se cobró (queda guardado aunque cambie el precio).
create table if not exists public.asistencias (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  clase_id   uuid not null references public.clases (id) on delete cascade,
  fecha      date not null,
  alumno_id  uuid not null references public.alumnos (id) on delete cascade,
  estado     text not null default 'anotado' check (estado in ('anotado', 'vino', 'falto', 'aviso')),
  precio     integer not null default 0 check (precio >= 0),
  creado     timestamptz not null default now(),
  unique (clase_id, fecha, alumno_id)
);

create table if not exists public.pagos (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  alumno_id  uuid not null references public.alumnos (id) on delete cascade,
  fecha      date not null default current_date,
  monto      integer not null check (monto > 0),
  nota       text not null default '',
  creado     timestamptz not null default now()
);

create index if not exists clases_owner on public.clases (owner);
create index if not exists inscripciones_owner_clase on public.inscripciones (owner, clase_id);
create index if not exists asistencias_owner_fecha on public.asistencias (owner, fecha);
create index if not exists asistencias_alumno on public.asistencias (alumno_id);
create index if not exists pagos_alumno on public.pagos (alumno_id);

-- Seguridad: cada tabla solo la ve y la edita su dueño.
do $$
declare t text;
begin
  foreach t in array array['alumnos', 'clases', 'inscripciones', 'suspensiones', 'asistencias', 'pagos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%1$s: el dueño" on public.%1$I', t);
    execute format('create policy "%1$s: el dueño" on public.%1$I for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid())', t);
  end loop;
end $$;
