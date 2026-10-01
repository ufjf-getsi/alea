"use client";

import { useActionState } from "react";

import { forgotPasswordAction } from "@/actions/auth/forgotPasswordAction";
import { initialAuthState } from "@/actions/auth/authState";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialAuthState,
  );

  if (state.success) {
    return (
      <div>
        <p role="status">
          Se existir uma conta com esse e-mail, enviamos um link de redefinição.
          Confira também a caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
