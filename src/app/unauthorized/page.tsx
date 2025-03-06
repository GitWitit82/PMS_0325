import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Unauthorized Access</h1>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have permission to access this page
          </p>
        </div>
        <Link
          href="/auth/signin"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full"
          )}
        >
          Sign In
        </Link>
      </div>
    </div>
  )
} 