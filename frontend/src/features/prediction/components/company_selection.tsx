"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, X, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth.context"
import { watchlistApi } from "@/lib/api/watchlist.api"
import { toast } from "sonner"

interface Props {
  dataInput: any
  onBack: () => void
}

export function CompanySelection({ dataInput, onBack }: Props) {
  const [query, setQuery]       = useState("")
  const [company, setCompany]   = useState("")
  const [symbols, setSymbols]   = useState<Array<{symbol: string, name: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen]         = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)
  const navigate                = useNavigate()
  const { isAuthenticated, user } = useAuth()

  // Fetch initial symbols when component loads
  useEffect(() => {
    if (dataInput?.id) {
      setIsLoading(true)
      fetch(`http://localhost:8083/api/datasets/stocks/search`)
        .then(res => res.json())
        .then(data => setSymbols(data))
        .catch(err => console.error("Failed to fetch symbols", err))
        .finally(() => setIsLoading(false))
    }
  }, [dataInput])

  // Search symbols as user types
  useEffect(() => {
    if (query.length > 0) {
      setSearchLoading(true)
      const timeoutId = setTimeout(() => {
        fetch(`http://localhost:8083/api/datasets/stocks/search?query=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => setSymbols(data))
          .catch(err => console.error("Failed to search symbols", err))
          .finally(() => setSearchLoading(false))
      }, 300) // Debounce search by 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Check watchlist status when company changes
  useEffect(() => {
    if (isAuthenticated && user && company) {
      checkWatchlistStatus()
    }
  }, [isAuthenticated, user, company])

  const checkWatchlistStatus = async () => {
    if (!user || !company) return
    try {
      const exists = await watchlistApi.isInWatchlist(user.id, company)
      setIsInWatchlist(exists)
    } catch (error) {
      console.error('Failed to check watchlist status:', error)
    }
  }

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated || !user) {
      navigate("/auth/sign-in-3")
      return
    }

    if (!company) {
      toast.error('Please select a symbol first')
      return
    }

    try {
      if (isInWatchlist) {
        await watchlistApi.removeFromWatchlist(user.id, company)
        setIsInWatchlist(false)
        toast.success(`${company} removed from watchlist`)
      } else {
        await watchlistApi.addToWatchlist({ userId: user.id, symbol: company })
        setIsInWatchlist(true)
        toast.success(`${company} added to watchlist`)
      }
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already in watchlist')) {
        toast.info(`${company} is already in your watchlist`)
        setIsInWatchlist(true)
      } else {
        toast.error(`Failed to ${isInWatchlist ? 'remove from' : 'add to'} watchlist`)
      }
    }
  }

  const handleSelect = (symbol: string) => {
    setCompany(symbol)
    setQuery(symbol)
    setOpen(false)
    setIsInWatchlist(false) // Reset watchlist status, will be checked in useEffect
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    setQuery(val)
    setCompany(val)
    setOpen(val.length > 0)
  }

  const handleClear = () => {
    setQuery("")
    setCompany("")
    setOpen(false)
  }

  const handleSubmit = () => {
    navigate("/prediction/historical", {
      state: {
        company,
        datasetId: dataInput.id,
      },
    })
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <div ref={containerRef} className="relative">
          {/* Input with search icon */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search symbol (e.g. AAPL, TSLA...)"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length > 0 && setOpen(true)}
              className="pl-9 pr-9"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-64 overflow-y-auto">
              {(isLoading || searchLoading) ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Searching...
                </div>
              ) : symbols.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No symbols match "{query}"
                </div>
              ) : (
                symbols.map(stock => (
                  <button
                    key={stock.symbol}
                    onMouseDown={() => handleSelect(stock.symbol)}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors",
                      company === stock.symbol && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground">{stock.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Show selected symbol as a badge */}
        {company && !open && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{company}</span>
            </p>
            {isAuthenticated && (
              <Button
                size="sm"
                variant={isInWatchlist ? "secondary" : "outline"}
                onClick={handleToggleWatchlist}
                className="flex items-center gap-1 h-6 px-2 text-xs"
              >
                <Star className={`size-3 ${isInWatchlist ? "fill-current" : ""}`} />
                {isInWatchlist ? "Watching" : "Watch"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!company} onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </div>
  )
}
