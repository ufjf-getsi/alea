import { requireSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/changePasswordForm/changePasswordForm";
import { SignOutAllDevicesButton } from "@/components/auth/signOutAllDevicesButton/signOutAllDevicesButton";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <div>
      <h1>Ola {user.name}</h1>

      <ChangePasswordForm />
      <SignOutAllDevicesButton />
    </div>
  );
}
