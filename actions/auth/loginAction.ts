"use server";

import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { loginSchema } from "@/lib/validations/auth";
import type { AuthState } from "@/actions/auth/authState";
import {
  RATE_LIMIT_MESSAGE,
  anyLimited,
  clearLimits,
  getClientIp,
  limiters,
  type LimitCheck,
} from "@/lib/rateLimit";
import { normalizeEmail } from "@/lib/normalizeEmail";

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

  const ip = await getClientIp();
  const normalizedEmail = normalizeEmail(email);

  const ipCheck: LimitCheck = [limiters.loginIp, ip];
  const pairCheck: LimitCheck = [
    limiters.loginIpEmail,
    `${ip}:${normalizedEmail}`,
  ];
  const emailCheck: LimitCheck = [limiters.loginEmail, normalizedEmail];

  if (await anyLimited([ipCheck, pairCheck, emailCheck])) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    await clearLimits([pairCheck, emailCheck]);
  } catch (error) {
    //403 unverified email error occurs after a successful login attempt (correct password)
    if (error instanceof APIError && error.statusCode === 403) {
      await clearLimits([pairCheck, emailCheck]);
    }

    return {
      error:
        error instanceof Error ? error.message : "Email ou senha inválidos.",
    };
  }

  redirect("/");
}
