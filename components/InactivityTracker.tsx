"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession, signOut } from "@/lib/supabase/auth"

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute
const LAST_ACTIVITY_KEY = "seavitae_last_activity"

interface InactivityTrackerProps {
  children: React.ReactNode
}

/**
 * Logs a signed-in user out after 15 minutes of inactivity.
 *
 * Crucially, it also logs out a *stale* session on load: if the last recorded
 * activity was more than 15 minutes ago (e.g. the tab/app was reopened a day
 * later), the cached session is cleared and the user is sent to /login. This
 * runs globally (mounted in the root layout) but is a no-op for logged-out
 * visitors, so public pages are never redirected.
 */
export function InactivityTracker({ children }: InactivityTrackerProps) {
  const router = useRouter()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null
    let throttleStamp = 0
    let cancelled = false

    const logout = async () => {
      localStorage.removeItem(LAST_ACTIVITY_KEY)
      await signOut()
      router.push("/login?reason=inactivity")
    }

    const markActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    }

    const isStale = () => {
      const last = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (!last) return false
      return Date.now() - parseInt(last, 10) >= INACTIVITY_TIMEOUT
    }

    const resetTimer = () => {
      markActivity()
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT)
    }

    // Throttle so we don't write to localStorage on every mouse move.
    const onActivity = () => {
      const now = Date.now()
      if (now - throttleStamp > 5000) {
        throttleStamp = now
        resetTimer()
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible" && isStale()) {
        logout()
      }
    }

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ]

    async function init() {
      // Only track signed-in users; never redirect anonymous visitors.
      const session = await getSession()
      if (cancelled || !session) return

      // If the user has been away longer than the timeout, log out immediately
      // regardless of any cached session on the device.
      if (isStale()) {
        logout()
        return
      }

      resetTimer()
      activityEvents.forEach((event) =>
        window.addEventListener(event, onActivity, { passive: true })
      )
      intervalId = setInterval(() => {
        if (isStale()) logout()
      }, ACTIVITY_CHECK_INTERVAL)
      document.addEventListener("visibilitychange", onVisible)
    }

    init()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
      activityEvents.forEach((event) =>
        window.removeEventListener(event, onActivity)
      )
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [router])

  return <>{children}</>
}
