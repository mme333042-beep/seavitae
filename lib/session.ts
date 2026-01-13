/**
 * Session Management
 * Handles user authentication state and logout functionality
 */

export type UserRole = "jobseeker" | "employer";

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  employerType?: "company" | "individual";
}

// Session storage key
const SESSION_KEY = "seavitae_session";

/**
 * Check if we're running in browser
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Create a new session
 */
export function createSession(user: Omit<UserSession, "createdAt">): UserSession {
  const session: UserSession = {
    ...user,
    createdAt: new Date(),
  };

  if (isBrowser()) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Get current session
 */
export function getSession(): UserSession | null {
  if (!isBrowser()) {
    return null;
  }

  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored);
    session.createdAt = new Date(session.createdAt);
    return session;
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getSession() !== null;
}

/**
 * Check if current user is a jobseeker
 */
export function isJobseeker(): boolean {
  const session = getSession();
  return session?.role === "jobseeker";
}

/**
 * Check if current user is an employer
 */
export function isEmployer(): boolean {
  const session = getSession();
  return session?.role === "employer";
}

/**
 * Clear session and logout
 */
export function logout(): void {
  if (isBrowser()) {
    sessionStorage.removeItem(SESSION_KEY);
    // Clear any other session-related data
    sessionStorage.removeItem("seavitae_cv_state");
    sessionStorage.removeItem("seavitae_saved_cvs");
  }
}

/**
 * Get redirect path after logout
 */
export function getLogoutRedirectPath(): string {
  return "/";
}

/**
 * Get dashboard path based on user role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "jobseeker":
      return "/jobseeker/dashboard";
    case "employer":
      return "/employer/dashboard";
    default:
      return "/";
  }
}

/**
 * Get user display name
 */
export function getUserDisplayName(): string {
  const session = getSession();
  return session?.name || "User";
}

/**
 * Get user role label
 */
export function getUserRoleLabel(): string {
  const session = getSession();
  if (!session) return "";

  switch (session.role) {
    case "jobseeker":
      return "Jobseeker";
    case "employer":
      return session.employerType === "company" ? "Company" : "Individual Employer";
    default:
      return "";
  }
}
