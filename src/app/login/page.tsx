//src\app\login\page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if email exists in localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Handle "Remember me" functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Use a generic message for all credential-related errors
        if (
          result.error === "No user found with this email" ||
          result.error === "Invalid password"
        ) {
          setError("Invalid email or password");
        } else if (result.error === "Please enter email and password") {
          setError("Email and password are required");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4" style={{ backgroundImage: "url('https://researchleap.com/wp-content/uploads/2023/03/1.jpg')"}}>
      <div style={{ background: "rgba(0, 0, 0, 0.6)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        </div>
      
      <Card className="w-full max-w-md shadow-lg bg-white" style={{ zIndex: 2 }}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                Remember me
              </Label>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading} variant="default">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        <CardFooter className="text-center justify-center">
          <p className="text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/src/app/sign up/page.tsx")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </CardFooter>

        </CardContent>
      </Card>
    </div>

  );
}