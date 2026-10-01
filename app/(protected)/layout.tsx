import { requireSession } from "@/lib/auth/requireSession";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return children;
}
