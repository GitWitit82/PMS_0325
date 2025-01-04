"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/sidebar-nav"
import { cn } from "@/lib/utils"

/**
 * Main Sidebar component that can be collapsed
 */
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div
      className={cn(
        "relative min-h-screen border-r bg-sidebar transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && <span className="text-lg font-semibold">App Name</span>}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
      <SidebarNav isCollapsed={isCollapsed} />
    </div>
  )
} 