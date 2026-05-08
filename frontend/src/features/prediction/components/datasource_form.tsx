"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getSources, createPredefinedDataset } from "@/lib/api/dataset.api"
import { useAuth } from "@/contexts/auth.context"

interface Props {
  onNext: (dataset: any) => void
}

export function DatasourceForm({ onNext }: Props) {

  const [sources, setSources] = useState<any[]>([])
  const [selected, setSelected] = useState("")
  const [apiKey, setApiKey] = useState("")
  const { user } = useAuth()
  const userId = user?.id ?? 1

  useEffect(() => {
    getSources()
      .then((data) => {
        // Double-check that we actually received an array before setting it
        if (Array.isArray(data)) {
          setSources(data)
        } else {
          console.error("API returned non-array data:", data)
          setSources([]) // Fallback to an empty array so .map() doesn't crash
        }
      })
      .catch((err) => {
        console.error("Failed to fetch sources:", err)
        setSources([]) // Fallback to an empty array if the network request fails
      })
  }, [])

  const handleContinue = async () => {
    const dataset = await createPredefinedDataset(
      selected,
      userId,
      apiKey || undefined // Pass API key if provided
    )

    onNext(dataset)
  }

  // Show API key input only for Alpha Vantage
  const showApiKeyInput = selected === "ALPHAVANTAGE"

  return (
    <div className="space-y-4 mt-4">

      <div className="space-y-2">
        <Label>Data Source</Label>
        <Select onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Choose datasource" />
          </SelectTrigger>

          <SelectContent>
            {sources.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showApiKeyInput && (
        <div className="space-y-2">
          <Label htmlFor="apiKey">Alpha Vantage API Key</Label>
          <Input
            id="apiKey"
            type="text"
            placeholder="Enter your API key (optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get a free API key at{" "}
            <a
              href="https://www.alphavantage.co/support/#api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              alphavantage.co
            </a>
          </p>
        </div>
      )}

      <Button
        disabled={!selected}
        className="w-full"
        onClick={handleContinue}
      >
        Continue
      </Button>

    </div>
  )
}