import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/resetPasswordForm/resetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div>
        <h1>Redefinir senha</h1>
        <p>Token de redefinição inválido ou ausente.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Redefinir senha</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando redefinição de senha">
      <h1>Redefinir senha</h1>
      <p>Carregando formulário...</p>
    </div>
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
