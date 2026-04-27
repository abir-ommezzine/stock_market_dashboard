"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getUserPredictions } from "@/lib/api/prediction_history.api"
import { useAuth } from "@/contexts/auth.context"

interface StockTrend {
  symbol: string
  count: number
  lastPredicted: string
}

export function TrendingStocks() {
  const { user, isAuthenticated } = useAuth()
  const [trending, setTrending] = useState<StockTrend[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    getUserPredictions(user.id)
      .then(predictions => {
        const stockMap = new Map<string, { count: number; lastDate: string }>()
        
        predictions.forEach(p => {
          const existing = stockMap.get(p.company)
          if (existing) {
            existing.count++
            if (new Date(p.createdAt) > new Date(existing.lastDate)) {
              existing.lastDate = p.createdAt
            }
          } else {
            stockMap.set(p.company, { count: 1, lastDate: p.createdAt })
          }
        })

        const trends = Array.from(stockMap.entries())
          .map(([symbol, data]) => ({
            symbol,
            count: data.count,
            lastPredicted: data.lastDate
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setTrending(trends)
      })
      .catch(console.error)
  }, [user, isAuthenticated])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Most Analyzed Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trending.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No predictions yet. Start analyzing stocks!
          </p>
        ) : (
          <div className="space-y-4">
            {trending.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {stock.count} prediction{stock.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {index < 2 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-orange-500" />
                  )}
                  Hot
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
