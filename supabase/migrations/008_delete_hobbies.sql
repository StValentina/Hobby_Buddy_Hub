-- Delete specific hobbies and their related data
-- This removes: Gardening, Fitness & Running, Board Games & Tabletop

-- First, get the IDs of hobbies to delete
-- Then delete related records due to foreign key constraints

-- Delete hobby-tag relationships
DELETE FROM public.hobby_tags 
WHERE hobby_id IN (
    SELECT id FROM public.hobbies 
    WHERE name IN ('Gardening', 'Fitness & Running', 'Board Games & Tabletop')
);

-- Delete user-hobby relationships
DELETE FROM public.user_hobbies 
WHERE hobby_id IN (
    SELECT id FROM public.hobbies 
    WHERE name IN ('Gardening', 'Fitness & Running', 'Board Games & Tabletop')
);

-- Delete events associated with these hobbies
DELETE FROM public.events 
WHERE hobby_id IN (
    SELECT id FROM public.hobbies 
    WHERE name IN ('Gardening', 'Fitness & Running', 'Board Games & Tabletop')
);

-- Finally, delete the hobbies themselves
DELETE FROM public.hobbies 
WHERE name IN ('Gardening', 'Fitness & Running', 'Board Games & Tabletop');
