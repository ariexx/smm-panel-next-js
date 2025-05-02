// SMM Panel/components/mock-auth.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function MockAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Mock user data
  const mockUsers = {
    admin: {
      email: "admin@example.com",
      password: "admin123",
      username: "Admin User",
      role: "admin",
      balance: 500,
    },
    user: {
      email: "user@example.com",
      password: "user123",
      username: "Regular User",
      role: "user",
      balance: 100,
    },
  };

  const mockLogin = async (userType: "admin" | "user") => {
    setLoading(true);

    try {
      // 1. First, attempt to sign in with the mock credentials
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: mockUsers[userType].email,
          password: mockUsers[userType].password,
        });

      // If the user doesn't exist, we'll create it
      if (
        authError &&
        authError.message.includes("Invalid login credentials")
      ) {
        // Create the user with signup
        const { data: signupData, error: signupError } =
          await supabase.auth.signUp({
            email: mockUsers[userType].email,
            password: mockUsers[userType].password,
            options: {
              data: {
                username: mockUsers[userType].username,
              },
            },
          });

        if (signupError) {
          throw signupError;
        }

        // If user was created, insert into users table with appropriate role
        if (signupData.user) {
          const { error: profileError } = await supabase.from("users").upsert([
            {
              id: signupData.user.id,
              email: mockUsers[userType].email,
              username: mockUsers[userType].username,
              role: mockUsers[userType].role,
              balance: mockUsers[userType].balance,
            },
          ]);

          if (profileError) {
            console.error("Error updating user profile:", profileError);
          }

          // Try to log in again after creating the user
          await supabase.auth.signInWithPassword({
            email: mockUsers[userType].email,
            password: mockUsers[userType].password,
          });
        }
      }

      toast({
        title: "Mock login successful",
        description: `Logged in as ${userType}`,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Mock login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Development Mock Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={() => mockLogin("admin")}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => mockLogin("user")}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Regular User"}
        </Button>
      </CardContent>
    </Card>
  );
}
