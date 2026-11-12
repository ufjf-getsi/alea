"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import Button, { type ButtonProps } from "@/components/ui/button/button";

interface SubmitButtonProps extends Omit<ButtonProps, "type" | "loading"> {
  pendingLabel?: ReactNode;
}

export default function SubmitButton({
  pendingLabel,
  children,
  ...rest
}: Readonly<SubmitButtonProps>) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} {...rest}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
