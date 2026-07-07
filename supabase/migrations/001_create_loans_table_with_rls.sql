-- Migración 001 — Tabla de préstamos con Row Level Security
-- Decisión de modelado: interés y total se GUARDAN (no se recalculan),
-- porque son hechos contractuales del momento del préstamo.
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  -- default auth.uid(): el cliente nunca envía user_id, lo pone la BD
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prestatario text not null check (char_length(prestatario) between 1 and 100),
  -- Regla de negocio reforzada en la BD: monto entre $50.000 y $500.000
  principal integer not null check (principal between 50000 and 500000),
  interes integer not null check (interes >= 0),
  total integer not null check (total = principal + interes),
  fecha_prestamo date not null,
  vencimiento date not null,
  hora_limite text,
  pagado boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: sin políticas que lo permitan, NADIE lee ni escribe.
alter table public.loans enable row level security;

create policy "select_own_loans" on public.loans
  for select using (auth.uid() = user_id);

create policy "insert_own_loans" on public.loans
  for insert with check (auth.uid() = user_id);

create policy "update_own_loans" on public.loans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_loans" on public.loans
  for delete using (auth.uid() = user_id);

-- Índice para la consulta más frecuente
create index loans_user_vencimiento_idx on public.loans (user_id, vencimiento);
