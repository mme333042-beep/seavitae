export default function JobseekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inactivity handling is applied globally in the root layout.
  return <>{children}</>
}
