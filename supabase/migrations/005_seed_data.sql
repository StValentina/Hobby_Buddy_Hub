-- ============================================================================
-- 005_seed_data.sql
-- 
-- Populates initial data for hobbies, tags, locations, and their relationships
-- This provides a base dataset for application testing and user browsing
-- ============================================================================

-- ============================================================================
-- Seed hobbies
-- ============================================================================
INSERT INTO public.hobbies (name, description) VALUES
  ('Hiking', 'Outdoor walking and trail exploration in natural environments'),
  ('Photography', 'Taking and sharing photos, learning composition and techniques'),
  ('Chess', 'Strategic board game, analysis and tournament play'),
  ('Cooking', 'Preparing meals, experimenting with recipes and cuisines'),
  ('Painting', 'Visual art creation with various mediums and styles'),
  ('Dancing', 'Movement, rhythm, and performance in various dance styles'),
  ('Literature & Reading', 'Reading books, discussing literature and sharing recommendations'),
  ('Travel & Exploration', 'Visiting new places, discovering cultures and experiences'),
  ('Gardening', 'Growing plants, flowers, vegetables and enjoying nature'),
  ('Fitness & Running', 'Exercise, jogging, running events and wellness activities'),
  ('Music & Instruments', 'Playing instruments, singing, and enjoying music'),
  ('Board Games & Tabletop', 'Playing board games, card games, and tabletop RPGs'),
  ('Yoga & Meditation', 'Practicing yoga, mindfulness and wellness'),
  ('Cycling', 'Biking for fitness, recreation and exploration'),
  ('Rock Climbing', 'Indoor/outdoor climbing, bouldering and rope climbing');

-- ============================================================================
-- Seed tags
-- ============================================================================
INSERT INTO public.tags (name) VALUES
  ('Beginner Friendly'),
  ('Casual'),
  ('Skill Building'),
  ('Competitive'),
  ('Relaxing'),
  ('Adventure'),
  ('Nature'),
  ('Cultural'),
  ('Social'),
  ('Mindful'),
  ('Fitness'),
  ('Creative'),
  ('Outdoor'),
  ('Indoor'),
  ('Just for Fun'),
  ('Weekend Activity'),
  ('Evening Activity'),
  ('All Ages'),
  ('Group Activity'),
  ('Collaborative');

-- ============================================================================
-- Seed locations
-- ============================================================================
INSERT INTO public.locations (name, city, address, description) VALUES
  ('Vitosha Mountain', 'Sofia', 'Sofia Bulgaria', 'Popular hiking destination near Sofia with scenic trails'),
  ('Borisova Garden', 'Sofia', 'Sofia Bulgaria', 'Beautiful urban park perfect for walks and outdoor events'),
  ('Downtown Coffee House', 'Sofia', 'Central Sofia', 'Cozy venue for casual meetups and discussions'),
  ('City Art Studio', 'Sofia', 'Sofia Bulgaria', 'Studio space for creative workshops and art sessions'),
  ('Community Chess Club', 'Sofia', 'Sofia Bulgaria', 'Chess playing venue with tables and equipment'),
  ('Central Gym', 'Sofia', 'Sofia Bulgaria', 'Full-equipped fitness facility for training'),
  ('Mount Rila', 'Bansko', 'Rila Mountains', 'Mountain range known for hiking and outdoor activities'),
  ('Beach Lounge', 'Varna', 'Black Sea Coast', 'Seaside venue for beach activities and socializing'),
  ('Local Theater', 'Sofia', 'Sofia Bulgaria', 'Performance space for dance and cultural events'),
  ('Community Garden', 'Sofia', 'Sofia Bulgaria', 'Shared gardening space for growing plants');

-- ============================================================================
-- Link hobbies to tags (hobby_tags)
-- ============================================================================

-- Hiking: Outdoor, Adventure, Nature, Beginner Friendly, Fitness, Group Activity
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Hiking' AND t.name IN ('Outdoor', 'Adventure', 'Nature', 'Beginner Friendly', 'Fitness', 'Group Activity');

-- Photography: Creative, Nature, Outdoor, Skill Building, Social
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Photography' AND t.name IN ('Creative', 'Nature', 'Outdoor', 'Skill Building', 'Social');

-- Chess: Indoor, Competitive, Skill Building, Social, Just for Fun
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Chess' AND t.name IN ('Indoor', 'Competitive', 'Skill Building', 'Social', 'Just for Fun');

-- Cooking: Creative, Social, Skill Building, Casual, Group Activity, All Ages
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Cooking' AND t.name IN ('Creative', 'Social', 'Skill Building', 'Casual', 'Group Activity', 'All Ages');

-- Painting: Creative, Indoor, Skill Building, Relaxing, Beginner Friendly
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Painting' AND t.name IN ('Creative', 'Indoor', 'Skill Building', 'Relaxing', 'Beginner Friendly');

-- Dancing: Social, Creative, Fitness, Cultural, Group Activity, Evening Activity
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Dancing' AND t.name IN ('Social', 'Creative', 'Fitness', 'Cultural', 'Group Activity', 'Evening Activity');

-- Literature & Reading: Relaxing, Casual, Indoor, Social, Cultural, Mindful
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Literature & Reading' AND t.name IN ('Relaxing', 'Casual', 'Indoor', 'Social', 'Cultural', 'Mindful');

-- Travel & Exploration: Adventure, Outdoor, Cultural, Social, Fitness, All Ages
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Travel & Exploration' AND t.name IN ('Adventure', 'Outdoor', 'Cultural', 'Social', 'Fitness', 'All Ages');

-- Gardening: Nature, Outdoor, Relaxing, Beginner Friendly, Skill Building, Casual
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Gardening' AND t.name IN ('Nature', 'Outdoor', 'Relaxing', 'Beginner Friendly', 'Skill Building', 'Casual');

-- Fitness & Running: Fitness, Outdoor, Skill Building, Competitive, Group Activity, Health
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Fitness & Running' AND t.name IN ('Fitness', 'Outdoor', 'Skill Building', 'Competitive', 'Group Activity');

-- Music & Instruments: Creative, Skill Building, Social, Cultural, Casual, Group Activity
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Music & Instruments' AND t.name IN ('Creative', 'Skill Building', 'Social', 'Cultural', 'Casual', 'Group Activity');

-- Board Games & Tabletop: Indoor, Social, Competitive, Just for Fun, Group Activity, All Ages
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Board Games & Tabletop' AND t.name IN ('Indoor', 'Social', 'Competitive', 'Just for Fun', 'Group Activity', 'All Ages');

-- Yoga & Meditation: Relaxing, Mindful, Fitness, Indoor, Beginner Friendly, Skill Building
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Yoga & Meditation' AND t.name IN ('Relaxing', 'Mindful', 'Fitness', 'Indoor', 'Beginner Friendly', 'Skill Building');

-- Cycling: Outdoor, Adventure, Nature, Fitness, Group Activity, Casual, All Ages
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Cycling' AND t.name IN ('Outdoor', 'Adventure', 'Nature', 'Fitness', 'Group Activity', 'Casual', 'All Ages');

-- Rock Climbing: Adventure, Outdoor, Fitness, Skill Building, Competitive, Group Activity
INSERT INTO public.hobby_tags (hobby_id, tag_id)
SELECT h.id, t.id FROM public.hobbies h, public.tags t
WHERE h.name = 'Rock Climbing' AND t.name IN ('Adventure', 'Outdoor', 'Fitness', 'Skill Building', 'Competitive', 'Group Activity');

-- ============================================================================
-- Summary Statistics (for verification)
-- ============================================================================
-- After migration, verify with:
-- SELECT COUNT(*) FROM public.hobbies;         -- Should be 15
-- SELECT COUNT(*) FROM public.tags;            -- Should be 20
-- SELECT COUNT(*) FROM public.locations;       -- Should be 10
-- SELECT COUNT(*) FROM public.hobby_tags;      -- Should be ~80+
-- ============================================================================
