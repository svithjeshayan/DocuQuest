"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Send } from "lucide-react";

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

export default function SendPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setStatus("Failed to load EmailJS. Please check your internet connection.");
    };
    document.body.appendChild(script);

    console.log("EmailJS Config:", {
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    });

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setIsLoading(true);

    // Validate inputs
    if (!email || !otpCode) {
      setStatus("Email and OTP code are required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      const templateParams = {
        to_email: "vithjeshayan2107@gmail.com",
        email,
        otpCode,
        passcode: "test123",
        time: "14:30",
      };
      console.log("Sending EmailJS with params:", templateParams);

      const response = await window.emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_dwb1ztp",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_jtlvai3",
        templateParams
      );

      console.log("EmailJS response:", response.status, response.text);
      setStatus(`Email sent: ${response.status}, ${response.text}`);
      setEmail("");
      setOtpCode("");
      setIsLoading(false);
    } catch (err: any) {
      console.error("Send message error:", err);
      const errorMessage =
        err.status && err.text
          ? `EmailJS error (${err.status}): ${err.text}`
          : err.message || "An unexpected error occurred. Please try again.";
      setStatus(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Send OTP Email</CardTitle>
          <CardDescription className="text-center">
            Send an OTP to vithjeshayan2107@gmail.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Send className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otpCode" className="text-sm font-medium">
                OTP Code
              </Label>
              <Input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="pl-10"
                required
              />
            </div>
            {status && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                  status.includes("Error")
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{status}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}