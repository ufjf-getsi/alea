import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpState = {
  error?: string;
  success?: boolean;
};

export const initialSignUpState: SignUpState = {};

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const data = Object.fromEntries(formData);

  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return {
      error: firstError?.message ?? "Dados inválidos.",
    };
  }

  const { name, email, password } = result.data;

  const { error } = await authClient.signUp.email({
    name,
    email,
    password,
    callbackURL: "/",
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
  };
}
