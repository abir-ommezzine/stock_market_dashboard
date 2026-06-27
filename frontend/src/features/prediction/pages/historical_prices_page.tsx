"use client"

import { useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
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
  const hasSavedRef = useRef(false)

  // Debug: Log what we have on mount
  useEffect(() => {
    console.log("=== Historical Prices Page Mounted ===")
    console.log("Location state:", location.state)
    console.log("localStorage pendingSave:", localStorage.getItem("pendingSave"))
    console.log("localStorage pendingSaveState:", localStorage.getItem("pendingSaveState"))
    console.log("User:", user)
  }, [])

  // On return from sign-in, location.state may be the restored page state
  // OR we fall back to localStorage if the router state was lost
  const resolvedState = (() => {
    if (location.state?.company) {
      console.log("Using location.state:", location.state)
      return location.state
    }
    const stored = localStorage.getItem("pendingSaveState")
    if (stored) {
      try { 
        const parsed = JSON.parse(stored)
        console.log("Using localStorage state:", parsed)
        return parsed
      } catch { /* ignore */ }
    }
    console.log("No state found, using empty object")
    return {}
  })()

  const {
    company,
    datasetId,
    preloadedResult,
    preloadedParams,
  } = resolvedState

  console.log("Resolved state - company:", company, "datasetId:", datasetId)

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
  // This runs once when the component mounts with all the necessary data
  useEffect(() => {
    const pending = localStorage.getItem("pendingSave")
    
    // Only run once and only if we have all required data
    if (
      pending === "true" && 
      user && 
      company && 
      datasetId && 
      lastParams && 
      lastResult &&
      !hasSavedRef.current
    ) {
      hasSavedRef.current = true
      
      console.log("Auto-saving prediction after login/verification")
      console.log("User ID:", user.id)
      console.log("Company:", company)
      console.log("Dataset ID:", datasetId)
      
      // Clear the flags immediately
      localStorage.removeItem("pendingSave")
      localStorage.removeItem("pendingSaveState")
      
      // Save the prediction
      savePrediction(user.id, company, datasetId, lastParams, lastResult)
        .then(() => {
          console.log("Prediction saved successfully")
          toast.success("Prediction saved successfully!")
        })
        .catch((err) => {
          console.error("Failed to save prediction:", err)
          toast.error("Failed to save prediction.")
        })
    }
  }, [user, company, datasetId, lastParams, lastResult])

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
    
    // Update localStorage with the latest prediction result
    // Use localStorage instead of sessionStorage so it persists across tabs (email verification)
    const stateToSave = {
      company,
      datasetId,
      preloadedParams: usedParams,
      preloadedResult: fullResult,
    }
    localStorage.setItem("pendingSaveState", JSON.stringify(stateToSave))
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
