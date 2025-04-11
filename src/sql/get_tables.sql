
-- This is a helper function to check if required tables exist
-- Run this in your Supabase SQL editor

create or replace function get_tables()
returns text[] as $$
declare
  result text[];
begin
  select array_agg(tablename) into result
  from pg_catalog.pg_tables
  where schemaname = 'public';
  
  return result;
end;
$$ language plpgsql security definer;
