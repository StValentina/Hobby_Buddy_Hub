-- ============================================================================
-- 022_fix_tags_admin_update_permissions.sql
--
-- Fixes tag edit/delete from admin panel by aligning RLS + table privileges:
-- 1) UPDATE policy on tags uses both USING and WITH CHECK for admins.
-- 2) authenticated role gets INSERT/UPDATE/DELETE grants on tags.
-- ============================================================================

-- Ensure authenticated users have table-level write privileges.
-- RLS policies still restrict writes to admins only.
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;

-- Recreate UPDATE policy with explicit row visibility and new-row check.
DROP POLICY IF EXISTS "tags_update_admin" ON public.tags;
CREATE POLICY "tags_update_admin" ON public.tags
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Keep admin-only insert/delete policies explicit.
DROP POLICY IF EXISTS "tags_insert_admin" ON public.tags;
CREATE POLICY "tags_insert_admin" ON public.tags
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tags_delete_admin" ON public.tags;
CREATE POLICY "tags_delete_admin" ON public.tags
  FOR DELETE
  USING (public.is_admin());

COMMENT ON POLICY "tags_update_admin" ON public.tags IS 'Only admins can update tags (USING + WITH CHECK).';
