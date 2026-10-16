"use server";

import { auth } from "@/lib/auth/auth";
import { signUpSchema } from "@/lib/validations/auth";
import type { AuthState } from "@/actions/auth/authState";
import {
  RATE_LIMIT_MESSAGE,
  anyLimited,
  getClientIp,
  limiters,
} from "@/lib/rateLimit";
import { normalizeEmail } from "@/lib/normalizeEmail";

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

  const ip = await getClientIp();

  if (
    await anyLimited([
      [limiters.signUpIp, ip],
      [limiters.signUpEmail, normalizeEmail(email)],
    ])
  ) {
    return { error: RATE_LIMIT_MESSAGE };
  }

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
