"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { useNavigate } from "react-router-dom"

interface Props {
  dataInput: any
  onBack: () => void
}

export function CompanySelection({ dataInput, onBack }: Props) {
  const [company, setCompany] = useState("")
  const [symbols, setSymbols] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch symbols dynamically when the component loads
  useEffect(() => {
    if (dataInput?.id) {
      setIsLoading(true)
      fetch(`http://localhost:8082/api/datasets/${dataInput.id}/symbols`)
        .then((res) => res.json())
        .then((data) => setSymbols(data))
        .catch((err) => console.error("Failed to fetch symbols", err))
        .finally(() => setIsLoading(false))
    }
  }, [dataInput])

  const handleSubmit = () => {
    navigate("/prediction/historical", {
      state: {
        company: company,
        datasetId: dataInput.id,
      },
    })
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Input
          placeholder="Type a company symbol (e.g., AAPL)"
          value={company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value.toUpperCase())}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading symbols...</p>
        ) : (
          symbols.length > 0 && (
            <Select onValueChange={setCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Or select an available symbol" />
              </SelectTrigger>
              <SelectContent>
                {symbols .filter(s => s && s.trim() !== "")
                .map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
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