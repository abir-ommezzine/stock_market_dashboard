"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { resetPassword } from "@/lib/api/auth.api"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Invalid or missing reset token")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError("Invalid reset token")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await resetPassword(token, newPassword)
      setSuccess(true)
      setTimeout(() => {
        navigate("/auth/sign-in-3")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">StockAI</span>
                </Link>
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your new password below
                </p>
              </div>

              {success ? (
                <div className="flex flex-col items-center gap-3 rounded-md bg-primary/5 border border-primary/20 px-4 py-6 text-center">
                  <CheckCircle2 className="size-8 text-primary" />
                  <p className="text-sm font-medium">Password reset successfully!</p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to sign in...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      disabled={!token}
                    />
                  </div>

                  <Button type="submit" className="w-full cursor-pointer" disabled={loading || !token}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Link to="/auth/sign-in-3" className="underline underline-offset-4">
                      Back to sign in
                    </Link>
                  </div>
                </>
              )}
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.95] dark:invert"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  )
}
