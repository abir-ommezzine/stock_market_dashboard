"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { getUserPredictions } from "@/lib/api/prediction_history.api"
import { useAuth } from "@/contexts/auth.context"

export function PredictionStats() {
  const { user, isAuthenticated } = useAuth()
  const [modelStats, setModelStats] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isAuthenticated || !user) return

    getUserPredictions(user.id)
      .then(predictions => {
        const stats: Record<string, number> = {}
        predictions.forEach(p => {
          stats[p.modelType] = (stats[p.modelType] || 0) + 1
        })
        setModelStats(stats)
      })
      .catch(console.error)
  }, [user, isAuthenticated])

  const total = Object.values(modelStats).reduce((sum, count) => sum + count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Model Usage Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No model usage data yet
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(modelStats)
              .sort((a, b) => b[1] - a[1])
              .map(([model, count]) => {
                const percentage = Math.round((count / total) * 100)
                return (
                  <div key={model} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{model}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
