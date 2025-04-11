
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

// Default fallback values that won't cause initialization errors
// These won't actually connect to a real Supabase instance
const DEFAULT_SUPABASE_URL = 'https://placeholder-project.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Get values from environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

// Add console logs to debug the environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
