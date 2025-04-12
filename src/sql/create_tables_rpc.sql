
-- Create an RPC function to create tables if they don't exist
create or replace function create_teams_table_if_not_exists()
returns void as $$
begin
  -- Check if teams table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'teams') then
    create table public.teams (
      id text primary key,
      name text not null,
      created_at timestamp with time zone default current_timestamp
    );
  end if;
  
  -- Check if users table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'users') then
    create table public.users (
      id text primary key,
      email text unique not null,
      name text not null,
      role text not null,
      team text,
      avatar text,
      status text,
      created_at timestamp with time zone default current_timestamp
    );
  end if;
  
  -- Check if calls table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'calls') then
    create table public.calls (
      id text primary key,
      user_id text references public.users(id),
      customer_name text not null,
      duration integer not null,
      timestamp timestamp with time zone default current_timestamp,
      score integer not null,
      recording_url text,
      transcript text,
      analysis jsonb
    );
  end if;
  
  -- Check if keywords table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'keywords') then
    create table public.keywords (
      id text primary key,
      text text not null,
      sentiment text not null,
      count integer not null,
      team_id text,
      created_at timestamp with time zone default current_timestamp
    );
  end if;
end;
$$ language plpgsql security definer;
