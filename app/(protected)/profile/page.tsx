import { requireSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/changePasswordForm/changePasswordForm";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <div>
      <h1>Ola {user.name}</h1>

      <ChangePasswordForm />
    </div>
  );
}
