"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Plus } from "lucide-react"
import { watchlistApi, type WatchlistItem } from "@/lib/api/watchlist.api"
import { useAuth } from "@/contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

export function WatchlistSummary() {
  const { user, isAuthenticated } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) return
    watchlistApi.getUserWatchlist(user.id)
      .then(data => setWatchlist(data.slice(0, 5)))
      .catch(console.error)
  }, [user, isAuthenticated])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-current text-yellow-500" />
            Your Watchlist
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/watchlist')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Your watchlist is empty
            </p>
            <Button onClick={() => navigate('/watchlist')}>
              <Plus className="h-4 w-4 mr-2" />
              Go to Watchlist
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/prediction/historical?symbol=${item.symbol}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-5 w-5 fill-current text-yellow-500" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">{item.symbol}</Badge>
                    <p className="text-xs text-muted-foreground">
                      Added {format(new Date(item.addedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/prediction/historical?symbol=${item.symbol}`)
                  }}
                >
                  Predict
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
