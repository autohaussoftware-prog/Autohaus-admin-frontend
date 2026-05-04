-- Phase 5: lien_value on vehicles, created_by_user_id on sales, tramitador on transfer_processes

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS lien_value NUMERIC;

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE transfer_processes
  ADD COLUMN IF NOT EXISTS tramitador TEXT DEFAULT 'Titi';
