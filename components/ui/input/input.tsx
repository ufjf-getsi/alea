import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "clsx";

import styles from "./input.module.css";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label: string;
  hint?: ReactNode;
  error?: string;
  endAdornment?: ReactNode;
  containerClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

export default function Input({
  label,
  hint,
  error,
  endAdornment,
  id,
  className,
  containerClassName,
  "aria-describedby": ariaDescribedBy,
  ref,
  ...rest
}: Readonly<InputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const showHint = Boolean(hint) && !error;
  const hintId = showHint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={clsx(styles.field, containerClassName)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <div className={clsx(styles.control, error && styles.invalid)}>
        <input
          id={inputId}
          ref={ref}
          className={clsx(styles.input, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {endAdornment && <div className={styles.adornment}>{endAdornment}</div>}
      </div>

      {showHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
