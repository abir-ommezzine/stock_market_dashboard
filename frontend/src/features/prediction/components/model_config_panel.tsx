"use client"

import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
import { ArrowLeft, BrainCircuit, Loader2, Save, Settings2, Sparkles, Zap, Star } from "lucide-react"
import {
  runPrediction,
  type PredictionPoint,
  type PredictionParams,
  type PredictionResult,
  type MetricsResult
} from "@/lib/api/prediction.api"
import { watchlistApi } from "@/lib/api/watchlist.api"
import { useAuth } from "@/contexts/auth.context"
import { toast } from "sonner"

interface Props {
  datasetId: number
  symbol: string
  hasPrediction?: boolean
  preloadedParams?: {
    model_type: "ARIMA" | "ARMA" | "SARIMA"
    p?: number
    d?: number
    q?: number
    steps?: number
  }
  onResult: (
    predictions: PredictionPoint[],
    metrics: MetricsResult | null,
    modelType: string,
    usedParams: PredictionParams,
    fullResult: PredictionResult
  ) => void
  onSave?: () => void
  onClearPrediction?: () => void
}

const MODEL_INFO = {
  ARIMA: {
    label: "ARIMA",
    description: "Best for non-stationary data with trends. Uses differencing to stabilize the series.",
    usesD: true,
  },
  ARMA: {
    label: "ARMA",
    description: "Best for already-stationary data. Combines autoregression and moving average.",
    usesD: false,
  },
  SARIMA: {
    label: "SARIMA",
    description: "Best for seasonal data (e.g. patterns that repeat monthly/yearly).",
    usesD: true,
  },
}

type ModelType = keyof typeof MODEL_INFO

export function ModelConfigPanel({ datasetId, symbol, hasPrediction = false, preloadedParams, onResult, onSave, onClearPrediction }: Props) {
  const [step, setStep] = useState(1)
  const [modelType, setModelType] = useState<ModelType>(preloadedParams?.model_type ?? "ARIMA")
  const [useDefaults, setUseDefaults] = useState(!preloadedParams)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [params, setParams] = useState({
    p: preloadedParams?.p ?? 1,
    d: preloadedParams?.d ?? 1,
    q: preloadedParams?.q ?? 1,
    steps: preloadedParams?.steps ?? 10,
  })

  const [isOptimized, setIsOptimized] = useState(false)

  // Check if symbol is in watchlist when component mounts
  React.useEffect(() => {
    if (isAuthenticated && user && symbol) {
      checkWatchlistStatus()
    }
  }, [isAuthenticated, user, symbol])

  const checkWatchlistStatus = async () => {
    if (!user || !symbol) return
    try {
      const exists = await watchlistApi.isInWatchlist(user.id, symbol)
      setIsInWatchlist(exists)
    } catch (error) {
      console.error('Failed to check watchlist status:', error)
    }
  }

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated || !user) {
      navigate("/auth/sign-in-3", {
        state: { redirect: location.pathname }
      })
      return
    }

    try {
      if (isInWatchlist) {
        await watchlistApi.removeFromWatchlist(user.id, symbol)
        setIsInWatchlist(false)
        toast.success(`${symbol} removed from watchlist`)
      } else {
        await watchlistApi.addToWatchlist({ userId: user.id, symbol })
        setIsInWatchlist(true)
        toast.success(`${symbol} added to watchlist`)
      }
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already in watchlist')) {
        toast.info(`${symbol} is already in your watchlist`)
        setIsInWatchlist(true)
      } else {
        toast.error(`Failed to ${isInWatchlist ? 'remove from' : 'add to'} watchlist`)
      }
    }
  }

  const setParam = (key: keyof typeof params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
    // If user manually edits a param, clear the optimized badge
    setIsOptimized(false)
  }

  const handleRun = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload: PredictionParams = {
        datasetId,
        model_type: modelType,
        symbol,
        ...(useDefaults ? {} : params),
      }

      const result = await runPrediction(payload)

      if (result.optimal_params) {
        setParams(prev => ({
          ...prev,
          p: result.optimal_params!.p,
          d: result.optimal_params!.d,
          q: result.optimal_params!.q,
        }))
        setIsOptimized(true)
        setUseDefaults(false)
      }

      // Pass full result + used params back to parent for saving
      onResult(result.predictions, result.metrics, modelType, payload, result)

    } catch (err: any) {
      setError(err.message || "Prediction failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!isAuthenticated) {
      // The parent component already saved the state to sessionStorage
      // Just set the pending flag and navigate
      // Use localStorage instead of sessionStorage so it persists across tabs
      localStorage.setItem("pendingSave", "true")
      
      navigate("/auth/sign-in-3", {
        state: {
          redirect: location.pathname,
        },
      })
      return
    }
    onSave?.()
    // Toast is shown by the parent (historical_prices_page)
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

        {step === 1 && (
          <div className="space-y-3">
            {(Object.keys(MODEL_INFO) as ModelType[]).map(model => (
              <button
                key={model}
                onClick={() => {
                  setModelType(model)
                  // reset optimized state when user switches model
                  setIsOptimized(false)
                  setParams({ p: 1, d: 1, q: 1, steps: params.steps })
                  setUseDefaults(true)
                  // clear any existing prediction overlay + gray out Save
                  onClearPrediction?.()
                }}
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

        {step === 2 && (
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-2">
              {/* Auto mode — sends p=1,d=1,q=1 which triggers Python auto-selection */}
              <button
                onClick={() => setUseDefaults(true)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors
                  ${useDefaults ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}
              >
                <Zap className="size-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Auto</div>
                  <div className="text-xs text-muted-foreground">Find best params</div>
                </div>
              </button>

              {/* Custom mode — shows the param inputs */}
              <button
                onClick={() => setUseDefaults(false)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors
                  ${!useDefaults ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}
              >
                <Settings2 className="size-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Custom</div>
                  {/* NEW: show current p,d,q values in the button subtitle */}
                  <div className="text-xs text-muted-foreground">
                    p={params.p}, d={params.d}, q={params.q}
                    {/* Show sparkle if these values came from auto-optimization */}
                    {isOptimized && " ✦"}
                  </div>
                </div>
              </button>
            </div>

            {/* Custom parameter inputs */}
            {!useDefaults && (
              <div className="space-y-3 rounded-lg border p-4">

                {isOptimized && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
                    <Sparkles className="size-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      Auto-optimized via AIC/BIC grid search
                    </span>
                  </div>
                )}

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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Loading overlay while prediction is running */}
            {loading && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <div className="absolute size-12 rounded-full border-2 border-primary/20 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-primary">Running prediction...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Training {modelType} model, this may take a moment
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1)
                  onClearPrediction?.()
                }}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>

              <Button
                size="sm"
                className="flex-1 min-w-[120px]"
                onClick={handleRun}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin mr-2" /> Running...</>
                  : "Run Prediction"}
              </Button>

              {/* Watchlist button */}
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant={isInWatchlist ? "secondary" : "outline"}
                  onClick={handleToggleWatchlist}
                  className="flex items-center gap-1"
                  title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Star className={`size-4 ${isInWatchlist ? "fill-current" : ""}`} />
                  {isInWatchlist ? "Watching" : "Watch"}
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasPrediction}
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-600"
                title={!hasPrediction ? "Run a prediction first" : isAuthenticated ? "Save experiment" : "Sign in to save"}
              >
                <Save className="size-4" />
                Save
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}