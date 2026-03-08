-- SELECT RLS policies for authenticated users.
-- Run this in the Supabase SQL Editor if queries return empty results
-- despite data existing in the tables.

-- Users: any authenticated user can read user profiles
CREATE POLICY "Authenticated users can read profiles"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Groups: any authenticated user can read groups
CREATE POLICY "Authenticated users can read groups"
  ON public.groups FOR SELECT
  USING (auth.role() = 'authenticated');

-- Events: any authenticated user can read events
CREATE POLICY "Authenticated users can read events"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

-- Votes: any authenticated user can read votes
CREATE POLICY "Authenticated users can read votes"
  ON public.votes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Votes: authenticated users can insert their own votes
CREATE POLICY "Users can insert own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Groups: authenticated users can update groups (for final_event_id)
CREATE POLICY "Authenticated users can update groups"
  ON public.groups FOR UPDATE
  USING (auth.role() = 'authenticated');
