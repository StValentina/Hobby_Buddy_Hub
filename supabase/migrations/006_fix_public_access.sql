-- Fix public access to hobbies and related tables
-- Allow anonymous users to read hobby data

-- Allow anyone to select hobbies
DROP POLICY IF EXISTS "hobbies_select_public" ON hobbies;
CREATE POLICY "hobbies_select_public" ON hobbies
  FOR SELECT
  USING (true);

-- Allow anyone to select tags
DROP POLICY IF EXISTS "tags_select_public" ON tags;
CREATE POLICY "tags_select_public" ON tags
  FOR SELECT
  USING (true);

-- Allow anyone to select hobby_tags relationships
DROP POLICY IF EXISTS "hobby_tags_select_public" ON hobby_tags;
CREATE POLICY "hobby_tags_select_public" ON hobby_tags
  FOR SELECT
  USING (true);

-- Allow anyone to select locations
DROP POLICY IF EXISTS "locations_select_public" ON locations;
CREATE POLICY "locations_select_public" ON locations
  FOR SELECT
  USING (true);

-- Allow anyone to select events (public visibility)
DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events
  FOR SELECT
  USING (true);

-- Allow anyone to select event_tags
DROP POLICY IF EXISTS "event_tags_select_public" ON event_tags;
CREATE POLICY "event_tags_select_public" ON event_tags
  FOR SELECT
  USING (true);

-- Allow anyone to see public profiles
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (true);

-- Allow anyone to see user hobbies
DROP POLICY IF EXISTS "user_hobbies_select_public" ON user_hobbies;
CREATE POLICY "user_hobbies_select_public" ON user_hobbies
  FOR SELECT
  USING (true);

-- Allow anyone to see hobby_tags
DROP POLICY IF EXISTS "hobby_tags_select_relationship" ON hobby_tags;
CREATE POLICY "hobby_tags_select_relationship" ON hobby_tags
  FOR SELECT
  USING (true);
