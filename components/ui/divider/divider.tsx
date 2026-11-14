import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./divider.module.css";

interface DividerProps {
  children?: ReactNode;
  className?: string;
}

export default function Divider({
  children,
  className,
}: Readonly<DividerProps>) {
  return (
    <div
      role="separator"
      className={clsx(styles.divider, children && styles.withLabel, className)}
    >
      {children && <span className={styles.label}>{children}</span>}
    </div>
  );
}
