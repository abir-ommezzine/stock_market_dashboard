const API = "http://localhost:8080/api";

export async function fetchStockData(
  datasetId: number,
  symbol: string
) {
  const res = await fetch(`${API}/stocks/fetch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datasetId,
      symbol,
      startDate: "2020-01-01",
      endDate: "2024-01-01",
    }),
  })

  if (!res.ok) {
    throw new Error("Failed fetching stock data")
  }

  return res.json()
}