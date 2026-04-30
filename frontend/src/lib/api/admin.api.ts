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
  
  // Fetch all users to map userId to user details
  const usersRes = await apiFetch("/api/admin/users")
  const users: UserSummary[] = usersRes.ok ? await usersRes.json() : []
  
  const userMap = new Map<number, UserSummary>(users.map((u) => [u.id, u]))
  
  return predictions.map((p) => {
    const user = userMap.get(p.userId) || { email: 'Unknown', firstName: 'Unknown', lastName: '' }
    return {
      id: p.id,
      userId: p.userId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
      company: p.company,
      modelType: p.modelType,
      createdAt: p.createdAt,
    }
  })
}
