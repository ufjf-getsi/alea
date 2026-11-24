import LoadingBoundary from "@/components/ui/loadingBoundary/loadingBoundary";
import { getFreshSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { MapLoader } from "@/components/map/mapLoader";

async function MapSection() {
  const session = await getFreshSession();
  const canEdit = !!session && can(session.user.roleLevel, "maps:edit");
  return <MapLoader canEdit={canEdit} />;
}

export default function MapsPage() {
  return (
    <LoadingBoundary>
      <MapSection />
    </LoadingBoundary>
  );
}
