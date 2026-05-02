"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword } from "@/lib/api/auth.api"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ForgotPasswordForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-md bg-primary/5 border border-primary/20 px-4 py-6 text-center">
          <CheckCircle2 className="size-8 text-primary" />
          <p className="text-sm font-medium">Reset link sent!</p>
          <p className="text-xs text-muted-foreground">
            Check your inbox at <span className="font-medium">{email}</span>
          </p>
          <Link
            to="/auth/sign-in-2"
            className="text-xs underline underline-offset-4 text-primary"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link to="/auth/sign-in-2" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </form>
  )
}
