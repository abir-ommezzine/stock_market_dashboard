import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/lib/api/auth.api"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (user: AuthUser) => void
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

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
    localStorage.setItem("auth_user", JSON.stringify(user))
    // Also store token separately for easy access in API calls
    localStorage.setItem("auth_token", user.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token")
  }

  const getToken = (): string | null => {
    return localStorage.getItem("auth_token")
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "ADMIN",
      login,
      logout,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
