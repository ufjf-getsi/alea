"use server";

import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import type { AuthState } from "@/actions/auth/authState";

export async function changePasswordAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await requireSession();

  const data = Object.fromEntries(formData);
  const result = changePasswordSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { currentPassword, newPassword } = result.data;

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch {
    return {
      error: "Não foi possível alterar a senha.",
    };
  }
}
