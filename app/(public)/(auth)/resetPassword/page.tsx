import ResetPasswordForm from "@/components/auth/resetPasswordForm/resetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
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
