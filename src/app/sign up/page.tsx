"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LockKeyhole, Mail, User, AlertCircle, Shield, ArrowLeft } from "lucide-react"
import Image from "next/image"

// Enum to track the registration steps
enum RegistrationStep {
  CREDENTIALS = 0,
  TWO_FACTOR_SETUP = 1,
  TWO_FACTOR_VERIFY = 2,
}

export default function SignupPage() {
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")

  // UI state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.CREDENTIALS)

  // 2FA state
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secretKey, setSecretKey] = useState("")

  const router = useRouter()

  const handleInitialSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!name || !email || !password) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Here you would call your API to register the user
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Registration failed');
      // }

      // For demo purposes, we'll simulate a successful registration
      // and generate a fake QR code URL and secret key

      // In a real implementation, your backend would:
      // 1. Create the user account
      // 2. Generate a 2FA secret
      // 3. Create a QR code URL for that secret
      // 4. Return both to the frontend

      // Simulate API response
      setTimeout(() => {
        // This would come from your backend
        setQrCodeUrl("/placeholder.svg?height=200&width=200")
        setSecretKey("EXAMPLEKEY123456")
        setCurrentStep(RegistrationStep.TWO_FACTOR_SETUP)
        setIsLoading(false)
      }, 1500)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!verificationCode) {
      setError("Verification code is required")
      setIsLoading(false)
      return
    }

    try {
      // Here you would verify the 2FA code with your backend
      // const response = await fetch('/api/auth/verify-2fa', {
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

      // Simulate successful verification
      setTimeout(() => {
        setIsLoading(false)
        // Redirect to login page after successful registration and 2FA setup
        router.push("/login")
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

  const goBack = () => {
    if (currentStep === RegistrationStep.TWO_FACTOR_VERIFY) {
      setCurrentStep(RegistrationStep.TWO_FACTOR_SETUP)
    } else if (currentStep === RegistrationStep.TWO_FACTOR_SETUP) {
      setCurrentStep(RegistrationStep.CREDENTIALS)
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
          {currentStep === RegistrationStep.CREDENTIALS && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">Enter your information to sign up</CardDescription>
            </>
          )}

          {currentStep === RegistrationStep.TWO_FACTOR_SETUP && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Set up Two-Factor Authentication</CardTitle>
              <CardDescription className="text-center">Secure your account with 2FA</CardDescription>
            </>
          )}

          {currentStep === RegistrationStep.TWO_FACTOR_VERIFY && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Verify Two-Factor Authentication</CardTitle>
              <CardDescription className="text-center">Enter the code from your authenticator app</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {currentStep === RegistrationStep.CREDENTIALS && (
            <form onSubmit={handleInitialSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
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
              <Button type="submit" className="w-full" disabled={isLoading} variant="default">
                {isLoading ? "Creating account..." : "Continue to 2FA Setup"}
              </Button>
            </form>
          )}

          {currentStep === RegistrationStep.TWO_FACTOR_SETUP && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-medium text-sm mb-2">Follow these steps:</h3>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>Download an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code below with your authenticator app</li>
                  <li>
                    If you can't scan the code, enter this key manually:{" "}
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{secretKey}</span>
                  </li>
                  <li>Click "Continue" when you're ready to verify</li>
                </ol>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-2 rounded-lg border">
                  <Image
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="QR Code for 2FA setup"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={goBack} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setCurrentStep(RegistrationStep.TWO_FACTOR_VERIFY)}
                  disabled={isLoading}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === RegistrationStep.TWO_FACTOR_VERIFY && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium">
                  Verification Code
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="pl-10"
                    required
                    maxLength={6}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to verify and complete your account setup.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={goBack} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="text-center justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} className="text-blue-600 hover:underline cursor-pointer">
              Sign in
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
