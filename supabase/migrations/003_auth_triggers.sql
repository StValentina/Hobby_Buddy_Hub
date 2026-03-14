-- ============================================================================
-- 003_auth_triggers.sql
-- 
-- Creates database triggers for auth integration:
-- - Auto-create profile on user signup
-- - Auto-assign default role (seeker)
-- - Auto-update updated_at timestamps
-- ============================================================================

-- ============================================================================
-- Function: handle_new_user
-- Triggered when new user is created in auth.users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'seeker', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: on_auth_user_created
-- Fires when a new user is created via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile and assigns default seeker role when a new user signs up';

-- ============================================================================
-- Function: handle_updated_at
-- Generic function to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: update_profiles_updated_at
-- Updates the updated_at column when a profile is modified
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: update_events_updated_at
-- Updates the updated_at column when an event is modified
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON FUNCTION public.handle_updated_at() IS 'Generic function to automatically update the updated_at timestamp on table modifications';

-- ============================================================================
-- Helper function: get_user_role
-- Returns the role of the currently authenticated user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT NULL)
RETURNS public.roles AS $$
DECLARE
  user_role public.roles;
  auth_user_id UUID;
BEGIN
  -- If no user_id provided, use current auth user
  auth_user_id := COALESCE(user_id, auth.uid());
  
  IF auth_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth_user_id;
  
  RETURN COALESCE(user_role, 'seeker');
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Returns the role of a user; if no user_id provided, uses current authenticated user; defaults to seeker';

-- ============================================================================
-- Helper function: is_admin
-- Returns true if the current user is an admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_user_role(user_id)) = 'admin';
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_admin(UUID) IS 'Returns true if the user has admin role';

-- ============================================================================
-- Helper function: is_host
-- Returns true if the current user is a host
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_host(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_user_role(user_id)) IN ('host', 'admin');
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_host(UUID) IS 'Returns true if the user has host or admin role';

-- ============================================================================
-- Helper function: is_seeker
-- Returns true if the current user is a seeker
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_seeker(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_user_role(user_id)) = 'seeker';
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_seeker(UUID) IS 'Returns true if the user has seeker role';

-- ============================================================================
-- Helper function: get_current_user_id
-- Returns the ID of the currently authenticated user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_current_user_id() IS 'Returns the UUID of the currently authenticated user';

-- ============================================================================
-- Helper function: user_is_event_host
-- Returns true if the user is the host of a specific event
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_is_event_host(event_id UUID, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  check_user_id UUID;
BEGIN
  check_user_id := COALESCE(user_id, auth.uid());
  
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_id AND host_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.user_is_event_host(UUID, UUID) IS 'Returns true if the user is the host of the specified event';
