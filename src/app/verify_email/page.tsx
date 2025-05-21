"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Mail, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get email from URL params (in a real app, you might store this in a more secure way)
  const email = searchParams.get("email") || ""

  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Handle the countdown timer for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  // Format the masked email for display
  const maskEmail = (email: string) => {
    if (!email) return ""
    const [username, domain] = email.split("@")
    if (!username || !domain) return email

    const maskedUsername =
      username.length > 2 ? `${username.substring(0, 2)}${"*".repeat(username.length - 2)}` : username

    return `${maskedUsername}@${domain}`
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!verificationCode) {
      setError("Please enter the verification code")
      setIsLoading(false)
      return
    }

    try {
      // Here you would call your API to verify the code
      // const response = await fetch('/api/auth/verify-email-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email,
      //     code: verificationCode
      //   }),
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Verification failed');
      // }

      // Simulate API call
      setTimeout(() => {
        // For demo purposes, let's say code "123456" is valid
        if (verificationCode === "123456") {
          // Redirect to dashboard or next step after successful verification
          router.push("/dashboard")
        } else {
          setError("Invalid verification code. Please try again.")
          setIsLoading(false)
        }
      }, 1500)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to verify code. Please try again.")
      }
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setResendDisabled(true)
    setCountdown(60) // Disable resend for 60 seconds

    try {
      // Here you would call your API to resend the verification code
      // const response = await fetch('/api/auth/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Failed to resend code');
      // }

      // Simulate API call
      setTimeout(() => {
        // Show success message
        setError("") // Clear any existing errors
      }, 1000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to resend verification code. Please try again.")
      }
    }
  }

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
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">Enter the verification code sent to your email</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex items-center justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div className="text-center space-y-2 mb-4">
              <p className="text-sm text-slate-600">We've sent a verification code to:</p>
              <p className="font-medium">{maskEmail(email)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="text-center text-lg tracking-widest"
                required
                maxLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Didn't receive the code?</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={resendDisabled}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                {resendDisabled ? `Resend code in ${countdown}s` : "Resend verification code"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button type="button" variant="outline" size="sm" className="flex items-center" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}