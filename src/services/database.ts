import { supabase } from '@/lib/supabase';
import { UserRole } from '@/contexts/AuthContext';

// User functions
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Call functions
export const fetchCalls = async (userId?: string, limit = 10) => {
  let query = supabase
    .from('calls')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const fetchCallById = async (callId: string) => {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('id', callId)
    .single();

  if (error) throw error;
  return data;
};

// Team functions
export const fetchTeams = async () => {
  const { data, error } = await supabase
    .from('teams')
    .select('*');

  if (error) throw error;
  return data;
};

// Keyword functions
export const fetchKeywords = async (teamId?: string) => {
  let query = supabase
    .from('keywords')
    .select('*')
    .order('count', { ascending: false });

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Analytics functions
export const fetchAnalytics = async (userId?: string, period: 'day' | 'week' | 'month' = 'week') => {
  // In a real app, this would be a more complex query with grouping and aggregations
  // For now, we'll simulate it by fetching recent calls
  let query = supabase
    .from('calls')
    .select('*')
    .order('timestamp', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  // Limit based on period
  const limit = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  
  // Process data for visualization
  // In a real app, this would be done by the database
  const processedData = {
    calls: data.length,
    avgDuration: data.reduce((acc, call) => acc + call.duration, 0) / (data.length || 1),
    avgScore: data.reduce((acc, call) => acc + call.score, 0) / (data.length || 1),
    timeline: data.map(call => ({
      timestamp: call.timestamp,
      score: call.score,
      duration: call.duration
    }))
  };
  
  return processedData;
};

// Helper function to create auth users
const createAuthUser = async (email: string, password: string) => {
  try {
    // Instead of using admin API which might not be accessible in some environments,
    // use signUp method which is always available
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email_confirm: true
        }
      }
    });
    
    if (error) {
      console.error(`Error creating auth user for ${email}:`, error);
    } else {
      console.log(`Auth user created for ${email}`);
    }
  } catch (error) {
    console.error(`Error in createAuthUser for ${email}:`, error);
  }
};

// Setup function - This would be called once to initialize database with test data
export const setupDatabase = async () => {
  console.log("Setting up database with test data...");
  
  // Create tables using RPC function
  try {
    const { error: tablesRpcError } = await supabase.rpc('create_teams_table_if_not_exists');
    if (tablesRpcError) {
      console.error("Error creating tables:", tablesRpcError);
      // Fall back to manual creation
      await createTablesManually();
    }
  } catch (error) {
    console.error("Error using RPC to create tables:", error);
    // Fall back to manual creation
    await createTablesManually();
  }
  
  // Insert a team if it doesn't exist
  const { error: teamInsertError } = await supabase
    .from('teams')
    .upsert({ 
      id: '1', 
      name: 'Sales'
    }, { onConflict: 'id' });
  
  if (teamInsertError) console.error("Error inserting team:", teamInsertError);

  const testUsers = [
    {
      id: '1',
      email: 'admin@vocality.app',
      name: 'Admin User',
      role: UserRole.ADMIN,
      status: 'active',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6271f1&color=fff',
    },
    {
      id: '2',
      email: 'team@vocality.app',
      name: 'Team Lead',
      role: UserRole.TEAM_LEADER,
      team: 'Sales',
      status: 'active',
      avatar: 'https://ui-avatars.com/api/?name=Team+Lead&background=4039c4&color=fff',
    },
    {
      id: '3',
      email: 'coach@vocality.app',
      name: 'Coach User',
      role: UserRole.COACH,
      team: 'Sales',
      status: 'active',
      avatar: 'https://ui-avatars.com/api/?name=Coach+User&background=36319d&color=fff',
    },
    {
      id: '4',
      email: 'agent@vocality.app',
      name: 'Agent User',
      role: UserRole.AGENT,
      team: 'Sales',
      status: 'active',
      avatar: 'https://ui-avatars.com/api/?name=Agent+User&background=302d7a&color=fff',
    },
  ];

  // Insert test users if they don't exist
  for (const user of testUsers) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (error || !data) {
      await supabase.from('users').insert(user);
    }
    
    // Create auth users for demo accounts
    await createAuthUser(user.email, 'password123');
  }
  
  console.log("Database setup completed!");
};

// Helper function to manually create tables if RPC fails
const createTablesManually = async () => {
  console.log("Attempting to create tables manually...");

  try {
    // Create teams table
    const { error: teamsError } = await supabase
      .rpc('exec', { query: `
        CREATE TABLE IF NOT EXISTS public.teams (
          id text PRIMARY KEY,
          name text NOT NULL,
          created_at timestamp with time zone DEFAULT current_timestamp
        );
      `})
      .single();
    if (teamsError) console.error("Error creating teams table:", teamsError);

    // Create users table
    const { error: usersError } = await supabase
      .rpc('exec', { query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id text PRIMARY KEY,
          email text UNIQUE NOT NULL,
          name text NOT NULL,
          role text NOT NULL,
          team text,
          avatar text,
          status text,
          created_at timestamp with time zone DEFAULT current_timestamp
        );
      `})
      .single();
    if (usersError) console.error("Error creating users table:", usersError);

    // Create calls table
    const { error: callsError } = await supabase
      .rpc('exec', { query: `
        CREATE TABLE IF NOT EXISTS public.calls (
          id text PRIMARY KEY,
          user_id text REFERENCES public.users(id),
          customer_name text NOT NULL,
          duration integer NOT NULL,
          timestamp timestamp with time zone DEFAULT current_timestamp,
          score integer NOT NULL,
          recording_url text,
          transcript text,
          analysis jsonb
        );
      `})
      .single();
    if (callsError) console.error("Error creating calls table:", callsError);

    // Create keywords table
    const { error: keywordsError } = await supabase
      .rpc('exec', { query: `
        CREATE TABLE IF NOT EXISTS public.keywords (
          id text PRIMARY KEY,
          text text NOT NULL,
          sentiment text NOT NULL,
          count integer NOT NULL,
          team_id text,
          created_at timestamp with time zone DEFAULT current_timestamp
        );
      `})
      .single();
    if (keywordsError) console.error("Error creating keywords table:", keywordsError);

    console.log("Manual table creation attempts completed");
  } catch (error) {
    console.error("Error in manual table creation:", error);
    
    // Fallback to even more basic approach - just try insertions and let them create tables
    try {
      console.log("Trying basic insertions as fallback...");
      
      // Try inserting into teams
      await supabase.from('teams').insert({ id: '1', name: 'Sales' }).select();
      
      // Try inserting a test user
      await supabase.from('users').insert({
        id: '1',
        email: 'admin@vocality.app',
        name: 'Admin User',
        role: UserRole.ADMIN,
        status: 'active'
      }).select();
      
      // Try inserting a test call
      await supabase.from('calls').insert({
        id: '1',
        user_id: '1',
        customer_name: 'Test Customer',
        duration: 60,
        score: 80
      }).select();
      
      // Try inserting a test keyword
      await supabase.from('keywords').insert({
        id: '1',
        text: 'Test Keyword',
        sentiment: 'positive',
        count: 10
      }).select();
      
    } catch (fallbackError) {
      console.error("Fallback insertion approach failed:", fallbackError);
    }
  }
};
