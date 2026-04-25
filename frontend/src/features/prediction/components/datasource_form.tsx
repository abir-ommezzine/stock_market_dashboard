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
import { useAuth } from "@/contexts/auth.context"

interface Props {
  onNext: (dataset: any) => void
}

export function DatasourceForm({ onNext }: Props) {

  const [sources, setSources] = useState<any[]>([])
  const [selected, setSelected] = useState("")
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