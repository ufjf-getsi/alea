import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./header.module.css";

type HeaderVariant = "main" | "section" | "card";
export type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface HeaderProps {
  children: ReactNode;
  variant?: HeaderVariant;
  as?: HeadingLevel;
  id?: string;
  className?: string;
}

export default function Header({
  children,
  variant = "section",
  as: Tag = "h2",
  id,
  className,
}: Readonly<HeaderProps>) {
  return (
    <Tag id={id} className={clsx(styles.header, styles[variant], className)}>
      {children}
    </Tag>
  );
}
