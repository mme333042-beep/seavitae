"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/supabase/auth";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check for error from URL (e.g., expired reset link)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setError(result.error || "Failed to send reset email. Please try again.");
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

  if (success) {
    return (
      <main>
        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)", textAlign: "center" }}>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <span style={{ fontSize: "3rem" }}>&#9993;</span>
            </div>
            <h1 style={{ marginBottom: "var(--space-md)" }}>Check Your Email</h1>
            <p style={{ marginBottom: "var(--space-lg)", color: "var(--sv-muted)" }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p style={{ marginBottom: "var(--space-xl)", color: "var(--sv-muted)", fontSize: "var(--text-sm)" }}>
              Be sure to check your spam folder if you don&apos;t see it in your inbox.
            </p>
            <Link href="/login">
              <button type="button" style={{ width: "100%" }}>
                Return to Login
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
        <h1>Reset Your Password</h1>
        <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </header>

      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)" }}>
          {error && (
            <div role="alert" className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "var(--space-xl)" }}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <button type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
          <p>
            Remember your password? <Link href="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<main><p>Loading...</p></main>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
