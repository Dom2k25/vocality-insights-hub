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
    full_name text NOT NULL,
    role text NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'team_leader', 'manager', 'admin')),
    team_id text REFERENCES public.teams(id),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
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
    language text DEFAULT 'de',
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
    id text PRIMARY KEY,
    text text NOT NULL,
    sentiment text NOT NULL,
    count integer NOT NULL DEFAULT 0,
    team_id text REFERENCES public.teams(id),
    language text DEFAULT 'de',
    synonyms text[],
    context_rules jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create keyword_categories table
CREATE TABLE IF NOT EXISTS public.keyword_categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    weight numeric NOT NULL DEFAULT 1.0,
    team_id text REFERENCES public.teams(id),
    language text DEFAULT 'de',
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create keyword_mappings table
CREATE TABLE IF NOT EXISTS public.keyword_mappings (
    id text PRIMARY KEY,
    keyword_id text REFERENCES public.keywords(id),
    category_id text REFERENCES public.keyword_categories(id),
    weight numeric NOT NULL DEFAULT 1.0,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create call_keywords table
CREATE TABLE IF NOT EXISTS public.call_keywords (
    id text PRIMARY KEY,
    call_id text REFERENCES public.calls(id),
    keyword_id text REFERENCES public.keywords(id),
    count integer NOT NULL DEFAULT 1,
    sentiment_score numeric NOT NULL,
    context jsonb,
    timestamp timestamp with time zone DEFAULT current_timestamp,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create llm_models table
CREATE TABLE IF NOT EXISTS public.llm_models (
    id text PRIMARY KEY,
    name text NOT NULL,
    provider text NOT NULL,
    model_name text NOT NULL,
    language text DEFAULT 'de',
    capabilities jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create llm_prompts table
CREATE TABLE IF NOT EXISTS public.llm_prompts (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    prompt_template text NOT NULL,
    language text DEFAULT 'de',
    model_id text REFERENCES public.llm_models(id),
    parameters jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create llm_analyses table
CREATE TABLE IF NOT EXISTS public.llm_analyses (
    id text PRIMARY KEY,
    call_id text REFERENCES public.calls(id),
    model_id text REFERENCES public.llm_models(id),
    prompt_id text REFERENCES public.llm_prompts(id),
    input_text text NOT NULL,
    output_text text NOT NULL,
    analysis jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create scoring_rules table
CREATE TABLE IF NOT EXISTS public.scoring_rules (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    rule_type text NOT NULL,
    condition jsonb NOT NULL,
    score_value numeric NOT NULL,
    team_id text REFERENCES public.teams(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create call_scores table
CREATE TABLE IF NOT EXISTS public.call_scores (
    id text PRIMARY KEY,
    call_id text REFERENCES public.calls(id),
    rule_id text REFERENCES public.scoring_rules(id),
    score numeric NOT NULL,
    details jsonb,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON public.calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_keywords_team_id ON public.keywords(team_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_agent_id ON public.monitoring_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_coach_id ON public.monitoring_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_call_metrics_call_id ON public.call_metrics(call_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_call_id ON public.compliance_checks(call_id);
CREATE INDEX IF NOT EXISTS idx_keyword_categories_team_id ON public.keyword_categories(team_id);
CREATE INDEX IF NOT EXISTS idx_keyword_mappings_keyword_id ON public.keyword_mappings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_mappings_category_id ON public.keyword_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_call_keywords_call_id ON public.call_keywords(call_id);
CREATE INDEX IF NOT EXISTS idx_call_keywords_keyword_id ON public.call_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_team_id ON public.scoring_rules(team_id);
CREATE INDEX IF NOT EXISTS idx_call_scores_call_id ON public.call_scores(call_id);
CREATE INDEX IF NOT EXISTS idx_call_scores_rule_id ON public.call_scores(rule_id);
CREATE INDEX IF NOT EXISTS idx_llm_models_language ON public.llm_models(language);
CREATE INDEX IF NOT EXISTS idx_llm_prompts_language ON public.llm_prompts(language);
CREATE INDEX IF NOT EXISTS idx_llm_analyses_call_id ON public.llm_analyses(call_id);

-- Create RLS policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Managers can manage users
CREATE POLICY "Managers can manage users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policy: Team leaders can manage their team members
CREATE POLICY "Team leaders can manage their team members" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.team_id = u2.team_id
      WHERE u1.id = auth.uid() 
      AND u1.role = 'team_leader'
      AND u2.id = public.users.id
    )
  );

-- Insert default team if it doesn't exist
INSERT INTO public.teams (id, name)
VALUES ('1', 'Sales')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users if they don't exist
INSERT INTO public.users (id, email, full_name, role, team_id, status)
VALUES 
    ('1', 'admin@vocality.app', 'Admin User', 'admin', '1', 'active'),
    ('2', 'team@vocality.app', 'Team Lead', 'team_leader', '1', 'active'),
    ('3', 'manager@vocality.app', 'Manager User', 'manager', '1', 'active'),
    ('4', 'agent@vocality.app', 'Agent User', 'agent', '1', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default keyword categories
INSERT INTO public.keyword_categories (id, name, description, weight, team_id, language)
VALUES 
    ('1', 'Kundenservice', 'Schlüsselwörter für die Qualität des Kundenservices', 1.5, '1', 'de'),
    ('2', 'Verkauf', 'Schlüsselwörter für Verkaufsleistung', 1.3, '1', 'de'),
    ('3', 'Compliance', 'Schlüsselwörter für regulatorische Compliance', 2.0, '1', 'de'),
    ('4', 'Technisch', 'Schlüsselwörter für technischen Support', 1.2, '1', 'de')
ON CONFLICT (id) DO NOTHING;

-- Insert default German keywords
INSERT INTO public.keywords (id, text, sentiment, team_id, language, synonyms, context_rules)
VALUES 
    ('1', 'zufrieden', 'positive', '1', 'de', 
     ARRAY['glücklich', 'begeistert', 'zufriedenstellend'],
     '{"context": ["Kunde", "Service", "Produkt"], "exclude": ["nicht", "un"]}'),
    ('2', 'Problem', 'negative', '1', 'de',
     ARRAY['Schwierigkeit', 'Hindernis', 'Störung'],
     '{"context": ["technisch", "Service", "Produkt"], "exclude": ["kein", "gelöst"]}'),
    ('3', 'Danke', 'positive', '1', 'de',
     ARRAY['vielen Dank', 'dankbar', 'danke schön'],
     '{"context": ["Kunde", "Service", "Abschluss"], "exclude": []}'),
    ('4', 'Preis', 'neutral', '1', 'de',
     ARRAY['Kosten', 'Gebühr', 'Betrag'],
     '{"context": ["Verkauf", "Angebot", "Rechnung"], "exclude": []}')
ON CONFLICT (id) DO NOTHING;

-- Insert default LLM models
INSERT INTO public.llm_models (id, name, provider, model_name, language, capabilities, is_active)
VALUES 
    ('1', 'German LLM', 'OpenAI', 'gpt-4', 'de',
     '{"sentiment_analysis": true, "keyword_extraction": true, "summarization": true, "translation": true}',
     true)
ON CONFLICT (id) DO NOTHING;

-- Insert default German prompts
INSERT INTO public.llm_prompts (id, name, description, prompt_template, language, model_id, parameters)
VALUES 
    ('1', 'Sentiment Analyse', 'Analysiert das Sentiment des Gesprächs',
     'Analysiere das folgende Gespräch und gib eine detaillierte Sentiment-Analyse zurück: {text}',
     'de', '1', '{"temperature": 0.7, "max_tokens": 500}'),
    ('2', 'Keyword Extraktion', 'Extrahiert wichtige Schlüsselwörter',
     'Extrahiere die wichtigsten Schlüsselwörter aus dem folgenden Gespräch: {text}',
     'de', '1', '{"temperature": 0.5, "max_tokens": 300}'),
    ('3', 'Zusammenfassung', 'Erstellt eine Zusammenfassung des Gesprächs',
     'Fasse das folgende Gespräch zusammen und hebe die wichtigsten Punkte hervor: {text}',
     'de', '1', '{"temperature": 0.6, "max_tokens": 400}')
ON CONFLICT (id) DO NOTHING;

-- Insert default scoring rules
INSERT INTO public.scoring_rules (id, name, description, rule_type, condition, score_value, team_id)
VALUES 
    ('1', 'Kundenservice Exzellenz', 'Hohe Punktzahl für exzellenten Kundenservice', 'keyword_based', 
     '{"keywords": ["danke", "zufrieden", "hilfreich"], "threshold": 3}', 10.0, '1'),
    ('2', 'Verkaufsleistung', 'Punktzahl basierend auf verkaufsbezogenen Schlüsselwörtern', 'keyword_based',
     '{"keywords": ["kaufen", "bestellen", "interessiert"], "threshold": 2}', 8.0, '1'),
    ('3', 'Compliance Prüfung', 'Punktzahl für compliance-bezogene Schlüsselwörter', 'keyword_based',
     '{"keywords": ["Datenschutz", "Einwilligung", "Richtlinie"], "threshold": 1}', 15.0, '1')
ON CONFLICT (id) DO NOTHING; 