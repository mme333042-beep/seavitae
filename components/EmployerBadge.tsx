import {
  EmployerProfile,
  getVerificationStatus,
  getEmployerDisplayName,
  getEmployerTypeLabel,
  getEmployerCategory,
} from "@/lib/employerVerification";

interface EmployerBadgeProps {
  employer: EmployerProfile;
  showDetails?: boolean;
}

/**
 * EmployerBadge displays employer information with trust signals.
 * This is trust signaling, not official certification.
 */
export default function EmployerBadge({
  employer,
  showDetails = false,
}: EmployerBadgeProps) {
  const status = getVerificationStatus(employer);
  const displayName = getEmployerDisplayName(employer);
  const typeLabel = getEmployerTypeLabel(employer.type);
  const category = getEmployerCategory(employer);

  return (
    <aside aria-label="Employer Information" className="employer-badge">
      <header>
        <p>
          <strong>{displayName}</strong>
          {status.hasVerifiedDetails && (
            <span className="verified-badge" title="Verified employer">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </span>
          )}
        </p>
        <p>
          <small>{typeLabel}</small>
        </p>
      </header>

      <dl>
        <dt>Category</dt>
        <dd>{category}</dd>

        <dt>Location</dt>
        <dd>{employer.city || "Not specified"}</dd>
      </dl>

      {showDetails && (
        <section>
          {employer.type === "company" && employer.website && (
            <p>
              <a
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Company website
              </a>
            </p>
          )}

          {employer.type === "individual" && employer.linkedIn && (
            <p>
              <a
                href={employer.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn profile
              </a>
            </p>
          )}

          {employer.type === "company" && employer.contactPersonName && (
            <p>
              <small>
                Contact: {employer.contactPersonName}
                {employer.contactPersonRole && ` (${employer.contactPersonRole})`}
              </small>
            </p>
          )}
        </section>
      )}

      {!status.hasVerifiedDetails && (
        <p>
          <small>Details pending completion</small>
        </p>
      )}
    </aside>
  );
}
