"use client"

import { InactivityTracker } from "@/components/InactivityTracker"

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InactivityTracker>{children}</InactivityTracker>
}
