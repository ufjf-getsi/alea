"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth/changePasswordAction";
import { initialAuthState } from "@/actions/auth/authState";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialAuthState,
  );

  return (
    <form action={formAction}>
      <h2>Alterar senha</h2>

      <div>
        <label htmlFor="currentPassword">Senha atual</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword">Nova senha</label>
        <input
          id="newPassword"
          name="newPassword"
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
      {state.success && <p>Senha alterada com sucesso.</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
