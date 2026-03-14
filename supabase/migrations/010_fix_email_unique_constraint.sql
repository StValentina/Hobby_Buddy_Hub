-- ============================================================================
-- 010_fix_email_unique_constraint.sql
-- 
-- Fixes the email unique constraint issue
-- ============================================================================

-- Drop the constraint if it exists
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Add the unique constraint properly
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_key UNIQUE (email);

COMMENT ON CONSTRAINT profiles_email_key ON public.profiles IS 'Email addresses must be unique across profiles';
