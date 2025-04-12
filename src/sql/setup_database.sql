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

-- Create monitoring_sessions table for live monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
    id text PRIMARY KEY,
    agent_id text REFERENCES public.users(id),
    coach_id text REFERENCES public.users(id),
    start_time timestamp with time zone DEFAULT current_timestamp,
    end_time timestamp with time zone,
    status text DEFAULT 'active',
    notes text,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create call_metrics table for detailed call analysis
CREATE TABLE IF NOT EXISTS public.call_metrics (
    id text PRIMARY KEY,
    call_id text REFERENCES public.calls(id),
    metric_type text NOT NULL,
    value numeric NOT NULL,
    timestamp timestamp with time zone DEFAULT current_timestamp,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create compliance_checks table
CREATE TABLE IF NOT EXISTS public.compliance_checks (
    id text PRIMARY KEY,
    call_id text REFERENCES public.calls(id),
    check_type text NOT NULL,
    passed boolean NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create webrtc_events table
CREATE TABLE IF NOT EXISTS public.webrtc_events (
    id text PRIMARY KEY,
    session_id text NOT NULL,
    type text NOT NULL,
    sdp jsonb,
    candidate jsonb,
    timestamp timestamp with time zone DEFAULT current_timestamp,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create manual_entries table
CREATE TABLE IF NOT EXISTS public.manual_entries (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    customer_number text,
    phone_number text,
    margin_level text,
    entry_type text NOT NULL, -- 'upgrade', 'downgrade', 'sidegrade', 'mvlz', 'ovlz'
    notes text,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create manual_calls table
CREATE TABLE IF NOT EXISTS public.manual_calls (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id),
    customer_number text,
    phone_number text,
    duration integer,
    call_type text NOT NULL, -- 'inbound', 'outbound'
    outcome text, -- 'success', 'failed', 'callback'
    notes text,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON public.calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_keywords_team_id ON public.keywords(team_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_agent_id ON public.monitoring_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_coach_id ON public.monitoring_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_call_metrics_call_id ON public.call_metrics(call_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_call_id ON public.compliance_checks(call_id);

-- Add indexes for webrtc_events
CREATE INDEX IF NOT EXISTS idx_webrtc_events_session_id ON public.webrtc_events(session_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_events_type ON public.webrtc_events(type);

-- Create indexes for manual_entries
CREATE INDEX IF NOT EXISTS idx_manual_entries_user_id ON public.manual_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_entries_created_at ON public.manual_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_manual_entries_entry_type ON public.manual_entries(entry_type);

-- Create indexes for manual_calls
CREATE INDEX IF NOT EXISTS idx_manual_calls_user_id ON public.manual_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_calls_created_at ON public.manual_calls(created_at);

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