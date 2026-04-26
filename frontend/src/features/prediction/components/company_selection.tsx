"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface Props {
  dataInput: any
  onBack: () => void
}

export function CompanySelection({ dataInput, onBack }: Props) {
  const [query, setQuery]       = useState("")
  const [company, setCompany]   = useState("")
  const [symbols, setSymbols]   = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen]         = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)
  const navigate                = useNavigate()

  // Fetch symbols when component loads
  useEffect(() => {
    if (dataInput?.id) {
      setIsLoading(true)
      fetch(`http://localhost:8083/api/datasets/${dataInput.id}/symbols`)
        .then(res => res.json())
        .then(data => setSymbols(data.filter((s: string) => s && s.trim() !== "")))
        .catch(err => console.error("Failed to fetch symbols", err))
        .finally(() => setIsLoading(false))
    }
  }, [dataInput])

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

  const filtered = symbols.filter(s =>
    s.toLowerCase().startsWith(query.toLowerCase()) ||
    s.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (symbol: string) => {
    setCompany(symbol)
    setQuery(symbol)
    setOpen(false)
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
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-52 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading symbols...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No symbols match "{query}"
                </div>
              ) : (
                filtered.map(symbol => (
                  <button
                    key={symbol}
                    onMouseDown={() => handleSelect(symbol)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      company === symbol && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {symbol}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Show selected symbol as a badge */}
        {company && !open && (
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-semibold text-foreground">{company}</span>
          </p>
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
