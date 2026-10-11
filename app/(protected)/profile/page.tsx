import { requireSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <main>
      <h1>{user.name}</h1>
    </main>
  );
}
