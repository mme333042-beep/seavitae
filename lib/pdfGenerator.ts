/**
 * PDF Generator for CV Downloads
 * Uses browser print functionality for clean, professional PDF output
 */

export interface CVData {
  fullName: string;
  email?: string;
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
 * Get initials from full name
 */
function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate printable HTML for CV - Two Column Modern Design
 */
export function generatePrintableCV(cv: CVData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const initials = getInitials(cv.fullName);

  // Check if right column has content
  const hasRightContent = cv.skills.length > 0 || cv.languages.length > 0 ||
    cv.certifications.length > 0 || cv.projects.length > 0 || cv.publications.length > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.fullName} - CV</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #374151;
      background: white;
      padding: 30px 40px;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-left {
      flex: 1;
    }

    .header-name {
      font-size: 28pt;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    .header-role {
      font-size: 13pt;
      color: #60a5fa;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .header-contact {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 9pt;
      color: #4b5563;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .contact-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      font-size: 12px;
    }

    /* Wrapper to keep section title + first item together */
    .section-header-group {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .header-avatar {
      width: 70px;
      height: 70px;
      background: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22pt;
      font-weight: 600;
      color: #3b82f6;
      flex-shrink: 0;
      margin-left: 20px;
    }

    /* Main Layout */
    .main-content {
      display: flex;
      gap: 30px;
    }

    .left-column {
      flex: ${hasRightContent ? '1.4' : '1'};
    }

    .right-column {
      flex: 0.6;
    }

    /* Section Styling */
    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2.5px solid #f59e0b;
    }

    /* Summary */
    .summary-text {
      color: #4b5563;
      line-height: 1.6;
      text-align: justify;
    }

    /* Experience & Education Entries */
    .entry {
      margin-bottom: 16px;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .entry-title {
      font-size: 11pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .entry-company {
      font-size: 10pt;
      color: #0d9488;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .entry-meta {
      display: flex;
      gap: 16px;
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 6px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-icon {
      font-size: 10px;
    }

    .entry-description {
      color: #4b5563;
      font-size: 9.5pt;
      line-height: 1.5;
    }

    .entry-description ul {
      margin: 0;
      padding-left: 16px;
    }

    .entry-description li {
      margin-bottom: 3px;
    }

    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      list-style: none;
    }

    .skill-tag {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9pt;
      color: #374151;
    }

    /* Languages */
    .language-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dotted #e5e7eb;
      font-size: 9.5pt;
    }

    .language-item:last-child {
      border-bottom: none;
    }

    .language-name {
      font-weight: 500;
      color: #1f2937;
    }

    .language-level {
      color: #6b7280;
    }

    /* Certifications */
    .cert-item {
      margin-bottom: 10px;
    }

    .cert-item:last-child {
      margin-bottom: 0;
    }

    .cert-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 9.5pt;
    }

    .cert-meta {
      font-size: 9pt;
      color: #6b7280;
    }

    /* Projects */
    .project-item {
      margin-bottom: 10px;
    }

    .project-item:last-child {
      margin-bottom: 0;
    }

    .project-name {
      font-weight: 600;
      color: #0d9488;
      font-size: 9.5pt;
    }

    .project-desc {
      font-size: 9pt;
      color: #4b5563;
      margin-top: 2px;
    }

    .project-link {
      font-size: 8pt;
      color: #3b82f6;
      text-decoration: none;
      word-break: break-all;
    }

    /* Publications */
    .pub-item {
      margin-bottom: 10px;
    }

    .pub-item:last-child {
      margin-bottom: 0;
    }

    .pub-title {
      font-weight: 600;
      color: #1f2937;
      font-size: 9.5pt;
    }

    .pub-venue {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
    }

    /* Footer */
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #9ca3af;
      font-size: 8pt;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .footer-brand strong {
      color: #6b7280;
    }

    /* Print Styles */
    @media print {
      body {
        padding: 20px 25px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .header-avatar {
        background: #dbeafe !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .section {
        page-break-inside: auto;
      }

      .entry {
        page-break-inside: avoid;
      }

      .section-title {
        page-break-after: avoid;
      }

      .skill-tag {
        background: #f3f4f6 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <h1 class="header-name">${cv.fullName.toUpperCase()}</h1>
      <p class="header-role">${cv.preferredRole}</p>
      <div class="header-contact">
        ${cv.email ? `
        <span class="contact-item">
          ${cv.email}
        </span>
        ` : ''}
        <span class="contact-item">
          <span class="contact-icon">&#128205;</span>
          ${cv.city}
        </span>
      </div>
    </div>
    <div class="header-avatar">${initials}</div>
  </header>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Left Column -->
    <div class="left-column">
      ${cv.bio ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Summary</h2>
          <p class="summary-text">${cv.bio}</p>
        </div>
      </section>
      ` : ''}

      ${cv.experience.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Experience</h2>
          ${(() => {
            const exp = cv.experience[0];
            const descLines = exp.description ? exp.description.split(/[•\n]/).filter(line => line.trim()) : [];
            const hasBullets = descLines.length > 1;
            return `
            <div class="entry">
              <h3 class="entry-title">${exp.title}</h3>
              <p class="entry-company">${exp.company}</p>
              <div class="entry-meta">
                <span class="meta-item">
                  <span class="meta-icon">&#128197;</span>
                  ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}
                </span>
                ${exp.location ? `
                <span class="meta-item">
                  <span class="meta-icon">&#128205;</span>
                  ${exp.location}
                </span>
                ` : ''}
              </div>
              ${exp.description ? `
              <div class="entry-description">
                ${hasBullets ? `
                <ul>
                  ${descLines.map(line => `<li>${line.trim()}</li>`).join('')}
                </ul>
                ` : `<p>${exp.description}</p>`}
              </div>
              ` : ''}
            </div>
            `;
          })()}
        </div>
        ${cv.experience.slice(1).map(exp => {
          const descLines = exp.description ? exp.description.split(/[•\n]/).filter(line => line.trim()) : [];
          const hasBullets = descLines.length > 1;

          return `
          <div class="entry">
            <h3 class="entry-title">${exp.title}</h3>
            <p class="entry-company">${exp.company}</p>
            <div class="entry-meta">
              <span class="meta-item">
                <span class="meta-icon">&#128197;</span>
                ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}
              </span>
              ${exp.location ? `
              <span class="meta-item">
                <span class="meta-icon">&#128205;</span>
                ${exp.location}
              </span>
              ` : ''}
            </div>
            ${exp.description ? `
            <div class="entry-description">
              ${hasBullets ? `
              <ul>
                ${descLines.map(line => `<li>${line.trim()}</li>`).join('')}
              </ul>
              ` : `<p>${exp.description}</p>`}
            </div>
            ` : ''}
          </div>
          `;
        }).join('')}
      </section>
      ` : ''}

      ${cv.education.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Education</h2>
          <div class="entry">
            <h3 class="entry-title">${cv.education[0].degree}</h3>
            <p class="entry-company">${cv.education[0].institution}</p>
            <div class="entry-meta">
              <span class="meta-item">
                <span class="meta-icon">&#128197;</span>
                ${cv.education[0].year}
              </span>
              ${cv.education[0].location ? `
              <span class="meta-item">
                <span class="meta-icon">&#128205;</span>
                ${cv.education[0].location}
              </span>
              ` : ''}
            </div>
          </div>
        </div>
        ${cv.education.slice(1).map(edu => `
        <div class="entry">
          <h3 class="entry-title">${edu.degree}</h3>
          <p class="entry-company">${edu.institution}</p>
          <div class="entry-meta">
            <span class="meta-item">
              <span class="meta-icon">&#128197;</span>
              ${edu.year}
            </span>
            ${edu.location ? `
            <span class="meta-item">
              <span class="meta-icon">&#128205;</span>
              ${edu.location}
            </span>
            ` : ''}
          </div>
        </div>
        `).join('')}
      </section>
      ` : ''}
    </div>

    ${hasRightContent ? `
    <!-- Right Column -->
    <div class="right-column">
      ${cv.skills.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Skills</h2>
          <ul class="skills-list">
            ${cv.skills.slice(0, 3).map(skill => `<li class="skill-tag">${skill}</li>`).join('')}
          </ul>
        </div>
        ${cv.skills.length > 3 ? `
        <ul class="skills-list" style="margin-top: 6px;">
          ${cv.skills.slice(3).map(skill => `<li class="skill-tag">${skill}</li>`).join('')}
        </ul>
        ` : ''}
      </section>
      ` : ''}

      ${cv.languages.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Languages</h2>
          <div class="language-item">
            <span class="language-name">${cv.languages[0].language}</span>
            <span class="language-level">${cv.languages[0].proficiency}</span>
          </div>
        </div>
        ${cv.languages.slice(1).map(lang => `
        <div class="language-item">
          <span class="language-name">${lang.language}</span>
          <span class="language-level">${lang.proficiency}</span>
        </div>
        `).join('')}
      </section>
      ` : ''}

      ${cv.certifications.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Certifications</h2>
          <div class="cert-item">
            <p class="cert-name">${cv.certifications[0].name}</p>
            <p class="cert-meta">${cv.certifications[0].issuer} (${cv.certifications[0].year})</p>
          </div>
        </div>
        ${cv.certifications.slice(1).map(cert => `
        <div class="cert-item">
          <p class="cert-name">${cert.name}</p>
          <p class="cert-meta">${cert.issuer} (${cert.year})</p>
        </div>
        `).join('')}
      </section>
      ` : ''}

      ${cv.projects.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Projects</h2>
          <div class="project-item">
            <p class="project-name">${cv.projects[0].name}</p>
            ${cv.projects[0].description ? `<p class="project-desc">${cv.projects[0].description}</p>` : ''}
            ${cv.projects[0].link ? `<a href="${cv.projects[0].link}" class="project-link">${cv.projects[0].link}</a>` : ''}
          </div>
        </div>
        ${cv.projects.slice(1).map(proj => `
        <div class="project-item">
          <p class="project-name">${proj.name}</p>
          ${proj.description ? `<p class="project-desc">${proj.description}</p>` : ''}
          ${proj.link ? `<a href="${proj.link}" class="project-link">${proj.link}</a>` : ''}
        </div>
        `).join('')}
      </section>
      ` : ''}

      ${cv.publications.length > 0 ? `
      <section class="section">
        <div class="section-header-group">
          <h2 class="section-title">Publications</h2>
          <div class="pub-item">
            <p class="pub-title">${cv.publications[0].title}</p>
            <p class="pub-venue">${cv.publications[0].venue}</p>
            ${cv.publications[0].link ? `<a href="${cv.publications[0].link}" class="project-link">${cv.publications[0].link}</a>` : ''}
          </div>
        </div>
        ${cv.publications.slice(1).map(pub => `
        <div class="pub-item">
          <p class="pub-title">${pub.title}</p>
          <p class="pub-venue">${pub.venue}</p>
          ${pub.link ? `<a href="${pub.link}" class="project-link">${pub.link}</a>` : ''}
        </div>
        `).join('')}
      </section>
      ` : ''}
    </div>
    ` : ''}
  </div>

  <!-- Footer -->
  <footer class="footer">
    <span>Last updated: ${formatDate(cv.lastUpdated)}</span>
    <span class="footer-brand">Generated via <strong>SeaVitae</strong></span>
  </footer>
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

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Check if print is available
 */
export function isPrintAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.print === "function";
}
