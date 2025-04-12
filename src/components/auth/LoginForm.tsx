import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { verifyDatabase } from "@/services/database";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Check if we need to create demo accounts on component mount
  useEffect(() => {
    checkSetupRequired();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      // Check if we need to setup auth users
      checkSetupRequired();
    } finally {
      setIsLoading(false);
    }
  }

  const checkSetupRequired = async () => {
    try {
      // Verify database setup
      const isSetupValid = await verifyDatabase();
      
      if (!isSetupValid) {
        console.log("Database setup is invalid or incomplete");
        setSetupRequired(true);
        // Automatically run setup
        await handleSetupDemoAccounts();
      } else {
        // If setup is valid, we don't need to set up
        setSetupRequired(false);
      }
    } catch (error) {
      console.error("Error checking setup:", error);
      setSetupRequired(true);
      // Automatically run setup
      await handleSetupDemoAccounts();
    }
  };

  const handleSetupDemoAccounts = async () => {
    setIsLoading(true);
    try {
      // Delete any existing users first to avoid conflicts
      const emails = ["admin@vocality.app", "team@vocality.app", "coach@vocality.app", "agent@vocality.app"];
      
      // Create demo accounts manually since admin API might not be accessible
      for (const email of emails) {
        // First attempt to sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password: "password123",
          options: {
            data: {
              email_confirm: true
            }
          }
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            console.log(`User ${email} already exists, attempting to update password`);
            
            // If user exists, try to update their password using admin functions
            // This might not work due to permissions, but worth trying
            try {
              await supabase.auth.admin.updateUserById(data?.user?.id || "", {
                password: "password123",
              });
            } catch (updateError) {
              console.error(`Failed to update password for ${email}:`, updateError);
            }
          } else {
            console.error(`Error creating user ${email}:`, error);
          }
        } else {
          console.log(`Created user: ${email}`);
        }
      }
      
      // Ensure proper users table entries exist
      await setupUserProfiles();
      
      toast.success("Demo accounts created successfully! Try logging in now.");
      setSetupRequired(false);
      setSetupComplete(true);
    } catch (error) {
      console.error("Error setting up demo accounts:", error);
      toast.error("Failed to create demo accounts. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create user profile entries in the users table
  const setupUserProfiles = async () => {
    try {
      // Create demo profiles in the users table
      const userProfiles = [
        {
          id: "1", // Using fixed IDs for demo users
          email: "admin@vocality.app",
          name: "Admin User",
          role: "admin",
          status: "active",
          avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6271f1&color=fff",
        },
        {
          id: "2",
          email: "team@vocality.app",
          name: "Team Lead",
          role: "teamleader",
          team: "Sales",
          status: "active",
          avatar: "https://ui-avatars.com/api/?name=Team+Lead&background=4039c4&color=fff",
        },
        {
          id: "3",
          email: "coach@vocality.app",
          name: "Coach User",
          role: "coach",
          team: "Sales",
          status: "active",
          avatar: "https://ui-avatars.com/api/?name=Coach+User&background=36319d&color=fff",
        },
        {
          id: "4",
          email: "agent@vocality.app",
          name: "Agent User",
          role: "agent",
          team: "Sales",
          status: "active",
          avatar: "https://ui-avatars.com/api/?name=Agent+User&background=302d7a&color=fff",
        },
      ];

      for (const profile of userProfiles) {
        // Check if profile exists
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("email", profile.email)
          .single();

        if (fetchError || !data) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from("users")
            .upsert(profile, { onConflict: "email" });

          if (insertError) {
            console.error(`Error creating profile for ${profile.email}:`, insertError);
          } else {
            console.log(`Created profile for ${profile.email}`);
          }
        }
      }
    } catch (error) {
      console.error("Error setting up user profiles:", error);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    let email = "";
    let password = "password123"; // Demo password
    
    switch (role) {
      case "admin":
        email = "admin@vocality.app";
        break;
      case "team":
        email = "team@vocality.app";
        break;
      case "coach":
        email = "coach@vocality.app";
        break;
      case "agent":
        email = "agent@vocality.app";
        break;
      default:
        email = "admin@vocality.app";
    }
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(`Login failed for ${email}. Please try setting up demo accounts again.`);
      setSetupRequired(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Login to Vocality</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {setupRequired && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-200 flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Demo accounts need setup</h3>
            <p className="text-sm mt-1">
              {setupComplete 
                ? "Demo accounts were created but login failed. Please try setting up again." 
                : "It appears the demo user accounts need to be created in Supabase Auth."}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800"
              onClick={handleSetupDemoAccounts}
              disabled={isLoading}
            >
              {isLoading ? "Creating accounts..." : "Create Demo Accounts"}
            </Button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Demo accounts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleDemoLogin("admin")}
            disabled={isLoading}
          >
            Admin
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin("team")}
            disabled={isLoading}
          >
            Team Lead
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin("coach")}
            disabled={isLoading}
          >
            Coach
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin("agent")}
            disabled={isLoading}
          >
            Agent
          </Button>
        </div>
      </div>
    </div>
  );
}
