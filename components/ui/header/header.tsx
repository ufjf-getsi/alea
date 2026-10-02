import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./header.module.css";

type HeaderVariant = "main" | "section";

interface HeaderProps {
  children: ReactNode;
  variant?: HeaderVariant;
  id?: string;
  className?: string;
}

export default function Header({
  children,
  variant = "section",
  id,
  className,
}: Readonly<HeaderProps>) {
  return (
    <h2 id={id} className={clsx(styles.header, styles[variant], className)}>
      {children}
    </h2>
  );
}
