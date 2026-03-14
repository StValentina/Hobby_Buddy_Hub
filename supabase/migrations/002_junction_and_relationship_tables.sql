-- ============================================================================
-- 002_junction_and_relationship_tables.sql
-- 
-- Creates relationship/junction tables and main event entities
-- Tables: user_hobbies, hobby_tags, locations, events, event_tags, event_participants
-- ============================================================================

-- ============================================================================
-- user_hobbies table (Many-to-Many: profiles ↔ hobbies)
-- ============================================================================
CREATE TABLE public.user_hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hobby_id UUID NOT NULL REFERENCES public.hobbies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, hobby_id)
);

ALTER TABLE public.user_hobbies ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_hobbies IS 'Junction table linking users to their interested hobbies';
COMMENT ON CONSTRAINT user_hobbies_profile_id_hobby_id_key ON public.user_hobbies IS 'Enforce one record per user-hobby pair';

-- ============================================================================
-- hobby_tags table (Many-to-Many: hobbies ↔ tags)
-- ============================================================================
CREATE TABLE public.hobby_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hobby_id UUID NOT NULL REFERENCES public.hobbies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hobby_id, tag_id)
);

ALTER TABLE public.hobby_tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.hobby_tags IS 'Junction table linking hobbies to their descriptive tags';

-- ============================================================================
-- locations table
-- ============================================================================
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  description TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT location_name_not_empty CHECK (name != '')
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.locations IS 'Venues and locations where hobby events can take place';
COMMENT ON COLUMN public.locations.created_by IS 'Profile of the user who created this location (usually admin)';

-- ============================================================================
-- events table
-- ============================================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CONSTRAINT event_title_not_empty CHECK (title != ''),
  description TEXT,
  hobby_id UUID NOT NULL REFERENCES public.hobbies(id) ON DELETE RESTRICT,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL CONSTRAINT max_participants_positive CHECK (max_participants > 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.events IS 'Hobby events organized by hosts for seekers to join';
COMMENT ON COLUMN public.events.title IS 'Event title (e.g., "Morning Hike on Vitosha")';
COMMENT ON COLUMN public.events.host_id IS 'Profile of the event organizer';
COMMENT ON COLUMN public.events.max_participants IS 'Maximum number of participants allowed (must be > 0)';
COMMENT ON COLUMN public.events.event_date IS 'Date and time of the event';

-- ============================================================================
-- event_tags table (Many-to-Many: events ↔ tags)
-- ============================================================================
CREATE TABLE public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, tag_id)
);

ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.event_tags IS 'Junction table linking events to their descriptive tags';

-- ============================================================================
-- event_participants table (Many-to-Many: events ↔ profiles)
-- ============================================================================
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status public.event_participation_status DEFAULT 'joined',
  UNIQUE(event_id, profile_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.event_participants IS 'Junction table tracking which users have joined which events';
COMMENT ON COLUMN public.event_participants.status IS 'Participation status: joined, cancelled, or pending';

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX idx_user_hobbies_profile_id ON public.user_hobbies(profile_id);
CREATE INDEX idx_user_hobbies_hobby_id ON public.user_hobbies(hobby_id);

CREATE INDEX idx_hobby_tags_hobby_id ON public.hobby_tags(hobby_id);
CREATE INDEX idx_hobby_tags_tag_id ON public.hobby_tags(tag_id);

CREATE INDEX idx_locations_city ON public.locations(city);
CREATE INDEX idx_locations_created_by ON public.locations(created_by);

CREATE INDEX idx_events_hobby_id ON public.events(hobby_id);
CREATE INDEX idx_events_host_id ON public.events(host_id);
CREATE INDEX idx_events_location_id ON public.events(location_id);
CREATE INDEX idx_events_event_date ON public.events(event_date);

CREATE INDEX idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX idx_event_tags_tag_id ON public.event_tags(tag_id);

CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_profile_id ON public.event_participants(profile_id);
CREATE INDEX idx_event_participants_status ON public.event_participants(status);

-- ============================================================================
-- Grant defaults for new tables
-- ============================================================================
-- Anonymous users can read public data
GRANT SELECT ON public.user_hobbies TO anon;
GRANT SELECT ON public.hobby_tags TO anon;
GRANT SELECT ON public.locations TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.event_tags TO anon;
GRANT SELECT ON public.event_participants TO anon;

-- Authenticated users can read public data
GRANT SELECT ON public.user_hobbies TO authenticated;
GRANT SELECT ON public.hobby_tags TO authenticated;
GRANT SELECT ON public.locations TO authenticated;
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.event_tags TO authenticated;
GRANT SELECT ON public.event_participants TO authenticated;
