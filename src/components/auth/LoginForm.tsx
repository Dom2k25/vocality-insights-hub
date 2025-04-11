
import React, { useState } from "react";
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
import { InfoCircle } from "lucide-react";

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
    // Check if we have any auth users at all
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error checking auth users:", error);
      if (error.message.includes("not allowed")) {
        // No admin access, likely demo users not created
        setSetupRequired(true);
      }
      return;
    }
    
    if (!data?.users || data.users.length === 0) {
      setSetupRequired(true);
    }
  };

  const handleSetupDemoAccounts = async () => {
    setIsLoading(true);
    try {
      // Create demo accounts manually since admin API might not be accessible
      for (const email of ["admin@vocality.app", "team@vocality.app", "coach@vocality.app", "agent@vocality.app"]) {
        const { error } = await supabase.auth.signUp({
          email,
          password: "password123",
          options: {
            data: {
              email_confirm: true
            }
          }
        });
        
        if (error) {
          console.error(`Error creating user ${email}:`, error);
        } else {
          console.log(`Created user: ${email}`);
        }
      }
      
      toast.success("Demo accounts created successfully! Try logging in now.");
      setSetupRequired(false);
    } catch (error) {
      console.error("Error setting up demo accounts:", error);
      toast.error("Failed to create demo accounts. Please check console for details.");
    } finally {
      setIsLoading(false);
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
      // Check if we need to setup auth users
      checkSetupRequired();
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
          <InfoCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Demo accounts need setup</h3>
            <p className="text-sm mt-1">
              It appears the demo user accounts need to be created in Supabase Auth.
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
