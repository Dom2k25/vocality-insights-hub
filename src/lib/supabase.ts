
import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          team?: string;
          avatar?: string;
          status?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: string;
          team?: string;
          avatar?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          team?: string;
          avatar?: string;
          status?: string;
          created_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          user_id: string;
          customer_name: string;
          duration: number;
          timestamp: string;
          score: number;
          recording_url?: string;
          transcript?: string;
          analysis?: JSON;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_name: string;
          duration: number;
          timestamp?: string;
          score: number;
          recording_url?: string;
          transcript?: string;
          analysis?: JSON;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_name?: string;
          duration?: number;
          timestamp?: string;
          score?: number;
          recording_url?: string;
          transcript?: string;
          analysis?: JSON;
        };
      };
      keywords: {
        Row: {
          id: string;
          text: string;
          sentiment: string;
          count: number;
          team_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          sentiment: string;
          count: number;
          team_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          sentiment?: string;
          count?: number;
          team_id?: string;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Default values for development (these will be overridden by env variables if they exist)
const defaultSupabaseUrl = 'https://emmladhteznfjabfjncn.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWxhZGh0ZXpuZmphYmZqbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MDk1NzksImV4cCI6MjA1OTk4NTU3OX0.Yy_jIIALMqDhGYCe_WOX5xNQcLLL7tNWbBVCeDs7AW0';

// Use environment variables if available, otherwise use default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Add console logs to debug the configuration
console.log('Supabase URL (from lib):', supabaseUrl);
console.log('Supabase Anon Key (from lib, first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if we're using real credentials
export const isUsingRealSupabase = () => {
  return true; // Since we're now using real credentials directly in the code
};
