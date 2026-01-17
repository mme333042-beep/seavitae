"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute
const LAST_ACTIVITY_KEY = "seavitae_last_activity"

interface InactivityTrackerProps {
  children: React.ReactNode
}

export function InactivityTracker({ children }: InactivityTrackerProps) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(async () => {
    // Clear the activity tracking
    localStorage.removeItem(LAST_ACTIVITY_KEY)

    // Sign out
    await signOut()

    // Redirect to login page
    router.push("/login?reason=inactivity")
  }, [router])

  const updateLastActivity = useCallback(() => {
    const now = Date.now()
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
  }, [])

  const resetTimer = useCallback(() => {
    // Update last activity timestamp
    updateLastActivity()

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_TIMEOUT)
  }, [handleLogout, updateLastActivity])

  const checkInactivity = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10)
      if (elapsed >= INACTIVITY_TIMEOUT) {
        handleLogout()
      }
    }
  }, [handleLogout])

  useEffect(() => {
    // Initialize last activity on mount
    updateLastActivity()

    // Set up activity listeners
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ]

    // Throttle activity updates to avoid excessive localStorage writes
    let lastUpdate = 0
    const throttledResetTimer = () => {
      const now = Date.now()
      if (now - lastUpdate > 5000) {
        // Only update every 5 seconds
        lastUpdate = now
        resetTimer()
      }
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledResetTimer, { passive: true })
    })

    // Initial timer
    resetTimer()

    // Set up periodic check for inactivity (handles tab switches, sleep, etc.)
    checkIntervalRef.current = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL)

    // Check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInactivity()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [resetTimer, checkInactivity, updateLastActivity])

  return <>{children}</>
}
