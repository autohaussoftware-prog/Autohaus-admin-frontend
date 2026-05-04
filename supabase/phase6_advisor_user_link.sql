-- Phase 6: link advisors to auth users + role as text

-- Convert advisor role column from enum to text (if not already done)
ALTER TABLE advisors ALTER COLUMN role TYPE text;

-- Add user_id to link an advisor to their login account
ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add gerente to user_role enum (if not already done)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gerente';
