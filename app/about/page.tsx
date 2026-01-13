import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
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
          <h1>About SeaVitae</h1>
        </header>

        <section className="about-content">
          <p>
            SeaVitae is a CV-first talent discovery platform built to simplify
            how professionals and employers connect.
          </p>

          <p>
            We believe hiring should be calm, direct, and human - not noisy or
            transactional. That&apos;s why SeaVitae removes job postings and
            applications entirely.
          </p>

          <p>
            Employers search and discover professionals based on real skills,
            experience, and intent. Jobseekers create one clear professional
            profile and get found.
          </p>

          <p>
            No endless scrolling. No keyword games. No pressure to constantly
            reapply.
          </p>

          <p>
            Just structured profiles, thoughtful discovery, and respectful
            communication.
          </p>

          <p>
            SeaVitae is designed for people who value clarity over clutter and
            signal over noise.
          </p>
        </section>

        <section id="cta">
          <h2>Get Started</h2>
          <p>Create your CV or start searching for talent.</p>
          <div className="cta-buttons">
            <Link href="/employer">I&apos;m Hiring</Link>
            <Link href="/jobseeker">Be Discovered</Link>
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
