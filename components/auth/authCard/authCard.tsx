import type { ReactNode } from "react";

import Card from "@/components/ui/card/card";
import AuthLogo from "@/components/auth/authLogo/authLogo";

import styles from "./authCard.module.css";

interface AuthCardProps {
  title: string;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export default function AuthCard({
  title,
  description,
  footer,
  children,
}: Readonly<AuthCardProps>) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Card
          media={<AuthLogo />}
          title={title}
          description={description}
          headingAs="h1"
          footer={footer}
        >
          {children}
        </Card>
      </div>
    </div>
  );
}
