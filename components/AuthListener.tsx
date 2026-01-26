"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * AuthListener component that handles auth state changes globally.
 * Specifically handles PASSWORD_RECOVERY events to redirect users
 * to the reset-password page when they click the email link.
 */
function AuthListenerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHandledRecovery = useRef(false);

  useEffect(() => {
    // Prevent double-handling
    if (hasHandledRecovery.current) return;

    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthListener] Auth event:", event);

      // Handle password recovery event
      if (event === "PASSWORD_RECOVERY") {
        hasHandledRecovery.current = true;
        // Only redirect if not already on reset-password page
        if (pathname !== "/reset-password") {
          console.log("[AuthListener] Redirecting to reset-password");
          router.push("/reset-password");
        }
      }
    });

    // Handle URL hash with recovery tokens (implicit flow)
    const handleHashRecovery = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const type = params.get("type");
          const accessToken = params.get("access_token");

          if (type === "recovery" && accessToken && pathname !== "/reset-password") {
            console.log("[AuthListener] Found recovery tokens in hash");
            hasHandledRecovery.current = true;
            // Let Supabase process the tokens first
            setTimeout(() => {
              router.push("/reset-password");
            }, 100);
          }
        }
      }
    };

    // Handle URL query with code parameter (PKCE flow)
    // This happens when Supabase redirects with ?code=... to exchange for session
    const handleCodeExchange = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      // If there's a code and it looks like a recovery flow (or we're on root with just a code)
      if (code && pathname === "/") {
        console.log("[AuthListener] Found code in URL, exchanging for session");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("[AuthListener] Code exchange error:", error);
            return;
          }

          if (data.session) {
            console.log("[AuthListener] Session established, checking if recovery");
            // Check if this was a recovery flow by looking at the session
            // The PASSWORD_RECOVERY event should fire from onAuthStateChange
            // But as a fallback, we can check the URL params
            if (type === "recovery") {
              hasHandledRecovery.current = true;
              router.push("/reset-password");
            }
          }
        } catch (err) {
          console.error("[AuthListener] Error exchanging code:", err);
        }
      }
    };

    handleHashRecovery();
    handleCodeExchange();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname, searchParams]);

  return null;
}

export default function AuthListener() {
  return (
    <Suspense fallback={null}>
      <AuthListenerInner />
    </Suspense>
  );
}
