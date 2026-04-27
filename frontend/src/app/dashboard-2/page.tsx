import { BaseLayout } from "@/components/layouts/base-layout"
import { StockMetricsOverview } from "./components/stock-metrics-overview"
import { TrendingStocks } from "./components/trending-stocks"
import { RecentPredictions } from "./components/recent-predictions"
import { WatchlistSummary } from "./components/watchlist-summary"
import { QuickActions } from "./components/quick-actions"
import { PredictionStats } from "./components/prediction-stats"

export default function Dashboard2() {
  return (
    <BaseLayout>
      <div className="flex-1 space-y-6 px-6 pt-0">
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Stock Market Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor stock predictions, trending stocks, and your watchlist
            </p>
          </div>
          <QuickActions />
        </div>

        <div className="@container/main space-y-6">
          <StockMetricsOverview />

          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <TrendingStocks />
            <PredictionStats />
          </div>

          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <RecentPredictions />
            <WatchlistSummary />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
