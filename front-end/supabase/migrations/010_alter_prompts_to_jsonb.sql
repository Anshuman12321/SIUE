-- Change prompts column from jsonb[] (PostgreSQL array) to plain jsonb
-- so PostgREST can properly store JSON arrays like [{prompt, response}, ...]
ALTER TABLE public.users
  ALTER COLUMN prompts TYPE jsonb
  USING to_jsonb(prompts);
