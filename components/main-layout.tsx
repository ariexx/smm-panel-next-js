"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MainHeader } from "@/components/main-header"
import { MainSidebar } from "@/components/main-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if Supabase environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("Supabase environment variables are not set")
          toast({
            title: "Configuration Error",
            description: "The application is not properly configured. Please contact support.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const supabase = createClientComponentClient()

        // Get the current authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData.user) {
          router.push("/login")
          return
        }

        // Get the user profile data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          return
        }

        setUser(userData)
      } catch (error) {
        console.error("Error in auth check:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-[300px]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MainSidebar user={user} />
        <SidebarInset>
          <div className="flex flex-col">
            <MainHeader />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
