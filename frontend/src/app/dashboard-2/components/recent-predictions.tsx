"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Trash2 } from "lucide-react"
import { getUserPredictions, deletePrediction, type SavedPrediction } from "@/lib/api/prediction_history.api"
import { useAuth } from "@/contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"

export function RecentPredictions() {
  const { user, isAuthenticated } = useAuth()
  const [predictions, setPredictions] = useState<SavedPrediction[]>([])
  const navigate = useNavigate()

  const loadPredictions = () => {
    if (!isAuthenticated || !user) return
    getUserPredictions(user.id)
      .then(data => setPredictions(data.slice(0, 5)))
      .catch(console.error)
  }

  useEffect(() => {
    loadPredictions()
  }, [user, isAuthenticated])

  const handleDelete = async (id: number) => {
    try {
      await deletePrediction(id)
      setPredictions(prev => prev.filter(p => p.id !== id))
      toast.success('Prediction deleted')
    } catch (error) {
      toast.error('Failed to delete prediction')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Predictions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/historic')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No predictions yet
            </p>
            <Button onClick={() => navigate('/prediction/historical')}>
              Make Your First Prediction
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map(pred => (
              <div
                key={pred.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{pred.company}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {pred.modelType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(pred.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pred.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
