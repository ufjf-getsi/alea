import type { ReactNode } from "react";
import clsx from "clsx";
import { LuCircleAlert, LuCircleCheck, LuInfo } from "react-icons/lu";

import styles from "./alert.module.css";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const ICONS = {
  error: LuCircleAlert,
  success: LuCircleCheck,
  info: LuInfo,
} as const;

export default function Alert({
  variant = "info",
  children,
  className,
}: Readonly<AlertProps>) {
  const Icon = ICONS[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={clsx(styles.alert, styles[variant], className)}
    >
      <Icon className={styles.icon} size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
