import Link from "next/link";

export default function EmployerIndividualPage() {
  return (
    <main>
      <section>
        <h1>Hiring as an Individual</h1>

        <p>
          You have selected to hire independently as an individual. Next, you
          will create an employer account and provide verification details.
        </p>

        <div>
          <Link href="/employer/individual/create-account">
            Continue to Account Creation
          </Link>
        </div>
      </section>
    </main>
  );
}
