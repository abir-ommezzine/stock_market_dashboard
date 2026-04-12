"use client"

// This component is a 2-step form that lets the user:
// Step 1: Choose a model (ARIMA, ARMA, SARIMA)
// Step 2: Use default params OR customize p, d, q, steps
// Then calls the prediction API and returns results to the parent

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BrainCircuit, Loader2, Settings2, Zap } from "lucide-react"
import { runPrediction, type PredictionPoint, type PredictionParams, type MetricsResult } from "@/lib/api/prediction.api"

// What the parent passes in
interface Props {
  datasetId: number
  symbol: string
  onResult: (
    predictions: PredictionPoint[],
    metrics: MetricsResult | null,
    modelType: string
  ) => void // called when predictions arrive
}

// Model descriptions shown to the user
const MODEL_INFO = {
  ARIMA: {
    label: "ARIMA",
    description: "Best for non-stationary data with trends. Uses differencing to stabilize the series.",
    usesD: true, // ARIMA uses the d parameter
  },
  ARMA: {
    label: "ARMA",
    description: "Best for already-stationary data. Combines autoregression and moving average.",
    usesD: false, // ARMA does NOT use d (d is always 0)
  },
  SARIMA: {
    label: "SARIMA",
    description: "Best for seasonal data (e.g. patterns that repeat monthly/yearly).",
    usesD: true,
  },
}

type ModelType = keyof typeof MODEL_INFO

export function ModelConfigPanel({ datasetId,symbol, onResult }: Props) {
  // Which step we're on: 1 = choose model, 2 = configure params
  const [step, setStep] = useState(1)

  // Selected model
  const [modelType, setModelType] = useState<ModelType>("ARIMA")

  // Whether user wants default params or custom
  const [useDefaults, setUseDefaults] = useState(true)

  // Custom parameter values
  const [params, setParams] = useState({ p: 1, d: 1, q: 1, steps: 10 })

  // Loading state while waiting for prediction
  const [loading, setLoading] = useState(false)

  // Error message if prediction fails
  const [error, setError] = useState<string | null>(null)

  // Update a single param field
  const setParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  // Called when user clicks "Run Prediction"
  const handleRun = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build the request — if using defaults, just send model type and datasetId
      // Java backend will use p=1, d=1, q=1, steps=10 as defaults
      const payload: PredictionParams = {
        datasetId,
        model_type: modelType,
        symbol,
        ...(useDefaults ? {} : params), // only include params if custom mode
      }

      const result = await runPrediction(payload)
      onResult(result.predictions,result.metrics,modelType) // send predictions up to the page
    } catch (err: any) {
      setError("Prediction failed. Try different parameters.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-5 text-primary" />
          <CardTitle>Prediction Model</CardTitle>
        </div>
        <CardDescription>
          {step === 1
            ? "Choose a forecasting model for your stock data"
            : "Configure model parameters"}
        </CardDescription>

        {/* Step indicator — same style as the checkout form you shared */}
        <div className="flex items-center gap-3 pt-2">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors
                ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`mx-2 h-0.5 w-12 rounded transition-colors
                  ${s < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ── STEP 1: Choose Model ── */}
        {step === 1 && (
          <div className="space-y-3">
            {/* Render one card per model type */}
            {(Object.keys(MODEL_INFO) as ModelType[]).map(model => (
              <button
                key={model}
                onClick={() => setModelType(model)}
                className={`w-full text-left rounded-lg border p-4 transition-colors
                  ${modelType === model
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{MODEL_INFO[model].label}</span>
                  {modelType === model && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {MODEL_INFO[model].description}
                </p>
              </button>
            ))}

            <Button className="w-full mt-2" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* ── STEP 2: Configure Parameters ── */}
        {step === 2 && (
          <div className="space-y-4">

            {/* Default vs Custom toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUseDefaults(true)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors
                  ${useDefaults ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}
              >
                <Zap className="size-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Defaults</div>
                  <div className="text-xs text-muted-foreground">p=1, d=1, q=1</div>
                </div>
              </button>

              <button
                onClick={() => setUseDefaults(false)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors
                  ${!useDefaults ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}
              >
                <Settings2 className="size-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Custom</div>
                  <div className="text-xs text-muted-foreground">Set manually</div>
                </div>
              </button>
            </div>

            {/* Custom parameter inputs — only shown if user picks custom */}
            {!useDefaults && (
              <div className="space-y-3 rounded-lg border p-4">
                {/* p — always shown */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    p — Autoregressive order
                    <span className="ml-1 text-muted-foreground">(how many past values to use)</span>
                  </Label>
                  <Input
                    type="number" min={0} max={10}
                    value={params.p}
                    onChange={e => setParam("p", parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* d — only shown for ARIMA and SARIMA, not ARMA */}
                {MODEL_INFO[modelType].usesD && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      d — Differencing order
                      <span className="ml-1 text-muted-foreground">(times to difference for stationarity)</span>
                    </Label>
                    <Input
                      type="number" min={0} max={3}
                      value={params.d}
                      onChange={e => setParam("d", parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}

                {/* q — always shown */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    q — Moving average order
                    <span className="ml-1 text-muted-foreground">(how many past errors to use)</span>
                  </Label>
                  <Input
                    type="number" min={0} max={10}
                    value={params.q}
                    onChange={e => setParam("q", parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* steps — how far into the future to predict */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Steps — Forecast horizon
                    <span className="ml-1 text-muted-foreground">(how many days ahead)</span>
                  </Label>
                  <Select
                    value={String(params.steps)}
                    onValueChange={v => setParam("steps", parseInt(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 30, 60, 90].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} days</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>

              <Button
                className="flex-1"
                onClick={handleRun}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin mr-2" /> Running...</>
                  : "Run Prediction"}
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}