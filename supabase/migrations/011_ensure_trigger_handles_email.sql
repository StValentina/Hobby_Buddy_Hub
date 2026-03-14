-- ============================================================================
-- 011_ensure_trigger_handles_email.sql
-- 
-- Ensures the trigger function properly inserts email into profiles
-- Adds better error handling and logging
-- ============================================================================

-- Re-create the handle_new_user function with explicit error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract email (this is always available from auth.users)
  user_email := NEW.email;
  
  -- Extract full_name from metadata, or fallback to email prefix
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Log the user being created
  RAISE NOTICE 'Creating profile for user: % with email: %', NEW.id, user_email;
  
  -- Insert profile row
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_full_name,
    NOW(),
    NOW()
  );
  
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'seeker', NOW());
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth signup
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile and assigns default seeker role when a new user signs up via Supabase Auth';
