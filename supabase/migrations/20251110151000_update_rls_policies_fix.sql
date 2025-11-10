-- Update RLS policies for the dishes table to allow admins to update any dish.
-- This script is idempotent and can be run multiple times safely.

-- Drop the policy if it already exists to make the script rerunnable
DROP POLICY IF EXISTS "Allow admins to update any dish" ON public.dishes;

-- This policy grants UPDATE permissions to users with the 'admin' role.
CREATE POLICY "Allow admins to update any dish"
ON public.dishes
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
