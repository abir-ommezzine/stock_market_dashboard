"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TrendingUp, History, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewPredictionDialog } from "@/features/prediction/dialogs/new_prediction_dialog"

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex items-center space-x-2">
      <Button
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Prediction
      </Button>

      <NewPredictionDialog
        open={open}
        onOpenChange={setOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <TrendingUp className="h-4 w-4 mr-2" />
            Quick Access
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/watchlist')}>
            <Star className="h-4 w-4 mr-2" />
            My Watchlist
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate('/historic')}>
            <History className="h-4 w-4 mr-2" />
            Prediction History
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/prediction/historical')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}