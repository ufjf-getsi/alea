"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/actions/auth/resetPasswordAction";
import { initialAuthState } from "@/actions/auth/authState";
import Alert from "@/components/ui/alert/alert";
import { ButtonLink } from "@/components/ui/button/button";
import Form from "@/components/ui/form/form";
import PasswordInput from "@/components/ui/passwordInput/passwordInput";
import SubmitButton from "@/components/ui/submitButton/submitButton";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialAuthState,
  );

  if (state.success) {
    return (
      <>
        <Alert variant="success">Senha redefinida com sucesso.</Alert>
        <ButtonLink href="/login" fullWidth>
          Entrar
        </ButtonLink>
      </>
    );
  }

  return (
    <Form action={formAction}>
      <input type="hidden" name="token" value={token} />

      <PasswordInput
        label="Nova senha"
        name="password"
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

      <SubmitButton fullWidth pendingLabel="Salvando...">
        Redefinir senha
      </SubmitButton>
    </Form>
  );
}
