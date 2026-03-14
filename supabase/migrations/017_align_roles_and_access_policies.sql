-- ============================================================================
-- 017_align_roles_and_access_policies.sql
--
-- Aligns role permissions with project rules:
-- 1) Anonymous users can only browse hobbies/events (and supporting lookup data).
-- 2) seeker: browse people/hobbies/events, join hobbies/events, create events.
-- 3) host: seeker capabilities + create hobbies.
-- 4) admin: full administration.
-- ============================================================================

-- Keep anon read focused on browse-only domain.
REVOKE SELECT ON public.user_hobbies FROM anon;
REVOKE SELECT ON public.event_participants FROM anon;

-- Explicit authenticated write grants; RLS still controls row-level access.
GRANT INSERT, UPDATE, DELETE ON public.event_participants TO authenticated;
GRANT INSERT ON public.hobbies TO authenticated;
GRANT UPDATE, DELETE ON public.hobbies TO authenticated;

-- Remove legacy broad public policies that conflict with role model.
DROP POLICY IF EXISTS "user_hobbies_select_public" ON public.user_hobbies;
DROP POLICY IF EXISTS "user_hobbies_read_public" ON public.user_hobbies;
DROP POLICY IF EXISTS "event_participants_read_public" ON public.event_participants;

-- Hobbies: hosts and admins can create; only admins can update/delete.
DROP POLICY IF EXISTS "hobbies_insert_admin" ON public.hobbies;
CREATE POLICY "hobbies_insert_host_admin" ON public.hobbies
  FOR INSERT
  WITH CHECK (public.is_host());

DROP POLICY IF EXISTS "hobbies_update_admin" ON public.hobbies;
CREATE POLICY "hobbies_update_admin" ON public.hobbies
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "hobbies_delete_admin" ON public.hobbies;
CREATE POLICY "hobbies_delete_admin" ON public.hobbies
  FOR DELETE
  USING (public.is_admin());

-- Event participants: allow users to join/leave their own participation; admin can manage all.
DROP POLICY IF EXISTS "event_participants_insert_own" ON public.event_participants;
CREATE POLICY "event_participants_insert_own" ON public.event_participants
  FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "event_participants_update" ON public.event_participants;
CREATE POLICY "event_participants_update" ON public.event_participants
  FOR UPDATE
  USING (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host(event_id, auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host(event_id, auth.uid())
  );

DROP POLICY IF EXISTS "event_participants_delete" ON public.event_participants;
CREATE POLICY "event_participants_delete" ON public.event_participants
  FOR DELETE
  USING (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host(event_id, auth.uid())
  );
