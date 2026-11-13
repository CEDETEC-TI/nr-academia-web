-- Roles (nacho / alumno), el panel solo para Nacho y el Cuaderno por usuario.

-- ---------- Perfiles y roles ----------
create table if not exists public.perfiles (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  rol      text not null default 'alumno' check (rol in ('nacho', 'alumno')),
  creado   timestamptz not null default now()
);
alter table public.perfiles enable row level security;
drop policy if exists "perfiles: cada uno ve el suyo" on public.perfiles;
create policy "perfiles: cada uno ve el suyo" on public.perfiles for select to authenticated using (user_id = auth.uid());
-- Nadie puede crear, cambiar ni borrar perfiles desde la web: el rol solo lo asigna el trigger de abajo.
revoke insert, update, delete on public.perfiles from anon, authenticated;
revoke all on public.perfiles from anon;

-- Todo usuario nuevo es 'alumno'. Solo es 'nacho' si se lo creó con la API de administración (app_metadata.rol = 'nacho'),
-- algo que un alumno no puede hacer desde la web (en el registro solo controla `user_metadata`).
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (user_id, rol)
  values (new.id, case when new.raw_app_meta_data ->> 'rol' = 'nacho' then 'nacho' else 'alumno' end)
  on conflict (user_id) do nothing;
  return new;
end $$;
revoke all on function public.crear_perfil() from public, anon, authenticated;
drop trigger if exists crear_perfil on auth.users;
create trigger crear_perfil after insert on auth.users for each row execute function public.crear_perfil();

create or replace function public.es_nacho()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles where user_id = auth.uid() and rol = 'nacho')
$$;
revoke all on function public.es_nacho() from public, anon;
grant execute on function public.es_nacho() to authenticated;

-- ---------- Panel: solo el dueño y solo con rol 'nacho' ----------
do $$
declare t text;
begin
  foreach t in array array['alumnos', 'clases', 'inscripciones', 'suspensiones', 'asistencias', 'pagos'] loop
    execute format('drop policy if exists "%1$s: el dueño" on public.%1$I', t);
    execute format('create policy "%1$s: el dueño" on public.%1$I for all to authenticated using (owner = auth.uid() and public.es_nacho()) with check (owner = auth.uid() and public.es_nacho())', t);
  end loop;
end $$;

-- ---------- Cuaderno de Pádel: una fila por entrada, de cada usuario ----------
create table if not exists public.cuaderno_entradas (
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  coleccion  text not null check (coleccion in ('partidos', 'torneos', 'entrenos', 'fisico', 'mental')),
  id         text not null check (length(id) between 1 and 64),
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  creado     timestamptz not null default now(),
  primary key (owner, coleccion, id)
);
create table if not exists public.cuaderno_ficha (
  owner       uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb check (pg_column_size(data) < 50000),
  actualizado timestamptz not null default now()
);
do $$
declare t text;
begin
  foreach t in array array['cuaderno_entradas', 'cuaderno_ficha'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%1$s: el dueño" on public.%1$I', t);
    execute format('create policy "%1$s: el dueño" on public.%1$I for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid())', t);
  end loop;
end $$;
revoke all on public.cuaderno_entradas, public.cuaderno_ficha, public.alumnos, public.clases, public.inscripciones, public.suspensiones, public.asistencias, public.pagos from anon;
