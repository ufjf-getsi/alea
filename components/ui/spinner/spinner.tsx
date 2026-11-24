import clsx from "clsx";
import styles from "./spinner.module.css";

export type SpinnerSize = "inline" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export default function Spinner({
  size = "md",
  label,
  className,
}: Readonly<SpinnerProps>) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={clsx(styles.root, className)}
    >
      <span className={clsx(styles.spinner, styles[size])} aria-hidden="true" />
      {label && <span className={styles.srOnly}>{label}</span>}
    </span>
  );
}

export function PageSpinner({ label = "Carregando" }: { label?: string }) {
  return (
    <div className={styles.page}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
