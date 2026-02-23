"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  onNext: (data: any) => void
}

export function DatasourceForm({ onNext }: Props) {

  const [datasource, setDatasource] = useState("")

  return (
    <div className="space-y-4 mt-4">

      <Select onValueChange={setDatasource}>
        <SelectTrigger>
          <SelectValue placeholder="Choose datasource" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="yahoo">Yahoo Finance</SelectItem>
          <SelectItem value="alpha">Alpha Vantage</SelectItem>
        </SelectContent>
      </Select>

      <Button
        disabled={!datasource}
        className="w-full"
        onClick={() => onNext({ datasource })}
      >
        Continue
      </Button>

    </div>
  )
}