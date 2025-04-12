-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    team text REFERENCES public.teams(id),
    avatar text,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create calls table
CREATE TABLE IF NOT EXISTS public.calls (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    customer_name text NOT NULL,
    duration integer NOT NULL,
    timestamp timestamp with time zone DEFAULT current_timestamp,
    score integer NOT NULL,
    recording_url text,
    transcript text,
    analysis jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
    id text PRIMARY KEY,
    text text NOT NULL,
    sentiment text NOT NULL,
    count integer NOT NULL DEFAULT 0,
    team_id text REFERENCES public.teams(id),
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON public.calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_keywords_team_id ON public.keywords(team_id);

-- Insert default team if it doesn't exist
INSERT INTO public.teams (id, name)
VALUES ('1', 'Sales')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users if they don't exist
INSERT INTO public.users (id, email, name, role, team, status, avatar)
VALUES 
    ('1', 'admin@vocality.app', 'Admin User', 'admin', '1', 'active', 'https://ui-avatars.com/api/?name=Admin+User&background=6271f1&color=fff'),
    ('2', 'team@vocality.app', 'Team Lead', 'teamleader', '1', 'active', 'https://ui-avatars.com/api/?name=Team+Lead&background=4039c4&color=fff'),
    ('3', 'coach@vocality.app', 'Coach User', 'coach', '1', 'active', 'https://ui-avatars.com/api/?name=Coach+User&background=36319d&color=fff'),
    ('4', 'agent@vocality.app', 'Agent User', 'agent', '1', 'active', 'https://ui-avatars.com/api/?name=Agent+User&background=302d7a&color=fff')
ON CONFLICT (id) DO NOTHING; 