-- ============================================================================
-- 019_fix_user_roles_admin_update.sql
--
-- Fixes admin role updates from frontend by:
-- 1) ensuring UPDATE policy uses both USING and WITH CHECK
-- 2) granting required table privileges to authenticated role
-- ============================================================================

-- Recreate UPDATE policy with explicit row visibility + row check for admins.
DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
CREATE POLICY "user_roles_update" ON public.user_roles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure authenticated users can execute write operations,
-- while RLS policies still restrict writes to admins only.
GRANT UPDATE ON public.user_roles TO authenticated;
GRANT INSERT ON public.user_roles TO authenticated;
GRANT DELETE ON public.user_roles TO authenticated;

COMMENT ON POLICY "user_roles_update" ON public.user_roles IS 'Only admins can update roles (USING + WITH CHECK).';
