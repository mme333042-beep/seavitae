import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create CV for Free Online | SeaVitae",
  description: "Create a professional, ATS-friendly CV for free online. No experience required. Build your CV in minutes and get discovered by top employers on SeaVitae.",
};

export default function CreateCVForFreePage() {
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
          <h1>Create a Professional CV for Free</h1>
        </header>

        <section className="about-content">
          <p>
            Creating a CV does not have to cost you anything. With SeaVitae, you
            can build a professional, structured CV online — completely free.
            Whether you are just starting out or updating an existing profile,
            our free CV builder makes the process simple, fast, and effective.
          </p>

          <h2>Why a Strong CV Matters</h2>

          <p>
            Your CV is often the first thing an employer sees. In today&apos;s
            competitive job market, a weak or poorly formatted CV can mean your
            application never gets read. Employers receive hundreds of CVs for
            every opening. A clear, professional CV helps you stand out
            immediately.
          </p>

          <p>
            Beyond human readers, most companies now use applicant tracking
            systems (ATS) to filter CVs before a recruiter ever sees them. An
            ATS-friendly CV uses the right structure, keywords, and formatting to
            pass these automated filters. SeaVitae&apos;s free CV builder is
            designed with this in mind.
          </p>

          <h2>What Makes SeaVitae Different</h2>

          <p>
            Unlike other free CV builders that give you a generic template and
            leave you to figure out the rest, SeaVitae guides you through each
            section of your CV step by step. You fill in your experience,
            education, skills, certifications, and more — and we structure it
            properly for you.
          </p>

          <p>
            There are no confusing design tools, no drag-and-drop headaches, and
            no paywalls hiding the most important features. Everything you need
            to make a CV online is available for free from the moment you sign
            up.
          </p>

          <h2>How to Create Your CV for Free on SeaVitae</h2>

          <p>
            Getting started takes less than five minutes. Here is how it works:
          </p>

          <p>
            <strong>Step 1 — Create a free account.</strong> Sign up with your
            email address. No credit card required, no subscription, no hidden
            fees.
          </p>

          <p>
            <strong>Step 2 — Fill in your profile.</strong> Add your personal
            details, preferred job role, city, and a short professional bio.
            This helps employers understand who you are before they even open
            your CV.
          </p>

          <p>
            <strong>Step 3 — Build your CV sections.</strong> Add your work
            experience, educational background, skills, languages, certifications,
            and any projects or publications. Each section is clearly laid out so
            you always know what to fill in next.
          </p>

          <p>
            <strong>Step 4 — Review and go live.</strong> Once your CV is
            complete, toggle your visibility to &quot;on&quot; and employers
            searching for your skills will be able to find and view your profile
            directly.
          </p>

          <h2>Tips for Writing a Strong CV</h2>

          <p>
            A good CV is clear, honest, and tailored. Here are a few things to
            keep in mind when you make your CV online:
          </p>

          <p>
            <strong>Use specific, measurable achievements.</strong> Instead of
            writing &quot;managed a team,&quot; write &quot;managed a team of 8
            engineers and delivered a project three weeks ahead of schedule.&quot;
            Numbers give employers context and make your experience more
            believable.
          </p>

          <p>
            <strong>Match your skills to the roles you want.</strong> Think about
            the jobs you are applying for and include the skills those employers
            are searching for. If you are in maritime operations, include relevant
            certifications and technical competencies.
          </p>

          <p>
            <strong>Keep it clean and readable.</strong> A cluttered CV full of
            long paragraphs is hard to scan. Use short sentences, clear headings,
            and bullet points where appropriate.
          </p>

          <p>
            <strong>Be consistent with dates and formatting.</strong> Employers
            notice inconsistencies. Make sure your dates are in the same format
            throughout, and that job titles are clearly separated from company
            names.
          </p>

          <h2>Free CV Builder for All Industries</h2>

          <p>
            SeaVitae is built for professionals across all sectors. Whether you
            work in maritime, engineering, finance, healthcare, technology, or
            administration — you can create a professional CV for free and get
            discovered by employers actively looking for your skills.
          </p>

          <p>
            Our platform is particularly focused on connecting Nigerian
            professionals with legitimate employers. No spam, no fake job posts,
            no noise — just real employers searching for real talent.
          </p>

          <h2>Download Your CV Anytime</h2>

          <p>
            Once your CV is complete, you can download it as a PDF at any time.
            Your downloaded CV is clean, professionally formatted, and ready to
            send directly to any employer — even outside of the SeaVitae
            platform. Your work is always yours.
          </p>

          <h2>Start Building Your Free CV Today</h2>

          <p>
            There is no better time to take your career seriously. Create a free
            account on SeaVitae, build your ATS-friendly CV, and start being
            discovered by employers who are actively searching for professionals
            like you.
          </p>

          <p>
            It is free. It is professional. And it only takes a few minutes to
            get started.
          </p>
        </section>

        <section id="cta">
          <h2>Create Your Free CV Now</h2>
          <p>Join SeaVitae and get discovered by employers looking for your skills.</p>
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
