import { apiFetch } from "./api"
import type { PredictionResult, PredictionParams } from "./prediction.api"

const API = "http://localhost:8083"

export interface SavedPrediction {
  id: number
  userId: number
  company: string
  datasetId: number
  modelType: string
  parameters: string        // JSON string
  resultJson: string        // JSON string of PredictionResult
  createdAt: string
}

export async function savePrediction(
  userId: number,
  company: string,
  datasetId: number,
  params: PredictionParams,
  result: PredictionResult
): Promise<SavedPrediction> {
  const res = await apiFetch("/api/predictions", {
    method: "POST",
    body: JSON.stringify({
      userId,
      company,
      datasetId,
      modelType: params.model_type,
      parameters: JSON.stringify({
        p: params.p ?? 1,
        d: params.d ?? 1,
        q: params.q ?? 1,
        steps: params.steps ?? 10,
      }),
      resultJson: JSON.stringify(result),
    }),
  })
  if (!res.ok) throw new Error("Failed to save prediction")
  return res.json()
}

export async function getUserPredictions(userId: number): Promise<SavedPrediction[]> {
  const res = await apiFetch(`/api/predictions/user/${userId}`)
  if (!res.ok) throw new Error("Failed to fetch predictions")
  return res.json()
}

export async function deletePrediction(id: number): Promise<void> {
  await apiFetch(`/api/predictions/${id}`, { method: "DELETE" })
}
