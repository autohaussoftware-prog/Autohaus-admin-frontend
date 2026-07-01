-- Phase 15: Granular RLS policies
-- Two goals:
--   1. Read isolation: exclude inversionista/viewer from sensitive financial tables.
--   2. Granular write: split commissions and finance_movements by operation type.
-- Run AFTER rls_policies.sql and phase8_advisor_rls.sql.

-- ─── Helper: users allowed to read financial data ─────────────────────────────

CREATE OR REPLACE FUNCTION is_finance_user()
RETURNS boolean AS $$
  SELECT current_profile_role() IN ('owner', 'partner', 'admin', 'gerente', 'accounting')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── 1. Restrict READ on sensitive financial tables ───────────────────────────
-- inversionista and viewer can authenticate but must not read finance data.

-- finance_movements
DROP POLICY IF EXISTS "read finance movements" ON finance_movements;
CREATE POLICY "read finance movements" ON finance_movements
  FOR SELECT USING (is_finance_user());

-- commissions
DROP POLICY IF EXISTS "read commissions" ON commissions;
CREATE POLICY "read commissions" ON commissions
  FOR SELECT USING (is_finance_user());

-- customers (contact info is sensitive; advisors need read for their own sales)
DROP POLICY IF EXISTS "read customers" ON customers;
CREATE POLICY "read customers" ON customers
  FOR SELECT USING (
    is_internal_user() AND current_profile_role() NOT IN ('inversionista', 'viewer')
  );

-- sales (advisors need read; inversionista/viewer do not)
DROP POLICY IF EXISTS "read sales" ON sales;
CREATE POLICY "read sales" ON sales
  FOR SELECT USING (
    is_internal_user() AND current_profile_role() NOT IN ('inversionista', 'viewer')
  );

-- ─── 2. Commissions: granular write policies ──────────────────────────────────
-- Original "write commissions" policy allows everything for can_write_admin_data().
-- Replace with split INSERT / UPDATE / DELETE.

DROP POLICY IF EXISTS "write commissions" ON commissions;

-- Insert: roles that can create commissions (owner, partner, admin, gerente)
CREATE POLICY "insert commissions" ON commissions
  FOR INSERT WITH CHECK (
    current_profile_role() IN ('owner', 'partner', 'admin', 'gerente')
  );

-- Update: roles that can edit or mark as paid (owner, partner, admin, accounting)
CREATE POLICY "update commissions" ON commissions
  FOR UPDATE USING (
    current_profile_role() IN ('owner', 'partner', 'admin', 'gerente', 'accounting')
  );

-- Delete: only top roles can remove commissions
CREATE POLICY "delete commissions" ON commissions
  FOR DELETE USING (
    current_profile_role() IN ('owner', 'partner', 'admin')
  );

-- ─── 3. Finance movements: granular write policies ────────────────────────────

DROP POLICY IF EXISTS "write finance movements" ON finance_movements;

-- Insert: finance staff can record movements
CREATE POLICY "insert finance movements" ON finance_movements
  FOR INSERT WITH CHECK (is_finance_user());

-- Update: finance staff can edit (soft delete sets deleted_at)
CREATE POLICY "update finance movements" ON finance_movements
  FOR UPDATE USING (is_finance_user());

-- Hard delete: restricted to management (soft delete is preferred)
CREATE POLICY "delete finance movements" ON finance_movements
  FOR DELETE USING (
    current_profile_role() IN ('owner', 'partner', 'admin', 'gerente')
  );

-- ─── 4. Traspasos: enable RLS and add policies ────────────────────────────────

ALTER TABLE traspasos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read traspasos" ON traspasos;
CREATE POLICY "read traspasos" ON traspasos
  FOR SELECT USING (
    is_internal_user() AND current_profile_role() NOT IN ('inversionista', 'viewer')
  );

DROP POLICY IF EXISTS "insert traspasos" ON traspasos;
CREATE POLICY "insert traspasos" ON traspasos
  FOR INSERT WITH CHECK (is_internal_user());

DROP POLICY IF EXISTS "update traspasos" ON traspasos;
CREATE POLICY "update traspasos" ON traspasos
  FOR UPDATE USING (
    is_internal_user() AND current_profile_role() NOT IN ('inversionista', 'viewer')
  );

DROP POLICY IF EXISTS "delete traspasos" ON traspasos;
CREATE POLICY "delete traspasos" ON traspasos
  FOR DELETE USING (
    current_profile_role() IN ('owner', 'partner', 'admin', 'gerente')
  );
