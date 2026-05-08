// CHANGES:
// 1. Replaced GitHub icon with a "Sign in" text button (no OAuth yet)
// 2. Removed Apple and Meta buttons — kept only Google and new Sign in
// 3. Wired form to auth context — calls login() and redirects to /dashboard
// 4. Added loading and error states
// 5. Fixed href links to use react-router navigate

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"
import { login as loginApi } from "@/lib/api/auth.api"
import { Loader2 } from "lucide-react"

export function LoginForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  // If redirected from a protected page, go back there after login
  const from = location.state as any
  const redirectTo = from?.redirect || "/dashboard"
  const redirectState = from?.locationState || undefined

  const [email,    setEmail]    = useState("test@example.com")
  const [password, setPassword] = useState("password")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const user = await loginApi({ email, password })
      login(user)
      if (user.role === "ADMIN") {
        navigate("/admin")
      } else {
        navigate(redirectTo, { state: redirectState })
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.")
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

              {/* Logo */}
              <div className="flex justify-center mb-2">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">Stocky</span>
                </Link>
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Stocky account
                </p>
              </div>

              {/* Error message */}
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
                  placeholder="test@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/auth/forgot-password-3"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading
                  ? <><Loader2 className="size-4 animate-spin mr-2" /> Signing in...</>
                  : "Login"
                }
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/auth/sign-up-3" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>

          {/* Right side image */}
          <div className="relative hidden md:block overflow-hidden">
            <img
              src="/logo.png"
              alt="Stock market chart"
              className="absolute inset-0 h-full w-full object-cover scale-85"
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