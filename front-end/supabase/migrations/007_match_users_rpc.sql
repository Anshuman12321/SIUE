CREATE OR REPLACE FUNCTION match_users(
  query_embedding vector,
  query_lat double precision,
  query_lng double precision,
  radius_meters double precision,
  filter_alcohol boolean,
  filter_budget text,
  exclude_user_id uuid,
  match_count int DEFAULT 10
)
RETURNS TABLE(user_id uuid, similarity double precision, distance_meters double precision)
LANGUAGE sql STABLE
AS $$
  SELECT
    u.id,
    1 - (u.embedding <=> query_embedding) AS similarity,
    ST_Distance(
      u.location::geography,
      ST_SetSRID(ST_MakePoint(query_lng, query_lat), 4326)::geography
    ) AS distance_meters
  FROM users u
  WHERE u.id != exclude_user_id
    AND u.group_id IS NULL
    AND u.embedding IS NOT NULL
    AND u.location IS NOT NULL
    AND (u.interests->>'alcohol')::boolean = filter_alcohol
    AND u.interests->>'budget' = filter_budget
    AND ST_DWithin(
      u.location::geography,
      ST_SetSRID(ST_MakePoint(query_lng, query_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY u.embedding <=> query_embedding
  LIMIT match_count;
$$;
