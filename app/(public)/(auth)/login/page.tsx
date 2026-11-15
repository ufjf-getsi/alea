import LoginForm from "@/components/auth/loginForm/loginForm";
import AuthCard from "@/components/auth/authCard/authCard";
import TextLink from "@/components/ui/textLink/textLink";

export default function LoginPage() {
  return (
    <AuthCard
      title="Login"
      footer={
        <>
          <p>
            Não tem conta? <TextLink href="/signUp">Criar conta</TextLink>
          </p>
          <p>
            <TextLink href="/forgotPassword">Esqueci minha senha</TextLink>
          </p>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
