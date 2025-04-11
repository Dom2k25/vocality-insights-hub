
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

// When connecting to Supabase via Lovable's integration, these environment
// variables are automatically set when the project is connected.
// We fall back to hardcoded values for development only.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Add console logs to debug the environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
