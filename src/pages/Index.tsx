
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isUsingRealSupabase } from "@/lib/supabase";
import { setupDatabase } from "@/services/database";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if database needs initialization
    const initDatabase = async () => {
      try {
        // Check if Supabase is properly configured
        if (!isUsingRealSupabase()) {
          console.warn('Using placeholder Supabase configuration. Database initialization skipped.');
          toast.warning('⚠️ Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.');
          setInitializing(false);
          return;
        }

        // Try to check if database tables exist
        try {
          const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
          
          if (tablesError) {
            console.error('Error checking tables:', tablesError);
            
            // More specific error message
            if (tablesError.message.includes('not found') || tablesError.message.includes('get_tables')) {
              toast.error('RPC function "get_tables" not found. You need to create this in your Supabase SQL editor.');
              // Proceed with setup anyway as this is likely a new project
              await setupDatabase();
            } else {
              toast.error('Could not connect to database. Please check your Supabase configuration.');
              setError('Database connection failed. Ensure your Supabase URL and key are correct.');
            }
            
            setInitializing(false);
            return;
          }
          
          if (!tables || !Array.isArray(tables)) {
            console.warn('No tables data returned or invalid format');
            toast.warning('Could not verify database tables. Proceeding with setup anyway.');
            await setupDatabase();
            setInitializing(false);
            return;
          }
          
          const allTablesExist = 
            tables.includes('users') && 
            tables.includes('calls') && 
            tables.includes('keywords') && 
            tables.includes('teams');
            
          if (!allTablesExist) {
            // Database needs setup
            await setupDatabase();
          }
        } catch (rpcError) {
          console.error('Failed to check tables:', rpcError);
          toast.error('Database check failed. Setting up database anyway.');
          // Try to set up database even if check fails
          await setupDatabase();
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        toast.error('Database initialization failed. Please try again later.');
        setError('Failed to initialize the application. Please check your Supabase configuration.');
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

  // Show error state if there was an initialization error
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-4">
          <div className="text-destructive text-5xl mb-2">!</div>
          <h1 className="text-xl font-semibold text-destructive">Initialization Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Please check your Supabase configuration and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if authenticated, otherwise to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default Index;
