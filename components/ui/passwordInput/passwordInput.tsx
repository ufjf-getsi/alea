"use client";

import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

import Input, { type InputProps } from "@/components/ui/input/input";

import styles from "./passwordInput.module.css";

export default function PasswordInput(
  props: Readonly<Omit<InputProps, "type" | "endAdornment">>,
) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? LuEyeOff : LuEye;

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label="Mostrar senha"
          aria-pressed={visible}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      }
    />
  );
}
