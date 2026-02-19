import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "What ATS Really Scans For — How to Make Your CV Pass | SeaVitae Blog",
  description: "Most CVs are rejected before a human reads them. Learn exactly what Applicant Tracking Systems look for and how to make your CV pass every time.",
};

export default function WhatATSReallyScansForPage() {
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
        <header>
          <h1>What ATS Really Scans For — And How to Make Yours Pass</h1>
        </header>

        <section className="about-content">
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>February 19, 2026 · <Link href="/blog">SeaVitae Blog</Link></p>

          <p>
            You spent time on your CV. You are qualified for the role. You hit
            submit — and then nothing. No email, no call, not even an automated
            rejection for weeks.
          </p>

          <p>
            This is the ATS problem. Your CV never reached a human. It was
            filtered out by software before any recruiter had a chance to read
            it.
          </p>

          <p>
            Understanding how Applicant Tracking Systems work is no longer
            optional for serious job seekers. It is essential. Here is a clear,
            honest breakdown of what these systems actually scan for — and how to
            make sure your CV passes.
          </p>

          <h2>What Is an ATS?</h2>

          <p>
            An Applicant Tracking System is software that companies use to
            receive, sort, and filter job applications. When you apply for a role
            online, your CV goes directly into the ATS — not into a recruiter&apos;s
            inbox.
          </p>

          <p>
            The ATS reads your CV, extracts your information, scores your
            application based on how well it matches the job description, and
            then ranks you against all other applicants. Only the highest-scoring
            CVs are passed on to a human reviewer.
          </p>

          <p>
            Studies suggest that as many as 75% of CVs are rejected by ATS
            systems before a person ever sees them. The majority of these
            rejections are not because the candidate is unqualified. They are
            because the CV was not formatted or written in a way the ATS could
            process correctly.
          </p>

          <h2>What ATS Systems Actually Look For</h2>

          <h2>1. Keywords That Match the Job Description</h2>

          <p>
            This is the single most important factor in ATS scoring. The system
            compares the words in your CV against the words in the job
            description and gives you a match score.
          </p>

          <p>
            If the job description says &quot;project management&quot; and your CV
            says &quot;managing projects,&quot; many ATS systems will not count
            this as a match. You need to use the exact phrases the employer used.
          </p>

          <p>
            Before applying for any role, read the job description carefully.
            Identify the key skills, qualifications, and responsibilities listed.
            Then check whether those exact terms appear in your CV. If they apply
            to you and they are missing, add them.
          </p>

          <h2>2. Standard Section Headings</h2>

          <p>
            ATS software is trained to recognise specific section labels:
            &quot;Work Experience,&quot; &quot;Education,&quot;
            &quot;Skills,&quot; &quot;Certifications.&quot; When you use
            creative section titles like &quot;My Journey&quot; or &quot;What I
            Bring,&quot; the ATS often cannot categorise that content correctly
            — and your experience ends up unread.
          </p>

          <p>
            Always use standard, widely recognised section headings. SeaVitae
            structures your CV with exactly these headings by default, so you
            never have to think about this.
          </p>

          <h2>3. Clean, Parseable Formatting</h2>

          <p>
            ATS systems read text. They cannot reliably read text that is inside
            a table, a text box, a graphic, or a multi-column layout. When your
            CV uses these design elements, the ATS may extract your content in
            the wrong order, miss key information entirely, or fail to parse the
            file at all.
          </p>

          <p>
            The safest and most effective CV format for ATS is a single-column
            layout with clear headings and standard fonts. No images. No icons.
            No fancy borders. Plain, readable text.
          </p>

          <h2>4. Correct File Format</h2>

          <p>
            Most ATS systems accept PDF and Word documents (.docx). However, some
            older ATS platforms parse Word documents more reliably than PDFs.
            Unless the job posting specifies a format, a standard PDF is usually
            the right choice — provided it is a text-based PDF, not a scanned
            image.
          </p>

          <p>
            A scanned PDF is an image of your CV. The ATS cannot read images.
            Your entire application becomes invisible. Always save and export your
            CV as a proper text PDF, not a scan.
          </p>

          <h2>5. Contact Information in the Right Place</h2>

          <p>
            Some ATS systems skip over headers and footers entirely when parsing
            a document. If your name, email, and phone number are placed in the
            document header — as many CV templates put them — the ATS may not
            capture your contact details at all.
          </p>

          <p>
            Place your contact information in the main body of the CV, not in a
            header or footer field.
          </p>

          <h2>6. Job Titles That Match What Employers Search For</h2>

          <p>
            When a recruiter searches the ATS database for candidates, they
            typically search by job title. If your title was &quot;Customer
            Happiness Specialist&quot; but employers search for &quot;Customer
            Service Representative,&quot; your profile may never appear.
          </p>

          <p>
            You do not need to misrepresent your role. You can include both — for
            example: &quot;Customer Service Representative (Customer Happiness
            Specialist).&quot; This ensures you appear in searches while
            remaining honest.
          </p>

          <h2>7. Dates in a Consistent Format</h2>

          <p>
            ATS systems use your employment dates to calculate total years of
            experience and to understand career progression. If your dates are
            inconsistent — some in MM/YYYY format, others written out, some with
            only a year — the ATS may misread your career timeline.
          </p>

          <p>
            Pick one format and use it throughout. &quot;Month Year — Month
            Year&quot; is the most reliably parsed format across different ATS
            systems.
          </p>

          <h2>What ATS Cannot See</h2>

          <p>
            It is worth knowing what ATS systems cannot evaluate. They cannot
            assess your personality, your communication style, your cultural fit,
            or your genuine potential. They can only match text patterns.
          </p>

          <p>
            This means passing the ATS filter is just the first step — not the
            whole game. Once your CV reaches a human reviewer, it still needs to
            be compelling, clear, and well-written. An ATS-friendly CV that is
            also poorly written will be discarded just as quickly.
          </p>

          <h2>How SeaVitae Solves the ATS Problem</h2>

          <p>
            SeaVitae&apos;s{" "}
            <Link href="/create-cv-for-free">free CV builder</Link> structures
            your CV using exactly the format that ATS systems read correctly —
            clean sections, standard headings, no tables or graphics. Your
            downloadable CV is a proper text-based PDF that any ATS can parse
            without errors.
          </p>

          <p>
            Beyond that, SeaVitae takes a fundamentally different approach to job
            searching. On our platform, employers search and discover professional
            profiles directly — there is no ATS filter between your CV and the
            people making hiring decisions. Your profile is visible as soon as
            you turn on your visibility.
          </p>

          <p>
            For a deeper look at building the right CV, read our guides on{" "}
            <Link href="/ats-friendly-cv">ATS-friendly CV creation</Link> and{" "}
            <Link href="/professional-cv-template">
              professional CV templates
            </Link>
            . Also see our article on{" "}
            <Link href="/blog/cv-mistakes-to-avoid">
              the ten CV mistakes that cost people jobs
            </Link>
            .
          </p>

          <h2>The Bottom Line</h2>

          <p>
            The ATS is not your enemy — it is just a tool that rewards
            preparation. Candidates who understand how it works and format their
            CVs accordingly consistently outperform those who do not, even when
            qualifications are similar.
          </p>

          <p>
            Take thirty minutes to review your CV against the points in this
            article. Fix the formatting. Add the missing keywords. Move your
            contact details into the body. These small changes can be the
            difference between being invisible and getting called.
          </p>
        </section>

        <section id="cta">
          <h2>Build a CV That Passes Every ATS</h2>
          <p>
            SeaVitae structures your CV correctly from the start — free, clean,
            and ATS-ready.
          </p>
          <div className="cta-buttons">
            <Link href="/jobseeker/signup">Create Free CV</Link>
            <Link href="/ats-friendly-cv">ATS CV Guide</Link>
          </div>
        </section>

        <section className="about-content">
          <h2>More Articles</h2>
          <ul>
            <li>
              <Link href="/blog/why-your-cv-is-not-getting-interviews">
                Why Your CV Is Not Getting You Interviews
              </Link>
            </li>
            <li>
              <Link href="/blog/cv-mistakes-to-avoid">
                10 CV Mistakes That Are Costing You the Job
              </Link>
            </li>
          </ul>
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
      </footer>
    </>
  );
}
