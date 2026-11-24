import type { ReactNode } from "react";

import LoadingBoundary from "@/components/ui/loadingBoundary/loadingBoundary";
import { requirePermission } from "@/lib/auth/session";

type ProtectedLayoutProps = {
  children: ReactNode;
};

async function AuthorizedContent({ children }: ProtectedLayoutProps) {
  await requirePermission("protected-routes:view");

  return children;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <LoadingBoundary>
      <AuthorizedContent>{children}</AuthorizedContent>
    </LoadingBoundary>
  );
}
