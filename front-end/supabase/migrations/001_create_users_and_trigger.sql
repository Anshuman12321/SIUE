-- RLS policy for client-side insert into public.users
-- The table already exists in public schema. Run this in Supabase SQL Editor
-- to allow authenticated users to insert their own row on signup.

-- Users can insert their own row (when id matches their auth id)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
