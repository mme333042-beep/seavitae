import Link from "next/link";

export default function EmployerPage() {
  return (
    <main>
      <header>
        <h1>Hiring on SeaVitae</h1>
        <p>Search CVs directly. Find the right candidates.</p>
      </header>

      <section>
        <h2>How are you hiring?</h2>

        <div className="two-column">
          <Link href="/employer/company" className="action-card">
            <strong>Company</strong>
            <span>
              You are hiring on behalf of an organization or business.
            </span>
          </Link>

          <Link href="/employer/individual" className="action-card">
            <strong>Individual</strong>
            <span>
              You are hiring independently, not representing a company.
            </span>
          </Link>
        </div>
      </section>

      <section>
        <h2>What You Get</h2>

        <div className="card">
          <ul>
            <li>
              <strong>Direct CV search</strong> - Find candidates by skills,
              role, and location
            </li>
            <li>
              <strong>Save CVs</strong> - Keep snapshots of promising candidates
            </li>
            <li>
              <strong>Request interviews</strong> - Connect directly with
              candidates
            </li>
            <li>
              <strong>Professional messaging</strong> - Clear, focused
              communication
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>CV Trust</h2>

        <div className="card">
          <p>
            <strong>CVs are protected for your benefit.</strong>
          </p>
          <ul>
            <li>CVs are locked for 7 days after updates</li>
            <li>Last updated date is always visible</li>
            <li>When you save a CV, you save that exact version</li>
          </ul>
          <p>
            This ensures the CV you reviewed remains consistent during your
            hiring process.
          </p>
        </div>
      </section>

      <section>
        <h2>Already have an account?</h2>
        <div className="card">
          <p>
            <Link href="/login">Login to your account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
