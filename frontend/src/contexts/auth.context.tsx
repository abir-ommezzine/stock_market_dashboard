// Global auth state — wraps the whole app so any component can access user info
// For now stores user in localStorage so page refresh doesn't log you out
// Replace localStorage with real JWT handling when backend is ready

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/lib/api/auth.api"

interface AuthContextType {
  user: AuthUser | null          // null = not logged in
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // On mount, try to restore user from localStorage
  // This keeps the user logged in after page refresh
  useEffect(() => {
    const stored = localStorage.getItem("auth_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("auth_user")
      }
    }
  }, [])

  const login = (user: AuthUser) => {
    setUser(user)
    // Store in localStorage so it persists across refreshes
    // TODO: replace with JWT token storage when backend is ready
    localStorage.setItem("auth_user", JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component to access auth state
// Example: const { user, isAuthenticated, logout } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}