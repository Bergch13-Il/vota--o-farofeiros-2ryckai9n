-- Seed the admin user 'berg@farofeiros.com'
-- This migration creates a new user and assigns them the 'admin' role.
-- The password is 'ctpmpmct'.
-- The email 'berg' from the user story was adapted to 'berg@farofeiros.com' to comply with email format constraints.

DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'berg@farofeiros.com';
BEGIN
    -- Check if user already exists to make migration rerunnable
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    IF admin_user_id IS NULL THEN
        -- Insert the user into auth.users
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000', -- Default instance ID
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt('ctpmpmct', gen_salt('bf')),
            now(),
            now(),
            now()
        ) RETURNING id INTO admin_user_id;

        -- The trigger 'on_auth_user_created' will fire and create a 'user' role.
        -- We update it to 'admin'.
        UPDATE public.user_roles
        SET role = 'admin'
        WHERE user_id = admin_user_id;
    ELSE
        -- If user exists, ensure their role is admin.
        -- This handles cases where the user was created but role assignment failed.
        UPDATE public.user_roles
        SET role = 'admin'
        WHERE user_id = admin_user_id;
    END IF;
END $$;
