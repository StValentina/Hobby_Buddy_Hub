-- ============================================================================
-- 016_fix_events_rls_for_own_records.sql
--
-- Fixes RLS for events so authenticated users can manage their own events.
-- This removes role-only gate from event creation and relies on ownership.
-- ============================================================================

-- Ensure authenticated users have table privileges for write operations.
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- Replace insert policy: allow creating event only for own auth user.
DROP POLICY IF EXISTS "events_insert_host_admin" ON public.events;
CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- Replace update policy: allow editing own events or admin.
DROP POLICY IF EXISTS "events_update_host_admin" ON public.events;
CREATE POLICY "events_update_own_or_admin" ON public.events
  FOR UPDATE
  USING (
    auth.uid() = host_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = host_id
    OR public.is_admin()
  );

-- Replace delete policy: allow deleting own events or admin.
DROP POLICY IF EXISTS "events_delete_host_admin" ON public.events;
CREATE POLICY "events_delete_own_or_admin" ON public.events
  FOR DELETE
  USING (
    auth.uid() = host_id
    OR public.is_admin()
  );

COMMENT ON POLICY "events_insert_own" ON public.events IS 'Authenticated users can create events only where host_id = auth.uid().';
COMMENT ON POLICY "events_update_own_or_admin" ON public.events IS 'Users can update own events; admins can update all.';
COMMENT ON POLICY "events_delete_own_or_admin" ON public.events IS 'Users can delete own events; admins can delete all.';
