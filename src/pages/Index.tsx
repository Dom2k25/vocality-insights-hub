
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
      if (initializing) {
        try {
          console.log("Initializing database...");
          
          // More direct approach - just try to set up the database
          await setupDatabase();
          
          // If we get here, setup was (at least partially) successful
          console.log("Database initialization completed");
          setInitializing(false);
        } catch (error) {
          console.error("Database initialization error:", error);
          toast.error("Database initialization failed. Please try again later.");
          setError("Failed to initialize the application. Please check your Supabase configuration.");
          setInitializing(false);
        }
      }
    };

    if (!isLoading) {
      initDatabase();
    }
  }, [isLoading, initializing]);

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
