"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least 1 number.");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least 1 special character.");
  }

  return errors;
}

export default function IndividualCreateAccountPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const newErrors: ValidationErrors = {};
    const newPasswordErrors = validatePassword(password);

    if (!email) {
      newErrors.email = "Email is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0 || newPasswordErrors.length > 0) {
      setErrors(newErrors);
      if (newPasswordErrors.length === 0) {
        setPasswordErrors([]);
      }
      return;
    }

    setErrors({});
    setPasswordErrors([]);
    router.push("/employer/individual/details");
  }

  return (
    <main>
      <section>
        <h1>Create Employer Account</h1>

        <p>
          Enter your credentials to create an employer account as an individual
          hiring independently.
        </p>

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
            {passwordErrors.length > 0 && (
              <ul role="alert">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
            />
            {errors.confirmPassword && (
              <p role="alert">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button type="submit">Create Account</button>
          </div>
        </form>
      </section>
    </main>
  );
}
