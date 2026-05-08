import { apiFetch } from "./api"

export async function fetchStockData(datasetId: number, symbol: string) {
  console.log("Sending request:", { datasetId, symbol })
  const res = await apiFetch("/api/stocks/fetch", {
    method: "POST",
    body: JSON.stringify({ datasetId, symbol }),
  })

  if (!res.ok) {
    throw new Error("Failed fetching stock data")
  }

  const data = await res.json()
  console.log("Received stock data:", data)
  console.log("Data is array?", Array.isArray(data))
  console.log("Data length:", data?.length)
  return data
}