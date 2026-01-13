import Link from "next/link";

export default function JobseekerPage() {
  return (
    <main>
      <header>
        <h1>Be Discovered on SeaVitae</h1>
        <p>
          Create a CV and become searchable by employers looking for talent like
          you.
        </p>
      </header>

      <section>
        <h2>How It Works</h2>

        <div className="card">
          <ul>
            <li>
              <strong>Create your CV</strong> - Add your skills, experience, and
              preferred roles
            </li>
            <li>
              <strong>Control your visibility</strong> - Choose when you want to
              be discoverable
            </li>
            <li>
              <strong>Get found</strong> - Employers search for candidates and
              find you
            </li>
            <li>
              <strong>Accept interviews</strong> - Review requests and decide
              who to meet
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>Your Privacy</h2>

        <div className="card">
          <p>
            <strong>We protect your information.</strong>
          </p>
          <ul>
            <li>Age is used for filtering only and never displayed publicly</li>
            <li>Email is never shown to employers</li>
            <li>Phone number is shared only after you accept an interview</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>CV Integrity</h2>

        <div className="card">
          <p>
            <strong>CVs are protected to maintain employer trust.</strong>
          </p>
          <p>
            Once your CV is active, editing is temporarily locked for 7 days.
            This ensures employers see consistent information during their
            review process.
          </p>
        </div>
      </section>

      <section id="cta">
        <h2>Get Started</h2>
        <p>Create your CV and start being discovered by employers.</p>
        <div className="cta-buttons">
          <Link href="/jobseeker/signup">Create CV</Link>
          <Link href="/login">Already have an account? Login</Link>
        </div>
      </section>
    </main>
  );
}
