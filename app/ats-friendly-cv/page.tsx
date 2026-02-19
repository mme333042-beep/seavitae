import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "ATS-Friendly CV Builder Online | SeaVitae",
  description: "Build an ATS-friendly CV that passes automated filters and gets seen by real employers. Free online CV builder designed to beat applicant tracking systems.",
};

export default function ATSFriendlyCVPage() {
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
          <h1>Build an ATS-Friendly CV That Gets You Noticed</h1>
        </header>

        <section className="about-content">
          <p>
            Most CVs never get read by a human. Before a recruiter sees your
            application, it is processed by an Applicant Tracking System — a
            piece of software that scans, scores, and filters CVs automatically.
            If your CV is not ATS-friendly, it gets rejected before anyone has a
            chance to see your qualifications.
          </p>

          <p>
            SeaVitae is built from the ground up to help you create an
            ATS-friendly CV that passes automated filters and lands in front of
            real decision-makers.
          </p>

          <h2>What Is an ATS and Why Does It Matter?</h2>

          <p>
            An Applicant Tracking System (ATS) is software used by companies to
            manage job applications. When you submit a CV, the ATS reads it,
            extracts your information, and ranks your application based on how
            well it matches the job requirements.
          </p>

          <p>
            If your CV uses unusual fonts, complex tables, graphics, or
            non-standard section headings, the ATS may fail to read it correctly.
            Your experience, skills, and qualifications could be lost entirely —
            not because you are unqualified, but because your CV was not
            formatted correctly.
          </p>

          <p>
            An ATS-friendly CV avoids these pitfalls. It uses clean formatting,
            standard section names, and the right keywords for the roles you are
            targeting.
          </p>

          <h2>How SeaVitae Builds ATS-Friendly CVs</h2>

          <p>
            SeaVitae structures your CV in a way that every ATS can read
            correctly. Here is what makes our CV builder ATS-optimised:
          </p>

          <p>
            <strong>Clean, structured sections.</strong> Your CV is organised
            into standard, clearly labelled sections — Work Experience,
            Education, Skills, Certifications, Languages, Projects, and
            Publications. These are the exact section names that ATS software
            looks for.
          </p>

          <p>
            <strong>No tables or graphics.</strong> Many CV builders include
            decorative elements, skill bars, and complex layouts that look
            attractive to the human eye but confuse ATS software. SeaVitae keeps
            your CV clean and readable by machines and humans alike.
          </p>

          <p>
            <strong>Keyword-ready skills section.</strong> Your skills are listed
            clearly and separately, making it easy for ATS software to match your
            profile against job requirements. You control exactly which skills
            appear on your CV.
          </p>

          <p>
            <strong>Consistent date formatting.</strong> ATS systems rely on
            correctly formatted dates to understand your career timeline.
            SeaVitae ensures your experience and education dates are always
            consistent and machine-readable.
          </p>

          <h2>What to Include in an ATS-Friendly CV</h2>

          <p>
            Building an ATS-friendly CV is not just about formatting. The content
            matters just as much. Here is what to focus on:
          </p>

          <p>
            <strong>Use keywords from the job description.</strong> Read the job
            description carefully and include the exact phrases and skills the
            employer has listed. If they say &quot;project management,&quot; use
            that exact phrase — not &quot;managing projects.&quot;
          </p>

          <p>
            <strong>Write a strong professional summary.</strong> A clear summary
            at the top of your CV helps both the ATS and the recruiter understand
            who you are and what you offer. Include your job title, years of
            experience, and two or three key strengths.
          </p>

          <p>
            <strong>List certifications and qualifications clearly.</strong>
            Professional certifications are highly valued by ATS systems,
            especially in technical fields. List the full name of each
            certification, the awarding body, and the date obtained.
          </p>

          <p>
            <strong>Use standard job titles.</strong> If your actual job title
            was unconventional — like &quot;People Experience Lead&quot; instead
            of &quot;HR Manager&quot; — consider listing the more widely
            recognised equivalent so the ATS can match it correctly.
          </p>

          <h2>Common ATS Mistakes to Avoid</h2>

          <p>
            Even experienced professionals make these errors. Avoid them to give
            your CV the best chance of passing ATS screening:
          </p>

          <p>
            <strong>Submitting a CV as an image.</strong> If your CV is saved as
            a JPG or a scanned PDF, the ATS cannot read any text on it. Always
            use a proper text-based PDF or document format.
          </p>

          <p>
            <strong>Putting contact details in a header or footer.</strong> Many
            ATS systems skip headers and footers entirely. Place your name, email,
            and phone number in the main body of the document.
          </p>

          <p>
            <strong>Using unusual section headings.</strong> Creative headings
            like &quot;My Journey&quot; or &quot;What I Bring&quot; confuse ATS
            software. Stick to standard labels like Work Experience, Education,
            and Skills.
          </p>

          <p>
            <strong>Keyword stuffing.</strong> Including keywords dozens of times
            in an unnatural way may fool some ATS systems but will immediately
            flag your CV as spam to any human reviewer. Use keywords naturally
            and in context.
          </p>

          <h2>ATS-Friendly CVs on SeaVitae</h2>

          <p>
            When you create your CV on SeaVitae, you are not just building a
            document. You are creating a live, searchable professional profile
            that employers on our platform can find directly — without you having
            to apply for a single job posting.
          </p>

          <p>
            Our platform removes the ATS bottleneck entirely for employers who
            use SeaVitae, because they search and discover professionals directly
            rather than filtering through mass applications. But your
            downloadable CV is also fully ATS-optimised for use anywhere else.
          </p>

          <h2>Build Your ATS-Friendly CV for Free</h2>

          <p>
            You do not need to hire a professional CV writer or pay for an
            expensive service. SeaVitae gives you everything you need to create
            a powerful, ATS-friendly CV online — completely free.
          </p>

          <p>
            Sign up, complete your profile, and start getting discovered by
            employers who are actively looking for professionals with your skills.
          </p>
        </section>

        <section id="cta">
          <h2>Build Your ATS-Friendly CV</h2>
          <p>Free, structured, and built to get you discovered.</p>
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
