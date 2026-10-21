import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { MapLoader } from "@/components/map/mapLoader";
import styles from "./page.module.css";

export default async function MapsPage() {
  const { user } = await requirePermission("maps:view");

  return (
    <main className={styles.main}>
      <MapLoader canEdit={can(user.roleLevel, "maps:edit")} />
    </main>
  );
}
