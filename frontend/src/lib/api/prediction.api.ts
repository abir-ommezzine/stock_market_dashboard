// This file handles all ML/prediction related API calls to the Java backend
// Java then forwards them to the Python FastAPI service

const API = "http://localhost:8082/api"

export interface PredictionPoint {
  date: string   // "2015-03-03"
  value: number  // predicted close price
  type:"backtest" | "future"
  lower?: number
  upper?: number
}
export interface MetricsResult{
  aic: number | null
  bic: number | null
  mse: number
  rmse: number
  mae: number
  mape: number
}

export interface PredictionResult {
  predictions: PredictionPoint[]
  metrics: MetricsResult | null
  optimal_params:{p:number;d:number;q:number} | null
  residuals: Record<string,any>|null
}

export interface PredictionParams {
  datasetId: number
  model_type: "ARIMA" | "ARMA" | "SARIMA"
  symbol?: string
  p?: number      // autoregressive order (default 1)
  d?: number      // differencing order (default 1, not used in ARMA)
  q?: number      // moving average order (default 1)
  steps?: number  // how many future days to predict (default 10)
}

// Calls POST /api/ml/train-from-dataset on the Java backend
// Java fetches prices from DB, sends to Python, returns predictions
export async function runPrediction(params: PredictionParams): Promise<PredictionResult> {
  const res = await fetch(`${API}/ml/train-from-dataset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

   if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    const message = errorBody?.detail || errorBody?.message || "Prediction failed"
    throw new Error(message)
  }

  return res.json()
}