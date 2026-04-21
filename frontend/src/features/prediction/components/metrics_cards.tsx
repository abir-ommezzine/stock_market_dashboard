// NEW FILE: src/features/prediction/components/metrics_cards.tsx
//
// Adapted from the ProductCategory1 shadcn component you shared.
// Shows 6 metric cards in a grid, each with an icon and value.
// Cards are empty/greyed out before prediction runs, populated after.

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlertCircle,
  BarChart2,
  LineChart,
  Percent,
  TrendingUp,
} from "lucide-react"
import type { MetricsResult } from "@/lib/api/prediction.api"

interface Props {
  metrics: MetricsResult | null  // null = prediction hasn't run yet
  modelType?: string             // shown in the header e.g. "ARIMA"
}

// Config for each metric card — icon, label, description, how to format value
const METRIC_CONFIG = [
  {
    key: "aic" as keyof MetricsResult,
    label: "AIC",
    description: "Akaike Information Criterion — model fit quality",
    icon: BarChart2,
    format: (v: number | null) => v !== null ? v.toFixed(2) : "—",
    hint: "Lower is better",
  },
  {
    key: "bic" as keyof MetricsResult,
    label: "BIC",
    description: "Bayesian Information Criterion — penalizes complexity",
    icon: TrendingUp,
    format: (v: number | null) => v !== null ? v.toFixed(2) : "—",
    hint: "Lower is better",
  },
  {
    key: "mse" as keyof MetricsResult,
    label: "MSE",
    description: "Mean Squared Error — average squared prediction error",
    icon: AlertCircle,
    format: (v: number | null) => v !== null ? v.toFixed(4) : "—",
    hint: "Lower is better",
  },
  {
    key: "rmse" as keyof MetricsResult,
    label: "RMSE",
    description: "Root MSE — error in same unit as stock price ($)",
    icon: Activity,
    format: (v: number | null) => v !== null ? `$${v.toFixed(2)}` : "—",
    hint: "Lower is better",
  },
  {
    key: "mae" as keyof MetricsResult,
    label: "MAE",
    description: "Mean Absolute Error — average dollar error",
    icon: LineChart,
    format: (v: number | null) => v !== null ? `$${v.toFixed(2)}` : "—",
    hint: "Lower is better",
  },
  {
    key: "mape" as keyof MetricsResult,
    label: "MAPE",
    description: "Mean Absolute Percentage Error — relative accuracy",
    icon: Percent,
    format: (v: number | null) => v !== null ? `${v.toFixed(2)}%` : "—",
    hint: "Lower is better · <5% is excellent",
  },
]

export function MetricsCards({ metrics, modelType }: Props) {
  return (
    <section className="w-full py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Model Evaluation Metrics
            {modelType && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — {modelType}
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {metrics
              ? "Computed from backtest predictions vs actual historical values"
              : "Run a prediction to see model evaluation metrics"}
          </p>
        </div>
      </div>

      {/* 6 metric cards in a responsive grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {METRIC_CONFIG.map(metric => {
          const Icon = metric.icon
          // Get the value from metrics object, or null if not run yet
          const value = metrics ? metrics[metric.key] as number | null : null
          const hasValue = metrics !== null

          return (
            <Card
              key={metric.key}
              className={cn(
                "group relative overflow-hidden shadow-xs transition-all hover:shadow-md py-4 px-2",
                // Dim the card slightly before prediction runs
                !hasValue && "opacity-50"
              )}
            >
              <CardContent className="p-2">
                <div className="flex flex-col gap-3">
                  {/* Icon */}
                  <div className="bg-secondary/80 text-secondary-foreground flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </div>

                  {/* Value — large and prominent */}
                  <div className="text-2xl font-bold tabular-nums">
                    {metric.format(value)}
                  </div>

                  {/* Label + description */}
                  <div>
                    <h4 className="text-sm font-semibold">{metric.label}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {metric.description}
                    </p>
                  </div>

                  {/* Hint badge */}
                  <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5 w-fit">
                    {metric.hint}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}