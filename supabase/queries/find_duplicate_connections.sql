-- Query to find reversed duplicate connections between the same two users
-- This identifies cases where the same users have multiple connection records
-- (e.g., User A → User B AND User B → User A)

-- Simple version: Show pairs with duplicate connections
SELECT
  LEAST(requester_id, receiver_id) as user_a,
  GREATEST(requester_id, receiver_id) as user_b,
  COUNT(*) as connection_count,
  array_agg(id) as connection_ids,
  array_agg(DISTINCT status) as statuses
FROM connections
GROUP BY user_a, user_b
HAVING COUNT(*) > 1
ORDER BY user_a, user_b;

-- Detailed version: Show all connection records for duplicate pairs
WITH normalized_pairs AS (
  SELECT
    id,
    requester_id,
    receiver_id,
    status,
    created_at,
    LEAST(requester_id, receiver_id) as user_a,
    GREATEST(requester_id, receiver_id) as user_b
  FROM connections
)
SELECT
  p.user_a,
  p.user_b,
  np.id,
  np.requester_id,
  np.receiver_id,
  np.status,
  np.created_at
FROM normalized_pairs np
JOIN (
  SELECT user_a, user_b
  FROM normalized_pairs
  GROUP BY user_a, user_b
  HAVING COUNT(*) > 1
) p ON np.user_a = p.user_a AND np.user_b = p.user_b
ORDER BY p.user_a, p.user_b, np.created_at DESC;

-- To DELETE reversed duplicates, keep the oldest one and delete newer ones
-- WARNING: This is a destructive operation - test first!
DELETE FROM connections
WHERE id IN (
  SELECT id FROM (
    WITH ranked_connections AS (
      SELECT
        id,
        LEAST(requester_id, receiver_id) as user_a,
        GREATEST(requester_id, receiver_id) as user_b,
        ROW_NUMBER() OVER (
          PARTITION BY 
            LEAST(requester_id, receiver_id), 
            GREATEST(requester_id, receiver_id)
          ORDER BY created_at ASC
        ) as row_num
      FROM connections
    )
    SELECT id
    FROM ranked_connections
    WHERE row_num > 1
  ) duplicates
);
