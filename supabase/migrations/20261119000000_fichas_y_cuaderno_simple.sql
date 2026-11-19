-- Ficha técnica del alumno + Cuaderno simplificado.
-- Seguridad: cada alumno ve y edita solo lo suyo; el rol 'nacho' puede LEER todas las fichas y todas las notas (nunca escribirlas).
-- No borra nada: `cuaderno_entradas` y `cuaderno_ficha` (el cuaderno anterior) quedan intactas como archivo.

-- ---------- Fichas (una por usuario) ----------
create table if not exists public.fichas (
  owner          uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nombre         text not null default '' check (length(nombre) <= 120),
  edad           smallint check (edad between 3 and 99),
  nivel          text check (nivel in ('principiante', 'intermedio', 'avanzado')),
  mano           text check (mano in ('derecha', 'zurda')),
  lado           text check (lado in ('derecha', 'reves')), -- lado de la cancha en el que juega
  objetivo       text not null default '' check (length(objetivo) <= 1000),
  golpes         text[] not null default '{}' check (cardinality(golpes) <= 15),
  lesiones       text not null default '' check (length(lesiones) <= 1000),
  disponibilidad text not null default '' check (length(disponibilidad) <= 1000),
  creado         timestamptz not null default now(),
  actualizado    timestamptz not null default now()
);

-- ---------- Cuaderno simplificado: una nota por día de entrenamiento ----------
create table if not exists public.cuaderno_notas (
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id          text not null check (length(id) between 1 and 80),
  fecha       date not null,
  trabaje     text not null default '' check (length(trabaje) <= 2000), -- Qué trabajé hoy
  costo       text not null default '' check (length(costo) <= 2000),   -- Qué me costó
  proxima     text not null default '' check (length(proxima) <= 2000), -- Qué practico para la próxima
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  primary key (owner, id)
);
create index if not exists cuaderno_notas_owner_fecha on public.cuaderno_notas (owner, fecha desc);

-- ---------- RLS ----------
alter table public.fichas enable row level security;
alter table public.cuaderno_notas enable row level security;

-- El dueño ve, crea, edita y borra lo suyo.
drop policy if exists "fichas: el dueño" on public.fichas;
create policy "fichas: el dueño" on public.fichas for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "cuaderno_notas: el dueño" on public.cuaderno_notas;
create policy "cuaderno_notas: el dueño" on public.cuaderno_notas for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- Nacho solo LEE todas (sin policy de escritura para él sobre filas ajenas).
drop policy if exists "fichas: nacho lee" on public.fichas;
create policy "fichas: nacho lee" on public.fichas for select to authenticated using (public.es_nacho());
drop policy if exists "cuaderno_notas: nacho lee" on public.cuaderno_notas;
create policy "cuaderno_notas: nacho lee" on public.cuaderno_notas for select to authenticated using (public.es_nacho());

revoke all on public.fichas, public.cuaderno_notas from anon;

-- ---------- Migración del cuaderno anterior (idempotente: se puede correr de nuevo) ----------
-- Cada registro viejo pasa a una nota con id 'mig-<colección>-<id>'. Lo viejo no se toca ni se borra.
create or replace function pg_temp.fecha_o(d text, alt timestamptz) returns date language plpgsql as $$
begin
  return d::date;
exception when others then
  return alt::date;
end $$;

create or replace function pg_temp.juntar(variadic partes text[]) returns text language sql as $$
  select coalesce(string_agg(p, E'\n'), '') from unnest(partes) as p where p is not null and length(trim(p)) > 0
$$;

insert into public.cuaderno_notas (owner, id, fecha, trabaje, costo, proxima, creado)
select
  e.owner,
  left('mig-' || e.coleccion || '-' || e.id, 80),
  pg_temp.fecha_o(e.data ->> 'fecha', e.creado),
  left(case e.coleccion
    when 'entrenos' then pg_temp.juntar(
      nullif(concat_ws(' · ', nullif(e.data ->> 'foco', ''), nullif(e.data ->> 'tipo', ''), case when nullif(e.data ->> 'minutos', '') is not null then (e.data ->> 'minutos') || ' min' end), ''),
      e.data ->> 'notas')
    when 'partidos' then pg_temp.juntar(
      nullif(concat_ws(' · ', 'Partido', nullif(e.data ->> 'tipo', ''), nullif('vs ' || coalesce(e.data ->> 'rivales', ''), 'vs '), nullif(e.data ->> 'resultado', '')), 'Partido'),
      e.data ->> 'funciono')
    when 'mental' then pg_temp.juntar('Mental', e.data ->> 'situacion', e.data ->> 'hice')
    when 'fisico' then pg_temp.juntar('Físico', e.data ->> 'notas')
    when 'torneos' then pg_temp.juntar(nullif(concat_ws(' · ', 'Torneo', nullif(e.data ->> 'nombre', ''), nullif(e.data ->> 'instancia', '')), 'Torneo'), e.data ->> 'balance')
  end, 2000),
  left(case e.coleccion
    when 'mental' then coalesce(e.data ->> 'senti', '')
    when 'partidos' then coalesce(e.data ->> 'mejorar', '')
    else ''
  end, 2000),
  left(case e.coleccion
    when 'mental' then coalesce(e.data ->> 'proxima', '')
    when 'torneos' then coalesce(e.data ->> 'objetivo', '')
    else ''
  end, 2000),
  e.creado
from public.cuaderno_entradas e
where jsonb_typeof(e.data) = 'object'
on conflict (owner, id) do nothing;
