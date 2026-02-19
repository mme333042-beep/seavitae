import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "CV for Fresh Graduates | SeaVitae",
  description: "Create a professional CV as a fresh graduate with no experience. Free online CV builder for entry-level jobseekers in Nigeria. Get discovered by real employers.",
};

export default function CVForFreshGraduatesPage() {
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
          <h1>Create a Strong CV as a Fresh Graduate</h1>
        </header>

        <section className="about-content">
          <p>
            Entering the job market as a fresh graduate can feel overwhelming,
            especially when most job listings seem to require years of experience
            you do not yet have. But a well-built CV can change that. A strong
            CV for a fresh graduate highlights the right things — your education,
            your potential, your skills, and the experience you do have, even if
            it did not come from a full-time role.
          </p>

          <p>
            SeaVitae is a free online CV builder that helps fresh graduates
            create professional, ATS-friendly CVs that get taken seriously by
            real employers.
          </p>

          <h2>The Challenge of Writing a CV With No Experience</h2>

          <p>
            Many fresh graduates make the mistake of thinking their CV is empty
            because they have not held a professional job. This is rarely true.
            Between internships, academic projects, volunteer work, part-time
            roles, coursework, and extracurricular activities, most graduates
            have more to show than they realise.
          </p>

          <p>
            The challenge is knowing how to present what you have in a way that
            speaks directly to what employers are looking for. A CV for a fresh
            graduate is structured differently from a senior professional&apos;s
            CV — and that is completely fine.
          </p>

          <h2>What to Include in a Fresh Graduate CV</h2>

          <p>
            Here is how to build a compelling CV as an entry-level jobseeker:
          </p>

          <p>
            <strong>Start with a strong professional summary.</strong> Even
            without years of experience, your summary can still be powerful. In
            two or three sentences, describe your degree, your area of
            specialisation, and what you are looking to contribute. Be specific
            about the type of role you are targeting.
          </p>

          <p>
            <strong>Put education near the top.</strong> For fresh graduates,
            your academic background is your most significant credential. Include
            your university, degree, course of study, and graduation year. If
            your CGPA is strong, include it. If you graduated with honours or
            distinction, mention it.
          </p>

          <p>
            <strong>Include internships and NYSC experience.</strong> Any
            internship, SIWES placement, or NYSC posting counts as professional
            experience. List the organisation, your role, the duration, and three
            to five bullet points describing what you contributed or learned.
          </p>

          <p>
            <strong>Highlight relevant projects and coursework.</strong> Did you
            complete a final year project? Build something during a course? Work
            on a research paper? These belong on your CV. Describe what the
            project was, what your role was, and what the outcome was.
          </p>

          <p>
            <strong>List your technical and soft skills.</strong> Skills matter
            significantly for entry-level roles. Include both technical skills
            relevant to your field and soft skills like communication,
            problem-solving, teamwork, and adaptability. Be honest — only list
            skills you can speak to confidently in an interview.
          </p>

          <p>
            <strong>Add certifications and courses.</strong> Online certifications
            from platforms like Coursera, Google, or professional bodies show
            initiative and a commitment to learning. Include any that are relevant
            to the roles you are applying for.
          </p>

          <p>
            <strong>Include volunteer work and extracurricular activities.</strong>
            Leadership roles in student unions, community service, or volunteer
            work all demonstrate responsibility and initiative. If you led a team
            or organised an event, that is leadership experience — include it.
          </p>

          <h2>How to Make Your CV ATS-Friendly as a Graduate</h2>

          <p>
            Even as a fresh graduate, your CV will often pass through an ATS
            before anyone reads it. Here is how to make sure it is optimised:
          </p>

          <p>
            <strong>Use keywords from job descriptions.</strong> Look at the
            entry-level roles you are targeting and note the skills and
            qualifications they list. Mirror that language in your CV where it
            applies to your background.
          </p>

          <p>
            <strong>Avoid fancy formatting.</strong> Tables, graphics, and
            multi-column layouts often break ATS parsing. Keep your CV clean and
            straightforward. SeaVitae&apos;s built-in structure handles this for
            you automatically.
          </p>

          <p>
            <strong>Use full names for qualifications.</strong> Write out the
            full name of your degree and institution. Abbreviations may not be
            recognised by all ATS systems.
          </p>

          <h2>Common Fresh Graduate CV Mistakes to Avoid</h2>

          <p>
            These are the most common errors that hold back fresh graduates in
            their job search:
          </p>

          <p>
            <strong>Listing an objective statement instead of a summary.</strong>
            Old-fashioned objective statements like &quot;seeking a challenging
            role to grow my career&quot; say nothing useful. Replace it with a
            concise professional summary that communicates value.
          </p>

          <p>
            <strong>Leaving out relevant experience because it was unpaid.</strong>
            Volunteer roles, unpaid internships, and community projects all count.
            If you contributed meaningfully, include it.
          </p>

          <p>
            <strong>Making it too long.</strong> A fresh graduate CV should
            typically be one page, or at most two. Do not pad it with irrelevant
            information just to fill space. Quality over quantity.
          </p>

          <p>
            <strong>Using a generic CV for every application.</strong> Tailor
            your professional summary and skills section for each type of role
            you apply for. A small adjustment can make a significant difference
            in how relevant your CV appears.
          </p>

          <h2>Getting Discovered as a Fresh Graduate</h2>

          <p>
            On SeaVitae, fresh graduates have a real opportunity to be discovered
            by employers who are actively looking for new talent. You do not need
            years of experience to build a compelling profile. You need a clear,
            honest CV that shows who you are and what you are capable of.
          </p>

          <p>
            Create your free SeaVitae account, build your CV using our structured
            format, and turn on your visibility. Employers searching for
            entry-level professionals in your field will be able to find you
            directly — no job applications, no waiting.
          </p>

          <h2>Start Your Career With a Professional CV</h2>

          <p>
            The first step to landing your first job is having a CV that opens
            doors. SeaVitae makes it free and straightforward to create a
            professional, ATS-friendly CV — even if you are just starting out.
          </p>

          <p>
            Build your CV today and take control of how employers find you.
          </p>
        </section>

        <section id="cta">
          <h2>Build Your Graduate CV for Free</h2>
          <p>Start strong. Get discovered by employers looking for fresh talent.</p>
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
