"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    // No backend logic - route to employer dashboard for now
    router.push("/employer/dashboard");
  }

  return (
    <main>
      <section>
        <h1>Login to SeaVitae</h1>

        <p>Welcome back. Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
            {errors.email && <p role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
            {errors.password && <p role="alert">{errors.password}</p>}
          </div>

          <div>
            <button type="submit">Login</button>
          </div>
        </form>

        <p>
          Don't have an account? <Link href="/employer">Sign up as Employer</Link>{" "}
          or <Link href="/jobseeker">Sign up as Jobseeker</Link>
        </p>
      </section>
    </main>
  );
}
