"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function CompanyDetailsPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/employer/dashboard");
  }

  return (
    <main>
      <section>
        <h1>Company Details</h1>

        <p>
          Provide details about your company for verification purposes. This
          information helps maintain trust and professionalism on SeaVitae.
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Company Information</legend>

            <div>
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label htmlFor="registrationNumber">Registration Number</label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                placeholder="Enter business registration number"
              />
            </div>

            <div>
              <label htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                placeholder="e.g. Technology, Finance, Healthcare"
              />
            </div>

            <div>
              <label htmlFor="companySize">Company Size</label>
              <select id="companySize" name="companySize">
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
            </div>

            <div>
              <label htmlFor="website">Company Website</label>
              <input
                type="url"
                id="website"
                name="website"
                placeholder="https://example.com"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Information</legend>

            <div>
              <label htmlFor="contactName">Contact Person Name</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label htmlFor="contactRole">Contact Person Role</label>
              <input
                type="text"
                id="contactRole"
                name="contactRole"
                placeholder="e.g. HR Manager, Recruiter"
              />
            </div>

            <div>
              <label htmlFor="contactPhone">Phone Number</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="companyCity">City</label>
              <input
                type="text"
                id="companyCity"
                name="companyCity"
                placeholder="Enter city"
                required
              />
            </div>
          </fieldset>

          <div>
            <button type="submit">Continue to Employer Details</button>
          </div>
        </form>
      </section>
    </main>
  );
}
