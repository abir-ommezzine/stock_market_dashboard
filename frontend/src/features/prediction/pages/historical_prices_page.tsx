"use client"

import { useLocation } from "react-router-dom"
import{ ChartAreaInteractive } from "@/app/dashboard/components/chart-area-interactive"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function HistoricalPricesPage() {
  const location = useLocation()

  const { company, source } = location.state || {}

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>
            Historical Stock Prices — {company ?? "Demo Company"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          Source:
          {" "}
          {typeof source === "string"
            ? source
            : source?.datasource || "Mock datasource"}
        </CardContent>
      </Card>

      <ChartAreaInteractive />

    </div>
  )
}