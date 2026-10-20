import { revokeAllSessionsAction } from "@/actions/auth/revokeAllSessionsAction";

export function SignOutAllDevicesButton() {
  return (
    <form action={revokeAllSessionsAction}>
      <h2>Dispositivos</h2>
      <p>Encerra sua sessão em todos os dispositivos, inclusive neste.</p>
      <button type="submit">Desconectar todos os dispositivos</button>
    </form>
  );
}
