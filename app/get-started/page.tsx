import Link from "next/link";
import Image from "next/image";

export default function GetStartedPage() {
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
          <h1>Get Started</h1>
          <p>Choose how you want to use SeaVitae.</p>
        </header>

        <section>
          <h2>I want to...</h2>

          <div className="two-column">
            <Link href="/employer" className="action-card">
              <strong>Hire Talent</strong>
              <span>
                Search CVs directly and find professionals with the skills you
                need.
              </span>
            </Link>

            <Link href="/jobseeker" className="action-card">
              <strong>Be Discovered</strong>
              <span>
                Create your CV and let employers find you based on your
                experience.
              </span>
            </Link>
          </div>
        </section>

        <section>
          <h2>Already have an account?</h2>
          <div className="card">
            <p>
              <Link href="/login">Login to your account</Link>
            </p>
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
