-- Create custom types
CREATE TYPE public.party_type AS ENUM ('natal', 'reveillon');
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user'
);

-- Create dishes table
CREATE TABLE public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    party_type party_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create votes table
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_vote_per_dish_per_user UNIQUE (dish_id, user_id)
);

-- Enable RLS for all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT role FROM public.user_roles WHERE user_id = p_user_id);
END;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Allow users to view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all roles" ON public.user_roles
FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for dishes
CREATE POLICY "Allow authenticated users to view all dishes" ON public.dishes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert dishes" ON public.dishes
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow admins to delete dishes" ON public.dishes
FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for votes
CREATE POLICY "Allow authenticated users to view all votes" ON public.votes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert votes for themselves" ON public.votes
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow admins to delete votes" ON public.votes
FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Function to create a user_role entry for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a view to get dishes with vote counts
CREATE OR REPLACE VIEW public.dishes_with_votes AS
SELECT
    d.id,
    d.name,
    d.party_type,
    d.created_at,
    d.user_id,
    COUNT(v.id) AS votes
FROM
    public.dishes d
LEFT JOIN
    public.votes v ON d.id = v.dish_id
GROUP BY
    d.id;

-- Grant usage on schema and tables to supabase roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
