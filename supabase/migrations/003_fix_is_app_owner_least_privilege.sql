-- Migración 003 — Mínimo privilegio (corrección del advisor de Supabase)
-- is_app_owner() no necesita SECURITY DEFINER: no toca tablas, solo lee
-- el JWT del llamante. Regla: nunca dar más permisos de los necesarios.
-- ⚠️ Si montas tu propia instancia: REEMPLAZA el correo por el tuyo.
create or replace function public.is_app_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'moralessebastyan@gmail.com'
$$;

-- No es parte de la API pública: que anon no pueda invocarla como RPC
revoke execute on function public.is_app_owner() from anon;
