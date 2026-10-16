"use server";

import { auth } from "@/lib/auth/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { AuthState } from "@/actions/auth/authState";
import { anyLimited, getClientIp, limiters } from "@/lib/rateLimit";
import { normalizeEmail } from "@/lib/normalizeEmail";

export async function forgotPasswordAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData);

  const result = forgotPasswordSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { email } = result.data;

  const ip = await getClientIp();

  if (
    await anyLimited([
      [limiters.forgotPasswordIp, ip],
      [limiters.forgotPasswordEmail, normalizeEmail(email)],
    ])
  ) {
    return { success: true };
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: "/resetPassword",
      },
    });
  } catch (error) {
    console.error("forgotPasswordAction error:", error);
  }

  return {
    success: true,
  };
}
