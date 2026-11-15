import { revokeAllSessionsAction } from "@/actions/auth/revokeAllSessionsAction";
import Form from "@/components/ui/form/form";
import SubmitButton from "@/components/ui/submitButton/submitButton";

export function SignOutAllDevicesButton() {
  return (
    <Form action={revokeAllSessionsAction}>
      <SubmitButton variant="dangerSoft" pendingLabel="Desconectando...">
        Desconectar todos os dispositivos
      </SubmitButton>
    </Form>
  );
}
