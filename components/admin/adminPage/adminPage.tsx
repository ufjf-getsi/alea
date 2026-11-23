import { Suspense, type ReactNode } from "react";

import PageContainer from "@/components/layout/pageContainer/pageContainer";
import Header from "@/components/ui/header/header";
import Breadcrumbs, {
  type BreadcrumbItem,
} from "@/components/ui/breadcrumbs/breadcrumbs";

import styles from "./adminPage.module.css";

export const ADMIN_ROOT: BreadcrumbItem = {
  label: "Administração",
  href: "/admin",
};

type Props = Readonly<{
  title: string;
  description?: string;
  trail?: readonly BreadcrumbItem[];
  root?: boolean;
  children: ReactNode;
}>;

export default function AdminPage({
  title,
  description,
  trail = [],
  root = false,
  children,
}: Props) {
  const items: BreadcrumbItem[] = [ADMIN_ROOT, ...trail, { label: title }];

  return (
    <PageContainer className={styles.page}>
      {!root && <Breadcrumbs items={items} />}

      <div className={styles.intro}>
        <Header variant="section" as="h1">
          {title}
        </Header>
        {description && <p className={styles.muted}>{description}</p>}
      </div>

      <Suspense fallback={<p className={styles.muted}>Carregando…</p>}>
        {children}
      </Suspense>
    </PageContainer>
  );
}
