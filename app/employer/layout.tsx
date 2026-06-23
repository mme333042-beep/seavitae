export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inactivity handling is applied globally in the root layout.
  return <>{children}</>
}
