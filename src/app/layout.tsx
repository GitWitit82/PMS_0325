import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Inter } from "next/font/google"
import { NextAuthProvider } from "@/components/providers/next-auth-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/providers/session-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Resource and Project Management System",
  description: "A comprehensive system for managing resources and projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}>
        <SessionProvider>
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <NextAuthProvider>
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1">{children}</main>
                  </div>
                  <Toaster />
                </NextAuthProvider>
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
