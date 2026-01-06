import Link from "next/link";

export default function EmployerPage() {
  return (
    <main>
      <section>
        <h1>Hiring on SeaVitae</h1>

        <p>How are you hiring on SeaVitae?</p>

        <ul>
          <li>
            <Link href="/employer/company">
              <strong>Company</strong>
            </Link>
            <p>You are hiring on behalf of an organization or business.</p>
          </li>
          <li>
            <Link href="/employer/individual">
              <strong>Individual</strong>
            </Link>
            <p>You are hiring independently, not representing a company.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
