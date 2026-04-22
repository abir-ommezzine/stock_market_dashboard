// Placeholder auth API — replace with real calls when backend is ready
// All functions are stubs that simulate success for UI testing

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
}

// Simulates a login — replace with real fetch() later
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  // TODO: replace with real API call
  // const res = await fetch("http://localhost:8083/api/auth/login", { ... })
  return {
    id: 1,
    email: credentials.email,
    firstName: "John",
    lastName: "Doe",
  }
}

// Simulates a register — replace with real API call later
export async function register(credentials: RegisterCredentials): Promise<AuthUser> {
  // TODO: replace with real API call
  return {
    id: 1,
    email: credentials.email,
    firstName: credentials.firstName,
    lastName: credentials.lastName,
  }
}

// Simulates forgot password — replace with real API call later
export async function forgotPassword(email: string): Promise<void> {
  // TODO: replace with real API call
  console.log("Reset link sent to:", email)
}