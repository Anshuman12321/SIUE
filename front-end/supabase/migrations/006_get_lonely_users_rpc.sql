CREATE OR REPLACE FUNCTION get_lonely_users(max_groups int DEFAULT 5)
RETURNS TABLE(user_id uuid)
LANGUAGE sql STABLE
AS $$
  SELECT u.id AS user_id
  FROM users u
  WHERE u.group_id IS NULL
    AND u.interests IS NOT NULL
$$;
