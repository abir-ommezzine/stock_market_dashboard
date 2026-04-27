import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth/sign-in-3" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
