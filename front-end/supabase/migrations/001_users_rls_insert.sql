-- RLS policy for client-side insert into public.users
-- The table already exists. Run this in Supabase SQL Editor if you need to allow
-- authenticated users to insert their own row (id = auth.uid()) on signup.

-- Users can insert their own row (when id matches their auth id)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
