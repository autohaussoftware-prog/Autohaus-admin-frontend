-- ============================================================
-- FASE 2: TABLAS OPERATIVAS CRÍTICAS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ---- 1. COSTOS DETALLADOS POR VEHÍCULO -------------------------
create table if not exists public.vehicle_costs (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid references public.vehicles(id) on delete cascade not null,
  category      text not null,        -- Mecánica, Lavado, Pintura, Trámites, Publicidad, Parqueadero, Transporte, Otro
  description   text not null,
  amount        bigint not null default 0,
  date          date not null default current_date,
  provider      text,
  paid          boolean not null default true,
  created_by    text default 'Sistema',
  created_at    timestamptz not null default now()
);

create index if not exists vehicle_costs_vehicle_id_idx on public.vehicle_costs(vehicle_id);
alter table public.vehicle_costs enable row level security;
create policy "read vehicle_costs" on public.vehicle_costs for select using (is_internal_user());
create policy "write vehicle_costs" on public.vehicle_costs for insert with check (is_internal_user());
create policy "update vehicle_costs" on public.vehicle_costs for update using (is_internal_user());
create policy "delete vehicle_costs" on public.vehicle_costs for delete using (current_profile_role() in ('owner','partner','admin'));

-- ---- 2. PAGOS ADICIONALES POR VENTA ----------------------------
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid references public.sales(id) on delete cascade not null,
  amount        bigint not null,
  date          date not null default current_date,
  channel       text not null default 'Banco',   -- Banco | Efectivo ubicación 1 | Efectivo ubicación 2
  reference     text,
  notes         text,
  registered_by text default 'Sistema',
  created_at    timestamptz not null default now()
);

create index if not exists payments_sale_id_idx on public.payments(sale_id);
alter table public.payments enable row level security;
create policy "read payments" on public.payments for select using (is_internal_user());
create policy "write payments" on public.payments for insert with check (is_internal_user());

-- ---- 3. TRASPASO / PROCESO LEGAL POST-VENTA --------------------
create table if not exists public.transfer_processes (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid references public.sales(id) on delete cascade not null,
  vehicle_id    uuid references public.vehicles(id) on delete cascade not null,
  status        text not null default 'pendiente',
  -- pendiente | iniciado | radicado | observado | aprobado | finalizado | cancelado
  initiated_at  date,
  filed_at      date,
  observation   text,
  approved_at   date,
  completed_at  date,
  responsible   text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.transfer_processes enable row level security;
create policy "read transfers" on public.transfer_processes for select using (is_internal_user());
create policy "write transfers" on public.transfer_processes for insert with check (is_internal_user());
create policy "update transfers" on public.transfer_processes for update using (is_internal_user());

-- ---- 4. COLUMNS: separación con vencimiento + entry_type -------
-- Agregar campos faltantes a tablas existentes
alter table public.sales
  add column if not exists expiry_date date,
  add column if not exists conditions text,
  add column if not exists refundable boolean default true,
  add column if not exists transfer_status text default 'pendiente',
  add column if not exists delivered_at timestamptz,
  add column if not exists delivery_notes text;

alter table public.vehicles
  add column if not exists entry_type text default 'Compra',
  -- Compra | Consignación | Permuta | Propio | Socio | Otro
  add column if not exists has_lien boolean default false,
  add column if not exists has_embargo boolean default false,
  add column if not exists vin text;

-- ---- 5. AUDITORÍA BÁSICA DE CAMBIOS ----------------------------
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  record_id     uuid not null,
  action        text not null,  -- UPDATE | DELETE | INSERT
  field_changed text,
  old_value     text,
  new_value     text,
  user_name     text,
  user_id       uuid,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_record_idx on public.audit_logs(table_name, record_id);
alter table public.audit_logs enable row level security;
create policy "read audit_logs" on public.audit_logs for select using (current_profile_role() in ('owner','partner','admin'));
create policy "insert audit_logs" on public.audit_logs for insert with check (is_internal_user());
