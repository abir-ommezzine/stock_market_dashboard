"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useEffect, useState, useRef } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"
import { verifyEmail } from "@/lib/api/auth.api"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export function VerifyEmailForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const hasVerified = useRef(false)

  useEffect(() => {
    if (hasVerified.current) return

    const token = searchParams.get("token")
    
    if (!token) {
      setError("Invalid verification link. No token provided.")
      setLoading(false)
      return
    }

    hasVerified.current = true

    const verify = async () => {
      try {
        const user = await verifyEmail(token)
        login(user)
        setSuccess(true)
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
      } catch (err: any) {
        setError(err.message || "Failed to verify email. The link may be invalid or expired.")
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [searchParams, login, navigate])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex justify-center mb-2">
              <Link to="/" className="flex items-center gap-2 font-medium">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                  <Logo size={24} />
                </div>
                <span className="text-xl">Stocky</span>
              </Link>
            </div>

            {loading && (
              <>
                <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
                  <Loader2 className="size-8 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Verifying Your Email</h1>
                  <p className="text-muted-foreground">
                    Please wait while we verify your email address...
                  </p>
                </div>
              </>
            )}

            {success && (
              <>
                <div className="bg-green-100 text-green-600 flex size-16 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Email Verified!</h1>
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. Redirecting to dashboard...
                  </p>
                </div>
              </>
            )}

            {error && (
              <>
                <div className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full">
                  <XCircle className="size-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Verification Failed</h1>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button 
                    onClick={() => navigate("/auth/sign-in-3")} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate("/auth/sign-up-3")} 
                    className="flex-1"
                  >
                    Sign Up Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
