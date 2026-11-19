-- Mail del alumno en su ficha, para que Nacho distinga dos alumnos con el mismo nombre.
-- Lo completa la base sola (desde la cuenta del dueño de la ficha); el alumno no lo escribe.
alter table public.fichas add column if not exists email text not null default '';

create or replace function public.ficha_con_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select coalesce(u.email, '') into new.email from auth.users u where u.id = new.owner;
  return new;
end $$;
revoke all on function public.ficha_con_email() from public, anon, authenticated;
drop trigger if exists ficha_con_email on public.fichas;
create trigger ficha_con_email before insert or update on public.fichas for each row execute function public.ficha_con_email();

update public.fichas f set email = coalesce(u.email, '') from auth.users u where u.id = f.owner;
