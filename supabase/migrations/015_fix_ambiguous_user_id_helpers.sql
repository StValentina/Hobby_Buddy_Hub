-- ============================================================================
-- 015_fix_ambiguous_user_id_helpers.sql
--
-- Fixes ambiguous "user_id" references inside helper functions used by RLS
-- during event creation and other authenticated actions.
-- ============================================================================

-- Recreate helper function and keep original parameter name to avoid signature rename errors.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT NULL)
RETURNS public.roles AS $$
DECLARE
  v_user_id UUID;
  v_role public.roles;
BEGIN
  v_user_id := COALESCE(get_user_role.user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT ur.role
  INTO v_role
  FROM public.user_roles AS ur
  WHERE ur.user_id = v_user_id
  LIMIT 1;

  RETURN COALESCE(v_role, 'seeker'::public.roles);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role(is_admin.user_id) = 'admin'::public.roles;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_host(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role(is_host.user_id) IN ('host'::public.roles, 'admin'::public.roles);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_seeker(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role(is_seeker.user_id) = 'seeker'::public.roles;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_is_event_host(event_id UUID, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(user_is_event_host.user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.events AS e
    WHERE e.id = user_is_event_host.event_id
      AND e.host_id = v_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Returns role for given user or current auth user (parameter names avoid SQL ambiguity).';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'True when user role is admin.';
COMMENT ON FUNCTION public.is_host(UUID) IS 'True when user role is host or admin.';
COMMENT ON FUNCTION public.is_seeker(UUID) IS 'True when user role is seeker.';
COMMENT ON FUNCTION public.user_is_event_host(UUID, UUID) IS 'True when the user is host of the specified event.';
