
import { createClient } from '@supabase/supabase-js';

// Default values for development (these will be overridden by env variables if they exist)
const defaultSupabaseUrl = 'https://emmladhteznfjabfjncn.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWxhZGh0ZXpuZmphYmZqbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MDk1NzksImV4cCI6MjA1OTk4NTU3OX0.Yy_jIIALMqDhGYCe_WOX5xNQcLLL7tNWbBVCeDs7AW0';

// Use environment variables if available, otherwise use default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Add console logs to debug the configuration
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return false;
  }
};

// Run a connection test on module load
testSupabaseConnection().then(success => {
  if (!success) {
    console.warn('Warning: Supabase connection test failed on initialization');
  }
});
