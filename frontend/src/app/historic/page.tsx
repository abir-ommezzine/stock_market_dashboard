"use client"

import React, { useState, useEffect } from 'react'
import { BaseLayout } from '@/components/layouts/base-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth.context'
import { useNavigate } from 'react-router-dom'
import { getUserPredictions, deletePrediction, type SavedPrediction } from '@/lib/api/prediction_history.api'
import type { PredictionResult } from '@/lib/api/prediction.api'

const MODEL_COLORS: Record<string, string> = {
  ARIMA:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  SARIMA: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  ARMA:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
}

export default function HistoricPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [predictions, setPredictions] = useState<SavedPrediction[]>([])
  const [loading, setLoading]         = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [search, setSearch]           = useState('')

  const itemsPerPage = 6

  // Fetch predictions when signed in
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getUserPredictions(user.id)
      .then(setPredictions)
      .catch(err => console.error("Failed to fetch predictions:", err))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = predictions.filter(p =>
    p.company.toLowerCase().includes(search.toLowerCase()) ||
    p.modelType.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const toggleRow = (id: string) =>
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])

  const toggleAll = () =>
    setSelectedRows(
      selectedRows.length === currentItems.length && currentItems.length > 0
        ? []
        : currentItems.map(e => String(e.id))
    )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleRerun = (prediction: SavedPrediction) => {
    const result: PredictionResult = JSON.parse(prediction.resultJson)
    const params = JSON.parse(prediction.parameters)
    navigate('/prediction/historical', {
      state: {
        company: prediction.company,
        datasetId: prediction.datasetId,
        preloadedResult: result,
        preloadedParams: {
          model_type: prediction.modelType,
          p: params.p,
          d: params.d,
          q: params.q,
          steps: params.steps,
        },
      },
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePrediction(id)
      setPredictions(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("Failed to delete prediction:", err)
    }
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString()

  const formatParams = (paramsJson: string, modelType: string) => {
    try {
      const p = JSON.parse(paramsJson)
      if (modelType === 'ARMA')   return `p=${p.p}, q=${p.q}`
      if (modelType === 'SARIMA') return `p=${p.p}, d=${p.d}, q=${p.q}, s=12`
      return `p=${p.p}, d=${p.d}, q=${p.q}`
    } catch {
      return paramsJson
    }
  }

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <BaseLayout title="History" description="View your saved predictions">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="rounded-full bg-muted p-6">
            <LogIn className="size-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign in to view your history</h2>
            <p className="text-muted-foreground max-w-sm">
              Your prediction history is saved to your account. Sign in to access your past experiments.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/auth/sign-in-3', { state: { redirect: '/historic' } })}
          >
            Sign in
          </Button>
        </div>
      </BaseLayout>
    )
  }

  // ── Signed in ──────────────────────────────────────────────────────────────
  return (
    <BaseLayout
      title="Historic Experiments"
      description="View all saved model experiments and their configurations"
    >
      <div className="w-full max-w-7xl space-y-6 my-8 mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="pb-0 gap-0">
          <CardHeader className="border-b border-border gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by stock or model..."
                  className="pl-10"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="sm:ml-auto flex items-center gap-2 flex-wrap justify-center">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs cursor-pointer">
                  <Filter />
                  Filter
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs cursor-pointer">
                      <Download data-icon="inline-start" />
                      Export
                      <ChevronDown data-icon="inline-end" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer">Export as CSV</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Export as Excel</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Export as PDF</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      <Checkbox
                        checked={selectedRows.length === currentItems.length && currentItems.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Model</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Parameters</th>
                    <th className="text-left p-4 font-medium text-sm text-nowrap text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                        {search ? 'No experiments match your search.' : 'No predictions yet. Run a prediction to see it here.'}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((prediction) => (
                      <tr
                        key={prediction.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedRows.includes(String(prediction.id))}
                            onCheckedChange={() => toggleRow(String(prediction.id))}
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-foreground">{prediction.company}</span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={cn('px-2.5 py-0.5 font-semibold', MODEL_COLORS[prediction.modelType] ?? 'bg-muted text-muted-foreground')}
                          >
                            {prediction.modelType}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {formatParams(prediction.parameters, prediction.modelType)}
                          </code>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground text-nowrap">
                            {formatDate(prediction.createdAt)}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs cursor-pointer">
                                Actions <ChevronDown data-icon="inline-end" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="cursor-pointer py-2"
                                  onClick={() => handleRerun(prediction)}
                                >
                                  Re-run
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive cursor-pointer py-2"
                                  onClick={() => handleDelete(prediction.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={cn('h-9 w-9', currentPage === page && 'bg-primary', 'cursor-pointer')}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline" size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
