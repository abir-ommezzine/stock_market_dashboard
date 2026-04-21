const API = "http://localhost:8083"

export async function getSources() {
  const res = await fetch(`${API}/api/datasets/sources`);
   if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json()
}

export const createPredefinedDataset = async (
  sourceName: string,
  userId?: number
) => {

  const params = new URLSearchParams()
  params.append("sourceName", sourceName)
  params.append("displayName", sourceName)

  if (userId !== undefined) {
    params.append("userId", userId.toString())
  }

  const res = await fetch(
    `${API}/api/datasets/link-source?${params.toString()}`,
    { method: "POST" }
  )

  if (!res.ok) throw new Error("Failed to create dataset")

  return res.json()
}