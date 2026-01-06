import Link from "next/link";

export default function JobseekerPage() {
  return (
    <main>
      <section>
        <h1>Be Discovered on SeaVitae</h1>

        <p>
          Create a CV profile and become searchable by employers looking for
          talent like you.
        </p>

        <p>
          Add your skills, experience, desired roles, and preferred location.
          Employers will find you based on what you offer and what you are
          looking for.
        </p>

        <p>
          Your age is collected for demographic purposes but is never displayed
          publicly on your profile.
        </p>

        <div>
          <Link href="/jobseeker/create-profile">Create CV Profile</Link>
        </div>
      </section>
    </main>
  );
}
