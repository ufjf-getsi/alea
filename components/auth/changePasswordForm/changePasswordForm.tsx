"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/actions/auth/changePasswordAction";
import { initialAuthState } from "@/actions/auth/authState";
import Alert from "@/components/ui/alert/alert";
import Form from "@/components/ui/form/form";
import PasswordInput from "@/components/ui/passwordInput/passwordInput";
import SubmitButton from "@/components/ui/submitButton/submitButton";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialAuthState,
  );

  return (
    <Form action={formAction}>
      <PasswordInput
        label="Senha atual"
        name="currentPassword"
        autoComplete="current-password"
        required
      />

      <PasswordInput
        label="Nova senha"
        name="newPassword"
        autoComplete="new-password"
        required
      />

      <PasswordInput
        label="Confirmar nova senha"
        name="confirmPassword"
        autoComplete="new-password"
        required
      />

      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && (
        <Alert variant="success">Senha alterada com sucesso.</Alert>
      )}

      <SubmitButton pendingLabel="Alterando...">Alterar senha</SubmitButton>
    </Form>
  );
}
