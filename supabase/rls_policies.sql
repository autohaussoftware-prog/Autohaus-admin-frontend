-- Autohaus Admin — RLS inicial.
-- Ejecutar solo después de crear al primer usuario en Supabase Auth e insertar
-- su registro en profiles con role 'owner' o 'admin'.

alter table profiles enable row level security;
alter table advisors enable row level security;
alter table locations enable row level security;
alter table vehicles enable row level security;
alter table vehicle_documents enable row level security;
alter table ai_extractions enable row level security;
alter table vehicle_movements enable row level security;
alter table finance_categories enable row level security;
alter table finance_movements enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table commissions enable row level security;
alter table alerts enable row level security;

create or replace function current_profile_role()
returns user_role as $$
  select role from profiles where id = auth.uid() and active = true;
$$ language sql stable security definer;

create or replace function is_internal_user()
returns boolean as $$
  select exists(select 1 from profiles where id = auth.uid() and active = true);
$$ language sql stable security definer;

create or replace function can_write_admin_data()
returns boolean as $$
  select current_profile_role() in ('owner', 'partner', 'admin');
$$ language sql stable security definer;

create policy "read profiles" on profiles for select using (is_internal_user());
create policy "read advisors" on advisors for select using (is_internal_user());
create policy "read locations" on locations for select using (is_internal_user());
create policy "read vehicles" on vehicles for select using (is_internal_user());
create policy "read vehicle documents" on vehicle_documents for select using (is_internal_user());
create policy "read ai extractions" on ai_extractions for select using (is_internal_user());
create policy "read vehicle movements" on vehicle_movements for select using (is_internal_user());
create policy "read finance categories" on finance_categories for select using (is_internal_user());
create policy "read finance movements" on finance_movements for select using (is_internal_user());
create policy "read customers" on customers for select using (is_internal_user());
create policy "read sales" on sales for select using (is_internal_user());
create policy "read commissions" on commissions for select using (is_internal_user());
create policy "read alerts" on alerts for select using (is_internal_user());

create policy "write profiles" on profiles for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write advisors" on advisors for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write locations" on locations for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write vehicles" on vehicles for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write vehicle documents" on vehicle_documents for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write ai extractions" on ai_extractions for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write vehicle movements" on vehicle_movements for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write finance categories" on finance_categories for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write finance movements" on finance_movements for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write customers" on customers for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write sales" on sales for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write commissions" on commissions for all using (can_write_admin_data()) with check (can_write_admin_data());
create policy "write alerts" on alerts for all using (can_write_admin_data()) with check (can_write_admin_data());

