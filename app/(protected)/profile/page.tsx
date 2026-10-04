import { requireSession } from "@/lib/auth/requireSession";

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <main>
      <h1>{user.name}</h1>
    </main>
  );
}
