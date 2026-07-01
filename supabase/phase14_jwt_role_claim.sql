-- Phase 14: Sync profile role to JWT via app_metadata
-- Eliminates the per-request DB query in proxy.ts for role resolution.
--
-- After running this migration:
-- 1. proxy.ts reads role from user.app_metadata.user_role (JWT claim)
--    instead of querying the profiles table on every request.
-- 2. Role changes in profiles automatically propagate to auth.users
--    via the trigger below.
-- 3. The JWT is refreshed by Supabase on session refresh (~1h), so
--    role changes may take up to 1h to reflect in the middleware.
--    Server Actions always re-query the DB, so security is unaffected.

-- ─── Trigger function ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_profile_role_to_app_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('user_role', NEW.role::text)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- ─── Trigger ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS sync_role_to_jwt ON profiles;

CREATE TRIGGER sync_role_to_jwt
AFTER INSERT OR UPDATE OF role ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_role_to_app_metadata();

-- ─── Backfill existing users ──────────────────────────────────────────────────

UPDATE auth.users u
SET raw_app_meta_data =
  COALESCE(u.raw_app_meta_data, '{}'::jsonb) ||
  jsonb_build_object('user_role', p.role::text)
FROM profiles p
WHERE u.id = p.id;
