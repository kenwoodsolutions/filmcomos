-- FilmComOS: bring the three abuse-defense SECURITY DEFINER functions in line
-- with the KSG SECURITY DEFINER Grant Standard.
--
-- Postgres grants EXECUTE to PUBLIC on every newly created function and
-- Supabase's `anon` inherits PUBLIC, so these were left open by default rather
-- than by decision. Revoking from `anon` alone would be a no-op; the revoke has
-- to name `public`.
--
-- State before this migration, read from production:
--
--   sec_is_blocked    anon=true   authenticated=true    <- open
--   sec_check_rate    anon=false  authenticated=false   <- already closed
--   sec_log_abuse     anon=false  authenticated=false   <- already closed
--
-- The last two were already closed in the database but no migration recorded
-- it, so the repo could not prove it. Stating all three makes the intent
-- durable and lets FilmComOS adopt the guard with a CLEAN baseline -- no debt
-- ledger at all -- rather than carrying three entries forward.
--
-- Verified safe before applying:
--   * no RLS policy references any of the three (checked pg_policy);
--   * sec_is_blocked's only caller is sec_guard_public_insert, which is itself
--     SECURITY DEFINER and therefore executes its body as the function owner --
--     the EXECUTE check does not fall to anon;
--   * no direct call anywhere in the application outside supabase/migrations.
--
-- These are internal abuse-defense primitives. sec_is_blocked in particular let
-- an anonymous caller probe whether an arbitrary identifier is on the IP
-- blocklist, which is an information leak with no legitimate client use.
--
-- Verified after applying: all three anon=false, authenticated=false,
-- owner unaffected.

revoke execute on function public.sec_is_blocked(text)
  from public, anon, authenticated;

revoke execute on function public.sec_check_rate(text, text, integer, integer)
  from public, anon, authenticated;

revoke execute on function public.sec_log_abuse(text, text, text, integer, jsonb, text)
  from public, anon, authenticated;
