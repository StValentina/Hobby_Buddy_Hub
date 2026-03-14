-- Create public access policies for browse features
-- This allows anonymous users to discover hobbies, events, people, and locations

-- Enable public read access to hobbies table
CREATE POLICY "hobbies_read_public"
  ON hobbies
  FOR SELECT
  USING (true);

-- Enable public read access to tags table
CREATE POLICY "tags_read_public"
  ON tags
  FOR SELECT
  USING (true);

-- Enable public read access to hobby_tags junction table
CREATE POLICY "hobby_tags_read_public"
  ON hobby_tags
  FOR SELECT
  USING (true);

-- Enable public read access to locations table
CREATE POLICY "locations_read_public"
  ON locations
  FOR SELECT
  USING (true);

-- Enable public read access to events table
CREATE POLICY "events_read_public"
  ON events
  FOR SELECT
  USING (true);

-- Enable public read access to event_tags table
CREATE POLICY "event_tags_read_public"
  ON event_tags
  FOR SELECT
  USING (true);

-- Enable public read access to profiles (basic info)
CREATE POLICY "profiles_read_public"
  ON profiles
  FOR SELECT
  USING (true);

-- Enable public read access to user_hobbies relationships
CREATE POLICY "user_hobbies_read_public"
  ON user_hobbies
  FOR SELECT
  USING (true);

-- Enable public read access to event_participants (to see who joined)
CREATE POLICY "event_participants_read_public"
  ON event_participants
  FOR SELECT
  USING (true);
