-- ============================================================================
-- 009_add_email_to_profiles.sql
-- 
-- Adds email column to profiles table so emails are properly stored
-- Updates the auth trigger to store email separately from full_name
-- ============================================================================

-- Add email column to profiles table (allow NULL initially)
ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- Populate email from auth.users for existing profiles
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id;

-- Set NOT NULL constraint after populating
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Update the handle_new_user trigger to properly set full_name and email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'seeker', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment
COMMENT ON COLUMN public.profiles.email IS 'User email address (stored for reference, actual auth handled by auth.users)';
