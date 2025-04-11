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

// Use your actual Supabase URL and anon key
const supabaseUrl = 'https://emmladhteznfjabfjncn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWxhZGh0ZXpuZmphYmZqbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MDk1NzksImV4cCI6MjA1OTk4NTU3OX0.Yy_jIIALMqDhGYCe_WOX5xNQcLLL7tNWbBVCeDs7AW0';

// Add console logs to debug the configuration
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey.substring(0, 10) + '...');

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if we're using real credentials
export const isUsingRealSupabase = () => {
  return true; // Since we're now using real credentials directly in the code
};
