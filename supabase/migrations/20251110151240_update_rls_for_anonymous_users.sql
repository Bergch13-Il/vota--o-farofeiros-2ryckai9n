-- This migration updates RLS policies to explicitly allow anonymous users to add dishes and votes.
-- Anonymous users, when signed in via Supabase, receive an 'authenticated' role,
-- so these policies ensure any user with a valid session (including anonymous) can participate.

-- Drop existing insert policies to replace them with clearer ones.
DROP POLICY IF EXISTS "Allow authenticated users to insert dishes" ON public.dishes;
DROP POLICY IF EXISTS "Allow authenticated users to insert votes for themselves" ON public.votes;
DROP POLICY IF EXISTS "Allow authenticated users to insert votes" ON public.votes;

-- RLS Policies for dishes
-- This policy allows any user with a valid session (anonymous or logged-in) to suggest a dish.
-- The user_id must match the id of the user performing the action.
CREATE POLICY "Allow authenticated users to insert dishes"
ON public.dishes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for votes
-- This policy allows any user with a valid session (anonymous or logged-in) to vote.
-- The user_id must match the id of the user performing the action.
CREATE POLICY "Allow authenticated users to insert votes"
ON public.votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure select policies are in place for authenticated users.
DROP POLICY IF EXISTS "Allow authenticated users to view all dishes" ON public.dishes;
CREATE POLICY "Allow authenticated users to view all dishes"
ON public.dishes
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to view all votes" ON public.votes;
CREATE POLICY "Allow authenticated users to view all votes"
ON public.votes
FOR SELECT
TO authenticated
USING (true);
