"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/lib/supabase/auth";
import AuthShell from "@/components/AuthShell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  // Middleware sends users here with ?redirect=/path when they hit a protected
  // page while logged out. Only honour same-site relative paths.
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : null;
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        setErrors({ general: result.error || "Failed to sign in" });
        setLoading(false);
        return;
      }

      // Redirect based on role and profile status (or back to where they were going)
      if (safeRedirect) {
        router.push(safeRedirect);
      } else if (result.redirectPath) {
        router.push(result.redirectPath);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <header>
        <h1>Welcome back</h1>
        <p>Log in to view, edit or download your CV.</p>
      </header>

      <section>
        {reason === "inactivity" && (
          <div role="alert" className="alert alert-info" style={{ marginBottom: "var(--space-md)" }}>
            You were logged out due to inactivity. Please log in again.
          </div>
        )}

        <div className="card">
          {errors.general && (
            <div role="alert" className="alert alert-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
              {errors.email && <p role="alert">{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required />
              {errors.password && <p role="alert">{errors.password}</p>}
            </div>

            <div style={{ marginBottom: "var(--space-lg)", textAlign: "right" }}>
              <Link href="/forgot-password" style={{ fontSize: "var(--text-sm)" }}>
                Forgot password?
              </Link>
            </div>

            <div>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footnote">
          <p>
            Don&apos;t have an account? <Link href="/jobseeker/signup">Sign up</Link>
          </p>
        </div>
      </section>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell><p>Loading...</p></AuthShell>}>
      <LoginForm />
    </Suspense>
  );
}
