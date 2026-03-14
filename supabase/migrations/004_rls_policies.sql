-- ============================================================================
-- 004_rls_policies.sql
-- 
-- Implements Row-Level Security (RLS) policies for fine-grained access control
-- ============================================================================

-- ============================================================================
-- profiles table RLS
-- ============================================================================

-- Policy: SELECT - Users can view all profiles (public read)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: UPDATE - Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  WITH CHECK (auth.uid() = id);

-- Policy: DELETE - Users can delete only their own profile
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Policy: INSERT - Only system/triggers can create profiles (handled by auth trigger)
CREATE POLICY "profiles_insert_system" ON public.profiles
  FOR INSERT
  WITH CHECK (false);

-- ============================================================================
-- user_roles table RLS
-- ============================================================================

-- Policy: SELECT - Users can read their own role; admins can read all
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_admin()
  );

-- Policy: UPDATE - Only admins can change roles
CREATE POLICY "user_roles_update" ON public.user_roles
  FOR UPDATE
  WITH CHECK (public.is_admin());

-- Policy: DELETE - Only admins can delete roles
CREATE POLICY "user_roles_delete" ON public.user_roles
  FOR DELETE
  USING (public.is_admin());

-- Policy: INSERT - Only admins can assign roles
CREATE POLICY "user_roles_insert" ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================================
-- hobbies table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can browse hobbies
CREATE POLICY "hobbies_select_all" ON public.hobbies
  FOR SELECT
  USING (true);

-- Policy: INSERT - Only admins can create hobbies
CREATE POLICY "hobbies_insert_admin" ON public.hobbies
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy: UPDATE - Only admins can update hobbies
CREATE POLICY "hobbies_update_admin" ON public.hobbies
  FOR UPDATE
  WITH CHECK (public.is_admin());

-- Policy: DELETE - Only admins can delete hobbies
CREATE POLICY "hobbies_delete_admin" ON public.hobbies
  FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- tags table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can browse tags
CREATE POLICY "tags_select_all" ON public.tags
  FOR SELECT
  USING (true);

-- Policy: INSERT - Only admins can create tags
CREATE POLICY "tags_insert_admin" ON public.tags
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy: UPDATE - Only admins can update tags
CREATE POLICY "tags_update_admin" ON public.tags
  FOR UPDATE
  WITH CHECK (public.is_admin());

-- Policy: DELETE - Only admins can delete tags
CREATE POLICY "tags_delete_admin" ON public.tags
  FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- user_hobbies table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can browse user hobbies
CREATE POLICY "user_hobbies_select_all" ON public.user_hobbies
  FOR SELECT
  USING (true);

-- Policy: INSERT - Users can add hobbies to their own profile
CREATE POLICY "user_hobbies_insert_own" ON public.user_hobbies
  FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    OR public.is_admin()
  );

-- Policy: DELETE - Users can remove hobbies from their own profile
CREATE POLICY "user_hobbies_delete_own" ON public.user_hobbies
  FOR DELETE
  USING (
    auth.uid() = profile_id
    OR public.is_admin()
  );

-- ============================================================================
-- hobby_tags table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can view hobby tags
CREATE POLICY "hobby_tags_select_all" ON public.hobby_tags
  FOR SELECT
  USING (true);

-- Policy: INSERT - Only admins can link hobbies to tags
CREATE POLICY "hobby_tags_insert_admin" ON public.hobby_tags
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy: DELETE - Only admins can remove hobby tags
CREATE POLICY "hobby_tags_delete_admin" ON public.hobby_tags
  FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- locations table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can browse locations
CREATE POLICY "locations_select_all" ON public.locations
  FOR SELECT
  USING (true);

-- Policy: INSERT - Admins can create locations (creators tracked in created_by)
CREATE POLICY "locations_insert_admin" ON public.locations
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy: UPDATE - Admins or creator can update locations
CREATE POLICY "locations_update_admin_or_creator" ON public.locations
  FOR UPDATE
  WITH CHECK (
    public.is_admin()
    OR auth.uid() = created_by
  );

-- Policy: DELETE - Only admins can delete locations
CREATE POLICY "locations_delete_admin" ON public.locations
  FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- events table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can view events
CREATE POLICY "events_select_all" ON public.events
  FOR SELECT
  USING (true);

-- Policy: INSERT - Hosts and admins can create events
CREATE POLICY "events_insert_host_admin" ON public.events
  FOR INSERT
  WITH CHECK (
    public.is_host()
    AND auth.uid() = host_id
  );

-- Policy: UPDATE - Event host or admin can update event
CREATE POLICY "events_update_host_admin" ON public.events
  FOR UPDATE
  WITH CHECK (
    public.is_admin()
    OR (public.is_host() AND auth.uid() = host_id)
  );

-- Policy: DELETE - Event host or admin can delete event
CREATE POLICY "events_delete_host_admin" ON public.events
  FOR DELETE
  USING (
    public.is_admin()
    OR (public.is_host() AND auth.uid() = host_id)
  );

-- ============================================================================
-- event_tags table RLS
-- ============================================================================

-- Policy: SELECT - Everyone can view event tags
CREATE POLICY "event_tags_select_all" ON public.event_tags
  FOR SELECT
  USING (true);

-- Policy: INSERT - Event host or admin can add tags to event
CREATE POLICY "event_tags_insert_host_admin" ON public.event_tags
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR public.user_is_event_host(event_id, auth.uid())
  );

-- Policy: DELETE - Event host or admin can remove tags from event
CREATE POLICY "event_tags_delete_host_admin" ON public.event_tags
  FOR DELETE
  USING (
    public.is_admin()
    OR public.user_is_event_host(event_id, auth.uid())
  );

-- ============================================================================
-- event_participants table RLS
-- ============================================================================

-- Policy: SELECT - Event host can view participants of their events; admins see all; users see their own participation
CREATE POLICY "event_participants_select" ON public.event_participants
  FOR SELECT
  USING (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host((SELECT host_id FROM public.events WHERE id = event_id), auth.uid())
  );

-- Policy: INSERT - Authenticated users can join events
CREATE POLICY "event_participants_insert_own" ON public.event_participants
  FOR INSERT
  WITH CHECK (
    (auth.uid() = profile_id AND public.is_seeker())
    OR public.is_admin()
  );

-- Policy: UPDATE - Participant or event host/admin can update status
CREATE POLICY "event_participants_update" ON public.event_participants
  FOR UPDATE
  WITH CHECK (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host((SELECT host_id FROM public.events WHERE id = event_id), auth.uid())
  );

-- Policy: DELETE - Participant or event host/admin can remove participation
CREATE POLICY "event_participants_delete" ON public.event_participants
  FOR DELETE
  USING (
    public.is_admin()
    OR auth.uid() = profile_id
    OR public.user_is_event_host((SELECT host_id FROM public.events WHERE id = event_id), auth.uid())
  );

-- ============================================================================
-- Summary of RLS Policy Access Matrix
-- ============================================================================
-- 
-- Table                 | Anonymous | Seeker      | Host            | Admin
-- ----------------------+-----------+-------------+-----------------+--------
-- profiles              | R         | R (U self)  | R (U self)      | R (U,D all)
-- user_roles            | X         | R (own)     | R (own)         | R,U,D,I all
-- hobbies               | R         | R           | R               | R,I,U,D
-- tags                  | R         | R           | R               | R,I,U,D
-- user_hobbies          | R         | R (I,D own) | R (I,D own)     | R,I,D all
-- hobby_tags            | R         | R           | R               | R,I,D
-- locations             | R         | R           | R (U,D self)    | R,I,U,D all
-- events                | R         | R (I self)  | R (U,D own host)| R,I,U,D all
-- event_tags            | R         | R           | R (I,D own)     | R,I,D all
-- event_participants    | R (filter)| R,I,U,D own | R own, U,D own  | R,I,U,D all
--
-- Legend: R=Read, I=Insert, U=Update, D=Delete, X=Denied
