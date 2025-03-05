import { ReactNode } from "react"
import { Header } from "@/components/header"

/**
 * Layout for dashboard and authenticated pages
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {children}
    </div>
  )
} 