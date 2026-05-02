"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  const isHistoric   = location.pathname === "/historic"
  const isPrediction = location.pathname === "/prediction/historical"
  const isWatchlist  = location.pathname === "/watchlist"
  const isAdmin      = location.pathname === "/admin"

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ml-auto flex items-center gap-2">

            {/* Dashboard button — shown on history, prediction, watchlist, and admin pages */}
            {(isHistoric || isPrediction || isWatchlist || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex dark:text-foreground"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            )}

            {/* Watchlist button — shown to all authenticated users */}
            {isAuthenticated && !isWatchlist && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex dark:text-foreground"
                onClick={() => navigate('/watchlist')}
              >
                Watchlist
              </Button>
            )}

            {/* History button — always shown except on history page */}
            {!isHistoric && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex dark:text-foreground"
                onClick={() => navigate('/historic')}
              >
                History
              </Button>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="dark:text-foreground"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex dark:text-foreground"
                onClick={() => navigate("/auth/sign-in-3")}
              >
                Sign in
              </Button>
            )}

            <ModeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
