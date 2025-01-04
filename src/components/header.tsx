import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Your App Name</h1>
      <ThemeToggle />
    </header>
  )
} 