"use client";

import { useActionState } from "react";

import { forgotPasswordAction } from "@/actions/auth/forgotPasswordAction";
import { initialAuthState } from "@/actions/auth/authState";
import Alert from "@/components/ui/alert/alert";
import Form from "@/components/ui/form/form";
import Input from "@/components/ui/input/input";
import SubmitButton from "@/components/ui/submitButton/submitButton";

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialAuthState,
  );

  if (state.success) {
    return (
      <Alert variant="success">
        Se existir uma conta com esse e-mail, enviamos um link de redefinição.
        Confira também a caixa de spam.
      </Alert>
    );
  }

  return (
    <Form action={formAction}>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      {state.error && <Alert variant="error">{state.error}</Alert>}

      <SubmitButton fullWidth pendingLabel="Enviando...">
        Enviar link de redefinição
      </SubmitButton>
    </Form>
  );
}
