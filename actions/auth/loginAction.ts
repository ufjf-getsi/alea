"use server";

import { auth } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { AuthState } from "@/actions/auth/authState";

export async function loginAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData);

  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Email ou senha inválidos.",
    };
  }
}
