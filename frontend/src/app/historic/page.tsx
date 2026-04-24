"use client"

import React, { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Experiment {
  id: string
  stockName: string
  modelUsed: string
  parameters: string
  date: string
}

// Static data — will be replaced with dynamic data later
const experimentsData: Experiment[] = [
  {
    id: '1',
    stockName: 'AAPL',
    modelUsed: 'ARIMA',
    parameters: 'p=2, d=1, q=2',
    date: '2026-04-10',
  },
  {
    id: '2',
    stockName: 'TSLA',
    modelUsed: 'SARIMA',
    parameters: 'p=1, d=1, q=1, P=1, D=1, Q=1, s=12',
    date: '2026-04-12',
  },
  {
    id: '3',
    stockName: 'GOOGL',
    modelUsed: 'ARMA',
    parameters: 'p=3, q=2',
    date: '2026-04-14',
  },
  {
    id: '4',
    stockName: 'MSFT',
    modelUsed: 'ARIMA',
    parameters: 'p=1, d=1, q=1',
    date: '2026-04-15',
  },
  {
    id: '5',
    stockName: 'AMZN',
    modelUsed: 'SARIMA',
    parameters: 'p=2, d=1, q=2, P=0, D=1, Q=1, s=12',
    date: '2026-04-17',
  },
  {
    id: '6',
    stockName: 'NVDA',
    modelUsed: 'ARMA',
    parameters: 'p=2, q=1',
    date: '2026-04-18',
  },
  {
    id: '7',
    stockName: 'META',
    modelUsed: 'ARIMA',
    parameters: 'p=3, d=1, q=3',
    date: '2026-04-20',
  },
  {
    id: '8',
    stockName: 'NFLX',
    modelUsed: 'SARIMA',
    parameters: 'p=1, d=1, q=1, P=1, D=0, Q=1, s=6',
    date: '2026-04-22',
  },
]

const MODEL_COLORS: Record<string, string> = {
  ARIMA:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  SARIMA:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  ARMA: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
}

export default function HistoricPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const itemsPerPage = 6

  const filtered = experimentsData.filter(
    (e) =>
      e.stockName.toLowerCase().includes(search.toLowerCase()) ||
      e.modelUsed.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === currentItems.length && currentItems.length > 0) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentItems.map((e) => e.id))
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <BaseLayout
      title="Historic Experiments"
      description="View all saved model experiments and their configurations"
    >
      <div className="w-full max-w-7xl space-y-6 my-8 mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="pb-0 gap-0">
          <CardHeader className="border-b border-border gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by stock or model..."
                  className="pl-10"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Actions */}
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
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      <Checkbox
                        checked={
                          selectedRows.length === currentItems.length &&
                          currentItems.length > 0
                        }
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Stock Name
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Model Used
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-nowrap text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-sm text-muted-foreground"
                      >
                        No experiments found.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((experiment) => (
                      <tr
                        key={experiment.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedRows.includes(experiment.id)}
                            onCheckedChange={() => toggleRow(experiment.id)}
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-foreground">
                            {experiment.stockName}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              'px-2.5 py-0.5 font-semibold',
                              MODEL_COLORS[experiment.modelUsed] ??
                                'bg-muted text-muted-foreground',
                            )}
                          >
                            {experiment.modelUsed}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {experiment.parameters}
                          </code>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground text-nowrap">
                            {experiment.date}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs cursor-pointer"
                              >
                                Actions
                                <ChevronDown data-icon="inline-end" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem className="cursor-pointer py-2">
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2">
                                  Re-run
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive cursor-pointer py-2">
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
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'h-9 w-9',
                      currentPage === page && 'bg-primary',
                      'cursor-pointer',
                    )}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
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
