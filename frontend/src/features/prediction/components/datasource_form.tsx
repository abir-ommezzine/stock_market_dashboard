"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getSources, createPredefinedDataset } from "@/lib/api/dataset.api"

interface Props {
  onNext: (dataset: any) => void
}

export function DatasourceForm({ onNext }: Props) {

  const [sources, setSources] = useState<any[]>([])
  const [selected, setSelected] = useState("")
  const userId = 1

  useEffect(() => {
    getSources().then(setSources)
  }, [])

  const handleContinue = async () => {
    const dataset = await createPredefinedDataset(
      selected,
      userId
    )

    onNext(dataset)
  }

  return (
    <div className="space-y-4 mt-4">

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