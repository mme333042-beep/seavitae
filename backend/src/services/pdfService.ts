/**
 * SeaVitae PDF Service
 * Generates PDF versions of CVs for jobseekers to download
 * Note: Only jobseekers can download their own CV
 */

import PDFDocument from "pdfkit";


interface ExperienceData {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
}

interface EducationData {
  degree: string;
  institution: string;
  location: string;
  graduationYear: number;
}

interface LanguageData {
  name: string;
  proficiency: string;
}

interface CertificationData {
  name: string;
  issuer: string;
  year: number;
}

interface ProjectData {
  name: string;
  description: string;
  link: string | null;
}

interface PublicationData {
  title: string;
  venue: string;
  link: string | null;
}

interface CVData {
  fullName: string;
  city: string;
  preferredRole: string;
  bio: string;
  skills: string[];
  experiences: ExperienceData[];
  education: EducationData[];
  languages: LanguageData[];
  certifications: CertificationData[];
  projects: ProjectData[];
  publications: PublicationData[];
}

// Colors
const NAVY = "#000435";
const OCEAN = "#31439B";
const MUTED = "#666666";
const BORDER = "#d1d5db";

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Generate PDF buffer from CV data
 */
export function generateCVPDF(data: CVData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `${data.fullName} - CV`,
        Author: "SeaVitae",
        Subject: "Curriculum Vitae",
      },
    });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).fillColor(NAVY).text(data.fullName, { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor(OCEAN).text(data.preferredRole);
    doc.fontSize(10).fillColor(MUTED).text(data.city);
    doc.moveDown(0.5);

    // Divider
    doc
      .strokeColor(BORDER)
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Professional Summary
    addSection(doc, "Professional Summary");
    doc.fontSize(10).fillColor("#171717").text(data.bio, {
      align: "justify",
      lineGap: 2,
    });
    doc.moveDown(0.8);

    // Skills
    if (data.skills.length > 0) {
      addSection(doc, "Skills");
      doc.fontSize(10).fillColor("#171717").text(data.skills.join(" • "), {
        lineGap: 2,
      });
      doc.moveDown(0.8);
    }

    // Experience
    if (data.experiences.length > 0) {
      addSection(doc, "Experience");
      data.experiences.forEach((exp, index) => {
        if (index > 0) doc.moveDown(0.5);

        doc.fontSize(11).fillColor(NAVY).text(exp.title, { continued: true });
        doc.fontSize(10).fillColor(MUTED).text(
          `  ${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : "Present"}`
        );
        doc.fontSize(10).fillColor(OCEAN).text(exp.company);
        doc.fontSize(9).fillColor(MUTED).text(exp.location);
        doc.moveDown(0.2);
        doc.fontSize(10).fillColor("#171717").text(exp.description, {
          align: "justify",
          lineGap: 2,
        });
      });
      doc.moveDown(0.8);
    }

    // Education
    if (data.education.length > 0) {
      addSection(doc, "Education");
      data.education.forEach((edu, index) => {
        if (index > 0) doc.moveDown(0.3);

        doc.fontSize(11).fillColor(NAVY).text(edu.degree, { continued: true });
        doc.fontSize(10).fillColor(MUTED).text(`  ${edu.graduationYear}`);
        doc.fontSize(10).fillColor(OCEAN).text(edu.institution);
        doc.fontSize(9).fillColor(MUTED).text(edu.location);
      });
      doc.moveDown(0.8);
    }

    // Languages
    if (data.languages.length > 0) {
      addSection(doc, "Languages");
      const langText = data.languages
        .map((l) => `${l.name} (${l.proficiency})`)
        .join(" • ");
      doc.fontSize(10).fillColor("#171717").text(langText);
      doc.moveDown(0.8);
    }

    // Certifications
    if (data.certifications.length > 0) {
      addSection(doc, "Certifications");
      data.certifications.forEach((cert, index) => {
        if (index > 0) doc.moveDown(0.2);
        doc.fontSize(10).fillColor(NAVY).text(cert.name, { continued: true });
        doc.fillColor(MUTED).text(` - ${cert.issuer} (${cert.year})`);
      });
      doc.moveDown(0.8);
    }

    // Projects
    if (data.projects.length > 0) {
      addSection(doc, "Projects");
      data.projects.forEach((proj, index) => {
        if (index > 0) doc.moveDown(0.3);
        doc.fontSize(11).fillColor(NAVY).text(proj.name);
        doc.fontSize(10).fillColor("#171717").text(proj.description, {
          lineGap: 2,
        });
        if (proj.link) {
          doc.fontSize(9).fillColor(OCEAN).text(proj.link, {
            link: proj.link,
          });
        }
      });
      doc.moveDown(0.8);
    }

    // Publications
    if (data.publications.length > 0) {
      addSection(doc, "Publications");
      data.publications.forEach((pub, index) => {
        if (index > 0) doc.moveDown(0.2);
        doc.fontSize(10).fillColor(NAVY).text(pub.title, { continued: true });
        doc.fillColor(MUTED).text(` - ${pub.venue}`);
        if (pub.link) {
          doc.fontSize(9).fillColor(OCEAN).text(pub.link, {
            link: pub.link,
          });
        }
      });
    }

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(8).fillColor(MUTED);
    doc.text(
      "Generated by SeaVitae - A sea of careers, searchable.",
      50,
      pageHeight - 30,
      { align: "center" }
    );

    doc.end();
  });
}

/**
 * Add section header
 */
function addSection(doc: PDFKit.PDFDocument, title: string): void {
  doc.fontSize(12).fillColor(OCEAN).text(title.toUpperCase(), {
    characterSpacing: 1,
  });
  doc.moveDown(0.3);
}

/**
 * Create a readable stream for PDF (for streaming response)
 */
export function createCVPDFStream(data: CVData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `${data.fullName} - CV`,
      Author: "SeaVitae",
    },
  });

  // Build PDF content (same as above but without Promise wrapper)
  // ... implementation would be similar

  return doc;
}
