"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth/loginAction";
import { initialLoginState } from "@/actions/auth/authState";
import GoogleLoginButton from "@/components/auth/googleSignUpButton";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <>
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

        <div>
          <label htmlFor="password">Senha</label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && <p role="alert">{state.error}</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <GoogleLoginButton />
    </>
  );
}
