"use client"

import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchStockData } from "@/lib/api/stock.api"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/app/dashboard/components/chart-area-interactive"

export default function HistoricalPricesPage() {

  const location = useLocation()

  const { company, datasetId } = location.state || {}

  const [data, setData] = useState<any>(null)

  useEffect(() => {
  if (!datasetId || !company) {
    console.warn("Missing company or datasetId in location.state")
    return
  }

  fetchStockData(datasetId, company)
    .then(setData)
    .catch(err => console.error("Error fetching stock data", err))

}, [datasetId, company])

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>
            Historical Prices — {company}
          </CardTitle>
        </CardHeader>

        <CardContent>
          Dataset ID: {datasetId}
        </CardContent>
      </Card>

      <ChartAreaInteractive data={data} />

    </div>
  )
}