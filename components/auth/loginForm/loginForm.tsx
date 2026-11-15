"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth/loginAction";
import { initialAuthState } from "@/actions/auth/authState";
import GoogleAuthButton from "@/components/auth/googleSignUpButton";
import Alert from "@/components/ui/alert/alert";
import Divider from "@/components/ui/divider/divider";
import Form from "@/components/ui/form/form";
import Input from "@/components/ui/input/input";
import PasswordInput from "@/components/ui/passwordInput/passwordInput";
import SubmitButton from "@/components/ui/submitButton/submitButton";

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <>
      <Form action={formAction}>
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
          autoComplete="current-password"
          required
        />

        {state.error && <Alert variant="error">{state.error}</Alert>}

        <SubmitButton fullWidth pendingLabel="Entrando...">
          Entrar
        </SubmitButton>
      </Form>

      <Divider>ou</Divider>

      <GoogleAuthButton />
    </>
  );
}
