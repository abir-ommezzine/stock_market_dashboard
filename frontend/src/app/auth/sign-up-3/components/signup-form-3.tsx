"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register as registerApi } from "@/lib/api/auth.api"
import { Loader2, Mail } from "lucide-react"

export function SignupForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate  = useNavigate()

  const [firstName,       setFirstName]       = useState("")
  const [lastName,        setLastName]        = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed,          setAgreed]          = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [success,         setSuccess]         = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service.")
      return
    }

    setLoading(true)
    try {
      await registerApi({ firstName, lastName, email, password, confirmPassword })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    // Debug: Check if pending save state is still in localStorage
    const pendingSave = localStorage.getItem("pendingSave")
    const pendingSaveState = localStorage.getItem("pendingSaveState")
    console.log("=== Signup Success Screen ===")
    console.log("pendingSave:", pendingSave)
    console.log("pendingSaveState:", pendingSaveState)
    
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
                <Mail className="size-8" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Check Your Email</h1>
                <p className="text-muted-foreground text-balance">
                  We've sent a verification email to
                </p>
                <p className="font-semibold text-lg">{email}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm text-left w-full">
                <p className="mb-2">Please check your inbox and click the verification link to complete your registration.</p>
                <p className="text-muted-foreground">If you don't see the email, check your spam folder.</p>
                {pendingSave === "true" && (
                  <p className="text-primary font-medium mt-2">
                    ✓ Your prediction will be saved after verification
                  </p>
                )}
              </div>

              <Button 
                onClick={() => navigate("/auth/sign-in-3")} 
                variant="outline" 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                  <span className="text-xl">Stocky</span>
                </Link>
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your information to get started
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={v => setAgreed(v as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading
                  ? <><Loader2 className="size-4 animate-spin mr-2" /> Creating account...</>
                  : "Create Account"
                }
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/auth/sign-in-3" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>

          <div className="relative hidden md:block overflow-hidden">
            <img
              src="/logo.png"
              alt="Stock market chart"
              className="absolute inset-0 h-full w-full object-cover scale-90"
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