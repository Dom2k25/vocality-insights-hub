
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@vocality.app",
    name: "Admin User",
    role: UserRole.ADMIN,
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6271f1&color=fff",
  },
  {
    id: "2",
    email: "team@vocality.app",
    name: "Team Lead",
    role: UserRole.TEAM_LEADER,
    team: "Sales",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Team+Lead&background=4039c4&color=fff",
  },
  {
    id: "3",
    email: "coach@vocality.app",
    name: "Coach User",
    role: UserRole.COACH,
    team: "Sales",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Coach+User&background=36319d&color=fff",
  },
  {
    id: "4",
    email: "agent@vocality.app",
    name: "Agent User",
    role: UserRole.AGENT,
    team: "Sales",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Agent+User&background=302d7a&color=fff",
  },
];

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("vocality-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      // In a real app, we would verify the password here
      // For demo purposes, any password is accepted
      
      // Set user in state and localStorage
      setUser(foundUser);
      localStorage.setItem("vocality-user", JSON.stringify(foundUser));
      
      toast.success("Login successful");
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("vocality-user");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        users: mockUsers,
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
