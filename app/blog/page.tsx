import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Career & CV Advice Blog | SeaVitae",
  description: "Expert advice on writing CVs, passing ATS systems, and landing interviews. Free career guides for Nigerian professionals and fresh graduates.",
};

const posts = [
  {
    slug: "why-your-cv-is-not-getting-interviews",
    title: "Why Your CV Is Not Getting You Interviews (And How to Fix It)",
    excerpt:
      "You have applied to dozens of jobs and heard nothing back. The problem is almost always your CV. Here is exactly why — and what to do about it.",
    date: "February 19, 2026",
  },
  {
    slug: "what-ats-really-scans-for",
    title: "What ATS Really Scans For — And How to Make Yours Pass",
    excerpt:
      "Most CVs are rejected before a human ever reads them. Applicant Tracking Systems filter out hundreds of candidates automatically. Here is how to make sure yours gets through.",
    date: "February 19, 2026",
  },
  {
    slug: "cv-mistakes-to-avoid",
    title: "10 CV Mistakes That Are Costing You the Job",
    excerpt:
      "Even experienced professionals make these CV errors. Avoid these ten mistakes and immediately improve your chances of getting called for an interview.",
    date: "February 19, 2026",
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header>
          <h1>Career &amp; CV Advice</h1>
        </header>

        <section className="about-content">
          <p>
            Practical guides to help Nigerian professionals write better CVs,
            pass ATS filters, and land more interviews.
          </p>

          {posts.map((post) => (
            <article key={post.slug} style={{ marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>{post.date}</p>
              <p>{post.excerpt}</p>
              <p>
                <Link href={`/blog/${post.slug}`}>Read article →</Link>
              </p>
            </article>
          ))}
        </section>

        <section id="cta">
          <h2>Ready to Build Your CV?</h2>
          <p>Put the advice into action. Create your free ATS-friendly CV on SeaVitae.</p>
          <div className="cta-buttons">
            <Link href="/jobseeker">Create My Free CV</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
