"use server";

import { auth } from "@/lib/auth/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import type { AuthState } from "@/actions/auth/authState";

export async function resetPasswordAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData);

  const result = resetPasswordSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { token, password } = result.data;

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });

    return {
      success: true,
    };
  } catch {
    return {
      error:
        "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
    };
  }
}
