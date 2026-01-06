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
    <article>
      <header>
        <h3>{candidate.fullName}</h3>
        <p>{candidate.city}</p>
        <p>{candidate.preferredRole}</p>
      </header>

      <section>
        <h4>Skills</h4>
        <ul>
          {displaySkills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </section>

      <section>
        <p>{bioExcerpt}</p>
      </section>

      <footer>
        <Link href={`/cv/${candidate.id}`}>View Profile</Link>
        <Link href={`/cv/${candidate.id}/request-interview`}>
          Request Interview
        </Link>
      </footer>
    </article>
  );
}
