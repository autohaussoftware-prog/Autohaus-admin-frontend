-- Phase 7: track who registered each vehicle (for contact data visibility)

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Optional index for faster filtering
CREATE INDEX IF NOT EXISTS vehicles_created_by_user_id_idx ON vehicles(created_by_user_id);
