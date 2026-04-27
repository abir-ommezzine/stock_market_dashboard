"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Activity, BarChart3, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth.context"
import { watchlistApi } from "@/lib/api/watchlist.api"
import { getUserPredictions } from "@/lib/api/prediction_history.api"

export function StockMetricsOverview() {
  const { user, isAuthenticated } = useAuth()
  const [metrics, setMetrics] = useState({
    totalPredictions: 0,
    watchlistCount: 0,
    uniqueStocks: 0,
    mostUsedModel: "N/A"
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('Dashboard: Not authenticated or no user')
      return
    }

    console.log('Dashboard: Loading data for user', user.id)

    Promise.all([
      getUserPredictions(user.id),
      watchlistApi.getUserWatchlist(user.id)
    ])
      .then(([predictions, watchlist]) => {
        console.log('Dashboard: Loaded predictions:', predictions.length)
        console.log('Dashboard: Loaded watchlist:', watchlist.length)
        
        const uniqueStocks = new Set(predictions.map(p => p.company)).size
        const modelCounts: Record<string, number> = {}
        predictions.forEach(p => {
          modelCounts[p.modelType] = (modelCounts[p.modelType] || 0) + 1
        })
        const mostUsed = Object.keys(modelCounts).length > 0
          ? Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0][0]
          : "N/A"

        setMetrics({
          totalPredictions: predictions.length,
          watchlistCount: watchlist.length,
          uniqueStocks,
          mostUsedModel: mostUsed
        })
      })
      .catch(err => {
        console.error('Dashboard: Error loading data:', err)
      })
  }, [user, isAuthenticated])

  const cards = [
    {
      title: "Total Predictions",
      value: metrics.totalPredictions,
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      description: "Forecasts made"
    },
    {
      title: "Watchlist",
      value: metrics.watchlistCount,
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      description: "Stocks tracked"
    },
    {
      title: "Unique Stocks",
      value: metrics.uniqueStocks,
      icon: <Activity className="h-5 w-5 text-green-500" />,
      description: "Analyzed"
    },
    {
      title: "Favorite Model",
      value: metrics.mostUsedModel,
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      description: "Most used"
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
              <div className="rounded-full bg-muted p-3">
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
