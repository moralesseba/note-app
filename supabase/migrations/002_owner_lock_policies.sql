-- Migración 002 — Candado de dueño (app de un solo usuario)
-- ⚠️ Si montas tu propia instancia: REEMPLAZA el correo por el tuyo.
-- Las políticas exigen ser dueño de la fila Y dueño de la app: aunque
-- alguien cree una cuenta, ve la app vacía y toda escritura le falla.
create or replace function public.is_app_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'moralessebastyan@gmail.com'
$$;

drop policy "select_own_loans" on public.loans;
drop policy "insert_own_loans" on public.loans;
drop policy "update_own_loans" on public.loans;
drop policy "delete_own_loans" on public.loans;

create policy "owner_select" on public.loans
  for select using (auth.uid() = user_id and public.is_app_owner());

create policy "owner_insert" on public.loans
  for insert with check (auth.uid() = user_id and public.is_app_owner());

create policy "owner_update" on public.loans
  for update using (auth.uid() = user_id and public.is_app_owner())
  with check (auth.uid() = user_id and public.is_app_owner());

create policy "owner_delete" on public.loans
  for delete using (auth.uid() = user_id and public.is_app_owner());
