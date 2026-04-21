// CHANGES:
// 1. Added lower/upper confidence interval bands for future predictions
// 2. Merged lower/upper into chartData map alongside future values
// 3. Added ReferenceArea-style confidence band using two overlapping Areas
// 4. Added "showConfidence" toggle so user can hide/show the band
// 5. Always include backtest points in filtered data (same as future)

"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { PredictionPoint } from "@/lib/api/prediction.api"

interface Props {
  data?: any
  predictions?: PredictionPoint[]
}

const chartConfig = {
  close: {
    label: "Historical",
    color: "var(--primary)",
  },
  backtest: {
    label: "Backtest",
    color: "var(--chart-3)",
  },
  future: {
    label: "Forecast",
    color: "var(--chart-2)",
  },
  // NEW: upper/lower bounds for confidence interval — no label in legend
  upper: {
    label: "Upper bound",
    color: "var(--chart-2)",
  },
  lower: {
    label: "Lower bound",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data, predictions }: Props) {
  if (!data) return <div>Loading chart...</div>

  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  // NEW: toggle to show/hide the confidence interval band
  const [showConfidence, setShowConfidence] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const historicalData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return data.map((p: any) => ({ date: p.date, close: p.close }))
  }, [data])

  const { backtestData, futureData } = React.useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { backtestData: [], futureData: [] }
    }

    const backtest = predictions
      .filter(p => p.type === "backtest")
      .map(p => ({ date: p.date, backtest: p.value }))

    // CHANGED: also extract lower/upper from future predictions
    const future = predictions
      .filter(p => p.type === "future")
      .map(p => ({
        date:    p.date,
        future:  p.value,
        lower:   p.lower,   // confidence interval lower bound (may be undefined)
        upper:   p.upper,   // confidence interval upper bound (may be undefined)
      }))

    return { backtestData: backtest, futureData: future }
  }, [predictions])

  const chartData = React.useMemo(() => {
    const map = new Map<string, any>()

    historicalData.forEach(p => {
      map.set(p.date, { date: p.date, close: p.close })
    })

    backtestData.forEach(p => {
      const existing = map.get(p.date) || { date: p.date }
      map.set(p.date, { ...existing, backtest: p.backtest })
    })

    // CHANGED: merge lower/upper alongside future values
    futureData.forEach(p => {
      const existing = map.get(p.date) || { date: p.date }
      map.set(p.date, {
        ...existing,
        future: p.future,
        lower:  p.lower,  // undefined if model didn't return confidence intervals
        upper:  p.upper,
      })
    })

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [historicalData, backtestData, futureData])

  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []
    const referenceDate = new Date(historicalData[historicalData.length - 1]?.date)
    let days = 90
    if (timeRange === "30d") days = 30
    if (timeRange === "7d") days = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - days)

    return chartData.filter(item =>
      new Date(item.date) >= startDate ||
      item.future   !== undefined ||  // always show future predictions
      item.backtest !== undefined      // CHANGED: also always show backtest
    )
  }, [chartData, historicalData, timeRange])

  // Check if any future points actually have confidence intervals
  const hasConfidenceData = futureData.some(p => p.lower !== undefined && p.upper !== undefined)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Stock Price — Historical & Forecast</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Orange overlay shows backtest accuracy · Dashed line shows future forecast
          </span>
          <span className="@[540px]/card:hidden">Historical + Backtest + Forecast</span>
        </CardDescription>
        <CardAction>
          {/* NEW: confidence interval toggle — only shown if data has CI */}
          {hasConfidenceData && (
            <div className="hidden @[540px]/card:flex items-center gap-2 mr-4">
              <Switch
                id="confidence-toggle"
                checked={showConfidence}
                onCheckedChange={setShowConfidence}
              />
              <Label htmlFor="confidence-toggle" className="text-xs text-muted-foreground cursor-pointer">
                95% CI
              </Label>
            </div>
          )}

          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Mobile confidence toggle */}
        {hasConfidenceData && (
          <div className="flex @[540px]/card:hidden items-center gap-2 mb-4">
            <Switch
              id="confidence-toggle-mobile"
              checked={showConfidence}
              onCheckedChange={setShowConfidence}
            />
            <Label htmlFor="confidence-toggle-mobile" className="text-xs text-muted-foreground">
              Show 95% confidence interval
            </Label>
          </div>
        )}

        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-close)"   stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-close)"   stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillBacktest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-backtest)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-backtest)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillFuture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-future)"  stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-future)"  stopOpacity={0.05} />
              </linearGradient>
              {/* NEW: very light gradient for confidence band */}
              <linearGradient id="fillConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-future)"  stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-future)"  stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string | number | Date) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {/* Historical price — always shown */}
            <Area
              dataKey="close"
              type="natural"
              fill="url(#fillClose)"
              stroke="var(--color-close)"
              strokeWidth={2}
            />

            {/* Backtest predictions */}
            {backtestData.length > 0 && (
              <Area
                dataKey="backtest"
                type="natural"
                fill="url(#fillBacktest)"
                stroke="var(--color-backtest)"
                strokeWidth={2}
                connectNulls={false}
              />
            )}

            {/*
              NEW: Confidence interval band — rendered as two stacked areas.
              The "upper" area fills from 0 up to the upper bound with light opacity.
              The "lower" area fills from 0 up to the lower bound with full background
              color, effectively "erasing" the fill below the lower bound.
              Result: only the band between lower and upper is shaded.
              This only renders when showConfidence is true AND data has CI values.
            */}
            {futureData.length > 0 && hasConfidenceData && showConfidence && (
              <>
                {/* Upper bound fill — light shade up to upper bound */}
                <Area
                  dataKey="upper"
                  type="natural"
                  fill="url(#fillConfidence)"
                  stroke="var(--color-future)"
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                  strokeOpacity={0.5}
                  connectNulls={false}
                  legendType="none"    // don't show in legend
                />
                {/* Lower bound fill — erases below the lower bound */}
                <Area
                  dataKey="lower"
                  type="natural"
                  fill="var(--background)"  // matches page background → creates cutout effect
                  stroke="var(--color-future)"
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                  strokeOpacity={0.5}
                  connectNulls={false}
                  legendType="none"
                />
              </>
            )}

            {/* Future forecast line — drawn on top of the CI band */}
            {futureData.length > 0 && (
              <Area
                dataKey="future"
                type="natural"
                fill="url(#fillFuture)"
                stroke="var(--color-future)"
                strokeWidth={2}
                strokeDasharray="4 4"
                connectNulls={false}
              />
            )}

          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}