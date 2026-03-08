-- Returns email addresses for all members of a given group.
-- Uses SECURITY DEFINER so the function runs with owner (postgres) privileges,
-- allowing it to read auth.users which is not accessible to anon/authenticated roles.

CREATE OR REPLACE FUNCTION get_group_emails(p_group_id bigint)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_ids uuid[];
  result text[] := '{}';
  uid uuid;
  email text;
BEGIN
  SELECT members INTO member_ids
  FROM groups
  WHERE id = p_group_id;

  IF member_ids IS NULL THEN
    RETURN result;
  END IF;

  FOREACH uid IN ARRAY member_ids LOOP
    SELECT au.email INTO email
    FROM auth.users au
    WHERE au.id = uid;

    IF email IS NOT NULL THEN
      result := array_append(result, email);
    END IF;
  END LOOP;

  RETURN result;
END;
$$;
