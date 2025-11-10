-- Update RLS policies for the dishes table to allow admins to update any dish.

-- This policy grants UPDATE permissions to users with the 'admin' role.
CREATE POLICY "Allow admins to update any dish"
ON public.dishes
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
