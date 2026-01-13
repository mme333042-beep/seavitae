import Link from "next/link";

/**
 * CVPreview represents the public-facing preview of a jobseeker profile.
 * Privacy: This interface intentionally excludes age, email, and phone number
 * to comply with SeaVitae's visibility rules.
 */
export interface CVPreview {
  id: string;
  fullName: string;
  city: string;
  preferredRole: string;
  skills: string[];
  bio: string;
}

interface CVPreviewCardProps {
  candidate: CVPreview;
}

/**
 * CVPreviewCard displays a scannable preview of a candidate's profile.
 * Hidden from employers (per visibility rules):
 * - Age (filter-only)
 * - Email address
 * - Phone number (available only after interview acceptance)
 */
export default function CVPreviewCard({ candidate }: CVPreviewCardProps) {
  const displaySkills = candidate.skills.slice(0, 5);
  const bioExcerpt =
    candidate.bio.length > 150
      ? candidate.bio.substring(0, 150) + "..."
      : candidate.bio;

  return (
    <article className="cv-preview-card">
      <header>
        <h3>{candidate.fullName}</h3>
        <p className="meta">{candidate.city}</p>
        <p className="meta">{candidate.preferredRole}</p>
      </header>

      <section>
        <div className="skills">
          {displaySkills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </section>

      <section>
        <p>{bioExcerpt}</p>
      </section>

      <footer className="actions">
        <Link href={`/cv/${candidate.id}`} className="btn btn-secondary">
          View Profile
        </Link>
        <Link href={`/cv/${candidate.id}/request-interview`} className="btn">
          Request Interview
        </Link>
      </footer>
    </article>
  );
}
