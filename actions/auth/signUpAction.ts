import { authClient } from "@/lib/auth-client";

export type SignUpState = {
  error?: string;
  success?: boolean;
};

export const initialSignUpState: SignUpState = {};

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

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
