"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/supabase/auth";

interface AppHeaderProps {
  /** Display name shown on the right (hidden on small screens). */
  userName?: string;
  /** Show a "Dashboard" link (hide it when already on the dashboard). */
  showDashboardLink?: boolean;
}

/**
 * Header for logged-in pages (dashboard, CV editor).
 * Mirrors the public SiteHeader so the app feels like one product.
 */
export default function AppHeader({
  userName,
  showDashboardLink = true,
}: AppHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    router.push("/");
  }

  return (
    <header className="app-header">
      <nav aria-label="Account">
        <Link href="/jobseeker/dashboard" className="logo-link" aria-label="SeaVitae dashboard">
          <Image
            src="/logo/seavitae-logo.png"
            alt="SeaVitae"
            width={140}
            height={36}
            priority
          />
        </Link>

        <div className="app-nav-right">
          {userName && (
            <span className="app-user">
              Signed in as <strong>{userName}</strong>
            </span>
          )}
          {showDashboardLink && (
            <Link href="/jobseeker/dashboard" className="app-nav-link">
              Dashboard
            </Link>
          )}
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}
