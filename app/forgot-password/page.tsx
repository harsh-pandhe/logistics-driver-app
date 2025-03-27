"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAuth, sendPasswordResetEmail } from "firebase/auth" // Ensure correct imports

const auth = getAuth() // Explicitly initialize auth with proper type

export default function ForgotPasswordPage() {
  const { addToast: toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsEmailSent(true)
      toast("Password reset email sent successfully")
    } catch (error: any) {
      toast(error.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }
  
    return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        {!isEmailSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Password reset email sent! Check your inbox for further instructions.
              </div>
            </div>
            <div className="text-center">
              <Link href="/login" className="text-primary hover:underline">
                Return to login
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

