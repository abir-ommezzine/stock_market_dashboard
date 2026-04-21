// CHANGES:
// 1. Added metrics state
// 2. Extract metrics from prediction result alongside predictions
// 3. Pass metrics and modelType to MetricsCards
// 4. Added MetricsCards below the chart

"use client"

import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchStockData } from "@/lib/api/stock.api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/app/dashboard/components/chart-area-interactive"
import { ModelConfigPanel } from "@/features/prediction/components/model_config_panel"
import { MetricsCards } from "@/features/prediction/components/metrics_cards"
import type { PredictionPoint, MetricsResult } from "@/lib/api/prediction.api"

export default function HistoricalPricesPage() {
  const location = useLocation()
  const { company, datasetId } = location.state || {}

  const [data, setData] = useState<any>(null)
  const [predictions, setPredictions] = useState<PredictionPoint[]>([])

  // NEW: metrics state — null until prediction runs
  const [metrics, setMetrics] = useState<MetricsResult | null>(null)

  // NEW: track which model was used for the header label
  const [usedModel, setUsedModel] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!datasetId || !company) return
    fetchStockData(datasetId, company)
      .then(setData)
      .catch(err => console.error("Error fetching stock data", err))
  }, [datasetId, company])

  // CHANGED: onResult now receives the full result (predictions + metrics)
  // ModelConfigPanel calls this with the full API response
  const handlePredictionResult = (
    newPredictions: PredictionPoint[],
    newMetrics: MetricsResult | null,
    modelType: string
  ) => {
    setPredictions(newPredictions)
    setMetrics(newMetrics)       // update metrics — triggers MetricsCards re-render
    setUsedModel(modelType)
  }

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Prices — {company}</CardTitle>
        </CardHeader>
        <CardContent>
          Dataset ID: {datasetId}
        </CardContent>
      </Card>

      {/* Chart + model config side by side */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartAreaInteractive data={data} predictions={predictions} />
        </div>
        <div className="lg:col-span-1">
          <ModelConfigPanel
            datasetId={datasetId}
            symbol={company}
            onResult={handlePredictionResult}  // CHANGED: now passes 3 values
          />
        </div>
      </div>

      {/* Metrics cards — always visible, dimmed until prediction runs */}
      <MetricsCards metrics={metrics} modelType={usedModel} />

    </div>
  )
}