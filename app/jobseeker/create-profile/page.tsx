"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { trackProfileCreationStarted, trackCVSaved, identifyUser } from "@/lib/posthog";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createJobseekerProfile, getMyJobseekerProfile, getMyCV, updateCVSection } from "@/lib/supabase/services/jobseekers";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { CVSectionType } from "@/lib/supabase/types";
import { enhanceCV } from "@/lib/cvEnhancer";

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean; // If true, endDate should be "Present"
  description: string;
}

interface FormValues {
  fullName: string;
  city: string;
  preferredRole: string;
  summary: string;
  skills: string;
  yearsExperience: number;
  age: number | null;
  countryCode: string;
  phoneNumber: string;
}

// Common country codes
const COUNTRY_CODES = [
  { code: "+234", country: "Nigeria" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+27", country: "South Africa" },
  { code: "+254", country: "Kenya" },
  { code: "+233", country: "Ghana" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+20", country: "Egypt" },
  { code: "+212", country: "Morocco" },
  { code: "+256", country: "Uganda" },
];

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: number;
}

interface LanguageEntry {
  id: string;
  name: string;
  proficiency: string;
}

interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [existingJobseekerId, setExistingJobseekerId] = useState<string | null>(null);
  const [existingCVId, setExistingCVId] = useState<string | null>(null);

  // Form values for basic info (to pre-populate when editing)
  const [formValues, setFormValues] = useState<FormValues>({
    fullName: "",
    city: "",
    preferredRole: "",
    summary: "",
    skills: "",
    yearsExperience: 0,
    age: null,
    countryCode: "+234",
    phoneNumber: "",
  });

  // Form state for sections
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { id: crypto.randomUUID(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" },
  ]);
  const [educations, setEducations] = useState<EducationEntry[]>([
    { id: crypto.randomUUID(), degree: "", institution: "", location: "", graduationYear: 0 },
  ]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([
    { id: crypto.randomUUID(), name: "", proficiency: "" },
  ]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([
    { id: crypto.randomUUID(), name: "", issuer: "", issueDate: "" },
  ]);
  const [projects, setProjects] = useState<ProjectEntry[]>([
    { id: crypto.randomUUID(), name: "", description: "", url: "" },
  ]);
  const [publications, setPublications] = useState<PublicationEntry[]>([
    { id: crypto.randomUUID(), title: "", publisher: "", url: "" },
  ]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/jobseeker/signup");
          return;
        }
        setUserId(user.id);
        setUserEmail(user.email || "");

        // Track profile creation started and identify user (PostHog funnel tracking)
        trackProfileCreationStarted();
        identifyUser(user.id, 'jobseeker');

        // Check if user already has a profile
        const profile = await getMyJobseekerProfile();
        if (profile) {
          setExistingJobseekerId(profile.id);

          // Parse phone number if exists (format: "+234-8087035953")
          let countryCode = "+234";
          let phoneNumber = "";
          if (profile.phone) {
            const phoneParts = profile.phone.split("-");
            if (phoneParts.length === 2) {
              countryCode = phoneParts[0];
              phoneNumber = phoneParts[1];
            }
          }

          // Pre-populate form with existing profile data
          setFormValues({
            fullName: profile.full_name || "",
            city: profile.city || "",
            preferredRole: profile.preferred_role || "",
            summary: profile.bio || "",
            skills: "",
            yearsExperience: profile.years_experience || 0,
            age: profile.age || null,
            countryCode,
            phoneNumber,
          });

          // Load CV data
          const cvData = await getMyCV();
          if (cvData && cvData.cv) {
            setExistingCVId(cvData.cv.id);

            // Check if editing is locked (when jobseeker is visible to employers)
            if (profile.is_visible) {
              setError("Your CV is locked while visible to employers. Turn off visibility from your dashboard to edit.");
            }

            // Load CV sections into form
            for (const section of cvData.sections) {
              const content = section.content as Record<string, unknown>;

              switch (section.section_type) {
                case "summary":
                  if (content && "text" in content) {
                    setFormValues(prev => ({ ...prev, summary: content.text as string || "" }));
                  }
                  break;
                case "skills":
                  if (content && "items" in content && Array.isArray(content.items)) {
                    const skillNames = content.items.map((s: { name?: string }) => s.name || "").filter(Boolean);
                    setFormValues(prev => ({ ...prev, skills: skillNames.join(", ") }));
                  }
                  break;
                case "experience":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setExperiences(content.items.map((exp: ExperienceEntry) => ({
                      id: exp.id || crypto.randomUUID(),
                      title: exp.title || "",
                      company: exp.company || "",
                      location: exp.location || "",
                      startDate: exp.startDate || "",
                      endDate: exp.current ? "" : (exp.endDate || ""),
                      current: exp.current || false,
                      description: exp.description || "",
                    })));
                  }
                  break;
                case "education":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setEducations(content.items.map((edu: EducationEntry) => ({
                      id: edu.id || crypto.randomUUID(),
                      degree: edu.degree || "",
                      institution: edu.institution || "",
                      location: edu.location || "",
                      graduationYear: edu.graduationYear || 0,
                    })));
                  }
                  break;
                case "languages":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setLanguages(content.items.map((lang: LanguageEntry) => ({
                      id: lang.id || crypto.randomUUID(),
                      name: lang.name || "",
                      proficiency: lang.proficiency || "",
                    })));
                  }
                  break;
                case "certifications":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setCertifications(content.items.map((cert: CertificationEntry) => ({
                      id: cert.id || crypto.randomUUID(),
                      name: cert.name || "",
                      issuer: cert.issuer || "",
                      issueDate: cert.issueDate || "",
                    })));
                  }
                  break;
                case "projects":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setProjects(content.items.map((proj: ProjectEntry) => ({
                      id: proj.id || crypto.randomUUID(),
                      name: proj.name || "",
                      description: proj.description || "",
                      url: proj.url || "",
                    })));
                  }
                  break;
                case "publications":
                  if (content && "items" in content && Array.isArray(content.items) && content.items.length > 0) {
                    setPublications(content.items.map((pub: PublicationEntry) => ({
                      id: pub.id || crypto.randomUUID(),
                      title: pub.title || "",
                      publisher: pub.publisher || "",
                      url: pub.url || "",
                    })));
                  }
                  break;
              }
            }
          }
        }

        setLoading(false);
      } catch (err) {
        // Handle AbortError silently (happens when component unmounts)
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error loading profile:", err);
        setError("Failed to load profile data. Please try again.");
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  function addExperience() {
    setExperiences([...experiences, { id: crypto.randomUUID(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
  }

  function addEducation() {
    setEducations([...educations, { id: crypto.randomUUID(), degree: "", institution: "", location: "", graduationYear: 0 }]);
  }

  function addLanguage() {
    setLanguages([...languages, { id: crypto.randomUUID(), name: "", proficiency: "" }]);
  }

  function addCertification() {
    setCertifications([...certifications, { id: crypto.randomUUID(), name: "", issuer: "", issueDate: "" }]);
  }

  function addProject() {
    setProjects([...projects, { id: crypto.randomUUID(), name: "", description: "", url: "" }]);
  }

  function addPublication() {
    setPublications([...publications, { id: crypto.randomUUID(), title: "", publisher: "", url: "" }]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Basic info
    const fullName = formData.get("fullName") as string;
    const city = formData.get("city") as string;
    const preferredRole = formData.get("preferredRole") as string;
    const bio = formData.get("summary") as string;
    const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0;
    const age = parseInt(formData.get("age") as string) || null;
    const skillsText = formData.get("skills") as string;
    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    // Format phone: "+234-8087035953"
    const phone = phoneNumber ? `${countryCode}-${phoneNumber.replace(/^0+/, '')}` : null;

    try {
      let jobseekerId = existingJobseekerId;
      let cvId = existingCVId;

      // Parse form data into CV sections first
      const experienceItems = experiences.map((exp, index) => ({
        id: exp.id,
        title: formData.get(`experienceTitle${exp.id}`) as string || "",
        company: formData.get(`experienceCompany${exp.id}`) as string || "",
        location: formData.get(`experienceLocation${exp.id}`) as string || "",
        startDate: formData.get(`experienceStart${exp.id}`) as string || "",
        endDate: formData.get(`experienceEnd${exp.id}`) as string || "",
        current: !(formData.get(`experienceEnd${exp.id}`) as string),
        description: formData.get(`experienceDescription${exp.id}`) as string || "",
      })).filter(e => e.title || e.company);

      const educationItems = educations.map((edu) => ({
        id: edu.id,
        degree: formData.get(`educationDegree${edu.id}`) as string || "",
        institution: formData.get(`educationInstitution${edu.id}`) as string || "",
        location: formData.get(`educationLocation${edu.id}`) as string || "",
        graduationYear: parseInt(formData.get(`educationYear${edu.id}`) as string) || 0,
      })).filter(e => e.degree || e.institution);

      const skillItems = skillsText.split(",").map(s => s.trim()).filter(s => s).map(name => ({
        id: crypto.randomUUID(),
        name,
      }));

      const languageItems = languages.map((lang) => ({
        id: lang.id,
        name: formData.get(`language${lang.id}`) as string || "",
        proficiency: formData.get(`languageProficiency${lang.id}`) as string || "",
      })).filter(l => l.name);

      const certificationItems = certifications.map((cert) => ({
        id: cert.id,
        name: formData.get(`certificationName${cert.id}`) as string || "",
        issuer: formData.get(`certificationIssuer${cert.id}`) as string || "",
        issueDate: formData.get(`certificationYear${cert.id}`) as string || "",
      })).filter(c => c.name);

      const projectItems = projects.map((proj) => ({
        id: proj.id,
        name: formData.get(`projectName${proj.id}`) as string || "",
        description: formData.get(`projectDescription${proj.id}`) as string || "",
        url: formData.get(`projectLink${proj.id}`) as string || "",
      })).filter(p => p.name);

      const publicationItems = publications.map((pub) => ({
        id: pub.id,
        title: formData.get(`publicationTitle${pub.id}`) as string || "",
        publisher: formData.get(`publicationVenue${pub.id}`) as string || "",
        url: formData.get(`publicationLink${pub.id}`) as string || "",
      })).filter(p => p.title);

      // Enhance CV data for ATS compatibility before saving
      const cvDataToEnhance = {
        fullName,
        email: userEmail,
        city,
        preferredRole,
        summary: bio,
        yearsExperience,
        experiences: experienceItems,
        educations: educationItems,
        skills: skillItems,
        languages: languageItems,
        certifications: certificationItems,
        projects: projectItems,
        publications: publicationItems,
      };

      const enhancedCV = enhanceCV(cvDataToEnhance);

      // Try AI enhancement for summary (with fallback to regex)
      let finalSummary = enhancedCV.summary;
      try {
        const aiResponse = await fetch('/api/enhance-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'summary',
            summary: bio, // Send original, let AI enhance from scratch
            preferredRole,
            yearsExperience,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.enhanced) {
            finalSummary = aiData.enhanced;
            console.log(`[CV Save] Summary enhanced via ${aiData.method}`);
          }
        }
      } catch (aiError) {
        // AI failed silently - use regex-enhanced version
        console.warn('[CV Save] AI enhancement failed, using regex fallback');
      }

      // Try AI enhancement for experience descriptions
      const enhancedExperiences = [...enhancedCV.experiences];
      for (let i = 0; i < enhancedExperiences.length; i++) {
        const exp = enhancedExperiences[i];
        if (exp.description && exp.description.length > 20) {
          try {
            const aiResponse = await fetch('/api/enhance-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'experience',
                description: exp.description,
                jobTitle: exp.title,
                company: exp.company,
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.enhanced && aiData.method === 'ai') {
                enhancedExperiences[i] = { ...exp, description: aiData.enhanced };
                console.log(`[CV Save] Experience ${i + 1} enhanced via AI`);
              }
            }
          } catch (aiError) {
            // AI failed silently - keep regex-enhanced version
            console.warn(`[CV Save] Experience ${i + 1} AI enhancement failed`);
          }
        }
      }

      // Create or update jobseeker profile with enhanced data
      if (!existingJobseekerId) {
        const result = await createJobseekerProfile(userId, {
          full_name: fullName,
          city: enhancedCV.city,
          preferred_role: preferredRole,
          bio: finalSummary,
          years_experience: yearsExperience,
          age,
          phone,
        });

        if (!result.success) {
          setError(result.error || "Failed to create profile");
          setSaving(false);
          return;
        }

        jobseekerId = result.jobseeker?.id || null;

        // Get the newly created CV
        const cvData = await getMyCV();
        cvId = cvData?.cv?.id || null;
      } else {
        // Update existing profile with enhanced data
        const supabase = getSupabaseClient();
        await supabase
          .from("jobseekers")
          .update({
            full_name: fullName,
            city: enhancedCV.city,
            preferred_role: preferredRole,
            bio: finalSummary,
            years_experience: yearsExperience,
            age,
            phone,
          })
          .eq("id", existingJobseekerId);
      }

      if (!cvId) {
        setError("Failed to create CV");
        setSaving(false);
        return;
      }

      // Save CV sections with enhanced data
      // Note: Email is NOT injected into summary - it would get mangled by text processing
      // Email display should be handled at the UI/PDF level, not in content storage
      const sectionsToSave: { type: CVSectionType; content: { items: unknown[] } | { text: string } }[] = [
        { type: "summary", content: { text: finalSummary } },
        { type: "experience", content: { items: enhancedExperiences } },
        { type: "education", content: { items: enhancedCV.educations } },
        { type: "skills", content: { items: enhancedCV.skills } },
        { type: "languages", content: { items: enhancedCV.languages } },
        { type: "certifications", content: { items: enhancedCV.certifications } },
        { type: "projects", content: { items: enhancedCV.projects } },
        { type: "publications", content: { items: enhancedCV.publications } },
      ];

      for (const section of sectionsToSave) {
        await updateCVSection(cvId, section.type, section.content);
      }

      trackEvent("cv_created", {
        userRole: "jobseeker",
      });

      // Track CV saved (PostHog funnel tracking)
      trackCVSaved();

      router.push("/jobseeker/dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <Link href="/jobseeker/dashboard" className="back-link">Back to Dashboard</Link>

      <header>
        <h1>{existingJobseekerId ? "Edit Your CV" : "Create Your CV"}</h1>
        <p>Build your professional CV. Employers will discover you based on this information.</p>
      </header>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section>
          <h2>Basic Information *</h2>

          <fieldset>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required defaultValue={formValues.fullName} />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input type="text" id="city" name="city" placeholder="Lagos" required defaultValue={formValues.city} />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                <select
                  id="countryCode"
                  name="countryCode"
                  defaultValue={formValues.countryCode}
                  style={{ width: "140px", flexShrink: 0 }}
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={code} value={code}>{code} ({country})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="8087035953"
                  defaultValue={formValues.phoneNumber}
                  style={{ flex: 1 }}
                />
              </div>
              <p className="form-help">Enter your number without the country code (e.g., 8087035953)</p>
            </div>

            <div className="form-group">
              <label htmlFor="preferredRole">Preferred Job Role *</label>
              <input type="text" id="preferredRole" name="preferredRole" placeholder="Software Engineer" required defaultValue={formValues.preferredRole} />
            </div>
          </fieldset>
        </section>

        {/* Professional Summary */}
        <section>
          <h2>Professional Summary *</h2>

          <fieldset>
            <div className="form-group">
              <label htmlFor="summary">Bio *</label>
              <textarea id="summary" name="summary" rows={4} placeholder="Describe your professional background, key achievements, and what you're looking for." required defaultValue={formValues.summary} />
            </div>
          </fieldset>
        </section>

        {/* Skills */}
        <section>
          <h2>Skills *</h2>

          <fieldset>
            <div className="form-group">
              <label htmlFor="skills">Skills *</label>
              <textarea id="skills" name="skills" rows={2} placeholder="JavaScript, React, Node.js, Python, SQL" required defaultValue={formValues.skills} />
              <p className="form-help">Separate skills with commas.</p>
            </div>
          </fieldset>
        </section>

        {/* Experience */}
        <section>
          <h2>Experience *</h2>

          {experiences.map((exp, index) => (
            <fieldset key={exp.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`experienceTitle${exp.id}`}>Job Title *</label>
                  <input type="text" id={`experienceTitle${exp.id}`} name={`experienceTitle${exp.id}`} placeholder="Software Engineer" required={index === 0} defaultValue={exp.title} />
                </div>
                <div className="form-group">
                  <label htmlFor={`experienceCompany${exp.id}`}>Company *</label>
                  <input type="text" id={`experienceCompany${exp.id}`} name={`experienceCompany${exp.id}`} placeholder="Company Name" required={index === 0} defaultValue={exp.company} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`experienceLocation${exp.id}`}>Location *</label>
                  <input type="text" id={`experienceLocation${exp.id}`} name={`experienceLocation${exp.id}`} placeholder="Lagos, Nigeria" required={index === 0} defaultValue={exp.location} />
                </div>
                <div className="form-group">
                  <label htmlFor={`experienceStart${exp.id}`}>Start Date *</label>
                  <input type="month" id={`experienceStart${exp.id}`} name={`experienceStart${exp.id}`} required={index === 0} defaultValue={exp.startDate} />
                </div>
                <div className="form-group">
                  <label htmlFor={`experienceEnd${exp.id}`}>End Date</label>
                  <input
                    type="month"
                    id={`experienceEnd${exp.id}`}
                    name={`experienceEnd${exp.id}`}
                    defaultValue={exp.endDate}
                    disabled={exp.current}
                  />
                  <label className="checkbox-label" style={{ marginTop: "var(--space-sm)", display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <input
                      type="checkbox"
                      name={`experienceCurrent${exp.id}`}
                      defaultChecked={exp.current}
                      onChange={(e) => {
                        setExperiences(prev => prev.map(item =>
                          item.id === exp.id ? { ...item, current: e.target.checked } : item
                        ));
                      }}
                      style={{ width: "auto" }}
                    />
                    <span>Present (Currently working here)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={`experienceDescription${exp.id}`}>Description *</label>
                <textarea id={`experienceDescription${exp.id}`} name={`experienceDescription${exp.id}`} rows={2} placeholder="Key responsibilities and achievements" required={index === 0} defaultValue={exp.description} />
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addExperience}>Add Experience</button>
        </section>

        {/* Education */}
        <section>
          <h2>Education *</h2>
          <p className="form-help">Primary-secondary school education is not required. Please add education from university/college level upward.</p>

          {educations.map((edu, index) => (
            <fieldset key={edu.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`educationDegree${edu.id}`}>Degree *</label>
                  <input type="text" id={`educationDegree${edu.id}`} name={`educationDegree${edu.id}`} placeholder="Master of Science in Computer Science" required={index === 0} />
                </div>
                <div className="form-group">
                  <label htmlFor={`educationInstitution${edu.id}`}>Institution *</label>
                  <input type="text" id={`educationInstitution${edu.id}`} name={`educationInstitution${edu.id}`} placeholder="Stanford University" required={index === 0} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`educationLocation${edu.id}`}>Location *</label>
                  <input type="text" id={`educationLocation${edu.id}`} name={`educationLocation${edu.id}`} placeholder="Stanford, CA" required={index === 0} />
                </div>
                <div className="form-group">
                  <label htmlFor={`educationYear${edu.id}`}>Graduation Year *</label>
                  <input type="number" id={`educationYear${edu.id}`} name={`educationYear${edu.id}`} placeholder="2018" min="1950" max="2030" required={index === 0} />
                </div>
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addEducation}>Add Education</button>
        </section>

        {/* Languages */}
        <section>
          <h2>Languages</h2>

          {languages.map((lang, index) => (
            <fieldset key={lang.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`language${lang.id}`}>Language</label>
                  <input type="text" id={`language${lang.id}`} name={`language${lang.id}`} placeholder="English" />
                </div>
                <div className="form-group">
                  <label htmlFor={`languageProficiency${lang.id}`}>Proficiency</label>
                  <select id={`languageProficiency${lang.id}`} name={`languageProficiency${lang.id}`}>
                    <option value="">Select</option>
                    <option value="native">Native</option>
                    <option value="fluent">Fluent</option>
                    <option value="advanced">Advanced</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="basic">Basic</option>
                  </select>
                </div>
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addLanguage}>Add Language</button>
        </section>

        {/* Certifications */}
        <section>
          <h2>Certifications</h2>

          {certifications.map((cert, index) => (
            <fieldset key={cert.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`certificationName${cert.id}`}>Certification</label>
                  <input type="text" id={`certificationName${cert.id}`} name={`certificationName${cert.id}`} placeholder="AWS Certified Machine Learning" />
                </div>
                <div className="form-group">
                  <label htmlFor={`certificationIssuer${cert.id}`}>Issuer</label>
                  <input type="text" id={`certificationIssuer${cert.id}`} name={`certificationIssuer${cert.id}`} placeholder="Amazon Web Services" />
                </div>
                <div className="form-group">
                  <label htmlFor={`certificationYear${cert.id}`}>Year</label>
                  <input type="number" id={`certificationYear${cert.id}`} name={`certificationYear${cert.id}`} placeholder="2022" min="1950" max="2030" />
                </div>
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addCertification}>Add Certification</button>
        </section>

        {/* Projects */}
        <section>
          <h2>Projects</h2>

          {projects.map((proj, index) => (
            <fieldset key={proj.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-group">
                <label htmlFor={`projectName${proj.id}`}>Project Name</label>
                <input type="text" id={`projectName${proj.id}`} name={`projectName${proj.id}`} placeholder="AI-Powered Recommendation System" />
              </div>
              <div className="form-group">
                <label htmlFor={`projectDescription${proj.id}`}>Description</label>
                <textarea id={`projectDescription${proj.id}`} name={`projectDescription${proj.id}`} rows={2} placeholder="Brief description of the project and your role" />
              </div>
              <div className="form-group">
                <label htmlFor={`projectLink${proj.id}`}>Link</label>
                <input type="url" id={`projectLink${proj.id}`} name={`projectLink${proj.id}`} placeholder="https://" />
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addProject}>Add Project</button>
        </section>

        {/* Publications */}
        <section>
          <h2>Publications</h2>

          {publications.map((pub, index) => (
            <fieldset key={pub.id} className="entry-fieldset">
              {index > 0 && <hr className="entry-divider" />}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`publicationTitle${pub.id}`}>Title</label>
                  <input type="text" id={`publicationTitle${pub.id}`} name={`publicationTitle${pub.id}`} placeholder="Scalable Deep Learning for Recommendations" />
                </div>
                <div className="form-group">
                  <label htmlFor={`publicationVenue${pub.id}`}>Venue</label>
                  <input type="text" id={`publicationVenue${pub.id}`} name={`publicationVenue${pub.id}`} placeholder="NeurIPS 2023" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor={`publicationLink${pub.id}`}>Link</label>
                <input type="url" id={`publicationLink${pub.id}`} name={`publicationLink${pub.id}`} placeholder="https://" />
              </div>
            </fieldset>
          ))}

          <button type="button" className="add-btn" onClick={addPublication}>Add Publication</button>
        </section>

        {/* Additional Information */}
        <section>
          <h2>Additional Information</h2>
          <p className="form-help">This information is used for filtering only and is never displayed on your CV.</p>

          <fieldset>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearsExperience">Years of Experience *</label>
                <input type="number" id="yearsExperience" name="yearsExperience" placeholder="5" min="0" max="50" required style={{ maxWidth: "120px" }} defaultValue={formValues.yearsExperience || ""} />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input type="number" id="age" name="age" placeholder="25" min="18" max="100" required style={{ maxWidth: "120px" }} defaultValue={formValues.age || ""} />
                <p className="form-help">Used for filtering only. Not visible to employers.</p>
              </div>
            </div>
          </fieldset>
        </section>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save CV"}</button>
          <Link href="/jobseeker/dashboard">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
