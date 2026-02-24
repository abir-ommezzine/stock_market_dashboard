"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { DatasourceForm } from "../components/datasource_form"
import { CsvUpload } from "../components/csv_upload"
import { CompanySelection } from "../components/company_selection"
import type { Dataset } from "../types"
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewPredictionDialog({ open, onOpenChange }: Props) {

  // ⭐ wizard step
  const [step, setStep] = useState(1)

  // store chosen datasource/csv
  const [dataInput, setDataInput] = useState<any>(null)

  return (
    <Dialog open={open} onOpenChange={(value) => {
    onOpenChange(value)

    // RESET WHEN CLOSED
    if (!value) {
      setStep(1)
      setDataInput(null)
    }
  }}>
      <DialogContent className="max-w-xl">

        <DialogHeader>
          <DialogTitle>Create Stock Prediction</DialogTitle>
        </DialogHeader>

        {/* STEP 1 */}
        {step === 1 && (
          <Tabs defaultValue="datasource">

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="datasource">
                Select Data Source
              </TabsTrigger>

              <TabsTrigger value="csv">
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datasource">
              <DatasourceForm
                onNext={(data) => {
                  setDataInput(data)
                  setStep(2)
                }}
              />
            </TabsContent>

            <TabsContent value="csv">
              <CsvUpload
                onSuccess={(dataset:Dataset) => {
                  setDataInput(dataset)
                  setStep(2)
                }}
              />
            </TabsContent>

          </Tabs>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <CompanySelection
            dataInput={dataInput}
            onBack={() => setStep(1)}
          />
        )}

      </DialogContent>
    </Dialog>
  )
}