import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "10 CV Mistakes That Are Costing You the Job | SeaVitae Blog",
  description: "Even experienced professionals make these CV mistakes. Find out which errors are holding back your job search — and how to fix every one of them.",
};

export default function CVMistakesToAvoidPage() {
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
          <h1>10 CV Mistakes That Are Costing You the Job</h1>
        </header>

        <section className="about-content">
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>February 19, 2026 · <Link href="/blog">SeaVitae Blog</Link></p>

          <p>
            Your CV is the first impression you make on a potential employer. In
            many cases, it is the only impression — because if it does not pass
            initial review, there will be no interview, no second look, and no
            opportunity to explain yourself in person.
          </p>

          <p>
            The frustrating reality is that most CVs fail for the same
            predictable reasons. These are not difficult problems to fix. But
            they are easy to overlook, especially when you have been staring at
            your own CV for months and stop seeing it clearly.
          </p>

          <p>
            Here are ten CV mistakes that consistently cost candidates jobs —
            along with exactly how to fix each one.
          </p>

          <h2>Mistake 1: Using a Generic CV for Every Application</h2>

          <p>
            Sending the same CV to every employer is one of the most damaging
            habits in a job search. Recruiters read hundreds of CVs. They
            immediately recognise a generic document that has not been written
            with their role in mind.
          </p>

          <p>
            More critically, Applicant Tracking Systems score CVs based on how
            closely they match each specific job description. A generic CV that
            does not use the keywords from the posting will score poorly and be
            filtered out automatically.
          </p>

          <p>
            The fix is to tailor your professional summary and skills section for
            each application. You do not need to rewrite your entire CV —
            adjusting the top third to reflect the priorities of each role is
            usually enough to make a significant difference.
          </p>

          <h2>Mistake 2: Writing Responsibilities Instead of Achievements</h2>

          <p>
            The most common content error on CVs is describing what the job was
            supposed to involve rather than what you actually delivered.
          </p>

          <p>
            &quot;Responsible for customer service operations&quot; is a
            responsibility. It tells the employer what your job description said.
            &quot;Managed a team of twelve customer service agents, reducing
            average response time from 48 hours to 6 hours over six months&quot;
            is an achievement. It tells the employer what you actually did and
            what impact it had.
          </p>

          <p>
            Go through every bullet point in your experience section and convert
            responsibilities into achievements. Use numbers wherever possible.
            Even approximate figures are more compelling than none.
          </p>

          <h2>Mistake 3: Poor Formatting That Breaks ATS Parsing</h2>

          <p>
            Tables, text boxes, multiple columns, and decorative graphics may
            look impressive on screen but cause serious problems when your CV
            goes through an Applicant Tracking System. The ATS cannot reliably
            read content inside tables or text boxes, which means your experience
            and qualifications may be partially or entirely lost.
          </p>

          <p>
            Use a clean, single-column format with standard fonts and clear
            section headings. This format works for both ATS systems and human
            reviewers. Read our full guide on{" "}
            <Link href="/ats-friendly-cv">ATS-friendly CV formatting</Link> for
            a complete breakdown.
          </p>

          <h2>Mistake 4: A Weak or Missing Professional Summary</h2>

          <p>
            The professional summary at the top of your CV is prime real estate.
            A recruiter will read it within the first five seconds of opening
            your document. If it is weak, generic, or absent, you have wasted
            your best opportunity to make an immediate impression.
          </p>

          <p>
            Remove any summary that starts with &quot;I am a hardworking,
            motivated individual&quot; or similar. Replace it with a concise,
            specific statement of who you are professionally, what you specialise
            in, and what value you bring. Three to four sentences is ideal.
          </p>

          <h2>Mistake 5: Listing Skills Without Evidence</h2>

          <p>
            A skills section that lists &quot;leadership, teamwork,
            communication, Microsoft Office&quot; is nearly useless. Every
            candidate includes these. They add no differentiation.
          </p>

          <p>
            Your skills section should reflect specific, relevant technical and
            professional competencies. Where possible, your experience section
            should provide evidence that you actually have those skills. If you
            list &quot;data analysis&quot; as a skill, there should be a bullet
            point somewhere in your experience that demonstrates you have done
            data analysis and what the outcome was.
          </p>

          <h2>Mistake 6: Including Outdated or Irrelevant Information</h2>

          <p>
            Including your secondary school results when you have a university
            degree, listing a job from fifteen years ago in full detail, or
            describing hobbies that have no connection to your professional life
            all take up space without adding value.
          </p>

          <p>
            Every line on your CV should earn its place by contributing to the
            story of why you are the right person for the role you are applying
            for. If it does not contribute, remove it.
          </p>

          <h2>Mistake 7: Inconsistent Formatting and Dates</h2>

          <p>
            Inconsistent formatting signals carelessness to a recruiter before
            they have read a single word of substance. Different fonts in
            different sections, bullet points that sometimes end with a period
            and sometimes do not, and dates that switch between formats
            throughout the document all create an impression of sloppiness.
          </p>

          <p>
            Pick a format and stick to it throughout. Choose one date format —
            &quot;January 2022 — March 2024&quot; — and use it everywhere. Make
            sure all bullet points are grammatically parallel.
          </p>

          <h2>Mistake 8: Spelling and Grammar Errors</h2>

          <p>
            This seems obvious, but it remains one of the most common reasons CVs
            are rejected. A single spelling error is enough for many recruiters
            to move on immediately. It signals that you do not pay attention to
            detail — which is a problem for virtually every professional role.
          </p>

          <p>
            Proofread your CV slowly, out loud. Read it backwards sentence by
            sentence to catch errors your brain would otherwise auto-correct. Ask
            a trusted colleague or friend to review it. Do not rely on
            spellcheck alone — it will not catch words that are spelled correctly
            but used incorrectly.
          </p>

          <h2>Mistake 9: Contact Details in the Header or Footer</h2>

          <p>
            Many popular CV templates place your name, email, and phone number in
            the document header. This looks clean on screen, but many ATS systems
            do not parse document headers. Your contact information effectively
            disappears.
          </p>

          <p>
            Place all contact details — name, email address, phone number,
            LinkedIn URL, and city — in the main body of the document, not in a
            header field. This ensures ATS systems capture them correctly.
          </p>

          <h2>Mistake 10: Making It Too Long</h2>

          <p>
            Longer does not mean more impressive. A four-page CV full of
            irrelevant detail is much less effective than a focused two-page
            document that tells a clear, compelling professional story.
          </p>

          <p>
            For most professionals, one to two pages is the right length. If you
            have more than ten years of experience, two to three pages may be
            appropriate. Beyond that, you are almost certainly including content
            that does not need to be there.
          </p>

          <p>
            When in doubt, cut. A shorter, sharper CV gets read more carefully
            than a long one that gets skimmed.
          </p>

          <h2>How to Fix Your CV Right Now</h2>

          <p>
            The fastest way to address all of these issues at once is to rebuild
            your CV using a properly structured, ATS-friendly format. SeaVitae&apos;s{" "}
            <Link href="/create-cv-for-free">free online CV builder</Link> walks
            you through every section and ensures your CV is clean, complete, and
            formatted correctly.
          </p>

          <p>
            For more guidance, read our articles on{" "}
            <Link href="/blog/why-your-cv-is-not-getting-interviews">
              why CVs fail to get interviews
            </Link>{" "}
            and{" "}
            <Link href="/blog/what-ats-really-scans-for">
              what ATS systems actually scan for
            </Link>
            . You can also explore our guide to{" "}
            <Link href="/professional-cv-template">
              professional CV templates
            </Link>{" "}
            and our dedicated resource for{" "}
            <Link href="/cv-for-fresh-graduates">fresh graduate CVs</Link>.
          </p>

          <p>
            Your CV is not fixed. It is a living document that should be
            updated, refined, and improved continuously. Start today — the job
            you want is not going to wait.
          </p>
        </section>

        <section id="cta">
          <h2>Build a CV That Actually Works</h2>
          <p>
            Fix every mistake from this article in one go. Create your free,
            structured CV on SeaVitae.
          </p>
          <div className="cta-buttons">
            <Link href="/jobseeker/signup">Create Free CV</Link>
            <Link href="/create-cv-for-free">How It Works</Link>
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
              <Link href="/blog/what-ats-really-scans-for">
                What ATS Really Scans For — And How to Make Yours Pass
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
