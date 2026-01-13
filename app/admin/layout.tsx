"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/supabase/auth";
import { getAdminUser } from "@/lib/supabase/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const admin = await getAdminUser();
        if (!admin) {
          // Not an admin - redirect to login
          router.push("/login");
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error("[Admin] Auth check error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAdminAccess();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main>
        <p>Verifying admin access...</p>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main>
        <p>Access denied. Admin privileges required.</p>
      </main>
    );
  }

  return (
    <>
      <header className="admin-header">
        <nav>
          <div className="admin-brand">
            <Link href="/admin">
              <strong>SeaVitae Admin</strong>
            </Link>
          </div>
          <ul className="admin-nav-links">
            <li>
              <Link href="/admin">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/analytics">Analytics</Link>
            </li>
            <li>
              <Link href="/admin?status=pending">Pending</Link>
            </li>
            <li>
              <Link href="/admin?status=approved">Approved</Link>
            </li>
            <li>
              <Link href="/admin?status=rejected">Rejected</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <style jsx>{`
        .admin-header {
          background-color: var(--sv-navy);
          border-bottom: none;
        }
        .admin-header nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-xl);
          max-width: var(--max-width-content);
          margin: 0 auto;
        }
        .admin-brand a {
          color: var(--sv-white);
          text-decoration: none;
        }
        .admin-brand strong {
          color: var(--sv-white);
          font-size: var(--text-lg);
        }
        .admin-nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .admin-nav-links a {
          color: var(--sv-seafoam);
          text-decoration: none;
          font-weight: 500;
        }
        .admin-nav-links a:hover {
          color: var(--sv-white);
          text-decoration: underline;
        }
        .admin-nav-links .logout-btn {
          background: none;
          border: 1px solid var(--sv-seafoam);
          color: var(--sv-seafoam);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-sm);
        }
        .admin-nav-links .logout-btn:hover {
          background-color: var(--sv-seafoam);
          color: var(--sv-navy);
        }
      `}</style>
    </>
  );
}
