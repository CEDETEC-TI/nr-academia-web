-- GoTrue guarda app_metadata justo después de insertar el usuario, así que el rol 'nacho' llega en un UPDATE.
-- app_metadata solo lo puede escribir la API de administración (service_role), nunca un alumno desde la web.
create or replace function public.sincronizar_rol()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_app_meta_data ->> 'rol' = 'nacho' then
    insert into public.perfiles (user_id, rol) values (new.id, 'nacho')
    on conflict (user_id) do update set rol = 'nacho';
  end if;
  return new;
end $$;
revoke all on function public.sincronizar_rol() from public, anon, authenticated;
drop trigger if exists sincronizar_rol on auth.users;
create trigger sincronizar_rol after update of raw_app_meta_data on auth.users for each row execute function public.sincronizar_rol();
