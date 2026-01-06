"use client";

import Link from "next/link";
import { useState } from "react";
import { EmployerProfile } from "@/lib/employerVerification";
import EmployerBadge from "@/components/EmployerBadge";
import ReportButton from "@/components/ReportButton";
import { trackEvent } from "@/lib/analytics";

interface InterviewRequest {
  id: string;
  employer: EmployerProfile;
  type: "virtual" | "physical";
  platform?: string;
  location?: string;
  proposedDate: string;
  proposedTime: string;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

// Mock interview requests - in production this would come from a database
const mockRequests: InterviewRequest[] = [
  {
    id: "req-1",
    employer: {
      id: "emp-1",
      type: "company",
      name: "John Smith",
      city: "San Francisco",
      companyName: "TechCorp Inc.",
      industry: "Technology",
      companySize: "51-200",
      website: "https://techcorp.example.com",
      contactPersonName: "John Smith",
      contactPersonRole: "HR Manager",
      emailVerified: true,
      detailsCompleted: true,
      createdAt: new Date("2024-01-15"),
    },
    type: "virtual",
    platform: "Zoom",
    proposedDate: "2025-01-15",
    proposedTime: "14:00",
    message:
      "We were impressed by your ML experience. Would love to discuss a Senior ML Engineer role.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-2",
    employer: {
      id: "emp-2",
      type: "individual",
      name: "Sarah Johnson",
      city: "Austin",
      profession: "Startup Founder",
      linkedIn: "https://linkedin.com/in/sarahjohnson",
      hiringReason: "startup",
      emailVerified: true,
      detailsCompleted: true,
      createdAt: new Date("2024-06-01"),
    },
    type: "physical",
    location: "123 Main St, Austin, TX",
    proposedDate: "2025-01-20",
    proposedTime: "10:00",
    message: "Building an AI startup and looking for technical co-founders.",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-3",
    employer: {
      id: "emp-3",
      type: "company",
      name: "Mike Wilson",
      city: "New York",
      companyName: "DataFlow Analytics",
      industry: "Data Analytics",
      createdAt: new Date("2024-09-01"),
    },
    type: "virtual",
    platform: "Google Meet",
    proposedDate: "2025-01-18",
    proposedTime: "11:00",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export default function JobseekerInterviewsPage() {
  const [requests, setRequests] = useState<InterviewRequest[]>(mockRequests);

  function handleAccept(id: string) {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "accepted" } : req))
    );

    trackEvent("interview_accepted", {
      userRole: "jobseeker",
    });
  }

  function handleDecline(id: string) {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "declined" } : req))
    );

    trackEvent("interview_declined", {
      userRole: "jobseeker",
    });
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const respondedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <main>
      <header>
        <h1>Interview Requests</h1>
        <p>Review and respond to interview requests from employers.</p>
      </header>

      <section aria-label="Pending Requests">
        <h2>Pending Requests ({pendingRequests.length})</h2>

        {pendingRequests.length === 0 ? (
          <p>No pending interview requests.</p>
        ) : (
          <div>
            {pendingRequests.map((request) => (
              <article key={request.id}>
                <EmployerBadge employer={request.employer} showDetails />

                <section>
                  <h3>Interview Details</h3>

                  <dl>
                    <dt>Type</dt>
                    <dd>
                      {request.type === "virtual"
                        ? `Virtual (${request.platform})`
                        : "Physical"}
                    </dd>

                    {request.location && (
                      <>
                        <dt>Location</dt>
                        <dd>{request.location}</dd>
                      </>
                    )}

                    <dt>Proposed Date</dt>
                    <dd>{request.proposedDate}</dd>

                    <dt>Proposed Time</dt>
                    <dd>{request.proposedTime}</dd>
                  </dl>

                  {request.message && (
                    <div>
                      <h4>Message from Employer</h4>
                      <p>{request.message}</p>
                    </div>
                  )}

                  <p>
                    <small>
                      Received{" "}
                      {Math.floor(
                        (Date.now() - request.createdAt.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days ago
                    </small>
                  </p>
                </section>

                <footer>
                  <button type="button" onClick={() => handleAccept(request.id)}>
                    Accept Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(request.id)}
                  >
                    Decline
                  </button>
                  <ReportButton
                    targetType="employer_profile"
                    targetId={request.employer.id}
                    targetName={
                      request.employer.type === "company"
                        ? request.employer.companyName || request.employer.name
                        : request.employer.name
                    }
                  />
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {respondedRequests.length > 0 && (
        <section aria-label="Responded Requests">
          <h2>Previous Responses</h2>

          <div>
            {respondedRequests.map((request) => (
              <article key={request.id}>
                <header>
                  <p>
                    <strong>
                      {request.employer.type === "company"
                        ? request.employer.companyName
                        : request.employer.name}
                    </strong>
                  </p>
                  <p>
                    Status:{" "}
                    {request.status === "accepted" ? "Accepted" : "Declined"}
                  </p>
                </header>

                {request.status === "accepted" && (
                  <p>
                    <small>
                      Your contact information has been shared with this
                      employer.
                    </small>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <aside aria-label="Privacy Notice">
        <h2>Privacy Information</h2>
        <p>
          Your email address and phone number are only shared with employers
          after you accept an interview request.
        </p>
      </aside>

      <div>
        <Link href="/jobseeker/dashboard">Back to Dashboard</Link>
      </div>
    </main>
  );
}
