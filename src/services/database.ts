
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
    // Check if user already exists in auth
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error checking if auth user exists:', getUserError);
      return;
    }
    
    const existingUser = users?.find(user => user.email === email);
    
    if (!existingUser) {
      // Create auth user if it doesn't exist
      console.log(`Creating auth user for ${email}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });
      
      if (error) {
        console.error(`Error creating auth user for ${email}:`, error);
      } else {
        console.log(`Auth user created for ${email}`);
      }
    } else {
      console.log(`Auth user for ${email} already exists`);
    }
  } catch (error) {
    console.error(`Error in createAuthUser for ${email}:`, error);
  }
};

// Setup function - This would be called once to initialize database with test data
export const setupDatabase = async () => {
  console.log("Setting up database with test data...");
  
  // Create teams table if it doesn't exist
  const { error: teamsTableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS public.teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  if (teamsTableError) console.error("Error creating teams table:", teamsTableError);
  
  // Create users table if it doesn't exist
  const { error: usersTableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      team TEXT,
      avatar TEXT,
      status TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  if (usersTableError) console.error("Error creating users table:", usersTableError);
  
  // Create calls table if it doesn't exist
  const { error: callsTableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS public.calls (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES public.users(id),
      customer_name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      score INTEGER NOT NULL,
      recording_url TEXT,
      transcript TEXT,
      analysis JSONB
    );
  `);
  
  if (callsTableError) console.error("Error creating calls table:", callsTableError);
  
  // Create keywords table if it doesn't exist
  const { error: keywordsTableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS public.keywords (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      count INTEGER NOT NULL,
      team_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  if (keywordsTableError) console.error("Error creating keywords table:", keywordsTableError);
  
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

