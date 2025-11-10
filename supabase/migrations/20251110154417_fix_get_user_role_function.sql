-- This migration fixes the get_user_role function to prevent RLS recursion issues.
-- By setting a specific search_path, we make the SECURITY DEFINER function more secure
-- and ensure it can read from public.user_roles without being blocked by its own RLS policies.
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
-- Setting the search_path is a security best practice for SECURITY DEFINER functions
-- to prevent potential hijacking.
SET search_path = public
AS $$
DECLARE
    v_role user_role;
BEGIN
    -- This SELECT is executed as the function owner (in Supabase, this is the 'postgres' role),
    -- which has privileges to bypass RLS. This prevents a recursive loop where an RLS policy
    -- on user_roles calls this function, which would then be blocked by the same policy
    -- when trying to read from user_roles.
    SELECT role INTO v_role FROM public.user_roles WHERE user_id = p_user_id;
    RETURN v_role;
END;
$$;
