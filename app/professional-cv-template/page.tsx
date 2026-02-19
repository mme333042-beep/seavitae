import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Professional CV Template Online | SeaVitae",
  description: "Use a professional CV template built for Nigerian professionals. Structured, ATS-friendly, and free. Stand out to employers with a clean, modern CV format.",
};

export default function ProfessionalCVTemplatePage() {
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
          <h1>Professional CV Templates Built to Impress</h1>
        </header>

        <section className="about-content">
          <p>
            A professional CV template is more than a blank document with boxes
            to fill in. The best CV templates are designed to present your
            experience clearly, make the right impression on employers, and pass
            through ATS systems without losing any of your information.
          </p>

          <p>
            SeaVitae provides a structured, professional CV format built
            specifically for serious job seekers. It is clean, modern, and
            optimised for the way employers actually evaluate candidates today.
          </p>

          <h2>What Makes a Good CV Template?</h2>

          <p>
            Not all CV templates are created equal. Many free templates you find
            online look impressive in design software but cause serious problems
            in practice. They may be incompatible with ATS systems, difficult to
            edit, or visually distracting in a way that pulls attention away from
            your actual qualifications.
          </p>

          <p>
            A good professional CV template has several key qualities:
          </p>

          <p>
            <strong>Clarity above all else.</strong> Recruiters spend an average
            of six seconds on an initial CV review. A clean, uncluttered layout
            means your most important information is seen immediately — not buried
            under decorative borders or complex column layouts.
          </p>

          <p>
            <strong>Logical structure.</strong> The best CV format follows a
            predictable order that hiring managers expect: personal details,
            professional summary, work experience, education, skills, and then
            additional sections like certifications or languages.
          </p>

          <p>
            <strong>ATS compatibility.</strong> A professional CV template must
            be readable by automated systems as well as humans. This means
            standard fonts, no graphics in place of text, and proper heading
            labels.
          </p>

          <p>
            <strong>Flexibility for different careers.</strong> A strong template
            works for a range of industries and experience levels. You should not
            need a completely different template just because you are changing
            sectors or applying for a senior role.
          </p>

          <h2>The SeaVitae CV Format</h2>

          <p>
            When you create your CV on SeaVitae, you are working with a
            professional CV format that has been structured to meet all of the
            above criteria. Every section is clearly defined and built to display
            your information in the most effective way.
          </p>

          <p>
            Here is what the SeaVitae CV template includes:
          </p>

          <p>
            <strong>Personal details.</strong> Your name, contact information,
            location, and links to your LinkedIn or portfolio — all presented
            cleanly at the top of your profile.
          </p>

          <p>
            <strong>Professional summary.</strong> A short, powerful paragraph
            that tells employers exactly who you are and what you bring. This is
            the first thing a recruiter reads after your name, and it sets the
            tone for everything else.
          </p>

          <p>
            <strong>Work experience.</strong> Listed in reverse chronological
            order, with clear job titles, company names, dates, and bullet-point
            descriptions of your responsibilities and achievements.
          </p>

          <p>
            <strong>Education.</strong> Your academic qualifications, listed with
            institution names, degrees obtained, and graduation years.
          </p>

          <p>
            <strong>Skills.</strong> A dedicated section for your professional
            and technical skills, listed clearly so employers and ATS systems can
            match them against job requirements instantly.
          </p>

          <p>
            <strong>Certifications.</strong> Professional certifications carry
            significant weight, especially in technical fields. The SeaVitae
            template gives certifications their own section so they are never
            overlooked.
          </p>

          <p>
            <strong>Languages, projects, and publications.</strong> Additional
            sections for professionals who have relevant work to showcase beyond
            a standard career history.
          </p>

          <h2>How to Use a CV Template Effectively</h2>

          <p>
            Having the right template is only half the job. Here is how to make
            the most of your professional CV format:
          </p>

          <p>
            <strong>Tailor your summary for the role.</strong> Your professional
            summary should reflect the type of position you are targeting. If you
            are applying for management roles, your summary should emphasise
            leadership. If you are targeting technical roles, lead with your
            technical depth.
          </p>

          <p>
            <strong>Quantify your experience wherever possible.</strong> Numbers
            make your experience concrete and credible. How many people did you
            manage? What was the budget you controlled? What percentage did you
            improve the process by?
          </p>

          <p>
            <strong>Keep experience descriptions concise.</strong> Each role
            should have three to five bullet points that highlight your most
            relevant contributions. Avoid writing lengthy paragraphs — they are
            rarely read in full during a first review.
          </p>

          <p>
            <strong>Update your CV regularly.</strong> Do not wait until you are
            actively job searching to update your CV. Add new roles, skills, and
            certifications as you acquire them. A current CV is always easier to
            polish than one that has been ignored for two years.
          </p>

          <h2>Download Your CV as a PDF</h2>

          <p>
            Once your SeaVitae profile is complete, you can download your CV as
            a clean, professional PDF at any time. The downloaded version
            maintains all the structure and formatting of the SeaVitae template
            and is ready to send directly to any employer, attach to email
            applications, or print.
          </p>

          <h2>Get Started with Your Professional CV Today</h2>

          <p>
            Stop using outdated templates that were designed for a different era
            of hiring. Create your free account on SeaVitae and build a
            professional CV using a format designed for how employers actually
            hire today — clear, structured, ATS-friendly, and built to make a
            strong first impression.
          </p>
        </section>

        <section id="cta">
          <h2>Start With a Professional CV Template</h2>
          <p>Free, structured, and ready for employers.</p>
          <div className="cta-buttons">
            <Link href="/jobseeker/signup">Create Free CV</Link>
            <Link href="/get-started">Learn More</Link>
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
      </footer>
    </>
  );
}
