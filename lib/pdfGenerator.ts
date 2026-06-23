/**
 * PDF Generator for CV Downloads
 *
 * Produces a clean, two-column, ATS-friendly CV as printable HTML that the
 * browser turns into a PDF. The layout adapts its section headings to the
 * user's role (see lib/cvLayout.ts):
 *   - Name in bold serif, top-left (no avatar)
 *   - Contact details top-right
 *   - Blue, uppercase section subheadings; Merriweather serif body in soft gray
 *   - Role-aware "Key Achievements / Highlights" block derived from experience
 */

import { getSectionLabels, extractKeyAchievements } from "./cvLayout";

export interface CVData {
  fullName: string;
  email?: string;
  phone?: string; // Format: "+234-8087035953"
  city: string;
  preferredRole: string;
  bio: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    year: number;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];
  projects: {
    name: string;
    description: string;
    link: string;
  }[];
  publications: {
    title: string;
    venue: string;
    link: string;
  }[];
  lastUpdated: Date;
}

/**
 * Generate filename for CV PDF
 */
export function generateCVFilename(fullName: string): string {
  const sanitizedName = fullName
    .replace(/[^a-zA-Z\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
  return `${sanitizedName}_SeaVitae_CV.pdf`;
}

/**
 * Escape user-supplied text so it can't break the HTML layout (or inject markup).
 */
function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render an experience/education description as bullet list or paragraph.
 */
function renderDescription(description: string): string {
  if (!description) return "";
  const lines = description
    .split(/[•\n]/)
    .map((line) => line.replace(/^[\s\-*•]+/, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length > 1) {
    return `<ul class="bullets">${lines
      .map((line) => `<li>${esc(line)}</li>`)
      .join("")}</ul>`;
  }
  return `<p class="entry-desc">${esc(description)}</p>`;
}

/**
 * Format an experience date range.
 */
function formatRange(startDate: string, endDate: string): string {
  const start = esc(startDate);
  const end = endDate ? esc(endDate) : "Present";
  return start ? `${start} – ${end}` : end;
}

/**
 * Generate printable HTML for CV — role-adaptive two-column design.
 */
export function generatePrintableCV(cv: CVData): string {
  const labels = getSectionLabels(cv.preferredRole);
  const achievements = labels.showAchievements
    ? extractKeyAchievements(cv.experience)
    : [];

  const experienceEntry = (exp: CVData["experience"][number]): string => `
    <div class="entry">
      <p class="entry-head"><strong>${esc(exp.company)}</strong>${
        exp.title ? ` — <em>${esc(exp.title)}</em>` : ""
      }</p>
      <p class="entry-meta">${formatRange(exp.startDate, exp.endDate)}${
        exp.location ? ` &middot; ${esc(exp.location)}` : ""
      }</p>
      ${renderDescription(exp.description)}
    </div>`;

  const educationEntry = (edu: CVData["education"][number]): string => `
    <div class="entry">
      <p class="entry-head"><strong>${esc(edu.degree)}</strong></p>
      <p class="entry-sub">${esc(edu.institution)}</p>
      <p class="entry-meta">${edu.year ? esc(edu.year) : ""}${
        edu.location ? `${edu.year ? " &middot; " : ""}${esc(edu.location)}` : ""
      }</p>
    </div>`;

  const bulletList = (items: string[]): string =>
    `<ul class="bullets">${items
      .map((item) => `<li>${esc(item)}</li>`)
      .join("")}</ul>`;

  // -- Left column ----------------------------------------------------------
  const leftColumn = `
    <div class="col-left">
      <header class="name-block">
        <h1 class="cv-name">${esc(cv.fullName)}</h1>
        ${cv.preferredRole ? `<p class="cv-role">${esc(cv.preferredRole)}</p>` : ""}
      </header>

      ${
        cv.bio
          ? `<section class="section">
              <h2 class="section-title">${esc(labels.summary)}</h2>
              <p class="summary-text">${esc(cv.bio)}</p>
            </section>`
          : ""
      }

      ${
        cv.experience.length > 0
          ? `<section class="section">
              <h2 class="section-title">${esc(labels.experience)}</h2>
              ${cv.experience.map(experienceEntry).join("")}
            </section>`
          : ""
      }

      ${
        cv.education.length > 0
          ? `<section class="section">
              <h2 class="section-title">${esc(labels.education)}</h2>
              ${cv.education.map(educationEntry).join("")}
            </section>`
          : ""
      }
    </div>`;

  // -- Right column ---------------------------------------------------------
  const contactItems = [
    cv.city ? esc(cv.city) : "",
    cv.phone ? esc(cv.phone) : "",
    cv.email ? `<span class="contact-link">${esc(cv.email)}</span>` : "",
  ].filter(Boolean);

  const rightColumn = `
    <div class="col-right">
      ${
        contactItems.length > 0
          ? `<section class="section contact">
              ${contactItems.map((item) => `<p>${item}</p>`).join("")}
            </section>`
          : ""
      }

      ${
        achievements.length > 0
          ? `<section class="section">
              <h2 class="section-title">${esc(labels.achievements)}</h2>
              ${bulletList(achievements)}
            </section>`
          : ""
      }

      ${
        cv.skills.length > 0
          ? `<section class="section">
              <h2 class="section-title">${esc(labels.skills)}</h2>
              ${bulletList(cv.skills)}
            </section>`
          : ""
      }

      ${
        cv.languages.length > 0
          ? `<section class="section">
              <h2 class="section-title">Languages</h2>
              ${cv.languages
                .map(
                  (lang) =>
                    `<p class="kv"><span>${esc(lang.language)}</span><span class="kv-muted">${esc(
                      lang.proficiency
                    )}</span></p>`
                )
                .join("")}
            </section>`
          : ""
      }

      ${
        cv.certifications.length > 0
          ? `<section class="section">
              <h2 class="section-title">Certifications</h2>
              ${cv.certifications
                .map(
                  (cert) =>
                    `<div class="stack-item">
                      <p class="stack-title">${esc(cert.name)}</p>
                      <p class="stack-meta">${esc(cert.issuer)}${
                        cert.year ? ` (${esc(cert.year)})` : ""
                      }</p>
                    </div>`
                )
                .join("")}
            </section>`
          : ""
      }

      ${
        cv.projects.length > 0
          ? `<section class="section">
              <h2 class="section-title">Projects</h2>
              ${cv.projects
                .map(
                  (proj) =>
                    `<div class="stack-item">
                      <p class="stack-title accent">${esc(proj.name)}</p>
                      ${proj.description ? `<p class="stack-meta">${esc(proj.description)}</p>` : ""}
                      ${
                        proj.link
                          ? `<a href="${esc(proj.link)}" class="stack-link">${esc(proj.link)}</a>`
                          : ""
                      }
                    </div>`
                )
                .join("")}
            </section>`
          : ""
      }

      ${
        cv.publications.length > 0
          ? `<section class="section">
              <h2 class="section-title">Publications</h2>
              ${cv.publications
                .map(
                  (pub) =>
                    `<div class="stack-item">
                      <p class="stack-title">${esc(pub.title)}</p>
                      <p class="stack-meta italic">${esc(pub.venue)}</p>
                      ${
                        pub.link
                          ? `<a href="${esc(pub.link)}" class="stack-link">${esc(pub.link)}</a>`
                          : ""
                      }
                    </div>`
                )
                .join("")}
            </section>`
          : ""
      }
    </div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(cv.fullName)} - CV</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Merriweather+Sans:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --cv-blue: #2563EB;
      --cv-ink: #1f2937;
      --cv-body: #374151;
      --cv-muted: #6b7280;
      --cv-line: #e5e7eb;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
      font-size: 10pt;
      line-height: 1.6;
      color: var(--cv-body);
      background: #ffffff;
      padding: 40px 44px;
      max-width: 900px;
      margin: 0 auto;
    }

    .cv {
      display: flex;
      gap: 34px;
      align-items: flex-start;
    }

    .col-left { flex: 1.6; min-width: 0; }
    .col-right { flex: 1; min-width: 0; }

    /* Name block */
    .name-block { margin-bottom: 22px; }

    .cv-name {
      font-family: 'Merriweather', Georgia, serif;
      font-weight: 700;
      font-size: 27pt;
      line-height: 1.1;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .cv-role {
      font-size: 12pt;
      color: var(--cv-muted);
      margin-top: 4px;
    }

    /* Sections */
    .section { margin-bottom: 18px; }

    .section-title {
      font-family: 'Merriweather Sans', 'Segoe UI', Arial, sans-serif;
      font-weight: 700;
      font-size: 10.5pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--cv-blue);
      margin-bottom: 8px;
    }

    .summary-text { color: var(--cv-body); }

    /* Experience / education entries */
    .entry { margin-bottom: 13px; }
    .entry:last-child { margin-bottom: 0; }

    .entry-head { font-size: 10.5pt; color: var(--cv-ink); }
    .entry-head strong { font-weight: 700; }
    .entry-head em { font-style: italic; color: var(--cv-body); }

    .entry-sub { font-size: 10pt; color: var(--cv-body); }

    .entry-meta {
      font-size: 8.5pt;
      color: var(--cv-muted);
      margin-bottom: 5px;
    }

    .entry-desc { color: var(--cv-body); }

    /* Bullet lists (dash style, matching the reference) */
    .bullets { list-style: none; }
    .bullets li {
      position: relative;
      padding-left: 14px;
      margin-bottom: 5px;
    }
    .bullets li:last-child { margin-bottom: 0; }
    .bullets li::before {
      content: "–";
      position: absolute;
      left: 0;
      color: var(--cv-muted);
    }

    /* Contact (right column top) */
    .contact p { font-size: 9.5pt; color: var(--cv-body); margin-bottom: 2px; }
    .contact-link { color: var(--cv-blue); word-break: break-all; }

    /* Key/value rows (languages) */
    .kv {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 9.5pt;
      margin-bottom: 3px;
    }
    .kv-muted { color: var(--cv-muted); }

    /* Stacked items (certs / projects / publications) */
    .stack-item { margin-bottom: 9px; }
    .stack-item:last-child { margin-bottom: 0; }
    .stack-title { font-weight: 700; font-size: 9.5pt; color: var(--cv-ink); }
    .stack-title.accent { color: var(--cv-blue); }
    .stack-meta { font-size: 9pt; color: var(--cv-muted); }
    .stack-meta.italic { font-style: italic; }
    .stack-link { font-size: 8.5pt; color: var(--cv-blue); text-decoration: none; word-break: break-all; }

    /* Keep a heading with the start of its content */
    .section-title { break-after: avoid; page-break-after: avoid; }
    .entry, .stack-item { break-inside: avoid; page-break-inside: avoid; }

    @page { margin: 14mm; }

    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="cv">
    ${leftColumn}
    ${rightColumn}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download CV as PDF using browser print
 */
export function downloadCVAsPDF(cv: CVData): void {
  const printContent = generatePrintableCV(cv);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups to download your CV as PDF.");
    return;
  }

  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content (and web fonts) to load, then trigger print.
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };
}

/**
 * Check if print is available
 */
export function isPrintAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.print === "function";
}
