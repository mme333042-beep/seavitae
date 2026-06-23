import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create an ATS-Friendly CV Online | SeaVitae",
  description:
    "Build a clean, professional, ATS-friendly CV online for free. Fill in your details, let AI polish the wording, and download a recruiter-ready PDF in minutes.",
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
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/jobseeker" className="nav-cta">
                Create CV
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero">
          <h1>Create an ATS-Friendly CV Online</h1>
          <p className="hero-subtitle">
            Build a clean, professional CV that gets past applicant tracking
            systems and into human hands. Add your details, let AI sharpen the
            wording, and download a recruiter-ready PDF in minutes.
          </p>

          <div className="hero-cta">
            <Link href="/jobseeker">Create My CV — Free</Link>
          </div>

          <p className="hero-note">No account fees. No design skills needed.</p>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <h2>How It Works</h2>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Add your details</h3>
              <p>
                Enter your experience, skills, and education in a simple, guided
                form. No templates to wrestle with.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Let AI polish it</h3>
              <p>
                We rewrite weak, vague phrasing into clear, results-focused
                language that recruiters and ATS software understand.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">3</span>
              <h3>Download your PDF</h3>
              <p>
                Get a clean, professionally laid-out CV that adapts to your role,
                ready to send anywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Why SeaVitae Section */}
        <section id="why-seavitae">
          <h2>Why SeaVitae</h2>

          <div className="feature-grid">
            <div className="card">
              <h3>ATS-Friendly by Default</h3>
              <p>
                Clean structure and standard headings so applicant tracking
                systems read every line of your CV correctly.
              </p>
            </div>

            <div className="card">
              <h3>Polished, Professional Design</h3>
              <p>
                A balanced two-column layout with sections that adapt to your
                profession, not a one-size-fits-all template.
              </p>
            </div>

            <div className="card">
              <h3>Your Words, Sharpened</h3>
              <p>
                AI improves clarity and impact while keeping your meaning and
                your voice intact.
              </p>
            </div>

            <div className="card">
              <h3>Free and Fast</h3>
              <p>
                Go from a blank page to a finished, downloadable CV in minutes,
                at no cost.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta">
          <h2>Ready to build your CV?</h2>
          <p>Create a professional, ATS-friendly CV in minutes.</p>
          <div className="cta-buttons">
            <Link href="/jobseeker">Create My CV</Link>
          </div>
        </section>
      </main>

      <footer>
        <p>SeaVitae</p>
        <p>Create an ATS-friendly CV in minutes.</p>
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
