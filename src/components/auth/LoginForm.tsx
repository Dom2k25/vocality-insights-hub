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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm: React.FC = () => {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.getValues("email"),
        password: form.getValues("password"),
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        setUser({
          id: data.user.id,
          email: data.user.email!,
          role: profile.role,
          team_id: profile.team_id,
          full_name: profile.full_name
        });

        navigate('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Anmelden</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={form.getValues("email")}
                onChange={(e) => form.setValue("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={form.getValues("password")}
                onChange={(e) => form.setValue("password", e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
