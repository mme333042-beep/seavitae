import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Why Your CV Is Not Getting You Interviews | SeaVitae Blog",
  description: "Applied to dozens of jobs and heard nothing back? The problem is almost always your CV. Here is exactly why your CV is not working — and how to fix it.",
};

export default function WhyCVNotGettingInterviewsPage() {
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
          <h1>Why Your CV Is Not Getting You Interviews (And How to Fix It)</h1>
        </header>

        <section className="about-content">
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>February 19, 2026 · <Link href="/blog">SeaVitae Blog</Link></p>

          <p>
            You have spent hours perfecting your CV. You have applied to ten,
            twenty, maybe fifty jobs. And you have heard almost nothing back.
            This is one of the most demoralising experiences in a job search —
            and it is far more common than people admit.
          </p>

          <p>
            The hard truth is this: if you are not getting interview calls, your
            CV is almost certainly the reason. Not your qualifications. Not the
            job market. Your CV.
          </p>

          <p>
            The good news is that this is fixable. Here are the most common
            reasons CVs fail — and exactly what to do about each one.
          </p>

          <h2>1. Your CV Is Not Passing the ATS Filter</h2>

          <p>
            Most large companies and many medium-sized ones use Applicant
            Tracking Systems (ATS) to filter applications before a human ever
            sees them. If your CV is not formatted correctly, it gets rejected
            automatically — no matter how qualified you are.
          </p>

          <p>
            ATS systems struggle with tables, text boxes, graphics, unusual
            fonts, and multi-column layouts. They also look for specific keywords
            that match the job description. If those keywords are absent from
            your CV, your application scores poorly and gets filtered out.
          </p>

          <p>
            The fix is to use a clean, structured CV format with standard section
            headings, simple formatting, and language that mirrors the job
            descriptions you are targeting. Read our full guide on{" "}
            <Link href="/ats-friendly-cv">building an ATS-friendly CV</Link> to
            understand exactly what these systems look for.
          </p>

          <h2>2. Your Professional Summary Is Weak or Missing</h2>

          <p>
            The first thing a recruiter reads after your name is your
            professional summary. If it is generic, vague, or missing entirely,
            you have already lost their attention.
          </p>

          <p>
            A weak summary sounds like this: &quot;A hardworking professional
            seeking a challenging role in a dynamic organisation.&quot; This says
            nothing. It could describe anyone.
          </p>

          <p>
            A strong summary sounds like this: &quot;Operations manager with
            seven years of experience in logistics and supply chain, specialising
            in cost reduction and cross-functional team leadership. Proven track
            record of delivering projects on time in high-pressure environments.&quot;
          </p>

          <p>
            Your summary should be specific, achievement-focused, and tailored to
            the type of role you are targeting. Two to four sentences is enough.
          </p>

          <p style={{ borderLeft: "3px solid #2563eb", paddingLeft: "1rem", color: "#1e40af" }}>
            Ready to fix your CV? <Link href="/jobseeker/signup"><strong>Create your ATS-friendly CV on SeaVitae for free →</strong></Link>
          </p>

          <h2>3. You Are Not Tailoring Your CV</h2>

          <p>
            Sending the same CV to every job is one of the most common and
            damaging mistakes job seekers make. Employers can tell immediately
            when a CV is generic. And ATS systems penalise CVs that do not match
            the specific language used in the job description.
          </p>

          <p>
            Tailoring does not mean rewriting your entire CV for every
            application. It means adjusting your professional summary, reordering
            your skills to lead with the most relevant ones, and making sure the
            language you use reflects the priorities of each specific role.
          </p>

          <p>
            Even small changes — using the exact job title from the posting,
            mentioning a specific skill they listed — can significantly improve
            your application&apos;s performance.
          </p>

          <h2>4. Your Experience Descriptions Are Too Vague</h2>

          <p>
            Most CVs describe responsibilities rather than achievements. The
            difference is enormous.
          </p>

          <p>
            &quot;Responsible for managing client accounts&quot; is a
            responsibility. It tells an employer what your job was supposed to
            involve.
          </p>

          <p>
            &quot;Managed a portfolio of 40 client accounts with a combined value
            of ₦120 million, achieving a 94% retention rate over two years&quot;
            is an achievement. It tells an employer what you actually delivered.
          </p>

          <p>
            Go through every bullet point in your work experience section and ask
            yourself: does this describe what I was supposed to do, or what I
            actually accomplished? Rewrite your responsibilities as achievements
            wherever possible, and use numbers to make them concrete.
          </p>

          <h2>5. Your CV Is Too Long</h2>

          <p>
            More pages do not mean more impressive. Recruiters spend an average
            of six to ten seconds reviewing a CV on first pass. A four-page CV
            full of padding is much harder to scan than a tight, focused
            two-page document.
          </p>

          <p>
            For most professionals with under ten years of experience, one to two
            pages is ideal. Senior professionals with extensive experience may
            need two to three pages, but never more than that.
          </p>

          <p>
            Cut anything that does not directly support your application for the
            type of role you are targeting. Secondary school results, hobbies
            with no professional relevance, and outdated roles from fifteen years
            ago can almost always be removed.
          </p>

          <h2>6. Your Skills Section Is Not Doing Enough Work</h2>

          <p>
            A skills section that just lists &quot;Microsoft Office, teamwork,
            communication&quot; is not helping you. Every candidate includes
            these. They add no differentiation and very little ATS value.
          </p>

          <p>
            Your skills section should reflect the specific technical and
            professional competencies that are relevant to your target roles.
            If you are in engineering, list specific tools, software, and
            methodologies. If you are in finance, list specific platforms,
            frameworks, and financial instruments you work with.
          </p>

          <p>
            Also ensure that your skills are consistent with the keywords used in
            the job descriptions you are targeting. If a role requires
            &quot;financial modelling,&quot; make sure those exact words appear
            in your skills section if they apply to you.
          </p>

          <h2>7. You Are Applying to the Wrong Jobs</h2>

          <p>
            Sometimes the problem is not the CV — it is the strategy. If you are
            applying for roles that genuinely require five years of experience and
            you have two, no CV will bridge that gap. If you are applying outside
            your field without addressing the career change in your summary, most
            employers will not see the relevance.
          </p>

          <p>
            Be honest about where you are in your career and target roles that
            are realistic. Apply to roles where you meet at least 70–80% of the
            listed requirements. Spend more time on fewer, better-targeted
            applications rather than mass-applying with a generic CV.
          </p>

          <p style={{ borderLeft: "3px solid #2563eb", paddingLeft: "1rem", color: "#1e40af" }}>
            SeaVitae&apos;s free CV builder structures every section correctly from the start. <Link href="/create-cv-for-free"><strong>Build your professional CV now →</strong></Link>
          </p>

          <h2>8. Your CV Has Formatting or Grammar Errors</h2>

          <p>
            Typos, inconsistent formatting, and grammatical errors send an
            immediate signal that you are careless. Even one error can be enough
            for a recruiter to move on to the next candidate.
          </p>

          <p>
            Proofread your CV multiple times. Read it out loud. Ask someone else
            to review it. Check that dates are consistent, that bullet points are
            grammatically parallel, and that there are no spelling errors.
          </p>

          <h2>How to Fix Your CV Today</h2>

          <p>
            If any of the above points apply to your CV, the fastest fix is to
            rebuild it properly from scratch using a structured, ATS-friendly
            format.
          </p>

          <p>
            SeaVitae&apos;s free CV builder guides you through every section —
            professional summary, work experience, skills, education,
            certifications, and more — so nothing important gets left out and
            everything is formatted correctly from the start.
          </p>

          <p>
            You can also read more about{" "}
            <Link href="/ats-friendly-cv">what ATS systems look for</Link>,
            explore our guide to{" "}
            <Link href="/professional-cv-template">
              professional CV templates
            </Link>
            , and see our article on{" "}
            <Link href="/blog/cv-mistakes-to-avoid">
              the ten CV mistakes to avoid
            </Link>
            .
          </p>

          <p>
            The job market is competitive. But a strong, well-structured CV puts
            you in a completely different position. Take the time to get it right
            — it is the most important document in your career.
          </p>
        </section>

        <section id="cta">
          <h2>Rebuild Your CV the Right Way</h2>
          <p>
            Create a free, ATS-friendly CV on SeaVitae and start getting the
            interviews you deserve.
          </p>
          <div className="cta-buttons">
            <Link href="/jobseeker/signup">Create Free CV</Link>
            <Link href="/create-cv-for-free">Learn How It Works</Link>
          </div>
        </section>

        <section className="about-content">
          <h2>More Articles</h2>
          <ul>
            <li>
              <Link href="/blog/what-ats-really-scans-for">
                What ATS Really Scans For — And How to Make Yours Pass
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
