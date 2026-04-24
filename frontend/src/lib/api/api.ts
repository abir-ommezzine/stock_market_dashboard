/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT token from localStorage to every request.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/api/api"
 *   const data = await apiFetch("/api/datasets")
 */

const API_BASE = "http://localhost:8083"

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("auth_token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
}
