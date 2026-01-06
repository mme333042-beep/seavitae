import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main>
      <header>
        <h1>Terms of Service</h1>
        <p>Last updated: January 2025</p>
      </header>

      <article>
        <section>
          <h2>Welcome to SeaVitae</h2>
          <p>
            SeaVitae is a talent discovery platform where professionals create
            CV profiles and employers discover candidates. By using SeaVitae,
            you agree to these terms.
          </p>
        </section>

        <section>
          <h2>How SeaVitae Works</h2>

          <h3>For Jobseekers</h3>
          <p>
            You create a CV profile with your professional information. When you
            enable "Open to Discovery," employers can find your profile through
            search. Your profile displays your name, city, role, skills, and
            professional background. Your email and phone number are kept
            private until you accept an interview request.
          </p>

          <h3>For Employers</h3>
          <p>
            You search for candidates by skills, roles, and location. You can
            message candidates and request interviews. Your company or
            individual profile is visible to candidates you contact. Completing
            your profile details helps build trust with candidates.
          </p>
        </section>

        <section>
          <h2>Your Responsibilities</h2>

          <h3>Accurate Information</h3>
          <p>
            Provide truthful information in your profile. Do not misrepresent
            your qualifications, experience, or identity. Do not create fake
            profiles or impersonate others.
          </p>

          <h3>Professional Conduct</h3>
          <p>
            Use SeaVitae for legitimate professional purposes only. Communicate
            respectfully with other users. Do not send spam, unsolicited
            promotions, or harassing messages.
          </p>

          <h3>Account Security</h3>
          <p>
            Keep your password secure. You are responsible for activity on your
            account. Notify us if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2>What We Do Not Allow</h2>
          <ul>
            <li>Fake or misleading profiles</li>
            <li>Harassment or discrimination</li>
            <li>Spam or bulk messaging</li>
            <li>Scraping or automated data collection</li>
            <li>Sharing other users&apos; private information</li>
            <li>Using the platform for non-professional purposes</li>
          </ul>
        </section>

        <section>
          <h2>Reporting and Safety</h2>
          <p>
            If you encounter inappropriate content or behavior, use the Report
            feature. We review all reports and take action when necessary. This
            may include warning, suspending, or removing accounts that violate
            these terms. Your identity is kept confidential when you submit a
            report.
          </p>
        </section>

        <section>
          <h2>Your Content</h2>
          <p>
            You own the content you add to your profile. By posting content, you
            grant SeaVitae permission to display it to other users as part of
            the platform&apos;s normal operation. You can delete your profile at any
            time.
          </p>
        </section>

        <section>
          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms occasionally. We will notify registered
            users of significant changes. Continued use of SeaVitae after
            changes means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            If you have questions about these terms, contact us through the
            platform.
          </p>
        </section>
      </article>

      <nav>
        <Link href="/privacy">Privacy Policy</Link>
        <span> | </span>
        <Link href="/">Back to Home</Link>
      </nav>
    </main>
  );
}
