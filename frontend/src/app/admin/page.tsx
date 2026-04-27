"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"
import { getAdminStats, getAllUsers, searchUsers, getAllPredictions, type AdminStats, type UserSummary, type PredictionSummary } from "@/lib/api/admin.api"
import { watchlistApi, type WatchlistItem } from "@/lib/api/watchlist.api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users, TrendingUp, BarChart3, UserPlus,
  Search, LogOut, Loader2, Star, Trash2, Activity, Plus, LineChart, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]       = useState<AdminStats | null>(null)
  const [users, setUsers]       = useState<UserSummary[]>([])
  const [predictions, setPredictions] = useState<PredictionSummary[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [search, setSearch]     = useState("")
  const [tab, setTab]           = useState<"overview" | "users" | "predictions" | "watchlist">("overview")
  const [loading, setLoading]   = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")
  const [addingSymbol, setAddingSymbol] = useState(false)

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers(), getAllPredictions()])
      .then(([s, u, p]) => { setStats(s); setUsers(u); setPredictions(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
    
    // Load watchlist if user exists
    if (user) {
      watchlistApi.getUserWatchlist(user.id)
        .then(setWatchlist)
        .catch(console.error)
    }
  }, [user])

  // Refresh predictions when switching to predictions tab
  useEffect(() => {
    if (tab === 'predictions') {
      getAllPredictions()
        .then(setPredictions)
        .catch(console.error)
    }
  }, [tab])

  useEffect(() => {
    if (!search.trim()) {
      getAllUsers().then(setUsers).catch(console.error)
      return
    }
    const t = setTimeout(() => {
      searchUsers(search).then(setUsers).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleLogout = () => { logout(); navigate("/dashboard") }

  const handleRemoveFromWatchlist = async (symbol: string) => {
    if (!user) return
    try {
      await watchlistApi.removeFromWatchlist(user.id, symbol)
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol))
      toast.success(`${symbol} removed from watchlist`)
    } catch (error) {
      console.error('Failed to remove from watchlist:', error)
      toast.error('Failed to remove from watchlist')
    }
  }

  const handleViewPrediction = (symbol: string) => {
    navigate(`/prediction/historical?symbol=${symbol}`)
  }

  const handleAddSymbol = async () => {
    if (!user || !newSymbol.trim()) return
    
    setAddingSymbol(true)
    try {
      await watchlistApi.addToWatchlist({ userId: user.id, symbol: newSymbol.toUpperCase() })
      const updatedWatchlist = await watchlistApi.getUserWatchlist(user.id)
      setWatchlist(updatedWatchlist)
      toast.success(`${newSymbol.toUpperCase()} added to watchlist`)
      setNewSymbol("")
      setAddDialogOpen(false)
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already in watchlist')) {
        toast.info(`${newSymbol.toUpperCase()} is already in your watchlist`)
      } else {
        toast.error('Failed to add to watchlist')
      }
    } finally {
      setAddingSymbol(false)
    }
  }

  const handleRefreshPredictions = async () => {
    try {
      const [s, p] = await Promise.all([getAdminStats(), getAllPredictions()])
      setStats(s)
      setPredictions(p)
      toast.success('Predictions refreshed')
    } catch (error) {
      console.error('Failed to refresh predictions:', error)
      toast.error('Failed to refresh predictions')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Logo size={20} />
          </div>
          <span className="font-semibold text-lg">StockAI Admin</span>
          <Badge variant="destructive" className="text-xs">Admin</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
          <ModeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {(["overview", "users", "predictions", "watchlist"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors capitalize
                ${tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : tab === "overview" ? (
          // ── Overview Tab ──
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users className="size-5 text-blue-500" />}
                label="Total Users" value={stats?.totalUsers ?? 0} />
              <StatCard icon={<UserPlus className="size-5 text-green-500" />}
                label="New This Month" value={stats?.newUsersThisMonth ?? 0} />
              <StatCard icon={<TrendingUp className="size-5 text-purple-500" />}
                label="Total Predictions" value={stats?.totalPredictions ?? 0} />
              <StatCard icon={<BarChart3 className="size-5 text-orange-500" />}
                label="Models Used" value={Object.keys(stats?.predictionsByModel ?? {}).length} />
            </div>

            {/* Predictions by model */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Predictions by Model</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.keys(stats.predictionsByModel).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.predictionsByModel).map(([model, count]) => {
                      const total = stats.totalPredictions || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={model} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{model}</span>
                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No predictions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : tab === "users" ? (
          // ── Users Tab ──
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {["Name", "Email", "Role", "Predictions", "Joined"].map(h => (
                          <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                            No users found.
                          </td>
                        </tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                          <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="p-4">
                            <Badge variant={u.role === "ADMIN" ? "destructive" : "secondary"} className="text-xs">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{u.predictionCount}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : tab === "predictions" ? (
          // ── Predictions Tab ──
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Predictions</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {predictions.length} total
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshPredictions}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Prediction Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Predictions</p>
                      <p className="text-3xl font-bold mt-1">{stats?.totalPredictions ?? 0}</p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <LineChart className="size-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Most Used Model</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats && Object.keys(stats.predictionsByModel).length > 0
                          ? Object.entries(stats.predictionsByModel).sort((a, b) => b[1] - a[1])[0][0]
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <BarChart3 className="size-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Stocks</p>
                      <p className="text-3xl font-bold mt-1">
                        {new Set(predictions.map(p => p.company)).size}
                      </p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <TrendingUp className="size-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {predictions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
                  <p className="text-muted-foreground text-center">
                    Predictions will appear here once users start making forecasts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Recent Predictions ({predictions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.slice(0, 50).map((pred) => (
                        <TableRow key={pred.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{pred.userName}</div>
                              <div className="text-xs text-muted-foreground">{pred.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pred.company}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{pred.modelType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(pred.createdAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : tab === "watchlist" ? (
          // ── Watchlist Tab ──
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Watchlist</h2>
              <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>

            {watchlist.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start adding stocks to track their performance.
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Stock
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-current text-yellow-500" />
                    Watched Stocks ({watchlist.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Added Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchlist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.symbol}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.addedAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <TrendingUp className="h-3 w-3" />
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPrediction(item.symbol)}
                              >
                                Predict
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromWatchlist(item.symbol)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Add Stock Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock to Watchlist</DialogTitle>
              <DialogDescription>
                Enter a stock symbol to add it to your watchlist (e.g., AAPL, TSLA, GOOGL)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Stock Symbol (e.g., AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSymbol.trim()) {
                    handleAddSymbol()
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSymbol} 
                disabled={!newSymbol.trim() || addingSymbol}
              >
                {addingSymbol ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Stock'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="rounded-full bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
