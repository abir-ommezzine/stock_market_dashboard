// CHANGES:
// 1. Wired form to forgotPassword() API stub
// 2. Shows success message after submit instead of redirecting
// 3. Fixed links to use react-router Link
// 4. Added loading state

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword } from "@/lib/api/auth.api"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ForgotPasswordForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)  // true after successful submit
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await forgotPassword(email)
      setSent(true)  // show success state
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
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
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email to reset your StockAI account password
                </p>
              </div>

              {/* Success state — shown after email is sent */}
              {sent ? (
                <div className="flex flex-col items-center gap-3 rounded-md bg-primary/5 border border-primary/20 px-4 py-6 text-center">
                  <CheckCircle2 className="size-8 text-primary" />
                  <p className="text-sm font-medium">Reset link sent!</p>
                  <p className="text-xs text-muted-foreground">
                    Check your inbox at <span className="font-medium">{email}</span>
                  </p>
                  <Link
                    to="/auth/sign-in-3"
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
                    {loading
                      ? <><Loader2 className="size-4 animate-spin mr-2" /> Sending...</>
                      : "Send Reset Link"
                    }
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

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}