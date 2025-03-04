import { ReactNode } from "react"
import { Logo } from "@/components/ui/logo"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="relative flex items-center justify-center p-8">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="hidden md:block bg-muted">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>
    </div>
  )
} 