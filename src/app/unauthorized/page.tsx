import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-4 p-8">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-center text-muted-foreground">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </Card>
    </div>
  )
} 