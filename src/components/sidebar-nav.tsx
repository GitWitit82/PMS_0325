"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Settings, 
  Users,
  // Add more icons as needed
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Navigation item type definition
 */
type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Navigation items configuration
 */
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

/**
 * Props for the SidebarNav component
 */
interface SidebarNavProps {
  isCollapsed: boolean
}

/**
 * SidebarNav component that displays navigation items and theme toggle
 */
export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </div>
      <div className={cn(
        "p-4",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <ThemeToggle />
      </div>
    </div>
  )
} 