const API = "http://localhost:8080"

export async function getSources() {
  const res = await fetch(`${API}/api/datasets/sources`)
  return res.json()
}

export async function createPredefinedDataset(
  sourceName: string,
  userId: number
) {
  const res = await fetch(
    `${API}/api/datasets/link-source?sourceName=${sourceName}&displayName=${sourceName}&userId=${userId}`,
    {
      method: "POST",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to create dataset")
  }

  return res.json()
}