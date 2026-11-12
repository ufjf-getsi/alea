import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

import styles from "./button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerSoft";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleProps & { className?: string }) {
  return clsx(
    styles.button,
    styles[variant],
    size !== "md" && styles[size],
    fullWidth && styles.fullWidth,
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  icon,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps
  extends ComponentProps<typeof Link>, ButtonStyleProps {}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...rest
}: Readonly<ButtonLinkProps>) {
  return (
    <Link
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    />
  );
}
