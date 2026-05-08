import { apiFetch } from "./api"

export interface AdminStats {
  totalUsers: number
  newUsersThisMonth: number
  totalPredictions: number
  predictionsByModel: Record<string, number>
}

export interface UserSummary {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
  predictionCount: number
}

export interface PredictionSummary {
  id: number
  userId: number
  userEmail: string
  userName: string
  company: string
  modelType: string
  createdAt: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiFetch("/api/admin/stats")
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export async function getAllUsers(): Promise<UserSummary[]> {
  const res = await apiFetch("/api/admin/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function searchUsers(q: string): Promise<UserSummary[]> {
  const res = await apiFetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("Failed to search users")
  return res.json()
}

export async function getAllPredictions(): Promise<PredictionSummary[]> {
  const res = await apiFetch("/api/predictions")
  if (!res.ok) throw new Error("Failed to fetch predictions")
  const predictions: any[] = await res.json()
  
  return predictions.map((p) => ({
    id: p.id,
    userId: p.userId,
    userEmail: p.userEmail || 'unknown@example.com',
    userName: p.userFirstName && p.userLastName 
      ? `${p.userFirstName} ${p.userLastName}`.trim() 
      : p.userFirstName || 'Unknown User',
    company: p.company,
    modelType: p.modelType,
    createdAt: p.createdAt,
  }))
}

export interface CreateAdminRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function createAdmin(data: CreateAdminRequest): Promise<UserSummary> {
  const res = await apiFetch("/api/admin/users/create-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to create admin")
  }
  return res.json()
}
