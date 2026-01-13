"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { getCurrentUserWithProfile } from "@/lib/supabase/auth";
import { createInvite, getMyInvites } from "@/lib/supabase/services/invites";
import type { Invite, UserRole } from "@/lib/supabase/types";

export default function InvitePage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
  const [myInvites, setMyInvites] = useState<Invite[]>([]);
  const [userRole, setUserRole] = useState<UserRole>("jobseeker");

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getCurrentUserWithProfile();
        if (!userProfile) {
          router.push("/login");
          return;
        }

        setUserRole(userProfile.role);

        // Fetch user's existing invites
        const invites = await getMyInvites();
        setMyInvites(invites);

        // Find an active (unused, not expired) invite or use the most recent one
        const activeInvite = invites.find(
          (inv) =>
            !inv.is_used &&
            (!inv.expires_at || new Date(inv.expires_at) > new Date())
        );

        if (activeInvite) {
          setCurrentInvite(activeInvite);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading invites:", err);
        setError("Failed to load invite data. Please try again.");
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleCreateInvite() {
    setCreating(true);
    setError(null);

    try {
      const result = await createInvite(undefined, undefined, 30); // 30 days expiry

      if (!result.success) {
        setError(result.error || "Failed to create invite");
        setCreating(false);
        return;
      }

      if (result.invite) {
        setCurrentInvite(result.invite);
        setMyInvites((prev) => [result.invite!, ...prev]);
        trackEvent("invite_created");
      }

      setCreating(false);
    } catch (err) {
      console.error("Error creating invite:", err);
      setError("Failed to create invite. Please try again.");
      setCreating(false);
    }
  }

  function handleCopyLink() {
    if (!currentInvite) return;

    const inviteLink = `${window.location.origin}/get-started?code=${currentInvite.code}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      trackEvent("invite_link_copied");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCopyCode() {
    if (!currentInvite) return;

    navigator.clipboard.writeText(currentInvite.code).then(() => {
      setCopied(true);
      trackEvent("invite_code_copied");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  const inviteLink = currentInvite
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/get-started?code=${currentInvite.code}`
    : "";

  return (
    <main>
      <Link href={userRole === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard"} className="back-link">
        Back to Dashboard
      </Link>

      <header>
        <h1>Invite a Professional</h1>
        <p>
          Know a talented professional who deserves to be discovered? Share your
          invite link with them.
        </p>
      </header>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <section>
        <h2>Your Invite Link</h2>

        <div className="card">
          {currentInvite ? (
            <>
              <p>Share this link with professionals you&apos;d like to invite to SeaVitae:</p>

              <div className="invite-link-container">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                />
                <button type="button" onClick={handleCopyLink}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={{ marginTop: "var(--space-md)" }}>
                <p className="form-help">
                  <strong>Invite Code:</strong> {currentInvite.code}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    style={{
                      marginLeft: "var(--space-sm)",
                      padding: "var(--space-xs) var(--space-sm)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Copy Code
                  </button>
                </p>
              </div>

              {currentInvite.expires_at && (
                <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
                  This invite expires on {formatDate(currentInvite.expires_at)}.
                </p>
              )}

              <p className="form-help" style={{ marginTop: "var(--space-md)" }}>
                When someone joins using your link, they&apos;ll be able to create their
                CV profile and start getting discovered by employers.
              </p>
            </>
          ) : (
            <>
              <p>You don&apos;t have an active invite link yet.</p>
              <button
                type="button"
                onClick={handleCreateInvite}
                disabled={creating}
                style={{ marginTop: "var(--space-md)" }}
              >
                {creating ? "Creating..." : "Generate Invite Link"}
              </button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2>How It Works</h2>

        <div className="card">
          <ol>
            <li>Generate or copy your unique invite link above</li>
            <li>Share it with professionals you know</li>
            <li>They click the link and enter the invite code</li>
            <li>They create their CV profile</li>
            <li>Employers can discover them based on their skills and experience</li>
          </ol>
        </div>
      </section>

      {/* Previous Invites */}
      {myInvites.length > 1 && (
        <section>
          <h2>Your Invites</h2>

          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "var(--space-sm)" }}>Code</th>
                  <th style={{ textAlign: "left", padding: "var(--space-sm)" }}>Created</th>
                  <th style={{ textAlign: "left", padding: "var(--space-sm)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myInvites.map((invite) => (
                  <tr key={invite.id}>
                    <td style={{ padding: "var(--space-sm)" }}>
                      <code>{invite.code}</code>
                    </td>
                    <td style={{ padding: "var(--space-sm)" }}>
                      {formatDate(invite.created_at)}
                    </td>
                    <td style={{ padding: "var(--space-sm)" }}>
                      <span
                        className={`cv-state ${
                          invite.is_used
                            ? "cv-state-active"
                            : invite.expires_at && new Date(invite.expires_at) < new Date()
                            ? "cv-state-draft"
                            : ""
                        }`}
                      >
                        {invite.is_used
                          ? "Used"
                          : invite.expires_at && new Date(invite.expires_at) < new Date()
                          ? "Expired"
                          : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
