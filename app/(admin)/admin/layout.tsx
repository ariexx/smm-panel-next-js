import type React from "react"
import { MainLayout } from "@/components/main-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
