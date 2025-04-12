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

// New function to create a user
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  team?: string;
}) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role
      }
    }
  });

  if (authError) {
    throw new Error(`Error creating auth user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('Failed to create auth user');
  }

  // Then create the user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      team: userData.team,
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6271f1&color=fff`
    });

  if (profileError) {
    // If profile creation fails, we should clean up the auth user
    try {
      await supabase.auth.admin.deleteUser(authData.user.id);
    } catch (cleanupError) {
      console.error('Failed to clean up auth user after profile creation error:', cleanupError);
    }
    throw new Error(`Error creating user profile: ${profileError.message}`);
  }

  return { id: authData.user.id, ...userData };
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
  
  try {
    // Execute the SQL script to create tables and insert initial data
    const { error: setupError } = await supabase.rpc('exec', {
      query: `
        -- Create teams table
        CREATE TABLE IF NOT EXISTS public.teams (
            id text PRIMARY KEY,
            name text NOT NULL,
            created_at timestamp with time zone DEFAULT current_timestamp
        );

        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
            id text PRIMARY KEY,
            email text UNIQUE NOT NULL,
            name text NOT NULL,
            role text NOT NULL,
            team text REFERENCES public.teams(id),
            avatar text,
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT current_timestamp
        );

        -- Create calls table
        CREATE TABLE IF NOT EXISTS public.calls (
            id text PRIMARY KEY,
            user_id text REFERENCES public.users(id),
            customer_name text NOT NULL,
            duration integer NOT NULL,
            timestamp timestamp with time zone DEFAULT current_timestamp,
            score integer NOT NULL,
            recording_url text,
            transcript text,
            analysis jsonb,
            created_at timestamp with time zone DEFAULT current_timestamp
        );

        -- Create keywords table
        CREATE TABLE IF NOT EXISTS public.keywords (
            id text PRIMARY KEY,
            text text NOT NULL,
            sentiment text NOT NULL,
            count integer NOT NULL DEFAULT 0,
            team_id text REFERENCES public.teams(id),
            created_at timestamp with time zone DEFAULT current_timestamp
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
        CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team);
        CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
        CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON public.calls(timestamp);
        CREATE INDEX IF NOT EXISTS idx_keywords_team_id ON public.keywords(team_id);

        -- Insert default team if it doesn't exist
        INSERT INTO public.teams (id, name)
        VALUES ('1', 'Sales')
        ON CONFLICT (id) DO NOTHING;

        -- Insert demo users if they don't exist
        INSERT INTO public.users (id, email, name, role, team, status, avatar)
        VALUES 
            ('1', 'admin@vocality.app', 'Admin User', 'admin', '1', 'active', 'https://ui-avatars.com/api/?name=Admin+User&background=6271f1&color=fff'),
            ('2', 'team@vocality.app', 'Team Lead', 'teamleader', '1', 'active', 'https://ui-avatars.com/api/?name=Team+Lead&background=4039c4&color=fff'),
            ('3', 'coach@vocality.app', 'Coach User', 'coach', '1', 'active', 'https://ui-avatars.com/api/?name=Coach+User&background=36319d&color=fff'),
            ('4', 'agent@vocality.app', 'Agent User', 'agent', '1', 'active', 'https://ui-avatars.com/api/?name=Agent+User&background=302d7a&color=fff')
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (setupError) {
      console.error("Error setting up database:", setupError);
      throw setupError;
    }

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error in database setup:", error);
    throw error;
  }
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

// Add this new function to verify database setup
export const verifyDatabase = async () => {
  try {
    console.log("Verifying database setup...");
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return false;
    }

    const requiredTables = ['teams', 'users', 'calls', 'keywords'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.error("Missing tables:", missingTables);
      return false;
    }

    // Check if demo users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .in('email', [
        'admin@vocality.app',
        'team@vocality.app',
        'coach@vocality.app',
        'agent@vocality.app'
      ]);

    if (usersError) {
      console.error("Error checking users:", usersError);
      return false;
    }

    if (!users || users.length !== 4) {
      console.error("Demo users not found or incomplete");
      return false;
    }

    // Check if default team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', '1')
      .single();

    if (teamError || !team) {
      console.error("Default team not found");
      return false;
    }

    console.log("Database verification successful!");
    return true;
  } catch (error) {
    console.error("Error in database verification:", error);
    return false;
  }
};

// Speech Analysis Functions
export const analyzeCallTranscript = async (transcript: string) => {
  try {
    // Basic sentiment analysis
    const sentiment = analyzeSentiment(transcript);
    
    // Keyword extraction
    const keywords = extractKeywords(transcript);
    
    // Topic detection
    const topics = detectTopics(transcript);
    
    // Emotion analysis
    const emotions = analyzeEmotions(transcript);
    
    // Conversation flow analysis
    const flow = analyzeConversationFlow(transcript);

    return {
      sentiment,
      keywords,
      topics,
      emotions,
      flow,
      transcript
    };
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    throw error;
  }
};

// Helper function for sentiment analysis
const analyzeSentiment = (text: string) => {
  // Basic sentiment analysis implementation
  const positiveWords = ['great', 'excellent', 'good', 'happy', 'satisfied', 'perfect', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'poor', 'unhappy', 'dissatisfied', 'awful', 'horrible'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    else if (negativeWords.includes(word)) negativeCount++;
    else neutralCount++;
  });
  
  const total = positiveCount + negativeCount + neutralCount;
  
  return {
    positive: (positiveCount / total) * 100,
    negative: (negativeCount / total) * 100,
    neutral: (neutralCount / total) * 100,
    overall: positiveCount > negativeCount ? 'positive' : 
             negativeCount > positiveCount ? 'negative' : 'neutral'
  };
};

// Helper function for keyword extraction
const extractKeywords = (text: string) => {
  // Basic keyword extraction implementation
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = text.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  
  words.forEach(word => {
    if (!commonWords.includes(word) && word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

// Helper function for topic detection
const detectTopics = (text: string) => {
  // Basic topic detection implementation
  const topics = [
    { name: 'Product Inquiry', keywords: ['product', 'feature', 'specification', 'price'] },
    { name: 'Technical Support', keywords: ['error', 'problem', 'issue', 'help', 'support'] },
    { name: 'Billing', keywords: ['payment', 'invoice', 'bill', 'charge', 'cost'] },
    { name: 'Account', keywords: ['account', 'login', 'password', 'register', 'sign up'] }
  ];
  
  const detectedTopics = topics.map(topic => {
    const matches = topic.keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    return {
      topic: topic.name,
      relevance: (matches / topic.keywords.length) * 100
    };
  }).filter(topic => topic.relevance > 0);
  
  return detectedTopics.sort((a, b) => b.relevance - a.relevance);
};

// Helper function for emotion analysis
const analyzeEmotions = (text: string) => {
  // Basic emotion analysis implementation
  const emotions = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful'],
    sad: ['sad', 'unhappy', 'disappointed', 'frustrated'],
    angry: ['angry', 'mad', 'furious', 'upset'],
    neutral: ['okay', 'fine', 'alright', 'normal']
  };
  
  const emotionCounts: Record<string, number> = {};
  let totalEmotions = 0;
  
  Object.entries(emotions).forEach(([emotion, keywords]) => {
    const count = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    emotionCounts[emotion] = count;
    totalEmotions += count;
  });
  
  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    percentage: totalEmotions > 0 ? (count / totalEmotions) * 100 : 0
  }));
};

// Helper function for conversation flow analysis
const analyzeConversationFlow = (text: string) => {
  // Basic conversation flow analysis implementation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    totalSentences: sentences.length,
    averageSentenceLength: sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length,
    questionCount: sentences.filter(s => s.trim().endsWith('?')).length,
    exclamationCount: sentences.filter(s => s.trim().endsWith('!')).length
  };
};
