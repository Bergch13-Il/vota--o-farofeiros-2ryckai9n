-- This migration allows anonymous users (not authenticated) to suggest dishes
-- by making user_id optional and updating RLS policies

-- Make user_id nullable in dishes table
ALTER TABLE public.dishes 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing insert policy for dishes
DROP POLICY IF EXISTS "Allow authenticated users to insert dishes" ON public.dishes;

-- Create new policy that allows anyone (including anonymous) to insert dishes
-- Anonymous users will have NULL as user_id
CREATE POLICY "Allow anyone to insert dishes"
ON public.dishes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Update select policy to also allow anonymous users
DROP POLICY IF EXISTS "Allow authenticated users to view all dishes" ON public.dishes;
CREATE POLICY "Allow anyone to view dishes"
ON public.dishes
FOR SELECT
TO anon, authenticated
USING (true);

-- Also update votes policies to allow anonymous voting
DROP POLICY IF EXISTS "Allow authenticated users to view all votes" ON public.votes;
CREATE POLICY "Allow anyone to view votes"
ON public.votes
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert votes" ON public.votes;
CREATE POLICY "Allow anyone to insert votes"
ON public.votes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Make user_id nullable in votes table as well
ALTER TABLE public.votes 
ALTER COLUMN user_id DROP NOT NULL;
