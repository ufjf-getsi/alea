import { useId, type ReactNode } from "react";
import clsx from "clsx";

import Header, { type HeadingLevel } from "@/components/ui/header/header";

import styles from "./card.module.css";

interface CardProps {
  title?: string;
  description?: ReactNode;
  headingAs?: HeadingLevel;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function Card({
  title,
  description,
  headingAs = "h2",
  footer,
  className,
  children,
}: Readonly<CardProps>) {
  const titleId = useId();

  return (
    <section
      className={clsx(styles.card, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      {title && (
        <div className={styles.header}>
          <Header as={headingAs} variant="card" id={titleId}>
            {title}
          </Header>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}

      {children && <div className={styles.body}>{children}</div>}

      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
