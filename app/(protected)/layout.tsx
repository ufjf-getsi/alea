import { Suspense, type ReactNode } from "react";
import { requirePermission } from "@/lib/auth/session";

type ProtectedLayoutProps = {
  children: ReactNode;
};

async function AuthorizedContent({ children }: ProtectedLayoutProps) {
  await requirePermission("protected-routes:view");

  return children;
}

function ProtectedFallback() {
  return (
    <main aria-busy="true" aria-label="Carregando conteúdo">
      <p>Carregando...</p>
    </main>
  );
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <Suspense fallback={<ProtectedFallback />}>
      <AuthorizedContent>{children}</AuthorizedContent>
    </Suspense>
  );
}
