import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create an ATS-Friendly CV Online | SeaVitae",
  description: "Build a professional, ATS-friendly CV online for free. Get discovered by top employers in Nigeria. SeaVitae — a sea of careers, searchable.",
};

export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav>
          <Link href="/" className="logo-link">
            <Image
              src="/logo/seavitae-logo.png"
              alt="SeaVitae"
              width={140}
              height={36}
              priority
            />
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/get-started">Get Started</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero">
          <h1>Create an ATS-Friendly CV Online</h1>
          <p className="tagline">A sea of careers, searchable.</p>

          <div className="hero-descriptions">
            <p>
              <strong>For Employers:</strong> Find top talent by searching CVs
              directly. No job posts, no applications.
            </p>
            <p>
              <strong>For Jobseekers:</strong> Create your CV and be discovered
              by employers actively looking for your skills.
            </p>
          </div>

          <div className="hero-cta">
            <Link href="/employer">I&apos;m Hiring</Link>
            <Link href="/jobseeker">Create CV</Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <h2>How It Works</h2>

          <div className="two-column">
            <div className="card">
              <h3>For Employers</h3>
              <ul>
                <li>Search CVs by skills, role, and location</li>
                <li>Filter to find the right candidates</li>
                <li>Request interviews directly</li>
                <li>Save CVs to review later</li>
              </ul>
            </div>

            <div className="card">
              <h3>For Jobseekers</h3>
              <ul>
                <li>Create a comprehensive CV</li>
                <li>Control your visibility</li>
                <li>Be found by employers searching for your skills</li>
                <li>Respond to interview requests on your terms</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why SeaVitae Section */}
        <section id="why-seavitae">
          <h2>Why SeaVitae</h2>

          <div className="card">
            <p>
              <strong>SeaVitae is not a job board.</strong>
            </p>

            <div className="two-column" style={{ marginTop: "var(--space-lg)" }}>
              <div>
                <h3>What We Remove</h3>
                <ul>
                  <li>No job listings to scroll through</li>
                  <li>No applications to submit</li>
                  <li>No endless searching</li>
                </ul>
              </div>

              <div>
                <h3>What We Offer</h3>
                <ul>
                  <li>Direct discovery over applications</li>
                  <li>Quality signal over noise</li>
                  <li>Professional, focused experience</li>
                </ul>
              </div>
            </div>

            <p style={{ marginTop: "var(--space-lg)" }}>
              Employers discover talent by searching CVs directly. Jobseekers
              don&apos;t apply - they get found.
            </p>
          </div>
        </section>

        {/* Trust & Professionalism Section */}
        <section id="trust">
          <h2>Trust and Professionalism</h2>

          <div className="card">
            <p>
              <strong>
                SeaVitae is built for professionals and employers who value
                quality connections.
              </strong>
            </p>

            <ul>
              <li>
                <strong>CV Integrity</strong> - CVs are locked for 7 days after
                updates to preserve employer trust
              </li>
              <li>
                <strong>Privacy First</strong> - Contact details are shared only
                after mutual agreement
              </li>
              <li>
                <strong>Professional Communication</strong> - Clear, structured
                messaging keeps interactions focused
              </li>
              <li>
                <strong>Verified Employers</strong> - Employer profiles help you
                know who is viewing your CV
              </li>
            </ul>
          </div>
        </section>

        {/* Invitation Section */}
        <section id="invite">
          <h2>Invite Professionals</h2>

          <div className="card">
            <p>
              Know someone who should be here? Invite them to create a CV and be
              discovered.
            </p>
            <Link href="/invite" style={{ marginTop: "var(--space-md)", display: "inline-block" }}>
              Invite a Professional
            </Link>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta">
          <h2>Get Started</h2>
          <p>Create your CV or start searching for talent.</p>
          <div className="cta-buttons">
            <Link href="/employer">I&apos;m Hiring</Link>
            <Link href="/jobseeker">Create CV</Link>
          </div>
        </section>
      </main>

      <footer>
        <p>SeaVitae</p>
        <p>A sea of careers, searchable.</p>
        <nav>
          <ul>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </nav>
        <div className="social-links">
          <a
            href="https://x.com/seavitae_?s=21"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on X (Twitter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/seavitae/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}
