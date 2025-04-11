
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { setupDatabase } from "@/services/database";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if database needs initialization
    const initDatabase = async () => {
      try {
        // Check if database tables exist
        const { data: tables } = await supabase.rpc('get_tables');
        const allTablesExist = 
          tables.includes('users') && 
          tables.includes('calls') && 
          tables.includes('keywords') && 
          tables.includes('teams');
          
        if (!allTablesExist) {
          // Database needs setup
          await setupDatabase();
        }
      } catch (error) {
        console.error('Database initialization error:', error);
      } finally {
        setInitializing(false);
      }
    };

    if (!isLoading) {
      initDatabase();
    }
  }, [isLoading]);

  // Show loading state
  if (isLoading || initializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {initializing ? "Initializing application..." : "Loading..."}
          </span>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if authenticated, otherwise to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default Index;
