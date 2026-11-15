import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/resetPasswordForm/resetPasswordForm";
import AuthCard from "@/components/auth/authCard/authCard";
import Alert from "@/components/ui/alert/alert";
import { ButtonLink } from "@/components/ui/button/button";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Redefinir senha">
        <Alert variant="error">
          O link de redefinição é inválido ou expirou. Solicite um novo link.
        </Alert>
        <ButtonLink href="/forgotPassword" fullWidth>
          Solicitar novo link
        </ButtonLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}

function ResetPasswordSkeleton() {
  return (
    <AuthCard title="Redefinir senha" description="Carregando formulário..." />
  );
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
