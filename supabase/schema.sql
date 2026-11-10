-- Agenda de Nacho: turnos de clases. Pegar entero en Supabase → SQL Editor → Run.
-- Seguridad: Row Level Security. Cada fila pertenece a un usuario (owner) y solo ese usuario la ve y la edita.

create table if not exists public.turnos (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  hora        smallint not null check (hora between 0 and 23),
  -- Turno fijo (se repite cada semana): dia_semana 1=lunes … 7=domingo, vigente entre desde y hasta.
  fijo        boolean not null default false,
  dia_semana  smallint check (dia_semana between 1 and 7),
  desde       date,
  hasta       date,
  -- Turno de un solo día, o excepción ("libre solo esta fecha") sobre un turno fijo.
  fecha       date,
  excepcion   boolean not null default false,
  alumnos     text not null default '',
  tipo        text not null default '',
  notas       text not null default '',
  creado      timestamptz not null default now(),
  constraint turno_fijo_o_fecha check (
    (fijo and dia_semana is not null and desde is not null and fecha is null)
    or (not fijo and fecha is not null and dia_semana is null)
  )
);

create index if not exists turnos_owner_fecha on public.turnos (owner, fecha);
create index if not exists turnos_owner_fijo on public.turnos (owner, fijo);

alter table public.turnos enable row level security;

drop policy if exists "turnos: el dueño lee" on public.turnos;
drop policy if exists "turnos: el dueño crea" on public.turnos;
drop policy if exists "turnos: el dueño edita" on public.turnos;
drop policy if exists "turnos: el dueño borra" on public.turnos;
create policy "turnos: el dueño lee"   on public.turnos for select to authenticated using (owner = auth.uid());
create policy "turnos: el dueño crea"  on public.turnos for insert to authenticated with check (owner = auth.uid());
create policy "turnos: el dueño edita" on public.turnos for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "turnos: el dueño borra" on public.turnos for delete to authenticated using (owner = auth.uid());
