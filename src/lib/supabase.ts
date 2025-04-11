
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
