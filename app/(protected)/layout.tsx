import { requirePermission } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("users:view");

  return children;
}
