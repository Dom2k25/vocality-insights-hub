
import React, { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-vocality-600 flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-vocality-500 to-vocality-700 bg-clip-text text-transparent">
              Vocality
            </h1>
            <p className="text-muted-foreground mt-2">
              Voice Analytics Platform
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>© 2025 Vocality. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
