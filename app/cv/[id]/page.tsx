import Link from "next/link";
import ReportButton from "@/components/ReportButton";

interface CVProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function CVProfilePage({ params }: CVProfilePageProps) {
  const { id } = await params;

  // Mock profile data - in production this would come from a database
  const profileName = "John Doe";

  return (
    <main>
      <header>
        <h1>John Doe</h1>
        <p>San Francisco</p>
        <p>Senior Machine Learning Engineer</p>
      </header>

      <section aria-label="Employer Actions">
        <h2>Actions</h2>
        <ul>
          <li>
            <Link href={`/cv/${id}/request-interview`}>Request Interview</Link>
          </li>
          <li>
            <Link href={`/cv/${id}/message`}>Message</Link>
          </li>
          <li>
            <button type="button" disabled>
              Phone Call
            </button>
            <p>
              <small>Available after interview is accepted</small>
            </p>
          </li>
          <li>
            <ReportButton
              targetType="cv_profile"
              targetId={id}
              targetName={profileName}
            />
          </li>
        </ul>
      </section>

      <section aria-label="Professional Summary">
        <h2>Professional Summary</h2>
        <p>
          Senior Machine Learning Engineer with 8 years of experience designing
          and deploying AI systems at scale. Led the development of
          recommendation algorithms serving 50M+ users at a Fortune 500 company.
          Expertise in deep learning, NLP, and MLOps. Published researcher with
          12 peer-reviewed papers in top-tier conferences. Passionate about
          building AI that solves real-world problems responsibly and
          efficiently.
        </p>
      </section>

      <section aria-label="Experience">
        <h2>Experience</h2>
        <article>
          <h3>Senior Machine Learning Engineer</h3>
          <p>TechCorp Inc.</p>
          <p>San Francisco, CA</p>
          <p>January 2020 - Present</p>
          <p>
            Led development of recommendation algorithms serving 50M+ users.
            Improved model accuracy by 35% through innovative feature
            engineering and architecture improvements.
          </p>
        </article>
      </section>

      <section aria-label="Skills">
        <h2>Skills</h2>
        <ul>
          <li>Python</li>
          <li>TensorFlow</li>
          <li>PyTorch</li>
          <li>Machine Learning</li>
          <li>Deep Learning</li>
          <li>NLP</li>
          <li>Computer Vision</li>
          <li>MLOps</li>
          <li>AWS</li>
          <li>Docker</li>
        </ul>
      </section>

      <section aria-label="Languages">
        <h2>Languages</h2>
        <ul>
          <li>English - Native</li>
          <li>Spanish - Fluent</li>
        </ul>
      </section>

      <section aria-label="Education">
        <h2>Education</h2>
        <article>
          <h3>Master of Science in Computer Science</h3>
          <p>Stanford University</p>
          <p>Stanford, CA</p>
          <p>2018</p>
        </article>
      </section>

      <section aria-label="Certifications">
        <h2>Certifications</h2>
        <ul>
          <li>AWS Certified Machine Learning - Specialty (2022)</li>
          <li>Google Cloud Professional ML Engineer (2021)</li>
        </ul>
      </section>

      <section aria-label="Projects">
        <h2>Projects</h2>
        <article>
          <h3>AI-Powered Recommendation System</h3>
          <p>
            Built a real-time recommendation engine processing millions of
            events daily with sub-100ms latency.
          </p>
          <p>
            <a
              href="https://github.com/johndoe/project"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Project
            </a>
          </p>
        </article>
      </section>

      <section aria-label="Publications">
        <h2>Publications</h2>
        <ul>
          <li>
            <a
              href="https://arxiv.org/abs/xxxx.xxxxx"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scalable Deep Learning for Real-Time Recommendations - NeurIPS
              2023
            </a>
          </li>
        </ul>
      </section>

      <aside aria-label="Privacy Notice">
        <p>
          <small>
            This candidate's email address and phone number are private. Phone
            contact becomes available only after the candidate accepts an
            interview request.
          </small>
        </p>
      </aside>
    </main>
  );
}
