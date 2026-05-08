import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"
import { Loader2 } from "lucide-react"

export default function OAuth2RedirectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    const firstName = searchParams.get("firstName")
    const lastName = searchParams.get("lastName")
    const role = searchParams.get("role")
    const id = searchParams.get("id")

    if (token && email && firstName && lastName && role && id) {
      const user = {
        token,
        email,
        firstName,
        lastName,
        role: role as "USER" | "ADMIN",
        id: parseInt(id)
      }
      
      login(user)
      navigate("/dashboard")
    } else {
      navigate("/auth/sign-in-3")
    }
  }, [searchParams, login, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
