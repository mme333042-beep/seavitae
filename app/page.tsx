import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Create an ATS-Friendly CV Online | SeaVitae",
  description:
    "Build a clean, professional, ATS-friendly CV online for free. Fill in your details, let AI polish the wording, and download a recruiter-ready PDF in minutes.",
};

export default function Home() {
  return (
    <>
      <SiteHeader />

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

      <SiteFooter />
    </>
  );
}
