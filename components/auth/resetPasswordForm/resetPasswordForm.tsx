"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/actions/auth/resetPasswordAction";
import { initialAuthState } from "@/actions/auth/authState";
export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialAuthState,
  );

  if (state.success) {
    return (
      <div>
        <p role="status">Senha redefinida com sucesso.</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password">Nova senha</label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirmar nova senha</label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
