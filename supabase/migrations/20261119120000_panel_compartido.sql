-- Panel compartido: todas las cuentas con rol 'nacho' (Nacho y la cuenta de administración) ven y editan
-- la MISMA agenda, alumnos, asistencia y cobros. Un alumno (rol 'alumno') no ve nada de esto.
-- `owner` sigue guardando quién creó cada fila, pero ya no limita quién la ve.
do $$
declare t text;
begin
  foreach t in array array['alumnos', 'clases', 'inscripciones', 'suspensiones', 'asistencias', 'pagos'] loop
    execute format('drop policy if exists "%1$s: el dueño" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: rol nacho" on public.%1$I', t);
    execute format('create policy "%1$s: rol nacho" on public.%1$I for all to authenticated using (public.es_nacho()) with check (public.es_nacho())', t);
  end loop;
end $$;
