// CHANGES:
// 1. Split predictions into backtest and future arrays
// 2. Added third Area for backtest predictions (orange, solid line)
// 3. Added "backtest" to chartConfig
// 4. Backtest points overlap the historical period so accuracy is visible

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
import type { PredictionPoint } from "@/lib/api/prediction.api"

interface Props {
  data?: any
  predictions?: PredictionPoint[]
}

// CHANGED: added backtest series (orange) alongside future (dashed)
const chartConfig = {
  close: {
    label: "Historical",
    color: "var(--primary)",
  },
  backtest: {
    label: "Backtest",
    color: "var(--chart-3)",   // orange — overlaps historical to show accuracy
  },
  future: {
    label: "Forecast",
    color: "var(--chart-2)",   // second color — dashed, extends beyond history
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data, predictions }: Props) {
  if (!data) return <div>Loading chart...</div>

  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  // Build historical data points
  const historicalData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return data.map((p: any) => ({ date: p.date, close: p.close }))
  }, [data])

  // CHANGED: split predictions into backtest and future arrays
  // backtest points overlap the historical period (last 20%)
  // future points extend beyond the last historical date
  const { backtestData, futureData } = React.useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { backtestData: [], futureData: [] }
    }

    // Separate by type field we added to PredictionPoint
    const backtest = predictions
      .filter(p => p.type === "backtest")
      .map(p => ({ date: p.date, backtest: p.value }))

    const future = predictions
      .filter(p => p.type === "future")
      .map(p => ({ date: p.date, future: p.value }))

    return { backtestData: backtest, futureData: future }
  }, [predictions])

  // CHANGED: merge all three datasets into one unified array sorted by date
  // Each point may have close, backtest, and/or future — undefined means no value
  // Recharts handles undefined gracefully (gaps in the line)
  const chartData = React.useMemo(() => {
    // Build a map keyed by date so we can merge all series
    const map = new Map<string, any>()

    // Add historical points
    historicalData.forEach(p => {
      map.set(p.date, { date: p.date, close: p.close })
    })

    // Merge backtest points — same dates as last 20% of historical
    backtestData.forEach(p => {
      const existing = map.get(p.date) || { date: p.date }
      map.set(p.date, { ...existing, backtest: p.backtest })
    })

    // Merge future points — new dates beyond historical
    futureData.forEach(p => {
      const existing = map.get(p.date) || { date: p.date }
      map.set(p.date, { ...existing, future: p.future })
    })

    // Sort all points chronologically
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [historicalData, backtestData, futureData])

  // Filter by time range — always include future points regardless
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
      item.future !== undefined  // always show future predictions
    )
  }, [chartData, historicalData, timeRange])

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
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-close)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-close)" stopOpacity={0.1} />
              </linearGradient>
              {/* Orange gradient for backtest overlay */}
              <linearGradient id="fillBacktest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-backtest)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-backtest)" stopOpacity={0.05} />
              </linearGradient>
              {/* Blue/teal gradient for future forecast */}
              <linearGradient id="fillFuture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-future)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-future)" stopOpacity={0.05} />
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

            {/* Backtest predictions — only shown after Run Prediction */}
            {backtestData.length > 0 && (
              <Area
                dataKey="backtest"
                type="natural"
                fill="url(#fillBacktest)"
                stroke="var(--color-backtest)"
                strokeWidth={2}
                connectNulls={false} // don't connect across gaps
              />
            )}

            {/* Future predictions — dashed, only shown after Run Prediction */}
            {futureData.length > 0 && (
              <Area
                dataKey="future"
                type="natural"
                fill="url(#fillFuture)"
                stroke="var(--color-future)"
                strokeWidth={2}
                strokeDasharray="4 4"  // dashed to distinguish from historical
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}