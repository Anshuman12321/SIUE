CREATE OR REPLACE FUNCTION get_group_centroid(p_group_id bigint)
RETURNS TABLE(lat double precision, lng double precision)
LANGUAGE sql STABLE
AS $$
  SELECT
    ST_Y(ST_Centroid(ST_Collect(u.location::geometry))) AS lat,
    ST_X(ST_Centroid(ST_Collect(u.location::geometry))) AS lng
  FROM users u
  WHERE u.group_id = p_group_id
    AND u.location IS NOT NULL;
$$;
