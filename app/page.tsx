import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        <nav>
          <span>SeaVitae</span>
          <Link href="/login">Login</Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero">
          <h1>SeaVitae</h1>
          <p className="tagline">A sea of careers, searchable.</p>

          <div className="hero-descriptions">
            <p>
              <strong>For Employers:</strong> Find top talent by searching CVs
              directly. No job posts, no applications.
            </p>
            <p>
              <strong>For Jobseekers:</strong> Create your CV profile and be
              discovered by employers.
            </p>
          </div>

          <div className="hero-cta">
            <Link href="/employer">I&apos;m Hiring</Link>
            <Link href="/jobseeker">I Want to Be Discovered</Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <h2>How It Works</h2>

          <div className="two-column">
            <article>
              <h3>For Employers</h3>
              <ul>
                <li>Search CVs by skills, role, and location</li>
                <li>Filter to find the right candidates</li>
                <li>Request interviews, virtual or in-person</li>
              </ul>
            </article>

            <article>
              <h3>For Jobseekers</h3>
              <ul>
                <li>Create a CV profile with skills, experience, and location</li>
                <li>Be found by employers searching for your expertise</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Why SeaVitae Section */}
        <section id="why-seavitae">
          <h2>Why SeaVitae</h2>

          <p>
            <strong>SeaVitae is not a job board.</strong>
          </p>

          <ul>
            <li>No job listings</li>
            <li>No applications</li>
            <li>No endless scrolling</li>
          </ul>

          <p>
            Employers discover talent by searching CVs directly.
            <br />
            Jobseekers don&apos;t apply&mdash;they get found.
          </p>

          <h3>Key Differentiators</h3>
          <ul>
            <li>Discovery over applications</li>
            <li>Signal over noise</li>
            <li>Direct and professional</li>
          </ul>
        </section>

        {/* Trust & Professionalism Section */}
        <section id="trust">
          <h2>Trust and Professionalism</h2>

          <p>
            SeaVitae is built for professionals and employers who value quality
            connections.
          </p>

          <ul>
            <li>Profiles are structured for clarity</li>
            <li>Communication stays professional</li>
            <li>Both sides can focus on what matters</li>
          </ul>
        </section>

        {/* Invitation Section */}
        <section id="invite">
          <h2>Invite Professionals</h2>
          <p>
            Know someone who should be here? Invite them to create a profile.
          </p>
          <Link href="/invite">Invite a Professional</Link>
        </section>

        {/* Final CTA Section */}
        <section id="cta">
          <h2>Get Started</h2>
          <p>Create your profile or start searching.</p>
          <div className="cta-buttons">
            <Link href="/employer">I&apos;m Hiring</Link>
            <Link href="/jobseeker">I Want to Be Discovered</Link>
          </div>
        </section>
      </main>

      <footer>
        <p>SeaVitae</p>
        <p>A sea of careers, searchable.</p>
        <nav>
          <Link href="/terms">Terms of Service</Link>
          <span> | </span>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
      </footer>
    </>
  );
}
