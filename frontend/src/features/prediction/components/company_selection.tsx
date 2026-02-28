"use client"

import { useState } from "react"
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
  const navigate = useNavigate()

  // Example list of symbols for dropdown
  const symbols = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"]

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

      {/* Input + Select for company */}
      <div className="space-y-2">
        <Input
          placeholder="Type a company symbol"
          value={company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
        />

        <Select onValueChange={setCompany}>
          <SelectTrigger>
            <SelectValue placeholder="Or select a symbol" />
          </SelectTrigger>
          <SelectContent>
            {symbols.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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