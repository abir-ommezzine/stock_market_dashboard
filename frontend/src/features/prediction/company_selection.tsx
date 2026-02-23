"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  dataInput: any
  onBack: () => void
}

export function CompanySelection({ dataInput, onBack }: Props) {

  const [company, setCompany] = useState("")

  const handleSubmit = () => {
    console.log("DATA INPUT:", dataInput)
    console.log("COMPANY:", company)

    // next step later → timeframe selection
  }

  return (
    <div className="space-y-4 mt-4">

      <Input
        placeholder="Enter company symbol (AAPL, TSLA...)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

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