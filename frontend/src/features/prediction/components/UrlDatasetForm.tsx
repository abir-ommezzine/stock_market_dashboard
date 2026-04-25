import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Dataset } from "../types"
interface Props {
  onSuccess: (dataset: Dataset) => void
}
export function UrlDatasetForm({ onSuccess }: Props) {

  const [url,setUrl] = useState("")

  const handleSubmit = async () => {

    const res = await fetch(
      "http://localhost:8083/api/datasets/link-url",
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          url,
          userId:1
        })
      }
    )

    const dataset: Dataset = await res.json()
    onSuccess(dataset)
  }

  return (
    <div className="space-y-4">

      <Input
        placeholder="Paste CSV URL"
        value={url}
        onChange={(e)=>setUrl(e.target.value)}
      />

      <Button
        disabled={!url}
        onClick={handleSubmit}
      >
        Continue
      </Button>

    </div>
  )
}