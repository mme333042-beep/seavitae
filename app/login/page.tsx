"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/lib/supabase/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
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

      // Redirect based on role and profile status
      if (result.redirectPath) {
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
    <main>
      <header>
        <h1>Login to SeaVitae</h1>
        <p>Welcome back. Enter your credentials to continue.</p>
      </header>

      <section>
        {reason === "inactivity" && (
          <div role="alert" className="alert alert-info" style={{ maxWidth: "var(--max-width-narrow)", marginBottom: "var(--space-md)" }}>
            You were logged out due to inactivity. Please log in again.
          </div>
        )}

        <div className="card" style={{ maxWidth: "var(--max-width-narrow)" }}>
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

            <div>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
          <p>
            Don&apos;t have an account?
          </p>
          <p>
            <Link href="/employer">Sign up as Employer</Link>
            {" or "}
            <Link href="/jobseeker">Sign up as Jobseeker</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main><p>Loading...</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
