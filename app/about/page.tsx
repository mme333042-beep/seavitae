import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header>
          <h1>About SeaVitae</h1>
        </header>

        <section className="about-content">
          <p>
            SeaVitae is a free online CV builder that helps professionals create
            clean, ATS-friendly CVs in minutes.
          </p>

          <p>
            We believe building a great CV should be simple and calm — not a
            fight with templates, formatting, or fiddly design tools. You add
            your details, our AI sharpens the wording, and you download a
            polished, recruiter-ready PDF.
          </p>

          <p>
            Every CV is structured the way applicant tracking systems expect,
            with clear sections that adapt to your profession — so your
            experience is read correctly by software and people alike.
          </p>

          <p>
            No clutter. No noise. Just a professional CV that puts your best foot
            forward.
          </p>

          <p>
            SeaVitae is designed for people who value clarity over clutter and
            signal over noise.
          </p>
        </section>

        <section id="cta">
          <h2>Build your CV</h2>
          <p>Create a professional, ATS-friendly CV in minutes.</p>
          <div className="cta-buttons">
            <Link href="/jobseeker">Create My CV</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
