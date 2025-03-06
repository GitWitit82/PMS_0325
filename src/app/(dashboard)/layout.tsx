import { type ReactNode } from "react"
import { Header } from "@/components/header"

/**
 * Layout for dashboard and authenticated pages
 */
interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          {/* Add your sidebar navigation here */}
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <Header />
          {children}
        </main>
      </div>
    </div>
  )
} 