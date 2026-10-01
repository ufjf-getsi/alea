"use client";
import { authClient } from "@/lib/auth/auth-client";
export default function GoogleSignUpButton() {
  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };
  return (
    <button type="button" onClick={handleGoogleSignUp}>
      Continuar com Google
    </button>
  );
}
