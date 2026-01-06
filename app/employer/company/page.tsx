import Link from "next/link";

export default function EmployerCompanyPage() {
  return (
    <main>
      <section>
        <h1>Hiring as a Company</h1>

        <p>
          You have selected to hire on behalf of a company or organization.
          Next, you will create an employer account and provide verification
          details.
        </p>

        <div>
          <Link href="/employer/company/create-account">
            Continue to Account Creation
          </Link>
        </div>
      </section>
    </main>
  );
}
