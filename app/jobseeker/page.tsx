import { redirect } from "next/navigation";

/**
 * /jobseeker used to be an employer-discovery landing page. In the CV-only
 * MVP it simply forwards to account creation.
 */
export default function JobseekerPage() {
  redirect("/jobseeker/signup");
}
