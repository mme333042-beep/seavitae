import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main>
      <header>
        <h1>Privacy Policy</h1>
        <p>Last updated: January 2025</p>
      </header>

      <article>
        <section>
          <h2>Our Approach to Privacy</h2>
          <p>
            SeaVitae is a professional platform. We collect only what we need to
            connect jobseekers with employers. We do not sell your data or share
            it with advertisers.
          </p>
        </section>

        <section>
          <h2>What We Collect</h2>

          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your email address and
            password. For employers, we also collect your name, company details,
            and professional information.
          </p>

          <h3>Profile Information</h3>
          <p>
            <strong>Jobseekers:</strong> Your CV profile includes your name,
            city, professional summary, work experience, skills, education, and
            other career details you choose to add. Your email and phone number
            are stored but kept private until you accept an interview request.
          </p>
          <p>
            <strong>Employers:</strong> Your profile includes your name, company
            or professional details, city, and verification status.
          </p>

          <h3>Activity Information</h3>
          <p>
            We track basic usage to keep the platform running smoothly. This
            includes messages sent, interview requests, and profile views.
          </p>
        </section>

        <section>
          <h2>CV Visibility and Discovery</h2>
          <p>
            Your CV profile visibility is controlled by the &quot;Open to Discovery&quot;
            setting:
          </p>
          <ul>
            <li>
              <strong>When enabled:</strong> Employers can find your profile
              through search. They see your name, city, role, skills, and
              professional details. They do not see your email or phone number.
            </li>
            <li>
              <strong>When disabled:</strong> Your profile is hidden from search
              results. Existing conversations continue, but new employers cannot
              discover you.
            </li>
          </ul>
          <p>
            You can change this setting at any time from your dashboard.
          </p>
        </section>

        <section>
          <h2>How We Use Your Data</h2>
          <ul>
            <li>Display your profile to employers (when discoverable)</li>
            <li>Enable messaging between jobseekers and employers</li>
            <li>Process interview requests</li>
            <li>Send you notifications about activity on your account</li>
            <li>Improve the platform based on aggregate usage patterns</li>
            <li>Respond to reports and maintain platform safety</li>
          </ul>
        </section>

        <section>
          <h2>What We Share</h2>

          <h3>With Other Users</h3>
          <p>
            Employers see your public profile information when you are
            discoverable. Your email and phone number are shared only when you
            accept an interview request from a specific employer.
          </p>

          <h3>With Third Parties</h3>
          <p>
            We do not sell your data. We may use service providers for hosting,
            email delivery, and analytics. These providers only access data
            necessary to perform their services and are bound by confidentiality
            agreements.
          </p>

          <h3>When Required</h3>
          <p>
            We may disclose information if required by law or to protect the
            safety of our users and the platform.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <ul>
            <li>
              <strong>Visibility:</strong> Control whether employers can
              discover your profile
            </li>
            <li>
              <strong>Profile editing:</strong> Update or remove any information
              from your profile
            </li>
            <li>
              <strong>Account deletion:</strong> Delete your account and
              associated data at any time
            </li>
            <li>
              <strong>Communications:</strong> Manage notification preferences
              in your settings
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We use industry-standard security measures to protect your data.
            This includes encrypted connections, secure password storage, and
            access controls. However, no system is completely secure, so we
            encourage you to use a strong, unique password.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We keep your data while your account is active. If you delete your
            account, we remove your profile and personal information. Some data
            may be retained for legal compliance or to resolve disputes.
          </p>
        </section>

        <section>
          <h2>Reporting and Safety</h2>
          <p>
            When you report another user, we collect your report details to
            review the situation. Your identity as the reporter is kept
            confidential and is not shared with the reported user.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy occasionally. We will notify registered
            users of significant changes. The &quot;Last updated&quot; date at the top
            shows when changes were made.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            If you have questions about this privacy policy or how we handle
            your data, contact us through the platform.
          </p>
        </section>
      </article>

      <nav>
        <Link href="/terms">Terms of Service</Link>
        <span> | </span>
        <Link href="/">Back to Home</Link>
      </nav>
    </main>
  );
}
