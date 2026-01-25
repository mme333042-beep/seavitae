"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword, validatePassword } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Check if user has a valid session (came from email link)
  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
    }
    checkSession();
  }, []);

  // Validate password as user types
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.errors.join(" "));
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(password);

      if (!result.success) {
        setError(result.error || "Failed to reset password. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Loading state while checking session
  if (validSession === null) {
    return (
      <main>
        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
            <p>Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  // No valid session - link may have expired or been used
  if (!validSession) {
    return (
      <main>
        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
            <h1 style={{ marginBottom: "var(--space-md)" }}>Link Expired</h1>
            <p style={{ marginBottom: "var(--space-xl)", color: "var(--sv-muted)" }}>
              This password reset link has expired or has already been used.
            </p>
            <Link href="/forgot-password">
              <button type="button" style={{ width: "100%" }}>
                Request New Reset Link
              </button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main>
        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <span style={{ fontSize: "3rem" }}>&#10003;</span>
            </div>
            <h1 style={{ marginBottom: "var(--space-md)" }}>Password Reset</h1>
            <p style={{ marginBottom: "var(--space-xl)", color: "var(--sv-muted)" }}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link href="/login">
              <button type="button" style={{ width: "100%" }}>
                Go to Login
              </button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Create New Password</h1>
        <p>Enter your new password below.</p>
      </header>

      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)" }}>
          {error && (
            <div role="alert" className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              {passwordErrors.length > 0 && (
                <ul style={{ marginTop: "var(--space-sm)", paddingLeft: "var(--space-lg)" }}>
                  {passwordErrors.map((err, index) => (
                    <li key={index} style={{ color: "var(--sv-error)", fontSize: "var(--text-sm)" }}>
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginBottom: "var(--space-xl)" }}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <button type="submit" disabled={loading || passwordErrors.length > 0} style={{ width: "100%" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
          <p>
            <Link href="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
