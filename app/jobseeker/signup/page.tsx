"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { signUp, validatePassword, getCurrentUser, resendConfirmationEmail } from "@/lib/supabase/auth";
import {
  trackJobseekerSignupView,
  trackJobseekerSignupStarted,
  trackJobseekerEmailSubmitted,
  trackEmailVerificationSent,
} from "@/lib/posthog";

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function JobseekerSignupPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track page view on mount (PostHog funnel tracking)
  useEffect(() => {
    trackJobseekerSignupView();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.push("/jobseeker/create-profile");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Track form interaction start (PostHog funnel tracking)
  function handleFormFocus() {
    if (!formStarted) {
      setFormStarted(true);
      trackJobseekerSignupStarted();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Track email submitted (PostHog funnel tracking)
    trackJobseekerEmailSubmitted();

    const newErrors: ValidationErrors = {};
    const passwordValidation = validatePassword(password);

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0 || !passwordValidation.isValid) {
      setErrors(newErrors);
      if (passwordValidation.isValid) {
        setPasswordErrors([]);
      }
      return;
    }

    setErrors({});
    setPasswordErrors([]);
    setLoading(true);

    try {
      const result = await signUp({
        email,
        password,
        role: "jobseeker",
      });

      if (!result.success) {
        let errorMessage = result.error || "Failed to create account";

        if (errorMessage.toLowerCase().includes("already registered") ||
            errorMessage.toLowerCase().includes("already exists")) {
          errorMessage = "This email is already registered. Please login instead.";
        }

        setErrors({ general: errorMessage });
        setLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (result.emailConfirmationRequired && result.email) {
        // Track verification email sent (PostHog funnel tracking)
        trackEmailVerificationSent('jobseeker');
        setPendingEmail(result.email);
        setShowConfirmation(true);
        setResendCooldown(60);
        setLoading(false);
        return;
      }

      // Signup successful - redirect to create profile
      if (result.userId) {
        router.push("/jobseeker/create-profile");
      } else {
        setErrors({ general: "Account created but login failed. Please try logging in." });
        setLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    setResendSuccess(false);
    setErrors({});

    try {
      const result = await resendConfirmationEmail(pendingEmail);

      if (!result.success) {
        setErrors({ general: result.error || "Failed to resend email." });
      } else {
        setResendSuccess(true);
        setResendCooldown(60);
      }
    } catch (error) {
      console.error("Resend error:", error);
      setErrors({ general: "Failed to resend email. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (showConfirmation) {
    return (
      <main>
        <header>
          <h1>Check Your Email</h1>
        </header>

        <section>
          <div className="card" style={{ maxWidth: "var(--max-width-narrow)" }}>
            <p style={{ marginBottom: "var(--space-md)" }}>
              We&apos;ve sent a confirmation link to <strong>{pendingEmail}</strong>.
            </p>
            <p style={{ marginBottom: "var(--space-lg)", color: "var(--sv-muted)" }}>
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>

            {errors.general && (
              <div role="alert" className="alert alert-error">
                {errors.general}
              </div>
            )}

            {resendSuccess && (
              <div
                role="status"
                style={{
                  marginBottom: "var(--space-lg)",
                  padding: "var(--space-md)",
                  backgroundColor: "var(--sv-success-bg)",
                  color: "var(--sv-success)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Confirmation email resent. Please check your inbox.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", textAlign: "center" }}>
              <p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={loading || resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sv-ocean)",
                    textDecoration: "underline",
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    padding: 0,
                    fontSize: "inherit",
                  }}
                >
                  {loading
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Didn't get the email? Resend in ${resendCooldown}s`
                    : "Didn't get the email?"}
                </button>
              </p>
              <p>
                <Link href="/login" style={{ color: "var(--sv-ocean)" }}>
                  Already confirmed? Login
                </Link>
              </p>
            </div>

            <div style={{ marginTop: "var(--space-xl)", paddingTop: "var(--space-lg)", borderTop: "1px solid var(--sv-border-light)" }}>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingEmail("");
                  setErrors({});
                  setResendSuccess(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--sv-muted)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "var(--text-sm)",
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Create Your Jobseeker Account</h1>
        <p>Sign up to create your CV and get discovered by employers.</p>
      </header>

      <section>
        <div className="card" style={{ maxWidth: "var(--max-width-narrow)" }}>
          {errors.general && (
            <div role="alert" className="alert alert-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} onFocus={handleFormFocus} noValidate>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
              {errors.email && <p role="alert" style={{ color: "var(--color-error)" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="password">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "var(--space-3xl)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "var(--space-md)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: "var(--space-xs)",
                    cursor: "pointer",
                    color: "var(--sv-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p role="alert" style={{ color: "var(--color-error)" }}>{errors.password}</p>}
              {passwordErrors.length > 0 && (
                <ul role="alert" style={{ color: "var(--color-error)", marginTop: "var(--space-sm)" }}>
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
              <p className="form-help" style={{ marginTop: "var(--space-sm)" }}>
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "var(--space-3xl)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "var(--space-md)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: "var(--space-xs)",
                    cursor: "pointer",
                    color: "var(--sv-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p role="alert" style={{ color: "var(--color-error)" }}>{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
          <p>
            Already have an account? <Link href="/login">Login</Link>
          </p>
          <p style={{ marginTop: "var(--space-md)" }}>
            Looking to hire? <Link href="/employer">Sign up as Employer</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
