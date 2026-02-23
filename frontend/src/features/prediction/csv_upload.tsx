"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  onNext: (file: File) => void
}

export function CsvUpload({ onNext }: Props) {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="space-y-6">

      {/* TITLE */}
      <p className="text-sm font-medium">
        Upload your stock CSV file
      </p>

      {/* UPLOAD BUTTON */}
      <label className="cursor-pointer inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-accent">
        Choose CSV File
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (selected) {
              setFile(selected)
            }
          }}
        />
      </label>

      {/* FILE NAME */}
      {file && (
        <p className="text-sm text-green-600">
          Selected file: {file.name}
        </p>
      )}

      {/* NEXT BUTTON */}
      <Button
        disabled={!file}
        onClick={() => file && onNext(file)}
      >
        Continue
      </Button>

    </div>
  )
}