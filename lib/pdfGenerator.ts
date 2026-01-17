/**
 * PDF Generator for CV Downloads
 * Uses html2pdf.js for direct PDF download to user's device
 */

export interface CVData {
  fullName: string;
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
 * Generate printable HTML for CV
 */
export function generatePrintableCV(cv: CVData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      font-size: 11pt;
      line-height: 1.5;
      color: #171717;
      background: white;
      padding: 40px 50px;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      font-size: 24pt;
      color: #000435;
      margin-bottom: 4px;
      font-weight: 600;
    }

    h2 {
      font-size: 12pt;
      color: #000435;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #31439B;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    h3 {
      font-size: 11pt;
      color: #000435;
      margin-bottom: 2px;
      font-weight: 600;
    }

    .header {
      margin-bottom: 20px;
    }

    .header-meta {
      color: #666;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    .header-role {
      font-size: 13pt;
      color: #31439B;
      font-weight: 500;
    }

    .section {
      margin-bottom: 16px;
    }

    .entry {
      margin-bottom: 12px;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }

    .entry-meta {
      color: #666;
      font-size: 10pt;
    }

    .entry-description {
      margin-top: 4px;
      color: #333;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      list-style: none;
    }

    .skill-tag {
      background: #f0f0f0;
      padding: 2px 10px;
      border-radius: 3px;
      font-size: 10pt;
    }

    .languages-list,
    .certifications-list {
      list-style: none;
    }

    .languages-list li,
    .certifications-list li {
      margin-bottom: 4px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #888;
      font-size: 9pt;
    }

    .summary {
      color: #333;
      line-height: 1.6;
    }

    a {
      color: #31439B;
      text-decoration: none;
    }

    @media print {
      body {
        padding: 20px 30px;
      }

      .section {
        page-break-inside: avoid;
      }

      h2 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${cv.fullName}</h1>
    <p class="header-meta">${cv.city}</p>
    <p class="header-role">${cv.preferredRole}</p>
  </header>

  ${cv.bio ? `
  <section class="section">
    <h2>Professional Summary</h2>
    <p class="summary">${cv.bio}</p>
  </section>
  ` : ""}

  ${cv.experience.length > 0 ? `
  <section class="section">
    <h2>Experience</h2>
    ${cv.experience.map(exp => `
    <div class="entry">
      <div class="entry-header">
        <h3>${exp.title}</h3>
        <span class="entry-meta">${exp.startDate} - ${exp.endDate || "Present"}</span>
      </div>
      <p class="entry-meta">${exp.company}${exp.location ? `, ${exp.location}` : ""}</p>
      ${exp.description ? `<p class="entry-description">${exp.description}</p>` : ""}
    </div>
    `).join("")}
  </section>
  ` : ""}

  ${cv.skills.length > 0 ? `
  <section class="section">
    <h2>Skills</h2>
    <ul class="skills-list">
      ${cv.skills.map(skill => `<li class="skill-tag">${skill}</li>`).join("")}
    </ul>
  </section>
  ` : ""}

  ${cv.education.length > 0 ? `
  <section class="section">
    <h2>Education</h2>
    ${cv.education.map(edu => `
    <div class="entry">
      <div class="entry-header">
        <h3>${edu.degree}</h3>
        <span class="entry-meta">${edu.year}</span>
      </div>
      <p class="entry-meta">${edu.institution}${edu.location ? `, ${edu.location}` : ""}</p>
    </div>
    `).join("")}
  </section>
  ` : ""}

  ${cv.languages.length > 0 ? `
  <section class="section">
    <h2>Languages</h2>
    <ul class="languages-list">
      ${cv.languages.map(lang => `<li><strong>${lang.language}</strong> - ${lang.proficiency}</li>`).join("")}
    </ul>
  </section>
  ` : ""}

  ${cv.certifications.length > 0 ? `
  <section class="section">
    <h2>Certifications</h2>
    <ul class="certifications-list">
      ${cv.certifications.map(cert => `<li><strong>${cert.name}</strong> - ${cert.issuer} (${cert.year})</li>`).join("")}
    </ul>
  </section>
  ` : ""}

  ${cv.projects.length > 0 ? `
  <section class="section">
    <h2>Projects</h2>
    ${cv.projects.map(proj => `
    <div class="entry">
      <h3>${proj.name}</h3>
      <p class="entry-description">${proj.description}</p>
      ${proj.link ? `<p><a href="${proj.link}" target="_blank">${proj.link}</a></p>` : ""}
    </div>
    `).join("")}
  </section>
  ` : ""}

  ${cv.publications.length > 0 ? `
  <section class="section">
    <h2>Publications</h2>
    ${cv.publications.map(pub => `
    <div class="entry">
      <h3>${pub.title}</h3>
      <p class="entry-meta">${pub.venue}</p>
      ${pub.link ? `<p><a href="${pub.link}" target="_blank">${pub.link}</a></p>` : ""}
    </div>
    `).join("")}
  </section>
  ` : ""}

  <footer class="footer">
    <p>Last updated: ${formatDate(cv.lastUpdated)}</p>
    <p>Generated via SeaVitae - A sea of careers, searchable.</p>
  </footer>
</body>
</html>
  `.trim();
}

/**
 * Download CV as PDF directly to user's device
 */
export async function downloadCVAsPDF(cv: CVData): Promise<void> {
  const htmlContent = generatePrintableCV(cv);
  const filename = generateCVFilename(cv.fullName);

  // Extract styles from the HTML
  const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? styleMatch[1] : "";

  // Extract body content from the HTML
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : "";

  // Create a hidden container for PDF generation
  const container = document.createElement("div");
  container.id = "cv-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";

  // Add scoped style element
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    #cv-pdf-container .cv-content * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    #cv-pdf-container .cv-content {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #171717;
      background: white;
      padding: 40px 50px;
      max-width: 800px;
    }
    #cv-pdf-container .cv-content h1 {
      font-size: 24pt;
      color: #000435;
      margin-bottom: 4px;
      font-weight: 600;
    }
    #cv-pdf-container .cv-content h2 {
      font-size: 12pt;
      color: #000435;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #31439B;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    #cv-pdf-container .cv-content h3 {
      font-size: 11pt;
      color: #000435;
      margin-bottom: 2px;
      font-weight: 600;
    }
    #cv-pdf-container .cv-content .header {
      margin-bottom: 20px;
    }
    #cv-pdf-container .cv-content .header-meta {
      color: #666;
      font-size: 10pt;
      margin-bottom: 4px;
    }
    #cv-pdf-container .cv-content .header-role {
      font-size: 13pt;
      color: #31439B;
      font-weight: 500;
    }
    #cv-pdf-container .cv-content .section {
      margin-bottom: 16px;
    }
    #cv-pdf-container .cv-content .entry {
      margin-bottom: 12px;
    }
    #cv-pdf-container .cv-content .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }
    #cv-pdf-container .cv-content .entry-meta {
      color: #666;
      font-size: 10pt;
    }
    #cv-pdf-container .cv-content .entry-description {
      margin-top: 4px;
      color: #333;
    }
    #cv-pdf-container .cv-content .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      list-style: none;
    }
    #cv-pdf-container .cv-content .skill-tag {
      background: #f0f0f0;
      padding: 2px 10px;
      border-radius: 3px;
      font-size: 10pt;
    }
    #cv-pdf-container .cv-content .languages-list,
    #cv-pdf-container .cv-content .certifications-list {
      list-style: none;
    }
    #cv-pdf-container .cv-content .languages-list li,
    #cv-pdf-container .cv-content .certifications-list li {
      margin-bottom: 4px;
    }
    #cv-pdf-container .cv-content .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #888;
      font-size: 9pt;
    }
    #cv-pdf-container .cv-content .summary {
      color: #333;
      line-height: 1.6;
    }
    #cv-pdf-container .cv-content a {
      color: #31439B;
      text-decoration: none;
    }
  `;
  document.head.appendChild(styleElement);

  // Create content wrapper with the CV content
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "cv-content";
  contentWrapper.innerHTML = bodyContent;
  container.appendChild(contentWrapper);

  // Append to document body so styles are applied
  document.body.appendChild(container);

  // Configure html2pdf options for high-quality output
  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    // Dynamically import html2pdf.js to avoid SSR issues
    const html2pdf = (await import("html2pdf.js")).default;
    // Generate and download PDF directly
    await html2pdf().set(options).from(contentWrapper).save();
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Clean up: remove container and style element
    document.body.removeChild(container);
    document.head.removeChild(styleElement);
  }
}

/**
 * Check if PDF download is available
 */
export function isPrintAvailable(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
