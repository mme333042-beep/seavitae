"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * AuthListener component that handles auth state changes globally.
 * Handles PASSWORD_RECOVERY and email verification events to redirect users
 * to the appropriate pages when they click email links.
 */
function AuthListenerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHandledAuth = useRef(false);

  useEffect(() => {
    // Prevent double-handling
    if (hasHandledAuth.current) return;

    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthListener] Auth event:", event);

      // Handle password recovery event
      if (event === "PASSWORD_RECOVERY") {
        hasHandledAuth.current = true;
        // Only redirect if not already on reset-password page
        if (pathname !== "/reset-password") {
          console.log("[AuthListener] Redirecting to reset-password");
          router.push("/reset-password");
        }
      }

      // Handle signup/email verification - redirect to confirm page
      if (event === "SIGNED_IN" && pathname === "/") {
        // Check if this is a fresh signup verification (not a regular login)
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const hashParams = new URLSearchParams(hash.substring(1));
        const type = hashParams.get("type");

        if (type === "signup" || type === "email") {
          hasHandledAuth.current = true;
          console.log("[AuthListener] Email verification detected, redirecting to confirm page");
          router.push("/auth/confirm?success=true");
        }
      }
    });

    // Handle URL hash with tokens (implicit flow)
    const handleHashAuth = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const type = params.get("type");
          const accessToken = params.get("access_token");

          if (accessToken) {
            if (type === "recovery" && pathname !== "/reset-password") {
              console.log("[AuthListener] Found recovery tokens in hash");
              hasHandledAuth.current = true;
              setTimeout(() => {
                router.push("/reset-password");
              }, 100);
            } else if ((type === "signup" || type === "email") && pathname !== "/auth/confirm") {
              console.log("[AuthListener] Found signup tokens in hash");
              hasHandledAuth.current = true;
              setTimeout(() => {
                router.push("/auth/confirm?success=true");
              }, 100);
            }
          }
        }
      }
    };

    // Handle URL query with code parameter (PKCE flow)
    // This happens when Supabase redirects with ?code=... to exchange for session
    const handleCodeExchange = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      // If there's a code and we're on root
      if (code && pathname === "/") {
        console.log("[AuthListener] Found code in URL, exchanging for session");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("[AuthListener] Code exchange error:", error);
            return;
          }

          if (data.session) {
            console.log("[AuthListener] Session established, type:", type);
            hasHandledAuth.current = true;

            if (type === "recovery") {
              router.push("/reset-password");
            } else if (type === "signup" || type === "email") {
              router.push("/auth/confirm?success=true");
            } else {
              // Generic code exchange - likely email verification
              // Redirect to confirm page
              router.push("/auth/confirm?success=true");
            }
          }
        } catch (err) {
          console.error("[AuthListener] Error exchanging code:", err);
        }
      }
    };

    handleHashAuth();
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
