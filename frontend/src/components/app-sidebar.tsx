"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  MessageCircle,
  History,
  Star,
  TrendingUp,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth.context"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navGroups: [
    {
      label: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Prediction",
          url: "/dashboard?newPrediction=true",
          icon: TrendingUp,
        },
        {
          title: "Watchlist",
          url: "/watchlist",
          icon: Star,
        },
        {
          title: "History",
          url: "/historic",
          icon: History,
        },
        {
          title: "Support",
          url: "/dashboard/support",
          icon: MessageCircle,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          title: "User Settings",
          url: "/settings/user",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  
  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Guest",
    email: user?.email || "guest@stocky.com",
    avatar: "",
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Stocky</span>
                  <span className="truncate text-xs">Stock Predictions</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
