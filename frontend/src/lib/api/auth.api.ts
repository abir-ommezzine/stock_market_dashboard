const API_BASE = "http://localhost:8083/api/auth"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  token: string
  role: "USER" | "ADMIN"
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Login failed")
  }

  return res.json()
}

export async function register(credentials: RegisterCredentials): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      password: credentials.password,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Registration failed")
  }

  return res.json()
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to send reset email")
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to reset password")
  }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/change-password/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to change password")
  }
}

export async function verifyEmail(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/verify-email?token=${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to verify email")
  }

  return res.json()
}
