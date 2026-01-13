"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { trackEmailVerified, identifyUser } from "@/lib/posthog";

type ConfirmationState = "loading" | "success" | "already_confirmed" | "expired" | "error";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const roleParam = searchParams.get("role");

    if (success === "true") {
      setState("success");
      if (roleParam) {
        setRole(roleParam);
        // Track email verified (PostHog funnel tracking)
        if (roleParam === 'jobseeker' || roleParam === 'employer') {
          trackEmailVerified(roleParam);
        }
      }
    } else if (error) {
      // Determine error type
      const errorLower = error.toLowerCase();
      if (errorLower.includes("expired") || errorLower.includes("invalid")) {
        setState("expired");
      } else if (errorLower.includes("already") || errorLower.includes("confirmed")) {
        setState("already_confirmed");
      } else {
        setState("error");
        setErrorMessage(error);
      }
    } else {
      // No params - this shouldn't happen normally
      setState("error");
      setErrorMessage("Invalid confirmation request.");
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  function getRedirectPath(): string {
    switch (role) {
      case "admin":
        return "/admin";
      case "jobseeker":
        return "/jobseeker/create-profile";
      case "employer":
        return "/employer";
      default:
        return "/login";
    }
  }

  function getRedirectLabel(): string {
    switch (role) {
      case "admin":
        return "Go to Admin Dashboard";
      case "jobseeker":
        return "Complete Your Profile";
      case "employer":
        return "Complete Your Profile";
      default:
        return "Continue to Login";
    }
  }

  async function handleResendConfirmation() {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setResendSuccess(false);

    try {
      const supabase = getSupabaseClient();

      // Get current user's email from session if available
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: user.email,
        });

        if (error) {
          if (error.message.toLowerCase().includes("rate")) {
            setErrorMessage("Please wait before requesting another email.");
          } else {
            setErrorMessage(error.message);
          }
        } else {
          setResendSuccess(true);
          setResendCooldown(60);
        }
      } else {
        setErrorMessage("Unable to resend. Please try signing up again.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setErrorMessage("Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  }

  if (state === "loading") {
    return (
      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
          <p>Processing confirmation...</p>
        </div>
      </section>
    );
  }

  if (state === "success") {
    return (
      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <span style={{ fontSize: "3rem" }}>&#10003;</span>
          </div>
          <h1 style={{ marginBottom: "var(--space-md)" }}>Email Confirmed</h1>
          <p style={{ marginBottom: "var(--space-xl)", color: "var(--sv-muted)" }}>
            Your email has been confirmed successfully. You can now access your account.
          </p>
          <Link href={getRedirectPath()}>
            <button type="button" style={{ width: "100%" }}>
              {getRedirectLabel()}
            </button>
          </Link>
        </div>
      </section>
    );
  }

  if (state === "already_confirmed") {
    return (
      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
          <h1 style={{ marginBottom: "var(--space-md)" }}>Already Confirmed</h1>
          <p style={{ marginBottom: "var(--space-xl)", color: "var(--sv-muted)" }}>
            Your email is already confirmed. You can log in to your account.
          </p>
          <Link href="/login">
            <button type="button" style={{ width: "100%" }}>
              Go to Login
            </button>
          </Link>
        </div>
      </section>
    );
  }

  if (state === "expired") {
    return (
      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
          <h1 style={{ marginBottom: "var(--space-md)" }}>Link Expired</h1>
          <p style={{ marginBottom: "var(--space-lg)", color: "var(--sv-muted)" }}>
            This confirmation link has expired or is invalid.
          </p>

          {resendSuccess && (
            <div role="status" className="alert alert-success">
              Confirmation email resent. Please check your inbox.
            </div>
          )}

          <div style={{ marginBottom: "var(--space-lg)" }}>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || resendCooldown > 0}
              style={{ width: "100%" }}
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Confirmation Email"}
            </button>
          </div>

          <p style={{ color: "var(--sv-muted)" }}>
            Or <Link href="/login">try logging in</Link> if you&apos;ve already confirmed.
          </p>
        </div>
      </section>
    );
  }

  // Error state
  return (
    <section>
      <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
        <h1 style={{ marginBottom: "var(--space-md)" }}>Confirmation Failed</h1>
        <p style={{ marginBottom: "var(--space-lg)", color: "var(--sv-muted)" }}>
          {errorMessage || "Something went wrong during email confirmation."}
        </p>

        <div style={{ marginBottom: "var(--space-lg)" }}>
          <Link href="/login">
            <button type="button" style={{ width: "100%" }}>
              Go to Login
            </button>
          </Link>
        </div>

        <p style={{ color: "var(--sv-muted)", fontSize: "var(--text-sm)" }}>
          If you continue to have issues, please contact support.
        </p>
      </div>
    </section>
  );
}

export default function ConfirmEmailPage() {
  return (
    <main>
      <Suspense fallback={
        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
            <p>Loading...</p>
          </div>
        </section>
      }>
        <ConfirmEmailContent />
      </Suspense>
    </main>
  );
}
