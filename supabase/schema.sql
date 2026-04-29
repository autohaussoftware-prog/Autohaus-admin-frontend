-- Autohaus Admin — Supabase/PostgreSQL schema inicial.
-- Ejecutar primero en Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ENUMS
do $$ begin
  create type user_role as enum ('owner', 'partner', 'admin', 'advisor', 'accounting', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type advisor_role as enum ('Captador', 'Vendedor', 'Crédito', 'Aliado', 'Operativo', 'Administrativo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_status as enum ('Disponible', 'Publicado', 'Separado', 'Vendido', 'Entregado', 'En comisión', 'En reparación', 'En trámite', 'No publicado', 'Papeles pendientes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type owner_type as enum ('Propio', 'Comisión');
exception when duplicate_object then null; end $$;

do $$ begin
  create type finance_type as enum ('Ingreso', 'Egreso');
exception when duplicate_object then null; end $$;

do $$ begin
  create type finance_channel as enum ('Banco', 'Efectivo ubicación 1', 'Efectivo ubicación 2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_type as enum ('tarjeta_propiedad', 'soat', 'tecnomecanica', 'peritaje', 'foto_vehiculo', 'soporte_financiero', 'contrato', 'otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pendiente', 'aprobado', 'corregido', 'rechazado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_priority as enum ('Alta', 'Media', 'Baja');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_status as enum ('abierta', 'en_revision', 'resuelta', 'descartada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type commission_role as enum ('Captador', 'Vendedor', 'Crédito');
exception when duplicate_object then null; end $$;

do $$ begin
  create type commission_status as enum ('Pendiente', 'Pagada');
exception when duplicate_object then null; end $$;

-- CORE
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advisors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  role advisor_role not null default 'Aliado',
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text not null unique,
  brand text not null,
  line text not null,
  version text,
  year integer,
  mileage integer,
  color text,
  motor text,
  engine_number text,
  chassis_number text,
  vin text,
  displacement text,
  transmission text,
  fuel text,
  traction text,
  vehicle_class text,
  service_type text,
  city_registration text,
  registration_date date,
  transit_authority text,
  legal_status text,
  status vehicle_status not null default 'Disponible',
  location_id uuid references locations(id),
  owner_type owner_type not null default 'Propio',
  buy_price numeric(14,2) not null default 0,
  target_price numeric(14,2) not null default 0,
  min_price numeric(14,2) not null default 0,
  estimated_cost numeric(14,2) not null default 0,
  real_cost numeric(14,2) not null default 0,
  advisor_buyer_id uuid references advisors(id),
  advisor_seller_id uuid references advisors(id),
  soat_policy_number text,
  soat_insurer text,
  soat_due date,
  rtm_certificate_number text,
  rtm_entity text,
  techno_due date,
  inspection_summary text,
  ai_review_status review_status default 'pendiente',
  published boolean not null default false,
  separated boolean not null default false,
  alert_summary text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  document_type document_type not null,
  file_url text not null,
  file_name text,
  mime_type text,
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz not null default now(),
  status review_status not null default 'pendiente',
  notes text
);

create table if not exists ai_extractions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  document_id uuid references vehicle_documents(id) on delete cascade,
  provider text,
  model text,
  extracted_fields jsonb not null default '{}'::jsonb,
  field_confidence jsonb not null default '{}'::jsonb,
  raw_text text,
  raw_response jsonb,
  review_status review_status not null default 'pendiente',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists vehicle_movements (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  new_status vehicle_status,
  new_location_id uuid references locations(id),
  user_id uuid references profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- FINANCE
create table if not exists finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  affects_vehicle_cost boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists finance_movements (
  id uuid primary key default gen_random_uuid(),
  type finance_type not null,
  channel finance_channel not null,
  category_id uuid references finance_categories(id),
  concept text not null,
  amount numeric(14,2) not null check (amount >= 0),
  date date not null default current_date,
  vehicle_id uuid references vehicles(id) on delete set null,
  responsible_id uuid references profiles(id),
  responsible_name text,
  support_file_url text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  document_number text,
  phone text,
  email text,
  customer_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id),
  customer_id uuid references customers(id),
  seller_id uuid references advisors(id),
  agreed_price numeric(14,2) not null default 0,
  initial_payment numeric(14,2) not null default 0,
  pending_balance numeric(14,2) not null default 0,
  payment_status text not null default 'pendiente',
  document_status text not null default 'pendiente',
  delivery_status text not null default 'pendiente',
  sale_status text not null default 'separacion',
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references advisors(id),
  role commission_role not null,
  vehicle_id uuid references vehicles(id),
  sale_id uuid references sales(id),
  base_amount numeric(14,2) not null default 0,
  percentage numeric(6,3),
  amount numeric(14,2) not null default 0,
  status commission_status not null default 'Pendiente',
  month text,
  paid_finance_movement_id uuid references finance_movements(id),
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  title text not null,
  description text,
  priority alert_priority not null default 'Media',
  status alert_status not null default 'abierta',
  vehicle_id uuid references vehicles(id) on delete cascade,
  finance_movement_id uuid references finance_movements(id) on delete cascade,
  document_id uuid references vehicle_documents(id) on delete cascade,
  extraction_id uuid references ai_extractions(id) on delete cascade,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references profiles(id)
);

-- INDEXES
create index if not exists idx_advisors_role on advisors(role);
create index if not exists idx_vehicles_status on vehicles(status);
create index if not exists idx_vehicles_plate on vehicles(plate);
create index if not exists idx_vehicles_created_at on vehicles(created_at desc);
create index if not exists idx_vehicle_movements_vehicle_id on vehicle_movements(vehicle_id);
create index if not exists idx_finance_movements_vehicle_id on finance_movements(vehicle_id);
create index if not exists idx_finance_movements_date on finance_movements(date desc);
create index if not exists idx_alerts_status_priority on alerts(status, priority);
create index if not exists idx_sales_vehicle_id on sales(vehicle_id);

-- UPDATED_AT helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at before update on profiles for each row execute function set_updated_at();

drop trigger if exists set_advisors_updated_at on advisors;
create trigger set_advisors_updated_at before update on advisors for each row execute function set_updated_at();

drop trigger if exists set_vehicles_updated_at on vehicles;
create trigger set_vehicles_updated_at before update on vehicles for each row execute function set_updated_at();

drop trigger if exists set_customers_updated_at on customers;
create trigger set_customers_updated_at before update on customers for each row execute function set_updated_at();

