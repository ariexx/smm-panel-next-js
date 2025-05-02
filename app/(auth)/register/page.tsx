"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingRef, setValidatingRef] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setValidatingRef(true);
      const validateReferralCode = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, username')
            .eq('referral_code', refCode)
            .single();

          if (error) {
            if (error.code === 'PGRST116') { // No rows found
              toast({
                title: "Invalid Referral Code",
                description: "The referral code you used was not found.",
                variant: "destructive",
              });
            } else {
              console.error("Error validating referral code:", error);
            }
          } else if (data) {
            setReferrerId(data.id);
            setReferrerName(data.username);
          }
        } catch (error) {
          console.error("Error validating referral:", error);
        } finally {
          setValidatingRef(false);
        }
      };
      
      validateReferralCode();
    }
  }, [searchParams, supabase, toast]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique referral code for this new user
      // (We'll generate a random one here but the backend will overwrite with its own if needed)
      const randomCode = Math.random().toString(36).substring(2, 10);

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            // Include referrer_id if it exists
            ...(referrerId && { referrer_id: referrerId }),
            // Generate a default referral code (might be overwritten by backend)
            referral_code: randomCode
          },
          // Redirect to login after email verification
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        throw authError;
      }

      // Add a slight delay to ensure the user is created in auth.users
      await new Promise(resolve => setTimeout(resolve, 500));

      if (authData.user) {
        // Ensure the user record in the 'users' table has all the needed information
        // The trigger should handle most of this, but we'll do a upsert as a backup
        const { error: upsertError } = await supabase
          .from("users")
          .upsert([
            {
              id: authData.user.id,
              email: email,
              username: username,
              balance: 0,
              role: "user",
              referral_code: randomCode,
              ...(referrerId && { referred_by: referrerId }),
            }
          ], 
          { onConflict: 'id', ignoreDuplicates: false });

        if (upsertError) {
          console.warn("Upsert error:", upsertError);
          // We'll still consider registration successful even if this fails
          // since the auth record was created and the trigger should handle basics
        }
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email for verification.",
      });

      router.push("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
          {referrerName && (
            <Alert className="mt-4 bg-primary/10 border-primary/30">
              <AlertDescription>
                You were invited by <span className="font-semibold">{referrerName}</span>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading || validatingRef}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || validatingRef}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || validatingRef}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || validatingRef}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}