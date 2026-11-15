"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { authClient } from "@/lib/auth/auth-client";
import Button from "@/components/ui/button/button";

export default function GoogleSignUpButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      fullWidth
      loading={loading}
      icon={<FcGoogle size={20} aria-hidden="true" />}
      onClick={handleGoogleSignUp}
    >
      Continuar com Google
    </Button>
  );
}
