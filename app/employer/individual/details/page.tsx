"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function IndividualDetailsPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/employer/dashboard");
  }

  return (
    <main>
      <section>
        <h1>Individual Details</h1>

        <p>
          Provide your personal details for verification purposes. This
          information helps maintain trust and professionalism on SeaVitae.
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Personal Information</legend>

            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="idNumber">Identification Number</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                placeholder="Enter national ID or passport number"
              />
            </div>

            <div>
              <label htmlFor="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="profession"
                placeholder="e.g. Consultant, Business Owner"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Information</legend>

            <div>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label htmlFor="linkedIn">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedIn"
                name="linkedIn"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Hiring Purpose</legend>

            <div>
              <label htmlFor="hiringReason">Why are you hiring?</label>
              <select id="hiringReason" name="hiringReason">
                <option value="">Select reason</option>
                <option value="personal-project">Personal project</option>
                <option value="freelance-work">Freelance work</option>
                <option value="startup">Starting a business</option>
                <option value="household">Household staff</option>
                <option value="other">Other</option>
              </select>
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
