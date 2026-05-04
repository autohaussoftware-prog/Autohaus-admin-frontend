-- Phase 8: RLS policies for advisor role access
-- Run this AFTER rls_policies.sql
-- Advisors must be able to INSERT vehicles, sales, and transfer_processes.

-- ── 0. Drop existing policies that may conflict ───────────────────────────────
DROP POLICY IF EXISTS "advisor insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "advisor update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "internal insert vehicle movements" ON vehicle_movements;
DROP POLICY IF EXISTS "internal insert customers" ON customers;
DROP POLICY IF EXISTS "internal update customers" ON customers;
DROP POLICY IF EXISTS "advisor insert sales" ON sales;
DROP POLICY IF EXISTS "advisor update own sales" ON sales;
DROP POLICY IF EXISTS "advisor insert transfers" ON transfer_processes;
DROP POLICY IF EXISTS "advisor update own transfers" ON transfer_processes;

-- ── 1. Update helper functions ────────────────────────────────────────────────

-- Include gerente and accounting in admin write access
CREATE OR REPLACE FUNCTION can_write_admin_data()
RETURNS boolean AS $$
  SELECT current_profile_role() IN ('owner', 'partner', 'admin', 'gerente', 'accounting');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Ensure is_internal_user is up to date
CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 2. VEHICLES ───────────────────────────────────────────────────────────────

-- Any internal user (including advisors) can register a vehicle
CREATE POLICY "advisor insert vehicles" ON vehicles
  FOR INSERT
  WITH CHECK (is_internal_user());

-- Advisors can update vehicles they created; admins update all
CREATE POLICY "advisor update own vehicles" ON vehicles
  FOR UPDATE
  USING (
    is_internal_user() AND (
      can_write_admin_data()
      OR created_by = auth.uid()
      OR created_by_user_id = auth.uid()
    )
  );

-- ── 3. VEHICLE MOVEMENTS ──────────────────────────────────────────────────────
-- createVehicle() logs an entry movement — advisors must be able to insert it

CREATE POLICY "internal insert vehicle movements" ON vehicle_movements
  FOR INSERT
  WITH CHECK (is_internal_user());

-- ── 4. CUSTOMERS ──────────────────────────────────────────────────────────────
-- createSale() may insert or update a customer record

CREATE POLICY "internal insert customers" ON customers
  FOR INSERT
  WITH CHECK (is_internal_user());

CREATE POLICY "internal update customers" ON customers
  FOR UPDATE
  USING (is_internal_user());

-- ── 5. SALES ─────────────────────────────────────────────────────────────────

-- Any internal user can register a sale
CREATE POLICY "advisor insert sales" ON sales
  FOR INSERT
  WITH CHECK (is_internal_user());

-- Advisors update their own sales; admins update all
CREATE POLICY "advisor update own sales" ON sales
  FOR UPDATE
  USING (
    is_internal_user() AND (
      can_write_admin_data()
      OR created_by_user_id = auth.uid()
    )
  );

-- ── 6. TRANSFER PROCESSES ─────────────────────────────────────────────────────

-- Any internal user can register a transfer
CREATE POLICY "advisor insert transfers" ON transfer_processes
  FOR INSERT
  WITH CHECK (is_internal_user());

-- Advisors update transfers; admins update all
CREATE POLICY "advisor update own transfers" ON transfer_processes
  FOR UPDATE
  USING (is_internal_user());
