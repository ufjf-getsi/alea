"use client";

import { useActionState, useState, startTransition } from "react";
import type { SubmitEvent } from "react";

import { signUpAction } from "@/actions/auth/signUpAction";
import { initialAuthState } from "@/actions/auth/authState";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY,
} from "@/lib/validations/auth";
import GoogleSignUpButton from "@/components/auth/googleSignUpButton";
import Alert from "@/components/ui/alert/alert";
import Divider from "@/components/ui/divider/divider";
import Form from "@/components/ui/form/form";
import Input from "@/components/ui/input/input";
import PasswordInput from "@/components/ui/passwordInput/passwordInput";
import SubmitButton from "@/components/ui/submitButton/submitButton";

const PASSWORD_MISMATCH_MESSAGE = "As senhas não coincidem.";

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialAuthState);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setClientError(PASSWORD_MISMATCH_MESSAGE);
      return;
    }

    setClientError(null);
    startTransition(() => formAction(formData));
  }

  function clearClientError() {
    if (clientError) setClientError(null);
  }

  const errorMessage = clientError ?? state.error;

  return (
    <>
      <Form onSubmit={handleSubmit} onChange={clearClientError}>
        <Input
          label="Nome"
          name="name"
          type="text"
          autoComplete="name"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Senha"
          name="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          aria-describedby="password-policy"
        />

        <PasswordInput
          label="Confirmar senha"
          name="confirmPassword"
          autoComplete="new-password"
          required
          maxLength={PASSWORD_MAX_LENGTH}
        />

        <div id="password-policy" className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5">
            {PASSWORD_POLICY.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
        {state.success && !clientError && (
          <Alert variant="success">Conta criada com sucesso.</Alert>
        )}

        <SubmitButton fullWidth pendingLabel="Criando...">
          Criar conta
        </SubmitButton>
      </Form>

      <Divider>ou</Divider>

      <GoogleSignUpButton />
    </>
  );
}
