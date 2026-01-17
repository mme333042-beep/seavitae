"use client"

import { InactivityTracker } from "@/components/InactivityTracker"

export default function JobseekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InactivityTracker>{children}</InactivityTracker>
}
