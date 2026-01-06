"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function CreateProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    trackEvent("cv_created", {
      userRole: "jobseeker",
    });

    setTimeout(() => {
      router.push("/jobseeker/dashboard");
    }, 500);
  }

  return (
    <main>
      {/* Header */}
      <header>
        <h1>Create Your CV Profile</h1>
        <p>Build your professional profile. Employers will find you based on this information.</p>
      </header>

      {/* Quick Guide */}
      <aside className="quick-guide">
        <h2>What makes a strong profile</h2>
        <ul>
          <li>Complete all sections for better visibility</li>
          <li>Use specific skills and keywords</li>
          <li>Keep your bio clear and professional</li>
          <li>Update regularly to stay at the top of search results</li>
        </ul>
      </aside>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section>
          <h2>Basic Information</h2>
          <p>Required fields for your profile.</p>

          <fieldset>
            <div>
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="San Francisco"
                required
              />
            </div>

            <div>
              <label htmlFor="preferredRole">Preferred Job Role *</label>
              <input
                type="text"
                id="preferredRole"
                name="preferredRole"
                placeholder="Senior Machine Learning Engineer"
                required
              />
            </div>
          </fieldset>
        </section>

        {/* Professional Summary */}
        <section>
          <h2>Professional Summary</h2>
          <p>A brief overview of your experience and expertise.</p>

          <fieldset>
            <div>
              <label htmlFor="summary">Bio</label>
              <textarea
                id="summary"
                name="summary"
                rows={5}
                placeholder="Describe your professional background, key achievements, and what you're looking for."
              />
            </div>
          </fieldset>
        </section>

        {/* Experience */}
        <section>
          <h2>Experience</h2>
          <p>Add your work history. Start with your most recent role.</p>

          <fieldset>
            <div className="form-row">
              <div>
                <label htmlFor="experienceTitle1">Job Title</label>
                <input
                  type="text"
                  id="experienceTitle1"
                  name="experienceTitle1"
                  placeholder="Senior Machine Learning Engineer"
                />
              </div>

              <div>
                <label htmlFor="experienceCompany1">Company</label>
                <input
                  type="text"
                  id="experienceCompany1"
                  name="experienceCompany1"
                  placeholder="TechCorp Inc."
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label htmlFor="experienceLocation1">Location</label>
                <input
                  type="text"
                  id="experienceLocation1"
                  name="experienceLocation1"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <label htmlFor="experienceStart1">Start Date</label>
                <input type="month" id="experienceStart1" name="experienceStart1" />
              </div>

              <div>
                <label htmlFor="experienceEnd1">End Date</label>
                <input type="month" id="experienceEnd1" name="experienceEnd1" />
              </div>
            </div>

            <div>
              <label htmlFor="experienceDescription1">Description</label>
              <textarea
                id="experienceDescription1"
                name="experienceDescription1"
                rows={3}
                placeholder="Key responsibilities and achievements"
              />
            </div>
          </fieldset>
        </section>

        {/* Skills */}
        <section>
          <h2>Skills</h2>
          <p>List your technical and professional skills. Separate with commas.</p>

          <fieldset>
            <div>
              <label htmlFor="skills">Skills</label>
              <textarea
                id="skills"
                name="skills"
                rows={2}
                placeholder="Python, TensorFlow, Machine Learning, AWS, Docker"
              />
            </div>
          </fieldset>
        </section>

        {/* Education */}
        <section>
          <h2>Education</h2>
          <p>Add your educational background.</p>

          <fieldset>
            <div className="form-row">
              <div>
                <label htmlFor="educationDegree1">Degree</label>
                <input
                  type="text"
                  id="educationDegree1"
                  name="educationDegree1"
                  placeholder="Master of Science in Computer Science"
                />
              </div>

              <div>
                <label htmlFor="educationInstitution1">Institution</label>
                <input
                  type="text"
                  id="educationInstitution1"
                  name="educationInstitution1"
                  placeholder="Stanford University"
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label htmlFor="educationLocation1">Location</label>
                <input
                  type="text"
                  id="educationLocation1"
                  name="educationLocation1"
                  placeholder="Stanford, CA"
                />
              </div>

              <div>
                <label htmlFor="educationYear1">Graduation Year</label>
                <input
                  type="number"
                  id="educationYear1"
                  name="educationYear1"
                  placeholder="2018"
                  min="1950"
                  max="2030"
                />
              </div>
            </div>
          </fieldset>
        </section>

        {/* Languages */}
        <section>
          <h2>Languages</h2>
          <p>Languages you speak and your proficiency level.</p>

          <fieldset>
            <div className="form-row">
              <div>
                <label htmlFor="language1">Language</label>
                <input
                  type="text"
                  id="language1"
                  name="language1"
                  placeholder="English"
                />
              </div>

              <div>
                <label htmlFor="languageProficiency1">Proficiency</label>
                <select id="languageProficiency1" name="languageProficiency1">
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
        </section>

        {/* Certifications */}
        <section>
          <h2>Certifications</h2>
          <p>Professional certifications you hold.</p>

          <fieldset>
            <div className="form-row">
              <div>
                <label htmlFor="certificationName1">Certification</label>
                <input
                  type="text"
                  id="certificationName1"
                  name="certificationName1"
                  placeholder="AWS Certified Machine Learning"
                />
              </div>

              <div>
                <label htmlFor="certificationIssuer1">Issuer</label>
                <input
                  type="text"
                  id="certificationIssuer1"
                  name="certificationIssuer1"
                  placeholder="Amazon Web Services"
                />
              </div>

              <div>
                <label htmlFor="certificationYear1">Year</label>
                <input
                  type="number"
                  id="certificationYear1"
                  name="certificationYear1"
                  placeholder="2022"
                  min="1950"
                  max="2030"
                />
              </div>
            </div>
          </fieldset>
        </section>

        {/* Projects */}
        <section>
          <h2>Projects</h2>
          <p>Notable projects you have worked on.</p>

          <fieldset>
            <div>
              <label htmlFor="projectName1">Project Name</label>
              <input
                type="text"
                id="projectName1"
                name="projectName1"
                placeholder="AI-Powered Recommendation System"
              />
            </div>

            <div>
              <label htmlFor="projectDescription1">Description</label>
              <textarea
                id="projectDescription1"
                name="projectDescription1"
                rows={2}
                placeholder="Brief description of the project and your role"
              />
            </div>

            <div>
              <label htmlFor="projectLink1">Link (optional)</label>
              <input
                type="url"
                id="projectLink1"
                name="projectLink1"
                placeholder="https://github.com/username/project"
              />
            </div>
          </fieldset>
        </section>

        {/* Publications */}
        <section>
          <h2>Publications</h2>
          <p>Research papers or articles you have published.</p>

          <fieldset>
            <div className="form-row">
              <div>
                <label htmlFor="publicationTitle1">Title</label>
                <input
                  type="text"
                  id="publicationTitle1"
                  name="publicationTitle1"
                  placeholder="Scalable Deep Learning for Recommendations"
                />
              </div>

              <div>
                <label htmlFor="publicationVenue1">Venue</label>
                <input
                  type="text"
                  id="publicationVenue1"
                  name="publicationVenue1"
                  placeholder="NeurIPS 2023"
                />
              </div>
            </div>

            <div>
              <label htmlFor="publicationLink1">Link (optional)</label>
              <input
                type="url"
                id="publicationLink1"
                name="publicationLink1"
                placeholder="https://arxiv.org/abs/xxxx.xxxxx"
              />
            </div>
          </fieldset>
        </section>

        {/* Internal Information */}
        <section>
          <h2>Additional Information</h2>
          <p>This information is used for filtering only and is never displayed on your profile.</p>

          <fieldset>
            <div>
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                placeholder="30"
                min="16"
                max="100"
                required
              />
              <p><small>Used for age-based filtering by employers. Not shown publicly.</small></p>
            </div>
          </fieldset>
        </section>

        {/* Submit */}
        <section className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save CV Profile"}
          </button>
          <Link href="/jobseeker">Cancel</Link>
        </section>
      </form>
    </main>
  );
}
