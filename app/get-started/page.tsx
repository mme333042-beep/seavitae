import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function GetStartedPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header>
          <h1>Get Started</h1>
          <p>Create a professional, ATS-friendly CV in minutes.</p>
        </header>

        <section>
          <h2>How it works</h2>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Add your details</h3>
              <p>
                Enter your experience, skills, and education in a simple, guided
                form.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Let AI polish it</h3>
              <p>
                We sharpen vague wording into clear, results-focused language
                that recruiters and ATS software understand.
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

        <section id="cta">
          <h2>Ready to build your CV?</h2>
          <p>It is free and takes just a few minutes.</p>
          <div className="cta-buttons">
            <Link href="/jobseeker/signup">Create My CV</Link>
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

      <SiteFooter />
    </>
  );
}
