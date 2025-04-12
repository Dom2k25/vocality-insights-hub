import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  TEAM_LEADER = "teamleader",
  COACH = "coach",
  AGENT = "agent",
}

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team?: string;
  avatar?: string;
  status?: "active" | "inactive";
}

// Define context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  refreshUsers: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.error('User profile not found');
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        team: data.team,
        avatar: data.avatar,
        status: data.status as "active" | "inactive",
      };
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      return null;
    }
  };

  // Function to fetch all users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data.map(userData => ({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        team: userData.team,
        avatar: userData.avatar,
        status: userData.status as "active" | "inactive",
      }));
    } catch (error) {
      console.error('Exception fetching users:', error);
      return [];
    }
  };

  // Refresh users function
  const refreshUsers = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        try {
          const userData = await fetchUserProfile(currentSession.user.id);
          if (userData) {
            setUser(userData);
          } else {
            // Try to match by email if ID doesn't work
            const { data: userByEmail, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', currentSession.user.email)
              .single();
              
            if (!error && userByEmail) {
              setUser({
                id: userByEmail.id,
                email: userByEmail.email,
                name: userByEmail.name,
                role: userByEmail.role as UserRole,
                team: userByEmail.team,
                avatar: userByEmail.avatar,
                status: userByEmail.status as "active" | "inactive",
              });
            }
          }
        } catch (error) {
          console.error('Error setting user in init:', error);
        }
      }
      
      // Fetch all users
      const allUsers = await fetchUsers();
      setUsers(allUsers);
      
      setIsLoading(false);
    };

    initAuth();

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          let userData = await fetchUserProfile(newSession.user.id);
          
          if (!userData) {
            // Try to find the user by email as a fallback
            const { data: userByEmail, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', newSession.user.email)
              .single();
              
            if (!error && userByEmail) {
              userData = {
                id: userByEmail.id,
                email: userByEmail.email,
                name: userByEmail.name,
                role: userByEmail.role as UserRole,
                team: userByEmail.team,
                avatar: userByEmail.avatar,
                status: userByEmail.status as "active" | "inactive",
              };
            }
          }
          
          if (userData) {
            setUser(userData);
            toast.success("Login successful");
          } else {
            // User exists in auth but not in the users table
            toast.error("User profile not found");
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          toast.error("Error loading user profile");
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        toast.info("Logged out successfully");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error("Logout failed: " + (error as Error).message);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Create user profile in your database
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          name,
          role: 'agent', // Default role
          status: 'active',
        },
      ]);
      if (dbError) throw dbError;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        users,
        refreshUsers,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
