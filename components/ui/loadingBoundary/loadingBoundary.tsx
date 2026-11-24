import { Suspense, type ReactNode } from "react";

import { PageSpinner } from "@/components/ui/spinner/spinner";

interface LoadingBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export default function LoadingBoundary({
  fallback = <PageSpinner />,
  children,
}: Readonly<LoadingBoundaryProps>) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
