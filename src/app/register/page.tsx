"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, LockKeyhole, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

// Type definition for EmailJS
interface EmailJS {
  init: (config: { publicKey: string; blockHeadless?: boolean; limitRate?: { id: string; throttle: number } }) => void;
  send: (serviceId: string, templateId: string, templateParams: Record<string, string>) => Promise<{ status: number; text: string }>;
}

declare global {
  interface Window {
    emailjs: EmailJS;
  }
}

enum RegistrationStep {
  REGISTRATION = 0,
  OTP_VERIFICATION = 1,
}

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);

  // UI state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.REGISTRATION);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);

  // Initialize EmailJS
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      window.emailjs.init({
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "G7JEeLSEyqMuYoT2y",
        blockHeadless: true,
        limitRate: { id: "app", throttle: 10000 },
      });
      console.log("EmailJS initialized");
    };
    script.onerror = () => {
      console.error("Failed to load EmailJS script");
      setError("Failed to load EmailJS. Please check your internet connection.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Handle OTP expiry countdown
  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpExpiry === 0 && otpSent) {
      setError("Verification code has expired. Please request a new one.");
      setOtpSent(false);
    }
  }, [otpExpiry, otpSent]);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInitialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Register user first to get server-generated OTP
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Send OTP email using EmailJS with server-generated OTP
      const templateParams = {
        to_email: email,
        email,
        otpCode: data.otpCode,
        passcode: "test123",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      console.log("Sending EmailJS with params:", templateParams);

      const emailResponse = await window.emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_dwb1ztp",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_jtlvai3",
        templateParams
      );

      console.log("EmailJS response:", emailResponse.status, emailResponse.text);

      setUserId(data.userId);
      setOtpCode(data.otpCode);
      setCurrentStep(RegistrationStep.OTP_VERIFICATION);
      setOtpSent(true);
      setResendDisabled(true);
      setCountdown(60);
      setOtpExpiry(300);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage =
        err.status && err.text
          ? `EmailJS error (${err.status}): ${err.text}`
          : err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Request new OTP from backend
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      // Send OTP email using EmailJS with server-generated OTP
      const templateParams = {
        to_email: email,
        email,
        otpCode: data.otpCode,
        passcode: "test123",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      console.log("Sending EmailJS with params:", templateParams);

      const emailResponse = await window.emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_dwb1ztp",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_jtlvai3",
        templateParams
      );

      console.log("EmailJS response:", emailResponse.status, emailResponse.text);

      setOtpCode(data.otpCode);
      setOtpSent(true);
      setResendDisabled(true);
      setCountdown(60);
      setOtpExpiry(300);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      const errorMessage =
        err.status && err.text
          ? `EmailJS error (${err.status}): ${err.text}`
          : err.message || "Failed to send verification code. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!otp) {
      setError("Please enter the verification code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Failed to verify code. Please try again.");
      setIsLoading(false);
    }
  };

  // Mask email for display
  const maskEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;

    const maskedUsername =
      username.length > 2
        ? `${username.substring(0, 2)}${"*".repeat(username.length - 2)}`
        : username;

    return `${maskedUsername}@${domain}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4"
      style={{ backgroundImage: "url('https://researchleap.com/wp-content/uploads/2023/03/1.jpg')" }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      ></div>

      <Card className="w-full max-w-md shadow-lg bg-white" style={{ zIndex: 2 }}>
        <CardHeader className="space-y-1">
          {currentStep === RegistrationStep.REGISTRATION && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">Enter your information to sign up</CardDescription>
            </>
          )}

          {currentStep === RegistrationStep.OTP_VERIFICATION && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
              <CardDescription className="text-center">
                Enter the verification code sent to {maskEmail(email)}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {currentStep === RegistrationStep.REGISTRATION && (
            <form onSubmit={handleInitialSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          )}

          {currentStep === RegistrationStep.OTP_VERIFICATION && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
              </div>

              <div className="text-center space-y-2 mb-4">
                <p className="text-sm text-slate-600">A verification code was sent to your email.</p>
                <p className="text-sm text-slate-600">The code expires in {formatTime(otpExpiry)}.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  onClick={sendOTP}
                  disabled={resendDisabled || isLoading}
                  className="text-sm"
                >
                  {resendDisabled ? `Resend code in ${formatTime(countdown)}` : "Resend code"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Button
            variant="link"
            onClick={() => router.push("/login")}
            className="text-sm flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}