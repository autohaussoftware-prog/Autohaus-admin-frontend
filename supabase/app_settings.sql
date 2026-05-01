-- Tabla de configuración editable del sistema
create table if not exists public.app_settings (
  key        text primary key,
  value      text not null,
  label      text not null,
  group_name text not null,
  unit       text default '',       -- '%', '$', 'días', etc.
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;

-- Solo usuarios internos pueden leer
create policy "read settings" on public.app_settings
  for select using (is_internal_user());

-- Solo owner y admin pueden editar
create policy "write settings" on public.app_settings
  for update using (current_profile_role() in ('owner', 'admin'));

-- Valores iniciales
insert into public.app_settings (key, value, label, group_name, unit) values
  ('commission_captador',   '20',   'Comisión captador',         'Comisiones',   '%'),
  ('commission_vendedor',   '20',   'Comisión vendedor',         'Comisiones',   '%'),
  ('commission_credito',    '33',   'Comisión crédito',          'Comisiones',   '%'),
  ('margin_min',            '3',    'Margen mínimo esperado',    'Rentabilidad', '%'),
  ('cash_alert_threshold',  '30000000', 'Alerta movimiento grande', 'Efectivo',  '$')
on conflict (key) do nothing;
