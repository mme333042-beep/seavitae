import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Page shell for auth screens (login, signup, password reset, email confirm).
 * Gives them the same header/footer as the marketing site and a narrow,
 * centered column so the form card is not left-aligned in a wide page.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="auth-main">{children}</main>
      <SiteFooter />
    </>
  );
}
