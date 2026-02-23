"use client"

import { useState } from "react"
import { Settings, FileText, Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NewPredictionDialog } from "@/features/prediction/new_prediction_dialog"

export function QuickActions() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center space-x-2">

      {/* ✅ BUTTON THAT OPENS MODAL */}
      <Button
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Prediction
      </Button>

      {/* ✅ MODAL */}
      <NewPredictionDialog
        open={open}
        onOpenChange={setOpen}
      />

      {/* Existing actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            Dashboard Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}