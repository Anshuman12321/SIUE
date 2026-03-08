CREATE OR REPLACE FUNCTION remove_member_from_group(p_group_id bigint, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE groups
  SET members = array_remove(members, p_user_id)
  WHERE id = p_group_id;

  UPDATE users
  SET group_id = NULL
  WHERE id = p_user_id AND group_id = p_group_id;
END;
$$;
