import SignUpForm from "@/components/auth/signUpForm/signUpForm";
import AuthCard from "@/components/auth/authCard/authCard";
import TextLink from "@/components/ui/textLink/textLink";

export default function SignUpPage() {
  const APP_NAME = process.env.APP_NAME;
  return (
    <AuthCard
      title="Criar conta"
      description={`Crie sua conta para começar a usar o ${APP_NAME}.`}
      footer={
        <p>
          Já tem conta? <TextLink href="/login">Entrar</TextLink>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
