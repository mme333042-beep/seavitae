import Link from "next/link";
import Image from "next/image";

/**
 * Shared public site header / navigation.
 * Single source of truth so the nav stays consistent across marketing pages.
 */
export default function SiteHeader() {
  return (
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
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/jobseeker" className="nav-cta">
              Create CV
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
