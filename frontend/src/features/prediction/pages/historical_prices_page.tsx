"use client"

import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchStockData } from "@/lib/api/stock.api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive"
import { ModelConfigPanel } from "@/features/prediction/components/model_config_panel"
import { MetricsCards } from "@/features/prediction/components/metrics_cards"
import type { PredictionPoint, MetricsResult, PredictionParams, PredictionResult } from "@/lib/api/prediction.api"
import { savePrediction } from "@/lib/api/prediction_history.api"
import { useAuth } from "@/contexts/auth.context"
import { toast } from "sonner"
import { BaseLayout } from "@/components/layouts/base-layout"

export default function HistoricalPricesPage() {
  const location = useLocation()
  const { user } = useAuth()

  // On return from sign-in, location.state may be the restored page state
  // OR we fall back to sessionStorage if the router state was lost
  const resolvedState = (() => {
    if (location.state?.company) return location.state
    const stored = sessionStorage.getItem("pendingSaveState")
    if (stored) {
      try { return JSON.parse(stored) } catch { /* ignore */ }
    }
    return {}
  })()

  const {
    company,
    datasetId,
    preloadedResult,
    preloadedParams,
  } = resolvedState

  const [data, setData] = useState<any>(null)
  const [predictions, setPredictions] = useState<PredictionPoint[]>(
    preloadedResult?.predictions ?? []
  )
  const [metrics, setMetrics] = useState<MetricsResult | null>(
    preloadedResult?.metrics ?? null
  )
  const [usedModel, setUsedModel] = useState<string | undefined>(
    preloadedParams?.model_type
  )
  const [lastParams, setLastParams] = useState<PredictionParams | null>(
    preloadedParams ?? null
  )
  const [lastResult, setLastResult] = useState<PredictionResult | null>(
    preloadedResult ?? null
  )

  useEffect(() => {
    if (!datasetId || !company) return
    fetchStockData(datasetId, company)
      .then(setData)
      .catch(err => console.error("Error fetching stock data", err))
  }, [datasetId, company])

  // After returning from sign-in with a pending save, auto-trigger it
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingSave")
    if (pending === "true" && user && lastParams && lastResult) {
      sessionStorage.removeItem("pendingSave")
      sessionStorage.removeItem("pendingSaveState")
      savePrediction(user.id, company, datasetId, lastParams, lastResult)
        .then(() => toast.success("Prediction saved successfully!"))
        .catch(() => toast.error("Failed to save prediction."))
    }
  }, [user, lastParams, lastResult, company, datasetId])

  const handlePredictionResult = async (
    newPredictions: PredictionPoint[],
    newMetrics: MetricsResult | null,
    modelType: string,
    usedParams: PredictionParams,
    fullResult: PredictionResult
  ) => {
    setPredictions(newPredictions)
    setMetrics(newMetrics)
    setUsedModel(modelType)
    setLastParams(usedParams)
    setLastResult(fullResult)
    // No auto-save here — user clicks Save explicitly
  }

  const handleClearPrediction = () => {
    setPredictions([])
    setMetrics(null)
    setUsedModel(undefined)
    setLastParams(null)
    setLastResult(null)
  }

  const handleSave = () => {    if (!user || !lastParams || !lastResult) return
    savePrediction(user.id, company, datasetId, lastParams, lastResult)
      .then(() => toast.success("Prediction saved successfully!"))
      .catch(() => toast.error("Failed to save prediction."))
  }

  return (
    <BaseLayout>
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historical Prices — {company}</CardTitle>
        </CardHeader>
        <CardContent>
          Dataset ID: {datasetId}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartAreaInteractive data={data} predictions={predictions} />
        </div>
        <div className="lg:col-span-1">
          <ModelConfigPanel
            datasetId={datasetId}
            symbol={company}
            preloadedParams={preloadedParams}
            hasPrediction={lastResult !== null}
            onResult={handlePredictionResult}
            onSave={handleSave}
            onClearPrediction={handleClearPrediction}
          />
        </div>
      </div>

      <MetricsCards metrics={metrics} modelType={usedModel} />
    </div>
    </BaseLayout>
  )
}
