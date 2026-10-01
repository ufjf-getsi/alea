"use client";

import { useActionState } from "react";

import { signUpAction } from "@/actions/auth/signUpAction";
import { initialSignUpState } from "@/actions/auth/authState";
import GoogleSignUpButton from "@/components/auth/googleSignUpButton";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialSignUpState,
  );

  return (
    <>
      <form action={formAction}>
        <div>
          <label htmlFor="name">Nome</label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>

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

        <div>
          <label htmlFor="password">Senha</label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        {state.error && <p role="alert">{state.error}</p>}

        {state.success && <p>Conta criada com sucesso.</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <GoogleSignUpButton />
    </>
  );
}
