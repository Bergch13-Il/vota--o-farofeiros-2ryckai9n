-- This migration removes the RLS policy that caused a recursive error for admin users.
-- The policy "Allow admins to view all roles" on the user_roles table called a function
-- which in turn tried to read the user_roles table, creating a deadlock.
-- Removing this policy resolves the login issue for administrators.
-- The other policy, allowing users to see their own role, remains in effect.

DROP POLICY IF EXISTS "Allow admins to view all roles" ON public.user_roles;
