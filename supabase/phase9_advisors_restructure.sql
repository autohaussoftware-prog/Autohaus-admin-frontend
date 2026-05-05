-- Phase 9: Restructure advisors-users relationship
-- Advisors must be linked to an existing user (profiles), one-to-one.
-- WARNING: orphaned advisors (no user_id) will be deleted. Link them first if needed.

-- 1. Add tipo column
ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'interno';

UPDATE advisors SET tipo = 'interno' WHERE tipo IS NULL;

ALTER TABLE advisors ALTER COLUMN tipo SET NOT NULL;

ALTER TABLE advisors DROP CONSTRAINT IF EXISTS advisors_tipo_check;
ALTER TABLE advisors ADD CONSTRAINT advisors_tipo_check
  CHECK (tipo IN ('interno', 'externo'));

-- 2. Delete orphaned advisors (no linked user)
DELETE FROM advisors WHERE user_id IS NULL;

-- 3. Make user_id NOT NULL and reference profiles instead of auth.users
ALTER TABLE advisors ALTER COLUMN user_id SET NOT NULL;

-- 4. One advisor per user
ALTER TABLE advisors DROP CONSTRAINT IF EXISTS advisors_user_id_unique;
ALTER TABLE advisors ADD CONSTRAINT advisors_user_id_unique UNIQUE (user_id);
