"use client";

import CVDocument from "@/components/CVDocument";
import type { CVData } from "@/lib/pdfGenerator";

/**
 * A realistic sample CV rendered with the real document generator, so the
 * landing page shows exactly what a user will download.
 */
const SAMPLE_CV: CVData = {
  fullName: "Adaeze Okafor",
  email: "adaeze.okafor@email.com",
  phone: "+234-8012345678",
  linkedin: "linkedin.com/in/adaezeokafor",
  city: "Lagos, Nigeria",
  preferredRole: "Product Manager",
  bio: "Product Manager with 6 years of experience leading cross-functional teams to ship customer-focused fintech products. Proven record of growing active users, reducing churn, and turning research into roadmaps that deliver measurable business results.",
  skills: [
    "Product Strategy",
    "User Research",
    "Agile Delivery",
    "Data Analysis",
    "Stakeholder Management",
  ],
  experience: [
    {
      title: "Senior Product Manager",
      company: "PayBridge Technologies",
      location: "Lagos, Nigeria",
      startDate: "2022-03",
      endDate: "",
      description:
        "Led the launch of a merchant payments product that grew to 40,000 active businesses in 12 months\nReduced onboarding drop-off by 35% by redesigning KYC flow with the design and compliance teams\nOwned a roadmap across 3 squads and shipped 20+ releases on a two-week cadence",
    },
    {
      title: "Product Manager",
      company: "Kudi Microfinance Bank",
      location: "Abuja, Nigeria",
      startDate: "2019-06",
      endDate: "2022-02",
      description:
        "Launched a savings product that reached 15,000 customers and increased deposits by 28%\nIntroduced weekly customer interviews that cut support tickets by 22%",
    },
  ],
  education: [
    {
      degree: "B.Sc. Computer Science",
      institution: "University of Lagos",
      location: "Lagos, Nigeria",
      year: 2018,
    },
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Igbo", proficiency: "Fluent" },
  ],
  certifications: [
    { name: "Certified Scrum Product Owner", issuer: "Scrum Alliance", year: 2021 },
  ],
  projects: [],
  publications: [],
  lastUpdated: new Date("2026-01-01"),
};

export default function SampleCVPreview() {
  return <CVDocument cv={SAMPLE_CV} isStatic />;
}
