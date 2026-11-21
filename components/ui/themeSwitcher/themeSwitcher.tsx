"use client";

import { useId } from "react";
import clsx from "clsx";
import type { IconType } from "react-icons";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";

import type { Theme } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/useTheme";

import styles from "./themeSwitcher.module.css";

const OPTIONS: { value: Theme; label: string; Icon: IconType }[] = [
  { value: "light", label: "Claro", Icon: LuSun },
  { value: "dark", label: "Escuro", Icon: LuMoon },
  { value: "system", label: "Sistema", Icon: LuMonitor },
];

interface ThemeSwitcherProps {
  variant?: "segmented" | "list";
  className?: string;
}

export default function ThemeSwitcher({
  variant = "segmented",
  className,
}: Readonly<ThemeSwitcherProps>) {
  const name = useId();
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className={clsx(styles.switcher, styles[variant], className)}>
      <legend className={styles.legend}>Tema</legend>

      {OPTIONS.map(({ value, label, Icon }) => (
        <label key={value} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            className={styles.input}
          />
          <Icon size={16} className={styles.icon} aria-hidden="true" />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
