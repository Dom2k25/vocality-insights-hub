
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

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
  };

  // Function to fetch all users
  const fetchUsers = async () => {
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
        const userData = await fetchUserProfile(currentSession.user.id);
        if (userData) {
          setUser(userData);
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
        const userData = await fetchUserProfile(newSession.user.id);
        if (userData) {
          setUser(userData);
          toast.success("Login successful");
        } else {
          // User exists in auth but not in the users table
          toast.error("User profile not found");
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
