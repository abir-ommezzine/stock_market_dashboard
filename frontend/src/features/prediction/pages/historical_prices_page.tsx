"use client"

import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchStockData } from "@/lib/api/stock.api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/app/dashboard/components/chart-area-interactive"
import { ModelConfigPanel } from "@/features/prediction/components/model_config_panel"
import { MetricsCards } from "@/features/prediction/components/metrics_cards"
import type { PredictionPoint, MetricsResult, PredictionParams, PredictionResult } from "@/lib/api/prediction.api"
import { savePrediction } from "@/lib/api/prediction_history.api"
import { useAuth } from "@/contexts/auth.context"

export default function HistoricalPricesPage() {
  const location = useLocation()
  const { user } = useAuth()

  // Support both normal navigation and re-run from history
  const {
    company,
    datasetId,
    preloadedResult,   // set when coming from history re-run
    preloadedParams,   // set when coming from history re-run
  } = location.state || {}

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

  useEffect(() => {
    if (!datasetId || !company) return
    fetchStockData(datasetId, company)
      .then(setData)
      .catch(err => console.error("Error fetching stock data", err))
  }, [datasetId, company])

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

    // Auto-save only if signed in
    if (user) {
      try {
        await savePrediction(user.id, company, datasetId, usedParams, fullResult)
      } catch (err) {
        console.warn("Could not save prediction to history:", err)
      }
    }
  }

  return (
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
            onResult={handlePredictionResult}
          />
        </div>
      </div>

      <MetricsCards metrics={metrics} modelType={usedModel} />
    </div>
  )
}
