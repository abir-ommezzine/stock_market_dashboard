// Redirects to /auth/sign-in-3 if user is not logged in
// Wrap any page that requires authentication with this component

import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in-3" replace />
  }

  return <>{children}</>
}
