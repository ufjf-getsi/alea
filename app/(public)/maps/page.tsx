import { Suspense } from "react";
import { getFreshSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { MapLoader } from "@/components/map/mapLoader";
import styles from "./page.module.css";

async function MapSection() {
  const session = await getFreshSession();
  const canEdit = !!session && can(session.user.roleLevel, "maps:edit");
  return <MapLoader canEdit={canEdit} />;
}

export default function MapsPage() {
  return (
    <main className={styles.main}>
      <Suspense
        fallback={<div className={styles.loading}>Carregando mapa…</div>}
      >
        <MapSection />
      </Suspense>
    </main>
  );
}
