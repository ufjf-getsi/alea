import ForgotPasswordForm from "@/components/auth/forgotPasswordForm/forgotPasswordForm";
import AuthCard from "@/components/auth/authCard/authCard";
import TextLink from "@/components/ui/textLink/textLink";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Esqueceu sua senha?"
      description="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      footer={
        <p>
          Lembrou a senha? <TextLink href="/login">Entrar</TextLink>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
