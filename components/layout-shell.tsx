"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { Navbar } from "@/components/navbar"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname === "/" || pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
    </>
  )
}




