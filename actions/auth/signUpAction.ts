"use server";

import { auth } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations/auth";
import { AuthState } from "@/actions/auth/authState";

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData);

  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { name, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
    };
  }
}
