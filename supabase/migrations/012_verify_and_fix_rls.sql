-- ============================================================================
-- 012_verify_and_fix_rls.sql
-- 
-- Verify and fix RLS policies to ensure profile updates work correctly
-- ============================================================================

-- Drop existing policies that might be problematic
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_system" ON public.profiles;

-- Recreate INSERT policy to allow authenticated users to create profiles via triggers
CREATE POLICY "profiles_insert_trigger" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Recreate UPDATE policy with explicit auth check
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure DELETE policy also uses both USING and WITH CHECK
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Verify user_hobbies RLS allows updates from authenticated users
DROP POLICY IF EXISTS "user_hobbies_insert_own" ON public.user_hobbies;
CREATE POLICY "user_hobbies_insert_own" ON public.user_hobbies
  FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "user_hobbies_delete_own" ON public.user_hobbies;
CREATE POLICY "user_hobbies_delete_own" ON public.user_hobbies
  FOR DELETE
  USING (
    auth.uid() = profile_id
    OR public.is_admin()
  );

-- Grant update permissions to authenticated users
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT, DELETE ON public.user_hobbies TO authenticated;

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Users can update their own profile with both USING and WITH CHECK';
COMMENT ON POLICY "profiles_insert_trigger" ON public.profiles IS 'Profiles can be created by auth triggers';
