-- ============================================================================
-- 001_enums_and_base_tables.sql
-- 
-- Creates enums and foundational tables for Hobby Buddy Hub
-- Tables: profiles, user_roles, hobbies, tags
-- ============================================================================

-- Create roles enum
CREATE TYPE public.roles AS ENUM ('seeker', 'host', 'admin');

-- Create event participation status enum
CREATE TYPE public.event_participation_status AS ENUM ('joined', 'cancelled', 'pending');

-- ============================================================================
-- profiles table
-- ============================================================================
-- Extends Supabase auth.users with application-specific profile data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles (policy will be added later)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with application-specific data';
COMMENT ON COLUMN public.profiles.id IS 'Foreign key reference to auth.users(id)';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s profile avatar image in Supabase Storage';

-- ============================================================================
-- user_roles table
-- ============================================================================
-- Stores user roles for authorization (seeker, host, admin)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.roles NOT NULL DEFAULT 'seeker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_roles IS 'Maps users to their authorization roles';
COMMENT ON COLUMN public.user_roles.user_id IS 'Foreign key reference to profiles(id) - one role per user';
COMMENT ON COLUMN public.user_roles.role IS 'Role enum: seeker (joins events), host (creates events), admin (manages platform)';

-- ============================================================================
-- hobbies table
-- ============================================================================
-- Master list of hobbies/categories
CREATE TABLE public.hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on hobbies
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.hobbies IS 'Master list of hobby categories (e.g., Hiking, Photography, Chess)';
COMMENT ON COLUMN public.hobbies.name IS 'Unique hobby name';
COMMENT ON COLUMN public.hobbies.image_url IS 'URL to hobby category image in Supabase Storage';

-- ============================================================================
-- tags table
-- ============================================================================
-- Reusable tags for categorizing hobbies and events
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.tags IS 'Reusable tags for filtering hobbies and events (e.g., "Beginner friendly", "Casual")';
COMMENT ON COLUMN public.tags.name IS 'Unique tag name';

-- ============================================================================
-- Grant defaults for new tables
-- ============================================================================
-- Anonymous users can read hobbies and tags
GRANT SELECT ON public.hobbies TO anon;
GRANT SELECT ON public.tags TO anon;

-- Authenticated users can read profiles and their own roles
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_hobbies_name ON public.hobbies(name);
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
