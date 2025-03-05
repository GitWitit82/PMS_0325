import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth.config"

export default async function Home() {
  const session = await getServerSession(authConfig)
  
  if (session) {
    redirect("/dashboard")
  }
  
  redirect("/auth/signin")
}
